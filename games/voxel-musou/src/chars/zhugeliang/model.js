// 諸葛亮 孔明 (def-kit model: src/chars/defkit.js header), fine voxels (chars/parts.js FV) on the shared rig, light and
// upright, no pauldrons (buildDef makes no helper joints: the def has no `pauldron`). 羽扇綸巾: a peaked 綸巾 of indigo silk
// (a roof-ridged crown, a dark band with a jade bead, a knot at the back whose two ribbon tails stream in the wind), long
// black hair falling down the back, a calm long face — level eyes under long upswept brows, a fine nose, a thin drooping
// moustache and a pointed goatee. The 鶴氅: a white crane-feather cloak (shingled feather rows) draped over soft shoulders,
// crossed at the chest 右衽 over a blue-grey under-robe, every edge bound in an indigo-black band printed with the eight
// trigrams (先天 order, cycling), a jade-buckled black sash; wide 大袖 sleeves open at the cuff, the robe falling to the
// ankles over black cloud shoes. Behind: the long cloak (a chain) with a great 八卦 emblem — taiji inside the trigram ring
// — between the shoulder blades, since the camera mostly sees his back; the two front panels of the robe and a jade
// pendant swing at the waist. Weapon: the 白羽扇 — a black-lacquer handle with gold bands and a jade ring, a gold boss, a
// rounded fan of white crane feathers with grey quills and dark tips — and the wind blade it conjures while he attacks
// (weapon1: additive, its opacity set by the kit's view hook) along the line the rig's weapon takes, so hit shapes, the
// ribbon and what is drawn agree.
import * as THREE from 'three';
import { vox, B, P, md } from '../../hero/model.js';
import { hash01 } from '../../core/rng.js';
import { FV, hand, boot, symH } from '../parts.js';

export const HV = 0.013;
export const C = {
  skin: 0xecc8a6, skinD: 0xc99c7e, skinH: 0xf6d8bc, lip: 0xb07868, eye: 0x100c10, iris: 0x2a2230, scl: 0xe6ded6,
  hair: 0x121016, hairH: 0x2a2632,
  W: 0xd4d0c6, Wd: 0xada99e, Wl: 0xe4e1da, Wq: 0xbfbbb2,                     // crane white (kept under the bloom knee)
  K: 0x1a1b26, Kl: 0x2e3144, tri: 0xd2d6e2,                                  // indigo-black trim, its trigram bars
  I: 0x9aa8b8, Id: 0x76849a,                                                 // blue-grey under-robe
  N: 0x2a2e58, Nd: 0x1a1d3c, Nl: 0x3e4478,                                   // 綸巾 indigo silk
  A: 0xc0a052, Ad: 0x7c6632, Al: 0xe4c878, J: 0x5fb89a, Jd: 0x2f7a62, Jl: 0x9adcc4,
  shoe: 0x1a1a20, shoeD: 0x0e0e12, sole: 0xe8e4dc,
  lacq: 0x16121a, feather: 0xf2f0ea, featherD: 0xd6d3cc, quill: 0xa8a49a, tip: 0x2a2a34,
  wind: 0xd6ccff, windH: 0xffffff, windD: 0x8c7ce8,                           // the wind blade: violet-white
};
// 先天八卦 clockwise from 乾 (bit k = line k from the bottom, 1 = unbroken): 乾 巽 坎 艮 坤 震 離 兌
export const TRIGRAMS = [7, 6, 2, 4, 0, 1, 5, 3];

/** Crane-feather white: shingled rows (a grey quill line every 4 rows, staggered), sparse lighter barbs. */
/** Radius of a voxel column from the joint axis (round sleeves and hems). */
const rad = (x, z) => Math.hypot(x + 0.5, z + 0.5);
const robe = (x, y, z) => (md(y + (md(Math.floor((x + z) / 3), 2) ? 2 : 0), 4) === 0 ? C.Wq : hash01(x, y, z) < 0.07 ? C.Wl : C.W);
/** A trim band with trigrams, horizontal: a runs along it, b = 0 … 4 across (lines on rows 0 2 4, three columns + a gap
 *  of two per trigram). */
const triH = (a, b) => {
  const k = Math.floor(a / 5), i = a - k * 5, line = b >> 1;
  if (i > 2 || b & 1 || b < 0 || b > 4) return C.K;
  return i === 1 && !((TRIGRAMS[md(k, 8)] >> line) & 1) ? C.K : C.tri;
};
/** Vertical band: a runs down it (lines every 2 rows, a trigram every 8), b = 0 … 4 across (columns 1 … 3 lit). */
const triV = (a, b) => {
  const k = Math.floor(a / 8), r = a - k * 8;
  if (r & 1 || r > 4 || b < 1 || b > 3) return C.K;
  return b === 2 && !((TRIGRAMS[md(k, 8)] >> (2 - (r >> 1))) & 1) ? C.K : C.tri;
};

// ---------------------------------------------------------------- body (FV, centred on the joints)
function torso() {
  const T = {};
  // hips: the robe's skirt top round the pelvis, the black sash (gold edges) with a jade buckle, the front trim band
  // continuing the lapel's line down the right of centre (the long front panels are chains)
  T.hips = [
    B([-12, -10, -8], [12, 6, 8], C.I),
    B([-14, -15, -10], [14, 0, 10], (x, y, z) => (z >= 9 && x >= -6 && x < -1 ? triV(-y, x + 6) : robe(x, y, z))),
    B([-14, 0, -11], [14, 6, 11], (x, y) => (y === 0 || y === 5 ? C.Ad : md(x + y, 7) === 0 ? C.Kl : C.K)),
    B([-3, 0, 11], [4, 6, 12], (x, y) => (y === 0 || y === 5 || x === -3 || x === 3 ? C.A : C.J)),        // jade buckle in gold
    P([-1, 2, 11], [2, 4, 12], C.Jl),
  ];
  // waist: the robe over the under-robe, its trim band carried on down the front
  T.spine = [
    B([-10, -6, -8], [10, 16, 8], C.I),
    B([-12, -6, -9], [12, 16, 9], (x, y, z) => (z >= 8 && x >= -6 && x < -1 ? triV(20 - y, x + 6) : robe(x, y, z))),
  ];
  // chest: slim. 右衽: the left lapel (+x) crosses over to the right, both lapels edged in the trigram band; the under-robe
  // shows in the V above the crossing. The cloak drapes over soft round shoulders (no plates), a dark standing collar
  // behind the neck.
  const eL = (y) => 3 - (20 - y) * 0.45, eR = (y) => -3 + (20 - y) * 0.3;
  const front = (x, y, z) => {
    if (x >= eL(y)) return x < eL(y) + 4.5 ? triV(20 - y, Math.round(x - eL(y))) : robe(x, y, z);
    if (y < 12) return robe(x, y, z);
    if (x <= eR(y)) return x > eR(y) - 4.5 ? triV(20 - y, Math.round(eR(y) - x)) : robe(x, y, z);
    return md(y, 5) === 0 ? C.Id : C.I;
  };
  T.chest = [
    B([-12, -4, -8], [12, 18, 8], C.I),
    B([-13, -4, -10], [13, 20, 10], (x, y, z) => (z === 9 ? front(x, y, z) : robe(x, y, z))),
    B([-19, 11, -10], [19, 20, 10], (x, y, z) => {                       // shoulder drape, rounded off at the ends
      const ax = Math.abs(x + 0.5);
      if (ax > 15 && (y > 17 || Math.abs(z + 0.5) > 8)) return null;
      if (ax > 17 && y > 15) return null;
      return z === 9 && ax < 13 ? front(x, y, z) : robe(x, y, z);
    }),
    B([-9, 16, -10], [9, 24, -6], (x, y) => (y === 23 ? C.Ad : C.K)),   // standing collar behind the neck
    B([-10, 16, -7], [-7, 22, 2], C.K), B([7, 16, -7], [10, 22, 2], C.K),
    B([-6, 16, -6], [6, 26, 6], -1),                                      // neck hole
  ];
  T.neck = [B([-4, -2, -4], [4, 6, 4], (x, y, z) => z > 2 ? C.skin : C.skinD)];
  return T;
}

function limbs(T) {
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    // 大袖: the sleeve widens down the arm to a broad open cuff bound in the trigram band, lined blue-grey inside
    T['upperArm' + s] = [B([-6, -24, -6], [6, 2, 6], robe), B([-7, -24, -7], [7, -12, 7], robe)];
    T['foreArm' + s] = [
      B([-8, -16, -8], [8, 2, 8], robe),
      B([-11, -24, -11], [11, -14, 11], (x, y, z) => (rad(x, z) > 9.8 - (y + 24) * 0.2 ? null
        : y < -19 ? triH(Math.round(Math.atan2(x + 0.5, z + 0.5) * 7 + 22), y + 24) : robe(x, y, z))),
      B([-9, -24, -9], [9, -18, 9], (x, y, z) => (rad(x, z) < 8 ? -1 : null)),   // open cuff (lining below)
      B([-9, -19, -9], [9, -18, 9], (x, y, z) => (rad(x, z) < 8.6 ? C.Id : null)),
      B([-5, -24, -5], [5, -8, 5], C.I),                                 // under-robe sleeve at the wrist
    ];
    T['hand' + s] = hand(sx, C.skin, C.skinD);
    // the robe to the ankle over each leg (the panels and the cloak hide the split): soft folds, the hem bound in the band
    T['thigh' + s] = [
      B([-9, -36, -9], [9, 2, 9], (x, y, z) => (md(x * 2 + z, 9) === 0 ? C.Wd : robe(x, y, z))),
    ];
    T['shin' + s] = [
      B([-9, -28, -9], [9, 2, 9], (x, y, z) => (md(x * 2 + z, 9) === 0 ? C.Wd : robe(x, y, z))),
      B([-10, -34, -10], [10, -28, 10], (x, y, z) => (rad(x, z) > 10.2 ? null : y === -34 ? C.Ad : triH(Math.round(Math.atan2(x + 0.5, z + 0.5) * 9 + 30), y + 33))),
      B([-5, -35, -5], [5, -28, 5], C.shoe),
    ];
    T['foot' + s] = boot(C.shoe, C.shoeD, C.sole, { curl: true, trim: C.W });
  }
  return T;
}

// ---------------------------------------------------------------- head (HV voxels, chin y 0, columns centred on 0)
function head() {
  const hair = (x, y, z) => (hash01(x, y, z + 147) < 0.18 ? C.hairH : C.hair);
  // 綸巾: silk crown with soft vertical folds, sloping to a ridge (a roof from the front), a dark band with a jade bead
  const silk = (x, y, z) => (md(x + (z >> 2), 4) === 0 ? C.Nd : y > 19 && md(z, 3) === 0 ? C.Nl : C.N);
  return [
    // long calm face: skull, narrow jaw and chin, ears
    B([-5, 1, -5], [6, 5, 5], C.skin), B([-6, 5, -6], [7, 10, 6], C.skin), B([-5, 10, -5], [6, 14, 5], C.skin),
    B([-5, 0, -5], [6, 2, 5], C.skin), B([-3, -1, -3], [4, 0, 4], C.skin),
    B([-7, 6, -1], [8, 10, 2], C.skinD),
    ...symH(4, 6, 5, 7, 5, 6, C.skinH),                                            // cheekbones
    // level eyes, a long dark upper lid lifting at the outer corner, long upswept brows
    ...symH(2, 6, 7, 8, 5, 6, C.scl), ...symH(3, 5, 7, 8, 5, 6, C.iris), ...symH(3, 4, 7, 8, 5, 6, C.eye),
    ...symH(2, 6, 8, 9, 5, 6, C.eye), ...symH(6, 7, 9, 10, 5, 6, C.eye),
    ...symH(1, 5, 10, 11, 5, 6, C.hair), ...symH(5, 7, 11, 12, 5, 6, C.hair),
    // fine nose, small mouth; a thin moustache drooping past the corners; the goatee (its long point is a chain)
    ...Array.from({ length: 5 }, (_, i) => B([0, 5 + i, 6], [1, 6 + i, 8 + Math.floor((4 - i) / 2)], C.skinH)),
    B([-1, 4, 6], [2, 6, 8], C.skin), P([-1, 5, 6], [0, 8, 8], C.skinD),
    P([-1, 2, 5], [2, 3, 6], C.lip),
    B([-3, 3, 6], [4, 4, 7], (x) => (x === 0 ? null : C.hair)), B([-4, 1, 5], [-3, 3, 7], C.hair), B([4, 1, 5], [5, 3, 7], C.hair),
    B([-1, -3, 3], [2, 1, 6], hair),
    // hair: parted under the cap, long locks framing the face, the mass down the back (the long fall is a chain)
    B([-7, 9, -7], [8, 13, 5], hair),
    B([-8, 0, -4], [-6, 11, 3], hair), B([7, 0, -4], [9, 11, 3], hair),
    B([-7, -1, -8], [8, 12, -4], hair),
    // the cap: crown, roof, ridge; band and bead; the knot behind (ribbon tails: chains)
    B([-7, 12, -8], [8, 19, 6], silk),
    B([-6, 19, -7], [7, 20, 5], silk), B([-4, 20, -7], [5, 21, 5], silk), B([-2, 21, -7], [3, 22, 5], silk), B([-1, 22, -6], [2, 23, 4], C.Nl),
    B([-7, 12, -8], [8, 14, 7], (x, y) => (y === 12 ? C.Nd : md(x, 4) === 0 ? C.Nl : C.Nd)),
    B([0, 12, 7], [1, 14, 8], C.J), P([0, 13, 7], [1, 14, 8], C.Jl),
    B([-3, 9, -10], [4, 14, -8], C.Nd), B([-1, 10, -11], [2, 13, -10], C.Nl),
  ];
}

// ---------------------------------------------------------------- 白羽扇 + wind blade (weapon joint: +Z, origin = the hand)
function weaponGeo() {
  const fv = 0.011, fan = [];
  // handle: black lacquer, gold bands, a jade ring under the boss, a gold end cap
  fan.push(B([-1, -1, -10], [1, 1, 14], C.lacq), ...[-10, -2, 6].map((z) => B([-2, -2, z], [2, 2, z + 2], C.A)),
    B([-2, -2, 11], [2, 2, 14], C.J), P([-2, 1, 11], [2, 2, 14], C.Jl), B([-1, -1, -12], [1, 1, -10], C.Al));
  // boss: a gold mount the feathers spring from
  fan.push(B([-2, -5, 14], [2, 5, 18], (x, y) => (Math.abs(y) > 3 ? C.Ad : md(y, 2) ? C.Al : C.A)));
  // the fan: white crane feathers radiating from the boss, grey quills, a rounded rim of darker tips, a separated edge
  const R0 = 37, AM = 0.9;
  for (let z = 17; z < 17 + R0; z++) for (let y = -22; y <= 22; y++) {
    const dz = z - 15, a = Math.atan2(y, dz), r = Math.hypot(y, dz), R = R0 * (1 - 0.32 * (a / AM) ** 2);
    if (Math.abs(a) > AM || r > R || r < 3) continue;
    const k = Math.round(a / 0.13), q = Math.abs(a - k * 0.13) * r;
    if (r > R - 2 && q > 1.6 && md(k, 2)) continue;                     // separated feather tips
    fan.push(B([0, y, z], [1, y + 1, z + 1], r > R - 3 ? C.tip : q < 0.55 ? C.quill : r < 9 ? C.featherD : C.feather));
  }
  const fanGeo = vox(fan, fv, { off: [-0.5, 0, 0], jitter: 0.03, ao: 0.2 });
  // Three separated feather-shaped gusts: tapered strips on different depth planes, with staggered ends.
  const bv = 0.014, wb = [];
  for (const [start, end, base, bend, layer] of [[0.67, 1.9, -0.07, 0.11, 0], [0.77, 1.65, 0.04, -0.08, 1], [0.9, 1.8, 0.1, 0.07, -1]]) {
    for (let i = 0; i < 44; i++) {
      const u = i / 43, z = Math.round((start + (end - start) * u) / bv);
      const y = Math.round((base * (1 - u) + 4 * bend * u * (1 - u)) / bv), width = Math.max(1, Math.round((0.014 + 0.022 * (1 - u)) / bv));
      wb.push(B([layer, y - width, z], [layer + 1, y + width + 1, z + 1], (_, yy) => Math.abs(yy - y) < 1 ? C.windH : Math.abs(yy - y) >= width ? C.windD : C.wind));
    }
  }
  const wind = vox(wb, bv, { jitter: 0, ao: 0 });
  const windMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, fog: false });
  return [{ geo: fanGeo, mat: 'body' }, { geo: wind, mat: windMat }];
}

// ---------------------------------------------------------------- chain segments (local −Y along the chain)
/** The 鶴氅's back: feather rows, trigram-banded edges and hem, and the 八卦 emblem (taiji in the trigram ring) centred
 *  across segments 0 … 2 (global row g = y − 12 i). */
function cloakSeg(i, n) {
  const w = Math.round(16 + i * 0.8), last = i === n - 1;
  return vox([
    B([-w, -12, 0], [w, 0, 1], (x, y) => {
      const g = y - i * 12, ax = Math.abs(x + 0.5);
      if (ax > w - 4.5) return triV(-g, Math.round(ax - (w - 4.5)));    // edges
      if (last && y < -6) return y === -12 ? C.Ad : triH(x + 40, y + 11);   // hem
      const dx = x + 0.5, dy = g + 17, r = Math.hypot(dx, dy);
      if (r < 11) {
        if (r > 10.2) return C.A;
        if (r > 5.2) {                                                  // trigram ring: 8 sectors, lines at radii 6.4 7.9 9.4
          const a = Math.atan2(dx, dy), s = md(Math.round(a / (Math.PI / 4)), 8), off = Math.abs(a - Math.round(a / (Math.PI / 4)) * Math.PI / 4) * r;
          const line = r < 7.15 ? 0 : r < 8.65 ? 1 : 2, rr = [6.4, 7.9, 9.4][line];
          if (Math.abs(r - rr) > 0.55 || off > r * 0.3) return C.K;
          return off < 0.9 && !((TRIGRAMS[s] >> line) & 1) ? C.K : C.A;
        }
        if (r > 4.6) return C.K;
        const up = Math.hypot(dx, dy - 2.4) < 2.4, dn = Math.hypot(dx, dy + 2.4) < 2.4;   // taiji
        if (Math.hypot(dx, dy - 2.4) < 0.9) return C.K;
        if (Math.hypot(dx, dy + 2.4) < 0.9) return C.Wl;
        return (up ? false : dn ? true : dx > 0) ? C.K : C.Wl;
      }
      return robe(x, y + i * 12, 1);
    }),
    B([-w + 1, -12, -1], [w - 1, 0, 0], C.Id),                           // lining
  ], FV, { off: [0, 0, -0.5], jitter: 0.03, ao: 0.18 });
}
/** Front panel of the robe (sx: which side): white, its inner edge and hem in the trigram band. */
const panelSeg = (sx) => (i, n) => {
  const last = i === n - 1;
  return vox([B([-6, -10, 0], [6, 0, 1], (x, y) => {
    const e = sx > 0 ? x + 6 : 5 - x;                                    // 0 at the opening
    if (e < 5) return triV(-(y - i * 10), e);
    if (last && y < -4) return y === -10 ? C.Ad : triH(x + 20, y + 9);
    return robe(x, y + i * 10, 2);
  }), B([-5, -10, -1], [5, 0, 0], C.Id)], FV, { off: [0, 0, -0.5], jitter: 0.03, ao: 0.18 });
};
// Separate waved locks, each with a narrow rounded section instead of a frayed flat slab.
const hairSeg = (i, n) => {
  const locks = [];
  for (let y = -7; y < 0; y++) {
    const x = Math.round(Math.sin((i * 7 - y) * 0.35) * 0.8);
    locks.push(B([x - 2, y, -1], [x + 3, y + 1, 2], (xx) => Math.abs(xx - x) > 1 ? C.hairH : C.hair));
  }
  return vox(locks, FV, { jitter: 0.02, ao: 0.21 });
};
const ribbonSeg = (i, n) => vox([B([-2, -7, 0], [2, 0, 1], (x, y) => (i === n - 1 && y < -5 && x !== -1 ? null : x === -2 ? C.Nd : C.N))],
  FV, { off: [0, 0, -0.5], jitter: 0.04, ao: 0.15 });
const goateeSeg = (i, n) => vox([B([-1, -4, -1], [1, 0, 1], (x, y) => (i === n - 1 && y < -2 && x ? null : C.hair))], HV, { jitter: 0.04, ao: 0.25 });
/** Jade pendant on a dark cord: a cord segment, the last one the jade disc with its hole. */
const pendantSeg = (i, n) => (i < n - 1
  ? vox([B([-1, -6, 0], [1, 0, 1], C.K)], FV, { off: [0, 0, -0.5], ao: 0.1 })
  : vox([B([-4, -9, 0], [4, 0, 1], (x, y) => {
    const r = Math.hypot(x + 0.5, y + 4.5);
    return r > 4.2 ? null : r < 1.3 ? null : r > 3.4 ? C.Jd : md(x + y, 3) ? C.J : C.Jl;
  })], FV, { off: [0, 0, -0.5], jitter: 0.02, ao: 0.1 }));

export const ZHUGELIANG_DEF = {
  build: () => ({ parts: limbs(torso()), head: head(), bv: FV, hv: HV, weapon: weaponGeo() }),   // no pauldron: none
  chains() {
    const out = [];
    // the cloak from the collar to the ankles (heaviest), the two front panels, hair, the cap's ribbons, goatee, pendant
    out.push({ joint: 'chest', anchor: [0, 0.23, -0.13], rest: [0, -1, -0.08], n: 8, len: 0.15, stiff: 0.16, drag: 0.22, wind: 1.1, cone: 80, sway: 0.2,
      seg: cloakSeg, hit: ['chest', 'hips', 'thighL', 'thighR', 'kneeL', 'kneeR'] });
    for (const sx of [-1, 1]) {
      out.push({ joint: 'hips', anchor: [sx * 0.085, -0.06, 0.13], rest: [sx * 0.04, -1, 0.1], n: 5, len: 0.125, stiff: 0.12, drag: 0.14, wind: 0.4, face: [0, 0, 1], cone: 70, sway: 0.08,
        seg: panelSeg(sx), hit: [['thighL', 0.035], ['thighR', 0.035], ['kneeL', 0.035], ['kneeR', 0.035]] });
    }
    for (const side of [-1, 0, 1]) out.push({ joint: 'head', anchor: [side * 0.036, 0.09, -0.1], rest: [side * 0.06, -1, -0.18],
      n: 5, len: 0.09, stiff: 0.13, drag: 0.16, wind: 0.95, cone: 72, sway: 0.22,
      seg: hairSeg, hit: ['head', ['chest', 0.035]] });
    for (const sx of [-1, 1]) {
      out.push({ joint: 'head', anchor: [sx * 1.5 * HV, 11 * HV, -10.5 * HV], rest: [sx * 0.3, -0.55, -1], n: 5, len: 0.08, stiff: 0.03, drag: 0.06, wind: 2.4, cone: 110, sway: 0.6, grav: 0.7,
        seg: ribbonSeg, hit: ['head', ['chest', 0.02]] });
    }
    out.push({ joint: 'head', anchor: [0.5 * HV, -3 * HV, 4.5 * HV], rest: [0, -1, 0.15], n: 2, len: 0.04, stiff: 0.35, drag: 0.2, wind: 0.3, cone: 35, face: [0, 0, 1],
      seg: goateeSeg, hit: [['chest', 0.01]] });
    out.push({ joint: 'hips', anchor: [0.045, -0.025, 0.155], rest: [0.08, -1, 0.06], n: 2, len: 0.065, stiff: 0.32, drag: 0.25, wind: 0.25, grav: 1.25, face: [0, 0, 1], cone: 48, sway: 0.03,
      seg: pendantSeg, hit: [['thighL', 0.03], ['thighR', 0.03]] });
    return out;
  },
};

// ---------------------------------------------------------------- HUD portrait (20 × 20): the peaked indigo 綸巾 with its
// jade bead, long black hair framing a calm face, level eyes, thin moustache and goatee, the white crane collar crossed
// over the under-robe, its edges in the dark trigram band
export const FACE = [
  '.........NN.........',
  '........NnnN........',
  '.......NNnnNN.......',
  '......NNNnnNNN......',
  '.....NNNNnnNNNN.....',
  '....NNNNNNNNNNNN....',
  '....ddddddJdddddd...',
  '...HHSSSSSSSSSSHH...',
  '...HSHHHSSSSHHHSH...',
  '...HSEEESSSSEEESH...',
  '...HSSsSSSSSSsSSH...',
  '...HSSSSSssSSSSSH...',
  '...HHSSSSsSSSSSHH...',
  '...HHSHHHMMHHHSHH...',
  '...HHSSSSHHSSSSHH...',
  '...HHH.SSHHSS.HHH...',
  '..HHHH..sHHs..HHHH..',
  '.WWWWKw..HH..wKWWWW.',
  'WWWWWWKw.II.wKWWWWWW',
  'WWWWWWWKwIIwKWWWWWWW',
];
export const PAL = { N: '#2a2e58', n: '#3e4478', d: '#1a1d3c', J: '#5fb89a', H: '#121016', S: '#ecc8a6', s: '#c99c7e', E: '#100c10',
  M: '#b07868', W: '#e2ded4', K: '#1a1b26', w: '#d2d6e2', I: '#9aa8b8' };
