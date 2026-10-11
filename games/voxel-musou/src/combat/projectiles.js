// Projectiles (sim, deterministic): a pool of arrows in fixed-step flight with gravity, soft-lock homing, pierce, ground
// bursts, arrow rain and arrows stuck in the ground. Fired from a kit's move table (`shots`, format: header of
// src/chars/huangzhong/moves.js) on the move frame — like combat.js resolves hitboxes — or directly (aim mode, Musou).
// Hits go through the seam's combat.hitOne (same reactions / KO / combo / musou gauge as a melee hit), bursts through
// combat.strike. No RNG state is consumed: spreads use hash01, so a kit without shots leaves the sim bit-identical.
//
// Feel targets (DW7/DW8 bow): an arrow is faster than anyone can run (55-80 m/s → 20 m in ≈ 0.3 s) and flies nearly
// flat (g 1-6 m/s²) for its `range`, then drops and sticks; DW auto-aim = a soft lock at the fire frame onto the nearest
// soldier inside a cone in front, and the arrow curves after him (≤ ≈ 5°/sf), so a shot "in his direction" connects
// without being a homing missile. Contact uses a swept segment vs the soldier's cylinder (r 0.42 m, standing 1.9 m tall,
// lying 0.5 m, airborne bodies around their centre) through a coarse spatial grid, so fast arrows never tunnel.
//
// Events: arrow:fire {x,y,z, yaw, pitch, spread, n, heavy, fire, big, sky, move} (once per shot) · arrow:burst {x,z, r,
// fire, heavy, big, count} · arrow:headshot {i, x,y,z} (aim-mode head hit on an officer) · arrow:hit {a (arrow), e
// (soldier), x,y,z (contact), dx,dy,dz (flight dir), big, fire, spent} (one reused object: read it, never keep it) ·
// arrow:rain {x, z, r, delay, over (s)} (where and when a rain volley will fall).
// Render: src/vfx/arrows.js reads the SoA pool (x/y/z, vx/vy/vz, st, t, kind, fire, big) and never writes it.
// Hero-model actors (src/actors): a foe actor (the boss) is a lock-on target like a soldier — a lock / P.tgt is a soldier
// index ≥ 0, -1 none, or ≤ -2 an actor (game.actors.list[-2 - t]) — and arrows hit him with the same swept cylinder at his
// size (combat.hitActor; arrow:hit e = -1).
import { ST, wrap } from '../crowd/crowd.js';
import { emit } from '../core/events.js';
import { hash01 } from '../core/rng.js';
import { blocksArrow } from '../world/map.js';

const DT = 1 / 60, D2R = Math.PI / 180;
export const ARROW = {
  max: 480,               // pool (flying + stuck)
  stuck: 150,             // frames an arrow stays in the ground (the render sinks it over the last 40)
  heroY: 1.38,            // release height above his feet (the bow hand at full draw)
  ahead: 0.55,            // … and this far in front of him
  bodyR: 0.42, standH: 1.9, lieH: 0.5,
  homeTurn: 5 * D2R,      // max curve per sim frame toward the locked soldier
  headY: 1.55,            // aim-mode arrow above this height over a standing officer's feet = a headshot (a flat shot hits the chest: raise the aim a touch)
  headK: 2.5,             // headshot damage multiplier (and heavy: officers are blown off their feet)
  cell: 2.5, grid: 192,   // spatial grid (480 m square around the origin)
};
export const AS = { NONE: 0, FLY: 1, STUCK: 2 };   // arrow states (P.st)

export function createProjectiles(game) {
  const N = ARROW.max;
  const F = () => new Float64Array(N), I = () => new Int32Array(N);
  const P = {
    N, x: F(), y: F(), z: F(), vx: F(), vy: F(), vz: F(), st: I(), t: I(), life: I(), pierce: I(), key: I(), tgt: I(),
    kind: I(), fire: I(), big: I(), head: I(), spec: new Array(N).fill(null), move: new Array(N).fill(null),
  };
  const queue = [];                                     // rain arrows waiting to fall: {at, x, y, z, vx, vy, vz, spec, move}
  const G = ARROW.grid, HALF = G * ARROW.cell / 2, head = new Int32Array(G * G), next = new Int32Array(game.crowd.N);
  let seq = 0, lastTick = -1;

  P.reset = () => { P.st.fill(0); queue.length = 0; lastTick = -1; seq = 0; };
  const newKey = () => 1e7 + (seq = (seq + 1) % 1e9);

  function alloc() {
    let best = -1, bl = 1e9;
    for (let i = 0; i < N; i++) {
      if (!P.st[i]) return i;
      if (P.st[i] === AS.STUCK && P.t[i] < bl) { bl = P.t[i]; best = i; }   // pool full: recycle the oldest stuck arrow
    }
    return best;
  }

  /** Nearest live soldier from (x, z) within r whose bearing is inside ±cone of yaw (air: airborne ones win), or a nearer
   *  foe actor (≤ -2); -1 none. P.aimAt(lock) → its aim point. */
  function lockOn(x, z, yaw, r, cone, air) {
    const c = game.crowd;
    let best = -1, bd = r * r, bestAir = -1, ba = r * r;
    for (let i = 0; i < c.N; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD || (s === ST.DOWN && !air)) continue;
      const dx = c.x[i] - x, dz = c.z[i] - z, d2 = dx * dx + dz * dz;
      if (d2 >= bd && d2 >= ba) continue;
      if (Math.abs(wrap(Math.atan2(dx, dz) - yaw)) > cone) continue;
      if (air && s === ST.AIR && d2 < ba) { ba = d2; bestAir = i; }
      if (d2 < bd) { bd = d2; best = i; }
    }
    const L = game.actors.list;                              // actors lane: a nearer foe actor wins (encoded -2 - k)
    for (let k = 0; k < L.length; k++) {
      const a = L[k], dx = a.x - x, dz = a.z - z, d2 = dx * dx + dz * dz;
      if (!game.actors.foe(a) || d2 >= bd || Math.abs(wrap(Math.atan2(dx, dz) - yaw)) > cone) continue;
      bd = d2; best = -2 - k;
    }
    return bestAir >= 0 ? bestAir : best;
  }
  P.lockOn = lockOn;
  /** Aim point of lock t (soldier ≥ 0: his chest at 1 m; actor ≤ -2: 1.2 m × his scale; y above ground), null when none /
   *  gone. One reused object. */
  const _aim = { x: 0, y: 0, z: 0 };
  function aimAt(t) {
    const c = game.crowd;
    if (t >= 0) { _aim.x = c.x[t]; _aim.y = c.y[t] + 1.0; _aim.z = c.z[t]; return _aim; }
    const a = t < -1 && game.actors.list[-2 - t];
    if (!a || !game.actors.foe(a)) return null;
    _aim.x = a.x; _aim.y = a.y + 1.2 * a.scale; _aim.z = a.z; return _aim;
  }
  P.aimAt = aimAt;

  /** Launch one arrow. spec = moves.js shot (hit fields + flight fields; head: aim-mode headshot rule); yaw/pitch in rad;
   *  tgt = locked soldier or -1. Returns the pool index (or -1: pool full). */
  function spawn(x, y, z, yaw, pitch, spec, move, tgt) {
    const i = alloc();
    if (i < 0) return -1;
    const v = spec.speed, cp = Math.cos(pitch);
    P.x[i] = x; P.y[i] = y; P.z[i] = z;
    P.vx[i] = Math.sin(yaw) * cp * v; P.vy[i] = Math.sin(pitch) * v; P.vz[i] = Math.cos(yaw) * cp * v;
    P.st[i] = AS.FLY; P.t[i] = 0; P.life[i] = Math.max(4, Math.round((spec.range || 20) / v * 60));
    P.pierce[i] = spec.pierce ?? 0; P.key[i] = newKey(); P.tgt[i] = tgt;
    P.kind[i] = spec.sky ? 3 : spec.drop ? 4 : 0;           // 3 skyward volley, 4 falling rain (render: long streaks)
    P.fire[i] = spec.fire ? 1 : 0; P.big[i] = spec.big || 0; P.head[i] = spec.head ? 1 : 0;
    P.spec[i] = spec; P.move[i] = move;
    return i;
  }
  P.spawn = spawn;

  /**
   * Fire one shot (a fan of spec.n arrows) from the hero's bow (or from `from` = {x, y, z, yaw}): soft lock, fan spread,
   * rain scheduling. move = kit move id (hero-move rules in combat) or 'musou'. Returns the locked soldier (or -1).
   */
  P.shoot = (spec, move, from) => {
    const h = game.hero;
    let yaw = from ? from.yaw : h.yaw;
    const x = from ? from.x : h.x + Math.sin(yaw) * ARROW.ahead, z = from ? from.z : h.z + Math.cos(yaw) * ARROW.ahead;
    const y = from ? from.y : h.y + ARROW.heroY;
    let pitch = (spec.pitch || 0) * D2R;
    const tgt = spec.home ? lockOn(h.x, h.z, yaw, (spec.range || 20) * 0.9, spec.home * D2R, !!spec.air) : -1;
    const tp = aimAt(tgt), tx = tp ? tp.x : 0, ty = tp ? tp.y : 0, tz = tp ? tp.z : 0;
    if (tp && !spec.sky) {                                    // aim at him: bearing, and a flat shot drops onto his chest
      yaw = Math.atan2(tx - x, tz - z);
      // fx r5: the drop is spread over ≥ 5.4 m (≈ −4° on the flat) — a lock < 2 m dove the shot (−15…−40°) into the
      // ground 1.5-5 m out: the heavy shot's force line was buried half-way and seen end-on from the gameplay lens, and
      // no in-flight beam ever drew; flatter, it still meets a point-blank chest (≈ 1.3 m up) and flies on through the
      // rank behind. A distance floor, not a pitch floor: a lock down a slope still aims down it
      if (!spec.pitch) pitch = Math.atan2(ty - y, Math.max(5.4, Math.hypot(tx - x, tz - z)));
    }
    let lock = tgt;
    if (spec.groundAim) {                                     // drive it into the ground at the target (or groundAim m ahead)
      let d = tp ? Math.min(12, Math.hypot(tx - x, tz - z)) : spec.groundAim;
      if (d < 5) { d = 5; lock = -1; }                        // fx r2: never at his feet — a point-blank burst buried him in his own fireball
      pitch = -Math.atan2(y, Math.max(2, d)) + (spec.g || 0) * d / (2 * spec.speed * spec.speed);
    }
    const n = spec.n || 1, sp = (spec.spread || 0) * D2R, d0 = (spec.dir || 0) * D2R;
    for (let k = 0; k < n; k++) {
      const a = yaw + d0 + (n > 1 ? (k / (n - 1) - 0.5) * sp : 0);
      spawn(x, y, z, a, pitch, spec, move, n > 1 && tp ? -1 : lock);   // a fan does not converge on one man
    }
    if (spec.rain) {                                          // skyward volley → a circle of arrows falls round the target
      const R = spec.rain, s0 = seq;
      let cx, cz;
      const t2 = aimAt(lockOn(h.x, h.z, h.yaw, R.reach, 50 * D2R, false));
      if (t2) { cx = t2.x; cz = t2.z; } else { cx = h.x + Math.sin(h.yaw) * R.ahead; cz = h.z + Math.cos(h.yaw) * R.ahead; }
      const rs = { ...spec, sky: false, drop: true, rain: null, pierce: 0, rad: 0.45, speed: 34, range: 60, home: 0 };
      const ls = { ...rs, kb: 'launch', heavy: true, dmg: spec.dmg * 1.6 };
      for (let k = 0; k < R.n; k++) {
        const a = hash01(s0, k, 1) * Math.PI * 2, r = R.r * Math.sqrt(hash01(s0, k, 2)), ax = cx + Math.sin(a) * r, az = cz + Math.cos(a) * r;
        const tilt = 0.18, ta = hash01(s0, k, 3) * Math.PI * 2;      // falls slightly slanted, from 11 m up (fx r1: from 14 m the rain spent ≈ 0.3 s above the gameplay frame)
        const at = game.frame + R.delay + Math.floor(k * R.over / R.n);
        queue.push({ at, x: ax - Math.sin(ta) * tilt * 11, y: 11, z: az - Math.cos(ta) * tilt * 11, yaw: ta, pitch: -Math.atan2(1, tilt),
          spec: k >= R.n - R.launchLast ? ls : rs, move });
      }
      emit('arrow:rain', { x: cx, z: cz, r: R.r, delay: R.delay / 60, over: R.over / 60 });
    }
    emit('arrow:fire', { x, y, z, yaw, pitch, spread: sp, n, heavy: !!spec.heavy, fire: !!spec.fire, big: spec.big || 0, sky: !!spec.sky, move,
      reach: tp ? Math.hypot(tx - x, tz - z) : 0 });          // r5: locked soldier's distance (heavy line length)
    return tgt;
  };

  /** Hero move shots for the current move frame (after combat.step: the same move frame the hitboxes resolved on). */
  function heroShots() {
    const h = game.hero;
    if (h.state !== 'attack' || game.hitstop > 0) return;
    const m = h.kit.moves[h.move];
    if (!m || !m.shots) return;
    const tick = h.moveSeq * 1000 + h.moveT;
    if (tick === lastTick) return;
    lastTick = tick;
    for (const s of m.shots) {
      const t = h.moveT;
      if (Array.isArray(s.f) ? t >= s.f[0] && t <= s.f[1] && (t - s.f[0]) % s.every === 0 : t === s.f) P.shoot(s, h.move);
    }
  }

  function buildGrid() {
    const c = game.crowd, C = ARROW.cell;
    head.fill(-1);
    for (let i = 0; i < c.N; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD) continue;
      const gx = Math.floor((c.x[i] + HALF) / C), gz = Math.floor((c.z[i] + HALF) / C);
      if (gx < 0 || gz < 0 || gx >= G || gz >= G) continue;
      next[i] = head[gx + gz * G]; head[gx + gz * G] = i;
    }
  }

  /** Copy the hit fields of spec s (damage × k) into the reused hit object o (every field: no stale values). */
  const setHit = (o, s, k = 1) => {
    o.dmg = s.dmg * k; o.kb = s.kb; o.force = s.force || 0; o.lift = s.lift || 0; o.hitstop = s.hitstop || 0; o.heavy = !!s.heavy;
    return o;
  };
  const burstHit = { shape: 'circle', range: 0, yMax: 4 };
  function burst(i, x, z) {
    const b = P.spec[i].burst, yaw = Math.atan2(P.vx[i], P.vz[i]);
    setHit(burstHit, b).range = b.range;
    const n = game.combat.strike(burstHit, x, z, yaw, newKey(), false, P.move[i]);
    emit('arrow:burst', { x, z, r: b.range, fire: !!P.spec[i].fire || P.big[i] > 1, heavy: !!b.heavy, big: P.big[i], count: n });
    if (P.spec[i].onBurst) P.spec[i].onBurst(n, x, z);
    P.st[i] = AS.NONE;
  }

  const one = { shape: 'line' };                        // arrows push along their flight
  const hitEv = { a: 0, e: 0, x: 0, y: 0, z: 0, dx: 0, dy: 0, dz: 1, big: 0, fire: 0, spent: false };
  /** Swept test of arrow i over its move this frame (p0 → p0 + v·dt): hit every soldier the segment passes through, in
   *  grid order, until the pierce count runs out. Returns false when the arrow is spent. */
  function sweep(i, x0, y0, z0, x1, y1, z1) {
    const c = game.crowd, C = ARROW.cell, s = P.spec[i], R = ARROW.bodyR + (s.rad || 0.3);
    const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1e-9, yaw = Math.atan2(dx, dz);
    const gx0 = Math.floor((Math.min(x0, x1) - R + HALF) / C), gx1 = Math.floor((Math.max(x0, x1) + R + HALF) / C);
    const gz0 = Math.floor((Math.min(z0, z1) - R + HALF) / C), gz1 = Math.floor((Math.max(z0, z1) + R + HALF) / C);
    for (let gz = Math.max(0, gz0); gz <= Math.min(G - 1, gz1); gz++) for (let gx = Math.max(0, gx0); gx <= Math.min(G - 1, gx1); gx++) {
      for (let e = head[gx + gz * G]; e >= 0; e = next[e]) {
        if (c.lastHit[e] === P.key[i]) continue;
        const u = Math.max(0, Math.min(1, ((c.x[e] - x0) * dx + (c.z[e] - z0) * dz) / L2));
        const px = x0 + dx * u - c.x[e], pz = z0 + dz * u - c.z[e];
        if (px * px + pz * pz > R * R) continue;
        const ay = y0 + (y1 - y0) * u, st = c.st[e], ey = c.y[e];
        const lo = st === ST.AIR ? ey - 0.4 : ey, hi = st === ST.AIR ? ey + 1.2 : ey + (st === ST.DOWN || st === ST.GETUP ? ARROW.lieH : ARROW.standH);
        if (ay < lo - (s.rad || 0.3) || ay > hi + (s.rad || 0.3)) continue;
        const hit = setHit(one, s);
        if (P.head[i] && c.type[e] === 1 && st !== ST.AIR && ay - ey >= ARROW.headY) {   // aim mode: headshot on an officer
          hit.dmg *= ARROW.headK; hit.heavy = true; hit.kb = 'blow'; hit.force = Math.max(hit.force, 9); hit.lift = Math.max(hit.lift, 5);
          emit('arrow:headshot', { i: e, x: c.x[e], y: ey + 1.6, z: c.z[e] });
        }
        if (!game.combat.hitOne(e, hit, x0 + dx * u - Math.sin(yaw) * 0.5, z0 + dz * u - Math.cos(yaw) * 0.5, yaw, P.key[i], false, P.move[i])) continue;   // refused (KO'd this tick): no pierce spent
        if (!landed(i, e, x0 + dx * u, ay, z0 + dz * u, c.x[e], c.z[e])) return false;
      }
    }
    for (const a of game.actors.list) {                      // actors lane: the foe actors, a cylinder of their size
      if (!game.actors.foe(a) || a.lastHit === P.key[i]) continue;
      const Ra = a.r + (s.rad || 0.3), u = Math.max(0, Math.min(1, ((a.x - x0) * dx + (a.z - z0) * dz) / L2));
      const px = x0 + dx * u - a.x, pz = z0 + dz * u - a.z, ay = y0 + (y1 - y0) * u;
      if (px * px + pz * pz > Ra * Ra || ay < a.y - (s.rad || 0.3) || ay > a.y + ARROW.standH * a.scale + (s.rad || 0.3)) continue;
      if (!game.combat.hitActor(a, setHit(one, s), x0 + dx * u - Math.sin(yaw) * 0.5, z0 + dz * u - Math.cos(yaw) * 0.5, yaw, P.key[i], false, P.move[i])) continue;
      if (!landed(i, -1, x0 + dx * u, ay, z0 + dz * u, a.x, a.z)) return false;
    }
    return true;
  }
  /** Arrow i struck body e (soldier index, -1 an actor) at (x, y, z): spend a pierce, arrow:hit; spent → burst at (bx, bz)
   *  or gone. Returns false when the arrow is spent. */
  function landed(i, e, x, y, z, bx, bz) {
    const s = P.spec[i], spent = --P.pierce[i] < 0, vl = Math.hypot(P.vx[i], P.vy[i], P.vz[i]) || 1;
    const H = hitEv;
    H.a = i; H.e = e; H.x = x; H.y = y; H.z = z; H.dx = P.vx[i] / vl; H.dy = P.vy[i] / vl; H.dz = P.vz[i] / vl;
    H.big = P.big[i]; H.fire = P.fire[i]; H.spent = spent && !s.burst;
    emit('arrow:hit', hitEv);
    if (!spent) return true;
    if (s.burst) burst(i, bx, bz);
    else P.st[i] = AS.NONE;
    return false;
  }

  P.step = () => {
    heroShots();
    for (let q = queue.length - 1; q >= 0; q--) {            // rain arrows due this frame
      const r = queue[q];
      if (r.at > game.frame) continue;
      spawn(r.x, r.y, r.z, r.yaw, r.pitch, r.spec, r.move, -1);
      queue.splice(q, 1);
    }
    if (game.freeze > 0) return;                              // Musou activation: the world (and its arrows) hold still
    const c = game.crowd;
    let grid = false;
    for (let i = 0; i < N; i++) {
      const st = P.st[i];
      if (!st) continue;
      P.t[i]++;
      if (st === AS.STUCK) { if (P.t[i] >= ARROW.stuck) P.st[i] = AS.NONE; continue; }
      const s = P.spec[i];
      // soft-lock homing: curve toward the locked soldier's chest while he is still ahead of the arrow
      const tg = P.tgt[i];
      if (tg !== -1 && P.t[i] <= P.life[i]) {
        const ts = tg >= 0 ? c.st[tg] : ST.IDLE, ap = tg < 0 && aimAt(tg);   // (an actor lock: aimAt, null once beaten)
        if (ts === ST.OFF || ts === ST.DEAD || (tg < 0 && !ap)) P.tgt[i] = -1;
        else {
          const wx = (ap ? ap.x : c.x[tg]) - P.x[i], wy = (ap ? ap.y : c.y[tg] + (ts === ST.AIR ? 0.3 : 1.0)) - P.y[i], wz = (ap ? ap.z : c.z[tg]) - P.z[i];
          const v = Math.hypot(P.vx[i], P.vy[i], P.vz[i]), w = Math.hypot(wx, wy, wz) || 1;
          const cos = (P.vx[i] * wx + P.vy[i] * wy + P.vz[i] * wz) / (v * w);
          if (cos > 0.3) {                                    // still in front: bend up to homeTurn toward him
            const k = Math.min(1, ARROW.homeTurn / Math.max(1e-4, Math.acos(Math.min(1, cos))));
            const nx = P.vx[i] / v + (wx / w - P.vx[i] / v) * k, ny = P.vy[i] / v + (wy / w - P.vy[i] / v) * k, nz = P.vz[i] / v + (wz / w - P.vz[i] / v) * k;
            const nl = Math.hypot(nx, ny, nz) || 1;
            P.vx[i] = nx / nl * v; P.vy[i] = ny / nl * v; P.vz[i] = nz / nl * v;
          } else P.tgt[i] = -1;
        }
      }
      // flight: nearly flat for `range`, then the arrow is spent and drops (or a burstEnd shot explodes)
      const spent = P.t[i] > P.life[i];
      if (spent && s.burstEnd) { burst(i, P.x[i], P.z[i]); continue; }
      P.vy[i] -= (spent ? 30 : s.g || 0) * DT;
      if (spent) { P.vx[i] *= 0.97; P.vz[i] *= 0.97; }
      const x0 = P.x[i], y0 = P.y[i], z0 = P.z[i];
      let x1 = x0 + P.vx[i] * DT, y1 = y0 + P.vy[i] * DT, z1 = z0 + P.vz[i] * DT;
      if (y1 < 0 && y0 >= 0) { const u = y0 / (y0 - y1); x1 = x0 + (x1 - x0) * u; z1 = z0 + (z1 - z0) * u; y1 = 0; }
      // walls, closed gates, palisades and cliffs stop arrows: cut this frame's move at the first blocked third (a step is
      // ≤ 1.5 m, every obstacle ≥ 3 m thick), so nobody behind one is swept, then the arrow sticks in its face
      let wall = false;
      for (let k = 1; k <= 3; k++) {
        const u = k / 3, bx = x0 + (x1 - x0) * u, by = y0 + (y1 - y0) * u, bz = z0 + (z1 - z0) * u;
        if (blocksArrow(bx, bz, by)) { x1 = bx; y1 = by; z1 = bz; wall = true; break; }
      }
      P.x[i] = x1; P.y[i] = y1; P.z[i] = z1;
      if (s.rad && P.kind[i] !== 3) {
        if (!grid) { buildGrid(); grid = true; }
        if (!sweep(i, x0, y0, z0, x1, y1, z1)) continue;
      }
      if (wall) { P.st[i] = AS.STUCK; P.t[i] = 0; continue; }   // no burst on a wall: it would leak through a closed gate
      if (P.kind[i] === 3 && (y1 > 26 || P.t[i] > 40)) { P.st[i] = AS.NONE; continue; }   // skyward volley leaves the frame
      if (y1 <= 0) {
        if (s.burst) burst(i, x1, z1);
        else { P.st[i] = AS.STUCK; P.t[i] = 0; P.y[i] = 0; }
      } else if (P.t[i] > 600 || Math.abs(x1) > HALF || Math.abs(z1) > HALF) P.st[i] = AS.NONE;
    }
  };
  return P;
}
