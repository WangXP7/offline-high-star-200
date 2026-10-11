// Polearm officers: a braced guard, one pivot sweep, a descending cleave, a straight ram and a falling strike.
// The four attack profiles retain their telegraph/impact contract; every pose below is authored for that phase.
import { clip, P } from '../../hero/rig.js';

export const attacks = [
  { id: 'sweep', clip: 'sweep', windup: 32, active: 24, recover: 28, every: 8, dmg: 34, shape: 'circle', r: 4.3, range: [0, 4.3], weight: 5 },
  { id: 'chop', clip: 'chop', windup: 30, active: 8, recover: 30, every: 3, dmg: 44, shape: 'lane', w: 2.4, len: 6.2, lunge: 1.2, range: [0, 5.5], weight: 4 },
  { id: 'charge', clip: 'charge', windup: 26, active: 22, recover: 28, every: 4, dmg: 38, shape: 'lane', w: 2.2, len: 9, lunge: 5.5, range: [3, 10], weight: 3 },
  { id: 'leap', clip: 'leap', windup: 24, active: 32, recover: 32, dmg: 48, shape: 'leap', r: 4.4, len: 13, h: 2.6, range: [5.5, 14], weight: 2 },
];
const hold = (yaw, pitch, roll = 70, y = 1.13, z = 0.18) => [-0.2, y, z, yaw, pitch, roll];
const pose = (spear, turn = -12, low = 0.89, lean = 4) => ({ spear, hips: [0, low, 0.03], hipsR: [lean, turn, 0],
  spine: [lean * 0.5, turn * 0.18, 0], chest: [lean * 0.3, turn * 0.29, 0], head: [0, 0, 0], gripR: 0.02, gripL: 0.59 });
const GUARD = pose(hold(16, 54), -14, 0.91, 1);
export const carry = { ...GUARD, spear: hold(165, 12, 90, 1.02, -0.14), lfree: 1, armL: [8, 4, 26, 72] };
export function clips(A, M) {
  const out = {}, step = (id, f, air = false) => ({ fL: [0.25, air ? 0.45 : 0.08, A.lungeAt(id, f) + 0.33, air ? -22 : 0, 20],
    fR: [-0.27, air ? 0.34 : 0.08, A.lungeAt(id, f) - 0.28, air ? 17 : 0, -27] });
  for (const id of Object.keys(M)) {
    const m = M[id], w = m.tell, hitEnd = m.hits[0].f[1], length = m.frames;
    let chamber, contact, recovery;
    if (id === 'sweep') {
      chamber = pose(hold(-74, 16, 0), -30, 0.81, 8);
      contact = pose(hold(-80, 0, 0), -6, 0.8, 6);
      recovery = pose(hold(38, 26), 15, 0.87, 3);
    } else if (id === 'chop') {
      chamber = pose(hold(2, 125, 90, 1.55), -4, 0.95, -7);
      contact = pose(hold(0, -23, 90, 1.02, 0.44), 0, 0.67, 17);
      recovery = pose(hold(18, 32), 8, 0.85, 4);
    } else if (id === 'charge') {
      chamber = pose(hold(0, 4, 90, 1.1, -0.25), -43, 0.76, 16);
      contact = pose(hold(0, -2, 90, 1.12, 0.56), -48, 0.78, 12);
      recovery = pose(hold(10, 24, 90, 1.15, 0.3), -20, 0.86, 5);
    } else {
      chamber = pose(hold(8, 114, 90, 1.51), -7, 0.73, 7);
      contact = pose(hold(0, -27, 90, 1.02, 0.46), 0, 0.63, 19);
      recovery = pose(hold(-15, 22), -8, 0.85, 5);
    }
    const keys = [[0, GUARD], [Math.max(1, w - 12), { ...chamber, ...step(id, w - 12) }, 'out'],
      [w, { ...contact, ...step(id, w) }, 'snap'], [hitEnd + 8, { ...recovery, ...step(id, hitEnd + 8) }, 'out'], [length, GUARD]];
    if (id === 'sweep') {
      for (let f = w; f <= hitEnd; f += 3) keys.push([f, { ...contact, spin: 360 * (f - w) / (hitEnd - w) }, 'lin']);
      keys[3][1].spin = 360; keys[4][1] = { ...GUARD, spin: 360 };
    }
    if (id === 'leap') {
      keys[2] = [w, { ...chamber, ...step(id, w) }, 'out'];
      keys.push([w + (hitEnd - w) * 0.35, { ...chamber, hips: [0, 0.98, 0.06], ...step(id, w, true) }, 'out'],
        [hitEnd - 4, { ...pose(hold(0, 42, 90, 1.35, 0.3), 0, 0.95, 6), ...step(id, hitEnd - 4, true) }, 'in'],
        [hitEnd, { ...contact, ...step(id, hitEnd) }, 'snap']);
    }
    out[id] = A.clipF(id, keys);
  }
  out.idle = clip([[0, P(GUARD)], [0.5, P({ ...GUARD, chest: [0, -3, 0] })], [1, P(GUARD)]], true);
  out.hurt = clip([[0, P(GUARD)], [0.4, P(pose(hold(-65, 22), -29, 0.81, -17)), 'out'], [1, P(pose(hold(-82, 35), -36, 0.8, -21))]]);
  out.taunt = clip([[0, P(GUARD)], [0.28, P(pose(hold(62, 15, 0), 28, 0.89, 3)), 'out'],
    [0.55, P(pose(hold(-56, 38, 0), -25, 0.92, -3)), 'io'], [0.78, P(pose(hold(0, 7, 90, 1.26, 0.35), -12)), 'snap'], [1, P(GUARD)]]);
  return out;
}
