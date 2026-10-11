// INKWAVE boss lab — preview + deterministic capture harness for src/boss/bossModel.js (HULLBREAKER).
// URL params: ?ui=0 (hide panels) &q=high &cam=q25 &light=dusk &go={json} (see lab.go)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BossModel } from '../src/boss/bossModel.js';
import { TEAM_PALETTES } from '../src/config.js';
import { G } from '../src/core/ctx.js';

let Character = null;
try { ({ Character } = await import('../src/game/character.js')); } catch (e) { console.warn('[boss-lab] no Character', e); }

const params = new URLSearchParams(location.search);
if (params.get('ui') === '0') document.body.classList.add('hide');

// ---------------------------------------------------------------- renderer / scene
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 400);
camera.position.set(14, 5, 18);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.6, 0); controls.enableDamping = true; controls.update();

const LIGHTS = {
  day: { top: '#5fa8ff', hor: '#dff1ff', bot: '#e9e2d6', sunDir: [0.45, 0.8, 0.35], sunC: '#fff4e2', sunI: 2.4, hemiS: '#d6e8ff', hemiG: '#bfae90', hemiI: 0.8, exp: 1.0, fog: '#dce9f4' },
  dusk: { top: '#2b2f6e', hor: '#ff9a62', bot: '#3a2c38', sunDir: [-0.75, 0.16, 0.45], sunC: '#ffab6b', sunI: 2.1, hemiS: '#7a78c0', hemiG: '#4a3336', hemiI: 0.55, exp: 1.05, fog: '#7c6a86' },
};
function makeSky() {
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sun: { value: new THREE.Vector3(0, 1, 0) }, sunC: { value: new THREE.Color() } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sun; uniform vec3 sunC; varying vec3 vD;
      void main(){ float y = vD.y; vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0), 0.55)) : mix(hor, bot, clamp(-y*3.0,0.0,1.0));
        float s = max(dot(vD, sun), 0.0); c += sunC * (pow(s, 900.0) * 30.0 + pow(s, 10.0) * 0.35);
        float cl = smoothstep(0.55, 0.9, sin(vD.x * 6.0 + sin(vD.z * 4.0)) * 0.5 + 0.5) * smoothstep(0.05, 0.25, y) * smoothstep(0.6, 0.3, y);
        c = mix(c, mix(vec3(1.0), sunC, 0.35), cl * 0.45);
        gl_FragColor = vec4(c, 1.0); }`,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(150, 48, 24), m);
}
const sky = makeSky(); scene.add(sky);
const envSky = makeSky(); const envScene = new THREE.Scene(); envScene.add(envSky);
const pmrem = new THREE.PMREMGenerator(renderer);
const hemi = new THREE.HemisphereLight('#d6e8ff', '#bfae90', 0.8); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e2', 2.4);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03;
const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80;
scene.add(sun); scene.add(sun.target);
let envRT = null;
function setLight(name) {
  const L = LIGHTS[name] || LIGHTS.day; lab.light = name;
  for (const s of [sky, envSky]) { const u = s.material.uniforms; u.top.value.set(L.top); u.hor.value.set(L.hor); u.bot.value.set(L.bot); u.sun.value.set(...L.sunDir).normalize(); u.sunC.value.set(L.sunC); }
  sun.color.set(L.sunC); sun.intensity = L.sunI; hemi.color.set(L.hemiS); hemi.groundColor.set(L.hemiG); hemi.intensity = L.hemiI;
  renderer.toneMappingExposure = L.exp;
  lab._sunDir = new THREE.Vector3(...L.sunDir).normalize();
  if (envRT) envRT.dispose();
  envRT = pmrem.fromScene(envScene, 0.02); scene.environment = envRT.texture;
  scene.fog = new THREE.Fog(L.fog, 60, 220);
}

// concrete ground with seams
function concreteTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#d4d0c7'; x.fillRect(0, 0, 512, 512);
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { const g = 185 + r() * 45 | 0; x.fillStyle = `rgba(${g},${g - 3},${g - 8},0.35)`; x.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2); }
  x.strokeStyle = 'rgba(110,105,95,0.5)'; x.lineWidth = 3; x.strokeRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.repeat.set(60, 60);
  return t;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ map: concreteTex(), roughness: 0.92 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
// a wall to bonk into (charge) + scale markers
const wall = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 1.2), new THREE.MeshStandardMaterial({ color: '#cfc7ba', roughness: 0.85 }));
wall.position.set(0, 2, 25.5); wall.castShadow = wall.receiveShadow = true; wall.visible = false; scene.add(wall);
const lab = {};
G.scene = scene; G.actors = [];
G.physics = { raycast(o, d, maxDist, out) { out.hit = o.y > 0 && d.y < -0.5; out.dist = o.y; out.point.set(o.x, 0, o.z); out.normal.set(0, 1, 0); return out; } };

// post (the game's bloom: HDR threshold 2.4)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.3, 0.45, 2.4);
composer.addPass(bloom); composer.addPass(new OutputPass());

// ---------------------------------------------------------------- boss + reference kids
const L = { q: params.get('q') || 'high', pal: +(params.get('pal') ?? 0), swap: false, phase: 1, frozen: false, preset: 'idle', cam: 'q25', kid: true, crowd: false, turntable: false, follow: true, crablets: false };
let boss = null, kid = null, crowd = [], crabs = [];
function inkColors() { const p = TEAM_PALETTES[L.pal % TEAM_PALETTES.length]; return L.swap ? { ink: p.a, weak: p.b } : { ink: p.b, weak: p.a }; }
function makeBoss() {
  if (boss) boss.dispose();
  const c = inkColors();
  boss = new BossModel({ ink: new THREE.Color(c.ink), weak: new THREE.Color(c.weak), quality: L.q });
  scene.add(boss.root);
  boss.fx.setViewportHeight(renderer.domElement.height, camera.fov);
  lab.events = [];
  boss.onFoot = (i, p, s) => { lab.events.push(['foot', i, +p.x.toFixed(2), +p.z.toFixed(2), +s.toFixed(2), +simT.toFixed(2)]); };
  boss.onImpact = (sock, p, s) => lab.events.push(['impact', sock, +p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2), +simT.toFixed(2)]);
  boss.onEvent = (n, d) => { if (n !== 'step') lab.events.push([n, d.socket, +simT.toFixed(2)]); };
}
const KID_STYLE = [
  { weapon: 'shooter', style: { hair: 0, skin: 0, outfit: 0, eyes: 0 } }, { weapon: 'roller', style: { hair: 1, skin: 2, outfit: 1, eyes: 1 } },
  { weapon: 'charger', style: { hair: 2, skin: 4, outfit: 4, eyes: 2 } }, { weapon: 'blaster', style: { hair: 3, skin: 3, outfit: 3, eyes: 3 } },
  { weapon: 'dualies', style: { hair: 4, skin: 6, outfit: 5, eyes: 4 } }, { weapon: 'splatling', style: { hair: 5, skin: 1, outfit: 6, eyes: 5 } },
  { weapon: 'slosher', style: { hair: 6, skin: 8, outfit: 7, eyes: 6 } }, { weapon: 'roller', style: { hair: 7, skin: 5, outfit: 8, eyes: 7 } },
];
const KS = () => ({ time: 0, speed: 0, localMove: { x: 0, z: 0 }, grounded: true, vy: 0, aimPitch: 0.25, firing: false, charge: 0, rolling: false, form: 'kid', wallNormal: new THREE.Vector3(0, 0, -1), ink: 0.8, lowInk: false, special: 0, invuln: false, runner: { charging: false, charge: 0, streaming: false, burstFrac: 0, lockT: 0, dodge: null, rollsLeft: 2, hand: 1, sinceHand: [99, 99] } });
function makeKid() {
  if (kid) { kid.ch.dispose(); kid = null; }
  if (!L.kid || !Character) return;
  const c = inkColors();
  const ch = new Character({ color: c.weak, weapon: 'shooter', style: { hair: 0, skin: 0, outfit: 0, eyes: 0 }, name: 'Ref', isLocal: false });
  ch.root.position.set(3.2, 0, 7.2); ch.root.rotation.y = Math.PI + 0.35; scene.add(ch.root);
  kid = { ch, st: KS() };
}
function makeCrowd() {
  for (const k of crowd) k.ch.dispose(); crowd = [];
  if (!L.crowd || !Character) return;
  const c = inkColors();
  KID_STYLE.forEach((d, i) => {
    const ch = new Character({ color: c.weak, weapon: d.weapon, style: d.style, name: 'K' + i });
    const a = -1.2 + (i / 7) * 2.4, r = 11 + (i % 3) * 2.5;
    ch.root.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); ch.root.rotation.y = a + Math.PI;
    scene.add(ch.root); crowd.push({ ch, st: { ...KS(), firing: true } });
  });
}
function makeCrabs() {
  for (const c of crabs) c.m.dispose(); crabs = [];
  if (!L.crablets) return;
  const c = inkColors();
  for (let i = 0; i < 4; i++) { const m = BossModel.makeCrablet({ ink: new THREE.Color(c.ink), weak: new THREE.Color(c.weak), quality: L.q }); m.root.position.set(-2.5 + i * 1.4, 0, 6.5 + (i % 2) * 0.8); m.root.rotation.y = 0.3 * (i - 1.5); scene.add(m.root); crabs.push({ m, sp: i % 2 ? 2.5 : 0 }); }
}

// ---------------------------------------------------------------- director (plays the sim's role)
const MOVE_T = { slam: [1.15, 1.2, 1.0], barrage: [0.85, 0, 0.8], sweep: [1.15, 2.1, 0.9], charge: [1.15, 0, 3.4], crablets: [0.9, 0.8, 0.6], frenzy: [1.2, 3.0, 1.7] };
const st = { speed: 0, turn: 0, move: null, moveT: 0, movePhase: null, phaseDur: 0, phase: 1, stunned: false, hurt: 0, dead: false, aim: new THREE.Vector3(), params: null, moveU: 0 };
let segs = [], segI = 0, segT = 0, loop = true, simT = 0, rootV = 0, rootW = 0;
function moveSegs(id) {
  const ph = L.phase; const T = MOVE_T[id].slice(); let p = null, v = [0, 0, 0], w = [0, 0, 0];
  if (id === 'slam') p = { rings: ph >= 3 ? [0, 0.6] : ph >= 2 ? [0, 0.9] : [0] };
  if (id === 'barrage') { const n = [0, 3, 4, 6][ph]; p = { b: [] }; for (let i = 0; i < n; i++) p.b.push([Math.sin(i * 1.7) * 8, 0, 9 + i * 1.5, T[0] + i * 0.26]); T[1] = p.b[n - 1][3] - T[0] + 1.4; }
  if (id === 'charge') { p = { wall: 1, stun: 1 }; T[1] = 1.55; v = [0, 13, 0]; }
  if (id === 'crablets') p = { n: ph >= 3 ? 5 : 3 };
  if (id === 'frenzy') { p = { spin: 1, stun: 1 }; w = [0, 4.2, 0]; }
  return ['tele', 'act', 'rec'].map((phase, i) => ({ move: id, phase, dur: T[i], params: p, v: v[i], w: w[i], stunned: (id === 'charge' || id === 'frenzy') && phase === 'rec', t0: i === 0 ? 0 : T.slice(0, i).reduce((a, b) => a + b, 0) }));
}
const PRESETS = {
  idle: () => [{ dur: 4 }],
  walk: () => [{ dur: 6, v: 2.4 }], run: () => [{ dur: 6, v: 4.6 }], gallop: () => [{ dur: 4, v: 12, move: 'charge', phase: 'act' }],
  turnL: () => [{ dur: 5, w: 1.1 }], turnR: () => [{ dur: 5, w: -1.1 }], walkTurn: () => [{ dur: 6, v: 2.2, w: 0.45 }],
  startStop: () => [{ dur: 1.2 }, { dur: 2.2, v: 3 }, { dur: 2.5 }],
  slam: () => moveSegs('slam'), barrage: () => moveSegs('barrage'), sweep: () => moveSegs('sweep'), charge: () => moveSegs('charge'),
  crablets: () => moveSegs('crablets'), frenzy: () => moveSegs('frenzy'),
  stun: () => [{ dur: 4, stunned: true }], roar: () => [{ dur: 1.9, move: 'roar', phase: 'act' }], intro: () => [{ dur: 3.4, move: 'intro', phase: 'act' }, { dur: 1.5 }],
  death: () => [{ dur: 1.0 }, { dur: 8, dead: true }],
  fight: () => [...moveSegs('slam'), { dur: 1.0, v: 2 }, ...moveSegs('sweep'), { dur: 0.8 }, ...moveSegs('barrage'), { dur: 0.8, w: 1.2 }, ...moveSegs('charge'), { dur: 1 }, ...moveSegs('frenzy'), { dur: 1 }],
};
function play(name, lp = true) {
  L.preset = name; segs = (PRESETS[name] || PRESETS.idle)(); segI = 0; segT = 0; loop = lp;
  wall.visible = name === 'charge' || name === 'fight';
}
function resetRoot() { boss.root.position.set(0, 0, 0); boss.root.rotation.set(0, 0, 0); boss.root.updateMatrixWorld(true); }
const _aim = new THREE.Vector3();
function stepSim(dt) {
  simT += dt;
  let s = segs[segI];
  if (!s) return;
  segT += dt;
  while (segT >= s.dur) {
    segT -= s.dur; segI++;
    if (segI >= segs.length) { if (!loop) { segI = segs.length - 1; segT = s.dur; break; } segI = 0; if (!['walk', 'run', 'gallop', 'walkTurn', 'startStop'].includes(L.preset) && !L.preset.startsWith('turn')) resetRoot(); }
    s = segs[segI];
  }
  // root motion like the sim (charge ramps up; frenzy spin eases in/out)
  let v = s.v || 0, w = s.w || 0;
  if (s.move === 'charge' && s.phase === 'act') v *= Math.min(1, segT / 0.35);
  if (s.move === 'frenzy' && s.phase === 'act') w *= Math.min(1, segT / 0.4, (s.dur - segT) / 0.4);
  rootV = v; rootW = w;
  const r = boss.root;
  r.rotation.y += w * dt;
  r.position.x += Math.sin(r.rotation.y) * v * dt; r.position.z += Math.cos(r.rotation.y) * v * dt;
  // keep the loop inside the lab's bonk wall
  if (s.move === 'charge' && s.phase === 'act') wall.position.set(r.position.x + Math.sin(r.rotation.y) * (v * Math.max(0, s.dur - segT) + 6.2), 2, r.position.z + Math.cos(r.rotation.y) * (v * Math.max(0, s.dur - segT) + 6.2));
  st.speed = v; st.turn = w; st.phase = L.phase;
  st.move = s.move || null; st.movePhase = s.phase || null; st.moveT = segT; st.phaseDur = s.dur; st.params = s.params || null; st.moveU = (s.t0 || 0) + segT;
  st.stunned = !!s.stunned; st.dead = !!s.dead;
  if (L.noParams) st.params = null;
  // aim: the reference kid, or the sweep beam end (±1 rad arc at 12 m)
  const yaw = r.rotation.y;
  if (s.move === 'sweep') { const a = s.phase === 'tele' ? -1.0 : s.phase === 'act' ? -1.0 + 2.0 * THREE.MathUtils.smoothstep(segT / s.dur, 0, 1) : 1.0; st.aim = _aim.set(r.position.x + Math.sin(yaw + a) * 12, 0, r.position.z + Math.cos(yaw + a) * 12); }
  else if (s.move === 'slam') st.aim = _aim.set(r.position.x + Math.sin(yaw) * 4.3, 0, r.position.z + Math.cos(yaw) * 4.3);
  else if (kid) st.aim = _aim.copy(kid.ch.root.position).setY(1.1);
  else st.aim = _aim.set(r.position.x + Math.sin(yaw) * 10, 1, r.position.z + Math.cos(yaw) * 10);
  if (L.hits && Math.floor(simT / 0.7) !== Math.floor((simT - dt) / 0.7)) { const n = Math.floor(simT / 0.7); st.hurt = 0.7; boss.flash(0.8, n % 2 === 1); }
  boss.update(dt, st);
  st.hurt = 0;
  if (kid) { kid.st.time = simT; kid.ch.update(dt, kid.st); }
  for (const k of crowd) { k.st.time = simT; if (Math.floor(simT * 4) !== Math.floor((simT - dt) * 4)) k.ch.trigger('shoot'); k.ch.update(dt, k.st); }
  for (const c of crabs) { c.m.root.position.z += c.sp * dt * 0.2 * Math.sin(simT); c.m.update(dt, { speed: c.sp, turn: 0, dead: false }); }
}
function simulate(sec) { const h = 1 / 60; let t = 0; while (t < sec - 1e-9) { stepSim(h); t += h; } }

// ---------------------------------------------------------------- cameras (relative to the boss root)
const CAMS = {
  front10: { p: [2.6, 2.1, 10.5], t: [0, 2.7, 0] }, q25: { p: [15.5, 5.2, 19.5], t: [0, 2.6, 0] }, q10: { p: [7.5, 3.4, 7.5], t: [0, 2.6, 0.5] },
  side: { p: [14, 3.2, 0.5], t: [0, 2.6, 0] }, sideR: { p: [-14, 3.2, 0.5], t: [0, 2.6, 0] }, back: { p: [-6.5, 4.8, -13], t: [0, 2.8, -0.5] },
  top: { p: [6, 17, 9], t: [0, 1.5, 0] }, kidEye: { p: [3.4, 1.3, 9.5], t: [0, 3.0, 0] }, far30: { p: [-12, 6, 27], t: [0, 2.5, 0] },
  claw: { p: [5.6, 2.3, 8.2], t: [1.4, 1.5, 4.4] }, eyes: { p: [1.9, 4.3, 7.0], t: [0.1, 3.7, 2.9] }, stencil: { p: [7.2, 3.4, -1.0], t: [1.2, 3.2, -1.4] },
  legs: { p: [6.8, 1.1, 1.6], t: [2.4, 0.9, 0] }, belly: { p: [1.3, 1.1, 6.8], t: [0, 1.7, 2.2] }, rear: { p: [-2.6, 3.4, -10], t: [0, 3.3, -3.6] },
  roof: { p: [4.2, 9.2, -4.2], t: [0, 4.9, -1.4] }, crabs: { p: [1.2, 1.3, 10.2], t: [-0.4, 0.35, 7.0] }, tyre: { p: [-5.5, 3.2, 4.2], t: [-1.3, 2.5, 1.2] }, pincer: { p: [-5, 2.4, 8], t: [-1.5, 1.8, 4.4] },
};
const _cp = new THREE.Vector3(), _ct = new THREE.Vector3();
function setCam(name) {
  const c = CAMS[name]; if (!c) return; L.cam = name; L.turntable = false;
  const r = boss.root, o = L.follow ? r.position : new THREE.Vector3(), ry = L.follow ? r.rotation.y : 0;
  _cp.set(...c.p).applyAxisAngle(THREE.Object3D.DEFAULT_UP, ry).add(o); _ct.set(...c.t).applyAxisAngle(THREE.Object3D.DEFAULT_UP, ry).add(o);
  camera.position.copy(_cp); controls.target.copy(_ct); controls.update();
}
let ttA = 0;

// ---------------------------------------------------------------- render + hud
function drawCalls(obj) { let n = 0; obj.traverseVisible((o) => { if (o.isMesh || o.isPoints) n++; }); return n; }
function bossTris() { let n = 0; boss.root.traverseVisible((o) => { if (o.isMesh && o.geometry.index) n += (o.isInstancedMesh ? o.count : 1) * o.geometry.index.count / 3; else if (o.isMesh) n += o.geometry.attributes.position.count / 3; }); return Math.round(n); }
const hud = document.getElementById('hud');
let fps = 0, fpsAcc = 0, fpsN = 0;
function render() {
  sky.position.copy(camera.position);
  // keep the shadow frustum on the boss
  const bp = boss.root.position;
  sun.position.copy(lab._sunDir).multiplyScalar(40).add(bp); sun.target.position.copy(bp); sun.target.updateMatrixWorld();
  if (params.get('bloom') === '0') renderer.render(scene, camera); else composer.render();
  if (!document.body.classList.contains('hide')) {
    const A = boss.anim;
    hud.innerHTML = `<b>${fps.toFixed(0)}</b> fps · calls <b>${renderer.info.render.calls}</b> · scene <b>${(renderer.info.render.triangles / 1000).toFixed(0)}k</b><br>boss draws <b>${drawCalls(boss.root)}</b> · tris <b>${(bossTris() / 1000).toFixed(1)}k</b> (${L.q})<br>` +
      `clip <b>${A.key}</b> τ <b>${A.curT.toFixed(2)}</b> · phase <b>${L.phase}</b><br>v <b>${Math.hypot(A.vel.x, A.vel.z).toFixed(1)}</b> m/s · yaw' <b>${A.yawRate.toFixed(2)}</b> · cad <b>${A.cad.toFixed(2)}</b> Hz<br>t <b>${simT.toFixed(2)}</b>${L.frozen ? ' (frozen)' : ''}`;
  }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  if (!L.frozen) stepSim(dt);
  if (L.turntable) { ttA += dt * 0.35; const r = 16, o = boss.root.position; camera.position.set(o.x + Math.sin(ttA) * r, 5.2, o.z + Math.cos(ttA) * r); controls.target.set(o.x, 2.6, o.z); }
  else if (L.follow && !L.frozen && rootV + Math.abs(rootW) > 0) setCam(L.cam);
  controls.update();
  render();
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- UI
const panel = document.getElementById('panel');
function btn(label, on, fn, title) { const b = document.createElement('button'); b.textContent = label; if (on) b.classList.add('on'); b.onclick = () => { fn(); refreshUI(); }; if (title) b.title = title; return b; }
function sec(title, ...rows) { const d = document.createElement('div'); d.className = 'sec'; const t = document.createElement('div'); t.className = 't'; t.innerHTML = title; d.append(t, ...rows); return d; }
function row(...els) { const d = document.createElement('div'); d.className = 'row'; d.append(...els); return d; }
function refreshUI() {
  if (document.body.classList.contains('hide')) return;
  panel.innerHTML = '<h1>INK<span>WAVE</span> · boss lab</h1>';
  const P = (names) => row(...names.map((n) => btn(n, L.preset === n, () => { play(n); if (['intro', 'death', 'charge', 'slam', 'barrage', 'sweep', 'crablets', 'frenzy', 'roar', 'stun', 'fight'].includes(n)) resetRoot(); })));
  panel.append(
    sec('Locomotion', P(['idle', 'walk', 'run', 'gallop', 'turnL', 'turnR', 'walkTurn', 'startStop'])),
    sec('Moves (tele → act → rec)', P(['slam', 'barrage', 'sweep', 'charge', 'crablets', 'frenzy', 'fight'])),
    sec('Set pieces', P(['intro', 'roar', 'stun', 'death']), row(btn('hurt flinch', false, () => { st.hurt = 0.6; boss.flash(0.6); }), btn('weak hit', false, () => { boss.flash(1, true); }), btn('trigger roar', false, () => boss.trigger('roar')))),
    sec('Phase', row(...[1, 2, 3].map((p) => btn('phase ' + p, L.phase === p, () => { L.phase = p; })))),
    sec('Ink', row(...TEAM_PALETTES.map((p, i) => { const b = btn('', L.pal === i, () => { L.pal = i; applyInk(); }); b.className += ' sw'; b.innerHTML = `<i style="background:${p.b}"></i><i style="background:${p.a}"></i>`; b.title = 'ink / weak'; return b; }), btn('swap', L.swap, () => { L.swap = !L.swap; applyInk(); }))),
    sec('Camera', row(...Object.keys(CAMS).map((c) => btn(c, L.cam === c && !L.turntable, () => setCam(c)))), row(btn('turntable', L.turntable, () => { L.turntable = !L.turntable; }), btn('follow', L.follow, () => { L.follow = !L.follow; }))),
    sec('Light', row(...Object.keys(LIGHTS).map((n) => btn(n, lab.light === n, () => setLight(n))))),
    sec('Scene', row(btn('ref kid', L.kid, () => { L.kid = !L.kid; makeKid(); }), btn('8 kids', L.crowd, () => { L.crowd = !L.crowd; makeCrowd(); }), btn('crablets', L.crablets, () => { L.crablets = !L.crablets; makeCrabs(); }), btn('freeze', L.frozen, () => { L.frozen = !L.frozen; }), btn('step 1/10', false, () => { simulate(0.1); render(); })),
      row(...['low', 'medium', 'high', 'ultra'].map((q) => btn(q, L.q === q, () => { L.q = q; makeBoss(); play(L.preset); })))),
  );
}
function applyInk() { const c = inkColors(); boss.setInk(new THREE.Color(c.ink)); boss.setWeak(new THREE.Color(c.weak)); if (kid) kid.ch.setColor(c.weak); for (const k of crowd) k.ch.setColor(c.weak); }
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); boss.fx.setViewportHeight(renderer.domElement.height, camera.fov); });

// ---------------------------------------------------------------- scripting API (headless capture)
Object.assign(lab, {
  THREE, st, L, scene, camera, renderer, play, cam: setCam, setLight, simulate,
  /** reset + play a preset for t seconds at 60 Hz, freeze and render. o = { preset, t, cam, phase, pal, swap, light, q, kid, crowd, crablets } */
  go(o = {}) {
    L.frozen = true;
    if (o.q && o.q !== L.q) L.q = o.q;
    L.hits = !!o.hits; L.noParams = !!o.noParams; L.phase = o.phase ?? 1; L.pal = o.pal ?? L.pal; L.swap = !!o.swap; L.kid = o.kid ?? true; L.crowd = !!o.crowd; L.crablets = !!o.crablets; L.follow = o.follow ?? true;
    if (o.light && o.light !== lab.light) setLight(o.light);
    makeBoss(); makeKid(); makeCrowd(); makeCrabs(); simT = 0;
    resetRoot();
    play(o.preset || 'idle', o.loop ?? false);
    simulate(o.t ?? 1);
    setCam(o.cam || L.cam);
    if (o.camPos) { camera.position.set(...o.camPos); controls.target.set(...(o.camTarget || [0, 2.6, 0])); controls.update(); }
    refreshUI(); render();
    return lab.info();
  },
  step(sec) { simulate(sec); if (L.follow) setCam(L.cam); render(); return +simT.toFixed(3); },
  render() { render(); },
  /** filmstrip: n frames every dt seconds from the current state → PNG data URL (grid cols × rows, cell w × h) */
  film({ n = 24, dt = 0.1, cols = 6, w = 400, h = 225, label = '' } = {}) {
    const rows = Math.ceil(n / cols);
    const cv = document.createElement('canvas'); cv.width = cols * w; cv.height = rows * h + 28; const x = cv.getContext('2d');
    x.fillStyle = '#111'; x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = '#fff'; x.font = '600 16px Rubik, sans-serif'; x.fillText(label, 8, 19);
    const src = renderer.domElement;
    for (let i = 0; i < n; i++) {
      if (i) simulate(dt);
      if (L.follow) setCam(L.cam);
      render();
      const cx = (i % cols) * w, cy = 28 + Math.floor(i / cols) * h;
      x.drawImage(src, cx, cy, w, h);
      x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(cx, cy, 150, 18); x.fillStyle = '#fff'; x.font = '12px monospace';
      x.fillText(`${simT.toFixed(2)}s ${boss.anim.key}`, cx + 4, cy + 13);
    }
    return cv.toDataURL('image/jpeg', 0.86);
  },
  info() {
    const A = boss.anim;
    return { calls: renderer.info.render.calls, bossDraws: drawCalls(boss.root), bossTris: bossTris(), buildTris: boss.tris, clip: A.key, t: +simT.toFixed(3), q: L.q };
  },
  /** foot-plant probe: planted feet world drift while planted (sliding check) */
  feet() { return boss.anim.legs.map((l) => ({ i: l.i, swing: l.swing, x: +l.foot.x.toFixed(3), y: +l.foot.y.toFixed(3), z: +l.foot.z.toFixed(3), err: +l.err.toFixed(2) })); },
  /** foot sliding probe: simulate `sec` and sum how far each PLANTED foot moves in world space (should be ~0) */
  slide(sec = 3) {
    const legs = boss.anim.legs, prev = legs.map((l) => l.foot.clone()), was = legs.map((l) => l.swing), sum = legs.map(() => 0);
    const names = ['footL0', 'footL1', 'footL2', 'footR0', 'footR1', 'footR2'], tip = names.map((n) => boss.getSocket(n)), tsum = legs.map(() => 0), gap = legs.map(() => 0);
    const h = 1 / 60; let steps = 0; const _t = new THREE.Vector3();
    for (let t = 0; t < sec; t += h) {
      stepSim(h); steps++;
      legs.forEach((l, i) => {
        boss.getSocket(names[i], _t);
        if (!l.swing && !was[i]) { sum[i] += l.foot.distanceTo(prev[i]); tsum[i] += _t.distanceTo(tip[i]); gap[i] = Math.max(gap[i], _t.distanceTo(l.foot)); }
        prev[i].copy(l.foot); tip[i].copy(_t); was[i] = l.swing;
      });
    }
    render();
    return { steps, targetSlideCm: sum.map((v) => +(v * 100).toFixed(1)), tipSlideCm: tsum.map((v) => +(v * 100).toFixed(1)), maxTipGapCm: gap.map((v) => +(v * 100).toFixed(1)), footsteps: lab.events.filter((e) => e[0] === 'foot').length };
  },
  popCrab(i = 0) { const c = crabs[i]; if (c) c.m.pop(); },
  crabInfo() { return crabs.map((c) => ({ tris: c.m.tris, draws: drawCalls(c.m.root) })); },
  /** frame-time probe with the real render loop: returns ms/frame (render + sim) over n frames */
  perf(n = 120) { const t0 = performance.now(); for (let i = 0; i < n; i++) { stepSim(1 / 60); render(); } renderer.getContext().finish(); return +((performance.now() - t0) / n).toFixed(2); },
});
Object.defineProperty(lab, 'boss', { get: () => boss });
Object.defineProperty(lab, 'simT', { get: () => simT });
window.lab = lab;

// ---------------------------------------------------------------- boot
setLight(params.get('light') || 'day');
makeBoss(); makeKid();
play(params.get('preset') || 'idle');
setCam(params.get('cam') || 'q25');
refreshUI();
if (params.get('go')) { try { lab.go(JSON.parse(params.get('go'))); } catch (e) { console.error('bad go param', e); } }
lab.ready = true;
requestAnimationFrame(frame);
