// Battlefield contract (sim-safe: pure data + pure functions, no THREE). The map lane owns this file and the set in
// src/world/*; hero, crowd, story, HUD and camera only go through these exports.
//
// The current battlefield is a map def (format: src/world/maps/index.js) loaded by loadMap(def) — world.load() (render)
// calls it before it builds the scene for the same def. Every export below reads the loaded map (MAP / TERRAIN / GATES /
// ROUTE / WATER are live `let` bindings, rebuilt by loadMap), so importers never cache map data themselves.
//
// Units: metres, +Z = the way forward (camera yaw 0 looks along +Z). Sim y everywhere is HEIGHT ABOVE GROUND:
// ground(x, z) is only added by the render side (hero view, crowd view, camera focus, HUD tags, vfx), so every sim
// height test (airborne, hitbox yMax, enemy reach) keeps working on a slope.
// Walkable ground is a union of authored pieces (rects, ellipses, width-varying paths) rasterised by loadMap into a
// signed distance field on a 2 m grid (≈ metres inside the edge, negative outside, bilinear: the edge lands within
// ≈ 0.1 m); clampWalk() pushes points up its gradient, so the edge is the visible palisade / cliff foot / river bank,
// never an invisible circle. Heights come from the piece that owns the cell (flat plateaus, sloped paths), on the same
// grid as the terrain mesh (src/world/terrain.js). Water (optional) is a band round a centre line: deep water is off the
// walk field but open to arrows and the camera boom, its fords are walkable.
import { hash01 } from '../core/rng.js';

/** The loaded map def (src/world/maps/*.js). */
export let MAP = null;
/** Render-side read-only view of the terrain grid (terrain mesh, cliffs, minimap). in: walk inside value (m). */
export let TERRAIN = null;
/** Gates by id: the def's { rect, name, kind, ... } + open (sim state). */
export let GATES = {};
/** Main road through every zone (sim: allies follow it; render: paving, road dust, torches, minimap trail). [x, z] */
export let ROUTE = [];
/** Normalised water, null on a dry map: the def's water + X (along 'x'), c (centre fn), dc (its slope), hw, bed, fords, y. */
export let WATER = null;

let PIECES = [], CARVE = [], PROPS = [], ROUTE_S = [], GATE_LIST = [];
let GX0 = 0, GZ0 = 0, HNX = 1, HNZ = 1, HGT = null, OWN = null, FIELD = null;
const HS = 2;

/** Zone record by id (undefined if unknown). */
export const zone = (id) => MAP.zones.find((q) => q.id === id);

/** Zone containing (x, z), or null (the ramp's upper bend belongs to none). */
export function zoneAt(x, z) {
  for (const q of MAP.zones) {
    if (q.r ? (x - q.x) ** 2 + (z - q.z) ** 2 <= q.r * q.r : Math.abs(x - q.x) <= q.w / 2 && Math.abs(z - q.z) <= q.d / 2) return q;
  }
  return null;
}

/** Named story position [x, z] of the loaded map (def.anchors), or undefined. */
export const anchor = (id) => MAP.anchors?.[id];

// ---------------------------------------------------------------- layout
// smooth 2D value noise from the stable hash (no RNG state) — also used by the terrain/dressing builders
function vnoise(x, z, seed) {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash01(xi, zi, seed), b = hash01(xi + 1, zi, seed), c = hash01(xi, zi + 1, seed), d = hash01(xi + 1, zi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export const noise2 = (x, z, seed = 1) => vnoise(x, z, seed) * 0.62 + vnoise(x * 2.3 + 7, z * 2.3 + 3, seed + 1) * 0.38;
export const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Render side: (x, z) lies under a solid set piece's cut-out (def.props, ± pad m): no rock columns / boulders grow there. */
export const onProp = (x, z, pad = 1) => PROPS.some((r) => x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad);

// ---- water: a band round a centre line that is a function of one axis (along 'x': a river the lane crosses, centre
// z = c(x); along 'z': a bank / shore beside the lane, centre x = c(z)). c: (a) => m, or a polyline [[x, z], …] sorted
// along that axis (clamped at its ends). Fords are ranges of the along coordinate.
const polyline = (P, X) => (a) => {
  const A = (p) => (X ? p[0] : p[1]), C = (p) => (X ? p[1] : p[0]);
  let i = 0;
  while (i < P.length - 2 && A(P[i + 1]) < a) i++;
  const t = Math.min(1, Math.max(0, (a - A(P[i])) / (A(P[i + 1]) - A(P[i]))));
  return C(P[i]) + (C(P[i + 1]) - C(P[i])) * t;
};
function normWater(w) {
  const X = w.along !== 'z', c = typeof w.c === 'function' ? w.c : polyline(w.c, X);
  return { hw: 4.5, bed: [1.4, 0.45], fords: [], y: -0.2, stones: 40, tint: {}, ...w, X, c, dc: w.dc || ((a) => (c(a + 0.01) - c(a - 0.01)) / 0.02) };
}
/** Distance (m) from (x, z) to the water's centre line, measured across it (Infinity on a dry map). Deep: < WATER.hw. */
export const waterD = (x, z) => (!WATER ? Infinity : WATER.X ? Math.abs(z - WATER.c(x)) : Math.abs(x - WATER.c(z)));
/** Open water at (x, z): arrows fly over it, the camera boom may hang over it (the walk field stops at its bank). */
export const openWater = (x, z) => !!WATER && waterD(x, z) < WATER.hw + 2;
/** World [x, z] of the point `off` m across the water's centre line at along-coordinate a (a shared array). */
const _wp = [0, 0];
export function waterPoint(a, off = 0) {
  const p = WATER.c(a) + off;
  _wp[0] = WATER.X ? a : p; _wp[1] = WATER.X ? p : a;
  return _wp;
}
let _fd = 0;                                  // fordIn out: bed depth of the nearest crossing
/** > 0 inside a ford (its along range), by how far; sets _fd to that ford's bed depth. */
function fordIn(a) {
  let v = -1e9; _fd = WATER.bed[1];
  for (const f of WATER.fords) { const u = Math.min(a - f[0], f[1] - a); if (u > v) { v = u; _fd = f[2] ?? WATER.bed[1]; } }
  return v;
}

/** Road point nearest (x, z): d = distance (m), s = its arc length (m), p = [x, z]. Returns a shared object. */
const _rn = { d: 0, s: 0, p: [0, 0] };
export function routeNear(x, z) {
  _rn.d = 1e9;
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const [ax, az] = ROUTE[i], [bx, bz] = ROUTE[i + 1], ex = bx - ax, ez = bz - az;
    const t = Math.min(1, Math.max(0, ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez))), e = Math.hypot(x - ax - ex * t, z - az - ez * t);
    if (e < _rn.d) { _rn.d = e; _rn.s = ROUTE_S[i] + t * (ROUTE_S[i + 1] - ROUTE_S[i]); _rn.p[0] = ax + ex * t; _rn.p[1] = az + ez * t; }
  }
  return _rn;
}
/** Distance (m) from (x, z) to the main road. */
export const routeDist = (x, z) => routeNear(x, z).d;
/** Arc length (m) along the road of the road point nearest (x, z). */
export const routeS = (x, z) => routeNear(x, z).s;
/** Road point at arc length s (clamped to the road's ends). Returns a shared [x, z]. */
const _rp = [0, 0];
export function routeAt(s) {
  let i = 0;
  while (i < ROUTE.length - 2 && ROUTE_S[i + 1] < s) i++;
  const t = Math.min(1, Math.max(0, (s - ROUTE_S[i]) / (ROUTE_S[i + 1] - ROUTE_S[i])));
  _rp[0] = ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * t; _rp[1] = ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * t;
  return _rp;
}

let _s = 0, _h = 0, _o = 0;                   // evalPieces out: inside value, height, owner index
function rectIn(r, x, z) {
  const dx = Math.max(r[0] - x, x - r[2]), dz = Math.max(r[1] - z, z - r[3]);
  return dx > 0 || dz > 0 ? -Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) : -Math.max(dx, dz);
}
function evalPieces(x, z) {
  _s = -1e9;
  for (let k = 0; k < PIECES.length; k++) {
    const p = PIECES[k];
    let s, h = 0;
    if (p.rect) s = rectIn(p.rect, x, z);
    else if (p.ell) { const [cx, cz, rx, rz] = p.ell; s = (1 - Math.hypot((x - cx) / rx, (z - cz) / rz)) * Math.min(rx, rz); }
    else {
      s = -1e9;
      const P = p.path;
      for (let i = 0; i < P.length - 1; i++) {
        const [ax, az, aw, ah] = P[i], [bx, bz, bw, bh] = P[i + 1];
        const ex = bx - ax, ez = bz - az, t = Math.min(1, Math.max(0, ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez)));
        const v = aw + (bw - aw) * t - Math.hypot(x - ax - ex * t, z - az - ez * t);
        if (v > s) { s = v; h = ah + (bh - ah) * t; }
      }
    }
    if (p.edge) s += p.edge * (noise2(x * 0.09 + k * 31, z * 0.09, 40 + k) - 0.5) * 2;
    if (s > _s) { _s = s; _o = k; _h = p.rect || p.ell ? (typeof p.h === 'function' ? p.h(x, z) : p.h) : h; }
  }
  for (const r of CARVE) _s = Math.min(_s, -rectIn(r, x, z));
  if (!WATER) return;
  const W = WATER, dz = waterD(x, z), fi = fordIn(W.X ? x : z);
  _s = Math.min(_s, Math.max(dz - W.hw, fi));                                  // deep water is not walkable
  _h -= (1 - smooth(W.hw - 1, W.hw + 3, dz)) * (W.bed[0] + (_fd - W.bed[0]) * smooth(-2, 2, fi));   // the bed (also cuts the banks)
}

// ---------------------------------------------------------------- load (deterministic)
/** Make `def` the current map: pieces, carves, water, road, walk / height grids, gates (all open). Sim state: call it
 *  only between battles (world.load does, from main.js startBattle / the title swap). */
export function loadMap(def) {
  MAP = def; PIECES = def.pieces; PROPS = def.props || []; CARVE = [...(def.carve || []), ...PROPS];
  WATER = def.water ? normWater(def.water) : null;
  ROUTE = def.route;
  ROUTE_S = ROUTE.map(() => 0);
  for (let i = 1; i < ROUTE.length; i++) ROUTE_S[i] = ROUTE_S[i - 1] + Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]);
  // one 2 m grid: walk inside value FIELD, height HGT, owner piece OWN (index into def.pieces: ≤ 256 pieces)
  const [x0, z0, x1, z1] = def.grid;
  GX0 = x0; GZ0 = z0; HNX = (x1 - x0) / HS + 1; HNZ = (z1 - z0) / HS + 1;
  HGT = new Float32Array(HNX * HNZ); OWN = new Uint8Array(HNX * HNZ); FIELD = new Float32Array(HNX * HNZ);
  for (let j = 0; j < HNZ; j++) for (let i = 0; i < HNX; i++) { evalPieces(GX0 + i * HS, GZ0 + j * HS); HGT[i + j * HNX] = _h; OWN[i + j * HNX] = _o; FIELD[i + j * HNX] = _s; }
  // seams where two pieces meet at slightly different heights: two passes of a masked blur (only neighbours within
  // 1.5 m of the cell join in), so path feet fan into their plateaus while retaining walls between levels stay sharp
  const tmp = new Float32Array(HGT.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let j = 0; j < HNZ; j++) for (let i = 0; i < HNX; i++) {
      const c = HGT[i + j * HNX];
      let s = 0, n = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= HNX || jj >= HNZ) continue;
        const v = HGT[ii + jj * HNX];
        if (Math.abs(v - c) < 1.5) { s += v; n++; }
      }
      tmp[i + j * HNX] = s / n;
    }
    HGT.set(tmp);
  }
  TERRAIN = { x0, z0, x1, z1, step: HS, nx: HNX, nz: HNZ, h: HGT, own: OWN, in: FIELD };
  GATES = Object.fromEntries(Object.entries(def.gates || {}).map(([id, g]) => [id, { ...g, open: true }]));
  GATE_LIST = Object.values(GATES);
}

/** Index of the grid node nearest (x, z) (no bounds check). */
export const node = (x, z) => Math.round((x - GX0) / HS) + Math.round((z - GZ0) / HS) * HNX;

function bilerp(g, nx, nz, s, x, z) {
  let fx = (x - GX0) / s, fz = (z - GZ0) / s;
  fx = Math.min(nx - 1.001, Math.max(0, fx)); fz = Math.min(nz - 1.001, Math.max(0, fz));
  const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, k = i + j * nx;
  return (g[k] * (1 - u) + g[k + 1] * u) * (1 - v) + (g[k + nx] * (1 - u) + g[k + nx + 1] * u) * v;
}

/** Walk inside value (m, < 0 outside) ignoring gates — render side (minimap, dressing placement). */
export const walkIn = (x, z) => bilerp(FIELD, HNX, HNZ, HS, x, z);

/** Terrain height (m) at (x, z): render-side offset only (see header). Bilinear on the 2 m grid. */
export const ground = (x, z) => bilerp(HGT, HNX, HNZ, HS, x, z);

// ---------------------------------------------------------------- gates (sim state: set from story.reset / step)
// A closed gate is a thin rect cut out of the walkable area, wider than the corridor it spans, so anyone caught in
// it is pushed out through its nearest long face (never sideways into the corridor wall). Render: world.js swings the
// castle doors (kind 'doors') / collapses and burns the barricade (kind 'barricade') when a gate opens. All open by
// default; spawnPoint() (battle start) resets them, so the story closes what it needs in its reset().
/** Open / close a gate by id (def.gates). Sim: call from story.reset / story.step only. */
export function setGate(id, open) { if (GATES[id]) GATES[id].open = !!open; }

function walkD(x, z) {
  let d = bilerp(FIELD, HNX, HNZ, HS, x, z);
  for (const g of GATE_LIST) if (!g.open) { const o = -rectIn(g.rect, x, z); if (o < d) d = o; }
  return d;
}

/** Keep a sim position on walkable ground, `pad` metres clear of the edge / closed gates (negative pad: allowed that
 *  far outside). Returns a shared [x, z] (copy it if you keep it). Newton steps up the distance field's gradient. */
const _out = [0, 0], E = 0.5;
export function clampWalk(x, z, pad = 0) {
  for (let k = 0; k < 8; k++) {
    const d = walkD(x, z);
    if (d >= pad) break;
    const gx = walkD(x + E, z) - walkD(x - E, z), gz = walkD(x, z + E) - walkD(x, z - E), g2 = gx * gx + gz * gz;
    if (g2 < 1e-6) { x += 0.37; continue; }                                  // flat spot (medial axis of a cut): nudge
    // step along the unit gradient by the deficit, ≤ 3 m per iteration: a Newton step (deficit / |∇d|) blew up to tens
    // of metres where the field is nearly flat (thin closed gates, river banks) and teleported soldiers across the map
    const s = Math.min(pad - d + 0.01, 3) / Math.sqrt(g2);
    x += gx * s; z += gz * s;
  }
  _out[0] = x; _out[1] = z;
  return _out;
}

/** Arrows (sim): true where a closed gate (≤ 4 m), the castle wall, a palisade or a cliff (≤ 6 m) stands at (x, z) at
 *  height y above ground. Deep water is off the walk field but open, so it never blocks. */
export function blocksArrow(x, z, y) {
  if (y > 6) return false;
  if (y < 4) for (const g of GATE_LIST) if (!g.open && rectIn(g.rect, x, z) > -0.3) return true;
  return walkIn(x, z) < -0.6 && !openWater(x, z);
}

/** Where the hero starts: { x, z, yaw, tilt } (def.spawn: story = the chapter's start, tilt = camera pitch offset in
 *  rad; free = the arena centre the free-mode army forms up around). Battle start: also resets every gate to open. */
export function spawnPoint(mode) {
  for (const g of GATE_LIST) g.open = true;
  return { tilt: 0, ...MAP.spawn[mode === 'story' ? 'story' : 'free'] };
}
