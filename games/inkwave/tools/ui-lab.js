// INKWAVE UI lab — mounts Menus + HUD with a mock api and an animated mock HudFrame.
// URL params: ?screen=main|...|hud  &clean=1 (hide panel)  &pal=0..4  &cb=1 (colorblind)  &pad=1  &slow=0.25
// Console / --eval: window.lab.go('setup'), lab.hud(), lab.set({time:8, ink:.2}), lab.judge(), lab.results({win:false}) ...
import { Menus } from '../src/ui/menus.js';
import { HUD } from '../src/ui/hud.js';
import { WEAPON_ICONS, SQUID } from '../src/ui/ui-icons.js';
import { blobPath } from '../src/ui/ui-util.js';
import { emit, G } from '../src/core/ctx.js';
import {
  WEAPONS, WEAPON_ORDER, SPECIALS, SUB, MAPS, DIFFICULTY, DEFAULT_SETTINGS, TEAM_PALETTES, COLORBLIND_PALETTE,
  PROGRESSION, VERSION, BOT_NAMES, PLAYER,
} from '../src/config.js';

const Q = new URLSearchParams(location.search);
const root = document.getElementById('ui-root');
const panel = document.getElementById('lab');
const logEl = document.createElement('div');

let palIdx = +(Q.get('pal') || 0) % TEAM_PALETTES.length;
const S = {
  settings: { ...DEFAULT_SETTINGS, colorblind: Q.get('cb') === '1' },
  profile: { name: 'Jayden', level: 12, xp: 1840, xpToNext: PROGRESSION.xpForLevel(12), wins: 37, played: 64 },
  loadout: { weapon: Q.get('weapon') || 'shooter' },
};
const pal = () => (S.settings.colorblind ? COLORBLIND_PALETTE : TEAM_PALETTES[palIdx]);

function log(...a) {
  const line = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
  logEl.textContent = (line + '\n' + logEl.textContent).slice(0, 3000);
}

// ------------------------------------------------------------------ tiny synth so the lab has UI sounds (toggle in panel)
let actx = null, soundOn = Q.get('sound') === '1';
function blip(name) {
  if (!soundOn) return;
  try { actx = actx || new AudioContext(); } catch (e) { return; }
  const t = actx.currentTime;
  const tone = (f0, f1, dur, type = 'triangle', vol = 0.08, at = 0) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t + at); o.frequency.exponentialRampToValueAtTime(f1, t + at + dur);
    g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
    o.connect(g).connect(actx.destination); o.start(t + at); o.stop(t + at + dur + 0.02);
  };
  const map = {
    ui_hover: () => tone(1400, 1800, 0.04, 'sine', 0.04),
    ui_click: () => tone(700, 380, 0.08, 'square', 0.05),
    ui_confirm: () => { tone(660, 880, 0.08); tone(990, 1320, 0.12, 'triangle', 0.08, 0.07); },
    ui_back: () => { tone(700, 500, 0.07); tone(500, 330, 0.1, 'triangle', 0.07, 0.06); },
    ui_toggle: () => tone(900, 1200, 0.05, 'square', 0.04),
    ui_slider: () => tone(1100, 1150, 0.025, 'sine', 0.035),
    ui_error: () => tone(160, 120, 0.14, 'sawtooth', 0.05),
    xp_tick: () => tone(1800, 2000, 0.02, 'sine', 0.025),
    level_up: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f * 1.01, 0.18, 'triangle', 0.08, i * 0.08)),
    judge_drumroll: () => { for (let i = 0; i < 26; i++) tone(90, 60, 0.05, 'triangle', 0.05, i * 0.09); },
    judge_reveal: () => [392, 523, 659].forEach((f, i) => tone(f, f, 0.3, 'square', 0.05, i * 0.02)),
  };
  (map[name] || (() => tone(500, 400, 0.05, 'sine', 0.03)))();
}

// ------------------------------------------------------------------ mock api
let menus, hud;
const api = {
  getSettings: () => ({ ...S.settings }),
  setSettings: (p) => { Object.assign(S.settings, p); log('setSettings', p); if ('colorblind' in p) applyPalette(); },
  getProfile: () => ({ ...S.profile }),
  setProfileName: (n) => { S.profile.name = n; log('setProfileName', n); },
  setProfileStyle: (st) => { S.profile.style = { ...st }; log('setProfileStyle', st); },
  getLoadout: () => ({ ...S.loadout }),
  setLoadout: (l) => { Object.assign(S.loadout, l); log('setLoadout', l); drawHero(); },
  weapons: WEAPONS, weaponOrder: WEAPON_ORDER, specials: SPECIALS, sub: SUB.bomb, maps: MAPS, difficulties: DIFFICULTY,
  startMatch: (cfg) => { log('startMatch', cfg); lab.hud(true, { intro: true, duration: cfg.duration }); },
  resumeMatch: () => { log('resumeMatch'); paused = false; },
  quitMatch: () => { log('quitMatch'); lab.hud(false); },
  rematch: () => { log('rematch'); menus.show(null); lab.hud(true, { intro: true }); },
  toMainMenu: () => { log('toMainMenu'); },
  onScreenChange: (s) => { log('screen →', s); document.body.dataset.screen = s || (hudOn ? 'hud' : ''); },
  playSound: (n) => { blip(n); },
  version: VERSION,
};

// ------------------------------------------------------------------ fake scene
function applyPalette() {
  const p = pal();
  document.body.style.setProperty('--lab-a', p.a);
  document.body.style.setProperty('--lab-b', p.b);
  const floor = document.getElementById('floor');
  floor.innerHTML = '';
  const R = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  for (let i = 0; i < 26; i++) {
    const d = document.createElement('div');
    d.className = 'splat';
    const sz = 6 + R() * 20;
    d.style.cssText = `left:${R() * 95}%;top:${R() * 90}%;width:${sz}vh;height:${sz * (0.7 + R() * 0.5)}vh;background:${i % 2 ? p.b : p.a};rotate:${R() * 180}deg`;
    floor.appendChild(d);
  }
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('div');
    c.className = 'crate';
    c.style.cssText = `left:${10 + R() * 80}%;top:${5 + R() * 50}%;width:${10 + R() * 12}vh;height:${8 + R() * 8}vh`;
    floor.appendChild(c);
  }
  if (menus) menus.setAccent(p.a, p.b);
  drawMinimap(true);
}
function drawHero() {
  const p = pal();
  const w = S.loadout.weapon;
  const hero = document.getElementById('hero');
  hero.style.color = p.a;
  hero.innerHTML = SQUID + `<div class="w" style="color:${p.a}">${WEAPON_ICONS[WEAPONS[w].kind]}</div><div class="shadow"></div>`;
  document.querySelectorAll('.dancer').forEach((d, i) => { d.style.color = p.a; d.innerHTML = SQUID + '<div class="shadow"></div>'; });
}

// ------------------------------------------------------------------ mock minimap canvas (the engine draws the real one)
const mapCanvas = document.createElement('canvas');
mapCanvas.width = 320; mapCanvas.height = 240;
function drawMinimap(reset) {
  const c = mapCanvas.getContext('2d');
  const p = pal();
  if (reset) {
    c.fillStyle = '#2d6fb8'; c.fillRect(0, 0, 320, 240);
    c.fillStyle = '#e9e0cd'; c.beginPath(); c.roundRect(18, 16, 284, 208, 18); c.fill();
    c.fillStyle = '#d6cab1';
    [[60, 40, 40, 30], [140, 100, 40, 40], [220, 170, 44, 28], [230, 40, 30, 36], [70, 160, 36, 36]].forEach(([x, y, w, h]) => { c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill(); });
    for (let i = 0; i < 60; i++) addMapSplat(i % 2, 0.4 + Math.random() * 0.6);
  }
  function addMapSplat(team, s) {
    const x = team ? 160 + Math.random() * 140 : 20 + Math.random() * 140;
    const y = 20 + Math.random() * 200;
    c.fillStyle = team ? p.b : p.a;
    c.fill(new Path2D(blobPath(x, y, 6 + s * 12, { seed: (Math.random() * 1e6) | 0, points: 8, wobble: 0.3 })));
  }
  drawMinimap.add = addMapSplat;
}

// ------------------------------------------------------------------ mock HUD frame
let hudOn = false, paused = false, tHud = 0;
const mock = { time: 180, ink: 1, subCost: SUB.bomb.inkCost / PLAYER.inkMax, special: 0, hp: 1, weapon: S.loadout.weapon, charge: 0, spread: 4, onTarget: null, expanded: false, prompt: 'Hold [SHIFT] to swim', fps: 60 };
const fixed = new Set();
const deadUntil = {};
function buildFrame(dt) {
  tHud += dt;
  const t = tHud;
  const p = pal();
  const auto = (k, v) => { if (!fixed.has(k)) mock[k] = v; };
  if (!fixed.has('time')) mock.time = Math.max(0, mock.time - dt);
  auto('ink', 0.55 + 0.45 * Math.cos(t * 0.7));
  auto('inkLow', mock.ink < 0.18);
  auto('special', Math.min(1, (t * 0.09) % 1.25));
  auto('specialReady', mock.special >= 1);
  auto('specialActive', false);
  auto('hp', 1);
  auto('spread', 4 + 10 * Math.max(0, Math.sin(t * 2.2)));
  auto('onTarget', Math.sin(t * 1.3) > 0.75 ? 'enemy' : null);
  auto('charge', mock.weapon === 'charger' ? (t * 0.8) % 1.4 > 1 ? 1 : (t * 0.8) % 1.4 : 0);
  auto('expanded', false);
  if (!fixed.has('prompt')) mock.prompt = Math.floor(t / 5) % 3 === 0 ? 'Hold [SHIFT] to swim' : Math.floor(t / 5) % 3 === 1 ? 'Swim up inked walls to climb' : null;
  const names = [S.profile.name, ...BOT_NAMES.slice(0, 7)];
  const players = [];
  for (let i = 0; i < 8; i++) {
    const dead = deadUntil[i] && deadUntil[i] > t;
    const A = labActors[i];
    A.alive = !dead; A.respawnTimer = dead ? deadUntil[i] - t : 0; A.name = names[i];
    if (i === 0) A.weaponId = mock.weapon;
    players.push({ name: names[i], alive: !dead, respawn: dead ? deadUntil[i] - t : 0, specialReady: i === 2 || i === 5 || (i === 0 && mock.specialReady), isSelf: i === 0, weapon: A.weaponId });
  }
  const mapPlayers = players.map((pl, i) => {
    const team = i < 4 ? 0 : 1;
    const a = t * (0.25 + i * 0.04) + i * 1.7;
    const cx = team ? 0.68 : 0.32;
    return { x: cx + Math.cos(a) * 0.18, y: 0.5 + Math.sin(a * 1.3) * 0.32, team, isSelf: i === 0, yaw: t * 0.8, alive: pl.alive };
  });
  const W = innerWidth, H = innerHeight;
  const markers = [
    { x: W * 0.36 + Math.sin(t) * 40, y: H * 0.46, name: names[1], color: p.a, onScreen: true, angle: 0, dist: 8 },
    { x: W * 0.62 + Math.cos(t * 0.8) * 30, y: H * 0.42, name: names[2], color: p.a, onScreen: true, angle: 0, dist: 26 },
    { x: W - 40, y: H * 0.62, name: names[3], color: p.a, onScreen: false, angle: 0.25, dist: 30 },
  ];
  // beacons follow the mock map dots of the three allies + a fixed base pad
  labBeacons = [1, 2, 3].map((i) => ({ x: mapPlayers[i].x, y: mapPlayers[i].y, name: names[i], weapon: labActors[i].weaponId, ok: players[i].alive, respawn: Math.ceil(players[i].respawn || 0) }))
    .concat([{ x: 0.32, y: 0.92, name: 'Base', ok: true, home: true }]);
  hud.lab.beacons = labBeacons;
  if (Math.random() < dt * 3) drawMinimap.add && drawMinimap.add(Math.random() < 0.5 ? 0 : 1, 0.5);
  return {
    time: mock.time,
    teams: [{ color: p.a, players: players.slice(0, 4) }, { color: p.b, players: players.slice(4) }],
    ink: mock.ink, inkLow: mock.inkLow, subCost: mock.subCost,
    special: mock.special, specialReady: mock.specialReady, specialActive: mock.specialActive,
    hp: mock.hp,
    weapon: mock.weapon, charge: mock.charge,
    crosshair: { spread: mock.spread, onTarget: mock.onTarget },
    map: S.settings.minimap ? { canvas: mapCanvas, expanded: mock.expanded, players: mapPlayers } : null,
    markers,
    prompt: mock.prompt,
    fps: S.settings.showFps || fixed.has('fps') ? mock.fps : null,
    subAim: !!mock.subAim,
  };
}

// ------------------------------------------------------------------ fake actors (drive the HUD's event-driven systems)
const LAB_W = ['shooter', 'roller', 'charger', 'blaster', 'blaster', 'charger', 'shooter', 'roller'];
const labActors = Array.from({ length: 8 }, (_, i) => ({
  name: i ? BOT_NAMES[i - 1] : S.profile.name, team: i < 4 ? 0 : 1, weaponId: LAB_W[i], isLocal: i === 0, alive: true, respawnTimer: 0, invuln: 0,
  pos: { x: [0, -6, 5, 9, -14, 3, 16, -4][i], y: 0, z: [0, 4, 6, -3, 18, 22, 11, -20][i] },
  vel: { x: 0, y: 0, z: 0 }, specialReady() { return i === 2 || i === 5; }, canSuperJump() { return true; },
}));
let labBeacons = null;

// ------------------------------------------------------------------ main loop
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (hudOn && !paused) hud.update(dt, buildFrame(dt));
  menus.update(dt);
  pollPad(dt);
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------------ keyboard + gamepad (engine-like routing)
addEventListener('keydown', (e) => {
  if (e.key === '`') { panel.classList.toggle('hidden'); return; }
  if (menus.current) { menus.handleKey(e); return; }
  if (!hudOn) return;
  if (e.key === 'Escape') { paused = true; menus.show('pause'); }
  else if (e.key === 'Tab') { e.preventDefault(); fixed.add('expanded'); mock.expanded = true; }
  else if (e.key === 'f' || e.key === 'F') hud.banner('special', SPECIALS[WEAPONS[mock.weapon].special].name.toUpperCase() + '!');
  else if (e.key === 'h') hud.hitMarker('hit');
  else if (e.key === 'k') { hud.hitMarker('kill'); hud.feed({ text: `You splatted ${BOT_NAMES[4 + ((Math.random() * 4) | 0)]}`, color: pal().a, kind: 'kill' }); }
  else if (e.key === 'j') hud.damage(0.4 + Math.random() * 0.4, pal().b);
});
addEventListener('keyup', (e) => { if (e.key === 'Tab') { mock.expanded = false; } });
const padState = { held: {}, repeat: {} };
function pollPad(dt) {
  const gp = navigator.getGamepads ? [...navigator.getGamepads()].find(Boolean) : null;
  if (!gp || !menus.current) return;
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const dirs = {
    up: gp.buttons[12]?.pressed || ay < -0.6, down: gp.buttons[13]?.pressed || ay > 0.6,
    left: gp.buttons[14]?.pressed || ax < -0.6, right: gp.buttons[15]?.pressed || ax > 0.6,
    accept: gp.buttons[0]?.pressed, back: gp.buttons[1]?.pressed, tab_prev: gp.buttons[4]?.pressed, tab_next: gp.buttons[5]?.pressed,
  };
  for (const k in dirs) {
    if (dirs[k]) {
      if (!padState.held[k]) { padState.held[k] = true; padState.repeat[k] = 0.4; menus.nav(k); }
      else if (['up', 'down', 'left', 'right'].includes(k)) { padState.repeat[k] -= dt; if (padState.repeat[k] <= 0) { padState.repeat[k] = 0.09; menus.nav(k); } }
    } else padState.held[k] = false;
  }
}

// ------------------------------------------------------------------ results fixtures
function resultsData({ win = true, levelUp = true, close = false } = {}) {
  const p = pal();
  const names = [S.profile.name, ...BOT_NAMES.slice(0, 7)];
  const pa = close ? 48.9 : win ? 52.6 : 38.4, pb = close ? 47.2 : win ? 39.1 : 55.3;
  return {
    win, percents: [pa, pb], colors: [p.a, p.b], teamNames: p.names, mapName: MAPS[0].name,
    players: names.map((n, i) => ({ name: n, team: i < 4 ? 0 : 1, weapon: WEAPON_ORDER[(i * 3 + 1) % 4], turf: Math.round(1450 - ((i * 263) % 900)), splats: (i * 7) % 8, deaths: (i * 5) % 5, isSelf: i === 0 })),
    xp: levelUp
      ? { gained: 1720, levelBefore: 12, levelAfter: 13, xpBefore: 4100, xpAfter: 620, xpToNextBefore: PROGRESSION.xpForLevel(12), xpToNextAfter: PROGRESSION.xpForLevel(13) }
      : { gained: 640, levelBefore: 12, levelAfter: 12, xpBefore: 1840, xpAfter: 2480, xpToNextBefore: PROGRESSION.xpForLevel(12), xpToNextAfter: PROGRESSION.xpForLevel(12) },
  };
}

// ------------------------------------------------------------------ lab API
let slowTimer = 0;
const lab = window.lab = {
  get menus() { return menus; }, get hudObj() { return hud; }, mock, S,
  go(screen, opts) { if (screen !== 'pause' && screen !== null) { this.hud(false); } else if (screen === 'pause' && !hudOn) this.hud(true); menus.show(screen, opts); return screen; },
  hud(on = true, { intro = false, duration } = {}) {
    hudOn = !!on; paused = false;
    hud.setVisible(hudOn);
    if (hudOn) {
      menus.show(null);
      document.body.dataset.screen = 'hud';
      mock.time = duration || mock.time || 180; tHud = 0;
      if (intro) { hud.banner('ready'); setTimeout(() => hud.banner('go'), 1500); }
    }
    return hudOn;
  },
  set(o) { for (const k in o) { mock[k] = o[k]; fixed.add(k); } if (o.weapon) S.loadout.weapon = o.weapon; return mock; },
  unset(...ks) { ks.forEach((k) => fixed.delete(k)); },
  banner: (k, t) => hud.banner(k, t),
  countdown: (n) => hud.countdown(n),
  hit: (k = 'hit') => hud.hitMarker(k),
  feed(n = 3) {
    const p = pal();
    const ev = [
      { text: `You splatted ${BOT_NAMES[5]}!`, color: p.a, kind: 'kill' },
      { text: `${BOT_NAMES[1]} splatted ${BOT_NAMES[6]}`, color: p.a, kind: 'ally' },
      { text: `${BOT_NAMES[7]} splatted you`, color: p.b, kind: 'death' },
      { text: 'Special ready — press [F]', color: p.a, kind: 'info' },
      { text: `${BOT_NAMES[4]} splatted ${BOT_NAMES[2]}`, color: p.b, kind: 'ally' },
    ];
    for (let i = 0; i < n; i++) setTimeout(() => hud.feed(ev[i % ev.length]), i * 140);
  },
  damage: (a = 0.6) => hud.damage(a, pal().b),
  /** event-driven HUD systems (fake bus events; the HUD runs in lab mode) */
  turf(n = 18, times = 1) { for (let i = 0; i < times; i++) setTimeout(() => emit('turf', { actor: labActors[0], area: n }), i * 90); },
  hitEv(dmg = 36, killed = false, v = 4) { emit('hit', { attacker: labActors[0], victim: labActors[v], damage: dmg, killed }); hud.hitMarker(killed ? 'kill' : 'hit'); },
  splat(v = 4, attacker = 0) { labActors[v].alive = false; emit('splatted', { victim: labActors[v], attacker: labActors[attacker] }); if (attacker === 0) hud.hitMarker('kill'); },
  streak(n = 2) { for (let i = 0; i < n; i++) setTimeout(() => lab.splat(4 + i, 0), i * 350); },
  wipeout() { labActors.forEach((a) => { if (a.team === 1) a.alive = false; }); for (let i = 0; i < 4; i++) setTimeout(() => { lab.splat(4 + i, 0); }, i * 260); },
  assist(v = 5) { emit('hit', { attacker: labActors[0], victim: labActors[v], damage: 40, killed: false }); setTimeout(() => emit('splatted', { victim: labActors[v], attacker: labActors[1] }), 300); },
  dmgFrom(deg = 60) { const a = labActors[4]; a.pos = { x: Math.sin(deg * Math.PI / 180) * 12, y: 0, z: Math.cos(deg * Math.PI / 180) * 12 }; emit('damage', { victim: labActors[0], attacker: a, amount: 30, source: 'shooter' }); },
  lineup() { hud._lineup({ actors: labActors }); },
  subAim(on = true) { mock.subAim = on; },
  shield(sec = 2) { labActors[0].invuln = sec; setTimeout(() => { labActors[0].invuln = 0; }, sec * 1000); },
  resetKills() { hud._startMatchHud({ actors: labActors }); hud.overLayer.querySelectorAll('.iw-lineup').forEach((e) => e.remove()); labActors.forEach((a) => { a.alive = true; }); },
  kill(i = 5, secs = 5) { deadUntil[i] = tHud + secs; },
  splatted(secs = 5.5) { hud.showSplatted({ by: BOT_NAMES[6], byColor: pal().b, respawn: secs }); },
  unsplat: () => hud.hideSplatted(),
  async judge(opts = {}) {
    const p = pal();
    const r = await hud.judge({ colors: [p.a, p.b], percents: opts.percents || [52.6, 39.1], names: p.names });
    log('judge resolved', r);
    if (opts.results !== false) { menus.showResults(resultsData({ win: (opts.percents || [52.6, 39.1])[0] > (opts.percents || [52.6, 39.1])[1] })); lab.hud(false); menus.show('results'); }
    return r;
  },
  results(o = {}) { this.hud(false); menus.showResults(resultsData(o)); menus.show('results', { force: true }); },
  loading(p, label) { menus.setLoading(p, label); },
  key(key, code, extra = {}) { return menus.handleKey({ key, code: code || (key.length === 1 ? 'Key' + key.toUpperCase() : key), repeat: false, shiftKey: false, preventDefault() {}, ...extra }); },
  nav: (d) => menus.nav(d),
  input: (m) => menus.setInputMode(m),
  palette(i) { palIdx = i % TEAM_PALETTES.length; applyPalette(); drawHero(); if (menus.current) menus.show(menus.current, { force: true }); },
  /** Slow every running CSS/WAAPI animation (0.25 = quarter speed). */
  slow(rate = 0.25) { clearInterval(slowTimer); hud.timeScale = rate; if (rate === 1) { document.getAnimations().forEach((a) => (a.playbackRate = 1)); return; } slowTimer = setInterval(() => document.getAnimations().forEach((a) => { if (a.playbackRate !== rate) a.playbackRate = rate; }), 30); },
  /** Freeze every animation where it is (for mid-animation screenshots). */
  freeze() { clearInterval(slowTimer); hud.paused = true; paused = true; document.getAnimations().forEach((a) => a.pause()); root.classList.add('iw-lab-freeze'); },
  unfreeze() { hud.paused = false; paused = false; root.classList.remove('iw-lab-freeze'); document.getAnimations().forEach((a) => a.play()); },
  /** Poll until cond() is true (or timeout), then freeze — deterministic mid-animation captures under load. */
  freezeWhen(cond, timeout = 20000) { return new Promise((r) => { const t0 = performance.now(); const iv = setInterval(() => { if (cond() || performance.now() - t0 > timeout) { clearInterval(iv); lab.freeze(); r(cond()); } }, 16); }); },
  wait: (ms) => new Promise((r) => setTimeout(r, ms)),
  sound(on = true) { soundOn = on; },
  clean(on = true) { panel.classList.toggle('hidden', on); },
};

// ------------------------------------------------------------------ panel
function buildPanel() {
  const sec = (title, items) => {
    const h = document.createElement('h4'); h.textContent = title; panel.appendChild(h);
    const d = document.createElement('div');
    for (const [label, fn] of items) { const b = document.createElement('button'); b.textContent = label; b.onclick = (e) => { e.stopPropagation(); b.blur(); fn(); }; d.appendChild(b); }
    panel.appendChild(d);
  };
  const t = document.createElement('div');
  t.innerHTML = '<b>INKWAVE UI LAB</b> <span style="opacity:.6">(` to hide)</span>';
  panel.appendChild(t);
  sec('Screens', ['loading', 'title', 'main', 'setup', 'loadout', 'locker', 'settings', 'howto', 'credits', 'pause'].map((s) => [s, () => lab.go(s)]).concat([['results', () => lab.results()], ['results (lose)', () => lab.results({ win: false, levelUp: false })], ['none', () => lab.go(null)]]));
  sec('Loading', [['0%', () => lab.loading(0, 'Mixing the ink…')], ['40%', () => lab.loading(0.4, 'Building the plaza…')], ['100%', () => lab.loading(1, 'Ready!')]]);
  sec('HUD', [
    ['match', () => lab.hud(true, { intro: true })], ['ready', () => lab.banner('ready')], ['go', () => lab.banner('go')], ['1 min', () => lab.banner('one_minute')],
    ['time up', () => lab.banner('timesup')], ['special', () => lab.banner('special', 'TIDAL SLAM!')], ['count 10..1', () => { for (let i = 10; i >= 1; i--) setTimeout(() => lab.countdown(i), (10 - i) * 1000); lab.set({ time: 10.5 }); lab.unset('time'); }],
    ['hit', () => lab.hit()], ['kill', () => lab.hit('kill')], ['feed', () => lab.feed(5)], ['damage', () => lab.damage()], ['low hp', () => lab.set({ hp: 0.15 })], ['hp ok', () => lab.unset('hp')],
    ['low ink', () => lab.set({ ink: 0.12, inkLow: true })], ['ink auto', () => lab.unset('ink', 'inkLow')], ['map big', () => lab.set({ expanded: true })], ['map small', () => lab.set({ expanded: false })],
    ['splatted', () => lab.splatted()], ['respawn', () => lab.unsplat()], ['ally dies', () => lab.kill(1 + ((Math.random() * 7) | 0), 5)], ['judge', () => lab.judge()],
  ]);
  sec('HUD systems', [
    ['turf +18', () => lab.turf(18, 3)], ['hit ev', () => lab.hitEv(36)], ['kill card', () => lab.splat(4 + ((Math.random() * 4) | 0), 0)], ['double', () => lab.streak(2)], ['triple', () => lab.streak(3)],
    ['wipeout', () => lab.wipeout()], ['assist', () => lab.assist()], ['dmg ←', () => lab.dmgFrom(-90)], ['dmg ↓', () => lab.dmgFrom(180)], ['dmg →', () => lab.dmgFrom(70)],
    ['lineup', () => lab.lineup()], ['bomb aim', () => lab.subAim(!mock.subAim)], ['shield', () => lab.shield(2)], ['reset kills', () => lab.resetKills()],
  ]);
  sec('Weapon', WEAPON_ORDER.map((w) => [w, () => lab.set({ weapon: w })]));
  sec('Misc', [['pad glyphs', () => lab.input('pad')], ['kbm glyphs', () => lab.input('kbm')], ['palette ↻', () => lab.palette(palIdx + 1)], ['slow ¼', () => lab.slow(0.25)], ['speed 1', () => lab.slow(1)], ['freeze', () => lab.freeze()], ['unfreeze', () => lab.unfreeze()], ['sound on', () => lab.sound(true)]]);
  logEl.className = 'log';
  panel.appendChild(logEl);
}

// ------------------------------------------------------------------ boot
menus = new Menus(root, api);
hud = new HUD(root, { playSound: (n) => blip(n) });
hud.lab = { local: labActors[0], actors: labActors, beacons: null, onJump: (i) => log('super jump →', i < 3 ? labActors[i + 1].name : 'base') };
window.__labActors = labActors; void G;
applyPalette();
drawHero();
buildPanel();
if (Q.get('clean') === '1') panel.classList.add('hidden');
if (Q.get('pad') === '1') menus.setInputMode('pad');
requestAnimationFrame(loop);

const start = Q.get('screen') || 'loading';
if (start === 'hud') lab.hud(true);
else if (start === 'results') lab.results({ win: Q.get('win') !== '0', levelUp: Q.get('lvl') !== '0' });
else if (start === 'loading') {
  menus.show('loading');
  let p = 0;
  const steps = ['Mixing the ink…', 'Building the plaza…', 'Waking up the squidkids…', 'Tuning the bass…', 'Ready!'];
  const iv = setInterval(() => { p = Math.min(1, p + 0.07 + Math.random() * 0.05); menus.setLoading(p, steps[Math.min(steps.length - 1, Math.floor(p * steps.length))]); if (p >= 1 && Q.get('auto') !== '0') { clearInterval(iv); setTimeout(() => menus.show('title'), 700); } }, 260);
} else lab.go(start === 'none' ? null : start);
if (Q.get('slow')) lab.slow(+Q.get('slow'));
