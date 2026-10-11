// INKWAVE audio lab: every SFX, loops with live params, 3D panning radar, music tracks + intensity, bus volumes.
import { audio, SFX, SFX_GROUPS, LOOP_NAMES } from '../src/audio/audio.js';
import { music, TRACKS } from '../src/audio/music.js';

const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, kids = []) => { const e = Object.assign(document.createElement(tag), props); for (const k of kids) e.append(k); return e; };
const src = { x: 6, y: 0, z: -5 };
const st = { orbit: false, ang: Math.atan2(-5, 6), radius: 8, speed: 0.6, loops: new Map(), pulse: null, pulseT: 0, pulseName: 'splat_small', pulseEvery: 0.6, osVol: 1, osPitch: 1, fade: 1 };
window.__lab = { audio, music, st };

function ensure() {
  if (!audio.ready) audio.init();
  audio.resume();
}
$('#start').onclick = () => { ensure(); $('#start').textContent = 'Audio on'; $('#start').classList.remove('primary'); };

// range with live output
function slider(input, fmt, on) {
  const out = input.parentElement.querySelector('output');
  const upd = () => { out.textContent = fmt(+input.value); on(+input.value); };
  input.addEventListener('input', upd);
  upd();
}

// ---------------- bus volumes ----------------
for (const k of ['master', 'music', 'sfx']) {
  const lab = el('label', { className: 'sl' });
  const inp = el('input', { type: 'range', min: 0, max: 1, step: 0.01, value: audio.vol[k] });
  lab.append(k[0].toUpperCase() + k.slice(1), inp, el('output'));
  $('#vols').append(lab);
  slider(inp, (v) => v.toFixed(2), (v) => audio.setVolumes({ [k]: v }));
}
$('#duck').onclick = () => { ensure(); audio.duck(0.6, 1.5); };
const stopAll = () => { for (const [, l] of st.loops) l.h.stop(0.2); refreshLoops(); audio.stopAll(0.1); music.stop(0.6); refreshTracks(); };
$('#stopall').onclick = stopAll;
addEventListener('keydown', (e) => { if (e.key === 'Escape') stopAll(); });

// ---------------- music ----------------
const trackBtns = {};
function refreshTracks() { for (const [id, b] of Object.entries(trackBtns)) b.classList.toggle('on', music.track === id); }
for (const [id, t] of Object.entries(TRACKS)) {
  const b = el('button', {}, [el('span', { textContent: id }), el('small', { textContent: `${t.name} · ${t.bpm} bpm · ${t.key}` })]);
  b.onclick = () => { ensure(); music.play(id, { fade: st.fade }); refreshTracks(); };
  trackBtns[id] = b;
  $('#tracks').append(b);
}
const stopBtn = el('button', {}, [el('span', { textContent: 'stop' }), el('small', { textContent: 'fade out' })]);
stopBtn.onclick = () => { music.stop(st.fade); refreshTracks(); };
$('#tracks').append(stopBtn);
slider($('#intensity'), (v) => v.toFixed(2), (v) => music.setIntensity(v));
slider($('#fade'), (v) => v.toFixed(1), (v) => { st.fade = v; });

// ---------------- one-shots ----------------
slider($('#osvol'), (v) => v.toFixed(2), (v) => { st.osVol = v; });
slider($('#ospitch'), (v) => v.toFixed(2), (v) => { st.osPitch = v; });
function fire(name, threeD) {
  ensure();
  audio.play(name, { volume: st.osVol, pitch: st.osPitch, pos: threeD ? { ...src } : undefined });
}
for (const [g, names] of Object.entries(SFX_GROUPS)) {
  const grid = el('div', { className: 'grid' });
  for (const n of names) {
    const b = el('button', { textContent: n, title: SFX[n].loop ? 'loop sound — plays a short burst here; see Loops' : '' });
    if (SFX[n].loop) b.classList.add('loop');
    let hold = null, rep = null;
    b.addEventListener('pointerdown', (e) => {
      const td = e.shiftKey;
      fire(n, td);
      hold = setTimeout(() => { rep = setInterval(() => fire(n, td), 100); }, 280);
    });
    const end = () => { clearTimeout(hold); clearInterval(rep); hold = rep = null; };
    b.addEventListener('pointerup', end); b.addEventListener('pointerleave', end);
    grid.append(b);
  }
  $('#sfx').append(el('div', { className: 'group' }, [el('h2', { textContent: g }), grid]));
}

// ---------------- loops ----------------
const loopUI = new Map();
function refreshLoops() { for (const [n, u] of loopUI) u.btn.classList.toggle('on', !!(st.loops.get(n) && st.loops.get(n).h.playing)); }
function startLoop(n) {
  const u = loopUI.get(n);
  const h = audio.loop(n, { volume: u.vol, pitch: u.pitch, pos: u.threeD ? { ...src } : undefined });
  st.loops.set(n, { h, threeD: u.threeD });
}
for (const n of LOOP_NAMES) {
  const u = { vol: 1, pitch: 1, threeD: false };
  const btn = el('button', { textContent: n });
  const vol = el('input', { type: 'range', min: 0, max: 1.5, step: 0.01, value: 1 });
  const pit = el('input', { type: 'range', min: 0.3, max: 2.5, step: 0.01, value: 1 });
  const td = el('input', { type: 'checkbox' });
  const card = el('div', { className: 'loopc' }, [
    el('div', { className: 'row' }, [btn, el('label', { className: 'chip' }, [td, ' 3D'])]),
    el('label', { className: 'sl' }, ['Volume', vol, el('output')]),
    el('label', { className: 'sl' }, ['Pitch', pit, el('output')]),
  ]);
  u.btn = btn;
  loopUI.set(n, u);
  btn.onclick = () => {
    ensure();
    const cur = st.loops.get(n);
    if (cur && cur.h.playing) { cur.h.stop(0.25); st.loops.delete(n); } else startLoop(n);
    refreshLoops();
  };
  slider(vol, (v) => v.toFixed(2), (v) => { u.vol = v; st.loops.get(n)?.h.set({ volume: v }); });
  slider(pit, (v) => v.toFixed(2), (v) => { u.pitch = v; st.loops.get(n)?.h.set({ pitch: v }); });
  td.onchange = () => {
    u.threeD = td.checked;
    const cur = st.loops.get(n);
    if (cur && cur.h.playing) { cur.h.stop(0.08); startLoop(n); }   // 2D ↔ 3D needs a new voice (panner is per voice)
  };
  $('#loops').append(card);
}

// ---------------- 3D radar ----------------
const cv = $('#radar'), cx = cv.getContext('2d');
const RANGE = 30; // metres from centre to edge
const toPx = (m) => (m / RANGE) * (cv.width / 2 - 14);
slider($('#radius'), (v) => v.toFixed(1), (v) => { st.radius = v; });
slider($('#speed'), (v) => v.toFixed(2), (v) => { st.speed = v; });
slider($('#pulseEvery'), (v) => v.toFixed(2), (v) => { st.pulseEvery = v; });
$('#orbit').onclick = () => { st.orbit = !st.orbit; $('#orbit').classList.toggle('on', st.orbit); st.ang = Math.atan2(src.z, src.x); };
for (const n of Object.keys(SFX).filter((k) => SFX[k].build)) $('#pulseName').append(el('option', { value: n, textContent: n, selected: n === st.pulseName }));
$('#pulseName').onchange = (e) => { st.pulseName = e.target.value; };
$('#pulse').onclick = () => { ensure(); st.pulse = !st.pulse; $('#pulse').classList.toggle('on', st.pulse); st.pulseT = 0; };
let drag = false;
const setFromEvent = (e) => {
  const r = cv.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * cv.width - cv.width / 2, y = ((e.clientY - r.top) / r.height) * cv.height - cv.height / 2;
  src.x = (x / (cv.width / 2 - 14)) * RANGE; src.z = (y / (cv.height / 2 - 14)) * RANGE;
};
cv.addEventListener('pointerdown', (e) => { drag = true; st.orbit = false; $('#orbit').classList.remove('on'); cv.setPointerCapture(e.pointerId); setFromEvent(e); });
cv.addEventListener('pointermove', (e) => { if (drag) setFromEvent(e); });
cv.addEventListener('pointerup', () => { drag = false; });

function drawRadar() {
  const w = cv.width, h = cv.height, cs = getComputedStyle(document.documentElement);
  const line = cs.getPropertyValue('--line'), muted = cs.getPropertyValue('--muted'), acc = cs.getPropertyValue('--accent'), acc2 = cs.getPropertyValue('--accent2');
  cx.clearRect(0, 0, w, h);
  cx.save(); cx.translate(w / 2, h / 2);
  cx.strokeStyle = line; cx.lineWidth = 2;
  for (const r of [3, 10, 20, 30]) { cx.beginPath(); cx.arc(0, 0, toPx(r), 0, Math.PI * 2); cx.stroke(); }
  cx.fillStyle = muted; cx.font = '20px Rubik, sans-serif';
  for (const r of [3, 10, 20]) cx.fillText(r + ' m', toPx(r) + 6, -6);
  // listener
  cx.fillStyle = acc2;
  cx.beginPath(); cx.moveTo(0, -18); cx.lineTo(12, 12); cx.lineTo(0, 5); cx.lineTo(-12, 12); cx.closePath(); cx.fill();
  // source
  const sx = toPx(src.x), sz = toPx(src.z);
  cx.strokeStyle = acc; cx.setLineDash([6, 8]); cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(sx, sz); cx.stroke(); cx.setLineDash([]);
  cx.fillStyle = acc; cx.beginPath(); cx.arc(sx, sz, 13, 0, Math.PI * 2); cx.fill();
  cx.restore();
}

// ---------------- meters ----------------
let an = null, buf = null;
const sc = $('#scope'), sx2 = sc.getContext('2d');
function meters() {
  if (!audio.ready) return;
  if (!an) { an = audio.ctx.createAnalyser(); an.fftSize = 2048; audio.master.connect(an); buf = new Float32Array(an.fftSize); }
  an.getFloatTimeDomainData(buf);
  let pk = 0, ss = 0;
  for (const v of buf) { pk = Math.max(pk, Math.abs(v)); ss += v * v; }
  const toW = (a) => Math.max(0, Math.min(100, ((20 * Math.log10(a + 1e-9) + 60) / 60) * 100)) + '%';
  $('#mPeak').style.width = toW(pk); $('#mRms').style.width = toW(Math.sqrt(ss / buf.length));
  const cs = getComputedStyle(document.documentElement);
  sx2.clearRect(0, 0, sc.width, sc.height);
  sx2.strokeStyle = cs.getPropertyValue('--accent'); sx2.lineWidth = 2; sx2.beginPath();
  for (let i = 0; i < buf.length; i += 4) { const x = (i / buf.length) * sc.width, y = sc.height / 2 - buf[i] * sc.height * 0.48; i ? sx2.lineTo(x, y) : sx2.moveTo(x, y); }
  sx2.stroke();
}

// ---------------- frame loop ----------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (st.orbit) { st.ang += dt * st.speed; src.x = Math.cos(st.ang) * st.radius; src.z = Math.sin(st.ang) * st.radius; }
  if (audio.ready) {
    audio.setListener({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1 }, { x: 0, y: 1, z: 0 });
    for (const [, l] of st.loops) if (l.threeD && l.h.playing) l.h.set({ pos: src });
    if (st.pulse) { st.pulseT -= dt; if (st.pulseT <= 0) { st.pulseT = st.pulseEvery; audio.play(st.pulseName, { pos: { ...src }, volume: st.osVol, pitch: st.osPitch }); } }
    const s = audio.stats();
    $('#status').innerHTML = `ctx <b class="${s.state === 'running' ? 'run' : ''}">${s.state}</b> · voices <b>${s.voices}</b> · loops <b>${s.loops}</b> · played <b>${s.played}</b> · stolen <b>${s.stolen}</b>`;
    const p = music.current;
    if (p) {
      const bar = p.song.bars[p.bar];
      $('#nowplaying').textContent = `${music.track} — ${p.song.name} · section ${bar.sec} · bar ${bar.bar + 1} · ${bar.chords.join(' ')} · intensity ${music.intensity.toFixed(2)}`;
    } else $('#nowplaying').textContent = 'music stopped';
    meters();
  }
  $('#dist').innerHTML = `d <b>${Math.hypot(src.x, src.z).toFixed(1)} m</b>`;
  drawRadar();
  refreshLoops();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
