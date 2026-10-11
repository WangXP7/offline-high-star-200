// Huang Zhong's kit view (render-only; reads game.musou = the kit sim of musou.js, never writes sim state):
//  · the fx primitives (fx.js) and the arrows (src/vfx/arrows.js); the camera thump is applied here, after the rig
//  · aim mode: a dotted flight path of the next arrow (same integrator as the sim: speed, gravity, ground) that turns
//    gold where it would take a standing officer in the head, plus a ring where it lands
//  · 真・無雙「百步穿楊」 presentation: ember-night vignette through the activation and close-up (display-space multiply,
//    centred on him, leaving him lit), cut-frame flash, calligraphy cut-in (無雙 + 老將 seal), a warm screen wash on the release and on
//    the explosion; layered gold energy: activation = 2-frame hot core + shock ring + stacked gold rings + motes spiralling
//    up round him; close-up = light pooling on the nocked arrow; volley = a turning ground sigil; giant draw = streaks of
//    light and ground dust pulled into a growing sun on the arrowhead (capped in screen pixels), contracting rings on the aim line; release =
//    staggered air rings down the line and a dust wave off his feet (the arrow's flight / explosion: arrows.js).
import * as THREE from 'three';
import { on } from '../../core/events.js';
import { vrng } from '../../core/rng.js';
import { ST } from '../../crowd/crowd.js';
import { createArrowView } from '../../vfx/arrows.js';
import { createFx } from './fx.js';
import { createOverlay, ramp } from '../../musou/overlay.js';
import { heroPose } from '../../hero/hero.js';
import { POSE_SIZE, spearWorld } from '../../hero/rig.js';
import { ARROW } from '../../combat/projectiles.js';
import { ground } from '../../world/map.js';
import { AIM } from './aim.js';
import { HZ_MUSOU as M, GIANT_FRAMES } from './musou.js';

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _c = new THREE.Color();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const { clamp } = THREE.MathUtils;

export function createMusouView(parent, game, camera) {
  const mu = game.musou, hero = game.hero;
  const scene = new THREE.Group();
  parent.add(scene);
  const fx = createFx(scene, camera);
  const arrows = createArrowView(scene, game, mu.proj, fx);
  const addMat = () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });

  // ---- aim preview: dots along the predicted flight + landing ring
  const ND = 40;
  // fx r1: depth test off + drawn last — in a crowd the path ran behind the soldiers' heads and could not be seen
  const dots = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), Object.assign(addMat(), { depthTest: false }), ND);
  dots.frustumCulled = false; dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dots.renderOrder = 20;
  for (let i = 0; i < ND; i++) { dots.setMatrixAt(i, ZERO); dots.setColorAt(i, _c.setRGB(1, 1, 1)); }
  scene.add(dots);
  const land = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 32).rotateX(-Math.PI / 2), Object.assign(addMat(), { depthTest: false }));
  land.visible = false; land.renderOrder = 20; scene.add(land);
  const headMark = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.27, 24), Object.assign(addMat(), { depthTest: false }));   // gold ring on the head it will take
  headMark.visible = false; headMark.renderOrder = 21; scene.add(headMark);
  /** First standing soldier from index `from` whose body the point (x, y, z) passes (horizontal distance² < r2, height
   *  over his feet in [y0, y1]), else -1. from = c.grunts: officers only. */
  function hitAt(x, y, z, from, r2, y0, y1) {
    const c = game.crowd;
    for (let i = from; i < c.N; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD || s === ST.AIR || s === ST.DOWN) continue;
      const dx = c.x[i] - x, dz = c.z[i] - z;
      if (dx * dx + dz * dz < r2 && y - c.y[i] >= y0 && y - c.y[i] <= y1) return i;
    }
    return -1;
  }
  // fx r3 acc: DW5-style reticle (DOM, crisp at any resolution and outside the DoF): a ring with four ticks where the
  // next arrow first meets a body (or ≈ 20 m down the path), closing in as the draw builds, gold and pulsing when the
  // path takes a standing officer's head
  const ret = document.createElement('div');
  ret.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:4;display:none';
  ret.innerHTML = '<svg viewBox="-50 -50 100 100" width="120" height="120" style="position:absolute;left:-60px;top:-60px;overflow:visible">' +
    '<circle r="22" fill="none" stroke-width="3"/><circle r="3"/><path d="M0-42V-28M0 42V28M-42 0H-28M42 0H28" stroke-width="4" stroke-linecap="round"/></svg>';
  document.body.appendChild(ret);
  const retSvg = ret.firstChild;
  const setRet = (on, x, y, z, d, gold) => {
    if (!on) { if (ret.style.display !== 'none') ret.style.display = 'none'; return; }
    _p.set(x, y + ground(x, z), z).project(camera);
    if (_p.z > 1) { ret.style.display = 'none'; return; }
    ret.style.display = 'block';
    ret.style.transform = `translate(${((_p.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((0.5 - _p.y * 0.5) * innerHeight).toFixed(1)}px) scale(${(1.35 - 0.45 * d).toFixed(3)})`;
    const col = gold ? '#ffd24a' : d >= 1 ? '#fff4dc' : '#f2c890';
    retSvg.style.stroke = col; retSvg.style.fill = col;
    retSvg.style.filter = `drop-shadow(0 0 ${gold ? 6 : 2}px ${gold ? 'rgba(255,170,40,.9)' : 'rgba(0,0,0,.85)'})`;
  };
  function updateAim() {
    const A = mu.aim;
    if (!A.active) { setRet(false); if (dots.visible) { dots.visible = false; land.visible = false; headMark.visible = false; } return; }
    dots.visible = true;
    const S = AIM.base, cp = Math.cos(A.pitch);
    let x = hero.x + Math.sin(A.yaw) * ARROW.ahead, y = hero.y + ARROW.heroY, z = hero.z + Math.cos(A.yaw) * ARROW.ahead;
    let vx = Math.sin(A.yaw) * cp * S.speed, vy = Math.sin(A.pitch) * S.speed, vz = Math.cos(A.yaw) * cp * S.speed;
    const life = Math.round(S.range / S.speed * 60), pulse = 0.75 + 0.25 * Math.sin(performance.now() / 90);
    let n = 0, gold = false, hx = 0, hy = 0, hz = 0, rf = 0, rx = x, ry = y, rz = z;
    for (let f = 1; f <= 90 && n < ND; f++) {                   // same integrator as projectiles.js (flat, then spent)
      const spent = f > life;
      vy -= (spent ? 30 : S.g) / 60 * 1; if (spent) { vx *= 0.97; vz *= 0.97; }
      x += vx / 60; y += vy / 60; z += vz / 60;
      if (y <= 0) break;
      if (!gold && hitAt(x, y, z, game.crowd.grunts, 0.25, ARROW.headY, ARROW.standH + 0.25) >= 0) { gold = true; hx = x; hy = y; hz = z; if (!rf) { rf = f; rx = x; ry = y; rz = z; } }
      // fx r5: from the bow, 3 samples a frame (was every 2nd frame from f 6 = 8.8 m: the reticle skipped the soldiers
      // 2-8 m in front that the arrow hits first and floated ≈ 20 m down range over the HUD; a 2.9 m stride also stepped
      // over bodies), and it sits on the path abreast of the struck body's axis, not on the sample past it
      for (let k = 2; k >= 0 && !rf; k--) {
        const sx = x - vx / 180 * k, sy = y - vy / 180 * k, sz = z - vz / 180 * k, b = hitAt(sx, sy, sz, 0, 0.25, 0, ARROW.standH);
        if (b < 0) continue;
        const vh = Math.hypot(vx, vz), t = ((game.crowd.x[b] - sx) * vx + (game.crowd.z[b] - sz) * vz) / (vh * vh);
        rf = f; rx = sx + vx * t; ry = sy + vy * t; rz = sz + vz * t;
      }
      for (const a of game.actors.list) {                        // actors lane: the reticle settles on a boss the path meets
        if (rf || !game.actors.foe(a) || (x - a.x) ** 2 + (z - a.z) ** 2 > (a.r + 0.75) ** 2 || y < a.y || y > a.y + ARROW.standH * a.scale) continue;
        rf = f; rx = x; ry = y; rz = z;
      }
      if (!rf && f === 14) { rf = f; rx = x; ry = y; rz = z; }
      if (f % 2 === 0 && f > 2) {
        const k = 1 - n / ND, s = (0.07 + 0.03 * A.d) * (1 + f / 40);         // grows down range: reads at 20 m
        _m.compose(_p.set(x, y + ground(x, z), z), _q.identity(), _s.setScalar(s));
        dots.setMatrixAt(n, _m);
        dots.setColorAt(n, gold ? _c.setRGB(2.6 * pulse, 1.8 * pulse, 0.3) : _c.setRGB(2.2 * k + 0.5, 1.5 * k + 0.35, 0.5 * k + 0.12));
        n++;
      }
    }
    setRet(true, rx, ry, rz, A.phase === 'draw' ? A.d : 1, gold);
    for (let i = n; i < ND; i++) dots.setMatrixAt(i, ZERO);
    dots.instanceMatrix.needsUpdate = true; dots.instanceColor.needsUpdate = true;
    headMark.visible = gold;
    if (gold) {
      headMark.position.set(hx, hy + ground(hx, hz), hz); headMark.quaternion.copy(camera.quaternion);
      headMark.scale.setScalar(1 + 0.2 * pulse); headMark.material.color.setRGB(3 * pulse, 2 * pulse, 0.4);
    }
    land.visible = y <= 0.05;
    if (land.visible) { land.position.set(x, 0.06 + ground(x, z), z); land.material.color.setRGB(gold ? 2.4 : 1.2, gold ? 1.7 : 1.1, gold ? 0.3 : 0.8); }
  }

  // ---- Musou grade (DOM layers above the canvas, below the HUD) + cut-in
  const ov = createOverlay({ sub: '老將 黃漢升', seal: '老將', css: {
    big: 'color: #fbf1e2; -webkit-text-stroke: .5vh #1a0905; paint-order: stroke fill; text-shadow: 0 0 .3vh #1a0c06, .6vh .8vh 0 rgba(20,6,2,.75), 0 0 3vh rgba(255,150,60,.55);',
    sub: 'color: #ffe2b8; text-shadow: 0 0 10px rgba(255,140,40,.75), 2px 2px 0 rgba(0,0,0,.6);' } });
  const { dim: dimEl, wash: washEl, setStyle, show } = ov;

  // ---- Musou energy (fx): bow / arrowhead positions from the rendered pose
  const pose = new Float32Array(POSE_SIZE), hpos = new THREE.Vector3(), tip = new THREE.Vector3(), nock = new THREE.Vector3(), bowTop = new THREE.Vector3();
  let moteAcc = 0, ringAcc = 0, lastT = -1, released = false;
  let tv = -1, burstF = -99;
  on('musou:start', () => { tv = 0; });
  on('musou:burst', () => { burstF = game.frame; });
  on('scenario', () => { tv = -1; });

  function updateGrade(t) {
    // dim: warm ember night on him (≈ 0.7× centre, 0.3× edges), lifting from the plant into the volley
    // fx r5: cut frame dimmed 0.9 (was 0.45: under the white kick it read ≈1.5× gameplay luma, one blown-out frame) —
    // the white kick alone is the flash, full dim from the next frame
    const dim = (t < 1 ? 0.9 : 1) * (1 - ramp(t, M.plant, M.volley + 6));
    const redim = 0.55 * ramp(t, M.big, M.big + 12) * (1 - ramp(t, M.release, M.release + 3));   // the giant draw darkens again
    const d = Math.max(dim, redim);
    show(dimEl, d > 0.003 ? 1 : 0);
    if (d > 0.003) {
      const mul = (v) => Math.round(255 * (1 - d * (1 - v / 255)));
      _p.set(hero.x, 1.4 + ground(hero.x, hero.z), hero.z).project(camera);
      const hx = (clamp(_p.x * 0.5 + 0.5, 0, 1) * 100).toFixed(1), hy = ((1 - clamp(_p.y * 0.5 + 0.5, 0, 1)) * 100).toFixed(1);
      // fx r1: he stays lit (centre ≈ neutral), the world falls to ember-dark at the edges
      setStyle(dimEl, 'background', `radial-gradient(ellipse 34% 62% at ${hx}% ${hy}%, rgb(${mul(252)},${mul(240)},${mul(226)}) 0%, ` +
        `rgb(${mul(186)},${mul(128)},${mul(100)}) 50%, rgb(${mul(70)},${mul(42)},${mul(40)}) 100%)`);
    }
    const flash = t < 1 ? 0.08 : 0, washB = game.frame - burstF < 3 ? 0.45 * (1 - (game.frame - burstF) / 3) : 0;   // fx r2: no release wash (a held fog) — a 2-3 frame white flash on the burst only
    const wash = Math.max(flash, washB);
    show(washEl, wash);
    if (wash > 0) setStyle(washEl, 'background', flash ? '#fff' : 'radial-gradient(ellipse at 50% 55%, rgba(255,246,226,1) 0%, rgba(255,200,140,.7) 35%, rgba(230,140,80,.3) 100%)');
  }
  const G = [2.6, 1.75, 0.6];
  function updateEnergy(t, dt) {
    if (!mu.active) return;
    const h = hero, first = lastT < 0 || t < lastT;
    lastT = t;
    if (first) released = false;
    hpos.set(h.x, h.y, h.z);
    heroPose(h, pose);
    spearWorld(pose, hpos, h.yaw, -0.55, 0.22, nock, tip);
    const fwx = Math.sin(h.yaw), fwz = Math.cos(h.yaw);
    if (first) {                                                         // activation: shock + sigil
      fx.groundRing(h.x, h.z, 0.5, 8, 0.04, 0.55, 2.6, 1.7, 0.5);
      fx.groundRing(h.x, h.z, 0.3, 4.2, 0.1, 1.1, 1.2, 0.75, 0.2, 0.05);
      fx.ring(h.x, 1.2, h.z, 0, 0, 0, 0.5, 4, 0.04, 0.22, 2.2, 1.5, 0.5, 0, 1);
      // fx r1: a 2-frame hot core (the 5 m glow + dust burst + aura column stacked into a full-screen orange smear)
      fx.glow(h.x, 1.2, h.z, 0.6, 2.2, 0.07, 3, 2.4, 1.2);
      for (let k = 0; k < 5; k++) fx.ring(h.x, 0.3 + k * 0.55, h.z, 0, 1, 0, 0.5, 1.6 + k * 0.35, 0.05, 0.45, 2.4, 1.5, 0.4, k * 0.06);   // stacked gold rings
      fx.light(h.x, 2, h.z, 4, 0xffc060, 3);
      for (let k = 0; k < 12; k++) {
        const a = vrng.range(0, 6.283), v = vrng.range(4, 8);
        fx.smoke(h.x, 0.2, h.z, 0.4, 1.2, 0.7, 0.52, 0.4, 0.3, 0.3, Math.cos(a) * v, vrng.range(0.3, 1), Math.sin(a) * v, 2.5, 0.3);
      }
    }
    moteAcc += dt;
    const step = 1 / 60;
    if (t < M.plant) {                                                   // motes spiralling up round him
      if (t < M.closeup) {
        spearWorld(pose, hpos, h.yaw, 0, 0.9, nock, bowTop);             // the bow thrust overhead: a star on it
        const px = fx.px(bowTop.x, bowTop.y, bowTop.z);
        fx.dot(bowTop.x, bowTop.y, bowTop.z, Math.min(0.5 + 0.15 * Math.sin(t * 0.8), 30 * px), 3, 2.3, 1);
      } else fx.dot(tip.x, tip.y, tip.z, Math.min(0.2 + 0.2 * ramp(t, M.closeup, M.plant), 16 * fx.px(tip.x, tip.y, tip.z)), 2.8, 2, 0.8);
      while (moteAcc >= step) {
        moteAcc -= step;
        for (let k2 = 0; k2 < 3; k2++) {
          const a = vrng.range(0, 6.283), r = vrng.range(0.9, 2.4);
          fx.glow(h.x + Math.cos(a) * r, vrng.range(0, 0.5), h.z + Math.sin(a) * r, 0.1, 0.04, vrng.range(0.6, 1.1), G[0], G[1], G[2],
            -Math.sin(a) * 2.5 - Math.cos(a) * 0.6, vrng.range(2.5, 4.5), Math.cos(a) * 2.5 - Math.sin(a) * 0.6, 0.6, 0, 0.3);
        }
      }
      ringAcc += dt;
      if (ringAcc > 0.3) {                                               // contracting ground sigil + a closing ring at his feet
        ringAcc = 0; fx.groundRing(h.x, h.z, 2.6, 1.2, 0.05, 0.45, 1.8, 1.1, 0.3);
        if (t < M.closeup) fx.ring(h.x, 0.2, h.z, 0, 1, 0, 1.4, 0.7, 0.06, 0.5, 2.0, 1.3, 0.35);
      }
    } else if (t < M.big) {                                              // volley: a turning sigil under his feet
      ringAcc += dt;
      if (ringAcc > 0.25) { ringAcc = 0; fx.groundRing(h.x, h.z, 1.2, 3.2, 0.05, 0.5, 1.2, 0.6, 0.15); }
      moteAcc = 0;
    } else if (t < M.release) {                                          // the giant draw: everything pours into the arrowhead
      const u = ramp(t, M.big, M.release);
      const px = fx.px(tip.x, tip.y, tip.z);
      fx.dot(tip.x, tip.y, tip.z, Math.min(0.3 + 1.3 * u * u, (10 + 26 * u) * px), 3.4 * (0.5 + u), 2.5 * (0.5 + u), 1.1 * (0.5 + u));
      fx.dot(tip.x, tip.y, tip.z, Math.min(1.5 + 3 * u, (40 + 60 * u) * px), 0.5 * u, 0.28 * u, 0.06 * u);
      fx.line(tip.x + fwx * 0.3, tip.y, tip.z + fwz * 0.3, fwx, 0, fwz, 1.5 + 5 * u * u, 0.06 + 0.1 * u, 2.8 * u, 2 * u, 0.8 * u, 0.6);   // the line it will fly
      while (moteAcc >= step) {
        moteAcc -= step;
        for (let k2 = 0; k2 < 4; k2++) {
          const a = vrng.range(0, 6.283), b = vrng.range(-0.6, 0.9), R = vrng.range(2.5, 6), sb = Math.sqrt(1 - b * b), life = vrng.range(0.22, 0.35);
          const ox = Math.cos(a) * sb * R, oy = b * R * 0.6, oz = Math.sin(a) * sb * R;
          fx.spark(tip.x + ox, Math.max(0.2, tip.y + oy), tip.z + oz, -ox / life, -oy / life, -oz / life, 0.6, 0.035, life, G[0], G[1], G[2], 0, 0, 1);
        }
        if (vrng.chance(0.6)) {                                          // ground dust dragged in toward him
          const a = vrng.range(0, 6.283), R = vrng.range(3, 6);
          fx.smoke(h.x + Math.cos(a) * R, 0.15, h.z + Math.sin(a) * R, 0.5, 0.2, 0.6, 0.5, 0.39, 0.3, 0.35, -Math.cos(a) * R * 1.4, 0.3, -Math.sin(a) * R * 1.4, 0.5, 0);
        }
      }
      ringAcc += dt;
      if (ringAcc > 0.1) {
        ringAcc = 0;
        fx.ring(tip.x + fwx * 0.4, tip.y, tip.z + fwz * 0.4, fwx, 0, fwz, 1.1, 0.15, 0.07, 0.16, 2 * u + 0.4, 1.4 * u + 0.3, 0.5 * u + 0.1);
        fx.groundRing(h.x, h.z, 3.5, 0.8, 0.05, 0.25, 1.2 * u, 0.8 * u, 0.25 * u);
      }
      fx.light(tip.x, tip.y, tip.z, 1 + 2 * u, 0xffb050, 8, 1);
    } else if (!released) {                                              // release: air rings down the line, dust wave
      released = true;
      for (let k = 1; k <= 4; k++) {
        const d = k * 3.2;
        fx.ring(tip.x + fwx * d, tip.y, tip.z + fwz * d, fwx, 0, fwz, 0.4, 1.0 + k * 0.08, 0.06, 0.3, 2.4, 1.8, 0.8, k * 0.035);
      }
      fx.groundRing(h.x, h.z, 0.6, 4, 0.04, 0.4, 0.9, 0.55, 0.2);   // (fx r2: 7 m bright ring = a yellow band across the release lens)
      for (let k = 0; k < 8; k++) {
        const a = h.yaw + (k % 2 ? 1 : -1) * vrng.range(1.2, 2), v = vrng.range(3, 8);
        fx.smoke(h.x, 0.2, h.z, 0.5, 2, 0.9, 0.52, 0.4, 0.3, 0.5, Math.sin(a) * v, vrng.range(0.3, 1.2), Math.cos(a) * v, 2.5, 0.3);
      }
    }
  }

  let warm = 2;   // first renders draw every pool once (fx.warm): real draws, not just post.compile — no hitch on the first Musou
  return {
    update(dt) {
      arrows.update(dt);
      updateAim();
      if (warm > 0 && tv < 0) { warm--; dots.visible = true; fx.warm(); fx.update(dt); fx.applyKick(); return; }
      if (mu.active) tv = mu.t;
      else if (tv >= 0) { tv += dt * 60; if (tv > M.end + GIANT_FRAMES) tv = -1; }
      if (!mu.active) { lastT = -1; ringAcc = 0; }
      if (tv < 0) ov.hide();
      else {
        updateGrade(tv);
        ov.cut(tv, M.closeup, ramp(tv, M.closeup, M.closeup + 2) * (1 - ramp(tv, M.plant - 4, M.plant + 4)), ramp(tv, M.closeup, M.closeup + 4));
        updateEnergy(tv, dt);
      }
      fx.update(dt); fx.applyKick();
    },
    dispose() {
      arrows.dispose();
      fx.dispose();
      parent.remove(scene);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      ov.dispose(); ret.remove();
    },
  };
}
