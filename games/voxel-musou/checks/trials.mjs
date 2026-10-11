// Run: node checks/trials.mjs
// Trial regression: real director, maps, hero damage and actor attacks/KOs; scripted time and crowd KOs, no renderer or
// balance claim. Checks every beat in order, win/hero/objective defeat, open gates/bounds, actor clamp and strict S gates.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(id, context, next) {
  return id === 'three' ? { url: new URL('../vendor/three/three.module.js', import.meta.url).href, shortCircuit: true } : next(id, context);
} });
const [{ TRIALS }, { createStory }, { createHero }, { createActors }, { CHARS }, { MAPS }, world, { DIFFS }, { ST, createCrowd },
  { collect, emit, on }, { rng }, { armyPair }] = await Promise.all([
  import('../src/story/trials.js'), import('../src/story/index.js'), import('../src/hero/hero.js'), import('../src/actors/actors.js'),
  import('../src/chars/index.js'), import('../src/world/maps/index.js'), import('../src/world/map.js'),
  import('../src/core/difficulty.js'), import('../src/crowd/crowd.js'), import('../src/core/events.js'), import('../src/core/rng.js'),
  import('../src/crowd/armies.js'),
]);
const trial = (id) => TRIALS.find((t) => t.CH.id === id);

function fixture(C, diff = DIFFS[1], mode = 'trial') {
  world.loadMap(MAPS[C.CH.map]); rng.seed(1);
  const game = { mode, diff, frame: 0, freeze: 0, hitstop: 0, cam: { yaw: 0 }, timeScale: 1, army: armyPair(C.CH.army) };
  const seen = { objectives: [], banners: [], officers: [], actors: [], strikes: [], armies: 0, ends: [] };
  game.crowd = { N: 0, T: 0, x: [], y: [], z: [], st: [], hp: [], hpMax: [], allyKos: 0, allyLost: 0,
    spawnAllies() {}, setAllies() {}, retire() {}, spawnSquad() {},
    spawnArmy() { this.armyOn = this.wavesOn = true; seen.armies++; },
    setWaves(on) { this.wavesOn = on; },
    spawnOfficer(d) {
      const i = seen.officers.length; seen.officers.push({ ...d, frame: game.frame });
      this.x[i] = d.x; this.z[i] = d.z; this.hp[i] = this.hpMax[i] = d.hp;
      return i;
    },
  };
  game.combat = { npcStrike() {} };
  const [, off] = collect(() => {
    game.hero = createHero(game); game.hero.reset({ ...world.spawnPoint('free'), ...C.CH.start, char: CHARS.zhaoyun });
    game.actors = createActors(game);
    game.story = createStory(game);
    on('story:objective', (e) => seen.objectives.push({ ...e, frame: game.frame }));
    on('story:banner', (e) => seen.banners.push({ ...e, frame: game.frame }));
    on('actor:spawn', (e) => seen.actors.push({ ...e, frame: game.frame }));
    on('actor:strike', (e) => seen.strikes.push({ ...e, frame: game.frame }));
    on('story:end', (e) => seen.ends.push(e));
    game.story.reset({ mode, char: 'zhaoyun', ch: C.CH.id });
  });
  return { C, game, seen, off };
}
function step(f, n = 1, actors = false) {
  for (let i = 0; i < n; i++) {
    f.game.frame++;
    if (actors) f.game.actors.step();
    f.game.story.step();
  }
}
function first(f) {
  step(f, Math.max(1, f.C.BEATS[0].when?.wait || 1));
  assert.equal(f.seen.objectives.length, 1);
  assert(Object.values(world.GATES).every((g) => g.open), `${f.C.CH.id}: trial gates must stay open`);
}
function won(f) {
  const at = f.game.frame, stats = { ...f.game.story.stats() };
  f.game.hero.kos += 25; f.game.hero.combo += 50; emit('hero:hurt', { dmg: 50 });
  assert.equal(f.seen.ends.length, 0, 'victory must keep its presentation delay');
  step(f, 299); assert.equal(f.seen.ends.length, 0);
  step(f); assert.equal(f.seen.ends.length, 1); assert.equal(f.seen.ends[0].win, true);
  assert.equal(f.seen.ends[0].stats.time, Math.round(at / 60), 'clear time must exclude victory slow-mo');
  assert.deepEqual(f.seen.ends[0].stats, stats, 'presentation KOs, combo and damage must not change the record');
  step(f, 400); assert.equal(f.seen.ends.length, 1, 'an ended stage must not emit twice');
  return f.seen.ends[0];
}

function slay(f, winAt) {
  assert.equal(f.seen.armies, 1, 'the initial trial army must be placed under loading');
  first(f); assert.equal(f.seen.armies, 1);
  for (let i = 1; i < f.C.BEATS.length; i++) {
    const b = f.C.BEATS[i], before = f.seen.banners.length;
    f.game.hero.kos += b.when.kos - 1;
    step(f); assert.equal(f.seen.banners.length, before, `slay beat ${i} fired before its KO threshold`);
    if (b.win && winAt) step(f, winAt - f.game.frame - 1);
    f.game.hero.kos++; step(f);
    assert.equal(f.seen.banners.length, before + 1);
    assert.equal(f.seen.banners.at(-1).html, b.banner.html, `slay beat ${i} order`);
  }
  assert.equal(f.game.hero.kos, 1000);
  return won(f);
}
function hold(f) {
  first(f);
  const initial = f.C.BEATS[0], endsAt = f.game.frame + initial.obj.timer * 60;
  assert(f.game.story.defend); assert(f.game.crowd.wavesOn);
  const position = ([id, x, z]) => {
    const a = world.anchor(id), q = a ? null : world.zone(id);
    return a ? [a[0] + x, a[1] + z] : [q.x + x * (q.r ?? q.w / 2), q.z + z * (q.r ?? q.d / 2)];
  };
  const ahead = position(initial.limit.z)[1], behind = position(initial.limit.back)[1];
  f.game.hero.z = ahead + 100; step(f); assert.equal(f.game.hero.z, ahead);
  f.game.hero.z = behind - 100; step(f); assert.equal(f.game.hero.z, behind);
  let prior = f.seen.objectives[0].frame;
  for (let i = 1; i < f.C.BEATS.length - 1; i++) {
    const b = f.C.BEATS[i], count = f.seen.officers.length, at = prior + b.when.wait;
    step(f, at - f.game.frame - 1); assert.equal(f.seen.officers.length, count, `hold beat ${i} fired early`);
    step(f);
    const expected = Object.keys(b.officers).map((k) => f.C.OFF[k].name);
    assert.deepEqual(f.seen.officers.slice(count).map((o) => o.name), expected, `hold beat ${i} order`);
    prior = at;
  }
  step(f, endsAt - f.game.frame - 1); assert.equal(f.game.story.timer, 1);
  assert(f.game.story.defend); assert.equal(f.seen.ends.length, 0);
  step(f); assert.equal(f.game.story.defend, null); assert.equal(f.game.story.timer, 0);
  assert.equal(f.seen.banners.at(-1).html, f.C.BEATS.at(-1).banner.html);
  return won(f);
}
function gauntlet(f, winAt) {
  first(f);
  const beats = f.C.BEATS.filter((b) => b.actors), keys = beats.map((b) => Object.keys(b.actors)[0]);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i], a = f.game.actors.get(key);
    assert(a && f.game.actors.foe(a)); assert(a.attacks.length > 0);
    assert(a.attacks.every((d) => d.m || a.kit.clips[d.clip]), `${key}: each boss attack must have a clip`);
    assert(world.walkIn(a.x, a.z) >= 0, `${key}: boss spawn must be walkable`);
    assert.deepEqual(f.seen.actors.map((a) => a.key), keys.slice(0, i + 1), 'the next boss must wait for this down event');
    if (i === keys.length - 1 && winAt) step(f, winAt - f.game.frame - 1);
    assert(f.game.actors.hurt(a, a.hp, true, false));
    assert(a.dead && a.state === 'down'); step(f);
    if (i < keys.length - 1) assert.equal(f.seen.objectives.at(-1).zh, beats[i + 1].obj.zh);
  }
  assert.deepEqual(f.seen.actors.map((a) => a.key), ['yuan', 'liao', 'cao', 'lubu']);
  return won(f);
}

for (const C of TRIALS) {
  const f = fixture(C);
  try {
    const result = ({ slay, hold, gauntlet })[C.CH.id](f);
    assert.match(result.stats.rank, /^[SABC]$/);
    console.log(`PASS ${C.CH.id} every beat in order, victory and frozen clear time`);
  } finally { f.off(); }
  const fallen = fixture(C);
  try {
    first(fallen);
    assert(fallen.game.hero.hurt(400, fallen.game.hero.x, fallen.game.hero.z + 2, true));
    assert(fallen.game.hero.dead);
    const stats = { ...fallen.game.story.stats() };
    fallen.game.hero.kos += 25; emit('hero:hurt', { dmg: 50 });
    step(fallen, 119); assert.equal(fallen.seen.ends.length, 0);
    step(fallen); assert.equal(fallen.seen.ends[0]?.win, false);
    assert.equal(fallen.seen.ends[0]?.reason, null);
    assert.deepEqual(fallen.seen.ends[0]?.stats, stats, 'defeat presentation must not change the record');
  } finally { fallen.off(); }
}
console.log('PASS hero death ends each trial after two seconds');

// Time zero is the deadline: a thousand KOs one frame earlier wins, arriving at zero loses.
for (const timely of [true, false]) {
  const f = fixture(trial('slay'));
  try {
    const start = Math.max(1, f.C.BEATS[0].when?.wait || 1), deadline = start + f.C.BEATS[0].obj.timer * 60;
    if (timely) slay(f, deadline - 1);
    else {
      first(f); step(f, deadline - f.game.frame - 1); f.game.hero.kos = 1000; step(f);
      assert.equal(f.game.story.timer, 1, 'failure presentation keeps the prior HUD until results');
      step(f, 120); assert.equal(f.seen.ends[0]?.win, false); assert.match(f.seen.ends[0]?.reason?.zh, /時限/);
    }
  } finally { f.off(); }
}
console.log('PASS slay deadline win/timeout boundary');

const lost = fixture(trial('hold'));
try {
  first(lost); const c = lost.game.crowd, d = lost.game.story.defend;
  c.N = 2; c.x[0] = d.x; c.z[0] = d.z; c.st[0] = ST.DEAD;
  c.x[1] = d.x + lost.C.BEATS[0].defend.r + 1; c.z[1] = d.z; c.st[1] = ST.IDLE;
  step(lost, 60); assert.equal(lost.game.story.defend.f, 1, 'dead or distant foes cannot drain the bridge');
  c.N = 600;
  for (let i = 0; i < c.N; i++) { c.x[i] = d.x; c.z[i] = d.z; c.st[i] = ST.IDLE; }
  for (let i = 0; i < 600 && !lost.seen.ends.length; i++) step(lost);
  assert.equal(lost.seen.ends[0]?.win, false); assert.match(lost.seen.ends[0]?.reason?.zh, /失守/);
} finally { lost.off(); }
console.log('PASS hold loses when live foes drain the defend point');

const duel = fixture(trial('gauntlet'));
try {
  // Stand at a legal basin edge, where the authored hero-relative boss offset lies beyond the walk field.
  let edge = null;
  for (let x = -36; x <= 36 && !edge; x += 2) for (let z = -30; z <= 30; z += 2)
    if (world.walkIn(x, z) >= 1 && world.walkIn(x, z + 16) < -1) { edge = [x, z]; break; }
  assert(edge); [duel.game.hero.x, duel.game.hero.z] = edge;
  first(duel); const yuan = duel.game.actors.get('yuan');
  assert(world.walkIn(yuan.x, yuan.z) >= 0);
  assert(Math.hypot(yuan.x - edge[0], yuan.z - edge[1] - 16) > 1, 'actor must clamp an illegal hero-relative offset');
  step(duel, 10 * 60 * 60); assert.equal(duel.seen.actors.length, 1, 'gauntlet has no hidden time limit');
  for (const key of ['yuan', 'liao']) { const a = duel.game.actors.get(key); duel.game.actors.hurt(a, a.hp, true, false); step(duel); }
  const cao = duel.game.actors.get('cao'); assert.equal(cao.char.id, 'caocao');
  duel.game.hero.x = cao.x; duel.game.hero.z = cao.z - 2;
  for (let i = 0; i < 900 && !duel.seen.strikes.some((s) => s.key === 'cao'); i++) step(duel, 1, true);
  assert(duel.seen.strikes.some((s) => s.key === 'cao'), 'Cao Cao must actually attack');
  assert(duel.game.hero.hp < duel.game.hero.hpMax, 'Cao Cao attack must damage the hero');
  duel.game.actors.hurt(cao, cao.hp, true, false); step(duel);
  assert(duel.game.actors.get('lubu'), 'Cao Cao down must open the final duel');
} finally { duel.off(); }
console.log('PASS hero-relative spawn clamp, late down and Cao Cao attack/down');

const free = fixture(trial('slay'), DIFFS[1], 'free');
try {
  assert.equal(free.seen.armies, 1); assert(free.game.crowd.armyOn);
  free.game.hero.hurt(9999, free.game.hero.x, free.game.hero.z + 2, true);
  assert.equal(free.game.hero.hp, 1); assert.equal(free.game.hero.dead, false);
  emit('hero:down', {}); step(free, 12 * 60 * 60);
  assert.equal(free.seen.ends.length, 0); assert.equal(free.game.story.timer, null); assert.equal(free.game.story.defend, null);
} finally { free.off(); }
console.log('PASS free battle remains immortal and endless');

// Actual reinforcement waves revive the free army's officers only after spawnArmy, regardless of the flow mode.
for (const mode of ['story', 'trial', 'free']) for (const army of [false, true]) {
  const f = fixture(trial('gauntlet'));
  try {
    const g = f.game; g.mode = mode; g.crowd = createCrowd(g, 16); const c = g.crowd;
    c.reset(); if (army) c.spawnArmy();
    c.st.fill(ST.OFF); c.setWaves(true); c.waveT = 1000; c.step();
    assert(c.st.slice(0, c.grunts).some((s) => s !== ST.OFF), 'the reinforcement wave must actually spawn');
    assert.equal(c.st.slice(c.grunts, c.N).some((s) => s !== ST.OFF), army, `${mode}: officer revival needs armyOn`);
  } finally { f.off(); }
}
console.log('PASS actual waves revive officers only for armyOn');

for (const C of TRIALS) {
  assert(C.CH.rank.s, `${C.CH.id}: S needs explicit trial limits`);
  for (const gate of ['pass', 'damage', C.CH.rank.s.time ? 'time' : 'kos', 'easy']) {
    const f = fixture(C, gate === 'easy' ? DIFFS[0] : DIFFS[1]), s = C.CH.rank.s;
    try {
      const dmg = f.game.hero.hpMax * (gate === 'damage' ? s.dmg + 0.01 : s.dmg);
      emit('hero:hurt', { dmg });
      if (C.CH.id === 'hold') f.game.hero.kos = gate === 'kos' ? s.kos - 1 : s.kos;
      const winAt = s.time ? (s.time + (gate === 'time' ? 1 : 0)) * 60 : undefined;
      const end = ({ slay, hold, gauntlet })[C.CH.id](f, winAt);
      assert.equal(end.stats.rank, gate === 'pass' ? 'S' : 'A', `${C.CH.id}: S ${gate} boundary`);
    } finally { f.off(); }
  }
}
console.log('PASS trial S requires its clear-time/KO gate and its damage cap; Easy caps at A');
