import test from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_MODES,
  MODE_KEYS,
  MULTIPLAYER_MODES,
  automaticBotCountForMode,
  getModeConfig,
  normalizeBotCountForMode,
  normalizeMode,
  publicModeCatalog
} from "../backend/multiplayer/modes.mjs";

const EXPECTED_MODES = ["solo", "team", "survival", "battle", "blitz", "spore", "screen", "control", "giant", "demon"];
const EXPECTED_TARGETS = {
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
};

test("all ten LAN modes are registered in stable order", () => {
  assert.deepEqual(MODE_KEYS, EXPECTED_MODES);
  assert.deepEqual(Object.keys(MULTIPLAYER_MODES), EXPECTED_MODES);
  for (const key of MODE_KEYS) {
    const mode = getModeConfig(key);
    assert.equal(mode.key, key);
    assert.ok(mode.label);
    assert.ok(mode.description);
    assert.ok(Number.isFinite(mode.durationSeconds));
    assert.ok(mode.recommendedParticipants >= mode.minimumHumans);
    assert.equal(mode.label, CANONICAL_MODES[key].label);
    assert.equal(mode.startMass, CANONICAL_MODES[key].playerStartMass);
    assert.equal(mode.durationSeconds, CANONICAL_MODES[key].duration);
    assert.equal(mode.targetParticipants, EXPECTED_TARGETS[key]);
  }
});

test("mode lookup normalizes trusted input and falls back to solo", () => {
  assert.equal(normalizeMode(" SCREEN "), "screen");
  assert.equal(normalizeMode("not-a-mode"), "solo");
  assert.equal(getModeConfig("CONTROL"), MULTIPLAYER_MODES.control);
});

test("mode configs and the public catalog are deeply immutable", () => {
  const battle = getModeConfig("battle");
  assert.ok(Object.isFrozen(battle));
  assert.ok(Object.isFrozen(battle.safeZone));
  assert.throws(() => { battle.safeZone.static = true; }, TypeError);

  const catalog = publicModeCatalog();
  assert.equal(catalog.length, 10);
  assert.ok(catalog.every(mode => mode.parity === "single-source-runtime"));
  assert.ok(catalog.every(mode => mode.execution === "frontend/js/game.js"));
  assert.ok(catalog.every(mode => mode.sharedRules.includes("movement")));
  assert.ok(catalog.every(mode => mode.sharedRules.includes("mode-catalog")));
  assert.ok(Object.isFrozen(catalog));
  assert.ok(Object.isFrozen(catalog[0]));
  assert.deepEqual(catalog.map(mode => mode.key), EXPECTED_MODES);
});

test("mode bot constraints support canonical populations and automatic fill", () => {
  assert.equal(normalizeBotCountForMode("solo", -3), 0);
  assert.equal(normalizeBotCountForMode("solo", 999), 99);
  assert.equal(normalizeBotCountForMode("demon", 0), 4);
  assert.equal(automaticBotCountForMode("solo", 4), 96);
  assert.equal(automaticBotCountForMode("team", 8), 32);
  assert.equal(automaticBotCountForMode("control", 4), 24);
  assert.equal(automaticBotCountForMode("demon", 2), 8);
  assert.equal(automaticBotCountForMode("demon", 8), 4);
  assert.equal(getModeConfig("demon").demon.minimumBots, 4);
});
