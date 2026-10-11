import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("multiplayer page keeps the canonical arena HUD and minimap", async () => {
  const [html, client] = await Promise.all([
    source("frontend/multiplayer.html"),
    source("frontend/js/multiplayer.js")
  ]);

  assert.match(html, /id="multiplayerMiniCanvas"/);
  assert.match(client, /function drawMinimap\(snapshot\)/);
  assert.match(client, /snapshot\.safeZone/);
  assert.match(client, /snapshot\.controlPoints/);
  assert.match(client, /snapshot\.groups/);
  assert.match(client, /drawMinimap\(snapshot\)/);
});

test("multiplayer renderer accepts canonical colors, cosmetics and mode objectives", async () => {
  const client = await source("frontend/js/multiplayer.js");

  assert.match(client, /typeof food\.color === "number"/);
  assert.match(client, /: food\.color \|\| FOOD_COLORS\[0\]/);
  assert.match(client, /drawCosmeticTrail\(group/);
  assert.match(client, /drawCosmeticHalo\(group/);
  assert.match(client, /drawCosmeticSkin\(group/);
  assert.match(client, /objective\.activeEvent/);
  assert.match(client, /objective\.bossesAlive/);
  assert.match(client, /objective\.domination/);
});
