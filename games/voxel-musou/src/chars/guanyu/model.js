// 關羽 雲長 (def-kit model: src/chars/defkit.js header), fine voxels (chars/parts.js FV) on the shared rig. 面如重棗: a
// deep jujube-red face — long and noble, 丹鳳眼 (long narrow phoenix eyes whose outer corners sweep up), 臥蠶眉 (thick
// silkworm brows rising at the ends), a long straight nose, a drooping black moustache and the 美髯: a black beard
// massed round the jaw whose long strands (spring chains) fall over the chest to the belt and swing with every cut. No
// helmet: a green 綠巾 head wrap (a jade-and-gold ornament on the brow band, the cloth over his topknot, a knot behind
// whose two tails stream). A green 綠袍 worn off the right shoulder over gold-trimmed black-iron lamellar: the robe covers
// the back and the left, its gold-hemmed edge running from the left of the neck down to the right hip, so the right
// breast (a gold 護心鏡 with a jade boss) and flank show armour; a gold cloud roundel on the back. One gold dragon
// pauldron on the left (leading) shoulder — tiers of gold scale, a dragon's head facing forward, jaws open, red eyes,
// horns swept back; the right shoulder a small iron spaulder over a green sleeve. Leather belt with gold rows and jade
// plaques, a gold-rimmed jade buckle; the robe skirt falls in panels (chains) front, back and sides to the shins; iron
// tassets on both thighs, dark-green trousers, black boots with gold trim and upturned toes. Weapon: the 青龍偃月刀 —
// green-lacquered shaft banded in gold, a gold dragon head swallowing a broad crescent blade (edge = local +Y, the point
// sweeping back past the spine), a spur on the spine, a green dragon inlaid along the flat, a red tassel under the jaws.
import { vox, B, P, md, mirX, lamellar } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, glove, bracer, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0x8e2619, skinD: 0x621610, skinH: 0xa83a2c, lip: 0x3e0c0a, mouth: 0x1c0806, eye: 0x0a0606, iris: 0x2a1008, scl: 0xe8dccc, teeth: 0xece2cc,
  beard: 0x0c0a0c, beardH: 0x2a2428,
  green: 0x2a6a3e, greenD: 0x1a4428, greenL: 0x3e8a54, pants: 0x1e3c2a,
  jade: 0x3cae78, jadeD: 0x1f6e4a, jadeL: 0x7ce0aa,
  iron: 0x3a3d46, ironD: 0x202228, ironL: 0x5a5e6c,
  gold: 0xc49a3e, goldD: 0x7a5a1e, goldL: 0xecc668,
  red: 0xa8241a, redD: 0x68140e, redL: 0xd8402a,
  leather: 0x3a2a20, leatherL: 0x5a4030, boot: 0x1c1918, bootD: 0x121010,
  shaft: 0x1f4a33, shaftH: 0x2c6246, steel: 0xc8d0da, edge: 0xf6f9fc, steelD: 0x6e7682,
};
/** Robe cloth: slanting fold streaks, sparse gold cloud dots. */
const robe = (x, y, z) => (md(x * 3 + y * 5 + z * 7, 97) === 0 ? C.gold : md(x + 2 * y - z, 9) < 2 ? C.greenD : md(2 * x - y + 3 * z, 17) === 0 ? C.greenL : C.green);
const beardP = (x, y, z) => (md(x, 3) === 0 ? C.beardH : C.beard);        // vertical strands
/** The robe's front edge (chest y): x above it is robe. From the left of the neck (y 20, x 5) to the right hip. */
const edge = (y) => -12 + (y + 4) * 0.72;
/** Robe drape over a torso part: robe on the back and left of the edge, a gold hem along it, null (armour) elsewhere. */
const drape = (dy) => (x, y, z) => {
  const e = edge(y + dy);
  if (z < -1 || x > e + 1.5) return robe(x, y, z);
  return x > e - 0.5 ? (x > e + 0.5 ? C.gold : C.goldL) : null;
};

// ---------------------------------------------------------------- body (FV, centred on the joints)
function torso() {
  const T = {};
  // hips: the robe skirt (front slit: the panels are chains) under a leather belt with gold rows, jade plaques and a
  // gold-rimmed jade buckle
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.greenD),
    B([-15, -16, -11], [15, -1, 11], (x, y, z) => (z > 7 && Math.abs(x + 0.5) < 5 && y < -5 ? null : y === -16 ? C.gold : robe(x, y, z))),
    B([-15, -1, -11], [15, 6, 11], (x, y, z) => (y === -1 || y === 5 ? C.gold : y === 4 ? C.goldD : C.leather)),
    ...[-13, -7, 7, 13].map((x) => B([x - 2, 1, 11], [x + 2, 4, 12], (xx, yy) => (yy === 2 && (xx === x - 1 || xx === x) ? C.jadeL : C.jade))),
    B([-5, -2, 11], [5, 7, 13], (x, y) => (y === -2 || y === 6 || x === -5 || x === 4 ? C.goldD : C.gold)),
    B([-3, 0, 13], [3, 5, 14], (x, y) => (y === 3 && x < 0 ? C.jadeL : C.jade)),
  ];
  // waist: iron lamellar under the robe (the drape leaves only the right front of it)
  T.spine = [
    B([-11, -6, -9], [11, 16, 9], C.greenD),
    ...lamellar([-12, -5, -10], [12, 16, 10], { base: C.iron, rowH: 2, pw: 3 }),
    B([-13, -6, -11], [13, 16, 11], drape(-9.6)),
  ];
  // chest: gold-trimmed black-iron lamellar, the robe draped over it, a gold 護心鏡 on the right breast, a green standing
  // collar with a gold rim, a gold cloud roundel on the back of the robe
  const mirror = [], roundel = [];
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const r = Math.hypot(x - 4, y - 4);
    if (r > 4.4) continue;
    mirror.push(B([x - 13, y + 5, 12], [x - 12, y + 6, r > 3.4 ? 13 : 14], r > 3.4 ? C.goldD : r < 1.5 ? C.jade : hash01(x, y, 3) < 0.25 ? C.goldL : C.gold));
  }
  for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) {
    const r = Math.hypot(x - 7, y - 7), a = Math.atan2(y - 7, x - 7);
    if (r > 7.4 || (r < 6.2 && Math.abs(r - 3.2 - Math.sin(a * 3) * 1.1) > 0.7)) continue;   // a ring round a three-lobed cloud
    roundel.push(B([x - 7, y + 1, -14], [x - 6, y + 2, -13], r > 6.2 ? C.goldD : C.gold));
  }
  T.chest = [
    B([-15, -4, -11], [15, 19, 11], C.ironD),
    ...lamellar([-16, -4, -12], [16, 18, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    B([-16, 17, -12], [16, 19, 12], (x, y, z) => (Math.abs(x) > 12 || Math.abs(z) > 8 ? C.gold : null)),     // gold rim round the shoulders
    ...mirror,
    B([-17, -5, -13], [17, 20, 13], drape(0)),
    ...roundel,
    // the 美髯 lying on the chest (the long strands over it are chains)
    B([-8, 2, 13], [9, 21, 16], (x, y, z) => (Math.abs(x) > 3 + (y - 2) * 0.25 || (z === 15 && Math.abs(x) > 2 + (y - 2) * 0.15) ? null : beardP(x, y, z))),
    B([-8, 17, -8], [9, 23, 8], (x, y) => (y === 22 ? C.gold : y === 17 ? C.goldD : x > -2 ? C.green : C.greenD)),   // collar
    B([-5, 16, -5], [6, 25, 5], -1),                                                                                // neck hole
  ];
  T.neck = [B([-4, -2, -4], [5, 6, 5], C.skinD), P([-4, 1, 4], [5, 6, 5], C.skin)];
  return T;
}

function limbs(T) {
  // left arm (the robe side, under the dragon pauldron): a wide green sleeve, gold hem and red lining at the flared cuff
  T.upperArmL = [
    B([-6, -24, -6], [7, 2, 7], robe),
    B([-7, -24, -7], [8, -18, 8], (x, y) => (y === -24 ? C.redD : y === -23 ? C.gold : robe(x, y, 0))),
  ];
  // right arm (the armour side): green sleeve under gold-lipped iron splints and a small iron spaulder
  T.upperArmR = [
    B([-6, -24, -6], [6, 2, 6], robe),
    ...lamellar([-6, -18, -6], [6, -5, 6], { base: C.iron, rowH: 2, pw: 3, trim: C.gold }),
    ...lamellar([-7, -6, -8], [8, 3, 8], { base: C.iron, rowH: 3, pw: 4, trim: C.gold, jag: true }),
  ];
  T.foreArmR = bracer(C.greenD, [C.iron, C.ironD, C.gold]);
  T.foreArmL = bracer(C.greenD, [C.iron, C.ironD, C.gold]);
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    T['hand' + s] = glove(sx, C.leather, C.leatherL);
    // dark-green trousers, a gold-lipped iron tasset over the outside of the thigh
    T['thigh' + s] = [
      B([-7, -36, -7], [7, 2, 7], (x, y) => (md(y + (x & 1), 7) === 0 ? C.greenD : C.pants)),
      B([-8, -32, -8], [8, -22, 8], (x, y) => (md(y - x, 6) === 0 ? C.greenD : C.pants)),
      ...lamellar([-4, -18, -8], [10, 1, 8], { base: C.iron, rowH: 3, pw: 4, trim: C.gold, jag: true }).map((b) => mirX(b, sx)),
    ];
    // black boot to the knee over the tucked trousers, an iron greave, a gold knee cop and gold trim at the top
    T['shin' + s] = [
      B([-6, -34, -6], [6, 0, 6], (x, y) => (md(y + (x & 1), 8) === 0 ? C.bootD : C.boot)),
      B([-7, -6, -7], [7, 2, 7], C.pants), B([-7, -8, -7], [7, -6, 7], C.gold),
      ...lamellar([-5, -28, 3], [5, -9, 7], { base: C.iron, rowH: 3, pw: 3, trim: C.gold }),
      B([-3, -9, 6], [3, 0, 9], (x, y) => (y === -9 ? C.goldD : x === -3 || x === 2 ? C.goldD : C.gold)),
      B([-7, -34, -7], [7, -32, 7], C.bootD),
    ];
    T['foot' + s] = boot(C.boot, C.bootD, C.bootD, { curl: true, trim: C.gold });
  }
  return T;
}

/** Left: the gold dragon pauldron (tiers of gold scale, the dragon's head on the outside facing forward, jaws open on
 *  white fangs, red eyes, horns and a spiky mane swept back, whiskers off the snout). Right: none. +x = outward. */
function pauldron(sx) {
  if (sx < 0) return [];
  const eng = (x, y, z) => (md(x + y + z, 4) === 0 ? C.goldD : md(2 * y - z, 7) === 0 ? C.goldL : C.gold);
  return [
    ...lamellar([-6, 6, -10], [7, 14, 10], { base: C.gold, rowH: 3, pw: 4, trim: C.goldD }),
    ...lamellar([-2, -4, -12], [9, 6, 12], { base: C.gold, rowH: 3, pw: 4, trim: C.goldL, jag: true }),
    B([9, 0, -9], [15, 11, 4], eng),                                             // skull
    B([10, 1, 4], [15, 8, 12], eng),                                             // snout (upper jaw)
    B([10, 8, 4], [14, 10, 9], C.goldD),                                         // brow ridge
    B([10, -3, 3], [14, 0, 10], C.goldD),                                        // lower jaw
    B([10, 0, 4], [14, 1, 11], C.mouth),                                         // open maw
    ...[5, 7, 9].map((z) => B([11, 0, z], [14, 1, z + 1], C.teeth)),              // fangs
    B([14, 5, 9], [16, 7, 12], C.goldL),                                         // nostril ridge
    B([14, 7, 2], [16, 10, 5], C.red), P([15, 8, 3], [16, 9, 4], C.eye),         // eye
    B([10, 10, -2], [12, 13, 1], C.goldL), B([10, 12, -6], [12, 15, -2], C.goldL), B([10, 14, -11], [12, 17, -6], C.goldD),   // horn
    B([8, 10, -12], [13, 14, 0], (x, y, z) => (hash01(x, y, z) < 0.3 ? null : md(z, 2) ? C.gold : C.goldD)),   // mane
    B([15, 3, 11], [18, 4, 12], C.goldL), B([17, 2, 9], [19, 3, 11], C.goldD),  // whisker
  ];
}

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  const wrap = (x, y, z) => (md(x + 2 * y + z, 7) === 0 ? C.greenD : md(x - y, 9) === 0 ? C.greenL : C.green);
  return [
    // long noble face: skull, a narrower jaw, ears
    B([-7, 1, -6], [8, 15, 6], C.skin),
    B([-6, -1, -5], [7, 3, 5], C.skin),
    B([-8, 6, -2], [9, 10, 1], C.skinD),
    ...symH(3, 6, 5, 7, 5, 6, C.skinH),                                            // cheekbones
    ...symH(5, 8, 2, 5, 5, 6, C.skinD),                                            // hollow cheeks
    // 丹鳳眼: long narrow slits, iris half hidden under a heavy lid, the outer corner sweeping up
    ...symH(2, 7, 7, 8, 5, 6, C.skinD),                                            // under-eye shade (y 10: bare lid under the brow)
    ...symH(2, 6, 8, 9, 5, 6, C.scl), ...symH(3, 5, 8, 9, 5, 6, C.iris), ...symH(3, 4, 8, 9, 5, 6, C.eye),
    ...symH(2, 6, 9, 10, 5, 6, C.eye), ...symH(6, 7, 9, 11, 5, 6, C.eye),
    // 臥蠶眉: thick, raised, the outer ends lifting
    ...symH(2, 6, 11, 13, 5, 7, C.beard, false), ...symH(6, 8, 12, 14, 5, 7, C.beard, false),
    P([0, 11, 5], [1, 13, 6], C.skinD),                                            // frown line
    // long straight nose
    B([-1, 6, 6], [2, 11, 8], C.skinH), B([-1, 4, 7], [2, 6, 9], C.skin),
    P([-2, 5, 6], [-1, 9, 8], C.skinD), P([-1, 4, 8], [0, 5, 9], C.lip), P([1, 4, 8], [2, 5, 9], C.lip),
    P([-2, 2, 5], [3, 3, 6], C.lip),                                               // stern mouth
    // moustache: from under the nose, drooping past the mouth corners
    B([-2, 3, 6], [3, 4, 8], C.beard), ...symH(3, 5, 1, 4, 5, 8, C.beard, false), ...symH(5, 6, -1, 2, 5, 8, C.beard, false),
    // beard round the jaw (up the cheeks to the sideburns), the chin tuft descending (the long strands are chains)
    B([-8, -5, -3], [9, 5, 7], (x, y, z) => (z > 3 && y >= 1 && Math.abs(x) < 5 ? null : hash01(x, y, z) < 0.1 && y < -3 ? null : beardP(x, y, z))),
    B([-5, -11, 0], [6, -5, 8], (x, y, z) => (Math.abs(x) > 5 + (y + 5) * 0.45 || z < 1 - (y + 5) * 0.6 ? null : beardP(x, y, z))),
    B([-8, 4, -4], [-7, 14, 2], beardP), B([8, 4, -4], [9, 14, 2], beardP),        // sideburns
    // 綠巾: the brow band (gold hem, a jade ornament in gold), the crown, the cloth over the topknot, falling over the
    // nape, the knot behind (its tails are chains)
    B([-8, 14, -8], [9, 17, 7], (x, y, z) => (y === 14 && z > 0 ? C.gold : wrap(x, y, z))),
    B([-2, 14, 7], [3, 18, 8], C.gold), B([-1, 15, 7], [2, 17, 9], C.jade), P([0, 16, 8], [1, 17, 9], C.jadeL),
    B([-7, 17, -7], [8, 20, 6], wrap), B([-5, 20, -5], [6, 21, 4], wrap),
    B([-3, 19, -7], [4, 23, -1], wrap), B([-2, 23, -6], [3, 24, -2], C.greenD),
    B([-8, 6, -8], [9, 14, -6], wrap),
    B([-2, 11, -10], [3, 15, -8], C.greenD), P([-2, 13, -10], [3, 14, -9], C.gold),
  ];
}

// ---------------------------------------------------------------- 青龍偃月刀 (weapon joint: shaft +Z, origin = rear grip)
function weaponGeo() {
  // shaft at 0.02 (z −0.9 … 1.4): green lacquer spiral-banded, gold rings, black cord wraps at both grips (0 and 0.62),
  // a gold-capped iron butt spike (鐏)
  const cord = (z) => (z > -6 && z < 8) || (z > 25 && z < 38);
  const shaft = vox([
    B([-1, -1, -42], [1, 1, 70], (x, y, z) => (cord(z) ? (md(z + x + y, 2) ? C.bootD : C.leather) : md(z + (x + 2 * y), 5) === 0 ? C.shaftH : C.shaft)),
    ...[-36, -14, 16, 46, 62].map((z) => B([-2, -2, z], [2, 2, z + 2], (x, y, zz) => (zz === z ? C.gold : C.goldD))),
    B([-2, -2, -42], [2, 2, -39], C.gold), B([-1, -1, -46], [1, 1, -42], C.ironL), P([-1, -1, -46], [1, 1, -45], C.ironD),
  ], 0.02, { jitter: 0.04, ao: 0.3 });
  // gold dragon head at 0.012 (z 1.36 … 1.6), its jaws round the blade's root (the blade rises along +y): a scaled neck,
  // the skull with red eyes, horns swept back down the shaft, a mane crest along the spine side
  const scale = (x, y, z) => (md(z + (x > 0 ? y : -y), 3) === 0 ? C.goldD : md(x + z, 5) === 0 ? C.goldL : C.gold);
  const dragon = vox([
    B([-3, -3, 113], [3, 3, 120], scale),
    B([-4, -5, 120], [4, 4, 128], scale),
    B([-4, -6, 128], [4, 0, 134], scale),                                           // upper jaw along the spine side
    B([-3, 3, 128], [3, 6, 133], C.goldD),                                          // lower jaw on the edge side
    B([-3, 0, 128], [3, 3, 133], C.mouth),                                          // open maw round the blade root
    B([-3, 0, 131], [-2, 2, 133], C.teeth), B([2, 0, 131], [3, 2, 133], C.teeth),
    B([-5, -3, 124], [-4, -1, 127], C.red), B([4, -3, 124], [5, -1, 127], C.red),   // eyes
    B([-4, -7, 116], [-2, -5, 124], C.goldL), B([2, -7, 116], [4, -5, 124], C.goldL),   // horns
    B([-4, -8, 110], [-2, -6, 116], C.goldD), B([2, -8, 110], [4, -6, 116], C.goldD),
    B([-1, -8, 118], [1, -6, 132], (x, y, z) => (md(z, 3) ? C.gold : null)),         // crest
  ], 0.012, { jitter: 0.05, ao: 0.35 });
  // the crescent blade at 0.011 (z 1.46 … 2.2, 2 voxels thick): the spine (−y) curving back toward the point, the belly
  // (+y) swelling to ≈ 0.26 m, bright edge rows, a spur on the spine, a green dragon inlaid along the flat (a wavy body
  // with gold scales, its head at the root)
  const bv = 0.011, z0 = Math.round(1.46 / bv), z1 = Math.round(2.2 / bv), L = z1 - z0, boxes = [];
  for (let z = z0; z < z1; z++) {
    const u = (z - z0) / L, back = Math.round(-2 - 8 * Math.pow(u, 2.2));
    const f = back + Math.max(1, Math.round(18 * Math.pow(Math.sin(Math.PI * (0.08 + 0.92 * u)), 0.72) * (1 - 0.28 * u) + 2 * (1 - u)));
    const body = back + 4 + 2.6 * Math.sin(u * 15) * (1 - u * 0.6);                 // the inlaid dragon's centre line
    boxes.push(B([-1, back, z], [1, f, z + 1], (_, y) => {
      if (y >= f - 2) return C.edge;
      if (y === back) return C.steelD;
      if (u > 0.05 && u < 0.78 && Math.abs(y + 0.5 - body) < 1.3) return md(z + y, 4) === 0 ? C.gold : C.jadeD;
      return u < 0.05 ? C.steelD : C.steel;
    }));
    if (u > 0.2 && u < 0.34) {                                                      // spur on the spine, hooked toward the point
      const k = Math.round((u - 0.2) / 0.14 * 5);
      boxes.push(B([-1, back - k, z], [1, back, z + 1], C.steelD));
    }
  }
  const hz = z0 + 4, hy = -2 + 4;                                                  // the dragon's head at the root: jade, a gold eye
  boxes.push(B([-1, hy - 2, hz], [1, hy + 3, hz + 5], C.jadeD), B([-1, hy, hz + 5], [1, hy + 2, hz + 7], C.jadeD), P([-1, hy + 1, hz + 2], [1, hy + 2, hz + 3], C.gold));
  const blade = vox(boxes, bv, { jitter: 0.03, ao: 0.2 });
  return [{ geo: shaft, mat: 'body' }, { geo: dragon, mat: 'metal' }, { geo: blade, mat: 'blade' }];
}

// ---------------------------------------------------------------- chain segments (local −Y along the chain)
/** 美髯 strand slab: black strands (every 3rd column lighter), w0 → 1 half-width down the chain, the tip frayed. */
const beard = (w0) => (i, n) => {
  const w = Math.max(2, Math.round(w0 - (i * (w0 - 2)) / Math.max(1, n - 1))), tip = i === n - 1;
  return vox([B([-w, -6, -1], [w, 0, 2], (x, y, z) => (tip && y < -2 && hash01(x, z, 11) < 0.25 + (-2 - y) * 0.18 ? null : beardP(x, y, z)))],
    FV, { off: [0, 0, 0], jitter: 0.06, ao: 0.3 });
};
/** Head-wrap tail: a thin green strip, the gold-hemmed end cut in a point. */
const wrapTail = (i, n) => vox([B([-2, -7, 0], [2, 0, 1], (x, y) => (i === n - 1 && y <= -6 && (x === -2 || x === 1) ? null : i === n - 1 && y <= -5 ? C.gold : x === -2 ? C.greenD : C.green))],
  FV, { off: [0, 0, -0.5], jitter: 0.04, ao: 0.15 });
/** Robe panel w half-width: green with gold side borders, the last segment a gold-and-jade hem; red lining behind. */
const panel = (w) => (i, n) => {
  const last = i === n - 1;
  return vox([
    B([-w, -11, 0], [w, 0, 1], (x, y) => (last && y === -11 && md(x, 2) ? null : last && y <= -9 ? (y === -10 ? C.jade : C.gold)
      : x === -w || x === w - 1 ? C.gold : robe(x, y - i * 11, 5))),
    B([-w + 1, -11, -1], [w - 1, 0, 0], C.redD),
  ], FV, { off: [0, 0, -0.5], jitter: 0.04, ao: 0.2 });
};
/** Red silk tassel strand. */
const tassel = (i, n) => vox([B([-1, -6, -1], [2, 0, 2], (x, y, z) => (i === n - 1 && y < -3 && hash01(x + 3, z + 3, y) < 0.4 ? null : md(x + z, 3) === 0 ? C.redL : md(x - z, 4) === 0 ? C.redD : C.red))],
  0.012, { jitter: 0.06, ao: 0.2 });

export const GUANYU_DEF = {
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, pauldron, weapon: weaponGeo() }),
  chains() {
    const out = [];
    const hips = ['hips', ['thighL', 0.02], ['thighR', 0.02], ['kneeL', 0.03], ['kneeR', 0.03]];
    // 美髯: one long heavy centre fall from the chin to the belt, two shorter side falls — they lie on the chest and swing
    out.push({ joint: 'head', anchor: [0, -9 * HV, 3 * HV], rest: [0, -1, 0.3], n: 8, len: 0.058, stiff: 0.16, drag: 0.18, wind: 0.5, grav: 1.3, cone: 50,
      sway: 0.06, face: [0, 0, 1], seg: beard(7), hit: [['chest', 0.03], ['hips', 0.05]] });
    for (const sx of [-1, 1]) {
      out.push({ joint: 'head', anchor: [sx * 3.5 * HV, -6 * HV, 3 * HV], rest: [sx * 0.12, -1, 0.3], n: 5, len: 0.056, stiff: 0.14, drag: 0.18, wind: 0.6, grav: 1.2,
        cone: 55, sway: 0.08, face: [0, 0, 1], seg: beard(3), hit: [['chest', 0.03], ['hips', 0.05]] });
    }
    // the head wrap's two tails from the knot behind
    for (const sx of [-1, 1]) {
      out.push({ joint: 'head', anchor: [sx * 1.5 * HV, 13 * HV, -9 * HV], rest: [sx * 0.2, -1, -0.4], n: 4, len: 0.075, stiff: 0.06, drag: 0.08, wind: 1.8,
        cone: 110, sway: 0.45, face: [0, 0, -1], seg: wrapTail, hit: ['head', ['chest', 0.03]] });
    }
    // robe skirt panels: a broad one behind (to the shins), two in front either side of the slit, one each side
    out.push({ joint: 'hips', anchor: [-0.075, -0.13, -0.145], rest: [-0.16, -1, -0.08], n: 4, len: 0.13, stiff: 0.16, drag: 0.22, wind: 1.1, cone: 80, sway: 0.2,
      face: [0, 0, -1], seg: panel(14), hit: hips });
    for (const sx of [-1, 1]) {
      out.push({ joint: 'hips', anchor: [sx * 0.07, -0.19, 0.15], rest: [sx * 0.05, -1, 0.12], n: 4, len: 0.12, stiff: 0.13, drag: 0.18, wind: 0.5, cone: 70,
        sway: 0.1, face: [0, 0, 1], seg: panel(6), hit: hips.slice(1) });
      out.push({ joint: 'hips', anchor: [sx * 0.17, -0.19, -0.01], rest: [sx * 0.25, -1, 0], n: 3, len: 0.12, stiff: 0.13, drag: 0.18, wind: 0.8, cone: 70,
        sway: 0.12, face: [sx, 0, 0], seg: panel(7), hit: hips });
    }
    // the red tassel under the dragon's jaws
    for (let k = 0; k < 5; k++) {
      const a = k * 1.2566 + 0.4, ox = Math.cos(a) * 0.015, oy = Math.sin(a) * 0.015;
      out.push({ joint: 'weapon', anchor: [ox, oy, 1.34], rest: [ox * 10, oy * 5 - 1, -0.3], n: 3, len: 0.072, stiff: 0.05 + k * 0.005, drag: 0.12, wind: 0.8,
        cone: 130, sway: 0.15, face: [1, 0, 0], seg: tassel });
    }
    return out;
  },
};

// ---------------------------------------------------------------- HUD portrait (20 × 20): the green wrap with its jade
// ornament, silkworm brows and phoenix eyes in a jujube-red face, the long black beard; iron on his right shoulder, the
// gold dragon and the green robe on his left
export const FACE = [
  '.......GGGGGG.......',
  '.....GGGGgGGGGG.....',
  '....GGGgGGGGgGGG....',
  '...GGGGGGGGGGGGGG...',
  '...YYYYYYJJYYYYYY...',
  '...GSSSSSSSSSSSSG...',
  '...KKKKKSSSSKKKKK...',
  '...KSSEEWSSWEESSK...',
  '...KSSSSSssSSSSSK...',
  '...KhSSSSssSSSShK...',
  '...KKSSKKKKKKSSKK...',
  '...KKKKKMMMMKKKKK...',
  '....KKKKKKKKKKKK....',
  'II..KKKKKKKKKKKK..DD',
  'IIi..KKKKKKKKKK..DdD',
  'IiIY..KKKkKKKK..RDDD',
  'IIiIY..KKKKKK..RRdDD',
  'IiIIIY..KKKK..RRRDDd',
  'IIiIIIY..KK..YRRRRDD',
  'IiIIIIIY.KK.YRRRRRRD',
];
export const PAL = { G: '#2f7a46', g: '#1d4f2e', Y: '#d0a445', J: '#4cc48a', K: '#0e0b0d', k: '#2e282c', S: '#a3342a', s: '#74201a', h: '#c0503f',
  W: '#efe4d4', E: '#0a0606', M: '#3e0c0a', I: '#3a3d46', i: '#5a5e6c', D: '#c8a040', d: '#7a5a20', R: '#2f7a46' };
