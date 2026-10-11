// 曹操 孟德 (NPC model def: ./kit.js header, sword class ./sword.js), fine voxels (chars/parts.js FV) on the shared rig, a
// touch under the heroes' size (kit scale 1.04): the lord of Wei in a dark crimson-and-black robe over gold armour. A lean,
// pale, clever face — long narrow eyes slanting up at the corners, thin brows arched sharp, a straight thin nose, a thin
// moustache curling up at its tips and a pointed goatee (its point a stiff chain) — under a black lacquered 冠: a gold
// band with a red gem, a tall gold plate rising and leaning back over the crown, a gold pin through the topknot, black
// cap ribbons hanging behind the ears. Gold lamellar cuirass under the robe, worn open over it as a crossed black collar
// (右衽, the left lapel over the right) with crimson borders and gold piping, a standing black collar; wide crimson robe
// sleeves to the elbow with black cuffs, gold bracers; pauldrons of gold plate over black lacquer with a red-gemmed boss;
// the robe closed over the belly under a black belt with gold plaques and a jade buckle; black trousers under crimson
// skirt panels, gold greaves, black boots with gold trim. Chains: a long black cape lined crimson with a gold hem, the robe's front and side panels, the goatee point, the
// cap ribbons and the red tassel of the sword. Weapon: 倚天劍 — a long straight jian, the blade bright steel with a
// raised ridge and a gilt inscription near the root, a gold cloud guard, a crimson cord grip, a gold pommel.
import { vox, B, P, md, mirX, lamellar } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, glove, bracer, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0xe2b692, skinD: 0xba8a6a, skinH: 0xf2cba8, lip: 0x9a5646, mouth: 0x2a100c, eye: 0x0c0a0a, scl: 0xeae2d6,
  hair: 0x0e0c0f, hairH: 0x2c2830,
  gold: 0xc0943e, goldD: 0x7a5a22, goldL: 0xecc866,
  black: 0x18151b, blackD: 0x0d0b0f, blackL: 0x302a36,
  crim: 0x6e1418, crimD: 0x480c10, crimL: 0x9a2428,
  jade: 0x3a9a82, red: 0xc42a2a,
  leather: 0x2a1e1a, leatherL: 0x46342c, boot: 0x141114, bootD: 0x0c0a0c,
  steel: 0xd2dae4, edge: 0xf8fbff, ridge: 0x9aa4b4, grip: 0x5a1414, gripH: 0x7c2222,
};
const robe = (x, y, z) => (md(x * 3 + y * 5 + z * 7, 29) === 0 ? C.goldD : md(x - y * 2 + z, 11) === 0 ? C.crimD : C.crim);   // sparse gold thread
const hairP = (x, y, z) => (md(x * 3 + z + y, 5) === 0 ? C.hairH : C.hair);

// ---------------------------------------------------------------- body (FV, centred on the joints)
/** A diagonal robe lapel on the chest front (z 11 → zf) from (x0, y0) to (x1, y1): black, gold piping on the outer edge,
 *  crimson on the inner. */
function lapel(x0, y0, x1, y1, zf, dir) {
  const out = [], n = Math.abs(y1 - y0);
  for (let i = 0; i <= n; i++) {
    const y = Math.round(y0 + (y1 - y0) * i / n), x = Math.round(x0 + (x1 - x0) * i / n);
    out.push(B([x - 3, y, 10], [x + 4, y + 1, zf], (xx) => (xx === x + 3 * dir ? C.goldL : xx === x - 3 * dir ? C.crimL : C.black)));
  }
  return out;
}

function torso() {
  const T = {};
  // hips: crimson robe, black belt with gold plaques, the gold-rimmed jade buckle (the robe panels hang as chains)
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.crimD),
    B([-13, -6, -9], [13, -1, 9], robe),
    B([-15, -1, -11], [15, 5, 11], (x, y, z) => (y === -1 || y === 4 ? C.goldD : y === 2 && md(x + z, 5) === 0 ? C.goldL : C.black)),
    B([-4, -2, 11], [5, 6, 13], (x, y) => (y === -2 || y === 5 || x === -4 || x === 4 ? C.goldD : C.gold)),
    P([-2, 0, 12], [3, 4, 13], C.jade), P([0, 1, 12], [1, 3, 13], C.goldL),
  ];
  // waist: the robe closed over the belly (crimson, gold thread), a crimson sash band edged black
  T.spine = [
    B([-11, -6, -9], [11, 14, 9], C.crimD),
    B([-12, -5, -10], [12, 10, 10], robe),
    B([-12, 10, -10], [12, 14, 10], (x, y) => (y === 10 || y === 13 ? C.black : md(x, 5) === 0 ? C.crimL : C.crim)),
  ];
  // chest: gold cuirass rows, the crossed black robe collar over them (the wearer's left lapel on top, down to his right
  // hip), a small gold beast-face boss where they cross, gold shoulder straps, the standing black collar
  T.chest = [
    B([-15, -4, -11], [15, 18, 11], C.crimD),
    ...lamellar([-15, -3, -11], [15, 5, 11], { base: C.gold, rowH: 2, pw: 3 }),
    ...lamellar([-16, 5, -12], [16, 17, 12], { base: C.gold, rowH: 3, pw: 4, trim: C.goldL }),
    ...lapel(-9, 17, 1, 4, 13, 1),
    ...lapel(9, 17, -5, -3, 14, -1),
    B([-3, 3, 13], [3, 8, 15], (x, y) => (y === 3 || y === 7 ? C.goldD : C.gold)), P([-2, 5, 14], [-1, 6, 15], C.red), P([1, 5, 14], [2, 6, 15], C.red),
    ...[-1, 1].flatMap((sx) => [mirX(B([9, 15, -13], [13, 19, 13], C.gold), sx), mirX(B([10, 16, -14], [12, 18, 14], C.goldD, true), sx)]),
    B([-9, 16, -9], [9, 23, 9], (x, y) => (y === 22 ? C.crimL : y === 16 ? C.blackD : C.black)),     // standing collar
    B([-6, 15, -6], [6, 25, 6], -1),                                                              // neck hole
  ];
  T.neck = [B([-5, -2, -5], [5, 6, 5], C.skinD), P([-5, 1, 4], [5, 6, 5], C.skin)];
  return T;
}

function limbs(T) {
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    // wide crimson robe sleeve to the elbow (black cuff, gold line), gold bracer, black leather glove
    T['upperArm' + s] = [
      B([-6, -24, -6], [6, 2, 6], robe), B([-7, -20, -7], [7, -4, 7], robe),
      B([-8, -24, -8], [8, -20, 8], (x, y) => (y === -21 ? C.goldL : C.black)),
    ];
    T['foreArm' + s] = bracer(C.skinD, [C.gold, C.goldD, C.goldL]);
    T['hand' + s] = glove(sx, C.leather, C.leatherL);
    // black trousers, the robe's crimson skirt panels (gold-lipped) over the outer thigh
    T['thigh' + s] = [
      B([-7, -36, -7], [7, 2, 7], (x, y) => (md(y + (x & 1), 6) === 0 ? C.blackL : C.black)),
      B([-8, -31, -8], [8, -20, 8], (x, y) => (md(y - x, 5) === 0 ? C.blackL : C.black)),
      ...lamellar([-5, -19, -7], [9, 0, 8], { base: C.crim, rowH: 4, pw: 5, trim: C.gold, jag: true }).map((b) => mirX(b, sx)),
    ];
    // black boot to the knee, a gold greave plate on the shin and a gold knee cop
    T['shin' + s] = [
      B([-6, -34, -6], [6, 0, 6], C.boot),
      B([-7, -7, -7], [7, 2, 7], C.black), B([-7, -9, -7], [7, -7, 7], C.crim),
      B([-4, -28, 5], [4, -10, 8], (x, y) => (md(y, 4) === 0 ? C.goldD : x === -4 || x === 3 ? C.goldD : C.gold)),
      B([-2, -9, 6], [2, 1, 9], (x, y) => (y === -9 ? C.goldD : C.goldL)),
      B([-7, -34, -7], [7, -32, 7], C.bootD),
    ];
    T['foot' + s] = boot(C.boot, C.bootD, C.bootD, { curl: true, trim: C.gold });
  }
  return T;
}

/** Pauldrons: a gold plate tier over a black lacquered one (gold lips), a round boss with a red gem on the outside. +x = outward. */
function pauldron(sx) {
  const boss = [];
  for (let y = 0; y < 9; y++) for (let z = -4; z < 5; z++) {
    const r = Math.hypot(y - 4, z - 0.5);
    if (r <= 4.2) boss.push(B([11, y, z], [r < 1.6 ? 14 : 13, y + 1, z + 1], r > 3.3 ? C.goldD : r < 1.6 ? C.red : C.goldL));
  }
  return [
    ...lamellar([-6, 6, -10], [7, 14, 10], { base: C.gold, rowH: 3, pw: 4, trim: C.black }),
    ...lamellar([-2, -5, -12], [11, 6, 12], { base: C.black, rowH: 4, pw: 5, trim: C.gold }),
    B([-5, 13, -9], [6, 15, 9], (x) => (x === -5 || x === 5 ? C.goldD : C.goldL)),                 // the top ridge
    ...boss,
  ].map((b) => mirX(b, sx));
}

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  return [
    // lean skull, jaw tapering to a pointed chin, cheekbones, ears
    B([-6, 2, -6], [7, 13, 6], C.skin),
    B([-5, 0, -4], [6, 3, 5], C.skin), B([-2, -1, -2], [3, 1, 5], C.skin),
    B([-7, 5, -2], [8, 9, 1], C.skinD),
    ...symH(3, 6, 5, 7, 5, 6, C.skinH),
    ...symH(4, 6, 2, 4, 5, 6, C.skinD),                                             // hollow under the cheekbones
    // long narrow eyes, slanting up at the outer corners; thin sharp brows arched high
    ...symH(1, 5, 7, 8, 5, 6, C.scl), ...symH(2, 4, 7, 8, 5, 6, C.eye),
    ...symH(1, 5, 8, 9, 5, 6, C.skinD), ...symH(4, 6, 8, 9, 5, 6, C.eye),
    ...symH(1, 4, 10, 11, 5, 7, C.hair, false), ...symH(4, 6, 11, 12, 5, 7, C.hair, false),
    // straight thin nose; a thin mouth
    B([0, 6, 6], [2, 9, 8], C.skinH), B([1, 4, 7], [2, 7, 10], C.skin),
    P([0, 5, 7], [1, 7, 8], C.skinD), P([1, 4, 9], [2, 5, 10], C.mouth),
    P([-2, 2, 5], [3, 3, 6], C.lip), P([-1, 2, 5], [2, 3, 6], C.mouth),
    // thin moustache curling up at the tips; the goatee under the lip (its point is a chain)
    B([-3, 3, 6], [4, 4, 7], C.hair), B([-5, 2, 5], [-3, 3, 7], C.hair), B([4, 2, 5], [6, 3, 7], C.hair),
    B([-6, 3, 5], [-5, 4, 6], C.hair), B([6, 3, 5], [7, 4, 6], C.hair),
    B([-1, -2, 3], [2, 2, 6], hairP), B([-1, 0, 5], [2, 1, 6], C.hair),
    // hair swept back to the topknot
    B([-7, 9, -7], [8, 14, 4], hairP), B([-7, 2, -7], [8, 13, -3], hairP),
    B([-7, 5, -3], [-6, 11, 0], hairP), B([7, 5, -3], [8, 11, 0], hairP),
    B([-3, 13, -4], [4, 16, 1], hairP),
    // 冠: black lacquered cap over the topknot, gold band with a red gem, the tall gold plate leaning back, the gold pin
    B([-4, 14, -5], [5, 20, 2], (x, y) => (y === 19 ? C.blackL : C.black)),
    B([-5, 13, -6], [6, 15, 3], (x, y) => (y === 13 ? C.goldD : C.gold)),
    P([0, 13, 2], [1, 15, 3], C.red), B([0, 14, 3], [1, 15, 4], C.red),
    ...Array.from({ length: 9 }, (_, i) => B([-3, 15 + i, 3 - Math.round(i * 0.7)], [4, 16 + i, 4 - Math.round(i * 0.7)],
      (x) => (i === 8 ? C.goldL : x === -3 || x === 3 ? C.goldD : C.gold))),
    B([-9, 17, -2], [10, 18, -1], C.goldL), B([-10, 16, -2], [-9, 19, -1], C.gold), B([9, 16, -2], [10, 19, -1], C.gold),
  ];
}

// ---------------------------------------------------------------- 倚天劍 (weapon joint: blade +Z, origin = the grip)
function weaponGeo() {
  // hilt at 0.01: gold pommel (z −0.13 … −0.09), crimson cord grip (… 0.08), gold cloud guard (0.08 … 0.12)
  const hilt = vox([
    B([-2, -2, -13], [2, 2, -9], (x, y, z) => (z === -13 ? C.goldD : C.gold)), B([-1, -1, -14], [1, 1, -13], C.goldL),
    B([-1, -1, -9], [1, 1, 8], (x, y, z) => (md(z + x + y, 2) ? C.grip : C.gripH)),
    B([-4, -2, 8], [4, 2, 11], (x, y, z) => (z === 8 ? C.goldD : C.gold)),
    B([-6, -1, 9], [-4, 1, 12], C.goldL), B([4, -1, 9], [6, 1, 12], C.goldL),                // the guard's curled wings
    B([-1, -2, 11], [1, 2, 12], C.goldD),
  ], 0.01, { jitter: 0.04, ao: 0.3 });
  // blade at 0.008 (z 0.12 … 0.95): flat, a raised ridge, bright edges, a gilt inscription near the root, a tapered point
  const bv = 0.008, z0 = Math.round(0.12 / bv), z1 = Math.round(0.95 / bv), boxes = [];
  for (let z = z0; z < z1; z++) {
    const u = (z - z0) / (z1 - z0), w = u < 0.9 ? 4 - u * 0.8 : Math.max(0.5, (1 - u) * 32);
    const a = Math.round(-w), b = Math.max(a + 1, Math.round(w));
    boxes.push(B([a, -1, z], [b, 1, z + 1], (x, y) => (x === a || x === b - 1 ? C.edge
      : x === -1 || x === 0 ? (u > 0.04 && u < 0.2 && md(z, 3) && y === 0 ? C.goldL : C.ridge) : C.steel)));
  }
  const blade = vox(boxes, bv, { jitter: 0.02, ao: 0.15 });
  return [{ geo: hilt, mat: 'metal' }, { geo: blade, mat: 'blade' }];
}

// ---------------------------------------------------------------- chain segments (local −Y along the chain)
const capeSeg = (i, n) => {                                     // black outside, crimson lining, a gold hem at the foot
  const w = Math.round(7 + (i * 2) / (n - 1)), last = i === n - 1;
  const hem = (y) => last && y >= -6 && y <= -5;
  return vox([B([-w, -7, 0], [w, 0, 1], (x, y) => (last && y === -7 && hash01(x, i, 5) < 0.4 ? null : hem(y) ? C.gold : x === -w || x === w - 1 ? C.blackL : C.black)),
    B([-w, -7, -1], [w, 0, 0], (x, y) => (last && y === -7 ? null : hem(y) ? C.goldD : C.crimD))], 0.025, { off: [0, 0, -0.5], jitter: 0.04, ao: 0.18 });
};
const panel = (w) => (i, n) => vox([B([-w, -8, 0], [w, 0, 1], (x, y) => (i === n - 1 && y <= -7 ? (y === -8 && x & 1 ? null : C.gold)
  : x === -w || x === w - 1 ? C.black : robe(x, y + i * 8, 0)))], 0.015, { off: [0, 0, -0.5], jitter: 0.04, ao: 0.18 });
const goatee = (i, n) => vox([B([-1, -4, -1], [1, 0, 1], (x, y) => (i === n - 1 && y < -2 && x ? null : hairP(x, y, i)))], HV, { jitter: 0.05, ao: 0.3 });
const ribbon = () => vox([B([-1, -6, 0], [1, 0, 1], C.black)], 0.012, { off: [0, 0, -0.5], jitter: 0.03, ao: 0.15 });
const strand = (i, n) => vox([B([-1, -6, -1], [1, 0, 1], (x, y, z) => (i === n - 1 && y < -3 && hash01(x + 3, z + 3, 7) < 0.5 ? null : md(x + z, 2) ? C.red : C.crimL))],
  0.01, { jitter: 0.05, ao: 0.2 });

export const DEF = {
  scale: 1.04,
  reach: { tip: 0.95, butt: 0.14 },
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, pauldron, weapon: weaponGeo() }),
  chains: () => [
    // the long cape from the shoulders, near the ground
    { joint: 'chest', anchor: [0, 0.25, -0.16], rest: [0, -1, 0.15], n: 7, len: 0.17, stiff: 0.16, drag: 0.22, wind: 1.1, cone: 80, sway: 0.2,
      seg: capeSeg, hit: ['chest', 'hips', 'thighL', 'thighR', 'kneeL', 'kneeR'] },
    // the robe's front panel and its side panels below the belt
    { joint: 'hips', anchor: [0, -0.07, 0.15], rest: [0, -1, 0.12], n: 4, len: 0.12, stiff: 0.12, drag: 0.14, wind: 0.5, face: [0, 0, 1], cone: 70, sway: 0.08,
      seg: panel(5), hit: [['thighL', 0.02], ['thighR', 0.02], ['kneeL', 0.02], ['kneeR', 0.02]] },
    ...[-1, 1].map((sx) => ({ joint: 'hips', anchor: [sx * 0.155, -0.07, 0.0], rest: [sx * 0.25, -1, 0], n: 4, len: 0.12, stiff: 0.12, drag: 0.14, wind: 0.6,
      face: [sx, 0, 0], cone: 70, sway: 0.1, seg: panel(4), hit: [[sx > 0 ? 'thighL' : 'thighR', 0.03], [sx > 0 ? 'kneeL' : 'kneeR', 0.03]] })),
    // the goatee's point; the cap ribbons behind the ears
    { joint: 'head', anchor: [0, -1.5 * HV, 4.5 * HV], rest: [0, -1, 0.35], n: 2, len: 0.05, stiff: 0.45, drag: 0.22, wind: 0.2, grav: 1.2, cone: 35, face: [0, 0, 1],
      seg: goatee, hit: [['chest', 0.02]] },
    ...[-1, 1].map((sx) => ({ joint: 'head', anchor: [sx * 5.5 * HV, 14 * HV, -1 * HV], rest: [sx * 0.15, -1, -0.25], n: 4, len: 0.07, stiff: 0.06, drag: 0.1,
      wind: 1.4, cone: 100, sway: 0.25, face: [sx, 0, 0], seg: ribbon, hit: ['head', ['chest', 0.01]] })),
    // the sword's red tassel from the pommel
    ...[0, 1, 2].map((k) => ({ joint: 'weapon', anchor: [(k - 1) * 0.006, 0, -0.14], rest: [(k - 1) * 0.2, -1, -0.2], n: 3, len: 0.05, stiff: 0.05, drag: 0.12,
      wind: 0.8, cone: 140, sway: 0.15, face: [1, 0, 0], seg: strand })),
  ],
};
