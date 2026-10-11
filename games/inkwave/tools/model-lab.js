// INKWAVE model lab — turntable / close-up review harness for the squidkid, squid form and weapons
//. Builds its OWN rig straight from character-geo / character-mats /
// character-weapons (bind pose + a small IK for weapon holds), so it keeps working while character.js is being
// rewritten; "live" mode additionally drives the real Character class when it imports cleanly.
//
// Headless use:  node tools/shot.mjs "http://localhost:8490/tools/model-lab.html?ui=0" out.png --w 1600 --h 900
//                   --eval "mlab.go({subject:'kid', view:'front'})"
//   mlab.sheet({ subject, views:[...], cols }) renders several cameras/turntable angles into one image.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as GEO from '../src/game/character-geo.js';
import * as MATS from '../src/game/character-mats.js';
import * as WPN from '../src/game/character-weapons.js';
import { TEAM_PALETTES, WEAPON_ORDER } from '../src/config.js';
import * as CAT from '../src/game/character-style.js';

let CharMod = null;
try { CharMod = await import('../src/game/character.js'); } catch (e) { console.warn('[model-lab] character.js failed to import; live mode off:', e.message); }

const params = new URLSearchParams(location.search);
if (params.get('ui') === '0') document.body.classList.add('hide');

// style tables: the appearance catalog (src/game/character-style.js)
const { SKIN_TONES, OUTFITS, IRIS } = CAT;

// ------------------------------------------------------------------------------------------------ renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.94;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor('#2a2e38');
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.02, 200);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color('#5a9ff5') }, hor: { value: new THREE.Color('#e4f2ff') }, bot: { value: new THREE.Color('#d9d2c4') }, sun: { value: new THREE.Vector3(0.45, 0.8, 0.35).normalize() } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sun; varying vec3 vD;
      void main(){ float y = vD.y; vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0), 0.6)) : mix(hor, bot, clamp(-y*3.0,0.0,1.0));
        float s = max(dot(vD, sun), 0.0); c += vec3(1.0,0.95,0.85) * (pow(s, 900.0) * 30.0 + pow(s, 12.0) * 0.25);
        float cl = smoothstep(0.55, 0.9, sin(vD.x * 6.0 + sin(vD.z * 4.0)) * 0.5 + 0.5) * smoothstep(0.05, 0.25, y) * smoothstep(0.6, 0.3, y);
        c = mix(c, vec3(1.0), cl * 0.55); gl_FragColor = vec4(c, 1.0); }`,
  });
}
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(80, 48, 24), skyMaterial()));
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  scene.environmentIntensity = 0.66;
}
// studio backdrop: soft vertical gradient sphere
const backdrop = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { a: { value: new THREE.Color('#3b4252') }, b: { value: new THREE.Color('#1c1f27') } },
  vertexShader: 'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 a; uniform vec3 b; varying float vY; void main(){ gl_FragColor = vec4(mix(b, a, smoothstep(-0.2, 0.5, vY)), 1.0); }',
}));
scene.add(backdrop);
const hemi = new THREE.HemisphereLight('#d6e8ff', '#b8a98c', 0.9); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff3e0', 2.3);
sun.position.set(3.5, 7, 4.5); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.00015; sun.shadow.normalBias = 0.015;
Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20 });
scene.add(sun, sun.target);
const rim = new THREE.DirectionalLight('#bfe0ff', 1.2); rim.position.set(-4, 3, -5); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(2.2, 96), new THREE.MeshStandardMaterial({ color: '#8d93a0', roughness: 0.9 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.26, 96), new THREE.MeshBasicMaterial({ color: '#ff8a14' })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.001; scene.add(ring);

// ------------------------------------------------------------------------------------------------ rig
const IDENT = new THREE.Matrix4();
const _v = new THREE.Vector3(), _q = new THREE.Quaternion();

function kidXform(bone, stop, pos, quat) {
  pos.set(0, 0, 0); quat.identity();
  let o = bone;
  while (o && o !== stop) { pos.applyQuaternion(o.quaternion).add(o.position); quat.premultiply(o.quaternion); o = o.parent; }
  return pos;
}

class Rig {
  constructor(o = {}) {
    // resolved exactly like the Character constructor (+ the requested hook: whole style → geo getters / uniforms)
    const st = this.style = CAT.resolveStyle({ hair: 0, skin: 0, outfit: 0, eyes: 0, ...(o.style || {}) });
    this.color = new THREE.Color(o.color || '#ff8a14');
    this.root = new THREE.Group(); this.kid = new THREE.Group(); this.root.add(this.kid);
    const u = this.u = MATS.makeCharUniforms();
    CAT.applyStyleUniforms(u, st);
    u.uHurtSeed.value = o.seed ?? 17.3;
    u.uTeam.value.copy(this.color);
    this.mats = {
      skin: MATS.makeSkinMaterial(u, SKIN_TONES[st.skin]), cloth: MATS.makeClothMaterial(u), hair: MATS.makeHairMaterial(u),
      eye: MATS.makeEyeMaterial(u), fill: MATS.makeInkFillMaterial(), squid: MATS.makeSquidMaterial(u), glow: MATS.makeGlowMaterial(),
    };
    this.mats.fill.color.copy(this.color); this.mats.fill.emissive.copy(this.color).multiplyScalar(0.12);
    this.mats.glow.emissive.copy(this.color); this.mats.glow.color.copy(this.color).multiplyScalar(0.3);
    // bones
    const rest = this.rest = GEO.getRestPositions(st);
    const bones = [], by = {};
    for (const n of GEO.BONE_NAMES) { const b = new THREE.Bone(); b.name = n; by[n] = b; bones.push(b); }
    for (const n of GEO.BONE_NAMES) { const p = GEO.BONE_PARENT[n]; if (p) { by[p].add(by[n]); by[n].position.copy(rest[n]).sub(rest[p]); } else { this.kid.add(by[n]); by[n].position.copy(rest[n]); } }
    this.bones = by;
    this.skeleton = new THREE.Skeleton(bones, GEO.getBoneInverses(st));
    const sh = GEO.getKidShared(); const hair = GEO.getHairStyle(st);
    const mk = (geo, mat, shadow = true) => { const m = new THREE.SkinnedMesh(geo, mat); m.bind(this.skeleton, IDENT); m.castShadow = shadow; m.receiveShadow = true; m.frustumCulled = false; this.kid.add(m); return m; };
    this.meshes = { skin: mk(sh.skin, this.mats.skin), cloth: mk(GEO.getClothGeo ? GEO.getClothGeo(st) : sh.cloth, this.mats.cloth), hair: mk(hair.geo, this.mats.hair), eyes: mk(sh.eyes, this.mats.eye, false) };
    // tank
    const T = sh.tank;
    const g = new THREE.Group(); g.position.copy(T.offset); g.rotation.x = T.tilt; (by.tank || by.chest).add(g);
    if (by.tank) g.position.copy(T.center || T.offset.clone().add(rest.chest)).sub(rest.tank);
    const glass = new THREE.Mesh(T.glass, MATS.getGlassMaterial()); glass.renderOrder = 2;
    const fill = new THREE.Mesh(T.fill, this.mats.fill); fill.position.y = T.fillBottom;
    g.add(fill, glass);
    this.tank = { g, glass, fill, h: T.fillHeight };
    this.setInk(o.ink ?? 0.72);
    this.weapon = null;
    if (o.weapon) this.setWeapon(o.weapon);
  }
  setInk(v) { this.tank.fill.scale.set(1, Math.max(0.004, v) * this.tank.h, 1); this.tank.fill.visible = v > 0.005; }
  setWeapon(kind) {
    if (this.weapon) this.weapon.pivot.parent.remove(this.weapon.pivot);
    const d = WPN.getWeaponDef(kind);
    const pivot = new THREE.Group(); pivot.position.copy(WPN.FIST_OFFSET);
    const off = new THREE.Group(); off.position.copy(d.inHand.pos).sub(WPN.FIST_OFFSET); off.quaternion.copy(d.inHand.quat);
    pivot.add(off);
    const body = new THREE.Mesh(d.body, MATS.getPlasticMaterial()); body.castShadow = true;
    const ink = new THREE.Mesh(d.ink, MATS.getInkMaterial(this.color)); ink.castShadow = true;
    off.add(body, ink);
    if (d.glow) off.add(new THREE.Mesh(d.glow, this.mats.glow));
    if (d.drum) { const dr = new THREE.Group(); dr.position.copy(d.drumAt); dr.add(new THREE.Mesh(d.drum, MATS.getInkMaterial(this.color)), new THREE.Mesh(d.drumCaps, MATS.getPlasticMaterial())); off.add(dr); }
    const muzzle = new THREE.Object3D(); muzzle.position.copy(d.muzzle); off.add(muzzle);
    this.bones.handR.add(pivot);
    this.weapon = { kind, def: d, pivot, off, muzzle };
  }
  resetPose() { for (const n in this.bones) { this.bones[n].quaternion.identity(); this.bones[n].scale.set(1, 1, 1); } for (const n in this.bones) { const p = GEO.BONE_PARENT[n]; this.bones[n].position.copy(this.rest[n]).sub(p ? this.rest[p] : new THREE.Vector3()); } }
  /** Two-bone IK in kid space (same maths as character.js). */
  solve(up, lo, end, target, pole, endQuat, h0) {
    const B = this.bones; const U = B[up], L = B[lo], E = B[end];
    const Pp = new THREE.Vector3(), Qp = new THREE.Quaternion();
    kidXform(U.parent, this.kid, Pp, Qp);
    const A = U.position.clone().applyQuaternion(Qp).add(Pp);
    const a = L.position.length(), b = E.position.length();
    const D = target.clone().sub(A); let dist = D.length();
    dist = Math.min(Math.max(dist, Math.abs(a - b) + 1e-3), (a + b) * 0.9995); D.normalize();
    const cosA = Math.min(1, Math.max(-1, (a * a + dist * dist - b * b) / (2 * a * dist))), sinA = Math.sqrt(1 - cosA * cosA);
    const N = pole.clone().addScaledVector(D, -pole.dot(D)); if (N.lengthSq() < 1e-8) N.set(0, 0, 1); N.normalize();
    const El = A.clone().addScaledVector(D, a * cosA).addScaledVector(N, a * sinA);
    const T = A.clone().addScaledVector(D, dist);
    const H = new THREE.Vector3().crossVectors(N, D).normalize();
    const M0 = (r) => { const h = h0.clone().addScaledVector(r, -h0.dot(r)).normalize(); const c = new THREE.Vector3().crossVectors(r, h); return new THREE.Matrix4().makeBasis(r, h, c).transpose(); };
    const bu = El.clone().sub(A).normalize(), bl = T.clone().sub(El).normalize();
    const Qa = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(bu, H, new THREE.Vector3().crossVectors(bu, H)).multiply(M0(L.position.clone().normalize())));
    U.quaternion.copy(Qp.clone().invert().multiply(Qa));
    const Qb = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(bl, H, new THREE.Vector3().crossVectors(bl, H)).multiply(M0(E.position.clone().normalize())));
    const Qu = Qp.clone().multiply(U.quaternion);
    L.quaternion.copy(Qu.clone().invert().multiply(Qb));
    if (endQuat) E.quaternion.copy(Qu.multiply(L.quaternion).invert().multiply(endQuat));
  }
  /** Hold the weapon: grip anchor (kid space pos + YXZ euler) → right hand IK; optional left hand on the foregrip. */
  hold(p, r, twoHand = true, poleR = [-0.75, -0.6, -0.3], poleL = [0.75, -0.6, -0.3]) {
    const d = this.weapon.def;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2], 'YXZ'));
    const anc = new THREE.Vector3(...p);
    const hq = q.clone().multiply(d.handR.quat);
    const hp = d.handR.pos.clone().applyQuaternion(q).add(anc);
    this.solve('uArmR', 'fArmR', 'handR', hp, new THREE.Vector3(...poleR), hq, new THREE.Vector3(-1, 0, 0));
    if (twoHand) {
      const lq = q.clone().multiply(d.handL.quat);
      const lp = d.handL.pos.clone().applyQuaternion(q).add(anc);
      this.solve('uArmL', 'fArmL', 'handL', lp, new THREE.Vector3(...poleL), lq, new THREE.Vector3(-1, 0, 0));
    }
  }
  set(name, x = 0, y = 0, z = 0) { const b = this.bones[name]; if (b) b.rotation.set(x, y, z); }
  dispose() { this.root.parent?.remove(this.root); for (const k in this.mats) this.mats[k].dispose(); this.skeleton.dispose(); }
}

const HOLDS = {
  shooter: { p: [-0.1, 0.9, 0.27], r: [0.02, 0.04, 0], two: true },
  blaster: { p: [-0.075, 0.9, 0.17], r: [0.02, 0.06, 0], two: true },
  charger: { p: [-0.06, 0.99, 0.1], r: [0.0, 0.1, 0], two: true, poleL: [0.6, -0.75, -0.3] },
  roller: { p: [-0.08, 0.82, 0.2], r: [0.88, 0.08, 0], two: true, poleR: [-0.7, -0.4, -0.6], poleL: [0.7, -0.4, -0.6] },
};
const POSES = {
  rest(r) { r.resetPose(); },
  relaxed(r) { r.resetPose(); r.set('uArmL', 0, 0, 0.12); r.set('uArmR', 0, 0, -0.12); r.set('fArmL', -0.3); r.set('fArmR', -0.3); },
  tpose(r) { r.resetPose(); r.set('uArmL', 0, 0, 1.35); r.set('uArmR', 0, 0, -1.35); },
  hold(r) { r.resetPose(); const k = r.weapon?.kind || 'shooter'; const h = HOLDS[k]; r.set('uArmL', 0, 0, 0.1); r.hold(h.p, h.r, h.two, h.poleR, h.poleL); },
  carry(r) { r.resetPose(); r.set('uArmL', 0.1, 0, 0.12); r.set('fArmL', -0.35); r.hold([-0.19, 0.745, 0.13], [0.5, 0.08, -0.12], false); },
};

// ------------------------------------------------------------------------------------------------ subjects
const L = { subject: 'kid', style: { hair: 0, skin: 0, outfit: 0, eyes: 0 }, weapon: 'shooter', pal: 0, side: 'a', pose: 'hold', view: 'front', mode: 'lit', ink: 0.72, yaw: 0, hurt: 0, glow: 0, dance: 'lobby_pose' };
const stage = new THREE.Group(); scene.add(stage);
let items = []; // { obj, rig?, live?, update? }
function teamColor(side = L.side, pal = L.pal) { const p = TEAM_PALETTES[pal % TEAM_PALETTES.length]; return side === 'a' ? p.a : p.b; }
function clearStage() { for (const it of items) { it.rig?.dispose(); it.live?.dispose?.(); stage.remove(it.obj); } items = []; }

function makeKid(o) {
  const r = new Rig({ style: o.style, color: o.color, weapon: o.weapon === 'none' ? null : o.weapon, ink: o.ink });
  (POSES[o.pose] || POSES.rest)(r);
  if (o.hurt) r.u.uHurt.value.set(0.18, 0.36, 1, o.hurt);
  if (o.glow) r.u.uGlow.value.copy(r.color).multiplyScalar(o.glow);
  if (o.bones) for (const [n, e] of Object.entries(o.bones)) r.set(n, ...e);
  if (o.mouth) r.u.uMouth.value.set(...o.mouth);
  if (o.look) r.u.uLook.value.set(...o.look);
  if (o.hide) for (const k of o.hide) { if (r.meshes[k]) r.meshes[k].visible = false; if (k === 'tank') r.tank.g.visible = false; if (k === 'weapon' && r.weapon) r.weapon.pivot.visible = false; }
  return r;
}
function makeLive(o) {
  if (!CharMod) return null;
  const c = new CharMod.Character({ color: new THREE.Color(o.color), weapon: o.weapon, style: o.style, name: 'Lab', isLocal: false });
  if (o.dance) c.setDance(o.dance);
  const S = { time: 0, speed: 0, localMove: { x: 0, z: 0 }, grounded: true, vy: 0, aimPitch: 0, firing: !!o.firing, charge: o.charge || 0, rolling: false, form: o.form || 'kid', wallNormal: new THREE.Vector3(0, 0, -1), ink: o.ink ?? 0.72, lowInk: false, special: o.special || 0, invuln: false, ...(o.state || {}) };
  const h = 1 / 60; for (let t = 0; t < (o.t ?? 1.2); t += h) { S.time = t; c.update(h, S); }
  return c;
}
function makeSquid(o) {
  const u = MATS.makeCharUniforms(); u.uTeam.value.set(o.color);
  const sh = GEO.getKidShared().squid;
  const g = new THREE.Group();
  const body = new THREE.Mesh(sh.body, MATS.makeSquidMaterial(u)); body.castShadow = true; body.receiveShadow = true;
  const dark = new THREE.Mesh(sh.dark, MATS.getDarkMaterial()); dark.castShadow = true;
  const eu = MATS.makeCharUniforms(); CAT.applyStyleUniforms(eu, CAT.resolveStyle(o.style));
  const eyes = new THREE.Mesh(sh.eyes, MATS.makeEyeMaterial(eu));
  const pivot = new THREE.Group(); pivot.position.y = 0.165; pivot.add(body, dark, eyes); g.add(pivot);
  u.uTime.value = 0.7;
  return { obj: g, u };
}
function makeWeapon(o) {
  const d = WPN.getWeaponDef(o.weapon);
  const g = new THREE.Group();
  const inner = new THREE.Group(); g.add(inner);
  const col = new THREE.Color(o.color);
  const body = new THREE.Mesh(d.body, MATS.getPlasticMaterial()); body.castShadow = true;
  const ink = new THREE.Mesh(d.ink, MATS.getInkMaterial(col)); ink.castShadow = true;
  inner.add(body, ink);
  if (d.glow) { const gm = MATS.makeGlowMaterial(); gm.emissive.copy(col); gm.color.copy(col).multiplyScalar(0.3); gm.emissiveIntensity = o.charge ? 0.15 + 2.6 * o.charge : 0.3; inner.add(new THREE.Mesh(d.glow, gm)); }
  if (d.drum) { const dr = new THREE.Group(); dr.position.copy(d.drumAt); dr.add(new THREE.Mesh(d.drum, MATS.getInkMaterial(col)), new THREE.Mesh(d.drumCaps, MATS.getPlasticMaterial())); inner.add(dr); }
  // centre the weapon on its bounding box, stand it up at display height
  const box = new THREE.Box3().setFromObject(inner); const c = box.getCenter(new THREE.Vector3());
  inner.position.sub(c); g.position.y = 0.55;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), new THREE.MeshBasicMaterial({ color: '#ff0044', depthTest: false })); dot.renderOrder = 9; dot.position.copy(d.muzzle); dot.visible = !!o.muzzle; inner.add(dot);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.12, 8), new THREE.MeshBasicMaterial({ color: '#00ffaa', depthTest: false }));
  grip.renderOrder = 9; grip.visible = !!o.grips; grip.position.copy(d.gripR.pos); grip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.gripR.handZ.clone().normalize()); inner.add(grip);
  const gripL = grip.clone(); gripL.position.copy(d.gripL.pos); gripL.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.gripL.handZ.clone().normalize()); inner.add(gripL);
  return { obj: g, size: box.getSize(new THREE.Vector3()) };
}

const LINEUP = [
  { style: { hair: 0, skin: 0, outfit: 0, eyes: 0 }, weapon: 'shooter', side: 'a' },
  { style: { hair: 1, skin: 2, outfit: 1, eyes: 1 }, weapon: 'roller', side: 'a' },
  { style: { hair: 2, skin: 1, outfit: 2, eyes: 2 }, weapon: 'charger', side: 'a' },
  { style: { hair: 3, skin: 3, outfit: 3, eyes: 3 }, weapon: 'blaster', side: 'a' },
  { style: { hair: 2, skin: 3, outfit: 0, eyes: 1 }, weapon: 'blaster', side: 'b' },
  { style: { hair: 1, skin: 1, outfit: 3, eyes: 0 }, weapon: 'shooter', side: 'b' },
  { style: { hair: 3, skin: 0, outfit: 1, eyes: 3 }, weapon: 'charger', side: 'b' },
  { style: { hair: 0, skin: 2, outfit: 2, eyes: 2 }, weapon: 'roller', side: 'b' },
];

function build() {
  clearStage();
  const color = teamColor();
  const s = L.subject;
  if (s === 'kid' || s === 'live') {
    let obj, rig = null, live = null;
    if (s === 'live' && CharMod) { live = makeLive({ ...L, color }); obj = live.root; }
    else { rig = makeKid({ ...L, color }); obj = rig.root; }
    stage.add(obj); items.push({ obj, rig, live });
  } else if (s === 'lineup') {
    const n = L.count || 8;
    LINEUP.slice(0, n).forEach((d, i) => {
      const r = makeKid({ ...L, ...d, style: { ...d.style }, color: teamColor(d.side), weapon: L.weapon === 'none' ? 'none' : d.weapon });
      r.root.position.x = (i - (n - 1) / 2) * 0.72; stage.add(r.root); items.push({ obj: r.root, rig: r });
    });
  } else if (s === 'styles') { // the four hair styles side by side, same outfit/skin
    for (let i = 0; i < 4; i++) {
      const r = makeKid({ ...L, style: { ...L.style, hair: i }, color });
      r.root.position.x = (i - 1.5) * 0.62; stage.add(r.root); items.push({ obj: r.root, rig: r });
    }
  } else if (s === 'squid') {
    const q = makeSquid({ ...L, color }); stage.add(q.obj); items.push({ obj: q.obj });
  } else if (s === 'weapon' || s === 'weapons') {
    const kinds = s === 'weapons' ? WEAPON_ORDER : [L.weapon];
    kinds.forEach((k, i) => { const w = makeWeapon({ ...L, weapon: k, color }); w.obj.position.x = (i - (kinds.length - 1) / 2) * 0.9; stage.add(w.obj); items.push({ obj: w.obj }); });
  }
  applyMode();
}

// ------------------------------------------------------------------------------------------------ views
// camera presets: position relative to the target; 'yaw' spins the stage (turntable)
const VIEWS = {
  front: { t: [0, 0.74, 0], d: [0.95, 0.32, 2.35], fov: 30 },
  front0: { t: [0, 0.74, 0], d: [0, 0.2, 2.6], fov: 30 },
  side: { t: [0, 0.74, 0], d: [2.6, 0.15, 0], fov: 30 },
  back: { t: [0, 0.8, 0], d: [-0.7, 0.45, -2.45], fov: 30 },
  game: { t: [0, 1.2, 1.4], d: [0.3, 0.55, -4.7], fov: 52 }, // gameplay: ~4.5 m behind the kid, game vertical fov
  face: { t: [0, 1.2, 0.02], d: [0.18, 0.02, 0.72], fov: 30 },
  face0: { t: [0, 1.2, 0.02], d: [0, 0.0, 0.74], fov: 30 },
  profile: { t: [0, 1.2, 0.0], d: [0.76, 0.0, 0.02], fov: 30 },
  head34b: { t: [0, 1.22, -0.02], d: [-0.5, 0.18, -0.58], fov: 30 },
  top: { t: [0, 1.25, 0], d: [0.01, 0.85, 0.12], fov: 30 },
  torso: { t: [0, 0.86, 0.02], d: [0.35, 0.05, 1.05], fov: 30 },
  torsoBack: { t: [0, 0.86, -0.1], d: [-0.35, 0.12, -1.05], fov: 30 },
  tank: { t: [0, 0.86, -0.18], d: [-0.42, 0.14, -0.62], fov: 30 },
  handR: { t: [-0.12, 0.84, 0.28], d: [-0.35, 0.12, 0.42], fov: 30 },
  handL: { t: [0.1, 0.88, 0.36], d: [0.4, 0.1, 0.35], fov: 30 },
  handRest: { t: [-0.19, 0.5, 0.0], d: [-0.12, 0.02, 0.45], fov: 30 },
  shoes: { t: [0, 0.07, 0.02], d: [0.45, 0.16, 0.62], fov: 30 },
  shoeSide: { t: [-0.084, 0.07, 0.03], d: [-0.62, 0.08, 0.02], fov: 30 },
  sole: { t: [0, 0.03, 0.02], d: [0.05, -0.6, 0.35], fov: 30 },
  legs: { t: [0, 0.4, 0], d: [0.5, 0.05, 1.3], fov: 30 },
  shorts: { t: [0, 0.62, 0], d: [0.4, 0.05, 1.0], fov: 30 },
  lineup: { t: [0, 0.72, 0], d: [0, 0.35, 6.8], fov: 30 },
  lineupBack: { t: [0, 0.8, 0], d: [0, 0.6, -6.8], fov: 30 },
  styles: { t: [0, 0.95, 0], d: [0, 0.2, 4.2], fov: 30 },
  squid: { t: [0, 0.2, 0], d: [0.55, 0.3, 0.8], fov: 30 },
  squidTop: { t: [0, 0.22, 0], d: [0.2, 0.95, 0.3], fov: 30 },
  squidLow: { t: [0, 0.14, 0], d: [0.5, -0.02, 0.62], fov: 30 },
  weapon: { t: [0, 0.55, 0], d: [0.55, 0.16, 0.62], fov: 30 },
  weaponSide: { t: [0, 0.55, 0], d: [0.9, 0.02, 0.0], fov: 30 },
  weaponTop: { t: [0, 0.55, 0], d: [0.02, 0.9, 0.02], fov: 30 },
  weapons: { t: [0, 0.55, 0], d: [0.2, 0.9, 2.6], fov: 30 },
};
function placeCamera(cam, v, aspect) {
  const V = typeof v === 'string' ? VIEWS[v] : v;
  cam.fov = V.fov || 30; cam.aspect = aspect; cam.near = 0.01; cam.updateProjectionMatrix();
  const scale = V.dist || 1;
  cam.position.set(V.t[0] + V.d[0] * scale, V.t[1] + V.d[1] * scale, V.t[2] + V.d[2] * scale);
  cam.lookAt(V.t[0], V.t[1], V.t[2]);
  return V;
}

// ------------------------------------------------------------------------------------------------ render modes
const clay = new THREE.MeshStandardMaterial({ color: '#c9ccd2', roughness: 0.55 });
const normalsMat = new THREE.MeshNormalMaterial();
const origMats = new Map();
function applyMode() {
  stage.traverse((o) => {
    if (!o.isMesh) return;
    if (!origMats.has(o)) origMats.set(o, o.material);
    const m0 = origMats.get(o);
    if (L.mode === 'clay') o.material = clay;
    else if (L.mode === 'normals') o.material = normalsMat;
    else o.material = m0;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) { if ('wireframe' in m) m.wireframe = L.mode === 'wire'; }
  });
}

// ------------------------------------------------------------------------------------------------ render
const labels = document.getElementById('labels');
function info() {
  const out = { meshes: 0, tris: 0, per: {} };
  stage.traverseVisible((o) => {
    if (!o.isMesh || !o.geometry) return;
    const g = o.geometry; const n = (g.index ? g.index.count : g.attributes.position.count) / 3;
    out.meshes++; out.tris += n; const k = (o.material?.name || o.material?.type || '?') + (o.isSkinnedMesh ? '*' : '');
    out.per[k] = (out.per[k] || 0) + n;
  });
  if (items[0]?.rig?.weapon) { let w = 0; items[0].rig.weapon.pivot.traverseVisible((o) => { if (o.isMesh) w += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); out.weaponTris = w; }
  out.calls = renderer.info.render.calls;
  return out;
}
function renderOne(view) {
  labels.innerHTML = '';
  stage.rotation.y = L.yaw;
  placeCamera(camera, view, innerWidth / innerHeight);
  controls.target.set(...VIEWS[view]?.t || [0, 0.75, 0]); controls.update();
  renderer.setScissorTest(false); renderer.setViewport(0, 0, innerWidth, innerHeight);
  renderer.render(scene, camera);
}
/** Render several views into one image. views: [{view, yaw, label}] (yaw in radians, spins the stage). */
function renderSheet(views, cols) {
  cols = cols || Math.ceil(Math.sqrt(views.length));
  const rows = Math.ceil(views.length / cols);
  const W = innerWidth, H = innerHeight, cw = W / cols, ch = H / rows;
  labels.innerHTML = '';
  renderer.setScissorTest(true);
  renderer.setClearColor('#2a2e38'); renderer.clear();
  const cam = new THREE.PerspectiveCamera();
  views.forEach((v, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = c * cw, y = H - (r + 1) * ch;
    stage.rotation.y = v.yaw ?? 0;
    placeCamera(cam, v.view, cw / ch);
    renderer.setViewport(x, y, cw, ch); renderer.setScissor(x, y, cw, ch);
    renderer.render(scene, cam);
    if (v.label !== '') { const d = document.createElement('div'); d.textContent = v.label ?? `${v.view}${v.yaw ? ' ' + Math.round((v.yaw * 180) / Math.PI) + '°' : ''}`; d.style.left = x + 'px'; d.style.top = (r * ch) + 'px'; labels.appendChild(d); }
  });
  renderer.setScissorTest(false);
  stage.rotation.y = L.yaw;
}

// ------------------------------------------------------------------------------------------------ UI
const panel = document.getElementById('panel'), hud = document.getElementById('hud');
function btn(label, on, fn) { const b = document.createElement('button'); b.textContent = label; if (on) b.classList.add('on'); b.onclick = () => { fn(); refresh(); }; return b; }
function sec(title, ...rows) { const d = document.createElement('div'); d.className = 'sec'; const t = document.createElement('div'); t.className = 't'; t.textContent = title; d.append(t, ...rows); return d; }
function row(...els) { const d = document.createElement('div'); d.className = 'row'; d.append(...els); return d; }
function refresh(rebuild = true) {
  if (rebuild) build();
  if (document.body.classList.contains('hide')) return;
  panel.innerHTML = '<h1>INK<span>WAVE</span> · model lab</h1>';
  panel.append(
    sec('Subject', row(...['kid', 'live', 'styles', 'lineup', 'squid', 'weapon', 'weapons'].map((s) => btn(s, L.subject === s, () => { L.subject = s; L.view = { kid: 'front', live: 'front', styles: 'styles', lineup: 'lineup', squid: 'squid', weapon: 'weapon', weapons: 'weapons' }[s]; })))),
    sec('Pose', row(...Object.keys(POSES).map((p) => btn(p, L.pose === p, () => { L.pose = p; })))),
    sec('Weapon', row(...[...WEAPON_ORDER, 'none'].map((w) => btn(w, L.weapon === w, () => { L.weapon = w; })))),
    sec('Hair', row(...[0, 1, 2, 3].map((i) => btn(GEO.HAIR_STYLE_NAMES?.[i] || 'hair ' + i, L.style.hair === i, () => { L.style.hair = i; })))),
    sec('Outfit / skin / eyes', row(...[0, 1, 2, 3].map((i) => btn('fit ' + i, L.style.outfit === i, () => { L.style.outfit = i; }))),
      row(...SKIN_TONES.map((c, i) => { const b = btn('', L.style.skin === i, () => { L.style.skin = i; }); b.className += ' sw'; b.innerHTML = `<i style="background:${c}"></i>`; return b; }),
        ...IRIS.map((c, i) => { const b = btn('', L.style.eyes === i, () => { L.style.eyes = i; }); b.className += ' sw'; b.innerHTML = `<i style="background:${c[0]}"></i><i style="background:${c[1]}"></i>`; return b; }))),
    sec('Team', row(...TEAM_PALETTES.map((p, i) => { const b = btn('', L.pal === i, () => { L.pal = i; }); b.className += ' sw'; b.innerHTML = `<i style="background:${p.a}"></i><i style="background:${p.b}"></i>`; return b; }), btn('A', L.side === 'a', () => { L.side = 'a'; }), btn('B', L.side === 'b', () => { L.side = 'b'; }))),
    sec('Render', row(...['lit', 'clay', 'wire', 'normals'].map((m) => btn(m, L.mode === m, () => { L.mode = m; })))),
    sec('View', row(...Object.keys(VIEWS).map((v) => btn(v, L.view === v, () => { L.view = v; setView(v); })))),
    sec('Turntable', row(btn('spin', !!L.spin, () => { L.spin = !L.spin; }), btn('sheet 8', false, () => { L.sheet = true; }))),
  );
}
function setView(v) { L.view = v; const V = VIEWS[v]; if (!V) return; placeCamera(camera, v, innerWidth / innerHeight); controls.target.set(...V.t); controls.update(); }

function frame() {
  requestAnimationFrame(frame);
  if (L.frozen) return;
  if (L.spin) L.yaw += 0.01;
  stage.rotation.y = L.yaw;
  controls.update();
  labels.innerHTML = '';
  renderer.render(scene, camera);
  const i = info();
  if (!document.body.classList.contains('hide')) hud.innerHTML = `meshes <b>${i.meshes}</b> · tris <b>${(i.tris / 1000).toFixed(1)}k</b>${i.weaponTris ? ` · weapon <b>${(i.weaponTris / 1000).toFixed(1)}k</b>` : ''}\n` + Object.entries(i.per).map(([k, n]) => `${k}: <b>${(n / 1000).toFixed(1)}k</b>`).join('\n');
}

// ------------------------------------------------------------------------------------------------ API
window.mlab = {
  THREE, GEO, MATS, WPN, L, scene, renderer, camera, stage, get items() { return items; }, VIEWS, POSES, Rig,
  /** go({subject, style, weapon, pose, view, mode, pal, side, yaw, ink, hurt, glow, bones, mouth, look}) → info */
  go(o = {}) {
    L.frozen = true;
    Object.assign(L, { subject: 'kid', weapon: 'shooter', pose: 'hold', mode: 'lit', yaw: 0, hurt: 0, glow: 0, bones: null, mouth: null, look: null, pal: 0, side: 'a', ink: 0.72, hide: null }, o);
    L.style = { hair: 0, skin: 0, outfit: 0, eyes: 0, ...(o.style || {}) };
    build();
    if (o.view) renderOne(o.view); else renderOne(L.view);
    return info();
  },
  /** sheet({...go opts, views:[{view,yaw,label}], cols}) */
  sheet(o = {}) {
    L.frozen = true;
    Object.assign(L, { subject: 'kid', weapon: 'shooter', pose: 'hold', mode: 'lit', yaw: 0, hurt: 0, glow: 0, bones: null, mouth: null, look: null, pal: 0, side: 'a', ink: 0.72, hide: null }, o);
    L.style = { hair: 0, skin: 0, outfit: 0, eyes: 0, ...(o.style || {}) };
    build();
    const views = o.views || [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ view: o.view || 'front0', yaw: (k * Math.PI) / 4 }));
    renderSheet(views, o.cols);
    return info();
  },
  info,
  /** multi({cells:[{...go opts, view, label}], cols}) — builds each cell's subject separately and renders it into its tile. */
  multi(o = {}) {
    L.frozen = true;
    const cells = o.cells || []; const cols = o.cols || Math.ceil(Math.sqrt(cells.length)); const rows = Math.ceil(cells.length / cols);
    const W = innerWidth, H = innerHeight, cw = W / cols, ch = H / rows;
    labels.innerHTML = ''; renderer.setScissorTest(true); renderer.setClearColor('#2a2e38'); renderer.clear();
    const cam = new THREE.PerspectiveCamera();
    cells.forEach((c, i) => {
      Object.assign(L, { subject: 'kid', weapon: 'none', pose: 'relaxed', mode: 'lit', yaw: 0, hurt: 0, glow: 0, bones: null, mouth: null, look: null, pal: 0, side: 'a', ink: 0.72, hide: null }, o.base || {}, c);
      L.style = { hair: 0, skin: 0, outfit: 0, eyes: 0, ...((o.base || {}).style || {}), ...(c.style || {}) };
      build();
      const col = i % cols, row = Math.floor(i / cols); const x = col * cw, y = H - (row + 1) * ch;
      stage.rotation.y = c.yaw ?? 0;
      placeCamera(cam, c.view || 'front', cw / ch);
      renderer.setViewport(x, y, cw, ch); renderer.setScissor(x, y, cw, ch); renderer.render(scene, cam);
      if (c.label) { const d = document.createElement('div'); d.textContent = c.label; d.style.left = x + 'px'; d.style.top = (row * ch) + 'px'; labels.appendChild(d); }
    });
    renderer.setScissorTest(false);
    return info();
  },
  bone(name, x, y, z) { const r = items[0]?.rig; if (r) r.set(name, x, y, z); renderOne(L.view); },
};

refresh();
setView(params.get('view') || 'front');
requestAnimationFrame(frame);
