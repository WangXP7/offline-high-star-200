// Run: node checks/campaign-walk.mjs [chapter] [hero]
// Real fixed-step hero/crowd/combat/actors and route walking. QA assist: invulnerability and 20× damage; no forced KOs.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(id, context, next) {
  return id === 'three' ? { url: new URL('../vendor/three/three.module.js', import.meta.url).href, shortCircuit: true } : next(id, context);
} });
const [world, { MAPS }, { CHAPTERS }, { CHARS }, { createHero }, { createCrowd, ST }, { createActors },
  { createCombat }, { createStory }, { armyPair }, { DIFFS }, { rng }, { collect, on }] = await Promise.all([
  import('../src/world/map.js'), import('../src/world/maps/index.js'), import('../src/story/chapters.js'), import('../src/chars/index.js'),
  import('../src/hero/hero.js'), import('../src/crowd/crowd.js'), import('../src/actors/actors.js'), import('../src/combat/combat.js'),
  import('../src/story/index.js'), import('../src/crowd/armies.js'), import('../src/core/difficulty.js'), import('../src/core/rng.js'), import('../src/core/events.js'),
]);

function position([id, x, z]) {
  const a = world.anchor(id);
  if (a) return [a[0] + x, a[1] + z];
  const q = world.zone(id);
  assert(q, `unknown story position ${id}`);
  return [q.x + x * (q.r ?? q.w / 2), q.z + z * (q.r ?? q.d / 2)];
}

function walk(C, char) {
  world.loadMap(MAPS[C.CH.map]); rng.seed(1);
  const game = { mode: 'story', frame: 0, freeze: 0, hitstop: 0, cam: { yaw: 0 }, diff: DIFFS[1], army: armyPair(C.CH.army) };
  let end = null, objective = null, lastObjective = 0, furthest = -Infinity, pointLost = 1;
  const objectives = [], sets = [], snaps = [];
  for (const b of C.BEATS) if (!b.hero || b.hero.includes(char)) {
    for (const d of [...Object.values(b.officers || {}), ...Object.values(b.actors || {}), ...(b.squads || [])]) {
      const p = position(d.at), q = [...world.clampWalk(...p, -0.5)], shift = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (shift > 3) snaps.push({ at: d.at, meters: +shift.toFixed(2), to: q.map((v) => +v.toFixed(2)) });
    }
  }
  const [, off] = collect(() => {
    game.hero = createHero(game); game.hero.reset({ ...world.spawnPoint('story'), char: CHARS[char] });
    game.crowd = createCrowd(game, 300); game.crowd.reset();
    game.actors = createActors(game); const hurt = game.actors.hurt;
    game.actors.hurt = (a, dmg, heavy, musou) => hurt(a, dmg * 20, heavy, musou);
    game.combat = createCombat(game); game.combat.reset();
    game.musou = game.hero.kit.createMusou(game); game.musou.reset();
    game.story = createStory(game); game.story.reset({ mode: 'story', char, ch: C.CH.id });
    on('story:end', (e) => { end = e; });
    on('story:set', (e) => { sets.push(e.id); lastObjective = game.frame; });
    on('story:objective', (e) => { objective = e; objectives.push(e.zh); lastObjective = game.frame; });
  });
  try {
    for (let i = 0; i < 20 * 60 * 60 && !end; i++) {
      const h = game.hero, c = game.crowd, story = game.story;
      h.iframes = 2; h.atkK = 20;
      let fd = Infinity;
      for (let j = 0; j < c.N; j++) if (c.st[j] !== ST.OFF && c.st[j] !== ST.DEAD && c.hp[j] > 0) {
        const d = Math.hypot(c.x[j] - h.x, c.z[j] - h.z);
        if (d < fd) fd = d;
      }
      const a = game.actors.nearestFoe(h.x, h.z, 20);
      if (a) fd = Math.min(fd, Math.hypot(a.x - h.x, a.z - h.z));
      let dest = story.target;
      // Hold the defend point and fight nearby attackers; elsewhere, push beyond positional arrows into the next stage.
      if (story.defend) {
        const p = [...world.clampWalk(story.defend.x, story.defend.z, 0.5)];
        dest = { x: p[0], z: p[1] };
      }
      else if (dest && Math.hypot(dest.x - h.x, dest.z - h.z) < 4 && fd > 10) dest = { x: dest.x, z: dest.z + 14 };
      let dx = 0, dz = 0;
      if (dest) {
        const sh = world.routeS(h.x, h.z), sd = world.routeS(dest.x, dest.z), difference = sd - sh;
        const p = Math.abs(difference) > 18 ? [...world.routeAt(sh + Math.sign(difference) * Math.min(8, Math.abs(difference)))] : [dest.x, dest.z];
        dx = p[0] - h.x; dz = p[1] - h.z;
        const len = Math.hypot(dx, dz);
        if (len > (story.defend ? 3 : 1.8)) { dx /= len; dz /= len; }
        else dx = dz = 0;
      }
      const press = fd < 6 && game.frame % 5 === 0;
      game.hero.step({ mx: -dx, my: dz, pressed: { attack: press && h.move !== 'n3', charge: press && h.move === 'n3' } });
      game.combat.step(); game.crowd.step(); game.actors.step(); game.musou.step(); story.step(); game.frame++;
      furthest = Math.max(furthest, h.z);
      if (story.defend) pointLost = Math.min(pointLost, story.defend.f);
      if (game.frame - lastObjective > 180 * 60) break;
    }
    const result = { chapter: C.CH.id, hero: char, assist: 'invulnerable, 20x damage, actual route walking/combat', win: end?.win ?? null,
      seconds: +(game.frame / 60).toFixed(2), kos: game.hero.kos, objective: objective?.zh,
      at: [game.hero.x, game.hero.z].map((v) => +v.toFixed(2)), furthest: +furthest.toFixed(2), lowestDefend: +pointLost.toFixed(3), sets,
      objectives, largeSpawnSnaps: snaps, reason: end?.reason };
    console.log(JSON.stringify(result));
    return result;
  } finally { off(); }
}

const results = [];
for (const C of CHAPTERS) if (!process.argv[2] || C.CH.id === process.argv[2]) {
  for (const char of C.CH.heroes) if (!process.argv[3] || char === process.argv[3]) results.push(walk(C, char));
}
assert(results.length);
assert(results.every((r) => r.win === true), 'one or more routes stalled/lost; inspect the JSON evidence');
