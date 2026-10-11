// DOM HUD in the DW8 layout with the concept's calligraphy: pixel portrait badge + long teal HP bar + 3-segment
// musou gauge (bottom band), KO count with slam pops and 50-KO milestone seal (bottom right / upper third, held back during finishers),
// chain counter that rolls up hit by hit with DW8 ghost digits (left), officer target bar (top left) and stacked floating
// officer name/HP/▼▼ tags, square battlefield minimap with morale bar (top right), queued system banners and dialogue,
// a title/controls intro card, an objective line (top left) with its countdown, a defend-point bar (under the minimap),
// and an idle auto-fade.
// Character text / portraits come from game.hero.char (src/chars/index.js), army glyphs / names / colours (morale bar,
// reinforcement banners, minimap dots and pings) from game.army (crowd/armies.js), both refreshed on every 'scenario'.
// Dialogue, banners and the objective are driven by story events (story:say / story:banner / story:objective, core/events.js);
// the countdown and the defend point are read from game.story.timer / game.story.defend every frame.
// Render-only: reads sim state, never writes it. Animations are timed in sim frames.
// Hero-model actors (game.actors, src/actors): a boss gets the boss bar (top, left of the minimap: brush name, red seal,
// HP + lag + poise, pulsing while enraged; the foe last struck, else the first one standing) and big banners on spawn /
// break-off / fall (the story banner band); every actor standing gets a floating tag (the one in the boss bar just ▼▼,
// another foe the officers' ▼▼ + HP, a friend a jade name) and a minimap square (boss gold-rimmed red, friend green).
// Styles live in index.html (#hud ...). Sizes are rem, and 1rem = 1/72 of the viewport height (10 px at 720p).
import { Vector3 } from 'three';
import { on } from '../core/events.js';
import { ST } from '../crowd/crowd.js';
import { ACTOR } from '../actors/actors.js';
import { NPCS } from '../chars/npc/index.js';
import { ground, zoneAt, GATES, MAP, TERRAIN as G, ROUTE, WATER, walkIn, openWater, waterPoint } from '../world/map.js';
import { CHARS, paintPortrait } from '../chars/index.js';

// render-only seam: crowd view skips its 3D officer ▼ where the floating tags below take over
export const HUD_TAG_R = 44.7;

// Minimap layer: the loaded map's whole field drawn once per map, in the minimap's orientation (map up = +Z, the way
// forward; +X is map-left, as the camera sees it at yaw 0), blitted around the hero every frame. Walkable ground pale
// with a bright rim where the cliffs / palisades stop you, the water and its fords, the castle wall with its gate
// passage (def.castle) + def.minimap.walls, the road dotted in gold. Gates, units and labels are drawn live over it.
const PPM = 2;                        // px per metre
let layer = null;
/** { canvas, x1, z1, ppm, map }: canvas pixel (u, v) ↔ world (x1 - u / ppm, z1 - v / ppm). Built on first use per map. */
function minimapLayer() {
  if (layer && layer.map === MAP) return layer;
  const W = (G.x1 - G.x0) * PPM, H = (G.z1 - G.z0) * PPM;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'), img = g.createImageData(W, H), d = img.data;
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) {
    const x = G.x1 - (u + 0.5) / PPM, z = G.z1 - (v + 0.5) / PPM, s = walkIn(x, z), o = (u + v * W) * 4;
    const wet = openWater(x, z);
    if (s > 0) {                                                         // field: pale, bright rim at the edge
      const rim = s < 1.2;
      d[o] = 214; d[o + 1] = 184; d[o + 2] = 130; d[o + 3] = rim ? 190 : 96;
      if (wet) { d[o] = 120; d[o + 1] = 160; d[o + 2] = 170; d[o + 3] = 130; }   // the fords
    } else if (wet) { d[o] = 70; d[o + 1] = 120; d[o + 2] = 150; d[o + 3] = 120; }   // deep water
    else { d[o] = 8; d[o + 1] = 5; d[o + 2] = 4; d[o + 3] = Math.min(120, 40 - s * 4); }   // rock: darker the further out
  }
  g.putImageData(img, 0, 0);
  const X = (x) => (G.x1 - x) * PPM, Y = (z) => (G.z1 - z) * PPM;
  // castle wall (x0 … corner tower) + flank wall, gate passage left open (castle.js geometry); extra walls [x0, z0, x1, z1]
  g.fillStyle = 'rgba(236,214,172,0.8)';
  const c = MAP.castle;
  if (c) {
    const e = c.gateX + 26.5;
    g.fillRect(X(e), Y(c.wallZ + 9), (e - c.x0) * PPM, 9 * PPM);
    g.fillRect(X(e), Y(c.wallZ + 50), 9 * PPM, 40 * PPM);
  }
  for (const [x0, z0, x1, z1] of MAP.minimap?.walls || []) g.fillRect(X(x1), Y(z1), (x1 - x0) * PPM, (z1 - z0) * PPM);
  if (c) {
    g.clearRect(X(c.gateX + 3.6), Y(c.wallZ + 9), 7.2 * PPM, 9 * PPM);
    g.fillStyle = 'rgba(214,184,130,0.2)'; g.fillRect(X(c.gateX + 3.6), Y(c.wallZ + 9), 7.2 * PPM, 9 * PPM);
  }
  // the road, dotted gold; the ford crossings marked
  g.strokeStyle = 'rgba(208,160,64,0.55)'; g.lineWidth = 1.5; g.setLineDash([4, 5]);
  g.beginPath(); ROUTE.forEach(([x, z], i) => (i ? g.lineTo(X(x), Y(z)) : g.moveTo(X(x), Y(z)))); g.stroke();
  g.setLineDash([]);
  g.fillStyle = 'rgba(236,214,172,0.5)';
  for (const [a, b] of WATER?.fords || []) for (let x = a + 1; x < b; x += 2.5) { const [px, pz] = waterPoint(x); g.fillRect(X(px) - 1, Y(pz) - 1, 2, 2); }
  layer = { canvas: cv, x1: G.x1, z1: G.z1, ppm: PPM, map: MAP };
  return layer;
}

export function createHud(root, game, camera) {
  const nOff = game.crowd.N - game.crowd.grunts;                     // officer slots (crowd CROWD.officerSlots)
  const nAct = 4;                                                    // actors lane: tags for hero-model actors (after the officers')
  root.innerHTML = `
    <div class="h-obj"><i>◆</i><b></b><small></small><span class="tm"><i>限時</i><b></b></span><span class="go"><i class="ar"></i><em></em></span></div>
    <div class="h-def"><i class="seal">守</i><b></b><span></span><div class="bar"><em></em><i></i></div></div>
    <div class="h-intro"><div class="zh"></div><i class="seal"></i><div class="en"></div>
      <div class="sub"></div>
      <div class="keys"></div></div>
    <div class="h-target"><i class="seal">將</i><b></b><span></span><div class="bar"><em></em><i></i></div><strong>擊破</strong></div>
    <div class="h-boss"><div class="nm"><b></b><i class="seal"></i><span></span></div><div class="bar bhp"><em></em><i></i></div><div class="bar bpo"><i></i></div></div>
    <div class="h-map"><div class="morale"><i></i><span></span><span></span></div><canvas width="200" height="200"></canvas><i class="seal">${MAP.name.zh}</i></div>
    <div class="h-offs">${'<div class="off"><i class="ld"></i><div class="mk">▼▼</div><div class="bd"><b></b><span></span><div class="bar"><em></em><i></i></div></div></div>'.repeat(nOff + nAct)}</div>
    <div class="h-chain"><div class="num"><b class="dig" data-t="0"><span>0</span></b><u></u><u></u><u></u></div><small><em>連擊</em>CHAIN</small></div>
    <div class="h-mile"><b class="dig" data-t="50"><span>50</span></b><i class="seal">擊破</i></div>
    <div class="h-band"><p></p><small></small></div>
    <div class="h-dlg"><canvas width="20" height="20"></canvas><i class="dseal"></i><div><b><i></i> <span></span></b><p></p><small></small></div></div>
    <div class="h-copy"></div>
    <div class="h-player"><div class="badge"><canvas width="20" height="20"></canvas></div><div class="name"></div>
      <div class="bar hp"><em></em><i></i></div>
      <div class="mu"><div><i></i></div><div><i></i></div><div><i></i></div><span>無雙</span></div></div>
    <div class="h-ko"><div class="num"><b class="dig" data-t="0"><span>0</span></b><u>0</u></div><small><em>擊破</em>K.O. COUNT</small></div>`;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const intro = $('.h-intro'), player = $('.h-player'), hpI = $('.hp i'), hpE = $('.hp em'), muSeg = $$('.mu i'), mu = $('.mu');
  const ko = $('.h-ko'), koB = $('.h-ko b'), koG = $('.h-ko u'), chain = $('.h-chain'), chainB = $('.h-chain b');
  const chainG = $$('.h-chain u').map((el) => ({ el, f: -99 }));          // ghost pool: one per tick, 3 alive in a roll
  const mile = $('.h-mile'), mileB = $('.h-mile b'), mileS = $('.h-mile .seal');
  const band = $('.h-band'), bandP = $('.h-band p'), bandS = $('.h-band small');
  const dlg = $('.h-dlg'), dlgP = $('.h-dlg p'), dlgS = $('.h-dlg small'), copy = $('.h-copy');
  const target = $('.h-target'), targetB = $('.h-target b'), targetS = $('.h-target span'), targetI = $('.h-target .bar i'), targetE = $('.h-target .bar em');
  const offs = $$('.off').map((el) => ({ el, bd: el.querySelector('.bd'), mk: el.querySelector('.mk'), ld: el.querySelector('.ld'),
    nm: el.querySelector('b'), en: el.querySelector('span'), bar: el.querySelector('.bar i'), lagEl: el.querySelector('.bar em'), lag: 1 }));
  const obj = $('.h-obj'), objB = $('.h-obj b'), objS = $('.h-obj small'), dlgCv = $('.h-dlg canvas'), dlgN = $('.h-dlg b i'), dlgE = $('.h-dlg b span');
  const objGo = $('.h-obj .go'), objAr = $('.h-obj .ar'), objD = $('.h-obj .go em'), dlgSeal = $('.h-dlg .dseal');
  const objTm = $('.h-obj .tm'), objTmB = $('.h-obj .tm b'), def = $('.h-def'), defB = $('.h-def b'), defS = $('.h-def span');
  const defI = $('.h-def .bar i'), defE = $('.h-def .bar em');
  const moraleI = $('.morale i'), [moraleA, moraleF] = $$('.morale span'), mapEl = $('.h-map');
  const mapCv = $('.h-map canvas'), map = mapCv.getContext('2d');
  const offName = (i) => game.crowd.offName[i - game.crowd.grunts] || { zh: '敵將', en: 'OFFICER' };
  const cap = (en) => en.replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase());
  const boss = $('.h-boss'), bossB = $('.h-boss b'), bossSeal = $('.h-boss .seal'), bossS = $('.h-boss span');
  const bossI = $('.h-boss .bhp i'), bossE = $('.h-boss .bhp em'), bossP = $('.h-boss .bpo i');

  // ---- event-driven state (frames are sim frames), rebuilt on every 'scenario' (game.frame restarts at 0)
  const S = {};
  const reset = () => {
    Object.assign(S, {
      lastCombo: 0, shownChain: 0, chainF: -99, chainQ: [], ghostN: 0, shownKo: 0, koF: -99, mile: 0, mileQ: 0, mileF: -99, busyF: -99,
      lagHp: 1, lastF: 0, hurtF: -99, actF: 0, band: null, bandQ: [], dlg: null, waveF: -999, allyF: -999, tgt: -1, tgtF: -999, tgtKoF: -999,
      musouF: -999, musouEnd: -999, waves: [], introCut: 0, obj: null, zone: null, defLag: 1,
      boss: null, bossLag: 1, bossF: -999,                          // boss bar: the actor shown, its lag chunk, last hit frame
    });
    text($('.h-map .seal'), MAP.name.zh);                             // the loaded map (main.js world.load before 'scenario')
    const { foe, ally } = game.army;                                  // armies: morale glyphs, bar colours (index.html vars)
    text(moraleA, ally.glyph); text(moraleF, foe.glyph);
    for (const [k, v] of [['--ally', ally.ui], ['--ally-d', ally.flag], ['--foe', foe.ui], ['--foe-d', foe.flag]]) mapEl.style.setProperty(k, v);
    const ch = game.hero.char;                                        // character text + portraits
    text($('.h-intro .zh'), ch.name.zh); text($('.h-intro .seal'), ch.seal); text($('.h-intro .en'), ch.name.en.toUpperCase());
    text($('.h-intro .sub'), ch.motto); text($('.h-player .name'), ch.name.zh);
    $('.h-copy').innerHTML = ch.lines.copy.join('<br>');
    // keys row from the kit: an aim mode (kit.moves.aim, 黃忠) puts hold-K aim first, before the charge
    $('.h-intro .keys').innerHTML = `<kbd>WASD</kbd> 移動 move · <kbd>J</kbd> 攻擊 attack · ${ch.kit.moves.aim
      ? '<kbd>K</kbd> 長按瞄準 hold to aim · 連擊中 蓄力 mid-combo charge' : '<kbd>K</kbd> 蓄力 charge'}<br>
      <kbd>Space</kbd> 跳躍 jump · <kbd>L</kbd> 閃避 dodge · <kbd>I</kbd> 無雙 musou · <kbd>R</kbd> 鎖定 recenter · <kbd>H</kbd> 說明`;
    paintPortrait($('.h-player canvas'), ch);
    for (const g of chainG) g.f = -99;
    for (const o of offs) o.lag = 1;
  };
  on('scenario', reset);
  // heavy numerals: the rim layer (::before) reads data-t, the gradient face is the inner span
  const num = (el, v) => { v = String(v); if (el.dataset.t !== v) { el.dataset.t = v; el.firstChild.textContent = v; } };
  let showKeys = null;
  // system banners queue (one at a time, held back while the Musou plays); dialogue (top left) and the banner band
  // (y 64-70 %) sit apart, so neither cancels the other. Dialogue holds 5 s like DW8.
  // big: the DW8 officer-slain / commander banners (larger gold brush type in the same band)
  // pri: 0 officer KO / wave, 1 story, 2 big story. The queue stays sorted by pri (FIFO within one); when full the lowest
  // (newest of the lowest) is dropped, never a higher one. A big story banner flushes queued pri-0 chatter and cuts a
  // pri-0 band in play, so the chapter payoff (敵總大將 討取！) shows at once, inside the victory slow-mo.
  const banner = (html, en, dur = 150, big = false, pri = 0) => {
    const q = S.bandQ;
    if (pri >= 2) { for (let k = q.length - 1; k >= 0; k--) if (!q[k].pri) q.splice(k, 1); if (S.band && !S.band.pri) S.band = null; }
    let k = q.length; while (k > 0 && q[k - 1].pri < pri) k--;
    q.splice(k, 0, { html, en, dur, big, pri });
    if (q.length > 3) q.splice(q.reduce((m, e, j) => (e.pri <= q[m].pri ? j : m), 0), 1);
  };
  // dialogue: speaker {zh, en} (default: the hero); portrait = CHARS id (default: the hero's) or {seal: glyph} (story
  // NPCs: a carved name seal instead of a face). side 'wei' turns the panel's rule and name vermilion (enemy speaking).
  const say = (zh, en, dur = 300, speaker = game.hero.char.name, portrait = game.hero.char.id, side = 'shu') => {
    S.dlg = { zh, en, f: game.frame, dur };
    text(dlgN, speaker.zh); text(dlgE, speaker.en.toUpperCase());
    const seal = portrait.seal;
    if (!seal) paintPortrait(dlgCv, CHARS[portrait] || NPCS[portrait]);
    set(dlgCv, 'display', seal ? 'none' : '');
    set(dlgSeal, 'display', seal ? 'block' : 'none'); if (seal) text(dlgSeal, seal);
    dlg.classList.toggle('wei', side === 'wei');
  };
  on('story:say', (e) => say(e.zh, e.en, e.dur ?? 300, e.speaker, e.portrait, e.side));
  on('story:banner', (e) => banner(e.html, e.en, e.dur ?? 150, !!e.big, e.big ? 2 : 1));
  on('story:objective', (e) => { S.obj = e.zh ? { zh: e.zh, en: e.en || '', f: game.frame } : null; if (S.obj) { text(objB, e.zh); text(objS, e.en || ''); } });
  on('crowd:wave', (e) => {
    if (game.frame - S.waveF > 600) { S.waveF = game.frame; const a = game.army.foe; banner(`<em>${a.name.zh}</em>援兵 抵達`, `${a.name.en} reinforcements have arrived!`, 130); }
    S.waves.push({ x: e.x, z: e.z, f: game.frame });
  });
  on('crowd:allies', (e) => {
    if (game.frame - S.allyF > 900) { S.allyF = game.frame; const a = game.army.ally; banner(`<em>${a.name.zh}</em>援兵 趕到`, `${a.name.en} reinforcements have joined the fight`, 120); }
    S.waves.push({ x: e.x, z: e.z, f: game.frame, ally: true });
  });
  on('hit', (e) => { S.actF = game.frame; if (e.officer) { S.tgt = e.i; S.tgtF = game.frame; } });
  on('attack:start', () => { S.actF = game.frame; });
  on('ko', (e) => {
    if (!e.officer || game.crowd.boss[e.i]) return;                   // the story announces the commander itself (big banner)
    const { zh, en } = offName(e.i);
    banner(`敵將 <em>${zh}</em> 擊破！`, `Enemy officer ${cap(en)} defeated!`, 150);
    S.tgt = e.i; S.tgtKoF = game.frame;
  });
  on('musou:start', () => { S.musouF = S.actF = game.frame; S.band = null; S.dlg = null; });
  on('musou:end', () => { S.musouEnd = game.frame; const l = game.hero.char.lines.musouEnd; say(l.zh, l.en); S.dlg.f += 20; });
  on('hero:hurt', () => { S.hurtF = S.actF = game.frame; });
  // actors lane: hero-model actors — banners in the story band (big for a boss), the boss bar follows the last one struck
  on('actor:spawn', (e) => {
    const { zh, en } = e.name;
    if (e.role === 'boss') {
      S.boss = game.actors.get(e.key); S.bossLag = 1;
      if (game.mode !== 'story') banner(e.intro ? e.intro.zh : `<em>${zh}</em> 出陣`, e.intro ? e.intro.en : `${cap(en)} takes the field!`, 200, true, 2);
    }
    else if (e.role === 'ally') banner(`<em>${zh}</em> 參戰`, `${cap(en)} joins the battle`, 150, false, 1);
  });
  on('actor:hit', (e) => { S.boss = game.actors.get(e.key); S.bossF = S.actF = game.frame; });
  on('actor:retreat', (e) => {
    const a = game.actors.get(e.key);
    if (a && a.isFoe && game.mode !== 'story') banner(e.beaten ? `<em>${a.name.zh}</em> 敗走！` : `<em>${a.name.zh}</em> 撤退`, `${cap(a.name.en)} ${e.beaten ? 'is routed!' : 'withdraws'}`, e.beaten ? 220 : 150, e.beaten, e.beaten ? 2 : 1);
  });
  on('actor:down', (e) => { const a = game.actors.get(e.key); if (a && game.mode !== 'story') banner(`敵將 <em>${a.name.zh}</em> 擊破！`, `${cap(a.name.en)} defeated!`, 220, true, 2); });
  addEventListener('keydown', (e) => { if (e.code === 'KeyH') showKeys = !(showKeys ?? true); });

  const set = (el, prop, v) => { if (el.style[prop] !== v) el.style[prop] = v; };
  const text = (el, v) => { v = String(v); if (el.textContent !== v) el.textContent = v; };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const mileOf = (n) => (n < 50 ? (n >= 25 ? 25 : 0) : Math.floor(n / 50) * 50);   // last KO milestone reached
  const v3 = new Vector3(), acts = [];
  reset();

  return {
    update() {
      const h = game.hero, f = game.frame, c = game.crowd, { foe, ally } = game.army;
      const W = root.clientWidth, H = root.clientHeight;
      const df = Math.max(0, f - S.lastF); S.lastF = f;
      const inMusou = h.state === 'musou';

      // intro card (title + controls): first 3.5 s of a scenario; H toggles the controls back
      // (an officer tag that would land on the card fades it out instead of being shoved aside: S.introCut, set below)
      const introA = showKeys === false || S.musouF >= 0 ? 0 : clamp01((180 - f) / 30) * (1 - S.introCut);
      set(intro, 'opacity', (showKeys ? 1 : introA).toFixed(2));

      // idle auto-fade (quieter than DW8 at rest): 4 s after the last attack/hit/hurt, the player band, minimap and KO
      // count ease to 55 % over 40 f; the next action snaps them back. A full musou gauge keeps the band lit.
      const calm = 1 - 0.45 * clamp01((f - S.actF - 240) / 40) * (game.musou.ready() ? 0 : 1);
      set(player, 'opacity', calm.toFixed(2)); set(mapEl, 'opacity', calm.toFixed(2));

      // HP (teal, white lag bar) + 3-segment musou gauge
      const hp = h.hp / h.hpMax;
      S.lagHp = f - S.hurtF < 20 ? S.lagHp : Math.max(hp, S.lagHp - 0.008 * df);
      if (S.lagHp < hp) S.lagHp = hp;
      set(hpI, 'transform', `scaleX(${hp.toFixed(4)})`);
      set(hpE, 'transform', `scaleX(${S.lagHp.toFixed(4)})`);
      player.classList.toggle('low', hp < 0.3);
      player.classList.toggle('hurt', f - S.hurtF < 12);
      const m3 = h.musou / h.musouMax * 3;
      muSeg.forEach((el, k) => set(el, 'transform', `scaleX(${(Math.floor(clamp01(m3 - k) * 32) / 32).toFixed(4)})`));  // pixel-stepped fill
      const full = game.musou.ready() && !inMusou;                   // musou part r3: ready at one full segment (one Musou spends one)
      mu.classList.toggle('full', full);
      if (full) {                                                    // ready: glow pulse + glint sweeping the 3 segments
        mu.style.setProperty('--p', (0.5 + 0.5 * Math.sin(f * 0.12)).toFixed(2));
        const sw = (f % 90) / 50 * 3.6 - 0.3;
        muSeg.forEach((el, k) => el.style.setProperty('--s', `${((sw - k) * 100).toFixed(1)}%`));
      }
      mu.classList.toggle('active', inMusou);

      // chain counter (left). Combat resolves a whole swing's hits on one sim frame, so the shown number rolls up to
      // h.combo in DW8-style ticks instead of jumping: one tick every 2 f, the first on the hit frame, front-loaded steps
      // (+4 +3 +3 +2 +2 +2 for a 16-hit sweep). Each hit batch is queued as [frame, combo] and shown within 10 f (6 ticks),
      // so a long Musou stream never falls behind. Every tick spawns a ghost of the new last digit (pool of 3, so a roll
      // leaves a trail): 1.45× up-right with a smear, merging into the number in 6 f.
      if (h.combo < S.shownChain) { S.shownChain = 0; S.chainF = -99; S.chainQ.length = 0; }   // chain broke: roll from 0
      if (h.combo !== S.lastCombo) { if (h.combo > S.lastCombo) S.chainQ.push([f, h.combo]); S.lastCombo = h.combo; }
      if (h.combo > S.shownChain && f - S.chainF >= 2) {
        const prev = S.shownChain;
        let step = Math.floor((h.combo - prev) * 0.3);
        for (const [F, C] of S.chainQ) step = Math.max(step, Math.ceil((C - prev) / Math.max(1, ((F + 10 - f) >> 1) + 1)));
        S.shownChain = Math.min(h.combo, prev + Math.max(1, step));
        while (S.chainQ.length && S.chainQ[0][1] <= S.shownChain) S.chainQ.shift();
        S.chainF = f; num(chainB, S.shownChain);
        const g = chainG[S.ghostN++ % chainG.length];
        text(g.el, S.shownChain % 10); g.f = f;                                      // DW8 ghosts the last digit
      }
      const ct = f - S.chainF;
      set(chain, 'opacity', h.combo > 1 ? Math.min(1, h.comboT / 24).toFixed(2) : '0');
      set(chainB, 'transform', `scale(${(1 + 0.14 * clamp01(1 - ct / 4)).toFixed(3)})`);
      chainG.forEach((g, k) => {                // holds up-right, then slides in; a superseded ghost dims to a smear
        const a = (f - g.f) / 6, e = a < 1 ? 1 - a * a : 0, newest = k === (S.ghostN - 1) % chainG.length;
        set(g.el, 'opacity', (0.95 * e * (newest ? 1 : 0.35)).toFixed(2));
        set(g.el, 'transform', `translate(${(e * 0.52).toFixed(3)}em, ${(-e * 0.3).toFixed(3)}em) scale(${(1 + 0.45 * e).toFixed(3)})`);
      });

      // KO count (bottom right) counts up in DW8-style batches: every slam (>= 4 f apart) adds the KOs since the last
      // one (a big Musou batch as +10/+15 slams, caught up within ~8 f), lands at ~3× and settles in 7 f, then a ghost
      // rings out. The milestone fires on the true count, on the KO frame, and only the highest one crossed (a mass KO
      // from 18 to 54 shows "50", not "25" then "50"): every 50 like DW8, plus an early first one at 25 outside Musou.
      if (h.kos < S.shownKo) S.shownKo = h.kos;
      if (h.kos > S.shownKo && f - S.koF >= 4) {
        const gap = h.kos - S.shownKo;
        S.shownKo += gap <= 10 ? gap : Math.max(10, Math.ceil(gap / 10) * 5);
        S.koF = f; num(koB, S.shownKo); text(koG, S.shownKo);
      }
      const m = mileOf(h.kos);
      if (m < S.mile) S.mile = S.mileQ = m;
      if (m > S.mile) { S.mile = m; num(mileB, m); }                    // queued: shows the highest one crossed
      // held back while a charge finisher or the Musou payoff owns the screen (+ ~0.4 s for its blast to clear)
      if (inMusou || (h.move && (h.move[0] === 'c' || h.move === 'jc'))) S.busyF = f;
      if (S.mile > S.mileQ && f - S.busyF > 24 && f - S.musouEnd > 24) {
        S.mileQ = S.mile; S.mileF = f;
        S.shownKo = h.kos; S.koF = f; num(koB, h.kos); text(koG, h.kos);  // the corner count slams to the true total with it
      }
      const kt = f - S.koF, slam = clamp01(1 - kt / 7);
      set(koB, 'transform', `scale(${(1 + 0.45 * slam * slam).toFixed(3)})`);   // the slam stays inside its corner box
      const ring = kt >= 5 && kt < 20 ? (kt - 5) / 15 : 1;
      set(koG, 'opacity', ((1 - ring) * 0.55).toFixed(2));
      set(koG, 'transform', `scale(${(1 + ring * 0.35).toFixed(3)})`);
      set(ko, 'opacity', S.shownKo === 0 ? '0' : Math.min(calm, f - S.koF > 300 ? 0.7 : 1).toFixed(2));   // hidden until the first KO

      // KO milestone (upper third, right of centre: off the fighting space), DW8 timing (~0.3 s): slams in solid at 1.7× → 1 over 3 f with a white-hot flash, holds to
      // f 11, then slides left and fades out by f 18. The red 擊破 seal stamps down at f 2.
      const mt = f - S.mileF;
      if (mt < 19) {
        const k = clamp01(1 - mt / 3), fl = clamp01(1 - mt / 5);
        set(mile, 'opacity', ((mt < 11 ? 1 : 1 - (mt - 11) / 7)).toFixed(2));
        set(mile, 'transform', `translate(${(mt < 11 ? 0 : -(mt - 11) * 0.36).toFixed(2)}rem, 0) scale(${(1 + 0.7 * k * k).toFixed(3)})`);
        set(mile, 'filter', fl > 0 ? `brightness(${(1 + 0.9 * fl).toFixed(2)})` : 'none');
        const st = mt - 2;
        set(mileS, 'opacity', st < 0 ? '0' : '1');
        set(mileS, 'transform', `rotate(-6deg) scale(${(1 + 0.5 * clamp01(1 - st / 2)).toFixed(3)})`);
      } else set(mile, 'opacity', '0');

      // system banner (story: full-width band, y 64-70 %; pri-0 chatter — waves, officer KOs — a narrow strip up at y 27 %) and dialogue (portrait + 2 lines, top left: keeps the centre clear)
      if ((!S.band || f - S.band.f >= S.band.dur) && S.bandQ.length && !inMusou) S.band = { ...S.bandQ.shift(), f };
      const b = S.band, bt = b ? f - b.f : 1e9;
      if (b && bt < b.dur) {
        if (bandP.innerHTML !== b.html) { bandP.innerHTML = b.html; text(bandS, b.en); band.classList.toggle('big', b.big); band.classList.toggle('lo', !b.pri); }
        set(band, 'opacity', Math.min(1, bt / 6, (b.dur - bt) / 18).toFixed(2));
        set(band, 'transform', `scaleY(${Math.min(1, 0.3 + bt / 6).toFixed(3)})`);
      } else set(band, 'opacity', '0');
      const d = S.dlg, dt = d ? f - d.f : -1, dlgA = d && dt >= 0 && dt < d.dur ? Math.min(1, dt / 8, (d.dur - dt) / 16) : 0;
      if (dlgA > 0) {
        text(dlgP, d.zh); text(dlgS, d.en);
        set(dlg, 'opacity', dlgA.toFixed(2));
        set(dlg, 'transform', `translateX(${(-Math.max(0, 1 - dt / 8) * 2).toFixed(2)}rem)`);
      } else set(dlg, 'opacity', '0');
      // objective (top left, above the target bar): fades in over 12 f, hidden while the intro card or a Musou is up; a new
      // one flares gold for 1.5 s. The arrow after it points (camera-relative: up = where the camera looks, screen right
      // = -X) at game.story.target with the distance, and hides within 8 m.
      set(obj, 'opacity', S.obj && !inMusou ? (Math.min(1, (f - S.obj.f) / 12) * (1 - introA)).toFixed(2) : '0');
      obj.classList.toggle('new', !!S.obj && f - S.obj.f < 90);
      const goT = S.obj && game.story.target, goD = goT ? Math.hypot(goT.x - h.x, goT.z - h.z) : 0;
      set(objGo, 'opacity', goT && goD > 8 ? '1' : '0');
      if (goT && goD > 8) {
        set(objAr, 'transform', `rotate(${(game.cam.yaw - Math.atan2(goT.x - h.x, goT.z - h.z)).toFixed(3)}rad)`);
        text(objD, `${Math.round(goD)}m`);
      }
      // objective countdown (story obj.timer): m:ss after the objective, pulsing red over the last 10 s
      const tl = S.obj ? game.story.timer : null;
      set(objTm, 'display', tl == null ? 'none' : '');
      if (tl != null) { text(objTmB, `${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}`); objTm.classList.toggle('low', tl <= 10); }
      // defend point (story `defend`): its name + HP bar under the minimap, a white lag chunk draining after a loss
      const dp = game.story.defend;
      set(def, 'opacity', dp && !inMusou ? '1' : '0');
      if (dp) {
        text(defB, dp.name.zh); text(defS, dp.name.en.toUpperCase());
        S.defLag = Math.max(dp.f, S.defLag - 0.004 * df);
        set(defI, 'transform', `scaleX(${dp.f.toFixed(4)})`); set(defE, 'transform', `scaleX(${S.defLag.toFixed(4)})`);
        def.classList.toggle('low', dp.f < 0.3);
      }

      // musou: vertical calligraphy copy on the right (concept) while the musou runs
      const mf = f - S.musouF, me = f - S.musouEnd;
      const copyA = inMusou || me < 30 ? Math.min(clamp01((mf - 8) / 14), me >= 0 && me < 30 ? 1 - me / 30 : 1) : 0;
      set(copy, 'opacity', copyA.toFixed(2));

      // officer target bar (top left): last officer hit (10 s) or the nearest officer within 9 m
      let tg = S.tgt >= 0 && c.st[S.tgt] !== ST.OFF && (f - S.tgtF < 600 || f - S.tgtKoF < 70) ? S.tgt : -1;
      if (tg < 0) {
        let bd = 81;
        for (let i = c.grunts; i < c.N; i++) {
          if (c.st[i] === ST.OFF || c.st[i] === ST.DEAD) continue;
          const d2 = (c.x[i] - h.x) ** 2 + (c.z[i] - h.z) ** 2;
          if (d2 < bd) { bd = d2; tg = i; }
        }
      }
      const tKo = tg >= 0 && f - S.tgtKoF < 70 && tg === S.tgt;
      set(target, 'opacity', tg >= 0 && introA < 0.5 ? (tKo ? clamp01((70 - (f - S.tgtKoF)) / 20) : 1).toFixed(2) : '0');
      if (tg >= 0) {
        const { zh, en } = offName(tg);
        text(targetB, zh); text(targetS, en);
        const th = clamp01(c.hp[tg] / c.hpMax[tg]);
        set(targetI, 'transform', `scaleX(${th.toFixed(4)})`);
        set(targetE, 'transform', `scaleX(${Math.max(th, 1 - clamp01((f - S.tgtF) / 40) * (1 - th)).toFixed(4)})`);
        target.classList.toggle('ko', tKo);
      }

      // boss bar (actors lane, top, left of the minimap): the foe actor last struck, else the first one standing; held 2.5 s after he
      // falls / breaks off. HP (white lag chunk drains 1/3 s after a hit) over the poise bar; pulses red while enraged.
      // Hidden in the Musou cut, stepped back under the KO milestone (as the tags).
      let ba = S.boss;
      if (!ba || ba.state === 'gone' || (ba.dead && f - S.bossF > 150)) {
        ba = null;
        for (const a of game.actors.list) if (game.actors.foe(a)) { ba = S.boss = a; S.bossLag = a.hp / a.hpMax; break; }
      }
      set(boss, 'opacity', ba && !inMusou ? (mt < 19 ? '0.3' : '1') : '0');
      if (ba) {
        text(bossB, ba.name.zh); text(bossSeal, ba.seal); text(bossS, ba.name.en.toUpperCase());
        const k = clamp01(ba.hp / ba.hpMax);
        if (f - S.bossF >= 20) S.bossLag = Math.max(k, S.bossLag - 0.006 * df);
        if (S.bossLag < k) S.bossLag = k;
        set(bossI, 'transform', `scaleX(${k.toFixed(4)})`); set(bossE, 'transform', `scaleX(${S.bossLag.toFixed(4)})`);
        set(bossP, 'transform', `scaleX(${clamp01(ba.poise / ba.poiseMax).toFixed(4)})`);
        const rage = !ba.dead && k < ACTOR.rage;
        boss.classList.toggle('rage', rage);
        if (rage) boss.style.setProperty('--p', (0.5 + 0.5 * Math.sin(f * 0.15)).toFixed(2));
      }

      // floating officer tags (DW8): ▼▼ right on the officer's head top, name + red HP bar stacked above it. Every
      // on-screen officer within 45 m gets one, scaled by camera distance (k 0.7-1, so CJK stays ≥ 17 px and Latin ≥ 9 px
      // at 720p) and faded out over the last 5 m. Only the tag body is ever moved — clear of the screen top, the target
      // bar, the intro card, the dialogue and the minimap (it slides left of the map instead of vanishing) — and when it
      // has to leave the ▼▼, a thin leader ties it back to the officer. Overlapping bodies stack: the lowest (nearest)
      // keeps its spot, the next lifts above it, or slides beside it when there is no room above.
      const rem = H / 72, tags = [];
      let clash = false;
      const mapL = W * 0.976 - 22.5 * rem, mapB = (dp ? 32 : 26) * rem;   // + the defend bar under the minimap
      const zones = [], bossOn = !!ba && !inMusou;                        // [right edge, bottom] of top-left HUD blocks
      if (tg >= 0 && introA < 0.5) zones.push([2.6 * rem + W * 0.36 + 2 * rem, 8.5 * rem]);
      if (dlgA > 0) zones.push([dlg.offsetLeft + dlg.offsetWidth - 4 * rem, dlg.offsetTop + dlg.offsetHeight + rem]);   // minus the fade tail
      const place = (o) => {                                              // keep a body inside the free screen area
        o.bx = Math.max(o.tw / 2 + rem, Math.min(W - o.tw / 2 - rem, o.bx));
        if (o.bx + o.tw / 2 > mapL && o.by - o.th < mapB) o.bx = mapL - o.tw / 2 - 0.5 * rem;
        let top = 1.5 * rem;
        for (const [r, bt] of zones) {                                  // below the block, unless that would drop the
          if (o.bx - o.tw / 2 >= r) continue;                             // body onto the officer: then beside it
          if (bt + o.th > o.ay - o.mkH + rem) o.bx = r + o.tw / 2 + 0.5 * rem; else top = Math.max(top, bt);
        }
        if (bossOn && o.bx + o.tw / 2 > boss.offsetLeft && o.bx - o.tw / 2 < boss.offsetLeft + boss.offsetWidth) top = Math.max(top, 8 * rem);   // under the boss bar
        o.by = Math.min(H * 0.8, Math.max(o.by, top + o.th));
        return top;
      };
      acts.length = 0;
      for (const a of game.actors.list) if (a.state !== 'gone' && a.state !== 'down' && acts.length < nAct) acts.push(a);
      offs.forEach((o, j) => {
        o.show = false;
        if (inMusou) return;                                          // r5: the Musou cut is clean (a tag sat on the dragon's face)
        // the body: an officer slot, or (tags past nOff) a hero-model actor
        let x, y, z, hy, hp, hpMax, nm, ally = false;
        if (j < nOff) {
          const i = c.grunts + j;
          if (i >= c.N || c.st[i] === ST.OFF || c.st[i] === ST.DEAD) return;
          // ▼▼ on the helmet crest (2.3 m standing); a reacting officer bends or falls, so the anchor eases down with him
          const st = c.st[i];
          hy = st === ST.HURT || st === ST.KNOCK ? 1.7 : st === ST.AIR ? 1.3 : st === ST.DOWN || st === ST.GETUP ? 1.1 : 2.3;
          x = c.x[i]; y = c.y[i]; z = c.z[i]; hp = c.hp[i]; hpMax = c.hpMax[i]; nm = offName(i);
        } else {
          const a = acts[j - nOff];
          if (!a) return;
          hy = (a.state === 'stagger' ? 1.8 : 2.3) * a.scale;
          x = a.x; y = a.y; z = a.z; hp = a.hp; hpMax = a.hpMax; nm = a.name; ally = !a.isFoe;
        }
        o.el.classList.toggle('ally', ally);
        const inBar = j >= nOff && acts[j - nOff] === ba;
        o.el.classList.toggle('boss', inBar);                         // the boss bar names him: ▼▼ only (no body to stack)
        const dist = Math.hypot(x - h.x, z - h.z);
        if (dist >= HUD_TAG_R) return;                               // faded out (alpha < 0.05)
        o.hy = o.hy == null || df > 30 ? hy : o.hy + (hy - o.hy) * (1 - 0.7 ** df);
        v3.set(x, y + o.hy + ground(x, z), z);
        text(o.nm, nm.zh); text(o.en, nm.en);
        const k = Math.max(0.7, Math.min(1, 14 / v3.distanceTo(camera.position)));
        v3.project(camera);
        const sx = (v3.x + 1) / 2, sy = (1 - v3.y) / 2;
        if (v3.z >= 1 || sx < 0.02 || sx > 0.98 || sy < -0.3 || sy > 0.9) return;
        Object.assign(o, { show: true, k, ax: sx * W, ay: sy * H, mkH: 1.6 * rem * k, tw: 22 * rem * k, th: 5.5 * rem * k, a: clamp01((45 - dist) / 5) * (mt < 19 ? 0.25 : 1) });   // step back under the KO milestone
        o.bx = o.ax; o.by = o.ay - o.mkH;
        if (o.ax - o.tw / 2 < 50 * rem && o.by - o.th < 21 * rem) clash = true;   // natural spot on the intro card
        place(o); if (!inBar) tags.push(o);
        const hpF = clamp01(hp / hpMax);
        o.lag = hpF > o.lag ? hpF : Math.max(hpF, o.lag - 0.006 * df);  // white damage chunk drains after the hit
        set(o.bar, 'transform', `scaleX(${hpF.toFixed(4)})`);
        set(o.lagEl, 'transform', `scaleX(${o.lag.toFixed(4)})`);
      });
      if (f - S.tgtF < 600 || f - S.tgtKoF < 70 || S.dlg) clash = true;   // … and a dialogue line takes the corner too           // an officer fight: the target bar needs the corner
      S.introCut = clamp01(S.introCut + (clash ? 0.15 : -0.05) * df);
      tags.sort((a, b) => b.ay - a.ay);
      for (let k = 1; k < tags.length; k++) {
        for (let q = 0, n = 0; q < k && n < 12; q++) {
          const o = tags[k], p = tags[q];
          if (Math.abs(o.bx - p.bx) < (o.tw + p.tw) / 2 && o.by - o.th < p.by && p.by - p.th < o.by) {
            const lifted = p.by - p.th - 0.3 * rem;
            if (lifted - o.th >= place({ ...o, by: lifted })) o.by = lifted;
            else o.bx = p.bx + (o.bx < p.bx ? -1 : 1) * ((o.tw + p.tw) / 2 + 0.5 * rem);
            place(o);
            q = -1; n++;                                                  // moved: re-check against every placed tag
          }
        }
      }
      for (const o of offs) {
        set(o.el, 'opacity', o.show ? o.a.toFixed(2) : '0');
        if (!o.show) continue;
        set(o.el, 'transform', `translate(${o.ax.toFixed(1)}px, ${o.ay.toFixed(1)}px)`);
        set(o.bd, 'transform', `translate(${(o.bx - o.ax).toFixed(1)}px, ${(o.by - o.ay).toFixed(1)}px) scale(${o.k.toFixed(3)})`);
        const hidden = (o.ax > W * 0.976 - 20.5 * rem && o.ay < mapB) || o.ay < 0;   // ▼▼ under the minimap / above the screen
        set(o.mk, 'opacity', hidden ? '0' : '1');
        set(o.mk, 'transform', `translateX(-50%) scale(${o.k.toFixed(3)})`);
        const vx = o.bx - o.ax, vy = o.by - (o.ay - o.mkH), L = Math.hypot(vx, vy);
        set(o.ld, 'opacity', L > rem && !hidden ? '1' : '0');
        if (L > rem) set(o.ld, 'transform', `translate(0, ${(-o.mkH).toFixed(1)}px) rotate(${Math.atan2(vx, -vy).toFixed(3)}rad) scaleY(${L.toFixed(1)})`);
      }

      // morale (ally vs foe, in the armies' colours) from KOs against the enemies still standing
      let alive = 0;
      for (let i = 0; i < c.N; i++) if (c.st[i] !== ST.OFF && c.st[i] !== ST.DEAD) alive++;
      // story mode: the director's morale (stage clears raise it, the ambush / drums drop it)
      set(moraleI, 'transform', `scaleX(${(game.story.morale ?? 0.3 + 0.65 * h.kos / (h.kos + alive + 1)).toFixed(4)})`);

      // minimap: 30 m around the hero, north = the way forward (camera yaw 0; map right = -X), the loaded field
      // (minimapLayer above: walkable ground, cliffs, water, castle wall, road), 10 m grid, closed gates in red, the
      // enemy HQ (def.hq) pinned to the rim while it is off the map, the current zone's name along the bottom;
      // units, view cone, reinforcement pings; officers off the map are pinned to its edge
      const R = 30, s = 100 / R, X = (x) => 100 - (x - h.x) * s, Y = (z) => 100 - (z - h.z) * s;
      map.clearRect(0, 0, 200, 200);
      map.fillStyle = 'rgba(18,12,9,0.88)'; map.fillRect(0, 0, 200, 200);   // near-opaque: bright fires / walls must not read through
      const L = minimapLayer();
      map.drawImage(L.canvas, (L.x1 - h.x - R) * L.ppm, (L.z1 - h.z - R) * L.ppm, 2 * R * L.ppm, 2 * R * L.ppm, 0, 0, 200, 200);
      map.strokeStyle = 'rgba(214,184,130,0.12)'; map.lineWidth = 1; map.beginPath();
      for (let g = Math.ceil((h.x - R) / 10) * 10; g <= h.x + R; g += 10) { map.moveTo(X(g) + 0.5, 0); map.lineTo(X(g) + 0.5, 200); }
      for (let g = Math.ceil((h.z - R) / 10) * 10; g <= h.z + R; g += 10) { map.moveTo(0, Y(g) + 0.5); map.lineTo(200, Y(g) + 0.5); }
      map.stroke();
      map.fillStyle = '#e0412c';
      for (const id in GATES) {
        const g = GATES[id].rect;
        if (!GATES[id].open) map.fillRect(X(g[2]), Y(g[3]), (g[2] - g[0]) * s, Math.max(3, (g[3] - g[1]) * s));
      }
      const hq = game.story.hq || MAP.hq, hqX = hq ? X(hq[0]) : 100, hqY = hq ? Y(hq[1]) : 100;   // story: CH.hq, else the map's
      map.font = '700 15px "Xingkai SC", "Kaiti SC", "HudBrush", serif'; map.textAlign = 'center';
      if (!hq) { /* no enemy HQ on this map */ } else if (hqX < 8 || hqX > 192 || hqY < 8 || hqY > 192) {   // beyond the map: pin it to the rim
        const dx = hqX - 100, dy = hqY - 100, k = 90 / Math.max(Math.abs(dx), Math.abs(dy)), px = 100 + dx * k, py = 100 + dy * k, a = Math.atan2(dx, -dy);
        map.save(); map.translate(px, py); map.rotate(a);
        map.fillStyle = '#d0a040'; map.beginPath(); map.moveTo(0, -7); map.lineTo(-5, 1); map.lineTo(5, 1); map.fill();
        map.restore();
        map.fillStyle = 'rgba(236,214,172,0.9)';
        map.fillText('本陣', Math.max(18, Math.min(182, px - dx * 0.16)), Math.max(18, Math.min(186, py - dy * 0.16 + 5)));
      } else {
        map.fillStyle = '#d0a040'; map.fillRect(hqX - 4, hqY - 4, 8, 8);
        map.fillStyle = 'rgba(236,214,172,0.9)'; map.fillText('本陣', hqX, hqY - 8);
      }
      if (dp) {                                                      // the defend point: a pulsing teal ring
        map.strokeStyle = `rgba(110,224,200,${(0.6 + 0.4 * Math.sin(f * 0.1)).toFixed(2)})`; map.lineWidth = 2.5;
        map.beginPath(); map.arc(X(dp.x), Y(dp.z), 7, 0, 7); map.stroke();
      }
      const zn = zoneAt(h.x, h.z);
      if (zn) S.zone = zn;
      if (S.zone) {
        map.fillStyle = 'rgba(12,8,6,0.55)'; map.fillRect(0, 176, 200, 24);
        map.font = '700 16px "Xingkai SC", "Kaiti SC", "HudBrush", serif'; map.fillStyle = 'rgba(236,214,172,0.95)';
        map.fillText(S.zone.name.zh, 100, 194);
      }
      S.waves = S.waves.filter((w) => f - w.f < 120);
      for (const w of S.waves) {
        const t = (f - w.f) / 120;
        map.strokeStyle = (w.ally ? ally : foe).ui; map.globalAlpha = 1 - t; map.lineWidth = 2;
        map.beginPath(); map.arc(X(w.x), Y(w.z), 5 + t * 22, 0, 7); map.stroke();
      }
      map.globalAlpha = 1;
      const cy = game.cam.yaw;
      const cone = map.createRadialGradient(100, 100, 0, 100, 100, 70);
      cone.addColorStop(0, 'rgba(200,240,255,0.3)'); cone.addColorStop(1, 'rgba(200,240,255,0)');
      map.fillStyle = cone;
      map.beginPath(); map.moveTo(100, 100); map.arc(100, 100, 70, -Math.PI / 2 - cy - 0.5, -Math.PI / 2 - cy + 0.5); map.fill();
      const dots = (from, to, color) => {                            // soldiers [from, to) as 3 px dots
        map.fillStyle = color;
        for (let i = from; i < to; i++) {
          const st = c.st[i];
          if (st === ST.OFF || st === ST.DEAD) continue;
          const x = X(c.x[i]), y = Y(c.z[i]);
          if (x > -2 && x < 202 && y > -2 && y < 202) map.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      };
      dots(0, c.grunts, foe.ui); dots(c.N, c.T, ally.ui);            // foe grunts, allies
      for (let i = c.grunts; i < c.N; i++) {
        if (c.st[i] === ST.OFF || c.st[i] === ST.DEAD) continue;
        const x = Math.max(5, Math.min(195, X(c.x[i]))), y = Math.max(5, Math.min(195, Y(c.z[i])));
        map.fillStyle = '#1a0d08'; map.fillRect(x - 5, y - 5, 10, 10);
        map.fillStyle = i === tg ? '#ffe08a' : foe.ui; map.fillRect(x - 3.5, y - 3.5, 7, 7);
      }
      for (const a of acts) {                                         // actors lane: boss (gold rim) / friendly officers
        const x = Math.max(6, Math.min(194, X(a.x))), y = Math.max(6, Math.min(194, Y(a.z)));
        map.fillStyle = a.isFoe ? '#ffd24a' : '#1a0d08'; map.fillRect(x - 6, y - 6, 12, 12);
        map.fillStyle = a.isFoe ? '#e0281a' : '#7ef08a'; map.fillRect(x - 4, y - 4, 8, 8);
      }
      const ay = h.yaw;                                              // hero arrow
      const px = (a, r) => 100 - Math.sin(a) * r, py = (a, r) => 100 - Math.cos(a) * r;
      map.fillStyle = 'rgba(8,30,38,0.85)';
      map.beginPath(); map.arc(100, 100, 8, 0, 7); map.fill();
      map.fillStyle = '#9ff4ff';
      map.beginPath(); map.moveTo(px(ay, 9), py(ay, 9)); map.lineTo(px(ay + 2.5, 7), py(ay + 2.5, 7)); map.lineTo(px(ay - 2.5, 7), py(ay - 2.5, 7)); map.fill();
    },
  };
}
