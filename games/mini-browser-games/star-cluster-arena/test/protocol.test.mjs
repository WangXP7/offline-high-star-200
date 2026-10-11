import test from "node:test";
import assert from "node:assert/strict";
import {
  PROTOCOL_VERSION,
  ProtocolError,
  createRoomCode,
  normalizeRoomCode,
  parseClientMessage,
  sanitizeName
} from "../backend/multiplayer/protocol.mjs";

test("room codes avoid ambiguous characters and normalize input", () => {
  for (let index = 0; index < 100; index += 1) {
    const code = createRoomCode();
    assert.match(code, /^[A-HJ-NP-Z2-9]{6}$/);
  }
  assert.equal(normalizeRoomCode(" ab-c12! "), "ABC12");
});

test("player names are printable, compact and bounded", () => {
  assert.equal(sanitizeName("  星\u0000  团   玩家  "), "星 团 玩家");
  assert.equal(sanitizeName(""), "星友");
  assert.equal(sanitizeName("一".repeat(30)).length, 16);
});

test("client input is finite, normalized and typed", () => {
  const message = parseClientMessage(JSON.stringify({
    type: "input",
    seq: 7,
    dx: 2,
    dy: 2,
    targetX: 3812.5,
    targetY: 1960.25,
    split: 1,
    eject: 0,
    quickMerge: 1,
    special: true
  }));
  assert.equal(message.type, "input");
  assert.equal(message.seq, 7);
  assert.ok(Math.abs(Math.hypot(message.dx, message.dy) - 1) < 1e-9);
  assert.equal(message.targetX, 3812.5);
  assert.equal(message.targetY, 1960.25);
  assert.equal(message.split, true);
  assert.equal(message.eject, false);
  assert.equal(message.quickMerge, true);
  assert.equal(message.special, true);
});

test("world targets reject non-finite values and bound extreme coordinates", () => {
  const invalid = parseClientMessage(JSON.stringify({ type: "input", seq: 1, targetX: "nope", targetY: null }));
  assert.equal(invalid.targetX, null);
  assert.equal(invalid.targetY, null);

  const bounded = parseClientMessage(JSON.stringify({ type: "input", seq: 2, targetX: 9e9, targetY: -9e9 }));
  assert.equal(bounded.targetX, 100_000);
  assert.equal(bounded.targetY, -100_000);
});

test("host settings messages normalize supported room options", () => {
  assert.deepEqual(parseClientMessage(JSON.stringify({
    type: "update-settings",
    mode: " SCREEN ",
    botCount: 99
  })), {
    type: "update-settings",
    mode: "screen"
  });
  assert.throws(
    () => parseClientMessage(JSON.stringify({ type: "update-settings", botCount: -2 })),
    error => error.code === "invalid-settings"
  );
  assert.throws(
    () => parseClientMessage(JSON.stringify({ type: "update-settings", mode: "unknown" })),
    error => error.code === "invalid-mode"
  );
  assert.throws(
    () => parseClientMessage(JSON.stringify({ type: "update-settings" })),
    error => error.code === "invalid-settings"
  );
});

test("join messages preserve only bounded protocol fields", () => {
  const message = parseClientMessage(JSON.stringify({
    type: "join",
    protocol: PROTOCOL_VERSION,
    name: " 测试玩家 ",
    cosmetics: { skin: "dragon", spore: "royal", halo: "gravity", trail: "demon-trail" },
    hostToken: "x".repeat(300),
    resumeToken: "y".repeat(300)
  }));
  assert.equal(message.name, "测试玩家");
  assert.deepEqual(message.cosmetics, { skin: "dragon", spore: "royal", halo: "gravity", trail: "demon-trail" });
  assert.equal(message.hostToken.length, 128);
  assert.equal(message.resumeToken.length, 128);
});

test("join cosmetics reject unknown catalog keys and preserve safe defaults", () => {
  const message = parseClientMessage(JSON.stringify({
    type: "join",
    protocol: PROTOCOL_VERSION,
    name: "外观测试",
    cosmetics: { skin: "<script>", spore: "missing", halo: "none", trail: "stardust" }
  }));
  assert.deepEqual(message.cosmetics, { skin: "aqua", spore: "mint", halo: "none", trail: "stardust" });
});

test("invalid JSON and unknown message types are rejected", () => {
  assert.throws(() => parseClientMessage("{"), ProtocolError);
  assert.throws(() => parseClientMessage(JSON.stringify({ type: "teleport" })), error => error.code === "unknown-message");
});

test("leave is a bounded first-class client message", () => {
  assert.deepEqual(parseClientMessage(JSON.stringify({ type: "leave", ignored: "value" })), { type: "leave" });
});

test("resync requests carry only bounded world revisions", () => {
  assert.deepEqual(parseClientMessage(JSON.stringify({
    type: "resync-request",
    foodRevision: 17,
    virusRevision: 4,
    ignored: "value"
  })), { type: "resync-request", foodRevision: 17, virusRevision: 4 });
});

test("ready and start messages are pinned to a room configuration version", () => {
  assert.deepEqual(parseClientMessage(JSON.stringify({
    type: "ready",
    ready: true,
    configVersion: 7
  })), { type: "ready", ready: true, configVersion: 7 });
  assert.deepEqual(parseClientMessage(JSON.stringify({
    type: "start",
    configVersion: 7
  })), { type: "start", configVersion: 7 });
});
