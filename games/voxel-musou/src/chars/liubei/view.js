// 劉備's own effects (render-only; part of his Musou view: kit.js), drawn over the def-kit ones (chars/kitview.js). Reads
// sim state, never writes it.
//  · 昭烈・雙龍斬's twin dragons, one gold and one jade: serpents of glowing blocks (a tapering body, a horned head with an
//    open jaw, dorsal fins; an additive glow shell over all of it) born from his blades at CONTACT (musou 130-132). They
//    run a double helix 18 m out along the contact line, crossing and re-crossing (the rush hits there, moves.js), rear up
//    (160-170), then dive crossing into the finisher just ahead of him (176) and burst into shards. The heads follow keyed
//    points in the Musou's contact frame (mu.toWorld; the dive's end tracks his live position), Catmull-Rom in time; each
//    body block trails along the head's own past path.
//  · 仁德 (C6): a gold 義 gathers over him while the swords go up and bursts outward on the shock frame.
//  · the left sword's ribbon (vfx.js draws the weapon joint's): a fading additive strip over the last TN rendered blade
//    positions (LEFT.blade = its mesh, set by the kit's view hook), lit only where the tip moved fast, while he attacks.
import * as THREE from 'three';
import { ground } from '../../world/map.js';

/** The left sword's blade mesh on the hero's model (kit.js view hook). */
export const LEFT = { blade: null };
const TN = 12, TB = 0.3, TT = 0.88, TCOL = [[0.3, 0.95, 0.5], [1.05, 1.02, 0.86]];   // ribbon samples, blade span m, fringe / core
const NB = 30, NF = 8, NH = 5, N = NB + NF + NH, LAG = 0.55;                 // body blocks, fins, head blocks; frames per block
const COL = [[2.3, 1.6, 0.45], [0.45, 2.1, 1.15]];                           // gold, jade (linear HDR)
const _m = new THREE.Matrix4(), _s = new THREE.Matrix4(), _p = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3();
const _t = new THREE.Vector3(), _o = new THREE.Vector3(), _eye = new THREE.Vector3(), _c = new THREE.Color(), UP = new THREE.Vector3(0, 1, 0);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const cr = (a, b, c, d, u) => { const u2 = u * u, u3 = u2 * u; return 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3); };

/** Head keys [t, [left, up, fwd]] of dragon σ (±1) in the contact frame; fh = his current forward distance on it. */
function keysOf(sg, fh) {
  const K = [[128, [sg * 0.3, 1.1, 0.4]], [130, [sg * 0.4, 1.2, 0.9]]];
  for (let t = 132; t <= 158; t += 2) {
    const u = (t - 132) / 26, a = (t - 132) * 0.3 + (sg > 0 ? 0 : Math.PI);
    K.push([t, [1.7 * Math.cos(a), 1.7 + 1.2 * Math.sin(a), 1 + 17 * (1 - (1 - u) ** 1.6)]]);
  }
  K.push([164, [sg * 3, 6, 19]], [170, [sg * 2.4, 8.5, fh + 6]], [173, [sg * 0.3, 4.6, fh + 3.4]], [176, [-sg * 1.2, 0.3, fh + 1.3]],
    [180, [-sg * 2.4, -1.6, fh + 0.2]]);
  return K;
}
/** Point of keys K at musou time t (clamped to the keyed span). */
function at(K, t, out) {
  const n = K.length;
  t = Math.min(K[n - 1][0], Math.max(K[0][0], t));
  let i = 0;
  while (i < n - 2 && t >= K[i + 1][0]) i++;
  const u = (t - K[i][0]) / (K[i + 1][0] - K[i][0]), A = K[Math.max(0, i - 1)][1], B = K[i][1], C = K[i + 1][1], D = K[Math.min(n - 1, i + 2)][1];
  return out.set(cr(A[0], B[0], C[0], D[0], u), cr(A[1], B[1], C[1], D[1], u), cr(A[2], B[2], C[2], D[2], u));
}

export function createTwinView(parent, game) {
  const fx = game.vfx.fx, mu = game.musou, root = new THREE.Group();
  parent.add(root);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const inst = (mat) => { const m = new THREE.InstancedMesh(box, mat, N * 2); m.frustumCulled = false; root.add(m); return m; };
  const core = inst(new THREE.MeshBasicMaterial({ fog: false }));
  const shell = inst(new THREE.MeshBasicMaterial({ fog: false, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  shell.renderOrder = 6;
  for (let d = 0; d < 2; d++) for (let i = 0; i < N; i++) {
    const k = i < NB ? (i & 1 ? 0.78 : 1) * (1 + 0.5 * Math.max(0, 1 - i / 6)) : i < NB + NF ? 1.2 : 1.35;
    core.setColorAt(d * N + i, _c.setRGB(COL[d][0] * k * 0.55, COL[d][1] * k * 0.55, COL[d][2] * k * 0.55));   // (under the bloom: the blocks keep their form)
    shell.setColorAt(d * N + i, _c.setRGB(COL[d][0] * 0.6, COL[d][1] * 0.6, COL[d][2] * 0.6));
  }

  // 義: a calligraphy sprite
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  g.font = '200px "Xingkai SC", "STXingkai", "Libian SC", "Kaiti SC", "STKaiti", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(255, 200, 80, 0.9)'; g.shadowBlur = 24; g.fillStyle = '#ffe9a8'; g.fillText('義', 128, 136);
  g.shadowBlur = 0; g.fillStyle = '#fff8e0'; g.fillText('義', 128, 136);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const yi = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(1.6, 1.3, 0.6), blending: THREE.AdditiveBlending,
    transparent: true, depthWrite: false, fog: false }));
  root.add(yi);

  // left sword ribbon: TN samples (newest first) × base / tip vertices
  const tp = new Float32Array(TN * 6), tc = new Float32Array(TN * 6), ti = [];
  for (let i = 0; i < TN - 1; i++) { const a = i * 2; ti.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(tp, 3).setUsage(THREE.DynamicDrawUsage));
  tg.setAttribute('color', new THREE.BufferAttribute(tc, 3).setUsage(THREE.DynamicDrawUsage));
  tg.setIndex(ti);
  const trail = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, fog: false }));
  trail.frustumCulled = false; trail.renderOrder = 5; root.add(trail);
  const S = Array.from({ length: TN }, () => ({ b: new THREE.Vector3(), t: new THREE.Vector3(), g: 0 }));
  let tn = 0;
  function ribbon(dt) {
    const h = game.hero, on = LEFT.blade && (h.state === 'attack' || h.state === 'musou');
    if (!on) { tn = 0; trail.visible = false; return; }
    if (dt > 0) {                                    // frozen (hitstop / pause): keep the ribbon as it stands
      const s = S.pop(); S.unshift(s);
      LEFT.blade.localToWorld(s.b.set(0, 0, TB)); LEFT.blade.localToWorld(s.t.set(0, 0, TT));
      s.g = tn ? Math.min(1, Math.max(0, (s.t.distanceTo(S[1].t) / dt - 5) / 9)) : 0;
      tn = Math.min(TN, tn + 1);
    }
    trail.visible = tn > 1;
    for (let i = 0; i < TN; i++) {
      const s = S[Math.min(i, tn - 1)], a = i < tn ? s.g * (1 - i / (TN - 1)) ** 1.5 : 0;
      s.b.toArray(tp, i * 6); s.t.toArray(tp, i * 6 + 3);
      for (let k = 0; k < 3; k++) { tc[i * 6 + k] = TCOL[0][k] * a * 0.25; tc[i * 6 + 3 + k] = (TCOL[1][k] * (1 - i / TN) + TCOL[0][k] * i / TN) * a; }
    }
    tg.attributes.position.needsUpdate = true; tg.attributes.color.needsUpdate = true;
  }

  const Ks = [null, null], w = [0, 0, 0];
  let warm = 2, shown = true, burst = false;
  /** Contact-frame point p at musou time t of dragon d → world (render y). */
  const world = (d, t, out) => { at(Ks[d], t, _o); mu.toWorld(_o.toArray(w), w); return out.set(w[0], w[1] + ground(mu.ax, mu.az), w[2]); };
  /** Instance matrix: a block at p along direction dir, size (sx, sy, len), offset (ox, oy, oz) in its own frame. */
  const block = (p, dir, sx, sy, len, ox = 0, oy = 0, oz = 0, pitch = 0) => {
    _m.identity().lookAt(_eye.copy(p).add(dir), p, UP);
    if (pitch) _m.multiply(_s.makeRotationX(pitch));
    _p.set(ox, oy, oz).applyMatrix4(_m).add(p);
    return _m.setPosition(_p).multiply(_s.makeScale(sx, sy, len));
  };
  const hide = () => { for (let i = 0; i < N * 2; i++) { core.setMatrixAt(i, ZERO); shell.setMatrixAt(i, ZERO); } };
  hide();

  function dragons() {
    const t = mu.active ? mu.t : 0;
    if (!mu.active || t < 128 || t > 186) { burst = false; if (!shown) return false; hide(); shown = false; return true; }
    shown = true;
    const h = game.hero, s = Math.sin(mu.ayaw), c = Math.cos(mu.ayaw), fh = (h.x - mu.ax) * s + (h.z - mu.az) * c;
    const fade = t < 132 ? (t - 128) / 4 : t > 178 ? Math.max(0, 1 - (t - 178) / 6) : 1;
    for (let d = 0; d < 2; d++) {
      Ks[d] = keysOf(d ? -1 : 1, fh);
      for (let i = 0; i < NB; i++) {                               // body: each block on the head's path i·LAG frames ago
        const ti = t - i * LAG, j = d * N + i;
        if (ti < 129) { core.setMatrixAt(j, ZERO); shell.setMatrixAt(j, ZERO); continue; }
        world(d, ti, _b); world(d, ti - LAG, _t);
        const dir = _a.subVectors(_b, _t), len = Math.max(0.2, dir.length() * 1.35);
        const k = (0.2 + 0.8 * (1 - i / NB) ** 0.7) * fade, wdt = 0.46 * k;
        core.setMatrixAt(j, block(_b, dir.normalize(), wdt, wdt * 0.85, len));
        shell.setMatrixAt(j, block(_b, dir, wdt * 1.6, wdt * 1.5, len * 1.1));
        if (i >= 3 && i < 3 + NF * 3 && i % 3 === 0) {             // dorsal fins every 3rd block
          const f = d * N + NB + (i - 3) / 3;
          core.setMatrixAt(f, block(_b, dir, 0.05 * k, wdt * 0.8, len * 0.5, 0, wdt * 0.7, 0));
          shell.setMatrixAt(f, block(_b, dir, 0.12 * k, wdt * 1.1, len * 0.7, 0, wdt * 0.7, 0));
        }
      }
      // head: skull, snout, open jaw, two swept horns
      world(d, t, _b); world(d, t - 0.5, _t);
      const dir = _a.subVectors(_b, _t).normalize(), k = fade, j = d * N + NB + NF;
      const parts = [[0.62, 0.48, 0.7, 0, 0, 0, 0], [0.4, 0.28, 0.46, 0, 0.04, 0.5, 0], [0.36, 0.12, 0.5, 0, -0.28, 0.32, 0.35],
        [0.07, 0.07, 0.6, 0.2, 0.34, -0.36, -0.6], [0.07, 0.07, 0.6, -0.2, 0.34, -0.36, -0.6]];
      parts.forEach(([sx, sy, sz, ox, oy, oz, pt], q) => {
        core.setMatrixAt(j + q, block(_b, dir, sx * k, sy * k, sz * k, ox * k, oy * k, oz * k, pt));
        shell.setMatrixAt(j + q, block(_b, dir, sx * k * 1.5, sy * k * 1.5, sz * k * 1.3, ox * k, oy * k, oz * k, pt));
      });
      // sparks off the body, a burst of shards where each dives in
      const gy = ground(mu.ax, mu.az);
      if (fade > 0.3 && game.frame & 1) fx.embers(_b.x, _b.y - gy - 0.2, _b.z, 2, 0.4, COL[d]);
      if (t >= 176 && !burst) { fx.shards(_b.x, Math.max(0.3, _b.y - gy), _b.z, 26, 7, COL[d], 0.1); fx.star(_b.x, 1, _b.z, 3.2, 0.3, COL[d]); }
    }
    if (t >= 176) burst = true;
    return true;
  }

  function yiGlyph() {
    const h = game.hero, r = h.kit.moves.c6?.hits[0].f[0] ?? 0, a = h.state === 'attack' && h.move === 'c6' ? h.moveT : -1;
    if (a < 8 || a > r + 32) { yi.visible = false; return; }
    const u = a < r ? (a - 8) / (r - 8) : 1, v = a < r ? 0 : (a - r) / 32;
    yi.visible = true;
    yi.material.opacity = a < r ? 0.25 + 0.6 * u : 1 - v;
    yi.scale.setScalar(1.1 + 0.5 * u + 2.6 * v * (2 - v));
    yi.position.set(h.x, h.y + ground(h.x, h.z) + 2.4 + 0.8 * v, h.z);
  }

  return {
    update(dt) {
      if (warm > 0) { warm--; yi.visible = trail.visible = true; yi.material.opacity = 0; return; }   // programs compiled on the first renders
      if (dragons()) { core.instanceMatrix.needsUpdate = true; shell.instanceMatrix.needsUpdate = true; }
      yiGlyph();
      ribbon(dt);
    },
    dispose() {
      parent.remove(root);
      box.dispose(); tex.dispose(); tg.dispose();
      for (const o of [core, shell, yi, trail]) o.material.dispose();
    },
  };
}
