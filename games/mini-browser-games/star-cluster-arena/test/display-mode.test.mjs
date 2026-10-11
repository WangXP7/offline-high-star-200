import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import { applyDisplayMode, createDisplayModeController, normalizeDisplayRequest, readDisplayState } from "../desktop/display-mode.mjs";

class MockWindow extends EventEmitter {
  constructor({ transitions = true } = {}) {
    super();
    this.fullscreen = false;
    this.transitions = transitions;
    this.bounds = { x: 100, y: 80, width: 1440, height: 900 };
    this.contentBounds = { ...this.bounds };
    this.menuVisible = true;
  }

  isFullScreen() { return this.fullscreen; }
  getBounds() { return { ...this.bounds }; }
  getContentBounds() { return { ...this.contentBounds }; }
  setMenuBarVisibility(visible) { this.menuVisible = visible; }
  center() { this.centered = true; }
  setContentSize(width, height) {
    this.contentBounds.width = width;
    this.contentBounds.height = height;
    this.bounds.width = width;
    this.bounds.height = height;
  }

  setFullScreen(fullscreen) {
    if (!this.transitions) return;
    setImmediate(() => {
      this.fullscreen = fullscreen;
      this.emit(fullscreen ? "enter-full-screen" : "leave-full-screen");
    });
  }
}

const screenApi = {
  getDisplayMatching: () => ({
    id: 7,
    size: { width: 2560, height: 1440 },
    workAreaSize: { width: 2560, height: 1392 },
    scaleFactor: 1.25,
    displayFrequency: 165
  })
};

test("display requests accept only supported modes and window sizes", () => {
  assert.deepEqual(normalizeDisplayRequest({ mode: "borderless-fullscreen", windowSize: "1600x900" }), {
    mode: "borderless-fullscreen",
    windowSize: "1600x900"
  });
  assert.deepEqual(normalizeDisplayRequest({ mode: "exclusive", windowSize: "800x600" }), {
    mode: "windowed",
    windowSize: "current"
  });
});

test("fullscreen returns only after the native window confirms the transition", async () => {
  const window = new MockWindow();
  const state = await applyDisplayMode(window, screenApi, { mode: "borderless-fullscreen" }, { transitionTimeoutMs: 100 });
  assert.equal(state.ok, true);
  assert.equal(state.fullscreen, true);
  assert.equal(state.mode, "borderless-fullscreen");
  assert.equal(state.display.refreshRate, 165);
  assert.equal(window.menuVisible, false);
});

test("window size applies after leaving fullscreen", async () => {
  const window = new MockWindow();
  window.fullscreen = true;
  const state = await applyDisplayMode(window, screenApi, { mode: "windowed", windowSize: "1920x1080" }, { transitionTimeoutMs: 100, windowRestoreDelayMs: 0 });
  assert.equal(state.ok, true);
  assert.equal(state.fullscreen, false);
  assert.deepEqual(state.contentBounds, { x: 100, y: 80, width: 1920, height: 1080 });
  assert.equal(window.centered, true);
});

test("an unconfirmed native transition is reported as a failure", async () => {
  const window = new MockWindow({ transitions: false });
  const state = await applyDisplayMode(window, screenApi, { mode: "borderless-fullscreen" }, { transitionTimeoutMs: 25 });
  assert.equal(state.ok, false);
  assert.equal(state.fullscreen, false);
  assert.match(state.error, /未进入/);
  assert.equal(readDisplayState(window, screenApi).mode, "windowed");
});

test("queued UI requests cannot race startup restoration or a rapid second click", async () => {
  const window = new MockWindow();
  const controller = createDisplayModeController(window, screenApi, { transitionTimeoutMs: 100, windowRestoreDelayMs: 0 });
  const entered = controller.set({ mode: "borderless-fullscreen" });
  const toggled = controller.toggle("1280x720");

  assert.equal((await entered).fullscreen, true);
  const finalState = await toggled;
  assert.equal(finalState.ok, true);
  assert.equal(finalState.fullscreen, false);
  assert.equal(controller.read().mode, "windowed");
});
