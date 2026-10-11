import assert from "node:assert/strict";
import test from "node:test";

import { createCanonicalSingleRuntime } from "../backend/multiplayer/canonical-single-runtime.mjs";

const EXPECTED_PARTICIPANTS = Object.freeze({
  solo: 100,
  team: 40,
  survival: 64,
  battle: 100,
  blitz: 88,
  spore: 48,
  screen: 22,
  control: 28,
  giant: 36,
  demon: 10
});

function physicsDigest(snapshot) {
  return {
    mode: snapshot.mode,
    tick: snapshot.tick,
    safeZone: snapshot.safeZone,
    objective: {
      movementSpeedScale: snapshot.objective.movementSpeedScale,
      activeEvent: snapshot.objective.activeEvent
    },
    groups: snapshot.groups.map(group => ({
      team: group.team,
      role: group.role,
      dead: group.dead,
      lives: group.lives,
      kills: group.kills,
      mass: group.mass,
      cells: group.cells.map(cell => ({ x: cell.x, y: cell.y, vx: cell.vx, vy: cell.vy, mass: cell.mass }))
    })),
    foods: snapshot.foods.map(food => ({ x: food.x, y: food.y, radius: food.radius, mass: food.mass, rich: food.rich })),
    viruses: snapshot.viruses.map(virus => ({ x: virus.x, y: virus.y, radius: virus.radius, kind: virus.kind })),
    ejected: snapshot.ejected.map(item => ({ x: item.x, y: item.y, vx: item.vx, vy: item.vy, radius: item.radius }))
  };
}

test("headless network authority executes the exact single-player source at 60 Hz", async () => {
  const runtime = await createCanonicalSingleRuntime({ seed: 20260826 });
  assert.equal(runtime.source, "frontend/js/game.js");
  runtime.startMode("blitz");
  const snapshot = runtime.authorityStep(60);
  assert.equal(snapshot.mode, "blitz");
  assert.equal(snapshot.serverHz, 60);
  assert.equal(snapshot.tick, 60);
  assert.equal(snapshot.world.width, 7600);
  assert.equal(snapshot.groups.length, 88);
  assert.ok(snapshot.foods.length > 2000);
  assert.ok(snapshot.viruses.length > 0);
});

test("the exact single-player runtime instantiates every canonical mode population", async () => {
  const runtime = await createCanonicalSingleRuntime({ seed: 91 });
  for (const [mode, participants] of Object.entries(EXPECTED_PARTICIPANTS)) {
    runtime.startMode(mode);
    const snapshot = runtime.authoritySnapshot();
    assert.equal(snapshot.mode, mode);
    assert.equal(snapshot.groups.length, participants, mode);
  }
});

test("same seed and authority ticks reproduce identical single-player state", async () => {
  const first = await createCanonicalSingleRuntime({ seed: 73 });
  const second = await createCanonicalSingleRuntime({ seed: 73 });
  first.startMode("demon");
  second.startMode("demon");
  assert.deepEqual(first.authorityStep(120), second.authorityStep(120));
});

test("all ten authority modes preserve the exact first single-player physics tick", async () => {
  for (const [mode] of Object.entries(EXPECTED_PARTICIPANTS)) {
    const seed = 8000 + mode.length;
    const single = await createCanonicalSingleRuntime({ seed });
    const authority = await createCanonicalSingleRuntime({ seed });
    single.startMode(mode);
    authority.startAuthorityMode(mode, [{ id: "player-a", name: "玩家A", connected: true, cosmetics: {} }]);
    assert.deepEqual(physicsDigest(authority.authorityStep(1)), physicsDigest(single.authorityStep(1)), mode);
  }
});

test("demon bosses use the single-player virus collision instead of the legacy server exemption", async () => {
  const runtime = await createCanonicalSingleRuntime({ seed: 7 });
  runtime.startMode("demon");
  const collision = runtime.virusHitRole("boss", 720, "small");
  assert.equal(collision.role, "boss");
  assert.equal(collision.virusRemoved, true);
  assert.ok(collision.cells > 1);
  assert.ok(collision.afterMass > collision.beforeMass);
});

test("blitz uses the full single-player event values", async () => {
  const runtime = await createCanonicalSingleRuntime({ seed: 15 });
  runtime.startMode("blitz");
  runtime.triggerEvent("neonrush");
  const snapshot = runtime.authoritySnapshot();
  assert.equal(snapshot.objective.activeEvent.key, "neonrush");
  assert.equal(snapshot.objective.movementSpeedScale, 1.16 * 1.22);
});

test("network players call the original split, quick-merge and screen-skill functions", async () => {
  const runtime = await createCanonicalSingleRuntime({ seed: 2244 });
  runtime.startAuthorityMode("screen", [
    { id: "player-a", name: "玩家A", connected: true, cosmetics: { skin: "flare", spore: "spark", halo: "pulse-ring", trail: "arc" } },
    { id: "player-b", name: "玩家B", connected: true, cosmetics: {} }
  ]);
  let player = runtime.authoritySnapshot().groups.find(group => group.id === "player-a");
  runtime.setInput("player-a", { seq: 1, targetX: player.cells[0].x + 800, targetY: player.cells[0].y, split: true });
  player = runtime.authorityStep(1).groups.find(group => group.id === "player-a");
  assert.ok(player.cells.length > 1);
  assert.equal(player.cosmetics.skin, "flare");

  runtime.setInput("player-a", { seq: 2, targetX: player.cells[0].x + 800, targetY: player.cells[0].y, quickMerge: true });
  player = runtime.authorityStep(1).groups.find(group => group.id === "player-a");
  assert.equal(player.cells.length, 1);
  assert.ok(player.quickMergeCooldown > 6);

  runtime.setInput("player-a", { seq: 3, targetX: player.cells[0].x + 800, targetY: player.cells[0].y, special: true });
  player = runtime.authorityStep(1).groups.find(group => group.id === "player-a");
  assert.ok(player.specialCooldown > 7);
  assert.equal(player.ackInputSeq, 3);
});

test("all timed canonical modes can execute their original result UI in the headless server", async () => {
  for (const mode of ["solo", "team", "survival", "blitz", "spore", "screen", "control", "demon"]) {
    const runtime = await createCanonicalSingleRuntime({ seed: 100 + mode.length });
    runtime.startAuthorityMode(mode, [{ id: "player-a", name: "玩家A", connected: true, cosmetics: {} }]);
    const result = runtime.forceTimeEnd();
    assert.equal(result.snapshot.over, true, mode);
    assert.ok(result.title, mode);
  }
});
