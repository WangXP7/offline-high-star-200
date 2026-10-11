// Sword boss set (NPC kit weapon class: ./kit.js header) — a one-handed straight sword (origin = the grip, blade along
// +Z to ≈ 0.95 m, flat in local XZ: roll 90 stands the edge up / down), the right hand on it, the left free (a two-handed
// cut brings it onto the pommel, gripL −0.12): 曹操's 倚天劍. A lord's swordplay, fast and exact:
//   slash   drawn back high over the right shoulder, a lunging diagonal cut and the backhand rising behind it (lane 5.5 m)
//   whirl   the arm flung out straight, two full turns (circle 3.6 m, a hit every 11 sf)
//   leap    a bound onto the hero, both hands on the hilt, the point driven into the ground (circle 3.6 m)
//   wave    raised two-handed overhead, one great downward cut that sends a sword wind 10 m down a lane
// idle: the sword planted point-down before him, both hands stacked on the pommel (the commander at ease) · taunt: drawn
// up and levelled at the hero, the left hand behind his back · hurt: knocked back, the sword arm thrown wide.
import { clip, P } from '../../hero/rig.js';

export const attacks = [
  { id: 'slash', clip: 'slash', windup: 24, active: 14, recover: 26, every: 4, dmg: 32, shape: 'lane', w: 2.2, len: 5.5, lunge: 3.5, range: [0, 6.5], weight: 5 },
  { id: 'whirl', clip: 'whirl', windup: 30, active: 22, recover: 26, every: 11, dmg: 34, shape: 'circle', r: 3.6, range: [0, 3.6], weight: 4 },
  { id: 'leap', clip: 'leap', windup: 22, active: 30, recover: 30, dmg: 46, shape: 'leap', r: 3.6, len: 11, h: 2.4, range: [5.5, 12], weight: 2 },
  { id: 'wave', clip: 'wave', windup: 34, active: 12, recover: 24, every: 3, dmg: 36, shape: 'lane', w: 1.8, len: 10, range: [3.5, 11], weight: 3 },
];
// run: the sword low in the right hand, point trailing behind; the left arm pumps free
export const carry = { spear: [-0.3, 0.92, -0.06, 180, -36, 90], gripR: 0, gripL: 0.5, lfree: 1, armL: [10, 0, 14, 85] };

// ---------------------------------------------------------------- poses (rig.js P specs)
const FREE = { lfree: 1, gripL: 0.5 };
const G = { hips: [0, 0.84, 0], hipsR: [2, -30, 0], spine: [6, -6, 0], chest: [4, -8, 0], head: [0, 6, 0],
  spear: [-0.3, 1.04, 0.26, 10, 16, 90], gripR: 0, ...FREE, armL: [-24, 0, 36, 70] };
const HIGH = { hips: [0, 0.86, -0.04], hipsR: [4, -54, 0], spine: [2, -18, 0], chest: [-6, -26, 0], head: [0, 20, 0],
  spear: [-0.3, 1.6, -0.08, -150, 42, 0], ...FREE, armL: [-50, 0, 30, 40] };
const CUT = { hips: [0, 0.74, 0.24], hipsR: [14, 26, 0], spine: [10, 14, 0], chest: [8, 20, 0], head: [4, -10, 0],
  spear: [0.02, 0.96, 0.4, 44, -28, 0], ...FREE, armL: [20, 0, 60, 40] };
const RISE = { hips: [0, 0.8, 0.3], hipsR: [6, -40, 0], spine: [2, -16, 0], chest: [-4, -22, 0], head: [0, 16, 0],
  spear: [-0.34, 1.48, 0.28, -70, 46, 0], ...FREE, armL: [-10, 0, 70, 30] };
const OVER = { hips: [0, 0.94, 0], hipsR: [-6, -8, 0], spine: [-6, 0, 0], chest: [-12, 0, 0], head: [-4, 0, 0],
  spear: [-0.06, 1.78, -0.04, 0, 112, 90], gripR: 0, gripL: -0.12, lfree: 0 };
const DOWN = { hips: [0, 0.64, 0.24], hipsR: [26, -10, 0], spine: [16, 0, 0], chest: [12, 0, 0], head: [8, 0, 0],
  spear: [-0.04, 1.08, 0.46, 0, -12, 90], gripR: 0, gripL: -0.12, lfree: 0 };
const IDLE = { hips: [0, 0.9, 0], hipsR: [0, 0, 0], spine: [2, 0, 0], chest: [-4, 0, 0], head: [-4, 0, 0],
  footL: [0.15, 0.08, 0.04, 0, 12], footR: [-0.15, 0.08, -0.04, 0, -12],
  spear: [-0.03, 1.0, 0.26, 0, -90, 90], gripR: 0, gripL: -0.12, lfree: 0 };
const HURT = { hips: [0, 0.8, -0.16], hipsR: [-14, -24, 6], spine: [-12, 0, 0], chest: [-14, 0, 0], head: [-20, 0, 0],
  footL: [0.18, 0.08, 0.1, 0, 14], footR: [-0.2, 0.08, -0.3, 0, -20],
  spear: [-0.36, 1.22, 0.06, -120, 20, 90], ...FREE, armL: [-30, 0, 72, 40] };

export function clips(A, M) {
  const { clipF, lungeAt: lz, body, ft, hit } = A;
  const step = (id, f, dz = 0) => ({ fL: [0.2, 0.08, lz(id, f) + 0.62 + dz, 0, 10], fR: [-0.24, 0.08, lz(id, f) - 0.4, 0, -60] });   // lunge stance
  const wide = (id, f) => ({ fL: [0.3, 0.08, lz(id, f) + 0.34, 0, 25], fR: [-0.3, 0.08, lz(id, f) - 0.28, 0, -45] });
  const out = {};
  // slash: high over the shoulder, a held beat, the lunging diagonal cut, the backhand rising behind it
  { const [s, e] = hit('slash'), F = M.slash.frames;
    out.slash = clipF('slash', [[0, G],
      [s - 12, HIGH, 'out'], [s - 2, { ...HIGH, chest: [-8, -30, 0], spear: [-0.28, 1.64, -0.12, -156, 48, 0] }, 'io'],
      [s + 4, { ...CUT, ...step('slash', s + 4) }, 'snap'],
      [s + 7, { ...CUT, hips: [0, 0.74, 0.28], spear: [0.0, 0.98, 0.42, 30, -20, 0] }, 'io'],
      [e, { ...RISE, ...step('slash', e) }, 'snap'],
      [e + 12, { ...RISE, hips: [0, 0.82, 0.26], spear: [-0.34, 1.44, 0.26, -64, 40, 0] }, 'io'], [F, G]]); }
  // whirl: the arm flung out straight to his right, two turns, feet stepping round under him
  { const [s, e] = hit('whirl'), F = M.whirl.frames;
    const sp = (f) => 720 * Math.min(1, Math.max(0, (f - s) / (e - s)));
    const OUT = { hips: [0, 0.8, 0.02], hipsR: [4, -6, 0], spine: [4, -6, 0], chest: [0, -8, 0], head: [0, 0, 0],
      spear: [-0.66, 1.3, 0.1, -86, 4, 0], ...FREE, armL: [0, 0, 74, 16] };
    const keys = [[0, G], [s - 14, { ...OUT, hipsR: [8, 40, 0], chest: [4, 30, 0], spear: [0.12, 1.28, 0.3, 60, 10, 0], armL: [30, 0, 40, 60], ...wide('whirl', s - 14) }, 'out'],
      [s - 2, { ...OUT, hipsR: [8, 48, 0], chest: [4, 34, 0], spear: [0.14, 1.26, 0.28, 66, 10, 0], armL: [30, 0, 40, 60] }, 'io']];
    for (let f = s; f <= e; f += 3) keys.push([f, { ...OUT, spin: sp(f) }, 'lin']);
    keys.push([e + 10, { ...OUT, spin: 720, spear: [-0.6, 1.2, 0.16, -80, -6, 0] }, 'io'], [F, { ...G, spin: 720 }]);
    for (let f = s; f <= e; f += 3) {
      const phase = (f - s) * Math.PI / 6;
      const pivot = (x, offset) => {
        const q = phase + offset, lift = Math.max(0, Math.sin(q));
        return body('whirl', f, sp(f), [x, 0.08 + lift * 0.13, 0.2 + Math.cos(q) * 0.1, -20 * lift, x > 0 ? 20 : -22]);
      };
      keys.push(ft(f, pivot(0.19, 0), pivot(-0.22, Math.PI)));
    }
    keys.push(ft(F, [0.17, 0.08, 0.3, 0, 15 + 720], [-0.2, 0.08, -0.26, 0, -30 + 720]));
    out.whirl = clipF('whirl', keys); }
  // leap: crouch, the hilt raised two-handed over his head in the air, the point driven down on landing
  { const [s, L] = hit('leap'), F = M.leap.frames;
    const air = (y) => ({ fL: [0.18, y, 0.22, -30, 12], fR: [-0.18, y - 0.1, -0.14, -20, -24] });
    const PLUNGE = { ...DOWN, hips: [0, 0.54, 0.16], hipsR: [30, -8, 0], spine: [20, 0, 0], chest: [16, 0, 0], spear: [-0.02, 0.9, 0.46, 0, -78, 90] };
    out.leap = clipF('leap', [[0, G],
      [s - 6, { ...DOWN, hips: [0, 0.6, 0.02], spear: [-0.3, 0.98, 0.1, -10, 30, 90], ...FREE, armL: [-20, 0, 50, 60], ...wide('leap', s - 6) }, 'out'],
      [s + 4, { ...OVER, hips: [0, 1.04, 0.08], spear: [-0.04, 1.84, 0.12, 0, -60, 90], ...air(0.55) }, 'out'],
      [L - 4, { ...OVER, hips: [0, 1.0, 0.12], chest: [-4, 0, 0], spear: [-0.03, 1.8, 0.2, 0, -72, 90], ...air(0.44) }, 'io'],
      [L, { ...PLUNGE, ...wide('leap', L) }, 'snap'],
      [L + 16, { ...PLUNGE, hips: [0, 0.6, 0.14] }, 'io'], [F, G]]); }
  // wave: raised two-handed overhead, a long gathering beat, one great cut down to level
  { const [s, e] = hit('wave'), F = M.wave.frames;
    out.wave = clipF('wave', [[0, G],
      [s - 20, OVER, 'out'], [s - 2, { ...OVER, hips: [0, 0.96, -0.02], chest: [-16, 0, 0], head: [-8, 0, 0], spear: [-0.06, 1.82, -0.08, 0, 124, 90] }, 'io'],
      [s + 2, { ...DOWN, ...wide('wave', s + 2) }, 'snap'],
      [e + 12, { ...DOWN, hips: [0, 0.68, 0.22], spear: [-0.04, 1.08, 0.44, 0, -16, 90] }, 'io'], [F, G]]); }
  out.idle = clip([[0, P(IDLE)], [0.5, P({ ...IDLE, hips: [0, 0.892, 0], chest: [-6, 0, 0], head: [-6, 0, 0] })], [1, P(IDLE)]], true);
  out.hurt = clip([[0, P(IDLE)], [0.3, P({ ...HURT, hips: [0, 0.76, -0.22], chest: [-20, 0, 0] }), 'out'], [1, P(HURT)]]);
  // taunt: drawn up out of the ground, levelled at the hero at arm's length, the left hand behind his back, chin raised
  { const POINT = { ...IDLE, hips: [0, 0.9, 0.02], hipsR: [0, -36, 0], spine: [0, -10, 0], chest: [-6, -14, 0], head: [-10, 0, 0],
      footL: [0.18, 0.08, 0.16, 0, 16], footR: [-0.18, 0.08, -0.16, 0, -34],
      spear: [-0.2, 1.4, 0.42, 0, 6, 90], ...FREE, armL: [34, 0, 12, 110] };
    out.taunt = clip([[0, P(IDLE)], [0.18, P({ ...IDLE, hips: [0, 0.92, 0], spear: [-0.16, 1.2, 0.22, 0, -40, 90], gripL: 0.5, lfree: 1, armL: [20, 0, 20, 90] }), 'out'],
      [0.36, P(POINT), 'snap'], [0.8, P({ ...POINT, chest: [-10, -14, 0], head: [-16, 0, 0] }), 'io'], [1, P(POINT)]]); }
  return out;
}
