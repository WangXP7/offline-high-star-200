// 張飛 翼德 (def-kit model: src/chars/defkit.js header), fine voxels (chars/parts.js FV) on the shared rig, a size up
// (kit scale 1.13). 豹頭環眼, 燕頷虎鬚: a broad dark-bronze face under a black-iron helm (gold brow band with a beast
// emblem, lamellar neck flaps, a gold finial with a bursting red tassel), round glaring eyes ringed in white under brows
// crushed down to the nose, a flat broad nose, a snarl, an upswept moustache and a bristling black beard whose spikes
// and cheek whiskers spring with every blow. Black-iron lamellar with gold lips over a green robe; a round bronze
// chest mirror with a red 張; the right shoulder in a huge beast-head pauldron (吞肩獸, the arm issuing from its jaws),
// the left arm bare and muscled with a gold armlet; iron belt with a bronze beast-face buckle over a tiger-skin
// skirt (its tail hangs behind); green trousers, iron tassets and greaves, black boots with upturned toes. Weapon: the
// 丈八蛇矛 — lacquered red shaft banded in gold, a bronze serpent head whose open jaws issue a long wavy serpent blade,
// the red tassel under it.
import { vox, B, P, md, mirX, lamellar } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, glove, bareArm, bracer, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0x8e5c3e, skinD: 0x66402a, skinH: 0xa8704e, lip: 0x4c1c16, mouth: 0x1c0806, eye: 0x0a0808, iris: 0x4a2a12, scl: 0xf2eadc, teeth: 0xece2cc,
  beard: 0x0d0a0b, beardH: 0x2a2224,
  iron: 0x34363e, ironD: 0x1d1e23, ironL: 0x55586a,
  gold: 0xb48a3c, goldD: 0x6c4e1e, goldL: 0xe0b85e,
  red: 0xb02a1c, redD: 0x6e160e, redL: 0xe0482c,
  green: 0x2e5a36, greenD: 0x1d3a23, greenL: 0x447c4c,
  tiger: 0xd4862a, tigerL: 0xeaa84e, tigerW: 0xf0e2c2, stripe: 0x1a120c,
  leather: 0x3c2c22, leatherL: 0x5c4232, boot: 0x1f1b19, bootD: 0x131011,
  shaft: 0x5a2014, shaftH: 0x782a1a, steel: 0xc6ced8, edge: 0xf6f9fc, fuller: 0x76808e,
};
const robe = (x, y, z) => (md(x * 2 + y + z * 3, 13) === 0 ? C.greenL : md(x - y * 2 + z, 9) === 0 ? C.greenD : C.green);
const beardP = (x, y, z) => (md(x * 3 + y + z, 4) === 0 ? C.beardH : C.beard);
/** Tiger skin round a vertical axis: orange with wavy black stripes, lighter flecks, a cream belly edge at the hem. */
const tigerP = (hem) => (x, y, z) => {
  const a = Math.atan2(x, z + 0.5) * 3.2 + y * 0.18 + Math.sin(y * 0.8 + x * 0.35) * 0.45;
  if (md(Math.floor(a * 2), 5) === 0) return C.stripe;
  return y <= hem ? C.tigerW : hash01(x, y, z) < 0.18 ? C.tigerL : C.tiger;
};
// 張 as a 7 × 9 relief (弓 on the left, 長 on the right), row 0 = top
const ZHANG = ['XX.XXXX', '.X.X...', 'XX.XXXX', 'X..X...', 'XX.XXXX', '.X.XX..', '.X.X.X.', 'XX.X..X', '...X...'];

// ---------------------------------------------------------------- body (FV, centred on the joints)
function torso() {
  const T = {};
  // hips: iron belt (gold studs) with the bronze beast-face buckle over a tiger-skin skirt, short in front, long behind
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.greenD),
    B([-15, -15, -11], [15, -1, 11], (x, y, z) => {
      if (z > 6 && y < -8) return null;                                  // the front is cut short: the thighs stride free
      if (y === -15 && hash01(x, z, 9) < 0.45) return null;              // ragged hem
      return tigerP(-13)(x, y, z);
    }),
    B([-15, -1, -11], [15, 5, 11], (x, y, z) => (y === -1 || y === 4 ? C.goldD : y === 2 && md(x + z, 4) === 0 ? C.goldL : C.iron)),
    B([-5, -3, 11], [6, 6, 13], (x, y) => (y === -3 || y === 5 ? C.goldD : C.gold)),     // beast-face buckle
    P([-3, 2, 12], [-1, 4, 13], C.redL), P([2, 2, 12], [4, 4, 13], C.redL),              // its eyes
    B([-3, -2, 13], [4, 1, 14], C.goldD), P([-2, -2, 13], [-1, 0, 14], C.teeth), P([2, -2, 13], [3, 0, 14], C.teeth),   // snout, fangs
    B([-8, -4, 11], [-4, 4, 14], C.red), P([-8, 0, 13], [-4, 1, 14], C.redL),            // red sash knot, front right (tails: chains)
  ];
  // waist: belly lamellar over the robe, a red cord band under the cuirass
  T.spine = [
    B([-11, -6, -9], [11, 14, 9], C.greenD),
    ...lamellar([-11, -4, -9], [11, 10, 9], { base: C.iron, rowH: 2, pw: 3 }),
    B([-12, 10, -10], [12, 14, 10], (x, y) => (y === 10 ? C.redD : md(x, 5) === 0 ? C.redL : C.red)),
  ];
  // chest: black-iron cuirass, gold-lipped plate rows, the bronze mirror with a red 張, gold shoulder straps, a raised
  // iron gorget, red cord lacing crossed on the back
  const disc = [];
  for (let y = 0; y < 13; y++) for (let x = -6; x < 7; x++) {
    const r = Math.hypot(x - 0.5, y - 6);
    if (r > 6.4) continue;
    const gy = y - 2, gx = x + 3, ch = r < 5.2 && gy >= 0 && gy < 9 && gx >= 0 && gx < 7 && ZHANG[8 - gy][gx] === 'X';
    disc.push(B([x, y + 3, 12], [x + 1, y + 4, r > 5.6 ? 14 : ch ? 15 : 14], ch ? C.red : r > 5.6 ? C.goldD : hash01(x, y, 5) < 0.2 ? C.goldD : C.gold));
  }
  T.chest = [
    B([-15, -4, -11], [15, 18, 11], C.ironD),
    ...lamellar([-15, -3, -11], [15, 5, 11], { base: C.iron, rowH: 2, pw: 3 }),
    ...lamellar([-16, 5, -12], [16, 17, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    ...disc,
    ...[-1, 1].flatMap((sx) => [mirX(B([9, 15, -13], [13, 19, 13], C.gold), sx), mirX(B([10, 16, -14], [12, 18, 14], C.goldD, true), sx)]),
    B([-9, 16, -9], [9, 23, 9], (x, y) => (y === 22 ? C.goldL : y === 16 ? C.goldD : C.iron)),   // gorget
    B([-6, 15, -6], [6, 25, 6], -1),                                                          // neck hole
    ...Array.from({ length: 14 }, (_, i) => B([-11 + i * 1.6 | 0, 15 - i, -13], [(-11 + i * 1.6 | 0) + 2, 16 - i, -12], C.red)),   // back lacing ╲
    ...Array.from({ length: 14 }, (_, i) => B([9 - i * 1.6 | 0, 15 - i, -13], [(9 - i * 1.6 | 0) + 2, 16 - i, -12], C.redD)),      // ╱
  ];
  T.neck = [B([-5, -2, -5], [5, 6, 5], C.skinD), P([-5, 1, 4], [5, 6, 5], C.skin)];
  return T;
}

function limbs(T) {
  // right arm: green robe sleeve under iron splints; left arm bare (the brawler's), a gold armlet
  T.upperArmR = [
    B([-6, -24, -6], [6, 2, 6], robe), B([-7, -19, -7], [7, -7, 7], robe),
    ...lamellar([-6, -17, -6], [6, -3, 6], { base: C.iron, rowH: 2, pw: 3, trim: C.gold }),
  ];
  T.upperArmL = bareArm(C, [C.gold, C.goldD, C.goldL]);
  T.foreArmR = bracer(C.skinD, [C.iron, C.ironD, C.gold]);
  T.foreArmL = bracer(C.skin, [C.leather, C.bootD, C.red], false);
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    T['hand' + s] = glove(sx, C.leather, C.leatherL);
    // green trousers bagging at the knee, iron tassets over the outside of the thigh
    T['thigh' + s] = [
      B([-7, -36, -7], [7, 2, 7], (x, y) => (md(y + (x & 1), 6) === 0 ? C.greenD : C.green)),
      B([-8, -31, -8], [8, -20, 8], (x, y) => (md(y - x, 5) === 0 ? C.greenD : C.green)),
      ...lamellar([-5, -17, -7], [9, 0, 8], { base: C.iron, rowH: 2, pw: 3, trim: C.gold, jag: true }).map((b) => mirX(b, sx)),
    ];
    // black boot shaft to the knee, the trousers tucked in, an iron greave and a gold knee cop
    T['shin' + s] = [
      B([-6, -34, -6], [6, 0, 6], C.boot),
      B([-7, -7, -7], [7, 2, 7], C.green), B([-7, -9, -7], [7, -7, 7], C.redD),          // tucked trousers, red garter
      ...lamellar([-6, -29, 3], [6, -10, 7], { base: C.iron, rowH: 3, pw: 3 }),
      B([-2, -9, 6], [2, 1, 9], (x, y) => (y === -9 ? C.goldD : C.gold)),
      B([-7, -34, -7], [7, -32, 7], C.bootD),
    ];
    T['foot' + s] = boot(C.boot, C.bootD, C.bootD, { curl: true, trim: C.gold });
  }
  return T;
}

/** Right: the beast-head pauldron (tiers of iron lamellar, a gold-maned lion face on the outside, red eyes, fangs, the
 *  arm issuing from its jaws). Left: none (bare arm). Authored with +x outward. */
function pauldron(sx) {
  if (sx > 0) return [];
  const eng = (x, y, z) => (md(y + z, 4) === 0 ? C.goldD : md(x * 2 + z, 7) === 0 ? C.goldL : C.gold);
  return [
    ...lamellar([-6, 6, -10], [7, 14, 10], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    ...lamellar([-2, -4, -12], [10, 6, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold, jag: true }),
    B([9, -1, -8], [14, 12, 8], eng),                                            // the face
    B([7, 11, -10], [14, 15, 10], (x, y, z) => (hash01(x, y, z) < 0.25 ? null : md(x + z, 3) ? C.gold : C.goldD)),   // mane
    B([11, 12, -10], [15, 16, -6], C.goldL), B([11, 12, 6], [15, 16, 10], C.goldL),                                     // ears
    P([13, 7, -6], [14, 10, -2], C.red), P([13, 7, 2], [14, 10, 6], C.red),     // eyes
    B([14, 5, -2], [16, 9, 2], C.goldD),                                         // snout
    B([13, -1, -6], [15, 3, 6], C.mouth),                                        // open jaws
    B([14, 1, -5], [16, 4, -3], C.teeth), B([14, 1, 3], [16, 4, 5], C.teeth), B([14, -2, -1], [16, 0, 1], C.teeth),   // fangs
  ].map((b) => mirX(b, sx));
}

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  const helm = (x, y, z) => (md(Math.round(Math.atan2(x - 0.5, z) * 4), 3) === 0 ? C.ironL : y === 12 ? C.ironD : C.iron);
  const flap = (x, y, z) => (md(y, 3) === 0 ? C.ironD : md(x + z + (Math.floor(y / 3) & 1) * 2, 4) === 0 ? C.ironD : C.iron);
  return [
    // skull and the broad swallow jaw (燕頷), cheekbones, ears
    B([-7, 2, -6], [8, 13, 6], C.skin),
    B([-8, 0, -5], [9, 6, 5], C.skin),
    B([-8, 6, -2], [9, 9, 1], C.skinD),
    ...symH(4, 7, 5, 7, 5, 6, C.skinH),                                            // cheekbones catch the light
    // 環眼: round eyes ringed in white, a small dark iris, heavy lids; brows crushed down to the nose, flaring up outside
    ...symH(1, 5, 7, 10, 5, 6, C.scl), ...symH(2, 4, 8, 10, 5, 6, C.iris), ...symH(2, 3, 8, 9, 5, 6, C.eye),
    ...symH(1, 5, 10, 11, 5, 6, C.skinD), ...symH(1, 5, 6, 7, 5, 6, C.skinD),
    ...symH(1, 3, 10, 12, 5, 8, C.beard, false), ...symH(3, 5, 11, 13, 5, 8, C.beard, false), ...symH(5, 8, 12, 14, 5, 7, C.beard, false),
    P([0, 10, 5], [1, 13, 6], C.skinD),                                            // furrow
    // flat broad nose
    B([-2, 6, 6], [3, 10, 8], C.skin), B([-3, 4, 6], [4, 6, 9], C.skinH),
    B([0, 3, 7], [1, 5, 9], C.skinD), P([-3, 4, 8], [-1, 5, 9], C.mouth), P([2, 4, 8], [4, 5, 9], C.mouth),
    // snarl: dark mouth, upper teeth, lower lip
    P([-3, 1, 5], [4, 4, 6], C.mouth), P([-2, 3, 5], [3, 4, 6], C.teeth), P([-3, 1, 5], [4, 2, 6], C.lip),
    // upswept moustache; the beard mass round the jaw (the long spikes and whiskers are chains); sideburns
    B([-4, 4, 6], [5, 5, 8], C.beard), B([-6, 4, 5], [-4, 7, 8], beardP), B([5, 4, 5], [7, 7, 8], beardP),
    B([-9, -4, -3], [10, 4, 7], (x, y, z) => (z > 4 && y >= 1 && Math.abs(x - 0.5) < 4 ? null : hash01(x, y, z) < 0.12 && y < 0 ? null : beardP(x, y, z))),
    B([-6, -6, 0], [7, -4, 7], (x, y, z) => (hash01(x, z, y) < 0.3 ? null : beardP(x, y, z))),
    B([-9, 3, -4], [-7, 12, 3], beardP), B([8, 3, -4], [10, 12, 3], beardP),
    // black-iron helm: ribbed bowl, dome, gold finial (the tassel's anchor), gold brow band with a beast emblem and a
    // red gem, lamellar neck flaps outside the sideburns and round the back, short upswept horns at the temples
    B([-9, 12, -8], [10, 19, 8], helm), B([-7, 19, -6], [8, 21, 6], helm), B([-4, 21, -3], [5, 22, 3], C.iron),
    B([-1, 22, -1], [2, 25, 2], C.gold), B([-2, 22, -2], [3, 23, 2], C.goldD),
    B([-9, 12, 7], [10, 14, 9], (x, y) => (y === 12 ? C.goldD : C.gold)),
    B([-2, 13, 9], [3, 17, 10], C.goldL), P([0, 14, 9], [1, 16, 10], C.red), B([0, 14, 10], [1, 15, 11], C.redL),
    B([-11, 2, -9], [-9, 13, 5], flap), B([10, 2, -9], [12, 13, 5], flap), B([-9, 1, -10], [10, 13, -7], flap),
    B([-12, 15, -2], [-9, 17, 2], C.iron), B([-13, 17, -1], [-11, 20, 1], C.ironL),
    B([10, 15, -2], [13, 17, 2], C.iron), B([12, 17, -1], [14, 20, 1], C.ironL),
  ];
}

// ---------------------------------------------------------------- 丈八蛇矛 (weapon joint: shaft +Z, origin = rear grip)
function weaponGeo() {
  // shaft at 0.02 (z −0.84 … 1.52): red lacquer, gold bands, black cord wrap at both grips, gold butt spike
  const shaft = vox([
    B([-1, -1, -40], [1, 1, 76], (x, y, z) => ((z > -6 && z < 8) || (z > 18 && z < 30) ? (md(z + x + y, 2) ? C.bootD : C.leather)
      : ((z >> 1) & 1) ? C.shaftH : C.shaft)),
    ...[-34, -8, 12, 34, 56].map((z) => B([-2, -2, z], [2, 2, z + 2], (x, y, zz) => (zz === z ? C.gold : C.goldD))),
    B([-2, -2, -40], [2, 2, -37], C.gold), B([-1, -1, -43], [1, 1, -40], C.goldL),
  ], 0.02, { jitter: 0.04, ao: 0.3 });
  // bronze serpent head at 0.012 (z 1.42 … 1.66): scaled neck, a head with its jaws open round the blade's root, red eyes,
  // swept-back fins, fangs
  const scale = (x, y, z) => (md(z + (y > 0 ? x : -x), 3) === 0 ? C.goldD : md(x + z, 5) === 0 ? C.goldL : C.gold);
  const serpent = vox([
    B([-3, -3, 118], [3, 3, 124], scale),
    B([-4, -4, 124], [4, 4, 131], scale),
    B([-4, 1, 131], [4, 5, 138], scale), B([-3, -4, 131], [3, -1, 136], C.goldD),      // upper jaw / lower jaw
    B([-3, -1, 131], [3, 1, 135], C.mouth),                                          // open mouth
    B([-3, 0, 135], [-2, 2, 137], C.teeth), B([2, 0, 135], [3, 2, 137], C.teeth),   // fangs
    B([-5, 2, 128], [-4, 4, 131], C.red), B([4, 2, 128], [5, 4, 131], C.red),       // eyes
    B([-6, 3, 122], [-4, 5, 128], C.goldL), B([4, 3, 122], [6, 5, 128], C.goldL),   // swept fins
    B([-7, 4, 119], [-5, 5, 123], C.goldD), B([5, 4, 119], [7, 5, 123], C.goldD),
    B([-1, 5, 124], [1, 7, 134], C.goldD),                                           // crest ridge
  ], 0.012, { jitter: 0.05, ao: 0.35 });
  // the serpent blade at 0.011 (z 1.62 … 2.24): flat, its centre line winding 3½ half-waves, tapering to a needle point;
  // a dark fuller follows the wave, bright edges
  const bv = 0.011, z0 = Math.round(1.62 / bv), z1 = Math.round(2.24 / bv), boxes = [];
  for (let z = z0; z < z1; z++) {
    const u = (z - z0) / (z1 - z0), cx = 3.4 * Math.sin(u * Math.PI * 3.5) * (1 - 0.55 * u);
    const w = Math.max(0.6, 4.2 * (1 - Math.pow(u, 1.8)) + (u < 0.05 ? 1.5 : 0));
    const a = Math.round(cx - w), b = Math.round(cx + w);
    boxes.push(B([a, -1, z], [Math.max(a + 1, b), 1, z + 1], (x) => (Math.abs(x + 0.5 - cx) < 0.9 && u < 0.85 ? C.fuller : x === a || x === b - 1 ? C.edge : C.steel)));
  }
  const blade = vox(boxes, bv, { jitter: 0.03, ao: 0.2 });
  return [{ geo: shaft, mat: 'body' }, { geo: serpent, mat: 'metal' }, { geo: blade, mat: 'blade' }];
}

// ---------------------------------------------------------------- chain segments (local −Y along the chain)
const strand = (c, h, d, v, w0 = 2) => (i, n) => {           // silk strands: each (x, z) column its own shade, fraying ends
  const w = i === 0 ? w0 + 1 : w0, last = i === n - 1;
  return vox([B([-w, -7, -w], [w, 0, w], (x, y, z) => {
    const k = hash01(x + 9, z + 9, 7);
    if (last && -y > 3 + k * 5) return null;
    if ((x === -w || x === w - 1) && (z === -w || z === w - 1) && i > 0) return null;
    return last && -y > 3 + k * 3 ? d : k < 0.3 ? h : k > 0.8 ? d : c;
  })], v, { jitter: 0.06, ao: 0.25 });
};
const spike = (i, n) => {                                     // a beard bristle: a stiff black spike tapering to a point
  const w = Math.max(1, 2 - i), last = i === n - 1;
  return vox([B([-w, last ? -6 : -5, -w], [w, 0, w], (x, y, z) => (last && y < -3 && (x !== -1 || z !== -1) && w > 1 ? null : beardP(x, y, z)))], HV, { jitter: 0.05, ao: 0.3 });
};
const tail = (i, n) => {                                      // the tiger tail: ringed orange, a black tip
  const w = i < 2 ? 2 : 1, last = i === n - 1;
  return vox([B([-w, -7, -w], [w, 0, w], (x, y) => (last ? (y < -4 ? C.stripe : C.tiger) : md(y + i * 2, 5) < 2 ? C.stripe : y === -1 ? C.tigerL : C.tiger))],
    FV, { jitter: 0.05, ao: 0.25 });
};
export const ZHANGFEI_DEF = {
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, pauldron, weapon: weaponGeo() }),
  chains() {
    const out = [];
    // red helm tassel (紅纓): strands bursting from the finial, falling round the helm
    for (let k = 0; k < 6; k++) {
      const a = k * 1.047 + 0.3, ox = Math.cos(a), oz = Math.sin(a);
      out.push({ joint: 'head', anchor: [ox * 0.8 * HV, 25 * HV, oz * 0.8 * HV], rest: [ox * 0.9, -0.15, oz * 0.9 - 0.3], n: 3, len: 0.058,
        stiff: 0.05, drag: 0.1, wind: 1.3, cone: 120, sway: 0.3, face: [1, 0, 0], seg: strand(C.red, C.redL, C.redD, 0.012), hit: ['head'] });
    }
    // 虎鬚: bristling beard spikes under the jaw and whiskers off the cheeks — stiff and heavy, they spring on impacts
    for (const [x, y, z, rx, rz] of [[-5, -4, 3, -0.45, 0.25], [-2.5, -6, 4, -0.2, 0.35], [0, -6, 5, 0, 0.45], [2.5, -6, 4, 0.2, 0.35], [5, -4, 3, 0.45, 0.25],
      [-8.5, 3, 4, -1, 0.3], [9, 3, 4, 1, 0.3]]) {
      const cheek = Math.abs(x) > 8;
      out.push({ joint: 'head', anchor: [x * HV, y * HV, z * HV], rest: [rx, cheek ? -0.35 : -1, rz], n: 2, len: cheek ? 0.05 : 0.06,
        stiff: 0.4, drag: 0.22, wind: 0.2, grav: 1.4, cone: 40, face: [0, 0, 1], seg: spike, hit: cheek ? [] : [['chest', 0.02]] });
    }
    // tiger tail from the back of the belt
    out.push({ joint: 'hips', anchor: [0.02, -0.02, -0.15], rest: [0.05, -1, -0.3], n: 6, len: 0.085, stiff: 0.1, drag: 0.12, wind: 0.9, cone: 85, sway: 0.2, grav: 1.1,
      face: [0, 0, -1], seg: tail, hit: ['hips', ['thighL', 0.03], ['thighR', 0.03], ['kneeL', 0.03], ['kneeR', 0.03]] });

    // the spear's red tassel under the serpent head
    for (let k = 0; k < 5; k++) {
      const a = k * 1.2566, ox = Math.cos(a) * 0.016, oy = Math.sin(a) * 0.016;
      out.push({ joint: 'weapon', anchor: [ox, oy, 1.4], rest: [ox * 12, oy * 4 - 1, -0.35], n: 3, len: 0.07, stiff: 0.05 + k * 0.004, drag: 0.12, wind: 0.8, cone: 130, sway: 0.15,
        face: [1, 0, 0], seg: strand(C.red, C.redL, C.redD, 0.014) });
    }
    return out;
  },
};

// ---------------------------------------------------------------- HUD portrait (20 × 20): helm and red tassel, glaring
// round eyes, crushed brows, bronze face, a black beard bursting over black-iron lamellar
export const FACE = [
  '.......rRrRr........',
  '......RrRRrRr.......',
  '.....IIIIYIIII......',
  '....IIIIIIIIIIII....',
  '...IGGGGGYGGGGGGI...',
  '..HIKKKSSSSSKKKIH...',
  '..HISSKKSSSKKSSIH...',
  '..HSWWESSSSSEWWSH...',
  '..HSWEWSSSSSWEWSH...',
  '..HSSsSSsssSSsSSH...',
  '.HHHKKKKKKKKKKKHHH..',
  'HHHHKMTTTTTTMKHHHHH.',
  '.HHHHHMMMMMMHHHHHH..',
  'HH.HHHHHHHHHHHHH.HH.',
  '...HHHHHHHHHHHHH....',
  '..IiHHHHHHHHHHHiI...',
  '.IIiIHHHHHHHHHiIII..',
  'IIIiIIIYYYYYIIIiIII.',
  'IiIIIIYYrrrYYIIIIiI.',
  'IIiIIIIYYYYYIIIIIiII',
];
export const PAL = { r: '#e0482c', R: '#b02a1c', I: '#34363e', i: '#55586a', Y: '#c8a04a', G: '#b48a3c', H: '#0d0a0b', K: '#0d0a0b',
  S: '#8e5c3e', s: '#66402a', W: '#f2eadc', E: '#0a0808', M: '#4c1c16', T: '#ece2cc' };
