// Offline ambient-occlusion bake for a map layout → assets/lightmaps/<id>.png (+ .json with the layout hash).
// usage: node tools/bake-ao.mjs <layoutId> [--ppm 5] [--rays 48] [--dist 3.5]
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import * as THREE from 'three';
import { Level } from '../src/world/level.js';
import { MAP_LAYOUTS } from '../src/world/maps.js';
import { Physics, Hit } from '../src/game/physics.js';

const args = process.argv.slice(2);
const id = args[0] || 'tidewater';
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? +args[i + 1] : d; };
const PPM = opt('ppm', 5), RAYS = opt('rays', 48), DIST = opt('dist', 3.5);
const level = new Level(MAP_LAYOUTS[id]);
let size = 512;
while (!level.layoutLightmap(PPM, size)) size *= 2;
const phys = new Physics(level);
console.log(`${id}: ${level.faces.length} faces, lightmap ${size}² (used ${level.lightUsed}), ${RAYS} rays`);

// Hammersley cosine-weighted hemisphere directions (tangent space), shared by every texel with a per-texel rotation
const dirs = [];
for (let i = 0; i < RAYS; i++) {
  let b = i, r = 0, f = 0.5; while (b) { if (b & 1) r += f; b >>= 1; f *= 0.5; }
  const u1 = (i + 0.5) / RAYS, u2 = r;
  const rr = Math.sqrt(u1), phi = 2 * Math.PI * u2;
  dirs.push([rr * Math.cos(phi), rr * Math.sin(phi), Math.sqrt(1 - u1)]);
}
const img = new Float32Array(size * size).fill(-1);
const hit = new Hit();
const P = new THREE.Vector3(), D = new THREE.Vector3(), T = new THREE.Vector3(), Bt = new THREE.Vector3();
const t0 = Date.now();
let texels = 0;
for (const f of level.faces) {
  if (!f.light) continue;
  const L = f.light;
  const nu = Math.ceil(f.su * PPM), nv = Math.ceil(f.sv * PPM);
  T.copy(f.u); Bt.copy(f.v);
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const cu = Math.min(f.su - 0.01, (i + 0.5) / PPM), cv = Math.min(f.sv - 0.01, (j + 0.5) / PPM);
    P.copy(f.origin).addScaledVector(f.u, cu).addScaledVector(f.v, cv).addScaledVector(f.n, 0.02);
    // texel buried inside other geometry: leave dark-neutral (never visible)
    if (level.pointInside(P, 0, f.block)) { img[(L.y + L.pad + j) * size + (L.x + L.pad + i)] = 0.6; continue; }
    const rot = ((i * 7 + j * 13) % 16) / 16 * Math.PI * 2, cr = Math.cos(rot), sr = Math.sin(rot);
    let occ = 0;
    for (const [dx, dy, dz] of dirs) {
      const x = dx * cr - dy * sr, y = dx * sr + dy * cr;
      D.set(0, 0, 0).addScaledVector(T, x).addScaledVector(Bt, y).addScaledVector(f.n, dz).normalize();
      phys.raycast(P, D, DIST, hit, true);
      if (hit.hit) occ += 1 - Math.pow(hit.dist / DIST, 0.75);
    }
    const ao = 1 - occ / RAYS;
    img[(L.y + L.pad + j) * size + (L.x + L.pad + i)] = ao;
    texels++;
  }
}
// dilate into padding / unset texels (so bilinear + bevel lookups never read black)
for (let pass = 0; pass < 3; pass++) {
  const src = img.slice();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const k = y * size + x;
    if (src[k] >= 0) continue;
    let s = 0, n = 0;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const xx = x + ox, yy = y + oy;
      if (xx < 0 || yy < 0 || xx >= size || yy >= size) continue;
      const v = src[yy * size + xx]; if (v >= 0) { s += v; n++; }
    }
    if (n) img[k] = s / n;
  }
}
// grayscale PNG (row 0 = v 0 → flip so WebGL's uv origin matches)
const raw = Buffer.alloc((size + 1) * size);
for (let y = 0; y < size; y++) {
  raw[y * (size + 1)] = 0;
  const sy = size - 1 - y;
  for (let x = 0; x < size; x++) { const v = img[sy * size + x]; raw[y * (size + 1) + 1 + x] = Math.round(255 * Math.min(1, Math.max(0, v < 0 ? 1 : v))); }
}
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
writeFileSync(`assets/lightmaps/${id}.png`, png);
writeFileSync(`assets/lightmaps/${id}.json`, JSON.stringify({ id, hash: level.layoutHash, size, ppm: PPM, rays: RAYS, dist: DIST }));
console.log(`baked ${texels} texels in ${((Date.now() - t0) / 1000).toFixed(1)} s → assets/lightmaps/${id}.png (${(png.length / 1024).toFixed(0)} KB)`);
