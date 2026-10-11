// INKWAVE FX lab: Environment + FX in a mock of the game renderer (NeutralToneMapping, PCF shadows, bloom).
// Scripted control via window.lab (see bottom).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Environment } from '../src/world/environment.js';
import { QUALITY } from '../src/config.js';

const params = new URLSearchParams(location.search);
const qualityName = params.get('quality') || 'high';
const Q = QUALITY[qualityName] || QUALITY.high;
const TEAM = { a: new THREE.Color('#ff8a14'), b: new THREE.Color('#2f5bff') };
const BOUNDS = { minX: -25, maxX: 25, minZ: -44, maxZ: 44 };
const layout = params.get('layout') || 'box';

// ------------------------------------------------------------------ renderer (mirrors the game)
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2) * Q.pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // r186: PCFSoftShadowMap was removed (falls back to PCF with a warning)
renderer.info.autoReset = false;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 4000);
camera.position.set(8, 3.2, 10);

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: Q.msaa }));
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.28, 0.45, 2.4); // matches the game renderer
composer.addPass(bloom);
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.6, 0);

// ------------------------------------------------------------------ placeholder arena
const deckGroup = new THREE.Group();
scene.add(deckGroup);
const deckMat = new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: 0.86 });
const addBox = (x0, x1, y0, y1, z0, z1, color = '#d8d2c4', rough = 0.85) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color === '#d8d2c4' ? deckMat : new THREE.MeshStandardMaterial({ color, roughness: rough }));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true; m.receiveShadow = true;
  deckGroup.add(m);
  return m;
};
let footprint = null;
if (layout === 'notch') {
  // Tidewater-like outline: main slab + side strips with a water notch on each side
  footprint = [
    { minX: -21, maxX: 21, minZ: -44, maxZ: 44 },
    { minX: -25, maxX: -21, minZ: -44, maxZ: 6 }, { minX: -25, maxX: -21, minZ: 14, maxZ: 44 },
    { minX: 21, maxX: 25, minZ: -6, maxZ: 44 }, { minX: 21, maxX: 25, minZ: -44, maxZ: -14 },
  ];
  for (const r of footprint) addBox(r.minX, r.maxX, -1.2, 0, r.minZ, r.maxZ);
} else {
  addBox(-25, 25, -1.2, 0, -44, 44);
}
addBox(-5, 5, 0, 2.8, -5, 5, '#d9dfe0');
addBox(-25, 25, 0, 3.6, -44, -43.4, '#ece4d4');
addBox(-25, 25, 0, 3.6, 43.4, 44, '#ece4d4');
addBox(-9, 9, 0, 2.2, -43.4, -35, '#eae6de');
addBox(-9, 9, 0, 2.2, 35, 43.4, '#eae6de');
addBox(-10.2, -9.2, 0, 3.0, -23, -13, '#ece4d4');
addBox(9.2, 10.2, 0, 3.0, 13, 23, '#ece4d4');
addBox(-22.2, -19.8, 0, 2.5, -33, -27, '#8fb3b1');
addBox(19.8, 22.2, 0, 2.5, 27, 33, '#8fb3b1');
addBox(-22.2, -16.2, 2.5, 5.0, -30.6, -28.2, '#cf9c88');
addBox(14, 21, 0, 1.3, -30, -22, '#c7c2b8');
addBox(-21, -14, 0, 1.3, 22, 30, '#c7c2b8');
addBox(4.4, 5.8, 0, 1.4, -25.2, -23.8, '#c9a27c');
addBox(-5.8, -4.4, 0, 1.4, 23.8, 25.2, '#c9a27c');
addBox(-3, 3, 0, 8.8, 18, 21, '#b3abd0'); // a tall tower to test long shadows
const WALL = { x: 11.5, z: -3 };          // test wall (face at z = -3, facing +Z) for climb drips / laser / beam impacts
addBox(10, 13, 0, 3.0, -3.6, -3, '#cfd6d8');
// railings along the long edges
addBox(-25, -24.6, 0, 1.05, -43.4, 43.4, '#a9b4bc');
addBox(24.6, 25, 0, 1.05, -43.4, 43.4, '#a9b4bc');
// spawn pads (glowy-ish)
for (const z of [-39.2, 39.2]) {
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 40), new THREE.MeshStandardMaterial({ color: '#f3f1ec', roughness: 0.5 }));
  pad.position.set(0, 2.24, z); pad.receiveShadow = true; deckGroup.add(pad);
}

// ------------------------------------------------------------------ environment
const t0 = performance.now();
const env = new Environment(renderer, scene, { bounds: BOUNDS, theme: params.get('theme') || 'day', shadowSize: Q.shadowSize, footprint });
scene.environment = env.envMap;
const envBuildMs = performance.now() - t0;

// ------------------------------------------------------------------ fx (optional until the module exists)
let fx = null;
const colliders = deckGroup.children;
const ray = new THREE.Raycaster();
const _dir = new THREE.Vector3();
const _hit = { point: new THREE.Vector3(), normal: new THREE.Vector3() };
const _nm = new THREE.Matrix3();
function collider(from, to) {
  _dir.subVectors(to, from);
  const len = _dir.length();
  if (len < 1e-6) return null;
  ray.set(from, _dir.multiplyScalar(1 / len));
  ray.far = len;
  const hits = ray.intersectObjects(colliders, false);
  if (!hits.length) return null;
  const h = hits[0];
  _hit.point.copy(h.point);
  _nm.getNormalMatrix(h.object.matrixWorld);
  _hit.normal.copy(h.face.normal).applyMatrix3(_nm).normalize();
  return _hit;
}
// paint preview: little flat discs where paint droplets land
const PAINT_MAX = 600;
const paintMesh = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14), new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), PAINT_MAX);
paintMesh.count = 0; paintMesh.receiveShadow = true; paintMesh.frustumCulled = false;
scene.add(paintMesh);
let paintNext = 0;
const _pm = new THREE.Matrix4(), _pq = new THREE.Quaternion(), _pz = new THREE.Vector3(0, 0, 1), _ps = new THREE.Vector3(), _pp = new THREE.Vector3();
function paintSplat(point, normal, color, size) {
  const s = size * (3 + Math.random() * 1.5);
  _pq.setFromUnitVectors(_pz, normal);
  _pp.copy(point).addScaledVector(normal, 0.004);
  _pm.compose(_pp, _pq, _ps.set(s, s, s));
  paintMesh.setMatrixAt(paintNext, _pm);
  paintMesh.setColorAt(paintNext, color);
  paintNext = (paintNext + 1) % PAINT_MAX;
  paintMesh.count = Math.max(paintMesh.count, paintNext === 0 ? PAINT_MAX : paintNext);
  paintMesh.instanceMatrix.needsUpdate = true;
  if (paintMesh.instanceColor) paintMesh.instanceColor.needsUpdate = true;
}
let fxError = null;
try {
  const mod = await import('../src/fx/fx.js');
  fx = new mod.FX(scene, { quality: qualityName });
  fx.setCollider(collider);
  fx.setLighting(env.getSkyColors());
  fx.onDropletLand = paintSplat;
} catch (e) { fxError = e; console.warn('FX module not loaded:', e.message); }

// ------------------------------------------------------------------ camera presets
const CAMS = {
  fx: { pos: [21.5, 3.3, 8.5], target: [14, 0.9, -1], fov: 70 },
  fxWide: { pos: [26, 7, 14], target: [14, 1.5, -1], fov: 70 },
  fxClose: { pos: [19.5, 2.2, 4.5], target: [14.5, 1.0, 0.5], fov: 60 },
  deck: { pos: [3, 2.6, 36], target: [-6, 2.2, -10], fov: 70 },
  deckEast: { pos: [17, 2.5, 6], target: [60, 4, -12], fov: 70 },
  deckWest: { pos: [-17, 2.5, -8], target: [-60, 5, -24], fov: 70 },
  deckNorth: { pos: [-4, 2.6, -36], target: [4, 3, 10], fov: 70 },
  edge: { pos: [21, 2.6, 18], target: [30, -1.2, 26], fov: 70 },
  overview: { pos: [78, 62, 118], target: [0, 0, 0], fov: 55 },
  high: { pos: [0, 150, 190], target: [0, 0, -20], fov: 60 },
  water: { pos: [44, -0.9, 32], target: [26, -0.4, 22], fov: 60 },
  sea: { pos: [31, 0.9, 6], target: [36, -1.6, 12], fov: 65 },
  sky: { pos: [0, 2, 0], target: [0.01, 100, 0.2], fov: 80 },
  city: { pos: [20, 4, 0], target: [700, 60, 280], fov: 30 },
  lighthouse: { pos: [-20, 3, -30], target: [-67, 12, -165], fov: 35 },
};
let camName = 'fx';
function setCam(name) {
  const c = CAMS[name]; if (!c) return;
  camName = name;
  camera.position.fromArray(c.pos);
  controls.target.fromArray(c.target);
  camera.fov = c.fov; camera.updateProjectionMatrix();
  controls.update();
  ui.cams.forEach((b) => b.classList.toggle('on', b.dataset.k === name));
}

// ------------------------------------------------------------------ effects
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const continuous = []; // { until, fn(dt, t) }
function effectCenter() {
  // fire effects around the orbit target, projected onto the deck when it is on the deck
  const t = controls.target;
  return V(Math.max(-22, Math.min(22, t.x)), 0, Math.max(-40, Math.min(40, t.z)));
}
const EFFECTS = {
  burst: (c, col) => { fx.burst(c.clone().add(V(-1, 0.02, 1)), UP, col, { count: 18, speed: 5, size: 0.1, paint: true }); fx.burst(V(10.22, 1.6, c.z + 13.5), V(1, 0, 0), col, { count: 12, speed: 3.5, size: 0.09, spread: 0.8, paint: true }); },
  drop: (c, col) => { for (let i = 0; i < 10; i++) fx.drop(c.clone().add(V(-3, 1.4, -1 + i * 0.25)), V(5 + Math.random() * 2, 4 + Math.random() * 2, (Math.random() - 0.5) * 2), col, { size: 0.09 + Math.random() * 0.06, paint: true }); },
  ring: (c, col) => { fx.ring(c.clone().add(V(0, 0.02, 0)), UP, col, { radius: 1.8 }); fx.ring(V(10.21, 1.5, c.z + 13.5), V(1, 0, 0), col, { radius: 1.2 }); },
  explosion: (c, col) => fx.explosion(c.clone().add(V(0, 0.4, 0)), col, 3.1),
  splatted: (c, col) => fx.splatted(c.clone().add(V(0.5, 0.75, 1)), col),
  wake: (c, col) => { const t0 = simTime; continuous.push({ until: simTime + 1.6, fn: (dt, t) => { const u = (t - t0) / 1.6; const p = c.clone().add(V(-5 + u * 10, 0.02, 2.5 + Math.sin(u * 6) * 1.2)); fx.wake(p, V(1, 0, Math.cos(u * 6) * 0.7).normalize(), col, 11.8); } }); },
  muzzle: (c, col) => { let acc = 0; continuous.push({ until: simTime + 1.0, fn: (dt) => { acc -= dt; if (acc <= 0) { acc += 0.1; const p = c.clone().add(V(3, 1.15, 2)); const d = V(-1, 0.05, -0.45).normalize(); fx.muzzle(p, d, col); for (let i = 0; i < 1; i++) fx.drop(p, d.clone().multiplyScalar(18).add(V((Math.random() - 0.5) * 1.5, 1 + Math.random(), (Math.random() - 0.5) * 1.5)), col, { size: 0.13, paint: true }); } } }); },
  spawnFlash: (c, col) => fx.spawnFlash(c.clone().add(V(0, 0.02, 0)), col),
  rain: (c, col) => { const p = c.clone().add(V(0, 5.5, 0)); continuous.push({ until: simTime + 4, fn: (dt) => fx.rain(p, 3.4, col, dt) }); },
  // ---- Effect recipes (see src/fx/fx.js header) ----
  footsteps: (c, col) => {
    const other = otherTeam(col);
    inkPatch(c.x + 0.2, c.z + 1.5, 1.7, col); inkPatch(c.x + 3.9, c.z + 1.5, 1.7, other);
    let i = 0;
    for (let x = c.x - 3.5; x < c.x + 5.6; x += 0.62, i++) {
      const sf = x < c.x - 1.5 ? 0 : x < c.x + 1.9 ? 1 : 2, xx = x, side = i & 1 ? 0.13 : -0.13;
      later(i * 0.085, () => fx.footstep(V(xx, 0.0, c.z + 1.5 + side), sf === 2 ? other : col, sf, V(1, 0, 0), 6.2));
    }
  },
  land: (c, col) => {
    const other = otherTeam(col);
    inkPatch(c.x, c.z, 1.6, col); inkPatch(c.x + 3.4, c.z, 1.6, other);
    fx.land(V(c.x - 3.4, 0, c.z), col, 0, 13); fx.land(V(c.x, 0, c.z), col, 1, 13); fx.land(V(c.x + 3.4, 0, c.z), other, 2, 13);
  },
  jumpOff: (c, col) => { inkPatch(c.x + 2.5, c.z, 1.4, col); fx.jumpOff(V(c.x - 1, 0, c.z), col, 0, false); fx.jumpOff(V(c.x + 2.5, 0, c.z), col, 1, true); },
  formPop: (c, col) => { fx.formPop(V(c.x - 1, 0, c.z), col, true, false); later(0.35, () => fx.formPop(V(c.x + 1.5, 0, c.z), col, false, false)); },
  dive: (c, col) => { inkPatch(c.x, c.z, 2.2, col); fx.dive(V(c.x - 0.8, 0, c.z), col, 8); later(0.45, () => fx.emerge(V(c.x + 1.2, 0, c.z), col, 6)); },
  bubbles: (c, col) => { inkPatch(c.x, c.z, 1.4, col); for (let k = 0; k < 6; k++) later(k * 0.12, () => fx.bubbles(V(c.x, 0, c.z), col, 3)); },
  climb: (c, col) => {
    inkPatch(WALL.x, WALL.z + 0.3, 1.2, col);
    const t0 = simTime;
    let acc = 0;
    continuous.push({ until: simTime + 1.3, fn: (dt, t) => { acc += dt; const y = 0.2 + (t - t0) / 1.3 * 2.8; if (acc > 0.07) { acc = 0; fx.climbDrip(V(WALL.x, y, WALL.z + 0.05), V(0, 0, 1), col); } } });
    later(1.32, () => fx.climbPop(V(WALL.x, 3.0, WALL.z - 0.3), V(0, 0, -1), col));
  },
  hurt: (c, col) => { const other = otherTeam(col); let acc = 0; continuous.push({ until: simTime + 2.2, fn: (dt) => { acc += dt * 5; while (acc >= 1) { acc -= 1; const a = Math.random() * 6.283; fx.hurtDrip(V(c.x + Math.cos(a) * 0.18, 0.6 + Math.random() * 0.75, c.z + Math.sin(a) * 0.18), other, 0.04); } } }); },
  hit: (c, col) => { const d = V(-1, 0, -0.4).normalize(); fx.hitSplash(V(c.x - 1.5, 0.95, c.z), d, col, 25); later(0.12, () => fx.hitSplash(V(c.x, 0.95, c.z), d, col, 55)); later(0.24, () => fx.hitSplash(V(c.x + 1.5, 0.95, c.z), d, col, 90)); },
  shots: (c, col) => {
    for (let k = 0; k < 6; k++) later(k * 0.11, () => {
      const p = V(c.x + 4, 1.1, c.z + 3), v = V(-15, 1.2 + Math.random(), -8 + Math.random() * 2);
      fx.muzzle(p, v.clone().normalize(), col);
      let dacc = 0; const t0 = simTime;
      continuous.push({ until: simTime + 0.55, fn: (dt) => { v.y -= 14 * dt; p.addScaledVector(v, dt); dacc += v.length() * dt; if (dacc > 0.8) { dacc = 0; fx.shotTrail(p, v, col, false); } } });
      later(0.55, () => { fx.burst(p.clone().setY(Math.max(0.02, p.y)), UP, col, { count: 5, speed: 3, size: 0.07 }); fx.ring(p.clone().setY(0.02), UP, col, { radius: 0.5, style: 6, life: 0.3 }); });
    });
  },
  blaster: (c, col) => {
    const p = V(c.x + 4, 1.2, c.z + 2.5), v = V(-12, 0.5, -6);
    fx.muzzle(p, v.clone().normalize(), col, 'blaster');
    let dacc = 0;
    continuous.push({ until: simTime + 0.36, fn: (dt) => { p.addScaledVector(v, dt); dacc += v.length() * dt; if (dacc > 0.55) { dacc = 0; fx.shotTrail(p, v, col, true); } } });
    later(0.36, () => fx.explosion(p.clone(), col, 2.2));
  },
  charger: (c, col) => {
    const m = V(c.x + 3, 1.25, c.z + 2), t0 = simTime; let full = false;
    continuous.push({ until: simTime + 1.1, fn: (dt, t) => { const k = Math.min(1, (t - t0) / 1.0); fx.chargeGlow(m, col, k); if (k >= 1 && !full) { full = true; fx.chargeFull(m, col); } } });
    later(1.15, () => { const to = V(WALL.x + 0.6, 1.4, WALL.z); const d = to.clone().sub(m).normalize(); fx.muzzle(m, d, col, 'charger'); fx.beamTrail(m, to, col, 1); fx.beamImpact(to, V(0, 0, 1), col, 1); });
  },
  laser: (c, col) => { const t0 = simTime; continuous.push({ until: simTime + 1.2, fn: (dt, t) => fx.laserDot(V(WALL.x + Math.sin((t - t0) * 3) * 0.4, 1.4, WALL.z), V(0, 0, 1), col, Math.min(1, (t - t0))) }); },
  roller: (c, col) => {
    const t0 = simTime;
    continuous.push({ until: simTime + 1.4, fn: (dt, t) => { const u = (t - t0) / 1.4; fx.rollerSpray(V(c.x - 3 + u * 5, 0, c.z + 1), V(1, 0, 0), 1.1, col, 1); } });
    later(1.5, () => fx.flickCurtain(V(c.x + 2.5, 1.05, c.z + 1), V(-0.8, 0, -0.6).normalize(), col, 50));
  },
  bomb: (c, col) => {
    const b = V(c.x, 0.2, c.z), g = V(c.x, 0.02, c.z), t0 = simTime; let nextBeep = 0;
    fx.bounceSplash(V(c.x, 0.01, c.z), UP, col);
    continuous.push({ until: simTime + 0.95, fn: (dt, t) => { const k = (t - t0) / 0.95; fx.dangerRing(g, UP, col, 3.1, k); if (t - t0 >= nextBeep) { nextBeep += 0.3 - k * 0.2; fx.beepPulse(b, g, UP, col, 3.1, k); } } });
    later(0.97, () => fx.explosion(b, col, 3.1));
  },
  slam: (c, col) => {
    const p = V(c.x, 0, c.z);
    fx.slamLaunch(p, col);
    const t0 = simTime;
    continuous.push({ until: simTime + 0.55, fn: (dt, t) => fx.superJumpTrail(V(c.x, 0.5 + (t - t0) / 0.55 * 4.5, c.z), V(0, 9, 0), col) });
    later(0.55, () => continuous.push({ until: simTime + 0.25, fn: (dt, t) => fx.slamCharge(V(c.x, 5.8, c.z), col, Math.min(1, (t - t0 - 0.55) / 0.25)) }));
    later(0.8, () => { const t1 = simTime; continuous.push({ until: simTime + 0.15, fn: (dt, t) => fx.slamFall(V(c.x, 5 - (t - t1) * 34, c.z), col) }); });
    later(0.96, () => { fx.explosion(V(c.x, 0.3, c.z), col, 5.2); fx.slamWave(V(c.x, 0, c.z), col, 5.2); });
  },
  storm: (c, col) => {
    const p = c.clone().add(V(0, 5.5, 0));
    fx.stormStart(p, col, 3.4);
    let acc = 0, fl = 0.4;
    continuous.push({ until: simTime + 4, fn: (dt) => { fx.rain(p, 3.4, col, dt); acc += dt * 16; while (acc >= 1) { acc -= 1; const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * 3.2; fx.stormPuddle(V(p.x + Math.cos(a) * r, 0, p.z + Math.sin(a) * r), UP, col); } fl -= dt; if (fl <= 0) { fl = 0.6 + Math.random(); fx.stormFlash(p, col, 3.4); } } });
  },
  superJump: (c, col) => {
    const from = V(c.x + 3, 0, c.z + 1), to = V(c.x - 6, 0, c.z - 5), t0 = simTime;
    continuous.push({ until: simTime + 0.75, fn: (dt, t) => { fx.superJumpCharge(from, col, (t - t0) / 0.75); fx.jumpMarker(to, col, t - t0); } });
    later(0.75, () => {
      fx.superJumpLaunch(from, col);
      const t1 = simTime, prev = from.clone();
      continuous.push({ until: simTime + 1.2, fn: (dt, t) => { const k = Math.min(1, (t - t1) / 1.2); const p = from.clone().lerp(to, k); p.y += Math.sin(Math.PI * k) * 11; const v = p.clone().sub(prev).multiplyScalar(1 / Math.max(dt, 1e-3)); prev.copy(p); fx.superJumpTrail(p, v, col); fx.jumpMarker(to, col, t - t0); } });
    });
    later(1.97, () => fx.superJumpLand(to, col));
  },
  ghost: (c, col) => { const p = V(c.x, 0.6, c.z); fx.splatted(p, otherTeam(col)); fx.ghost(p, col); },
  seaSpray: () => { for (let k = 0; k < 3; k++) later(k * 0.5, () => fx.seaSpray(V(25.02, -1.55, 12 + k * 3), V(1, 0, 0), 0.7 + k * 0.35)); },
  sea: () => { fx.waterSplash(V(28, -1.6, 14), 1.1); later(0.3, () => fx.waterPlop(V(27, -1.6, 10), 0.3)); later(0.45, () => fx.waterPlop(V(29, -1.6, 11), 0.6)); },
  sparkle: (c, col) => { let acc = 0; continuous.push({ until: simTime + 2, fn: (dt) => { acc += dt * 12; while (acc >= 1) { acc -= 1; fx.specialSparkle(V(c.x, 0, c.z), col, 1.55); } } }); },
  sizzle: (c, col) => { const other = otherTeam(col); inkPatch(c.x, c.z, 1.2, other); let acc = 0; continuous.push({ until: simTime + 1.6, fn: (dt) => { acc += dt; if (acc > 0.11) { acc = 0; fx.enemyInkSizzle(V(c.x, 0, c.z), other); } } }); },
  feathers: (c) => { for (let k = 0; k < 6; k++) fx.feather(V(c.x - 3 + k * 1.2, 2.5 + Math.random() * 2, c.z + (Math.random() - 0.5) * 2)); },
  glints: (c, col) => { inkPatch(c.x, c.z, 2.2, col); for (let k = 0; k < 24; k++) later(k * 0.05, () => { const a = Math.random() * 6.283, r = Math.random() * 2; fx.glint(V(c.x + Math.cos(a) * r, 0.03, c.z + Math.sin(a) * r), col, 0.1 + Math.random() * 0.1); }); },
  dryFire: (c) => { for (let k = 0; k < 4; k++) later(k * 0.2, () => fx.dryFire(V(c.x + 2, 1.15, c.z + 1), V(-1, 0, -0.5).normalize())); },
};
function otherTeam(col) { return col === TEAM.a ? TEAM.b : TEAM.a; }
const timers = [];
function later(delay, fn) { timers.push({ t: simTime + delay, fn }); }
// flat team-colour "ink" disc on the ground (lab stand-in for painted turf)
function inkPatch(x, z, r, col) { paintSplat(V(x, 0.001, z), UP, col, r / 3.75); }
const FX_KEYS = Object.keys(EFFECTS);
function fire(name, team = 'a') {
  if (!fx) return 'fx not loaded';
  const f = EFFECTS[name]; if (!f) return 'unknown effect ' + name;
  f(effectCenter(), team === 'b' ? TEAM.b : TEAM.a);
  return 'ok';
}

// ------------------------------------------------------------------ UI
const ui = { cams: [], themes: [] };
const mk = (parent, label, onClick, cls = '') => { const b = document.createElement('button'); b.textContent = label; b.className = cls; b.onclick = onClick; document.getElementById(parent).appendChild(b); return b; };
for (const t of ['day', 'sunset']) { const b = mk('themes', t, () => setTheme(t)); b.dataset.k = t; ui.themes.push(b); }
for (const k of Object.keys(CAMS)) { const b = mk('cams', k, () => setCam(k)); b.dataset.k = k; ui.cams.push(b); }
FX_KEYS.forEach((k, i) => {
  const g = document.getElementById('fx');
  const s = document.createElement('span'); s.innerHTML = `${k}<kbd>${i + 1}</kbd>`; g.appendChild(s);
  const ba = document.createElement('button'); ba.className = 'sw a'; ba.title = 'orange'; ba.onclick = () => fire(k, 'a'); g.appendChild(ba);
  const bb = document.createElement('button'); bb.className = 'sw b'; bb.title = 'blue'; bb.onclick = () => fire(k, 'b'); g.appendChild(bb);
});
const pauseBtn = mk('time', 'pause', () => { paused = !paused; });
mk('time', 'step 1/60', () => step(1000 / 60));
mk('time', 'slow-mo', function () { slow = slow === 1 ? 0.2 : 1; this.classList.toggle('on', slow !== 1); });
mk('time', 'clear fx', () => window.lab.clear());
function setTheme(t) { env.setTheme(t); scene.environment = env.envMap; fx?.setLighting(env.getSkyColors()); ui.themes.forEach((b) => b.classList.toggle('on', b.dataset.k === t)); }
ui.themes.forEach((b) => b.classList.toggle('on', b.dataset.k === env.theme));

addEventListener('keydown', (e) => {
  if (e.target !== document.body) return;
  const n = parseInt(e.code.replace('Digit', ''), 10);
  if (n >= 1 && n <= FX_KEYS.length) fire(FX_KEYS[n - 1], e.shiftKey ? 'b' : 'a');
  else if (e.code === 'KeyT') setTheme(env.theme === 'day' ? 'sunset' : 'day');
  else if (e.code === 'KeyC') { const ks = Object.keys(CAMS); setCam(ks[(ks.indexOf(camName) + 1) % ks.length]); }
  else if (e.code === 'Space') { paused = !paused; e.preventDefault(); }
  else if (e.code === 'KeyH') document.getElementById('panel').classList.toggle('hidden');
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
});

// ------------------------------------------------------------------ loop
let paused = false, slow = 1, simTime = 0, freezeAt = Infinity;
let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0, statsLine = '';
function simulate(dt) {
  simTime += dt;
  for (let i = timers.length - 1; i >= 0; i--) if (simTime >= timers[i].t) { const f = timers[i].fn; timers.splice(i, 1); f(); }
  for (let i = continuous.length - 1; i >= 0; i--) { const c = continuous[i]; if (simTime > c.until) continuous.splice(i, 1); else c.fn(dt, simTime); }
  env.update(dt, camera);
  fx?.update(dt, camera);
}
function step(ms) { const n = Math.max(1, Math.round(ms / (1000 / 60))); for (let i = 0; i < n; i++) simulate(1 / 60); }
function render() {
  renderer.info.reset();
  composer.render();
}
function frame(now) {
  requestAnimationFrame(frame);
  const rdt = Math.min(0.05, (now - last) / 1000); last = now;
  controls.update();
  if (!paused) {
    let dt = rdt * slow;
    if (simTime + dt >= freezeAt) { dt = Math.max(0, freezeAt - simTime); paused = true; freezeAt = Infinity; }
    if (dt > 0) simulate(dt);
  }
  pauseBtn.classList.toggle('on', paused);
  render();
  fpsAcc += rdt; fpsN++;
  if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  const i = renderer.info;
  statsLine = `fps ${fps.toFixed(0)}  calls ${i.render.calls}  tris ${(i.render.triangles / 1000).toFixed(0)}k\ngeo ${i.memory.geometries}  tex ${i.memory.textures}  prog ${i.programs?.length ?? '-'}\nfx live ${fx ? JSON.stringify(fx.stats?.() ?? {}) : (fxError ? 'ERR' : '-')}\nt ${simTime.toFixed(2)}${paused ? '  [paused]' : ''}`;
  document.getElementById('stats').textContent = statsLine;
}
setCam(params.get('cam') || 'fx');
requestAnimationFrame(frame);

// Measure draw calls / triangles of one frame. which: 'all' | 'env' (env only, no deck/fx) — direct render, no post.
function measure(which = 'all') {
  const hidden = [];
  if (which === 'env') { for (const o of [deckGroup, paintMesh, ...(fx ? [fx.root] : [])]) { if (o && o.visible) { o.visible = false; hidden.push(o); } } }
  const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType });
  renderer.setRenderTarget(rt);
  renderer.info.reset();
  renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
  const r = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, lines: renderer.info.render.lines, points: renderer.info.render.points };
  renderer.setRenderTarget(null);
  rt.dispose();
  for (const o of hidden) o.visible = true;
  const t = performance.now();
  for (let k = 0; k < 20; k++) render();
  renderer.getContext().finish();
  r.msPerFrame20 = +((performance.now() - t) / 20).toFixed(2);
  return r;
}

window.lab = {
  THREE, renderer, scene, camera, controls, composer, bloom, env, get fx() { return fx; }, fxError: () => fxError?.message ?? null,
  envBuildMs,
  camera: (name) => { setCam(name); return camName; },
  cams: () => Object.keys(CAMS),
  setView: (pos, target, fov) => { camera.position.fromArray(pos); controls.target.fromArray(target); if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); } controls.update(); },
  theme: (t) => { setTheme(t); return env.theme; },
  fire, effects: () => FX_KEYS.slice(),
  // run simulation for `ms` more (real time), then freeze
  freeze: (ms = 0) => { paused = false; freezeAt = simTime + ms / 1000; return freezeAt; },
  pause: (p = true) => { paused = p; },
  // deterministic: advance simulation by ms in fixed 1/60 steps (works while paused)
  step: (ms) => { step(ms); return simTime; },
  // fire an effect then advance exactly `ms` and pause — for mid-flight screenshots
  shot: (name, team = 'a', ms = 150, clear = true) => { paused = true; if (clear) { fx?.clear(); continuous.length = 0; timers.length = 0; paintMesh.count = 0; paintNext = 0; } const r = fire(name, team); step(ms); return r; },
  fxStats: () => fx ? { ...fx.stats(), tris: fx.triangles?.() } : null,
  clear: () => { fx?.clear(); continuous.length = 0; timers.length = 0; paintMesh.count = 0; paintNext = 0; },
  time: () => simTime,
  measure,
  info: () => statsLine,
  hidePanel: (h = true) => document.getElementById('panel').classList.toggle('hidden', h),
};
