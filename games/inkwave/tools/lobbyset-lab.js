// INKWAVE lobby set lab: the alley set (src/game/lobbySet.js) rendered the way the showcase draws it — an HDR MSAA
// half-float target, then un-premultiplied + tone mapped (Neutral) + sRGB in a composite pass — with real squidkids on the
// marks, nameplates, and translucent stand-ins for the lobby UI (left 28% / bottom 13%, hub: left 55%).
// URL: ?q=high|medium|low  ?tex=0 (no texture library)  ?ui=0  ?kids=0
// Scripted use: lab.cam('hero'|'hub'|'free'|name), lab.teams(a, b), lab.stats(), lab.freeze(t), lab.walk(i, f), lab.set
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LobbySet } from '../src/game/lobbySet.js';

const params = new URLSearchParams(location.search);
const Q = params.get('q') || 'high';

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.info.autoReset = false;
document.body.prepend(renderer.domElement);
const labels = new CSS2DRenderer({ element: document.getElementById('labels') });
labels.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.05, 400);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ------------------------------------------------------------------ showcase-style HDR target + composite
const size = new THREE.Vector2();
renderer.getDrawingBufferSize(size);
const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
const compMat = new THREE.ShaderMaterial({
  uniforms: { tMap: { value: rt.texture }, uSat: { value: 1.06 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tMap; uniform float uSat; varying vec2 vUv;
    void main() {
      vec4 t = texture2D(tMap, vUv);
      float a = clamp(t.a, 0.0, 1.0);
      vec3 c = max(t.rgb, 0.0) / max(t.a, 1e-4);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = max(mix(vec3(l), c, uSat), 0.0);
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      // anything the set leaves see-through shows as magenta (the showcase would show the attract match there)
      gl_FragColor.rgb = mix(vec3(1.0, 0.0, 1.0), gl_FragColor.rgb, a);
    }`,
  depthTest: false, depthWrite: false,
});
const tri = new THREE.BufferGeometry();
tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
const compScene = new THREE.Scene(); const compQuad = new THREE.Mesh(tri, compMat); compQuad.frustumCulled = false; compScene.add(compQuad);
const compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// ------------------------------------------------------------------ the set
let texlib = null;
if (params.get('tex') !== '0') {
  try { const { createTextureLibrary } = await import('../src/world/texlib.js'); texlib = await createTextureLibrary(renderer, { size: Q === 'low' ? 256 : 512 }); }
  catch (e) { console.warn('texlib unavailable', e); }
}
const set = new LobbySet(renderer, { quality: Q, texlib });
scene.add(set.root);
const COLS = [['#ff8a14', '#2f5bff', 'orange/blue'], ['#ff3f9e', '#18d48c', 'pink/mint'], ['#f2e312', '#8a3cff', 'lemon/grape'], ['#19c3ff', '#ff5a1f', 'cyan/red']];
let colA = new THREE.Color(COLS[0][0]), colB = new THREE.Color(COLS[0][1]);
set.setTeamColors(colA, colB);
await set.ready;
scene.environment = set.environment || null;
scene.environmentIntensity = set.environmentIntensity ?? 0.5;

// ------------------------------------------------------------------ squidkids on the marks
const S = { time: 0, speed: 0, localMove: { x: 0, z: 0 }, grounded: true, vy: 0, aimPitch: 0, firing: false, charge: 0, rolling: false, form: 'kid', wallNormal: new THREE.Vector3(0, 0, -1), ink: 0.8, lowInk: false, special: 0, invuln: false };
const kids = [];
const kidRoot = new THREE.Group(); scene.add(kidRoot);
const NAMES = ['you', 'Tako', 'Mika', 'Rook', 'Juno', 'Pip', 'Vex', 'Ola'];
const WEAP = ['shooter', 'roller', 'charger', 'blaster', 'shooter', 'roller', 'charger', 'blaster'];
let Character = null;
try { ({ Character } = await import('../src/game/character.js')); } catch (e) { console.warn('character unavailable', e.message); }
function makeKid(i, spot) {
  const team = i < 4 ? 0 : 1;
  let root, c = null;
  if (Character && params.get('kids') !== '0') {
    c = new Character({ color: (team ? colB : colA).clone(), weapon: WEAP[i], style: { hair: i % 4, skin: (i * 3) % 4, outfit: i % 4, eyes: i % 3 }, name: NAMES[i] + i, isLocal: i === 0 });
    root = c.root; root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  } else {
    root = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.6, 4, 12), new THREE.MeshStandardMaterial({ color: team ? colB : colA, roughness: 0.5 }));
    m.position.y = 0.58; m.castShadow = true; root.add(m);
  }
  root.position.copy(spot.pos); root.rotation.y = spot.yaw;
  kidRoot.add(root);
  const d = document.createElement('div'); d.className = 'plate'; d.textContent = NAMES[i]; d.style.setProperty('--c', '#' + (team ? colB : colA).getHexString());
  const plate = new CSS2DObject(d); plate.position.set(0, 1.64, 0); root.add(plate);
  kids.push({ i, c, root, plate, d, team });
}
set.spots.forEach((s, i) => makeKid(i, s));
const hubKid = { root: null };

// lane polylines (N toggles)
const laneGroup = new THREE.Group(); laneGroup.visible = false; scene.add(laneGroup);
for (let i = 0; i < 8; i++) {
  const g = new THREE.BufferGeometry().setFromPoints(set.lanes(i).map((v) => v.clone().add(new THREE.Vector3(0, 0.03, 0))));
  laneGroup.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: i < 4 ? '#ffb070' : '#80a8ff', depthTest: false })));
}

// ------------------------------------------------------------------ cameras
const CAMS = {
  hero: () => ({ ...set.camera, ui: 'lobby' }),
  hub: () => ({ ...set.hubCamera, ui: 'hub' }),
  over: () => ({ pos: new THREE.Vector3(9, 14, 10), target: new THREE.Vector3(0, 0, -6), fov: 50, ui: 'off' }),
  top: () => ({ pos: new THREE.Vector3(0.01, 40, -8), target: new THREE.Vector3(0, 0, -8), fov: 60, ui: 'off' }),
  mouth: () => ({ pos: new THREE.Vector3(1, 2, -8), target: new THREE.Vector3(0, 2.5, -40), fov: 50, ui: 'off' }),
  back: () => ({ pos: new THREE.Vector3(0.5, 2.2, -12), target: new THREE.Vector3(0.8, 1.2, 0), fov: 50, ui: 'off' }),
  door: () => ({ pos: new THREE.Vector3(-2.5, 1.6, 3.5), target: new THREE.Vector3(4, 1.8, 0.5), fov: 50, ui: 'off' }),
  floor: () => ({ pos: new THREE.Vector3(-0.8, 0.5, 5), target: new THREE.Vector3(0.5, 0.2, -3), fov: 45, ui: 'off' }),
};
let camName = 'hero';
function cam(name) {
  const c = CAMS[name] ? CAMS[name]() : null;
  if (!c) return 'unknown cam';
  camName = name;
  camera.position.copy(c.pos); controls.target.copy(c.target); camera.fov = c.fov; camera.updateProjectionMatrix(); controls.update();
  const ui = document.getElementById('uimock');
  ui.className = params.get('ui') === '0' ? 'off' : c.ui === 'hub' ? 'hub' : c.ui === 'off' ? 'off' : '';
  const hub = name === 'hub';
  kids.forEach((k) => { k.root.visible = hub ? k.i === 0 : true; if (hub && k.i === 0) { k.root.position.copy(set.hubSpot.pos); k.root.rotation.y = set.hubSpot.yaw; } else { k.root.position.copy(set.spots[k.i].pos); k.root.rotation.y = set.spots[k.i].yaw; } });
  document.querySelectorAll('#cams button').forEach((b) => b.classList.toggle('on', b.dataset.k === name));
  return name;
}

// walk kid i along its arrival path (f = 0..1), for checking lanes
function walk(i, f) {
  const p = set.lanes(i); let L = 0; const seg = [];
  for (let k = 1; k < p.length; k++) { const d = p[k].distanceTo(p[k - 1]); seg.push(d); L += d; }
  let s = f * L, k = 0;
  while (k < seg.length - 1 && s > seg[k]) { s -= seg[k]; k++; }
  const a = p[k], b = p[k + 1], t = Math.min(1, s / seg[k]);
  const r = kids[i].root; r.position.lerpVectors(a, b, t); r.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  return r.position.toArray().map((v) => +v.toFixed(2));
}

// ------------------------------------------------------------------ stats
function stats() {
  renderer.info.reset();
  renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null);
  const all = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
  kidRoot.visible = false;
  renderer.info.reset(); renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null);
  const setOnly = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
  kidRoot.visible = true;
  let meshes = 0, lights = 0; set.root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) meshes++; if (o.isLight) lights++; });
  return { quality: set.quality, texlib: !!texlib, setCallsInclShadowAndReflection: setOnly.calls, setTriangles: setOnly.triangles, frameCallsWithKids: all.calls, frameTriangles: all.triangles, setMeshes: meshes, lights, programs: renderer.info.programs.length, ms: +frameMs.toFixed(2), ...(set.stats ? set.stats() : {}) };
}
function refreshStats() { const s = stats(); document.getElementById('stats').textContent = Object.entries(s).map(([k, v]) => `${k.slice(0, 22).padEnd(22)} ${v}`).join('\n'); }

// ------------------------------------------------------------------ UI
for (const k of Object.keys(CAMS)) { const b = document.createElement('button'); b.textContent = k; b.dataset.k = k; b.onclick = () => cam(k); document.getElementById('cams').append(b); }
function teams(a, b) {
  colA = new THREE.Color(a); colB = new THREE.Color(b);
  set.setTeamColors(colA, colB);
  scene.environment = set.environment || null;
  for (const k of kids) { const c = k.team ? colB : colA; k.c?.setColor?.(c); k.d.style.setProperty('--c', '#' + c.getHexString()); }
}
for (const [a, b2, n] of COLS) { const b = document.createElement('button'); b.textContent = n; b.onclick = () => teams(a, b2); document.getElementById('teams').append(b); }
for (const q of ['high', 'medium', 'low']) { const b = document.createElement('button'); b.textContent = q; b.onclick = () => { set.setQuality(q); refreshStats(); }; document.getElementById('quality').append(b); }
let paused = false, frozen = null;
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'h') document.getElementById('panel').classList.toggle('hidden');
  if (k === 'u') document.getElementById('uimock').classList.toggle('off');
  if (k === 'p') { const el = document.getElementById('labels'); el.style.display = el.style.display === 'none' ? '' : 'none'; }
  if (k === 'k') kidRoot.visible = !kidRoot.visible;
  if (k === 'n') laneGroup.visible = !laneGroup.visible;
  if (k === ' ') paused = !paused;
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); labels.setSize(innerWidth, innerHeight);
  renderer.getDrawingBufferSize(size); rt.setSize(size.x, size.y);
});

// ------------------------------------------------------------------ loop
const timer = new THREE.Timer();
let T = 0, frameMs = 0, frames = 0;
function render(dt) {
  S.time = T;
  set.update(dt, frozen ?? T);
  for (const k of kids) k.c?.update(dt, S);
  controls.update();
  const t0 = performance.now();
  renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
  renderer.setRenderTarget(null); renderer.render(compScene, compCam);
  frameMs = frameMs * 0.9 + (performance.now() - t0) * 0.1;
  labels.render(scene, camera);
  if (++frames % 60 === 1) refreshStats();
}
function loop(ts) { timer.update(ts); const dt = paused ? 0 : Math.min(timer.getDelta(), 0.05); T += dt; render(dt); requestAnimationFrame(loop); }

cam(params.get('cam') || 'hero');
if (params.get('ui') === '0') document.getElementById('uimock').className = 'off';
if (params.get('panel') === '0') document.getElementById('panel').classList.add('hidden');
requestAnimationFrame(loop);
window.lab = { set, scene, renderer, camera, controls, cam, teams, stats, walk, kids, freeze: (t) => { frozen = t; }, pause: (p = true) => { paused = p; }, get T() { return T; }, ready: true };
