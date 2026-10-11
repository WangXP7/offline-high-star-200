// Crowd renderer (render-only). Voxel soldiers of the battle's two armies (game.army = { foe, ally }, crowd/armies.js)
// built from shared instanced parts — hips, torso, head, arms, thighs, shins — plus per-kind weapons (spear, dao + round
// shield, captain glaive, the army's standard) and a separate officer set. Per soldier the parts form a small hierarchy
// (pelvis → torso → head/arms → weapon; pelvis → thigh → shin) so knees bend, the torso twists and the weapon follows
// the hand. Poses come from sim state (walk / march / run / guard / wind-up / strike / hurt / knock / air / down / get-up
// / dead) and are blended per soldier, so nothing pops. Instances are packed each frame (count = visible soldiers of that
// kind). Committed attackers coil into a big overhead wind-up (0.67 s) with a pixel-star glint on the weapon tip; a blow
// that will really come flares a big red pixel star for its last 14 sf (a feint keeps the white star). Guards next to a
// striker (crowd.raiseF) brandish their weapons and shout with him. Officers carry a spinning ▼ marker. Allies (crowd
// indices N … T-1) are the same rig in the ally army's palette (their own part and weapon meshes at all three LODs, their
// own standard); duels show no wind-up glint / flare (those telegraph blows on the hero). Struck soldiers flash (aHit,
// below). Never writes sim state.
// Armies: palettes, weapon accents, standards and the emissive accent gains come from game.army when the view is
// created; main.js disposes and recreates the view when the pair changes (dispose()). A named officer with a look
// (crowd.offLook[slot], armies.js) is drawn with his own officer part set (palette + helmet variant), sculpted the first
// time he is drawn and kept until the view is dropped.
import * as THREE from 'three';
import { sculpt, shade, boxesGeometry } from '../core/voxel.js';
import { ST, KIND, CROWD } from './crowd.js';
import { COMBAT } from '../combat/combat.js';
import { hash01 } from '../core/rng.js';
import { HUD_TAG_R } from '../ui/hud.js';
import { ground } from '../world/map.js';
import { palette } from './armies.js';

const V = 0.042;
const b = (a, bb, c, paint) => ({ a, b: bb, c, paint });
// lamellar: 3-voxel rows — dark lacing line, plate body, lit top edge; columns offset per row
const lamel = (base, hi, line) => (x, y, z, i, j) => (j % 3 === 0 ? line : j % 3 === 2 ? hi : ((i + ((j / 3) | 0)) % 2 ? shade(base, 0.86) : base));

const WOOD = 0x5e3d24, STEEL = 0x98968f, BRONZE = 0x9a7838, CAP = 0x16120f, BEARD = 0x1e1612;
/** An officer palette with a named officer's look (armies.js): armor → lacquer, plates, lit rows, lacing, helmet; trim →
 *  rivets, helmet trim, buckle; cape → cape (fold shade derived); plume; helm → helmet variant. */
const withLook = (P, L) => ({ ...P,
  ...(L.armor != null && { armor: L.armor, plate: shade(L.armor, 1.4), hi: shade(L.armor, 2.3), lace: shade(L.armor, 0.5), helm: L.armor }),
  ...(L.trim != null && { rivet: L.trim, helmHi: L.trim, buckle: shade(L.trim, 1.1) }),
  ...(L.cape != null && { cape: [shade(L.cape, 0.72), L.cape] }),
  ...(L.plume != null && { plume: L.plume }),
  ...(L.helm && { helmet: L.helm }) });

// skeleton (soldier space, feet at 0, facing +Z): pelvis 0.86 · waist +0.04 · neck +0.5 · shoulders ±0.235 @ +0.43
// · hips ±0.095 @ -0.02 · knee -0.42 · hand -0.5 from the shoulder
const J = { waist: 0.04, neck: 0.5, shX: 0.235, shY: 0.43, hipX: 0.095, hipY: -0.02, knee: 0.42, hand: 0.5 };

/** Body part box lists for palette C (armies.js GRUNT / OFFICER keys); officer: cape, beard and helmet variant C.helmet. */
function bodyParts(C, officer) {
  const helm = officer && C.helmet;
  const L = lamel(C.armor, C.hi, C.lace);
  const plate = (x, y, z, i, j) => ((i + j) % 4 === 0 ? C.rivet : j % 4 === 3 ? C.hi : C.plate);
  const pauld = (x, y, z, i, j) => (j === 0 ? C.hi : j % 2 ? C.armor : shade(C.armor, 0.8));
  const p = {};
  p.hips = [
    b([-0.16, -0.1, -0.1], [0.16, 0.06, 0.1], C.pants),
    b([-0.175, -0.01, -0.115], [0.175, 0.07, 0.115], C.belt),
    b([-0.04, 0.0, 0.11], [0.04, 0.07, 0.14], C.buckle),
    b([-0.155, -0.34, 0.095], [0.155, 0.0, 0.14], L),
    b([-0.155, -0.34, -0.14], [0.155, 0.0, -0.095], L),
    b([-0.2, -0.26, -0.09], [-0.15, 0.0, 0.09], C.cloth),
    b([0.15, -0.26, -0.09], [0.2, 0.0, 0.09], C.cloth),
  ];
  p.torso = [
    b([-0.155, -0.04, -0.105], [0.155, 0.2, 0.105], L),
    b([-0.18, 0.18, -0.12], [0.18, 0.46, 0.12], L),
    b([-0.13, 0.24, 0.11], [0.13, 0.42, 0.145], plate),
    b([-0.13, 0.24, -0.145], [0.13, 0.42, -0.11], plate),
    b([-0.3, 0.29, -0.135], [-0.14, 0.47, 0.135], pauld),
    b([0.14, 0.29, -0.135], [0.3, 0.47, 0.135], pauld),
    b([-0.125, 0.44, -0.115], [0.125, 0.5, 0.115], C.cloth),
    b([-0.05, 0.46, -0.05], [0.05, 0.53, 0.05], C.skin),
  ];
  if (officer) p.torso.push(b([-0.21, -0.36, -0.2], [0.21, 0.46, -0.145], (x, y, z, i, j) => (j % 5 === 0 ? C.cape[0] : C.cape[1])));   // cape
  p.head = [
    b([-0.1, 0.02, -0.09], [0.1, 0.25, 0.11], C.skin),
    b([-0.1, 0.02, 0.06], [0.1, 0.07, 0.11], C.skinD, true),                           // jaw shadow
    b([-0.07, 0.12, 0.1], [-0.03, 0.155, 0.12], C.eye, true), b([0.03, 0.12, 0.1], [0.07, 0.155, 0.12], C.eye, true),
    b([-0.08, 0.16, 0.1], [-0.02, 0.18, 0.12], C.brow, true), b([0.02, 0.16, 0.1], [0.08, 0.18, 0.12], C.brow, true),
    b([-0.015, 0.08, 0.11], [0.02, 0.13, 0.135], C.skinD),                             // nose
    ...(helm === 'cap' ? [                                                             // officer's cap: no helmet
      b([-0.105, 0.2, -0.115], [0.105, 0.27, 0.1], C.brow),                            // hair
      b([-0.095, 0.25, -0.1], [0.095, 0.38, 0.07], CAP), b([-0.08, 0.34, -0.13], [0.08, 0.44, -0.02], CAP),   // crown, raised back
      b([-0.32, 0.36, -0.12], [0.32, 0.4, -0.08], CAP),                                // the long side flaps
    ] : [
      b([-0.125, 0.18, -0.125], [0.125, 0.32, 0.125], C.helm),
      b([-0.08, 0.32, -0.08], [0.08, 0.35, 0.08], C.helmHi),
      b([-0.12, 0.03, -0.13], [0.12, 0.19, -0.08], lamel(C.helm, C.helmHi, shade(C.helm, 0.6))),   // neck guard
      b([-0.13, 0.06, -0.08], [-0.1, 0.19, 0.05], C.helm), b([0.1, 0.06, -0.08], [0.13, 0.19, 0.05], C.helm),
      b([-0.14, 0.18, -0.14], [0.14, 0.23, 0.14], C.band),                             // headband
      b([-0.05, 0.05, -0.165], [-0.01, 0.2, -0.13], C.band), b([0.01, 0.09, -0.165], [0.05, 0.2, -0.13], C.band),   // knot tails
    ]),
  ];
  if (!officer) p.head.push(b([-0.035, 0.34, -0.035], [0.035, 0.42, 0.035], C.tassel));   // top tassel (reads from above)
  else if (helm === 'horn') {
    p.head.push(
      b([-0.11, -0.04, 0.05], [0.11, 0.08, 0.135], BEARD),                             // full beard
      b([-0.05, 0.22, 0.12], [0.05, 0.3, 0.155], C.helmHi),                            // brow plate
      b([-0.12, 0.26, 0.11], [-0.04, 0.32, 0.15], C.helmHi), b([0.04, 0.26, 0.11], [0.12, 0.32, 0.15], C.helmHi),   // crescent horns
      b([-0.17, 0.3, 0.1], [-0.11, 0.46, 0.14], C.helmHi), b([0.11, 0.3, 0.1], [0.17, 0.46, 0.14], C.helmHi),
      b([-0.21, 0.44, 0.08], [-0.15, 0.56, 0.12], C.helmHi), b([0.15, 0.44, 0.08], [0.21, 0.56, 0.12], C.helmHi),
      b([-0.035, 0.32, -0.12], [0.035, 0.45, -0.04], C.plume));                        // short plume at the back
  } else if (helm === 'crest') {
    p.head.push(
      b([-0.06, -0.02, 0.07], [0.06, 0.07, 0.13], BEARD),                              // chin beard
      b([-0.04, 0.31, -0.15], [0.04, 0.35, 0.13], C.helmHi),                           // gilt comb
      b([-0.03, 0.35, -0.2], [0.03, 0.5, 0.11], C.plume), b([-0.03, 0.5, -0.15], [0.03, 0.58, 0.05], C.plume),   // plume ridge
      b([-0.145, 0.03, 0.0], [-0.115, 0.19, 0.1], C.helmHi), b([0.115, 0.03, 0.0], [0.145, 0.19, 0.1], C.helmHi));   // cheek guards
  } else if (helm === 'cap') {
    p.head.push(b([-0.06, -0.12, 0.07], [0.06, 0.06, 0.13], BEARD), b([-0.09, 0.06, 0.11], [0.09, 0.085, 0.135], BEARD));   // long beard, moustache
  } else {
    p.head.push(
      b([-0.1, 0.0, 0.06], [0.1, 0.08, 0.13], BEARD),                                  // beard
      b([-0.25, 0.24, -0.02], [-0.13, 0.4, 0.03], C.helmHi), b([0.13, 0.24, -0.02], [0.25, 0.4, 0.03], C.helmHi),   // wings
      b([-0.035, 0.34, -0.035], [0.035, 0.62, 0.035], C.plume), b([-0.035, 0.52, -0.2], [0.035, 0.62, -0.03], C.plume));   // plume
  }
  // captain: gilded helmet band + tall horsehair crest (its own small mesh on the head; the body gets a bronze tint)
  p.crest = [
    b([-0.15, 0.175, -0.15], [0.15, 0.235, 0.15], 0xc8a050),
    b([-0.04, 0.34, -0.04], [0.04, 0.66, 0.04], C.crest), b([-0.04, 0.56, -0.26], [0.04, 0.66, -0.04], C.crest),
    b([-0.04, 0.4, -0.3], [0.04, 0.56, -0.22], C.crest)];
  p.arm = [
    b([-0.055, -0.24, -0.06], [0.055, 0.03, 0.06], C.cloth),
    b([-0.06, -0.46, -0.063], [0.06, -0.22, 0.063], (x, y, z, i, j) => (j % 2 ? C.bracer : shade(C.bracer, 1.35))),
    b([-0.045, -0.56, -0.05], [0.045, -0.46, 0.05], C.skin),
  ];
  p.thigh = [b([-0.068, -0.43, -0.072], [0.068, 0.02, 0.072], C.pants)];
  p.shin = [
    b([-0.062, -0.3, -0.066], [0.062, 0.02, 0.066], (x, y, z, i, j) => (j % 3 === 0 ? C.wrapD : C.wrap)),
    b([-0.07, -0.42, -0.078], [0.07, -0.29, 0.13], C.boot),
  ];
  return p;
}

// weapons in weapon space: grip at the origin, +Z along the weapon
const box = (s, p, c) => ({ s, p, c });
/** Weapons in palette C's accents (tassels: C.weapon, shield face: C.shield). */
function weaponGeos(C) {
  const spear = boxesGeometry([
    box([0.042, 0.042, 2.0], [0, 0, 0.38], WOOD), box([0.065, 0.065, 0.06], [0, 0, -0.62], 0x2a1d16),
    box([0.07, 0.07, 0.05], [0, 0, 1.4], BRONZE), box([0.1, 0.1, 0.08], [0, -0.02, 1.35], C.weapon), box([0.05, 0.08, 0.08], [0, -0.08, 1.31], C.weapon),
    box([0.085, 0.028, 0.16], [0, 0, 1.5], STEEL), box([0.05, 0.028, 0.12], [0, 0, 1.63], STEEL), box([0.025, 0.028, 0.06], [0, 0, 1.71], STEEL),
  ]);
  const sword = boxesGeometry([
    box([0.045, 0.045, 0.2], [0, 0, -0.02], 0x2a1d16), box([0.06, 0.06, 0.05], [0, 0, -0.14], BRONZE),
    box([0.05, 0.14, 0.04], [0, 0, 0.1], BRONZE),
    box([0.022, 0.085, 0.66], [0, 0.005, 0.45], STEEL), box([0.022, 0.1, 0.12], [0, 0.02, 0.76], STEEL), box([0.022, 0.05, 0.06], [0, 0.05, 0.84], STEEL),
  ]);
  const glaive = boxesGeometry([
    box([0.05, 0.05, 2.3], [0, 0, 0.45], 0x3a2418), box([0.08, 0.08, 0.06], [0, 0, 1.6], BRONZE),
    box([0.14, 0.14, 0.12], [0, 0, 1.52], C.weapon),
    box([0.028, 0.16, 0.5], [0, 0.05, 1.9], STEEL), box([0.028, 0.1, 0.14], [0, 0.11, 2.2], STEEL), box([0.03, 0.06, 0.06], [0, -0.05, 1.7], BRONZE),
  ]);
  const pole = boxesGeometry([
    box([0.055, 0.055, 3.5], [0, 0, 0.9], WOOD), box([1.0, 0.045, 0.045], [0.45, 0, 2.55], WOOD),
    box([0.09, 0.09, 0.14], [0, 0, 2.72], BRONZE), box([0.14, 0.14, 0.12], [0, 0, 2.6], C.weapon),
  ]);
  // round shield strapped to the forearm: centred in front of it, facing +Z of the hand frame
  const R = 0.29;
  const shieldBoxes = [b([-R, 0.12 - R, 0.07], [R, 0.12 + R, 0.13], (x, y, z) => {
    const r = Math.hypot(x, y - 0.12);
    if (r > R) return null;
    if (z < 0.1 && r > R - 0.06) return null;                                         // bevel the back
    if (r > R - 0.05) return BRONZE;
    if (r < 0.06) return z > 0.1 ? 0xe0b860 : BRONZE;
    if (Math.abs(r - 0.16) < 0.025) return 0xc8a050;
    return (Math.floor(Math.atan2(x, y - 0.12) / (Math.PI / 4)) & 1) ? C.shield[0] : C.shield[1];
  }), b([-0.07, 0.1, 0.13], [0.07, 0.15, 0.17], 0xe0b860)];
  const shield = sculpt(shieldBoxes, V, 0.1), mid_shield = sculpt(shieldBoxes, V * 2, 0.1);
  // far LOD shield (≈ 36 tris vs ≈ 736): a stepped cross of solid boxes, the painted face's colour + the bronze boss
  const far_shield = boxesGeometry([box([0.58, 0.34, 0.06], [0, 0.12, 0.1], C.shield[2]), box([0.34, 0.58, 0.06], [0, 0.12, 0.1], C.shield[2]),
    box([0.12, 0.12, 0.05], [0, 0.12, 0.14], 0xc8a050)]);
  return { spear, sword, glaive, pole, shield, mid_shield, far_shield };
}

/** An officer part set (full voxels, no LOD) for officer palette P, keyed pre + part. */
function officerGeos(P, pre) {
  const off = bodyParts(P, true), g = {};
  for (const k of ['hips', 'torso', 'head', 'arm', 'thigh', 'shin']) g[pre + k] = sculpt(off[k], V, 0.1);
  return g;
}

/** All crowd geometries: foe grunt palette gp, foe officer palette op, ally grunt palette ap (armies.js palette()). */
function buildCrowdGeometries(gp, op, ap) {
  const g = {};
  const grunt = bodyParts(gp, false);
  for (const k of ['hips', 'torso', 'head', 'crest', 'arm', 'thigh', 'shin']) g[k] = sculpt(grunt[k], V, 0.12);
  Object.assign(g, officerGeos(op, 'o_'));
  // mid LOD (8-28 m from the lens): the same parts re-voxelised at twice the voxel size — ≈ a quarter of the faces, same silhouette,
  // lamellar rows and headband still read at that range
  for (const k of ['hips', 'torso', 'head', 'arm', 'thigh', 'shin']) g['mid_' + k] = sculpt(grunt[k], V * 2, 0.12);
  const shu = bodyParts(ap, false);                                                   // allies: same parts, all three LODs
  for (const k of ['hips', 'torso', 'head', 'arm', 'thigh', 'shin']) { g['s_' + k] = sculpt(shu[k], V, 0.12); g['smid_' + k] = sculpt(shu[k], V * 2, 0.12); }
  // grunt shadow proxies: the same solid boxes, un-voxelised (~12 tris each) — the shadow pass never sees the voxel
  // detail. Hips + torso + head share one proxy on the torso matrix.
  const proxy = (boxes, dy = 0) => boxes.filter((q) => !q.paint).map((q) => ({
    s: q.b.map((v, k) => Math.max(0.01, v - q.a[k] - 0.016)), p: q.a.map((v, k) => (v + q.b[k]) / 2 + (k === 1 ? dy : 0)), c: 0 }));
  g.shadow_trunk = boxesGeometry([...proxy(grunt.hips, -J.waist), ...proxy(grunt.torso), ...proxy(grunt.head, J.neck)]);
  for (const k of ['arm', 'thigh', 'shin']) g['shadow_' + k] = boxesGeometry(proxy(grunt[k]));
  // distance LOD (scene lane): the same solid boxes, coloured (a painter's base colour, no voxel detail), ≈ 450 tris
  // per soldier instead of ≈ 4,900. Same rig as the near parts; hips + torso + head ride the torso matrix.
  const far = (boxes, dy = 0) => boxes.filter((q) => !q.paint).map((q) => ({
    s: q.b.map((v, k) => v - q.a[k]), p: q.a.map((v, k) => (v + q.b[k]) / 2 + (k === 1 ? dy : 0)), c: typeof q.c === 'function' ? q.c(0, 0, 0, 0, 1) : q.c }));
  g.far_trunk = boxesGeometry([...far(grunt.hips, -J.waist), ...far(grunt.torso), ...far(grunt.head, J.neck)]);
  for (const k of ['arm', 'thigh', 'shin']) g['far_' + k] = boxesGeometry(far(grunt[k]));
  g.sfar_trunk = boxesGeometry([...far(shu.hips, -J.waist), ...far(shu.torso), ...far(shu.head, J.neck)]);
  for (const k of ['arm', 'thigh', 'shin']) g['sfar_' + k] = boxesGeometry(far(shu[k]));
  Object.assign(g, weaponGeos(gp));
  for (const [k, geo] of Object.entries(weaponGeos(ap))) g['s_' + k] = geo;           // allies: their own tassels / shields
  // officer marker ▼ (voxel rows 7-5-3-1, gold rim around red)
  const tri = [];
  for (let r = 0; r < 4; r++) for (let q = 0; q < 7 - r * 2; q++) {
    const x = (q - (6 - r * 2) / 2) * 0.075, edge = q === 0 || q === 6 - r * 2 || r === 0;
    tri.push(box([0.075, 0.075, 0.09], [x, -r * 0.075, 0], edge ? 0xffd070 : 0xe02a18));
  }
  g.marker = boxesGeometry(tri);
  // glint: a 3-axis pixel star (reads from any camera angle)
  g.glint = boxesGeometry([box([1, 0.12, 0.12], [0, 0, 0], 0xffffff), box([0.12, 1, 0.12], [0, 0, 0], 0xffffff), box([0.12, 0.12, 1], [0, 0, 0], 0xffffff)]);
  return g;
}

/** An army standard: glyph in ink on a bg cloth (lighter panel behind the character, gold edging, swallow tail). */
function flagTexture(glyph, bg, ink = '#1a0f0c') {
  const c = document.createElement('canvas'); c.width = 64; c.height = 112;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 64, 112);
  g.fillStyle = '#e0b058'; g.fillRect(0, 0, 64, 5); g.fillRect(0, 0, 4, 112); g.fillRect(60, 0, 4, 112);
  g.fillStyle = 'rgba(255,225,180,0.28)'; g.fillRect(10, 16, 44, 60);                  // lighter panel behind the character
  g.fillStyle = ink;
  g.font = 'bold 44px "Xingkai SC","STXingkai","Kaiti SC","STKaiti","KaiTi","Songti SC",serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(glyph, 32, 46);
  g.globalCompositeOperation = 'destination-out';                                    // swallow-tail bottom
  g.beginPath(); g.moveTo(14, 112); g.lineTo(32, 88); g.lineTo(50, 112); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  return t;
}

// pose channels (per soldier): torso, head, armR, armL, thighR, thighL (rx,ry,rz) · shinR, shinL (rx) · weapR, weapL (rx,ry,rz)
const TO = 0, HE = 3, AR = 6, AL = 9, TR = 12, TL = 15, SR = 18, SL = 19, WR = 20, WL = 23, NCH = 26;
const GROUP = [0, 1, 2, 3, 2];                  // kind → pose group: 0 spear, 1 sword+shield, 2 glaive, 3 standard-bearer
const TIP = [1.72, 0.86, 2.25, 2.7];             // weapon tip distance along +Z per group
const h01 = (i, k = 0) => (((i + 1) * 2654435761 + k * 40503) >>> 0) / 4294967296;
const legH = (a, bb, rz) => (0.42 * Math.cos(a) + 0.42 * Math.cos(a + bb)) * Math.cos(rz);   // hip → sole height
const smoothstep = THREE.MathUtils.smoothstep;

// ---- recoil pose (hit-impact): the DW flinch. A struck soldier snaps its head back and throws its arms up and back
// within ≈ 2 sf, stumbles with one knee up, holds for ≈ 12 sf, then drops back to guard. There are three variants per
// soldier (both arms flung up and wide / one arm up with a twist / doubled over), mirrored, with jittered amplitude and
// snap speed, so a 15-body band reads as a rippling wave, not clones. Channel values are (rx, ry, rz): torso/head rx < 0
// leans back; arm rx ≈ -2.5 is raised overhead, arm rz pushes it out (right arm < 0, left arm > 0); thigh rx < 0 swings
// the knee forward; shin = knee bend; weapon angles are relative to the hand.
const RECOIL = [
  { // thrown back, both arms flung up and back, one knee kicked up
    TO: [-0.78, 0, 0.06], HE: [-0.75, 0, 0], AR: [-2.4, 0.2, -0.95], AL: [-2.3, -0.2, 1.0],
    TR: [0.32, 0, -0.14], TL: [-0.6, 0, 0.2], SR: 0.2, SL: 1.0, WR: [1.1, 0, 0], WL: [0.5, 0, 0] },
  { // twisted: one arm flung up and back, the other thrown out wide, head turned away
    TO: [-0.62, 0.55, 0.2], HE: [-0.65, -0.35, 0.1], AR: [-2.85, 0, -0.35], AL: [-0.95, 0, 1.35],
    TR: [0.4, 0, -0.18], TL: [-0.35, 0, 0.3], SR: 0.35, SL: 0.7, WR: [1.3, 0, 0], WL: [0.3, 0, 0] },
  { // doubled over the blow, arms thrown forward and out, knees buckling
    TO: [0.72, 0, 0.1], HE: [0.2, 0.25, 0], AR: [-1.35, 0, -0.75], AL: [-1.25, 0, 0.8],
    TR: [-0.55, 0, -0.2], TL: [-0.2, 0, 0.18], SR: 1.1, SL: 0.8, WR: [0.9, 0, 0], WL: [0.4, 0, 0] },
];

/** Recoil pose targets for a HURT / KNOCK soldier into T. Returns the blend rate (1/s), or 0 once the recoil is over
 *  (the caller then blends back to its guard stance). */
function recoilPose(T, i, s, t, sd) {
  const knock = s === ST.KNOCK, hold = knock ? 16 : 12;
  if (t >= hold) return 0;
  const r = hash01(i, 97), v = RECOIL[r < 0.5 ? 0 : r < 0.82 ? 1 : 2];
  const amp = 0.88 + 0.24 * hash01(i, 98), m = sd;               // m = -1 mirrors left ↔ right
  const drift = Math.min(t, 8) * 0.03;                           // the blow keeps carrying the arms back a little
  const put = (k, a, x = 0) => { T[k] = (a[0] - x) * amp; T[k + 1] = a[1] * amp * m; T[k + 2] = a[2] * amp * m; };
  put(TO, v.TO, drift); put(HE, v.HE);
  // limbs: mirrored soldiers swap sides (a roll that pushes the right arm out pushes the left arm out when negated)
  put(m > 0 ? AR : AL, v.AR, drift); put(m > 0 ? AL : AR, v.AL, drift);
  put(m > 0 ? TR : TL, v.TR); put(m > 0 ? TL : TR, v.TL);
  T[m > 0 ? SR : SL] = v.SR; T[m > 0 ? SL : SR] = v.SL;
  T[WR] = v.WR[0]; T[WL] = v.WL[0];
  if (knock) {                                                   // officers: stumbling steps back
    const st = Math.sin(t * 0.5) * 0.35;
    T[TL] += st; T[TR] -= st;
  }
  // snap in on the contact frames (per-soldier speed → the band ripples), then hold
  return t < 2 ? 55 + 45 * hash01(i, 99) : 16;
}

// Sight cone (camera r4): the hero's chest, written each render by update(). Fragments inside the cone from the lens to
// him (radius sightR m at his body, narrowing to the lens) and more than sightGap m in front of him are cut, so the
// front rank of a mob no longer hides him (DW8 fades the soldiers between camera and player). The ring beside and
// beyond him stays drawn.
const uSight = { value: new THREE.Vector3() }, sightR = 1.1, sightGap = 0.8;
/** fx r5: a second sight cone to the Musou dragon's head (xyz world, w = radius at the head, 0 = off; musou/view.js writes it),
 *  so the fan it tears through doesn't hide its face on the contact frames. */
export const dragonSight = new THREE.Vector4();
const uSight2 = { value: dragonSight };

/** Dithered dissolve for fragments closer than `near` metres to the camera or inside the sight cone (DW-style: nothing
 *  blocks the lens or the hero). */
function nearFade(material, near, extra, key = '') {   // key: tells materials with the same shader apart (own uniforms)
  material.customProgramCacheKey = () => `crowd-fade-${near}-${!!extra}${key}`;
  material.onBeforeCompile = (sh) => {
    if (extra) extra(sh);
    sh.uniforms.uSight = uSight; sh.uniforms.uSight2 = uSight2;
    sh.vertexShader = 'varying vec3 vCrowdWP;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 cwp = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        cwp = instanceMatrix * cwp;
      #endif
      vCrowdWP = (modelMatrix * cwp).xyz;`);
    sh.fragmentShader = `varying vec3 vCrowdWP;
uniform vec3 uSight; uniform vec4 uSight2;
float crowdSight(vec3 sP, vec3 tgt, float r, float gap) {   // 0 inside the cone lens → tgt (radius r at tgt), up to gap m short of it
  vec3 ax = tgt - cameraPosition; float l = length(ax), t = dot(sP, ax) / (l * l);
  return t > 0.0 && t < 1.0 - gap / l ? smoothstep(r * t * 0.9, r * t * 1.05, length(sP - ax * t)) : 1.0;
}
` + sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      // camera part (r3): a clean cut at ≈1.3 × near with a thin dithered rim, not a wide screen-door band (under the
      // DoF a wide per-pixel dissolve turned near soldiers and banners into a coarse mosaic)
      float cfade = smoothstep(${(near * 1.27).toFixed(2)}, ${(near * 1.33).toFixed(2)}, distance(vCrowdWP, cameraPosition));
      vec3 sP = vCrowdWP - cameraPosition;
      cfade = min(cfade, crowdSight(sP, uSight, ${sightR.toFixed(2)}, ${sightGap.toFixed(2)}));
      if (uSight2.w > 0.0) cfade = min(cfade, crowdSight(sP, uSight2.xyz, uSight2.w, 0.9));
      if (cfade < 1.0 && cfade < fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(0.06711056, 0.00583715))))) discard;`);
  };
}

// ---- hit readability (hit-impact): the victim flash, a per-instance "aHit" term patched into the crowd material. The
// contact frame pops white-hot silhouette edges over a lifted body for 1 rendered frame (local: a band of 10 struck
// soldiers must not merge into one white blob). Then a warm wash is blended into the lit albedo (≤ 0.22, so the soldiers
// stay dark), with a bright emissive rim on the faces that turn away from the camera (the silhouette edges). It decays
// quadratically over ≈ 10 sf: gold on a hit, deep amber on a heavy hit, red on the killing blow (the DW8 yellow wash; the
// killing blow keeps the armour dark under a hotter red ember rim — fx r3). Weapons stay untinted (write() zeroes the
// glow for them). KO'd bodies keep a red ember rim while airborne, so the blow-away fans read over a dark crowd. The hero
// stays the lightest large mass (hero luma ≈ 1.3-1.6× the tinted soldiers in combo-normal). The recoil pose: recoilPose.
// Driven by crowd.flash[i] (set by combat on the hit frame), crowd.hitHeavy[i], crowd.kod[i], crowd.st[i].
/** Adds `aHit` (vec3 tint colour × strength; > 1 = white pop) to a MeshStandardMaterial via onBeforeCompile. */
function patchHitMaterial(mat) {
  const prev = mat.onBeforeCompile, key = mat.customProgramCacheKey() + '|hitfx3';   // chain other parts' patches
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = function (sh, renderer) {
    prev.call(this, sh, renderer);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aHit;\nvarying vec3 vHit;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvHit = aHit;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vHit;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float hitA = max(vHit.r, max(vHit.g, vHit.b));
        float hitRim = 1.0 - abs(dot(normal, normalize(vViewPosition)));
        if (hitA > 1.01) {                                            // contact frame: white-hot edges, lifted body
          // (fx r3: thinner edge, less lift — a sweep of 8+ contacts turned the struck rank into white mannequins)
          // (fx r3 acc: on voxel boxes every side face is edge-on (rim 1), so the rim term lit whole bodies — a softer rim over
          // a small lift; the pop is capped to one rendered frame in hitGlow, however long the hitstop)
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), 0.05);
          totalEmissiveRadiance += (vHit - 1.0) * (0.05 + 0.5 * hitRim * hitRim * hitRim * hitRim);
        } else if (hitA > 0.0) {
          vec3 hitC = vHit / hitA;
          float hitL = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
          // lit wash: albedo toward the tint, brighter where the albedo is brighter (skin, plates), so shading stays
          // fx r3: red tints (killing blow, KO ember) keep the armour dark — the cue is a hot ember rim on the silhouette,
          // not an albedo wash / flat glow (mass launches read as salmon-pink mannequins)
          float hitRed = clamp((0.45 - hitC.g) * 4.0, 0.0, 1.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, hitC * (0.33 + 1.3 * hitL), 0.13 * hitA * (1.0 - 0.85 * hitRed));   // (fx r3 acc: 0.22 → 0.13, struck ranks went tan / salmon)
          float hitFlat = 0.04 + 0.04 * hitRed;
          totalEmissiveRadiance += hitC * hitA * (hitFlat + (0.55 + 0.7 * hitRed) * hitRim * hitRim * hitRim * hitRim);   // (fx r3 acc: rim⁴, voxel sides are all edge-on)
        }`);
  };
}

const HOT = [1.55, 1.53, 1.5], GOLD = [1.0, 0.6, 0.12], AMBER = [1.0, 0.4, 0.07], KILL = [1.0, 0.25, 0.12];   // HOT: 1 + white emissive
const EMBER = 0.3;                                                 // KO'd bodies keep a dim red rim until they land

export function createCrowdView(scene, game) {
  const crowd = game.crowd, N = crowd.T, NW = crowd.N;          // N: every soldier (foe army + allies ≥ NW)
  const { foe, ally } = game.army, fp = palette(foe), ap = palette(ally).grunt;
  const geos = buildCrowdGeometries(fp.grunt, fp.officer, ap);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.06, flatShading: true });
  // accent gains per hue (red, green, blue, purple): the max of the two armies' glow (armies.js)
  const uGlow = { value: new THREE.Vector4(...foe.glow.map((v, k) => Math.max(v, ally.glow[k]))) };
  nearFade(mat, 2.4, (sh) => {
    // backlit golden hour: a little self-light keeps the army from reading as black blocks, and the armies' accent
    // colours (headbands, crests, tassels, sashes) glow enough to read as a pattern at distance and at night. The hue
    // masks are disjoint (red: 魏 · green: 蜀 / 劉 · blue: 曹 · purple: 董); dark coats stay under them
    sh.uniforms.uGlow = uGlow;
    sh.fragmentShader = 'uniform vec4 uGlow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      #ifdef USE_COLOR
        vec4 cHue = vec4(smoothstep(0.3, 0.5, vColor.r - max(vColor.g, vColor.b)),
          smoothstep(0.15, 0.35, vColor.g - max(vColor.r, vColor.b)), smoothstep(0.15, 0.35, vColor.b - max(vColor.r, vColor.g)),
          smoothstep(0.08, 0.2, min(vColor.r, vColor.b) - vColor.g));
        totalEmissiveRadiance += vColor.rgb * (0.08 + dot(cHue, uGlow));
      #endif`);
  });
  patchHitMaterial(mat);                                     // hit-impact: victim flash/tint
  // rendered frames soldier i has shown the hot pop for (write() runs each visible flashing soldier once a render): the
  // flash counter holds through hitstop (6-8 sf on heavy hits), so the pop is cut to 1 frame here (fx r3 acc)
  const popN = new Uint8Array(N);
  /** Tint of soldier i this frame (colour × strength, or HOT on the contact frame), written into out[0..2]. */
  const hitGlow = (i, out) => {
    const fl = crowd.flash[i], ember = crowd.kod[i] && crowd.st[i] === ST.AIR ? EMBER : 0;
    if (fl <= 0 && !ember) { popN[i] = 0; out[0] = out[1] = out[2] = 0; return; }
    const heavy = crowd.hitHeavy[i];
    const D = COMBAT.tintFrames - 1 + (heavy ? 3 : 0);               // flash value on the frame a fresh hit shows
    if (fl >= D) { if (!popN[i]) { popN[i] = 1; out[0] = HOT[0]; out[1] = HOT[1]; out[2] = HOT[2]; return; } }
    else popN[i] = 0;
    const u = Math.min(1, Math.min(fl, D - 1) / (D - 1)), k = Math.max(ember, u * u);   // decays from the first frame: brief, not a held wash
    const C = crowd.kod[i] ? KILL : heavy ? AMBER : GOLD;
    out[0] = C[0] * k; out[1] = C[1] * k; out[2] = C[2] * k;
  };
  const meshes = [];
  const proxyMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), proxies = [];
  /** shadow: true (the mesh casts), false, or a proxy geometry that casts instead (shares the instance matrices) */
  const mk = (geo, cap, material = mat, shadow = true) => {
    const n = Math.max(1, cap);
    const m = new THREE.InstancedMesh(geo, material, n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
    m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.castShadow = shadow === true; m.receiveShadow = true; m.frustumCulled = false; m.count = 0;
    // hit-impact: per-instance victim glow
    if (material === mat) m.geometry.setAttribute('aHit', new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
    scene.add(m); meshes.push(m);
    if (shadow && shadow !== true) {
      const p = new THREE.InstancedMesh(shadow, proxyMat, n);
      p.instanceMatrix = m.instanceMatrix; p.castShadow = true; p.frustumCulled = false; p.count = 0;
      // perf r5: shadow pass only — the main pass calls onBeforeRender (the shadow pass doesn't), so the invisible proxy
      // draws 0 indices there (it used to cost as many main-pass tris as its shadow: ≈ 110k at C6)
      p.onBeforeRender = () => { shadow.drawRange.count = 0; };
      p.onAfterRender = () => { shadow.drawRange.count = Infinity; };
      scene.add(p); proxies.push([p, m]);
    }
    return m;
  };
  const G = crowd.grunts, O = CROWD.officerSlots, A = CROWD.allySlots;   // O: every slot the story may field at once
  // one body-part set from geos[pre + part] for n soldiers (two arms / thighs / shins each). Voxel sets: the solid-box
  // proxies cast their shadows (cast: every part casts its own — officers); far box sets: one trunk + limbs, all cast
  const parts = (pre, n, cast = false) => ({ hips: mk(geos[pre + 'hips'], n, mat, cast), torso: mk(geos[pre + 'torso'], n, mat, cast || geos.shadow_trunk),
    head: mk(geos[pre + 'head'], n, mat, cast), arm: mk(geos[pre + 'arm'], n * 2, mat, cast || geos.shadow_arm),
    thigh: mk(geos[pre + 'thigh'], n * 2, mat, cast || geos.shadow_thigh), shin: mk(geos[pre + 'shin'], n * 2, mat, cast || geos.shadow_shin) });
  const farParts = (pre, n) => ({ torso: mk(geos[pre + 'trunk'], n), arm: mk(geos[pre + 'arm'], n * 2), thigh: mk(geos[pre + 'thigh'], n * 2), shin: mk(geos[pre + 'shin'], n * 2) });
  const PG = parts('', G);
  const M = {
    crest: mk(geos.crest, G),
    spear: mk(geos.spear, G), sword: mk(geos.sword, G), shield: mk(geos.shield, G), mid_shield: mk(geos.mid_shield, G), far_shield: mk(geos.far_shield, G), glaive: mk(geos.glaive, G + O), pole: mk(geos.pole, G),
  };
  const MA = { spear: mk(geos.s_spear, A), sword: mk(geos.s_sword, A), shield: mk(geos.s_shield, A), mid_shield: mk(geos.s_mid_shield, A), far_shield: mk(geos.s_far_shield, A), glaive: M.glaive, pole: mk(geos.s_pole, A) };   // allies' weapons
  const PO = parts('o_', O, true);
  // named officers' looks (crowd.offLook): one officer part set per look object, sculpted the first time it is drawn
  const looks = new Map();
  const officerSet = (look) => {
    if (!look) return PO;
    let set = looks.get(look);
    if (!set) {
      const pre = `L${looks.size}_`;
      Object.assign(geos, officerGeos(withLook(fp.officer, look), pre));
      looks.set(look, (set = parts(pre, O, true)));
    }
    return set;
  };
  // LOD by distance from the camera, same pose and matrices: full voxel set inside MID_LOD m, the half-resolution set
  // (≈ 1.2k tris instead of ≈ 4.9k) to FAR_LOD, then the low-poly box set (one trunk + limbs)
  const MID_LOD = 8, FAR_LOD = 28;
  const PM = parts('mid_', G), PF = farParts('far_', G);
  // allies: near / mid / far sets
  const PS = parts('s_', A), PSM = parts('smid_', A), PSF = farParts('sfar_', A);
  let farNow = false, midNow = false;
  const uTime = { value: 0 };
  const flagGeo = new THREE.PlaneGeometry(0.9, 1.5, 4, 6).rotateX(Math.PI / 2).translate(0.5, 0, 1.78);
  const flagMat = new THREE.MeshStandardMaterial({ map: flagTexture(foe.glyph, foe.flag, foe.ink), side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9 });
  const flagWave = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float fph = instanceMatrix[3].x * 1.3 + instanceMatrix[3].z * 0.7;
      float fu = clamp((position.x - 0.05) / 0.9, 0.0, 1.0);
      transformed.y += (sin(uTime * 3.6 + position.x * 3.2 - position.z * 1.4 + fph) * 0.1 + sin(uTime * 6.1 + position.z * 2.3 + fph) * 0.03) * fu;`);
  };
  // camera part (r3): flags dissolve only near the lens (was 7 m, which screen-doored every banner around the hero
  // into a chain-mail pattern)
  nearFade(flagMat, 3.2, flagWave);
  M.flag = mk(flagGeo, G, flagMat, false);
  const allyFlagMat = flagMat.clone();
  allyFlagMat.map = flagTexture(ally.glyph, ally.flag, ally.ink);
  nearFade(allyFlagMat, 3.2, flagWave, 'ally');
  MA.flag = mk(flagGeo, A, allyFlagMat, false);
  const markerMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0.85, 0.8, 0.75), fog: false });
  nearFade(markerMat, 5);
  M.marker = mk(geos.marker, O, markerMat, false);
  M.glint = mk(geos.glint, 32, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.2, 1.6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false }), false);
  M.glint.renderOrder = 7;                                   // telegraph reads through the ring
  // the red flare before a real blow: a solid (not additive) pixel star with the white star as its core; kept at
  // ≈ 0.5 so the luminance tone curve (post.js) keeps it red instead of bleaching it to pink
  M.flare = mk(geos.glint, 32, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.48, 0.01, 0.005), depthTest: false, fog: false }), false);
  M.flare.renderOrder = 6;

  // per-soldier render state: blended pose channels, a "seen" flag (snap on first sight), stable look variety
  const cur = new Float32Array(N * NCH), T = new Float32Array(NCH), C = new Float32Array(NCH), seen = new Uint8Array(N);
  const tint = new Float32Array(N), side = new Float32Array(N), size = new Float32Array(N);
  for (let i = 0; i < N; i++) { tint[i] = 0.86 + h01(i) * 0.28; side[i] = h01(i, 1) < 0.5 ? 1 : -1; size[i] = 0.96 + h01(i, 2) * 0.08; }
  let time = 0;

  const set3 = (k, x, y, z) => { T[k] = x; T[k + 1] = y; T[k + 2] = z; };

  /** Stance targets (rest / march / guard) for group g; `w` = weapon pitch (world, 0 = level, -π/2 = up). */
  function stance(i, g, s, v, form) {
    const sd = side[i], ph = crowd.phase[i];
    T.fill(0);
    const moving = v > 0.35;
    const rally = !form && !crowd.token[i] && (s === ST.GUARD || s === ST.ADVANCE) && game.frame < crowd.raiseF[i];
    if (s === ST.GUARD || s === ST.ATTACK || rally) {
      // posture: knees bent, weight low, weapon up, bouncing on the balls of the feet
      const bob = Math.sin(time * 4.2 + i * 1.3) * 0.07, br = Math.sin(time * 2.6 + i) * 0.03;
      set3(TO, 0.16 + br, -0.28 * sd, 0); set3(HE, -0.06, 0.25 * sd, 0);
      set3(TL, -0.42, 0, 0.14); set3(TR, 0.22, 0, -0.14); T[SL] = 0.62 + bob; T[SR] = 0.42 + bob;
      if (moving) { const a = 0.32; T[TL] += -a * Math.sin(ph * 1.6); T[TR] += a * Math.sin(ph * 1.6); T[SL] += 0.25 * Math.max(0, Math.cos(ph * 1.6)); T[SR] += 0.25 * Math.max(0, -Math.cos(ph * 1.6)); }
      if (rally) {
        // war cry with the striker next to him (crowd.raiseF): chest out, head thrown back, weapon brandished high and
        // pumped at the hero, free arm up — the ring surges on the beat
        const pump = Math.sin(time * 11 + i * 0.7) * 0.22;
        set3(TO, -0.14, -0.12 * sd, 0); set3(HE, -0.36, 0.1 * sd, 0);
        if (g === 1) { set3(AR, -2.75 + pump, 0, -0.25); T[WR] = -3.7 - T[AR]; set3(AL, -1.5, 0, 0.3); T[WL] = 1.2; }
        else if (g === 3) { set3(AR, -0.9, 0, -0.1); T[WR] = -1.57 - T[AR] + pump; set3(AL, -2.6, 0, 0.3); }
        else { set3(AR, -2.5 + pump, 0, -0.3); T[WR] = -1.15 - T[AR]; set3(AL, -2.4 - pump, 0, 0.35); }
        return;
      }
      // idle feint: now and then a lone guard raises his weapon and shouts
      const feint = !crowd.token[i] && s === ST.GUARD && ((game.frame + i * 53) % 720) < 30;
      if (g === 1) {
        set3(AR, feint ? -2.6 : -0.95, 0, -0.3); T[WR] = (feint ? -3.3 : -0.85) - T[AR];
        set3(AL, -1.15, 0, 0.22); T[WL] = 1.1;
        set3(TO, 0.16 + br, 0.22 * sd, 0);
      } else if (g === 3) {
        set3(AR, -0.62, 0, -0.08); T[WR] = -1.57 - T[AR] + (feint ? 0.25 * Math.sin(time * 9) : 0);
        set3(AL, -0.8, 0, -0.35);
        set3(TO, 0.06, 0, 0);
      } else {
        set3(AR, feint ? -1.3 : -0.42, 0, -0.26); T[WR] = (feint ? -1.5 : -0.5) - T[AR];
        set3(AL, -1.12, 0.1, -0.3); T[WL] = 0;
      }
      if (feint) T[HE] = -0.25;
      return;
    }
    // rest / march / run
    const lean = Math.min(0.26, 0.03 + v * 0.045);
    set3(TO, lean + Math.sin(time * 1.7 + i) * 0.015, 0, 0); set3(HE, -lean * 0.5, 0, 0);
    set3(TL, 0, 0, 0.04); set3(TR, 0, 0, -0.04); T[SL] = T[SR] = 0.04;
    if (moving) {
      const a = Math.min(0.8, 0.28 + v * 0.1), kb = 0.35 + v * 0.13;
      T[TL] = -a * Math.sin(ph); T[TR] = a * Math.sin(ph);
      T[SL] = 0.12 + kb * Math.max(0, Math.cos(ph)); T[SR] = 0.12 + kb * Math.max(0, -Math.cos(ph));
      T[TO + 1] = 0.12 * Math.sin(ph);
    }
    const swing = moving ? Math.min(0.7, 0.2 + v * 0.1) * Math.sin(ph) : 0;
    if (g === 1) {
      const run = moving && !form;
      set3(AR, run ? -1.0 + swing * 0.3 : -0.15 + swing * 0.5, 0, -0.14); T[WR] = (run ? -1.6 : 0.9) - T[AR];
      set3(AL, run ? -0.85 : -0.35 - swing * 0.5, 0, 0.16); T[WL] = -T[AL];
    } else if (g === 3) {
      set3(AR, -0.6, 0, -0.06); T[WR] = -1.57 - T[AR] + swing * 0.08;
      set3(AL, -0.78, 0, -0.36);
    } else if (moving && !form) {                                                    // charging: weapon forward
      set3(AR, -0.42, 0, -0.22); T[WR] = -0.55 - T[AR];
      set3(AL, -1.0 + swing * 0.15, 0.1, -0.3);
    } else {                                                                          // upright, shouldered
      set3(AR, -0.32, 0, -0.1); T[WR] = -1.5 - T[AR];
      set3(AL, swing * 0.8 + 0.02, 0, 0.1);
    }
  }

  /** Full pose targets for soldier i; returns the blend rate (1/s). */
  function pose(i, s, t) {
    const g = GROUP[crowd.kind[i]], sd = side[i];
    const v = Math.hypot(crowd.vx[i], crowd.vz[i]);
    if (s <= ST.ATTACK) {
      stance(i, g, s, v, crowd.form[i]);
      if (s !== ST.ATTACK) return 12;
      const w = crowd.foe[i] < 0 ? game.diff.windup : CROWD.windup;              // duels keep the base timing
      if (t < w - 3) {                                                                // wind-up: coil and hold (telegraph)
        // big overhead coil read at gameplay distance: weapon high over the head, body arched back on a wide stance;
        // the last 14 sf he trembles at full stretch
        const hot = t >= w - 14, tr = (hot ? Math.sin(t * 2.3) * 0.09 : Math.sin(t * 1.9) * 0.04) * smoothstep(t, 0, 12);
        if (g === 0) { set3(TO, -0.22, -0.45, 0); set3(HE, -0.2, 0.4, 0); set3(AR, -2.75, 0, -0.35); T[WR] = -0.2 - T[AR] + tr; set3(AL, -1.9, 0.2, 0.2); }
        else if (g === 1) { set3(TO, -0.24, 0.3, 0); set3(AR, -3.0, 0, -0.2); T[WR] = -4.0 - T[AR] + tr; set3(AL, -1.35, 0, 0.3); T[WL] = 1.2; }
        else { set3(TO, -0.24, -0.55, 0); set3(HE, -0.1, 0.45, 0); set3(AR, -2.7, 0, -0.5); T[WR] = -3.4 - T[AR] + tr; set3(AL, -2.4, 0, 0.45); }
        set3(TL, -0.62, 0, 0.18); set3(TR, 0.45, 0, -0.18); T[SL] = 0.75; T[SR] = 0.5;
        return 9;
      }
      if (t < w + 10) {                                                               // strike + lunge
        if (g === 0) { set3(TO, 0.36, 0.35, 0); set3(AR, -1.4, 0, -0.08); T[WR] = -0.04 - T[AR]; set3(AL, -1.45, 0, -0.2); }
        else if (g === 1) { set3(TO, 0.42, -0.12, 0); set3(AR, -0.62, 0, -0.1); T[WR] = 0.62 - T[AR]; set3(AL, -0.8, 0, 0.3); T[WL] = 0.8; }
        else { set3(TO, 0.36, 0.55, 0); set3(AR, -0.9, 0, 0.25); T[WR] = 0.35 - T[AR]; set3(AL, -0.8, 0, -0.3); }
        set3(TL, -0.85, 0, 0.12); set3(TR, 0.55, 0, -0.12); T[SL] = 0.9; T[SR] = 0.12;
        return 42;
      }
      return 7;                                                                      // recovery: ease back to guard
    }
    T.fill(0);
    if (s === ST.HURT || s === ST.KNOCK) {
      // hit-impact: DW flinch — arms flung up and back, stumble, then back to guard (recoilPose)
      const rate = recoilPose(T, i, s, t, sd);
      if (rate) return rate;
      stance(i, g, ST.GUARD, 0, 0); return 8;
    }
    if (s === ST.AIR) {
      set3(TO, -0.3 + Math.sin(t * 0.3) * 0.2, 0, Math.sin(t * 0.23) * 0.2); set3(HE, -0.6, 0, 0);
      set3(AR, -2.4 + Math.sin(t * 0.5) * 0.5, 0, -0.9); set3(AL, -2.2 + Math.cos(t * 0.5) * 0.5, 0, 0.9); T[WR] = 0.8; T[WL] = 0.6;
      set3(TL, -0.85, 0, 0.25); set3(TR, -0.2, 0, -0.3); T[SL] = 1.2; T[SR] = 0.5;
      return 16;
    }
    if (s === ST.GETUP) {
      const u = smoothstep(t, 0, 26);
      if (u > 0.55) { stance(i, g, ST.GUARD, 0, 0); return 10; }
      set3(TO, 0.5, 0, 0); set3(AR, -0.5, 0, -0.45); set3(AL, -0.5, 0, 0.45); T[WR] = 0.3;
      set3(TL, -1.3, 0, 0.2); set3(TR, -1.1, 0, -0.2); T[SL] = 1.6; T[SR] = 1.5;
      return 12;
    }
    // DOWN / DEAD: sprawled, one knee up
    set3(HE, -0.25, 0.4 * sd, 0); set3(AR, -0.25, 0, -1.4); set3(AL, -0.45, 0, 1.2); T[WR] = 0.9; T[WL] = 0.5;
    set3(TL, -0.1, 0, 0.3); set3(TR, -0.55, 0, -0.18); T[SL] = 0.1; T[SR] = 0.85;
    if (s === ST.DOWN) T[TO] = Math.sin(time * 5 + i) * 0.03;
    return 14;
  }

  const _root = new THREE.Matrix4(), _tmp = new THREE.Matrix4(), _loc = new THREE.Matrix4(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
  const mHips = new THREE.Matrix4(), mTorso = new THREE.Matrix4(), mArmR = new THREE.Matrix4(), mArmL = new THREE.Matrix4();
  const mThigh = new THREE.Matrix4(), mOut = new THREE.Matrix4(), mW = new THREE.Matrix4();
  const _c = new THREE.Color(), _ch = new THREE.Color(), _v = new THREE.Vector3(), _s = new THREE.Matrix4();
  const _glintCold = new THREE.Color(0.55, 0.55, 0.55);    // × glint material: the white wind-up star
  const _g = [0, 0, 0];                                      // hit-impact: emissive glow of the soldier being written
  const local = (out, parent, px, py, pz, rx, ry, rz) => {
    _loc.makeRotationFromEuler(_e.set(rx, ry, rz)).setPosition(px, py, pz);
    return out.multiplyMatrices(parent, _loc);
  };
  // Instances are packed per frame; every write is also recorded per soldier so a standing soldier can be replayed
  // (copied) on most frames instead of recomputed.
  const REC = 16, recMesh = new Array(N * REC), recMat = new Float32Array(N * REC * 16), recCol = new Float32Array(N * REC * 3), recN = new Uint8Array(N);
  let recI = 0;
  const push = (m, mat, col) => {
    const n = m.count++, r = recI * REC + recN[recI]++;
    mat.toArray(m.instanceMatrix.array, n * 16); mat.toArray(recMat, r * 16); recMesh[r] = m;
    if (col) { col.toArray(m.instanceColor.array, n * 3); col.toArray(recCol, r * 3); }
    else { m.instanceColor.array.fill(1, n * 3, n * 3 + 3); recCol.fill(1, r * 3, r * 3 + 3); }
    const h = m.geometry.attributes.aHit;                    // hit-impact: glow of the soldier being written
    if (h) h.array.set(_g, n * 3);
  };
  const replay = (i) => {
    for (let k = 0; k < recN[i]; k++) {
      const r = i * REC + k, m = recMesh[r], n = m.count++;
      m.instanceMatrix.array.set(recMat.subarray(r * 16, r * 16 + 16), n * 16);
      m.instanceColor.array.set(recCol.subarray(r * 3, r * 3 + 3), n * 3);
      const h = m.geometry.attributes.aHit;                  // replayed soldiers are never flashing
      if (h) h.array.fill(0, n * 3, n * 3 + 3);
    }
  };
  let frameNo = 0;

  function write(i, s, dt) {
    const t = crowd.stT[i], o = i * NCH, officer = crowd.type[i] === 1, kind = crowd.kind[i], g = GROUP[kind];
    const rate = pose(i, s, t);
    const k = seen[i] ? 1 - Math.exp(-rate * dt) : 1;
    seen[i] = 1; recI = i; recN[i] = 0;
    for (let j = 0; j < NCH; j++) { cur[o + j] += (T[j] - cur[o + j]) * k; C[j] = cur[o + j]; }
    // pelvis height from the legs (bent knees lower the body; lying overrides)
    const pel = -J.hipY + Math.max(legH(C[TL], C[SL], C[TL + 2]), legH(C[TR], C[SR], C[TR + 2]));
    const sc = (officer ? 1.16 : kind === KIND.CAPTAIN ? 1.06 : 1) * size[i];
    const rx = crowd.rx[i];
    let y = crowd.y[i] + pel * sc;
    if (s >= ST.AIR && s <= ST.DEAD) {
      // hit-impact: lower the pivot by how horizontal the body is (on its back or face down, in the air too), so a
      // tumbling body touches the ground continuously instead of snapping down when it lands
      const lie = Math.abs(Math.sin(rx));
      y = crowd.y[i] + (pel * sc) * (1 - lie) + 0.14 * lie;
      if (s === ST.DEAD && t > CROWD.deadTime - 50) y -= (t - (CROWD.deadTime - 50)) / 50 * 0.5;
    }
    const shake = crowd.hs[i] > 0 ? Math.sin(crowd.hs[i] * 2.7) * 0.05 : 0;
    y += ground(crowd.x[i], crowd.z[i]);                          // sim y is height above ground (world/map.js)
    _root.makeRotationFromEuler(_e.set(rx, crowd.yaw[i], 0)).setPosition(crowd.x[i] + shake, y, crowd.z[i]);
    _root.multiply(_s.makeScale(sc, sc, sc));
    // colour: per-soldier tint; the hit flash is an emissive glow (hit-impact, hitGlow)
    const f = tint[i], cap = kind === KIND.CAPTAIN;
    _ch.setRGB(f, f * 0.98, f * 0.95);
    hitGlow(i, _g);
    // telegraph: the last 14 sf of a blow that will really come (feints don't flare)
    const hotStrike = s === ST.ATTACK && !crowd.feint[i] && crowd.foe[i] < 0 && t >= game.diff.windup - 14 && t < game.diff.windup;
    if (cap) _c.setRGB(_ch.r * 1.45, _ch.g * 1.1, _ch.b * 0.7); else _c.copy(_ch);                  // captains: bronze armour
    const ally = i >= NW, far = farNow && !officer, W = ally ? MA : M;
    const P = officer ? officerSet(crowd.offLook[i - crowd.grunts]) : ally ? (far ? PSF : midNow ? PSM : PS) : far ? PF : midNow ? PM : PG;
    mHips.copy(_root); if (!far) push(P.hips, mHips, _c);
    local(mTorso, mHips, 0, J.waist, 0, C[TO], C[TO + 1], C[TO + 2]); push(P.torso, mTorso, _c);
    local(mOut, mTorso, 0, J.neck, 0, C[HE], C[HE + 1], C[HE + 2]); if (!far) push(P.head, mOut, _ch);
    if (cap) push(M.crest, mOut, _ch);
    local(mArmR, mTorso, -J.shX, J.shY, 0, C[AR], C[AR + 1], C[AR + 2]); push(P.arm, mArmR, _c);
    local(mArmL, mTorso, J.shX, J.shY, 0, C[AL], C[AL + 1], C[AL + 2]); push(P.arm, mArmL, _c);
    local(mThigh, mHips, -J.hipX, J.hipY, 0, C[TR], C[TR + 1], C[TR + 2]); push(P.thigh, mThigh, _c);
    push(P.shin, local(mOut, mThigh, 0, -J.knee, 0, C[SR], 0, 0), _c);
    local(mThigh, mHips, J.hipX, J.hipY, 0, C[TL], C[TL + 1], C[TL + 2]); push(P.thigh, mThigh, _c);
    push(P.shin, local(mOut, mThigh, 0, -J.knee, 0, C[SL], 0, 0), _c);
    // weapons
    _g[0] = _g[1] = _g[2] = 0;                               // hit-impact: the victim tint is body-only (DW keeps weapons neutral)
    local(mW, mArmR, 0, -J.hand, 0, C[WR], C[WR + 1], C[WR + 2]);
    const wm = g === 0 ? W.spear : g === 1 ? W.sword : g === 2 ? W.glaive : W.pole;
    push(wm, mW, _c);
    if (g === 3) push(W.flag, mW, null);
    if (g === 1) push(far ? W.far_shield : midNow ? W.mid_shield : W.shield, local(mOut, mArmL, 0, -J.hand, 0, C[WL], C[WL + 1], C[WL + 2]), _c);
    // telegraph: pixel-star glint on the weapon tip through the wind-up (drawn over the crowd); a real blow flares it
    // into a big solid red pixel star (white core) for the last 14 sf
    if (s === ST.ATTACK && t >= 3 && t < game.diff.windup && M.glint.count < 32 && crowd.foe[i] < 0) {
      const pulse = hotStrike ? 0.46 + 0.16 * Math.abs(Math.sin(t * 0.9)) : 0.2 + 0.12 * Math.abs(Math.sin(t * 0.33)) + (t < 10 ? (10 - t) * 0.025 : 0);
      _tmp.makeRotationFromEuler(_e.set(t * 0.07, t * 0.11, 0.6)).scale(_v.set(pulse, pulse, pulse));
      _tmp.setPosition(_v.set(0, 0, TIP[g]).applyMatrix4(mW));
      if (hotStrike) { push(M.flare, _tmp, null); _tmp.scale(_v.set(0.45, 0.45, 0.45)); }
      push(M.glint, _tmp, _glintCold);
    }
    // hud part (r4): inside HUD_TAG_R the HUD's ▼▼ name/HP tag marks the officer; skip the 3D ▼
    if (officer && s !== ST.DEAD && !((crowd.x[i] - game.hero.x) ** 2 + (crowd.z[i] - game.hero.z) ** 2 < HUD_TAG_R ** 2)) {
      _tmp.makeRotationY(time * 2.2).scale(_v.set(0.7, 0.7, 0.7)).setPosition(crowd.x[i], y + 1.35 * sc + 0.62 + Math.sin(time * 3 + i) * 0.06, crowd.z[i]);
      push(M.marker, _tmp, null);
    }
  }

  // camera cull (scene lane): soldiers outside last frame's view frustum (+ 2.5 m slack) aren't packed at all, so they
  // cost neither the main nor the shadow pass; they snap to their pose on re-entry (seen = 0)
  const frustum = new THREE.Frustum(), vp = new THREE.Matrix4(), sph = new THREE.Sphere(new THREE.Vector3(), 2.5);
  return {
    /** camera: cull to its frustum, LOD by distance from it. */
    update(dt, camera) {
      time += dt; uTime.value = time; frameNo++;
      frustum.setFromProjectionMatrix(vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      const h = game.hero;
      uSight.value.set(h.x, ground(h.x, h.z) + h.y + 0.95, h.z);
      for (const m of meshes) m.count = 0;
      for (let i = 0; i < N; i++) {
        const s = crowd.st[i];
        if (s === ST.OFF) { seen[i] = 0; continue; }
        // sim y is height above ground: the sphere sits on the terrain (raised arenas were culled while on screen)
        if (!frustum.intersectsSphere(sph.set(sph.center.set(crowd.x[i], crowd.y[i] + 1 + ground(crowd.x[i], crowd.z[i]), crowd.z[i]), 2.5))) { seen[i] = 0; continue; }
        const d2 = (crowd.x[i] - camera.position.x) ** 2 + (crowd.z[i] - camera.position.z) ** 2;
        farNow = d2 > FAR_LOD * FAR_LOD; midNow = d2 > MID_LOD * MID_LOD;
        // standing soldiers (idle ranks) are recomputed every 4th frame and replayed in between
        if (s === ST.IDLE && seen[i] && crowd.type[i] === 0 && !crowd.flash[i] && ((frameNo + i) & 3)) replay(i);
        else write(i, s, (s === ST.IDLE ? 4 : 1) * dt);
      }
      for (const m of meshes) {
        m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
        if (m.geometry.attributes.aHit) m.geometry.attributes.aHit.needsUpdate = true;
        m.visible = m.count > 0;                                                          // no empty draw calls
      }
      for (const [p, m] of proxies) { p.count = m.count; p.visible = m.visible; }
    },
    /** Drop every mesh, geometry, material and standard texture (main.js rebuilds the view for a new army pair). */
    dispose() {
      for (const m of [...meshes, ...proxies.map(([p]) => p)]) { scene.remove(m); m.dispose(); }
      for (const k in geos) geos[k].dispose();
      flagGeo.dispose();
      for (const m of new Set([...meshes.map((m) => m.material), proxyMat])) { m.map?.dispose(); m.dispose(); }
    },
  };
}
