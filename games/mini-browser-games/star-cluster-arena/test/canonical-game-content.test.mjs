import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import "../frontend/js/canonical-game-content.js";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const content = globalThis.ScaCanonicalGameContent;

test("single-player canonical events and demon templates have one immutable source", async () => {
  assert.equal(content.schemaVersion, 1);
  assert.equal(content.MATCH_EVENTS.length, 23);
  assert.equal(new Set(content.MATCH_EVENTS.map(event => event.key)).size, 23);
  assert.equal(content.DEMON_TEMPLATES.length, 6);
  assert.equal(new Set(content.DEMON_TEMPLATES.map(template => template.skill)).size, 6);
  assert.equal(Object.isFrozen(content), true);
  assert.equal(Object.isFrozen(content.MATCH_EVENTS), true);
  assert.equal(Object.isFrozen(content.DEMON_TEMPLATES), true);

  const gameSource = await readFile(join(projectRoot, "frontend/js/game.js"), "utf8");
  assert.match(gameSource, /canonicalContent\.MATCH_EVENTS/);
  assert.match(gameSource, /canonicalContent\.DEMON_TEMPLATES/);
  assert.doesNotMatch(gameSource, /const MATCH_EVENTS\s*=\s*\[/);
  assert.doesNotMatch(gameSource, /const DEMON_TEMPLATES\s*=\s*\[/);
});

test("mode-defining event values preserve the accepted single-player baseline", () => {
  const byKey = Object.fromEntries(content.MATCH_EVENTS.map(event => [event.key, event]));
  assert.equal(byKey.rush.speedMult, 1.16);
  assert.equal(byKey.neonrush.speedMult, 1.22);
  assert.equal(byKey.screenburst.quickMergeCooldownMult, 0.55);
  assert.equal(byKey.sporethorn.sporeVirusBurst, 8);
  assert.equal(byKey.coretide.foodBurst, 90);

  const titan = content.DEMON_TEMPLATES.find(template => template.skill === "titan");
  assert.equal(titan.mass, 36000);
});
