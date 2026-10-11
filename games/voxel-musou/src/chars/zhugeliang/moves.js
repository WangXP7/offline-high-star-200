// Zhuge Liang: a seven-star cadence — short fan strokes, retreating feather volleys and three rain beats.
// C6 owns the ground sigil; the Musou uses faint ring waves so the formation and caster stay readable.
import { locoClips } from '../loco.js';
export const airChainMax = 6;
export const SIGIL = { off: 1.6, len: 6, width: 6 };
const once = 99;
const blade = (f, damage, amount = 1, spread = 0, extra = {}) => ({ f: [f, f], every: once, dmg: damage, kb: 'flinch', force: 3.2, hitstop: 0,
  proj: { count: amount, spread, kind: 'wind', speed: 25, life: 23, r: 1.2, ...extra } });
const touch = (f, damage, extra = {}) => ({ f: [f, f + 2], every: once, shape: 'arc', range: 2.55, ang: 148, dmg: damage, kb: 'push', force: 3.5, hitstop: 3, ...extra });
export function moves() {
  return {
    n1: { frames: 28, cancel: 18, branch: 12, dodgeCancel: 12, steer: 7, next: 'n2', charge: 'c2', lunge: [[2, 7, 0.3]], hits: [touch(8, 8, { sweep: 1 }), blade(9, 11)] },
    n2: { frames: 31, cancel: 21, branch: 14, dodgeCancel: 14, steer: 6, next: 'n3', charge: 'c3', lunge: [[4, 10, 0.38]], hits: [touch(10, 8, { sweep: -1 }), blade(11, 10, 2, 22)] },
    n3: { frames: 35, cancel: 24, branch: 17, dodgeCancel: 17, steer: 6, next: 'n4', charge: 'c4', lunge: [[5, 13, 0.46]], hits: [touch(13, 10, { ang: 176 }), blade(14, 9, 3, 48)] },
    n4: { frames: 42, cancel: 29, branch: 25, dodgeCancel: 25, steer: 7, next: 'n5', charge: 'c5', lunge: [[2, 11, -0.8], [17, 24, 0.6]],
      hits: [blade(17, 8, 2, 30), blade(23, 8, 2, 42)] },
    n5: { frames: 46, cancel: 33, branch: 24, dodgeCancel: 24, steer: 6, next: 'n6', charge: 'c6', lunge: [[5, 14, 0.34]],
      hits: [{ f: [20, 23], every: once, shape: 'line', len: 10, width: 1.7, dmg: 18, kb: 'launch', force: 3, lift: 7, hitstop: 5, heavy: true, beam: true }, blade(21, 10, 2, 32)] },
    n6: { frames: 58, cancel: 47, dodgeCancel: 34, steer: 5, armor: true, next: 'n1', charge: 'c1', lunge: [[9, 25, 0.55]],
      hits: [{ f: [16, 28], every: 6, shape: 'circle', range: 3.05, dmg: 9, kb: 'spin', force: 4, lift: 2, hitstop: 2 }, blade(25, 13, 8, 360, { kind: 'ring', speed: 20, life: 25, r: 1.3 })] },
    c1: { frames: 74, cancel: 65, dodgeCancel: 45, steer: 13, armor: true, lunge: [[18, 28, -0.4]],
      hits: [{ f: [28, 40], every: 4, shape: 'line', len: 13.4, width: 2.4, dmg: 10, kb: 'blow', force: 10, lift: 4, hitstop: 3, heavy: true, beam: true }] },
    c2: { frames: 68, cancel: 58, dodgeCancel: 38, steer: 10, armor: true,
      hits: [{ f: [22, 36], every: 7, shape: 'circle', range: 4, dmg: 11, kb: 'launch', force: 2.6, lift: 9.5, hitstop: 3, heavy: true, pillars: 6 }] },
    c3: { frames: 90, cancel: 81, dodgeCancel: 67, steer: 11, armor: true, lunge: [[10, 50, -2.1]],
      hits: [{ f: [15, 45], every: 8, dmg: 7, kb: 'flinch', force: 3, hitstop: 0, proj: { count: 3, spread: 28, kind: 'wind', speed: 25, life: 22, r: 1.15 } },
        { f: [56, 60], every: once, shape: 'line', len: 11.5, width: 2.5, dmg: 23, kb: 'blow', force: 12, lift: 5, hitstop: 6, heavy: true, beam: true }] },
    c4: { frames: 82, cancel: 73, dodgeCancel: 55, steer: 12, armor: true,
      hits: [{ f: [24, 48], every: 8, shape: 'circle', range: 3.6, dmg: 9, kb: 'spin', force: 5.5, lift: 2, hitstop: 2 },
        { f: [25, 45], every: 10, dmg: 9, kb: 'spin', force: 4.5, lift: 2, hitstop: 0, proj: { count: 8, spread: 360, kind: 'ring', speed: 19, life: 24, r: 1.15 } }] },
    c5: { frames: 96, cancel: 87, dodgeCancel: 69, steer: 12, armor: true,
      hits: [touch(29, 16, { range: 7.4, ang: 138, kb: 'launch', force: 3, lift: 8, heavy: true, hitstop: 5, rain: 5 }),
        touch(43, 13, { range: 8.4, ang: 152, kb: 'flinch', force: 3, heavy: true, hitstop: 4, rain: 5 }),
        touch(57, 19, { range: 9.3, ang: 164, kb: 'blow', force: 9, lift: 6, heavy: true, hitstop: 6, rain: 7 })] },
    c6: { frames: 100, cancel: 90, dodgeCancel: 66, steer: 9, armor: true, lunge: [[4, 14, -0.35]],
      hits: [{ f: [18, 50], every: 8, shape: 'line', ...SIGIL, dmg: 4, kb: 'flinch', force: 1.5, hitstop: 0, sigil: 1 },
        { f: [60, 60], every: once, shape: 'line', ...SIGIL, dmg: 34, kb: 'launch', force: 3.5, lift: 12, hitstop: 7, heavy: true, sigil: 2 }] },
    dash: { frames: 72, cancel: 64, dodgeCancel: 43, steer: 4, lunge: [[0, 30, 5.3, 'lin'], [30, 39, 0.7]],
      hits: [{ f: [9, 29], every: 10, dmg: 8, kb: 'push', force: 4, hitstop: 0, proj: { kind: 'wind', count: 2, spread: 18, speed: 24, life: 21, r: 1.1 } },
        { f: [39, 42], every: once, shape: 'line', len: 9.8, width: 2.1, dmg: 21, kb: 'blow', force: 10, lift: 4, heavy: true, hitstop: 5, beam: true }] },
    jatk: { frames: 22, cancel: 11, dodgeCancel: 99, steer: 4, air: true, hover: 2.7, next: 'ja2', charge: 'jc', hits: [touch(6, 8, { yMax: 4.5 }), blade(7, 10, 1, 0, { y: 0.45 })] },
    ja2: { frames: 26, cancel: 14, dodgeCancel: 99, steer: 4, air: true, hover: 2.45, next: 'ja3', charge: 'jc', hits: [touch(8, 8, { sweep: -1, yMax: 4.5 }), blade(9, 8, 2, 24, { y: 0.45 })] },
    ja3: { frames: 32, cancel: 20, dodgeCancel: 99, steer: 4, air: true, hover: 1.95, next: 'jatk', charge: 'jc',
      hits: [{ f: [12, 14], every: once, shape: 'line', len: 7.6, width: 1.9, dmg: 17, kb: 'blow', force: 8.5, lift: 3, hitstop: 4, heavy: true, beam: true, yMax: 5 }, blade(13, 9, 2, 38, { y: 0.3 })] },
    jc: { frames: 60, cancel: 52, dodgeCancel: 42, steer: 11, air: true, hover: 3.2, armor: true, hang: [7, 29], plunge: [29, -62], landFrame: 35,
      hits: [{ f: [35, 38], every: once, shape: 'circle', range: 4.6, dmg: 20, kb: 'launch', force: 4, lift: 8, hitstop: 6, heavy: true }, blade(36, 13, 8, 360, { kind: 'ring', speed: 20, life: 23, r: 1.3, y: 0.7 })] },
  };
}
export const entry = { n2: 'n1', n3: 'n2', n4: 'n3', n5: 'n4', n6: 'n5', c2: 'n1', c3: 'n2', c4: 'n3', c5: 'n4', c6: 'n5', ja2: 'jatk', ja3: 'ja2' };
const fan = (yaw, tilt, roll = 80, y = 1.28, z = 0.26) => [-0.22, y, z, yaw, tilt, roll];
const pose = (spear, turn = -8, height = 0.89, bend = 2, palm = [-24, 6, 18, 88]) => ({ spear, hips: [0, height, 0.025],
  hipsR: [bend, turn, 0], spine: [bend * 0.45, turn * 0.2, 0], chest: [bend * 0.25, turn * 0.3, 0], head: [-1, 0, 0],
  gripR: 0, gripL: 0.25, lfree: 1, armL: palm });
const REST = pose(fan(-12, 58, 65, 1.02, 0.19));
const OPEN = [-118, 8, 12, 28], SEAL = [-58, -8, 20, 116], POINT = [-72, 4, 12, 18];
const SCORE = {
  n1: [pose(fan(-82, 4, 25), -28), pose(fan(8, 18, 68, 1.31, 0.39), 6), pose(fan(74, 32, 35), 24)],
  n2: [pose(fan(78, 18, 30), 26), pose(fan(-6, -8, 85, 1.25, 0.41), -6), pose(fan(-74, 8, 42), -26)],
  n3: [pose(fan(22, 92, 90, 1.47, 0.08), 14, 0.93, -5), pose(fan(0, -12, 90, 1.2, 0.44), 0, 0.82, 8, POINT), pose(fan(-48, 26, 55), -16)],
  n4: [pose(fan(-38, 55), -22, 0.85, -4, SEAL), pose(fan(0, 10, 90, 1.27, 0.48), -4, 0.85, 6, POINT), pose(fan(36, 32), 12)],
  n5: [pose(fan(5, 112, 90, 1.54, 0.08), 0, 0.94, -6, OPEN), pose(fan(0, 2, 90, 1.23, 0.47), 0, 0.82, 9, POINT), pose(fan(-25, 34, 70), -12)],
  n6: [pose(fan(-70, 6, 20), -22, 0.86, 3, OPEN), pose(fan(-78, 4, 20, 1.23, 0.25), 0, 0.87, 2, OPEN), pose(fan(12, 64, 90), 6, 0.92, -3, SEAL)],
  c1: [pose(fan(-26, 74, 90, 1.4, 0.1), -18, 0.92, -4, SEAL), pose(fan(0, 4, 90, 1.3, 0.5), 0, 0.81, 8, POINT), pose(fan(0, 16, 90, 1.28, 0.4), -6)],
  c2: [pose(fan(32, 28, 55), 22, 0.84, 4, SEAL), pose(fan(-8, 86, 90, 1.53, 0.15), -4, 0.94, -7, OPEN), pose(fan(16, 60, 85), 8, 0.92, -2, SEAL)],
  c3: [pose(fan(-52, 36, 50), -25, 0.88, -3, SEAL), pose(fan(0, 6, 90, 1.29, 0.43), 0, 0.84, 5, POINT), pose(fan(26, 26, 70), 12)],
  c4: [pose(fan(-65, 2, 20), -24, 0.87, 2, OPEN), pose(fan(-82, 0, 15, 1.23, 0.3), 0, 0.86, 3, OPEN), pose(fan(8, 78, 90), 5, 0.94, -4, SEAL)],
  c5: [pose(fan(-12, 102, 90, 1.52, 0.05), -8, 0.93, -7, OPEN), pose(fan(5, 12, 90, 1.26, 0.42), 4, 0.84, 7, POINT), pose(fan(46, 36, 60), 20, 0.88, 2, SEAL)],
  c6: [pose(fan(28, 45, 50), 20, 0.91, -3, SEAL), pose(fan(0, -8, 90, 1.22, 0.46), 0, 0.83, 8, SEAL), pose(fan(-45, 24, 45), -15, 0.8, 12, [-42, 2, 8, 15])],
  dash: [pose(fan(162, 18, 20, 1.08, -0.1), -18, 0.86, 9), pose(fan(0, 5, 90, 1.26, 0.45), 0, 0.84, 7, POINT), pose(fan(-18, 45), -10)],
  jatk: [pose(fan(-58, 28, 20), -18), pose(fan(7, -12, 60), 4), pose(fan(62, -20, 30), 18)],
  ja2: [pose(fan(65, 12, 20), 22), pose(fan(-7, 15, 65), -4), pose(fan(-60, 28, 30), -20)],
  ja3: [pose(fan(5, 90, 90, 1.48), 0, 0.95, -4, OPEN), pose(fan(0, -18, 90, 1.21, 0.46), 0, 0.94, 10, POINT), pose(fan(20, -8), 12)],
  jc: [pose(fan(-7, 98, 90, 1.53), 0, 0.95, -3, SEAL), pose(fan(0, -22, 90, 1.19, 0.43), 0, 0.73, 12, POINT), pose(fan(32, 18), 18)],
};
export function clips(A, M) {
  const out = {};
  for (const [id, stages] of Object.entries(SCORE)) {
    const m = M[id], first = m.tell, last = Math.max(...m.hits.map((h) => h.f[1]));
    const foot = (f, raised = false) => ({ fL: [0.19, raised ? 0.42 : 0.08, A.lungeAt(id, f) + 0.28, raised ? -24 : 0, 20],
      fR: [-0.21, raised ? 0.34 : 0.08, A.lungeAt(id, f) - 0.23, raised ? 16 : 0, -22] });
    const keys = [[0, { ...REST }], [Math.max(1, first - 7), { ...stages[0], ...foot(first - 7, !!m.air) }, 'out'],
      [first, { ...stages[1], ...foot(first, !!m.air && !m.landFrame) }, 'snap'], [last + 5, { ...stages[2], ...foot(last + 5, !!m.air && !m.landFrame) }, 'out'], [m.frames, { ...REST }]];
    if (id === 'n6' || id === 'c4') {
      const turns = id === 'n6' ? 360 : 720;
      for (let f = first; f <= last; f += 3) keys.push([f, { ...stages[1], spin: turns * (f - first) / (last - first) }, 'lin']);
      for (const k of keys) if (k[0] > last) k[1].spin = turns;
    }
    if (id === 'n4' || id === 'c5' || id === 'c3') for (const h of m.hits.slice(1)) keys.push([h.f[0] - 5, stages[0], 'out'], [h.f[0], stages[1], 'snap']);
    if (id === 'c6') keys.push([28, pose(fan(-24, 38, 75), -12, 0.87, 1, SEAL)], [51, stages[0], 'out'], [60, stages[2], 'snap']);
    if (m.hang) keys.push([m.hang[0], { ...stages[0], ...foot(m.hang[0], true) }], [m.hang[1] - 1, { ...stages[0], ...foot(m.hang[1] - 1, true) }]);
    out[id] = A.clipF(id, keys);
  }
  Object.assign(out, locoClips({ idle: REST, breath: { ...REST, head: [-3, 2, 0], spear: fan(-8, 62, 70, 1.03, 0.18) },
    takeoff: pose(fan(25, 30), 14, 0.95, -4, OPEN), apex: pose(fan(-5, 76), -3, 0.96, -6, OPEN), fall: pose(fan(-68, 4, 20), -18, 0.94, -5, OPEN),
    land: pose(fan(10, -16, 90), 6, 0.72, 11), hurt: pose(fan(-84, 28, 50), -30, 0.83, -13, OPEN) }));
  return out;
}
export const carry = { run: { ...REST, spear: fan(-15, 65, 85, 1.14, 0.12) }, roll: { ...REST, spear: fan(5, 40, 85, 1.12, 0.1) } };
const blast = (damage, radius, extra = {}) => ({ shape: 'circle', range: radius, dmg: damage, kb: 'spin', force: 5, lift: 4, hitstop: 0, yMax: 5, ...extra });
const formation = (count, dmg, speed = 20, life = 28, r = 1.4) => ({ dmg, kb: 'blow', force: 9, lift: 5, hitstop: 0, proj: { count, spread: 360, kind: 'ring', speed, life, r } });
export const musou = {
  act: pose(fan(12, 80, 90, 1.5), 8, 0.93, -5, SEAL), act2: pose(fan(-5, 97, 90, 1.59), -5, 0.96, -8, OPEN),
  face: pose(fan(-20, 48, 90, 1.24), -14, 0.9, 1), ready: SCORE.c1[0],
  seq: [[100, 120, 'c4', 0.24, 0.65], [120, 132, 'c1', 0.18, 0.54], [132, 154, 'c5', 0.22, 0.64], [154, 164, 'n6', 0.22, 0.65], [164, 176, 'c6', 0.28, 0.52]],
  fin: ['c6', 0.6, 0.94], travel: [[132, 154, 2.8]],
  hits: [[105, blast(13, 4.8), 0, 6, 120], [126, blast(23, 10, { kb: 'blow', force: 11, heavy: true, hitstop: 3 })],
    [132, blast(15, 3.2, { kb: 'launch', force: 3, lift: 9 }), 5, 6, 150], [156, blast(10, 6.6), 0, 4, 164], [168, blast(5, 10.5, { kb: 'flinch', force: 1.5, lift: 0 }), 0, 4, 175]],
  proj: [[155, formation(10, 12)], [162, formation(10, 12)]],
  fx: [[100, 'bagua', 12], [107, 'aura', 4.7], [126, 'beams', 8], [134, 'rain', 2.5, 4.5], [142, 'rain', 2.5, 8], [150, 'rain', 2.5, 11.5]],
  finFx: [['baguaBurst', 12]], finProj: [formation(16, 21, 21, 34, 1.6)],
};
