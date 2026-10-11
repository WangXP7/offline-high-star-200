// Scripted Musou (sim) for the def-kit officers (src/chars/defkit.js): the shared 真・無雙 beats of Zhao Yun's Musou
// (src/musou/musou.js: MUSOU timeline, aura shove, gauge, end; the presentation is src/musou/view.js in the kit's look)
// with the action between them written as data by the officer (his moveset's `musou`):
//   0   activation: the world freezes, the aura shoves the nearest soldiers back, `act` pose (shot 1)
//   30  close-up cut-in (`face`, shot 2)        88 pull-back into `ready`
//   100 the world moves again and the SCRIPT runs: his own clips, travel, turns, strikes, waves, effects; the camera
//       follows three-quarter off his shoulder, on the side away from the sun (shot 5)
//   132 CONTACT: anchors the view's payoff light and fires the one 'contact' musou:hit (audio brings the mix back on it)
//   166 finisher shot (4): wide and a little high, behind him     176 FINISHER: `fin` clip, finFx / finProj and the
//       shared ring wave that launches everything within 12 m (musou:burst)     200 control returns
// Script S = {
//   act, act2?, face, ready   pose specs (rig.js P) of the intro clips (scriptClips: mu_act act → act2, mu_face, mu_charge)
//   seq: [[f0, f1, clipId, t0, t1]]   the kit clip clipId (his move ids) from clip time t0 → t1 over musou frames f0..f1
//   fin: [clipId, t0, t1]             over 176..200
//   travel: [[f0, f1, m]]             forward along his facing (the stick steers ±1.2 rad/s)
//   turn: [[f, deg]]                  instant yaw change
//   hits: [[f, hit, fwd = 0, every = 0, until = f]]   strike centred fwd m ahead; every > 0 re-strikes each n frames till until
//   proj: [[f, hit]]                  waves from him (hit.proj, below)
//   fx: [[f, kind, r = 6, fwd = 0]]   musou:fx {kind, r, x, y, z, yaw} (drawn by the kit view: src/chars/kitview.js)
//   finFx: [[kind, r, fwd]], finProj: [hit]   at the finisher
// }
// Waves (mu.wave(hit, moveId); moves.js `proj` windows reach it through combat.js): hit.proj = { count, spread° (≥ 360 =
// a ring), speed m/s, life frames, r m, y m (default 1.1), kind ('crescent' | 'wind' | 'ring' | 'roar') } → mu.waves
// [{ x, y, z, ox, oz (launch point), yaw, v (m/frame), age, life, r, kind, hit, far, key, move }] flying flat from 0.9 m
// ahead of him. Each strikes a 70° arc of radius r + 1.5 m cast from 1.5 m behind it (the knockback carries along its
// flight), every enemy once (its own key; a ring volley shares one key: one shock front); beyond 4 m from the hero its
// contacts cost him no hitstop. A wave dies at the
// end of its life or at a wall / closed gate (blocksArrow); waves step with the sim and pause in hitstop and freeze.
// Emits wave:launch {x, y, z, yaw, n, kind, move}; musou:ready/start/hit/burst/end like Zhao Yun's.
import { emit } from '../core/events.js';
import { P, clip } from '../hero/rig.js';
import { setState, stickDir, turnToward } from '../hero/locomotion.js';
import { wrap } from '../crowd/crowd.js';
import { SUN_AZ } from '../world/sky.js';
import { blocksArrow } from '../world/map.js';
import { MUSOU, auraShove, auraMove, endMusou, gauge, offSun, smooth } from './musou.js';

const DT = 1 / 60, D2R = Math.PI / 180, PAYOFF_YAW = 1.15, FAR = 4;

/** The three intro clips of a script (merged into the kit's clips). */
export function scriptClips(S) {
  const f = S.face, breathe = { ...f, chest: [(f.chest?.[0] ?? 0) - 3, f.chest?.[1] ?? 0, f.chest?.[2] ?? 0] };
  return {
    mu_act: clip([[0, P(S.act)], [1, P(S.act2 || S.act)]]),
    mu_face: clip([[0, P(f)], [0.5, P(breathe)], [1, P(f)]]),
    mu_charge: clip([[0, P(f)], [1, P(S.ready), 'out']]),
  };
}

export function createScriptedMusou(game, S) {
  const mu = { active: false, t: 0, wasReady: false, yaw0: 0, ax: 0, az: 0, ayaw: 0, side: 1, waveR: 0, seq: 0, waves: [] };
  const shot = { id: 0, yaw: 0, dist: 0, pitch: 0, fov: 50, height: 1.2, side: 0, shake: 1 };
  const push = [];
  let startMusou = 0, waveSeq = 0;

  // Compile the kit's action into fixed-frame commands once. Runtime only reads the current frame's pose and events.
  const action = Array.from({ length: MUSOU.end }, () => ({ distance: 0, turn: 0, blows: [], waves: [], effects: [] }));
  for (const [begin, finish, move, from, to] of S.seq) for (let f = begin; f < finish && f < action.length; f++) {
    action[f].pose = [move, from + (to - from) * (f - begin) / (finish - begin)];
  }
  for (const [begin, finish, distance] of S.travel || []) for (let f = begin; f < finish && f < action.length; f++) {
    action[f].distance += distance / (finish - begin);
  }
  for (const [frame, degrees] of S.turn || []) action[frame].turn += degrees * D2R;
  for (const [index, [start, hit, offset = 0, repeat = 0, finish = start]] of S.hits.entries()) {
    for (let frame = start; frame <= finish && frame < action.length; frame += repeat || action.length) {
      action[frame].blows.push({ hit, offset, repeat: repeat > 0, key: -(index + 1) * action.length - frame });
    }
  }
  for (const [frame, hit] of S.proj || []) action[frame].waves.push(hit);
  for (const [frame, ...effect] of S.fx || []) action[frame].effects.push(effect);

  mu.reset = () => { mu.active = false; mu.t = 0; mu.wasReady = false; mu.waveR = 0; mu.side = 1; push.length = 0; mu.waves.length = 0; };
  /** Contact frame [left, up, fwd] → world (the view's payoff light). */
  mu.toWorld = (p, out) => {
    const s = Math.sin(mu.ayaw), c = Math.cos(mu.ayaw), l = p[0] * mu.side;
    out[0] = mu.ax + l * c + p[2] * s; out[1] = p[1]; out[2] = mu.az - l * s + p[2] * c;
    return out;
  };

  mu.start = (inp) => {
    const h = game.hero;
    const [sx, sz, smag] = stickDir(inp, game.cam.yaw);           // a held stick aims the Musou
    if (smag) h.yaw = Math.atan2(sx, sz);
    mu.active = true; mu.t = 0; mu.waveR = 0; mu.seq++;
    mu.yaw0 = mu.ayaw = h.yaw; mu.ax = h.x; mu.az = h.z;
    startMusou = h.musou;
    h.move = null; h.vx = h.vz = 0;
    setState(h, 'musou');
    h.musouClip = 'mu_act'; h.musouT = 0;
    h.iframes = MUSOU.end + 30;
    game.freeze = 2;
    auraShove(game.crowd, h, MUSOU.aura, push);
    emit('musou:start', { x: h.x, z: h.z, activation: MUSOU.closeup, burstAt: MUSOU.finisher, contact: MUSOU.contact });
  };

  // negative keys (hero moves use ≥ 0), unique per activation (enemies remember their last key)
  const hitAt = (hit, x, z, yaw, key, rehit) => game.combat.strike(hit, x, z, yaw, key - (mu.seq % 1000) * 100000, rehit, 'musou');

  mu.wave = (hit, move = 'musou') => {
    const h = game.hero, p = hit.proj, n = p.count || 1, ring = (p.spread || 0) >= 360, sp = (p.spread || 0) * D2R;
    const kind = p.kind || (ring ? 'ring' : 'wind'), y = h.y + (p.y ?? 1.1);
    const strike = { ...hit, proj: undefined, shape: 'arc', range: p.r + 1.5, ang: 70, dir: 0 }, far = { ...strike, hitstop: 0 };
    const vkey = () => -1e9 - (waveSeq++ % 1e8), key = vkey();   // a ring is one shock front: one key (each enemy once)
    for (let k = 0; k < n; k++) {
      const yaw = h.yaw + (n < 2 ? 0 : ring ? (k / n) * 2 * Math.PI : (k / (n - 1) - 0.5) * sp);
      mu.waves.push({ x: h.x + Math.sin(yaw) * 0.9, y, z: h.z + Math.cos(yaw) * 0.9, ox: h.x, oz: h.z, yaw, v: p.speed / 60, age: 0,
        life: p.life, r: p.r, kind, hit: strike, far, key: ring || !k ? key : vkey(), move });
    }
    emit('wave:launch', { x: h.x, y, z: h.z, yaw: h.yaw, n, kind, move });
  };
  function stepWaves() {
    const W = mu.waves, h = game.hero;
    for (let i = W.length - 1; i >= 0; i--) {
      const w = W[i], sx = Math.sin(w.yaw), sz = Math.cos(w.yaw);
      w.x += sx * w.v; w.z += sz * w.v; w.age++;
      game.combat.strike(Math.hypot(w.x - h.x, w.z - h.z) < FAR ? w.hit : w.far, w.x - sx * 1.5, w.z - sz * 1.5, w.yaw, w.key, false, w.move);
      if (w.age >= w.life || blocksArrow(w.x, w.z, w.y)) W.splice(i, 1);
    }
  }
  function fxAt(kind, r = 6, fwd = 0) {
    const h = game.hero;
    emit('musou:fx', { kind, r, x: h.x + Math.sin(h.yaw) * fwd, y: h.y, z: h.z + Math.cos(h.yaw) * fwd, yaw: h.yaw });
  }

  /** Runs in place of combo/locomotion while the hero is in the 'musou' state. */
  mu.stepHero = (inp) => {
    const h = game.hero, t = ++mu.t, M = MUSOU;
    h.iframes = Math.max(h.iframes, 2);
    h.vx = h.vz = 0;
    h.musou = Math.max(0, startMusou - h.musouMax * M.cost * Math.min(1, t / M.contact));   // one segment drains by contact
    if (t < M.chase) game.freeze = Math.max(game.freeze, 2);            // the world holds still through the intro
    if (t <= M.aura.frames) auraMove(game.crowd, push, t / M.aura.frames);
    if (t < M.closeup) { h.musouClip = 'mu_act'; h.musouT = t / M.closeup; return; }
    if (t < M.pullback) { h.musouClip = 'mu_face'; h.musouT = (t - M.closeup) / (M.pullback - M.closeup); return; }
    if (t < M.chase) { h.musouClip = 'mu_charge'; h.musouT = (t - M.pullback) / (M.chase - M.pullback); return; }
    if (t === M.chase) {                                                // follow camera: the flank away from the sun
      mu.yaw0 = h.yaw;
      mu.side = Math.abs(wrap(h.yaw + PAYOFF_YAW - SUN_AZ)) >= Math.abs(wrap(h.yaw - PAYOFF_YAW - SUN_AZ)) ? 1 : -1;
    }
    if (t < M.finisher) { run(h, t, inp); return; }
    const w = t - M.finisher, [id, a0, a1] = S.fin;
    h.musouClip = id; h.musouT = a0 + (a1 - a0) * w / (M.end - M.finisher);
    if (!w) {
      for (const [kind, r, fwd] of S.finFx || []) fxAt(kind, r, fwd);
      for (const hit of S.finProj || []) mu.wave(hit, 'musou');
    }
    if (w <= M.waveFrames) {                                            // the shared ring wave: tiers of launched bodies
      const u = w / M.waveFrames;
      mu.waveR = M.waveR * (1 - (1 - u) ** 3) + 1;
      const n = hitAt({ ...M.waveHit, range: mu.waveR, lift: M.waveHit.lift - 4 * u, hitstop: w ? 0 : 4, heavy: w < 2 }, h.x, h.z, h.yaw, -3000, false);
      if (!w) emit('musou:burst', { count: n, x: h.x, z: h.z });
      else if (n) { const a = w * 2.4, R = mu.waveR * 0.9; emit('musou:hit', { x: h.x + Math.sin(a) * R, y: 0.4, z: h.z + Math.cos(a) * R, stage: 'wave', yaw: a, n: w }); }
    }
    if (t >= M.end) endMusou(mu, h, startMusou, M.cost);
  };

  function run(h, t, inp) {
    const frame = action[t];
    if (frame.pose) [h.musouClip, h.musouT] = frame.pose;
    const direction = stickDir(inp, mu.yaw0);
    if (direction[2] > 0) turnToward(h, Math.atan2(direction[0], direction[1]), MUSOU.chaseTurn * DT * 0.5);
    h.yaw += frame.turn;
    const sn = Math.sin(h.yaw), cs = Math.cos(h.yaw);
    h.x += sn * frame.distance; h.z += cs * frame.distance;
    for (const blow of frame.blows) {
      const x = h.x + sn * blow.offset, z = h.z + cs * blow.offset;
      const count = hitAt(blow.hit, x, z, h.yaw, blow.key, blow.repeat);
      if (count) emit('musou:hit', { x, y: 1.2, z, stage: 'rush', yaw: h.yaw, n: t - MUSOU.contact });
    }
    frame.waves.forEach((hit) => mu.wave(hit, 'musou'));
    frame.effects.forEach(([kind, radius, offset]) => fxAt(kind, radius, offset));
    if (t === MUSOU.contact) {                                           // CONTACT: the payoff anchor, once
      mu.ax = h.x; mu.az = h.z; mu.ayaw = h.yaw;
      emit('musou:hit', { x: h.x + sn * 2.5, y: 1.3, z: h.z + cs * 2.5, stage: 'contact', yaw: h.yaw, n: 0 });
    }
  }

  /** Camera shot for the current Musou frame (camera.js; id change = hard cut). Intro shots as Zhao Yun's. */
  mu.shot = () => {
    if (!mu.active) return null;
    const t = mu.t, M = MUSOU, h = game.hero, o = shot;
    o.shake = 0.3; o.side = 0;
    if (t < M.closeup) {                                   // front three-quarter from above head height, slow push-in
      Object.assign(o, { id: 1, yaw: offSun(mu.yaw0 + Math.PI * 0.8), dist: 4.1 - 0.6 * t / M.closeup, pitch: 0.36, fov: 46, height: 1.0, side: 0.1 });
    } else if (t < M.chase) {                              // square-on close-up from a little above, then pull back
      const u = Math.min(1, (t - M.closeup) / (M.pullback - M.closeup)), v = Math.max(0, (t - M.pullback) / (M.chase - M.pullback));
      Object.assign(o, { id: 2, yaw: offSun(mu.yaw0 + Math.PI), dist: 3.1 - 0.3 * smooth(u) + 1.2 * v * v, pitch: 0.2 + 0.08 * v, fov: 30 + 12 * v,
        height: 1.62 - 0.35 * v });
    } else if (t < M.finisher - 10) {                      // a stable side view lets the full weapon swing cross the frame
      const progress = (t - M.chase) / (M.finisher - 10 - M.chase);
      Object.assign(o, { id: 5, yaw: offSun(mu.yaw0 + mu.side * Math.PI / 2), dist: 6.5 + progress * 1.2,
        pitch: 0.3, fov: 48, height: 1.1, side: 0.4 * mu.side, shake: 0.4 });
    } else {                                               // finisher: wide, a touch high, behind him (the whole ring wave)
      const u = smooth((t - M.finisher + 10) / (M.end - M.finisher + 10));
      Object.assign(o, { id: 4, yaw: offSun(h.yaw + mu.side * 0.32), dist: 8.2 + 1.3 * u, pitch: 0.08 + 0.06 * u, fov: 58 - 4 * u,
        height: 1.9 + 0.3 * u, shake: 0.6 });
    }
    return o;
  };

  gauge(mu, game, MUSOU.cost, () => { if (game.hitstop <= 0 && game.freeze <= 0 && mu.waves.length) stepWaves(); });
  return mu;
}
