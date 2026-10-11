// Huang Zhong's per-battle sim: 真・無雙「百步穿楊」, plus the kit's arrows (src/combat/projectiles.js) and aim mode
// (aim.js), which live here because this is the kit object main.js builds, resets and steps every frame (game.musou).
// Same interface and events as Zhao Yun's (src/musou/musou.js): active, t, reset, start, stepHero, shot, ready, step;
// musou:ready/start/hit/burst/end. Extras: stepSpecial(inp) (hero.js: aim / strafe), aimShot() (aim camera, aim.js),
// proj (the arrow pool, read by the render side), aim (aim state, read by the aim preview).
// Timeline (musou frames t; hitstop pauses it):
//   0   activation — world freezes, an aura shove clears the stage, the bow thrust overhead (「老當益壯」)
//   30  close-up cut-in: he nocks, half draw toward the lens        76 feet planted wide, wide shot
//   84  VOLLEY (first volley = 'contact'): three flaming arrows every 3 sf while his aim sweeps ≈ 130° left → right across
//       the army (66 arrows in 1.1 s), each pierces 2 and bursts small where it lands
//   150 the giant arrow: a long deep draw, over-the-shoulder camera, embers gather
//   182 RELEASE: a blazing arrow ×5 tears a straight line through everything (pierce ∞) and EXPLODES just past the
//       last soldier on its line (9–26 m out; the flight time is fixed, so ≈ 218: musou:burst, the ring launches)
//                                                                     244 control returns (≈ 4 s)
import { emit } from '../../core/events.js';
import { setState, stickDir } from '../../hero/locomotion.js';
import { ST, wrap } from '../../crowd/crowd.js';
import { SUN_AZ } from '../../world/sky.js';
import { smooth, offSun, auraShove, auraMove, endMusou, gauge } from '../../musou/musou.js';
import { createProjectiles, ARROW, AS } from '../../combat/projectiles.js';
import { createAim } from './aim.js';
import { clearance } from '../../camera/occlusion.js';
import { ground } from '../../world/map.js';

export const HZ_MUSOU = {
  closeup: 30, plant: 76, volley: 84, volleyEnd: 150, big: 150, release: 182, end: 244,
  aura: { r0: 5.2, k: 0.35, frames: 5 },
  every: 3, sweep: 1.15,                  // volley cadence (sf), half-arc of the sweep (rad)
  volleyShot: { n: 3, spread: 9, pitch: -1.5, speed: 58, g: 5, range: 21, pierce: 2, rad: 0.5, fire: true,
    dmg: 12, kb: 'launch', force: 3, lift: 6.5, hitstop: 0, burst: { range: 1.9, dmg: 8, kb: 'flinch', force: 3, hitstop: 0 } },
  giant: { n: 1, pitch: 0, speed: 44, g: 0, range: 26, pierce: 1e6, rad: 1.9, fire: true, big: 2, burstEnd: true,
    dmg: 40, kb: 'blow', force: 10, lift: 8, heavy: true, hitstop: 0,
    burst: { range: 8.5, dmg: 80, kb: 'launch', force: 5, lift: 12, heavy: true, hitstop: 4 } },
  cost: 1 / 3,
};
const M = HZ_MUSOU;
export const GIANT_FRAMES = Math.round(M.giant.range / M.giant.speed * 60) + 1;   // release → explosion

export function createMusou(game) {
  const mu = { active: false, t: 0, wasReady: false, yaw0: 0, seq: 0, giantI: -1, side: 1 };
  const shot = { id: 0, yaw: 0, dist: 0, pitch: 0, fov: 50, height: 1.2, side: 0, shake: 1 };
  const push = [];
  let startMusou = 0;
  mu.proj = createProjectiles(game);
  mu.aim = createAim(game, mu.proj);
  const giant = { ...M.giant, onBurst: (count, x, z) => emit('musou:burst', { count, x, z }) };

  mu.reset = () => { mu.active = false; mu.t = 0; mu.wasReady = false; mu.giantI = -1; push.length = 0; mu.proj.reset(); mu.aim.reset(); };
  mu.stepSpecial = (inp) => mu.aim.step(inp);
  // fx r3: C2's follow shots (f 34–50) lock on the bodies it launched 4–6 m up; the gameplay rig framed his feet and
  // they flew out of the top of the frame — the kit aim hook (camera.js, eased in / out) raises and levels the lens
  // and C6's fire burst lands 5–12 m out wherever the soft lock took it (often at a frame edge, or between him and the
  // lens, with its launched bodies smeared across the near DoF): the lens backs off and climbs to take in the ring
  // fx r3 (acceptance): the blast shot also turns the view onto the burst point — the soft lock through N1-N5 had him
  // loosing 66-80° off the view and the ball went off at a frame edge. yaw = the line hero → burst, swung 0.4 rad toward
  // the side the lens already is on, with `side` putting the hero-burst midpoint on the centre line; higher and farther
  // back, so the ball (≈ 45 % of the frame height) stands over the near helmets instead of behind them
  const juggle = { dist: 7.6, pitch: 0.2, fov: 52, height: 2.7, side: 0 }, blast = { yaw: 0, dist: 12, pitch: 0.32, fov: 56, height: 2.2, side: 0 };
  // (C5 rain gets the same treatment, lighter: the lens turns onto the circle it will fall in)
  // fx r4: the swing only goes to a side whose boom stays over open ground (r3 turned the lens into the valley side:
  // ten frames of brown rock); both sides blocked → no turn (yaw NaN), the follow rig's own clearance handles it
  const c6 = { seq: -1, x: 0, z: 0, sd: 0.4 };
  const boomClear = (h, yaw) => {
    const fy = ground(h.x, h.z) + blast.height, c = Math.cos(blast.pitch) * blast.dist;
    return clearance(h.x, fy, h.z, h.x - Math.sin(yaw) * c, fy + Math.sin(blast.pitch) * blast.dist, h.z - Math.cos(yaw) * c, 12, 0);
  };
  function c6Point(h) {
    const P = mu.proj, c5 = h.move === 'c5';
    if (c6.seq !== h.moveSeq) {                                   // new charge: predict the shot's own aim rule (projectiles.js)
      c6.seq = h.moveSeq;
      const s = h.kit.moves[h.move].shots[0], R = s.rain;
      const tp = P.aimAt(c5 ? P.lockOn(h.x, h.z, h.yaw, R.reach, 50 * Math.PI / 180, false) : P.lockOn(h.x, h.z, h.yaw, s.range * 0.9, s.home * Math.PI / 180, false));
      const yaw = tp ? Math.atan2(tp.x - h.x, tp.z - h.z) : h.yaw;   // (a soldier or a foe actor: the boss)
      const dt = tp ? Math.hypot(tp.x - h.x, tp.z - h.z) : 0;
      const d = c5 ? (tp ? dt : R.ahead) : tp ? Math.max(5, Math.min(12, dt)) : s.groundAim;
      c6.x = h.x + Math.sin(yaw) * d; c6.z = h.z + Math.cos(yaw) * d;
    }
    if (!c5) for (let i = 0; i < P.N; i++) {                      // in flight: where it will hit the ground
      if (P.st[i] !== AS.FLY || !P.fire[i] || P.big[i] !== 1 || P.move[i] !== 'c6') continue;
      const k = P.vy[i] < -1 ? P.y[i] / -P.vy[i] : 0.15;
      c6.x = P.x[i] + P.vx[i] * k; c6.z = P.z[i] + P.vz[i] * k;
    }
    const L = Math.atan2(c6.x - h.x, c6.z - h.z), d = Math.hypot(c6.x - h.x, c6.z - h.z);
    blast.dist = (c5 ? 7.5 : 9) + d * 0.5; blast.pitch = c5 ? 0.26 : 0.32; blast.height = c5 ? 1.8 : 2.2;
    if (c6.seq !== c6.sdSeq) {                                    // side picked once per charge (no flip-flop in flight)
      c6.sdSeq = c6.seq; c6.sd = wrap(game.cam.yaw - L) < 0 ? -0.4 : 0.4;
      if (boomClear(h, L + c6.sd) < 1 && boomClear(h, L - c6.sd) > boomClear(h, L + c6.sd)) c6.sd = -c6.sd;
    }
    const ok = boomClear(h, L + c6.sd) >= 0.9;
    blast.yaw = ok ? L + c6.sd : NaN; blast.side = ok ? d * 0.5 * Math.sin(c6.sd) : 0;
    return blast;
  }
  mu.aimShot = () => {
    const h = game.hero, t = h.moveT, atk = h.state === 'attack';
    return mu.aim.shot() || (atk && h.move === 'c2' && t >= 22 && t <= 70 ? juggle : (atk && h.move === 'c6' && t >= 20 && t <= 84) || (atk && h.move === 'c5' && t >= 14 && t <= 66) ? c6Point(h) : null);
  };

  mu.start = (inp) => {
    const h = game.hero, c = game.crowd;
    const [sx, sz, smag] = stickDir(inp, game.cam.yaw);
    if (smag) h.yaw = Math.atan2(sx, sz);
    mu.aim.reset();
    mu.active = true; mu.t = 0; mu.seq++; mu.giantI = -1;
    mu.yaw0 = h.yaw;
    startMusou = h.musou;
    h.move = null; h.vx = h.vz = 0;
    setState(h, 'musou');
    h.musouClip = 'hz_act'; h.musouT = 0;
    h.iframes = M.end + 30;
    game.freeze = 2;
    shove(h);                                                            // activation aura: the nearest soldiers recoil
    emit('musou:start', { x: h.x, z: h.z, activation: M.closeup, burstAt: M.release + GIANT_FRAMES, contact: M.volley });
  };

  /** Aura shove: standing soldiers within r0 / (1 − k) recoil to r0 + d·k over aura.frames. fx r3 acc: repeated at the
   *  giant draw, so the crowd that closed back in after the volley no longer stands between the over-the-shoulder lens,
   *  the bow and the army. */
  let pushT = 0;
  function shove(h) { auraShove(game.crowd, h, M.aura, push); pushT = mu.t; }

  const bow = (h, yaw) => ({ x: h.x + Math.sin(yaw) * ARROW.ahead, y: h.y + ARROW.heroY, z: h.z + Math.cos(yaw) * ARROW.ahead, yaw });

  mu.stepHero = (inp) => {
    const h = game.hero, c = game.crowd, t = ++mu.t;
    h.iframes = Math.max(h.iframes, 2);
    h.vx = h.vz = 0;
    h.musou = Math.max(0, startMusou - h.musouMax * M.cost * Math.min(1, t / M.volley));
    if (t < M.volley) game.freeze = Math.max(game.freeze, 2);
    if (t === M.big) shove(h);
    if (t - pushT <= M.aura.frames) auraMove(c, push, (t - pushT) / M.aura.frames);
    if (t < M.closeup) { h.musouClip = 'hz_act'; h.musouT = t / M.closeup; return; }
    if (t < M.plant) { h.musouClip = 'hz_face'; h.musouT = (t - M.closeup) / (M.plant - M.closeup); return; }
    if (t < M.volley) {                                                   // plant: the stick may still aim the volley
      const [dx, dz, mag] = stickDir(inp, game.cam.yaw);
      if (mag) mu.yaw0 += wrap(Math.atan2(dx, dz) - mu.yaw0) * 0.15;
      h.yaw = mu.yaw0 + M.sweep;
      h.musouClip = 'hz_volley'; h.musouT = 0;
      return;
    }
    if (t < M.volleyEnd) {                                               // VOLLEY: the aim sweeps left → right
      const u = (t - M.volley) / (M.volleyEnd - M.volley);
      h.yaw = mu.yaw0 + M.sweep * (1 - 2 * smooth(u));
      h.musouClip = 'hz_volley'; h.musouT = ((t - M.volley) % M.every) / M.every;
      if ((t - M.volley) % M.every === 0) {
        mu.proj.shoot(M.volleyShot, 'musou', bow(h, h.yaw));
        const f = bow(h, h.yaw);
        emit('musou:hit', { x: f.x + Math.sin(h.yaw) * 1.5, y: 1.4, z: f.z + Math.cos(h.yaw) * 1.5, stage: t === M.volley ? 'contact' : 'front', yaw: h.yaw, n: t - M.volley });
      }
      return;
    }
    if (t < M.release) {                                                 // the giant arrow's draw (facing back to centre)
      h.yaw = mu.yaw0 + wrap(h.yaw - mu.yaw0) * 0.85;
      h.musouClip = 'hz_big'; h.musouT = (t - M.big) / (M.release - M.big);
      return;
    }
    if (t === M.release) {
      h.yaw = mu.yaw0;
      mu.side = Math.abs(wrap(mu.yaw0 + 1.3 - SUN_AZ)) >= Math.abs(wrap(mu.yaw0 - 1.3 - SUN_AZ)) ? 1 : -1;   // flank cam: sun behind it
      const b = bow(h, h.yaw);
      // explode where the army is: 2 m past the farthest soldier within 3 m of the line (it used to fly a fixed 26 m and
      // burst over empty ground whenever the fight was closer than ≈ 18 m — nearly always); the speed keeps the flight
      // time (GIANT_FRAMES: the audio build-up and the cameras are timed on it)
      // fx r3: burst where it takes the most soldiers — the point on the line (9–26 m) with the most standing within the
      // blast radius. "2 m past the farthest soldier on the line" put it past the army once the volley had cleared the
      // line itself: the finale exploded over empty grass and launched nobody.
      const fx = Math.sin(h.yaw), fz = Math.cos(h.yaw), R2 = M.giant.burst.range * M.giant.burst.range;
      let best = -1, bestD = 9;
      for (let d = 9; d <= M.giant.range; d += 1.5) {
        const px = b.x + fx * d, pz = b.z + fz * d;
        let n = 0;
        for (let i = 0; i < c.N; i++) {
          const st = c.st[i];
          if (st === ST.OFF || st === ST.DEAD || st === ST.DOWN) continue;
          const dx = c.x[i] - px, dz = c.z[i] - pz;
          if (dx * dx + dz * dz < R2) n++;
        }
        if (n > best * 1.15) { best = n; bestD = d; }                  // (nearer wins a near-tie: the camera frames it better)
      }
      giant.range = bestD;
      giant.speed = giant.range * 60 / (GIANT_FRAMES - 1);
      mu.giantI = mu.proj.spawn(b.x, b.y, b.z, h.yaw, 0, giant, 'musou', -1);
      emit('arrow:fire', { x: b.x, y: b.y, z: b.z, yaw: h.yaw, n: 1, heavy: true, fire: true, big: 2, sky: false, move: 'musou' });
    }
    h.musouClip = 'hz_fin'; h.musouT = (t - M.release) / (M.end - M.release);
    const g = mu.giantI, P = mu.proj;
    if (g >= 0 && P.st[g] && P.big[g] === 2 && (t - M.release) % 3 === 0) {   // the flight: ticks for the audio build-up
      emit('musou:hit', { x: P.x[g], y: P.y[g], z: P.z[g], stage: 'front', yaw: h.yaw, n: t - M.volley });
    }
    if (t >= M.end) endMusou(mu, h, startMusou, M.cost);
  };

  /** Camera shot for the current Musou frame (render side; id change = hard cut). Terms as src/musou/musou.js shot(). */
  mu.shot = () => {
    if (!mu.active) return null;
    const t = mu.t, o = shot;
    o.shake = 0.3; o.side = 0;
    if (t < M.closeup) {                                   // front three-quarter from above, slow push-in on the raised bow
      const u = t / M.closeup;
      Object.assign(o, { id: 1, yaw: offSun(mu.yaw0 + Math.PI * 0.8), dist: 4.3 - 0.6 * u, pitch: 0.34, fov: 46, height: 1.1, side: 0.1 });
    } else if (t < M.plant) {                              // close-up: nocking, the old man's glare
      const u = (t - M.closeup) / (M.plant - M.closeup);
      Object.assign(o, { id: 2, yaw: offSun(mu.yaw0 + Math.PI * 0.72), dist: 2.5 - 0.3 * smooth(u), pitch: 0.06, fov: 40, height: 1.62, side: -0.3 });   // face + nocked arrow
    } else if (t < M.big) {                                // wide from behind-left above: the sweep rakes the army
      const u = smooth((t - M.plant) / (M.big - M.plant));
      Object.assign(o, { id: 3, yaw: offSun(mu.yaw0 + 0.5 - 0.25 * u), dist: 7.2 + 1.2 * u, pitch: 0.24, fov: 58, height: 1.6, side: 1.3, shake: 0.5 });
    } else if (t < M.release + 4) {                        // over the right shoulder on the giant draw, slowly pushing in
      const u = smooth((t - M.big) / (M.release - M.big));
      Object.assign(o, { id: 4, yaw: offSun(mu.yaw0 - 0.22), dist: 3.4 - 0.8 * u, pitch: 0.07, fov: 44 - 6 * u, height: 1.6, side: 0.8, shake: 0.2 });   // (fx r3 acc: a step wider — bow and army in frame)
    } else {
      // cut to a flank shot square to the arrow line (on the side away from the sun): the blaze crosses the frame and
      // the aim point rides down range onto the burst point (fx r2: it used to trail the arrow and left the explosion at
      // the frame's left edge), so the payoff fills the centre third with the launched bodies against the fireball
      const u = smooth((t - M.release - 4) / (GIANT_FRAMES - 6)), s = mu.side;
      Object.assign(o, { id: 5, yaw: mu.yaw0 + s * Math.PI / 2, dist: 11 + 2.5 * u, pitch: 0.2 + 0.04 * u, fov: 54, height: 2 + 1.2 * u,
        side: s * giant.range * (0.3 + 0.7 * u), shake: 0.9 });
    }
    return o;
  };

  gauge(mu, game, M.cost, () => mu.proj.step());
  return mu;
}
