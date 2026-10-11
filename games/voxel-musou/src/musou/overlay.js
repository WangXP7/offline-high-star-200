// Musou screen overlay shared by the kits' Musou views (src/musou/view.js, src/chars/huangzhong/view.js): the grade's
// DOM layers (display space, above the canvas, below the HUD — a multiply dim and a screen-blended wash; each view paints
// its own gradients) and the frame-driven calligraphy cut-in (無雙 + the officer's line + a red seal).
import * as THREE from 'three';

const { clamp, inverseLerp } = THREE.MathUtils;
/** 0 before a, 1 after b, linear between. */
export const ramp = (t, a, b) => clamp(inverseLerp(a, b, t), 0, 1);

/** sub: the officer's line, seal: the seal text, css: { big, sub } = the kit's colour / glow of the 無雙 and the line. */
export function createOverlay({ sub, seal, css }) {
  const layer = (blend) => { const d = document.createElement('div'); d.style.cssText = `position:fixed;inset:0;pointer-events:none;opacity:0;display:none;mix-blend-mode:${blend}`; return d; };
  const dim = layer('multiply'), wash = layer('screen');
  (document.getElementById('c') || document.body.firstChild).after(dim, wash);
  // integration r1: placed under the HUD's square minimap (ends ≈ 34 vh) and left of the HUD's vertical musou copy
  const style = document.createElement('style');
  style.textContent = `
    .mu-cut { position: fixed; inset: 0; pointer-events: none; z-index: 5; opacity: 0; display: none; font-family: "Xingkai SC", "STXingkai", "Libian SC", "Kaiti SC", "STKaiti", serif; }
    .mu-cut .big { position: absolute; right: 11%; top: 36%; writing-mode: vertical-rl; font-size: 18vh; line-height: 1; transform-origin: 50% 40%; letter-spacing: -1vh; ${css.big} }
    .mu-cut .seal { position: absolute; right: 21.5%; top: 64%; width: 7vh; height: 7vh; background: #a8261b; color: #f3e2c8; border-radius: 0.8vh;
      font: 3.1vh/3.4vh "Kaiti SC", "STKaiti", serif; writing-mode: vertical-rl; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 0.35vh rgba(243,226,200,.25) inset, 3px 4px 0 rgba(0,0,0,.4); transform-origin: 50% 50%; }
    .mu-cut .sub { position: absolute; right: 22.5%; top: 37%; writing-mode: vertical-rl; font: 3vh/1 "Kaiti SC", "STKaiti", serif; letter-spacing: 1.2vh; ${css.sub} }`;
  document.head.appendChild(style);
  const cutEl = document.createElement('div');
  cutEl.className = 'mu-cut';
  cutEl.innerHTML = `<div class="sub">${sub}</div><div class="big">無雙</div><div class="seal">${seal}</div>`;
  document.body.appendChild(cutEl);
  const [cutSub, cutBig, cutSeal] = cutEl.children;
  const setStyle = (el, k, v) => { if (el.style[k] !== v) el.style[k] = v; };
  const show = (el, v) => { setStyle(el, 'display', v > 0 ? 'block' : 'none'); setStyle(el, 'opacity', v.toFixed(3)); };   // unused layers leave the compositor
  return {
    dim, wash, setStyle, show,
    /** Cut-in at musou frame t (t0 = its first frame): k = opacity, st = the 無雙 slam-in 0..1; the seal stamps at
     *  t0 + 8..12, the line fades in over t0 + 10..20. */
    cut(t, t0, k, st) {
      show(cutEl, k);
      if (k <= 0) return;
      const se = ramp(t, t0 + 8, t0 + 12);
      setStyle(cutBig, 'transform', `scale(${(1.6 - 0.6 * st * st).toFixed(3)}) translateY(${((t - t0) * -0.06).toFixed(2)}vh)`);
      setStyle(cutSeal, 'transform', `scale(${(2.2 - 1.2 * se).toFixed(3)}) rotate(-8deg)`);
      setStyle(cutSeal, 'opacity', se.toFixed(3));
      setStyle(cutSub, 'opacity', ramp(t, t0 + 10, t0 + 20).toFixed(3));
    },
    hide() { show(dim, 0); show(wash, 0); show(cutEl, 0); },
    dispose() { for (const el of [dim, wash, style, cutEl]) el.remove(); },
  };
}
