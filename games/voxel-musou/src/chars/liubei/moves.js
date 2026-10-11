// 劉備's moveset (def-kit moveset: src/chars/defkit.js header) — the 雙股劍, a jian in each hand: quick, balanced, the two
// blades trading cuts so one is always coming. Data like src/hero/moves.js (+ roar / proj windows); clips are frame-keyed
// with the shared author (hero/anims/author.js), anchored to the hit windows.
//   N1 right blade, a flat cut right → left · N2 left blade back left → right · N3 both blades cross-cut down (X)
//   N4 spinning double cut, arms flung wide · N5 both blades rising · N6 leap, blades crossed overhead, the X cut down
//   on landing
//   C1 (neutral) 十字斬: blades crossed before the face flung apart — a crossed wind blade flies 9 m (proj 'wind' ×2)
//   C2 (N1→) twin scoop launcher · C3 (N2→) spinning drill: four turns carried 7 m through the crowd, a bursting last cut
//   C4 (N3→) twin thrusts, alternating, then both together · C5 (N4→) leap, both blades driven down crossed: an X of four
//   crescents runs out along the diagonals
//   C6 (N5→) 仁德: the swords raised crossed to heaven, then spread wide — a shock ring rolls 7.5 m out (proj 'roar') and
//        rallies his side (kit.js: allies within 20 m restored and cheering, 5 % of his own health)
//   dash: running, both blades swept back like wings, into a spinning double cut · jump: right cut · left cut · falling X
//   (3-hit air string) · jump charge: blades crossed overhead, the plunge, an X cut on landing (rocks)
// Musou 昭烈・雙龍斬 (musou/scripted.js; the twin dragons are view.js): a crossed wind blade · the rush · CONTACT: the X
// cut, the dragons leave the blades · the drill through the line · twin thrust · the leap — FINISHER: the X slam, the
// dragons dive crossing into it, crescents along the diagonals.
//
// The left sword (kit.js) hangs on the left hand, the arm posed by FK (lfree 1, armL) and the sword turned to the root-
// space blade [yaw, elev, roll] keyed in the armR channels (armR[3] = 90 → fully authored, 0 → the natural grip); the
// right sword is the weapon joint's, gripped at its origin. K() places both fists relative to the shoulders the body spec
// puts them at, so a grip stays within the arm's reach whatever the torso does.
import * as THREE from 'three';
import { STANCE } from '../../hero/rig.js';
import { locoClips } from '../loco.js';

const ONCE = 99;
export const airChainMax = 6;

export function moves() {
  return {
    n1: { frames: 26, next: 'n2', charge: 'c2', cancel: 16, branch: 8, dodgeCancel: 9, steer: 5, lunge: [[2, 9, 0.6]],
      hits: [{ f: [7, 9], sweep: 1, shape: 'arc', range: 2.8, ang: 160, dmg: 13, kb: 'flinch', force: 3.5, hitstop: 3 }] },
    n2: { frames: 26, next: 'n3', charge: 'c3', cancel: 16, branch: 8, dodgeCancel: 9, steer: 5, lunge: [[2, 9, 0.6]],
      hits: [{ f: [7, 9], sweep: -1, shape: 'arc', range: 2.8, ang: 160, dmg: 13, kb: 'flinch', force: 3.5, hitstop: 3 }] },
    n3: { frames: 30, next: 'n4', charge: 'c4', cancel: 20, branch: 11, dodgeCancel: 13, steer: 5, lunge: [[3, 11, 0.7]],
      hits: [{ f: [9, 12], every: ONCE, shape: 'arc', range: 3.0, ang: 140, dmg: 16, kb: 'push', force: 5.5, hitstop: 4 }] },
    n4: { frames: 36, next: 'n5', charge: 'c5', cancel: 26, branch: 14, dodgeCancel: 20, steer: 6, lunge: [[4, 20, 0.8]],
      hits: [{ f: [8, 20], every: 6, shape: 'circle', range: 3.1, dmg: 8, kb: 'push', force: 5, hitstop: 2 }] },
    n5: { frames: 36, next: 'n6', charge: 'c6', cancel: 26, branch: 14, dodgeCancel: 16, steer: 5, lunge: [[4, 12, 0.6]],
      hits: [{ f: [10, 13], every: ONCE, shape: 'arc', range: 3.0, ang: 130, dmg: 17, kb: 'push', force: 6, lift: 5, hitstop: 4 }] },
    n6: { frames: 58, next: 'n1', charge: 'c1', cancel: 48, dodgeCancel: 40, steer: 6, lunge: [[8, 30, 1.6]], armor: true,
      leap: [11, 8.5], plunge: [22, -18], landFrame: 30,
      hits: [{ f: [30, 32], every: ONCE, shape: 'circle', range: 4.2, dmg: 24, kb: 'blow', force: 12, lift: 6, hitstop: 8, heavy: true, yMax: 4 }] },

    c1: { frames: 62, cancel: 52, dodgeCancel: 36, steer: 12, lunge: [[16, 24, 0.9]], armor: true,
      hits: [{ f: [20, 22], every: ONCE, shape: 'arc', range: 3.2, ang: 150, dmg: 20, kb: 'blow', force: 9, lift: 3, hitstop: 6, heavy: true },
        { f: [21, 21], every: ONCE, dmg: 16, kb: 'blow', force: 10, lift: 3, hitstop: 3, heavy: true,
          proj: { count: 2, spread: 6, speed: 22, life: 26, r: 2.2, y: 1.1, kind: 'wind' } }] },
    c2: { frames: 50, cancel: 42, dodgeCancel: 26, steer: 10, lunge: [[8, 16, 1.0]], armor: true,
      hits: [{ f: [14, 17], every: ONCE, shape: 'arc', range: 3.0, ang: 140, dmg: 18, kb: 'launch', force: 2, lift: 11, hitstop: 6, heavy: true }] },
    c3: { frames: 86, cancel: 78, dodgeCancel: 66, steer: 10, lunge: [[10, 58, 7]], armor: true,
      hits: [{ f: [10, 56], every: 4, shape: 'circle', range: 2.6, dmg: 5, kb: 'flinch', force: 2, hitstop: 1 },
        { f: [62, 64], every: ONCE, shape: 'circle', range: 3.6, dmg: 24, kb: 'blow', force: 13, lift: 6, hitstop: 8, heavy: true }] },
    c4: { frames: 80, cancel: 70, dodgeCancel: 60, steer: 10, lunge: [[12, 48, 1.4], [52, 58, 1.2]], armor: true,
      hits: [{ f: [12, 48], every: 4, shape: 'line', len: 3.6, width: 1.6, dmg: 5, kb: 'flinch', force: 1.5, hitstop: 1 },
        { f: [56, 58], every: ONCE, shape: 'line', len: 5, width: 2.4, dmg: 24, kb: 'blow', force: 13, lift: 4, hitstop: 8, heavy: true }] },
    c5: { frames: 92, cancel: 84, dodgeCancel: 56, steer: 10, lunge: [[12, 36, 1.8]], armor: true, leap: [14, 10], plunge: [32, -28], landFrame: 40,
      hits: [{ f: [40, 43], every: ONCE, shape: 'circle', range: 5, dmg: 28, kb: 'blow', force: 14, lift: 8, hitstop: 8, heavy: true, yMax: 4.5, rocks: 12 },
        { f: [41, 41], every: ONCE, dmg: 14, kb: 'blow', force: 11, lift: 4, hitstop: 2, heavy: true,
          proj: { count: 4, spread: 270, speed: 18, life: 26, r: 2, y: 0.9, kind: 'crescent' } }] },
    c6: { frames: 98, cancel: 86, dodgeCancel: 70, steer: 10, lunge: [[4, 14, 0.4]], armor: true,
      hits: [{ f: [36, 36], every: ONCE, shape: 'circle', range: 7.5, dmg: 16, kb: 'blow', force: 12, lift: 4, hitstop: 8, heavy: true, roar: true },
        { f: [38, 38], every: ONCE, dmg: 18, kb: 'blow', force: 12, lift: 5, hitstop: 3, heavy: true,
          proj: { count: 14, spread: 360, speed: 20, life: 30, r: 2, y: 0.9, kind: 'roar' } }] },

    dash: { frames: 66, cancel: 58, dodgeCancel: 40, steer: 3, lunge: [[0, 38, 6.4, 'lin'], [38, 48, 1.6]],
      hits: [{ f: [4, 36], every: 8, shape: 'arc', range: 2.3, ang: 130, dmg: 9, kb: 'push', force: 7, hitstop: 3 },
        { f: [44, 47], every: ONCE, shape: 'circle', range: 3.3, dmg: 20, kb: 'blow', force: 12, lift: 4, hitstop: 6, heavy: true }] },
    jatk: { frames: 22, air: true, hover: 2.55, next: 'ja2', charge: 'jc', cancel: 11, dodgeCancel: 99, steer: 4,
      hits: [{ f: [6, 9], sweep: 1, shape: 'arc', range: 2.9, ang: 144, dmg: 12, kb: 'flinch', force: 3.2, hitstop: 3, yMax: 4.5 }] },
    ja2: { frames: 26, air: true, hover: 2.3, next: 'ja3', charge: 'jc', cancel: 14, dodgeCancel: 99, steer: 4,
      hits: [{ f: [8, 11], sweep: -1, shape: 'arc', range: 2.95, ang: 168, dmg: 13, kb: 'push', force: 6, hitstop: 3, yMax: 4.5 }] },
    ja3: { frames: 33, air: true, hover: 1.6, next: 'jatk', charge: 'jc', cancel: 21, dodgeCancel: 99, steer: 4,
      hits: [{ f: [12, 15], every: ONCE, shape: 'circle', range: 3.3, dmg: 21, kb: 'blow', force: 11, lift: 2.5, hitstop: 6, yMax: 5 }] },
    // (jc: his own hang / landing timing — anims/locomotion.js reads the kit's jc for the squash and glow)
    jc: { frames: 60, air: true, hover: 3, landFrame: 37, hang: [6, 33], plunge: [33, -82], cancel: 54, dodgeCancel: 42, steer: 12, armor: true,
      hits: [{ f: [37, 40], every: ONCE, shape: 'circle', range: 5, dmg: 26, kb: 'launch', force: 6, lift: 9, hitstop: 8, heavy: true, rocks: 10 }] },
  };
}

export const entry = { n2: 'n1', n3: 'n2', n4: 'n3', n5: 'n4', n6: 'n5', c2: 'n1', c3: 'n2', c4: 'n3', c5: 'n4', c6: 'n5', ja2: 'jatk', ja3: 'ja2' };
// run: the right sword trailing low behind, the left in the natural grip (reversed along the forearm) swinging free;
// roll: both tucked in
export const carry = {
  run: { spear: [-0.3, 0.96, -0.06, 180, -28, 90], gripR: 0, gripL: 0, lfree: 1, armL: [10, 0, 14, 60] },
  roll: { spear: [-0.18, 0.9, 0.02, 180, -10, 90], gripR: 0, gripL: 0, lfree: 1, armL: [-40, 0, 20, 100] },
};

// ---------------------------------------------------------------- key builder
const D = Math.PI / 180, UA = 0.29, FA = 0.27;             // rig.js DIM upper / fore
const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _m = new THREE.Matrix4(), _t = new THREE.Matrix4();
const _v = new THREE.Vector3(), _h = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const eul = (a) => _e.set(a[0] * D, a[1] * D, a[2] * D);
/** Chest frame (root space) of body spec s: the rig's hips → spine (0.06 up) → chest (0.2 up) chain. */
function chestOf(s) {
  s = { ...STANCE, ...s };
  _m.makeRotationFromEuler(eul(s.hipsR)).setPosition(s.hips[0], s.hips[1], s.hips[2]);
  _m.multiply(_t.makeRotationFromEuler(eul(s.spine)).setPosition(0, 0.06, 0));
  return _m.multiply(_t.makeRotationFromEuler(eul(s.chest)).setPosition(0, 0.2, 0));
}
/** armL° (rig FK: chest-space shoulder YXZ + elbow) putting the left fist at `off` (root m from the shoulder): the shortest
 *  turn from the hanging arm, elbow bent to the distance; tw° swings the elbow round the shoulder-fist line. */
function armFor(M, off, tw) {
  _q.setFromRotationMatrix(M).invert();
  _v.set(off[0], off[1], off[2]).applyQuaternion(_q);
  const d = Math.min(0.55, Math.max(0.1, _v.length()));
  const e = Math.acos(Math.min(1, Math.max(-1, (d * d - UA * UA - FA * FA) / (2 * UA * FA))));
  _h.set(0, -(UA + FA * Math.cos(e)), FA * Math.sin(e)).normalize();
  _q2.setFromUnitVectors(_h, _v.normalize());
  if (tw) _q2.premultiply(_q.setFromAxisAngle(_v, tw * D));
  _e.setFromQuaternion(_q2, 'YXZ');
  return [_e.x / D, _e.y / D, _e.z / D, e / D];
}
const mx = (r) => [-r[0], r[1], r[2]], mb = (b) => [-b[0], b[1], -b[2]];   // mirror a fist / a blade to the other side
/** Key spec: body spec + the right fist at r (root m from the right shoulder) holding the blade rb = [yaw, elev, roll]°,
 *  the left fist at l with the blade lb (default: the right's mirror), left elbow twist tw°. */
function K(body, r, rb, l = mx(r), lb = mb(rb), tw = 0) {
  const M = chestOf(body), s = _h.set(-0.235, 0.2, -0.01).applyMatrix4(M);
  return { ...body, spear: [s.x + r[0], s.y + r[1], s.z + r[2], ...rb], gripR: 0, gripL: 0, lfree: 1, armL: armFor(M, l, tw), armR: [...lb, 90] };
}

// ---------------------------------------------------------------- bodies
const BODY = (hy = 0, lean = 4, h = 0.86, dz = 0) => ({ hips: [0, h, dz], hipsR: [lean, hy, 0], spine: [lean * 0.8, hy * 0.35, 0], chest: [lean * 0.5, hy * 0.45, 0], head: [2, -hy * 0.2, 0] });
const UPB = (h = 0.92, dz = 0) => ({ hips: [0, h, dz], hipsR: [-6, -2, 0], spine: [-6, 0, 0], chest: [-12, 0, 0], head: [-10, 0, 0] });
const LOW = (h = 0.66, dz = 0.1) => ({ hips: [0, h, dz], hipsR: [24, -4, 0], spine: [14, 0, 0], chest: [10, 0, 0], head: [8, 0, 0] });
// guard: right blade levelled at the foe, the left held low by the hip, tip forward
const GR = [[0.08, -0.26, 0.36], [8, 18, 90], [-0.02, -0.4, 0.12], [-12, -28, -90]];
const G = K(BODY(-14), ...GR);
const AIRF = { fL: [0.22, 0.46, 0.05, -32, 14], fR: [-0.18, 0.26, -0.24, 12, -26] };
const SWITCH = { fL: [0.19, 0.27, 0.26, -8, 10], fR: [-0.23, 0.5, 0.04, -26, -18] };

export function clips(A, M) {
  const { clipF, lungeAt: lz, body, ft, hit } = A;
  const step = (id, f, dz = 0) => ({ fL: [0.18, 0.08, lz(id, f) + 0.56 + dz, 0, 12], fR: [-0.24, 0.08, lz(id, f) - 0.36, 0, -50] });
  const wide = (id, f) => ({ fL: [0.32, 0.08, lz(id, f) + 0.34, 0, 25], fR: [-0.32, 0.08, lz(id, f) - 0.26, 0, -45] });
  const orbitStep = (id, first, last, turn) => {
    const tracks = [];
    for (let f = first; f <= last; f += 3) {
      const phase = (f - first) * Math.PI / 6;
      const leg = (x, offset) => {
        const q = phase + offset, lift = Math.max(0, Math.sin(q));
        return body(id, f, turn(f), [x, 0.08 + lift * 0.12, 0.22 + Math.cos(q) * 0.11, -18 * lift, x > 0 ? 16 : -24]);
      };
      tracks.push(ft(f, leg(0.2, 0), leg(-0.23, Math.PI)));
    }
    return tracks;
  };
  const out = {};
  /** Flat cut across the body by one blade (side +1 = the right blade right → left, −1 = the left blade left → right): the
   *  other blade kept in guard. f = [wind, strike, follow, cancel, end]. */
  const cut = (id, side, [w, s, e, c, F], air) => {
    const S = (r, rb, rest) => (side > 0 ? K(rest.b, r, rb, rest.l, rest.lb) : K(rest.b, rest.r, rest.rb, mx(r), mb(rb)));
    const other = side > 0 ? { l: [0.04, -0.36, 0.06], lb: [-30, -24, -90] } : { r: [-0.04, -0.36, 0.06], rb: [30, -24, 90] };
    const ft0 = (f) => (air ? side > 0 ? SWITCH : AIRF : f === s ? step(id, s) : {});
    return clipF(id, [[0, air ? { ...G, hips: [0, 0.95, 0], ...AIRF } : G],
      [w, { ...S([-0.34, -0.06, -0.12], [-125, 8, 0], { ...other, b: BODY(-40 * side, 6, air ? 0.95 : 0.84) }), ...(air ? AIRF : {}) }, 'out'],
      [s, { ...S([0.04, -0.1, 0.46], [10, 2, 0], { ...other, b: BODY(-6 * side, 8, air ? 0.95 : 0.8, 0.08) }), ...ft0(s) }, 'snap'],
      [e, { ...S([0.42, -0.16, 0.12], [118, -8, 0], { ...other, b: BODY(34 * side, 6, air ? 0.95 : 0.8, 0.1) }), ...(air ? SWITCH : {}) }, 'out'],
      [c, { ...S([0.38, -0.22, 0.14], [108, -16, 0], { ...other, b: BODY(28 * side, 5, air ? 0.95 : 0.82, 0.08) }), ...(air ? SWITCH : {}) }, 'io'],
      [F, air ? { ...G, hips: [0, 0.95, 0.04], ...AIRF } : G]]);
  };
  // N1 right blade right → left · N2 left blade left → right
  { const [s, e] = hit('n1'); out.n1 = cut('n1', 1, [s - 4, s, e + 2, M.n1.cancel, M.n1.frames]); }
  { const [s, e] = hit('n2'); out.n2 = cut('n2', -1, [s - 4, s, e + 2, M.n2.cancel, M.n2.frames]); }
  // N3 both blades raised over the shoulders, cut down and across: the X
  const XUP = (b) => K(b, [0.0, 0.3, 0.02], [-40, 112, 90]);
  const XMID = (b) => K(b, [0.26, -0.12, 0.4], [34, -30, 60], [-0.26, -0.22, 0.4], [-34, -30, -60]);
  const XLOW = (b) => K(b, [0.4, -0.4, 0.16], [72, -48, 60], [-0.4, -0.44, 0.16], [-72, -48, -60]);
  { const [s, e] = hit('n3'), F = M.n3.frames, c = M.n3.cancel;
    out.n3 = clipF('n3', [[0, G],
      [s - 5, XUP(UPB(0.9)), 'out'],
      [s + 1, { ...XMID(BODY(0, 14, 0.78, 0.1)), ...step('n3', s + 1) }, 'snap'],
      [e + 2, XLOW(BODY(0, 18, 0.72, 0.14)), 'out'],
      [c, XLOW(BODY(0, 14, 0.76, 0.12)), 'io'], [F, G]]); }
  // N4 spinning double cut: arms coiled across, then flung wide, one full turn over planted steps
  { const [s, e] = hit('n4'), F = M.n4.frames, c = M.n4.cancel;
    const sp = (f) => 360 * Math.min(1, Math.max(0, (f - s + 2) / (e - s + 4)));
    const WING = (f) => ({ ...K(BODY(0, 4, 0.82, 0.04), [-0.44, -0.1, 0.04], [-92, 2, 0]), spin: sp(f) });
    const keys = [[0, G], [s - 4, K(BODY(-34, 6, 0.8), [0.28, -0.12, 0.22], [96, 0, 0], [-0.26, -0.16, 0.24], [-96, 0, 0]), 'out']];
    for (let f = s - 2; f <= e + 2; f += 3) keys.push([f, WING(f), 'lin']);
    keys.push([c, { ...K(BODY(0, 6, 0.8, 0.04), [-0.4, -0.2, 0.12], [-80, -12, 0]), spin: 360 }, 'io'], [F, { ...G, spin: 360 }]);
    keys.push(...orbitStep('n4', s, e + 2, sp));
    keys.push(ft(F, [0.17, 0.08, 0.3 + lz('n4', F), 0, 15 + 360], [-0.2, 0.08, -0.26 + lz('n4', F), 0, -30 + 360]));
    out.n4 = clipF('n4', keys); }
  // N5 both blades scooped up from low in front
  const SCOOP = (b) => K(b, [0.06, -0.42, 0.24], [-14, -46, 90]);
  const RISE = (b) => K(b, [0.06, 0.28, 0.26], [-12, 78, 90]);
  const OVER = (b) => K(b, [0.02, 0.4, 0.06], [-18, 108, 90]);
  { const [s] = hit('n5'), F = M.n5.frames, c = M.n5.cancel;
    out.n5 = clipF('n5', [[0, G],
      [s - 4, { ...SCOOP(LOW(0.7, 0.06)), ...wide('n5', s - 4) }, 'out'],
      [s + 1, RISE(UPB(0.92, 0.12)), 'snap'],
      [s + 5, OVER(UPB(0.9, 0.1)), 'out'],
      [c, OVER(UPB(0.88, 0.08)), 'io'], [F, G]]); }
  // N6 crouch, leap with the blades crossed overhead, the X cut down on landing
  const CROSSUP = (b) => K(b, [0.12, 0.36, 0.08], [56, 62, 90]);
  { const [s] = hit('n6'), F = M.n6.frames, c = M.n6.cancel, L = M.n6.landFrame;
    const air = (f, y = 0.5) => ({ fL: [0.18, y, lz('n6', f) + 0.24, -30, 15], fR: [-0.18, y - 0.1, lz('n6', f) - 0.14, -20, -30] });
    out.n6 = clipF('n6', [[0, G],
      [9, { ...K(LOW(0.68, 0.02), [-0.18, -0.34, -0.12], [-150, -20, 90]), ...wide('n6', 9) }, 'out'],
      [14, { ...CROSSUP(UPB(1.0, 0.08)), ...air(14) }, 'out'],
      [L - 1, { ...K(UPB(0.96, 0.12), [0.14, 0.3, 0.22], [36, 40, 60]), ...air(L - 1, 0.36) }, 'in'],
      [s, { ...XLOW(LOW(0.6, 0.16)), ...wide('n6', s) }, 'snap'],
      [c, XLOW(LOW(0.66, 0.14)), 'io'], [F, G]]); }

  // C1 十字斬: blades crossed before the face, the X flung open
  const XFACE = (b) => K(b, [0.3, 0.04, 0.3], [-34, 56, 90], [-0.3, -0.02, 0.32], [34, 56, -90]);
  const FLUNG = (b) => K(b, [-0.42, -0.24, 0.12], [-100, -24, 30]);
  { const [s, e] = hit('c1', 0), F = M.c1.frames, c = M.c1.cancel;
    out.c1 = clipF('c1', [[0, G],
      [s - 8, XFACE(BODY(0, 2, 0.8, -0.02)), 'out'],
      [s - 3, XFACE(BODY(0, -2, 0.78, -0.04)), 'io'],
      [e, { ...FLUNG(BODY(0, 12, 0.74, 0.16)), ...step('c1', e, 0.1) }, 'snap'],
      [c, FLUNG(BODY(0, 10, 0.78, 0.14)), 'io'], [F, G]]); }
  // C2 twin scoop launcher
  { const [s, e] = hit('c2'), F = M.c2.frames, c = M.c2.cancel;
    out.c2 = clipF('c2', [[0, G],
      [s - 4, { ...SCOOP(LOW(0.62, 0.04)), ...wide('c2', s - 4) }, 'out'],
      [e, { ...RISE(UPB(1.0, 0.18)), fL: [0.2, 0.14, lz('c2', e) + 0.3, -30, 12] }, 'snap'],
      [e + 6, OVER(UPB(0.96, 0.12)), 'out'],
      [c, OVER(UPB(0.9, 0.1)), 'io'], [F, G]]); }
  // C3 spinning drill: four turns carried through the crowd, blades angled forward, a bursting last cut
  { const [s, e] = hit('c3', 0), [s2] = hit('c3', 1), F = M.c3.frames, c = M.c3.cancel;
    const sp = (f) => 1440 * Math.min(1, Math.max(0, (f - s) / (e - s)));
    const DRILL = (f) => ({ ...K(BODY(0, 16, 0.78, 0.1), [-0.36, -0.12, 0.28], [-52, 4, 0]), spin: sp(f) });
    const keys = [[0, G], [s - 3, K(BODY(-30, 10, 0.78, 0.06), [0.26, -0.14, 0.22], [96, 0, 0], [-0.24, -0.18, 0.24], [-96, 0, 0]), 'out']];
    for (let f = s; f <= e; f += 3) keys.push([f, DRILL(f), 'lin']);
    keys.push([s2 - 4, { ...K(BODY(0, 6, 0.84, 0.06), [0.28, -0.12, 0.22], [96, 0, 0], [-0.26, -0.16, 0.24], [-96, 0, 0]), spin: 1440 }, 'io'],
      [s2 + 1, { ...K(BODY(0, 10, 0.76, 0.12), [-0.44, -0.12, 0.12], [-96, 6, 0]), spin: 1440, ...wide('c3', s2 + 1) }, 'snap'],
      [c, { ...K(BODY(0, 8, 0.8, 0.1), [-0.42, -0.2, 0.14], [-84, -10, 0]), spin: 1440 }, 'io'], [F, { ...G, spin: 1440 }]);
    keys.push(...orbitStep('c3', s, e, sp));
    out.c3 = clipF('c3', keys); }
  // C4 twin thrusts, alternating right / left, then both together
  const TR = (b) => K(b, [0.16, -0.1, 0.48], [3, 2, 90], [-0.02, -0.22, 0.04], [-6, 6, -90]);
  const TL = (b) => K(b, [0.02, -0.2, 0.04], [6, 6, 90], [-0.16, -0.12, 0.48], [-3, 2, -90]);
  { const [s, e] = hit('c4', 0), [s2] = hit('c4', 1), F = M.c4.frames, c = M.c4.cancel;
    const keys = [[0, G], [s - 4, K(BODY(0, 6, 0.8, -0.04), [0.02, -0.2, 0.02], [6, 6, 90]), 'out'], ft(s, ...Object.values(step('c4', s)))];
    for (let f = s, k = 0; f < e; f += 4, k++) {
      const y = ((k * 5) % 3 - 1) * 0.06, b = BODY(k & 1 ? -18 : 18, 10, 0.8, 0.12);
      const kf = k & 1 ? TL(b) : TR(b);
      if (k & 1) kf.armL = armFor(chestOf(b), [-0.16, -0.12 + y, 0.48], 0); else kf.spear[1] += y;
      keys.push([f, kf, 'snap'], [f + 2, K(BODY(0, 8, 0.82, 0.1), [0.02, -0.2, 0.06], [6, 6, 90]), 'in']);
    }
    keys.push([s2 - 5, K(BODY(0, 4, 0.82, -0.04), [0.0, -0.18, -0.04], [8, 8, 90]), 'out'],
      [s2, { ...K(BODY(0, 14, 0.72, 0.3), [0.14, -0.1, 0.48], [4, 0, 90]), ...step('c4', s2, 0.1) }, 'snap'],
      [c, K(BODY(0, 12, 0.76, 0.26), [0.14, -0.14, 0.46], [4, -4, 90]), 'io'], [F, G]);
    out.c4 = clipF('c4', keys); }
  // C5 leap, blades raised crossed, both driven down crossed into the ground
  const PLANT = (b) => K(b, [0.24, -0.4, 0.34], [30, -62, 60]);
  { const [s] = hit('c5', 0), F = M.c5.frames, c = M.c5.cancel, L = M.c5.landFrame;
    const air = (f, y = 0.52) => ({ fL: [0.16, y + 0.05, lz('c5', f) + 0.3, -24, 11], fR: [-0.22, y - 0.12, lz('c5', f) - 0.22, 16, -23] });
    out.c5 = clipF('c5', [[0, G],
      [12, { ...K(LOW(0.64, 0), [-0.2, -0.3, -0.14], [-150, -20, 90]), ...wide('c5', 12) }, 'out'],
      [18, { ...CROSSUP(UPB(1.04, 0.1)), ...air(18) }, 'out'],
      [L - 3, { ...K(UPB(1.0, 0.16), [0.16, 0.24, 0.3], [24, 10, 60]), ...air(L - 3, 0.4) }, 'in'],
      [s, { ...PLANT(LOW(0.56, 0.16)), ...wide('c5', s) }, 'snap'],
      [c, PLANT(LOW(0.62, 0.14)), 'io'], [F, G]]); }
  // C6 仁德: the swords raised crossed to heaven, then spread wide, chest open
  const HEAVEN = (b) => K(b, [0.14, 0.4, 0.06], [52, 74, 90]);
  const OPEN = (b) => K(b, [-0.44, -0.06, 0.1], [-100, 22, 0]);
  { const [r] = hit('c6', 0), F = M.c6.frames, c = M.c6.cancel;
    out.c6 = clipF('c6', [[0, G],
      [12, { ...HEAVEN(UPB(0.9, 0.02)), ...wide('c6', 12) }, 'out'],
      [r - 6, HEAVEN({ ...UPB(0.95, 0.04), chest: [-16, 0, 0], head: [-22, 0, 0] }), 'io'],
      [r, OPEN({ hips: [0, 0.82, 0.04], hipsR: [-6, 0, 0], spine: [-8, 0, 0], chest: [-14, 0, 0], head: [-6, 0, 0] }), 'snap'],
      [r + 24, OPEN({ hips: [0, 0.84, 0.04], hipsR: [-4, 0, 0], spine: [-8, 0, 0], chest: [-16, 0, 0], head: [-10, 0, 0] }), 'io'],
      [c, K(BODY(0, 4, 0.84), [-0.3, -0.26, 0.2], [-60, -20, 60]), 'io'], [F, G]]); }
  // dash: running, both blades swept back low like wings, into a spinning double cut
  { const [s2, e2] = hit('dash', 1), F = M.dash.frames, c = M.dash.cancel;
    const RUN = K(BODY(0, 22, 0.8, 0.12), [-0.12, -0.36, -0.22], [-164, -14, 90]);
    const sp = (f) => 360 * Math.min(1, Math.max(0, (f - s2 + 3) / (e2 - s2 + 5)));
    const keys = [[0, G], [4, RUN, 'out'], [38, { ...RUN, hips: [0, 0.78, 0.14] }]];
    for (let f = 4; f < 39; f += 2) {
      const phase = (f - 4) * Math.PI / 5;
      const stride = (x, offset) => {
        const q = phase + offset, swing = Math.cos(q);
        return [x, 0.08 + 0.15 * Math.max(0, swing), lz('dash', f) + 0.22 + 0.38 * Math.sin(q), -18 * swing, x > 0 ? 12 : -20];
      };
      keys.push(ft(f, stride(0.18, 0), stride(-0.22, Math.PI)));
    }
    keys.push([s2 - 4, K(BODY(-34, 8, 0.8, 0.06), [0.28, -0.12, 0.22], [96, 0, 0], [-0.26, -0.16, 0.24], [-96, 0, 0]), 'in']);
    for (let f = s2 - 2; f <= e2 + 3; f += 3) keys.push([f, { ...K(BODY(0, 4, 0.8, 0.04), [-0.44, -0.1, 0.04], [-92, 2, 0]), spin: sp(f) }, 'lin']);
    keys.push([c, { ...K(BODY(0, 6, 0.82, 0.04), [-0.4, -0.2, 0.12], [-80, -12, 0]), spin: 360 }, 'io'], [F, { ...G, spin: 360 }]);
    keys.push(...orbitStep('dash', s2, e2 + 3, sp));
    out.dash = clipF('dash', keys); }
  // air string: right cut · left cut · the falling X
  { const [s, e] = hit('jatk'); out.jatk = cut('jatk', 1, [s - 3, s, e + 1, M.jatk.cancel, M.jatk.frames], true); }
  { const [s, e] = hit('ja2'); out.ja2 = cut('ja2', -1, [s - 3, s, e + 1, M.ja2.cancel, M.ja2.frames], true); }
  { const [s] = hit('ja3'), F = M.ja3.frames;
    out.ja3 = clipF('ja3', [[0, { ...G, hips: [0, 0.95, 0.04], ...AIRF }],
      [s - 3, { ...XUP(UPB(0.98)), ...AIRF }, 'out'],
      [s, { ...XMID(BODY(0, 16, 0.94, 0.1)), ...SWITCH }, 'snap'],
      [F, { ...XLOW(BODY(0, 16, 0.94, 0.12)), ...SWITCH }]]); }
  // jump charge: blades crossed overhead through the hang, the plunge, the X cut landing
  { const L = M.jc.landFrame, F = M.jc.frames, Dn = M.jc.plunge[0], c = M.jc.cancel;
    const air = (phase) => ({ fL: [0.22, 0.38 + phase * 0.12, 0.12 - phase * 0.18, -28 + phase * 12, 10],
      fR: [-0.18, 0.26 + phase * 0.06, -0.24 + phase * 0.28, 14 - phase * 8, -20] });
    const land = { ...XLOW(LOW(0.6, 0.1)), fL: [0.18, 0.08, 0.12, 0, 8], fR: [-0.26, 0.08, 0.43, 0, -12] };
    out.jc = clipF('jc', [[0, { ...G, hips: [0, 0.95, 0], ...air(0) }],
      [5, { ...CROSSUP(UPB(1.0, 0.04)), ...air(0.6) }, 'out'],
      [Dn - 1, { ...CROSSUP(UPB(1.0, 0.04)), ...air(1) }],
      [L - 1, { ...K(UPB(0.96, 0.14), [0.14, 0.24, 0.28], [30, 20, 60]), ...SWITCH }, 'in'],
      [L, land, 'snap'],
      [c, { ...land, ...XLOW(LOW(0.62, 0.12)) }, 'io'], [F, G]]); }

  // locomotion: at ease — the right sword angled down before him, the left low at his side, tip back
  const IDLE = { ...K({ hips: [0, 0.88, 0], hipsR: [2, -10, 0], spine: [2, -2, 0], chest: [-2, -2, 0], head: [-2, 4, 0] },
    [0.04, -0.44, 0.16], [4, -36, 90], [0.02, -0.48, 0.02], [18, -64, -90]), footL: [0.2, 0.08, 0.18, 0, 18], footR: [-0.22, 0.08, -0.14, 0, -26] };
  const WINGS = (b, y = -0.1) => K(b, [-0.36, y, -0.06], [-120, -10, 90]);
  Object.assign(out, locoClips({
    idle: IDLE,
    breath: { hips: [0, 0.872, 0], chest: [-4, -2, 0], head: [-4, 4, 0] },
    takeoff: K(BODY(-6, 9, 0.9, 0.04), [0.08, -0.24, 0.28], [10, 28, 80]),
    apex: K(BODY(10, -2, 0.96, 0.015), [0.12, 0.08, 0.27], [-20, 48, 70]),
    fall: K(BODY(-12, 8, 0.92, 0.06), [0.22, -0.14, 0.31], [32, 12, 60]),
    land: { ...XLOW(LOW(0.64, 0.08)), footL: [0.18, 0.08, 0.12, 0, 8], footR: [-0.26, 0.08, 0.43, 0, -12] },
    hurt: { ...K({ hips: [0.015, 0.8, -0.1], hipsR: [-8, 12, -4], spine: [-4, 9, 0], chest: [-7, 11, -3], head: [-10, -8, -2] },
      [0.18, -0.05, 0.27], [-36, 35, 70], [-0.15, -0.05, 0.29], [36, 29, -70]), footL: [0.18, 0.08, 0.05, 0, 8], footR: [-0.24, 0.08, -0.42, 0, -14] },
  }));
  return out;
}

// ---------------------------------------------------------------- 真・無雙 昭烈・雙龍斬 (musou/scripted.js)
const MU = (dmg, kb, force, lift, extra) => ({ shape: 'circle', range: 5, dmg, kb, force, lift, hitstop: 0, yMax: 5, ...extra });
const XWAVE = (dmg, r, speed) => ({ dmg, kb: 'blow', force: 11, lift: 4, hitstop: 0, heavy: true, proj: { count: 2, spread: 6, speed, life: 28, r, y: 1.1, kind: 'wind' } });
export const musou = {
  act: K(UPB(0.9), [0.3, 0.04, 0.3], [-34, 56, 90], [-0.3, -0.02, 0.32], [34, 56, -90]),
  act2: K({ ...UPB(0.9), chest: [-16, 0, 0], head: [-18, 0, 0] }, [-0.44, -0.06, 0.1], [-100, 22, 0]),
  face: K({ hips: [0, 0.9, 0], hipsR: [0, -20, 0], spine: [2, -6, 0], chest: [-4, -6, 0], head: [-4, -16, 0] },
    [0.3, 0.1, 0.26], [-30, 62, 90], [-0.3, 0.04, 0.28], [30, 62, -90]),
  ready: K(LOW(0.7, 0), [-0.2, -0.3, -0.14], [-150, -20, 90]),
  // X wind blade (100-112) · rush (112-130) · CONTACT: the X cut (130-132), the dragons leave the blades · the drill through
  // the line (132-156) · twin thrust (156-166, the dragons ahead) · the leap (166-176) · FINISHER: the X slam (c5's landing)
  seq: [[100, 112, 'c1', 0.12, 0.36], [112, 130, 'dash', 0.05, 0.55], [130, 132, 'n3', 0.28, 0.36], [132, 156, 'c3', 0.12, 0.66],
    [156, 166, 'c4', 0.64, 0.76], [166, 176, 'c5', 0.14, 0.4]],
  fin: ['c5', 0.43, 0.66],
  travel: [[112, 130, 6.5], [132, 156, 3.5], [156, 162, 1.0]],
  hits: [[104, MU(10, 'blow', 12, 4, { range: 7, heavy: true, hitstop: 4 })],
    [114, MU(10, 'push', 8, 2, { shape: 'arc', range: 2.6, ang: 140 }), 0, 3, 130],
    [132, MU(16, 'blow', 11, 4, { shape: 'arc', range: 4, ang: 160, heavy: true, hitstop: 3 })],
    [134, MU(7, 'flinch', 3, 1, { range: 3.4 }), 0, 3, 156],
    [140, MU(12, 'blow', 12, 5, { shape: 'line', len: 16, width: 5, heavy: true })],
    [150, MU(12, 'blow', 12, 6, { shape: 'line', len: 16, width: 5, heavy: true })],
    [160, MU(30, 'blow', 16, 6, { shape: 'line', len: 11, width: 4.4, heavy: true })]],
  proj: [[104, XWAVE(10, 2.4, 24)], [160, XWAVE(14, 3, 28)]],
  fx: [[104, 'aura', 5], [132, 'beams', 8], [160, 'beams', 10]],
  finFx: [['slam', 12], ['rocks', 10], ['roar', 12]],
  finProj: [{ dmg: 14, kb: 'blow', force: 12, lift: 5, hitstop: 0, heavy: true, proj: { count: 4, spread: 270, speed: 26, life: 30, r: 3, y: 0.9, kind: 'crescent' } }],
};
