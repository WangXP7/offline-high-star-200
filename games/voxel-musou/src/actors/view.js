// Hero-model actors (render-only): every actor of game.actors (sim: src/actors/actors.js) drawn with its kit's voxel model
// and cloth / hair chains on its own rig (as the title / select stage does, ui/stage.js), posed each render from the
// actor's sim anim state (the kit's clips / run pose, a 0.1 s cross-fade on every clip change), scaled HERO_SCALE ×
// (kit.scale || HERO_SCALE) × actor.scale about the feet and lifted onto ground(); a red flash when struck, a slow red pulse while a boss
// is enraged, a backward topple when he falls. A new actor's model is compiled through `compile` (main.js: post.compile,
// KHR_parallel_shader_compile) and only shown once its programs are ready, so a spawn mid-battle never stalls a frame.
// Telegraph decals: each boss attack's warning, read straight from its sim state (so it fills in sim frames and holds
// through hitstop) — a disc round him (sweep) or at the landing spot (leap), a lane ahead of him (thrust): exactly the
// hitbox (actors.js blow()), draped on the terrain, voxel-stepped like the vfx rings. It fills over the wind-up, flares
// white-hot on the strike, fades out. The decal meshes live in the scene from boot (warm-up compiles them).
import * as THREE from 'three';
import { createRig, sampleClip, blendPose, POSE_SIZE, HERO_SCALE } from '../hero/rig.js';
import { ground } from '../world/map.js';
import { ACTOR } from './actors.js';

const DECAL_VS = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// uKind 0 = disc (uv centre = its centre), 1 = lane (uv.y along it, 0 at his feet); uSize = its size in metres (voxel
// steps of ≈ 0.3 m); uU = wind-up share filled; uHot = strike flare; uA = overall fade
const DECAL_FS = /* glsl */`
  uniform float uKind, uU, uHot, uA, uT; uniform vec2 uSize; uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 q = (floor((vUv - 0.5) * uSize / 0.3) + 0.5) * 0.3 / uSize;   // voxel-stepped: 0.3 m cells
    float edge, fill;
    if (uKind < 0.5) {
      float d = length(q) * 2.0;
      if (length(vUv - 0.5) * 2.0 > 1.0) discard;
      edge = step(1.0 - 0.6 / uSize.x, d);
      fill = step(d, uU) * (0.22 + 0.5 * step(uU - 0.9 / uSize.x, d));
    } else {
      float y = q.y + 0.5;
      edge = max(step(0.5 - 0.3 / uSize.x, abs(q.x)), step(1.0 - 0.3 / uSize.y, y));
      fill = step(y, uU) * (0.22 + 0.5 * step(uU - 0.6 / uSize.y, y));
    }
    float pulse = 0.65 + 0.35 * sin(uT * 18.0);
    float a = max(edge * pulse * 0.9, fill) + uHot;
    gl_FragColor = vec4(mix(uColor, vec3(3.0, 2.4, 1.8), uHot) * a * uA, 1.0);
  }`;

export function createActorsView(scene, game, compile) {
  const views = new Map();                                     // actor id → model view
  const P = new Float32Array(POSE_SIZE), pos = new THREE.Vector3();
  const group = new THREE.Group();                             // everything here (main.js hides it on title / select)
  scene.add(group);

  function build(a) {
    const K = a.kit, root = new THREE.Group(), rig = createRig(K);
    root.add(rig.root); group.add(root);
    const m = K.model(rig);
    const v = { a, K, root, rig, m, sec: K.secondary(root, rig, m.material), from: new Float32Array(POSE_SIZE),
      last: new Float32Array(POSE_SIZE), blend: 1, id: null, seq: null, ready: !compile, fresh: true };
    if (compile) compile().then(() => { v.ready = true; }, () => { v.ready = true; });   // programs chosen now (visible)
    root.visible = v.ready;
    return v;
  }
  function drop(v) {
    group.remove(v.root);
    v.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); for (const mt of [].concat(o.material || [])) mt.dispose(); });
  }

  function pose(v, dt) {
    const { a, K, rig } = v, an = a.anim;
    if (an.id === 'run') K.runPose(an.t, an.k, P, 0);
    else sampleClip(K.clips[an.id] || K.clips.idle, an.t, P);
    if (an.mv && K.feet[an.mv]) K.feet[an.mv](an.mt / K.moves[an.mv].frames, P);   // a move on a borrowed clip: its own feet
    if (an.id !== v.id || an.seq !== v.seq) { v.from.set(v.last); v.blend = v.id === null ? 1 : 0; v.id = an.id; v.seq = an.seq; }
    if (v.blend < 1) { v.blend = Math.min(1, v.blend + dt * 10); const u = v.blend; blendPose(v.from, P, u * u * (3 - 2 * u), P); }
    v.last.set(P);
    rig.root.scale.set(1, 1, 1); rig.root.rotation.x = 0;
    rig.apply(P, pos.set(a.x, a.y + ground(a.x, a.z), a.z), a.yaw, a.y);
    rig.root.scale.setScalar((K.scale || HERO_SCALE) * a.scale);
    if (a.state === 'down') { const u = Math.min(1, a.stT / 36); rig.root.rotation.x = -1.45 * u * u; }   // topples onto his back
    rig.root.updateMatrixWorld(true);
    // struck: red flash; enraged boss: a slow red pulse (emissive of the kit's body material)
    const f = a.flash / 12, rage = a.isFoe && !a.dead && a.hp < a.hpMax * ACTOR.rage ? 0.12 + 0.1 * Math.sin(game.frame * 0.1) : 0;
    const e = v.m.material.emissive;
    if (e) e.setRGB(Math.max(0.9 * f, rage), 0.14 * f + 0.02 * rage, 0.08 * f);
    if (v.fresh) { v.sec.reset(); v.fresh = false; }
    v.sec.update(dt);
  }

  // ---- telegraph decals: a pool of draped grids, one per attack in progress (keyed by actor id + attack seq)
  const G = 24, decals = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.PlaneGeometry(1, 1, G, G).rotateX(-Math.PI / 2);
    g.attributes.position.setUsage(THREE.DynamicDrawUsage);
    g.setDrawRange(0, 0);                                      // idle: drawn as nothing (but in the scene: warm-up compiles it)
    const mat = new THREE.ShaderMaterial({ vertexShader: DECAL_VS, fragmentShader: DECAL_FS, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
      uniforms: { uKind: { value: 0 }, uU: { value: 0 }, uHot: { value: 0 }, uA: { value: 0 }, uT: { value: 0 }, uSize: { value: new THREE.Vector2(1, 1) },
        uColor: { value: new THREE.Color(2.2, 0.32, 0.1) } } });
    const m = new THREE.Mesh(g, mat);
    m.frustumCulled = false; m.renderOrder = -1;
    m.userData = { base: Float32Array.from(g.attributes.position.array), owner: null, seq: -1, fade: 0 };
    group.add(m); decals.push(m);
  }
  /** Drape decal m: a disc (r) at (x, z), or a lane (w × len) from (x, z) along yaw; vertices follow the ground. */
  function drape(m, lane, x, z, yaw, sx, sz) {
    const p = m.geometry.attributes.position, b = m.userData.base, gy = ground(x, z), sn = Math.sin(yaw), cs = Math.cos(yaw);
    for (let i = 0; i < p.count; i++) {
      const lx = b[i * 3] * sx, lz = (b[i * 3 + 2] + (lane ? 0.5 : 0)) * sz;   // lane: from his feet forward
      p.array[i * 3] = lx * cs + lz * sn; p.array[i * 3 + 2] = -lx * sn + lz * cs;
      p.array[i * 3 + 1] = ground(x + p.array[i * 3], z + p.array[i * 3 + 2]) - gy + 0.06;
    }
    p.needsUpdate = true;
    m.position.set(x, gy, z);
    m.geometry.setDrawRange(0, Infinity);
    const u = m.material.uniforms;
    u.uKind.value = lane ? 1 : 0; u.uSize.value.set(sx, sz); u.uHot.value = 0; u.uU.value = 0;
  }
  // the lane's uv.y runs 0 → 1 away from him: the rotated plane's local −z (uv.y = 1) points along −lz, so flip it
  for (const m of decals) {
    const uv = m.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  }
  function decalsUpdate(dt) {
    for (const a of game.actors.list) {
      const k = a.atk;
      if (!k || a.state === 'gone') continue;
      let m = decals.find((d) => d.userData.owner === a && d.userData.seq === k.seq);
      if (!m) {
        m = decals.find((d) => !d.userData.owner) || decals.reduce((o, d) => (d.userData.fade < o.userData.fade ? d : o));
        const D = k.A, lane = D.shape === 'lane', leap = D.shape === 'leap';
        drape(m, lane, leap ? k.tx : k.x, leap ? k.tz : k.z, k.yaw, lane ? D.w : D.r * 2, lane ? D.len : D.r * 2);
        Object.assign(m.userData, { owner: a, seq: k.seq, fade: 1 });
      }
    }
    for (const m of decals) {
      const o = m.userData, a = o.owner;
      if (!a) continue;
      const k = a.atk && a.atk.seq === o.seq ? a.atk : null, u = m.material.uniforms;
      u.uT.value = game.frame / 60;
      if (k) {                                                   // wind-up fill → strike flare (a leap strikes on landing)
        const leap = k.A.shape === 'leap', strike = leap ? k.w + k.a : k.w;
        u.uU.value = Math.min(1, k.t / strike);
        u.uHot.value = k.t >= strike ? Math.max(0, 1 - (k.t - strike) / 10) * 0.8 : 0;
        o.fade = k.t < strike + (leap ? 0 : k.a) ? 1 : Math.max(0, 1 - (k.t - strike - (leap ? 0 : k.a)) / 12);
      } else o.fade = Math.max(0, o.fade - dt * 4);             // cancelled (stagger) or over: fades out
      u.uA.value = o.fade;
      if (o.fade <= 0) { o.owner = null; m.geometry.setDrawRange(0, 0); }
    }
  }

  return {
    root: group,
    update(dt) {
      const L = game.actors.list;
      for (const a of L) if (a.state !== 'gone' && !views.has(a.id)) views.set(a.id, build(a));
      for (const [id, v] of views) {
        if (v.a.state === 'gone' || !L.includes(v.a)) { drop(v); views.delete(id); continue; }
        v.root.visible = v.ready;
        if (v.ready) pose(v, Math.min(dt, 0.1));
      }
      decalsUpdate(dt);
    },
  };
}
