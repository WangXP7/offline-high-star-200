// Water of the loaded map (render-only; map.js WATER: 定軍山's Han River, a river the lane crosses, or a long bank
// beside the lane): a flowing, bed-aware water strip along the centre line (the whole grid along its axis, hw + 3.3 m
// either side), the stepping stones, and the water's answer to whoever wades it. Reads sim state (hero / crowd
// positions), never writes it.
//  · flow: a baked current field in strip uv (tData.gb, m/s world xz) — faster over the shallow fords, slow and
//    glassy in the pools, still at the banks, parted round every stone (potential flow round a cylinder) with a slack
//    wake behind it; a tiling ripple tile (tWave) is advected along it with the two-phase flow-map blend (Valve's
//    Portal 2 water flow / Catlike Coding "Texture Distortion"), so the pattern visibly streams downstream (+ along
//    the axis), bunches against the stones and stretches past them without ever smearing out;
//  · depth: bed depth under the surface baked from ground() (tData.a): Beer-Lambert opacity along the view path, so
//    the fords run clear over their gravel, the pools go dark teal, the edge thins to nothing; a slow swell (vertex)
//    laps the waterline, where a foam lace breaks;
//  · light: Fresnel sky/haze reflection as before, a backlit gold glow through the water toward the low sun, a broad
//    sun path + sparkles on steepened ripple normals (HDR: bloom picks them), caustics on the shallow bed (two
//    scrolling Voronoi-edge taps, min-blended);
//  · foam: collars and wake threads at the stones (tData.r), riffle foam where fast water runs shallow, the shore
//    lace, ring crests — all advected by the same flow;
//  · interaction: RIPS ripple rings (uniform pool, drifting downstream) spawned under the hero / soldiers wading, big
//    rings + a droplet burst (one instanced draw) when anyone lands in the water.
import * as THREE from 'three';
import { makeRng, vrng } from '../core/rng.js';
import { ST } from '../crowd/crowd.js';
import { SUN_DIR, SKY_UP } from './sky.js';
import { TERRAIN as G, WATER as WT, ground, smooth, waterD } from './map.js';

// the water being built (createRiver sets these): centre fn / slope in (along a, across p) coordinates, strip start /
// length along the axis, strip half width, surface y
let mid, dc, A0, W, HW, WATER_Y, X;
const RIPS = 32;
const world = (a, p) => (X ? [a, p] : [p, a]);           // (along, across) → [x, z]

const WATER_VS = /* glsl */`
  uniform float uTime;
  varying vec3 vWp; varying vec2 vUv; varying float vLap;
  #include <fog_pars_vertex>
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    // slow swell travelling downstream + a shorter cross-swell: ±5 cm, laps the banks (the fragment shifts depth by it)
    float sw = 0.035 * sin(uTime * 0.9 - wp.x * 0.11) + 0.018 * sin(uTime * 1.63 + wp.x * 0.37 + wp.z * 0.23);
    wp.y += sw; vLap = sw;
    vWp = wp.xyz; vUv = uv;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const WATER_FS = /* glsl */`
  uniform float uTime; uniform sampler2D tData, tWave; uniform vec3 uSun, uSkyUp, uSunCol, uDeep, uShallow; uniform vec4 uRip[${RIPS}]; uniform vec2 uDrift;
  varying vec3 vWp; varying vec2 vUv; varying float vLap;
  #include <fog_pars_fragment>
  void main() {
    vec4 D = texture2D(tData, vUv);
    vec2 flow = (D.gb - 0.5) * 4.0;                                        // m/s, world xz
    float speed = length(flow), depth = D.a * 2.0 - 0.5;                   // m of water over the bed (still level)
    vec2 q = vWp.xz;
    // two-phase flow-map advection: each phase drags the tile along the flow for one period, the other takes over
    // (weight 0) when it resets; B is offset half a tile so the blend never pulses one pattern
    float ph = uTime * 0.55, p0 = fract(ph), p1 = fract(ph + 0.5), w0 = 1.0 - abs(1.0 - 2.0 * p0), w1 = 1.0 - w0;
    vec2 o0 = flow * (p0 - 0.5) / 0.55, o1 = flow * (p1 - 0.5) / 0.55;
    vec4 a0 = texture2D(tWave, (q - o0) * 0.2), a1 = texture2D(tWave, (q - o1) * 0.2 + 0.5);
    vec4 b0 = texture2D(tWave, (q - o0) * 0.53 + vec2(0.31, 0.77)), b1 = texture2D(tWave, (q - o1) * 0.53 + vec2(0.81, 0.27));
    vec2 nA = (a0.rg * w0 + a1.rg * w1) - 0.5, nB = (b0.rg * w0 + b1.rg * w1) - 0.5;
    float fh = a0.a * w0 + a1.a * w1, fh2 = b0.a * w0 + b1.a * w1;         // advected height (foam breakup)
    float chop = mix(0.3, 1.0, smoothstep(0.5, 1.4, speed));                // glassy pools, choppy riffles
    vec2 nx = (nA * 0.9 + nB * 0.7) * chop;
    // ripple rings: drift downstream, a few wavelets behind a travelling front, fading as they spread
    vec2 rn = vec2(0.0); float rf = 0.0;
    for (int i = 0; i < ${RIPS}; i++) {
      vec4 r = uRip[i];
      float age = uTime - r.z;
      if (age < 0.0 || age > 2.2) continue;
      vec2 d = q - r.xy - uDrift * age;
      float L = length(d) + 1e-3, x = L - (0.2 + age * 1.35);
      float k = 1.0 - age / 2.2, env = r.w * exp(-x * x * 7.0) * k * k;
      rn += d / L * cos(x * 12.0) * env; rf += max(sin(x * 12.0), 0.0) * env;
    }
    vec3 N = normalize(vec3(nx.x + rn.x * 0.45, 1.0, nx.y + rn.y * 0.45));
    vec3 V = normalize(vWp - cameraPosition);
    vec3 R = reflect(V, N); R.y = abs(R.y);
    float fr = 0.03 + 0.6 * pow(1.0 - max(dot(-V, N), 0.0), 5.0);
    vec3 sky = uSkyUp * 0.55;
    #ifdef USE_FOG
      sky = dwHaze(normalize(vec3(R.x, 0.0, R.z)), fogColor) * 0.75;
    #endif
    sky = mix(sky, uSkyUp * 0.6, smoothstep(0.03, 0.55, R.y)) * vec3(0.96, 0.92, 0.8);   // the reflection takes the water's brown
    // depth: lapping shifts the waterline, Beer-Lambert along the view path through the water sets the opacity
    float dep = depth + vLap * 1.6;
    float T = exp(-max(dep, 0.0) / max(-V.y, 0.12) * 1.9);
    float a = (1.0 - T) * smoothstep(0.0, 0.05, dep);
    vec3 body = mix(uShallow, uDeep, smoothstep(0.15, 1.0, dep));
    body += uSunCol * 0.05 * pow(max(dot(V, uSun), 0.0), 4.0) * (0.5 + fh);   // backlit: the low sun glows through the water
    // caustics on the bed, seen through the clear shallows (sun light the rippled surface focuses)
    vec2 bq = q + N.xz * dep * 1.5;
    float cs = min(texture2D(tWave, bq * 0.45 + uTime * vec2(0.05, 0.02)).b, texture2D(tWave, bq * 0.61 - uTime * vec2(0.03, -0.045) + 0.37).b);
    vec3 caus = uSunCol * 0.55 * cs * T * smoothstep(0.03, 0.2, dep);
    // premultiplied: the bed shows through (1 - A), the reflection sits on top of the absorbed body
    float A = 1.0 - (1.0 - a) * (1.0 - fr);
    vec3 col = body * a * (1.0 - fr) + sky * fr + caus;
    // sun: a broad path on the ripples + sparkles on steepened normals (HDR, capped: bloom makes them glints)
    vec3 H = normalize(uSun - V);
    float nh = max(dot(N, H), 0.0);
    vec3 Ng = normalize(vec3((nx.x + rn.x) * 3.5, 1.0, (nx.y + rn.y) * 3.5));
    float sp = pow(max(dot(Ng, H), 0.0), 350.0) * step(0.45, fh2);
    col += uSunCol * min(pow(nh, 400.0) * 2.5 + sp * 5.0 + pow(nh, 40.0) * 0.12, 3.0);
    // foam: stone collars / wakes, riffles over the fords, the shore lace, ring crests; broken up by the advected tile
    // (fm lowers the threshold on the advected noise: dense at a collar, lacy at the shore, specks in the riffles)
    float shore = smoothstep(0.07, 0.0, dep - 0.03 * sin(uTime * 1.7 + q.x * 0.7 + q.y * 0.4)) * smoothstep(-0.03, 0.01, dep);
    float riffle = smoothstep(1.0, 1.6, speed) * smoothstep(0.5, 0.25, dep);
    float fm = D.r * 1.3 + riffle * 0.28 + shore * 0.5 + rf * 0.6;
    float nf = fh * 0.2 + fh2 * 0.8, th = 0.7 - fm * 0.3;
    float foam = smoothstep(th, th + 0.06, nf) * min(fm * 2.0, 1.0) * 0.85;
    col = mix(col, vec3(0.78, 0.75, 0.68) * (0.8 + 0.4 * fh), foam);
    A = mix(A, 1.0, foam);
    A *= smoothstep(-0.03, 0.02, dep);                                     // gone past the waterline
    gl_FragColor = vec4(col / max(A, 1e-3), A);
    #include <fog_fragment>
    gl_FragColor.rgb *= A;
  }`;

/** Tiling 256² ripple tile: rg = normal slope, b = caustic net (Voronoi F2 − F1 edges), a = height. Periodic value
 *  noise so the flow-advected taps never seam. */
function waveTile() {
  const N = 256, r = makeRng(71), hgt = new Float32Array(N * N);
  const oct = [[4, 0.34], [8, 0.3], [16, 0.22], [32, 0.14]];
  for (const [P, amp] of oct) {
    const lat = Float32Array.from({ length: P * P }, () => r.next());
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const fx = x / N * P, fy = y / N * P, i = fx | 0, j = fy | 0, u = fx - i, v = fy - j;
      const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v), i1 = (i + 1) % P, j1 = (j + 1) % P;
      const n = (lat[i + j * P] * (1 - su) + lat[i1 + j * P] * su) * (1 - sv) + (lat[i + j1 * P] * (1 - su) + lat[i1 + j1 * P] * su) * sv;
      hgt[x + y * N] += amp * (P >= 16 ? 1 - Math.abs(2 * n - 1) : n);      // fine octaves ridged: sharp wavelet crests
    }
  }
  const pts = Array.from({ length: 18 }, () => [r.next() * N, r.next() * N]);
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const k = x + y * N, h = (d, e) => hgt[((x + d + N) % N) + ((y + e + N) % N) * N];
    const sx = (h(1, 0) - h(-1, 0)) * 7, sy = (h(0, 1) - h(0, -1)) * 7;
    let f1 = 1e9, f2 = 1e9;
    for (const [px, py] of pts) for (let oy = -N; oy <= N; oy += N) for (let ox = -N; ox <= N; ox += N) {
      const ex = x - px - ox, ey = y - py - oy, d = ex * ex + ey * ey;       // squared: sqrt only the two winners
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
    const c = Math.pow(1 - smooth(0, 9, Math.sqrt(f2) - Math.sqrt(f1)), 2);
    data[k * 4] = Math.max(0, Math.min(255, 128 - sx * 128)); data[k * 4 + 1] = Math.max(0, Math.min(255, 128 - sy * 128));
    data[k * 4 + 2] = c * 255; data[k * 4 + 3] = Math.min(1, hgt[k]) * 255;
  }
  const t = new THREE.DataTexture(data, N, N);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

/** Water data in strip uv (8 px/m along, ≤ 512 px across): r = foam mask, gb = current (m/s, world xz), a = bed depth
 *  under WATER_Y. Stones: [a, p, w] in (along, across) coordinates. */
function riverData(stones) {
  const FW = Math.min(4096, 8 * W), FH = Math.min(512, Math.ceil(HW) * 16), pu = FW / W, pv = FH / (2 * HW);
  // foam mask: a thin collar hugging every stone and its wake — two tapering threads trailing downstream (+a)
  const fc = document.createElement('canvas'); fc.width = FW; fc.height = FH;
  const fg = fc.getContext('2d');
  fg.fillStyle = '#000'; fg.fillRect(0, 0, FW, FH);
  fg.filter = 'blur(1px)';
  for (const [x, z, w] of stones) {
    if (Math.abs(z - mid(x)) > HW - 0.8) continue;
    const rw = w * 0.5 + 0.12;
    fg.save(); fg.translate((x - A0) * pu, (z - mid(x) + HW) * pv);
    const gr = fg.createRadialGradient(0, 0, 0, 0, 0, (rw + 0.18) * pu);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.62, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    fg.fillStyle = gr; fg.scale(1, pv / pu); fg.beginPath(); fg.arc(0, 0, (rw + 0.18) * pu, 0, 6.2832); fg.fill();
    const L = (1.8 + w * 2.2) * pu, wk = fg.createLinearGradient(0, 0, L, 0);
    wk.addColorStop(0, 'rgba(255,255,255,0.5)'); wk.addColorStop(1, 'rgba(255,255,255,0)');
    fg.fillStyle = wk;
    for (const sd of [-1, 1]) { fg.beginPath(); fg.moveTo(0, sd * rw * 0.9 * pu); fg.lineTo(L, sd * rw * 0.35 * pu); fg.lineTo(L, sd * rw * 0.15 * pu); fg.lineTo(0, sd * rw * 0.45 * pu); fg.fill(); }
    fg.restore();
  }
  const foam = fg.getImageData(0, 0, FW, FH).data;
  // current: along the centreline, continuity-ish (shallow ford water runs fast, the pools slow), zero at the bank.
  // (x, z) here are (along, across): fx / fz swap into world xz when packed
  const fx = new Float32Array(FW * FH), fz = new Float32Array(FW * FH), dep = new Float32Array(FW * FH);
  for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) {
    const x = A0 + (i + 0.5) / pu, z = mid(x) - HW + (j + 0.5) / pv, k = i + j * FW;
    const [wx, wz] = world(x, z), h = ground(wx, wz);
    const d = WATER_Y - (WT.bedHeight?.(wx, wz, h) ?? h), tx = 1, tz = dc(x), tl = Math.hypot(tx, tz);
    const sp = (1.6 - 0.9 * smooth(0.3, 0.95, d)) * smooth(0, 0.35, d);
    dep[k] = d; fx[k] = sp * tx / tl; fz[k] = sp * tz / tl;
  }
  // stones part the current (potential flow round a cylinder of radius R: v = U (1 − R²cos2θ/r², −R²sin2θ/r²)) and
  // leave a slack wake behind them
  for (const [sx, sz, w] of stones) {
    const R = w * 0.55, ci = Math.round((sx - A0) * pu), cj = Math.round((sz - mid(sx) + HW) * pv), ri = Math.ceil(R * 7 * pu);
    const tl = Math.hypot(1, dc(sx)), ux = 1 / tl, uz = dc(sx) / tl;
    for (let j = Math.max(0, cj - Math.ceil(R * 3 * pv)); j < Math.min(FH, cj + Math.ceil(R * 3 * pv)); j++)
      for (let i = Math.max(0, ci - Math.ceil(R * 3 * pu)); i < Math.min(FW, ci + ri); i++) {
        const k = i + j * FW, x = A0 + (i + 0.5) / pu, z = mid(x) - HW + (j + 0.5) / pv;
        const px = (x - sx) * ux + (z - sz) * uz, pz = -(x - sx) * uz + (z - sz) * ux, r2 = px * px + pz * pz;
        const U = Math.hypot(fx[k], fz[k]);
        let dx, dz;
        if (r2 < R * R) { dx = -U; dz = 0; }
        else {
          const q = R * R / (r2 * r2);
          dx = -U * q * (px * px - pz * pz); dz = -U * q * 2 * px * pz;
          if (px > 0) { const wd = R * (1 + 0.2 * px / R); dx -= 0.75 * U * Math.exp(-(pz * pz) / (wd * wd)) * Math.exp(-px / (5 * R)); }
        }
        fx[k] += dx * ux - dz * uz; fz[k] += dx * uz + dz * ux;
      }
  }
  const data = new Uint8Array(FW * FH * 4), b = (v) => Math.max(0, Math.min(255, Math.round(v)));
  for (let k = 0; k < FW * FH; k++) {
    data[k * 4] = foam[k * 4];
    const wx = X ? fx[k] : fz[k], wz = X ? fz[k] : fx[k];
    data[k * 4 + 1] = b(128 + wx * 64); data[k * 4 + 2] = b(128 + wz * 64); data[k * 4 + 3] = b((dep[k] + 0.5) * 127.5);
  }
  const t = new THREE.DataTexture(data, FW, FH);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.magFilter = t.minFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

/** The loaded map's water (map.js WATER; null on a dry map) into `root`: { update(dt, game) }. */
export function createRiver(root) {
  if (!WT) return null;
  ({ c: mid, dc, X, y: WATER_Y } = WT); HW = WT.hw + 3.3;
  A0 = X ? G.x0 : G.z0; W = X ? G.x1 - G.x0 : G.z1 - G.z0;
  const grp = new THREE.Group();
  // strip: 1 m along, 8 rows across (uv: along, across); along z the axes swap, so the winding flips to keep it facing up
  const n = W, m = 8, pos = [], uv = [], idx = [];
  for (let s = 0; s <= n; s++) for (let a = 0; a <= m; a++) {
    const x = A0 + (s / n) * W, [wx, wz] = world(x, mid(x) - HW + (a / m) * 2 * HW);
    pos.push(wx, WATER_Y, wz); uv.push(s / n, a / m);
    if (s < n && a < m) { const o = s * (m + 1) + a; idx.push(...(X ? [o, o + 1, o + m + 1, o + 1, o + m + 2, o + m + 1] : [o, o + m + 1, o + 1, o + 1, o + m + 1, o + m + 2])); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  // stepping stones marking each crossing but a causeway / bridge deck (in (along, across) coordinates) + scattered
  // boulders in the pools
  const r = makeRng(33), stones = [], hw = WT.hw;
  for (const [a, b, dep] of WT.fords) if (!(dep < 0)) for (let x = a + 1.5; x < b - 1; x += r.range(1.6, 2.6)) for (let o = -(hw - 0.5); o <= hw - 0.5; o += r.range(2.2, 3.2)) {
    if (r.chance(0.35)) continue;
    stones.push([x + r.range(-0.4, 0.4), mid(x) + o, r.range(0.55, 0.9), r.range(0.3, 0.42)]);   // tops just clear of the water
  }
  for (let i = 0; i < WT.stones; i++) { const x = r.range(A0 + 12, A0 + W - 12); stones.push([x, mid(x) + r.range(-(hw + 1.5), hw + 1.5), r.range(0.8, 2.2), r.range(0.5, 1.4)]); }
  const rip = Array.from({ length: RIPS }, () => new THREE.Vector4(0, 0, -99, 0)), tint = WT.tint;
  const uni = { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uTime: { value: 0 }, tData: { value: riverData(stones) }, tWave: { value: waveTile() },
    uSun: { value: SUN_DIR }, uSkyUp: { value: SKY_UP }, uSunCol: { value: new THREE.Color(...(tint.sun || [1.0, 0.72, 0.4])) },
    uDeep: { value: new THREE.Color(tint.deep ?? 0x0b2524) }, uShallow: { value: new THREE.Color(tint.shallow ?? 0x3a4a34) }, uRip: { value: rip },
    uDrift: { value: new THREE.Vector2(...world(0.5, 0)) } };
  const water = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    vertexShader: WATER_VS, fragmentShader: WATER_FS, uniforms: uni, transparent: true, premultipliedAlpha: true, depthWrite: false, fog: true,
  }));
  water.renderOrder = 0.5;
  water.frustumCulled = false;                    // the swell lifts it off its bounds; it spans the whole field anyway
  water.name = 'river';
  grp.add(water);
  // stones: dry tops, a dark wet band down to the waterline (+ a wet sheen), sunk into the water
  const smMat = new THREE.MeshStandardMaterial({ roughness: 0.75, flatShading: true }), wy = WATER_Y;
  smMat.customProgramCacheKey = () => 'river-stone|' + wy;           // the waterline is baked in: one program per surface height
  smMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vStoneY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvStoneY = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vStoneY;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float wet = 1.0 - smoothstep(${(wy + 0.06).toFixed(2)}, ${(wy + 0.15).toFixed(2)}, vStoneY);
        diffuseColor.rgb *= mix(1.0, 0.38, wet);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.3, wet);');
  };
  // a faceted, flattened dodecahedron (36 tris): a water-worn rock, not a floating tile
  const sm = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.62, 0), smMat, stones.length);
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color();
  const SCOL = [0x7c7466, 0x6c685e, 0x847868, 0x686452];                        // grey-brown river stone, a little moss
  stones.forEach(([sa, sp, w, h], i) => {
    const top = r.range(0.14, 0.3), [x, z] = world(sa, sp);
    sm.setMatrixAt(i, mt.compose(p.set(x, WATER_Y + top - h / 2, z), q.setFromEuler(e.set(r.range(-0.15, 0.15), r.range(0, 3), r.range(-0.15, 0.15))), s.set(w, h, w * r.range(0.7, 1.1))));
    sm.setColorAt(i, c.set(SCOL[r.int(0, 3)]).multiplyScalar(r.range(0.8, 1.1)));
  });
  sm.receiveShadow = true;
  grp.add(sm);

  // droplets: one instanced draw, ballistic, gone when they fall back under the surface
  const DROPS = 96, dp = new Float32Array(DROPS * 7);                           // x y z vx vy vz life
  const drops = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 0.82, 0.74), fog: true }), DROPS);
  drops.frustumCulled = false;
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < DROPS; i++) drops.setMatrixAt(i, ZERO);
  grp.add(drops);
  root.add(grp);

  let ripN = 0, dropN = 0, t = 0, heroT = 0, heroY = 0;
  const hx = [0, 0];
  let soldierT, prevY, px, pz;                                                    // per soldier, sized to the crowd
  const wet = (x, z) => waterD(x, z) < HW && ground(x, z) < WATER_Y - 0.04;
  /** A ring at (x, z). weak (soldier wading) only takes a slot that has already mostly faded. */
  function ring(x, z, amp, weak) {
    let k = ripN, best = -1;
    for (let i = 0; i < RIPS; i++) { const age = t - rip[i].z; if (age > best) { best = age; k = i; } }
    if (weak && best < 1.2) return;
    rip[k].set(x, z, t, amp); ripN = k;
  }
  function splash(x, z, n, up) {
    ring(x, z, 2.2); ring(x + 0.3, z, 1.2); rip[ripN].z += 0.25;
    for (let i = 0; i < n; i++) {
      const o = (dropN = (dropN + 1) % DROPS) * 7, a = vrng.next() * 6.283, sp = 0.6 + vrng.next() * 1.8;
      dp[o] = x + Math.cos(a) * 0.3; dp[o + 1] = WATER_Y + 0.05; dp[o + 2] = z + Math.sin(a) * 0.3;
      dp[o + 3] = Math.cos(a) * sp + (X ? 0.4 : 0); dp[o + 4] = up * (0.6 + vrng.next() * 0.7); dp[o + 5] = Math.sin(a) * sp + (X ? 0 : 0.4); dp[o + 6] = 0.035 + vrng.next() * 0.06;   // drift downstream
    }
  }

  return {
    update(dt, game) {
      t += dt; uni.uTime.value = t;
      if (dt > 0) {
        const h = game.hero, mv = Math.hypot(h.x - hx[0], h.z - hx[1]) / dt;
        if (wet(h.x, h.z)) {
          if (heroY > 0.5 && h.y < 0.1) splash(h.x, h.z, 30, 4.5);                // landed in the river
          else if (h.y < 0.3 && (heroT -= dt) <= 0) { ring(h.x - 0.2, h.z, mv > 1 ? 1.1 : 0.5); heroT = mv > 1 ? 0.17 : 0.9; }
        }
        hx[0] = h.x; hx[1] = h.z; heroY = h.y;
        const c = game.crowd;
        if (!prevY || prevY.length !== c.N) [soldierT, prevY, px, pz] = [0, 0, 0, 0].map(() => new Float32Array(c.N));
        for (let i = 0; i < c.N; i++) {
          if (c.st[i] === ST.OFF) { prevY[i] = 0; continue; }
          const x = c.x[i], z = c.z[i];
          if (waterD(x, z) < HW && (X ? Math.abs(x - h.x) : Math.abs(z - h.z)) < 40 && wet(x, z)) {
            if (prevY[i] > 0.35 && c.y[i] < 0.08) splash(x, z, 12, 3.5);
            else if (c.st[i] !== ST.DEAD && c.y[i] < 0.3 && (soldierT[i] -= dt) <= 0) {   // the dead lie still
              const v = Math.hypot(x - px[i], z - pz[i]) / dt;
              soldierT[i] = v > 0.8 ? 0.35 : 1.5 + vrng.next();
              ring(x - 0.15, z, v > 0.8 ? 0.8 : 0.4, true);
            }
          }
          prevY[i] = c.y[i]; px[i] = x; pz[i] = z;
        }
      }
      let live = 0;
      for (let i = 0; i < DROPS; i++) {
        const o = i * 7;
        if (dp[o + 6] <= 0) continue;
        live++;
        dp[o + 4] -= 9.8 * dt;
        dp[o] += dp[o + 3] * dt; dp[o + 1] += dp[o + 4] * dt; dp[o + 2] += dp[o + 5] * dt;
        if (dp[o + 1] < WATER_Y && dp[o + 4] < 0) { dp[o + 6] = 0; drops.setMatrixAt(i, ZERO); continue; }
        const sz = dp[o + 6];
        drops.setMatrixAt(i, mt.makeScale(sz, sz * 1.6, sz).setPosition(dp[o], dp[o + 1], dp[o + 2]));
      }
      drops.visible = live > 0;                                                // no draw call while the river is calm
      drops.instanceMatrix.needsUpdate = true;
    },
  };
}
