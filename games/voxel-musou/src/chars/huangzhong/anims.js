// Huang Zhong's clips: attack clips per move id (moves.js), bow carry for the shared locomotion clips, run / roll poses,
// aim and Musou clips. Rig bow mode (src/hero/rig.js header): the weapon joint = the bow, origin at the grip (left
// hand, gripL 0), +Z = the arrow line, limbs along local ±Y; the right hand draws along the line (gripR = −draw) or
// swings free (rfree 1, armR FK: rx + = back, rz + = out, elbow bend).
// Keys are authored in move frames: [frame, spec, ease] → clip time frame / frames (mono clips: holds never drift).
// Shots release on the frame the move's shot fires (moves.js): the key before it is the full draw, the key on it the
// loose (string hand flung back, bow hand kicked by the recoil) — the snap reads because the draw holds 2–4 sf first.
// Slashes: blade(grip, U, F) points the upper limb (the blade) along U with its edge facing F, so the cuts are authored
// as where the blade points, not as euler angles; the left hand swings it, the right arm counterbalances.
import { P, clip, STANCE, CH } from '../../hero/rig.js';
import { LOCO_CLIPS, runPose as spearRun, rollPose as spearRoll } from '../../hero/anims/locomotion.js';
import { MOVES } from './moves.js';

const D2R = Math.PI / 180;
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Bow channel whose upper limb points along U with the limb's front (blade edge, local +Z) toward F (orthogonalised):
 *  R = Ry(yaw)·Rx(−elev)·Rz(roll) → local Z = F gives yaw/elev, local Y = U gives the roll. */
function blade(grip, U, F) {
  U = norm(U); F = norm(F); const k = dot(F, U); F = norm([F[0] - U[0] * k, F[1] - U[1] * k, F[2] - U[2] * k]);
  const yaw = Math.atan2(F[0], F[2]), e = Math.asin(Math.max(-1, Math.min(1, F[1])));
  const cy = Math.cos(yaw), sy = Math.sin(yaw), ce = Math.cos(e), se = Math.sin(e);
  const X1 = [cy, 0, -sy], Y1 = [-sy * se, ce, -cy * se];            // Ry·Rx(−e) applied to local X / Y
  const roll = Math.atan2(-dot(U, X1), dot(U, Y1));
  return [grip[0], grip[1], grip[2], yaw / D2R, e / D2R, roll / D2R];
}

// ---------------------------------------------------------------- stance, draw and loose
// The veteran's ready stance: a slight stoop, bow low in the left hand across the front, the right hand free near an
// arrow at the hip.
const HZ = { ...STANCE, hips: [0, 0.88, 0], hipsR: [2, -18, 0], spine: [8, 2, 0], chest: [6, 4, 0], head: [2, 8, 0],
  footL: [0.17, 0.08, 0.3, 0, 12], footR: [-0.2, 0.08, -0.24, 0, -28],
  spear: blade([0.28, 1.0, 0.3], [0.15, 0.85, 0.35], [0.2, -0.3, 1]), gripR: -0.3, gripL: 0, lfree: 0, rfree: 1, armR: [-8, 0, 12, 34] };
const H = (spec = {}) => P(spec, HZ);

/**
 * Archer's draw: body side-on (torso ≈ 74° right of the arrow), left arm straight at the target, the right hand pulls
 * the string back along the arrow line: d 0 = nocked at the bow, 1 = full draw at the jaw. e = elevation (°), turn =
 * arrow heading off his facing (°), low = crouch (m), cant = bow tilt (°).
 */
function draw(d, { e = 0, turn = 0, low = 0, cant = 12, ...extra } = {}) {
  const T = (-74 + turn) * D2R, sy = 1.32 - low * 0.9;
  const S = [0.235 * Math.cos(T), sy, -0.235 * Math.sin(T)];          // left shoulder (root space)
  const ty = turn * D2R, er = e * D2R, D = [Math.sin(ty) * Math.cos(er), Math.sin(er), Math.cos(ty) * Math.cos(er)];
  const L = 0.5;
  return { hips: [0, 0.86 - low, 0.02], hipsR: [4 + low * 30, -60 + turn, 0], spine: [4 + low * 20, -6, 0], chest: [2 - e * 0.25, -8, 0],
    head: [-e * 0.8, turn, 0], footL: [0.22, 0.08, 0.34, 0, 22], footR: [-0.24, 0.08, -0.3, 0, -62],
    spear: [S[0] + D[0] * L, S[1] + D[1] * L, S[2] + D[2] * L, turn, e, cant], gripL: 0, gripR: -(0.16 + 0.5 * d), rfree: 0, ...extra };
}
/** The loose: string hand flung back and out, bow hand kicked up a few degrees, torso rocks back. */
const loose = (o = {}) => draw(0, { ...o, e: (o.e || 0) + 4, rfree: 1, armR: [42, 0, 64, 18], hips: [0, 0.86 - (o.low || 0), -0.03] });

// ---------------------------------------------------------------- attack clips
/** Frame-keyed clip for move id: keys [frame, spec, ease]. */
const M = (id, keys) => clip(keys.map(([f, s, e]) => [Math.min(1, f / MOVES[id].frames), H(s), e]), false, true);
/** Torso twist by T degrees over the hips/spine/chest (+ = left), head kept on the target. */
const tw = (T, extra) => ({ hipsR: [6, T * 0.55, 0], spine: [6, T * 0.2, 0], chest: [4, T * 0.25, 0], head: [2, T * 0.2, 0], ...extra });
const WIDE = { footL: [0.26, 0.08, 0.4, 0, 20], footR: [-0.26, 0.08, -0.3, 0, -45] };
const shotKeys = (f, o, pre = 3) => [[f - pre, draw(1, o), 'out'], [f - 1, draw(1.05, o), 'lin'], [f, loose(o), 'snap']];

const ATTACK = {
  // N1: bow raised high on the left, the upper limb's blade chops down across to the front-right
  n1: M('n1', [
    [0, {}],
    // (fx r2: the limb sweeps across the body — up-left → front-right → low right — instead of straight down the
    // arrow line: that arc lay in the plane of the follow camera and its ribbon read as a straight rod)
    [5, { ...tw(35), ...WIDE, spear: blade([0.34, 1.7, -0.02], [0.62, 0.72, 0.3], [0, 0.2, 1]), armR: [-20, 0, 30, 60] }, 'out'],
    [8, { ...tw(-8), ...WIDE, hips: [0, 0.84, 0.05], spear: blade([0.2, 1.3, 0.5], [-0.35, 0.25, 0.9], [-1, -0.35, 0.1]), armR: [10, 0, 40, 40] }, 'snap'],
    [11, { ...tw(-35), ...WIDE, hips: [0, 0.8, 0.08], spear: blade([0.02, 0.98, 0.42], [-0.8, -0.5, 0.3], [-0.6, 0, -0.8]), armR: [20, 0, 50, 30] }, 'out'],
    [22, { ...tw(-30), ...WIDE, hips: [0, 0.82, 0.08], spear: blade([0.05, 1.0, 0.42], [-0.75, -0.5, 0.35], [-0.6, 0, -0.8]), armR: [14, 0, 44, 36] }, 'io'],
    [34, {}],
  ]),
  // N2: half-turn, a quick draw from the hip and a point-blank loose
  n2: M('n2', [
    [0, {}],
    [6, draw(0.4, { low: 0.06 }), 'out'],
    ...shotKeys(11, { low: 0.08 }, 3),
    [20, loose({ low: 0.08 }), 'io'],
    [34, {}],
  ]),
  // N3: bow drawn across the body to the right, then a flat backhand sweep right → left, the blade edge leading
  n3: M('n3', [
    [0, {}],
    [5, { ...tw(-50), ...WIDE, spear: blade([-0.12, 1.12, 0.28], [-0.9, 0.05, -0.2], [0.1, 0, 1]), armR: [30, 0, 30, 60] }, 'out'],
    [10, { ...tw(0), ...WIDE, hips: [0, 0.8, 0.06], spear: blade([0.24, 1.1, 0.52], [0.15, -0.05, 1], [1, 0, 0]), armR: [10, 0, 50, 30] }, 'snap'],
    [13, { ...tw(45), ...WIDE, hips: [0, 0.8, 0.08], spear: blade([0.42, 1.12, 0.18], [1, -0.05, 0.3], [0.3, 0, -1]), armR: [-10, 0, 60, 30] }, 'out'],
    [21, { ...tw(40), ...WIDE, hips: [0, 0.82, 0.06], spear: blade([0.42, 1.1, 0.16], [1, -0.1, 0.25], [0.3, 0, -1]), armR: [-6, 0, 50, 36] }, 'io'],
    [32, {}],
  ]),
  // N4: pivot, two snap shots either side of centre
  n4: M('n4', [
    [0, {}],
    [7, draw(0.6, { turn: 6 }), 'out'],
    ...shotKeys(13, { turn: 6 }, 3),
    [17, draw(0.5, { turn: -6 }), 'io'],
    ...shotKeys(21, { turn: -6 }, 2),
    [30, loose({ turn: -6 }), 'io'],
    [40, {}],
  ]),
  // N5: bow held out flat on the left, one full whirl over planted feet (spin), rising from the hip to head height
  n5: M('n5', [
    [0, { plant: 1 }],
    [8, { ...tw(-30), ...WIDE, hips: [0, 0.78, 0], spear: blade([0.46, 1.0, 0.2], [1, -0.05, 0.1], [0, 0, 1]), armR: [0, 0, 70, 20], plant: 1 }, 'out'],
    [14, { ...tw(-10), ...WIDE, hips: [0, 0.82, 0], spear: blade([0.5, 1.12, 0.12], [1, 0.1, 0], [0, 0.1, 1]), armR: [0, 0, 75, 16], spin: 150, plant: 1 }, 'lin'],
    [19, { ...tw(0), ...WIDE, hips: [0, 0.86, 0], spear: blade([0.48, 1.36, 0.08], [0.9, 0.4, 0], [0, 0.2, 1]), armR: [0, 0, 70, 20], spin: 360, plant: 1 }, 'out'],
    [30, { ...tw(10), ...WIDE, spear: blade([0.42, 1.34, 0.12], [0.85, 0.5, 0.1], [0, 0.2, 1]), armR: [-10, 0, 50, 30], spin: 360, plant: 1 }, 'io'],
    [42, { spin: 360, plant: 1 }],
  ]),
  // N6: planted, deep full draw, the heavy loose rocks him back
  n6: M('n6', [
    [0, {}],
    [8, draw(0.3, { low: 0.1 }), 'out'],
    [17, draw(0.95, { low: 0.12 }), 'io'],
    ...shotKeys(22, { low: 0.12 }, 3),
    [24, loose({ low: 0.14, hips: [0, 0.72, -0.06] }), 'out'],
    [42, loose({ low: 0.12 }), 'io'],
    [54, {}],
  ]),
  c1: M('c1', [
    [0, {}],
    [6, draw(0.3, { low: 0.06 }), 'out'],
    [12, draw(0.75, { low: 0.08 }), 'io'],
    ...shotKeys(18, { low: 0.1 }, 3),
    [21, loose({ low: 0.12, hips: [0, 0.74, -0.06] }), 'out'],
    [36, loose({ low: 0.1 }), 'io'],
    [50, {}],
  ]),
  c2: M('c2', [
    [0, {}],
    [8, draw(0.6, { e: 24, low: 0.22 }), 'out'],
    ...shotKeys(15, { e: 30, low: 0.24 }, 3),
    [26, draw(0.5, { e: 22, low: 0.05 }), 'io'],
    ...shotKeys(34, { e: 24 }, 3), [38, draw(0.6, { e: 26 }), 'io'],
    ...shotKeys(42, { e: 26 }, 2), [46, draw(0.6, { e: 28 }), 'io'],
    ...shotKeys(50, { e: 28 }, 2),
    [66, loose({ e: 28 }), 'io'],
    [88, {}],
  ]),
  c3: M('c3', [
    [0, {}],
    [8, draw(0.4, { low: 0.08, cant: 40 }), 'out'],
    ...shotKeys(20, { low: 0.12, cant: 60 }, 5),
    [30, loose({ low: 0.12, cant: 60, hips: [0, 0.74, -0.05] }), 'out'],
    [52, loose({ low: 0.1, cant: 50 }), 'io'],
    [64, {}],
  ]),
  // C4: rapid fire, the string hand flicking quiver → string every 5 sf (keys generated on the shot frames)
  c4: M('c4', [
    [0, {}],
    [10, draw(0.5, { low: 0.1 }), 'out'],
    ...Array.from({ length: 12 }, (_, k) => 14 + k * 5).flatMap((f) => [[f - 2, draw(0.85, { low: 0.1 }), 'out'], [f, loose({ low: 0.1, armR: [20, 0, 40, 40] }), 'snap']]),
    ...shotKeys(80, { low: 0.14 }, 6),
    [90, loose({ low: 0.12 }), 'io'],
    [100, {}],
  ]),
  c5: M('c5', [
    [0, {}],
    [10, draw(0.5, { e: 55, low: 0.05 }), 'out'],
    ...shotKeys(22, { e: 70, low: 0.08 }, 5),
    [40, loose({ e: 70, low: 0.06 }), 'io'],
    [70, {}],
  ]),
  c6: M('c6', [
    [0, {}],
    [10, draw(0.5, { e: -4, low: 0.26, footR: [-0.24, 0.3, -0.38, 60, -62] }), 'out'],
    [24, draw(0.95, { e: -9, low: 0.28, footR: [-0.24, 0.3, -0.38, 60, -62] }), 'io'],
    ...shotKeys(28, { e: -9, low: 0.28, footR: [-0.24, 0.3, -0.38, 60, -62] }, 2),
    [48, loose({ e: -9, low: 0.24 }), 'io'],
    [90, {}],
  ]),
  // Dash: feet-first slide on the left hip, bow drawn over the knees, loose, roll up onto the feet
  dash: M('dash', [
    [0, { hips: [0, 0.8, 0.1], hipsR: [18, 0, 0] }],
    [4, draw(0.5, { low: 0.3, hips: [0, 0.52, -0.1], hipsR: [-24, -50, 0], footL: [0.18, 0.12, 0.72, -30, 10], footR: [-0.2, 0.1, 0.2, -10, -30] }), 'out'],
    ...shotKeys(14, { low: 0.3, hips: [0, 0.52, -0.1], hipsR: [-24, -50, 0], footL: [0.18, 0.12, 0.72, -30, 10], footR: [-0.2, 0.1, 0.2, -10, -30] }, 4),
    [26, loose({ low: 0.3, hips: [0, 0.54, -0.08], hipsR: [-20, -50, 0], footL: [0.18, 0.1, 0.62, -20, 10], footR: [-0.2, 0.1, 0.16, -10, -30] }), 'io'],
    [38, { hips: [0, 0.7, 0.05], hipsR: [20, -20, 0], ...WIDE }, 'io'],
    [64, {}],
  ]),
  // Jump attack: tucked in the air, the bow pointed down at the ground ahead
  jatk: M('jatk', [
    [0, draw(0.5, { e: -40, footL: [0.15, 0.4, 0.2, 20, 10], footR: [-0.16, 0.3, -0.06, 30, -15] })],
    ...shotKeys(7, { e: -48, footL: [0.15, 0.42, 0.2, 20, 10], footR: [-0.16, 0.32, -0.06, 30, -15] }, 3),
    [24, loose({ e: -40, footL: [0.15, 0.36, 0.2, 20, 10], footR: [-0.16, 0.28, -0.06, 30, -15] }), 'io'],
  ]),
  // Jump charge: bow drawn straight down at the apex, the fan, then the drop into a landing crouch
  jc: M('jc', [
    [0, { footL: [0.15, 0.36, 0.16, 20, 12], footR: [-0.17, 0.26, -0.12, 30, -15] }],
    [8, draw(0.4, { e: -40, footL: [0.15, 0.44, 0.22, 20, 10], footR: [-0.16, 0.34, -0.06, 30, -15] }), 'out'],
    ...shotKeys(18, { e: -58, footL: [0.15, 0.46, 0.22, 20, 10], footR: [-0.16, 0.36, -0.06, 30, -15] }, 5),
    [30, loose({ e: -50, footL: [0.15, 0.3, 0.16, 20, 10], footR: [-0.16, 0.24, -0.06, 30, -15] }), 'io'],
    [36, { hips: [0, 0.56, 0.06], hipsR: [30, -20, 0], spine: [10, 4, 0], ...WIDE }, 'snap'],
    [44, { hips: [0, 0.62, 0.05], hipsR: [26, -20, 0], ...WIDE }, 'out'],
    [56, {}],
  ]),
  // 瞄準: draw 0 → full at 14, loose at 16, follow-through, back to the nocked pose at 30 (= frame 0: aim.js loops it)
  aim: M('aim', [
    [0, draw(0.12, { low: 0.04 })],
    [14, draw(1, { low: 0.06 }), 'io'],
    [16, loose({ low: 0.06 }), 'snap'],
    [24, loose({ low: 0.05 }), 'io'],
    [30, draw(0.12, { low: 0.04 }), 'io'],
  ]),
};

// ---------------------------------------------------------------- locomotion: the shared clips with the bow carried
// The spear clips' weapon channels are replaced by the bow hanging in the left hand (limbs vertical beside the leg) and
// the right arm swings free.
const CARRY = { spear: blade([0.3, 0.98, 0.12], [0.05, 1, 0.12], [0, 0, 1]), gripL: 0, gripR: -0.3, lfree: 0, rfree: 1 };
const CARRY_P = H(CARRY);
const WPN = [...Array(6).keys()].map((i) => CH.spear + i).concat([CH.gripR, CH.gripL, CH.lfree, CH.rfree]);
function carry(out, armR = [-8, 0, 14, 40]) {
  for (const i of WPN) out[i] = CARRY_P[i];
  out[CH.armR] = armR[0] * D2R; out[CH.armR + 1] = armR[1] * D2R; out[CH.armR + 2] = armR[2] * D2R; out[CH.armR + 3] = armR[3] * D2R;
  return out;
}
const bowify = (c, armR) => ({ ...c, keys: c.keys.map((k) => ({ ...k, p: carry(Float32Array.from(k.p), armR) })) });
const LOCO = {
  idle: clip([[0, H()], [0.5, H({ hips: [0, 0.875, 0.005], chest: [8, 5, 0], spine: [9, 3, 0], armR: [-6, 0, 14, 36] })], [1, H()]], true),
  dodge: bowify(LOCO_CLIPS.dodge, [-60, 0, 20, 90]),
  air: bowify(LOCO_CLIPS.air, [-10, 0, 40, 50]),
  airFall: bowify(LOCO_CLIPS.airFall, [0, 0, 100, 14]),
  land: bowify(LOCO_CLIPS.land, [10, 0, 30, 50]),
  hurt: bowify(LOCO_CLIPS.hurt, [30, 0, 40, 30]),
};

/** Run: the shared procedural cycle (feet, bounce, bank) with the bow in the swinging left hand and the right arm pumping. */
function runPose(phase, k, out, lean) {
  spearRun(phase, k, out, lean);
  const swing = out[CH.armL];                        // the shared cycle's left-arm swing (+ = back)
  carry(out);
  out[CH.spear + 2] -= swing * 0.35; out[CH.spear + 1] += Math.abs(swing) * 0.05;
  out[CH.armR] = -swing * 0.9; out[CH.armR + 2] = 12 * D2R; out[CH.armR + 3] = (80 + 15 * k) * D2R;
  return out;
}
/** Dive roll: the shared roll with the bow tucked against the body. */
function rollPose(u, out) {
  spearRoll(u, out);
  return carry(out, [-70, 0, 16, 100]);
}

// ---------------------------------------------------------------- Musou clips (src/chars/huangzhong/musou.js)
const MU_WIDE = { footL: [0.34, 0.08, 0.36, 0, 25], footR: [-0.34, 0.08, -0.34, 0, -60] };
const MUSOU_CLIPS = {
  // activation: the bow thrust overhead, upright, the free hand clenched — 「老當益壯」
  hz_act: clip([[0, H()], [0.35, H({ hips: [0, 0.92, 0], hipsR: [-2, -10, 0], chest: [-8, -4, 0], head: [-10, -10, 0],
    spear: blade([0.2, 1.95, 0.12], [0, 1, 0], [0, 0, 1]), armR: [-20, 0, 50, 110] }), 'out'],
  [1, H({ hips: [0, 0.93, 0], hipsR: [-2, -10, 0], chest: [-9, -4, 0], head: [-12, -10, 0], spear: blade([0.2, 1.98, 0.12], [0, 1, 0.05], [0, 0, 1]), armR: [-24, 0, 52, 115] })]]),
  // close-up: nocking, a slow half draw toward the camera
  hz_face: clip([[0, H(draw(0.1, { low: 0.04 }))], [1, H(draw(0.45, { low: 0.06 }))]]),
  // the volley: feet planted wide, draw → loose cycle (the sim sweeps his facing through the arc)
  hz_volley: clip([[0, H(draw(0.7, { low: 0.12, ...MU_WIDE }))], [0.5, H(draw(1, { low: 0.12, ...MU_WIDE })), 'out'],
    [0.6, H(loose({ low: 0.12, ...MU_WIDE })), 'snap'], [1, H(draw(0.7, { low: 0.12, ...MU_WIDE })), 'io']], true),
  // the giant arrow: a long, deep full draw, bow canted, then the loose that rocks him back and a held finish
  hz_big: clip([[0, H(draw(0.3, { low: 0.16, ...MU_WIDE }))], [1, H(draw(1.1, { low: 0.2, cant: 4, ...MU_WIDE })), 'io']]),
  hz_fin: clip([[0, H(loose({ low: 0.2, cant: 4, ...MU_WIDE }))], [0.12, H(loose({ low: 0.24, hips: [0, 0.6, -0.1], ...MU_WIDE })), 'snap'],
    [0.7, H(loose({ low: 0.2, ...MU_WIDE })), 'io'], [1, H(), 'io']]),
};

export const HZ_CLIPS = { ...ATTACK, ...LOCO, ...MUSOU_CLIPS };
export { runPose, rollPose };
// sanity: every move has a clip (moves.js ↔ anims.js)
for (const id of Object.keys(MOVES)) if (!ATTACK[id]) console.warn('huangzhong: no clip for', id);
