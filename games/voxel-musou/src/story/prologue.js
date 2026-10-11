// Chapter prologue (#prologue): a handscroll unrolls over the chapter's sepia ink map (CH PL_MAP); each card writes 3
// vertical brush columns (right to left, revealed stroke-first by a ragged brush-tip mask), an English subline, and draws
// its troop arrows onto the map (ours teal ink, the foe vermilion) while the view drifts to the card's focus. Then the
// chapter title stamps in (CH num + title + the red CH seal) and the battle starts.
// Controls: tap Enter / Space / click = next card · hold (0.8 s, ring fills) = skip to the title · Esc = skip.
// ctx in: { mode: 'story', ch, char }. Done → flow.go('battle', ctx). Cards / map / branching: chapters.js header.
// The paper, grain, filters, vignette and arrow ink are this frame's; the map art and the stamp are rebuilt from the
// chapter on every enter. Render-side DOM only (wall-clock timers); nothing here touches the sim.
import { chapter } from './chapters.js';

const NUM = ['壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾'];
const HOLD = 0.8;                                  // s held to skip (index.html: the ring's .on transition)

// ---- the map frame (viewBox 1600×900): paper, blots, [chapter art], grain, troop arrows, [chapter labels], vignette.
// Arrow = [id, side, cubic path M x y C ...]
function head(d) {                                 // arrowhead at the path end, along the last control leg
  const n = d.match(/-?\d+(\.\d+)?/g).map(Number), [cx, cy, x, y] = n.slice(-4), a = Math.atan2(y - cy, x - cx) * 180 / Math.PI;
  return `<path d="M0 0 L-34 -17 L-24 0 L-34 17Z" transform="translate(${x} ${y}) rotate(${a.toFixed(1)})"/>`;
}
const MAP = ({ art, arrows }) => `
<svg class="pl-map" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <filter id="pl-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4"/>
      <feColorMatrix values="0 0 0 0 .32  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .55 -.18"/></filter>
    <filter id="pl-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9"/>
      <feDisplacementMap in="SourceGraphic" scale="7"/></filter>
    <filter id="pl-blot"><feGaussianBlur stdDeviation="30"/></filter>
    <radialGradient id="pl-vig" cx="50%" cy="50%" r="72%"><stop offset="55%" stop-color="#3a2410" stop-opacity="0"/>
      <stop offset="100%" stop-color="#2a170a" stop-opacity=".62"/></radialGradient>
    <linearGradient id="pl-mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1d12" stop-opacity=".78"/>
      <stop offset=".7" stop-color="#4a3522" stop-opacity=".25"/><stop offset="1" stop-color="#4a3522" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="#d8c197"/>
  <g filter="url(#pl-blot)" fill="#8a5a2a" opacity=".16"><ellipse cx="260" cy="700" rx="260" ry="150"/><ellipse cx="1320" cy="180" rx="300" ry="120"/>
    <ellipse cx="900" cy="760" rx="220" ry="90"/></g>
  ${art.slice(0, art.indexOf('<g class="pl-labels"'))}
  <rect width="1600" height="900" filter="url(#pl-grain)"/>
  <g class="pl-arrows" filter="url(#pl-ink)">
    ${arrows.map(([id, side, d]) => `<g class="pl-arw ${side}" data-id="${id}"><path class="u" d="${d}" pathLength="1"/><path class="s" d="${d}" pathLength="1"/><g class="hd">${head(d)}</g></g>`).join('')}
  </g>
  ${art.slice(art.indexOf('<g class="pl-labels"'))}
  <rect width="1600" height="900" fill="url(#pl-vig)"/>
</svg>`;

export function createPrologue(el, flow) {
  el.innerHTML = `<div class="pl-paper"><svg class="pl-map"></svg>
      <div class="pl-card"><div class="pl-cols"></div></div><p class="pl-en"></p>
      <div class="pl-stamp"></div>
      <div class="pl-pips"></div>
    </div>
    <i class="pl-rod l"></i><i class="pl-rod r"></i>
    <div class="pl-skip"><span><kbd>Enter</kbd><kbd>Click</kbd>下一頁<small>Next</small></span>
      <span><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="p" cx="18" cy="18" r="15" pathLength="1"/></svg>長按跳過<small>Hold to skip</small></span>
      <span><kbd>Esc</kbd>跳過<small>Skip</small></span></div>`;
  const $ = (s) => el.querySelector(s);
  const card = $('.pl-card'), cols = $('.pl-cols'), en = $('.pl-en'), pips = $('.pl-pips'), ring = $('.pl-skip .p');
  let ctx = {}, k = -1, timer = 0, swapT = 0, holdTimer = 0, holdT0 = 0, phase = 'off', stampAt = 0;
  let map = $('.pl-map'), PROLOGUE = [];                   // this chapter's map element and cards (enter)

  const later = (fn, s) => { clearTimeout(timer); timer = setTimeout(fn, s * 1000); };
  function show(i) {
    k = i;
    if (k >= PROLOGUE.length) return stamp();
    const c = PROLOGUE[k], v = c.v;
    card.classList.remove('on');                             // the old card fades, then the new one is written in
    clearTimeout(swapT);
    swapT = setTimeout(() => {
      cols.innerHTML = v.cols.map((t, j) => `<span style="--i:${j}">${t}</span>`).join('');
      en.textContent = v.en;
      void card.offsetWidth;                                 // commit the masked start so the reveal transitions
      card.classList.add('on');
    }, k ? 380 : 0);
    for (const m of el.querySelectorAll('[data-id]')) {     // this card's marks draw in; earlier ones stay, dimmed
      const id = m.dataset.id, now = c.show.includes(id), before = PROLOGUE.slice(0, k).some((p) => p.show.includes(id));
      m.classList.toggle('on', now || before); m.classList.toggle('hot', now);
    }
    // drift: bring the focus toward 38 % x (clear of the calligraphy card on the right, which covered 南鄭 when the focus
    // was centred), never past the paper edge; every lit place label stays readable on the paper left of that card (the
    // card-4 zoom cropped 陽平關 at the left edge): the zoom backs off until their span fits, then the drift is clamped
    let x0 = 1600, x1 = 0, y0 = 900, y1 = 0;
    for (const m of el.querySelectorAll('.pl-labels .pl-mark.on')) {
      const b = m.getBBox(); x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x + b.width); y0 = Math.min(y0, b.y); y1 = Math.max(y1, b.y + b.height);
    }
    const [fx, fy, s0] = c.focus, fit = x1 > x0, s = fit ? Math.max(1.02, Math.min(s0, 1060 / (x1 - x0), 840 / (y1 - y0))) : s0;
    let tx = (0.38 - fx / 1600) * s * 100, ty = (0.5 - fy / 900) * s * 100;
    if (fit) {                                                // screen x = 800 + (x - 800)·s + tx·16 (viewBox units)
      tx = Math.max(Math.min(tx, (1100 - 800 - (x1 - 800) * s) / 16), (40 - 800 - (x0 - 800) * s) / 16);
      ty = Math.max(Math.min(ty, (870 - 450 - (y1 - 450) * s) / 9), (30 - 450 - (y0 - 450) * s) / 9);
    }
    const lim = (s - 1) / 2 * 100;
    tx = Math.max(-lim, Math.min(lim, tx)); ty = Math.max(-lim, Math.min(lim, ty));
    map.style.transform = `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${s})`;
    pips.innerHTML = PROLOGUE.map((_, j) => `<b class="${j === k ? 'on' : j < k ? 'past' : ''}">${NUM[j]}</b>`).join('');
    later(() => show(k + 1), 1.4 + v.cols.length * 0.55 + Math.min(3.2, 1.6 + v.en.length * 0.018));
  }
  function stamp() {
    if (phase === 'stamp' || phase === 'out') return;
    phase = 'stamp'; k = PROLOGUE.length; stampAt = performance.now(); clearTimeout(swapT);
    el.classList.add('stamped'); card.classList.remove('on');
    for (const m of el.querySelectorAll('[data-id]')) { m.classList.add('on'); m.classList.remove('hot'); }
    map.style.transform = 'translate(0, 0) scale(1.06)';
    later(go, 3.4);
  }
  function go() {
    if (phase === 'out') return;
    phase = 'out'; el.classList.add('out');
    later(() => flow.go('battle', ctx), 0.55);          // index.html #prologue.out: the fade off the field
  }

  // tap = next card (on the title: start now); hold = skip to the title. Keys and pointer share one hold clock.
  // (the skip itself is a timer, the ring only paints: a CSS transition while .on)
  const down = () => {
    if (holdT0 || phase !== 'cards') return;
    holdT0 = performance.now(); ring.classList.add('on');
    holdTimer = setTimeout(() => { holdT0 = 0; ring.classList.remove('on'); stamp(); }, HOLD * 1000);
  };
  const up = () => {
    if (phase === 'stamp') { if (performance.now() - stampAt > 900) go(); return; }
    if (!holdT0) return;
    const held = (performance.now() - holdT0) / 1000;
    holdT0 = 0; clearTimeout(holdTimer); ring.classList.remove('on');
    if (held < HOLD && phase === 'cards') show(k + 1);
  };
  const key = (e) => {
    if (e.code === 'Escape') { if (phase === 'cards') stamp(); else if (phase === 'stamp') go(); return; }
    if (e.code !== 'Enter' && e.code !== 'NumpadEnter' && e.code !== 'Space') return;
    e.preventDefault();
    if (e.type === 'keydown') { if (!e.repeat) down(); } else up();
  };
  el.addEventListener('pointerdown', (e) => { if (e.button === 0) down(); });
  el.addEventListener('pointerup', (e) => { if (e.button === 0) up(); });

  let built = null;                                          // chapter id whose map + stamp are in the DOM
  return {
    enter(c) {
      ctx = c; phase = 'cards'; holdT0 = 0; stampAt = 0;
      const C = chapter(c.ch), { CH } = C;
      if (built !== CH.id) {
        built = CH.id;
        map.outerHTML = MAP(C.PL_MAP); map = $('.pl-map');
        $('.pl-stamp').innerHTML = `<small>${CH.num.zh}</small><b>${CH.title.zh}</b><i>${CH.seal}</i><em>${CH.num.en} · ${CH.title.en.toUpperCase()}</em>`;
      }
      // this hero's cards: his branch, else the card's own text; a card with neither is skipped
      PROLOGUE = C.PROLOGUE.map((p) => ({ ...p, v: p[c.char] || p })).filter((p) => p.v.cols).slice(0, NUM.length);
      el.classList.remove('stamped', 'out', 'open'); card.classList.remove('on');
      for (const m of el.querySelectorAll('[data-id]')) m.classList.remove('on', 'hot');
      map.style.transform = 'translate(0, 0) scale(1.1)';
      ring.classList.remove('on');
      void el.offsetWidth;
      el.classList.add('open');                             // the scroll unrolls (CSS), the first card follows
      addEventListener('keydown', key); addEventListener('keyup', key);
      later(() => show(0), 1.1);
    },
    exit() {
      phase = 'off'; clearTimeout(timer); clearTimeout(swapT); clearTimeout(holdTimer);
      removeEventListener('keydown', key); removeEventListener('keyup', key);
    },
  };
}
