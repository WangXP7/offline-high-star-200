// INKWAVE character lab — preview + deterministic capture harness for src/game/character.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Character, SKIN_TONES, OUTFITS } from '../src/game/character.js';
import { countTriangles } from '../src/game/character-geo.js';
import { TEAM_PALETTES, PLAYER, WEAPON_ORDER } from '../src/config.js';
import { G } from '../src/core/ctx.js';

const params = new URLSearchParams(location.search);
if (params.get('ui') === '0') document.body.classList.add('hide');

// ---------------------------------------------------------------- renderer / scene
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.05, 200);
camera.position.set(1.6, 1.3, 2.6);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.75, 0); controls.enableDamping = true; controls.update();

// sky: gradient dome + sun (also PMREM'd for reflections, like the game's environment)
function makeSky() {
  const g = new THREE.SphereGeometry(80, 48, 24);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color('#5fa8ff') }, hor: { value: new THREE.Color('#dff1ff') }, bot: { value: new THREE.Color('#e9e2d6') }, sun: { value: new THREE.Vector3(0.45, 0.8, 0.35).normalize() } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sun; varying vec3 vD;
      void main(){ float y = vD.y; vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0), 0.6)) : mix(hor, bot, clamp(-y*3.0,0.0,1.0));
        float s = max(dot(vD, sun), 0.0); c += vec3(1.0,0.95,0.85) * (pow(s, 900.0) * 30.0 + pow(s, 12.0) * 0.25);
        // a couple of soft cloud bands for reflection interest
        float cl = smoothstep(0.55, 0.9, sin(vD.x * 6.0 + sin(vD.z * 4.0)) * 0.5 + 0.5) * smoothstep(0.05, 0.25, y) * smoothstep(0.6, 0.3, y);
        c = mix(c, vec3(1.0), cl * 0.55);
        gl_FragColor = vec4(c, 1.0); }`,
  });
  return new THREE.Mesh(g, m);
}
const sky = makeSky(); scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);
{
  const envScene = new THREE.Scene(); envScene.add(makeSky());
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
}

const hemi = new THREE.HemisphereLight('#d6e8ff', '#bfae90', 0.75); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e2', 2.2);
sun.position.set(4.5, 8, 3.5); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
const sc = sun.shadow.camera; sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 0.5; sc.far = 30;
scene.add(sun); scene.add(sun.target);

// concrete ground with 1 m tile seams (canvas texture)
function concreteTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#d9d6cf'; x.fillRect(0, 0, 512, 512);
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { const g = 190 + r() * 45 | 0; x.fillStyle = `rgba(${g},${g - 3},${g - 8},0.35)`; x.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2); }
  x.strokeStyle = 'rgba(120,115,105,0.45)'; x.lineWidth = 3; x.strokeRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.repeat.set(40, 40);
  return t;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: concreteTex(), roughness: 0.92, color: '#ffffff' }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

// ink puddle (swim context) + wall (climb context)
const puddleMat = new THREE.MeshPhysicalMaterial({ color: '#ff8a14', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 });
const puddle = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), puddleMat); puddle.rotation.x = -Math.PI / 2; puddle.position.y = 0.002; puddle.receiveShadow = true; puddle.visible = false; scene.add(puddle);
const wall = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.3), new THREE.MeshStandardMaterial({ color: '#e7e1d6', roughness: 0.85 }));
wall.position.set(0, 1.5, PLAYER.radius + 0.15); wall.castShadow = true; wall.receiveShadow = true; wall.visible = false; scene.add(wall);
const wallInk = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), puddleMat); wallInk.position.set(0, 1.2, PLAYER.radius - 0.002); wallInk.rotation.y = Math.PI; wallInk.visible = false; scene.add(wallInk);

// ---------------------------------------------------------------- terrain (foot-IK tests) + physics stub
// The character raycasts the ground through G.physics exactly like in-game (G.scene must be its parent scene).
const TERRAINS = ['flat', 'ramp', 'stairs', 'box', 'slope'];
const terrainMat = new THREE.MeshStandardMaterial({ color: '#d8d2c6', roughness: 0.85 });
const terrainGroup = new THREE.Group(); scene.add(terrainGroup);
function terrainH(x, z, name) {
  const T = name ?? L.terrain;
  if (T === 'ramp') { if (Math.abs(x) > 1.6 || z < 2) return 0; if (z < 5) return (z - 2) / 3 * 0.6; if (z < 7) return 0.6; if (z < 10) return 0.6 * (1 - (z - 7) / 3); return 0; }
  if (T === 'stairs') {
    if (Math.abs(x) > 1.6 || z < 2) return 0;
    if (z < 4) return 0.17 * (Math.floor((z - 2) / 0.4) + 1);
    if (z < 5.6) return 0.85;
    if (z < 7.6) return 0.17 * (4 - Math.floor((z - 5.6) / 0.4));
    return 0;
  }
  if (T === 'box') return Math.abs(x) < 1.2 && z > 2.5 && z < 4.5 ? 0.3 : 0;
  if (T === 'slope') return Math.abs(x) < 1.6 && z > 1.5 && z < 9 ? 0.3 + 0.2 * x : 0;
  return 0;
}
function buildTerrain() {
  for (const c of [...terrainGroup.children]) { terrainGroup.remove(c); c.geometry.dispose(); }
  if (L.terrain === 'flat') return;
  // sample the height field into a coarse mesh (steps get vertical risers from the sharp sampling)
  const x0 = -1.6, x1 = 1.6, z0 = 1.4, z1 = 10.2, nx = 32, nz = 352;
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const pa = g.attributes.position;
  for (let i = 0; i < pa.count; i++) pa.setY(i, terrainH(pa.getX(i), pa.getZ(i)) + 0.001);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, terrainMat); m.receiveShadow = true; m.castShadow = true; terrainGroup.add(m);
}
const labPhys = {
  raycast(o, d, maxDist, out) {
    out.hit = false; out.dist = maxDist;
    if (d.y > -0.9) return out;
    const h = terrainH(o.x, o.z);
    if (h > o.y || o.y - h > maxDist) return out;
    out.hit = true; out.dist = o.y - h; out.point.set(o.x, h, o.z);
    const e = 0.004, hx = terrainH(o.x + e, o.z) - terrainH(o.x - e, o.z), hz = terrainH(o.x, o.z + e) - terrainH(o.x, o.z - e);
    out.normal.set(-hx / (2 * e), 1, -hz / (2 * e)).normalize();
    if (out.normal.y < 0.5) out.normal.set(0, 1, 0); // stair riser edge: treat the tread as flat
    out.face = -1; out.block = -1; out.u = 0; out.v = 0;
    return out;
  },
};
G.scene = scene; G.physics = labPhys; G.actors = [];

// post: bloom (threshold ~0.9 like the game)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.4, 1.25);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- characters
const muzzleDot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), new THREE.MeshBasicMaterial({ color: '#ff0044', depthTest: false }));
muzzleDot.renderOrder = 10; muzzleDot.visible = params.get('muzzle') === '1'; scene.add(muzzleDot);

const L = {
  palette: +(params.get('pal') ?? 0), side: 'a',
  style: { hair: 0, skin: 0, outfit: 0, eyes: 0 }, weapon: 'shooter',
  loco: 'idle', dance: null, hurt: 0, lineup: false, frozen: false, circle: false, isLocal: true,
  terrain: 'flat', travel: false, follow: false, lod: params.get('lod') || null,
};
// the lab plays the actor's WeaponRunner for the new kinds (splatling spin-up/stream, dualies hands + dodge lock)
const RUN = { charging: false, charge: 0, streaming: false, burstFrac: 0, lockT: 0, dodge: null, rollsLeft: 2, hand: 1, sinceHand: [99, 99] };
const S = { time: 0, speed: 0, localMove: { x: 0, z: 0 }, grounded: true, vy: 0, aimPitch: 0, firing: false, charge: 0, rolling: false, form: 'kid', wallNormal: new THREE.Vector3(0, 0, -1), ink: 0.8, lowInk: false, special: 0, invuln: false, runner: RUN };
const DG = { t: -1, x: 0, z: 1, dur: 0.3, dist: 2.8, done: 0 };
let hero = null; let crowd = [];
let labT = 0; let jumpT = -1; let chargeRamp = false; let autoFire = false; let fireTimer = 0;

function teamColor(side = L.side, pal = L.palette) { const p = TEAM_PALETTES[pal % TEAM_PALETTES.length]; return side === 'a' ? p.a : p.b; }
function enemyColor() { return teamColor(L.side === 'a' ? 'b' : 'a'); }

function makeHero() {
  if (hero) hero.dispose();
  hero = new Character({ color: teamColor(), weapon: L.weapon, style: { ...L.style }, name: 'Lab', isLocal: L.isLocal });
  scene.add(hero.root);
  hero.setDance(L.dance);
  hero.setHurt(L.hurt, enemyColor());
  if (L.lod) hero.setLod(L.lod);
  puddleMat.color.set(teamColor());
}

const LINEUP = [
  { name: 'Squiddo', side: 'a', weapon: 'shooter', style: { hair: 0, skin: 0, outfit: 0, eyes: 0, hat: 0, brows: 0 }, pose: 'lobby_pose' },
  { name: 'Marlo', side: 'a', weapon: 'roller', style: { hair: 1, skin: 2, outfit: 1, eyes: 1, hat: 1, brows: 1 }, pose: 'menu_idle' },
  { name: 'Pip', side: 'a', weapon: 'charger', style: { hair: 2, skin: 4, outfit: 4, eyes: 2, hat: 0, brows: 2 }, pose: 'aim' },
  { name: 'Coral', side: 'a', weapon: 'blaster', style: { hair: 3, skin: 3, outfit: 3, eyes: 3, hat: 2, brows: 3 }, pose: 'victory' },
  { name: 'Nori', side: 'b', weapon: 'dualies', style: { hair: 4, skin: 6, outfit: 5, eyes: 4, hat: 0, brows: 1 }, pose: 'lobby_pose' },
  { name: 'Riptide', side: 'b', weapon: 'splatling', style: { hair: 5, skin: 1, outfit: 6, eyes: 5, hat: 3, brows: 0 }, pose: 'aim' },
  { name: 'Suki', side: 'b', weapon: 'slosher', style: { hair: 6, skin: 8, outfit: 7, eyes: 6, hat: 0, brows: 2 }, pose: 'menu_idle' },
  { name: 'Kelp', side: 'b', weapon: 'roller', style: { hair: 7, skin: 5, outfit: 8, eyes: 7, hat: 0, brows: 3 }, pose: 'idle' },
];
function makeCrowd() {
  for (const c of crowd) c.ch.dispose();
  crowd = [];
  if (!L.lineup) return;
  LINEUP.forEach((d, i) => {
    const ch = new Character({ color: teamColor(d.side), weapon: d.weapon, style: d.style, name: d.name });
    ch.root.position.set((i - 3.5) * 0.95, 0, i < 4 ? 0 : 0);
    ch.root.rotation.y = 0;
    if (d.pose !== 'aim' && d.pose !== 'idle') ch.setDance(d.pose);
    if (L.lod) ch.setLod(L.lod);
    scene.add(ch.root);
    crowd.push({ ch, d, st: { ...S, localMove: { x: 0, z: 0 }, form: 'kid', firing: d.pose === 'aim', charge: d.weapon === 'charger' && d.pose === 'aim' ? 0.7 : 0, aimPitch: 0.05, ink: 0.35 + 0.08 * i, special: i === 3 ? 1 : 0 } });
  });
}

// ---------------------------------------------------------------- locomotion presets
const LOCO = {
  idle: [0, 0, 0], walk: [1.8, 0, 1], run: [PLAYER.runSpeed, 0, 1], strafeL: [4.6, -1, 0], strafeR: [4.6, 1, 0], back: [4.2, 0, -1], diag: [PLAYER.runSpeed, 0.7, 0.7],
};
function setLoco(name) {
  L.loco = name; const l = LOCO[name] || LOCO.idle;
  S.speed = l[0]; S.localMove.x = l[1]; S.localMove.z = l[2];
  const n = Math.hypot(l[1], l[2]); if (n > 1) { S.localMove.x /= n; S.localMove.z /= n; }
  if (S.form === 'swim') S.speed = l[0] ? PLAYER.swimSpeed * (l[0] / PLAYER.runSpeed) : 0;
  if (S.form === 'squid') S.speed = l[0] ? PLAYER.squidDrySpeed : 0;
  if (S.form === 'climb') S.speed = l[0] ? PLAYER.climbSpeed * 0.6 : 0;
}
function setForm(f) {
  S.form = f;
  puddle.visible = f === 'swim';
  wall.visible = wallInk.visible = f === 'climb';
  setLoco(L.loco);
}

// ---------------------------------------------------------------- simulation
// Travel mode plays the engine's role (actor.js): input → velocity with the same accel/decel, root motion, facing
// (toward travel, or held for strafing/aiming), terrain height, jumps with gravity. Otherwise the lab stands the
// hero still and feeds speed/localMove (the character treats that as a treadmill).
const E = { vel: new THREE.Vector3(), move: new THREE.Vector2(), spd: PLAYER.runSpeed, face: 'move', faceYaw: 0, vy: 0, air: false, turn: 0 };
function engineStep(dt) {
  const r = hero.root;
  const ml = Math.min(1, E.move.length());
  const tx = ml > 0.01 ? (E.move.x / E.move.length()) * E.spd * ml : 0, tz = ml > 0.01 ? (E.move.y / E.move.length()) * E.spd * ml : 0;
  const accel = E.air ? 22 : 58, decel = E.air ? 4 : 70;
  const dvx = tx - E.vel.x, dvz = tz - E.vel.z, dl = Math.hypot(dvx, dvz);
  const rate = (ml > 0.01 ? Math.max(accel, (dvx * E.vel.x + dvz * E.vel.z) < 0 ? decel : 0) : decel) * dt;
  if (dl <= rate) { E.vel.x = tx; E.vel.z = tz; } else { E.vel.x += (dvx / dl) * rate; E.vel.z += (dvz / dl) * rate; }
  r.position.x += E.vel.x * dt; r.position.z += E.vel.z * dt;
  const h = terrainH(r.position.x, r.position.z);
  if (E.air) {
    E.vy -= PLAYER.gravity * (E.vy < 0 ? 1.18 : 1) * dt; r.position.y += E.vy * dt;
    if (r.position.y <= h && E.vy < 0) { const imp = -E.vy; r.position.y = h; E.air = false; E.vy = 0; hero.trigger('land', imp); }
  } else {
    // capsule-ish ground follow: snap down, ease up over steps
    r.position.y = h > r.position.y ? r.position.y + (h - r.position.y) * (1 - Math.exp(-dt * 40)) : h;
  }
  const hs = Math.hypot(E.vel.x, E.vel.z);
  if (E.turn) E.faceYaw += E.turn * dt;
  if (E.face === 'fixed') r.rotation.y = dampA(r.rotation.y, E.faceYaw, 22, dt);
  else if (hs > 0.6) r.rotation.y = dampA(r.rotation.y, Math.atan2(E.vel.x, E.vel.z), 12, dt);
  const cy = Math.cos(r.rotation.y), sy = Math.sin(r.rotation.y);
  S.speed = hs;
  S.localMove.x = hs > 0.1 ? -(E.vel.x * cy - E.vel.z * sy) / hs : 0; S.localMove.z = hs > 0.1 ? (E.vel.x * sy + E.vel.z * cy) / hs : 0;
  S.grounded = !E.air; S.vy = E.vy;
}
function dampA(a, b, l, dt) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * (1 - Math.exp(-l * dt)); }
const _lastRoot = new THREE.Vector3();
function stepSim(dt) {
  labT += dt; S.time = labT;
  _lastRoot.copy(hero.root.position);
  if (L.travel) engineStep(dt);
  else if (jumpT >= 0) {
    // jump arc in place (the lab plays the role of the engine and moves root.y)
    jumpT += dt;
    const vy = PLAYER.jumpVel - PLAYER.gravity * jumpT;
    const y = PLAYER.jumpVel * jumpT - 0.5 * PLAYER.gravity * jumpT * jumpT;
    if (y <= 0 && jumpT > 0.05) { hero.root.position.y = 0; S.grounded = true; S.vy = 0; hero.trigger('land', Math.abs(vy)); jumpT = -1; }
    else { hero.root.position.y = y; S.grounded = false; S.vy = vy; }
  }
  if (chargeRamp) { S.charge = Math.min(1, S.charge + dt / 1.0); }
  RUN.sinceHand[0] += dt; RUN.sinceHand[1] += dt; RUN.lockT = Math.max(0, RUN.lockT - dt);
  if (autoFire) {
    const W = L.weapon;
    if (W === 'splatling') {
      // 0.85 s spin-up → 1.2 s stream at 15 Hz → a beat of rest → again
      RUN.cyc = (RUN.cyc || 0) + dt; const c = RUN.cyc % 2.5;
      RUN.charging = c < 0.85; RUN.charge = RUN.charging ? c / 0.85 : 0; S.charge = RUN.charge;
      RUN.streaming = c >= 0.85 && c < 2.05; RUN.burstFrac = RUN.streaming ? 1 - (c - 0.85) / 1.2 : 0;
      if (RUN.streaming && Math.floor(c * 15) !== Math.floor((c - dt) * 15)) hero.trigger('shoot');
    } else {
      fireTimer -= dt;
      if (fireTimer <= 0) {
        const iv = { shooter: 0.1, blaster: 0.78, roller: 0.62, charger: 1.1, dualies: 1 / 12, slosher: 0.62 }[W] || 0.1;
        fireTimer = iv;
        if (W === 'charger') { hero.trigger('charge_release'); S.charge = 0; }
        else if (W === 'dualies') { RUN.hand ^= 1; RUN.sinceHand[RUN.hand] = 0; hero.trigger('shoot', { hand: RUN.hand }); }
        else if (W === 'slosher') hero.trigger('slosh');
        else hero.trigger(W === 'roller' ? 'flick' : 'shoot');
      }
      if (W === 'charger') S.charge = Math.min(1, S.charge + dt / 1.0);
    }
  } else if (L.weapon === 'splatling') { RUN.charging = false; RUN.streaming = false; RUN.charge = 0; }
  // dualies dodge roll: the lab plays the engine's fast-out root motion (~2.8 m over 0.3 s), then the lock
  if (DG.t >= 0) {
    const u0 = Math.min(1, DG.t / DG.dur); DG.t += dt; const u1 = Math.min(1, DG.t / DG.dur);
    const f = (u) => 1 - Math.pow(1 - u, 2.2);
    const dd = (f(u1) - f(u0)) * DG.dist, r = hero.root, y = r.rotation.y;
    r.position.x += (DG.x * Math.cos(y) + DG.z * Math.sin(y)) * dd; r.position.z += (-DG.x * Math.sin(y) + DG.z * Math.cos(y)) * dd;
    RUN.dodge = u1 < 1 ? DG : null;
    if (u1 >= 1) { DG.t = -1; RUN.lockT = 0.5; }
  }
  // circle mode: root moves along a circle (tests turn lean / hair lag)
  if (L.circle && hero) {
    const r = 2.2, w = S.speed / r;
    const a = labT * w;
    hero.root.position.x = Math.sin(a) * r; hero.root.position.z = Math.cos(a) * r - r;
    hero.root.rotation.y = a + Math.PI / 2;
  }
  hero.update(dt, S);
  if (L.follow) { _lastRoot.subVectors(hero.root.position, _lastRoot); camera.position.add(_lastRoot); controls.target.add(_lastRoot); }
  for (const c of crowd) { c.st.time = labT; if (c.d.pose === 'aim' && Math.floor(labT * 3) !== Math.floor((labT - dt) * 3)) c.ch.trigger(c.d.weapon === 'charger' ? 'charge_release' : 'shoot'); c.ch.update(dt, c.st); }
}
function simulate(seconds) { const h = 1 / 60; let t = 0; while (t < seconds - 1e-9) { stepSim(h); t += h; } }

// ---------------------------------------------------------------- cameras
const CAMS = {
  front: { p: [1.35, 1.25, 2.35], t: [0, 0.78, 0] },
  back: { p: [-0.55, 2.05, -3.3], t: [0.05, 1.05, 1.2] },
  side: { p: [2.9, 1.05, 0.15], t: [0, 0.75, 0.05] },
  sideL: { p: [-2.9, 1.05, 0.15], t: [0, 0.75, 0.05] },
  q3: { p: [2.2, 1.3, 2.2], t: [0, 0.72, 0.1] },
  wide: { p: [4.2, 1.9, 2.6], t: [0, 0.6, 2.5] },
  feet: { p: [1.4, 0.45, 0.9], t: [0, 0.2, 0.1] },
  track: { p: [3.2, 1.2, 0.6], t: [0, 0.7, 0.6] },
  trackBack: { p: [0.9, 1.6, -3.4], t: [0, 0.8, 0.8] },
  wideSide: { p: [5.2, 1.5, 0.4], t: [0, 1.0, 0.4] },
  faceL: { p: [0.42, 1.26, 0.82], t: [0, 1.16, 0.02] },
  stage: { p: [0, 1.6, 5.2], t: [0, 0.85, 0] },
  handL: { p: [0.62, 0.72, 0.42], t: [0.18, 0.53, 0.0] },
  hands: { p: [0.42, 1.02, 0.92], t: [0.0, 0.85, 0.22] },
  faceF: { p: [0.0, 1.22, 0.78], t: [0, 1.17, 0.02] },
  face: { p: [0.22, 1.28, 0.62], t: [0, 1.22, 0.02] },
  low: { p: [0.9, 0.35, 1.6], t: [0, 0.7, 0] },
  top: { p: [0.6, 3.2, 1.8], t: [0, 0.3, 0] },
  lineup: { p: [0, 1.5, 7.2], t: [0, 0.75, 0] },
  lineupBack: { p: [0, 2.3, -6.5], t: [0, 0.8, 0] },
  far: { p: [-1.0, 2.2, -6.5], t: [0, 0.9, 1] },
  hip: { p: [0.55, 0.85, 0.55], t: [0.08, 0.72, 0.0] },
  shoulder: { p: [0.5, 1.05, 0.6], t: [0.1, 0.95, 0.0] },
  hairBack: { p: [0.35, 1.3, -0.75], t: [0, 1.12, -0.05] },
  hairSide: { p: [0.85, 1.25, 0.05], t: [0, 1.15, -0.02] },
};
function setCam(name) {
  const c = CAMS[name]; if (!c) return;
  const o = (L.circle || L.follow || L.travel) && hero ? hero.root.position : new THREE.Vector3();
  const y0 = L.follow || L.travel ? (hero ? hero.root.position.y : 0) : 0;
  camera.position.set(c.p[0] + o.x, c.p[1] + y0, c.p[2] + o.z); controls.target.set(c.t[0] + o.x, c.t[1] + y0, c.t[2] + o.z); controls.update();
  L.cam = name; refreshUI();
}

// ---------------------------------------------------------------- render
function drawCalls(obj) { let n = 0; obj.traverseVisible((o) => { if (o.isMesh) n++; }); return n; }
const hud = document.getElementById('hud');
let fpsAcc = 0, fpsN = 0, fps = 0;
function render() {
  if (muzzleDot.visible && hero) hero.getMuzzle(muzzleDot.position);
  sky.position.copy(camera.position);
  if (params.get('bloom') === '0') renderer.render(scene, camera); else composer.render();
  if (!document.body.classList.contains('hide')) {
    const e = hero?.ikErr || [0, 0, 0, 0];
    hud.innerHTML = `<b>${fps.toFixed(0)}</b> fps · calls <b>${renderer.info.render.calls}</b><br>hero draws <b>${hero ? drawCalls(hero.root) : 0}</b> · hero tris <b>${hero ? (countTriangles(hero.root) / 1000).toFixed(1) : 0}k</b> · lod <b>${hero ? hero.lodTier : '—'}</b> ${hero ? (hero.lod.px | 0) + 'px' : ''} · scene <b>${(renderer.info.render.triangles / 1000).toFixed(0)}k</b><br>` +
      `form <b>${S.form}</b> · loco <b>${L.loco}</b> · dance <b>${L.dance || '—'}</b><br>ik err L/R arm <b>${(e[0] * 100).toFixed(1)}/${(e[1] * 100).toFixed(1)}</b>cm legs <b>${(e[2] * 100).toFixed(1)}/${(e[3] * 100).toFixed(1)}</b><br>t <b>${labT.toFixed(2)}</b>${L.frozen ? ' (frozen)' : ''}`;
  }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  if (!L.frozen) stepSim(dt);
  controls.update();
  render();
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- UI
const panel = document.getElementById('panel');
function btn(label, on, fn, title) { const b = document.createElement('button'); b.textContent = label; if (on) b.classList.add('on'); b.onclick = () => { fn(); refreshUI(); }; if (title) b.title = title; return b; }
function sec(title, ...rows) { const d = document.createElement('div'); d.className = 'sec'; const t = document.createElement('div'); t.className = 't'; t.innerHTML = title; d.append(t, ...rows); return d; }
function row(...els) { const d = document.createElement('div'); d.className = 'row'; d.append(...els); return d; }
function slider(label, min, max, step, get, set) {
  const l = document.createElement('label'); l.className = 'sl'; const s = document.createElement('input'); s.type = 'range'; s.min = min; s.max = max; s.step = step; s.value = get();
  const b = document.createElement('b'); b.textContent = (+get()).toFixed(2); s.oninput = () => { set(+s.value); b.textContent = (+s.value).toFixed(2); };
  l.append(label, s, b); return l;
}
function check(label, get, set) { const l = document.createElement('label'); l.className = 'ck'; const c = document.createElement('input'); c.type = 'checkbox'; c.checked = get(); c.onchange = () => { set(c.checked); refreshUI(); }; l.append(c, label); return l; }
function refreshUI() {
  if (document.body.classList.contains('hide')) return;
  panel.innerHTML = '<h1>INK<span>WAVE</span> · character lab</h1>';
  panel.append(
    sec('Form <kbd>1–4</kbd>', row(...['kid', 'squid', 'swim', 'climb'].map((f) => btn(f, S.form === f, () => setForm(f))))),
    sec('Locomotion <kbd>Q W E R T</kbd>', row(...Object.keys(LOCO).map((k) => btn(k, L.loco === k, () => setLoco(k)))), row(btn('circle path', L.circle, () => { L.circle = !L.circle; if (!L.circle) { hero.root.position.set(0, 0, 0); hero.root.rotation.y = 0; } }))),
    sec('Travel (engine-driven root, foot planting, terrain IK)', row(
      btn('travel', L.travel, () => { L.travel = !L.travel; L.follow = L.travel; if (!L.travel) { E.move.set(0, 0); E.vel.set(0, 0, 0); } }),
      btn('▲', false, () => { L.travel = true; L.follow = true; E.move.set(0, 1); }), btn('◀', false, () => { L.travel = true; L.follow = true; E.move.set(1, 0); }),
      btn('▶', false, () => { L.travel = true; L.follow = true; E.move.set(-1, 0); }), btn('▼', false, () => { L.travel = true; L.follow = true; E.move.set(0, -1); }),
      btn('stop', false, () => { E.move.set(0, 0); }), btn('face fixed', E.face === 'fixed', () => { E.face = E.face === 'fixed' ? 'move' : 'fixed'; E.faceYaw = hero.root.rotation.y; }),
      btn('turn in place', E.turn !== 0, () => { L.travel = true; L.follow = true; E.face = 'fixed'; E.faceYaw = hero.root.rotation.y; E.turn = E.turn ? 0 : 2.4; }),
    ), row(...TERRAINS.map((n) => btn(n, L.terrain === n, () => { L.terrain = n; buildTerrain(); }))),
      slider('speed', 0.5, 12, 0.1, () => E.spd, (v) => { E.spd = v; })),
    sec('Air', row(btn('jump + land', false, () => { if (L.travel) window.lab.jump(); else { jumpT = 0; hero.trigger('jump'); } }), btn('hang fall', !S.grounded && jumpT < 0, () => { S.grounded = !S.grounded; S.vy = S.grounded ? 0 : -6; hero.root.position.y = S.grounded ? 0 : 0.6; if (S.grounded) hero.trigger('land', 9); }))),
    sec('Combat', row(
      btn('firing', S.firing, () => { S.firing = !S.firing; }),
      btn('auto fire', autoFire, () => { autoFire = !autoFire; S.firing = autoFire; if (!autoFire) S.charge = 0; }),
      btn('charge ramp', chargeRamp, () => { chargeRamp = !chargeRamp; S.charge = 0; }),
      btn('rolling', S.rolling, () => { S.rolling = !S.rolling; }),
    ), slider('aim pitch', -1, 1.15, 0.01, () => S.aimPitch, (v) => { S.aimPitch = v; }), slider('charge', 0, 1, 0.01, () => S.charge, (v) => { S.charge = v; })),
    sec('Triggers', row(...['shoot', 'flick', 'throw', 'jump', 'special_leap', 'special_slam', 'spawn', 'charge_release', 'slosh'].map((n) => btn(n, false, () => hero.trigger(n, 1))),
      btn('dodge ◀', false, () => window.lab.dodge(1, 0)), btn('dodge ▶', false, () => window.lab.dodge(-1, 0)), btn('dodge ▲', false, () => window.lab.dodge(0, 1)),
      btn('hit ▲', false, () => hero.trigger('hit', { x: 0, z: 1, amp: 1 })), btn('hit ◀', false, () => hero.trigger('hit', { x: 1, z: 0, amp: 1 })),
      btn('hit ▶', false, () => hero.trigger('hit', { x: -1, z: 0, amp: 1 })), btn('hit ▼', false, () => hero.trigger('hit', { x: 0, z: -1, amp: 1.2 })), btn('land soft', false, () => hero.trigger('land', 5)), btn('land hard', false, () => hero.trigger('land', 18)))),
    sec('Dance', row(...['victory', 'defeat', 'menu_idle', 'lobby_pose'].map((n) => btn(n, L.dance === n, () => { L.dance = L.dance === n ? null : n; hero.setDance(L.dance); for (const c of crowd) c.ch.setDance(L.dance || (c.d.pose !== 'aim' && c.d.pose !== 'idle' ? c.d.pose : null)); })), btn('off', !L.dance, () => { L.dance = null; hero.setDance(null); })),
      row(...[0, 1, 2].map((v) => btn('variant ' + String.fromCharCode(65 + v), hero && hero.danceVar === v, () => { if (hero) { hero.danceVar = v; hero.danceT = 0; } })))),
    sec('Weapon <kbd>Z X C V</kbd>', row(...WEAPON_ORDER.map((w) => btn(w, L.weapon === w, () => { L.weapon = w; hero.setWeapon(w); })))),
    sec('Team colour', row(...TEAM_PALETTES.map((p, i) => { const b = btn('', L.palette === i, () => { L.palette = i; applyColors(); }); b.className += ' sw'; b.innerHTML = `<i style="background:${p.a}"></i><i style="background:${p.b}"></i>`; return b; })), row(btn('team A', L.side === 'a', () => { L.side = 'a'; applyColors(); }), btn('team B', L.side === 'b', () => { L.side = 'b'; applyColors(); }))),
    sec('Style', row(...[0, 1, 2, 3].map((i) => btn('hair ' + i, L.style.hair === i, () => { L.style.hair = i; makeHero(); }))), row(...SKIN_TONES.map((c, i) => { const b = btn('', L.style.skin === i, () => { L.style.skin = i; makeHero(); }); b.className += ' sw'; b.innerHTML = `<i style="background:${c}"></i>`; return b; }), ...OUTFITS.map((o, i) => btn('fit ' + i, L.style.outfit === i, () => { L.style.outfit = i; makeHero(); })))),
    sec('Status', slider('hurt', 0, 1, 0.01, () => L.hurt, (v) => { L.hurt = v; hero.setHurt(v, enemyColor()); }), slider('ink', 0, 1, 0.01, () => S.ink, (v) => { S.ink = v; }), slider('special', 0, 1, 0.01, () => S.special, (v) => { S.special = v; }),
      slider('hp', 0, 1, 0.01, () => S.hp ?? 1, (v) => { S.hp = v; }),
      row(check('low ink', () => S.lowInk, (v) => { S.lowInk = v; }), check('invuln', () => S.invuln, (v) => { S.invuln = v; }), check('enemy ink', () => !!S.inEnemyInk, (v) => { S.inEnemyInk = v; }), check('bomb aim', () => !!S.subAim, (v) => { S.subAim = v; }), check('isLocal', () => L.isLocal, (v) => { L.isLocal = v; makeHero(); }))),
    sec('Camera <kbd>F B S G</kbd>', row(...Object.keys(CAMS).map((c) => btn(c, L.cam === c, () => setCam(c))))),
    sec('Scene', row(btn('lineup (8)', L.lineup, () => { L.lineup = !L.lineup; makeCrowd(); if (hero) hero.root.visible = !L.lineup; setCam(L.lineup ? 'lineup' : 'front'); }), btn('freeze', L.frozen, () => { L.frozen = !L.frozen; }), btn('step 1/30', false, () => simulate(1 / 30)), btn('muzzle dot', muzzleDot.visible, () => { muzzleDot.visible = !muzzleDot.visible; })),
      row(...['auto', 'hero', 'game', 'far'].map((t) => btn('lod ' + t, (L.lod || 'auto') === t, () => window.lab.lod(t === 'auto' ? null : t))))),
  );
}
function applyColors() {
  hero.setColor(teamColor()); hero.setHurt(L.hurt, enemyColor()); puddleMat.color.set(teamColor());
  for (const c of crowd) c.ch.setColor(teamColor(c.d.side));
}
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  const forms = { 1: 'kid', 2: 'squid', 3: 'swim', 4: 'climb' }; if (forms[k]) setForm(forms[k]);
  const loc = { q: 'idle', w: 'run', e: 'strafeL', r: 'strafeR', t: 'back' }; if (loc[k]) setLoco(loc[k]);
  const wp = { z: 'shooter', x: 'roller', c: 'charger', v: 'blaster' }; if (wp[k]) { L.weapon = wp[k]; hero.setWeapon(wp[k]); }
  const cm = { f: 'front', b: 'back', s: 'side', g: 'face' }; if (cm[k]) setCam(cm[k]);
  if (k === ' ') { jumpT = 0; hero.trigger('jump'); }
  if (k === 'h') hero.trigger('hit');
  if (k === 'p') L.frozen = !L.frozen;
  refreshUI();
});
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });

// ---------------------------------------------------------------- scripting API (headless capture)
window.lab = {
  THREE, S, L, get hero() { return hero; }, get crowd() { return crowd; }, scene, camera, renderer,
  set(o) { for (const k in o) { if (k === 'localMove') Object.assign(S.localMove, o[k]); else S[k] = o[k]; } refreshUI(); },
  loco: setLoco, form: setForm, cam: setCam,
  trigger: (n, a) => hero.trigger(n, a),
  dance(n) { L.dance = n; hero.setDance(n); refreshUI(); },
  weapon(w) { L.weapon = w; hero.setWeapon(w); refreshUI(); },
  team(i, side = 'a') { L.palette = i; L.side = side; applyColors(); refreshUI(); },
  style(o) { Object.assign(L.style, o); makeHero(); refreshUI(); },
  hurt(a) { L.hurt = a; hero.setHurt(a, enemyColor()); },
  /** LOD tier: 'hero' | 'game' | 'far' | null (automatic, by screen height) — applies to the hero and the line-up */
  lod(t = null) { L.lod = t; hero.setLod(t); for (const c of crowd) c.ch.setLod(t); refreshUI(); },
  /** start a dither cross-fade of the hero to tier t ('hero' | 'game' | 'far'); step to watch it */
  fadeTo(t) { hero.lod.force = -1; hero._startFade(['hero', 'game', 'far'].indexOf(t)); },
  lineup(on = true) { L.lineup = on; makeCrowd(); hero.root.visible = !on; setCam(on ? 'lineup' : 'front'); },
  freeze(on = true) { L.frozen = on; refreshUI(); },
  step(sec) { simulate(sec); render(); },
  render() { render(); },
  /** dualies roll: root-space direction (+z forward, +x = the kid's left), the lab moves the root like the engine */
  dodge(x = 1, z = 0, t = 0.3) { const l = Math.hypot(x, z) || 1; DG.x = x / l; DG.z = z / l; DG.dur = t; DG.t = 0; RUN.lockT = 0; hero.trigger('dodge', { x: DG.x, z: DG.z, t }); RUN.dodge = DG; },
  RUN, DG,
  /** travel mode: world move direction (x,z) (0,0 = stop), speed; facing 'move' (turn toward travel) or a fixed yaw */
  move(x, z, spd) { L.travel = true; E.move.set(x, z); if (spd !== undefined) E.spd = spd; },
  face(mode, yaw = 0, turn = 0) { E.face = mode; E.faceYaw = yaw; E.turn = turn; },
  jump() { if (L.travel) { if (!E.air) { E.air = true; E.vy = PLAYER.jumpVel; hero.trigger('jump'); } } else { jumpT = 0; hero.trigger('jump'); } },
  terrain(name) { L.terrain = name; buildTerrain(); },
  follow(on = true) { L.follow = on; },
  E, terrainH,
  /** foot/debug probe: world feet + planted state, IK errors */
  probe() { const d = hero.dbg; return { t: +labT.toFixed(3), root: hero.root.position.toArray().map((v) => +v.toFixed(3)), moving: d.moving, gv: +d.gv.toFixed(2), feet: d.feet, ik: hero.ikErr.map((v) => +(v * 100).toFixed(2)) }; },
  /** Reset everything, apply opts, simulate opts.t seconds at 60 Hz, freeze and render. */
  go(o = {}) {
    L.frozen = true; labT = 0; jumpT = -1; chargeRamp = !!o.chargeRamp; autoFire = !!o.autoFire; fireTimer = 0;
    Object.assign(S, { speed: 0, localMove: { x: 0, z: 0 }, grounded: true, vy: 0, aimPitch: 0, firing: false, charge: 0, rolling: false, form: 'kid', ink: 0.8, lowInk: false, special: 0, invuln: false, hp: 1, inEnemyInk: false, subAim: false, runner: RUN });
    Object.assign(RUN, { charging: false, charge: 0, streaming: false, burstFrac: 0, lockT: 0, dodge: null, hand: 1, cyc: 0 }); RUN.sinceHand[0] = RUN.sinceHand[1] = 99; DG.t = -1;
    L.style = { hair: 0, skin: 0, outfit: 0, eyes: 0, ...(o.style || {}) };
    L.weapon = o.weapon || 'shooter'; L.dance = o.dance || null; L.hurt = o.hurt || 0; L.palette = o.pal ?? L.palette; L.side = o.side || 'a';
    L.isLocal = o.isLocal ?? true; L.circle = !!o.circle; if (o.lod !== undefined) L.lod = o.lod;
    // menu mode: no physics world → the kid behaves as in the showcase (looks at the viewer, neighbours, glances)
    G.physics = o.menu ? null : labPhys;
    L.travel = !!o.travel || !!o.move; L.follow = o.follow ?? L.travel; E.vel.set(0, 0, 0); E.move.set(0, 0); E.spd = o.spd ?? PLAYER.runSpeed; E.face = o.face || 'move'; E.faceYaw = o.yaw || 0; E.turn = o.turn || 0; E.air = false; E.vy = 0;
    if ((o.terrain || 'flat') !== L.terrain) { L.terrain = o.terrain || 'flat'; buildTerrain(); }
    makeHero();
    hero.root.position.set(0, 0, 0); hero.root.rotation.y = o.yaw || 0;
    if (o.state) this.set(o.state);
    setForm(o.form || 'kid');
    setLoco(o.loco || 'idle');
    if (o.state && o.state.speed !== undefined) S.speed = o.state.speed;
    if (o.move) E.move.set(o.move[0], o.move[1]);
    if (o.cam) setCam(o.cam);
    L.lineup = !!o.lineup; makeCrowd(); hero.root.visible = !L.lineup;
    if (o.jumpAt !== undefined) { simulate(o.jumpAt); jumpT = 0; hero.trigger('jump'); simulate(Math.max(0, (o.t ?? 1) - o.jumpAt)); }
    else if (o.trig) { simulate(o.trigAt ?? 0.6); for (const tg of [].concat(o.trig)) hero.trigger(tg, o.trigArg ?? 1); simulate(o.t ?? 0.2); }
    else simulate(o.t ?? 1.0);
    if (o.cam) setCam(o.cam); else if (L.lineup) setCam('lineup');
    if (o.muzzle) muzzleDot.visible = true;
    refreshUI(); render();
    return this.info();
  },
  /** per-tier, per-part triangle counts of the hero (builds every tier) */
  lodInfo() {
    const out = {};
    for (let t = 0; t < 3; t++) { const S = hero._tierSet(t); const o = out[['hero', 'game', 'far'][t]] = { total: 0 }; for (const m of S.list) { const n = countTriangles.call(null, { traverseVisible: (f) => f({ isMesh: true, geometry: m.geometry }) }) | 0; o[m.name.split(':')[1]] = n; o.total += n; } }
    return out;
  },
  /** face/life probe: blink per eye, gaze, attention kind, pupil, breath, tier */
  face() { const h = hero, f = h.face; return { t: +labT.toFixed(2), bl: [+f.blinkL.toFixed(2), +f.blinkR.toFixed(2)], gz: [+f.gazeX.toFixed(3), +f.gazeY.toFixed(3)], att: h.att.kind, on: h.att.on, pup: +f.pupil.toFixed(2), br: +f.breath.toFixed(2), sac: h.gz.st >= 0 }; },
  info() {
    return { calls: renderer.info.render.calls, lod: hero?.lodTier, px: hero ? Math.round(hero.lod.px) : 0, heroMeshes: hero ? drawCalls(hero.root) : 0, heroTris: hero ? countTriangles(hero.root) : 0, weaponTris: hero ? countTriangles(hero.weapon.pivot) : 0, ikErr: hero?.ikErr.map((v) => +(v * 100).toFixed(2)), t: +labT.toFixed(3) };
  },
};

// ---------------------------------------------------------------- boot
makeHero();
setCam(params.get('cam') || 'front');
refreshUI();
if (params.get('go')) { try { window.lab.go(JSON.parse(params.get('go'))); } catch (e) { console.error('bad go param', e); } }
requestAnimationFrame(frame);
