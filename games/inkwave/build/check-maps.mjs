// Sanity checks for map layouts: bounds, overlapping pieces, ramp steepness, spawn pads.
// Pieces may overlap only when one is buried: their tops must differ by ≥ 8 cm (paint marks cells 6 cm under another
// block as dead, and equal tops z-fight). Run: node build/check-maps.mjs [layoutId...]
// With --svg, also writes a large top-down preview of each layout to build/preview/<id>.svg.
import fs from 'node:fs';
const { MAP_LAYOUTS } = await import(new URL('../src/world/maps.js', import.meta.url));
const { layoutThumbSVG } = await import(new URL('../src/world/mapThumb.js', import.meta.url));
const { layoutFor, hasVariant } = await import(new URL('../src/world/variants.js', import.meta.url));
const args = process.argv.slice(2);
const svg = args.includes('--svg');
const ids0 = args.filter((a) => !a.startsWith('--')).length ? args.filter((a) => !a.startsWith('--')) : Object.keys(MAP_LAYOUTS);
// a stage with Zone Control-only pieces (variants.js) is checked as built in each mode: '<id>' and '<id>.zones'
const ids = ids0.flatMap((id) => (id.includes('.') ? [id] : hasVariant(MAP_LAYOUTS[id], null, 'zones') ? [id, `${id}.zones`] : [id]));

const mirror = (d) => d.kind === 'box' ? { ...d, min: [-d.max[0], d.min[1], -d.max[2]], max: [-d.min[0], d.max[1], -d.min[2]] }
  : d.kind === 'obox' ? { ...d, center: [-d.center[0], d.center[1], -d.center[2]] }
  : { ...d, low: [-d.low[0], d.low[1], -d.low[2]], high: [-d.high[0], d.high[1], -d.high[2]] };
// footprint as an oriented rectangle: centre, two unit axes, half extents; plus vertical range
function shape(d) {
  if (d.kind === 'box') return { c: [(d.min[0] + d.max[0]) / 2, (d.min[2] + d.max[2]) / 2], ax: [[1, 0], [0, 1]], h: [(d.max[0] - d.min[0]) / 2, (d.max[2] - d.min[2]) / 2], y0: d.min[1], y1: d.max[1] };
  const a = (d.rotY * Math.PI) / 180;
  return { c: [d.center[0], d.center[2]], ax: [[Math.cos(a), -Math.sin(a)], [Math.sin(a), Math.cos(a)]], h: [d.size[0] / 2, d.size[2] / 2], y0: d.center[1] - d.size[1] / 2, y1: d.center[1] + d.size[1] / 2 };
}
const corners = (s) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, k]) => [s.c[0] + s.ax[0][0] * s.h[0] * i + s.ax[1][0] * s.h[1] * k, s.c[1] + s.ax[0][1] * s.h[0] * i + s.ax[1][1] * s.h[1] * k]);
function overlap2D(A, B) { // separating axis test, returns penetration depth (≤ 0 = apart)
  let min = Infinity;
  const ca = corners(A), cb = corners(B);
  for (const ax of [...A.ax, ...B.ax]) {
    const pa = ca.map((p) => p[0] * ax[0] + p[1] * ax[1]), pb = cb.map((p) => p[0] * ax[0] + p[1] * ax[1]);
    min = Math.min(min, Math.min(Math.max(...pa), Math.max(...pb)) - Math.max(Math.min(...pa), Math.min(...pb)));
  }
  return min;
}

let problems = 0;
for (const id of ids) {
  const [base, mode = 'turf'] = id.split('.');
  const L = layoutFor(MAP_LAYOUTS[base], mode), B = L.bounds, out = [];
  const defs = [...L.single.map((d, i) => ({ ...d, _n: `single[${i}]` })), ...L.half.map((d, i) => ({ ...d, _n: `half[${i}]` })), ...L.half.map((d, i) => ({ ...mirror(d), _n: `half[${i}]'` }))];
  const solids = defs.filter((d) => d.kind !== 'ramp').map((d) => ({ d, s: shape(d) }));
  for (const { d, s } of solids) {
    for (const [x, z] of corners(s)) if (x < B.minX - 1e-3 || x > B.maxX + 1e-3 || z < B.minZ - 1e-3 || z > B.maxZ + 1e-3) { out.push(`${d._n} outside bounds`); break; }
    if (s.h[0] <= 0 || s.h[1] <= 0 || s.y1 <= s.y0) out.push(`${d._n} has zero/negative size`);
  }
  for (let i = 0; i < solids.length; i++) for (let j = i + 1; j < solids.length; j++) {
    const a = solids[i], b = solids[j];
    const oy = Math.min(a.s.y1, b.s.y1) - Math.max(a.s.y0, b.s.y0);
    if (oy <= 1e-3) continue;
    const o = overlap2D(a.s, b.s);
    if (o <= 1e-3) continue;
    if (Math.abs(a.s.y1 - b.s.y1) < 0.08) out.push(`${a.d._n} overlaps ${b.d._n} (${o.toFixed(2)} m) with tops ${a.s.y1.toFixed(2)} / ${b.s.y1.toFixed(2)}: z-fighting`);
    else if (a.d.kind === 'box' && b.d.kind === 'box' && [0, 2].some((k) => Math.abs(a.d.min[k] - b.d.min[k]) < 1e-3 || Math.abs(a.d.max[k] - b.d.max[k]) < 1e-3)) out.push(`${a.d._n} overlaps ${b.d._n} sharing a side plane: z-fighting`);
  }
  for (const d of defs.filter((x) => x.kind === 'ramp' && !x._n.endsWith("'"))) {
    const run = Math.hypot(d.high[0] - d.low[0], d.high[2] - d.low[2]), rise = d.high[1] - d.low[1];
    const deg = (Math.atan2(rise, run) * 180) / Math.PI;
    if (deg > 24) out.push(`${d._n} ramp is ${deg.toFixed(1)}° (max 24)`);
  }
  for (const [x, y, z] of L.spawnPads) {
    const under = solids.filter(({ s }) => Math.abs(s.y1 - y) < 0.01 && overlap2D(s, { c: [x, z], ax: [[1, 0], [0, 1]], h: [0.01, 0.01] }) > 0);
    if (!under.length) out.push(`spawn pad [${x},${y},${z}] is not on a deck top`);
  }
  console.log(`${id.padEnd(12)} ${defs.length} pieces  ${out.length ? out.length + ' issue(s)' : 'ok'}`);
  for (const o of out) console.log('   - ' + o);
  problems += out.length;
  if (svg) {
    fs.mkdirSync(new URL('./preview/', import.meta.url), { recursive: true });
    fs.writeFileSync(new URL(`./preview/${id}.svg`, import.meta.url), layoutThumbSVG(L, 'day').replace('xMidYMid slice', 'xMidYMid meet'));
  }
}
process.exitCode = problems ? 1 : 0;
