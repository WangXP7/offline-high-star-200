// 呂布 奉先 (def-kit model: src/chars/defkit.js header), fine voxels (chars/parts.js FV) on the shared rig, the tallest
// officer (kit scale 1.14). After the opera and the novel: 頭戴三叉束髮紫金冠 — a gold crown over his bound hair, purple
// bowl and gems, a flame-shaped front plaque, gold scroll wings at the temples, red velvet pompoms, and the two long
// 雉雞翎 pheasant feathers (rust barred black, pale tips) rising from its back and arcing over him (spring chains, light:
// grav < 1). A lean hard face: long narrowed eyes ringed in opera rouge that sweeps up to the temples, brows slashing
// down to the nose, a sneer; a black mane falling behind. 獸面吞頭連環鎧: black-iron mail (a ring pattern) under black
// lamellar lipped in gold, a great gold beast face (red eyes, fangs) on the chest, both shoulders in gold-faced beast
// pauldrons (the arms issuing from their jaws), a purple 勒甲絛 cord round the waist, the 獅蠻帶 belt whose gold lion head
// swallows its own strap; 西川紅錦百花袍: red brocade strewn with gold flowers — the sleeves, the trousers, the front
// apron and the long cape; black-iron bracers, gold greaves and knee cops, black boots with gold upturned toes.
// Weapon: the 方天畫戟 — black-red lacquered shaft wound with a gold spiral, a gold beast mouth (吞口) holding a long
// leaf-shaped spear point, the crescent 月牙 blade on one side (its concave edge out, an engraved gold line through
// it, pierced 畫 holes, spurs on its back), a small back spike opposite, a red tassel under the collar.
import { vox, B, P, md, mirX, lamellar } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, glove, bracer, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0xe2ae88, skinD: 0xb47a5c, skinH: 0xf2c6a2, lip: 0x8a3430, mouth: 0x240a0a, eye: 0x0c0808, iris: 0x2e1410, scl: 0xf2eadf,
  rouge: 0xc0463e, rougeD: 0x8e2a2a, teeth: 0xf0e6d0,
  hair: 0x100c10, hairH: 0x2a2230,
  iron: 0x2a2830, ironD: 0x17161c, ironL: 0x4a4656,
  gold: 0xc0943a, goldD: 0x74521c, goldL: 0xecc466,
  purple: 0x5e2a82, purpleL: 0x9a54c4, purpleD: 0x341448,
  red: 0xa81c1c, redD: 0x620e0e, redL: 0xd8362a, flower: 0xe2b050,
  pom: 0xe01e2e, pomL: 0xff5a5a,
  leather: 0x2a1e1a, boot: 0x17141a, bootD: 0x0e0c10,
  shaft: 0x2c1216, shaftH: 0x40181c, steel: 0xc8d0da, edge: 0xf6f9fc, steelD: 0x6c7684,
  fea: 0xc0501e, feaL: 0xec9a48, feaD: 0x24120a, feaW: 0xf2e8d2,
};
/** 西川紅錦: red brocade with small gold four-petal flowers on a staggered lattice (x + z wraps round a limb). */
const brocade = (x, y, z) => {
  const u = x + z, v = y + (md(Math.floor(u / 6), 2) ? 3 : 0), a = md(u, 6), b = md(v, 6);
  if (a === 3 && b === 3) return C.goldL;
  if ((a === 3 && (b === 2 || b === 4)) || (b === 3 && (a === 2 || a === 4))) return C.flower;
  return md(u * 2 + v, 11) === 0 ? C.redD : C.red;
};
/** 連環: black-iron rings (bright crowns, dark centres, rows staggered). */
const mail = (x, y, z) => {
  const u = x + z + (md(y >> 1, 2) ? 1 : 0);
  return md(y, 2) === 0 ? (md(u, 2) ? C.ironL : C.iron) : md(u, 2) ? C.ironD : C.iron;
};
const goldP = (x, y, z) => (md(x + y * 2 + z, 7) === 0 ? C.goldL : md(x * 3 - y + z, 5) === 0 ? C.goldD : C.gold);

// ---------------------------------------------------------------- body (FV, centred on the joints)
/** A gold beast mask facing +z on a plate of half width w at depth z (front face z + 2), y0 its jaw line (chest, belt). */
function beastFace(w, y0, z, big) {
  const h = big ? 12 : 9, e = big ? 8 : 6;
  return [
    B([-w, y0, z], [w, y0 + h, z + 2], (x, y) => ((y === y0 + h - 1 || y === y0) && Math.abs(x + 0.5) > w - 2 ? null : goldP(x, y, z))),
    B([-w - 1, y0 + h - 3, z], [-w + 3, y0 + h + (big ? 3 : 2), z + 2], C.goldL), B([w - 3, y0 + h - 3, z], [w + 1, y0 + h + (big ? 3 : 2), z + 2], C.goldL),   // horns
    B([-w + 1, y0 + e + 1, z + 2], [-1, y0 + e + 3, z + 3], C.goldD), B([1, y0 + e + 1, z + 2], [w - 1, y0 + e + 3, z + 3], C.goldD),                  // brow ridges
    P([-w + 2, y0 + e - 1, z + 1], [-1, y0 + e + 1, z + 2], C.redL), P([1, y0 + e - 1, z + 1], [w - 2, y0 + e + 1, z + 2], C.redL),                    // red eyes
    B([-2, y0 + (big ? 5 : 3), z + 2], [2, y0 + e, z + 4], C.goldD),                                                                              // snout
    B([-w + 2, y0 + 1, z + 1], [w - 2, y0 + (big ? 5 : 3), z + 2], C.mouth),                                                                      // open jaws
    P([-w + 2, y0 + (big ? 3 : 2), z + 1], [-w + 4, y0 + (big ? 5 : 3), z + 2], C.teeth), P([w - 4, y0 + (big ? 3 : 2), z + 1], [w - 2, y0 + (big ? 5 : 3), z + 2], C.teeth),
    P([-1, y0 + 1, z + 1], [1, y0 + 2, z + 2], C.teeth),
  ];
}

function torso() {
  const T = {};
  // hips: purple-black base; a lamellar skirt round the sides and back (the front open: the apron hangs there); the
  // 獅蠻帶 — gold plaques with purple gems, its gold lion head biting the strap
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.ironD),
    B([-15, -17, -11], [15, -1, 11], (x, y, z) => (z > 5 ? null : y === -17 && hash01(x, z, 4) < 0.3 ? null
      : md(y + 17, 3) === 0 ? C.gold : md(x + z + (Math.floor((y + 17) / 3) & 1) * 2, 4) === 0 ? C.ironD : C.iron)),
    B([-15, -2, -11], [15, 5, 11], (x, y, z) => (y === -2 || y === 4 ? C.goldD : y === 1 && md(x + z, 5) === 0 ? C.purpleL : C.gold)),
    ...beastFace(7, -6, 11, false),
  ];
  // waist: mail under a belly plate of gold-lipped lamellar, the purple cord knotted under the cuirass
  T.spine = [
    B([-11, -6, -9], [11, 14, 9], mail),
    ...lamellar([-10, -4, 5], [10, 11, 10], { base: C.iron, rowH: 2, pw: 3, trim: C.gold, lipX: false }),
    B([-12, 11, -10], [12, 14, 10], (x, y) => (y === 11 ? C.purpleD : md(x, 4) === 0 ? C.purpleL : C.purple)),
    B([-3, 7, 10], [3, 12, 12], C.purple), P([-1, 9, 11], [1, 11, 12], C.purpleL),                 // the knot
  ];
  // chest: black cuirass, gold-lipped lamellar rows, the great beast face, gold shoulder straps and cape rings, a
  // standing red brocade collar lipped in gold, kept low so the jaw stays clear
  T.chest = [
    B([-15, -4, -11], [15, 18, 11], mail),
    ...lamellar([-16, 4, -12], [16, 17, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    ...beastFace(9, 1, 12, true),
    ...[-1, 1].flatMap((sx) => [mirX(B([9, 15, -13], [13, 19, 13], C.gold), sx), mirX(B([10, 16, -14], [12, 18, 14], C.goldD, true), sx),
      mirX(B([8, 13, -15], [13, 18, -13], C.goldL), sx)]),                                           // cape rings on the back
    B([-9, 16, -9], [9, 21, 9], (x, y, z) => (y >= 20 ? C.goldL : y === 16 ? C.goldD : brocade(x, y, z))),
    B([-6, 15, -6], [6, 26, 6], -1),                                                                   // neck hole
  ];
  T.neck = [B([-4, -2, -4], [4, 6, 4], C.skinD), P([-4, 1, 3], [4, 6, 4], C.skin)];
  return T;
}

function limbs(T) {
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    T['upperArm' + s] = [B([-6, -24, -6], [6, 2, 6], brocade), B([-7, -19, -7], [7, -8, 7], brocade)];   // puffed brocade sleeve
    T['foreArm' + s] = bracer(C.redD, [C.iron, C.ironD, C.gold]);
    T['hand' + s] = glove(sx, C.leather, C.goldD);
    // brocade trousers under black lamellar tassets (gold lips, jagged hem) over the outside and front of the thigh
    T['thigh' + s] = [
      B([-7, -36, -7], [7, 2, 7], brocade),
      B([-8, -31, -8], [8, -20, 8], brocade),
      ...lamellar([-5, -19, -8], [10, 0, 9], { base: C.iron, rowH: 2, pw: 3, trim: C.gold, jag: true }).map((b) => mirX(b, sx)),
    ];
    // black boot shaft, the trousers tucked in under a purple garter, a gold greave with a ridge, a beast knee cop
    T['shin' + s] = [
      B([-6, -34, -6], [6, 0, 6], C.boot),
      B([-7, -7, -7], [7, 2, 7], brocade), B([-7, -9, -7], [7, -7, 7], C.purple),
      B([-6, -31, 2], [6, -10, 8], (x, y) => (Math.abs(x + 0.5) < 1 ? C.goldL : y === -11 || Math.abs(x + 0.5) > 5 ? C.goldD : md(y, 5) === 0 ? C.goldD : C.gold)),
      B([-3, -9, 6], [3, 1, 9], (x, y) => (y === -9 ? C.goldD : y === -5 && Math.abs(x + 0.5) > 1 ? C.redL : C.gold)),
      B([-7, -34, -7], [7, -32, 7], C.bootD),
    ];
    T['foot' + s] = boot(C.boot, C.bootD, C.bootD, { curl: true, trim: C.gold });
  }
  return T;
}

/** Both shoulders: tiers of black lamellar lipped in gold, a horned gold beast face on the outside (red eyes, fangs, open
 *  jaws the arm issues from), a gold mane over it. Authored with +x outward. */
function pauldron(sx) {
  return [
    ...lamellar([-6, 6, -10], [7, 14, 10], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    ...lamellar([-2, -5, -12], [10, 6, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold, jag: true }),
    B([9, -1, -8], [14, 12, 8], goldP),                                                          // the face
    B([7, 11, -10], [14, 15, 10], (x, y, z) => (hash01(x, y, z) < 0.25 ? null : md(x + z, 3) ? C.gold : C.goldD)),   // mane
    B([10, 13, -10], [14, 19, -7], C.goldL), B([10, 13, 7], [14, 19, 10], C.goldL),             // horns
    B([12, 17, -11], [14, 21, -9], C.goldL), B([12, 17, 9], [14, 21, 11], C.goldL),
    P([13, 7, -6], [14, 10, -2], C.redL), P([13, 7, 2], [14, 10, 6], C.redL),                   // eyes
    B([14, 5, -2], [16, 9, 2], C.goldD),                                                         // snout
    B([13, -1, -6], [15, 3, 6], C.mouth),                                                        // jaws
    B([14, 1, -5], [16, 4, -3], C.teeth), B([14, 1, 3], [16, 4, 5], C.teeth), B([14, -2, -1], [16, 0, 1], C.teeth),
  ].map((b) => mirX(b, sx));
}

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  const hair = (x, y, z) => (md(x * 3 + z + y * 2, 7) === 0 ? C.hairH : C.hair);
  // front plaque of the crown: a flame-topped shield (x −4..4, y 13..22)
  const plaque = (x, y) => {
    const X = Math.abs(x), top = 22 - Math.max(0, X - 1) * 1.6;
    if (y >= top) return null;
    return y === 13 || X >= 4 || y >= top - 1 ? C.goldL : md(x + y, 3) === 0 ? C.goldD : C.gold;
  };
  return [
    // skull, a lean hard jaw narrowing to the chin, cheekbones, jaw shade
    B([-7, 3, -6], [8, 13, 6], C.skin),
    B([-6, 0, -5], [7, 3, 5], C.skin), B([-3, -1, -3], [4, 0, 5], C.skin),
    ...symH(5, 8, 1, 4, 3, 6, C.skinD), ...symH(4, 7, 4, 5, 5, 6, C.skinH),
    // eyes: long and narrowed in a field of opera rouge that sweeps up to the temples; brows slash down to the nose
    ...symH(1, 8, 5, 9, 5, 6, C.rouge), ...symH(6, 8, 8, 10, 5, 6, C.rougeD),
    ...symH(2, 6, 6, 8, 5, 6, C.scl), ...symH(3, 5, 6, 8, 5, 6, C.iris), ...symH(3, 4, 6, 8, 5, 6, C.eye),
    ...symH(2, 7, 8, 9, 5, 6, C.eye), ...symH(6, 8, 9, 10, 5, 6, C.eye),                          // upper lids, flick to the temple
    ...symH(1, 3, 9, 10, 5, 7, C.hair, false), ...symH(3, 5, 10, 11, 5, 7, C.hair, false), ...symH(5, 8, 11, 12, 5, 7, C.hair, false),
    P([0, 9, 5], [1, 11, 6], C.skinD),                                                             // furrow
    // straight nose, a mouth set in a sneer (one corner up)
    B([0, 4, 6], [1, 9, 7], C.skin), P([-1, 4, 6], [2, 5, 7], C.skinD),
    P([-2, 2, 5], [3, 3, 6], C.lip), P([3, 3, 5], [4, 4, 6], C.lip), P([-1, 1, 5], [2, 2, 6], C.skinD),
    // hair: cap, sideburns, the back; bound up into the crown (the long mane is a chain)
    B([-8, 11, -8], [9, 17, 5], hair), B([-8, 3, -6], [-6, 13, 2], hair), B([7, 3, -6], [9, 13, 2], hair),
    B([-7, 1, -8], [8, 14, -5], hair), B([-2, 16, -4], [3, 20, 1], hair),
    // 紫金冠: gold band with purple gems, the purple bowl ribbed in gold over the topknot, gold cap and a red finial,
    // the plaque with a purple jewel, scroll wings at the temples, red pompoms, the feather sockets behind
    B([-9, 11, -9], [10, 14, 7], (x, y, z) => (z > 4 && md(x, 4) === 0 && y === 12 ? C.purpleL : y === 11 ? C.goldD : C.gold)),
    B([-5, 16, -6], [6, 21, 3], (x, y, z) => (md(x + z, 3) === 0 ? C.gold : y === 16 ? C.goldD : C.purple)),
    B([-4, 21, -5], [5, 23, 2], C.gold), B([-1, 23, -3], [2, 25, 0], C.pom), P([-1, 24, -3], [2, 25, 0], C.pomL),
    B([-4, 13, 6], [5, 22, 8], plaque), B([-1, 15, 8], [2, 18, 9], C.purpleL), P([0, 16, 8], [1, 17, 9], C.edge),
    B([-11, 12, -3], [-8, 16, 3], C.gold), B([-12, 15, -4], [-10, 20, 1], C.goldL), B([-13, 19, -5], [-11, 22, -1], C.gold),
    B([9, 12, -3], [12, 16, 3], C.gold), B([11, 15, -4], [13, 20, 1], C.goldL), B([12, 19, -5], [14, 22, -1], C.gold),
    B([-7, 15, 5], [-5, 18, 8], C.pom), P([-7, 17, 5], [-5, 18, 8], C.pomL), B([6, 15, 5], [8, 18, 8], C.pom), P([6, 17, 5], [8, 18, 8], C.pomL),
    B([-5, 19, -6], [-2, 23, -3], C.goldL), B([3, 19, -6], [6, 23, -3], C.goldL),
  ];
}

// ---------------------------------------------------------------- 方天畫戟 (weapon joint: shaft +Z, origin = rear grip)
function weaponGeo() {
  // shaft at 0.02 (z −0.84 … 1.44): black-red lacquer wound with a gold spiral, cord wraps at both grips, gold bands and
  // a gold butt spike (to −0.94)
  const shaft = vox([
    B([-1, -1, -42], [1, 1, 72], (x, y, z) => ((z > -6 && z < 8) || (z > 18 && z < 30) ? (md(z + x + y, 2) ? C.bootD : C.leather)
      : md(z + (x + 1) * 2 + (y + 1), 7) === 0 ? C.goldD : ((z >> 1) & 1) ? C.shaftH : C.shaft)),
    ...[-36, -8, 12, 34, 52, 62].map((z) => B([-2, -2, z], [2, 2, z + 2], (x, y, zz) => (zz === z ? C.gold : C.goldD))),
    B([-2, -2, -44], [2, 2, -41], C.gold), B([-1, -1, -47], [1, 1, -44], C.goldL),
  ], 0.02, { jitter: 0.04, ao: 0.3 });
  // gold beast mouth (吞口) at 0.012 (z 1.42 … 1.64): banded neck, a scaled head, red eyes, swept fins, jaws round the blade
  const scale = (x, y, z) => (md(z + (y > 0 ? x : -x), 3) === 0 ? C.goldD : md(x + z, 5) === 0 ? C.goldL : C.gold);
  const collar = vox([
    B([-3, -3, 118], [3, 3, 124], (x, y, z) => (md(z, 2) ? C.gold : C.goldD)),
    B([-4, -4, 124], [4, 4, 131], scale),
    B([-4, 1, 131], [4, 5, 137], scale), B([-3, -4, 131], [3, -1, 136], C.goldD),      // upper jaw / lower jaw
    B([-3, -1, 131], [3, 1, 135], C.mouth),
    B([-5, 1, 127], [-4, 3, 130], C.redL), B([4, 1, 127], [5, 3, 130], C.redL),         // eyes
    B([-7, -2, 121], [-4, 5, 128], C.goldL), B([4, -2, 121], [7, 5, 128], C.goldL),    // fins
    B([-1, 5, 124], [1, 7, 134], C.goldD),
  ], 0.012, { jitter: 0.05, ao: 0.35 });
  // blades at 0.011, flat in X: the spear point on the axis (z 1.62 … 2.24), the crescent on +y (centre z 1.77: the outer
  // circle touches the shaft, an offset inner circle opens it outward, horns pointing out), a back spike on −y
  const bv = 0.011, boxes = [], z0 = Math.round(1.62 / bv), z1 = Math.round(2.24 / bv);
  for (let z = z0; z < z1; z++) {
    const u = (z - z0) / (z1 - z0), w = Math.max(0.6, 4.6 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.1)), 0.8) * (1 - 0.55 * u));
    const a = Math.round(-w), b = Math.max(a + 1, Math.round(w));
    boxes.push(B([-1, a, z], [1, b, z + 1], (x, y) => (Math.abs(y + 0.5) < 0.9 && u < 0.8 ? C.steelD : y === a || y === b - 1 ? C.edge : C.steel)));
  }
  const cz = Math.round(1.77 / bv), R = 14, cy = R + 1, d = 0.5 * R, r = 0.9 * R;
  for (let dz = -R; dz <= R; dz++) for (let y = 2; y <= cy + R; y++) {
    const o = Math.hypot(y - cy, dz), i = Math.hypot(y - cy - d, dz);
    if (o > R || i < r) continue;
    const mid = Math.abs((R - o) - (i - r)) < 0.8 && o < R - 1.5 && i > r + 1.5;              // the engraved gold line
    const hole = Math.abs(dz) === 5 && Math.abs(o - (R + r - d) / 2 - 1) < 1.1;                  // pierced 畫 holes
    if (hole) continue;
    boxes.push(B([-1, y, cz + dz], [1, y + 1, cz + dz + 1], i < r + 1.2 ? C.edge : o > R - 1 ? C.steelD : mid ? C.gold : C.steel));
  }
  for (const k of [-8, 0, 8]) boxes.push(B([-1, 1, cz + k - 1], [1, 3, cz + k + 1], C.steelD));   // spurs where it meets the shaft
  for (let k = 0; k < 7; k++) boxes.push(B([-1, -3 - k, cz - 4 + k], [1, -2 - k, cz - 1 + k], k > 4 ? C.edge : C.steel));   // back spike
  boxes.push(B([-2, -4, cz - 4], [2, 4, cz + 4], C.gold), B([-3, -2, cz - 2], [3, 2, cz + 2], C.pom), P([-3, -1, cz - 1], [3, 1, cz + 1], C.pomL));   // boss + gem
  const blade = vox(boxes, bv, { jitter: 0.03, ao: 0.2 });
  return [{ geo: shaft, mat: 'body' }, { geo: collar, mat: 'metal' }, { geo: blade, mat: 'blade' }];
}

// ---------------------------------------------------------------- chain segments (local −Y along the chain)
/** 雉雞翎: a long pheasant tail feather — a pale quill, rust vanes barred black every half segment, frayed edges, the
 *  last segments tapering to a cream tip. */
const feather = (i, n) => {
  const w = i < 1 ? 3 : i > n - 3 ? 3 : 4, tip = i === n - 1;
  return vox([B([-w, tip ? -9 : -8, 0], [w, 0, 1], (x, y) => {
    const X = Math.abs(x + 0.5);
    if (tip && y < -3 && X > (y + 10) * 0.35) return null;
    if (X >= w - 0.5 && hash01(x, y, i) < 0.35) return null;
    if (X < 0.6) return C.feaW;                                                 // quill
    if (i >= n - 2) return y < -4 || i === n - 1 ? C.feaW : C.feaL;
    return md(-y + i * 8, 8) < 2 ? C.feaD : X > w - 1.5 ? C.feaL : C.fea;
  })], FV, { off: [0, 0, -0.5], jitter: 0.04, ao: 0.12 });
};
// Three narrow braids: interlocking highlights, no slab of clipped hair across the whole back.
const mane = (i, n, side) => {
  const strands = [], width = Math.max(1, Math.round(3 - 1.4 * i / n));
  for (let y = -8; y < 0; y++) {
    const x = Math.round(Math.sin((i * 8 - y) * 0.62 + side) * 1.2);
    strands.push(B([x - width, y, -1], [x + width + 1, y + 1, 2], (xx) => md(xx - y + i, 4) === 1 ? C.hairH : C.hair));
  }
  return vox(strands, FV, { jitter: 0.02, ao: 0.22 });
};
// The brocade cape falls as two independently moving outer tails with a scalloped gold hem.
const cape = (i, n, side) => {
  const cloth = [], width = 16 + Math.round(6 * i / (n - 1));
  for (let y = -13; y < 0; y++) for (let x = 0; x < width; x++) {
    const hem = -11 + Math.round(1.5 * Math.cos(x * Math.PI * 2 / width));
    if (i === n - 1 && y < hem) continue;
    const xx = side < 0 ? -x - 1 : x;
    const c = x < 2 || x > width - 3 || (i === n - 1 && y < hem + 2) ? C.gold : brocade(xx, y - i * 13, 1);
    cloth.push(B([xx, y, 0], [xx + 1, y + 1, 2], c), B([xx, y, -1], [xx + 1, y + 1, 0], C.redD));
  }
  return vox(cloth, FV, { jitter: 0.02, ao: 0.16 });
};
const apron = (i, n, side) => {
  const pennant = [];
  for (let row = 0; row < 11; row++) {
    const w = i === n - 1 ? Math.max(1, 5 - Math.floor(row / 2)) : 5;
    for (let x = -w; x <= w; x++) pennant.push(B([x, -row - 1, 0], [x + 1, -row, 2],
      Math.abs(x) >= w - 1 || row === 0 ? C.gold : brocade(x + side * 17, -row - i * 11, 1)));
  }
  return vox(pennant, FV, { jitter: 0.02, ao: 0.19 });
};
const cord = (i, n) => vox([B([-1, -7, -1], [1, 0, 1], (x, y) => (i === n - 1 && y < -4 ? C.goldL : md(y, 3) === 0 ? C.purpleD : C.purple))],
  FV, { jitter: 0.04, ao: 0.15 });
const strand = (i, n) => {                                  // the halberd's red tassel
  const w = i === 0 ? 3 : 2, last = i === n - 1;
  return vox([B([-w, -7, -w], [w, 0, w], (x, y, z) => {
    const k = hash01(x + 9, z + 9, 7);
    if (last && -y > 3 + k * 5) return null;
    if ((x === -w || x === w - 1) && (z === -w || z === w - 1) && i > 0) return null;
    return last && -y > 3 + k * 3 ? C.redD : k < 0.3 ? C.redL : k > 0.8 ? C.redD : C.red;
  })], 0.014, { jitter: 0.06, ao: 0.25 });
};

export const LUBU_DEF = {
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, pauldron, weapon: weaponGeo() }),
  chains() {
    const out = [];
    // the cape from the rings behind the shoulders; the brocade apron from the lion belt; purple cord ends at the back
    for (const side of [-1, 1]) out.push({ joint: 'chest', anchor: [side * 0.1, 0.19, -0.16], rest: [side * 0.08, -1, -0.18],
      n: 7, len: 0.17, stiff: 0.18, drag: 0.21, wind: 1.1, cone: 75, sway: 0.18, face: [0, 0, -1],
      seg: (i, n) => cape(i, n, side), hit: ['chest', 'hips', 'thighL', 'thighR', 'kneeL', 'kneeR'] });
    for (const side of [-1, 1]) out.push({ joint: 'hips', anchor: [side * 0.125, -0.045, 0.17], rest: [side * 0.06, -1, 0.14],
      n: 3, len: 0.15, stiff: 0.09, drag: 0.17, wind: 0.35, face: [0, 0, 1], cone: 62, sway: 0.06,
      seg: (i, n) => apron(i, n, side), hit: [['thighL', 0.025], ['thighR', 0.025], ['kneeL', 0.025], ['kneeR', 0.025]] });
    for (const sx of [-1, 1]) {
      out.push({ joint: 'spine', anchor: [sx * 0.06, 0.15, -0.13], rest: [sx * 0.2, -1, -0.35], n: 4, len: 0.08, stiff: 0.08, drag: 0.14, wind: 1, cone: 90, sway: 0.2,
        face: [0, 0, -1], seg: cord, hit: ['hips', ['thighL', 0.02], ['thighR', 0.02]] });
    }
    // Three braids hang separately below the crown.
    for (const side of [-1, 0, 1]) out.push({ joint: 'head', anchor: [side * 0.027, 0.13, -0.096], rest: [side * 0.1, -1, -0.3],
      n: 5, len: 0.08, stiff: 0.12, drag: 0.16, wind: 0.9, face: [0, 0, -1], cone: 70, sway: 0.19,
      seg: (i, n) => mane(i, n, side), hit: ['head', ['chest', 0.03]] });
    // 雉雞翎: two long feathers rising from the back of the crown, splaying out, arcing back over him — light (grav < 1),
    // springy, streaming in the wind
    for (const sx of [-1, 1]) {
      out.push({ joint: 'head', anchor: [sx * 4 * HV, 22 * HV, -4.5 * HV], rest: [sx * 0.42, 1, -0.45], n: 13, len: 0.092,
        stiff: 0.14, drag: 0.09, grav: 0.45, wind: 0.8, cone: 42, sway: 0.26, face: [0, 0, 1], seg: feather });
    }
    // Two tied bundles, each with three red fringe cords, below the blade fitting.
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) out.push({ joint: 'weapon',
      anchor: [side * 0.018, 0.01 - k * 0.01, 1.36], rest: [side * 0.18, -1, -0.15],
      n: 4, len: 0.055, stiff: 0.07, drag: 0.15, wind: 0.65, cone: 118, sway: 0.12, face: [1, 0, 0], seg: strand });
    return out;
  },
};

// ---------------------------------------------------------------- HUD portrait (20 × 20): the crown with its purple
// jewel and red pompoms, the two feathers rising out of the frame, black mane, rouge-ringed glaring eyes under slashing
// brows, a sneer, the red collar and the gold beast face on black armour
export const FACE = [
  'ff................ff',
  '.ff......rr......ff.',
  '..ff...YYYYYY...ff..',
  '...fpYYYYVVYYYYpf...',
  '...HHYYYYVVYYYYHH...',
  '..HHHGGGGGGGGGGHHH..',
  '..HHKSSSSSSSSSSKHH..',
  '.HHHSKKSSSSSSKKSHHH.',
  '.HHHRWEWSSSSWEWRHHH.',
  '.HHHRRSSSsSSSSRRHHH.',
  '.HHHSSSSSsSSSSSSHHH.',
  '.HHHsSSSSSSSSSSsHHH.',
  '.HHHHsSSSMMMSSsHHHH.',
  '.HHHH.ssSSSSss.HHHH.',
  '.HHH...rrrrrr...HHH.',
  '..IIYYIrRRRRrIYYII..',
  '.IIYYYIIYYYYIIYYYII.',
  'IIIYYIIYyrryYIIYYIII',
  'IIiIIIIYYyyYYIIIIiII',
  'IiIIIIIIYYYYIIIIIIiI',
];
export const PAL = { f: '#9c3e1c', r: '#b8201e', R: '#e0302c', Y: '#c8983e', y: '#74521c', V: '#9a54c4', p: '#e01e2e', G: '#8a6428',
  H: '#100c10', K: '#100c10', S: '#e2ae88', s: '#b47a5c', W: '#f2eadf', E: '#0c0808', M: '#8a3430', I: '#2a2830', i: '#4a4656' };
