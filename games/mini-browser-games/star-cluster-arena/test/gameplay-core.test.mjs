import assert from "node:assert/strict";
import test from "node:test";
import "../frontend/js/gameplay-core.js";
import { AuthoritativeSimulation, SIMULATION_CONSTANTS } from "../backend/multiplayer/simulation-v2.mjs";

const core = globalThis.ScaGameplayCore;

function close(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} differs from ${expected}`);
}

test("shared movement keeps the original size and cursor-distance speed curve", () => {
  const target = { x: 1000, y: 0 };
  const small = core.movementStep({ x: 0, y: 0, vx: 0, vy: 0, radius: 20 }, target, 1 / 60);
  const large = core.movementStep({ x: 0, y: 0, vx: 0, vy: 0, radius: 100 }, target, 1 / 60);
  const near = core.movementStep({ x: 0, y: 0, vx: 0, vy: 0, radius: 20 }, { x: 10, y: 0 }, 1 / 60);

  assert.ok(small.baseSpeed > large.baseSpeed, "smaller cells must move faster than larger cells");
  assert.ok(near.distanceScale < small.distanceScale, "cells must slow down near the mouse target");
  close(small.distanceScale, 1);
});

test("each split cell resolves the same world target from its own position", () => {
  const target = { x: 400, y: 300 };
  const left = core.directionToTarget({ x: 100, y: 300 }, target);
  const upper = core.directionToTarget({ x: 400, y: 100 }, target);

  close(left.x, 1);
  close(left.y, 0);
  close(upper.x, 0);
  close(upper.y, 1);
  assert.notDeepEqual({ x: left.x, y: left.y }, { x: upper.x, y: upper.y });
});

test("split threshold and impulse are shared constants", () => {
  assert.equal(core.MOVEMENT.splitMinimumMass, 32);
  assert.equal(core.MOVEMENT.ejectMinimumMass, 30);
  const launch = core.splitVelocity({ x: 0, y: 0, vx: 4, vy: -2 }, { x: 100, y: 0 });
  close(launch.vx, 4 + core.MOVEMENT.splitImpulse);
  close(launch.vy, -2);
});

test("single, authoritative server and predictor share the 7600 world size", () => {
  assert.equal(core.WORLD_RULES.size, 7600);
  assert.equal(SIMULATION_CONSTANTS.WORLD_SIZE, core.WORLD_RULES.size);
});

test("single and authoritative sessions share bounded food pacing", () => {
  const config = { foodTargetScale: 1.06, foodRateScale: 1.08 };
  assert.equal(core.foodTargetCount({ config, elapsedSeconds: 60, phase: 1 }), 2493);
  close(core.foodSpawnRate({ config, elapsedSeconds: 60, phase: 1 }), 57.672);

  let bank = 0;
  let generated = 0;
  for (let tick = 0; tick < 60 * 30; tick += 1) {
    const spawn = core.advanceFoodSpawnBank({
      bank,
      dt: 1 / 30,
      rate: core.foodSpawnRate({ config, elapsedSeconds: tick / 30, phase: 1 }),
      shortage: 100_000
    });
    bank = spawn.bank;
    generated += spawn.count;
  }
  assert.ok(generated > 2_000 && generated < 3_500, `unexpected one-minute food production: ${generated}`);
  assert.ok(bank >= 0 && bank < 1);
});

test("authoritative food loss is replenished by time budget instead of instant refill", () => {
  const simulation = new AuthoritativeSimulation({
    players: [{ id: "player-a", name: "甲" }],
    botCount: 0,
    seed: 7788,
    now: 30_000,
    mode: "solo"
  });
  const target = simulation.foods.length;
  for (const food of [...simulation.foods].slice(0, 1_000)) simulation.removeFood(food, { track: false });
  assert.equal(simulation.foods.length, target - 1_000);

  simulation.step(30_000 + SIMULATION_CONSTANTS.STEP_SECONDS * 1_000);
  assert.ok(simulation.foods.length <= target - 998, "one server tick must not refill the whole food deficit");
  assert.ok(simulation.foodSpawnBank >= 0 && simulation.foodSpawnBank < 1);
});

test("a full field preserves only the bounded unused spawn budget", () => {
  const full = core.advanceFoodSpawnBank({ bank: 7.5, dt: 1 / 30, rate: 220, shortage: 0 });
  assert.deepEqual(full, { count: 0, bank: 7.5 });
  const bounded = core.advanceFoodSpawnBank({ bank: 999, dt: 1 / 30, rate: 220, shortage: 0 });
  assert.deepEqual(bounded, { count: 0, bank: core.FOOD_RULES.maximumSpawnBank });
});

test("virus split, spore burst and pickup plans are shared canonical rules", () => {
  const humanSplit = core.virusSplitPlan({
    cellMass: 1_000,
    virusMass: 95,
    big: false,
    player: true,
    available: 16
  });
  const botSplit = core.virusSplitPlan({
    cellMass: 1_000,
    virusMass: 95,
    big: false,
    player: false,
    available: 16
  });
  assert.equal(humanSplit.totalMass, 1_000 + 95 * 1.08);
  assert.equal(humanSplit.pieces, 6);
  assert.equal(botSplit.pieces, 7);

  const burst = core.sporeBurstPlan({
    cellMass: 1_000,
    lossMinimum: 0.5,
    lossMaximum: 0.5,
    minimumPieces: 18,
    maximumPieces: 30,
    pieceMass: 18
  });
  assert.equal(burst.loss, 500);
  assert.equal(burst.pieces, 27);
  assert.ok(Math.abs(burst.pieceMass * burst.pieces - burst.loss) < 1e-9);

  const contact = {
    sameOwner: true,
    playerOwned: true,
    cellRadius: 80,
    itemRadius: 14,
    distanceSquared: (80 + 14 * 0.4) ** 2
  };
  assert.equal(core.canCollectEjected({ ...contact, ageSeconds: 0.3 }), false);
  assert.equal(core.canCollectEjected({ ...contact, ageSeconds: 0.35 }), true);
});

test("single and authoritative sessions share ejected virus feeding and launch rules", () => {
  const virus = { x: 500, y: 500, radius: 42, mass: 95, baseMass: 95, kind: "small" };
  const ejected = { x: 450, y: 500, radius: 14, mass: 150 };
  assert.equal(core.ejectedHitsVirus(ejected, virus), true);

  const feed = core.virusFeedPlan({
    kind: virus.kind,
    currentMass: virus.mass,
    baseMass: virus.baseMass,
    ejectedMass: ejected.mass
  });
  assert.equal(feed.nextMass, 200);
  assert.equal(feed.shouldLaunch, true);

  const launch = core.virusLaunchPlan({ virus, seed: ejected, baseMass: feed.baseMass });
  assert.equal(launch.x, 580);
  assert.equal(launch.y, 500);
  assert.equal(launch.vx, core.VIRUS_FEED.smallLaunchSpeed);
  assert.equal(launch.mass, 95);
  assert.equal(launch.launched, true);

  const simulation = new AuthoritativeSimulation({
    players: [{ id: "player-a", name: "甲" }],
    botCount: 0,
    seed: 5566,
    now: 20_000,
    mode: "solo"
  });
  simulation.viruses.length = 0;
  simulation.virusAdded.clear();
  simulation.virusUpdated.clear();
  simulation.virusRemoved.clear();
  simulation.virusRevision = 1;
  simulation.virusDeltaFromRevision = 1;
  simulation.spawnVirus({
    track: false,
    values: { id: "virus-fed", ...virus, x: 2_600, y: 2_600 }
  });
  for (const group of simulation.groups) {
    for (const cell of group.cells) {
      cell.x = 500;
      cell.y = 500;
    }
  }
  simulation.ejected.push({
    id: "ejected-feed",
    ownerId: "player-a",
    x: 2_550,
    y: 2_600,
    vx: 0,
    vy: 0,
    mass: 150,
    radius: 14,
    ageTicks: 20,
    color: "#ffffff",
    spore: "mint",
    accent: "#ffffff"
  });

  simulation.step(20_000 + SIMULATION_CONSTANTS.STEP_SECONDS * 1000);
  assert.equal(simulation.ejected.length, 0);
  assert.equal(simulation.viruses.length, 2);
  const launched = simulation.viruses.find(item => item.id !== "virus-fed");
  assert.ok(launched?.launched);
  assert.ok(launched.x > 2_680, "launched virus should move during the authoritative tick");
  const firstDelta = simulation.snapshot({ foodMode: "delta" }).virusDelta;
  assert.equal(firstDelta.added.length, 1);

  simulation.clearFoodDelta();
  const beforeX = launched.x;
  simulation.step(20_000 + SIMULATION_CONSTANTS.STEP_SECONDS * 2_000);
  assert.ok(launched.x > beforeX);
  const motionDelta = simulation.snapshot({ foodMode: "delta" }).virusDelta;
  assert.equal(motionDelta.updated.some(item => item.id === launched.id), true);
});

test("authoritative server movement is the shared movement result", () => {
  const simulation = new AuthoritativeSimulation({
    players: [{ id: "player-a", name: "甲" }],
    botCount: 0,
    seed: 1122,
    now: 10_000,
    mode: "solo"
  });
  const group = simulation.groups[0];
  const before = { ...group.cells[0] };
  const target = { x: before.x + 600, y: before.y + 240 };
  const expected = core.movementStep(before, target, SIMULATION_CONSTANTS.STEP_SECONDS, {
    speedScale: simulation.config.speedScale || 1,
    steerRate: core.MOVEMENT.playerSteerRate
  });

  simulation.setInput(group.id, {
    seq: 1,
    dx: 1,
    dy: 0,
    targetX: target.x,
    targetY: target.y,
    split: false,
    eject: false
  });
  simulation.step(10_000 + SIMULATION_CONSTANTS.STEP_SECONDS * 1000);

  close(group.cells[0].x, expected.x);
  close(group.cells[0].y, expected.y);
  close(group.cells[0].vx, expected.vx);
  close(group.cells[0].vy, expected.vy);
});

test("render cadence caps a 160 Hz display near the 120 FPS budget", () => {
  const displayInterval = 1000 / 160;
  const renderInterval = 1000 / 120;
  let nextRenderAt = 0;
  let rendered = 0;
  let skipped = 0;

  for (let frame = 0; frame < 1600; frame += 1) {
    const cadence = core.advanceRenderCadence(frame * displayInterval, nextRenderAt, renderInterval);
    nextRenderAt = cadence.nextRenderAt;
    if (cadence.due) rendered += 1;
    else skipped += 1;
  }

  assert.ok(rendered >= 1190 && rendered <= 1201, `unexpected render count ${rendered}`);
  assert.ok(skipped >= 399, `expected capped frames, saw ${skipped}`);
});

test("render budgets preserve configured high refresh rates up to the supported ceiling", () => {
  assert.equal(core.renderBudgetFor(60), 60);
  assert.equal(core.renderBudgetFor(160), 160);
  assert.equal(core.renderBudgetFor(240), 240);
  assert.equal(core.renderBudgetFor(360), 240);
});

test("GPU background resolution preserves discrete detail and lowers integrated fill rate", () => {
  assert.equal(core.gpuPixelRatioCeiling("ANGLE (NVIDIA, NVIDIA GeForce RTX 5070 Ti)"), 0.9);
  assert.equal(core.gpuPixelRatioCeiling("ANGLE (AMD, AMD Radeon RX 9070 XT)"), 0.9);
  assert.equal(core.gpuPixelRatioCeiling("ANGLE (Intel, Intel Arc A770)"), 0.9);
  assert.equal(core.gpuPixelRatioCeiling("ANGLE (AMD, AMD Radeon(TM) Graphics)"), 0.75);
  assert.equal(core.gpuPixelRatioCeiling("ANGLE (Intel, Intel UHD Graphics)"), 0.75);
});
