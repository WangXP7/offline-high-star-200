// INKWAVE texture lab — every texlib layer on (a) a huge anti-tiled floor from a 1.7 m gameplay camera,
// (b) walls/cubes up close, (c) spheres, (d) a contact sheet, (e) the raw maps (2x2 tiled, for seam checks).
// Scripted control: window.lab.view('floor'|'wall'|'cubes'|'spheres'|'sheet'|'raw', name?), lab.mat(name),
// lab.set({ antiTile, macro, tint, normal }), lab.sun(azDeg, elDeg), lab.ui(bool), lab.cam([x,y,z],[tx,ty,tz]).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createTextureLibrary, TEXLIB_GLSL } from '../src/world/texlib.js';

const params = new URLSearchParams(location.search);
const SIZE = +(params.get('size') || 512);

// ------------------------------------------------------------------ renderer (mirrors the game)
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#bcdcf2');
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 2000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;

const hemi = new THREE.HemisphereLight('#cfe4ff', '#bda98f', 0.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e4', 2.75);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
let sunAz = 35, sunEl = 52;
function placeSun(center = new THREE.Vector3(), radius = 30, azOffset = 0) {
  const az = THREE.MathUtils.degToRad(sunAz + azOffset), el = THREE.MathUtils.degToRad(sunEl);
  const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  sun.position.copy(center).addScaledVector(dir, 80);
  sun.target.position.copy(center);
  const c = sun.shadow.camera;
  c.left = -radius; c.right = radius; c.top = radius; c.bottom = -radius; c.near = 1; c.far = 200;
  c.updateProjectionMatrix();
}

// ------------------------------------------------------------------ texture library
const t0 = performance.now();
const lib = await createTextureLibrary(renderer, { size: SIZE });
const genMs = performance.now() - t0;
console.log('[texlib] generated', lib.names.length, 'layers at', SIZE, 'in', lib.stats.ms, 'ms (compile', lib.stats.compileMs, 'ms)');

const TINTS = {
  concrete: '#dcd6cc', pavers: '#e4dac8', tiles: '#c3e2e8', asphalt: '#6d7076', boardwalk: '#ffffff',
  metalpanel: '#a8c4d2', corrugated: '#63a3ad', hazard: '#ffffff', grate: '#ffffff', brick: '#d9907a',
  rubber: '#86ab82', glasstile: '#9fd6e8',
  // marina set (the Halyard block colours)
  planks: '#d6ccbd', hullpaint: '#34466a', nonslip: '#8e9a90', gelcoat: '#efe9de', yard: '#cfcac1', weatherboard: '#8fb8b4', render: '#efe8da',
  treads: '#98a0a6', stonestep: '#cfc6b6', rampboard: '#ffffff', gangdeck: '#ffffff',
};
if (params.has('tint')) { const [n, c] = params.get('tint').split(':'); TINTS[n] = '#' + c; }
const SURF = lib.names.filter((n) => n !== 'detail');
const opts = { antiTile: true, macro: true, tint: true, normal: 1, detail: true, rawRep: 2, rawOff: 0 };
const MAPS = { world: 0, box: 1, uv: 2 };
const matCache = new Map();

function texMat(name, map = 'world', uvRep = [1, 1]) {
  const key = `${name}|${map}|${uvRep}`;
  if (matCache.has(key)) return matCache.get(key);
  const meta = lib.meta[name];
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, side: meta.alpha ? THREE.DoubleSide : THREE.FrontSide });
  if (meta.alpha) mat.alphaToCoverage = true;
  const u = {
    tlA: { value: lib.albedo }, tlN: { value: lib.normal }, tlO: { value: lib.orm },
    tlLayer: { value: lib.layers[name] }, tlScale: { value: meta.scale },
    tlMode: { value: meta.mode }, tlSym: { value: meta.sym }, tlMap: { value: MAPS[map] },
    tlTint: { value: new THREE.Color(TINTS[name]) }, tlUseTint: { value: meta.tint ? 1 : 0 },
    tlUvRep: { value: new THREE.Vector2(...uvRep) }, tlStrength: { value: 1 }, tlMacro: { value: 1 },
    tlTexSize: { value: lib.size }, tlAlpha: { value: meta.alpha ? 1 : 0 }, tlDetail: { value: meta.detail }, tlDetailLayer: { value: lib.layers.detail },
    tlMask: { value: meta.mask ? 1 : 0 },
  };
  mat.userData = { u, name };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
varying vec3 vTLPos;
varying vec3 vTLNrm;
varying vec2 vTLUv;`)
      .replace('#include <project_vertex>', `#include <project_vertex>
vTLPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
vTLNrm = normalize(mat3(modelMatrix) * objectNormal);
vTLUv = uv;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform highp sampler2DArray tlA;
uniform highp sampler2DArray tlN;
uniform highp sampler2DArray tlO;
uniform float tlLayer, tlScale, tlStrength, tlMacro, tlUseTint, tlTexSize, tlAlpha, tlDetail, tlDetailLayer, tlMask;
uniform int tlMode, tlSym, tlMap;
uniform vec3 tlTint;
uniform vec2 tlUvRep;
varying vec3 vTLPos;
varying vec3 vTLNrm;
varying vec2 vTLUv;
${TEXLIB_GLSL}`)
      .replace('#include <map_fragment>', `
vec2 tlUv;
if (tlMap == 0) tlUv = vTLPos.xz / tlScale;
else if (tlMap == 1) {
  vec3 an = abs(vTLNrm);
  tlUv = ((an.x > an.y && an.x > an.z) ? vTLPos.zy : (an.z > an.y ? vTLPos.xy : vTLPos.xz)) / tlScale;
} else tlUv = vTLUv * tlUvRep;
TexlibSample tlS = texlibSample(tlA, tlN, tlO, tlUv, tlLayer, tlMode, tlSym);
texlibDetail(tlS, tlA, tlN, tlO, tlUv * tlScale, tlDetailLayer, tlDetail);
vec3 tlCol = tlS.albedo.rgb * mix(vec3(1.0), tlTint, tlUseTint);
if (tlMask > 0.5) tlCol = tlS.albedo.rgb + mix(vec3(1.0), tlTint, tlUseTint) * tlS.albedo.a * 1.25;   // premultiplied own colour + tinted paint (as in-game)
tlCol *= mix(1.0, texlibMacro(vTLPos.xz + vTLPos.y * 0.7), tlMacro);
diffuseColor.rgb *= tlCol;
if (tlAlpha > 0.5) diffuseColor.a = texlibCoverage(tlS.albedo.a, tlUv, tlTexSize);`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = tlS.orm.g;')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = tlS.orm.b;')
      .replace('#include <normal_fragment_maps>', `{
  mat3 tlTBN = texlibTangentFrame(-vViewPosition, normal, tlUv);
  tlTBN[0] *= faceDirection; tlTBN[1] *= faceDirection;
  normal = texlibPerturbNormal(tlS.normal, tlTBN, tlStrength);
}`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
material.roughness = texlibSpecularAA(normal, material.roughness);`)
      .replace('#include <aomap_fragment>', `
reflectedLight.indirectDiffuse *= tlS.orm.r;
reflectedLight.indirectSpecular *= tlS.orm.r;
reflectedLight.directDiffuse *= mix(1.0, tlS.orm.r, 0.4);`);
  };
  mat.customProgramCacheKey = () => 'texlab-v1';
  applyOpts(mat);
  matCache.set(key, mat);
  return mat;
}
function applyOpts(mat) {
  const { u, name } = mat.userData; const meta = lib.meta[name];
  u.tlMode.value = opts.antiTile ? meta.mode : 0;
  u.tlMacro.value = opts.macro ? 1 : 0;
  u.tlUseTint.value = meta.tint && opts.tint ? 1 : 0;
  u.tlStrength.value = opts.normal;
  u.tlDetail.value = opts.detail ? meta.detail : 0;
}

// ------------------------------------------------------------------ scene building
const root = new THREE.Group();
scene.add(root);
const plain = new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 0.8 });
const waterMat = new THREE.MeshStandardMaterial({ color: '#2d6f8f', roughness: 0.45, metalness: 0.0 });
const labelsEl = document.getElementById('labels');
const tagEl = document.getElementById('tag');
let labels = [];
function clear() {
  for (const c of [...root.children]) { root.remove(c); c.geometry?.dispose?.(); }
  labels = []; labelsEl.innerHTML = '';
}
function mesh(geo, mat, x = 0, y = 0, z = 0, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = receive; root.add(m); return m;
}
function label(text, pos) {
  const el = document.createElement('div'); el.textContent = text; labelsEl.appendChild(el); labels.push({ el, pos });
}
function floorPlane(mat, size = 800) {
  const g = new THREE.PlaneGeometry(size, size); g.rotateX(-Math.PI / 2);
  return mesh(g, mat, 0, 0, 0, { cast: false });
}

let current = { view: 'floor', name: 'pavers' };
let rawQuad = null;
const rawScene = new THREE.Scene();
const rawCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const builders = {
  floor(name) {
    const meta = lib.meta[name];
    floorPlane(texMat(name, 'world'));
    if (meta.alpha) mesh(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), waterMat, 0, -0.7, 0, { cast: false });
    const box = new THREE.BoxGeometry(1, 1, 1);
    for (const [x, z, s] of [[-4, 9, 1.2], [5, 16, 1.6], [-7, 26, 2], [8, 40, 2.4]]) mesh(box, plain, x, s / 2 + (meta.alpha ? 0.01 : 0), z).scale.setScalar(s);
    placeSun(new THREE.Vector3(0, 0, 22), 34);
    setCam([0, 1.7, 0], [0, 0.0, 22]);
  },
  wall(name) {
    floorPlane(texMat(name === 'concrete' ? 'pavers' : 'concrete', 'world'));
    const wall = mesh(new THREE.BoxGeometry(8, 4.8, 0.4), texMat(name, 'box'), 0.5, 2.4, -0.2);
    mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), texMat(name, 'box'), 1.9, 0.6, 1.3);
    if (lib.meta[name].alpha) wall.position.z = -0.25;
    placeSun(new THREE.Vector3(0.5, 1.5, 0), 8);
    setCam([-0.35, 1.45, 1.45], [0.55, 1.25, -0.2]);
  },
  cubes(name) {
    floorPlane(texMat('concrete', 'world'));
    const m = texMat(name, 'box');
    mesh(new THREE.BoxGeometry(3, 1.5, 3), m, -2.6, 0.75, 6);
    mesh(new THREE.BoxGeometry(2, 3.2, 2), m, 2.4, 1.6, 8.5);
    mesh(new THREE.BoxGeometry(6, 1, 1.2), m, -0.5, 0.5, 13);
    mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), m, 1.2, 0.6, 3.8);
    mesh(new THREE.BoxGeometry(10, 5, 1), m, 0, 2.5, 20);
    placeSun(new THREE.Vector3(0, 0, 10), 16, 165);
    setCam([-1.2, 1.7, -0.8], [0.3, 0.9, 9]);
  },
  corridor(name) {
    // grazing-angle stress test: floor + a 60 m wall of the material seen from a 1.7 m eye height
    floorPlane(texMat(name, 'world'));
    if (lib.meta[name].alpha) mesh(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), waterMat, 0, -0.7, 0, { cast: false });
    mesh(new THREE.BoxGeometry(0.6, 6, 70), texMat(name, 'box'), 2.3, 3, 34);
    mesh(new THREE.BoxGeometry(0.6, 3, 70), texMat(name, 'box'), -3.3, 1.5, 34);
    placeSun(new THREE.Vector3(0, 0, 20), 36);
    setCam([0, 1.7, 0], [0.15, 1.2, 30]);
  },
  spheres() {
    floorPlane(plain);
    const R = 0.55, geo = new THREE.SphereGeometry(R, 96, 64);
    SURF.forEach((n, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      const x = (col - 2.5) * 1.45, z = row * -1.6, y = R + (row ? 0.35 : 0);
      const rep = [Math.max(1, Math.round((2 * Math.PI * R) / lib.meta[n].scale * 2)) / 2, Math.max(0.5, Math.round((Math.PI * R) / lib.meta[n].scale * 2) / 2)];
      mesh(geo, texMat(n, 'uv', rep), x, y, z);
      label(n, new THREE.Vector3(x, y + R + 0.12, z));
    });
    placeSun(new THREE.Vector3(0, 0, -1), 8, 150);
    setCam([0, 2.1, 9.3], [0, 0.66, -0.8], 32);
  },
  sheet() {
    floorPlane(plain);
    SURF.forEach((n, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = (col - 1.5) * 2.7, z = (row - 1) * 2.7;
      mesh(new THREE.BoxGeometry(2.4, 0.08, 2.4), texMat(n, 'world'), x, 0.04, z);
      label(n, new THREE.Vector3(x, 0.1, z + 1.28));
    });
    placeSun(new THREE.Vector3(), 8);
    setCam([0, 6.4, 3.7], [0, 0, 0.35]);
  },
  raw(name) {
    placeSun(new THREE.Vector3(), 8);
    if (!rawQuad) {
      rawQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: { tA: { value: lib.albedo }, tN: { value: lib.normal }, tO: { value: lib.orm }, uLayer: { value: 0 }, uAspect: { value: 1 }, uRep: { value: 2 }, uOff: { value: 0 } },
        vertexShader: 'out vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: `precision highp sampler2DArray;
uniform sampler2DArray tA, tN, tO; uniform float uLayer, uAspect, uRep, uOff; in vec2 vUv; out vec4 oc;
void main(){
  // three panels: albedo | normal | orm(r cavity, g rough, b height) — each shows 2x2 repeats
  float px = vUv.x * 3.0; int panel = int(floor(px)); vec2 p = vec2(fract(px), vUv.y);
  p.y = (p.y - 0.5) * (3.0 / uAspect) + 0.5;
  if (p.y < 0.0 || p.y > 1.0 || fract(px) < 0.01 || fract(px) > 0.99) { oc = vec4(0.07, 0.08, 0.1, 1.0); return; }
  vec2 t = p * uRep + uOff;
  vec3 c;
  if (panel == 0) c = texture(tA, vec3(t, uLayer)).rgb;
  else if (panel == 1) c = texture(tN, vec3(t, uLayer)).rgb;
  else { vec4 o = texture(tO, vec3(t, uLayer)); c = vec3(o.r, o.g, o.a); }
  if (panel == 0) c = pow(c, vec3(1.0 / 2.2));
  oc = vec4(c, 1.0);
}`,
        depthTest: false, depthWrite: false, toneMapped: false,
      }));
      rawScene.add(rawQuad);
    }
    rawQuad.material.uniforms.uLayer.value = lib.layers[name];
    rawQuad.material.uniforms.uRep.value = opts.rawRep;
    rawQuad.material.uniforms.uOff.value = opts.rawOff;
    rawQuad.material.uniforms.uAspect.value = innerWidth / innerHeight;
  },
};

function setCam(p, t, fov = 70) { if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); } camera.position.set(...p); controls.target.set(...t); camera.lookAt(...t); controls.update(); }

function view(kind = current.view, name = current.name) {
  if (!builders[kind]) throw new Error('unknown view ' + kind);
  if (!lib.layers.hasOwnProperty(name)) throw new Error('unknown material ' + name);
  current = { view: kind, name };
  clear();
  builders[kind](name);
  tagEl.textContent = `${kind} · ${['spheres', 'sheet'].includes(kind) ? 'all layers' : name} · ${lib.meta[name].scale} m/repeat · anti-tiling ${opts.antiTile ? ['plain', 'grid', 'hex'][lib.meta[name].mode] : 'off'}`;
  syncButtons();
  frame();
  return `${kind}/${name}`;
}

// ------------------------------------------------------------------ luminance stats (from a low mip)
function measure() {
  const n = 16, rt = new THREE.WebGLRenderTarget(n, n, { type: THREE.FloatType, depthBuffer: false });
  const m = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: { tA: { value: lib.albedo }, uLayer: { value: 0 }, uLod: { value: Math.log2(lib.size / n) } },
    vertexShader: 'out vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `precision highp sampler2DArray; uniform sampler2DArray tA; uniform float uLayer, uLod; in vec2 vUv; out vec4 oc;
void main(){ vec4 a = textureLod(tA, vec3(vUv, uLayer), uLod); oc = vec4(dot(a.rgb, vec3(0.2126, 0.7152, 0.0722)), a.a, 0.0, 1.0); }`,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  const s = new THREE.Scene(); s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m));
  const buf = new Float32Array(n * n * 4), out = {};
  lib.names.forEach((name, i) => {
    m.uniforms.uLayer.value = i;
    renderer.setRenderTarget(rt); renderer.render(s, rawCam); renderer.readRenderTargetPixels(rt, 0, 0, n, n, buf);
    let l = 0, a = 0; for (let k = 0; k < n * n; k++) { l += buf[k * 4]; a += buf[k * 4 + 1]; }
    out[name] = { lum: +(l / (n * n)).toFixed(3), alpha: +(a / (n * n)).toFixed(3) };
  });
  renderer.setRenderTarget(null); rt.dispose(); m.dispose();
  return out;
}
const lum = measure();

// ------------------------------------------------------------------ UI
const panel = document.getElementById('panel');
const statsEl = document.getElementById('stats');
const btns = { views: {}, mats: {}, opts: {} };
for (const v of Object.keys(builders)) {
  const b = document.createElement('button'); b.textContent = v; b.onclick = () => view(v, current.name);
  document.getElementById('views').appendChild(b); btns.views[v] = b;
}
for (const n of lib.names) {
  const b = document.createElement('button'); b.textContent = n; b.onclick = () => view(['spheres', 'sheet'].includes(current.view) ? 'floor' : current.view, n);
  document.getElementById('mats').appendChild(b); btns.mats[n] = b;
}
for (const [k, label] of [['antiTile', 'anti-tiling'], ['macro', 'macro var'], ['tint', 'tint'], ['normal', 'normals'], ['detail', 'detail']]) {
  const b = document.createElement('button'); b.textContent = label;
  b.onclick = () => set({ [k]: k === 'normal' ? (opts.normal ? 0 : 1) : !opts[k] });
  document.getElementById('opts').appendChild(b); btns.opts[k] = b;
}
const sunB = document.createElement('button'); sunB.textContent = 'sun: noon';
sunB.onclick = () => { const g = sunEl > 30; lab.sun(g ? 120 : 35, g ? 14 : 52); sunB.textContent = g ? 'sun: grazing' : 'sun: noon'; };
document.getElementById('opts').appendChild(sunB);
function syncButtons() {
  for (const [k, b] of Object.entries(btns.views)) b.classList.toggle('on', k === current.view);
  for (const [k, b] of Object.entries(btns.mats)) b.classList.toggle('on', k === current.name);
  for (const [k, b] of Object.entries(btns.opts)) b.classList.toggle('on', !!opts[k]);
}
statsEl.textContent = `generation ${lib.stats.ms} ms (compile ${lib.stats.compileMs})\nsize ${lib.size} · layers ${lib.names.length}\n` +
  lib.names.map((n) => `${n.padEnd(11)} ${String(lib.meta[n].scale).padEnd(4)} ${lib.meta[n].tint ? 'tint' : 'col '} lum ${lum[n].lum.toFixed(2)}${lib.meta[n].alpha ? ' a ' + lum[n].alpha.toFixed(2) : ''}`).join('\n');
addEventListener('keydown', (e) => { if (e.key === 'h' || e.key === 'H') panel.classList.toggle('hidden'); });

function set(o) {
  Object.assign(opts, o);
  for (const m of matCache.values()) applyOpts(m);
  syncButtons();
  view();
}

// ------------------------------------------------------------------ loop
const v3 = new THREE.Vector3();
function frame() {
  controls.update();
  if (current.view === 'raw') { renderer.render(rawScene, rawCam); }
  else renderer.render(scene, camera);
  for (const { el, pos } of labels) {
    v3.copy(pos).project(camera);
    el.style.left = `${(v3.x * 0.5 + 0.5) * innerWidth}px`;
    el.style.top = `${(-v3.y * 0.5 + 0.5) * innerHeight}px`;
    el.style.display = v3.z < 1 ? '' : 'none';
  }
}
renderer.setAnimationLoop(frame);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
  if (rawQuad) rawQuad.material.uniforms.uAspect.value = innerWidth / innerHeight;
});

// ------------------------------------------------------------------ scripting API
const lab = window.lab = {
  lib, lum, opts, genMs,
  stats: lib.stats,
  view, set,
  mat: (name) => view(current.view, name),
  tint(name, hex) { TINTS[name] = hex; for (const m of matCache.values()) if (m.userData.name === name) m.userData.u.tlTint.value.set(hex); view(); },
  sun(az, el) { sunAz = az; sunEl = el; view(); },
  ui(on) { panel.classList.toggle('hidden', !on); tagEl.classList.toggle('hidden', !on); labelsEl.classList.toggle('hidden', !on); },
  cam(p, t) { setCam(p, t); frame(); },
  // cold-compile benchmark: re-import texlib with shader constants salted (forces an uncached driver compile)
  async bench(salts = [1], edits = []) {
    const src = await (await fetch('../src/world/texlib.js')).text();
    const res = [];
    for (const salt of salts) {
      let s2 = src; for (const [a, b] of edits) s2 = s2.replace(a, b);
      s2 = salt ? s2.replace('2891336453u', `${2891336453 + salt}u`).replace('occ / 14.7', `occ / ${(14.7 + salt * 1e-5).toFixed(6)}`) : s2;
      const mod = await import(URL.createObjectURL(new Blob([s2], { type: 'text/javascript' })));
      const l = await mod.createTextureLibrary(renderer, { size: SIZE });
      res.push([salt, l.stats.ms, l.stats.compileMs]); l.dispose();
    }
    return res;
  },
  info: () => ({ ms: lib.stats.ms, compileMs: lib.stats.compileMs, programs: renderer.info.programs.length, lum }),
};
view('floor', params.get('mat') || 'pavers');
if (params.has('clean')) lab.ui(false);
