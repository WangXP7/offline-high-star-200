// 張遼 文遠 (NPC model def: ./kit.js header, polearm class ./polearm.js), fine voxels (chars/parts.js FV) on the shared rig,
// kit scale 1.1 — the 赤壁 boss, Wei's coldest blade. A lean, stern face (hollow cheeks, narrow eyes under brows slanting
// up, a long straight nose, a thin moustache and a short trimmed jaw beard) under a black-iron helmet: steel-ribbed
// bowl, steel brow band with a dull-gold plate, cheek guards and a neck guard, and a tall gold crest tube whose long
// horsehair plume (blue-black at the root, white at the tips) streams back in spring chains. Blue-black iron lamellar
// with steel plate lips over a deep navy robe: twin steel chest mirrors rimmed in gold, a raised gorget, leather cross
// straps behind; three-tier plated pauldrons on both shoulders with an upswept steel ridge and a gold boss; a long
// lamellar skirt (short and open in front), a leather belt with a round gold buckle, slate-blue sash tails; lamellar
// sleeves, steel-edged bracers, navy trousers with iron tassets, steel greaves, black boots. A dark navy cape in three
// panels. Weapon: the 鉤鐮刀 halberd — black lacquered shaft with steel bands and leather grips, a dull-gold collar, a
// long leaf spear point, a crescent moon-blade on the −X side (horns turned out) and a back hook on +X; dark blue
// ribbons hang under the head.
import { vox, B, P, md, mirX, lamellar } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, glove, bracer, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0xd6a47e, skinD: 0xb07a58, skinH: 0xe6b690, lip: 0x8a4a3e, mouth: 0x2a0e0a, eye: 0x0c0a0a, scl: 0xe8e0d2,
  beard: 0x121014, beardH: 0x2a2630,
  iron: 0x1e2840, ironD: 0x0f131d, ironL: 0x344262, lipB: 0x56647e,
  steel: 0x8a95a8, steelL: 0xc8d2e0, steelD: 0x5a6476,
  navy: 0x1d2d52, navyD: 0x121c36, navyL: 0x2c4274,
  slate: 0x3c5a8a, slateL: 0x5a7aa8,
  gold: 0x9c7c3c, goldD: 0x5e4822, goldL: 0xc8a258,
  leather: 0x2c2420, leatherL: 0x4a3a30, boot: 0x19171a, bootD: 0x0f0e10,
  plume: 0x141a2c, plumeM: 0x5a6680, plumeW: 0xe8ecf2,
  shaft: 0x16161c, shaftH: 0x262630, edge: 0xf2f6fa, blade: 0xb8c2d0, fuller: 0x5c6676,
};
const robe = (x, y, z) => (md(x * 2 + y + z * 3, 13) === 0 ? C.navyL : md(x - y * 2 + z, 9) === 0 ? C.navyD : C.navy);
const beardP = (x, y, z) => (md(x * 3 + y + z, 4) === 0 ? C.beardH : C.beard);
/** Lamellar (hero/model.js) whose plate lips are dull blue steel instead of a lighter iron: dark seams kept, the trim row kept. */
function plates(a, b, o) {
  const rowH = o.rowH ?? 3, pw = o.pw ?? 4, seam = (x, y, z) => md(x + z + (Math.floor((y - a[1]) / rowH) & 1) * (pw >> 1), pw) === 0;
  return lamellar(a, b, o).map((bx, i) => (i === 0 ? bx : { ...bx, c: (x, y, z) => {
    const c = bx.c(x, y, z);
    return c == null || (o.trim != null && c === o.trim && y === a[1]) ? c : seam(x, y, z) ? C.ironD : C.lipB;
  } }));
}

// ---------------------------------------------------------------- body (FV, centred on the joints)
function torso() {
  const T = {};
  // hips: navy robe; a long lamellar skirt, open and short in front (the thighs stride free); leather belt with steel
  // studs and a round dull-gold buckle
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.navyD),
    ...plates([-15, -22, -11], [15, -2, 11], { base: C.iron, rowH: 3, pw: 3, trim: C.gold, jag: true }),
    B([-9, -23, 5], [9, -8, 13], -1),                                       // front opening
    ...plates([-8, -12, 9], [8, -2, 11], { base: C.iron, rowH: 3, pw: 3, trim: C.steel, lipZ: false }),   // short front apron
    B([-16, -2, -12], [16, 4, 12], (x, y, z) => (y === -2 || y === 3 ? C.leatherL : md(x + z, 5) === 0 && y === 1 ? C.steelL : C.leather)),
    ...(() => { const d = []; for (let y = -4; y < 7; y++) for (let x = -5; x < 6; x++) {
      const r = Math.hypot(x, y - 1); if (r > 5.4) continue;
      d.push(B([x, y, 12], [x + 1, y + 1, r < 2 ? 15 : 14], r > 4.4 ? C.goldD : r < 2 ? C.goldL : C.gold)); } return d; })(),
  ];
  // waist: belly lamellar over the robe, a slate-blue sash band
  T.spine = [
    B([-11, -6, -9], [11, 14, 9], C.navyD),
    ...plates([-11, -4, -9], [11, 10, 9], { base: C.iron, rowH: 2, pw: 3 }),
    B([-12, 10, -10], [12, 14, 10], (x, y) => (y === 10 ? C.navyD : md(x, 6) === 0 ? C.slateL : C.slate)),
  ];
  // chest: blue-black cuirass, steel-lipped plate rows, twin steel mirrors with gold rims and bosses, steel shoulder
  // straps, a raised gorget, leather cross straps on the back
  const mirror = [];
  for (const cx of [-6, 7]) for (let y = 4; y < 15; y++) for (let x = cx - 5; x < cx + 5; x++) {
    const r = Math.hypot(x + 0.5 - cx, y + 0.5 - 9.5);
    if (r > 4.9) continue;
    mirror.push(B([x, y, 12], [x + 1, y + 1, r < 1.6 ? 15 : 14], r > 4 ? C.gold : r < 1.6 ? C.goldL : hash01(x, y, 3) < 0.15 ? C.steel : r < 2.6 ? C.steelD : C.steelL));
  }
  T.chest = [
    B([-15, -4, -11], [15, 18, 11], C.ironD),
    ...plates([-15, -3, -11], [15, 5, 11], { base: C.iron, rowH: 2, pw: 3 }),
    ...plates([-16, 5, -12], [16, 17, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.goldD }),
    ...mirror,
    ...[-1, 1].flatMap((sx) => [mirX(B([9, 15, -13], [13, 19, 13], C.steel), sx), mirX(B([10, 16, -14], [12, 18, 14], C.steelD, true), sx)]),
    B([-9, 16, -9], [9, 23, 9], (x, y) => (y === 22 ? C.steelL : y === 16 ? C.ironD : C.iron)),   // gorget
    B([-6, 15, -6], [6, 25, 6], -1),                                                            // neck hole
    ...Array.from({ length: 14 }, (_, i) => B([-11 + i * 1.6 | 0, 15 - i, -13], [(-11 + i * 1.6 | 0) + 2, 16 - i, -12], C.leatherL)),   // back straps ╲
    ...Array.from({ length: 14 }, (_, i) => B([9 - i * 1.6 | 0, 15 - i, -13], [(9 - i * 1.6 | 0) + 2, 16 - i, -12], C.leather)),        // ╱
  ];
  T.neck = [B([-5, -2, -5], [5, 6, 5], C.skinD), P([-5, 1, 4], [5, 6, 5], C.skin)];
  return T;
}

function limbs(T) {
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    // navy sleeves under steel-lipped lamellar; steel-edged iron bracers; leather gloves
    T['upperArm' + s] = [
      B([-6, -24, -6], [6, 2, 6], robe), B([-7, -19, -7], [7, -7, 7], robe),
      ...plates([-6, -17, -6], [6, -3, 6], { base: C.iron, rowH: 2, pw: 3, trim: C.steel }),
    ];
    T['foreArm' + s] = bracer(C.skinD, [C.iron, C.ironD, C.steel]);
    T['hand' + s] = glove(sx, C.leather, C.leatherL);
    // navy trousers, iron tassets over the outer thigh
    T['thigh' + s] = [
      B([-7, -36, -7], [7, 2, 7], (x, y) => (md(y + (x & 1), 6) === 0 ? C.navyD : C.navy)),
      B([-8, -31, -8], [8, -20, 8], (x, y) => (md(y - x, 5) === 0 ? C.navyD : C.navy)),
      ...plates([-5, -17, -7], [9, 0, 8], { base: C.iron, rowH: 2, pw: 3, trim: C.steel, jag: true }).map((b) => mirX(b, sx)),
    ];
    // black boot shaft, steel greave plates on the front, a steel knee cop with a gold rivet
    T['shin' + s] = [
      B([-6, -34, -6], [6, 0, 6], C.boot),
      B([-7, -7, -7], [7, 2, 7], C.navy), B([-7, -9, -7], [7, -7, 7], C.slate),
      ...plates([-6, -29, 3], [6, -10, 7], { base: C.iron, rowH: 3, pw: 3 }),
      B([-3, -10, 6], [3, 1, 9], (x, y) => (y === -10 ? C.steelD : C.steel)), P([-1, -5, 8], [1, -3, 9], C.gold),
      B([-7, -34, -7], [7, -32, 7], C.bootD),
    ];
    T['foot' + s] = boot(C.boot, C.bootD, C.bootD, { trim: C.steel });
  }
  return T;
}

/** Both shoulders: three tiers of steel-lipped plates, an upswept steel ridge along the top, a round gold boss on the
 *  outside. Authored with +x outward. */
function pauldron(sx) {
  const boss = [];
  for (let y = 0; y < 9; y++) for (let z = -4; z < 5; z++) {
    const r = Math.hypot(y - 4, z - 0.5);
    if (r <= 4.2) boss.push(B([12, y, z], [r < 1.8 ? 15 : 14, y + 1, z + 1], r > 3.3 ? C.goldD : r < 1.8 ? C.goldL : C.gold));
  }
  return [
    ...plates([-6, 6, -10], [7, 14, 10], { base: C.iron, rowH: 3, pw: 4, trim: C.steel }),
    ...plates([-2, -2, -12], [11, 7, 12], { base: C.iron, rowH: 3, pw: 4, trim: C.steel }),
    ...plates([3, -10, -13], [13, -2, 13], { base: C.iron, rowH: 3, pw: 4, trim: C.gold, jag: true }),
    B([-4, 14, -11], [9, 16, 11], C.steel), B([2, 16, -10], [11, 18, 10], C.steelL),     // upswept ridge
    B([9, 15, -12], [13, 20, 12], (x, y) => (y === 19 ? C.steelL : C.steel)),
    ...boss,
  ].map((b) => mirX(b, sx));
}

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  const helm = (x, y, z) => (md(Math.round(Math.atan2(x - 0.5, z) * 4), 3) === 0 ? C.steelD : y === 11 ? C.ironD : C.iron);
  const flap = (x, y, z) => (md(y, 3) === 0 ? C.steelD : md(x + z + (Math.floor(y / 3) & 1) * 2, 4) === 0 ? C.ironD : C.iron);
  return [
    // lean skull and jaw, cheekbones catching the light, hollow cheeks, ears
    B([-6, 2, -6], [7, 13, 6], C.skin),
    B([-6, 0, -4], [7, 5, 5], C.skin), B([-3, -1, -2], [4, 1, 5], C.skin),
    B([-7, 5, -2], [8, 9, 1], C.skinD),
    ...symH(4, 7, 6, 8, 4, 6, C.skinH), ...symH(4, 7, 3, 6, 4, 6, C.skinD),
    // stern narrow eyes, lids, brows slanting up and out, a furrow
    ...symH(2, 5, 7, 8, 5, 6, C.scl), ...symH(2, 4, 7, 8, 5, 6, C.eye), ...symH(1, 5, 8, 9, 5, 6, C.skinD),
    ...symH(1, 3, 9, 10, 5, 7, C.beard, false), ...symH(3, 5, 10, 11, 5, 7, C.beard, false), ...symH(5, 7, 11, 12, 4, 7, C.beard, false),
    P([0, 9, 5], [1, 11, 6], C.skinD),
    // long straight nose
    B([0, 6, 6], [1, 10, 9], C.skinH), B([0, 4, 7], [2, 6, 10], C.skin),
    P([-1, 5, 6], [0, 8, 8], C.skinD), P([1, 4, 9], [2, 5, 10], C.mouth),
    // short trimmed beard along the jaw, then the thin mouth, the moustache with drooping ends, a pointed goatee, sideburns
    B([-7, 0, -4], [8, 3, 6], beardP, true), B([-2, -3, 2], [3, 0, 6], beardP),
    P([-2, 2, 5], [3, 3, 6], C.lip), P([-1, 2, 5], [2, 3, 6], C.mouth),
    B([-3, 3, 6], [4, 4, 7], C.beard), B([-4, 1, 5], [-3, 4, 7], beardP), B([4, 1, 5], [5, 4, 7], beardP),
    B([-7, 3, -3], [-6, 9, 2], beardP), B([7, 3, -3], [8, 9, 2], beardP),
    // black-iron helmet: steel-ribbed bowl and dome, steel brow band with a dull-gold plate, cheek and neck guards
    B([-8, 11, -8], [9, 18, 8], helm), B([-6, 18, -6], [7, 20, 6], helm), B([-3, 20, -3], [4, 21, 3], C.iron),
    B([-8, 11, 7], [9, 13, 9], (x, y) => (y === 11 ? C.steelD : C.steel)),
    B([-2, 12, 8], [3, 17, 10], (x, y) => (y === 16 ? C.goldL : C.gold)), P([0, 13, 9], [1, 15, 10], C.ironD),
    B([-9, 3, -5], [-7, 12, 4], flap), B([8, 3, -5], [10, 12, 4], flap), B([-8, 2, -9], [9, 12, -6], flap),
    // the tall crest tube (the plume's root), a steel ring, a gold cap
    B([-1, 21, -2], [2, 30, 1], (x, y) => (md(y, 3) === 0 ? C.goldD : C.gold)), B([-2, 25, -3], [3, 26, 2], C.steelL),
    B([-2, 30, -3], [3, 31, 2], C.goldL),
  ];
}

// ---------------------------------------------------------------- 鉤鐮刀 (weapon joint: shaft +Z, origin = rear grip)
function weaponGeo() {
  // shaft at 0.02 (z −0.84 … 1.52): black lacquer, steel bands, leather wrap at both grips, a steel butt spike
  const shaft = vox([
    B([-1, -1, -42], [1, 1, 76], (x, y, z) => ((z > -6 && z < 8) || (z > 18 && z < 30) ? (md(z + x + y, 2) ? C.leather : C.leatherL)
      : ((z >> 1) & 1) ? C.shaftH : C.shaft)),
    ...[-34, -8, 12, 34, 58].map((z) => B([-2, -2, z], [2, 2, z + 2], (x, y, zz) => (zz === z ? C.steelL : C.steelD))),
    B([-2, -2, -42], [2, 2, -39], C.steel), B([-1, -1, -44], [1, 1, -42], C.steelL),
  ], 0.02, { jitter: 0.04, ao: 0.3 });
  // head at 0.011 (z 1.42 … 2.26): dull-gold collar, leaf spear point with a dark fuller, the crescent on −X (outer
  // circle round the shaft minus an inner circle set out along −X: two horns turned outward), a back hook on +X
  const v = 0.011, zc = Math.round(1.72 / v), boxes = [];
  boxes.push(B([-3, -3, 129], [3, 3, 142], (x, y, z) => (md(z, 4) === 0 ? C.goldD : C.gold)), B([-4, -4, 138], [4, 4, 141], C.goldL));
  const p0 = 142, p1 = Math.round(2.26 / v);
  for (let z = p0; z < p1; z++) {
    const u = (z - p0) / (p1 - p0), w = Math.max(0.5, u < 0.22 ? 1.5 + u / 0.22 * 3 : 4.5 * Math.pow((1 - u) / 0.78, 0.8));
    const a = Math.round(-w), b = Math.max(a + 1, Math.round(w));
    boxes.push(B([a, -1, z], [b, 1, z + 1], (x) => (Math.abs(x + 0.5) < 0.9 && u < 0.8 ? C.fuller : x === a || x === b - 1 ? C.edge : C.blade)));
  }
  for (let z = zc - 30; z <= zc + 30; z++) for (let m = 2; m < 28; m++) {
    const dz = z - zc, out = Math.hypot(dz, m + 4) <= 30, inn = Math.hypot(dz, m - 25) < 20;
    if (!out || inn) continue;
    const edge = Math.hypot(dz, m + 4) > 28.6 || Math.hypot(dz, m - 25) < 21.2;
    boxes.push(B([-m - 1, -1, z], [-m, 1, z + 1], edge ? C.edge : m < 4 ? C.steelD : C.blade));
  }
  for (let k = 0; k < 13; k++) {                       // the back hook: out along +X, curling down to a point
    const t = k / 12, x = 2 + Math.round(10 * Math.sin(t * 1.9)), z = zc - 8 + Math.round(4 * Math.sin(t * 2.4) - 10 * t * t), w = t > 0.8 ? 1 : 2;
    boxes.push(B([x, -1, z - w], [x + 2, 1, z + w], t > 0.85 ? C.edge : C.blade));
  }
  const head = vox(boxes, v, { jitter: 0.03, ao: 0.2 });
  return [{ geo: shaft, mat: 'body' }, { geo: head, mat: 'blade' }];
}

// ---------------------------------------------------------------- chain segments (local −Y along the chain)
const strand = (cols, v, w0 = 2) => (i, n) => {       // horsehair / silk strands: colour by segment, fraying ends
  const w = i === 0 ? w0 + 1 : w0, last = i === n - 1, c = cols[Math.min(cols.length - 1, i)];
  return vox([B([-w, -7, -w], [w, 0, w], (x, y, z) => {
    const k = hash01(x + 9, z + 9, 7);
    if (last && -y > 3 + k * 5) return null;
    if ((x === -w || x === w - 1) && (z === -w || z === w - 1) && i > 0) return null;
    return k < 0.25 ? C.plumeM : c;
  })], v, { jitter: 0.06, ao: 0.25 });
};
// Ribbed outer cape panels, flaring below the belt and split at the last segment's centre.
const cape = (i, n) => {
  const boxes = [], width = 6 + Math.round(i * 0.45);
  for (let row = 0; row < 11; row++) {
    const w = width + Math.floor(row / 4);
    for (let x = -w; x <= w; x++) {
      if (i === n - 1 && row > 8 && Math.abs(x) < 2) continue;
      const c = Math.abs(x) >= w - 1 ? C.navyD : i === n - 1 && row > 7 ? C.slateL : row % 5 === 0 ? C.navyD : C.navy;
      boxes.push(B([x, -row - 1, 0], [x + 1, -row, 2], c));
    }
  }
  return vox(boxes, FV, { jitter: 0.025, ao: 0.17 });
};
// A folded sash with a travelling diagonal edge and a pointed final tab.
const ribbon = (i, n) => {
  const cord = [];
  for (let y = -8; y < 0; y++) {
    const q = (i * 8 - y) * 0.33, x = Math.round(Math.sin(q) * 1.2), z = Math.round(Math.cos(q) * 0.8);
    cord.push(B([x - 1, y, z], [x + 2, y + 1, z + 1], y % 3 === 0 ? C.slateL : C.navyL));
  }
  return vox(cord, 0.011, { jitter: 0.02, ao: 0.17 });
};

export const DEF = {
  scale: 1.1,
  reach: { tip: 2.26, butt: 0.88 },
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, pauldron, weapon: weaponGeo() }),
  chains() {
    const out = [];
    // the long plume from the crest tube: streams back and droops, blue-black at the root, white at the tips
    const PL = strand([C.plume, C.plume, C.plume, C.plumeM, C.plumeW, C.plumeW], 0.013, 3);
    for (let k = 0; k < 7; k++) {
      const a = (k - 3) * 0.3;
      out.push({ joint: 'head', anchor: [Math.sin(a) * 1.4 * HV, 30.5 * HV, -0.5 * HV], rest: [Math.sin(a) * 0.6, 0.3, -1], n: 6, len: 0.085,
        stiff: 0.1 - Math.abs(k - 3) * 0.01, drag: 0.1, wind: 1.3, cone: 110, sway: 0.3, face: [1, 0, 0], seg: PL, hit: ['head', ['chest', 0.03]] });
    }
    // the cape: three navy panels off the back of the shoulders
    for (const x of [-0.1, 0, 0.1]) {
      out.push({ joint: 'chest', anchor: [x, 0.23, -0.155], rest: [x * 0.8, -1, -0.18], n: 6, len: 0.12, stiff: 0.16, drag: 0.22, wind: 1.1, cone: 80, sway: 0.2,
        seg: cape, hit: ['chest', 'hips', 'thighL', 'thighR', 'kneeL', 'kneeR'] });
    }

    // two dark blue cords under the halberd's collar
    for (const k of [0, 1]) {
      out.push({ joint: 'weapon', anchor: [k ? 0.02 : -0.02, 0.02, 1.43], rest: [k ? 0.3 : -0.3, -1, -0.35], n: 4, len: 0.075, stiff: 0.05, drag: 0.12, wind: 0.9, cone: 130, sway: 0.15,
        face: [1, 0, 0], seg: ribbon });
    }
    return out;
  },
};
