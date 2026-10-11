// Run: node src/chars/check.mjs (Node 22.15+; uses the vendored Three.js).
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const three = new URL('../../vendor/three/three.module.js', import.meta.url).href;
registerHooks({ resolve(s, c, next) { return s === 'three' ? { url: three, shortCircuit: true } : next(s, c); } });
const { CHARS } = await import('./index.js');
const { NPCS } = await import('./npc/index.js');
const { sampleClip, POSE_SIZE } = await import('../hero/rig.js');
const { collect, on, emit } = await import('../core/events.js');

for (const [id, who] of Object.entries({ ...CHARS, ...NPCS })) {
  const K = who.kit, pose = new Float32Array(POSE_SIZE), { face, pal } = who.portrait;
  assert.equal(face.length, 20, `${id}: portrait height`);
  for (const row of face) {
    assert.equal(row.length, 20, `${id}: portrait width`);
    for (const c of row) assert(c === '.' || pal[c], `${id}: palette ${c}`);
  }
  for (const [move, m] of Object.entries(K.moves)) {
    assert(K.clips[m.anim?.[0]?.[2] || move], `${id}: clip ${move}`);
    for (const hit of m.hits) assert(hit.f[0] >= 0 && hit.f[0] <= hit.f[1] && hit.f[1] < m.frames, `${id}: ${move} hit window`);
    for (const next of [m.next, m.charge].filter(Boolean)) assert(K.moves[next], `${id}: ${move} → ${next}`);
  }
  for (const [idClip, c] of Object.entries(K.clips)) for (let f = 0; f <= 120; f++) {
    sampleClip(c, f / 120, pose);
    assert(pose.every(Number.isFinite), `${id}: ${idClip} frame ${f}`);
  }
  console.log(`${id}: moves, sampled clips and 20×20 portrait OK`);
}

for (const id of ['liubei', 'guanyu', 'zhangfei', 'zhugeliang', 'lubu']) {
  const K = CHARS[id].kit;
  for (let n = 1; n <= 6; n++) assert(K.moves['n' + n] && K.moves['c' + n], `${id}: N${n}/C${n}`);
  const hero = { kit: K, x: 0, y: 0, z: 0, yaw: 0, state: 'idle', musou: 100, musouMax: 100, iframes: 0 };
  let strikes = 0, contact = 0, burst = 0, end = 0;
  const game = { hero, frame: 0, cam: { yaw: 0 }, crowd: { N: 0 }, combat: { strike() { strikes++; return 0; } }, hitstop: 0, freeze: 0 };
  const [, off] = collect(() => {
    on('musou:hit', (e) => { if (e.stage === 'contact') contact++; });
    on('musou:burst', () => burst++); on('musou:end', () => end++);
  });
  const mu = game.musou = K.createMusou(game), inp = { mx: 0, my: 0 };
  mu.start(inp);
  for (let f = 1; f <= 200; f++) {
    game.frame = f; mu.stepHero(inp);
    assert(K.clips[hero.musouClip], `${id}: Musou clip ${hero.musouClip}`);
    assert([hero.x, hero.z, hero.yaw, hero.musouT].every(Number.isFinite), `${id}: Musou frame ${f}`);
    if (id === 'zhangfei' && f === 176) {
      assert.equal(hero.musouClip, 'c5');
      assert(Math.abs(hero.musouT * K.moves.c5.frames - 66) < 1e-5, 'Zhang Fei payoff lands with C5');
    }
  }
  off();
  assert.equal(hero.state, 'idle', `${id}: control returns`);
  assert.equal(mu.active, false); assert.equal(contact, 1); assert.equal(burst, 1); assert.equal(end, 1);
  assert(strikes > 0, `${id}: Musou damage`);
  assert(Math.abs(hero.musou - 200 / 3) < 1e-6, `${id}: one gauge segment spent`);
  console.log(`${id}: 200-frame Musou, one contact/burst/end and gauge cost OK`);
}

// Render-event regression: Musou keeps its eight outer columns; C6 retains its full local detonation.
const { Group } = await import('three');
const { loadMap } = await import('../world/map.js');
const { MAPS } = await import('../world/maps/index.js');
const { createZhugeFx } = await import('./zhugeliang/fx.js');
loadMap(MAPS.chibi);
const calls = [], fx = Object.fromEntries(['ring', 'star', 'dustRing', 'columns', 'wall', 'rayBurst', 'lightFlash', 'flash'].map((kind) =>
  [kind, (...args) => calls.push({ kind, args })]));
const hero = { kit: CHARS.zhugeliang.kit, x: 0, y: 0, z: 0, moveSeq: 1 };
const [view, off] = collect(() => createZhugeFx(new Group(), { hero, vfx: { fx } }));
emit('musou:fx', { kind: 'bagua', x: 0, z: 0, r: 12, yaw: 0 }); calls.length = 0;
emit('musou:fx', { kind: 'baguaBurst' });
assert.equal(calls.filter((c) => c.kind === 'columns').length, 8);
assert(!calls.some((c) => c.kind === 'columns' && !c.args[0] && !c.args[1]), 'Musou centre stays clear');
assert(!calls.some((c) => c.kind === 'flash' || c.kind === 'lightFlash'), 'Musou payoff flash has one owner');
assert.equal(calls.find((c) => c.kind === 'star').args[3], 1.2);
emit('attack:swing', { move: 'c6', win: 0, yaw: 0 }); calls.length = 0;
emit('attack:swing', { move: 'c6', win: 1, yaw: 0 });
assert.equal(calls.filter((c) => c.kind === 'columns').length, 9);
assert.equal(calls.find((c) => c.kind === 'lightFlash').args[4], 55);
assert.equal(calls.find((c) => c.kind === 'flash').args[0], 0.14);
assert.equal(calls.find((c) => c.kind === 'star').args[3], 2.6);
off(); view.dispose();
console.log('zhugeliang: Musou centre clear, C6 columns and local flashes preserved OK');

// Zhang Fei: the grip stays on the shaft, and its centre line clears the actual torso voxels.
const T = await import('three'), { createRig } = await import('../hero/rig.js');
const zf = CHARS.zhangfei.kit, rig = createRig(zf), model = zf.model(rig), pose = new Float32Array(POSE_SIZE);
const torso = ['hips', 'spine', 'chest', 'neck', 'head'].map((id) => model.meshes[id]);
for (const [id, c] of Object.entries(zf.clips)) {
  if (id === 'dodge') continue; // The shared rolling rig has its own whole-body rotation.
  const frames = zf.moves[id]?.frames || 100;
  for (let f = 0; f <= frames; f++) {
    sampleClip(c, f / frames, pose);
    rig.root.scale.setScalar(1); rig.apply(pose, new T.Vector3(), 0, zf.moves[id]?.air ? 2 : 0);
    rig.root.scale.setScalar(zf.scale); rig.root.updateMatrixWorld(true);
    const origin = rig.joints.weapon.getWorldPosition(new T.Vector3());
    const direction = new T.Vector3(0, 0, 1).transformDirection(rig.joints.weapon.matrixWorld);
    for (const side of ['R', 'L']) {
      if (side === 'L' && pose[33] > 0.001) continue; // The free fist deliberately leaves the pole.
      const hand = rig.joints['hand' + side].getWorldPosition(new T.Vector3()).sub(origin);
      assert(hand.addScaledVector(direction, -hand.dot(direction)).length() < 0.004, `zhangfei: ${id} ${f} grip ${side}`);
    }
    const ray = new T.Raycaster(origin.clone().addScaledVector(direction, -zf.reach.butt * zf.scale), direction,
      0, (zf.reach.tip + zf.reach.butt) * zf.scale);
    assert.equal(ray.intersectObjects(torso, false).length, 0, `zhangfei: ${id} ${f} shaft through torso`);
  }
}
const punch = zf.moves.n4.hits[0], spin = zf.moves.c4.hits[0];
assert(punch.dir - punch.ang / 2 >= 0 && punch.range <= 1.6, 'N4 is a left-side close punch');
assert.equal(spin.sweep, 1); assert.equal(spin.dir, 92); assert(spin.range <= 3.6);
assert(zf.moves.n6.hits[1].rocks && zf.moves.c5.hits.every((hit) => hit.rocks));
assert(zf.moves.c6.hits.some((hit) => hit.roar) && zf.moves.c6.hits.some((hit) => hit.proj?.kind === 'roar'));
const { cadence, LOCO } = await import('../hero/locomotion.js');
const stepPhase = Math.PI * cadence(LOCO.runSpeed) / 60;
for (const K of Object.values(CHARS).map((c) => c.kit).filter((K) => K !== CHARS.zhaoyun.kit && K !== CHARS.huangzhong.kit)) {
  const scale = K.scale || 1.08;
  K.runPose(0, 1, pose); const foot = pose[17] * scale;
  K.runPose(stepPhase, 1, pose);
  assert(Math.abs(pose[17] * scale + LOCO.runSpeed / 60 - foot) < 1e-5, 'run stance uses world metres');
}
console.log('zhangfei: all authored frames grip/shaft, left punch, rotating sweep, rocks and roar OK');
