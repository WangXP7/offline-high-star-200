export const WINDOW_SIZES = Object.freeze(new Map([
  ["1280x720", Object.freeze([1280, 720])],
  ["1440x900", Object.freeze([1440, 900])],
  ["1600x900", Object.freeze([1600, 900])],
  ["1920x1080", Object.freeze([1920, 1080])]
]));

export function normalizeDisplayRequest(settings = {}) {
  const mode = settings?.mode === "borderless-fullscreen" ? "borderless-fullscreen" : "windowed";
  const windowSize = WINDOW_SIZES.has(String(settings?.windowSize || ""))
    ? String(settings.windowSize)
    : "current";
  return Object.freeze({ mode, windowSize });
}

function displayForWindow(window, screenApi) {
  if (!window || !screenApi) return null;
  return screenApi.getDisplayMatching(window.getBounds());
}

export function readDisplayState(window, screenApi) {
  if (!window) return { ok: false, mode: "windowed", fullscreen: false, bounds: null, display: null };
  const display = displayForWindow(window, screenApi);
  const fullscreen = Boolean(window.isFullScreen());
  return {
    ok: true,
    mode: fullscreen ? "borderless-fullscreen" : "windowed",
    fullscreen,
    bounds: window.getBounds(),
    contentBounds: typeof window.getContentBounds === "function" ? window.getContentBounds() : null,
    display: display ? {
      id: display.id,
      width: display.size?.width || 0,
      height: display.size?.height || 0,
      workAreaWidth: display.workAreaSize?.width || 0,
      workAreaHeight: display.workAreaSize?.height || 0,
      scaleFactor: display.scaleFactor || 1,
      refreshRate: display.displayFrequency || 0
    } : null
  };
}

function waitForFullscreenState(window, expected, timeoutMs = 1600) {
  if (Boolean(window.isFullScreen()) === expected) return Promise.resolve(true);
  return new Promise(resolve => {
    const eventName = expected ? "enter-full-screen" : "leave-full-screen";
    let settled = false;
    let poll = null;
    let timeout = null;
    const finish = reached => {
      if (settled) return;
      settled = true;
      if (poll) clearInterval(poll);
      if (timeout) clearTimeout(timeout);
      window.removeListener?.(eventName, check);
      resolve(reached);
    };
    const check = () => {
      if (Boolean(window.isFullScreen()) === expected) finish(true);
    };
    window.on?.(eventName, check);
    poll = setInterval(check, 25);
    timeout = setTimeout(() => finish(Boolean(window.isFullScreen()) === expected), timeoutMs);
    setImmediate(check);
  });
}

export async function applyDisplayMode(window, screenApi, settings = {}, options = {}) {
  if (!window) return readDisplayState(window, screenApi);
  const request = normalizeDisplayRequest(settings);
  const expectedFullscreen = request.mode === "borderless-fullscreen";
  let fullscreenChanged = false;

  if (Boolean(window.isFullScreen()) !== expectedFullscreen) {
    const transition = waitForFullscreenState(window, expectedFullscreen, options.transitionTimeoutMs);
    window.setFullScreen(expectedFullscreen);
    const reached = await transition;
    if (!reached) {
      return {
        ...readDisplayState(window, screenApi),
        ok: false,
        requestedMode: request.mode,
        error: expectedFullscreen ? "系统未进入无边框全屏" : "系统未退出无边框全屏"
      };
    }
    fullscreenChanged = true;
  }

  window.setMenuBarVisibility?.(false);
  if (!expectedFullscreen && request.windowSize !== "current") {
    if (fullscreenChanged) {
      await new Promise(resolve => setTimeout(resolve, options.windowRestoreDelayMs ?? 100));
    }
    const size = WINDOW_SIZES.get(request.windowSize);
    const display = displayForWindow(window, screenApi);
    const maximumWidth = Math.max(960, display?.workAreaSize?.width || size[0]);
    const maximumHeight = Math.max(640, display?.workAreaSize?.height || size[1]);
    const width = Math.min(size[0], maximumWidth);
    const height = Math.min(size[1], maximumHeight);
    if (typeof window.setContentSize === "function") window.setContentSize(width, height, false);
    else window.setSize(width, height, false);
    window.center?.();
  }

  const state = readDisplayState(window, screenApi);
  return {
    ...state,
    ok: state.mode === request.mode,
    requestedMode: request.mode,
    requestedWindowSize: request.windowSize
  };
}

export function createDisplayModeController(window, screenApi, options = {}) {
  let tail = Promise.resolve();
  const enqueue = operation => {
    const result = tail.catch(() => undefined).then(operation);
    tail = result.catch(() => undefined);
    return result;
  };

  return Object.freeze({
    read: () => readDisplayState(window, screenApi),
    set: settings => enqueue(() => applyDisplayMode(window, screenApi, settings, options)),
    toggle: windowSize => enqueue(() => applyDisplayMode(window, screenApi, {
      mode: window.isFullScreen() ? "windowed" : "borderless-fullscreen",
      windowSize
    }, options))
  });
}
