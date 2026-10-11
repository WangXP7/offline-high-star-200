// Atmosphere, per map (def.sky): a sky dome (sun, glow, blocky clouds, zenith) and a sun-aware aerial haze that replaces
// three's fog chunk, so every fogged material (ground, castle, crowd, hero, debris) washes out toward the same colour
// the sky has at the horizon in that direction (定軍山: golden amber toward the low sun, cool lavender-blue away from it).
// Switching maps never recompiles: the haze palette lives in shared fog-chunk uniforms (ATMO: plain {x, y, z(, w)}
// values, which three's cloneUniforms keeps by reference, so every program — built-in materials via ShaderLib, the
// river / vfx dust via UniformsLib.fog, the sky — reads the same objects) that setAtmo() rewrites; SUN_DIR / SKY_UP /
// HAZE are mutated in place (post.js, river.js, tufts and reeds hold them) and SUN_AZ is a live binding (musou cameras).
// The sky material itself is new per map (createSky bakes the dome's palette into its source: its own program).
// The haze colour exists twice — GLSL (fog + sky) and JS (hazeColor, used to pre-bake the unfogged mountains) —
// keep them in sync.
import * as THREE from 'three';

/** def.sky keys (all optional; colours sRGB hex). The defaults are 定軍山's golden hour. */
export const SKY = {
  // visible sun: 18° left of the wall-facing view, in the gap between the castle's corner tower and the watchtowers;
  // 2.9° up so the disc sits inside the gameplay frame (its top edge is ≈ 5° above level) instead of above it
  sunElev: 0.05, sunAz: 0.314,
  sunCore: [4.2, 3.8, 3.0],             // the sun disc's HDR colour (a night map: a dim bluish moon)
  haze: 0x9495ae,                       // cool lavender-blue haze away from the sun (fogColor, background)
  hazeWarm: 0xcc9468,                   // golden amber haze toward the sun
  glow: 0xf6d2a8,                       // forward-scatter glow around the sun
  skyMid: 0x9c9cba, skyTop: 0x3c5586,   // dusk blue overhead: the cool half of the frame
  // golden horizon band (sky only, not the fog): the gameplay frame shows just the lowest ≈ 2-5° of sky, so the sunset
  // lives there — saturated gold toward the sun, amber-rose away from it — and distant silhouettes, fogged toward the
  // darker haze colours, read against it
  hznSun: 0xffae48, hznAway: 0xe0a080,
  cloudRose: 0xd89c86, cloudShade: 0x646a8c, cloudLit: 0xffd49a,
  // ground dust: a pale layer hugging the plain (scale height dust[2] m) that thickens from dust[0] m out over dust[1] m
  // up to dust[3] — the backlit dust the concept's fight stands in: dark paving at the hero's feet, a glowing
  // mid-ground, soldiers' legs fading into it with distance. Walls and towers rise out of it (gone by ≈ 3 m up).
  dust: [16.0, 50.0, 1.0, 0.055], dustLit: 0xcc9a70, dustShade: 0x5e6688,
  // aerial perspective in chroma: distant colours lose saturation toward the haze hue before they lose value. apCool is
  // bluer than the haze: post.js's split tone warms every highlight (B × 0.8), so the scene colour has to carry the cool
  apCool: 0x8490b8,
};
const COLORS = ['haze', 'hazeWarm', 'glow', 'skyMid', 'skyTop', 'hznSun', 'hznAway', 'cloudRose', 'cloudShade', 'cloudLit', 'dustLit', 'dustShade', 'apCool'];

export let SUN_AZ = SKY.sunAz;
export const SUN_DIR = new THREE.Vector3();
export const HAZE = new THREE.Color();                // fogColor of the current map (linear)
export const SKY_UP = new THREE.Color();              // what the river reflects looking up
const C = Object.fromEntries(COLORS.map((k) => [k, new THREE.Color()]));   // current palette (linear working colours)
let core = SKY.sunCore;

const v3 = (c, k = 1) => `vec3(${(c.r * k).toFixed(4)}, ${(c.g * k).toFixed(4)}, ${(c.b * k).toFixed(4)})`;
const q = (v, n = 4) => +v.toFixed(n);                // uniform values carry the precision the baked literals had
const u3 = () => ({ value: { x: 0, y: 0, z: 0 } });
const ATMO = { dwSun: u3(), dwHazeWarm: u3(), dwGlow: u3(), dwApCool: u3(), dwDustLit: u3(), dwDustShade: u3(), dwDust: { value: { x: 0, y: 0, z: 0, w: 0 } } };
const put = (u, c, k = 1) => { u.value.x = q(c.r * k); u.value.y = q(c.g * k); u.value.z = q(c.b * k); };

/** Make def.sky (merged over SKY) the current atmosphere: sun, haze uniforms, HAZE / SKY_UP. Call before building the
 *  map's sky (createSky) and baked colours (hazeColor). */
export function setAtmo(sky = {}) {
  const s = { ...SKY, ...sky };
  for (const k of COLORS) C[k].set(s[k]);
  SUN_AZ = s.sunAz; core = s.sunCore;
  SUN_DIR.set(Math.sin(s.sunAz) * Math.cos(s.sunElev), Math.sin(s.sunElev), Math.cos(s.sunAz) * Math.cos(s.sunElev));
  HAZE.copy(C.haze); SKY_UP.copy(C.skyMid).lerp(C.skyTop, 0.3);
  const d = ATMO.dwSun.value; d.x = q(SUN_DIR.x); d.y = q(SUN_DIR.y); d.z = q(SUN_DIR.z);
  put(ATMO.dwHazeWarm, C.hazeWarm); put(ATMO.dwGlow, C.glow, 0.3); put(ATMO.dwApCool, C.apCool); put(ATMO.dwDustLit, C.dustLit); put(ATMO.dwDustShade, C.dustShade);
  Object.assign(ATMO.dwDust.value, { x: q(s.dust[0], 1), y: q(s.dust[1], 1), z: q(s.dust[2], 1), w: q(s.dust[3], 2) });
}
setAtmo();

// the terrain climbs 28 m: dust and the height thinning below are measured from the ground under the camera, taken as
// DUST_CAM m below it (the gameplay rig's height over the hero's feet, src/camera/camera.js), so the plateaus get
// the same knee-deep dust as the valley floor and the valley seen from the summit sinks into it
const DUST_CAM = 2.9;
// aerial perspective: from AP[0] m to AP[1] m colours lose up to AP[2] of their saturation toward the haze hue (cool
// blue away from the sun, amber toward it) — distant troops, the camp and mountains recede into a cool blue while
// their silhouettes stay (kept partial: colour must survive at range)
const AP = [25.0, 160.0, 0.42];
// geometry fades toward the haze at FOG_K of the sky's own horizon brightness: distant walls, towers and troops stay
// darker than the sunset behind them (the concept's backlit silhouettes) instead of dissolving into it
const FOG_K = 0.62;

/** 2D value noise (sin-hash lattice, smoothstep blend): dwHash(p) → [0, 1), dwNoise(p) → [0, 1). Sky clouds, ground
 *  macro tone + paving (terrain.js), flame cards (dressing.js). */
export const NOISE_GLSL = /* glsl */`
  float dwHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float dwNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(dwHash(i), dwHash(i + vec2(1.0, 0.0)), f.x), mix(dwHash(i + vec2(0.0, 1.0)), dwHash(i + vec2(1.0, 1.0)), f.x), f.y);
  }`;

const HAZE_GLSL = /* glsl */`
  uniform vec3 dwSun, dwHazeWarm, dwGlow;
  vec3 dwHaze(vec3 d, vec3 base) {
    float s = max(dot(d, dwSun), 0.0);
    // warm lobe ≈ ±15° around the sun (a wider lobe floods the watchtowers' patch of sky and they lose their silhouette)
    vec3 c = mix(base, dwHazeWarm, 0.75 * pow(s, 24.0));
    return c + dwGlow * pow(s, 160.0);
  }`;

/** CPU twin of dwHaze (for baked colours; current map). */
export function hazeColor(d, out = new THREE.Color()) {
  const s = Math.max(0, d.dot(SUN_DIR));
  out.copy(HAZE).lerp(C.hazeWarm, 0.75 * Math.pow(s, 24));
  const g = Math.pow(s, 160) * 0.3;
  out.r += C.glow.r * g; out.g += C.glow.g * g; out.b += C.glow.b * g;
  return out;
}

/**
 * Replace three's fog chunks and hand every fog-capable shader the shared ATMO uniforms (must run once, before any
 * material compiles). THREE.Fog(color, near, far) now means: haze starts at `near` metres and reaches 63 % after a
 * further `far` metres, thinning with height. The curve is exp(-x^1.6), not exp(-x): the castle band (50-100 m) stays
 * legible as silhouettes while the horizon still washes out. scene.fog must stay a THREE.Fog (program keys).
 */
export function installHaze() {
  for (const s of Object.values(THREE.ShaderLib)) Object.assign(s.uniforms, ATMO);
  Object.assign(THREE.UniformsLib.fog, ATMO);
  THREE.ShaderChunk.fog_pars_vertex = '#ifdef USE_FOG\n\tvarying vec3 vFogDir;\n#endif';
  THREE.ShaderChunk.fog_vertex = '#ifdef USE_FOG\n\tvFogDir = transpose( mat3( viewMatrix ) ) * mvPosition.xyz;\n#endif';
  THREE.ShaderChunk.fog_pars_fragment = `#ifdef USE_FOG
    uniform vec3 fogColor; varying vec3 vFogDir;
    uniform float fogNear; uniform float fogFar;
    uniform vec3 dwApCool, dwDustLit, dwDustShade; uniform vec4 dwDust;
    ${HAZE_GLSL}
  #endif`;
  THREE.ShaderChunk.fog_fragment = `#ifdef USE_FOG
    float fogDist = length( vFogDir );
    vec3 fogD = vFogDir / max( fogDist, 1e-3 );
    float fogFactor = 1.0 - exp( - pow( max( fogDist - fogNear, 0.0 ) / fogFar, 1.6 ) );
    float fogY = ${DUST_CAM.toFixed(2)} + vFogDir.y;   // height above the ground under the camera, not world y
    fogFactor *= 1.0 - 0.4 * smoothstep( 6.0, 45.0, fogY );
    vec3 fogC = dwHaze( fogD, fogColor ) * ${FOG_K.toFixed(2)};
    float fogSun = smoothstep( 0.0, 0.92, dot( fogD, dwSun ) );
    // chroma first: keep each pixel's luminance, move its hue toward the haze
    float apL = dot( gl_FragColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
    vec3 apC = mix( dwApCool, dwHazeWarm, fogSun * fogSun );
    vec3 apTint = apC / dot( apC, vec3( 0.2126, 0.7152, 0.0722 ) );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, apL * apTint, ${AP[2].toFixed(2)} * smoothstep( ${AP[0].toFixed(1)}, ${AP[1].toFixed(1)}, fogDist ) );
    // then the ground dust: glowing peach toward the low sun (backlit), a thin mauve veil away from it
    float dustF = dwDust.w * ( 1.0 - exp( - max( fogDist - dwDust.x, 0.0 ) / dwDust.y ) ) * exp( - max( fogY, 0.0 ) / dwDust.z );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, mix( dwDustShade, dwDustLit, fogSun ), dustF * ( 0.6 + 0.4 * fogSun ) * ( 1.0 - fogFactor ) );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogC, fogFactor );
  #endif`;
}

/** The current map's sky dome (setAtmo first): its palette is baked into the material's source. */
export function createSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTime: { value: 0 }, ...ATMO },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }`,
    fragmentShader: /* glsl */`
      uniform float uTime; varying vec3 vDir;
      ${HAZE_GLSL}
      ${NOISE_GLSL}
      float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * dwNoise(p); p = p * 2.07 + vec2(17.1, 9.2); a *= 0.5; } return s; }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 sun = vec3(${SUN_DIR.x.toFixed(4)}, ${SUN_DIR.y.toFixed(4)}, ${SUN_DIR.z.toFixed(4)});
        float s = max(dot(d, sun), 0.0);
        vec3 hz = dwHaze(normalize(vec3(d.x, 0.0, d.z) + vec3(0.0, sun.y, 0.0)), ${v3(C.haze)});
        vec3 up = mix(${v3(C.skyMid)}, ${v3(C.skyTop)}, smoothstep(0.18, 0.8, h));
        vec3 c = mix(hz, up, smoothstep(0.0, 0.32, h) * (1.0 - 0.75 * s * s * s * s));
        float az = max(dot(normalize(d.xz + vec2(1e-4)), normalize(sun.xz)), 0.0);
        c = mix(c, mix(${v3(C.hznAway)}, ${v3(C.hznSun, 1.5)}, az * az), (1.0 - smoothstep(-0.02, 0.16, h)) * (0.55 + 0.45 * az));
        // blocky voxel clouds on a plane, dusty rose with a gold lining toward the sun
        if (h > 0.0) {
          vec2 uv = d.xz / (h + 0.1);
          uv = floor(uv * 9.0) / 9.0 + vec2(uTime * 0.004, 0.0);
          float n = fbm(uv * 0.55 + vec2(3.0, 7.0));
          float band = smoothstep(0.015, 0.09, h) * (1.0 - smoothstep(0.32, 0.62, h));
          float cov = smoothstep(0.40, 0.6, n) * band;
          float lit = smoothstep(0.5, 0.78, fbm(uv * 0.55 + vec2(3.0, 7.0) + normalize(sun.xz) * 0.12));   // lit where the cloud thins toward the sun
          vec3 cl = mix(${v3(C.cloudShade)}, ${v3(C.cloudRose)}, 1.0 - lit);
          cl = mix(cl, ${v3(C.cloudLit, 0.8)}, pow(s, 10.0) * (0.25 + 0.5 * (1.0 - lit)));   // gold-lit toward the sun (narrow: the
          // sun is in frame now, and a wide lit lobe greys out the watchtowers' patch of sky)
          c = mix(c, cl, cov * 0.92);
        }
        // sun: wide warm scatter, a tight halo and a small hot core (in frame now: a big HDR disc blooms and the DoF
        // smears it over the watchtowers, which must stay silhouettes)
        c += ${v3(C.glow)} * (pow(s, 60.0) * 0.1 + pow(s, 1400.0) * 0.8);
        c = mix(c, vec3(${core.map((v) => v.toFixed(3)).join(', ')}), smoothstep(0.99968, 0.99976, s));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), mat);
  m.frustumCulled = false;
  m.renderOrder = -1;
  return m;
}
