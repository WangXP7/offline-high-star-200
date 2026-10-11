// 夏侯淵 妙才 (NPC kit model def: ./kit.js, format as src/chars/defkit.js), fine voxels (chars/parts.js FV) on the shared
// rig, a size up (scale 1.12): 定軍山's commander, the veteran raider of 關右, in 夏侯 colours — Wei crimson under
// black iron, gold trim. A weathered, lean face under a heavy iron helm: ribbed bowl, a gold crescent crest (前立), a
// jutting visor peak, gold-edged lamellar cheek guards, neck flaps, a tall crimson plume springing from the finial;
// narrowed eyes under heavy slanted brows, a hooked nose, a drooping moustache and a full dark beard streaked with grey
// (its long ends are chains). HEAVY armour: black-iron plate rows round a crimson-lacquered breastplate framed in gold
// with a gold 夏 in relief (the house banner), a tall gold-lipped gorget, broad three-tier pauldrons capped with a domed plate, a long lamellar skirt, lamellar sleeves
// over a crimson robe, iron greaves with gold knee cops. A red-lacquered horn bow is slung diagonally across his back
// (over the crimson cape) on a leather strap crossing his chest, a crimson quiver of fletched arrows on his right hip.
// Weapon: a 大刀 great blade — dark-red lacquered shaft banded in gold, a gold beast-mouth collar biting the root of a
// broad curved single-edged blade (edge on the local −X side, a barbed back spike on +X), a crimson tassel under it.
import { vox, B, P, md, mirX, lamellar } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, glove, bracer, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0xc68e6c, skinD: 0x96644a, skinH: 0xd8a27e, lip: 0x6a3428, mouth: 0x241008, eye: 0x0a0808, iris: 0x3a2414, scl: 0xe8dccc,
  beard: 0x1a1412, beardH: 0x3a302a, grey: 0x7a726a,
  iron: 0x3e414c, ironD: 0x23252b, ironL: 0x62667a,
  gold: 0xb48a3c, goldD: 0x6c4e1e, goldL: 0xe0b85e,
  red: 0xb02c1e, redD: 0x6a1a10, redL: 0xd8462c,
  leather: 0x3a2a20, leatherL: 0x5a4030, boot: 0x1d1917, bootD: 0x121010,
  bow: 0x4a2418, bowH: 0x6e3a24, horn: 0xd8ccb0, string: 0xe6e0d0, feather: 0xf0ece2,
  shaft: 0x4a1a12, shaftH: 0x66261a, steel: 0xc6ced8, edge: 0xf6f9fc, fuller: 0x76808e,
};
const robe = (x, y, z) => (md(x * 2 + y + z * 3, 13) === 0 ? C.redL : md(x - y * 2 + z, 9) === 0 ? C.redD : C.red);
const beardP = (x, y, z) => (md(x * 5 + y * 3 + z, 7) === 0 ? C.grey : md(x * 3 + y + z, 4) === 0 ? C.beardH : C.beard);
// 夏 as a 7 × 9 relief, row 0 = top
const XIA = ['XXXXXXX', '...X...', '.XXXXX.', '.X...X.', '.XXXXX.', '.X...X.', '.XXXXX.', '..X.X..', 'XX...XX'];
const plate = (x, y) => (md(y, 5) === 0 ? C.ironD : x === 0 ? C.ironL : C.iron);   // riveted plate rows, a raised centre ridge

// ---------------------------------------------------------------- body (FV, centred on the joints)
function torso() {
  const T = {};
  // hips: long lamellar skirt round the back and sides, a shorter front panel (the thighs stride free), iron belt with a
  // gold plaque and a red gem, the crimson sash knot (its tails are chains), the quiver on the right hip
  const quiver = [];
  for (let y = -20; y < 4; y += 2) {                                  // leaning back as it rises
    const dz = Math.round((y + 20) * 0.25);
    quiver.push(B([-19, y, -9 - dz], [-13, y + 2, -3 - dz], (x, yy) => (y === -20 || y === 2 ? C.goldD : md(yy, 8) === 0 ? C.gold : x === -19 ? C.redD : C.red)));
  }
  for (const [x, z, c] of [[-18, -10, C.feather], [-16, -11, C.red], [-17, -8, C.feather], [-15, -9, C.feather]]) {
    quiver.push(B([x, 4, z], [x + 1, 7, z + 1], C.bow), B([x - 1, 7, z - 1], [x + 2, 12, z + 1], c));   // shafts, fletchings
  }
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.redD),
    ...lamellar([-15, -21, -11], [15, -1, 2], { base: C.iron, rowH: 3, pw: 3, trim: C.gold, jag: true }),
    ...lamellar([-14, -11, 2], [14, -1, 11], { base: C.iron, rowH: 3, pw: 3, trim: C.gold }),
    B([-15, -1, -11], [15, 5, 11], (x, y, z) => (y === -1 || y === 4 ? C.goldD : y === 2 && md(x + z, 4) === 0 ? C.goldL : C.ironD)),
    B([-4, -3, 11], [5, 6, 13], (x, y) => (y === -3 || y === 5 || x === -4 || x === 4 ? C.goldD : C.gold)),
    P([-1, 0, 12], [2, 3, 13], C.redL),
    B([5, -4, 11], [9, 4, 14], C.red), P([5, 0, 13], [9, 1, 14], C.redL),
    ...quiver,
  ];
  T.spine = [
    B([-11, -6, -9], [11, 14, 9], C.redD),
    ...lamellar([-11, -4, -9], [11, 10, 9], { base: C.iron, rowH: 2, pw: 3 }),
    B([-12, 10, -10], [12, 14, 10], (x, y) => (y === 10 ? C.redD : md(x, 5) === 0 ? C.redL : C.red)),
  ];
  // chest: black-iron plate rows, a crimson-lacquered breastplate framed in gold with a gold 夏 in relief (the house
  // banner), gold shoulder straps, a tall gorget, the bow strap across from the left shoulder to the right ribs
  const panel = [B([-8, 4, 12], [9, 18, 14], (x, y) => (y === 4 || y === 17 || x === -8 || x === 8 ? C.gold : y === 5 || x === -7 || x === 7 ? C.goldD : C.red))];
  XIA.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') panel.push(B([c - 3, 15 - r, 14], [c - 2, 16 - r, 15], C.goldL)); }));
  const strap = Array.from({ length: 18 }, (_, i) => { const x = 13 - Math.round(i * 1.6), y = 18 - Math.round(i * 1.25);
    return B([x, y, 12], [x + 2, y + 1, 15], i % 4 ? C.leather : C.goldD); });
  // the bow on the back (z −21 … −19): a recurve arc from the right shoulder down past the left hip, string inside
  const bow = [], A = [16, -24], Z = [-14, 36], L = Math.hypot(Z[0] - A[0], Z[1] - A[1]), nx = (Z[1] - A[1]) / L, ny = -(Z[0] - A[0]) / L;
  for (let k = 0; k <= 60; k++) {
    const u = k / 60, bend = 7 * Math.sin(Math.PI * u) - (u < 0.1 ? (0.1 - u) * 40 : u > 0.9 ? (u - 0.9) * 40 : 0);
    const x = Math.round(A[0] + (Z[0] - A[0]) * u + nx * bend), y = Math.round(A[1] + (Z[1] - A[1]) * u + ny * bend);
    const c = u < 0.06 || u > 0.94 ? C.horn : Math.abs(u - 0.5) < 0.07 ? C.red : md(k, 9) === 0 ? C.goldD : k & 1 ? C.bowH : C.bow;
    bow.push(B([x - 1, y - 1, -23], [x + 2, y + 2, -20], c));
    if (k > 1 && k < 59) { const sx = Math.round(A[0] + (Z[0] - A[0]) * u + nx * 0.5), sy = Math.round(A[1] + (Z[1] - A[1]) * u + ny * 0.5);
      bow.push(B([sx, sy, -22], [sx + 1, sy + 1, -21], C.string)); }
  }
  T.chest = [
    B([-15, -4, -11], [15, 18, 11], C.ironD),
    ...lamellar([-15, -3, -11], [15, 5, 11], { base: C.iron, rowH: 2, pw: 3 }),
    ...lamellar([-16, 5, -12], [16, 17, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    ...panel,
    ...[-1, 1].flatMap((sx) => [mirX(B([9, 15, -13], [13, 19, 13], C.gold), sx), mirX(B([10, 16, -14], [12, 18, 14], C.goldD, true), sx)]),
    B([-10, 16, -10], [10, 25, 10], (x, y) => (y === 24 ? C.goldL : y === 16 || y === 20 ? C.goldD : C.iron)),   // gorget
    B([-7, 15, -7], [7, 27, 7], -1),
    ...strap,
    B([-12, -2, -15], [12, 16, -12], plate),                        // back plate under the bow
    ...bow,
  ];
  T.neck = [B([-5, -2, -5], [5, 6, 5], C.skinD), P([-5, 1, 4], [5, 6, 5], C.skin)];
  return T;
}

function limbs(T) {
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    // crimson robe sleeves under lamellar, a gold band at the elbow; iron-and-gold bracers; leather gauntlets
    T['upperArm' + s] = [
      B([-6, -24, -6], [6, 2, 6], robe), B([-7, -19, -7], [7, -7, 7], robe),
      ...lamellar([-6, -18, -6], [6, -3, 6], { base: C.iron, rowH: 2, pw: 3, trim: C.gold }),
      B([-7, -24, -7], [7, -22, 7], C.goldD),
    ];
    T['foreArm' + s] = bracer(C.redD, [C.iron, C.ironD, C.gold]);
    T['hand' + s] = glove(sx, C.leather, C.leatherL);
    // crimson trousers, lamellar tassets over the front and outside of the thigh
    T['thigh' + s] = [
      B([-7, -36, -7], [7, 2, 7], (x, y) => (md(y + (x & 1), 6) === 0 ? C.redD : C.red)),
      B([-8, -31, -8], [8, -20, 8], (x, y) => (md(y - x, 5) === 0 ? C.redD : C.red)),
      ...lamellar([-5, -19, -7], [9, 0, 8], { base: C.iron, rowH: 2, pw: 3, trim: C.gold, jag: true }).map((b) => mirX(b, sx)),
      ...lamellar([-7, -16, 5], [7, 0, 9], { base: C.iron, rowH: 2, pw: 3, trim: C.gold, lipX: false }),
    ];
    // heavy iron greaves front and outside, gold knee cops with a red boss, black boots
    T['shin' + s] = [
      B([-6, -34, -6], [6, 0, 6], C.boot),
      B([-7, -7, -7], [7, 2, 7], C.red), B([-7, -9, -7], [7, -7, 7], C.redD),
      B([-7, -31, -1], [7, -9, 8], plate), B([-7, -31, -2], [7, -29, 8], C.goldD),
      B([-3, -11, 7], [3, 1, 10], (x, y) => (y === -11 || y === 0 ? C.goldD : C.gold)), P([-1, -6, 9], [1, -4, 10], C.red),
      B([-7, -34, -7], [7, -32, 7], C.bootD),
    ];
    T['foot' + s] = [...boot(C.boot, C.bootD, C.bootD, { trim: C.gold }), B([-5, -2, 7], [5, 1, 15], C.iron)];
  }
  return T;
}

/** Broad three-tier pauldron under a domed, gold-rimmed cap plate (the same both sides). Authored with +x outward. */
function pauldron(sx) {
  return [
    B([-4, 10, -9], [9, 14, 9], (x, y, z) => (y === 10 || Math.abs(z) === 9 ? C.goldD : md(x + z, 6) === 0 ? C.ironL : C.iron)),
    B([-2, 14, -7], [7, 16, 7], (x, y, z) => (md(x - z, 5) === 0 ? C.ironL : C.iron)),
    B([2, 16, -3], [5, 17, 3], C.gold),
    ...lamellar([-3, 4, -11], [11, 10, 11], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    ...lamellar([0, -2, -12], [13, 4, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold }),
    ...lamellar([3, -8, -12], [15, -2, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.gold, jag: true }),
    B([12, 5, -3], [14, 9, 3], C.gold), P([13, 6, -1], [14, 8, 1], C.red),         // gold boss with a red stone
  ].map((b) => mirX(b, sx));
}

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  const helm = (x, y, z) => (md(Math.round(Math.atan2(x - 0.5, z) * 5), 3) === 0 ? C.ironL : y === 12 ? C.ironD : C.iron);
  const flap = (x, y, z) => (md(y, 3) === 0 ? C.ironD : md(x + z + (Math.floor(y / 3) & 1) * 2, 4) === 0 ? C.ironD : C.iron);
  const crest = [];
  for (let x = -7; x < 8; x++) {                                     // gold crescent crest (前立) rising from the brow
    const d = Math.abs(x - 0.5), lo = 14 + Math.round(d * 0.5), hi = 16 + Math.round(d * 0.95);
    crest.push(B([x, lo, 10], [x + 1, hi, 11], (xx, y) => (y === hi - 1 ? C.goldL : d < 1.5 && y === lo ? C.red : C.gold)));
  }
  return [
    // lean skull and jaw, cheekbones, the lines of a campaigner's face
    B([-7, 2, -6], [8, 13, 6], C.skin),
    B([-7, 0, -5], [8, 6, 5], C.skin),
    ...symH(4, 7, 5, 7, 5, 6, C.skinH),
    ...symH(3, 4, 2, 6, 5, 6, C.skinD), ...symH(5, 7, 8, 9, 5, 6, C.skinD),        // nasolabial lines, crow's feet
    // narrowed eyes under heavy slanted brows (low inside: a hard stare)
    ...symH(1, 5, 8, 10, 5, 6, C.scl), ...symH(2, 4, 8, 10, 5, 6, C.iris), ...symH(2, 3, 8, 9, 5, 6, C.eye),
    ...symH(1, 5, 10, 11, 5, 6, C.skinD),
    ...symH(1, 3, 11, 12, 5, 7, C.beard, false), ...symH(3, 6, 12, 13, 5, 7, C.beard, false),
    P([0, 11, 5], [1, 13, 6], C.skinD),
    // hooked nose
    B([0, 5, 6], [1, 11, 7], C.skin), B([-1, 4, 6], [2, 7, 8], C.skin), P([-1, 4, 7], [0, 5, 8], C.skinD), P([1, 4, 7], [2, 5, 8], C.skinD),
    // mouth, drooping moustache, full beard (grey-streaked) round the jaw; the long ends are chains
    P([-2, 2, 5], [3, 3, 6], C.mouth), P([-2, 1, 5], [3, 2, 6], C.lip),
    B([-3, 3, 6], [4, 5, 8], beardP), B([-5, 0, 5], [-3, 4, 8], beardP), B([4, 0, 5], [6, 4, 8], beardP),
    B([-8, -6, -3], [9, 4, 7], (x, y, z) => (z > 4 && y >= 1 && Math.abs(x - 0.5) < 4 ? null : hash01(x, y, z) < 0.1 && y < -2 ? null : beardP(x, y, z))),
    B([-5, -8, 0], [6, -6, 7], (x, y, z) => (hash01(x, z, y) < 0.3 ? null : beardP(x, y, z))),
    B([-8, 3, -4], [-6, 11, 3], beardP), B([7, 3, -4], [9, 11, 3], beardP),
    // heavy iron helm: ribbed bowl, dome, gold finial (the plume's anchor), a jutting visor peak, gold brow band, the crest
    B([-9, 12, -8], [10, 19, 8], helm), B([-7, 19, -6], [8, 21, 6], helm), B([-4, 21, -3], [5, 22, 3], C.iron),
    B([-1, 22, -1], [2, 25, 2], C.gold), B([-2, 22, -2], [3, 23, 3], C.goldD),
    B([-9, 12, 7], [10, 14, 9], (x, y) => (y === 12 ? C.goldD : C.gold)),
    B([-8, 12, 9], [9, 13, 12], C.ironD),
    ...crest,
    // deep cheek guards closing round the face (forward to the beard), neck flaps round the back
    B([-11, 2, -4], [-9, 13, 4], flap), B([10, 2, -4], [12, 13, 4], flap),
    B([-11, 2, 3], [-9, 13, 5], (x, y) => (y === 2 ? C.goldD : C.gold)), B([10, 2, 3], [12, 13, 5], (x, y) => (y === 2 ? C.goldD : C.gold)),
    B([-10, 0, -10], [11, 13, -7], flap),
  ];
}

// ---------------------------------------------------------------- 大刀 (weapon joint: shaft +Z, origin = rear grip)
function weaponGeo() {
  // shaft at 0.02 (z −0.84 … 1.48): dark-red lacquer, gold bands, black cord wrap at both grips, gold butt spike
  const shaft = vox([
    B([-1, -1, -42], [1, 1, 74], (x, y, z) => ((z > -6 && z < 8) || (z > 14 && z < 30) ? (md(z + x + y, 2) ? C.bootD : C.leather)
      : ((z >> 1) & 1) ? C.shaftH : C.shaft)),
    ...[-36, -10, 10, 32, 54, 70].map((z) => B([-2, -2, z], [2, 2, z + 2], (x, y, zz) => (zz === z ? C.gold : C.goldD))),
    B([-2, -2, -42], [2, 2, -39], C.gold), B([-1, -1, -44], [1, 1, -42], C.goldL),
  ], 0.02, { jitter: 0.04, ao: 0.3 });
  // gold beast-mouth collar at 0.012 (z 1.40 … 1.60): a maned head, red eyes, fangs, the blade's root in its jaws
  const scale = (x, y, z) => (md(z + x, 3) === 0 ? C.goldD : md(x - z + y, 5) === 0 ? C.goldL : C.gold);
  const collar = vox([
    B([-3, -3, 117], [3, 3, 122], scale),
    B([-4, -4, 122], [4, 4, 130], scale),
    B([-5, -4, 122], [-4, 4, 127], C.goldD), B([4, -4, 122], [5, 4, 127], C.goldD),   // mane
    B([-4, -3, 130], [4, 3, 134], C.mouth),                                           // open jaws
    B([-4, 3, 130], [4, 5, 134], scale), B([-4, -5, 130], [4, -3, 133], C.goldD),
    B([-3, 2, 133], [-2, 4, 135], C.edge), B([2, 2, 133], [3, 4, 135], C.edge),      // fangs
    B([-5, 1, 126], [-4, 3, 128], C.red), B([4, 1, 126], [5, 3, 128], C.red),       // eyes
  ], 0.012, { jitter: 0.05, ao: 0.35 });
  // the blade at 0.011 (z 1.50 … 2.26): the back straight at x +2, the edge sweeping out to −X in a broad convex belly
  // and back in to the point; a dark fuller near the back, a bright edge band, a barbed spike off the back near the root
  const bv = 0.011, z0 = Math.round(1.5 / bv), z1 = Math.round(2.26 / bv), boxes = [];
  for (let z = z0; z < z1; z++) {
    const u = (z - z0) / (z1 - z0), taper = u > 0.82 ? Math.pow((1 - u) / 0.18, 0.75) : 1;
    const a = Math.round(2 - (5 + 10 * Math.sin(Math.PI * u * 0.85)) * taper);
    boxes.push(B([Math.min(a, 1), -1, z], [3, 1, z + 1], (x) => (x <= a + 1 ? C.edge : x >= -1 && x <= 0 && u < 0.8 ? C.fuller : x === 2 ? C.fuller : C.steel)));
    if (u > 0.08 && u < 0.24) { const w = Math.round(6 * (0.24 - u) / 0.16); if (w > 0) boxes.push(B([3, -1, z], [3 + w, 1, z + 1], (x) => (x === 2 + w ? C.edge : C.steel))); }
  }
  boxes.push(B([-3, -2, z0], [4, 2, z0 + 3], C.goldD));                              // guard plate at the root
  const blade = vox(boxes, bv, { jitter: 0.03, ao: 0.2 });
  return [{ geo: shaft, mat: 'body' }, { geo: collar, mat: 'metal' }, { geo: blade, mat: 'blade' }];
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
const beardSeg = (i, n) => {                                 // a lock of the long beard, thinning to the end
  const w = Math.max(1, 2 - (i >> 1)), last = i === n - 1;
  return vox([B([-w, -5, -1], [w, 0, 1], (x, y, z) => (last && y < -3 && hash01(x, y, 3) < 0.5 ? null : beardP(x, y, z)))], HV, { jitter: 0.05, ao: 0.25 });
};
// Ribbed outer cape panels, flaring below the belt and split at the last segment's centre.
const cape = (i, n) => {
  const boxes = [], width = 6 + Math.round(i * 0.45);
  for (let row = 0; row < 11; row++) {
    const w = width + Math.floor(row / 4);
    for (let x = -w; x <= w; x++) {
      if (i === n - 1 && row > 8 && Math.abs(x) < 2) continue;
      const c = Math.abs(x) >= w - 1 ? C.redD : i === n - 1 && row > 7 ? C.gold : row % 5 === 0 ? C.redD : C.red;
      boxes.push(B([x, -row - 1, 0], [x + 1, -row, 2], c));
    }
  }
  return vox(boxes, FV, { jitter: 0.025, ao: 0.17 });
};
// A folded sash with a travelling diagonal edge and a pointed final tab.
export const DEF = {
  scale: 1.12,
  reach: { tip: 2.26, butt: 0.88 },
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, pauldron, weapon: weaponGeo() }),
  chains() {
    const out = [];
    // crimson plume: strands springing up from the finial, arcing back
    for (let k = 0; k < 5; k++) {
      const a = k * 1.2566, ox = Math.cos(a), oz = Math.sin(a);
      out.push({ joint: 'head', anchor: [ox * 0.8 * HV, 25 * HV, oz * 0.8 * HV], rest: [ox * 0.35, 0.8, oz * 0.35 - 0.7], n: 5, len: 0.07,
        stiff: 0.14, drag: 0.1, wind: 1.3, cone: 110, sway: 0.25, grav: 0.7, face: [1, 0, 0], seg: strand(C.red, C.redL, C.redD, 0.014, 3), hit: ['head'] });
    }
    // the long ends of the beard
    for (const x of [-3, 0, 3]) {
      out.push({ joint: 'head', anchor: [x * HV, -7 * HV, 4 * HV], rest: [x * 0.06, -1, 0.3], n: 3, len: 0.05,
        stiff: 0.3, drag: 0.2, wind: 0.4, grav: 1.2, cone: 45, face: [0, 0, 1], seg: beardSeg, hit: [['chest', 0.02]] });
    }
    // crimson cape: two panels from the shoulders (the bow rides over it)
    for (const x of [-0.075, 0.075]) {
      out.push({ joint: 'chest', anchor: [x, 0.25, -0.16], rest: [x * 0.8, -1, -0.12], n: 6, len: 0.14, stiff: 0.16, drag: 0.22, wind: 1.1, cone: 80, sway: 0.2,
        seg: cape, hit: ['chest', 'hips', 'thighL', 'thighR', 'kneeL', 'kneeR'] });
    }

    // the great blade's crimson tassel under the collar
    for (let k = 0; k < 4; k++) {
      const a = k * 1.5708, ox = Math.cos(a) * 0.016, oy = Math.sin(a) * 0.016;
      out.push({ joint: 'weapon', anchor: [ox, oy, 1.4], rest: [ox * 12, oy * 4 - 1, -0.35], n: 3, len: 0.07, stiff: 0.05 + k * 0.004, drag: 0.12, wind: 0.8, cone: 130, sway: 0.15,
        face: [1, 0, 0], seg: strand(C.red, C.redL, C.redD, 0.014) });
    }
    return out;
  },
};
