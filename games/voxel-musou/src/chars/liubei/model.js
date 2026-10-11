// 劉備 玄德 (def-kit model: src/chars/defkit.js header), fine voxels (chars/parts.js FV) on the shared rig. The lord of
// the peach-garden oath: hair gathered in a topknot (束髮) under a small gold crown with a jade gem and a gold pin, two
// green crown ribbons trailing; 雙耳垂肩 — long earlobes hanging to the jaw; a kind but resolute face: level brows,
// gentle eyes, a thin moustache drooping at the ends and a short chin tuft. A green robe patterned with lighter weave,
// its crossed collar (交領) edged in gold over a white inner collar, under light silver-steel lamellar with gold lips:
// cuirass, belly plates, round shoulder guards, thigh tassets and greaves; a gold 護心鏡 with a jade pearl on the chest;
// a gold-brocade waist sash, leather belt with a jade buckle and a jade pendant (玉佩) swinging at the left hip; front and
// back robe panels hanging to the knee (chains), a short green cape with a gold hem and roundel, black boots.
// Weapon: the 雙股劍 — a pair of straight jian: green-wrapped grip, jade-set gold pommel ring and guard, a long steel
// blade with a dark fuller and bright edges, a tassel at each pommel (gold right, jade left). The right sword is the
// weapon joint's; kit.js hangs the second on the left hand (swordGeo, shared geometry).
import { vox, B, P, md, mirX, lamellar } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, glove, bracer, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0xd6a092, skinD: 0xa86e62, skinH: 0xe4b2a4, lip: 0xa0564a, mouth: 0x3a1a14, eye: 0x140c0a, iris: 0x3a2618, scl: 0xefe6d8,
  hair: 0x15100e, hairH: 0x2e2622,
  gold: 0xc79a3c, goldD: 0x7c5a20, goldL: 0xecc466,
  jade: 0x4fae8c, jadeD: 0x2c6e56, jadeL: 0x8ad8b8,
  green: 0x2f6a3c, greenD: 0x1c4426, greenL: 0x4c8c58,
  steel: 0x6c7684, steelD: 0x434a56, cloth: 0xebe3d1, clothD: 0xbdb29a,
  leather: 0x4a3426, leatherL: 0x6a4c36, boot: 0x1e1a18, bootD: 0x121010,
  grip: 0x1d4a2c, gripD: 0x0f2818, blade: 0xc4ced8, edge: 0xf4f8fc, fuller: 0x76808e,
};
const robe = (x, y, z) => (md(x * 2 + y + z * 3, 13) === 0 ? C.greenL : md(x - y * 2 + z, 9) === 0 ? C.greenD : C.green);
/** Gold brocade band: a running cloud-scroll of light and dark gold. */
const brocade = (x, y, z) => (md(x + z + (y & 1) * 2, 4) === 0 ? C.goldD : md(x - z + y, 5) === 0 ? C.goldL : C.gold);

// ---------------------------------------------------------------- body (FV, centred on the joints)
function torso() {
  const T = {};
  // hips: robe skirt (sides only below the belt — the front and back panels are chains), belt, jade buckle
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.greenD),
    B([-14, -15, -10], [14, -1, 10], (x, y, z) => {
      if (Math.abs(z) > 5 && y < -5) return null;                         // parted front and back: the thighs stride free
      return y === -15 ? C.gold : y === -14 ? C.goldD : robe(x, y, z);
    }),
    B([-14, -1, -10], [14, 5, 10], (x, y, z) => (y === -1 || y === 4 ? C.goldD : y === 1 && md(x + z, 4) === 0 ? C.goldL : C.leather)),
    B([-4, -2, 10], [5, 6, 12], (x, y) => (y === -2 || y === 5 ? C.goldD : C.gold)),     // buckle plate
    B([-2, 0, 12], [3, 4, 13], C.jade), P([-1, 1, 12], [2, 3, 13], C.jadeL),              // jade inset
  ];
  // waist: belly lamellar over the robe, the gold brocade sash under the cuirass
  T.spine = [
    B([-11, -6, -9], [11, 14, 9], robe),
    ...lamellar([-11, -4, -9], [11, 9, 9], { base: C.steel, rowH: 2, pw: 3, trim: C.gold }),
    B([-12, 9, -10], [12, 13, 10], (x, y, z) => (y === 9 || y === 12 ? C.goldD : brocade(x, y, z))),
  ];
  // chest: light steel lamellar cuirass (gold lips), the gold mirror with a jade pearl, gold shoulder straps, the crossed
  // collar standing round the neck (green, gold-edged, over the white inner collar: the left panel over the right)
  const disc = [];
  for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
    const r = Math.hypot(x, y);
    if (r > 5.2) continue;
    disc.push(B([x, y + 9, 12], [x + 1, y + 10, r < 2.2 ? 15 : 14], r < 2.2 ? (r < 1 ? C.jadeL : C.jade) : r > 4.3 ? C.goldD : hash01(x, y, 3) < 0.25 ? C.goldL : C.gold));
  }
  const collar = (x, y, z) => {
    if (z < 6) return y === 20 ? C.goldL : C.green;                       // back and sides: a plain standing collar
    const d = x + (y - 15) * 0.9;                                         // the left panel's edge runs down to his right
    if (y >= 15 && x > -(y - 14) && x < y - 14 && d < 3) return C.cloth;  // the white inner collar in the V
    return Math.abs(d - 3) < 1.2 ? C.gold : C.green;
  };
  T.chest = [
    B([-15, -4, -11], [15, 18, 11], robe),
    ...lamellar([-14, -3, -11], [14, 5, 11], { base: C.steel, rowH: 2, pw: 3 }),
    ...lamellar([-15, 5, -12], [15, 15, 12], { base: C.steel, rowH: 3, pw: 4, trim: C.gold }),
    ...disc,
    ...[-1, 1].flatMap((sx) => [mirX(B([9, 14, -13], [13, 17, 13], C.gold), sx), mirX(B([10, 15, -14], [12, 16, 14], C.goldD, true), sx)]),
    B([-9, 15, -9], [9, 21, 9], collar),
    B([-6, 15, -6], [6, 25, 6], -1),                                      // neck hole
  ];
  T.neck = [B([-5, -2, -5], [5, 6, 5], C.skinD), P([-5, 1, 4], [5, 6, 5], C.skin)];
  return T;
}

function limbs(T) {
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    // wide robe sleeves banded in gold at the elbow, a light lamellar arm guard over the outside
    T['upperArm' + s] = [
      B([-6, -24, -6], [6, 2, 6], robe), B([-7, -21, -7], [7, -11, 7], robe),
      B([-7, -24, -7], [7, -21, 7], (x, y, z) => (y === -22 ? C.goldL : brocade(x, y, z))),
      ...lamellar([2, -11, -5], [7, -3, 5], { base: C.steel, rowH: 2, pw: 3, trim: C.gold, lipZ: false }).map((b) => mirX(b, sx)),
    ];
    T['foreArm' + s] = bracer(C.greenD, [C.steel, C.steelD, C.gold]);
    T['hand' + s] = glove(sx, C.leather, C.leatherL);
    // dark green trousers, light steel tassets over the outside of the thigh
    T['thigh' + s] = [
      B([-7, -36, -7], [7, 2, 7], (x, y) => (md(y + (x & 1), 6) === 0 ? C.greenD : C.green)),
      B([-8, -31, -8], [8, -20, 8], (x, y) => (md(y - x, 5) === 0 ? C.greenD : C.green)),
      ...lamellar([-4, -16, -7], [9, 0, 8], { base: C.steel, rowH: 2, pw: 3, trim: C.gold, jag: true }).map((b) => mirX(b, sx)),
    ];
    // black boots to the knee (gold top band), a steel greave and a gold knee cop
    T['shin' + s] = [
      B([-6, -34, -6], [6, 0, 6], C.boot),
      B([-7, -7, -7], [7, 2, 7], C.green), B([-7, -9, -7], [7, -7, 7], C.gold),
      ...lamellar([-6, -28, 3], [6, -10, 7], { base: C.steel, rowH: 3, pw: 3 }),
      B([-2, -9, 6], [2, 0, 9], (x, y) => (y === -9 ? C.goldD : C.gold)),
      B([-7, -34, -7], [7, -32, 7], C.bootD),
    ];
    T['foot' + s] = boot(C.boot, C.bootD, C.bootD, { trim: C.gold });
  }
  return T;
}

/** Round shoulder guards: light steel lamellar rows with a gold lip under a gold cap. Authored with +x outward. */
const pauldron = (sx) => [
  ...lamellar([-2, -3, -7], [7, 4, 7], { base: C.steel, rowH: 3, pw: 4, trim: C.gold, jag: true }),
  B([-3, 4, -7], [7, 6, 7], (x, y, z) => (y === 5 ? (md(x + z, 3) ? C.gold : C.goldL) : brocade(x, y, z))),
].map((b) => mirX(b, sx));

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  const hair = (x, y, z) => (md(x * 3 + z + y * 2, 7) === 0 ? C.hairH : C.hair);
  return [
    // skull, a narrow refined jaw, cheeks
    B([-6, 3, -6], [7, 14, 6], C.skin),
    B([-5, 0, -4], [6, 3, 5], C.skin), B([-6, 2, -5], [7, 5, 6], C.skin),
    ...symH(4, 6, 4, 6, 5, 6, C.skinH),
    // hair: over the crown, down the back to the nape, a clean hairline over the forehead and temples, short sideburns
    B([-7, 3, -7], [8, 15, 6], (x, y, z) => {
      if (z >= 4 && y < 12) return null;                                  // forehead
      if (Math.abs(x) >= 6 && z > -3 && y < 9) return null;               // the ears show
      if (z > -2 && y < 8 && Math.abs(x) < 6) return null;                // (face)
      return hair(x, y, z);
    }),
    ...symH(6, 7, 6, 10, 2, 4, C.hair, false),                            // sideburns
    // topknot and the gold crown (冠): a band round the knot, a front plate with a jade gem, the pin through it
    B([-2, 15, -3], [3, 20, 2], hair),
    B([-3, 15, -4], [4, 18, 3], (x, y) => (y === 17 ? C.goldL : C.gold)),
    B([-2, 15, 3], [3, 20, 4], (x, y) => (y === 19 ? C.goldL : C.gold)), P([0, 16, 3], [1, 18, 4], C.jade),
    B([-6, 18, -1], [7, 19, 0], C.goldL), B([-7, 18, -2], [-6, 20, 1], C.gold), B([6, 18, -2], [7, 20, 1], C.gold),
    // 雙耳垂肩: long ears whose lobes hang down to the jaw, dark in the bowl
    ...symH(7, 8, 3, 11, -1, 2, C.skin, false), ...symH(7, 9, -1, 4, -1, 2, C.skin, false), ...symH(7, 8, 5, 10, 0, 1, C.skinD),
    // level brows, gentle eyes (white, a dark iris toward the nose, the upper lid), the brow ridge shade
    ...symH(1, 6, 10, 11, 5, 7, C.hair, false), ...symH(5, 6, 11, 12, 5, 7, C.hair, false),
    ...symH(2, 5, 7, 9, 5, 6, C.scl), ...symH(2, 4, 7, 9, 5, 6, C.iris), ...symH(2, 3, 7, 9, 5, 6, C.eye),
    ...symH(2, 5, 9, 10, 5, 6, C.skinD),
    // straight nose, a thin mouth
    B([-1, 6, 6], [2, 9, 8], C.skinH), B([0, 4, 7], [2, 6, 9], C.skin), P([-1, 5, 7], [0, 8, 8], C.skinD),
    B([-1, 4, 7], [0, 6, 8], C.skin), B([2, 4, 7], [3, 6, 8], C.skin),
    P([-2, 2, 5], [3, 3, 6], C.lip), P([-1, 2, 5], [2, 3, 6], C.mouth),
    // thin moustache drooping at the ends, a short chin tuft
    B([-2, 3, 6], [3, 4, 7], C.hair), B([-3, 2, 6], [-2, 4, 7], C.hair), B([3, 2, 6], [4, 4, 7], C.hair),
    B([-4, 1, 5], [-3, 3, 6], C.hair), B([4, 1, 5], [5, 3, 6], C.hair),
    B([-1, -2, 4], [2, 1, 6], hair), B([0, -3, 4], [1, -2, 5], C.hair),
  ];
}

// ---------------------------------------------------------------- 雙股劍: one jian (shaft +Z, origin = the grip centre)
const SV = 0.01;
/** [{geo, mat}] of one sword: grip (body), gold fittings (metal), the blade (blade). The blade runs z 0.1 … 0.88 m. */
export function swordGeo() {
  const o = { off: [-0.5, -0.5, 0], jitter: 0.04, ao: 0.3 };
  const grip = vox([B([-1, -1, -11], [2, 2, 7], (x, y, z) => (md(z + x - y, 3) ? C.grip : C.gripD))], SV, o);
  const fit = vox([
    B([-2, -2, -15], [3, 3, -11], (x, y, z) => (z === -15 || z === -12 ? C.goldD : C.gold)),     // pommel ring
    P([-1, -2, -14], [2, 3, -12], C.jade),                                                       // jade set in it
    B([-6, -2, 7], [7, 3, 10], (x) => (Math.abs(x) >= 5 ? C.goldL : C.gold)),                   // guard, tips turned up
    B([-6, -3, 8], [-4, -2, 10], C.goldL), B([5, -3, 8], [7, -2, 10], C.goldL),
    P([-1, -2, 7], [2, 3, 10], C.jade),
    B([-4, -1, 10], [5, 2, 13], C.goldD),                                                        // the blade's collar
  ], SV, o);
  const boxes = [];
  for (let z = 13; z < 88; z++) {
    const u = (z - 13) / 75, hw = u < 0.88 ? 3 : Math.max(0, Math.round(3 - (u - 0.88) * 26));
    boxes.push(B([-hw, 0, z], [hw + 1, 1, z + 1], (x) => (Math.abs(x) === hw && hw ? C.edge : x === 0 && u < 0.84 ? C.fuller : C.blade)));
    if (hw > 1) boxes.push(B([-1, -1, z], [2, 2, z + 1], (x) => (x === 0 && u < 0.84 ? C.fuller : C.blade)));   // the ridge
  }
  const blade = vox(boxes, SV, { off: [-0.5, -0.5, 0], jitter: 0.03, ao: 0.2 });
  return [{ geo: grip, mat: 'body' }, { geo: fit, mat: 'metal' }, { geo: blade, mat: 'blade' }];
}

// ---------------------------------------------------------------- chain segments (local −Y along the chain)
const strand = (c, h, d, v, w0 = 1) => (i, n) => {           // silk tassel strands, fraying at the end
  const w = i === 0 ? w0 + 1 : w0, last = i === n - 1;
  return vox([B([-w, -7, -w], [w, 0, w], (x, y, z) => {
    const k = hash01(x + 9, z + 9, 5);
    if (last && -y > 3 + k * 5) return null;
    return k < 0.3 ? h : k > 0.8 ? d : c;
  })], v, { jitter: 0.06, ao: 0.25 });
};
/** Short cape: green, curling toward the body at the edges, a gold roundel high on the back, a gold hem. */
const cape = (i, n) => {
  const w = 6 + i, last = i === n - 1;
  return vox([B([-w, -5, 0], [w, 0, 1], (x, y) => {
    if (last && y === -5 && hash01(x, i, 7) < 0.35) return null;
    if (last && y >= -4 && y <= -3) return y === -4 ? C.gold : C.goldD;
    if (i === 0 && Math.hypot(x + 0.5, y + 2.5) < 2.2) return Math.hypot(x + 0.5, y + 2.5) < 1.2 ? C.jade : C.gold;
    return x === -w || x === w - 1 ? C.greenD : robe(x, y, i);
  }), B([-w, -5, 1], [-w + 1, 0, 2], C.greenD), B([w - 1, -5, 1], [w, 0, 2], C.greenD)], 0.025, { off: [0, 0, -0.5], jitter: 0.05, ao: 0.25 });
};
/** Robe panel (front / back): green, gold-edged, a gold hem. */
const panel = (i, n) => vox([B([-4, -8, 0], [4, 0, 1], (x, y) => (i === n - 1 && y <= -7 ? (y === -8 && x & 1 ? null : C.gold)
  : x === -4 || x === 3 ? C.gold : robe(x, y, i)))], FV * 1.2, { off: [0, 0, -0.5], jitter: 0.05, ao: 0.2 });
const ribbon = (i, n) => vox([B([-1, -6, 0], [1, 0, 1], i === n - 1 ? C.gold : i & 1 ? C.greenL : C.green)], 0.012, { off: [0, 0, -0.5], jitter: 0.05, ao: 0.1 });
const pendant = (i) => vox(i ? [B([-2, -5, 0], [3, 0, 1], (x, y) => (Math.hypot(x, y + 2.5) < 1 ? null : Math.hypot(x, y + 2.5) < 2.7 ? C.jade : null)),
  B([0, -8, 0], [1, -5, 1], C.gold)] : [B([0, -6, 0], [1, 0, 1], C.gold)], 0.012, { off: [-0.5, 0, -0.5], jitter: 0.04, ao: 0.1 });

export const LIUBEI_DEF = {
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, pauldron, weapon: swordGeo() }),
  chains() {
    const legs = [['thighL', 0.03], ['thighR', 0.03], ['kneeL', 0.03], ['kneeR', 0.03]];
    return [
      { joint: 'chest', anchor: [0, 0.235, -0.16], rest: [0, -1, 0.12], n: 4, len: 0.125, stiff: 0.16, drag: 0.22, wind: 1.1, cone: 80, sway: 0.2,
        seg: cape, hit: ['chest', 'hips', ...legs] },
      { joint: 'hips', anchor: [0, -0.01, 0.14], rest: [0, -1, 0.1], n: 3, len: 0.115, stiff: 0.12, drag: 0.14, wind: 0.4, face: [0, 0, 1], cone: 70, sway: 0.08,
        seg: panel, hit: legs },
      { joint: 'hips', anchor: [0, -0.01, -0.14], rest: [0, -1, -0.12], n: 3, len: 0.115, stiff: 0.12, drag: 0.14, wind: 0.4, face: [0, 0, -1], cone: 70, sway: 0.08,
        seg: panel, hit: ['hips', ...legs] },
      ...[-1, 1].map((sx) => ({ joint: 'head', anchor: [sx * 2 * HV, 17 * HV, -4 * HV], rest: [sx * 0.3, -0.6, -1], n: 5, len: 0.072,
        stiff: 0.03, drag: 0.06, wind: 2.4, cone: 105, sway: 0.6, seg: ribbon, hit: ['head', ['chest', 0.02]] })),
      { joint: 'hips', anchor: [0.12, -0.02, 0.1], rest: [0.1, -1, 0.2], n: 2, len: 0.072, stiff: 0.06, drag: 0.1, wind: 0.4, face: [0, 0, 1], cone: 60,
        seg: pendant, hit: [['thighL', 0.02]] },
      // a tassel at each pommel (the left sword rides the left hand: its frame is the sword's, kit.js)
      ...[['weapon', C.gold, C.goldL, C.goldD], ['handL', C.jade, C.jadeL, C.jadeD]].flatMap(([joint, c, h, d]) => [0, 1, 2].map((k) => ({
        joint, anchor: [(k - 1) * 0.008, 0, -0.15], rest: [(k - 1) * 0.3, -1, -0.3], n: 3, len: 0.045, stiff: 0.05, drag: 0.12, wind: 0.8, cone: 130,
        sway: 0.15, face: [1, 0, 0], seg: strand(c, h, d, 0.011) }))),
    ];
  },
};

// ---------------------------------------------------------------- HUD portrait (20 × 20): gold crown on the topknot,
// black hair, a kind face with long earlobes, a thin moustache and chin tuft, the green robe's gold-edged crossed collar
export const FACE = [
  '.........YY.........',
  '........YjYY........',
  '.......KYYYYK.......',
  '......KKKKKKKK......',
  '....KKKKKKKKKKKK....',
  '...KKKKKKKKKKKKKK...',
  '...KKSSSSSSSSSSKK...',
  '..SKSSSSSSSSSSSSKS..',
  '..SKSKKKSSSSKKKSKS..',
  '..SSSWWESSSSEWWSSS..',
  '..sSSSSSSSSSSSSSSs..',
  '..SsSSSSSssSSSSSSsS.',
  '..SsSSSSSSSSSSSSsSS.',
  '..SS.SKKKKKKKKS.SS..',
  '..S..SKMMMMMMKS..S..',
  '......SSSKKSSS......',
  '....GGGGSKKSGGGG....',
  '..GGGGYWWSSWWYGGGG..',
  '.GGGgGGYWWWWYGGgGGG.',
  'GGgGGGGGYWWYGGGGGgGG',
];
export const PAL = { Y: '#e0b44e', j: '#4fae8c', K: '#15100e', S: '#d6a092', s: '#a86e62', W: '#efe6d8', E: '#140c0a', M: '#a0564a',
  G: '#2f6a3c', g: '#4c8c58' };
