// A def-kit officer's own effects (render-only, part of his Musou view: src/chars/defkit.js), drawn with the vfx
// primitives (game.vfx.fx) in his colours. Reads sim state / bus events, never writes the sim.
//  · waves (game.musou.waves, src/musou/scripted.js): crescent (an upright moon blade, horns swept back), wind (the same
//    rolled ±0.7 rad, fluttering), ring (a small faint crescent: 360° volleys), roar (a shock band standing on the ground
//    round his launch point — a ring of ≈ 14 tiles into one expanding wall — kicking dust where it runs); they fade at
//    the end of their flight and near the lens
//  · signature windows (attack:swing on a moves.js window flagged): roar (當陽一喝: rolling shock rings, a shock wall,
//    the ground split under him, a dust ring and a horizontal ray burst from his head), beam (a light streak down the
//    hit line), rain (light columns striking a fan ahead)
//  · musou:fx kinds: roar, slam, rocks, crack, aura, beams (n radial streaks), rain · wave:launch: a muzzle star
//  · charge glow: while a ground charge winds up (before its first active frame) power gathers at the blade: a core, a
//    halo shell, rising motes and a point light (always in the scene, intensity 0 when idle: no recompile)
// sig = { roar, core, wave, beam, charge } linear HDR colours; blade = m along the weapon (the charge glow's centre).
import * as THREE from 'three';
import { on } from '../core/events.js';
import { vrng } from '../core/rng.js';
import { heroPose } from '../hero/hero.js';
import { POSE_SIZE, weaponWorld } from '../hero/rig.js';
import { ground } from '../world/map.js';

const k3 = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

/** A flat brushstroke arc: two quadratic curves share pointed tips, with a luminous spine and dim tail. */
function crescentGeo() {
  const ink = new THREE.Shape();
  ink.moveTo(-1, -0.55); ink.quadraticCurveTo(0, 1.35, 1, -0.55);
  ink.quadraticCurveTo(0, 0.4, -1, -0.55);
  const g = new THREE.ShapeGeometry(ink, 16), positions = g.attributes.position, colors = [];
  for (let i = 0; i < positions.count; i++) {
    const light = Math.max(0.15, 1 - Math.abs(positions.getX(i)));
    colors.push(light, light, light);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return g;
}
/** Roar band: a strip of the unit circle round the local origin (±0.24 rad about +Z), 1 m tall, bright at the ground. */
function bandGeo(n = 8) {
  const pos = [], col = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n - 0.5) * 0.48, e = Math.sin((i / n) * Math.PI) * 0.4 + 0.6;
    pos.push(Math.sin(a), 0, Math.cos(a), Math.sin(a), 1, Math.cos(a));
    col.push(e, e, e, 0, 0, 0);
    if (i < n) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

export function createKitView(parent, game, camera, { sig, blade }) {
  const fx = game.vfx.fx, root = new THREE.Group();
  parent.add(root);
  const glowMat = (c, vc = true) => new THREE.MeshBasicMaterial({ color: new THREE.Color(...c), vertexColors: vc, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });

  // ---- waves: one pooled group per flying wave (outer tint + white-hot core, or the roar band)
  const cres = crescentGeo(), band = bandGeo(), NW = 48;
  const pool = Array.from({ length: NW }, () => {
    const g = new THREE.Group(), outer = new THREE.Mesh(cres, glowMat(k3(sig.wave, 1.3))), core = new THREE.Mesh(cres, glowMat(k3(sig.core, 1.4)));
    core.scale.setScalar(0.8); core.position.set(0, -0.05, 0.05);
    const roar = new THREE.Mesh(band, glowMat(k3(sig.roar, 1.1)));
    g.add(outer, core, roar); g.visible = false; g.renderOrder = 5;
    root.add(g);
    return { g, outer, core, roar };
  });

  // ---- charge glow at the blade
  const cg = new THREE.Group();
  const cCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), glowMat(sig.charge, false));
  const cHalo = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), glowMat(k3(sig.charge, 0.35), false));
  const NM = 24, cMotes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), glowMat(sig.charge, false), NM);
  cMotes.frustumCulled = false; cCore.frustumCulled = cHalo.frustumCulled = false;
  cg.add(cCore, cHalo, cMotes); cg.visible = false;
  root.add(cg);
  const cLight = new THREE.PointLight(new THREE.Color(...sig.charge), 0, 9, 2);
  root.add(cLight);

  // ---- signature windows
  const roarFx = (x, z, R, big) => {
    fx.ring(x, z, R * 0.5, 0.32, k3(sig.roar, 1.2)); fx.ring(x, z, R * 0.85, 0.48, sig.roar); fx.ring(x, z, R * 1.2, 0.66, k3(sig.roar, 0.7));
    fx.wall(x, z, R * 1.3, big ? 2.6 : 1.8, 0.5, k3(sig.roar, 0.55));
    fx.crack(x, z, big ? 4.6 : 3.2, k3(sig.roar, 1.3));
    fx.dustRing(x, z, big ? 40 : 30, 0.6, R * 2.1, 0.8, 0.6);
    fx.dustColumn(x, z, big ? 14 : 8, 0.5, 2.2, 2.8, [0.8, 1.2], 0.45);
    fx.rayBurst(x, 1.7, z, big ? 18 : 12, R * 0.75, k3(sig.roar, 0.9), [-0.06, 0.22], 0.42, 0.5);
    fx.star(x, 1.9, z, big ? 2.8 : 2.1, 0.32, k3(sig.core, 1.1));
    fx.lightFlash(x, 1.6, z, k3(sig.roar, 0.5), 45, 0.4, 14);
    fx.flash(big ? 0.18 : 0.14);
  };
  on('attack:swing', (e) => {
    const h = game.hero, hit = h.kit.moves[e.move]?.hits[e.win];
    if (!hit) return;
    const sx = Math.sin(e.yaw), sz = Math.cos(e.yaw);
    if (hit.roar) roarFx(h.x, h.z, hit.range || 7, e.move === 'c6');
    if (hit.beam) {                                    // a split lance of light, ending in a target flare
      const reach = hit.len || 8, half = (hit.width || 1.6) * 0.25;
      for (const side of [-1, 1]) fx.streak(h.x + sz * half * side, h.y + 1.3, h.z - sx * half * side,
        sx, 0, sz, reach, half, 0.3, side < 0 ? sig.beam : sig.core);
      fx.star(h.x + sx * reach, 1.1, h.z + sz * reach, 1.7, 0.28, sig.beam);
      fx.embers(h.x, h.y + 1.3, h.z, 8, 0.4, sig.core);
    }
    if (hit.rain) {                                    // two staggered rows march forward across the attack fan
      const R = hit.range || 5;
      for (let i = 0; i < hit.rain; i++) {
        const lateral = ((i / Math.max(1, hit.rain - 1)) * 2 - 1) * R * 0.65;
        const advance = R * (i % 2 ? 0.8 : 0.45), x = h.x + sx * advance + sz * lateral, z = h.z + sz * advance - sx * lateral;
        fx.columns(x, z, 1, 0, 6, 0.8, 0.5, sig.beam, 0);
        fx.ring(x, z, 0.75, 0.5, sig.core);
      }
      fx.rayBurst(h.x, 0.2, h.z, hit.rain, R * 0.5, sig.wave, [0, 0.08], 0.35, 0.3);
    }
  });
  on('musou:fx', (e) => {
    const { x, z, r } = e;
    if (e.kind === 'roar') roarFx(x, z, r, true);
    else if (e.kind === 'slam') {
      fx.wall(x, z, r, 0.8, 0.45, sig.wave);
      for (const side of [-1, 1]) fx.crack(x + Math.cos(e.yaw) * side * 1.2, z - Math.sin(e.yaw) * side * 1.2,
        Math.min(5, r * 0.6), sig.roar, 2);
      fx.rocks(x, z, 18, r * 0.4, 0.12, 0.28, [4, 8], 3.5);
      fx.dustColumn(x, z, 18, 0.7, r * 0.4, 2, [1, 1.4], 0.6);
    } else if (e.kind === 'rocks') {
      fx.rocks(x, z, 12, r * 0.65, 0.3, 0.6, [3, 6], 5);
      fx.crack(x, z, r * 0.8, sig.roar, 1.8);
      fx.wall(x, z, r, 0.5, 0.6, k3(sig.wave, 0.45));
    } else if (e.kind === 'crack') {
      fx.crack(x, z, r, k3(sig.roar, 1.4), 3.6); fx.rocks(x, z, 12, r * 0.6, 0.12, 0.3, [3, 7], 3); fx.dustRing(x, z, 18, 0.4, r, 0.6, 0.5);
    } else if (e.kind === 'beams') {
      const n = Math.round(r);
      for (let i = 0; i < n; i++) { const a = e.yaw + (i / n) * 6.283; fx.streak(x, 1.2, z, Math.sin(a), 0, Math.cos(a), 10, 0.7, 0.45, sig.beam); }
      fx.star(x, 1.3, z, 1.6, 0.25, sig.core); fx.ring(x, z, 6, 0.5, sig.beam);
    } else if (e.kind === 'rain') {
      fx.columns(x, z, 3, r * 0.5, 5, 0.65, 0.6, sig.beam, 0);
      fx.rayBurst(x, 0.4, z, 6, r, sig.core, [0.05, 0.3], 0.25, 0.5);
    } else if (e.kind === 'aura') {
      fx.wall(x, z, r * 0.75, 1.5, 0.7, k3(sig.wave, 0.55));
      fx.rayBurst(x, 0.8, z, 12, r * 0.7, sig.core, [0.2, 0.65], 0.35, 0.4);
    }
  });
  on('wave:launch', (e) => fx.star(e.x + Math.sin(e.yaw) * 0.8, e.y, e.z + Math.cos(e.yaw) * 0.8, e.kind === 'roar' ? 1.8 : 0.9, 0.14, sig.core));

  const pose = new Float32Array(POSE_SIZE), hp = new THREE.Vector3(), tip = new THREE.Vector3();
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
  let t = 0, e = 0, warm = 2;
  return {
    update(dt) {
      t += dt;
      const h = game.hero, cam = camera.position, W = game.musou.waves || [];
      if (warm > 0) {                                  // first renders draw every material once (programs + buffers), at zero opacity
        warm--; for (const p of pool) p.g.visible = true; cg.visible = true; return;
      }
      // waves
      for (let i = 0; i < NW; i++) {
        const p = pool[i], w = W[i];
        if (!w) { p.g.visible = false; continue; }
        const life = w.age / w.life, roar = w.kind === 'roar', gy = ground(w.x, w.z);
        const dc = Math.hypot(w.x - cam.x, w.y + gy - cam.y, w.z - cam.z);
        let a = (life > 0.7 ? (1 - life) / 0.3 : 1) * Math.min(1, Math.max(0, (dc - 2.5) / 4));
        p.g.visible = true; p.outer.visible = p.core.visible = !roar; p.roar.visible = roar;
        if (roar) {                                    // a band of the expanding ring, standing on the ground at its reach
          const d = Math.hypot(w.x - w.ox, w.z - w.oz), H = 1.8 * (1 - 0.5 * life);
          p.g.position.set(w.ox, ground(w.ox, w.oz) - 0.1, w.oz); p.g.rotation.set(0, w.yaw, 0); p.g.scale.set(d, H, d);
          p.roar.material.opacity = a * 0.9;
          if (((game.frame + i) & 3) === 0) fx.dustPuff(w.x, w.z, 1, 1.2, 0.5, 0.1, 0.45 * a);
          continue;
        }
        const s = w.r * (w.kind === 'crescent' ? 1.5 : w.kind === 'ring' ? 0.9 : 1.3) * Math.min(1, 0.55 + w.age * 0.12);
        p.g.position.set(w.x, w.y + gy, w.z);
        p.g.rotation.set(0, w.yaw, w.kind === 'wind' ? ((w.key & 1) ? 0.7 : -0.7) + Math.sin(t * 11 + i) * 0.08 : 0);
        p.g.scale.setScalar(s);
        // The near-lens fade already prevents a wave covering the camera; ring volleys have a lower intensity.
        a *= w.kind === 'ring' ? 0.55 : 1;
        p.outer.material.opacity = p.core.material.opacity = a;
        if (w.kind !== 'ring' && ((game.frame + i) & 1)) fx.embers(w.x, w.y - 0.4, w.z, 1, w.r * 0.5, k3(sig.wave, 0.9));
      }
      // charge glow: grounded charge wind-up only (from the press to the first active frame)
      const m = h.state === 'attack' && h.kit.moves[h.move];
      const want = m && h.move[0] === 'c' && h.moveT < m.tell && !m.air && h.y < 0.4 ? Math.min(1, 0.3 + h.moveT / Math.max(1, m.tell)) : 0;
      e += (want - e) * Math.min(1, dt * (want ? 7 : 12));
      cg.visible = e > 0.02;
      cLight.intensity = cg.visible ? e * 22 : 0;
      if (!cg.visible) return;
      heroPose(h, pose);
      weaponWorld(pose, hp.set(h.x, h.y, h.z), h.yaw, 0, 0, blade, tip, h.kit);
      tip.y += ground(h.x, h.z);
      const k = 0.2 + e * 0.45;
      cCore.position.copy(tip); cCore.scale.setScalar(k * 0.3 * (1 + 0.15 * Math.sin(t * 24)));
      cHalo.position.copy(tip); cHalo.scale.setScalar(k * 0.75 * (1 + 0.08 * Math.sin(t * 13)));   // a glow round a hot point, not a disc
      cCore.material.opacity = e * 0.8; cHalo.material.opacity = e * 0.18; cMotes.material.opacity = e;
      cLight.position.copy(tip);
      for (let i = 0; i < NM; i++) {                   // motes spiral in toward the blade and rise off it
        const a = i * 2.39996 + t * 3.2, u = (t * 0.8 + i / NM) % 1, r = k * (1.5 - u * 1.1), sc = k * 0.09 * (1 - u * 0.5);
        _m.compose(_p.set(tip.x + Math.cos(a) * r, tip.y - k + u * k * 2.6, tip.z + Math.sin(a) * r), _q, _s.set(sc, sc, sc));
        cMotes.setMatrixAt(i, _m);
      }
      cMotes.instanceMatrix.needsUpdate = true;
      if (vrng.chance(dt * 20 * e)) fx.embers(tip.x, tip.y - ground(h.x, h.z) - 0.3, tip.z, 1, 0.3, sig.charge);
    },
    dispose() {
      parent.remove(root);
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    },
  };
}
