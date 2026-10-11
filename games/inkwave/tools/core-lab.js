import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Renderer } from '../src/core/renderer.js';
import { Level } from '../src/world/level.js';
import { MAP_LAYOUTS } from '../src/world/maps.js';
import { PaintSystem } from '../src/world/paint.js';
import { createLevelMaterial } from '../src/world/levelMaterial.js';
import { Physics } from '../src/game/physics.js';
import { DEFAULT_SETTINGS } from '../src/config.js';

const settings = { ...DEFAULT_SETTINGS };
const R = new Renderer(document.getElementById('app'), settings);
const renderer = R.renderer;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9fd8f0');
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 600);
camera.position.set(30, 30, -60);
R.setScene(scene, camera);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;
const sun = new THREE.DirectionalLight(0xfff3e0, 2.6);
sun.position.set(-30, 50, -20); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 160 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xcfeaff, 0x9a8f7a, 0.9));

const t0 = performance.now();
const level = new Level(MAP_LAYOUTS.tidewater);
const paint = new PaintSystem(renderer, level, { atlasSize: 4096 });
const mat = createLevelMaterial(paint.texture, paint.size);
const mesh = new THREE.Mesh(level.buildGeometry(paint.size), mat);
mesh.castShadow = mesh.receiveShadow = true;
scene.add(mesh);
const physics = new Physics(level);
const buildMs = performance.now() - t0;
const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: '#2a8fb8', roughness: 0.2 }));
water.rotation.x = -Math.PI / 2; water.position.y = -1.6; scene.add(water);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

const rnd = (a, b) => a + Math.random() * (b - a);
const hit = { };
function randomSplats(n, team) {
  const dir = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const o = new THREE.Vector3(rnd(-24, 24), rnd(3, 9), rnd(-43, 43));
    dir.set(rnd(-1, 1), rnd(-1, -0.2), rnd(-1, 1)).normalize();
    const h = physics.raycast(o, dir, 40);
    if (h.hit) {
      const p = h.point.clone().addScaledVector(h.normal, 0.1);
      paint.splat(p, rnd(0.6, 1.6), team ?? (Math.random() < 0.5 ? 0 : 1), { stretch: dir, stretchAmt: 0.6 });
    }
  }
}
window.lab = {
  splats(n = 200, team) { randomSplats(n, team); return paint.coverage(); },
  cam(x, y, z, tx = 0, ty = 0, tz = 0) { camera.position.set(x, y, z); controls.target.set(tx, ty, tz); controls.update(); },
  info() { return { faces: level.faces.length, paintFaces: paint.paintFaces.length, ppm: paint.ppm, usedH: paint.usedHeight, turfArea: paint.turfArea, cells: paint.grid.length, buildMs, calls: renderer.info.render.calls, tris: renderer.info.render.triangles }; },
  paint, level, physics, THREE, scene, camera, R, sun,
};
function loop() {
  requestAnimationFrame(loop);
  controls.update();
  paint.flush();
  mat.userData.uniforms.uTime.value = performance.now() / 1000;
  R.render();
  document.getElementById('info').textContent = JSON.stringify(lab.info());
}
loop();
