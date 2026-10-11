// Camera. DW8/DW9 feel: calm, readable, player-owned. The frame only rotates when the player asks (mouse / Q E / right
// stick / R recenter) or, lazily, while he runs away from the lens; attacks, dodges, lunges and crowds never swing it.
// Sim side (game.cam, deterministic): the view yaw + the player's pitch offset `tilt`. Player look always wins and holds
// every automatic turn off for lookHold frames. Automatic turns: the run drift (slow realign behind the hero after
// driftAfter frames of running, fading out as he runs across / toward the lens, never while attacking), the Musou chase,
// an eased recenter on the 'target' button (behind him, or onto the nearest officer within targetR: DW target lock-lite)
// and an optional kit aim yaw. An input frame lock (the stick keeps the frame it was pressed in) lets the drift swing
// the view without bending his path.
// Render side: critically damped spring follow (XZ and Y apart, Y slower upward and blind to small hops) around a
// small dead-zone, aimed at a smoothed look-ahead of his *intended* travel (run / air velocity only: dodges and attack
// lunges carry no velocity, so they never shove the lens), hard cuts on teleports and Musou shot changes, a 3-tier
// crowd pull-out with hysteresis (no breathing as mobs die and arrive), boom clearance at walls / cliffs, event-driven
// micro-kicks on heavy hits only, Musou choreography (game.musou.shot()) with an eased blend back, and an optional
// over-the-shoulder aim shot from the active kit (see aim below).
// Render smoothing uses sim time elapsed between renders and shake uses sim frames, so captures are deterministic.
//
// Kit aim hook (optional, hz lane): game.musou.aimShot() → null | { dist, pitch, fov, height, side, yaw? }. Pure read of
// sim state; called from the sim step (yaw only: the view eases onto `yaw` when given) and from the rig (the rest,
// eased in/out at aimRate, never a cut). Fields as in a Musou shot: `side` = aim offset to screen-right (m).
import * as THREE from 'three';
import { on } from '../core/events.js';
import { ST, wrap } from '../crowd/crowd.js';
import { ground, smooth } from '../world/map.js';
import { clearance } from './occlusion.js';

const { clamp, damp, DEG2RAD: DEG } = THREE.MathUtils;
const BLEND = 0.45;                                   // s, Musou → gameplay blend (bench: 0.3-0.6 s, no pop)
const CAM = {
  // Default rig: vFOV 48°, boom 5.8 m at 17° (≈5.55 m behind, 3.05 m above the feet), aim 1.35 m over the feet →
  // hero ≈ 33 % of frame height (1.85 m with helmet), feet ≈ 73 %, horizon ≈ 16 %: the flanks within ±4 m show at
  // mid-frame (the old 40°/5.06 m/14.6° rig held him at 45 %, flanks off-screen, fast angular pans).
  dist: 5.8, height: 1.35, pitch: 17 * DEG, fov: 48, minDist: 3,   // minDist: closest the boom clearance pulls in (m)
  tiltMin: -9 * DEG, tiltMax: 20 * DEG,     // player pitch offset range (+ = higher, looking down)
  // follow: critically damped spring (ω, 1/s; no overshoot: a 4.6 m dodge trails ≤ 1.6 m and settles ≈0.4 s after), dead-zone radius (m)
  // the hero wanders in before the spring sees him (attack steps, pivots), look-ahead (s of intended velocity: ≈ the
  // spring + dead-zone lag at a run, so he runs ≈0.2 m ahead of the aim) smoothed at leadRate (1/s)
  follow: 11, followShot: 20, deadZone: 0.35, lookAhead: 0.2, leadRate: 2.5,
  followUp: 4, followDown: 12, hop: 0.6,   // Y spring: slow rise, quick fall (feet stay in); heights under `hop` m ignored
  airLift: 0.6, airTilt: 0.02,              // above `hop`: aim rises airLift m per m, view tilts up airTilt rad per m
  leadYMax: 2, leadYRate: 20,               // falling: vertical lead (cap m, smoothing 1/s) so a plunge keeps his feet in
  yawLerp: 20, yawLerpShot: 12,             // render smoothing of the sim yaw (gameplay: near 1:1 mouse; Musou whips)
  // sim drift: rate (1/s) and cap (rad/s) of the realign behind the running hero, after driftAfter frames of running;
  // fades between driftFace[1] and driftFace[0] rad off his back (running across → toward the lens: none)
  drift: 0.6, driftMax: 0.45, driftAfter: 24, driftFace: [1.9, 1.3],
  lookHold: 150,                            // frames after a manual look / recenter with no automatic turn
  recenterF: 16, targetR: 15,               // recenter swing (frames, smoothstep) · officer target radius (m)
  lockTol: 0.35,                            // stick direction change (rad) that re-anchors the control frame to the view
  // crowd pull-out tiers: [enter at ≥ n soldiers within crowdR, leave under n (after tierHold s), pull-out share of
  // dist, pitch add]; eased at tierRate (1/s, ≈1.5 s to settle). Dense: the boom rises over the mob (DW8: in a thick
  // crowd the lens climbs and pulls back so he reads above the front rank instead of vanishing behind it); the crowd
  // view also cuts soldiers standing between the lens and him (crowd/view.js nearFade sight cone)
  crowdR: 10, tierHold: 1.5, tierRate: 1.4,
  tiers: [[0, 0, 0, 0], [22, 12, 0.2, 4 * DEG], [42, 30, 0.35, 8 * DEG]],
  aimRate: 8,                               // kit aim shot ease (1/s)
  clearIn: 14, clearOut: 2.5,               // boom clearance: pull in fast at a wall, ease back out slowly (1/s)
  kickMaxPx: 6,                             // shake ceiling at 720p (finishers / Musou; normal sweeps a light 1 px tap)
  cutJump: 40,                              // hero moved faster than this (m/s, ≥ 1 m) between two renders: teleport → cut
};

const ease = (rate, dt) => 1 - Math.exp(-rate * dt);
/** Camera offset from its aim point: `dist` back along view yaw, raised by `pitch`. */
const behind = (v, yaw, pitch, dist) => v.set(-Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, -Math.cos(yaw) * Math.cos(pitch) * dist);
/** Critically damped spring {x, v} toward `to` (exact for a still target: no overshoot, framerate-independent). */
function spring(s, to, w, dt) {
  const d = s.x - to, t = (s.v + w * d) * dt, e = Math.exp(-w * dt);
  s.x = to + (d + t) * e; s.v = (s.v - w * t) * e;
}

/** Yaw that faces the nearest live officer (a crowd officer or a foe hero-model actor: the boss) within targetR of the
 *  hero, or his facing (recenter behind him). */
function targetYaw(game) {
  const c = game.crowd, h = game.hero;
  let best = CAM.targetR * CAM.targetR, yaw = h.yaw;
  for (let i = c.grunts; i < c.N; i++) {
    const st = c.st[i];
    if (!c.type[i] || st === ST.OFF || st === ST.DEAD) continue;
    const dx = c.x[i] - h.x, dz = c.z[i] - h.z, d2 = dx * dx + dz * dz;
    if (d2 < best && d2 > 0.25) { best = d2; yaw = Math.atan2(dx, dz); }
  }
  for (const a of game.actors.list) {
    const dx = a.x - h.x, dz = a.z - h.z, d2 = dx * dx + dz * dz;
    if (game.actors.foe(a) && d2 < best && d2 > 0.25) { best = d2; yaw = Math.atan2(dx, dz); }
  }
  return yaw;
}

/**
 * Sim-side camera state (lives in game.cam). `yaw` = where the camera looks (the HUD minimap and every stickDir() caller
 * read it), `tilt` = the player's pitch offset (rad). `ctrl` = the control frame the stick is relative to: re-anchored
 * to `yaw` whenever the stick is released or changes direction, turned with manual looks, otherwise held; step() rotates
 * the sampled stick by (yaw − ctrl) so movement code, which reads the stick relative to `yaw`, keeps running straight
 * while the drift / a recenter swings the view.
 */
export function createCamSim() {
  // manualT: frames left with automatic turns held off · turn: recenter under way {from, to, tilt0, t} | null
  const s = { yaw: 0, tilt: 0, ctrl: 0, manualT: 0, lockAng: null, turn: null };
  s.reset = (yaw = 0) => { s.yaw = s.ctrl = yaw; s.tilt = 0; s.manualT = 0; s.lockAng = null; s.turn = null; };
  s.step = (game, inp) => {
    const h = game.hero, musou = h.state === 'musou';
    const held = Math.hypot(inp.mx, inp.my) >= 0.1;
    const aim = game.musou.aimShot?.() ?? null;                      // aiming: the look steers the bow (aim.js), not tilt
    if (inp.orbit || inp.tilt) {                                     // the player's look always wins
      s.yaw += inp.orbit; s.ctrl += inp.orbit; if (!aim) s.tilt = clamp(s.tilt + inp.tilt, CAM.tiltMin, CAM.tiltMax);
      s.manualT = CAM.lookHold; s.turn = null;
    } else if (s.manualT > 0) s.manualT--;
    if (inp.pressed.target && !musou && !aim) s.turn = { from: s.yaw, to: targetYaw(game), tilt0: s.tilt, t: 0 };
    if (s.turn) {                                                    // recenter: eased swing, pitch back to default
      const u = smooth(0, 1, ++s.turn.t / CAM.recenterF);
      s.yaw = s.turn.from + wrap(s.turn.to - s.turn.from) * u; s.tilt = s.turn.tilt0 * (1 - u);
      if (s.turn.t >= CAM.recenterF) { s.turn = null; s.manualT = CAM.lookHold; }
    } else if (musou) s.yaw += wrap(h.yaw - s.yaw) * 0.08;           // Musou chase: end up behind him
    else if (aim && Number.isFinite(aim.yaw)) { if (!inp.orbit) s.yaw += wrap(aim.yaw - s.yaw) * 0.25; }
    else if (!s.manualT && h.state === 'run' && h.runT >= CAM.driftAfter) {
      // lazy realign behind the running hero; fades out as he runs across / toward the lens (never whips round)
      const d = wrap(h.yaw - s.yaw), kd = smooth(CAM.driftFace[0], CAM.driftFace[1], Math.abs(d)) * Math.min(1, h.speed / 5);
      s.yaw += clamp(d * CAM.drift, -CAM.driftMax, CAM.driftMax) * kd / 60;
    }
    s.yaw = wrap(s.yaw);
    const ang = held ? Math.atan2(inp.mx, inp.my) : 0;
    if (aim || !held || s.lockAng === null || Math.abs(wrap(ang - s.lockAng)) > CAM.lockTol) { s.ctrl = s.yaw; s.lockAng = held ? ang : null; }
    const d = wrap(s.yaw - s.ctrl);
    if (held && d) { const c = Math.cos(d), sn = Math.sin(d), x = inp.mx, y = inp.my; inp.mx = x * c + y * sn; inp.my = y * c - x * sn; }
  };
  return s;
}

export function createCameraRig(game, width, height) {
  const camera = new THREE.PerspectiveCamera(CAM.fov, width / height, 0.1, 1200);
  const want = new THREE.Vector3(), pos = new THREE.Vector3();
  const fx = { x: 0, v: 0 }, fz = { x: 0, v: 0 }, fy = { x: 0, v: 0 };   // focus springs
  let yaw = 0, tiltS = 0, snap = true, blend = 0, warned = false;
  let cine = null;                                // { phase: current musou shot id } while a Musou plays
  let gx = 0, gz = 0, leadX = 0, leadZ = 0, leadYs = 0;   // dead-zone anchor, smoothed look-ahead (m)
  let tier = 0, tierT = 0, pull = 0, pullPitch = 0;       // crowd tier, its hold timer (s), eased pull-out / pitch add
  let aimK = 0, clear = 1;                         // aim shot weight, boom clearance share
  const aimLast = { dist: CAM.dist, pitch: CAM.pitch, fov: CAM.fov, height: CAM.height, side: 0 };
  let lastX = 0, lastZ = 0;                        // hero ground position at the previous render (teleport → snap)
  // micro-kicks: screen-space px at 720p, fired by events, aged in sim frames (deterministic)
  const kicks = [];
  const kick = (px, dirX, dirY, len) => {
    const last = kicks[kicks.length - 1];
    if (last && game.frame - last.f < 3 && last.px >= px) return;          // one kick per impact, not per tick
    kicks.push({ f: game.frame, px, dirX, dirY, len });
    if (kicks.length > 4) kicks.shift();
  };
  // kit.weight (1 = Zhao Yun): heavier officers kick harder, and above 1.2 every normal contact kicks (a brawler's blows land)
  on('hits', (e) => {
    const w = game.hero.kit.weight || 1;
    if (e.heavy) kick(Math.min(4.5 * w, (2.2 + e.count * 0.15) * w), 0.25, 1, 7);
    else if (e.move !== 'musou' && (e.count >= 3 || w > 1.2)) kick(w * (e.count >= 3 ? 1 : 0.6), 0.4, 1, 4);
  });
  on('hero:hurt', (e) => kick(e.armored ? 0.6 : 1.5, 1, 0.3, e.armored ? 4 : 6));
  on('land', (e) => e.hard && kick(2, 0, 1, 6));
  on('musou:burst', () => kick(6, 0.3, 1, 12));
  on('musou:start', () => { cine = { phase: -1 }; });
  on('musou:end', () => { cine = null; blend = BLEND; });                  // eased blend back to the gameplay rig
  on('scenario', () => { kicks.length = 0; cine = null; blend = 0; snap = true; tier = 0; aimK = 0; });   // new battle

  /** Live soldiers within crowdR of the hero (render-side read of sim arrays). */
  function crowdAround(h) {
    const c = game.crowd, R2 = CAM.crowdR * CAM.crowdR;
    let n = 0;
    for (let i = 0; i < c.N; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD || s === ST.DOWN) continue;
      const dx = c.x[i] - h.x, dz = c.z[i] - h.z;
      if (dx * dx + dz * dz <= R2) n++;
    }
    return n;
  }

  const api = {
    camera,
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    update(dt) {
      const h = game.hero;
      // a teleport is a cut, not a swoop across the screen
      if (Math.hypot(h.x - lastX, h.z - lastZ) > Math.max(1, CAM.cutJump * dt)) snap = true;
      lastX = h.x; lastZ = h.z;
      let camYaw = game.cam.yaw;
      let dist = CAM.dist, pitch = CAM.pitch, fov = CAM.fov, height = CAM.height, side = 0, shakeK = 1;
      // Musou choreography is owned by the musou part: game.musou.shot() returns the shot for the current musou
      // frame (pose → close-up → chase → payoff); a new shot id is a hard cut. `side` shifts the aim to screen-right.
      const shot = cine && game.musou.shot();
      if (shot) {
        if (shot.id !== cine.phase) { cine.phase = shot.id; snap = true; }
        ({ yaw: camYaw, dist, pitch, fov, height, side, shake: shakeK } = shot);
      }
      yaw = snap ? camYaw : yaw + wrap(camYaw - yaw) * ease(shot ? CAM.yawLerpShot : CAM.yawLerp, dt);
      if (!cine) {
        // kit aim shot (over the shoulder): eased in and out, the last one held while it fades
        const aim = game.musou.aimShot?.() ?? null;
        if (aim) Object.assign(aimLast, aim);
        aimK = snap ? +!!aim : damp(aimK, +!!aim, CAM.aimRate, dt);
        if (aimK > 1e-3) {
          const k = aimK;
          dist += (aimLast.dist - dist) * k; pitch += (aimLast.pitch - pitch) * k; fov += (aimLast.fov - fov) * k;
          height += (aimLast.height - height) * k; side = aimLast.side * k;
        }
        // crowd tiers: step up at once when the mob arrives, down only after it stays thin for tierHold s
        const n = crowdAround(h);
        if (tier + 1 < CAM.tiers.length && n >= CAM.tiers[tier + 1][0]) { tier++; tierT = 0; }
        else if (tier > 0 && n < CAM.tiers[tier][1]) { if ((tierT += dt) > CAM.tierHold) { tier--; tierT = 0; } }
        else tierT = 0;
        const kt = snap ? 1 : ease(CAM.tierRate, dt);
        pull += (CAM.tiers[tier][2] - pull) * kt; pullPitch += (CAM.tiers[tier][3] - pullPitch) * kt;
        tiltS = snap ? game.cam.tilt : damp(tiltS, game.cam.tilt, CAM.yawLerp, dt);
        dist *= (1 + pull) * (1 - aimK) + aimK;
        pitch += (pullPitch + tiltS - Math.max(0, h.y - CAM.hop) * CAM.airTilt) * (1 - aimK);
      }
      // Blend step toward the gameplay pose: the remaining share of the gap eases out as smoothstep(blend / BLEND), so
      // each render closes 1 − rest_after / rest_before of it (guarded against 0/0 on the last step).
      let bk = 1;
      if (blend > 0) {
        const rest = smooth(0, BLEND, blend);
        blend = Math.max(0, blend - dt);
        bk = rest > 0 ? 1 - smooth(0, BLEND, blend) / rest : 1;
      }
      // focus target. XZ: dead-zone anchor (gameplay only) + smoothed look-ahead of the intended travel (run / air
      // velocity; a dodge or a lunge moves him with vx = vz = 0, so it never shoves the lens: the spring just catches up)
      if (shot || snap) { gx = h.x; gz = h.z; }
      else {
        const dx = h.x - gx, dz = h.z - gz, d = Math.hypot(dx, dz);
        if (d > CAM.deadZone) { gx += dx * (1 - CAM.deadZone / d); gz += dz * (1 - CAM.deadZone / d); }
      }
      const travel = !shot && (h.state === 'run' || !h.grounded) && h.state !== 'attack', kl = snap ? 1 : ease(CAM.leadRate, dt);
      leadX += ((travel ? h.vx * CAM.lookAhead : 0) - leadX) * kl; leadZ += ((travel ? h.vz * CAM.lookAhead : 0) - leadZ) * kl;
      const rx = -Math.cos(yaw), rz = Math.sin(yaw);                        // screen-right on the ground
      const lift = shot ? 0.6 : CAM.airLift, air = shot ? h.y : Math.max(0, h.y - CAM.hop);
      const leadY = shot || h.grounded || h.vy >= 0 ? 0 : Math.max(-CAM.leadYMax, h.vy * lift * 2 / CAM.followDown);
      leadYs = snap ? leadY : damp(leadYs, leadY, CAM.leadYRate, dt);
      const tx = gx + leadX + rx * side, tz = gz + leadZ + rz * side;
      const ty = air * lift + height + leadYs + ground(h.x, h.z);          // sim y is above ground
      if (snap) { fx.x = tx; fz.x = tz; fy.x = ty; fx.v = fz.v = fy.v = 0; }
      else {
        const w = shot ? CAM.followShot : CAM.follow;
        spring(fx, tx, w, dt); spring(fz, tz, w, dt);
        spring(fy, ty, shot ? CAM.followShot : ty < fy.x ? CAM.followDown : CAM.followUp, dt);
      }
      api.focus.set(fx.x, fy.x, fz.x);
      // boom clearance: walls / cliffs / rising slope behind him slide the camera in along the boom
      behind(want, yaw, pitch, dist).add(api.focus);
      const c = clearance(fx.x, fy.x, fz.x, want.x, want.y, want.z);
      clear = snap ? c : damp(clear, c, c < clear ? CAM.clearIn : CAM.clearOut, dt);
      if (clear < 1) behind(want, yaw, pitch, Math.max(CAM.minDist, dist * clear)).add(api.focus);
      if (snap) { pos.copy(want); camera.fov = fov; }
      else { pos.lerp(want, bk); camera.fov += (fov - camera.fov) * (bk < 1 ? bk : ease(8, dt)); }
      pos.y = Math.max(pos.y, ground(pos.x, pos.z) + 0.3);
      snap = false;
      if (!Number.isFinite(pos.x + pos.y + pos.z + api.focus.x + api.focus.y + api.focus.z + camera.fov)) {
        // last-resort guard: never let a non-finite pose stick (blank fog forever) — snap to the default follow pose
        if (!warned) { warned = true; console.error('camera: non-finite rig state, snapped to the default follow pose', { yaw, bk, pull, aimK, clear }); }
        yaw = game.cam.yaw; pull = pullPitch = blend = aimK = 0; clear = 1; tiltS = 0;
        api.focus.set(h.x, CAM.height + ground(h.x, h.z), h.z);
        fx.x = gx = h.x; fz.x = gz = h.z; fy.x = api.focus.y; fx.v = fz.v = fy.v = leadX = leadZ = leadYs = 0;
        behind(pos, yaw, CAM.pitch, CAM.dist).add(api.focus);
        camera.fov = CAM.fov;
      }
      camera.position.copy(pos);
      camera.lookAt(api.focus);
      // micro-kicks: damped one-rebound thump, rotation in screen space, ≤ kickMaxPx
      let sx = 0, sy = 0;
      for (let i = kicks.length - 1; i >= 0; i--) {
        const k = kicks[i], age = game.frame - k.f;
        if (age > k.len) { kicks.splice(i, 1); continue; }
        const a = k.px * Math.exp(-age * 3 / k.len) * Math.cos(age * Math.PI / 3);
        sx += a * k.dirX; sy += a * k.dirY;
      }
      sx *= shakeK; sy *= shakeK;                                          // musou shots scale the thumps
      const m = Math.hypot(sx, sy);
      if (m > CAM.kickMaxPx) { sx *= CAM.kickMaxPx / m; sy *= CAM.kickMaxPx / m; }
      if (m > 0) {
        const rad = camera.fov * DEG / 720;                                 // ≈ radians per px at 720p
        camera.rotateX(sy * rad); camera.rotateY(sx * rad);
      }
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    },
    focus: new THREE.Vector3(),
  };
  return api;
}
