// Run: node checks/campaign.mjs
// Narrative regression check: real director and maps, scripted movement/KOs; no renderer, combat or balance claim.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(id, context, next) {
  return id === 'three' ? { url: new URL('../vendor/three/three.module.js', import.meta.url).href, shortCircuit: true } : next(id, context);
} });
const [{ CHAPTERS, chapterOpen }, { createStory }, { MAPS }, world, events, difficulty, progress] = await Promise.all([
  import('../src/story/chapters.js'), import('../src/story/index.js'), import('../src/world/maps/index.js'),
  import('../src/world/map.js'), import('../src/core/events.js'), import('../src/core/difficulty.js'), import('../src/core/progress.js'),
]);
const { collect, emit, on } = events;

if (process.argv.includes('--defense') || process.argv.includes('--altar')) {
  const [{ createHero }, { createCrowd }, { createActors }, { createCombat }, { CHARS }, { armyPair }, { rng }] = await Promise.all([
    import('../src/hero/hero.js'), import('../src/crowd/crowd.js'), import('../src/actors/actors.js'), import('../src/combat/combat.js'),
    import('../src/chars/index.js'), import('../src/crowd/armies.js'), import('../src/core/rng.js'),
  ]);
  const altar = process.argv.includes('--altar'), char = altar ? process.argv[3] || 'zhugeliang' : 'zhangfei';
  const C = CHAPTERS.find((c) => c.CH.id === (altar ? 'chibi' : 'changban')), defenses = C.BEATS.filter((b) => b.defend);
  const original = defenses.map((b) => b.defend);
  // The hero is invulnerable to isolate objective HP. Actual crowd AI, kit N1→N3→C4, combat and reactions still run.
  const candidates = altar ? [
    { label: 'altar', at: ['altar', 0, 0], r: 12 },
    { label: 'altar-entry-8', at: ['altar', 0, -15], r: 8 },
    { label: 'altar-entry-6', at: ['altar', 0, -15], r: 6 },
  ] : [{ label: 'south', at: ['bridge', 0, -9], r: 5 }, { label: 'north', at: ['bridge', 0, 8], r: 5 }];
  for (const candidate of candidates.filter((c) => !process.argv.includes('--selected') || c.label === 'altar-entry-6')) {
    for (let i = 0; i < defenses.length; i++) defenses[i].defend = { ...original[i], at: candidate.at, r: candidate.r };
    for (const attacking of [false, true]) {
      world.loadMap(MAPS[C.CH.map]); rng.seed(1);
      const altarAnchor = altar && world.anchor('altar');
      const guardAt = altar ? candidate.label === 'altar' ? [6, -160] : [altarAnchor[0] + candidate.at[1], altarAnchor[1] + candidate.at[2]] : null;
      const game = { mode: 'story', frame: 0, freeze: 0, hitstop: 0, cam: { yaw: 0 }, diff: difficulty.DIFFS[1], army: armyPair(C.CH.army),
      };
      let end = null, passed = false, lowest = 1, after60 = null;
      const [officers, off] = collect(() => {
        game.hero = createHero(game); game.hero.reset({ ...world.spawnPoint('story'), char: CHARS[char] });
        game.crowd = createCrowd(game, 300); game.crowd.reset();
        game.actors = createActors(game); game.combat = createCombat(game); game.combat.reset();
        game.musou = game.hero.kit.createMusou(game); game.musou.reset();
        game.story = createStory(game); game.story.reset({ mode: 'story', char, ch: C.CH.id });
        on('story:end', (e) => { end = e; });
        on('story:objective', (e) => { if (e.zh.includes('接應趙雲')) passed = true; });
        on('story:set', (e) => { if (altar && e.id === 'wind') passed = true; });
        return game.actors;
      });
      try {
        for (let i = 0; i < 155 * 60 && !end && !passed; i++) {
          const h = game.hero;
          h.iframes = 2;
          const press = attacking && game.frame % 5 === 0;
          let dx = 0, dz = 0;
          if (altar && attacking) {
            dx = guardAt[0] - h.x; dz = guardAt[1] - h.z;
            const len = Math.hypot(dx, dz);
            if (len > 2) { dx /= len; dz /= len; } else dx = dz = 0;
          }
          h.step({ mx: -dx, my: dz, pressed: { attack: press && h.move !== 'n3', charge: press && h.move === 'n3',
            musou: attacking && process.argv.includes('--musou') && press && game.musou.ready() } });
          // Hold the north bridgehead: lunges remain within the deck/approach rather than marching away from the post.
          if (!altar) { h.x = Math.max(-3, Math.min(3, h.x)); h.z = Math.max(-123, Math.min(-115, h.z)); }
          game.combat.step(); game.crowd.step(); officers.step(); game.musou.step(); game.story.step(); game.frame++;
          if (game.story.defend) lowest = Math.min(lowest, game.story.defend.f);
          if (game.frame === 60 * 60) after60 = game.story.defend?.f;
        }
        console.log(JSON.stringify({ defense: candidate.label, hero: char, attacking, musou: process.argv.includes('--musou'), at: [game.hero.x, game.hero.z].map((v) => +v.toFixed(2)), seconds: +(game.frame / 60).toFixed(2), lowest: +lowest.toFixed(3),
          after60: after60 == null ? null : +after60.toFixed(3), kos: game.hero.kos, passed, lost: end?.win === false, reason: end?.reason }));
        if (candidate.label === 'north') {
          if (attacking) { assert(passed, 'a fighting bridge guard must survive the hold'); assert(lowest > 0.5); }
          else assert.equal(end?.win, false, 'an idle bridge guard must lose the bridge');
        }
        if (candidate.label === 'altar-entry-6') {
          if (attacking) assert(passed, 'a fighting altar guard must survive until the east wind');
          else assert.equal(end?.win, false, 'an idle altar guard must lose the altar');
        }
      } finally { off(); }
    }
  }
  for (let i = 0; i < defenses.length; i++) defenses[i].defend = original[i];
  process.exit(0);
}

function fixture(ch, char, options = {}) {
  world.loadMap(MAPS[ch]);
  const hero = { ...world.spawnPoint('story'), hp: 400, hpMax: 400, kos: 0, combo: 0, vz: 0, iframes: 0, dead: false };
  const actors = new Map(), officers = [], seen = { objectives: [], banners: [], lines: [], sets: [], actors: [], end: null };
  const game = { hero, frame: 0, diff: difficulty.DIFFS[1], timeScale: 1 };
  game.crowd = { N: 0, x: [], z: [], st: [], hp: [], hpMax: [], allyKos: 0, allyLost: 0,
    spawnAllies() {}, setAllies() {}, spawnArmy() {}, setWaves() {}, retire() {}, spawnSquad() {},
    spawnOfficer(d) {
      const i = officers.length;
      officers.push({ ...d, born: game.frame, down: false });
      this.x[i] = d.x; this.z[i] = d.z; this.hp[i] = this.hpMax[i] = d.hp;
      return i;
    },
  };
  game.actors = { get: (key) => actors.get(key),
    spawn(key, d) {
      const a = { ...d, key, x: d.at.x, z: d.at.z, hpMax: d.hp || 1000, hp: d.hp || 1000, born: game.frame, dead: false };
      actors.set(key, a); seen.actors.push({ key, kit: d.kit, role: d.role });
    },
    order(key, action) {
      const a = actors.get(key);
      if (a && action === 'retreat') { a.dead = true; emit('actor:retreat', { key }); }
    },
  };
  const [story, off] = collect(() => {
    on('story:objective', (e) => seen.objectives.push({ ...e, frame: game.frame }));
    on('story:banner', (e) => seen.banners.push(e.html));
    on('story:say', (e) => seen.lines.push(e.zh));
    on('story:set', (e) => seen.sets.push(e.id));
    on('story:end', (e) => { seen.end = e; });
    return createStory(game);
  });
  game.story = story;
  story.reset({ mode: 'story', char, ch });
  return { game, story, seen, actors, officers, off, options };
}

function step(f, steer = true, kill = true) {
  const { game, story, actors, officers, options } = f, h = game.hero, c = game.crowd;
  game.frame++;
  if (steer && story.target) {
    // Script positions may be set directly here: browser acceptance owns traversal and physical reachability.
    const p = story.target, goal = `${p.x},${p.z}`;
    h.x = p.x;
    if (goal !== f.goal) { f.goal = goal; f.direction = Math.sign(p.z - h.z) || 1; h.z = p.z; }
    else h.z += f.direction * 2;
  }
  if (kill) {
    for (let i = 0; i < officers.length; i++) {
      const o = officers[i], wait = options.coldWine && o.name.en === 'HUA XIONG' ? 151 * 60 : 120;
      if (o.down || game.frame - o.born < wait) continue;
      o.down = true; c.hp[i] = 0; h.kos++;
      emit('ko', { i, officer: true });
    }
    for (const a of actors.values()) if (a.role === 'boss' && !a.dead && game.frame - a.born >= 8 * 60) {
      a.dead = true; a.hp = 0; h.kos++;
      emit('actor:down', { key: a.key });
    }
  }
  story.step();
}
function run(ch, char, options) {
  const f = fixture(ch, char, options);
  try {
    for (let i = 0; i < 20 * 60 * 60 && !f.seen.end; i++) step(f);
    assert.equal(f.seen.end?.win, true, `${ch}/${char} stalled at ${f.seen.objectives.at(-1)?.zh}`);
    assert.match(f.seen.end.stats.rank, /^[SABC]$/);
    return f.seen;
  } finally { f.off(); }
}

for (const C of CHAPTERS) for (const char of C.CH.heroes) {
  const s = run(C.CH.id, char);
  if (C.CH.id === 'hulao') {
    assert.equal(s.actors.filter((a) => a.role === 'ally').length, 2, `the other two brothers must join ${char}`);
    if (char === 'guanyu') assert(s.banners.some((b) => b.includes('溫酒斬華雄')), 'warm-wine branch must fire');
  }
  if (C.CH.id === 'changban') {
    assert(s.objectives.some((o) => o.zh.includes(char === 'zhaoyun' ? '懷抱阿斗' : '護送趙雲')));
    if (char === 'zhangfei') assert(s.sets.includes('bridge'), 'bridge must break after victory');
  }
  if (C.CH.id === 'chibi') assert.deepEqual(s.sets, ['wind', 'ignite', 'forest']);
  if (C.CH.id === 'dingjun') assert(s.actors.some((a) => a.kit === 'xiahouyuan' && a.role === 'boss'));
  console.log(`PASS ${C.CH.id}/${char} win and branch events`);
}
const cold = run('hulao', 'guanyu', { coldWine: true });
assert(!cold.banners.some((b) => b.includes('溫酒斬華雄')));
assert(cold.lines.some((l) => l.includes('酒已涼了')));
console.log('PASS guanyu cold wine remains winnable');

// Changing to and from the spy objective must keep the original 120-second altar countdown.
for (const char of ['zhugeliang', 'zhaoyun']) {
  const f = fixture('chibi', char);
  try {
    for (let i = 0; i < 75 * 60; i++) step(f);
    assert(f.seen.objectives.some((o) => o.zh.includes('蔡和')));
    assert(f.story.timer >= 45 && f.story.timer <= 46, `${char}: timer reset/lost at spy objective`);
    assert.deepEqual(f.story.target, { x: -6, z: -175 });
    assert(world.walkIn(f.story.target.x, f.story.target.z) > 0.5, 'altar guard objective must be walkable');
    while (f.game.frame < 121 * 60) step(f);
    assert(f.seen.sets.includes('wind'), `${char}: east wind must arrive after 120 seconds`);
  } finally { f.off(); }
}
console.log('PASS altar side objective preserves countdown');

// A defend point drains only from live foes inside its radius, then its chapter fail condition ends the battle.
for (const [ch, char] of [['changban', 'zhangfei'], ['chibi', 'zhugeliang']]) {
  const f = fixture(ch, char);
  try {
    for (let i = 0; i < 30; i++) step(f, false, false);
    const D = f.story.defend, c = f.game.crowd;
    assert(D, `${ch}: defend point missing`);
    c.N = 600;
    for (let i = 0; i < c.N; i++) { c.x[i] = D.x; c.z[i] = D.z; c.st[i] = 1; }
    for (let i = 0; i < 300 && !f.seen.end; i++) step(f, false, false);
    assert.equal(f.seen.end?.win, false, `${ch}: point loss must end the battle`);
    assert(f.seen.end.reason?.zh.includes('失守'));
  } finally { f.off(); }
}
const fallen = fixture('hulao', 'liubei');
try {
  for (let i = 0; i < 30; i++) step(fallen, false, false);
  fallen.game.hero.dead = true; emit('hero:down', {});
  for (let i = 0; i < 121; i++) step(fallen, false, false);
  assert.equal(fallen.seen.end?.win, false);
} finally { fallen.off(); }
console.log('PASS bridge/altar loss and hero death');

// Every scripted bridge opponent must enter from the dry northern approach, not the anchor's metre-wide centre.
const changban = CHAPTERS.find((c) => c.CH.id === 'changban');
for (const b of changban.BEATS) for (const spawn of [...Object.values(b.officers || {}), ...(b.squads || [])]) {
  if (spawn.at[0] === 'bridge') assert(spawn.at[2] >= 20, 'bridge enemy position must use metres from anchor');
}
console.log('PASS bridge enemy spawn units');

const saved = new Map();
globalThis.localStorage = { getItem: (key) => saved.get(key), setItem: (key, value) => saved.set(key, value) };
assert(chapterOpen(0));
for (let i = 0; i < CHAPTERS.length - 1; i++) {
  assert.equal(chapterOpen(i + 1), false);
  progress.record(CHAPTERS[i].CH.id, CHAPTERS[i].CH.heroes[0], 'normal', { rank: 'A', time: 600, kos: 900 });
  assert(chapterOpen(i + 1));
}
assert(!difficulty.unlocked(difficulty.DIFFS[3]) && progress.locked('gauntlet') && !progress.locked('lubu') && !progress.locked('hold'));
const win = progress.record('dingjun', 'huangzhong', 'hard', { rank: 'S', time: 500, kos: 1300 });
assert.deepEqual(win.unlocks.map((u) => u.id), ['chaos', 'gauntlet']);
assert(win.first && difficulty.unlocked(difficulty.DIFFS[3]));
// each best is kept on its own: a slower, lower-ranked run with more KOs only moves the KO record
const again = progress.record('dingjun', 'huangzhong', 'hard', { rank: 'B', time: 700, kos: 1500 });
assert.deepEqual(again.fresh, { rank: false, time: false, kos: true });
assert.deepEqual(progress.best('dingjun', 'huangzhong', 'hard'), { rank: 'S', time: 500, kos: 1500 });
assert.equal(progress.best('hulao').rank, 'A');
console.log('PASS sequential chapters, records and unlocks');
