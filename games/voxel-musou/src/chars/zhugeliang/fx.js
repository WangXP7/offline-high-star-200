// 諸葛亮's own render layer (def.fxView: src/chars/defkit.js — part of his Musou view; render-only, reads the sim and bus
// events, never writes it). On top of the shared kit view (chars/kitview.js: wind blades, beams, rain, musou:fx):
//  · 八卦 sigils: a glowing trigram circle draped on the terrain (conforming grid like vfx.js cracks, pattern in the
//    fragment shader): a double octagon rim, the eight trigrams in 先天 order (乾 toward his facing) turning slowly, a
//    ticked inner ring and a turning taiji, over a faint violet wash. It is drawn round like a brush stroke, pulses while
//    it holds, flares white-gold when it detonates and fades.
//      C6 (moves.js `sigil` windows): drawn where window 1 opens (SIGIL box centre, 4.6 m ahead, r 3.1 m), synced to his
//      move frame; a dodge / hit out of the move lets it fade undetonated; window 2 detonates it (eight columns of light
//      on the trigrams, a centre column, rings, a shock wall, rays).
//      Musou: musou:fx 'bagua' opens the vast one (r 12 m) under him, synced to the Musou frame; 'baguaBurst' (the
//      finisher) detonates its eight outer columns; the shared Musou view owns the payoff flash. Between CONTACT and
//      the finisher light rains at random inside it, and through the whole
//      action the east wind streams past in long faint streaks (east = −X on the maps: +Z is north).
import * as THREE from 'three';
import { on } from '../../core/events.js';
import { vrng } from '../../core/rng.js';
import { ground } from '../../world/map.js';
import { SIGIL } from './moves.js';

export const GOLD = [2.4, 1.9, 0.8], VIOLET = [1.3, 1.2, 2.6], BEAM = [1.9, 1.8, 2.8], CORE = [2.4, 2.3, 2.8];
const k3 = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const N = 48;                                                         // drape grid segments

const VS = /* glsl */`
  uniform float uR; varying vec2 vP;
  void main() { vP = position.xz / uR; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FS = /* glsl */`
  uniform float uT, uGrow, uA, uFlash, uYaw; uniform vec3 uGold, uViolet; varying vec2 vP;
  float ln(float d, float w) { float aa = fwidth(d) * 1.2; return 1.0 - smoothstep(w - aa, w + aa, abs(d)); }
  float tri(float s) {                          // 先天八卦 clockwise from 乾: bit k = line k from the inside (1 = unbroken)
    return s < 0.5 ? 7.0 : s < 1.5 ? 6.0 : s < 2.5 ? 2.0 : s < 3.5 ? 4.0 : s < 4.5 ? 0.0 : s < 5.5 ? 1.0 : s < 6.5 ? 5.0 : 3.0;
  }
  void main() {
    vec2 p = vP; float r = length(p);
    if (r > 1.02) discard;
    float th = atan(p.x, p.y) - uYaw;                               // 0 = his facing
    float a01 = fract(th / 6.2832 + 1.0);
    float rev = max(1.0 - smoothstep(uGrow * 1.02 - 0.03, uGrow * 1.02, a01), step(r, uGrow * 0.55));   // brushed round
    // outer double octagon + circle
    const float Q = 0.7854;
    float so = floor(th / Q + 0.5), lo = th - so * Q, vo = r * cos(lo);
    float g = ln(vo - 0.955, 0.012) + ln(vo - 0.99, 0.006) * 0.7 + ln(r - 0.9, 0.006) * 0.6;
    // trigram ring (turning slowly)
    float t2 = th - uT * 0.12, s = floor(t2 / Q + 0.5), la = t2 - s * Q, v = r * cos(la), u = r * sin(la);
    float code = tri(mod(s, 8.0));
    for (int k = 0; k < 3; k++) {
      float vk = 0.62 + float(k) * 0.085, bit = mod(floor(code / pow(2.0, float(k))), 2.0);
      float bar = ln(v - vk, 0.02) * step(abs(u), vk * 0.3);
      bar *= 1.0 - (1.0 - bit) * step(abs(u), vk * 0.055);          // broken line: a gap at its middle
      g += bar;
    }
    // inner rings and ticks (turning the other way)
    float t3 = th + uT * 0.2;
    g += ln(r - 0.5, 0.007) + ln(r - 0.445, 0.005) * 0.8;
    g += step(0.445, r) * step(r, 0.5) * step(fract(t3 * 3.8197), 0.16) * 0.8;   // 24 ticks
    // taiji (turning): outline, bright half, the two eyes
    float t4 = th + uT * 0.6; vec2 q = r * vec2(sin(t4), cos(t4));
    float R = 0.3, inT = step(r, R);
    float up = step(length(q - vec2(0.0, R * 0.5)), R * 0.5), dn = step(length(q + vec2(0.0, R * 0.5)), R * 0.5);
    float light = mix(step(0.0, q.x), 1.0, up) * (1.0 - dn);
    light = max(light, step(length(q + vec2(0.0, R * 0.5)), R * 0.13)) * (1.0 - step(length(q - vec2(0.0, R * 0.5)), R * 0.13));
    g += ln(r - R, 0.008) + inT * light * 0.55;
    float wash = (1.0 - smoothstep(0.2, 1.0, r)) * 0.07 + ln(r - 0.75, 0.2) * 0.03;
    float pulse = 0.85 + 0.15 * sin(uT * 7.0);
    vec3 col = (uGold * g * pulse + uViolet * wash) * rev + (uGold * 0.9 + vec3(0.5)) * uFlash * (g + wash) * rev;
    gl_FragColor = vec4(col * uA * (1.0 - smoothstep(0.97, 1.02, r) * 0.5), 1.0);
  }`;

export function createZhugeFx(parent, game) {
  const fx = game.vfx.fx, root = new THREE.Group();
  parent.add(root);
  const slot = () => {
    const geo = new THREE.PlaneGeometry(2, 2, N, N).rotateX(-Math.PI / 2);
    geo.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, fog: false,
      uniforms: { uR: { value: 1 }, uT: { value: 0 }, uGrow: { value: 0 }, uA: { value: 0 }, uFlash: { value: 0 }, uYaw: { value: 0 },
        uGold: { value: new THREE.Color(...GOLD) }, uViolet: { value: new THREE.Color(...VIOLET) } } });
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false; m.renderOrder = -1; m.visible = false;
    root.add(m);
    return { m, base: Float32Array.from(geo.attributes.position.array), on: false, x: 0, z: 0, r: 1, yaw: 0, a: 0, det: -1, seq: -1 };
  };
  const S = { c6: slot(), mu: slot() };
  /** Lay a sigil of radius r at (x, z) facing yaw, draped on the terrain. */
  const open = (k, x, z, r, yaw) => {
    const o = S[k], pos = o.m.geometry.attributes.position, gy = ground(x, z);
    for (let v = 0; v < pos.count; v++) {
      const lx = o.base[v * 3] * r, lz = o.base[v * 3 + 2] * r;
      pos.array[v * 3] = lx; pos.array[v * 3 + 1] = ground(x + lx, z + lz) - gy + 0.04; pos.array[v * 3 + 2] = lz;
    }
    pos.needsUpdate = true;
    o.m.position.set(x, gy, z);
    Object.assign(o, { on: true, x, z, r, yaw, a: 1, det: -1 });
    const u = o.m.material.uniforms; u.uR.value = r; u.uYaw.value = yaw; u.uGrow.value = 0; u.uFlash.value = 0;
    fx.ring(x, z, r * 1.05, 0.45, k3(GOLD, 0.8)); fx.star(x, 0.3, z, r * 0.4, 0.25, CORE); fx.dustRing(x, z, 12 + r * 2, 0.3, r * 0.9, 0.45, 0.35);
  };
  /** Detonate: eight columns on the trigrams, a centre column, rings, a shock wall, rays, light. */
  const burst = (k) => {
    const o = S[k];
    if (!o.on || o.det >= 0) return;
    o.det = 0;
    const { x, z, r, yaw } = o, big = r > 6;
    for (let i = 0; i < 8; i++) {
      const a = yaw + i * Math.PI / 4, px = x + Math.sin(a) * r * 0.7, pz = z + Math.cos(a) * r * 0.7;
      fx.columns(px, pz, 1, 0, big ? 14 : 7, big ? 1.5 : 1.1, 0.55, GOLD, 0); fx.ring(px, pz, big ? 3 : 1.4, 0.35, BEAM);
    }
    if (!big) fx.columns(x, z, 1, 0, 10, 1.8, 0.6, BEAM, 0);   // the Musou's centre stays clear of its hero
    fx.ring(x, z, r * 1.4, 0.55, GOLD); fx.ring(x, z, r * 0.8, 0.4, BEAM);
    fx.wall(x, z, r * 1.2, big ? 3.4 : 2.4, 0.5, k3(VIOLET, 0.5));
    fx.rayBurst(x, 0.3, z, big ? 16 : 16, r * 1.2, k3(GOLD, big ? 0.6 : 1), [0.6, 1.2], 0.45, 0.5);
    fx.star(x, 0.6, z, big ? 1.2 : 2.6, 0.3, CORE);
    fx.dustRing(x, z, big ? 16 : 24, 0.5, r * (big ? 1.1 : 1.6), 0.6, big ? 0.35 : 0.5);
    if (!big) {
      fx.lightFlash(x, 1.2, z, [0.9, 0.8, 1], 55, 0.4, 14);
      fx.flash(0.14);
    }
  };
  on('attack:swing', (e) => {
    const h = game.hero, hit = e.move === 'c6' && h.kit.moves.c6?.hits[e.win];
    if (!hit?.sigil) return;
    if (hit.sigil === 2) { burst('c6'); return; }
    const d = SIGIL.off + SIGIL.len / 2;
    open('c6', h.x + Math.sin(e.yaw) * d, h.z + Math.cos(e.yaw) * d, SIGIL.width / 2, e.yaw);
    S.c6.seq = h.moveSeq;
  });
  on('musou:fx', (e) => {
    if (e.kind === 'bagua') open('mu', e.x, e.z, e.r, e.yaw);
    else if (e.kind === 'baguaBurst') burst('mu');
  });

  let t = 0, lastMu = 0;
  return {
    update(dt) {
      t += dt;
      const h = game.hero, mu = game.musou;
      for (const k in S) {
        const o = S[k], u = o.m.material.uniforms;
        if (!o.on) { o.m.visible = false; continue; }
        if (o.det >= 0) {                                            // detonated: flare, then fade
          o.det += dt; u.uFlash.value = Math.exp(-o.det * 7); o.a = Math.max(0, 1 - Math.max(0, o.det - 0.12) / 0.6);
        } else if (k === 'c6') {
          const live = h.state === 'attack' && h.move === 'c6' && h.moveSeq === o.seq;
          if (live) { o.a = 1; u.uGrow.value = Math.min(1, (h.moveT - 18) / 10); } else o.a -= dt * 3;
        } else if (mu.active) { o.a = 1; u.uGrow.value = Math.min(1, (mu.t - 100) / 16); } else o.a -= dt * 3;
        if (o.a <= 0) { o.on = false; o.m.visible = false; continue; }
        o.m.visible = true; u.uA.value = o.a; u.uT.value = t;
      }
      // Musou: light rain inside the sigil (CONTACT → the seal), the east wind streaming past (the whole action)
      if (!mu.active) { lastMu = 0; return; }
      const o = S.mu;
      for (let f = lastMu + 1; f <= mu.t; f++) {
        if (o.on && o.det < 0 && f >= 132 && f <= 164 && f % 3 === 0) {
          const a = vrng.range(0, 6.283), d = o.r * Math.sqrt(vrng.next()) * 0.9, x = o.x + Math.sin(a) * d, z = o.z + Math.cos(a) * d;
          fx.columns(x, z, 1, 0, 9, 1.2, 0.4, BEAM, 0); fx.ring(x, z, 1.3, 0.3, BEAM); fx.star(x, 0.4, z, 1, 0.18, CORE);
        }
        if (f >= 100 && f <= 180 && f % 2 === 0) {
          const L = vrng.range(6, 11), y = vrng.range(0.4, 4.5);
          fx.streak(h.x - 14 + vrng.range(-4, 6), y, h.z + vrng.range(-14, 14), 1, 0, 0, L, 0.1, 0.4, k3(VIOLET, 0.28));
        }
      }
      lastMu = mu.t;
    },
    dispose() {
      parent.remove(root);
      root.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); });
    },
  };
}
