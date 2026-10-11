// Voxel castle (def.castle; 定軍山: the 魏軍營寨's front): stone curtain wall facing -Z with two bastions (its west end
// runs into the cliffs), a gate passage through the wall with two studded door leaves that swing open (the def's
// `gate`, a map gate of kind 'doors': world.js), two-tier gatehouse, tall corner tower and the flank wall that closes
// the courtyard's east side, and a garrison of archers on the wall walk. Params { gate, wallZ, gateX, x0, y }: the wall
// runs x0 … gateX + 18 (corner tower beyond), bastions at x0 + 10 / x0 + 30 (keep x0 ≤ gateX − 45), face at z = wallZ.
// Built in its plateau's frame (world.js lifts it to y). Static merged geometry except the door leaves and the
// garrison (instanced, idle sway).
import * as THREE from 'three';
import { boxesGeometry, shade } from '../core/voxel.js';
import { makeRng } from '../core/rng.js';
import { voxelGrain } from './terrain.js';

export const lit = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true });
const STONE = 0x9c7c72, MORTAR = 0x2e2220,   // warm brown stone: the backlit face lands on the concept's wall (#5a423c–#654c4a) once shaded
  ROOF = 0x3a383f, ROOF_EDGE = 0x5c5660, LACQUER = 0x7c2b1d, WOOD = 0x4a2f22, DARKWOOD = 0x2e1d15;

/** Stone face of blocks (running bond, per-block tint and depth jitter) over a mortar core. Faces -Z. */
function stoneFace(b, r, x0, x1, y0, y1, zf, holes = () => false) {
  const bh = 0.6;
  for (let y = y0, row = 0; y < y1 - 0.05; y += bh, row++) {
    let x = x0 - (row % 2 ? 0.55 : 0);
    while (x < x1) {
      const w = Math.min(r.range(0.9, 1.6), x1 - x), cx = x + w / 2, cy = y + bh / 2, h = Math.min(bh, y1 - y);
      if (w > 0.2 && !holes(cx, cy)) {
        const v = r.range(0.8, 1.14) * (r.chance(0.06) ? 0.78 : 1) * (1 - 0.12 * Math.max(0, 1 - cy / 3));   // grime at the foot
        b.push({ s: [w - 0.07, h - 0.07, 0.3], p: [cx, cy, zf - 0.12 + r.range(-0.05, 0.05)], c: shade(r.chance(0.25) ? 0x876a68 : r.chance(0.15) ? 0xa3856a : STONE, v), skip: [0, 1, 3, 4] });   // no side faces: sunlit block sides read as rain streaks through the joints
      }
      x += w;
    }
  }
}

/** Plain coursing on a face that looks +Z (the wall's courtyard side), no depth jitter. */
function stoneFaceBack(b, r, x0, x1, y0, y1, zf, holes) {
  for (let y = y0, row = 0; y < y1 - 0.05; y += 0.6, row++) {
    for (let x = x0 - (row % 2 ? 0.55 : 0); x < x1;) {
      const w = Math.min(r.range(1, 1.7), x1 - x), h = Math.min(0.6, y1 - y);
      if (w > 0.2 && !holes(x + w / 2, y + 0.3)) b.push({ s: [w - 0.07, h - 0.07, 0.3], p: [x + w / 2, y + 0.3, zf + 0.1], c: shade(STONE, r.range(0.62, 0.86)), skip: [0, 1, 3, 5] });
      x += w;
    }
  }
}

/** The same coursing on a face that looks +X (the castle's open flank; dir -1: -X, its courtyard side), z0 → z1. */
function stoneFaceX(b, r, z0, z1, y0, y1, xf, dir = 1) {
  for (let y = y0, row = 0; y < y1 - 0.05; y += 0.6, row++) {
    for (let z = z0 - (row % 2 ? 0.55 : 0); z < z1;) {
      const w = Math.min(r.range(0.9, 1.6), z1 - z), h = Math.min(0.6, y1 - y);
      if (w > 0.2) b.push({ s: [0.3, h - 0.07, w - 0.07], p: [xf + dir * (0.12 + r.range(-0.05, 0.05)), y + 0.3, z + w / 2], c: shade(r.chance(0.25) ? 0x876a68 : STONE, r.range(0.8, 1.14)), skip: dir > 0 ? [1, 3, 4, 5] : [0, 3, 4, 5] });
      z += w;
    }
  }
}

function merlons(b, r, x0, x1, y, z, depth = 0.8) {
  for (let x = x0; x + 1.1 <= x1; x += 2.0) b.push({ s: [1.15, 1.25, depth], p: [x + 0.575, y + 0.62, z], c: shade(STONE, r.range(0.82, 1.08)) });
}

/** Chinese pagoda roof hall; origin at the floor centre, front faces -Z. */
export function pagoda(b, x, y, z, w, d, tiers = 2, s = 1) {
  const P = (bx) => { bx.p = [bx.p[0] + x, bx.p[1] + y, bx.p[2] + z]; b.push(bx); };
  let yy = 0, ww = w, dd = d;
  for (let t = 0; t < tiers; t++) {
    const hh = (t === 0 ? 3.4 : 2.6) * s;
    P({ s: [ww * 0.86, 0.3 * s, dd * 0.86], p: [0, yy + 0.15 * s, 0], c: 0x4b3d38 });                     // floor
    P({ s: [ww * 0.78, hh, dd * 0.7], p: [0, yy + hh / 2, 0], c: WOOD });                                  // walls
    const nc = Math.max(3, Math.round(ww / 2.6));
    for (let i = 0; i < nc; i++) {
      const cx = -ww * 0.4 + (i / (nc - 1)) * ww * 0.8;
      P({ s: [0.36 * s, hh, 0.36 * s], p: [cx, yy + hh / 2, -dd * 0.37], c: LACQUER });                    // front columns
      if (i < nc - 1) P({ s: [ww * 0.8 / (nc - 1) - 0.5 * s, hh * 0.42, 0.1], p: [cx + ww * 0.4 / (nc - 1), yy + hh * 0.58, -dd * 0.36], c: 0x241612 }); // lattice
    }
    P({ s: [ww * 0.84, 0.4 * s, 0.3 * s], p: [0, yy + hh - 0.2 * s, -dd * 0.38], c: 0x5a2a1c });          // lintel
    yy += hh;
    // roof: stepped slabs + upturned corners
    const rw = ww * 1.28, rd = dd * 1.3;
    for (let k = 0; k < 4; k++) {
      const f = 1 - k * 0.2;
      P({ s: [rw * f, 0.42 * s, rd * f], p: [0, yy + 0.21 * s + k * 0.4 * s, 0], c: k === 0 ? ROOF_EDGE : shade(ROOF, 1 - k * 0.05) });
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      P({ s: [0.8 * s, 0.4 * s, 0.8 * s], p: [sx * rw * 0.47, yy + 0.5 * s, sz * rd * 0.47], c: ROOF_EDGE });
      P({ s: [0.5 * s, 0.4 * s, 0.5 * s], p: [sx * rw * 0.52, yy + 0.85 * s, sz * rd * 0.52], c: ROOF_EDGE });
    }
    yy += 1.6 * s;
    if (t === tiers - 1) {
      P({ s: [rw * 0.5, 0.5 * s, 0.6 * s], p: [0, yy + 0.1 * s, 0], c: 0x2c2a30 });                        // ridge
      for (const sx of [-1, 1]) P({ s: [0.5 * s, 1.1 * s, 0.5 * s], p: [sx * rw * 0.25, yy + 0.6 * s, 0], c: 0xa07c34 });   // gilt ridge ornaments catch the low sun
    }
    ww *= 0.72; dd *= 0.72;
  }
}

export function watchtower(b, x, z, H, s) {
  const P = (bx) => { bx.p = [bx.p[0] + x, bx.p[1], bx.p[2] + z]; b.push(bx); };
  const k = s / 1.9, D = 5.6 * k, L = 0.7, T = L / 0.42;           // far towers: thick legs/bracing survive the background blur
  for (const sx of [-s, s]) for (const sz of [-s, s]) P({ s: [L, H, L], p: [sx, H / 2, sz], r: [sz * 0.012, 0, -sx * 0.012], c: WOOD });
  for (let y = 1.5; y < H - 1; y += 3.2) {
    for (const sz of [-s, s]) {
      P({ s: [2 * s + 0.4, 0.26 * T, 0.26], p: [0, y, sz], c: DARKWOOD });
      P({ s: [0.2 * T, 4.6 * k, 0.2], p: [0, y + 1.6, sz], r: [0, 0, 0.86], c: DARKWOOD });
      P({ s: [0.2 * T, 4.6 * k, 0.2], p: [0, y + 1.6, sz], r: [0, 0, -0.86], c: DARKWOOD });
    }
    for (const sx of [-s, s]) {
      P({ s: [0.26, 0.26 * T, 2 * s + 0.4], p: [sx, y, 0], c: DARKWOOD });
      P({ s: [0.2 * T, 4.6 * k, 0.2], p: [sx, y + 1.6, 0], r: [0.86, 0, 0], c: DARKWOOD });
    }
  }
  P({ s: [D, 0.4, D], p: [0, H, 0], c: WOOD });
  const e = D / 2 - 0.1;
  for (const [sx, sz, w, d] of [[0, -e, D, 0.2], [0, e, D, 0.2], [-e, 0, 0.2, D], [e, 0, 0.2, D]]) P({ s: [w, 1.3, d], p: [sx, H + 0.85, sz], c: DARKWOOD });
  pagoda(b, x, H + 0.2, z, 5.2 * k, 5.2 * k, 1, 0.7);
}

/** Tiny dark voxel spearman (wall garrison, distant reserve armies; 7 boxes). Origin at the feet, faces +Z. band:
 *  headband colour (魏 red; the Shu reserve wears green), coat: torso colour. */
export const figureGeometry = (band = 0xa82a1c, coat = 0x2a2226) => boxesGeometry([
  { s: [0.42, 0.55, 0.28], p: [0, 1.15, 0], c: coat }, { s: [0.24, 0.25, 0.24], p: [0, 1.56, 0], c: 0xc79470 },
  { s: [0.3, 0.14, 0.3], p: [0, 1.72, 0], c: 0x1f1b1e }, { s: [0.32, 0.1, 0.3], p: [0, 1.6, 0], c: band },
  { s: [0.36, 0.9, 0.24], p: [0, 0.45, 0], c: 0x241e22 }, { s: [0.06, 2.6, 0.06], p: [0.3, 1.3, 0.1], c: 0x4a3222 },
  { s: [0.08, 0.26, 0.08], p: [0.3, 2.66, 0.1], c: 0xc3c9d0 },
]);

/** Self-lit paper lantern (6 boxes into b; draw them with a bright basic material) hung at (x, y, z). */
export function paperLantern(b, x, y, z, s = 1) {
  b.push({ s: [0.04, 0.7 * s, 0.04], p: [x, y + 0.75 * s, z], c: 0x1a120c }, { s: [0.62 * s, 0.8 * s, 0.62 * s], p: [x, y, z], c: 0xff7a3a },
    { s: [0.5 * s, 0.9 * s, 0.5 * s], p: [x, y, z], c: 0xff9a4a }, { s: [0.44 * s, 0.1 * s, 0.44 * s], p: [x, y + 0.45 * s, z], c: 0x2a1a0e },
    { s: [0.44 * s, 0.1 * s, 0.44 * s], p: [x, y - 0.45 * s, z], c: 0x2a1a0e }, { s: [0.08, 0.35 * s, 0.08], p: [x, y - 0.65 * s, z], c: 0x7c2b1d });
}

export function buildCastle(scene, { wallZ, gateX: GATE_X, x0: X0 }) {
  const r = makeRng(21);
  const b = [];
  // the curtain wall ends at a corner tower 18 m left of the gate (+X is screen-left in the wall-facing view): beyond
  // it the flank is open, so the gameplay camera (frame top ≈ 5° above level) sees the low sun and the watchtowers on the camp shelf
  const H = 10, T = 9, X1 = GATE_X + 18, z0 = wallZ, BA = [X0 + 10, X0 + 30];   // bastions
  const gw = 8, gh = 7.6, gl = GATE_X - gw / 2, gr = GATE_X + gw / 2;
  const inGate = (x, y) => Math.abs(x - GATE_X) < gw / 2 + 0.2 && y < gh + (Math.abs(x - GATE_X) < gw / 2 - 1.4 ? 0.9 : 0);
  // core (split round the gate passage) + lintel over it + wall walk + plinth
  b.push({ s: [gl - X0, H, T], p: [(X0 + gl) / 2, H / 2, z0 + T / 2], c: MORTAR }, { s: [X1 - gr, H, T], p: [(gr + X1) / 2, H / 2, z0 + T / 2], c: MORTAR });
  b.push({ s: [gw, H - gh - 0.9, T], p: [GATE_X, (H + gh + 0.9) / 2, z0 + T / 2], c: MORTAR });
  stoneFace(b, r, X0, X1, 0, H, z0, inGate);
  for (const [a, c] of [[X0, gl - 0.2], [gr + 0.2, X1]]) b.push({ s: [c - a, 0.9, 0.5], p: [(a + c) / 2, 0.45, z0 - 0.35], c: shade(STONE, 0.7), skip: [4] });
  merlons(b, r, X0, X1, H, z0 + 0.4);
  b.push({ s: [X1 - X0, 1.0, 0.6], p: [(X0 + X1) / 2, H + 0.5, z0 + T - 0.3], c: shade(STONE, 0.8) });  // rear parapet
  // gate passage: dark coursed side walls and a timber ceiling; the courtyard shows through its far end
  for (const sx of [-1, 1]) for (let y = 0; y < gh; y += 0.6) for (let zz = z0 + 0.3; zz < z0 + T - 0.2; zz += 1.3) {
    b.push({ s: [0.25, 0.54, 1.22], p: [GATE_X + sx * (gw / 2 - 0.1), y + 0.3, zz + 0.65], c: shade(0x5a4640, r.range(0.7, 1)), skip: [sx > 0 ? 0 : 1] });
  }
  for (let zz = z0 + 0.6; zz < z0 + T; zz += 1.1) b.push({ s: [gw, 0.35, 0.5], p: [GATE_X, gh + 0.3, zz], c: 0x2b1c14 });
  // courtyard side of the wall: plain coursing so the view back from the camp is not a black slab
  stoneFaceBack(b, r, X0 + 20, X1, 0, H, z0 + T, (x, y) => Math.abs(x - GATE_X) < gw / 2 + 0.2 && y < gh + 0.9);
  // bastions
  for (const bx of BA) {
    const w = 7, dz = 3.2;
    b.push({ s: [w, H + 1, dz + 0.5], p: [bx, (H + 1) / 2, z0 - dz / 2 + 0.25], c: MORTAR });
    stoneFace(b, r, bx - w / 2, bx + w / 2, 0, H + 1, z0 - dz);
    for (const sx of [-1, 1]) for (let y = 0; y < H + 1; y += 0.6) b.push({ s: [0.3, 0.53, dz], p: [bx + sx * (w / 2 + 0.05), y + 0.3, z0 - dz / 2], c: shade(STONE, r.range(0.7, 0.95)) });
    merlons(b, r, bx - w / 2, bx + w / 2, H + 1, z0 - dz + 0.4);
  }
  // gate: stepped arch, name plaque (the studded door leaves are separate meshes below: they swing)
  for (let i = 0; i < 7; i++) {
    const f = i / 6, yy = gh - 0.2 + Math.sin(f * Math.PI) * 0.9;
    b.push({ s: [1.3, 0.62, 0.45], p: [GATE_X - gw / 2 + 0.3 + f * (gw - 0.6), yy + 0.3, z0 - 0.2], c: shade(STONE, 0.9) });
  }
  b.push({ s: [3.2, 1.3, 0.3], p: [GATE_X, gh + 1.7, z0 - 0.3], c: 0x1b1412 }, { s: [2.8, 0.95, 0.35], p: [GATE_X, gh + 1.7, z0 - 0.33], c: 0x6b4a1c });
  // corner tower at the wall's end (tall, pagoda on top) + stepped end cap
  const cx = X1 + 3, TH = 17;
  b.push({ s: [11, TH, 12], p: [cx, TH / 2, z0 + 4], c: MORTAR });
  stoneFace(b, r, cx - 5.5, cx + 5.5, 0, TH, z0 - 2);
  for (let y = 0; y < TH; y += 0.6) b.push({ s: [0.3, 0.53, 12], p: [cx + 5.6, y + 0.3, z0 + 4], c: shade(STONE, r.range(0.72, 0.98)) });
  merlons(b, r, cx - 5.5, cx + 5.5, TH, z0 - 1.6);
  pagoda(b, cx, TH, z0 + 4, 9, 8, 2, 0.85);
  // flank wall receding from the corner tower: the courtyard's east side
  const FL = 40, fx = cx + 5.5;
  b.push({ s: [T, H, FL], p: [fx - T / 2, H / 2, z0 + 10 + FL / 2], c: MORTAR });
  stoneFaceX(b, r, z0 + 10, z0 + 10 + FL, 0, H, fx);
  stoneFaceX(b, r, z0 + 10, z0 + 10 + FL, 0, H, fx - T, -1);   // courtyard side: stone, not the black mortar core
  for (let z = z0 + 10; z + 1.1 <= z0 + 10 + FL; z += 2.0) b.push({ s: [0.8, 1.25, 1.15], p: [fx - 0.4, H + 0.62, z + 0.575], c: shade(STONE, r.range(0.82, 1.08)) });
  // gatehouse on the wall walk
  b.push({ s: [22, 0.6, 8.4], p: [GATE_X, H + 0.3, z0 + 4.4], c: 0x5a4a44 });
  pagoda(b, GATE_X, H + 0.6, z0 + 4.6, 19, 8, 2, 1.05);
  // pagoda pavilion on a bastion
  pagoda(b, BA[0], H + 1, z0 + 1.2, 6.5, 5, 1, 0.75);
  // siege works at the wall foot: scaling ladders (the ram is gone: the gate is broken from the plaza now)
  for (const lx of [X0 + 20, X0 + 40, X1 - 4]) {
    const lean = 0.3, len = H / Math.cos(lean) + 0.6, zc = z0 - 0.3 - Math.sin(lean) * len / 2, yc = Math.cos(lean) * len / 2;
    for (const sx of [-0.45, 0.45]) b.push({ s: [0.14, len, 0.14], p: [lx + sx, yc, zc], r: [-lean, 0, 0], c: 0x4a3222 });
    for (let k = 0.6; k < len - 0.3; k += 0.55) b.push({ s: [0.9, 0.08, 0.08], p: [lx, Math.cos(lean) * k, z0 - 0.3 - Math.sin(lean) * k], c: 0x3a2618 });
  }
  const wall = new THREE.Mesh(boxesGeometry(b), voxelGrain(lit(), 0.2, 0.14));
  wall.castShadow = true; wall.receiveShadow = true;
  scene.add(wall);

  // paper lanterns under the eaves (gatehouse, corner tower, bastion pavilion): self-lit bodies that glow through the
  // haze and catch the bloom — warm points of light on the dark backlit wall
  const lb = [];
  for (const dx of [-8, -3.2, 3.2, 8]) paperLantern(lb, GATE_X + dx, H + 3.1, z0 - 0.1, 1.1);
  for (const dx of [-3.4, 3.4]) paperLantern(lb, GATE_X + dx, gh + 0.6, z0 - 0.6, 0.9);            // either side of the gate arch
  for (const dx of [-3, 3]) paperLantern(lb, cx + dx, TH + 2.3, z0 - 1, 0.9);
  for (const dx of [-2, 2]) paperLantern(lb, BA[0] + dx, H + 3.1, z0 - 1.6, 0.8);
  const lanterns = new THREE.Mesh(boxesGeometry(lb), new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(4, 4, 4) }));
  lanterns.name = 'lanterns';
  scene.add(lanterns);

  // door leaves: pivots on the hinges, planks + iron bands + studs; open = swung 90° inward flat against the passage
  const doors = [-1, 1].map((sx) => {
    const lb = [], w = gw / 2 - 0.15, cxl = -sx * w / 2;                 // leaf runs from its hinge toward the centre
    lb.push({ s: [w, gh - 0.3, 0.22], p: [cxl, (gh - 0.3) / 2, 0], c: 0x4b2a1a });
    for (let y = 1.1; y < gh - 0.4; y += 1.55) lb.push({ s: [w - 0.1, 0.2, 0.1], p: [cxl, y, -0.15], c: 0x2b2522 }, { s: [w - 0.1, 0.2, 0.1], p: [cxl, y, 0.15], c: 0x2b2522 });
    for (let k = 0; k < 4; k++) lb.push({ s: [0.14, gh - 0.5, 0.06], p: [cxl - sx * (-w / 2 + 0.4 + k * (w - 0.8) / 3), (gh - 0.3) / 2, -0.13], c: 0x3a2014 });
    for (let y = 0.7; y < gh - 0.5; y += 0.78) for (let k = 0; k < 3; k++) lb.push({ s: [0.12, 0.12, 0.08], p: [cxl - sx * (-w / 2 + 0.8 + k * (w - 1.6) / 2), y, -0.16], c: 0x6a6258 });
    const m = new THREE.Mesh(boxesGeometry(lb), lit());
    m.position.set(GATE_X + sx * (gw / 2 - 0.05), 0, z0 + 0.1);
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
    return m;
  });

  // garrison on the wall walk: simple dark voxel archers/spearmen (instanced), idle sway
  const fig = figureGeometry();
  const spots = [];
  for (let x = X0 + 6; x < X1 - 1; x += r.range(1.6, 4.2)) if (Math.abs(x - GATE_X) > 11.5 || r.chance(0.3)) spots.push([x, H, z0 + r.range(0.9, 1.6)]);
  for (const bx of BA) for (let k = 0; k < 3; k++) spots.push([bx + r.range(-2.8, 2.8), H + 1, z0 - 2.4 + r.range(0, 1)]);
  for (let k = 0; k < 5; k++) spots.push([cx + r.range(-4.5, 4.5), TH, z0 - 0.8 + r.range(0, 1)]);
  const garrison = new THREE.InstancedMesh(fig, lit(), spots.length);
  garrison.userData.spots = spots.map(([x, y, z]) => ({ x, y, z, ph: r.range(0, 6.28), yaw: Math.PI + r.range(-0.4, 0.4) }));   // face the arena (-Z)
  garrison.castShadow = false;
  scene.add(garrison);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  const pose = (t) => {
    garrison.userData.spots.forEach((s, i) => {
      q.setFromEuler(e.set(Math.sin(t * 1.3 + s.ph) * 0.05, s.yaw + Math.sin(t * 0.4 + s.ph) * 0.25, 0));
      garrison.setMatrixAt(i, m.compose(p.set(s.x, s.y + Math.max(0, Math.sin(t * 2.1 + s.ph)) * 0.05, s.z), q, one));
    });
    garrison.instanceMatrix.needsUpdate = true;
  };
  pose(0);

  return {
    H, cornerX: cx, towerH: TH, x0: X0, x1: X1,
    // fire/brazier spots (castle frame): [x, y, z, scale]
    fires: [[GATE_X - 6.5, 0, z0 - 2.2, 1.5], [GATE_X + 7, 0, z0 - 1.8, 1.3], [X0 + 34, H + 0.2, z0 + 1.8, 1.7], [X0 + 12, H + 0.2, z0 + 2, 1.5], [cx - 2, TH + 0.2, z0 + 1, 1.2],
      [GATE_X - 12, 0, z0 - 3.2, 1.3], [GATE_X + 11, 0, z0 - 7, 1.1], [GATE_X - 7, 0, z0 - 11, 1.2]],   // burning siege debris before the wall
    /** Door swing: 0 shut … 1 open (render-side eased by world.js). */
    setDoors(k) { doors[0].rotation.y = -k * Math.PI / 2; doors[1].rotation.y = k * Math.PI / 2; },
    update: pose,
  };
}
