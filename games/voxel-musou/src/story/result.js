// Battle result (#result), DW8 style: the battlefield stays frozen behind an ink wash; the hero's portrait and a big
// brush 勝利 / 敗北, then the tallies count up one by one (KOs, max chain, time, damage taken), the rank stamps in (win:
// S/A/B/C, rules in index.js rank()), and the chapter's epilogue (its EPILOGUE, chapters.js) closes it.
// Win → 繼續 (title, opened on the chapter panel at the next chapter; a trial: on the trial panel at that trial). Defeat → 再戰 (the loading card, then straight
// back into the battle, no prologue) or 返回 (title). The defeat line is the fail reason when a `fail` beat lost it.
// Every exit is an ink wipe (ui lane menu.js). ctx.art (the officer's key-art still, main.js snapArt) fills the right side.
// Keys (menu.js createNav, + gamepad): Enter / Space press the focused button (← → move between them), Esc → title.
// The battle's difficulty rides beside VICTORY / DEFEAT. Records (ctx.rec, core/progress.js record(), wins only): a
// tally that beat the officer's best on this chapter / trial and tier is marked 新紀錄 over the old value, a better rank
// 更新; under the tallies, one compact block shows what the win opened — the next chapter on a first clear, and each
// UNLOCKS entry. Three notices fit above the epilogue and bottom prompts at 720p (16:9 and 4:3).
// ctx in: { win, stats: { kos, time, hpMax, maxChain, dmg, rank? }, reason?: {zh, en}, mode ('story' | 'trial'), ch,
// char, art?, diff (core/difficulty.js tier), rec?: { first, prev, fresh, unlocks } }.
import { CHARS, paintPortrait } from '../chars/index.js';
import { CHAPTERS, chapter } from './chapters.js';
import { inkWipe, afterWipe, createNav } from '../ui/menu.js';

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function createResult(el, flow) {
  let ctx = {}, raf = 0, gone = false, next = null;          // next: the chapter 繼續 opens the title on
  // one exit per visit; pressed while this screen is still being uncovered it is queued (afterWipe), not dropped
  const leave = (mid) => { if (!gone) { gone = true; afterWipe(() => inkWipe(mid)); } };
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.act === 'retry') leave(() => flow.go('loading', { mode: ctx.mode, ch: ctx.ch, char: ctx.char, art: ctx.art, retry: true }));
    else if (b.dataset.act === 'next') leave(() => flow.go('title', { mode: ctx.mode, ch: next }));
    else leave(() => flow.go('title'));
  });
  const nav = createNav({
    move: (d) => { const bs = [...el.querySelectorAll('button')], i = bs.indexOf(document.activeElement); bs[(i + d + bs.length) % bs.length]?.focus(); },
    ok: () => (el.querySelector('button:focus') || el.querySelector('button'))?.click(),
    back: () => leave(() => flow.go('title')),
  });

  return {
    enter(c) {
      ctx = c; gone = false;
      const { win, stats: s } = c, ch = CHARS[c.char] || CHARS.zhaoyun, C = chapter(c.ch), { CH } = C;
      const epi = C.EPILOGUE[ch.id] || Object.values(C.EPILOGUE)[0], k = CHAPTERS.indexOf(C), after = k >= 0 ? CHAPTERS[k + 1] : null;   // a trial: no next
      const R = c.rec, was = R?.prev;                        // records: what this win beat (was: the cell before it)
      const notices = [R?.first && after ? `<p class="rs-unlock">${after.CH.num.zh}「${after.CH.title.zh}」已開啟<small>${after.CH.num.en} · ${after.CH.title.en} unlocked</small></p>` : '',
        ...(R?.unlocks || []).map((u) => `<p class="rs-unlock">${u.zh}已解鎖<small>${u.en} unlocked</small></p>`)].join('');
      next = after ? after.CH.id : CH.id;
      const why = c.reason || { zh: `${ch.name.zh}力戰不支，全軍攻勢受挫……`, en: `${ch.name.en} falls at last, and the assault falters...` };
      // [zh, en, value, format, the record it beat (fresh) → its old value]
      const rows = [
        ['擊破數', 'K.O. COUNT', s.kos, (v) => v, R?.fresh.kos && was.kos],
        ['最大連擊', 'MAX CHAIN', s.maxChain, (v) => v],
        ['經過時間', 'TIME', s.time, mmss, R?.fresh.time && mmss(was.time)],
        ['受到傷害', 'DAMAGE TAKEN', Math.round(s.dmg || 0), (v) => v],
      ];
      el.className = `scr ${win ? 'win' : 'lose'}${c.art ? ' art' : ''}`;
      el.style.setProperty('--art', c.art ? `url("${c.art}")` : 'none');
      el.innerHTML = `<div class="rs">
        <div class="rs-head"><div class="rs-badge"><canvas width="20" height="20"></canvas></div>
          <div><small>${CH.num.zh} ${CH.title.zh} · ${CH.num.en} · ${CH.title.en.toUpperCase()}</small><h2>${win ? '勝利' : '敗北'}</h2><em>${win ? 'VICTORY' : 'DEFEAT'}</em>${c.diff ? `<span class="rs-dif">${c.diff.zh}<small>${c.diff.en}</small></span>` : ''}</div></div>
        <div class="rs-body">
          <table class="rs-stats">${rows.map(([zh, en, , , old], i) => `<tr style="--i:${i}"><th>${zh}<small>${en}</small></th><td>0</td><td class="rs-new">${
            old ? `<b>新紀錄</b><small>${old}</small>` : ''}</td></tr>`).join('')}</table>
          ${win && s.rank ? `<div class="rs-rank r${s.rank}"><span>評價<small>RANK</small></span><b>${s.rank}</b>${R?.fresh.rank ? `<em>${was.rank} → ${s.rank} 更新</em>` : ''}</div>` : ''}
        </div>
        ${notices ? `<div class="rs-unlocks">${notices}</div>` : ''}
        <div class="rs-epi">${win
          ? epi.zh.map((z, i) => `<p>${z}<small>${epi.en[i]}</small></p>`).join('')
          : `<p>${why.zh}<small>${why.en}</small></p>`}</div>
        <div class="rs-btns">${win
          ? '<button data-act="next">繼續<small>CONTINUE</small></button>'
          : '<button data-act="retry">再戰<small>RETRY</small></button><button data-act="title" class="sub">返回<small>TITLE</small></button>'}</div>
      </div>
      <footer class="ui-foot">${win ? '' : '<span><kbd>←</kbd><kbd>→</kbd>選擇<small>Select</small></span>'}
        <span><kbd>Enter</kbd>決定<small>Confirm</small></span><span><kbd>Esc</kbd>返回<small>Title</small></span></footer>`;
      paintPortrait(el.querySelector('canvas'), ch);
      // tallies count up in turn (0.7 s each, 0.35 s apart, after the title lands)
      const tds = [...el.querySelectorAll('.rs-stats td:not(.rs-new)')], t0 = performance.now() + 700;
      const tick = (now) => {
        let busy = false;
        rows.forEach(([, , v, fmt], i) => {
          const u = Math.max(0, Math.min(1, (now - t0 - i * 350) / 700));
          if (u < 1) busy = true;
          tds[i].textContent = fmt(Math.round(v * (1 - (1 - u) ** 3)));
        });
        if (busy) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      setTimeout(() => { if (!el.hidden) el.querySelector('button')?.focus({ preventScroll: true }); }, 50);
      nav.start();
    },
    exit() { cancelAnimationFrame(raf); nav.stop(); },
  };
}
