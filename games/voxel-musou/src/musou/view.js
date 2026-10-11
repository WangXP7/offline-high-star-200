// Musou presentation (render-only; reads game.musou / hero state, never writes sim state):
//  · grade (display space, DOM layers between the canvas and the HUD, so ACES can't swallow them): 1–2 frame flash, a
//    cold teal-night dim that lifts during the chase run, a screen-blended teal-white burst at contact and at the
//    finisher (1–2 frame peak, no hold, so the launched bodies keep their contrast); radial light rays at
//    contact as an additive HDR quad (bloom + retro dither like everything else), depth-tested behind the contact point;
//    a brief teal fill light on the camera side of the fan; the cool tint bridges the dark intro into the contact and is
//    gone within 0.5 s, so the payoff plays at the normal golden-hour contrast.
//  · floating light motes (streak during the chase), rising energy ribbons, electric aura in the close-up
//  · the voxel azure dragon (path shared with the sim hits: dragonAt), shedding light-voxel shards, dissolving at the end
//  · finisher lightning ring band (DW9 ring wave), calligraphy cut-in (無雙 + seal) over the close-up (overlay.js, frame-driven)
// Zhao Yun's look (ZY_LOOK) is the default; another kit on the shared timeline (a scripted Musou: src/musou/scripted.js,
// with mu.toWorld / waveR / t / active) passes its own look: { dragon: false = no dragon | a COL-like palette (+ shell, ink) = his own dragon, cut: {sub, seal, css} (overlay.js),
// pal: its light colours (keys below; bolt null = no lightning) } — src/chars/defkit.js.
import * as THREE from 'three';
import { on } from '../core/events.js';
import { vrng, hash01 } from '../core/rng.js';
import { MUSOU, dragonAt, dragonArc } from './musou.js';
import { createOverlay, ramp } from './overlay.js';
import { makePool } from '../vfx/vfx.js';
import { ground } from '../world/map.js';
import { dragonSight } from '../crowd/view.js';

const _m = new THREE.Matrix4(), _l = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _v = new THREE.Vector3(), _c = new THREE.Color();
const _cam = new THREE.Vector3();                           // camera in the view's sim space (y above the ground under him)
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0), UP = new THREE.Vector3(0, 1, 0), FWD = new THREE.Vector3(0, 0, 1);
const { clamp } = THREE.MathUtils;

/** Box geometry with baked per-face shade (top bright, bottom dark) so flat-coloured voxels still read as solids. */
function shadedBox() {
  const g = new THREE.BoxGeometry(1, 1, 1), n = g.attributes.normal, col = new Float32Array(n.count * 3);
  for (let i = 0; i < n.count; i++) {
    const k = n.getY(i) > 0.5 ? 1 : n.getY(i) < -0.5 ? 0.42 : Math.abs(n.getX(i)) > 0.5 ? 0.72 : 0.86;
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

function instanced(scene, geo, mat, n) {
  const m = new THREE.InstancedMesh(geo, mat, n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false; m.visible = false;
  for (let i = 0; i < n; i++) { m.setMatrixAt(i, ZERO); m.setColorAt(i, _c.setRGB(1, 1, 1)); }
  scene.add(m);
  return m;
}

// ---------------------------------------------------------------- dragon layout
const NS = 46, SP = 0.3, NECK = 1.1, GIRTH = 1.4;        // body segments, spacing (m), head→first segment gap, body scale
// (r2: girth ×1.4 and a bigger head — from the flank payoff camera the dragon runs 8–14 m away and read as a thin ribbon)
const COL = {
  // azure 青龍: saturated enough that ACES keeps the hue; only fins/belly/whiskers/eyes run hot enough to bloom
  // (r2: fins/belly/white a notch lower — the post's cool-biased bloom turned the finisher coil into a white column)
  body: [0.02, 0.12, 0.52], scale: [0.04, 0.27, 0.82],   // (r3 acc: deeper azure — bright fins / belly / eyes + ink outline carry the form)
  belly: [0.4, 0.72, 0.92], fin: [0.42, 0.95, 1.3], eye: [3.0, 2.2, 0.5],
  horn: [1.4, 1.15, 0.6], white: [1.0, 1.12, 1.2], whisker: [0.6, 1.15, 1.55], mouth: [0.32, 0.01, 0.03],
};
function dragonParts(COL) {                                 // COL: the look's dragon palette
  const parts = [];            // { seg (-1 head), off, size, dir?, col, dyn? }
  const add = (seg, off, size, col, dir, dyn) => parts.push({ seg, off, size, col, dir, dyn });
  for (let k = 0; k < NS; k++) {
    const u = k / (NS - 1), w = GIRTH * (k < 4 ? 0.52 + k * 0.05 : 0.14 + 0.58 * Math.pow(1 - (k - 4) / (NS - 4), 0.75));
    add(k, [0, 0, 0], [w, w * 0.86, SP * 1.4], k % 2 ? COL.scale : COL.body);
    add(k, [0, -w * 0.42, 0], [w * 0.72, w * 0.26, SP * 1.25], COL.belly);
    if (u < 0.93) add(k, [0, w * 0.52, -SP * 0.1], [w * 0.16, w * (k % 2 ? 0.42 : 0.72), SP * 0.6], COL.fin, [0, 0.5, -1]);
    if (k === 5 || k === 21) for (const sx of [1, -1]) {                           // legs with claws
      add(k, [sx * w * 0.62, -w * 0.3, 0], [0.18, 0.18, 0.62], COL.body, [sx * 0.7, -0.8, -0.5]);
      add(k, [sx * w * 0.95, -w * 0.72, -0.12], [0.34, 0.1, 0.28], COL.white);
    }
  }
  for (const [x, dy] of [[0, 0.3], [0.12, 0.12], [-0.12, 0.12]]) add(NS - 1, [x, dy, -0.25], [0.05, 0.42, 0.34], COL.fin, [x * 3, 1, -1.2]);
  const H = -1;
  add(H, [0, 0.05, 0], [0.64, 0.52, 0.64], COL.scale);
  add(H, [0, 0.31, 0.12], [0.68, 0.12, 0.32], COL.body);        // brow (fx r5: dark, was fin — a bright cyan slab that bloomed over the face)
  add(H, [0, -0.02, 0.56], [0.46, 0.3, 0.62], COL.body);
  add(H, [0, 0.09, 0.88], [0.3, 0.14, 0.12], COL.white);
  add(H, [0, -0.2, 0.62], [0.4, 0.06, 0.46], COL.white);
  add(H, [0, -0.36, 0.44], [0.4, 0.12, 0.64], COL.belly, null, 'jaw');   // (fx r5: pale jaw, was body blue — the open jaws read as one blue block)
  add(H, [0, -0.28, 0.48], [0.34, 0.05, 0.42], COL.white, null, 'jaw');
  add(H, [0, -0.26, 0.42], [0.36, 0.14, 0.5], COL.mouth);        // fx r5: dark-red maw between the jaws (the open mouth read as a gap)
  for (const sx of [1, -1]) {
    add(H, [sx * 0.31, 0.19, 0.22], [0.12, 0.15, 0.2], COL.eye);   // (fx r5: x 0.27 → 0.31, bigger — the eyes sat buried inside the skull box)
    add(H, [sx * 0.375, 0.19, 0.25], [0.02, 0.13, 0.06], COL.mouth.map((v) => v * 0.1));   // fx r5: slit pupil
    add(H, [sx * 0.2, 0.52, -0.46], [0.09, 0.09, 0.8], COL.horn, [sx * 0.25, 0.6, -1]);
    add(H, [sx * 0.27, 0.72, -0.62], [0.07, 0.07, 0.3], COL.horn, [sx * 0.2, 1, -0.1]);
    add(H, [sx * 0.4, -0.5, 0.82], [0.035, 0.035, 0.95], COL.whisker, [sx * 0.35, -1, 0.15], 'whisker');   // (fx r5: hang off the snout, framing the maw — swept back they cut across the ¾ face)
  }
  for (let j = 0; j < 5; j++) { const x = (j - 2) * 0.14; add(H, [x, 0.12 + (2 - Math.abs(j - 2)) * 0.06, -0.52], [0.07, 0.2, 0.6], COL.fin, [x * 2, 0.35, -1]); }   // mane
  add(H, [0, -0.52, 0.2], [0.2, 0.05, 0.42], COL.white, [0, -0.5, -1]);
  return parts;
}
const HEAD_SCALE = 2.3;

/** Zhao Yun's look: the azure dragon, his cut-in, teal light. pal (linear HDR unless noted): rays (contact rays), ring (finisher
 *  band), bolt (finisher lightning, null = none), burst (payoff shards), ko (musou KO shards), glow (burst point light hex),
 *  mote, rib / rib2 (rising ribbons), aura (close-up crackle), dim (vignette stops, sRGB 0-255), cool (the cut's tint), wash
 *  (payoff whiteout stops, sRGB 0-255). */
export const ZY_LOOK = {
  dragon: true,
  cut: { sub: '常山 趙子龍', seal: '龍膽', css: {
    big: 'color: #f7f3ea; text-shadow: 0 0 2px #0b1418, 6px 8px 0 rgba(4,10,14,.55), 0 0 28px rgba(110,220,255,.55);',
    sub: 'color: #d8f4ff; text-shadow: 0 0 10px rgba(80,200,255,.7), 2px 2px 0 rgba(0,0,0,.6);' } },
  pal: { rays: [0.42, 0.95, 1.25], ring: [0.75, 1.6, 2.1], bolt: [1.2, 2.0, 2.6], burst: [0.5, 1.3, 1.9], ko: [0.3, 0.75, 1.05], glow: 0x9fefff,
    mote: [1.1, 1.25, 1.4], rib: [0.35, 0.9, 1.6], rib2: [0.95, 0.4, 1.6], aura: [0.32, 0.66, 0.92],
    dim: [[150, 182, 222], [84, 118, 165], [48, 72, 112]], cool: [186, 222, 240], wash: [[246, 255, 255], [214, 246, 250], [160, 214, 228]] },
};

export function createMusouView(parent, game, camera, look = ZY_LOOK) {
  const mu = game.musou, hero = game.hero, L = look.pal;
  const scene = new THREE.Group();                           // everything 3D lives here, so dispose() removes it all
  parent.add(scene);
  const addMat = () => new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });

  // ---- grade quads
  const addU = { uC: { value: new THREE.Vector2(0.5, 0.5) }, uRays: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 16 / 9 }, uDepth: { value: -1 },
    uCol: { value: new THREE.Color(...L.rays) } };
  // fullscreen triangle; uDepth: NDC depth of the quad; depth-tested, so whatever stands in front of it (launched bodies)
  // cuts out as a silhouette
  const addGeo = new THREE.BufferGeometry();
  addGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const add = new THREE.Mesh(addGeo, new THREE.ShaderMaterial({ uniforms: addU, depthWrite: false, transparent: true, fog: false,
    blending: THREE.AdditiveBlending,
    vertexShader: 'uniform float uDepth; varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, uDepth, 1.0); }',
    fragmentShader: `
    uniform vec2 uC; uniform float uRays, uTime, uAspect; uniform vec3 uCol; varying vec2 vUv;
    void main() {
      vec2 p = vUv - uC; p.x *= uAspect;
      float r = length(p), a = atan(p.y, p.x + 1e-5);                      // (pow bases clamped: pow(<0) is NaN → bloom smears it)
      float ray = pow(max(0.0, 0.5 + 0.5 * sin(a * 19.0 + uTime * 0.9)), 6.0) + 0.8 * pow(max(0.0, 0.5 + 0.5 * sin(a * 31.0 - uTime * 1.6 + 1.7)), 9.0)
                + 0.6 * pow(max(0.0, 0.5 + 0.5 * sin(a * 7.0 + 2.3 + uTime * 0.3)), 4.0);
      float core = exp(-r * r * 60.0);
      float rays = ray * smoothstep(0.05, 0.3, r) * (1.0 - 0.45 * clamp(r, 0.0, 1.0)) + core * 0.8;
      gl_FragColor = vec4(uCol * uRays * rays, 1.0);
    }` }));
  add.frustumCulled = false; add.renderOrder = 1e6 + 1; add.visible = false;
  scene.add(add);
  const ov = createOverlay(look.cut);
  const { dim: dimEl, wash: washEl, setStyle, show } = ov;

  // ---- light voxels: motes | ribbons | aura | ring wall
  const NM = 220, NH = 72, NA = 48, NR = 144, H0 = NM, A0 = NM + NH, R0 = A0 + NA;
  // r3: depth-writing, so the post's depth-driven DOF blurs each light voxel by its own depth: without it they took the
  // depth of whatever lay behind them (far crowd, sky) and every mote / aura crackle / ring voxel became a max-size soft
  // disc (the intro's bokeh blobs, the close-up's blue smears)
  const fx = instanced(scene, new THREE.BoxGeometry(1, 1, 1), Object.assign(addMat(), { depthWrite: true }), R0 + NR);

  // ---- light-voxel shards (dragon trail, contact/finisher bursts, musou KOs): vfx.js glow-shard pool (sim space, so it
  // sits in the scene, not in the ground-lifted group), full size until the last 40 % of life, none at the lens (DoF made
  // them cyan blobs; fx r4: 4–8 m fade)
  const shards = makePool(parent, 700, Object.assign(addMat(), { depthWrite: true }), () => game.frame,   // (r3: depth for the DOF, as fx)
    { drag: 2.2, shrink: 2.5, near: (p) => ramp(p.distanceTo(camera.position), 4, 8) });
  const shard = (x, y, z, vx, vy, vz, life, size, r, g, b) => shards.spawn(x, y, z, vx, vy, vz, life, size, 4, r, g, b);
  const burst = (x, y, z, n, spd, up, size = 0.12, k = 1) => {
    for (let i = 0; i < n; i++) {
      const a = vrng.range(0, 6.283), s = spd * vrng.range(0.3, 1), w = vrng.range(0.6, 1.1) * k;
      shard(x, y, z, Math.cos(a) * s, vrng.range(0.2, 1) * up, Math.sin(a) * s, vrng.range(0.35, 0.8), size * vrng.range(0.5, 1.3), L.burst[0] * w, L.burst[1] * w, L.burst[2] * w);
    }
  };

  // ---- dragon
  const DC = look.dragon === true ? COL : look.dragon || COL;   // B4: a kit's own dragon palette (Guan Yu's jade 青龍)
  const parts = dragonParts(DC);
  const dragon = instanced(scene, shadedBox(), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }), parts.length);
  const local = parts.map((p) => new THREE.Matrix4().compose(_p.set(...p.off), _q.setFromUnitVectors(FWD, p.dir ? _v.set(...p.dir).normalize() : FWD), _s.set(...p.size)));
  parts.forEach((p, i) => dragon.setColorAt(i, _c.setRGB(...p.col)));
  // glow shell: every dragon voxel again, 1.3× larger, additive rim light (view-facing faces faint, grazing faces hot), so
  // the azure body carries a living halo and reads as a spirit of light against the crowd instead of flat blue boxes
  const shell = instanced(scene, new THREE.BoxGeometry(1, 1, 1), new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(...(DC.shell || [0.2, 0.75, 1.2])) }, uK: { value: 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `varying float vRim, vNear;
      void main() {
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vec3 n = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        vRim = 1.0 - abs(dot(n, normalize(cameraPosition - wp.xyz)));
        vec4 mv = viewMatrix * wp; vNear = smoothstep(2.5, 6.0, -mv.z);   // coils at the finisher lens stay plain voxels
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uCol; uniform float uK; varying float vRim, vNear;
      void main() { gl_FragColor = vec4(uCol * (0.04 + 0.7 * vRim * vRim * vRim) * uK * vNear, 1.0); }` }), parts.length);
  const SHELL = new THREE.Matrix4().makeScale(1.14, 1.14, 1.08);   // (r3 acc: inside the ink outline, was 1.3)
  // fx r3 acc: an ink outline (the voxels again, 1.24× larger — outside the glow shell, back faces only, near-black navy) so at contact the head
  // (jaw, eyes, horns) and the scaled body read as a solid silhouette against the launched fan and the sky, not as cyan
  // translucent blobs inside their own glow
  const ink = instanced(scene, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: DC.ink ?? 0x03081a, side: THREE.BackSide, fog: false }), parts.length);
  const INK = new THREE.Matrix4().makeScale(1.24, 1.24, 1.12);
  // fx r5: drawn after the contact rays quad (transparent list, higher renderOrder), so the rays erupt behind the dragon
  // instead of washing its face pale teal (the quad sits 3.5 m past the contact point, the head rears 5–8 m out)
  for (const [m, o] of [[ink, 2], [dragon, 3], [shell, 4]]) { m.renderOrder = 1e6 + o; m.material.transparent = true; }
  // finisher lightning: jagged bolts striking down onto the ring wave (stretched light voxels, re-rolled every 3 frames)
  const NB = 5, BSEG = 9;
  const bolts = instanced(scene, new THREE.BoxGeometry(1, 1, 1), addMat(), NB * BSEG);
  const bases = Array.from({ length: NS + 1 }, () => new THREE.Matrix4());
  const vis = new Uint8Array(NS + 1), born = new Uint8Array(NS + 1);
  const P3 = [0, 0, 0], Q3 = [0, 0, 0], W3 = [0, 0, 0], V3 = [0, 0, 0];

  // ---- burst light: the contact light fills the launched fan teal from the camera side (always in the scene at 0 so the
  // lit materials compile with it at boot instead of hitching mid-Musou)
  const glow = new THREE.PointLight(L.glow, 0, 20, 1.4);
  scene.add(glow);

  // ---- events
  let tv = -1, time = 0, startX = 0, startZ = 0;            // tv: musou frame (continues past the end for fades)
  let contactF = -99, burstF = -99;                          // game frames of the payoff events (flashes ignore hitstop)
  on('musou:start', (e) => { tv = 0; startX = e.x; startZ = e.z; });
  // fx r1: fewer, dimmer light shards at the payoffs (45 + 30 HDR shards bloomed into a cyan cloud over the launch fan)
  on('musou:hit', (e) => { if (e.stage === 'contact') { contactF = game.frame; burst(e.x, e.y, e.z, 26, 11, 7, 0.11, 0.35); } });
  on('musou:burst', (e) => { burstF = game.frame; burst(e.x, 0.6, e.z, 18, 18, 9, 0.11, 0.26); });
  // fx r4: one sub-bloom shard per KO (two HDR ones per KO bloomed + DOF'd into the big cyan balls over the contact fan)
  on('ko', (e) => { if (mu.active) shard(e.x, e.y, e.z, e.dx * 5 + vrng.range(-2, 2), vrng.range(2, 7), e.dz * 5 + vrng.range(-2, 2), vrng.range(0.3, 0.55), vrng.range(0.05, 0.09), ...L.ko); });
  on('scenario', () => { tv = -1; shards.clear(); });

  function hideAll() {
    add.visible = fx.visible = dragon.visible = shell.visible = ink.visible = bolts.visible = false;
    glow.intensity = 0; dragonSight.w = 0;
    ov.hide();
  }

  /** Orthonormal frame at arc length a along the dragon path (world), rolled by `roll`; returns false if unborn. */
  function frameAt(a, roll, M) {
    mu.toWorld(dragonAt(a, P3), W3);
    mu.toWorld(dragonAt(a + 0.08, Q3), V3);
    _z.set(V3[0] - W3[0], V3[1] - W3[1], V3[2] - W3[2]).normalize();
    mu.toWorld(dragonAt(a - 0.08, Q3), V3);
    _z.add(_v.set(W3[0] - V3[0], W3[1] - V3[1], W3[2] - V3[2]).normalize()).normalize();
    _x.crossVectors(UP, _z);
    if (_x.lengthSq() < 1e-6) _x.set(1, 0, 0);
    _x.normalize(); _y.crossVectors(_z, _x);
    const c = Math.cos(roll), s = Math.sin(roll);
    _v.copy(_x).multiplyScalar(c).addScaledVector(_y, s); _y.multiplyScalar(c).addScaledVector(_x, -s); _x.copy(_v);
    M.makeBasis(_x, _y, _z).setPosition(W3[0], W3[1], W3[2]);
  }

  function updateDragon(t, dt) {
    const s = (t - MUSOU.contact) / 60;
    if (s < 0 || s > 1.2) { dragon.visible = shell.visible = ink.visible = false; dragonSight.w = 0; return; }
    dragon.visible = shell.visible = ink.visible = true;
    const A = dragonArc(s);
    const dissolve = ramp(s, 1.0, (MUSOU.end - MUSOU.contact) / 60);           // tail → head, done at control return
    const alive = Math.round((NS + 1) * (1 - dissolve));                          // j = 0 head, 1..NS body
    // fx r5: over the contact the head rears 1.2 m above the launched fan (neck tapering over 6 segments) and turns a ¾ face
    // to the lens: it surged straight away from the flank camera at chest height, so the contact frames only showed the
    // back of its skull, a blue cube behind the flying bodies. View only (the sim's hit gate reads the path height).
    const rear = ramp(s, 0.02, 0.1) * (1 - ramp(s, 0.3, 0.45));
    _cam.copy(camera.position).setY(camera.position.y - scene.position.y);
    for (let j = 0; j <= NS; j++) {
      const a = j ? A - NECK - (j - 1) * SP : A;
      born[j] = a >= 0; vis[j] = born[j] && j < alive;
      if (!born[j]) continue;
      frameAt(a, j ? Math.sin(j * 0.45 - time * 9) * 0.35 : 0, bases[j]);
      if (j < 6) bases[j].elements[13] += 1.2 * rear * (1 - j / 6);
      if (!j && rear > 0) {
        const e = bases[0].elements;
        _p.set(e[12], e[13], e[14]); _y.subVectors(_cam, _p).normalize();                  // to the lens, swung 35° off it (¾ face)
        _y.applyAxisAngle(UP, 0.6 * (Math.sign(_y.z * e[8] - _y.x * e[10]) || 1));
        _z.set(e[8], e[9], e[10]).lerp(_y, rear).normalize();
        _x.crossVectors(UP, _z).normalize(); _y.crossVectors(_z, _x);
        bases[0].makeBasis(_x, _y, _z).setPosition(_p);
      }
      if (!j) dragonSight.set(bases[0].elements[12], bases[0].elements[13] + scene.position.y, bases[0].elements[14], 2.1 * rear);   // crowd cuts the fan between lens and head
      // the head grows to full size as it surges off the spear tip (full size right at the chase lens was a white blob)
      // (fx r4: 0.7 → full by s 0.15 — at 0.5 the head was a blue speck through the contact frames)
      if (!j) { const k = HEAD_SCALE * (0.7 + 0.3 * ramp(s, 0.02, 0.15)); bases[j].multiply(_l.makeScale(k, k, k)); }
    }
    // shards: trail off the body, burst where segments dissolve
    const n = Math.round(dt * 60 * (s < 0.4 ? 1.5 : 4));                        // (r3 acc: fewer at contact — the head must read)
    for (let i = 0; i < n; i++) {
      const j = vrng.int(0, NS);
      if (!vis[j]) continue;
      _p.setFromMatrixPosition(bases[j]);
      shard(_p.x + vrng.range(-0.3, 0.3), _p.y + vrng.range(-0.3, 0.3), _p.z + vrng.range(-0.3, 0.3), vrng.range(-1, 1), vrng.range(0, 1.5), vrng.range(-1, 1),
        vrng.range(0.25, 0.55), vrng.range(0.05, 0.12), 0.2, 0.7, 1.6);
    }
    if (dissolve > 0) for (let j = alive; j < Math.min(NS + 1, alive + 3); j++) {
      if (!born[j]) continue;
      _p.setFromMatrixPosition(bases[j]);
      for (let i = 0; i < 2; i++) shard(_p.x, _p.y, _p.z, vrng.range(-4, 4), vrng.range(0, 5), vrng.range(-4, 4), vrng.range(0.3, 0.55), vrng.range(0.08, 0.16), 0.4, 1.1, 1.7);
    }
    // head wake + spiral streamers: bright shards stream off the head and wind round the body (DW8 dragon musou)
    if (vis[0]) {
      _p.setFromMatrixPosition(bases[0]);
      // once the contact fill has faded the burst light rides the head: the crowd it surges through lights up teal
      // (one light for both, so the lit materials keep their light count)
      if (glow.intensity < 1) { glow.position.copy(_p); glow.intensity = 12 * (1 - dissolve) * ramp(s, 0.2, 0.3); }
      const nh = Math.round(dt * 60 * (s < 0.4 ? 0 : 3));                        // (fx r4: no wake over the contact — the head reads first)
      for (let i = 0; i < nh; i++) shard(_p.x + vrng.range(-0.4, 0.4), _p.y + vrng.range(-0.4, 0.4), _p.z + vrng.range(-0.4, 0.4),
        vrng.range(-1.5, 1.5), vrng.range(-0.5, 2), vrng.range(-1.5, 1.5), vrng.range(0.2, 0.4), vrng.range(0.1, 0.2), 0.7, 1.6, 2.2);
    }
    const nsp = Math.round(dt * 60 * 4);
    for (let i = 0; i < nsp; i++) {
      const j = 1 + ((time * 40 + i * 7) | 0) % NS;
      if (!vis[j]) continue;
      const th = time * 14 + j * 0.8 + i * 3.1, rr = 0.9 * GIRTH;
      _v.set(Math.cos(th) * rr, Math.sin(th) * rr, 0).applyMatrix4(bases[j]);
      shard(_v.x, _v.y, _v.z, vrng.range(-0.3, 0.3), vrng.range(0, 0.6), vrng.range(-0.3, 0.3), vrng.range(0.25, 0.45), vrng.range(0.05, 0.09), 0.5, 1.4, 2.0);
    }
    shell.material.uniforms.uK.value = (0.14 + 0.26 * ramp(s, 0.35, 0.6)) * (1 - 0.7 * dissolve) * (0.85 + 0.15 * Math.sin(time * 17));   // (fx r1: 0.7× — a halo, not a fog; r3 acc: half while it surges through the fan)
    const jaw = 0.18 + 0.22 * Math.max(0, Math.sin(time * 7)) + 0.3 * rear, wave = Math.sin(time * 11);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i], j = p.seg + 1;
      if (!vis[j]) { dragon.setMatrixAt(i, ZERO); shell.setMatrixAt(i, ZERO); ink.setMatrixAt(i, ZERO); continue; }
      let L = local[i];
      if (p.dyn === 'jaw') { _q.setFromAxisAngle(_x.set(1, 0, 0), jaw); L = _l.compose(_p.set(p.off[0], p.off[1] - jaw * 0.15, p.off[2]), _q, _s.set(...p.size)); }
      else if (p.dyn === 'whisker') { _q.setFromUnitVectors(FWD, _v.set(p.dir[0], p.dir[1] + wave * 0.4 * Math.sign(p.dir[0]), p.dir[2]).normalize()); L = _l.compose(_p.set(...p.off), _q, _s.set(...p.size)); }
      dragon.setMatrixAt(i, _m.multiplyMatrices(bases[j], L));
      ink.setMatrixAt(i, _l.multiplyMatrices(_m, INK));
      shell.setMatrixAt(i, _m.multiply(SHELL));
    }
    dragon.instanceMatrix.needsUpdate = true; shell.instanceMatrix.needsUpdate = true; ink.instanceMatrix.needsUpdate = true;
  }

  function updateFx(t) {
    const M = MUSOU;
    let any = false;
    // motes: frozen-time dust of light around the start point; streak past the camera during the chase run
    // (r3: none in the close-up — 1.7 m from the lens with the focus on his face, every mote 3–8 m behind him was a
    // max-size DOF disc; they switch off/on exactly on the hard cuts)
    const moteK = t >= M.closeup && t < M.chase ? 0 : ramp(t, 1, 5) * (1 - ramp(t, M.chase + 4, M.chase + 20));
    const streak = ramp(t, M.chase, M.chase + 6) * 7;
    const cam = _cam.copy(camera.position).setY(camera.position.y - scene.position.y), dist = (x, y, z) => Math.hypot(x - cam.x, y - cam.y, z - cam.z);
    const near = (x, y, z) => ramp(dist(x, y, z), 0.9, 2.2);                                       // no blocks in the lens
    const hy = hero.yaw, still = t < M.chase;
    for (let i = 0; i < NM; i++) {
      if (moteK <= 0) { fx.setMatrixAt(i, ZERO); continue; }
      const r = 0.6 + 7.5 * Math.pow(hash01(i, 11), 1.6), a = hash01(i, 12) * 6.283;
      const y = ((hash01(i, 13) * 3.8 + time * (0.12 + 0.1 * hash01(i, 14))) % 3.8) + 0.1;
      const x = startX + Math.cos(a) * r + Math.sin(time * 0.7 + i) * 0.15, z = startZ + Math.sin(a) * r;
      // r3: frozen-time motes are small crisp specks (DW8 anchor), not bokeh: nothing within 2.5 m of the lens (DOF + bloom
      // turned near motes into big white discs that lifted the dark intro to 1.3× gameplay luma), ≤ 3 cm, below bloom level
      const w = (still ? 0.018 + 0.012 * hash01(i, 15) : 0.025 + 0.03 * hash01(i, 15)) * moteK * ramp(dist(x, y, z), 2.5, 4.5);
      _q.setFromAxisAngle(UP, hy);
      fx.setMatrixAt(i, _m.compose(_p.set(x, y, z), _q, _s.set(w, w, w * (1 + streak))));
      const b = still ? 0.55 + 0.25 * hash01(i, 16) : 0.6 + 0.7 * hash01(i, 16);
      fx.setColorAt(i, _c.setRGB(L.mote[0] * b, L.mote[1] * b, L.mote[2] * b));
      any = true;
    }
    // energy ribbons rising around him (pose) + electric aura (close-up)
    const ribK = ramp(t, 2, 8) * (1 - ramp(t, M.closeup - 6, M.closeup));
    for (let i = 0; i < NH; i++) {
      const strand = i % 3, j = (i / 3) | 0, u = ((j / 24 + time * 0.7) % 1);
      if (ribK <= 0) { fx.setMatrixAt(H0 + i, ZERO); continue; }
      const ang = strand * 2.094 + u * 7 + time * 2.5, rr = 0.8 - 0.25 * u;
      const px = hero.x + Math.cos(ang) * rr, py = 0.1 + u * 2.6, pz = hero.z + Math.sin(ang) * rr, w = 0.036 * ribK * (1 - u * 0.6) * near(px, py, pz);
      fx.setMatrixAt(H0 + i, _m.compose(_p.set(px, py, pz), _q.identity(), _s.set(w, w * 3.2, w)));
      // r3: thin rising streaks just under bloom level (at 1.9 HDR they bloomed into soft blue balls over the dark pose)
      const rc = strand === 2 ? L.rib2 : L.rib, k = 0.62 * (1.2 - u);
      fx.setColorAt(H0 + i, _c.setRGB(rc[0] * k, rc[1] * k, rc[2] * k));
      any = true;
    }
    const auraK = ramp(t, M.closeup, M.closeup + 3) * (1 - ramp(t, M.pullback + 4, M.chase));
    const fr = Math.floor(t / 2);
    for (let i = 0; i < NA; i++) {
      const on = auraK > 0 && hash01(i, fr, 3) < 0.55;
      if (!on) { fx.setMatrixAt(A0 + i, ZERO); continue; }
      // crackle along his silhouette — both shoulders and over the head, in the focal plane (r3: spread round the back of
      // him, 0.5 m behind the face at a 1.7 m focus, every crackle was a big soft DOF blob; in focus they read as arcs)
      const sd = i % 2 ? 1 : -1, a = Math.atan2(cam.x - hero.x, cam.z - hero.z) + sd * Math.PI * (0.46 + 0.14 * hash01(i, fr, 4));
      const yy = 1.05 + hash01(i, fr, 5) * 0.95, rr = (yy > 1.75 ? 0.12 : 0.34) + hash01(i, fr, 6) * 0.22;
      const px = hero.x + Math.sin(a) * rr, pz = hero.z + Math.cos(a) * rr, w = (0.008 + 0.008 * hash01(i, fr, 7)) * near(px, yy, pz);
      _q.setFromAxisAngle(_v.set(Math.sin(a + 1.571), (hash01(i, fr, 8) - 0.5) * 0.6, Math.cos(a + 1.571)).normalize(), (hash01(i, fr, 9) - 0.5) * 2.4);
      fx.setMatrixAt(A0 + i, _m.compose(_p.set(px, yy, pz), _q, _s.set(w, w * (5 + 8 * hash01(i, fr, 10)), w)));
      // just under the bloom knee: brighter and every crackle blooms into a soft blue smear over the face shot
      const e = 0.85 + 0.3 * hash01(i, fr, 11);
      fx.setColorAt(A0 + i, _c.setRGB(L.aura[0] * e, L.aura[1] * e, L.aura[2] * e));
      any = true;
    }
    // finisher ring wave: a thin crackling band of light voxels at waist height riding the sim wave front (DW9's
    // horizontal lightning ring). r3: was a 0.5–1.6 m wall of 144 additive columns — bunched in a 2–4 m circle round him
    // and DOF-blurred, it was a teal fog over the first 0.2 s of the finisher that hid Zhao Yun completely
    const w0 = t - M.finisher, ringK = w0 >= 0 ? 1 - ramp(w0, M.waveFrames * 0.7, M.waveFrames + 10) : 0;
    const R = mu.waveR || 1, seg = 6.283 * R / NR * 1.15, fk = Math.floor(t / 2);
    for (let i = 0; i < NR; i++) {
      if (ringK <= 0) { fx.setMatrixAt(R0 + i, ZERO); continue; }
      const a = i / NR * 6.283, px = hero.x + Math.cos(a) * R, pz = hero.z + Math.sin(a) * R;
      const nk = ramp(Math.hypot(px - cam.x, pz - cam.z), 2.5, 6);                 // (the wave passes the camera)
      const py = 0.78 + 0.16 * (hash01(i, fk, 22) - 0.5) + 0.1 * Math.sin(a * 7 + t * 0.5);   // jagged, crackling line
      _q.setFromAxisAngle(UP, -a);
      fx.setMatrixAt(R0 + i, _m.compose(_p.set(px, py, pz), _q, _s.set(0.075 * nk, 0.075 * nk, seg * nk)));
      const rk = ringK * (0.35 + 0.65 * ramp(R, 2, 7)) * (0.75 + 0.5 * hash01(i, fk, 23));
      fx.setColorAt(R0 + i, _c.setRGB(L.ring[0] * rk, L.ring[1] * rk, L.ring[2] * rk));
      any = true;
    }
    fx.visible = any;
    fx.instanceMatrix.needsUpdate = true;
    fx.instanceColor.needsUpdate = true;
    // lightning bolts striking the wave front from the sky (the finisher's first ≈ 0.6 s)
    const boltK = w0 >= 0 && L.bolt ? 1 - ramp(w0, 22, 40) : 0, fb = Math.floor(t / 3);
    bolts.visible = boltK > 0;
    if (bolts.visible) {
      for (let b = 0; b < NB; b++) {
        const on = hash01(b, fb, 37) < 0.75;
        const a = hash01(b, fb, 31) * 6.283, gx = hero.x + Math.cos(a) * R, gz = hero.z + Math.sin(a) * R;
        const tx = gx + (hash01(b, fb, 32) - 0.5) * 3, ty = 9 + 3 * hash01(b, fb, 33), tz = gz + (hash01(b, fb, 34) - 0.5) * 3;
        const nk = ramp(Math.hypot(gx - cam.x, gz - cam.z), 3, 7);
        let px = tx, py = ty, pz = tz;
        for (let k = 1; k <= BSEG; k++) {
          const f = k / BSEG, jit = k < BSEG ? 0.7 * Math.sin(f * Math.PI) : 0;
          const qx = tx + (gx - tx) * f + (hash01(b, fb, 40 + k) - 0.5) * 2 * jit, qy = ty * (1 - f), qz = tz + (gz - tz) * f + (hash01(b, fb, 60 + k) - 0.5) * 2 * jit;
          const i = b * BSEG + k - 1;
          if (!on || nk <= 0) bolts.setMatrixAt(i, ZERO);
          else {
            _v.set(qx - px, qy - py, qz - pz); const len = _v.length();
            _q.setFromUnitVectors(FWD, _v.multiplyScalar(1 / len));
            const w = 0.07 * nk * (1.3 - 0.5 * f);
            bolts.setMatrixAt(i, _m.compose(_p.set((px + qx) / 2, (py + qy) / 2, (pz + qz) / 2), _q, _s.set(w, w, len * 1.05)));
            const e = boltK * (0.8 + 0.4 * hash01(b, fb, 38));
            bolts.setColorAt(i, _c.setRGB(L.bolt[0] * e, L.bolt[1] * e, L.bolt[2] * e));
          }
          px = qx; py = qy; pz = qz;
        }
      }
      bolts.instanceMatrix.needsUpdate = true; bolts.instanceColor.needsUpdate = true;
    }
  }

  function updateGrade(t) {
    const M = MUSOU;
    // dim: +≈20 % flash on the cut frame, full dim 2 frames later (DW8: 1–3 frame flash, dim within 3), lifts during the
    // chase run, then a light cool tint holds through the payoff (teal-white burst instead of the golden sun haze) and
    // warms back to the golden-hour grade as control returns.
    // r3: the dim is a teal-night vignette (display-space multiply) centred on Zhao Yun — ≈0.7× on him, ≈0.27× at the
    // frame edge — so the intro sits at ≈0.6× gameplay luma (DW8 0.52–0.77×) while his ivory lamellar stays readable
    // (the pose shot is ≈1.7× the pre-press gameplay frame undimmed, so the cut frame already carries part of the dim)
    // fx r5: the cut frame is dimmed 0.9 (was 0.45: under the 0.09 white kick the ≈1.7× undimmed pose shot
    // read ≈1.6× gameplay luma — one blown-out frame); the white kick alone is the flash now, full dim from the next frame
    const dim = (t < 1 ? 0.9 : 1) * (1 - ramp(t, M.chase + 4, M.contact));
    const cool = 0.45 * ramp(t, M.chase + 4, M.contact) * (1 - ramp(t, M.contact + 8, M.contact + 30));   // tint the dark-to-bright cut only, not the payoff
    const mul = (d, c) => Math.round(255 * (1 - dim * (1 - d / 255)) * (1 - cool * (1 - c / 255)));
    const C = L.cool;
    const rgb = (d) => `rgb(${mul(d[0], C[0])},${mul(d[1], C[1])},${mul(d[2], C[2])})`;
    show(dimEl, dim + cool > 0.003 ? 1 : 0);
    if (dim > 0.003) {
      _p.set(hero.x, (t < M.closeup ? 1.1 : 1.5) + scene.position.y, hero.z).project(camera);
      const hx = (clamp(_p.x * 0.5 + 0.5, 0, 1) * 100).toFixed(1), hy = ((1 - clamp(_p.y * 0.5 + 0.5, 0, 1)) * 100).toFixed(1);
      setStyle(dimEl, 'background', `radial-gradient(ellipse 30% 58% at ${hx}% ${hy}%, ${rgb(L.dim[0])} 0%, ` +
        `${rgb(L.dim[1])} 55%, ${rgb(L.dim[2])} 100%)`);
    } else if (cool > 0.003) setStyle(dimEl, 'background', rgb([255, 255, 255]));
    // whiteout: a screen-blended teal-white bloom centred on the burst — lifts the payoff to ≈1.4–1.8× luma while the
    // launched bodies keep their contrast (a 'normal' white layer flattened them into a milky screen)
    const c = t - M.contact, f = t - M.finisher;
    const flashC = game.frame - contactF < 2, flashF = game.frame - burstF < 2;
    const washC = c >= 0 && flashC ? 0.35 : 0, washF = f >= 0 && flashF ? 0.3 : 0;   // 2-frame kick, no hold (a hold veiled the launch fan)
    const flash = t < 1 ? 0.09 : 0;                          // r3: the cut frame only (was 0.2 white for 3 frames: +60–90 %)
    const wash = Math.max(flash, washC, washF);
    // ray centre: contact point, then the finisher (Zhao Yun)
    if (f >= 0) _p.set(hero.x, 1.4, hero.z);
    else { mu.toWorld([0, 1.3, 2.2], W3); _p.set(W3[0], W3[1], W3[2]); }
    _p.y += scene.position.y; _p.project(camera);
    const cx = clamp(_p.x * 0.5 + 0.5, 0, 1), cy = clamp(_p.y * 0.5 + 0.5, 0, 1);
    show(washEl, wash);
    if (wash > 0) setStyle(washEl, 'background', flash ? '#fff' :
      `radial-gradient(ellipse at ${(cx * 100).toFixed(1)}% ${((1 - cy) * 100).toFixed(1)}%, rgba(${L.wash[0]},1) 0%, rgba(${L.wash[1]},.75) 30%, rgba(${L.wash[2]},.35) 100%)`);
    // radial rays (HDR, bloom) at contact: the light erupts from inside the crowd (the quad sits 3.5 m past the contact
    // point, so the bodies in front cut out against it). The finisher has none: the dragon coil and the vfx ray burst
    // are its light (full-screen rays + a light pillar on top of them bloomed into a white column that hid Zhao Yun)
    const u = addU;
    u.uRays.value = c >= 0 ? 0.1 * (1 - ramp(c, 4, 28)) : 0;
    add.visible = u.uRays.value > 0.002;
    if (add.visible) {
      u.uC.value.set(cx, cy); u.uAspect.value = camera.aspect; u.uTime.value = time;
      camera.getWorldDirection(_v);
      _p.set(W3[0], W3[1] + scene.position.y, W3[2]).addScaledVector(_v, 3.5).project(camera);
      u.uDepth.value = Math.min(0.99999, _p.z);
    }
    // burst light on the camera side of the action, so the launched bodies are front-lit teal, not silhouettes
    const gc = c >= 0 && f < 0 ? 1 - ramp(c, 2, 16) : 0;
    glow.intensity = 3 * gc;                                   // (fx r4: was 5 — washed Zhao Yun's ivory lamellar white at contact)
    if (glow.intensity > 0) {
      mu.toWorld([0, 1.2, 3.5], W3); _v.set(W3[0], W3[1], W3[2]);
      glow.position.lerpVectors(_v, camera.position, 0.3); glow.position.y = 3.2;
    }
  }

  let warm = 2;
  return {
    update(dt) {
      time += dt;
      scene.position.y = ground(hero.x, hero.z);                // sim space → the terrain under him (world/map.js)
      if (mu.active) tv = mu.t;
      else if (tv >= 0) { tv += dt * 60; if (tv > MUSOU.end + 50) tv = -1; }
      shards.update();
      // first renders draw everything as a no-op: post.compile() links the programs, but buffer uploads and the driver's
      // pipeline state (ANGLE/Metal) only happen on a real draw — without this the first Musou pays for them
      if (warm > 0 && tv < 0) {
        warm--; addU.uRays.value = 0; add.visible = fx.visible = dragon.visible = shell.visible = ink.visible = bolts.visible = true;
        shard(0, -50, 0, 0, 0, 0, 0.05, 0.01, 0, 0, 0); return;
      }
      if (tv < 0) { hideAll(); return; }
      const M = MUSOU;
      updateGrade(tv);
      updateFx(tv);
      if (look.dragon) updateDragon(tv, dt);
      ov.cut(tv, M.closeup, ramp(tv, M.closeup, M.closeup + 5) * (1 - ramp(tv, M.pullback + 2, M.pullback + 10)), ramp(tv, M.closeup, M.closeup + 5));
    },
    /** Rebuilt per character (main.js): drop the 3D group, the shard pool and the DOM layers (event subscriptions: events.js collect). */
    dispose() {
      parent.remove(scene, shards.mesh);
      for (const o of [scene, shards.mesh]) o.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
      ov.dispose();
    },
  };
}
