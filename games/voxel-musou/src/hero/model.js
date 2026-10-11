// Voxel Zhao Yun (concept: bench/concept.png). Every part is authored in voxel units, rasterised into a grid and meshed
// with exposed faces only plus per-vertex ambient occlusion (lamellar gaps, folds and seams darken). One mesh per rig
// joint. White-silver lamellar armour in overlapping plate rows (dark seams) over a gunmetal underlayer, a white scale mantle, flared
// three-tier pauldrons, teal trim, headband with a silver plate, dark banded spear with a gold dragon collar.
// Ponytail, ribbons, cape, front apron and the blue tassel are spring chains in secondary.js; the pauldrons half-follow
// the upper arms (also secondary.js). The hero material gets a camera fill + warm rim so he reads in a dark crowd.
import * as THREE from 'three';
import { hash01 } from '../core/rng.js';
import { shade, FACES, makeBuilder } from '../core/voxel.js';

export const V = 0.025;          // body voxel (m); spear 0.02/0.012, blade 0.011
export const HV = 0.0175;        // head voxel: 13-voxel head ≈ 0.23 m (× HERO_SCALE) → ≈ 7.5 heads tall
export const C = {
  W: 0xdcdee2, W2: 0xb4b9c2, Wh: 0xeeefee, S: 0xa6aeba, Sd: 0x6a717e,                      // white-silver armour, silver
  G: 0x3a3a44, Gd: 0x2a2a32, Gm: 0x50525e, Gl: 0x8a8e9a,                                   // gunmetal underlayer, dark scale
  T: 0x1f9c95, Td: 0x136b68, Tl: 0x3fc4b8,                                                   // teal
  gold: 0xd4a84c, leather: 0x6b4a33, glove: 0x3b2c27, sole: 0x2a2226,
  skin: 0xf1caa9, skinD: 0xd8a488, lip: 0xcc8c78, eye: 0x17121a, iris: 0x3b2a2c, scl: 0xd4ccc6,
  hair: 0x16131a, hairH: 0x363245, hairT: 0x241f2a,
  shaft: 0x1d1e26, shaftH: 0x30323e, band: 0x6b707c,
  blue: 0x2a78e0, blueH: 0x78c8ff, blueD: 0x1c4aa8, ribbon: 0x8ccbe8, ribbonD: 0x5c9ccc,
  cape: 0xebe6dc, capeD: 0xd6d0c4, emb: 0x2f5fa6,
};

// ---------------------------------------------------------------- voxel mesher with AO
const _col = new THREE.Color();

/**
 * boxes: { a:[x,y,z], b:[x,y,z] (voxel units, integers, b exclusive), c: 0xRRGGBB | -1 (carve) | fn(x,y,z) → colour|null,
 * paint?: only recolour existing voxels }. Later boxes win. Vertex = (voxel + off) * v.
 */
export function vox(boxes, v = V, { off = [0, 0, 0], jitter = 0.05, ao = 0.42 } = {}) {
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const b of boxes) if (!b.paint && b.c !== -1) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], b.a[k]); mx[k] = Math.max(mx[k], b.b[k]); }
  const o = mn.map((m) => m - 1), n = mx.map((m, k) => m - mn[k] + 2);        // 1-voxel empty border for neighbour tests
  const grid = new Int32Array(n[0] * n[1] * n[2]).fill(-1);
  const id = (i, j, k) => i + n[0] * (j + n[1] * k);
  for (const b of boxes) {
    for (let z = Math.max(b.a[2], o[2]); z < Math.min(b.b[2], o[2] + n[2]); z++)
      for (let y = Math.max(b.a[1], o[1]); y < Math.min(b.b[1], o[1] + n[1]); y++)
        for (let x = Math.max(b.a[0], o[0]); x < Math.min(b.b[0], o[0] + n[0]); x++) {
          const g = id(x - o[0], y - o[1], z - o[2]);
          if (b.paint && grid[g] < 0) continue;
          const c = typeof b.c === 'function' ? b.c(x, y, z) : b.c;
          if (c == null) continue;
          grid[g] = c;
        }
  }
  const full = (i, j, k) => i >= 0 && j >= 0 && k >= 0 && i < n[0] && j < n[1] && k < n[2] && grid[id(i, j, k)] >= 0 ? 1 : 0;
  const vb = makeBuilder();
  const AO = [1 - ao, 1 - ao * 0.6, 1 - ao * 0.25, 1];
  const lv = [0, 0, 0, 0], kq = [0, 0, 0, 0];
  for (let k = 1; k < n[2] - 1; k++) for (let j = 1; j < n[1] - 1; j++) for (let i = 1; i < n[0] - 1; i++) {
    const c = grid[id(i, j, k)];
    if (c < 0) continue;
    _col.set(shade(c, 1 - jitter / 2 + hash01(i + o[0], j + o[1], k + o[2]) * jitter));
    for (const f of FACES) {
      const [nx, ny, nz] = f.n;
      if (full(i + nx, j + ny, k + nz)) continue;
      const ax = f.n[0] ? [1, 2] : f.n[1] ? [0, 2] : [0, 1];
      const corners = f.v.map((cv, q) => {
        const p = [i + nx, j + ny, k + nz];
        const s1 = [...p], s2 = [...p];
        s1[ax[0]] += cv[ax[0]] ? 1 : -1; s2[ax[1]] += cv[ax[1]] ? 1 : -1;
        const cc = [...s1]; cc[ax[1]] += cv[ax[1]] ? 1 : -1;
        const a = full(...s1), b = full(...s2);
        lv[q] = a && b ? 0 : 3 - a - b - full(...cc);
        kq[q] = AO[lv[q]];
        return [(i + o[0] + cv[0] + off[0]) * v, (j + o[1] + cv[1] + off[1]) * v, (k + o[2] + cv[2] + off[2]) * v];
      });
      vb.quad(corners, f.n, _col.r, _col.g, _col.b, kq, lv[0] + lv[2] < lv[1] + lv[3]);
    }
  }
  return vb.build();
}

// ---------------------------------------------------------------- authoring helpers (voxel units; shared with src/chars/*)
export const B = (a, b, c, paint) => ({ a, b, c, paint });
export const md = (a, m) => ((a % m) + m) % m;
export const P = (a, b, c) => ({ a, b, c, paint: true });
/** Mirror a box for the right side (parts authored with +x = outward); c2 = 2 × mirror plane (1 for off −0.5 parts). */
export const mirX = (bx, sx, c2 = 0) => (sx > 0 ? bx : { ...bx, a: [c2 - bx.b[0], bx.a[1], bx.a[2]], b: [c2 - bx.a[0], bx.b[1], bx.b[2]] });

/**
 * Lamellar armour: a volume made of horizontal rows (rowH voxels tall) of small plates (pw voxels wide, staggered per row,
 * one dark seam voxel between plates). Each row's lowest voxel is a bright lip that sticks out by one voxel on x and z
 * (the rows overlap like scales; AO darkens under every lip) and the voxel tucked under the next lip is shaded, so every
 * row reads as plates with dark gaps. `trim` colours the lip of the lowest row; `jag` knocks out every 3rd voxel of it.
 * lipX / lipZ = false: the lips stay flush on that axis (a skirt panel, a plate against the body).
 */
export function lamellar(a, b, { base = C.W, rowH = 3, pw = 4, trim = null, jag = false, lipX = true, lipZ = true } = {}) {
  const out = [], dark = shade(base, 0.6), tuck = shade(base, 0.8), hi = shade(base, 1.04);
  const seam = (x, y, z) => md(x + z + (Math.floor((y - a[1]) / rowH) & 1) * (pw >> 1), pw) === 0;
  out.push(B(a, b, (x, y, z) => (seam(x, y, z) ? dark : (y - a[1]) % rowH === rowH - 1 ? tuck : base)));
  for (let y = a[1]; y < b[1]; y += rowH) {
    const bottom = y === a[1];
    out.push(B([a[0] - (lipX ? 1 : 0), y, a[2] - (lipZ ? 1 : 0)], [b[0] + (lipX ? 1 : 0), y + 1, b[2] + (lipZ ? 1 : 0)],
      (x, yy, z) => (bottom && jag && md(x + z, 3) === 0 ? null : bottom && trim != null ? trim : seam(x, yy, z) ? dark : hi)));
  }
  return out;
}

// ---------------------------------------------------------------- body parts
function torso(k) {               // k: palette (C or another character's, bodyParts)
  const P_ = {};
  // hips (pelvis, narrow): gunmetal core, teal sash + leather belt with the gold buckle, white faulds at the back
  P_.hips = [
    B([-6, -5, -4], [6, 3, 4], k.G),
    B([-7, -1, -5], [7, 2, 5], (x, y) => (md(x + y, 4) === 0 ? k.Td : k.T)),
    B([-7, 2, -5], [7, 3, 5], k.leather),
    B([-1, 0, 5], [1, 3, 6], k.gold),
    B([5, -4, -2], [8, 1, 2], k.T),                                  // sash knot on the left hip
    ...lamellar([-6, -6, -6], [6, -1, -5], { base: k.W, rowH: 2, lipX: false, trim: k.T, jag: true }),   // back fauld (front: apron chain)
  ];
  // waist (narrow): gunmetal with grey-white belly lamellar and a teal band under the breastplate
  P_.spine = [
    B([-5, -3, -4], [5, 8, 4], k.G),
    ...lamellar([-5, -1, -4], [5, 6, 4], { base: k.W2, rowH: 2 }),
    B([-6, 6, -5], [6, 8, 5], k.T),
  ];
  // chest (V taper, broad at the top): white lamellar cuirass, white scale mantle round the neck and shoulders (teal
  // lining, V opening), silver heart-mirror with a teal gem
  P_.chest = [
    B([-7, -2, -5], [7, 9, 5], k.G),
    ...lamellar([-6, -1, -5], [6, 3, 5], { base: k.W2, rowH: 2 }),
    ...lamellar([-7, 3, -5], [7, 8, 5], { base: k.W, rowH: 3, pw: 3 }),
    B([-1, -1, 6], [1, 5, 7], k.T),                                  // teal centre strip under the mirror
    B([-2, 2, 6], [2, 6, 8], k.S),
    B([-1, 3, 8], [1, 5, 9], k.Tl),
    B([-2, 2, 7], [2, 3, 8], k.Sd, true),
    // mantle: shaggy scale tiers, widest at the bottom, reaching over the shoulders
    ...lamellar([-9, 6, -6], [9, 11, 6], { base: k.Wh, rowH: 2, pw: 3, jag: true }),
    B([-4, 8, -4], [4, 12, 4], k.T),                                 // teal inner collar
    B([-3, 8, -3], [3, 13, 3], -1),                                  // neck hole
    B([-2, 6, 3], [2, 12, 8], -1),                                   // V opening at the throat
    B([-2, 5, 3], [2, 10, 5], k.T),
    B([-1, 5, 4], [1, 8, 6], k.S),                                   // collar clasp
  ];
  P_.neck = [B([-2, -1, -2], [2, 3, 2], k.skinD)];
  return P_;
}

function limbs(P_, k) {
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    // upper arm: gunmetal sleeve under small white lamellar with a teal hem (pauldron is separate)
    P_['upperArm' + s] = [
      B([-2, -12, -2], [2, 1, 2], k.G),
      ...lamellar([-2, -11, -2], [2, -5, 2], { base: k.W, rowH: 2, pw: 3, trim: k.T }),
    ];
    // forearm: banded white vambrace (plate rows with dark gaps), dark wrist band, teal line, silver elbow cop
    P_['foreArm' + s] = [
      B([-2, -11, -2], [3, 0, 3], k.Gd),
      ...lamellar([-2, -9, -2], [3, -2, 3], { base: k.W, rowH: 2, trim: k.S }),
      P([-3, -3, -3], [4, -2, 4], k.T),
      B([-2, -1, -3], [3, 1, 3], k.S),
    ];
    P_['hand' + s] = [B([-2, -2, -2], [2, 2, 2], k.glove), B([-2, 1, -2], [2, 2, 2], k.Gd)];
    // thigh: gunmetal trousers, flared scale tasset on the outside/front/back (rotates with the leg)
    P_['thigh' + s] = [
      B([-3, -18, -3], [4, 1, 4], (x, y) => (y % 5 === 0 ? k.Gd : k.G)),
      ...lamellar([-2, -9, -4], [5, 2, 5], { base: k.W, rowH: 2, trim: k.T, jag: true }).map((b) => mirX(b, sx, 1)),
    ];
    // shin: plated greave over the front/sides with a silver ridge and knee cop, teal band, gunmetal calf
    P_['shin' + s] = [
      B([-2, -17, -2], [3, 0, 3], k.G),                               // slim calf, gunmetal wrap
      ...lamellar([-2, -15, -1], [3, -3, 4], { base: k.W, rowH: 3, pw: 4 }),     // greave plates
      B([0, -14, 4], [1, -3, 5], k.S),                                // centre ridge
      B([-3, -17, -3], [4, -15, 4], (x, y) => (y === -17 ? k.T : k.S)),            // greave cuff over the boot
      B([-2, -3, 0], [3, 2, 5], k.S),                                 // knee cop
      B([0, -2, 5], [1, 0, 6], k.T),
    ];
    // foot: armoured white boot, silver toe cap, dark sole, teal ankle band
    P_['foot' + s] = [
      B([-3, -3, -2], [3, 1, 6], (x, y) => (y === -1 ? k.W2 : k.W)),
      B([-3, -3, 4], [3, -1, 7], k.S),
      P([-3, -3, -2], [3, -2, 7], k.sole),
      B([-3, 0, -3], [3, 1, 3], k.T),
    ];
  }
  return P_;
}

/** Big flared three-tier scale pauldron + upturned wing, chest-aligned, u = outward (voxels). */
function pauldronBoxes(sx, k) {
  const b = [
    ...lamellar([-4, 2, -4], [2, 5, 4], { base: k.W, rowH: 3 }),
    ...lamellar([-2, -1, -5], [3, 2, 5], { base: k.W, rowH: 3 }),
    ...lamellar([-1, -4, -5], [4, -1, 5], { base: k.W, rowH: 3, trim: k.T, jag: true }),
    B([2, 4, -3], [4, 6, 3], k.Wh),                                  // upturned outer wing, silver rim
    B([3, 6, -3], [5, 7, 3], k.S),
  ];
  return b.map((bx) => mirX(bx, sx));
}

function head() {
  // head: 9-voxel face (x −4..5 with off −0.5 → centred), chin y 0, hair top y 13 (hd ≈ 0.26 m at 0.02)
  const bangs = { '-4': 8, '-3': 9, '-2': 8, '-1': 9, 0: 7, 1: 9, 2: 8, 3: 9, 4: 8 };
  const hairPaint = (x, y, z) => (md(x * 3 + z, 5) === 0 ? C.hairH : md(x + y * 2, 7) === 0 ? C.hairT : C.hair);
  return [
    B([-3, 0, -2], [4, 2, 5], C.skin),                               // jaw
    B([-4, 2, -4], [5, 10, 5], C.skin),                              // skull / face
    B([-5, 5, -1], [6, 8, 1], C.skinD),                              // ears
    B([-5, 8, -6], [6, 13, 6], hairPaint),                           // hair cap
    B([-4, 13, -5], [5, 14, 4], hairPaint),
    B([-5, 2, -6], [6, 13, -2], hairPaint),                          // back hair
    B([-5, 3, -2], [-3, 12, 4], hairPaint), B([4, 3, -2], [6, 12, 4], hairPaint),   // sideburns
    B([-5, 0, 1], [-4, 6, 4], (x, y, z) => (y === 0 && z % 2 ? null : C.hair)),       // front locks
    B([5, 0, 1], [6, 6, 4], (x, y, z) => (y === 0 && z % 2 ? null : C.hair)),
    B([-4, 7, 5], [5, 12, 6], (x, y) => (y >= bangs[x] ? hairPaint(x, y, 5) : null)),   // spiky fringe
    B([-2, 12, 5], [3, 14, 7], C.hair), B([-3, 14, -2], [0, 15, 2], C.hair), B([2, 14, -4], [4, 15, 0], C.hair),
    // headband (dark teal) with a silver plate and gold gem
    B([-6, 9, -7], [7, 10, 7], C.Td),
    B([-1, 8, 6], [2, 11, 7], C.S),
    B([0, 9, 7], [1, 10, 8], C.gold),
    // silver guan on the crown (holds the ponytail) with a teal gem
    B([-1, 12, -5], [2, 16, -1], C.S),
    B([0, 14, -1], [1, 15, 0], C.Tl),
    // face: eyes with a catch-light, slanted brows, nose, mouth, cheek shade
    // eyes 3×2: lash line over sclera | iris | sclera; brows one row above with a skin gap
    P([-3, 5, 4], [0, 6, 5], C.eye), P([1, 5, 4], [4, 6, 5], C.eye),
    P([-3, 4, 4], [0, 5, 5], C.scl), P([1, 4, 4], [4, 5, 5], C.scl),
    P([-2, 4, 4], [-1, 5, 5], C.iris), P([2, 4, 4], [3, 5, 5], C.iris),
    P([-3, 7, 4], [0, 8, 5], C.hair), P([1, 7, 4], [4, 8, 5], C.hair),
    B([0, 3, 5], [1, 4, 6], C.skin), P([0, 2, 4], [1, 3, 5], C.skinD),
    P([-1, 1, 4], [2, 2, 5], C.lip),
    P([-4, 1, 3], [-3, 4, 5], C.skinD), P([4, 1, 3], [5, 4, 5], C.skinD),
  ];
}

// ---------------------------------------------------------------- spear (weapon joint: shaft +Z, origin = rear grip)
function spearGeo() {
  // shaft + butt at 0.02: banded dark iron, butt spike (z −0.72 … 1.5)
  const sv = 0.02;
  const shaft = vox([
    B([-1, -1, -36], [1, 1, 75], (x, y, z) => (((z + 36) % 15) === 0 ? C.band : ((z >> 1) & 1) ? C.shaftH : C.shaft)),
    ...Array.from({ length: 7 }, (_, i) => B([-2, -2, -33 + i * 15], [2, 2, -32 + i * 15], C.band)),
    B([-2, -2, -38], [2, 2, -35], C.S),
    B([-1, -1, -41], [1, 1, -38], C.S),
  ], sv, { jitter: 0.04, ao: 0.3 });
  // gold dragon-head collar at 0.012 (z 1.44 … 1.62): ring, head, jaws, swept-back horns, teal eyes, whiskers
  const cv = 0.012;
  const collar = vox([
    B([-3, -3, 120], [3, 3, 123], C.gold),
    B([-4, -3, 123], [4, 4, 130], (x, y, z) => ((z + y) % 3 === 0 ? shade(C.gold, 0.8) : C.gold)),
    B([-3, 1, 130], [3, 4, 135], C.gold),                            // upper jaw
    B([-3, -3, 130], [3, -1, 133], shade(C.gold, 0.85)),             // lower jaw
    B([-3, 4, 121], [-1, 6, 126], C.gold), B([1, 4, 121], [3, 6, 126], C.gold),
    B([-3, 5, 117], [-1, 7, 121], shade(C.gold, 0.9)), B([1, 5, 117], [3, 7, 121], shade(C.gold, 0.9)),
    B([-5, 1, 127], [-4, 3, 129], C.Tl), B([4, 1, 127], [5, 3, 129], C.Tl),
    B([-6, 0, 131], [-3, 1, 132], C.gold), B([3, 0, 131], [6, 1, 132], C.gold),
    // bushy blue tassel root ring under the collar
    B([-4, -4, 116], [4, 4, 120], (x, y, z) => (hash01(x, y, z) < 0.25 ? null : hash01(y, z, x) < 0.3 ? C.blueH : C.blue)),
  ], cv, { jitter: 0.05, ao: 0.35 });
  return [shaft, collar];
}

function bladeGeo() {
  // long leaf blade, flat in Y: widest a third of the way up, darker fuller down the middle, bright edges
  const bv = 0.011, z0 = Math.round(1.6 / bv), z1 = Math.round(2.0 / bv), len = z1 - z0;
  const boxes = [];
  for (let z = z0; z < z1; z++) {
    const u = (z - z0) / len;
    const w = Math.max(1, Math.round(7 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.3 + 0.1)), 0.75) * (1 - u * 0.3)));
    boxes.push(B([-w, -1, z], [w, 1, z + 1], (x) => (Math.abs(x + 0.5) < 1 ? 0x8f9aa8 : Math.abs(x + 0.5) >= w - 1 ? 0xf6fbff : 0xd8e2ec)));
  }
  return vox(boxes, bv, { jitter: 0.03, ao: 0.2 });
}

// ---------------------------------------------------------------- materials
/**
 * Hero-only lighting on top of the scene lights (the camera usually sees his back, which the low sun leaves in shade):
 * a soft cool fill from the camera's upper left and a warm Fresnel rim on faces seen edge-on. Split-toned like the
 * concept: peach rim/sun, blue-grey fill. Added after lighting and faded out where the surface is already bright, so
 * it lifts the shade side without blowing sunlit armour into the bloom. Does not touch the scene or other materials.
 */
export function heroLook(mat, fill = 0.4, rim = 0.9) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uHeroFill = { value: fill };
    sh.uniforms.uHeroRim = { value: rim };
    sh.fragmentShader = 'uniform float uHeroFill, uHeroRim;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float heroNdv = abs(dot(normal, normalize(vViewPosition)));
      float heroFl = max(dot(normal, normalize(vec3(-0.4, 0.55, 0.75))), 0.0) * 0.8 + 0.2;
      vec3 heroExtra = diffuseColor.rgb * uHeroFill * heroFl * vec3(0.78, 0.84, 1.0)
        + max(diffuseColor.rgb, vec3(0.4)) * uHeroRim * pow(1.0 - heroNdv, 2.2) * vec3(1.0, 0.7, 0.45);   // rim floor: black lamellar still gets an edge`).replace('#include <opaque_fragment>', `
      outgoingLight += heroExtra * (1.0 - smoothstep(0.2, 0.85, dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722))));
      #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => `hero-look-${fill}-${rim}`;
  return mat;
}

/** Torso / limb / pauldron boxes of this body in another palette (same keys as C): other characters (src/chars/*)
 *  share the build and the armour cut, then add their own head, weapon and trim. → { parts: {joint: boxes}, pauldron(sx) } */
export function bodyParts(pal) {
  const pd = [pauldronBoxes(-1, pal), pauldronBoxes(1, pal)];
  return { parts: limbs(torso(pal), pal), pauldron: (sx) => pd[sx > 0 ? 1 : 0] };
}

/** The three hero materials: body (vertex-coloured voxels + heroLook), metal (gold / iron fittings), blade (bright steel). */
function heroMats() {
  // integration r1: albedo × 0.8 so the ivory lamellar keeps its scale rows under the environment's light + post-fx grade
  // (at 1.0 the armour clipped to flat white)
  return {
    body: heroLook(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.8, 0.8, 0.8), vertexColors: true, roughness: 0.58, metalness: 0.08, flatShading: true })),
    metal: heroLook(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.55, flatShading: true }), 0.25, 0.6),
    blade: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.22, metalness: 0.65, flatShading: true, emissive: 0xcfe4ff, emissiveIntensity: 0.32 }),
  };
}

/** Meshes a body (bodyParts) and its head boxes onto the rig, one mesh per joint. → { meshes, add(parent, geo, name, m) }
 *  (add: the character's weapon and extras, into the same meshes). bv / hv: body / head voxel size; a fine body (bv set:
 *  src/chars/parts.js FV) is authored centred on its joints (no odd-width offset). pauldron(sx) may be absent (no
 *  pauldrons, no helper joints) or return [] (none on that side). */
export function buildBody(rig, mat, { parts, pauldron }, headBoxes, { bv, hv = HV } = {}) {
  const meshes = {};
  const add = (parent, geo, name, m = mat) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    meshes[name] = mesh;
    return mesh;
  };
  for (const [joint, boxes] of Object.entries(parts)) {
    const odd = !bv && /foreArm|thigh|shin/.test(joint);            // odd-width parts: centre them
    add(rig.joints[joint], vox(boxes, bv || V, { off: odd ? [-0.5, 0, -0.5] : [0, 0, 0], jitter: bv ? 0.035 : 0.05 }), joint);
  }
  add(rig.joints.head, vox(headBoxes, hv, { off: [-0.5, 0, 0], jitter: 0.04 }), 'head');
  // pauldrons ride on a helper under each shoulder; secondary.js turns it halfway with the upper arm
  if (pauldron) for (const [s, sx] of [['R', -1], ['L', 1]]) {
    const pd = new THREE.Object3D(), boxes = pauldron(sx);
    pd.name = 'pauldron' + s;
    rig.joints['shoulder' + s].add(pd);
    rig.joints['pauldron' + s] = pd;
    if (boxes.length) add(pd, vox(boxes, bv || V), 'pauldron' + s);   // (vox([]) throws: an empty side has no mesh)
  }
  return { meshes, add };
}

/**
 * A def-built officer (src/chars/defkit.js): built = { parts: {joint: boxes}, head: boxes, bv, hv (voxel sizes, see
 * buildBody), pauldron?: (sx) → boxes, weapon: [{ geo, mat: 'body' | 'metal' | 'blade' | Material }] } — weapon geometry
 * sits on the weapon joint (shaft +Z, origin = the rear grip), meshes named weapon0..n. → { meshes, material, blade (the
 * blade material: a kit may heat its emissive) }
 */
export function buildDef(rig, built) {
  const M = heroMats(), { meshes, add } = buildBody(rig, M.body, built, built.head, built);
  built.weapon.forEach((w, i) => add(rig.joints.weapon, w.geo, 'weapon' + i, typeof w.mat === 'string' ? M[w.mat] : w.mat));
  return { meshes, material: M.body, blade: M.blade };
}

export function createHeroModel(rig) {
  const M = heroMats(), { meshes, add } = buildBody(rig, M.body, bodyParts(C), head());
  const [shaft, collar] = spearGeo();
  add(rig.joints.weapon, shaft, 'spear');
  add(rig.joints.weapon, collar, 'collar', M.metal);
  add(rig.joints.weapon, bladeGeo(), 'blade', M.blade);
  return { meshes, material: M.body };
}
