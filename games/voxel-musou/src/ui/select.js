// Character select (#select, ui lane). DW8 officer select over the live battlefield: the focused officer's actual voxel
// model (kit.model on its own rig, idle clip, cloth/hair chains) stands at the foot of the pass on the right third of the frame,
// backlit by the low sun, a warm firelight key on his front (world.js stage-key), the field behind in deep bokeh (post.js DoF focused on him), slow turntable, a spin-in on
// every focus change and warm dust motes drifting through the light. Left: the focused officer's faction banner
// (CHARS[id].side {zh, en}, default 蜀 Shu Han) over a compact roster (a row per officer: pixel portrait, brush name,
// romanisation, seal; up to 7 fit), the info panel (brush name, courtesy name, epithet, weapon, bio, 攻/防/速/射程 bars,
// Musou name) and the intro line as vertical calligraphy beside the model. All data comes from CHARS / CHAR_ORDER
// (src/chars/index.js), nothing per-hero. Roster: the chapter's CH.heroes (story), else CHAR_ORDER (trial / free; ids
// not in CHARS are left out). Records (core/progress.js): each card carries the officer's best rank on this chapter /
// trial at the picked difficulty, and the line between the header and info his record there (rank, fastest clear, most
// KOs), leaving the officer's body clear. The info column scrolls below that line (a new focus returns to its top);
// at ≤ 4:3 it and the roster tighten to keep the model visible. An officer the records have not opened yet (UNLOCKS)
// can be looked at but not deployed: 鎖 on his card, his rule on that line.
// Input: hover only highlights a card; a click (tap) on a card focuses that officer (spin-in, info panel swaps), ↑/↓ /
// d-pad too. Deploy = 出陣 button, Enter / A, or a double-click on the card that was already focused.
// ctx in: { mode, ch, map? }. Deploy → ink wipe → flow.go('loading', { ...ctx, char }) (loading.js); back → title.
// 3D is render-only: view(scene, camera, focus, dt) runs after the gameplay camera rig while this screen is up; an
// officer's model is built the first time he is focused (kept for the session).
import * as THREE from 'three';
import { CHARS, CHAR_ORDER, paintPortrait } from '../chars/index.js';
import { sampleClip, POSE_SIZE } from '../hero/rig.js';
import { createNav, sfx, inkWipe, wiping, afterWipe, stamp, clearStamp, replay } from './menu.js';
import { SWASH, STAGE as TITLE } from './title.js';
import { modeLabel } from './loading.js';
import { difficulty } from '../core/difficulty.js';
import { best, locked } from '../core/progress.js';
import { chapter } from '../story/chapters.js';
import { dotTex, scatter, stagePoint, standOfficer, poseOfficer } from './stage.js';

const STATS = [['atk', '攻', 'Attack'], ['def', '防', 'Defence'], ['speed', '速', 'Speed'], ['range', '射程', 'Reach']];
// stage framing: officer ≈ 6.3 m from the lens, 30° vFOV (full body + headroom), aim shifted so he stands at x ≈ 75 %
// (clear of the info column, which ends at ≈ 60 %)
const STAGE = { dist: 6.3, eye: 1.2, aim: 1.05, fov: 30, screenX: 0.5, face: Math.PI - 0.38, sway: 0.28, spin: 1.35, motes: 110 };
// key-art frame (snapshot for the loading card / result, main.js snapArt): closer, knees up, the title's held pose
const KEYART = { dist: 4.3, eye: 1.35, aim: 1.3, screenX: 0.42 };
const ALL = CHAR_ORDER.filter((id) => CHARS[id]), SHU = { zh: '蜀', en: 'Shu Han' };
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function createSelect(el, flow) {
  el.innerHTML = `
    <div class="s-veil"></div>
    <header class="s-head"><h2>選擇武將</h2><small>Choose your officer</small><span class="s-mode"><b></b><small></small></span></header>
    <aside class="s-roster"><div class="s-fac"><i></i><small></small></div>
      ${ALL.map((id) => { const c = CHARS[id]; return `<button class="s-card" data-id="${id}" style="--acc:${c.accent}" title="${c.name.en} — double-click to deploy">
        <canvas width="20" height="20"></canvas><b>${c.name.zh}</b><small>${c.name.en}</small><i>${c.seal}</i><em class="t-rk"></em></button>`; }).join('')}
    </aside>
    <article class="s-info">
      <div class="s-name"><h1></h1><div><i class="s-seal"></i><p class="s-court"></p></div></div>
      <p class="s-en"></p>
      <p class="s-epi"><b></b><small></small></p>
      <p class="s-wpn"><span>武器</span><b></b><small></small></p>
      <p class="s-bio"></p>
      <ul class="s-stats">${STATS.map(([k, zh, en]) => `<li data-k="${k}"><b>${zh}</b><small>${en}</small><span>${[0, 1, 2, 3, 4].map((j) => `<i style="--i:${j}"></i>`).join('')}</span></li>`).join('')}</ul>
      <div class="s-musou"><span>無雙亂舞</span><b></b><small></small>${SWASH}</div>
    </article>
    <div class="s-line"><p></p><small></small></div>
    <p class="s-rec"><span>戰績</span><b></b><small></small></p>
    <div class="s-act"><button class="s-back"><b>返回</b><small>Back</small></button><button class="s-go"><b>出陣</b><small>To battle</small></button></div>
    <footer class="ui-foot"><span><kbd>↑</kbd><kbd>↓</kbd>切換武將<small>Officer</small></span><span><kbd>Click</kbd>選擇<small>Select</small></span>
      <span><kbd>Enter</kbd><kbd class="pad">A</kbd>出陣<small>Deploy</small></span><span><kbd>Esc</kbd><kbd class="pad">B</kbd>返回<small>Back</small></span>
      <span><kbd>Drag</kbd>旋轉<small>Turn</small></span></footer>`;
  const $ = (s) => el.querySelector(s), cards = {};
  for (const b of el.querySelectorAll('.s-card')) { cards[b.dataset.id] = b; paintPortrait(b.querySelector('canvas'), CHARS[b.dataset.id]); }
  let ctx = {}, ids = ALL, cur = ALL[0], busy = false, spinT = 0;   // ids: this visit's roster; cur: the focused id

  // ---- 2D: info panel
  function show(i, quiet) {
    const id = ids[(i + ids.length) % ids.length];
    if (id === cur && !quiet) return;
    cards[cur].classList.remove('on'); cur = id; cards[cur].classList.add('on');
    // DOM focus follows the selection (a clicked card kept focus and its ring after ↑/↓: two cards looked lit)
    if (document.activeElement?.classList.contains('s-card')) cards[cur].focus({ preventScroll: true });
    replay(cards[cur], 'pick');                           // the chosen card flashes in
    const c = CHARS[id], side = c.side || SHU;
    el.style.setProperty('--acc', c.accent);
    $('.s-fac i').textContent = side.zh; $('.s-fac small').textContent = side.en;
    $('.s-name h1').textContent = c.name.zh;
    $('.s-seal').textContent = c.seal;
    $('.s-court').textContent = `字${c.courtesy.zh}`;
    $('.s-en').textContent = `${c.name.en} · ${c.courtesy.en}`;
    $('.s-epi b').textContent = c.title.zh; $('.s-epi small').textContent = c.title.en;
    $('.s-wpn b').textContent = c.weapon.zh; $('.s-wpn small').textContent = c.weapon.en;
    $('.s-bio').innerHTML = c.bio.zh.map((z, k) => `<span>${z}<small>${c.bio.en[k]}</small></span>`).join('');
    for (const li of el.querySelectorAll('.s-stats li')) {
      const n = c.stats[li.dataset.k];
      li.querySelectorAll('i').forEach((q, k) => q.classList.toggle('f', k < n));
    }
    $('.s-musou b').textContent = c.musou.zh; $('.s-musou small').textContent = c.musou.en;
    $('.s-line p').textContent = c.lines.intro.zh; $('.s-line small').textContent = c.lines.intro.en;
    // the line above the info: his unlock rule while locked, else his record here at this difficulty
    const lk = locked(id), d = difficulty(), r = ctx.mode !== 'free' && best(ctx.ch, id, d.id);
    const [zh, en] = lk ? lk.rule : r ? [`評價 ${r.rank}・${mmss(r.time)}・${r.kos} 擊破`, `Best on ${d.en}`] : ['尚無戰績', `No record on ${d.en} yet`];
    $('.s-rec').hidden = !lk && ctx.mode === 'free';
    $('.s-rec').classList.toggle('lock', !!lk); $('.s-go').classList.toggle('lock', !!lk);
    $('.s-rec span').textContent = lk ? '未解鎖' : '戰績'; $('.s-rec b').textContent = zh; $('.s-rec small').textContent = en;
    $('.s-info').scrollTop = 0;
    replay(el, 'swap');                                    // name ink-in, stat bars refill, voice line brush reveal
    spinT = 0;
    if (!quiet) sfx('move');
  }

  const go = () => {
    if (busy) return;
    if (wiping()) return afterWipe(go);             // pressed while this screen is still being uncovered: queued
    if (locked(cur)) return sfx('back');
    busy = true;
    stamp($('.s-act'), '出陣');
    const id = cur;
    setTimeout(() => inkWipe(() => flow.go('loading', { mode: ctx.mode, ch: ctx.ch, map: ctx.map, char: id })), 520);
  };
  const back = () => {
    if (busy) return;
    if (wiping()) return afterWipe(back);
    busy = true; sfx('back');
    inkWipe(() => flow.go('title'));
  };
  const nav = createNav({ move: (d) => { if (!busy) show(ids.indexOf(cur) + d); }, ok: go, back });

  // click a card = focus it; a double-click deploys only if the first click landed on the already-focused card
  let armed = false;
  el.addEventListener('click', (e) => {
    const card = e.target.closest('.s-card');
    if (card) {
      if (busy) return;
      const i = ids.indexOf(card.dataset.id);
      if (card.dataset.id !== cur) { show(i); armed = false; }
      else if (e.detail >= 2 && armed) go();
      else armed = true;
    } else if (e.target.closest('.s-go')) go();
    else if (e.target.closest('.s-back')) back();
  });
  // drag anywhere off the panels turns the officer (eased back to the pose when let go)
  let drag = null, userYaw = 0;
  el.addEventListener('pointerdown', (e) => { if (!e.target.closest('button, .s-info, .s-roster, .s-head')) drag = e.clientX; });
  addEventListener('pointermove', (e) => { if (drag !== null) { userYaw += (e.clientX - drag) * 0.012; drag = e.clientX; } });
  addEventListener('pointerup', () => { drag = null; });

  // ---- 3D: officer stage (render-only; an officer is meshed when first focused, kept for the session)
  let group = null, motes = null, t = 0, keyart = false, key = null, keyHome = null;
  const models = {}, pose = new Float32Array(POSE_SIZE), P = new THREE.Vector3(), tmp = new THREE.Vector3();
  const model = (id) => models[id] || (models[id] = standOfficer(id, group));
  function build(scene) {
    group = new THREE.Group(); scene.add(group);
    // dust motes: soft round sprites, warm HDR white so the brightest catch a little bloom in the backlight
    const n = STAGE.motes, pos = new Float32Array(n * 3), seed = scatter(n * 3);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    motes = new THREE.Points(geo, new THREE.PointsMaterial({ map: dotTex(0.4, 0.35), size: 0.035, color: new THREE.Color(2.2, 1.7, 1.1),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    motes.userData.seed = seed; motes.frustumCulled = false;
    group.add(motes);
    // warm key: one of the world's firelights (world.js 'stage-key') moved to his front-left while this screen is up, so
    // his face and the ground round his feet catch fire-glow against the backlit field (same light count: no recompile)
    key = scene.getObjectByName('stage-key');
    keyHome = key && key.position.clone();
  }

  function view(scene, camera, focus, dt) {
    if (!group) build(scene);
    group.visible = true;
    dt = Math.min(dt || 1 / 60, 0.1); t += dt; spinT += dt;
    const S = STAGE, p = stagePoint(P, 'select'), id = cur;   // def.stage.select (定軍山: the foot of the pass road, looking up it)
    for (const k in models) models[k].root.visible = k === id;
    const M = model(id);
    if (key) key.position.set(p.x + 1.6, p.y + 2.3, p.z - 2.4);
    // idle clip, turntable sway + spin-in (easeOutCubic) + the player's drag, eased home when let go
    if (drag === null) userYaw *= Math.exp(-2.5 * dt);
    const u = Math.min(1, spinT / 0.75), spin = S.spin * (1 - u) ** 3;
    const ka = keyart && TITLE.cast.find((c) => c.id === id), F = ka ? KEYART : S;
    if (ka) sampleClip(M.K.clips[ka.clip], ka.u, pose);
    else sampleClip(M.K.clips.idle, (t % 2.5) / 2.5, pose);
    poseOfficer(M, pose, p, ka ? ka.face : S.face + Math.sin(t * 0.35) * S.sway + spin + userYaw, dt);
    // motes: a 5 × 3 × 4 m box around him, rising slowly with a lazy sideways drift, wrapping at the top
    const a = motes.geometry.attributes.position, sd = motes.userData.seed;
    for (let i = 0; i < S.motes; i++) {
      const sx = sd[i * 3], sy = Math.abs(sd[i * 3 + 1]), sz = sd[i * 3 + 2];
      const y = (sy * 3.2 + t * (0.05 + sy * 0.08)) % 3.2;
      a.setXYZ(i, p.x + sx * 2.6 + Math.sin(t * 0.4 + i) * 0.25, p.y + y, p.z + sz * 2 + Math.cos(t * 0.3 + i * 1.7) * 0.2);
    }
    a.needsUpdate = true;
    // camera: in front of him (toward -Z, looking up the field into the sun), aim shifted to screen-left so he stands
    // at x ≈ 68 %; DoF focus on his chest
    const aspect = camera.aspect, side = F.screenX * F.dist * Math.tan(S.fov * Math.PI / 360) * aspect;
    camera.fov = S.fov; camera.updateProjectionMatrix();
    camera.position.set(p.x + side * 0.3, p.y + F.eye, p.z - F.dist);
    tmp.set(p.x + side, p.y + F.aim, p.z);
    camera.lookAt(tmp);
    camera.updateMatrixWorld();
    focus.set(p.x, p.y + 1.1, p.z);
  }

  return {
    view,
    /** main.js snapArt: true for one render = the key-art frame of the focused officer. */
    keyart(v) { keyart = v; },
    enter(c) {
      ctx = c; busy = false; armed = false; clearStamp($('.s-act'));
      const [zh, en] = modeLabel(c);
      const d = difficulty();
      $('.s-mode b').textContent = `${zh}・${d.zh}`; $('.s-mode small').textContent = `${en} · ${d.en}`;
      // this visit's roster: the chapter's heroes (story) or everyone (trial / free); the focus stays if he is in it
      const want = (c.mode !== 'free' && chapter(c.ch).CH.heroes) || ALL;
      ids = ALL.filter((id) => want.includes(id));
      if (!ids.length) ids = ALL;                           // a chapter none of whose heroes exist yet (phase A): anyone
      for (const id in cards) {                             // 鎖 on a locked officer, else his best rank here on this tier
        const lk = !!locked(id), r = (!lk && c.mode !== 'free' && best(c.ch, id, d.id)?.rank) || '', chip = cards[id].querySelector('.t-rk');
        cards[id].hidden = !ids.includes(id); cards[id].classList.toggle('lock', lk);
        chip.textContent = lk ? '鎖' : r; chip.className = `t-rk r${r}`;
      }
      if (!ids.includes(cur)) { cards[cur].classList.remove('on'); cur = ids[0]; }
      show(ids.indexOf(cur), true); replay(el, 'in');       // header, roster and actions slide in as the ink uncovers
      nav.start();
    },
    exit() { nav.stop(); drag = null; if (group) group.visible = false; if (key) key.position.copy(keyHome); },
  };
}
