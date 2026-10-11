// Guan Yu: measured advancing cuts, a planted reverse turn and a two-beat guard breaker.
// Poses are authored in weapon/root space; the shared author plants the feet against each lunge.
import { locoClips } from '../loco.js';

export const airChainMax = 6;
const one = 99;
const cut = (a, b, range, ang, dmg, extra = {}) => ({ f: [a, b], every: one, shape: 'arc', range, ang, dmg, kb: 'push', force: 6, hitstop: 4, ...extra });
const crescent = (f, dmg, p = {}) => ({ f: [f, f], every: one, dmg, kb: 'blow', force: 10, lift: 4, hitstop: 0,
  proj: { kind: 'crescent', speed: 19, life: 29, r: 1.85, ...p } });
export function moves() {
  return {
    n1: { frames: 34, cancel: 22, branch: 13, dodgeCancel: 13, steer: 6, next: 'n2', charge: 'c2', lunge: [[2, 10, 0.55]],
      hits: [cut(9, 12, 3.5, 152, 17, { sweep: 1, dir: 8 })] },
    n2: { frames: 38, cancel: 25, branch: 16, dodgeCancel: 16, steer: 5, next: 'n3', charge: 'c3', lunge: [[3, 12, 0.7]],
      hits: [cut(11, 14, 3.65, 185, 16, { sweep: -1, dir: -8 })] },
    n3: { frames: 42, cancel: 28, branch: 20, dodgeCancel: 20, steer: 5, next: 'n4', charge: 'c4', lunge: [[5, 15, 1.05]],
      hits: [{ f: [14, 17], every: one, shape: 'line', len: 4.1, width: 2.0, dmg: 21, kb: 'push', force: 7, hitstop: 5 }] },
    n4: { frames: 48, cancel: 34, branch: 29, dodgeCancel: 29, steer: 4, armor: true, next: 'n5', charge: 'c5', lunge: [[8, 25, 1.15]],
      hits: [{ f: [15, 27], every: 6, shape: 'circle', range: 3.7, dmg: 10, kb: 'spin', force: 4, lift: 2, hitstop: 3 }] },
    n5: { frames: 50, cancel: 35, branch: 24, dodgeCancel: 24, steer: 5, armor: true, next: 'n6', charge: 'c6', lunge: [[7, 19, 0.85]],
      hits: [cut(19, 22, 3.8, 126, 23, { kb: 'launch', force: 3, lift: 7, heavy: true, hitstop: 6 }), crescent(20, 16)] },
    n6: { frames: 68, cancel: 58, dodgeCancel: 49, steer: 5, armor: true, next: 'n1', charge: 'c1', lunge: [[8, 22, 0.65], [35, 43, 0.7]],
      hits: [cut(21, 24, 3.9, 155, 15, { kb: 'launch', lift: 5 }), cut(44, 47, 4.6, 168, 32, { kb: 'blow', force: 14, lift: 6, heavy: true, rocks: 9, hitstop: 8 }),
        crescent(45, 23, { r: 2.45, speed: 21 })] },
    c1: { frames: 76, cancel: 66, dodgeCancel: 47, steer: 11, armor: true, lunge: [[17, 29, 1.1]],
      hits: [cut(29, 33, 4.5, 195, 30, { sweep: -1, kb: 'blow', force: 12, lift: 7, heavy: true, hitstop: 7 }), crescent(31, 25, { r: 2.55, life: 34 })] },
    c2: { frames: 58, cancel: 49, dodgeCancel: 30, steer: 11, armor: true, lunge: [[9, 18, 0.8]],
      hits: [cut(18, 22, 3.8, 142, 22, { kb: 'launch', force: 2.5, lift: 12, heavy: true, hitstop: 6 })] },
    c3: { frames: 88, cancel: 78, dodgeCancel: 65, steer: 9, armor: true, lunge: [[11, 21, 1.3], [37, 48, 1.8]],
      hits: [cut(20, 23, 4, 156, 24, { kb: 'flinch', force: 3 }), cut(48, 51, 4.7, 172, 28, { kb: 'blow', force: 13, lift: 6, heavy: true, hitstop: 7 }), crescent(49, 21)] },
    c4: { frames: 80, cancel: 70, dodgeCancel: 48, steer: 10, armor: true, lunge: [[14, 28, 0.95]],
      hits: [cut(24, 32, 4.2, 252, 25, { sweep: 1, sweepN: 8, kb: 'blow', force: 11, lift: 5, heavy: true, hitstop: 6 }), crescent(29, 18, { count: 3, spread: 84, r: 1.9 })] },
    c5: { frames: 94, cancel: 84, dodgeCancel: 59, steer: 9, armor: true, lunge: [[9, 32, 2.05]], leap: [12, 10.8], plunge: [29, -24], landFrame: 36,
      hits: [{ f: [36, 39], every: one, shape: 'circle', range: 4.7, dmg: 31, kb: 'launch', force: 4, lift: 9, heavy: true, rocks: 11, hitstop: 8, yMax: 4.5 },
        crescent(37, 14, { count: 6, spread: 360, speed: 18, life: 24, r: 1.65 })] },
    c6: { frames: 106, cancel: 96, dodgeCancel: 79, steer: 10, armor: true, lunge: [[8, 24, 0.7], [60, 69, 1.25]],
      hits: [{ f: [26, 44], every: 6, shape: 'circle', range: 4.1, dmg: 11, kb: 'spin', force: 5, lift: 3, hitstop: 3 },
        crescent(40, 17, { count: 8, spread: 360, speed: 20, life: 27, r: 1.7 }),
        cut(69, 72, 4.9, 174, 34, { kb: 'blow', force: 15, lift: 7, heavy: true, rocks: 13, hitstop: 8 }), crescent(70, 25, { r: 2.7, speed: 22, life: 33 })] },
    dash: { frames: 78, cancel: 69, dodgeCancel: 48, steer: 3, lunge: [[0, 35, 5.8, 'lin'], [35, 44, 1.25]],
      hits: [cut(9, 33, 2.7, 116, 9, { every: 8, force: 8, hitstop: 2 }), cut(43, 46, 4.1, 164, 25, { kb: 'launch', force: 4, lift: 8, heavy: true, hitstop: 6 })] },
    jatk: { frames: 23, cancel: 12, dodgeCancel: 99, steer: 4, air: true, hover: 2.55, next: 'ja2', charge: 'jc',
      hits: [cut(6, 9, 3.75, 176, 14, { kb: 'flinch', force: 3, hitstop: 3, yMax: 4.5 })] },
    ja2: { frames: 27, cancel: 14, dodgeCancel: 99, steer: 4, air: true, hover: 2.35, next: 'ja3', charge: 'jc',
      hits: [cut(7, 10, 3.8, 192, 14, { sweep: -1, kb: 'flinch', force: 3, hitstop: 3, yMax: 4.5 })] },
    ja3: { frames: 33, cancel: 21, dodgeCancel: 99, steer: 4, air: true, hover: 1.7, next: 'jatk', charge: 'jc',
      hits: [cut(11, 14, 4, 144, 21, { kb: 'blow', force: 9, lift: 3, heavy: true, yMax: 5 }), crescent(12, 13, { r: 1.5, speed: 18, life: 20, y: 0.5 })] },
    jc: { frames: 62, cancel: 55, dodgeCancel: 43, steer: 10, air: true, hover: 3.1, armor: true, hang: [7, 31], plunge: [31, -74], landFrame: 37,
      hits: [{ f: [37, 40], every: one, shape: 'circle', range: 4.9, dmg: 28, kb: 'launch', force: 4, lift: 9, heavy: true, rocks: 8, hitstop: 7, yMax: 5 },
        crescent(38, 14, { count: 5, spread: 360, r: 1.6, speed: 18, life: 22 })] },
  };
}
export const entry = { n2: 'n1', n3: 'n2', n4: 'n3', n5: 'n4', n6: 'n5', c2: 'n1', c3: 'n2', c4: 'n3', c5: 'n4', c6: 'n5', ja2: 'jatk', ja3: 'ja2' };
const line = (yaw, elev, roll = 0, y = 1.18, z = 0.16) => [-0.19, y, z, yaw, elev, roll];
const body = (spear, twist = -16, low = 0.88, lean = 4) => ({ spear, hips: [0, low, 0.035], hipsR: [lean, twist, 0],
  spine: [lean * 0.55, twist * 0.22, 0], chest: [lean * 0.35, twist * 0.34, 0], head: [0, 0, 0], gripR: 0, gripL: 0.57 });
const REST = body(line(18, 46), -18, 0.9, 1);
// Chamber / contact / recovery; a circle supplies a full turn through its active interval.
const SCORES = {
  n1: [body(line(-88, 24, -90), -38), body(line(14, -12, -90), 12, 0.8, 9), body(line(96, -8, -90), 38)],
  n2: [body(line(102, 6, 90), 40), body(line(-12, 2, 90), -8, 0.82, 7), body(line(-98, 18, 90), -42)],
  n3: [body(line(0, 8, 0, 1.12, -0.25), -44), body(line(0, -3, 0, 1.1, 0.56), -50, 0.78, 11), body(line(5, 20), -20)],
  n4: [body(line(-72, 2, -90), -28), body(line(-84, 1, -90), -10, 0.79, 7), body(line(42, 18), 16)],
  n5: [body(line(-16, -25, 0, 0.92, 0.22), -20, 0.72, 10), body(line(5, 30, 0, 1.26, 0.34), 12, 0.91, -4), body(line(12, 78, 0, 1.53, 0.04), 10, 0.96, -7)],
  n6: [body(line(-25, 86, 180, 1.56), -24, 0.94, -6), body(line(4, -21, 180, 0.99, 0.43), 10, 0.7, 16), body(line(61, -10, 90), 32)],
  c1: [body(line(118, 22, 90), 48), body(line(-8, -16, 90, 1.04, 0.44), -12, 0.76, 12), body(line(-126, -8, 90), -48)],
  c2: [body(line(38, -28, 0, 0.88, 0.22), 28, 0.7, 12), body(line(0, 28, 0, 1.22, 0.4), 2, 0.9, -4), body(line(-18, 92, 0, 1.56), -12, 0.98, -8)],
  c3: [body(line(-98, 15, -90), -40), body(line(3, -8, -90, 1.05, 0.47), 7, 0.77, 12), body(line(98, -2, -90), 42)],
  c4: [body(line(-122, 6, -90), -42), body(line(8, 2, -90, 1.12, 0.35), 4, 0.8, 7), body(line(132, 8, -90), 46)],
  c5: [body(line(6, 126, 180, 1.52), -8, 0.95, -7), body(line(0, -26, 180, 0.99, 0.48), 0, 0.64, 19), body(line(-22, -8, 180), -15, 0.79, 8)],
  c6: [body(line(-75, 15, -90), -20), body(line(-85, 8, -90, 1.26, 0.13), -4, 0.86, 3), body(line(22, -18, 180, 1.04, 0.42), 20, 0.7, 15)],
  dash: [body(line(172, -12, 0, 0.91, -0.12), -34, 0.79, 14), body(line(12, 14, 0, 1.08, 0.42), -6, 0.81, 9), body(line(-75, 30), -25)],
  jatk: [body(line(-78, 34, -90), -24), body(line(18, -22, -90), 8), body(line(88, -38, -90), 25)],
  ja2: [body(line(90, -8, 90), 32), body(line(-15, 24, 90), -4), body(line(-83, 52, 90), -28)],
  ja3: [body(line(8, 110, 180, 1.52), 0), body(line(0, -25, 180, 1.09, 0.5), 0, 0.9, 15), body(line(32, -14, 180), 14)],
  jc: [body(line(4, 132, 180, 1.55), 0, 0.94, -5), body(line(0, -28, 180, 0.99, 0.4), 0, 0.65, 18), body(line(12, 6, 180), 10)],
};
export function clips(A, M) {
  const out = {};
  for (const [id, score] of Object.entries(SCORES)) {
    const m = M[id], strike = m.tell, final = Math.max(...m.hits.map((h) => h.f[1])), end = m.frames;
    const feet = (f, air = false) => ({ fL: [0.23, air ? 0.43 : 0.08, A.lungeAt(id, f) + 0.34, air ? -22 : 0, 18],
      fR: [-0.24, air ? 0.32 : 0.08, A.lungeAt(id, f) - 0.29, air ? 14 : 0, -24] });
    const keys = [[0, { ...REST }], [Math.max(1, strike - 7), { ...score[0], ...feet(strike - 7, !!m.air) }, 'out'],
      [strike, { ...score[1], ...feet(strike, !!m.air && !m.landFrame) }, 'snap'],
      [final + 4, { ...score[2], ...feet(final + 4, !!m.air && !m.landFrame) }, 'out'], [end, { ...REST }]];
    const sweep = m.hits.find((h) => h.sweep);
    if (sweep) {
      const [a, b] = sweep.f, begin = (sweep.dir || 0) - sweep.sweep * sweep.ang * (1 - 1 / (b - a + 1)) / 2;
      keys[2][1].spear = [...score[1].spear]; keys[2][1].spear[3] = begin;
      keys.push([(a + b) / 2, score[1], 'lin'], [b, score[2], 'lin']);
    }
    if (['n4', 'c6'].includes(id)) {
      const last = id === 'c6' ? 44 : final, turns = id === 'c6' ? 720 : 360;
      for (let f = strike; f <= last; f += 3) keys.push([f, { ...score[1], spin: turns * (f - strike) / (last - strike) }, 'lin']);
      keys.push([last + 1, { ...score[1], spin: turns }]);
      for (const k of keys) if (k[0] > last) k[1].spin = turns;
    }
    if (id === 'n6' || id === 'c3') keys.push([m.hits[1].f[0] - 6, score[0], 'out'], [m.hits[1].f[0], score[1], 'snap']);
    if (m.leap) keys.push([m.leap[0] + 4, { ...score[0], hips: [0, 0.97, 0.06], ...feet(m.leap[0] + 4, true) }, 'out'],
      [m.landFrame - 4, { ...score[0], ...feet(m.landFrame - 4, true) }]);
    if (m.hang) keys.push([m.hang[0], { ...score[0], ...feet(m.hang[0], true) }], [m.hang[1] - 1, { ...score[0], ...feet(m.hang[1] - 1, true) }]);
    out[id] = A.clipF(id, keys);
  }
  Object.assign(out, locoClips({ idle: REST, breath: { ...REST, chest: [0, -4, 0] },
    takeoff: body(line(32, 28), -12, 0.95, -3), apex: body(line(14, 58), -8, 0.96, -5), fall: body(line(-68, 12), -18, 0.95, -7),
    land: body(line(4, -18, 180), 0, 0.71, 13), hurt: body(line(-96, 34), -34, 0.83, -17) }));
  return out;
}
export const carry = { run: { ...REST, spear: line(158, -18, 0, 0.94, -0.1), lfree: 1, armL: [8, 2, 24, 68] }, roll: { ...REST, spear: line(20, 32) } };
const circle = (dmg, range, extra = {}) => ({ shape: 'circle', range, dmg, kb: 'blow', force: 9, lift: 5, hitstop: 0, yMax: 5, ...extra });
const muWave = (dmg, p) => ({ dmg, kb: 'blow', force: 10, lift: 5, hitstop: 0, proj: { kind: 'crescent', speed: 21, life: 28, r: 2.1, ...p } });
export const musou = {
  act: body(line(0, 82, 0, 1.5), -6, 0.94, -5), act2: body(line(-8, 96, 0, 1.57), -8, 0.97, -9),
  face: body(line(24, 52, 0, 1.23), -24, 0.9, 0), ready: SCORES.c3[0],
  seq: [[100, 118, 'c3', 0.15, 0.58], [118, 132, 'c2', 0.12, 0.52], [132, 148, 'c4', 0.22, 0.59], [148, 164, 'c6', 0.23, 0.5], [164, 176, 'n6', 0.45, 0.67]],
  fin: ['n6', 0.65, 0.97], travel: [[100, 118, 4.2], [132, 148, 1.9]],
  hits: [[105, circle(16, 4.6), 0, 5, 120], [122, circle(22, 5.2, { kb: 'launch', force: 3, lift: 9 })],
    [132, circle(29, 8.5, { heavy: true, hitstop: 3 })], [149, circle(12, 5.8, { kb: 'spin', force: 5 }), 0, 5, 164]],
  proj: [[112, muWave(22, {})], [132, muWave(27, { count: 3, spread: 78 })], [157, muWave(18, { count: 8, spread: 360, r: 1.7 })]],
  fx: [[104, 'aura', 4.4], [122, 'beams', 6], [132, 'crack', 4.2]],
  finFx: [['slam', 11], ['crack', 5.3]], finProj: [muWave(25, { count: 10, spread: 360, speed: 18, life: 32, r: 2.2 })],
};
