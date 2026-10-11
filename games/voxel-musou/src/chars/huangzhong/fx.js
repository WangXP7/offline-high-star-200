// Huang Zhong's VFX primitives (render-only, visual RNG; used by src/vfx/arrows.js and view.js). Every pool is one
// draw call, fixed size, typed arrays, no per-frame allocation; live particles are compacted to the front of the
// instance buffers each frame (instanceCount = live), so an idle pool costs nothing on the GPU.
//   glow    camera-facing soft sprite, additive: hot core + halo (flash cores, flame, embers, motes, fireball)
//   streak  camera-facing ribbon between a head and a tail, additive, soft across and tapered to the tail: velocity
//           aligned (sparks, falling rain) or fixed (muzzle rays, arrow core / glow trails, beams)
//   smoke   camera-facing soft noise puff, premultiplied "over" (fire smoke, dust, rain impact field) — shaded from above,
//           optionally delayed (explosion smoke rolls in behind the fireball); fire = the same puff with a heat that
//           cools from a white-hot heart through orange / deep red into dark smoke (fireballs)
//   ring    oriented ring quad, additive: ground shock rings, air-burst rings on the arrow line, charge rings, markers
//   decal   flat ground scorch: dark lumpy disc with glowing ember cracks that cool (premultiplied, lit-agnostic)
//   debris  lit voxel chunks with gravity, one bounce, then sink (earth thrown up by explosions)
//   light   two pooled point lights (the count never changes: no shader recompiles)
//   kick    camera micro-shake applied after the camera rig (screen-space rotation, decays)
// Colours are linear HDR: > ~1.5 blooms (post.js threshold); halos stay under it so a stack does not fog white.
// Positions are sim space (y above the ground); ground(x, z) is added when the instance is written.
import * as THREE from 'three';
import { vrng } from '../../core/rng.js';
import { ground } from '../../world/map.js';

const NEAR = /* glsl */`smoothstep(1.3, 3.6, -mv.z)`;   // anything at the lens fades instead of filling the frame
const GLOW_VS = /* glsl */`
  attribute vec4 aPos; attribute vec4 aCol;
  varying vec4 vCol; varying vec2 vP;
  void main() {
    vec4 mv = viewMatrix * vec4(aPos.xyz, 1.0);
    mv.xy += position.xy * aPos.w;
    vP = position.xy * 2.0; vCol = aCol; vCol.a *= ${NEAR};
    gl_Position = projectionMatrix * mv;
  }`;
const GLOW_FS = /* glsl */`
  varying vec4 vCol; varying vec2 vP;
  void main() {
    float r = length(vP);
    if (r > 1.0 || vCol.a < 0.004) discard;
    float q = 1.0 - r, halo = q * q * q * 0.45 + (exp(-r * r * 6.0) - 0.0025) * 0.3, core = exp(-r * r * 20.0);
    gl_FragColor = vec4(vCol.rgb * (halo + core * 1.3) * vCol.a, 1.0);
  }`;
const STREAK_VS = /* glsl */`
  attribute vec4 aPos; attribute vec4 aDir; attribute vec4 aCol;
  varying vec4 vCol; varying vec2 vUV; varying float vTaper;
  void main() {
    vec4 h = viewMatrix * vec4(aPos.xyz, 1.0), t = viewMatrix * vec4(aPos.xyz - aDir.xyz, 1.0);
    float u = position.y + 0.5;
    vec2 hs = h.xy / max(-h.z, 0.05), ts = t.xy / max(-t.z, 0.05), ax = hs - ts;
    vec2 sd = dot(ax, ax) > 1e-10 ? normalize(ax) : vec2(0.0, 1.0);
    vec4 mv = mix(t, h, u);
    mv.xy += vec2(-sd.y, sd.x) * position.x * aPos.w + sd * (u - 0.5) * aPos.w * 0.8;   // soft round caps
    vUV = vec2(position.x * 2.0, u); vTaper = aDir.w; vCol = aCol; vCol.a *= ${NEAR};
    float d = length(mv.xyz);
    mv.xyz *= max(0.3, (d - 1.2) / d);   // fx r2: drawn 1.2 m nearer along the view ray (same pixels): a shot's beam at chest
                                         // height reads over the rank it tears through instead of vanishing behind it
    gl_Position = projectionMatrix * mv;
  }`;
const STREAK_FS = /* glsl */`
  varying vec4 vCol; varying vec2 vUV; varying float vTaper;
  void main() {
    float x = vUV.x, u = clamp(vUV.y, 0.0, 1.0);
    float along = pow(u, vTaper) * smoothstep(1.0, 0.86, vUV.y);
    float c = exp(-x * x * 3.5) * 0.6 + exp(-x * x * 26.0) * 1.2;
    if (along * c * vCol.a < 0.003) discard;
    gl_FragColor = vec4(vCol.rgb * c * along * vCol.a, 1.0);
  }`;
// fx r2: soft, noise-broken puffs (no pixel quantisation: at the lens and under DoF the stepped billows read as a
// censorship mosaic), lit from above; aHeat = (heat 0..1, age 0..1). heat > 0 = a fire lump: an emissive temperature
// ramp (white-hot heart → yellow → orange → deep red rim) that cools with age into the dark smoke colour (aCol.rgb), mostly
// light (low alpha) while hot and occluding once it is smoke — one pool gives the fireball, its dark rim and the smoke
// rising out of it.
const SMOKE_VS = /* glsl */`
  attribute vec4 aPos; attribute vec4 aCol; attribute float aSeed; attribute vec2 aHeat;
  varying vec4 vCol; varying vec2 vP; varying float vSeed; varying vec2 vHeat;
  void main() {
    vec4 mv = viewMatrix * vec4(aPos.xyz, 1.0);
    mv.xy += position.xy * aPos.w;
    float hot = step(0.001, aHeat.x);
    // (fx r3 acc: fire lumps fade out from 8 m in — near the lens the DoF blew them into flat pastel discs)
    vP = position.xy * 2.0; vCol = aCol; vCol.a *= smoothstep(1.5 + 2.5 * hot, 4.0 + 4.0 * hot, -mv.z);
    vCol.a *= 1.0 - 0.8 * smoothstep(0.4, 1.0, aPos.w / max(-mv.z, 0.1));   // fx r3: a puff over half the frame thins out (burst at the lens)
    vSeed = aSeed; vHeat = aHeat;
    // fx r3: drawn half its size nearer along the view ray (same pixels): a flat billboard at the puff's centre was cut
    // by every soldier inside the ball and by the ground under it (a fireball in a packed crowd showed as a few orange
    // scraps between helmets); now the volume reads over the bodies it engulfs
    float d = length(mv.xyz);
    mv.xyz *= max(0.35, (d - aPos.w * (0.5 - 0.2 * hot)) / d);   // (fx r3 acc: fire lumps a notch less — the bodies inside the ball cut out against it)
    gl_Position = projectionMatrix * mv;
  }`;
const SMOKE_FS = /* glsl */`
  varying vec4 vCol; varying vec2 vP; varying float vSeed; varying vec2 vHeat;
  float hs(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hs(i), hs(i + vec2(1.0, 0.0)), f.x), mix(hs(i + vec2(0.0, 1.0)), hs(i + 1.0), f.x), f.y); }
  vec3 fireRamp(float t) {                                        // linear HDR; orange stays under the grade's shoulder
    // (kept low: lumps stack, and the grade bleaches anything far over its knee to cream — the heart alone blooms)
    vec3 c = mix(vec3(0.04, 0.028, 0.024), vec3(0.2, 0.025, 0.004), smoothstep(0.02, 0.2, t));
    c = mix(c, vec3(0.7, 0.13, 0.012), smoothstep(0.2, 0.45, t));
    c = mix(c, vec3(1.2, 0.36, 0.04), smoothstep(0.45, 0.75, t));
    return mix(c, vec3(2.6, 1.8, 0.9), smoothstep(0.85, 1.25, t));
  }
  void main() {
    float r = length(vP);
    if (r > 1.0) discard;
    float ca = cos(vSeed), sa = sin(vSeed);
    vec2 q = mat2(ca, -sa, sa, ca) * vP;
    vec2 o = vec2(vSeed * 3.7, vSeed * 1.3 - vHeat.y * 1.2);      // billows churn upward as it ages
    float n = vn(q * 2.2 + o) * 0.5 + vn(q * 4.7 - o * 1.7) * 0.3 + vn(q * 9.3 + o * 2.3) * 0.2;   // (3 octaves: cauliflower billows)
    float edge = 0.62 + 0.36 * n;
    float dens = 1.0 - smoothstep(edge - 0.42, edge, r);
    dens *= 0.85 + 0.3 * n;
    float a = vCol.a * dens;
    if (a < 0.006) discard;
    vec3 nr = vec3(vP / max(edge, 0.3), 0.0); nr.z = sqrt(max(0.0, 1.0 - dot(nr.xy, nr.xy)));
    float sh = 0.5 + 0.62 * max(0.0, dot(normalize(nr + vec3(0.0, 0.0, 0.2) * (n - 0.5)), vec3(0.25, 0.85, 0.45)));
    vec3 col = vCol.rgb * sh * a;
    if (vHeat.x > 0.001) {
      // fx r3: heat broken up by the billows (not a radial gradient per lump: every lump read as an orange disc with a
      // brown outline — a cluster of polka dots); while hot the rim goes translucent instead of dark, so overlapping lumps
      // merge into one ball, and only cooled lumps (outer / older) turn into the dark smoke that frames it
      // fx r5: + a heart over the inner ≈ 30 % for lumps still at heat ≥ 0.8 (a fireball's first ≈ 7 frames) — the ramp's
      // yellow-white band used to reach only the centre ≈ 10 % of a lump, a speck under its neighbours' orange: no core
      float t = vHeat.x * (1.2 - 1.1 * r) + (n - 0.5) * 0.9 * vHeat.x + 0.45 * smoothstep(0.8, 1.0, vHeat.x) * (1.0 - smoothstep(0.1, 0.5, r));
      float fire = smoothstep(0.02, 0.26, t);
      col = mix(col, fireRamp(t) * (0.75 + 0.5 * n) * dens * vCol.a, fire);
      a *= mix(1.0, 0.45 + 0.5 * fire, smoothstep(0.12, 0.45, vHeat.x));
    }
    gl_FragColor = vec4(col, a);
  }`;
const RING_VS = /* glsl */`
  attribute vec4 aPos; attribute vec4 aNrm; attribute vec4 aCol;
  varying vec4 vCol; varying vec2 vP; varying float vW;
  void main() {
    vec3 n = normalize(aNrm.xyz), a = abs(n.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T = normalize(cross(a, n)), B = cross(n, T);
    vec3 w = aPos.xyz + (T * position.x + B * position.y) * 2.0 * aPos.w;
    vec4 mv = viewMatrix * vec4(w, 1.0);
    vP = position.xy * 2.0; vW = aNrm.w; vCol = aCol; vCol.a *= ${NEAR};
    gl_Position = projectionMatrix * mv;
  }`;
const RING_FS = /* glsl */`
  varying vec4 vCol; varying vec2 vP; varying float vW;
  void main() {
    float r = length(vP), d = (r - 0.86) / vW;
    float ring = exp(-d * d) * (0.35 + 0.65 * smoothstep(0.5, 0.86, r));   // a thin bright rim, no fill (rings on the
    // arrow line are seen face-on from the follow camera)
    if (r > 1.0 || ring * vCol.a < 0.004) discard;
    gl_FragColor = vec4(vCol.rgb * ring * vCol.a, 1.0);
  }`;
const DECAL_VS = /* glsl */`
  attribute vec4 aPos; attribute vec4 aCol;
  varying vec4 vCol; varying vec2 vP; varying float vSeed;
  void main() {
    vec3 w = aPos.xyz + vec3(position.x, 0.0, -position.y) * 2.0 * aPos.w;
    vP = position.xy * 2.0; vCol = aCol; vSeed = fract(sin(aPos.x * 7.31 + aPos.z * 3.17) * 43758.5) * 6.2832;
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  }`;
// aCol: rgb = ember glow (hot, cools to 0), a = scorch opacity
const DECAL_FS = /* glsl */`
  varying vec4 vCol; varying vec2 vP; varying float vSeed;
  float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 p = vP;                                                  // fx r2: soft (stepped read as a black mosaic under the blast)
    float r = length(p), th = atan(p.y, p.x);
    float edge = 0.78 + 0.14 * sin(4.0 * th + vSeed) + 0.08 * sin(7.0 * th - vSeed * 1.3) + 0.08 * (h(p + vSeed) - 0.5);
    float a = vCol.a * (1.0 - smoothstep(edge - 0.45, edge, r));
    if (a < 0.01) discard;
    float crack = step(0.86, h(floor(p * 7.0) + vSeed)) * (1.0 - smoothstep(0.1, edge * 0.8, r));   // ember cells in the scorch
    vec3 glow = vCol.rgb * (crack + 0.2 * (1.0 - smoothstep(0.0, 0.25, r)));
    gl_FragColor = vec4(vec3(0.035, 0.022, 0.016) * a + glow * a, a * 0.92);
  }`;

function quadGeo(n, attrs) {
  const base = new THREE.PlaneGeometry(1, 1), g = new THREE.InstancedBufferGeometry();
  g.index = base.index; g.setAttribute('position', base.attributes.position);
  const arr = {};
  for (const [k, sz] of Object.entries(attrs)) {
    const a = new THREE.InstancedBufferAttribute(new Float32Array(n * sz), sz);
    a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(k, a); arr[k] = a;
  }
  g.instanceCount = 0;
  return [g, arr];
}
function shaderMesh(parent, geo, vs, fs, blend, extra = {}) {
  const mat = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false,
    blending: blend === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending, premultipliedAlpha: blend !== 'add', side: THREE.DoubleSide, ...extra });
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  parent.add(m);
  return m;
}

/** A particle pool: state in typed arrays, spawn() returns the slot; the kind's writer fills the render attributes. */
function pool(n, fields) {
  const P = { n, next: 0, life: new Float32Array(n), max: new Float32Array(n) };
  for (const f of fields) P[f] = new Float32Array(n);
  P.take = () => { const i = P.next; P.next = (P.next + 1) % n; return i; };
  P.clear = () => P.life.fill(0);
  return P;
}

export function createFx(parent, camera) {
  const root = new THREE.Group();
  parent.add(root);
  const fx = {};

  // ---------------------------------------------------------------- glow: pos, vel, size curve, colour, drag, gravity
  const NG = 1600, G = pool(NG, ['x', 'y', 'z', 'vx', 'vy', 'vz', 's0', 's1', 'r', 'g', 'b', 'drag', 'grav', 'a0', 'flick']);
  const [gGeo, gA] = quadGeo(NG, { aPos: 4, aCol: 4 });
  const gMesh = shaderMesh(root, gGeo, GLOW_VS, GLOW_FS, 'add');
  gMesh.renderOrder = 3;
  /** Soft glow sprite: size s0 → s1 over life (s), colour rgb (HDR), velocity, drag (1/s), gravity (m/s²), flicker 0..1. */
  fx.glow = (x, y, z, s0, s1, life, r, g, b, vx = 0, vy = 0, vz = 0, drag = 0, grav = 0, flick = 0) => {
    const i = G.take();
    G.x[i] = x; G.y[i] = y; G.z[i] = z; G.vx[i] = vx; G.vy[i] = vy; G.vz[i] = vz; G.s0[i] = s0; G.s1[i] = s1;
    G.r[i] = r; G.g[i] = g; G.b[i] = b; G.drag[i] = drag; G.grav[i] = grav; G.life[i] = G.max[i] = life; G.flick[i] = flick;
    return i;
  };

  // ---------------------------------------------------------------- streak: head pos, vel or fixed dir, len, width
  const NS = 1600, S = pool(NS, ['x', 'y', 'z', 'vx', 'vy', 'vz', 'dx', 'dy', 'dz', 'len', 'w', 'r', 'g', 'b', 'drag', 'grav', 'taper', 'vel']);
  const [sGeo, sA] = quadGeo(NS, { aPos: 4, aDir: 4, aCol: 4 });
  const sMesh = shaderMesh(root, sGeo, STREAK_VS, STREAK_FS, 'add');
  sMesh.renderOrder = 3;
  /** Velocity-aligned streak (spark / falling arrow): tail = head − v̂·len·(|v| scaled), width w. */
  fx.spark = (x, y, z, vx, vy, vz, len, w, life, r, g, b, drag = 2, grav = -9, taper = 1.2) => {
    const i = S.take();
    S.x[i] = x; S.y[i] = y; S.z[i] = z; S.vx[i] = vx; S.vy[i] = vy; S.vz[i] = vz; S.len[i] = len; S.w[i] = w;
    S.r[i] = r; S.g[i] = g; S.b[i] = b; S.drag[i] = drag; S.grav[i] = grav; S.taper[i] = taper; S.vel[i] = 1;
    S.life[i] = S.max[i] = life;
    return i;
  };
  /** Fixed streak: head (x, y, z), unit dir (dx, dy, dz) pointing head-ward, length len, moving with v. */
  fx.streak = (x, y, z, dx, dy, dz, len, w, life, r, g, b, taper = 1, vx = 0, vy = 0, vz = 0) => {
    const i = S.take();
    S.x[i] = x; S.y[i] = y; S.z[i] = z; S.dx[i] = dx; S.dy[i] = dy; S.dz[i] = dz; S.len[i] = len; S.w[i] = w;
    S.vx[i] = vx; S.vy[i] = vy; S.vz[i] = vz; S.r[i] = r; S.g[i] = g; S.b[i] = b; S.drag[i] = 0; S.grav[i] = 0; S.taper[i] = taper; S.vel[i] = 0;
    S.life[i] = S.max[i] = life;
    return i;
  };
  // one-frame streaks written straight into the buffer (arrow core / glow trails, beams): no pool slot
  let immS = 0;
  const IMM = 400, immBuf = new Float32Array(IMM * 12);
  /** A streak for this frame only (from head back along −dir by len). */
  fx.line = (x, y, z, dx, dy, dz, len, w, r, g, b, taper = 1) => {
    if (immS >= IMM) return;
    const o = immS++ * 12;
    immBuf[o] = x; immBuf[o + 1] = y; immBuf[o + 2] = z; immBuf[o + 3] = w;
    immBuf[o + 4] = dx * len; immBuf[o + 5] = dy * len; immBuf[o + 6] = dz * len; immBuf[o + 7] = taper;
    immBuf[o + 8] = r; immBuf[o + 9] = g; immBuf[o + 10] = b; immBuf[o + 11] = 1;
  };
  let immG = 0;
  const IMMG = 300, immGBuf = new Float32Array(IMMG * 8);
  /** A glow for this frame only. */
  fx.dot = (x, y, z, s, r, g, b) => {
    if (immG >= IMMG) return;
    const o = immG++ * 8;
    immGBuf[o] = x; immGBuf[o + 1] = y; immGBuf[o + 2] = z; immGBuf[o + 3] = s;
    immGBuf[o + 4] = r; immGBuf[o + 5] = g; immGBuf[o + 6] = b; immGBuf[o + 7] = 1;
  };

  // ---------------------------------------------------------------- smoke / dust (premultiplied over)
  const NK = 900, K = pool(NK, ['x', 'y', 'z', 'vx', 'vy', 'vz', 's0', 's1', 'r', 'g', 'b', 'a0', 'drag', 'rise', 'seed', 'dl', 'heat']);
  const [kGeo, kA] = quadGeo(NK, { aPos: 4, aCol: 4, aSeed: 1, aHeat: 2 });
  const kMesh = shaderMesh(root, kGeo, SMOKE_VS, SMOKE_FS, 'over');
  kMesh.renderOrder = 2;
  /** Puff: size s0 → s1, colour rgb (display-ish, ≤ 1), opacity a0 (fades in fast, out slowly), rise (m/s² buoyancy),
   *  delay s before it appears (explosion smoke rolls in after the fireball). */
  fx.smoke = (x, y, z, s0, s1, life, r, g, b, a0, vx = 0, vy = 0, vz = 0, drag = 1.5, rise = 0, delay = 0) => {
    const i = K.take();
    K.x[i] = x; K.y[i] = y; K.z[i] = z; K.vx[i] = vx; K.vy[i] = vy; K.vz[i] = vz; K.s0[i] = s0; K.s1[i] = s1; K.dl[i] = delay;
    K.r[i] = r; K.g[i] = g; K.b[i] = b; K.a0[i] = a0; K.drag[i] = drag; K.rise[i] = rise; K.seed[i] = vrng.range(0, 6.283); K.life[i] = K.max[i] = life;
    K.heat[i] = 0;
    return i;
  };
  /** Fire lump (fx r2): a smoke-pool puff that starts at `heat` (1 = white-hot heart, 0.6 = orange body) and cools with
   *  age through orange and deep red into dark smoke (rgb); appears at once, keeps rising (rise m/s²). */
  fx.fire = (x, y, z, s0, s1, life, heat, vx = 0, vy = 0, vz = 0, drag = 3, rise = 2, delay = 0, r = 0.09, g = 0.075, b = 0.065, a0 = 0.9) => {
    const i = fx.smoke(x, y, z, s0, s1, life, r, g, b, a0, vx, vy, vz, drag, rise, delay);
    K.heat[i] = heat;
    return i;
  };

  // ---------------------------------------------------------------- rings
  const NR = 64, R = pool(NR, ['x', 'y', 'z', 'nx', 'ny', 'nz', 'r0', 'r1', 'w', 'r', 'g', 'b', 'ease', 'bill', 'delay']);
  const [rGeo, rA] = quadGeo(NR, { aPos: 4, aNrm: 4, aCol: 4 });
  const rMesh = shaderMesh(root, rGeo, RING_VS, RING_FS, 'add');
  rMesh.renderOrder = 3;
  /** Ring centred (x, y, z) facing normal n (bill = face the camera), radius r0 → r1 (ease-out), rim width w (share of
   *  the radius), colour rgb, life s, delay s. y is above the ground. */
  fx.ring = (x, y, z, nx, ny, nz, r0, r1, w, life, r, g, b, delay = 0, bill = 0) => {
    const i = R.take();
    R.x[i] = x; R.y[i] = y; R.z[i] = z; R.nx[i] = nx; R.ny[i] = ny; R.nz[i] = nz; R.r0[i] = r0; R.r1[i] = r1; R.w[i] = w;
    R.r[i] = r; R.g[i] = g; R.b[i] = b; R.bill[i] = bill; R.delay[i] = delay; R.life[i] = R.max[i] = life;
    return i;
  };
  fx.groundRing = (x, z, r0, r1, w, life, r, g, b, delay = 0) => fx.ring(x, 0.1, z, 0, 1, 0, r0, r1, w, life, r, g, b, delay);

  // ---------------------------------------------------------------- scorch decals
  const ND = 24, D = pool(ND, ['x', 'z', 'rad', 'heat', 'a0']);
  const [dGeo, dA] = quadGeo(ND, { aPos: 4, aCol: 4 });
  const dMesh = shaderMesh(root, dGeo, DECAL_VS, DECAL_FS, 'over', { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  dMesh.renderOrder = 1;
  /** Scorch mark radius rad for life s, embers glowing `heat` (cooling over the first third). */
  fx.scorch = (x, z, rad, life, heat = 1, a0 = 0.85) => {
    const i = D.take();
    D.x[i] = x; D.z[i] = z; D.rad[i] = rad; D.heat[i] = heat; D.a0[i] = a0; D.life[i] = D.max[i] = life;
  };

  // ---------------------------------------------------------------- debris: lit voxel chunks
  const NB = 220, Bp = pool(NB, ['x', 'y', 'z', 'vx', 'vy', 'vz', 's', 'rx', 'ry', 'wx', 'wy', 'land']);
  const bMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), NB);
  bMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bMesh.frustumCulled = false; bMesh.castShadow = false; bMesh.count = 0;
  const _c = new THREE.Color();
  for (let i = 0; i < NB; i++) bMesh.setColorAt(i, _c.setRGB(1, 1, 1));
  root.add(bMesh);
  const bCol = new Float32Array(NB * 3);
  /** A chunk of size s thrown with velocity v, colour rgb (linear). */
  fx.debris = (x, y, z, vx, vy, vz, s, life, r, g, b) => {
    const i = Bp.take();
    Bp.x[i] = x; Bp.y[i] = y; Bp.z[i] = z; Bp.vx[i] = vx; Bp.vy[i] = vy; Bp.vz[i] = vz; Bp.s[i] = s; Bp.land[i] = 0;
    Bp.rx[i] = vrng.range(0, 6); Bp.ry[i] = vrng.range(0, 6); Bp.wx[i] = vrng.range(-12, 12); Bp.wy[i] = vrng.range(-12, 12);
    Bp.life[i] = Bp.max[i] = life; bCol[i * 3] = r; bCol[i * 3 + 1] = g; bCol[i * 3 + 2] = b;
  };

  // ---------------------------------------------------------------- lights (fixed count) + camera kick
  const lights = [new THREE.PointLight(0xffa040, 0, 26, 1.5), new THREE.PointLight(0xffa040, 0, 34, 1.4)];
  const lk = [{ k: 0, decay: 7, x: 0, y: 0, z: 0 }, { k: 0, decay: 7, x: 0, y: 0, z: 0 }];
  for (const l of lights) root.add(l);
  /** Light flash at (x, y, z): intensity k (× 6), colour hex, decay rate (1/s); slot 0/1 pins it (a held light called
   *  every frame), else the weaker pooled light is replaced. */
  fx.light = (x, y, z, k, hex, decay = 7, slot = -1) => {
    const j = slot >= 0 ? slot : lk[0].k * 0.6 <= lk[1].k ? 0 : 1, L = lk[j];
    if (slot < 0 && L.k > k * 1.5) return;
    L.k = k; L.decay = decay; L.x = x; L.y = y; L.z = z; lights[j].color.setHex(hex);
  };
  let kickA = 0, kickT = 0, kickLen = 0.2, kickDX = 0, kickDY = 1;
  /** Camera thump: amplitude px (at 720p), duration s, direction in screen space. */
  fx.kick = (px, len = 0.18, dx = 0.2, dy = 1) => {
    if (px < kickA * Math.exp(-kickT * 3 / kickLen)) return;
    kickA = px; kickT = 0; kickLen = len; kickDX = dx; kickDY = dy;
  };

  /** World size (m) of one 720p pixel at (x, y, z) (y above the ground): cap sprites near the lens to a screen size. */
  fx.cam = camera.position;                                      // (read-only: recipes keep volumes off the lens side)
  fx.px = (x, y, z) => Math.hypot(camera.position.x - x, camera.position.y - y - ground(x, z), camera.position.z - z) * 2 * Math.tan(camera.fov * Math.PI / 360) / 720;

  fx.clear = () => { G.clear(); S.clear(); K.clear(); R.clear(); D.clear(); Bp.clear(); lk[0].k = lk[1].k = 0; kickA = 0; };

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
  fx.update = (dt) => {
    const cam = camera.position;
    // glow
    let n = 0;
    const gp = gA.aPos.array, gc = gA.aCol.array;
    for (let i = 0; i < NG; i++) {
      if (G.life[i] <= 0) continue;
      G.life[i] -= dt;
      if (G.life[i] <= 0) continue;
      const u = 1 - G.life[i] / G.max[i], dr = Math.exp(-G.drag[i] * dt);
      G.vx[i] *= dr; G.vy[i] = G.vy[i] * dr + G.grav[i] * dt; G.vz[i] *= dr;
      G.x[i] += G.vx[i] * dt; G.y[i] += G.vy[i] * dt; G.z[i] += G.vz[i] * dt;
      if (G.y[i] < 0.03) { G.y[i] = 0.03; G.vy[i] *= -0.3; }
      const fl = G.flick[i] ? 1 - G.flick[i] * vrng.next() : 1, a = Math.min(1, (1 - u) * 1.6) * Math.min(1, u * 12 + 0.35) * fl;
      const o = n * 4;
      gp[o] = G.x[i]; gp[o + 1] = G.y[i] + ground(G.x[i], G.z[i]); gp[o + 2] = G.z[i]; gp[o + 3] = G.s0[i] + (G.s1[i] - G.s0[i]) * (1 - (1 - u) * (1 - u));
      gc[o] = G.r[i]; gc[o + 1] = G.g[i]; gc[o + 2] = G.b[i]; gc[o + 3] = a;
      n++;
    }
    for (let k = 0; k < immG && n < NG; k++, n++) {
      const o = k * 8, w = n * 4;
      gp[w] = immGBuf[o]; gp[w + 1] = immGBuf[o + 1] + ground(immGBuf[o], immGBuf[o + 2]); gp[w + 2] = immGBuf[o + 2]; gp[w + 3] = immGBuf[o + 3];
      gc[w] = immGBuf[o + 4]; gc[w + 1] = immGBuf[o + 5]; gc[w + 2] = immGBuf[o + 6]; gc[w + 3] = 1;
    }
    immG = 0;
    gGeo.instanceCount = n; gA.aPos.needsUpdate = gA.aCol.needsUpdate = n > 0;
    if (n) { gA.aPos.clearUpdateRanges(); gA.aPos.addUpdateRange(0, n * 4); gA.aCol.clearUpdateRanges(); gA.aCol.addUpdateRange(0, n * 4); }

    // streaks
    n = 0;
    const sp = sA.aPos.array, sd = sA.aDir.array, sc = sA.aCol.array;
    for (let i = 0; i < NS; i++) {
      if (S.life[i] <= 0) continue;
      S.life[i] -= dt;
      if (S.life[i] <= 0) continue;
      const u = 1 - S.life[i] / S.max[i], dr = Math.exp(-S.drag[i] * dt);
      S.vx[i] *= dr; S.vy[i] = S.vy[i] * dr + S.grav[i] * dt; S.vz[i] *= dr;
      S.x[i] += S.vx[i] * dt; S.y[i] += S.vy[i] * dt; S.z[i] += S.vz[i] * dt;
      if (S.vel[i] && S.y[i] < 0.03) { S.y[i] = 0.03; S.vy[i] *= -0.35; S.vx[i] *= 0.6; S.vz[i] *= 0.6; }
      let dx = S.dx[i], dy = S.dy[i], dz = S.dz[i], len = S.len[i];
      if (S.vel[i]) {
        const v = Math.hypot(S.vx[i], S.vy[i], S.vz[i]) || 1e-4;
        dx = S.vx[i] / v; dy = S.vy[i] / v; dz = S.vz[i] / v; len = Math.min(S.len[i], 0.02 + v * S.len[i] * 0.05);
      }
      const o = n * 4, gy = ground(S.x[i], S.z[i]);
      sp[o] = S.x[i]; sp[o + 1] = S.y[i] + gy; sp[o + 2] = S.z[i]; sp[o + 3] = S.w[i] * (1 - 0.5 * u);
      sd[o] = dx * len; sd[o + 1] = dy * len; sd[o + 2] = dz * len; sd[o + 3] = S.taper[i];
      sc[o] = S.r[i]; sc[o + 1] = S.g[i]; sc[o + 2] = S.b[i]; sc[o + 3] = (1 - u) * (1 - u * 0.4);
      n++;
    }
    for (let k = 0; k < immS && n < NS; k++, n++) {
      const o = k * 12, w = n * 4;
      sp[w] = immBuf[o]; sp[w + 1] = immBuf[o + 1] + ground(immBuf[o], immBuf[o + 2]); sp[w + 2] = immBuf[o + 2]; sp[w + 3] = immBuf[o + 3];
      sd[w] = immBuf[o + 4]; sd[w + 1] = immBuf[o + 5]; sd[w + 2] = immBuf[o + 6]; sd[w + 3] = immBuf[o + 7];
      sc[w] = immBuf[o + 8]; sc[w + 1] = immBuf[o + 9]; sc[w + 2] = immBuf[o + 10]; sc[w + 3] = 1;
    }
    immS = 0;
    sGeo.instanceCount = n;
    for (const a of [sA.aPos, sA.aDir, sA.aCol]) { a.needsUpdate = n > 0; if (n) { a.clearUpdateRanges(); a.addUpdateRange(0, n * 4); } }

    // smoke
    n = 0;
    const kp = kA.aPos.array, kc = kA.aCol.array, ks = kA.aSeed.array, kh = kA.aHeat.array;
    for (let q = 0; q < NK; q++) {
      const i = (K.next + q) % NK;                                   // r5: oldest first, so spawn order = draw order across the ring's wrap
      if (K.life[i] <= 0) continue;
      if (K.dl[i] > 0) { K.dl[i] -= dt; continue; }
      K.life[i] -= dt;
      if (K.life[i] <= 0) continue;
      const u = 1 - K.life[i] / K.max[i], dr = Math.exp(-K.drag[i] * dt);
      K.vx[i] *= dr; K.vy[i] = K.vy[i] * dr + K.rise[i] * dt; K.vz[i] *= dr;
      K.x[i] += K.vx[i] * dt; K.y[i] = Math.max(0.05, K.y[i] + K.vy[i] * dt); K.z[i] += K.vz[i] * dt;
      const o = n * 4;
      kp[o] = K.x[i]; kp[o + 1] = K.y[i] + ground(K.x[i], K.z[i]); kp[o + 2] = K.z[i]; kp[o + 3] = K.s0[i] + (K.s1[i] - K.s0[i]) * (1 - (1 - u) * (1 - u));
      const hot = K.heat[i];
      kc[o] = K.r[i]; kc[o + 1] = K.g[i]; kc[o + 2] = K.b[i];
      kc[o + 3] = K.a0[i] * Math.min(1, u * (hot ? 40 : 8)) * (1 - u) * (1 - u * 0.3) * (hot ? 1 + u : 1);
      ks[n] = K.seed[i]; kh[n * 2] = hot * Math.exp(-u * 3.4); kh[n * 2 + 1] = u;
      n++;
    }
    kGeo.instanceCount = n;
    for (const a of [kA.aPos, kA.aCol, kA.aSeed, kA.aHeat]) { a.needsUpdate = n > 0; if (n) { a.clearUpdateRanges(); a.addUpdateRange(0, n * a.itemSize); } }

    // rings
    n = 0;
    const rp = rA.aPos.array, rn = rA.aNrm.array, rc = rA.aCol.array;
    for (let i = 0; i < NR; i++) {
      if (R.life[i] <= 0) continue;
      if (R.delay[i] > 0) { R.delay[i] -= dt; continue; }
      R.life[i] -= dt;
      if (R.life[i] <= 0) continue;
      const u = 1 - R.life[i] / R.max[i], e = 1 - (1 - u) * (1 - u) * (1 - u);
      const o = n * 4;
      rp[o] = R.x[i]; rp[o + 1] = R.y[i] + ground(R.x[i], R.z[i]); rp[o + 2] = R.z[i]; rp[o + 3] = R.r0[i] + (R.r1[i] - R.r0[i]) * e;
      if (R.bill[i]) { rn[o] = cam.x - R.x[i]; rn[o + 1] = cam.y - rp[o + 1]; rn[o + 2] = cam.z - R.z[i]; }
      else { rn[o] = R.nx[i]; rn[o + 1] = R.ny[i]; rn[o + 2] = R.nz[i]; }
      rn[o + 3] = R.w[i] * (1 + 0.4 * u);
      rc[o] = R.r[i]; rc[o + 1] = R.g[i]; rc[o + 2] = R.b[i]; rc[o + 3] = (1 - u) * Math.min(1, u * 20 + 0.2);
      n++;
    }
    rGeo.instanceCount = n;
    for (const a of [rA.aPos, rA.aNrm, rA.aCol]) { a.needsUpdate = n > 0; if (n) { a.clearUpdateRanges(); a.addUpdateRange(0, n * 4); } }

    // decals
    n = 0;
    const dp = dA.aPos.array, dc = dA.aCol.array;
    for (let i = 0; i < ND; i++) {
      if (D.life[i] <= 0) continue;
      D.life[i] -= dt;
      if (D.life[i] <= 0) continue;
      const u = 1 - D.life[i] / D.max[i], heat = D.heat[i] * Math.max(0, 1 - u * 5) ** 2, o = n * 4;
      dp[o] = D.x[i]; dp[o + 1] = ground(D.x[i], D.z[i]) + 0.05; dp[o + 2] = D.z[i]; dp[o + 3] = D.rad[i] * (0.8 + 0.2 * Math.min(1, u * 30));
      dc[o] = 1.7 * heat; dc[o + 1] = 0.42 * heat; dc[o + 2] = 0.06 * heat; dc[o + 3] = D.a0[i] * Math.min(1, (1 - u) * 4);
      n++;
    }
    dGeo.instanceCount = n;
    for (const a of [dA.aPos, dA.aCol]) { a.needsUpdate = n > 0; if (n) { a.clearUpdateRanges(); a.addUpdateRange(0, n * 4); } }

    // debris
    n = 0;
    for (let i = 0; i < NB; i++) {
      if (Bp.life[i] <= 0) continue;
      Bp.life[i] -= dt;
      if (Bp.life[i] <= 0) continue;
      if (!Bp.land[i]) {
        Bp.vy[i] -= 20 * dt;
        Bp.x[i] += Bp.vx[i] * dt; Bp.y[i] += Bp.vy[i] * dt; Bp.z[i] += Bp.vz[i] * dt;
        Bp.rx[i] += Bp.wx[i] * dt; Bp.ry[i] += Bp.wy[i] * dt;
        if (Bp.y[i] < Bp.s[i] * 0.4) {
          Bp.y[i] = Bp.s[i] * 0.4;
          if (Bp.vy[i] < -3) { Bp.vy[i] *= -0.3; Bp.vx[i] *= 0.5; Bp.vz[i] *= 0.5; Bp.wx[i] *= 0.4; Bp.wy[i] *= 0.4; }
          else Bp.land[i] = 1;
        }
      }
      const sink = Math.min(1, Bp.life[i] / 0.6);
      _e.set(Bp.rx[i], Bp.ry[i], 0); _q.setFromEuler(_e);
      _m.compose(_p.set(Bp.x[i], Bp.y[i] + ground(Bp.x[i], Bp.z[i]), Bp.z[i]), _q, _s.setScalar(Bp.s[i] * sink));
      bMesh.setMatrixAt(n, _m);
      bMesh.setColorAt(n, _c.setRGB(bCol[i * 3], bCol[i * 3 + 1], bCol[i * 3 + 2]));
      n++;
    }
    bMesh.count = n;
    if (n) { bMesh.instanceMatrix.needsUpdate = true; bMesh.instanceColor.needsUpdate = true; }

    // lights
    for (let j = 0; j < 2; j++) {
      const L = lk[j];
      L.k *= Math.exp(-dt * L.decay);
      lights[j].intensity = L.k > 0.02 ? L.k * 6 : 0;
      lights[j].position.set(L.x, L.y + ground(L.x, L.z), L.z);
    }
    kickT += dt;
  };

  /** After the camera rig (it re-poses the camera every frame): the thump as a small screen-space rotation. */
  fx.applyKick = () => {
    if (kickA <= 0 || kickT > kickLen) return;
    const a = kickA * Math.exp(-kickT * 3 / kickLen) * Math.cos(kickT / kickLen * Math.PI * 2.2);
    const rad = camera.fov * Math.PI / 180 / 720;
    camera.rotateX(a * kickDY * rad); camera.rotateY(a * kickDX * rad);
    camera.updateMatrixWorld();
  };

  /** Draw every pool once at boot: post.compile() links the programs, but buffer uploads and the driver's pipeline
   *  state (ANGLE/Metal) only happen on a real draw — without this the first Musou pays for them. */
  fx.warm = () => {
    fx.glow(0, -50, 0, 0.1, 0.1, 0.05, 0, 0, 0); fx.spark(0, -50, 0, 0, 1, 0, 0.1, 0.01, 0.05, 0, 0, 0);
    fx.smoke(0, -50, 0, 0.1, 0.1, 0.05, 0, 0, 0, 0); fx.ring(0, -50, 0, 0, 1, 0, 0.1, 0.1, 0.1, 0.05, 0, 0, 0);
    fx.scorch(0, 0, 0.01, 0.05, 0, 0); fx.debris(0, -50, 0, 0, 0, 0, 0.01, 0.05, 0, 0, 0);
  };

  fx.dispose = () => {
    parent.remove(root);
    root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  };
  return fx;
}
