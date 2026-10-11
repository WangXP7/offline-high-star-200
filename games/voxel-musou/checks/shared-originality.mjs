// Run: node checks/shared-originality.mjs. Model geometry, render commands and fixed-frame Musou scheduling.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(id, context, next) {
  return next(id === 'three' ? new URL('../vendor/three/three.module.js', import.meta.url).href : id, context);
} });
const THREE = await import('three');
const { hand, glove, bareArm, bracer, boot } = await import('../src/chars/parts.js');
const { vox } = await import('../src/hero/model.js');
const { collect, on, emit } = await import('../src/core/events.js');
const { createScriptedMusou } = await import('../src/musou/scripted.js');
const { createKitView } = await import('../src/chars/kitview.js');
const { loadMap } = await import('../src/world/map.js');

for (const boxes of [hand(1, 0xcc9966, 0x664422), hand(-1, 0xcc9966, 0x664422), glove(1, 0x442211, 0xaa8866),
  bareArm({ skin: 0xcc9966, skinD: 0x664422, skinH: 0xeebb88 }, [0x887744, 0x554422, 0xddcc99]),
  bracer(0xcc9966, [0x667788, 0x223344, 0x99aabb]), boot(0x332211, 0x110a00, 0x111111),
  boot(0x332211, 0x110a00, 0x111111, { curl: true, trim: 0xddaa55 })]) {
  const geometry = vox(boxes, 0.0125);
  assert.ok(geometry.attributes.position.count > 0);
  assert.ok(geometry.attributes.position.array.every(Number.isFinite)); geometry.dispose();
}

const hero = { x: 0, z: 0, y: 0, yaw: 0, state: 'idle', musou: 100, musouMax: 100 }, strikes = [], effects = [];
const game = { hero, frame: 0, cam: { yaw: 0 }, crowd: { N: 0 }, combat: { strike(hit, ...args) { strikes.push({ hit, args }); return 1; } } };
const own = { marker: 'scheduled', shape: 'circle', range: 2, dmg: 10 };
const script = { seq: [[100, 176, 'n1', 0, 1]], fin: ['n1', 0, 1], travel: [[100, 112, 6]], turn: [[112, 90]],
  hits: [[101, own, 0, 5, 121]], fx: [[103, 'aura', 5, 0]] };
const [mu, off] = collect(() => { on('musou:fx', (e) => effects.push(e)); return createScriptedMusou(game, script); });
game.musou = mu; mu.start({ mx: 0, my: 0 });
for (let f = 1; f <= 200; f++) { game.frame = f; mu.stepHero({ mx: 0, my: 0 }); }
assert.equal(strikes.filter((s) => s.hit.marker === 'scheduled').length, 5);
assert.equal(effects.filter((e) => e.kind === 'aura').length, 1);
assert.ok(Math.abs(hero.z - 6) < 1e-6 && Math.abs(hero.x) < 1e-6);
assert.ok(Math.abs(hero.yaw - Math.PI / 2) < 1e-6);
assert.equal(hero.state, 'idle'); assert.equal(mu.active, false); off();

loadMap({ id: 'flat', grid: [-20, -20, 20, 20], pieces: [{ rect: [-20, -20, 20, 20], h: 0 }], route: [[0, -20], [0, 20]], zones: [], spawn: {} });
const calls = [], fx = new Proxy({}, { get: (_, kind) => (...args) => calls.push({ kind, args }) });
const h = { x: 0, z: 0, y: 0, state: 'idle', kit: { moves: { rain: { hits: [{ rain: 5, range: 6 }] } } } };
const scene = new THREE.Group(), sim = { hero: h, frame: 0, vfx: { fx }, musou: { waves: [] } };
const [view, remove] = collect(() => createKitView(scene, sim, new THREE.PerspectiveCamera(),
  { sig: { roar: [1, 0.5, 0.2], core: [1, 1, 1], wave: [0.3, 1, 0.7], beam: [0.3, 0.6, 1], charge: [1, 0.7, 0.3] }, blade: 1 }));
emit('attack:swing', { move: 'rain', win: 0, yaw: 0 });
const columns = calls.filter((c) => c.kind === 'columns'); assert.equal(columns.length, 5);
assert.equal(new Set(columns.map((c) => c.args[1])).size, 2, 'rain occupies two staggered ranks');
for (const kind of ['slam', 'rocks', 'rain', 'aura']) emit('musou:fx', { kind, x: 0, z: 0, r: 5, yaw: 0 });
for (const c of calls) assert.ok(c.args.flat().every((v) => typeof v !== 'number' || Number.isFinite(v)));
scene.traverse((o) => { if (o.geometry) assert.ok(o.geometry.attributes.position.array.every(Number.isFinite)); });
remove(); view.dispose();
console.log('Shared geometry, staggered effects and compiled Musou travel/turn/repeat/effect scheduling — passed');
