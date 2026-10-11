// 肉包 meat buns: DW's healing drop, in story and free mode.
// Sim (game.pickups = createPickups(game), reset() per battle, step() after the actors): a bun drops where every enemy
// officer falls (ko.officer), where a beaten hero-model foe falls or breaks off (actor:down / actor:retreat beaten), and at
// every PICKUP.every-th grunt KO; at most PICKUP.max on the field (a new one pushes out the oldest). It lies PICKUP.life
// frames; the hero takes it by walking over it (within PICKUP.r, on the ground, alive) — only while he is hurt, so a bun
// waits for when he needs it — and heals officer ? PICKUP.big : PICKUP.small of his max HP × game.diff.heal. Driven by
// sim events only (no rng): deterministic. Emits pickup {x, z, heal}.
// View (createPickupsView(scene, game), render-only): a voxel bun on a leaf plate, bobbing and turning over a gold ground
// ring, blinking through its last PICKUP.blink frames; instanced (the meshes stay in the scene: warm-up compiles them).
import * as THREE from 'three';
import { on, emit } from '../core/events.js';
import { boxesGeometry } from '../core/voxel.js';
import { ground } from '../world/map.js';

export const PICKUP = { every: 40, max: 12, life: 1800, blink: 180, r: 1.1, small: 0.15, big: 0.3 };

export function createPickups(game) {
  const P = { list: [] };                                    // { x, z, big, t }
  let grunts = 0;
  const drop = (x, z, big) => {
    if (P.list.length >= PICKUP.max) P.list.shift();
    P.list.push({ x, z, big, t: 0 });
  };
  on('ko', (e) => { if (e.officer || ++grunts % PICKUP.every === 0) drop(e.x, e.z, e.officer); });   // (sim-side: fired inside step())
  on('actor:down', (e) => drop(e.x, e.z, true));
  on('actor:retreat', (e) => { if (e.beaten) drop(e.x, e.z, true); });
  P.reset = () => { P.list.length = 0; grunts = 0; };
  P.step = () => {
    const h = game.hero;
    for (let i = P.list.length - 1; i >= 0; i--) {
      const b = P.list[i];
      if (++b.t > PICKUP.life) { P.list.splice(i, 1); continue; }
      if (h.dead || h.y > 1 || h.hp >= h.hpMax || (h.x - b.x) ** 2 + (h.z - b.z) ** 2 > PICKUP.r * PICKUP.r) continue;
      const heal = Math.round((b.big ? PICKUP.big : PICKUP.small) * game.diff.heal * h.hpMax);
      h.hp = Math.min(h.hpMax, h.hp + heal);
      P.list.splice(i, 1);
      emit('pickup', { x: b.x, z: b.z, heal });
    }
  };
  return P;
}

export function createPickupsView(scene, game) {
  const W = 0xf4ecdc, S = 0xd9ccb4;                          // dough, its shaded pleats
  const bun = boxesGeometry([
    { s: [0.66, 0.05, 0.66], p: [0, 0.025, 0], c: 0x4f7a34 }, { s: [0.5, 0.05, 0.74], p: [0, 0.03, 0], c: 0x5e8a3c },   // leaf plate
    { s: [0.5, 0.16, 0.5], p: [0, 0.13, 0], c: W }, { s: [0.58, 0.1, 0.4], p: [0, 0.11, 0], c: S }, { s: [0.4, 0.1, 0.58], p: [0, 0.11, 0], c: S },
    { s: [0.38, 0.1, 0.38], p: [0, 0.25, 0], c: W }, { s: [0.22, 0.07, 0.22], p: [0, 0.33, 0], c: S },
    { s: [0.08, 0.03, 0.08], p: [0, 0.38, 0], c: 0xc8281c },                                                         // red dot
  ]);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true, emissive: 0xffe6b0, emissiveIntensity: 0.35 });
  const buns = new THREE.InstancedMesh(bun, mat, PICKUP.max);
  const rings = new THREE.InstancedMesh(new THREE.RingGeometry(0.5, 0.78, 28).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.05, 0.35), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), PICKUP.max);
  const root = new THREE.Group();                            // main.js hides it on title / select
  scene.add(root);
  for (const m of [buns, rings]) { m.frustumCulled = false; m.count = 0; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); root.add(m); }
  buns.castShadow = true;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  return {
    root,
    update() {
      let n = 0;
      const f = game.frame;
      for (const b of game.pickups.list) {
        const left = PICKUP.life - b.t;
        if (left < PICKUP.blink && (f >> 3) % 2) continue;       // last 3 s: blinks
        const gy = ground(b.x, b.z), k = b.big ? 1.45 : 1.25;
        _q.setFromAxisAngle(UP, f * 0.03 + b.x);
        buns.setMatrixAt(n, _m.compose(_p.set(b.x, gy + 0.18 + 0.08 * Math.sin(f * 0.08 + b.z), b.z), _q, _s.setScalar(k)));
        rings.setMatrixAt(n, _m.compose(_p.set(b.x, gy + 0.05, b.z), _q.identity(), _s.setScalar(k * (1 + 0.08 * Math.sin(f * 0.12)))));
        n++;
      }
      buns.count = rings.count = n;
      buns.instanceMatrix.needsUpdate = rings.instanceMatrix.needsUpdate = true;
    },
  };
}
