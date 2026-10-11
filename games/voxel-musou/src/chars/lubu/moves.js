// Lü Bu: a compact armored string, three alternating cuts, then an airborne hammer.
// Charges use a lane ram, one low vortex and a two-handed storm; the Musou gathers before rushing through.
import { locoClips } from '../loco.js';
export const airChainMax = 6;
const single = 99;
const slash = (a, b, power, extra = {}) => ({ f: [a, b], every: single, shape: 'arc', range: 3.95, ang: 166, dmg: power, kb: 'push', force: 6, hitstop: 4, ...extra });
const moon = (f, power, settings = {}) => ({ f: [f, f], every: single, dmg: power, kb: 'blow', force: 12, lift: 5, hitstop: 0,
  proj: { kind: 'crescent', speed: 23, life: 27, r: 2.05, ...settings } });
export function moves() {
  return {
    n1: { frames: 28, cancel: 18, branch: 12, dodgeCancel: 12, steer: 6, armor: true, next: 'n2', charge: 'c2', lunge: [[2, 9, 0.65]], hits: [slash(8, 10, 19, { sweep: 1, dir: 7 })] },
    n2: { frames: 31, cancel: 20, branch: 13, dodgeCancel: 13, steer: 5, armor: true, next: 'n3', charge: 'c3', lunge: [[3, 11, 0.9]], hits: [slash(9, 11, 19, { sweep: -1, dir: -7 })] },
    n3: { frames: 36, cancel: 24, branch: 17, dodgeCancel: 17, steer: 5, armor: true, next: 'n4', charge: 'c4', lunge: [[5, 14, 0.8]],
      hits: [{ f: [12, 15], every: single, shape: 'line', len: 4.2, width: 2.2, dmg: 22, kb: 'launch', force: 3.5, lift: 7, hitstop: 5 }] },
    n4: { frames: 42, cancel: 30, branch: 26, dodgeCancel: 26, steer: 5, armor: true, next: 'n5', charge: 'c5', lunge: [[8, 24, 1.3]],
      hits: [{ f: [13, 24], every: 6, shape: 'circle', range: 3.95, dmg: 11, kb: 'spin', force: 7, lift: 2, hitstop: 3 }] },
    n5: { frames: 48, cancel: 35, branch: 34, dodgeCancel: 34, steer: 5, armor: true, next: 'n6', charge: 'c6', lunge: [[4, 32, 1.45]],
      hits: [slash(11, 13, 12), slash(21, 23, 12, { sweep: -1 }), slash(31, 33, 18, { kb: 'blow', force: 9, lift: 3, hitstop: 5 })] },
    n6: { frames: 64, cancel: 54, dodgeCancel: 47, steer: 6, armor: true, next: 'n1', charge: 'c1', lunge: [[6, 26, 2.1]], leap: [10, 8.6], plunge: [22, -23], landFrame: 29,
      hits: [{ f: [29, 32], every: single, shape: 'circle', range: 4.5, dmg: 37, kb: 'blow', force: 15, lift: 7, hitstop: 8, heavy: true, rocks: 10, yMax: 4.8 }, moon(30, 23, { r: 2.45 })] },
    c1: { frames: 84, cancel: 75, dodgeCancel: 56, steer: 12, armor: true, lunge: [[19, 31, 1.05]],
      hits: [slash(28, 34, 29, { range: 4.8, ang: 210, sweep: -1, sweepN: 7, kb: 'blow', force: 13, lift: 6, heavy: true, hitstop: 7 }), moon(32, 25, { count: 3, spread: 100, r: 2.2, speed: 24, life: 31 })] },
    c2: { frames: 56, cancel: 48, dodgeCancel: 30, steer: 10, armor: true, lunge: [[10, 19, 0.95]],
      hits: [slash(18, 21, 25, { range: 4.05, ang: 146, kb: 'launch', force: 2.5, lift: 12, heavy: true, hitstop: 6 })] },
    c3: { frames: 76, cancel: 67, dodgeCancel: 44, steer: 10, armor: true, lunge: [[12, 34, 5.1, 'lin'], [34, 39, 0.5]],
      hits: [{ f: [14, 34], every: 5, shape: 'line', len: 3, width: 2.7, dmg: 13, kb: 'push', force: 8, lift: 2, hitstop: 2 },
        { f: [35, 38], every: single, shape: 'line', len: 4.8, width: 2.3, dmg: 27, kb: 'blow', force: 14, lift: 6, hitstop: 7, heavy: true }, moon(36, 23, { r: 2.35, speed: 25, life: 28 })] },
    c4: { frames: 96, cancel: 86, dodgeCancel: 77, steer: 9, armor: true, lunge: [[19, 60, 2.3]],
      hits: [{ f: [24, 58], every: 6, shape: 'circle', range: 4.5, dmg: 12, kb: 'spin', force: 6, lift: 3, hitstop: 2 },
        { f: [68, 71], every: single, shape: 'circle', range: 5, dmg: 29, kb: 'blow', force: 14, lift: 6, hitstop: 8, heavy: true }, moon(69, 18, { count: 6, spread: 360, r: 1.6, speed: 18, life: 23 })] },
    c5: { frames: 98, cancel: 88, dodgeCancel: 63, steer: 10, armor: true, lunge: [[10, 35, 2.2]], leap: [15, 11.5], plunge: [32, -28], landFrame: 38,
      hits: [{ f: [38, 41], every: single, shape: 'circle', range: 5.2, dmg: 34, kb: 'launch', force: 5, lift: 9, heavy: true, rocks: 12, hitstop: 8, yMax: 4.7 }, moon(39, 19, { count: 6, spread: 360, r: 1.9, speed: 18, life: 24 })] },
    c6: { frames: 112, cancel: 101, dodgeCancel: 85, steer: 11, armor: true, lunge: [[6, 23, 0.65], [73, 83, 1.55]],
      hits: [{ f: [24, 60], every: 6, shape: 'circle', range: 4.4, dmg: 11, kb: 'spin', force: 5.5, lift: 3, hitstop: 2 },
        moon(30, 16, { count: 6, spread: 360, speed: 19, life: 24 }), moon(48, 16, { count: 8, spread: 360, speed: 19, life: 24 }), moon(60, 17, { count: 10, spread: 360, speed: 19, life: 24 }),
        slash(82, 85, 36, { range: 5, ang: 158, kb: 'blow', force: 16, lift: 7, hitstop: 8, heavy: true }), moon(83, 28, { count: 5, spread: 78, r: 2.9, speed: 25, life: 32 })] },
    dash: { frames: 74, cancel: 65, dodgeCancel: 48, steer: 3, lunge: [[0, 36, 6.1, 'lin'], [36, 48, 1.5]],
      hits: [{ f: [7, 35], every: 9, shape: 'line', len: 2.8, width: 2.8, dmg: 10, kb: 'push', force: 7.5, hitstop: 2 },
        { f: [43, 49], every: single, shape: 'circle', range: 4.3, dmg: 25, kb: 'blow', force: 12, lift: 5, heavy: true, hitstop: 6 }, moon(46, 20)] },
    jatk: { frames: 22, cancel: 11, dodgeCancel: 99, steer: 4, air: true, hover: 2.75, next: 'ja2', charge: 'jc', hits: [slash(5, 8, 15, { ang: 202, kb: 'flinch', force: 3, hitstop: 3, yMax: 4.5 })] },
    ja2: { frames: 26, cancel: 14, dodgeCancel: 99, steer: 4, air: true, hover: 2.45, next: 'ja3', charge: 'jc', hits: [slash(7, 10, 15, { ang: 214, sweep: -1, kb: 'flinch', force: 3, hitstop: 3, yMax: 4.5 })] },
    ja3: { frames: 34, cancel: 22, dodgeCancel: 99, steer: 4, air: true, hover: 1.9, next: 'jatk', charge: 'jc',
      hits: [{ f: [9, 19], every: 5, shape: 'circle', range: 4.2, dmg: 11, kb: 'spin', force: 7, lift: 3, hitstop: 3, yMax: 5 }, moon(17, 15, { count: 4, spread: 360, speed: 19, life: 18, r: 1.5 })] },
    jc: { frames: 61, cancel: 54, dodgeCancel: 43, steer: 11, armor: true, air: true, hover: 3.2, hang: [7, 32], plunge: [32, -78], landFrame: 38,
      hits: [{ f: [38, 41], every: single, shape: 'circle', range: 5.3, dmg: 29, kb: 'launch', force: 5, lift: 9, hitstop: 8, heavy: true, rocks: 11 }, moon(39, 16, { count: 6, spread: 360, speed: 18, life: 23, r: 1.7 })] },
  };
}
export const entry = { n2: 'n1', n3: 'n2', n4: 'n3', n5: 'n4', n6: 'n5', c2: 'n1', c3: 'n2', c4: 'n3', c5: 'n4', c6: 'n5', ja2: 'jatk', ja3: 'ja2' };
const pole = (angle, elevation, roll = -90, height = 1.16, forward = 0.2) => [-0.21, height, forward, angle, elevation, roll];
const stance = (spear, turn = -18, height = 0.85, pitch = 6, free = false) => ({ spear, hips: [0, height, 0.045], hipsR: [pitch, turn, 0],
  spine: [pitch * 0.58, turn * 0.24, 0], chest: [pitch * 0.3, turn * 0.31, 0], head: [0, 0, 0], gripR: 0, gripL: 0.53, lfree: free ? 1 : 0, armL: [-20, 5, 48, 42] });
const GUARD = stance(pole(14, 32, 0), -16, 0.9, 2);
const SCORE = {
  n1: [stance(pole(-96, 12), -42), stance(pole(12, 1), 8, 0.79, 9), stance(pole(102, 8), 38)],
  n2: [stance(pole(106, 8, 90), 42), stance(pole(-11, -3, 90), -6, 0.8, 8), stance(pole(-101, 15, 90), -42)],
  n3: [stance(pole(-2, 9, 0, 1.12, -0.3), -48), stance(pole(0, -3, 0, 1.14, 0.62), -52, 0.77, 12), stance(pole(8, 22, 0), -22)],
  n4: [stance(pole(-68, 3), -26), stance(pole(-82, 0), -8, 0.78, 7), stance(pole(28, 24, 0), 12)],
  n5: [stance(pole(-94, 32), -38), stance(pole(9, -9), 8, 0.77, 12), stance(pole(104, -4), 42)],
  n6: [stance(pole(3, 124, 180, 1.56), -4, 0.96, -8), stance(pole(0, -28, 180, 1.04, 0.49), 0, 0.61, 21), stance(pole(18, -10, 180), 12, 0.76, 10)],
  c1: [stance(pole(122, 28, 90), 48), stance(pole(-5, -15, 90, 1.06, 0.4), -4, 0.72, 15), stance(pole(-126, -8, 90), -46)],
  c2: [stance(pole(48, -24, 0, 0.91, 0.22), 32, 0.68, 13), stance(pole(0, 35, 0, 1.3, 0.35), 4, 0.92, -5), stance(pole(-9, 94, 0, 1.6, 0.04), -8, 0.98, -8)],
  c3: [stance(pole(0, 4, 0, 1.12, -0.32), -48, 0.76, 12), stance(pole(0, -4, 0, 1.13, 0.59), -56, 0.72, 15), stance(pole(6, 18, 0, 1.12, 0.5), -30, 0.8, 8)],
  c4: [stance(pole(-64, 22), -22), stance(pole(-83, -1), -8, 0.76, 8), stance(pole(58, 12, 0), 22)],
  c5: [stance(pole(4, 131, 180, 1.6), -6, 0.97, -8), stance(pole(0, -29, 180, 1.03, 0.48), 0, 0.58, 23), stance(pole(22, -8, 180), 14, 0.77, 9)],
  c6: [stance(pole(-56, 45), -24), stance(pole(-80, 2, -90, 1.33, 0.12), -6, 0.85, -1), stance(pole(14, -21, 180, 1.07, 0.46), 12, 0.63, 20)],
  dash: [stance(pole(168, -4, 90, 0.97, -0.11), -30, 0.77, 17, true), stance(pole(0, -3, 0, 1.12, 0.53), -36, 0.77, 13), stance(pole(88, 8), 34)],
  jatk: [stance(pole(-75, 39), -27), stance(pole(8, -23), 4), stance(pole(87, -31), 28)],
  ja2: [stance(pole(91, -8, 90), 32), stance(pole(-12, 24, 90), -5), stance(pole(-86, 48, 90), -29)],
  ja3: [stance(pole(-62, 8), -20), stance(pole(-81, -6), 0, 0.93, 5), stance(pole(12, 54, 0), 6)],
  jc: [stance(pole(2, 142, 180, 1.59), 0, 0.96, -6), stance(pole(0, -31, 180, 1.06, 0.44), 0, 0.59, 22), stance(pole(16, 4, 180), 10)],
};
export function clips(A, M) {
  const out = {};
  for (const [id, stages] of Object.entries(SCORE)) {
    const m = M[id], start = m.tell, last = Math.max(...m.hits.map((h) => h.f[1]));
    const step = (f, inAir = false) => ({ fL: [0.26, inAir ? 0.44 : 0.08, A.lungeAt(id, f) + 0.37, inAir ? -26 : 0, 22],
      fR: [-0.28, inAir ? 0.35 : 0.08, A.lungeAt(id, f) - 0.31, inAir ? 16 : 0, -28] });
    const keys = [[0, { ...GUARD }], [Math.max(1, start - 8), { ...stages[0], ...step(start - 8, !!m.air) }, 'out'],
      [start, { ...stages[1], ...step(start, !!m.air && !m.landFrame) }, 'snap'], [last + 5, { ...stages[2], ...step(last + 5, !!m.air && !m.landFrame) }, 'out'], [m.frames, { ...GUARD }]];
    const sweep = m.hits[0].sweep && m.hits[0].shape === 'arc' ? m.hits[0] : null;
    if (sweep) {
      const [a, b] = sweep.f, begin = (sweep.dir || 0) - sweep.sweep * sweep.ang * (1 - 1 / (b - a + 1)) / 2;
      keys[2][1].spear = [...stages[1].spear]; keys[2][1].spear[3] = begin;
      keys.push([(a + b) / 2, stages[1], 'lin'], [b, stages[2], 'lin']);
    }
    const spinEnd = id === 'c6' ? 60 : id === 'c4' ? 58 : last;
    const spins = { n4: 360, c4: 1080, c6: 720, ja3: 360 }[id];
    if (spins) {
      for (let f = start; f <= spinEnd; f += 3) keys.push([f, { ...stages[1], spin: spins * (f - start) / (spinEnd - start) }, 'lin']);
      keys.push([spinEnd + 1, { ...stages[1], spin: spins }]);
      for (const key of keys) if (key[0] > spinEnd) key[1].spin = spins;
    }
    if (id === 'n5') for (let i = 1; i < 3; i++) keys.push([m.hits[i].f[0] - 4, i === 1 ? stages[2] : stages[0], 'out'],
      [m.hits[i].f[0], { ...stages[1], spear: pole(i === 1 ? -12 : 10, i === 1 ? 13 : -16, i === 1 ? 90 : -90) }, 'snap']);
    if (id === 'c4') keys.push([65, { ...stages[0], spin: 1080 }, 'out'], [68, { ...stages[2], spin: 1080 }, 'snap']);
    if (id === 'c6') keys.push([73, { ...stance(pole(-8, 117, 180, 1.64), -18, 0.97, -8), spin: 720 }, 'out'], [82, { ...stages[2], spin: 720 }, 'snap']);
    if (m.leap) keys.push([m.leap[0] + 4, { ...stages[0], hips: [0, 0.97, 0.04], ...step(m.leap[0] + 4, true) }, 'out'],
      [m.landFrame - 4, { ...stages[0], ...step(m.landFrame - 4, true) }]);
    if (m.hang) keys.push([m.hang[0], { ...stages[0], ...step(m.hang[0], true) }], [m.hang[1] - 1, { ...stages[0], ...step(m.hang[1] - 1, true) }]);
    out[id] = A.clipF(id, keys);
  }
  Object.assign(out, locoClips({ idle: { ...GUARD, spear: pole(8, 76, 0, 1.03, 0.1) }, breath: { ...GUARD, chest: [0, -3, 0] },
    takeoff: stance(pole(42, 27), 16, 0.97, -4), apex: stance(pole(3, 94, 180, 1.51), -4, 0.98, -7), fall: stance(pole(-91, 7), -26, 0.95, -9, true),
    land: stance(pole(0, -22, 180), 0, 0.64, 18), hurt: stance(pole(-82, 36), -32, 0.8, -18, true) }));
  return out;
}
export const carry = { run: { ...GUARD, spear: pole(172, 9, 90, 1.02, -0.15), lfree: 1, armL: [12, 4, 28, 62] }, roll: { ...GUARD, spear: pole(20, 24) } };
const force = (dmg, range, extra = {}) => ({ shape: 'circle', range, dmg, kb: 'blow', force: 10, lift: 5, hitstop: 0, yMax: 5, ...extra });
const volley = (dmg, count = 1, spread = 0, r = 2.3) => ({ dmg, kb: 'blow', force: 12, lift: 5, hitstop: 0, proj: { count, spread, r, kind: 'crescent', speed: 22, life: 29 } });
export const musou = {
  act: stance(pole(-12, 86, 0, 1.54), -8, 0.95, -6, true), act2: stance(pole(6, 101, 0, 1.63), 4, 0.98, -9, true),
  face: stance(pole(14, 47, 0, 1.26), -21, 0.9, 0, true), ready: SCORE.c3[0],
  seq: [[100, 114, 'n5', 0.16, 0.68], [114, 132, 'c3', 0.16, 0.52], [132, 152, 'c4', 0.23, 0.74], [152, 164, 'c6', 0.21, 0.6], [164, 176, 'c5', 0.12, 0.39]],
  fin: ['c5', 0.39, 0.96], travel: [[100, 114, 1.8], [114, 132, 5.1], [132, 152, 1.6]], turn: [[113, -28], [132, 28]],
  hits: [[104, force(14, 4.6), 0, 4, 113], [116, force(13, 3.2, { shape: 'line', len: 3.4, width: 3.5 }), 0, 3, 131],
    [132, force(28, 6.8, { heavy: true, hitstop: 3 })], [138, force(12, 5.9, { kb: 'spin', force: 6 }), 0, 4, 151], [156, force(11, 5.2, { kb: 'spin', force: 5 }), 0, 4, 164]],
  proj: [[119, volley(23)], [127, volley(24, 2, 44)], [132, volley(28, 3, 82, 2.8)], [157, volley(18, 8, 360, 1.9)]],
  fx: [[104, 'aura', 4.8], [132, 'crack', 4.7], [153, 'beams', 7]],
  finFx: [['slam', 12], ['rocks', 10], ['crack', 5.1]], finProj: [volley(29, 12, 360, 2.45)],
};
