// INKWAVE props lab: every prop type in a showroom, a composed "street scene" plaza corner, and a variants sheet,
// rendered with a mock of the game renderer (NeutralToneMapping, PCF sun shadows, RoomEnvironment PMREM, bloom 2.4).
// Scripted use: lab.preset('showroom'|'street'|'variants'), lab.cam(name), lab.stats(), lab.tris().
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { PropKit, PROP_TYPES } from '../src/world/props.js';

const params = new URLSearchParams(location.search);

// ------------------------------------------------------------------ renderer (mirrors the game)
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.info.autoReset = false;
document.body.prepend(renderer.domElement);

const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') });
labelRenderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const SKY = new THREE.Color('#9fd2ee');
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 70, 170);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 400);
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.28, 0.45, 2.4);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const sun = new THREE.DirectionalLight('#fff3df', 2.1);
sun.position.set(16, 28, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 36, bottom: -36, near: 1, far: 90 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#e2f2ff', '#b8ab96', 0.7);
scene.add(hemi);

// light concrete floor with 2 m tiles
const floorTex = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const x = cv.getContext('2d');
  x.fillStyle = '#c9c8c4'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '120,110,100'},${Math.random() * 0.05})`; x.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
  x.strokeStyle = 'rgba(120,112,100,0.28)'; x.lineWidth = 3; x.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(100, 100);
  return t;
})();
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.88 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
scene.add(floor);

// ------------------------------------------------------------------ helpers
const world = new THREE.Group(); scene.add(world);
const blkMats = new Map();
function blk(x0, y0, z0, x1, y1, z1, color = '#ece8f2') {
  let m = blkMats.get(color);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: 0.82 }); blkMats.set(color, m); }
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m);
  mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  mesh.castShadow = mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}
function label(text, sub, x, y, z) {
  const d = document.createElement('div'); d.className = 'lbl'; d.innerHTML = text + (sub ? `<span>${sub}</span>` : '');
  const o = new CSS2DObject(d); o.position.set(x, y, z); world.add(o); return o;
}

let kit = new PropKit(scene, { castShadow: true, quality: params.get('q') || 'high' });
const colliders = [];
function put(type, o) { const r = kit.add(type, o); colliders.push(...r.colliders); return r; }

// scale reference squidkids (the real game character when it loads)
let Character = null; const kids = [];
const S = { time: 0, speed: 0, localMove: { x: 0, z: 0 }, grounded: true, vy: 0, aimPitch: 0, firing: false, charge: 0, rolling: false, form: 'kid', wallNormal: new THREE.Vector3(0, 0, -1), ink: 0.8, lowInk: false, special: 0, invuln: false };
const charReady = import('../src/game/character.js').then((m) => { Character = m.Character; }).catch((e) => console.warn('character unavailable', e.message));
function kid(x, z, yaw, team = 0, y = 0) {
  const spot = { x, z, yaw, team };
  kids.push(spot);
  const make = () => {
    if (Character) {
      const c = new Character({ color: new THREE.Color(team ? '#2f5bff' : '#ff8a14'), weapon: team ? 'roller' : 'shooter', style: { hair: kids.length % 4, skin: kids.length % 4 }, name: 'ref' });
      c.root.position.set(x, y, z); c.root.rotation.y = yaw; c.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      world.add(c.root); spot.c = c;
    } else {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.95, 4, 12), new THREE.MeshStandardMaterial({ color: team ? '#2f5bff' : '#ff8a14' }));
      m.position.set(x, y + 0.725, z); m.castShadow = true; world.add(m);
    }
  };
  charReady.then(make);
}

// ------------------------------------------------------------------ presets
const SLOT = { dx: 6.2, dz: 6.8, cols: 6 };
const slotPos = {};
const WALL_TYPES = new Set(['acunit', 'pipes', 'ladder', 'neon', 'awning', 'container_door', 'poster', 'stickers', 'hosereel']);
// back row = wall-mounted pieces on backing walls, then tallest to smallest toward the camera, so nothing hides behind anything from the overview camera
const SHOW_ORDER = ['pipes', 'ladder', 'acunit', 'neon', 'awning', 'container_door', 'lightpole', 'tree', 'banner', 'bunting', 'sign', 'fence',
  'vending', 'speaker', 'skateramp', 'railing', 'bench', 'planter', 'trashbin', 'barrier', 'crates', 'pallet', 'tires', 'barrel',
  'bollard', 'cone', 'bush', 'buoy', 'lifering', 'vent'];
function showroom() {
  const types = [...PROP_TYPES].sort((a, b) => (SHOW_ORDER.indexOf(a.type) + 1 || 99) - (SHOW_ORDER.indexOf(b.type) + 1 || 99));
  types.forEach((t, i) => {
    const cx = ((i % SLOT.cols) - (SLOT.cols - 1) / 2) * SLOT.dx, cz = (Math.floor(i / SLOT.cols) - 2) * SLOT.dz;
    slotPos[t.type] = [cx, cz];
    let r;
    const wz = cz - 1.4;
    if (WALL_TYPES.has(t.type)) {
      if (t.type === 'container_door') blk(cx - 1.22, 0, wz - 3, cx + 1.22, 2.59, wz, '#c9705e');
      else blk(cx - 2.3, 0, wz - 0.4, cx + 2.3, 3.8, wz, '#ece7f3');
    }
    switch (t.type) {
      case 'railing': case 'fence': r = put(t.type, { pos: [cx - 2, 0, cz] }); break;
      case 'bunting': r = put(t.type, { pos: [cx - 2.5, 0, cz], length: 5, height: 3.2, team: 0 }); break;
      case 'pipes': r = put(t.type, { pos: [cx - 2.2, 0, wz], length: 4.4 }); break;
      case 'acunit': r = put(t.type, { pos: [cx, 1.5, wz] }); break;
      case 'neon': r = put(t.type, { pos: [cx, 1.3, wz] }); break;
      case 'awning': r = put(t.type, { pos: [cx, 2.7, wz] }); break;
      case 'ladder': r = put(t.type, { pos: [cx, 0, wz], height: 3.2 }); break;
      case 'container_door': r = put(t.type, { pos: [cx, 0, wz] }); break;
      case 'poster': r = put(t.type, { pos: [cx, 1.6, wz], count: 4, variant: 1 }); break;
      case 'stickers': r = put(t.type, { pos: [cx, 1.4, wz], count: 14, width: 2.4, height: 1.2 }); break;
      case 'hosereel': r = put(t.type, { pos: [cx, 1.3, wz] }); break;
      case 'stringlights': r = put(t.type, { pos: [cx - 2.4, 0, cz], length: 4.8, height: 3.0, posts: true }); break;
      case 'cable': r = put(t.type, { pos: [cx - 2.4, 0, cz], length: 4.8, height: 3.2, count: 3 }); break;
      case 'bikerack': r = put(t.type, { pos: [cx - 1, 0, cz], count: 3, bikes: 2 }); break;
      case 'net': r = put(t.type, { pos: [cx - 1.2, 0, cz] }); break;
      case 'banner': r = put(t.type, { pos: [cx - 0.5, 0, cz], team: 1 }); break;
      case 'skateramp': r = put(t.type, { pos: [cx, 0, cz] }); break;
      default: r = put(t.type, { pos: [cx, 0, cz] });
    }
    label(t.type, `${kit.lastTris} tris`, cx, t.type === 'lightpole' ? 8.6 : t.type === 'tree' ? 4.6 : 3.3, cz + 0.4);
  });
  kid(slotPos.bench[0] + 1.3, slotPos.bench[1] + 0.8, -0.4, 0);
  kid(slotPos.vending[0] + 1.1, slotPos.vending[1] + 1.0, -0.3, 1);
  kid(slotPos.railing[0] + 0.5, slotPos.railing[1] + 0.9, 0.2, 0);
  kid(slotPos.lightpole[0] + 0.9, slotPos.lightpole[1] + 0.8, -0.5, 1);
}

const rowZ = {};
function variants() {
  const types = PROP_TYPES.filter((t) => t.variants > 1);
  types.forEach((t, row) => {
    const z = (row - types.length / 2) * 4.2;
    rowZ[t.type] = z;
    label(t.type, '', -12.5, 1.2, z);
    for (let v = 0; v < t.variants; v++) {
      const x = -8 + v * 5;
      if (t.type === 'acunit' && v === 0) { blk(x - 1, 0, z - 0.6, x + 1, 2.4, z - 0.3, '#ece7f3'); put(t.type, { pos: [x, 1.2, z - 0.3], variant: v }); }
      else if (t.type === 'neon') { blk(x - 1, 0, z - 0.6, x + 1, 2.4, z - 0.3, '#ece7f3'); put(t.type, { pos: [x, 0.9, z - 0.3], variant: v }); }
      else if (t.type === 'fence') put(t.type, { pos: [x - 2, 0, z], variant: v, length: 4 });
      else put(t.type, { pos: [x, 0, z], variant: v });
      label('v' + v, `${kit.lastTris}`, x, 2.4, z + 0.5);
    }
  });
}

// A plaza corner of a harbor arena: two building walls, a raised stage platform, a container yard corner, plaza furniture.
function street() {
  const WALL = '#ece7f3', WALL2 = '#f3e9da', PLAT = '#b7ade3';
  blk(-11, 0, -7, 11, 5, -6, WALL);          // wall A (face z = -6)
  blk(-11, 0, -7, -10, 5, 7, WALL2);         // wall B (face x = -10)
  blk(3, 0, -6, 11, 1.2, 0, PLAT);           // stage platform
  blk(3.4, 0, 0, 5.2, 0.6, 1.1, '#cfc8ee');  // step
  blk(6, 0, 1.2, 8.44, 2.59, 7.26, '#d77c67'); // shipping container (door end faces +Z at z = 7.26)
  blk(-4.9, 0, -6.02, -3.5, 2.3, -5.9, '#8e86b8'); // shop door under the neon
  // wall A dressing
  put('vending', { pos: [-7.8, 0, -5.55], variant: 0 });
  put('vending', { pos: [-6.6, 0, -5.55], variant: 1 });
  put('awning', { pos: [-7.2, 2.75, -6], width: 2.8, color: 'teal' });
  put('trashbin', { pos: [-5.5, 0, -5.55] });
  put('neon', { pos: [-4.2, 2.6, -6], variant: 0 });
  put('bench', { pos: [-2.1, 0, -5.45], length: 2.0 });
  put('bush', { pos: [-0.5, 0, -5.4], seed: 2 });
  put('planter', { pos: [1.3, 0, -5.45], length: 1.9 });
  put('neon', { pos: [-1.1, 2.7, -6], variant: 2 });
  put('acunit', { pos: [0.9, 2.9, -6] });
  put('ladder', { pos: [2.5, 0, -6], height: 4.5 });
  put('acunit', { pos: [6.2, 3.1, -6] });
  put('acunit', { pos: [4.6, 5, -6.5], variant: 1 });
  put('vent', { pos: [-3.5, 5, -6.5], variant: 1 });
  put('vent', { pos: [-1.8, 5, -6.5], variant: 0 });
  put('vent', { pos: [8.5, 5, -6.5], variant: 3 });
  // wall B dressing (faces +X)
  put('pipes', { pos: [-10, 0, 5.5], rotY: Math.PI / 2, length: 6.5, count: 3 });
  put('sign', { pos: [-10, 3.0, -3.3], rotY: Math.PI / 2, variant: 2, wall: true, width: 3.2, height: 1.5 });
  put('trashbin', { pos: [-9.4, 0, -4.8], variant: 1, rotY: Math.PI / 2 });
  put('planter', { pos: [-9.4, 0, -2.2], rotY: Math.PI / 2, variant: 1, length: 1.6 });
  // stage platform (y = 1.2)
  put('railing', { pos: [3.1, 1.2, -0.1], length: 7.8 });
  put('railing', { pos: [3.1, 1.2, -5.9], rotY: -Math.PI / 2, length: 4.4 });
  put('speaker', { pos: [9.6, 1.2, -1.5], rotY: -0.5 });
  put('speaker', { pos: [4.3, 1.2, -4.9], rotY: 0.35 });
  put('sign', { pos: [7.2, 1.2, -5.2], variant: 1, width: 3.2, height: 1.5 });
  put('banner', { pos: [3.6, 1.2, -0.6], team: 1 });
  put('banner', { pos: [9.9, 1.2, -0.6], team: 1, rotY: Math.PI });
  put('lightpole', { pos: [10.2, 1.2, -5.2], height: 7 });
  put('crates', { pos: [6.8, 1.2, -4.9], variant: 1 });
  // plaza floor
  put('tree', { pos: [0.4, 0, -1.8] });
  put('bench', { pos: [0.4, 0, 0.1], variant: 1, rotY: Math.PI, length: 1.8 });
  put('tree', { pos: [-8.6, 0, 1.2], variant: 1 });
  put('planter', { pos: [-8.6, 0, 1.2], variant: 0, length: 1.2, width: 1.2, height: 0.45 });
  put('skateramp', { pos: [-5.3, 0, -0.6], variant: 0, width: 2.6 });
  put('skateramp', { pos: [-2.4, 0, 1.6], variant: 2, width: 2.2, rotY: 0.2 });
  put('bunting', { pos: [-9.3, 0, 2.6], length: 9.6, height: 3.6, team: 0 });
  put('bunting', { pos: [-10, 0, -1.6], rotY: 0.6435, length: 5.6, height: 4.3, posts: false });
  put('banner', { pos: [-9.3, 0, 3.8], team: 0 });
  put('lightpole', { pos: [-7.4, 0, 6.6], height: 7.5, variant: 1 });
  for (let i = 0; i < 5; i++) put('bollard', { pos: [-5.2 + i * 1.6, 0, 6.2] });
  put('barrier', { pos: [-3.3, 0, 4.0], rotY: 0.15 });
  put('barrier', { pos: [-1.5, 0, 4.25], rotY: 0.15, color: 'offwhite' });
  put('cone', { pos: [0.3, 0, 4.1] });
  put('cone', { pos: [0.9, 0, 4.6] });
  put('sign', { pos: [1.6, 0, 1.9], variant: 0, rotY: -0.35, width: 2.6, height: 1.3 });
  // container yard corner
  put('container_door', { pos: [7.22, 0, 7.26] });
  put('crates', { pos: [4.6, 0, 5.9], variant: 0, rotY: 0.25 });
  put('crates', { pos: [4.7, 0, 3.7], variant: 2, rotY: -0.3 });
  put('barrel', { pos: [5.2, 0, 2.35], variant: 0 });
  put('barrel', { pos: [9.4, 0, 2.3], variant: 1, rotY: 2.2, color: 'mustard' });
  put('pallet', { pos: [9.7, 0, 5.0], variant: 2, rotY: 0.1 });
  put('tires', { pos: [3.6, 0, 7.2], variant: 1 });
  put('fence', { pos: [11, 0, 8.2], rotY: Math.PI / 2, length: 7.4 });
  put('buoy', { pos: [-6.4, 0, 8.6], variant: 1 });
  put('lifering', { pos: [-8.6, 0, 8.4], rotY: -0.4 });
  put('bollard', { pos: [1.4, 0, 8.4], variant: 2 });
  put('buoy', { pos: [2.6, 0, 7.4], variant: 0, color: 'mustard' });
  kid(-3.4, -4.2, 0.4, 0);
  kid(-0.8, 2.9, 2.6, 1);
  kid(6.0, -2.6, -0.6, 1, 1.2);
}

// A harbor market street built from the street-level kit (posters, stalls, carts, bikes, signage, string lights…)
function market() {
  const WALL = '#efe6d6', WALL2 = '#e3ecef';
  blk(-12, 0, -7, 12, 4.2, -6, WALL);            // shop wall (face z = -6)
  blk(12, 0, -7, 13, 4.2, 8, WALL2);             // side wall (face x = 12)
  blk(-12, -1.2, 8.5, 13, 0, 9.3, '#bfc6cb');     // quay edge strip
  put('poster', { pos: [-9.5, 1.55, -6], count: 5, variant: 0 });
  put('poster', { pos: [-3.2, 1.7, -6], variant: 12 });
  put('stickers', { pos: [-5.6, 1.1, -6], count: 12, width: 1.4, height: 0.9 });
  put('streetsign', { pos: [0.4, 1.9, -6], variant: 3, wall: true });
  put('hosereel', { pos: [1.5, 1.2, -6] });
  put('cabinet', { pos: [3.2, 0, -5.7] });
  put('cabinet', { pos: [5.0, 1.5, -6], variant: 1 });
  put('cable', { pos: [4.4, 0, -6], variant: 1, length: 6.5, height: 3.6 });
  put('newsbox', { pos: [7.2, 0, -5.55], variant: 1 });
  put('newsbox', { pos: [9.2, 0, -5.5], variant: 2 });
  put('hydrant', { pos: [10.6, 0, -5.4] });
  put('gascage', { pos: [11.2, 0, 0.2], rotY: -Math.PI / 2 });
  put('hydrant', { pos: [12, 1.1, 3.4], rotY: -Math.PI / 2, variant: 1 });
  put('ferryboard', { pos: [12, 1.9, 5.8], rotY: -Math.PI / 2, wall: true });
  put('pot', { pos: [12, 2.6, -2.6], rotY: -Math.PI / 2, variant: 2 });
  put('pot', { pos: [10.9, 0, -3.8], variant: 1 });
  // market row
  put('stall', { pos: [-7.8, 0, -3.4], variant: 0 });
  put('stall', { pos: [-4.6, 0, -3.4], variant: 1 });
  put('stall', { pos: [-1.4, 0, -3.4], variant: 2 });
  put('stringlights', { pos: [-10, 0, -1.6], length: 11, height: 3.3, posts: true });
  put('cart', { pos: [3.5, 0, -1.8], variant: 0, rotY: 0.2 });
  put('cart', { pos: [7.3, 0, -1.6], variant: 1, rotY: -0.25 });
  put('aboard', { pos: [5.4, 0, 0.6], variant: 1, rotY: 0.4 });
  put('picnic', { pos: [-6.5, 0, 2.2], variant: 0 });
  put('picnic', { pos: [-2.4, 0, 2.4], variant: 1, rotY: 0.2 });
  put('deckchair', { pos: [1.6, 0, 3.6], variant: 1, rotY: Math.PI });
  put('cooler', { pos: [3.2, 0, 3.8], variant: 0, rotY: 0.3 });
  put('cooler', { pos: [9.6, 0, 1.4], variant: 1, rotY: -Math.PI / 2 });
  put('fingerpost', { pos: [0.2, 0, 0.8], variant: 1, count: 4 });
  put('streetsign', { pos: [-10.8, 0, 4.2], variant: 6 });
  put('streetsign', { pos: [-9.6, 0, 7.8], variant: 0 });
  // bikes, skate, surf
  put('bikerack', { pos: [-11, 0, 5.8], count: 4, bikes: 3 });
  put('bike', { pos: [-6.4, 0, 7.4], rotY: 0.3, variant: 1 });
  put('scooter', { pos: [-4.8, 0, 7.6], variant: 1, rotY: -0.3 });
  put('scooter', { pos: [-3.3, 0, 7.4], variant: 0, rotY: 0.6 });
  put('skateboard', { pos: [-2.2, 0, 6.2], variant: 0, rotY: 0.8 });
  put('skateboard', { pos: [-1.1, 0, -5.75], variant: 1 });
  put('skaterail', { pos: [0.2, 0, 5.2], rotY: -0.1 });
  put('surfrack', { pos: [4.2, 0, 7.4], rotY: Math.PI, count: 4 });
  put('surfrack', { pos: [11.6, 0, 6.8], rotY: -Math.PI / 2, variant: 1 });
  // quay clutter
  put('ropecoil', { pos: [6.8, 0, 7.8], variant: 1 });
  put('crabtrap', { pos: [8.8, 0, 7.4], variant: 1, rotY: 0.2 });
  put('net', { pos: [-1.4, 0, 8.3] });
  put('palletjack', { pos: [10.2, 0, 4.6], rotY: 2.4 });
  put('sandbags', { pos: [7.4, 0, 5.4], length: 3, height: 2 });
  put('dish', { pos: [-8, 4.2, -6.6] });
  put('dish', { pos: [8, 4.2, -6.6], variant: 1 });
  kid(-4.2, -1.2, 0.3, 0);
  kid(1.2, 1.8, 2.8, 1);
  kid(6.2, 2.4, -0.4, 0);
}

const PRESETS = { showroom, street, variants, market };
let current = null;
function preset(name) {
  if (!PRESETS[name]) return 'unknown preset';
  kit.dispose();
  world.traverse((o) => { if (o.isCSS2DObject) o.element.remove(); });
  world.clear(); kids.length = 0; colliders.length = 0;
  kit = new PropKit(scene, { castShadow: true, quality: params.get('q') || 'high' });
  lab.kit = kit;
  PRESETS[name]();
  kit.build();
  current = name;
  ui.presets.forEach((b) => b.classList.toggle('on', b.dataset.k === name));
  cam(name === 'street' ? 'street' : name === 'market' ? 'market' : name);
  refreshStats();
  return kit.stats();
}

// ------------------------------------------------------------------ cameras
const CAMS = {
  showroom: { p: [0, 15.5, 30], t: [0, 0.2, -2], fov: 55 },
  showroom_eye: { p: [0, 1.7, 21], t: [0, 1.3, 4], fov: 62 },
  variants: { p: [0, 32, 34], t: [0, 0, 0], fov: 42 },
  street: { p: [-1.2, 1.7, 11.8], t: [-1.2, 1.6, -4], fov: 62 },
  street_over: { p: [15, 13, 19], t: [-1, 0.8, -0.5], fov: 45 },
  street_wall: { p: [-3.5, 1.7, 1.5], t: [-7, 1.8, -6], fov: 62 },
  street_yard: { p: [0.5, 1.7, 4.5], t: [7.5, 1.2, 5], fov: 62 },
  street_stage: { p: [4.6, 2.9, 0.9], t: [7.6, 1.7, -3.6], fov: 62 },
  street_pipes: { p: [-4.5, 1.7, 3.5], t: [-10, 1.8, 0.5], fov: 62 },
  market: { p: [0.5, 2.4, 15.5], t: [0.2, 1.3, -1], fov: 62 },
  market_over: { p: [14, 12, 17], t: [0, 0.8, 0], fov: 50 },
  market_wall: { p: [-4.5, 1.7, 1.2], t: [-6.5, 1.6, -6], fov: 60 },
  market_stalls: { p: [-3.5, 1.8, 3.2], t: [-4.6, 1.4, -3.4], fov: 60 },
  market_carts: { p: [4.8, 1.8, 3.4], t: [5.4, 1.1, -1.5], fov: 58 },
  market_bikes: { p: [-5.2, 1.5, 3.4], t: [-8, 0.6, 7], fov: 58 },
  market_quay: { p: [3.6, 1.7, 2.6], t: [7.4, 0.8, 7.2], fov: 58 },
  market_side: { p: [6.2, 1.8, 1.6], t: [12, 1.6, 2.4], fov: 60 },
};
function cam(name) {
  // camera names imply their preset, so lab.cam('street') works from any state
  const need = !name ? null : name.startsWith('street') ? 'street' : name.startsWith('market') ? 'market' : name.startsWith('var') ? 'variants' : (name.startsWith('showroom') || name.startsWith('prop:')) ? 'showroom' : null;
  if (need && need !== current) { preset(need); }
  let c = CAMS[name];
  if (!c && name && name.startsWith('prop:')) {
    const t = name.slice(5), sp = slotPos[t];
    if (!sp) return 'no slot';
    const big = { lightpole: 2.6, tree: 1.7, bunting: 1.6, container_door: 1.5, pipes: 1.5, sign: 1.6, fence: 1.5, railing: 1.3, awning: 1.2, ladder: 1.4, banner: 1.4, skateramp: 1.2, cone: 0.6, bollard: 0.6, trashbin: 0.7, barrel: 0.75, tires: 0.75, bush: 0.8, lifering: 0.9, buoy: 0.85, vent: 0.8, crates: 0.85 }[t] || 1;
    const ty = { lightpole: 3.4, tree: 2.1, neon: 1.8, awning: 2.2, acunit: 1.6, ladder: 1.8, container_door: 1.3, sign: 2.0, banner: 1.9, bunting: 2.2, speaker: 1.0 }[t] ?? 0.55;
    c = { p: [sp[0] + 1.8 * big, 1.3 + 0.9 * big, sp[1] + 3.3 * big], t: [sp[0], ty, sp[1] - (WALL_TYPES.has(t) ? 1.2 : 0)], fov: 50 };
  }
  if (!c && name && name.startsWith('var:')) {
    const z = rowZ[name.slice(4)];
    if (z == null) return 'no row';
    c = { p: [-0.5, 4.2, z + 9.5], t: [-0.5, 0.6, z - 1.6], fov: 55 };
  }
  if (!c) return 'unknown cam';
  camera.position.set(...c.p); controls.target.set(...c.t); camera.fov = c.fov; camera.updateProjectionMatrix(); controls.update();
  ui.cams.forEach((b) => b.classList.toggle('on', b.dataset.k === name));
  render(0);
  return name;
}

// ------------------------------------------------------------------ stats
function measure(hideProps) {
  const rt = new THREE.WebGLRenderTarget(64, 64);
  kit.group.visible = !hideProps;
  renderer.setRenderTarget(rt); renderer.info.reset(); renderer.render(scene, camera);
  const r = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
  renderer.setRenderTarget(null); rt.dispose(); kit.group.visible = true;
  return r;
}
function stats() {
  const all = measure(false), none = measure(true), k = kit.stats();
  return { preset: current, props: k.props, propMeshes: k.meshes, merged: k.merged, instanced: k.instanced, propTriangles: k.triangles, propDrawCallsInclShadow: all.calls - none.calls, sceneCalls: all.calls, colliders: colliders.length };
}
function tris() { const o = {}; for (const t of PROP_TYPES) { o[t.type] = []; for (let v = 0; v < t.variants; v++) o[t.type].push(PropKit.triangles(t.type, { variant: v })); } return o; }
function refreshStats() { const s = stats(); ui.stats.textContent = Object.entries(s).map(([k, v]) => `${k.padEnd(24)} ${v}`).join('\n'); }

// ------------------------------------------------------------------ UI
const ui = { presets: [], cams: [], stats: document.getElementById('stats') };
for (const k of Object.keys(PRESETS)) { const b = document.createElement('button'); b.textContent = k; b.dataset.k = k; b.onclick = () => preset(k); document.getElementById('presets').append(b); ui.presets.push(b); }
for (const k of Object.keys(CAMS)) { const b = document.createElement('button'); b.textContent = k; b.dataset.k = k; b.onclick = () => cam(k); document.getElementById('cams').append(b); ui.cams.push(b); }
for (const [a, b2, n] of [['#ff8a14', '#2f5bff', 'orange/blue'], ['#ff3f9e', '#18d48c', 'pink/mint'], ['#f2e312', '#8a3cff', 'lemon/grape']]) { const b = document.createElement('button'); b.textContent = n; b.onclick = () => kit.setTeamColors(new THREE.Color(a), new THREE.Color(b2)); document.getElementById('teams').append(b); }
addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') document.getElementById('panel').classList.toggle('hidden');
  if (e.key === 'l' || e.key === 'L') { const el = document.getElementById('labels'); el.style.display = el.style.display === 'none' ? '' : 'none'; }
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); labelRenderer.setSize(innerWidth, innerHeight);
});

// ------------------------------------------------------------------ loop
const clock = new THREE.Timer();
let T = 0;
function render(dt) {
  S.time = T;
  kit.update(dt, T);
  for (const k of kids) k.c?.update(dt, S);
  controls.update();
  composer.render();
  labelRenderer.render(scene, camera);
}
function loop(ts) { clock.update(ts); const dt = Math.min(clock.getDelta(), 0.05); T += dt; render(dt); requestAnimationFrame(loop); }

const lab = { preset, cam, stats, tris, scene, renderer, camera, get kit() { return kit; }, set kit(v) {}, colliders, setTeams: (a, b) => kit.setTeamColors(new THREE.Color(a), new THREE.Color(b)), hideUI: () => { document.getElementById('panel').classList.add('hidden'); } };
window.lab = lab;
if (params.has('noui')) lab.hideUI();
if (params.has('nolabels')) document.getElementById('labels').style.display = 'none';
preset(params.get('preset') || 'showroom');
if (params.get('cam')) cam(params.get('cam'));
loop();
