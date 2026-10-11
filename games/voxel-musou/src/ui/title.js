// Title screen (#title, ui lane). DW-style key art over the live battlefield: Zhao Yun in front (spear planted, free fist
// thrown up) and Huang Zhong half a metre behind and to the right, drawing toward the lens-right and looking into it, on
// their real voxel models (kit.model on their own rigs, cloth/hair chains), backlit by the low sun up the pass with the
// burning Wei camp, smoke over the right cliff, their 趙 / 黃 standards and rising embers behind them in deep bokeh, low
// sunlit haze over the ground under the menu; a slow push-in on enter (from farther back), then a breathing drift
// (+ a little mouse parallax). The lens is fitted every frame to the pair's posed bounds, so both stay whole in the
// column right of the logo/menu band at any window shape (16:9, ultrawide, 4:3).
// Render-only: view(scene, camera, focus, dt) runs after the gameplay camera rig while this screen is up (main.js header).
// 2D: ink scrim band on the left carrying the logo (三國 seal + gold-leaf 無雙 + VOXEL MUSOU) and the menu, brush name
// tags projected beside each officer's head (hidden at ≤ 4:3), key/pad prompts along the bottom. First boot shows a
// "press any key" card (also unlocks audio); returns go straight to the menu.
// Menu: 劇情模式 → the chapter panel in place of the menu (the four chapters in campaign order, story/chapters.js: a
// locked one shows 鎖, a cleared one its best rank; beside them a card: number, title + seal, era, the prologue's
// opening lines or the unlock rule, the chapter's officers each with his own best rank). 演武試煉 → the same panel as the
// trial list (story/trials.js TRIALS: the card shows the rule, the field and the best record; a trial the records have
// not opened yet shows 鎖 + its rule, core/progress.js) with 自由演武 as its last entry → the panel again as the
// battlefield list (every chapter's field, all open, no records). A pick → the difficulty panel (初級 普通 上級 修羅,
// each with the best rank won on it for that pick, + a card: the tier's line and 敵勢 / 敵將 / 傷害 pips; 修羅 shows its
// unlock rule while locked), confirm → select {mode, ch, map}. Esc steps back one panel at a time.
// 戰績 → the records wall (every chapter and trial × every officer: best rank and a pip per tier cleared, the count
// cleared, what is still locked and how to open it) · 操作說明 → controls panel (both: Esc back).
// Mouse: hover highlights an item, click activates it.
// Screen contract: createTitle(el, flow) → { enter(ctx), exit(), view } (src/main.js header). ctx.ch (result 繼續 after
// a win, with ctx.mode): open straight on that mode's panel, focused on that chapter / trial.
import * as THREE from 'three';
import { CHARS, CHAR_ORDER, paintPortrait } from '../chars/index.js';
import { sampleClip, POSE_SIZE, CH } from '../hero/rig.js';
import { heroLook } from '../hero/model.js';
import { createNav, sfx, inkWipe, wiping, afterWipe, stamp, clearStamp, replay } from './menu.js';
import { ground } from '../world/map.js';
import { dotTex, scatter, stagePoint, standOfficer, poseOfficer } from './stage.js';
import { DIFFS, unlocked, difficulty, setDifficulty } from '../core/difficulty.js';
import { best, records, locked, UNLOCKS } from '../core/progress.js';
import { CHAPTERS, chapterOpen } from '../story/chapters.js';
import { TRIALS } from '../story/trials.js';

// brush swash drawn under the focused item (revealed left → right) — one tapered stroke, dry tail
export const SWASH = `<svg class="swash" viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true"><path d="M3 15C40 7 118 4 214 8
  S352 11 397 5L395 9C368 15 330 17 280 18C226 19 170 17 128 19C84 21 38 22 3 15ZM300 20C330 19 360 17 384 14L382 16C356 20 326 22 300 20Z"/></svg>`;

const ITEMS = [
  { go: 'story', zh: '劇情模式', en: 'Story · the Shu campaign' },
  { go: 'trial', zh: '演武試煉', en: 'Trials · free battle' },
  { go: 'rec', zh: '戰績', en: 'Records' },
  { go: 'ctl', zh: '操作說明', en: 'Controls' },
];
// the trial panel's last entry: not a trial (no records, no map of its own) — picking it opens the battlefield list
const FREE = { CH: { id: 'free', num: { zh: '無盡', en: 'ENDLESS' }, title: { zh: '自由演武', en: 'Free Battle' }, seal: '無盡',
  rule: { zh: '任選武將與戰場，無盡鏖戰，不計戰績', en: 'Any officer, any field, endless waves. No records kept.' } } };
const LISTS = { story: CHAPTERS, trial: [...TRIALS, FREE], free: CHAPTERS };   // what the chapter panel lists per mode
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const rk = (r) => (r ? `<i class="t-rk r${r}">${r}</i>` : '');                    // a rank as a ringed brush letter
export const CONTROLS = [   // also the pause menu's table (main.js)
  ['移動', 'Move', '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows', 'left stick'],
  ['攻擊', 'Attack', '<kbd>J</kbd> / left click — tap for the full combo', '<kbd>X</kbd> □'],
  ['蓄力', 'Charge', '<kbd>K</kbd> / right click — mid-combo for charge attacks', '<kbd>Y</kbd> △'],
  ['跳躍', 'Jump', '<kbd>Space</kbd>', '<kbd>A</kbd> ×'],
  ['閃避', 'Dodge', '<kbd>L</kbd> / <kbd>Shift</kbd>', '<kbd>R1</kbd> <kbd>R2</kbd>'],
  ['無雙', 'Musou', '<kbd>I</kbd> — when the gold gauge is full', '<kbd>B</kbd> ○'],
  ['視角', 'Camera', 'mouse (click the field to lock it) / <kbd>Q</kbd><kbd>E</kbd>', 'right stick'],
  ['鎖定', 'Recenter', '<kbd>R</kbd> — behind you, or onto the nearest officer', '<kbd>L1</kbd> <kbd>L2</kbd>'],
  ['瞄準', 'Aim (黃忠)', 'hold <kbd>K</kbd> / right click (standing or running) — mouse or stick aims, release to loose', 'hold <kbd>Y</kbd> △'],
  ['暫停', 'Pause', '<kbd>Esc</kbd> (also frees the mouse)', ''],
];

// ---- key-art stage. Frame: origin at the HOME map's def.stage.title point (定軍山: up its pass road, north of the idle
// gameplay hero), camera looks +Z (up the valley, into the low sun → rim light).
// Cast offsets in metres (x + = world +X = screen-left), face = yaw (0 = facing +Z, π = facing the camera), pose = a held
// frame of one of the kit's own clips. banner = the officer's surname standard planted behind him.
export const STAGE = {
  eye: 1.05, fov: 32,          // low heroic eye (m above the road), tilted up to the pair
  fitR: 0.975, fitT: 0.05, fitK: 0.97,   // framing (title.js view): right edge, top of the highest point, Zhao Yun's knees
  push: 0.22, pushT: 3.2,      // enter: start this much farther back and push in to the fitted frame over pushT s (the pair
                               // only grows into the frame: nothing is ever cropped mid-move)
  embers: 340,
  // Zhao Yun in front (arm: armL FK override, degrees — the fist straight up, clear of Huang Zhong); Huang Zhong half a
  // metre behind and right, drawing (the aim clip early in the draw: the string meets his hand in front of the chest, not
  // across his eyes), the arrow aimed toward the lens-right, head turned to the lens (root-space look override), his head
  // at Zhao Yun's shoulder line with air between them. x/z in metres; narrow = [x, z] on ≤ 4:3 windows (nk in view()).
  // tag = [x, y] rem from the head to the tag's bottom centre. banner = the surname standard behind its officer (DoF).
  cast: [
    { id: 'zhaoyun', clip: 'mu_act', u: 1, x: 0.2, z: 0, face: Math.PI + 0.1, arm: [-6, 0, 172, 8], look: [0.7, 1.8], tag: [-4.5, 6, 'L'], banner: [-0.2, 7.5] },
    { id: 'huangzhong', clip: 'aim', u: 5 / 30, x: -1.0, z: 0.7, face: Math.PI + 0.25, head: [-4, -10, 0], look: [1.0, 2.0], tag: [-1.5, -6],
      narrow: [-0.95, 0.5], banner: [-4.6, 10] },
  ],
};

// warm glows [x, y, z, width, height, r, g, b, flicker] in the stage frame (additive soft sprites, blurred by the DoF)
const GLOWS = [[1, 2.5, 30, 46, 16, 0.55, 0.24, 0.07], [-7, 1.2, 12, 9, 6, 0.9, 0.38, 0.08], [6, 0.8, 16, 7, 4, 0.7, 0.3, 0.06],
  [11, 3.5, 22, 26, 13, 0.42, 0.17, 0.05],        // backlit smoke-glow behind the logo side (screen-left), no dead black
  [-18, 7, 40, 34, 16, 0.55, 0.22, 0.05, 0.25], [-10, 4, 27, 14, 9, 0.7, 0.28, 0.06, 0.3],   // fires under the smoke, right
  // low sunlit smoke and fire bounce over the empty ground under the logo / menu (screen-left), slow breathing
  [4, 0.5, 12, 14, 2.2, 0.32, 0.15, 0.05, 0.08], [9, 1.0, 20, 24, 3.6, 0.3, 0.14, 0.05, 0.08], [2.5, 0.35, 7, 9, 1.4, 0.34, 0.15, 0.05, 0.08]];

// smoke from the burning camp [x, y, z, width, height, r, g, b, opacity]: soft normal-blended plumes over the backlit
// cliff at the top-right (it read as a black block with sky specks through its blurred voxels), lit warm from below by
// the fires above; drifting slowly
const SMOKE = [[-17, 16, 40, 38, 24, 0.2, 0.1, 0.06, 0.9], [-26, 22, 46, 44, 26, 0.24, 0.12, 0.07, 0.85], [-9, 12, 34, 22, 14, 0.26, 0.13, 0.07, 0.6],
  [-29, 25, 52, 42, 26, 0.22, 0.11, 0.07, 0.85]];

export function createTitle(el, flow) {
  el.innerHTML = `
    <div class="t-veil"></div>
    ${STAGE.cast.map(({ id }) => { const c = CHARS[id]; return `<div class="t-tag" data-id="${id}"><i>${c.seal}</i><b>${c.name.zh}</b><small>${c.name.en}</small></div>`; }).join('')}
    <div class="t-band">
      <div class="t-logo"><i class="t-seal">三國</i><h1 data-t="無雙"><span>無雙</span></h1>
        <p class="t-en"><span>VOXEL MUSOU</span></p></div>
      <div class="t-press"><b>按任意鍵開始</b><small><kbd>Enter</kbd> Press any key</small></div>
      <nav class="t-menu t-main">${ITEMS.map((it, i) => `<button data-i="${i}" style="--i:${i}"><b>${it.zh}</b><small>${it.en}</small>${SWASH}</button>`).join('')}</nav>
      <div class="t-cpanel"><nav class="t-menu t-chs"></nav>
        <div class="t-ccard"><h3></h3><p class="t-cname"><b></b><i></i></p><p class="t-cera"></p><p class="t-cline"><b></b><small></small></p>
          <p class="t-cfoot"></p></div></div>
      <div class="t-dpanel"><nav class="t-menu t-dif">${DIFFS.map((d, i) => `<button data-d="${i}" style="--i:${i}"><b>${d.zh}<i class="t-lk">鎖</i><i class="t-rk"></i></b><small>${d.en}</small>${SWASH}</button>`).join('')}</nav>
        <div class="t-dcard"><h3>難度<small>Difficulty</small></h3><p class="t-dline"><b></b><small></small></p>
          <ul class="s-stats t-dbars">${[['敵勢', 'Pressure'], ['敵將', 'Officers'], ['傷害', 'Damage']].map(([zh, en]) => `<li><b>${zh}</b><small>${en}</small><span>${'<i></i>'.repeat(5)}</span></li>`).join('')}</ul></div></div>
    </div>
    <section class="t-ctl"><h2>操作說明<small>Controls</small></h2>
      <table>${CONTROLS.map(([zh, en, kb, pad]) => `<tr><th>${zh}<small>${en}</small></th><td>${kb}</td><td class="pad">${pad}</td></tr>`).join('')}</table>
      <p>Tap attack for the combo, press charge mid-combo for a finisher. Fill the gold gauge and unleash 無雙.</p></section>
    <section class="t-rec"></section>
    <footer class="ui-foot"></footer>`;
  const $ = (s) => el.querySelector(s), btns = [...el.querySelectorAll('.t-main button')], dbtns = [...el.querySelectorAll('.t-dif button')];
  const tags = [...el.querySelectorAll('.t-tag')];
  let cur = 0, pre = true, panel = null, busy = false, dcur = 1, dmode = null;   // panel: 'ctl' | 'rec' overlay; dmode: the mode picked, while the difficulty panel is up
  let cmode = null, ccur = 0, cpick = 0, cbtns = [], list = CHAPTERS;   // cmode: 'story' | 'trial' | 'free' while the chapter / trial / battlefield panel (its list) is up

  const focus = (i, quiet) => {
    i = (i + btns.length) % btns.length;
    if (i === cur && btns[i].classList.contains('on')) return;
    btns[cur].classList.remove('on'); cur = i; btns[cur].classList.add('on');
    if (!quiet) sfx('move');
  };
  const foot = () => {
    const what = dmode ? '難度' : cmode === 'story' ? '章節' : cmode === 'trial' ? '試煉' : cmode ? '戰場' : '';
    $('.ui-foot').innerHTML = panel ? `<span><kbd>Esc</kbd><kbd class="pad">B</kbd>返回<small>Back</small></span>`
      : `<span><kbd>↑</kbd><kbd>↓</kbd>選擇${what}<small>Select</small></span><span><kbd>Enter</kbd><kbd class="pad">A</kbd>決定<small>Confirm</small></span>`
        + (what ? `<span><kbd>Esc</kbd><kbd class="pad">B</kbd>返回<small>Back</small></span>` : '');
  };
  /** Why entry i of the panel's list can't be picked yet ([zh, en]), or null: a story chapter waits on the one before
   *  it, a trial on the records (progress.js UNLOCKS); battlefields are all open. */
  const lockOf = (i) => {
    const prev = CHAPTERS[i - 1]?.CH;
    if (cmode === 'story') return chapterOpen(i) ? null : [`攻克${prev.num.zh}「${prev.title.zh}」後開啟`, `Clear ${prev.title.en} to unlock`];
    return cmode === 'trial' ? locked(list[i].CH.id)?.rule ?? null : null;
  };
  // chapter panel: the card shows the focused chapter (story: era, the prologue's opening, its officers each with his
  // best rank), trial (its field, rule and best record) or battlefield (free); a locked one: what opens it
  const cfocus = (i, quiet) => {
    i = (i + cbtns.length) % cbtns.length;
    if (i === ccur && cbtns[i].classList.contains('on')) return;
    ccur = i; cbtns.forEach((b, k) => b.classList.toggle('on', k === i));
    const { CH, PROLOGUE } = list[i], story = cmode === 'story', trial = cmode === 'trial', lock = lockOf(i);
    const p = PROLOGUE?.find((q) => q.cols), field = CHAPTERS.find((m) => m.CH.map === CH.map)?.CH.title;
    const [zh, en] = lock || (story ? [p.cols.join('，'), p.en] : trial ? [CH.rule.zh, CH.rule.en] : ['任選武將，於此鏖戰', 'Any officer, endless waves on this field']);
    $('.t-ccard').classList.toggle('lock', !!lock);
    $('.t-ccard h3').innerHTML = cmode === 'free' ? '戰場<small>Battlefield</small>' : `${CH.num.zh}<small>${CH.num.en}</small>`;
    $('.t-cname b').textContent = CH.title.zh; $('.t-cname i').textContent = CH.seal;
    $('.t-cera').innerHTML = !trial ? `${CH.era.zh}<small>${CH.era.en}</small>` : field ? `戰場・${field.zh}<small>${field.en}</small>` : '';
    $('.t-cline b').textContent = zh; $('.t-cline small').textContent = en;
    // foot: a chapter's officers, each with his own best rank; a trial's best record (the stat it is ranked on first)
    const who = story ? CH.heroes.filter((id) => CHARS[id]) : [], b = trial && best(CH.id);
    $('.t-cfoot').innerHTML = who.length ? `<span>出陣<small>Officers</small></span>${who.map((id) => `<em><canvas width="20" height="20"></canvas>${CHARS[id].name.zh}${rk(best(CH.id, id)?.rank)}</em>`).join('')}`
      : b ? `<span>最佳<small>Best</small></span>${(CH.best === 'kos' ? [`${b.kos} 擊破`, mmss(b.time)] : [mmss(b.time), `${b.kos} 擊破`]).map((t) => `<em>${t}</em>`).join('')}<strong class="r${b.rank}"><b>${b.rank}</b></strong>` : '';
    el.querySelectorAll('.t-cfoot canvas').forEach((cv, k) => paintPortrait(cv, CHARS[who[k]]));
    if (!quiet) sfx('move');
  };
  /** Open the chapter panel for mode ('story' | 'trial' | 'free'; null closes it), focused on entry id (default: story
   *  = the furthest open chapter, else the first). */
  const setCh = (mode, id) => {
    cmode = mode; el.classList.toggle('chp', !!mode); foot();
    if (mode) {
      const story = mode === 'story';
      list = LISTS[mode];
      $('.t-chs').innerHTML = list.map(({ CH }, i) => `<button data-c="${i}" class="${lockOf(i) ? 'lock' : ''}" style="--i:${i}"><b>${story ? `<em>${CH.num.zh}</em>` : ''}${CH.title.zh}<i class="t-lk">鎖</i>${
        mode === 'free' ? '' : rk(best(CH.id)?.rank)}</b><small>${story ? `${CH.num.en} · ` : ''}${CH.title.en}</small>${SWASH}</button>`).join('');
      cbtns = [...el.querySelectorAll('.t-chs button')];
      let k = list.findIndex((m) => m.CH.id === id);
      if (k < 0) { k = 0; if (story) while (k < list.length - 1 && chapterOpen(k + 1)) k++; }
      cfocus(k, true);
    }
    measure();                                          // the band changed width: the key art glides
  };
  /** The records wall: a row per chapter and trial, a column per officer — his best rank there over a pip per tier
   *  cleared (a chapter he is not in: blank) — then the count cleared and every unlock with its rule or 已解鎖. */
  function wall() {
    const R = records(), who = CHAR_ORDER;
    let done = 0, all = 0;
    const row = ({ CH }) => `<tr><th>${CH.title.zh}<small>${CH.num.zh}</small></th>${who.map((id) => {
      if (CH.heroes && !CH.heroes.includes(id)) return '<td class="na"></td>';
      const cell = R[CH.id]?.[id], r = best(CH.id, id)?.rank;
      all++; if (r) done++;
      return `<td>${r ? rk(r) : '<i class="t-rk"></i>'}<span>${DIFFS.map((d) => `<u class="${cell?.[d.id] ? 'f' : ''}"></u>`).join('')}</span></td>`;
    }).join('')}</tr>`;
    const rows = [...CHAPTERS, ...TRIALS].map(row).join('');
    $('.t-rec').innerHTML = `<h2>戰績<small>Records</small><em><b>${done}</b> / ${all}<small>cleared</small></em></h2>
      <div class="t-rbody"><div><table><tr><th></th>${who.map((id) => `<td class="${locked(id) ? 'lock' : ''}"><canvas width="20" height="20"></canvas><b>${CHARS[id].name.zh}</b></td>`).join('')}</tr>${rows}</table>
      <p class="t-rleg"><span>${'<u class="f"></u>'.repeat(DIFFS.length)}</span>${DIFFS.map((d) => d.zh).join(' · ')}<small>one pip per difficulty cleared</small></p></div>
      <ul>${UNLOCKS.map((u) => { const lk = locked(u.id); return `<li class="${lk ? '' : 'open'}"><i>${lk ? '鎖' : '開'}</i><b>${u.zh}</b><span>${lk ? u.rule[0] : '已解鎖'}<small>${lk ? u.rule[1] : `${u.en} · unlocked`}</small></span></li>`; }).join('')}</ul></div>`;
    el.querySelectorAll('.t-rec canvas').forEach((cv, k) => paintPortrait(cv, CHARS[who[k]]));
  }
  /** The overlay beside the menu: 'ctl' controls, 'rec' the records wall, null = none. */
  const setPanel = (v) => {
    panel = v; el.classList.toggle('ctl', v === 'ctl'); el.classList.toggle('rec', v === 'rec'); foot();
    if (v === 'rec') wall();
  };
  // difficulty panel: the card shows the focused tier (a locked 修羅: its unlock rule instead of the line)
  const dfocus = (i, quiet) => {
    i = (i + dbtns.length) % dbtns.length;
    if (i === dcur && dbtns[i].classList.contains('on')) return;
    dcur = i; dbtns.forEach((b, k) => b.classList.toggle('on', k === i));
    const d = DIFFS[i], open = unlocked(d), [zh, en] = open ? d.line : locked(d.id).rule;
    $('.t-dcard').classList.toggle('lock', !open);
    $('.t-dline b').textContent = zh; $('.t-dline small').textContent = en;
    el.querySelectorAll('.t-dbars li').forEach((li, k) => li.querySelectorAll('i').forEach((q, j) => q.classList.toggle('f', j < d.bars[k])));
    if (!quiet) sfx('move');
  };
  const setDif = (mode) => {
    dmode = mode; el.classList.toggle('dif', !!mode); foot();
    if (!mode) return;
    dbtns.forEach((b, k) => {                             // each tier: its lock, the best rank won on it for this pick
      const r = (mode !== 'free' && best(list[cpick].CH.id, null, DIFFS[k].id)?.rank) || '', chip = b.querySelector('.t-rk');
      b.classList.toggle('lock', !unlocked(DIFFS[k])); chip.textContent = r; chip.className = `t-rk r${r}`;
    });
    dbtns[dcur].classList.remove('on'); dfocus(DIFFS.indexOf(difficulty()), true);
    measure();                                          // the band widened: the key art glides right (the tiers slide in: CSS)
  };
  const wake = () => { pre = false; el.classList.remove('pre'); sfx('ok'); };
  const ok = () => {
    if (busy) return;
    if (wiping()) return afterWipe(ok);
    if (pre) return wake();
    if (panel) return back();
    if (dmode) {
      const d = DIFFS[dcur], mode = dmode, { CH } = list[cpick];
      if (!unlocked(d)) return sfx('back');
      setDifficulty(d); busy = true;
      stamp(dbtns[dcur], '決');
      return setTimeout(() => inkWipe(() => flow.go('select', { mode, ch: CH.id, map: CH.map })), 380);
    }
    if (cmode) {
      if (cbtns[ccur].classList.contains('lock')) return sfx('back');
      sfx('ok');
      if (list[ccur] === FREE) return setCh('free');    // 自由演武: on to the battlefield list
      cpick = ccur; return setDif(cmode);
    }
    const it = ITEMS[cur];
    sfx('ok');
    if (it.go === 'ctl' || it.go === 'rec') setPanel(it.go); else setCh(it.go);
  };
  const back = () => {
    if (busy) return;
    if (wiping()) return afterWipe(back);
    if (pre) return wake();
    if (panel) { sfx('back'); setPanel(null); }
    else if (dmode) { sfx('back'); setDif(null); measure(); }
    else if (cmode) { sfx('back'); setCh(cmode === 'free' ? 'trial' : null, FREE.CH.id); }   // battlefields: back to the trial list
  };
  // "press any key": any key wakes the menu and is swallowed (capture, before the menu driver would act on it too)
  let active = false;
  addEventListener('keydown', (e) => { if (active && pre && !e.metaKey && !e.ctrlKey) { e.stopImmediatePropagation(); e.preventDefault(); wake(); } }, true);
  const pick = (d) => (dmode ? dfocus(dcur + d) : cmode ? cfocus(ccur + d) : focus(cur + d));
  const nav = createNav({ move: (d) => { if (pre) wake(); else if (!panel && !busy) pick(d); }, ok, back });
  const point = (b, quiet) => (b.dataset.d ? dfocus(+b.dataset.d, quiet) : b.dataset.c ? cfocus(+b.dataset.c, quiet) : focus(+b.dataset.i, quiet));

  el.addEventListener('pointerover', (e) => {
    const b = e.target.closest('.t-menu button');
    if (b && !pre && !panel && !busy) point(b);
  });
  el.addEventListener('click', (e) => {
    if (pre) return wake();
    const b = e.target.closest('.t-menu button');
    if (b) { if (panel) back(); else { point(b, true); ok(); } }
    else if (panel && !e.target.closest('.t-ctl, .t-rec')) back();
  });
  // mouse parallax target (-1..1), eased in view()
  const ptr = { x: 0, y: 0, ex: 0, ey: 0 };
  el.addEventListener('pointermove', (e) => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; });

  // ---- 3D stage (render-only; built on the first view, hidden on exit, kept for the session)
  let group = null, embers = null, t = 0, enterT = 0;
  const cast = [], banners = [], glows = [], smoke = [];
  const pose = new Float32Array(POSE_SIZE), S0 = new THREE.Vector3(), P = new THREE.Vector3(), V = new THREE.Vector3(), Q = new THREE.Vector3();
  const BOX = [new THREE.Box3(), new THREE.Box3()];
  // left edge of the key art = right edge of the logo/menu band + a gutter (measured on resize, not per frame)
  let fitL = 0.45, fitLe = 0.45;   // measured, eased (a late webfont widens the band: the frame glides, never jumps)
  // menuR: right edge of the menu text (the name tag left of the spear stays clear of it); tagW: the tags' widths
  let menuR = 0; const tagW = [0, 0];
  const measure = () => {
    const r = $('.t-band').getBoundingClientRect(); if (r.width) fitL = Math.min(0.6, (r.right + innerHeight / 72 * 3) / innerWidth);
    menuR = Math.max(...[...el.querySelectorAll('.t-menu b, .t-menu small, .t-dcard, .t-ccard')].map((e) => e.getBoundingClientRect().right)) + innerHeight / 72 * 1.2;
    tags.forEach((e, i) => { tagW[i] = e.offsetWidth; });
  };
  addEventListener('resize', measure); document.fonts?.ready.then(measure);

  function bannerTex(glyph) {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 320;
    const g = cv.getContext('2d');
    const paint = () => {
      // weathered dye: smoke-dulled cream that darkens toward the hem, soot stains, a faded vermilion border
      const bg = g.createLinearGradient(0, 0, 0, 320);
      bg.addColorStop(0, '#bfa67a'); bg.addColorStop(0.55, '#9c835c'); bg.addColorStop(1, '#5a4530');
      g.fillStyle = bg; g.fillRect(0, 0, 128, 320);
      for (let i = 0; i < 26; i++) {                                                       // soot / water stains (fixed scatter)
        const r = (k) => Math.abs((Math.sin(i * 91.7 + k * 12.3) * 43758.5) % 1);
        g.fillStyle = `rgba(30,18,10,${(0.05 + r(3) * 0.1).toFixed(3)})`;
        g.beginPath(); g.ellipse(r(1) * 128, 60 + r(2) * 260, 6 + r(4) * 22, 4 + r(5) * 16, 0, 0, 7); g.fill();
      }
      // thin faded-vermilion hems (a wide dark border read as a black doorway frame round the cloth when backlit)
      g.fillStyle = '#a8442a'; g.fillRect(0, 0, 128, 10); g.fillRect(0, 0, 5, 320); g.fillRect(123, 0, 5, 320);
      for (let y = 300; y < 320; y += 4) g.clearRect(5 + ((y * 7) % 20), y, 110 - ((y * 13) % 30), 4);    // frayed hem
      g.fillStyle = '#140905'; g.font = '700 96px "Xingkai SC", "STXingkai", "HudBrush", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(glyph, 64, 150);
      tex.needsUpdate = true;
    };
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    paint();
    document.fonts?.load('700 96px HudBrush', glyph).then(paint, () => {});
    return tex;
  }
  function build(scene) {
    group = new THREE.Group(); scene.add(group);
    for (const c of STAGE.cast) {
      const o = standOfficer(c.id, group), m = o.m, parts = [];
      heroLook(m.material, ...c.look);          // key-art grade: brighter camera-side fill, hot sun rim (title copies only)
      // the raised fist: the dark glove went to a flat black cube against the sky; a firelit gauntlet here (title only)
      if (c.arm && m.meshes?.handL) m.meshes.handL.material = heroLook(new THREE.MeshStandardMaterial({ vertexColors: true,
        color: new THREE.Color(2.6, 2.3, 2), emissive: 0x5a2c10, roughness: 0.4, metalness: 0.35, flatShading: true }), 0.9, 2.4);
      // the body, weapon and cloth for the framing box (not the unculled world-space overlays: bow string etc.)
      o.root.traverse((e) => { if (e.isMesh && e.frustumCulled) parts.push(e); });
      cast.push(Object.assign(o, { c, parts }));
      // surname standard: pole + a nobori cloth (CPU wave on a 5 × 12 grid)
      const tex = bannerTex(CHARS[c.id].name.zh[0]);
      const cloth = new THREE.PlaneGeometry(1.15, 3.1, 4, 12);
      // low warm emissive = the low sun glowing through the cloth from behind (the camera sees its shaded face)
      const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffa060, emissiveIntensity: 0.3, side: THREE.DoubleSide,
        roughness: 0.95, flatShading: true, alphaTest: 0.5 });
      const mesh = new THREE.Mesh(cloth, mat), pole = new THREE.Mesh(new THREE.BoxGeometry(0.09, 6.2, 0.09), new THREE.MeshStandardMaterial({ color: 0x2e1d15, roughness: 0.8 }));
      group.add(mesh, pole);
      banners.push({ c, mesh, pole, base: Float32Array.from(cloth.attributes.position.array), ph: banners.length * 1.7 });
    }
    // embers: soft round sprites, HDR orange so they bloom; flicker via vertex colours
    const n = STAGE.embers, geo = new THREE.BufferGeometry(), seed = scatter(n * 4, 4.1).map(Math.abs);
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    embers = new THREE.Points(geo, new THREE.PointsMaterial({ map: dotTex(0.35, 0.5), size: 0.085, vertexColors: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    embers.userData.seed = seed; embers.frustumCulled = false;
    group.add(embers);
    // warm glow: the burning camp behind the pair and fires off to the sides (additive, soft, blurred further by the DoF)
    for (const [x, y, z, sx, sy, r, g2, b] of GLOWS) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: embers.material.map, color: new THREE.Color(r, g2, b), blending: THREE.AdditiveBlending,
        transparent: true, depthWrite: false, fog: false }));
      sp.scale.set(sx, sy, 1); sp.userData.at = [x, y, z]; glows.push(sp); group.add(sp);
    }
    for (const [x, y, z, sx, sy, r, g2, b, a] of SMOKE) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: embers.material.map, color: new THREE.Color(r, g2, b), opacity: a,
        transparent: true, depthWrite: false, fog: false }));
      sp.scale.set(sx, sy, 1); sp.userData.at = [x, y, z]; smoke.push(sp); group.add(sp);
    }
  }

  function view(scene, camera, focus, dt) {
    if (!group) build(scene);
    group.visible = true;
    dt = Math.min(dt || 1 / 60, 0.1); t += dt;
    const S = STAGE, O = stagePoint(S0, 'title');
    // narrower than 16:9 the art column shrinks: an officer with `narrow` [x, z] moves toward it (0 at 16:9, all of it at
    // ≤ 4:3), so the pair stays large without the silhouettes merging
    const nk = Math.min(1, Math.max(0, (1.78 - camera.aspect) / 0.45));
    // officers: a held frame of their own clip + breath (hips bob, chest swell) and the cloth/hair chains in the wind
    for (let i = 0; i < cast.length; i++) {
      const o = cast[i], c = o.c, br = Math.sin(t * 1.5 + i * 2.1);
      sampleClip(o.K.clips[c.clip], c.u, pose);
      if (c.arm) for (let k = 0; k < 4; k++) pose[CH.armL + k] = c.arm[k] * Math.PI / 180;   // key-art arm (free left arm FK)
      if (c.head) for (let k = 0; k < 3; k++) pose[CH.head + k] = c.head[k] * Math.PI / 180; // key-art look (root-space aim)
      pose[1] += br * 0.008; pose[9] += br * 0.02; pose[12] -= br * 0.015;
      const nx = c.narrow ? c.x + (c.narrow[0] - c.x) * nk : c.x, nz = c.narrow ? c.z + (c.narrow[1] - c.z) * nk : c.z;
      P.set(O.x + nx, 0, O.z + nz); P.y = ground(P.x, P.z);
      poseOfficer(o, pose, P, c.face + Math.sin(t * 0.4 + i) * 0.03, dt);
    }
    for (let i = 0; i < smoke.length; i++) {
      const [x, y, z] = smoke[i].userData.at;
      smoke[i].position.set(O.x + x + Math.sin(t * 0.06 + i * 2) * 1.5, O.y + y + Math.sin(t * 0.09 + i) * 0.8, O.z + z);
      smoke[i].material.rotation = Math.sin(t * 0.04 + i) * 0.15;
    }
    for (let i = 0; i < glows.length; i++) {
      const [x, y, z] = glows[i].userData.at;
      glows[i].position.set(O.x + x, O.y + y, O.z + z);
      const f = GLOWS[i][8] ?? 0.15, slow = f < 0.1;                    // haze breathes slowly, fires flicker
      glows[i].material.opacity = 1 - f + f * (slow ? Math.sin(t * 0.7 + i) : Math.sin(t * (3 + i * 2.3)) * Math.sin(t * 7.1 + i));
    }
    for (const b of banners) {
      const [bx, bz] = b.c.banner, x = O.x + bx, z = O.z + bz, gy = ground(x, z);
      b.pole.position.set(x, gy + 3.1, z);
      // front face toward the lens (rotation π: texture reads left-to-right), cloth hanging from the pole to screen-right
      b.mesh.position.set(x - 0.6, gy + 3.3, z + 0.11); b.mesh.rotation.y = Math.PI + 0.2;
      const a = b.mesh.geometry.attributes.position, B = b.base;
      for (let k = 0; k < a.count; k++) {
        const u = (B[k * 3] + 0.575) / 1.15, v = (1.55 - B[k * 3 + 1]) / 3.1;            // u 0 at the pole, v 0 at the top
        const w = u * 0.8 + v * 0.25;
        a.setXYZ(k, B[k * 3] + Math.sin(t * 2.2 + v * 4 + b.ph) * 0.03 * u, B[k * 3 + 1] - u * u * 0.08,
          Math.sin(t * 2.6 - u * 3.5 - v * 2 + b.ph) * 0.2 * w + Math.sin(t * 5.1 - u * 7 + b.ph) * 0.04 * w);
      }
      a.needsUpdate = true;                                                  // flatShading: normals from derivatives
    }
    // embers: a 14 × 5 × 12 m box around the pair and over the ground to screen-left, rising with a lazy curl, flickering,
    // wrapping at the top
    const ep = embers.geometry.attributes.position, ec = embers.geometry.attributes.color, sd = embers.userData.seed;
    for (let i = 0; i < S.embers; i++) {
      const a = sd[i * 4], b = sd[i * 4 + 1], c = sd[i * 4 + 2], d = sd[i * 4 + 3];
      const y = (b * 5 + t * (0.35 + c * 0.6)) % 5, life = y / 5;
      ep.setXYZ(i, O.x + 2 + (a - 0.5) * 14 + Math.sin(t * (0.6 + d) + i) * 0.4 + y * 0.25, O.y + y, O.z - 2.5 + c * 12 + Math.cos(t * 0.5 + i * 1.7) * 0.3);
      const f = (0.55 + 0.45 * Math.sin(t * (9 + d * 14) + i * 3.3)) * Math.sin(Math.PI * Math.min(1, life * 1.15)) * (0.6 + d);
      ec.setXYZ(i, 4.5 * f, 1.6 * f, 0.35 * f);
    }
    ep.needsUpdate = true; ec.needsUpdate = true;

    // camera: fitted every frame to the pair's posed bounds (any aspect): their union spans [fitL, S.fitR] of the width
    // (fitL = right of the logo/menu band), the highest point sits at S.fitT from the top and Zhao Yun's knees at S.fitK
    // (below them the ink strip: a deliberate crop). The lens looks straight up the valley (no yaw), tilted up from a low
    // eye; then the enter push-in (easeOutCubic, toward Zhao Yun), a slow breathing drift and eased mouse parallax.
    ptr.ex += (ptr.x - ptr.ex) * Math.min(1, dt * 2); ptr.ey += (ptr.y - ptr.ey) * Math.min(1, dt * 2);
    const aspect = camera.aspect, tH = Math.tan(S.fov * Math.PI / 360), tW = tH * aspect;
    // each extreme (highest point, leftmost, rightmost) is the part corner that projects farthest out from last frame's
    // lens (Q), fitted at that part's own nearer depth (spear tip, bow limb, the arrow reaching toward the lens): the
    // pair's mid-depth is up to a metre off for those, ~8 % of the frame this close
    if (!Q.z) Q.set(O.x, O.y + S.eye, O.z - 5.5);
    let top = 0, topZ = 0, pLx = 0, pLz = 0, pRx = 0, pRz = 0, sT = -Infinity, sL = -Infinity, sR = Infinity;
    const A = BOX[0], E = BOX[1];
    A.makeEmpty();
    for (let i = 0; i < 2; i++) for (const m of cast[i].parts) if (m.visible) {
      E.makeEmpty().expandByObject(m); if (!i) A.union(E);
      const d = 1 / Math.max(0.5, E.min.z - Q.z);
      if ((E.max.y - Q.y) * d > sT) { sT = (E.max.y - Q.y) * d; top = E.max.y; topZ = E.min.z; }
      if ((E.max.x - Q.x) * d > sL) { sL = (E.max.x - Q.x) * d; pLx = E.max.x; pLz = E.min.z; }
      if ((E.min.x - Q.x) * d < sR) { sR = (E.min.x - Q.x) * d; pRx = E.min.x; pRz = E.min.z; }
    }
    const zA = (A.min.z + A.max.z) / 2;
    fitLe += (fitL - fitLe) * Math.min(1, dt * 3);
    const L = fitLe, R = S.fitR, kL = (0.5 - L) * 2 * tW, kR = (0.5 - R) * 2 * tW;
    const knee = O.y + 0.5;
    const czW = (kL * pLz - kR * pRz - pLx + pRx) / (kL - kR);                           // width fit
    const czH = zA - (top - knee) / ((S.fitK - S.fitT) * 2 * tH);                        // height fit (at Zhao Yun's depth)
    let cz = Math.min(czW, czH);
    const gL = 1 / (2 * (pLz - cz) * tW), gR = 1 / (2 * (pRz - cz) * tW);
    let cx = (pLx * gL + pRx * gR - (1 - L - R)) / (gL + gR);                           // span centred in [L, R]
    const k = Math.min(1, (t - enterT) / S.pushT), push = S.push * (1 - k) ** 3;
    cz -= push * (zA - cz);
    cx += Math.sin(t * 0.13) * 0.08 - ptr.ex * 0.06;
    const cy = O.y + S.eye + Math.sin(t * 0.11) * 0.04 + ptr.ey * 0.04;
    // tilt: the knees on fitK (they stand on the ink strip) unless that would lift the highest point above fitT (height-
    // bound windows): then the top sits on fitT. Either way nothing leaves the top edge, on any frame of the push.
    const tilt = Math.max(Math.atan((top - cy) / (topZ - cz)) - Math.atan((0.5 - S.fitT) * 2 * tH),
      Math.atan((knee - cy) / (zA - cz)) - Math.atan((0.5 - S.fitK) * 2 * tH));
    camera.fov = S.fov; camera.updateProjectionMatrix();
    camera.position.set(cx, cy, cz); Q.set(cx, cy, cz);
    camera.lookAt(V.set(cx, cy + Math.tan(tilt) * 10, cz + 10));
    camera.updateMatrixWorld();
    focus.set(O.x + S.cast[0].x, O.y + 1.2, O.z + S.cast[0].z);
    // name tags in the air beside each silhouette: tag = [x, y] rem from the projected head (tag[2] 'L': from the pair's
    // leftmost point, the spear, at head height) to the tag's bottom centre; clear of the menu text and the frame edges
    const w = innerWidth, h = innerHeight, rem = h / 72;
    for (let i = 0; i < tags.length; i++) {
      const c = S.cast[i];
      cast[i].rig.joints.head.getWorldPosition(V);
      if (c.tag[2] === 'L') V.set(pLx, V.y, pLz);
      V.project(camera);
      const px = Math.max(menuR + tagW[i] / 2, Math.min(w - tagW[i] / 2 - 2 * rem, (V.x * 0.5 + 0.5) * w + c.tag[0] * rem));
      const py = Math.max(20 * rem, (0.5 - V.y * 0.5) * h + c.tag[1] * rem);
      tags[i].style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
    }
  }

  return {
    view,
    enter(c = {}) {
      busy = false; clearStamp(el); dmode = null; el.classList.remove('dif'); setPanel(null);
      setCh(c.ch ? c.mode || 'story' : null, c.ch);                        // after a win: straight to the next chapter / the trial
      el.classList.toggle('pre', pre);
      focus(cur, true); btns[cur].classList.add('on');
      replay(el, 'in');                                                     // logo ink-in
      enterT = t; measure();
      for (const m of cast) m.fresh = true;
      nav.start(); active = true;
    },
    exit() { nav.stop(); busy = false; active = false; if (group) group.visible = false; },
  };
}
