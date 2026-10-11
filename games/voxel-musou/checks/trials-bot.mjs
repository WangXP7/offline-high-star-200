// Run: node checks/trials-bot.mjs [trial] [hero] [difficulty] [seed]
// Balance probe: the real 60 Hz hero/combat/crowd/actors/pickups/musou/director. Inputs only; no forced movement,
// KOs, HP, invulnerability or damage modifiers. Chase foes / guard the bridge, mash N1→N3→C4 (bow: N1→N5→C6),
// and spend a ready Musou while foes are near. Guard six metres ahead of the bridge point; turn through attack
// input. --dodge adds telegraph-driven boss rolls; --air adds jump/air strings for a separate skilled probe.
// No renderer/camera shake.
// One JSON record per run (seed, inputs policy, stage thresholds, end stats, damage and event timeline).
// --baseline restores the submitted estimates in memory, so before/after use identical input policy and director.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(id, context, next) {
  return id === 'three' ? { url: new URL('../vendor/three/three.module.js', import.meta.url).href, shortCircuit: true } : next(id, context);
} });
const [world, { MAPS }, { TRIALS }, { CHARS }, { createHero }, { createCrowd, ST }, { createActors }, { createPickups },
  { createCombat }, { createStory }, { armyPair }, { DIFFS }, { rng }, { collect, on }] = await Promise.all([
  import('../src/world/map.js'), import('../src/world/maps/index.js'), import('../src/story/trials.js'), import('../src/chars/index.js'),
  import('../src/hero/hero.js'), import('../src/crowd/crowd.js'), import('../src/actors/actors.js'), import('../src/actors/pickups.js'),
  import('../src/combat/combat.js'), import('../src/story/index.js'), import('../src/crowd/armies.js'), import('../src/core/difficulty.js'),
  import('../src/core/rng.js'), import('../src/core/events.js'),
]);

function run(C, char, diff, seed) {
  if (process.argv.includes('--baseline')) {
    if (C.CH.id === 'slay') { C.CH.rank = { kos: [1000, 1000, 1000], time: [210, 270, 360] }; C.BEATS[0].obj.timer = 480; }
    if (C.CH.id === 'hold') { C.CH.rank = { kos: [400, 650, 900], time: [999, 999, 999] }; C.BEATS[0].obj.timer = 240; C.BEATS[0].defend.hp = 600; }
    if (C.CH.id === 'gauntlet') {
      C.CH.rank = { kos: [0, 0, 0], time: [300, 420, 540] };
      for (const [i, hp] of [2400, 2600, 3000, 4400].entries()) {
        const a = Object.values(C.BEATS[i].actors)[0]; a.hp = hp;
        if (i === 3) a.poise = 460; else delete a.poise;
        if (i) C.BEATS[i].heal = 0.25;
      }
    }
  }
  world.loadMap(MAPS[C.CH.map]); rng.seed(seed);
  const start = { ...world.spawnPoint('trial'), ...C.CH.start };
  const game = { mode: 'trial', frame: 0, freeze: 0, hitstop: 0, cam: { yaw: start.yaw }, diff, army: armyPair(C.CH.army) };
  let end = null, damage = 0, lowestHP = 400, lowestDefend = 1, musous = 0, heals = 0, dodges = 0;
  const timeline = [], snapshots = [];
  const [, off] = collect(() => {
    game.hero = createHero(game); game.hero.reset({ ...start, char: CHARS[char] });
    game.crowd = createCrowd(game, 300); game.crowd.reset();
    game.actors = createActors(game); game.combat = createCombat(game); game.combat.reset();
    game.pickups = createPickups(game); game.pickups.reset();
    game.musou = game.hero.kit.createMusou(game); game.musou.reset();
    game.story = createStory(game); game.story.reset({ mode: 'trial', char, ch: C.CH.id });
    on('story:end', (e) => { end = e; });
    on('hero:hurt', (e) => { damage += e.dmg; });
    on('musou:start', () => { musous++; });
    on('pickup', (e) => { heals += e.heal; });
    on('dodge', () => { dodges++; });
    for (const event of ['story:objective', 'story:banner', 'actor:spawn', 'actor:down']) on(event, (e) => {
      timeline.push({ frame: game.frame, event, ...e });
    });
  });
  try {
    for (let i = 0; i < 15 * 60 * 60 && !end; i++) {
      const h = game.hero, c = game.crowd, s = game.story, ranged = char === 'huangzhong';
      let target = null, nearest = Infinity;
      for (let j = 0; j < c.N; j++) if (c.st[j] !== ST.OFF && c.st[j] !== ST.DEAD && c.hp[j] > 0 && c.y[j] < 2.4) {
        const d = Math.hypot(c.x[j] - h.x, c.z[j] - h.z);
        if (d < nearest) { nearest = d; target = { x: c.x[j], z: c.z[j] }; }
      }
      const boss = game.actors.nearestFoe(h.x, h.z, 200);
      if (boss) { target = boss; nearest = Math.hypot(boss.x - h.x, boss.z - h.z); }
      const guard = s.defend && { x: s.defend.x, z: s.defend.z + 6 };
      let dest = guard || target, dx = dest ? dest.x - h.x : 0, dz = dest ? dest.z - h.z : 0;
      const dist = Math.hypot(dx, dz), range = ranged ? 11 : 3;
      if (dist > (guard ? 2 : range)) { dx /= dist; dz /= dist; }
      else dx = dz = 0;
      if (target) game.cam.yaw = Math.atan2(target.x - h.x, target.z - h.z);
      const press = nearest < (ranged ? 18 : 5) && (!guard || dist < 4.5) && game.frame % 5 === 0;
      if (target && (!guard || dist < 4.5) && (press || h.move)) {
        const l = Math.hypot(target.x - h.x, target.z - h.z) || 1;
        dx = (target.x - h.x) / l; dz = (target.z - h.z) / l;
      }
      const a = boss?.atk, evading = process.argv.includes('--dodge') && a && h.state !== 'musou' &&
        a.t > (a.A.shape === 'leap' ? a.w + a.a - 18 : a.w - 18) && a.t <= a.w + a.a;
      const dodge = evading && game.frame % 4 === 0;
      if (evading) {
        if (a.A.shape === 'lane') { dx = Math.cos(a.yaw); dz = -Math.sin(a.yaw); }
        else { const l = Math.hypot(h.x - boss.x, h.z - boss.z) || 1; dx = (h.x - boss.x) / l; dz = (h.z - boss.z) / l; }
      }
      const mx = -Math.cos(game.cam.yaw) * dx + Math.sin(game.cam.yaw) * dz;
      const my = Math.sin(game.cam.yaw) * dx + Math.cos(game.cam.yaw) * dz;
      const branch = ranged ? 'n5' : 'n3';
      const jump = process.argv.includes('--air') && nearest < 18 && h.grounded && !h.move && h.state !== 'musou' && h.state !== 'dodge';
      h.step({ mx, my, held: {}, pressed: { jump, dodge, attack: press && !evading && !jump && h.move !== branch, charge: press && !evading && !jump && h.move === branch,
        musou: nearest < 13 && game.frame % 5 === 0 && game.musou.ready() } });
      game.combat.step(); c.step(); game.actors.step(); game.pickups.step(); game.musou.step(); s.step(); game.frame++;
      lowestHP = Math.min(lowestHP, h.hp);
      if (s.defend) lowestDefend = Math.min(lowestDefend, s.defend.f);
      if (game.frame % (30 * 60) === 0) snapshots.push({ seconds: game.frame / 60, kos: h.kos, hp: h.hp,
        at: [h.x, h.z].map((v) => +v.toFixed(2)), defend: s.defend?.f ?? null, boss: boss && { key: boss.key, hp: boss.hp } });
    }
    const result = { trial: C.CH.id, hero: char, difficulty: diff.id, seed, baseline: process.argv.includes('--baseline'), assist: 'none; inputs only',
      strategy: `${char === 'huangzhong' ? 'N1-N5-C6, 11m bow range' : 'N1-N3-C4, 3m melee range'}; ready Musou; bridge north guard; ${process.argv.includes('--dodge') ? 'boss telegraph rolls' : 'no rolls'}; ${process.argv.includes('--air') ? 'jump/air strings' : 'ground strings'}`,
      data: { rank: C.CH.rank, timer: C.BEATS[0].obj?.timer ?? null, defendHp: C.BEATS[0].defend?.hp ?? null,
        bosses: C.BEATS.flatMap((b) => Object.entries(b.actors || {}).map(([key, a]) => ({ key, hp: a.hp, poise: a.poise ?? null }))), heal: C.BEATS.map((b) => b.heal ?? 0) },
      win: end?.win ?? null, seconds: +(game.frame / 60).toFixed(2), stats: end?.stats ?? game.story.stats(), damage,
      damageFraction: +(damage / game.hero.hpMax).toFixed(3), hp: game.hero.hp, lowestHP, lowestDefend: +lowestDefend.toFixed(3),
      musous, dodges, pickupHeal: heals, reason: end?.reason ?? null, timeline, snapshots };
    console.log(JSON.stringify(result));
    return result;
  } finally { off(); }
}

const results = [];
for (const C of TRIALS) if (!process.argv[2] || C.CH.id === process.argv[2]) {
  for (const char of process.argv[3] ? [process.argv[3]] : ['zhangfei', 'huangzhong']) {
    for (const diff of DIFFS.filter((d) => d.id === (process.argv[4] || 'normal'))) results.push(run(C, char, diff, +(process.argv[5] || 1)));
  }
}
assert(results.length, 'select a known trial and difficulty');
assert(results.every((r) => r.win === true), 'one or more bots lost/stalled; inspect JSON evidence');
