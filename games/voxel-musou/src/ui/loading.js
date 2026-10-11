// Loading card (#loading, ui lane). 出陣 on the select screen ink-wipes into this card (so does 再戰 on the result), then
// main.js deploy() sets the battle up for the chosen officer under it — kit views built, every material compiled, a few
// frames rendered — and ink-wipes on into the prologue (story) or the battle (free / retry). So the field is never seen
// with the wrong officer and the first battle frames don't stall on shader compiles.
// Layout (DW loading card): the officer's key art full-bleed (ctx.art: the select stage's key-art still, main.js snapArt)
// with a slow push-in and rising embers, an ink band on the left with the chapter band, brush name + red seal, the intro
// line; a tip (心得) and a gold brush-stroke progress bar with the current set-up stage along the bottom. No art (dev
// entry): the plain background.
// ctx in: { mode ('story' | 'trial' | 'free'), ch, char, art? }. main.js drives progress(p, zh?, en?) and ready(); nothing here touches the sim.
import { CHARS } from '../chars/index.js';
import { replay } from './menu.js';
import { difficulty } from '../core/difficulty.js';
import { chapter } from '../story/chapters.js';

/** [zh, en] band label for a flow ctx: the chapter (story), the trial, or the battlefield (free: the chapter ctx.ch's
 *  field). */
export function modeLabel(c) {
  const { CH } = chapter(c.ch);
  return c.mode === 'free' ? [`自由演武「${CH.title.zh}」`, `Free battle · ${CH.title.en}`]
    : [`${CH.num.zh}「${CH.title.zh}」`, `${c.mode === 'story' ? 'Story' : 'Trial'} · ${CH.title.en}`];
}
// [zh, en, char id | undefined = any officer] — keep in step with the controls table (title.js CONTROLS)
const TIPS = [
  ['連按 J 打出完整連擊，連擊中按 K 接蓄力技。', 'Tap J for the full combo; press K mid-combo for a charge attack.'],
  ['無雙槽滿時按 I，發動無雙亂舞。', 'When the gold gauge is full, press I to unleash your Musou.'],
  ['按 L 或 Shift 閃避，翻滾瞬間刀槍不入。', 'L or Shift dodges; the roll slips through a blow.'],
  ['按 R 視角回正，或鎖定最近的敵將。', 'R recenters the camera behind you, or onto the nearest officer.'],
  ['點擊戰場以滑鼠轉動視角，Q / E 亦可轉動鏡頭。', 'Click the field to steer the camera with the mouse; Q / E turn it too.'],
  ['長按 K 拉弓瞄準（站立或奔跑皆可），放開即射；滿弓可貫穿數人。',
    'Hold K / right click to draw and aim (standing or running); a full draw pierces a line.', 'huangzhong'],
  ['爆頭：瞄準敵將頭部，傷害倍增。', 'Aim for an officer\'s head: a headshot hits far harder.', 'huangzhong'],
];

export function createLoading(el) {
  el.innerHTML = `
    <div class="l-art"></div><div class="l-embers"></div><div class="l-veil"></div>
    <section class="l-main">
      <p class="l-ch"><b></b><small></small></p>
      <div class="l-name"><h1></h1><i class="l-seal"></i></div>
      <p class="l-en"></p>
      <p class="l-line"><b></b><small></small></p>
    </section>
    <footer class="l-foot">
      <p class="l-tip"><span>心得</span><b></b><small></small></p>
      <div class="l-prog"><p class="l-state"><b></b><small></small></p><div class="l-bar"><i></i></div></div>
    </footer>`;
  const $ = (s) => el.querySelector(s), bar = $('.l-bar i');
  const state = (zh, en) => { $('.l-state b').textContent = zh; $('.l-state small').textContent = en; };
  return {
    enter(c) {
      const ch = CHARS[c.char] || CHARS.zhaoyun, [zh, en] = modeLabel(c);
      el.style.setProperty('--acc', ch.accent);
      $('.l-art').style.backgroundImage = c.art ? `url("${c.art}")` : 'none';
      el.classList.remove('ready'); replay(el, 'in');
      const d = difficulty();
      $('.l-ch b').textContent = `${zh}・${d.zh}`; $('.l-ch small').textContent = `${en} · ${d.en}`;
      $('.l-name h1').textContent = ch.name.zh; $('.l-seal').textContent = ch.seal;
      $('.l-en').textContent = `${ch.name.en} · ${ch.title.en}`;
      $('.l-line b').textContent = ch.lines.intro.zh; $('.l-line small').textContent = ch.lines.intro.en;
      const tips = TIPS.filter((t) => !t[2] || t[2] === ch.id), t = tips[Math.floor(Math.random() * tips.length)];   // UI only, not the sim
      $('.l-tip b').textContent = t[0]; $('.l-tip small').textContent = t[1];
      state('出陣準備', 'Marshalling the army');           // first stage label; deploy() then climbs 點將 → 佈陣 → 整軍備戰
      this.progress(0.06);
    },
    exit() {},
    /** p 0..1 plus the stage's label: real set-up stages (main.js deploy). */
    progress(p, zh, en) { bar.style.transform = `scaleX(${p})`; if (zh) state(zh, en); },
    ready() { el.classList.add('ready'); state('出陣', 'To battle'); },
  };
}
