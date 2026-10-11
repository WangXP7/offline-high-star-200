/* More games https://www.github.com/he-is-talha */
(function () {
  "use strict";

  const TILE_W = 44;
  const TILE_H = 56;
  const Z_LIFT = 6;
  const OVERLAP = 0.95;

  const FACES = (function buildFaces() {
    const faces = [];
    for (let n = 1; n <= 9; n++) {
      faces.push({ id: "c" + n, label: String(n), sub: "○", suit: "circles" });
      faces.push({ id: "b" + n, label: String(n), sub: "竹", suit: "bamboo" });
      faces.push({ id: "h" + n, label: String(n), sub: "萬", suit: "characters" });
    }
    const winds = [
      { id: "we", label: "E", sub: "風" },
      { id: "ws", label: "S", sub: "風" },
      { id: "ww", label: "W", sub: "風" },
      { id: "wn", label: "N", sub: "風" },
    ];
    winds.forEach(function (w) {
      faces.push({ id: w.id, label: w.label, sub: w.sub, suit: "winds" });
    });
    faces.push({ id: "dr", label: "R", sub: "龍", suit: "dragons", dragon: "r" });
    faces.push({ id: "dg", label: "G", sub: "龍", suit: "dragons", dragon: "g" });
    faces.push({ id: "dw", label: "W", sub: "龍", suit: "dragons", dragon: "w" });
    // Two extra honors so 36 faces × 4 = 144 (no seasons/flowers)
    faces.push({ id: "x1", label: "★", sub: "特", suit: "winds" });
    faces.push({ id: "x2", label: "◆", sub: "特", suit: "winds" });
    return faces;
  })();

  function addRow(layout, y, xs, z) {
    xs.forEach(function (x) {
      layout.push({ x: x, y: y, z: z });
    });
  }

  function range(a, b) {
    const out = [];
    for (let i = a; i <= b; i++) out.push(i);
    return out;
  }

  /** Classic turtle-style multilayer layout — exactly 144 slots. */
  function buildTurtleLayout() {
    const L = [];
    // z=0 body (84) + wings (3) = 87
    addRow(L, 0, range(1, 12), 0);
    addRow(L, 1, range(3, 10), 0);
    addRow(L, 2, range(2, 11), 0);
    addRow(L, 3, range(1, 12), 0);
    addRow(L, 4, range(1, 12), 0);
    addRow(L, 5, range(2, 11), 0);
    addRow(L, 6, range(3, 10), 0);
    addRow(L, 7, range(1, 12), 0);
    L.push({ x: 0, y: 3.5, z: 0 });
    L.push({ x: 13, y: 3.5, z: 0 });
    L.push({ x: 14, y: 3.5, z: 0 });

    // z=1: 6×6 = 36
    for (let y = 1; y <= 6; y++) {
      for (let x = 4; x <= 9; x++) L.push({ x: x, y: y, z: 1 });
    }
    // z=2: 4×4 = 16
    for (let y = 2; y <= 5; y++) {
      for (let x = 5; x <= 8; x++) L.push({ x: x, y: y, z: 2 });
    }
    // z=3: 2×2 = 4
    for (let y = 3; y <= 4; y++) {
      for (let x = 6; x <= 7; x++) L.push({ x: x, y: y, z: 3 });
    }
    // z=4: apex
    L.push({ x: 6.5, y: 3.5, z: 4 });
    return L;
  }

  /** Turtle-lite pyramid — exactly 72 slots. */
  function buildEasyLayout() {
    const L = [];
    addRow(L, 0, range(2, 9), 0);
    addRow(L, 1, range(1, 10), 0);
    addRow(L, 2, range(1, 10), 0);
    addRow(L, 3, range(1, 10), 0);
    addRow(L, 4, range(2, 9), 0);
    L.push({ x: 0, y: 2, z: 0 });
    L.push({ x: 11, y: 2, z: 0 });
    // 48
    for (let y = 1; y <= 3; y++) {
      for (let x = 3; x <= 7; x++) L.push({ x: x, y: y, z: 1 });
    }
    // 63
    for (let y = 1; y <= 3; y++) {
      for (let x = 4; x <= 6; x++) L.push({ x: x, y: y, z: 2 });
    }
    // 72
    return L;
  }

  const TURTLE = buildTurtleLayout();
  const EASY_LAYOUT = buildEasyLayout();

  const LEVELS = {
    easy: {
      name: "Easy",
      layout: EASY_LAYOUT,
      copies: 2,
      hints: Infinity,
      hintCooldownMs: 5000,
      undos: Infinity,
      reshuffles: 2,
      timerSec: null,
      softWarnSec: null,
    },
    medium: {
      name: "Medium",
      layout: TURTLE,
      copies: 4,
      hints: 3,
      hintCooldownMs: 0,
      undos: 5,
      reshuffles: 1,
      timerSec: 12 * 60,
      softWarnSec: 12 * 60,
      hardLose: false,
    },
    hard: {
      name: "Hard",
      layout: TURTLE,
      copies: 4,
      hints: 0,
      hintCooldownMs: 0,
      undos: 0,
      reshuffles: 0,
      timerSec: 8 * 60,
      softWarnSec: null,
      hardLose: true,
    },
  };

  const els = {
    levelScreen: document.getElementById("levelScreen"),
    gameScreen: document.getElementById("gameScreen"),
    levelBadge: document.getElementById("levelBadge"),
    hud: document.getElementById("hud"),
    board: document.getElementById("board"),
    warnText: document.getElementById("warnText"),
    hintBtn: document.getElementById("hintBtn"),
    undoBtn: document.getElementById("undoBtn"),
    reshuffleBtn: document.getElementById("reshuffleBtn"),
    changeLevelBtn: document.getElementById("changeLevelBtn"),
    newGameBtn: document.getElementById("newGameBtn"),
    resultOverlay: document.getElementById("resultOverlay"),
    resultTitle: document.getElementById("resultTitle"),
    resultMsg: document.getElementById("resultMsg"),
    playAgainBtn: document.getElementById("playAgainBtn"),
    reshuffleFromResultBtn: document.getElementById("reshuffleFromResultBtn"),
    changeLevelFromResultBtn: document.getElementById("changeLevelFromResultBtn"),
    helpOverlay: document.getElementById("helpOverlay"),
    helpBtnLevel: document.getElementById("helpBtnLevel"),
    helpBtnGame: document.getElementById("helpBtnGame"),
    helpClose: document.getElementById("helpClose"),
  };

  let state = null;
  let timerId = null;
  let hintTimerId = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function buildDeck(copies) {
    const deck = [];
    FACES.forEach(function (f) {
      for (let i = 0; i < copies; i++) deck.push(f.id);
    });
    return shuffle(deck);
  }

  function faceById(id) {
    for (let i = 0; i < FACES.length; i++) {
      if (FACES[i].id === id) return FACES[i];
    }
    return null;
  }

  function boxesOverlap(a, b) {
    return Math.abs(a.x - b.x) < OVERLAP && Math.abs(a.y - b.y) < OVERLAP;
  }

  function isCovered(tile, tiles) {
    for (let i = 0; i < tiles.length; i++) {
      const o = tiles[i];
      if (!o || o.removed || o.id === tile.id) continue;
      if (o.z > tile.z && boxesOverlap(o, tile)) return true;
    }
    return false;
  }

  function sideBlocked(tile, tiles, dir) {
    const nx = tile.x + dir;
    for (let i = 0; i < tiles.length; i++) {
      const o = tiles[i];
      if (!o || o.removed || o.id === tile.id) continue;
      if (o.z !== tile.z) continue;
      if (Math.abs(o.x - nx) < OVERLAP && Math.abs(o.y - tile.y) < OVERLAP) {
        return true;
      }
    }
    return false;
  }

  function isFree(tile, tiles) {
    if (!tile || tile.removed) return false;
    if (isCovered(tile, tiles)) return false;
    const leftBlocked = sideBlocked(tile, tiles, -1);
    const rightBlocked = sideBlocked(tile, tiles, 1);
    return !leftBlocked || !rightBlocked;
  }

  function getFreeTiles(tiles) {
    return tiles.filter(function (t) {
      return t && !t.removed && isFree(t, tiles);
    });
  }

  function findMatchingPair(tiles) {
    const free = getFreeTiles(tiles);
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (free[i].faceId === free[j].faceId) {
          return [free[i], free[j]];
        }
      }
    }
    return null;
  }

  function layoutBounds(slots) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let maxZ = 0;
    slots.forEach(function (s) {
      if (s.x < minX) minX = s.x;
      if (s.x > maxX) maxX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.y > maxY) maxY = s.y;
      if (s.z > maxZ) maxZ = s.z;
    });
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY, maxZ: maxZ };
  }

  function dealOntoSlots(slots, faceIds) {
    const faces = shuffle(faceIds);
    return slots.map(function (slot, i) {
      return {
        id: "t" + i,
        x: slot.x,
        y: slot.y,
        z: slot.z,
        faceId: faces[i],
        removed: false,
        el: null,
      };
    });
  }

  function remainingFaceIds(tiles) {
    return tiles
      .filter(function (t) {
        return !t.removed;
      })
      .map(function (t) {
        return t.faceId;
      });
  }

  function remainingSlots(tiles) {
    return tiles
      .filter(function (t) {
        return !t.removed;
      })
      .map(function (t) {
        return { x: t.x, y: t.y, z: t.z };
      });
  }

  function tilesLeftCount(tiles) {
    let n = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (!tiles[i].removed) n++;
    }
    return n;
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function clearTimers() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    if (hintTimerId) {
      clearTimeout(hintTimerId);
      hintTimerId = null;
    }
  }

  function showLevelScreen() {
    clearTimers();
    state = null;
    els.gameScreen.classList.add("hidden");
    els.levelScreen.classList.remove("hidden");
    els.resultOverlay.classList.add("hidden");
    els.warnText.classList.add("hidden");
  }

  function startGame(levelKey) {
    clearTimers();
    const cfg = LEVELS[levelKey];
    const deck = buildDeck(cfg.copies);
    if (deck.length !== cfg.layout.length) {
      console.error("Deck/layout mismatch", deck.length, cfg.layout.length);
    }
    const tiles = dealOntoSlots(cfg.layout, deck.slice(0, cfg.layout.length));

    state = {
      levelKey: levelKey,
      cfg: cfg,
      tiles: tiles,
      selectedId: null,
      undoStack: [],
      hintsLeft: cfg.hints,
      undosLeft: cfg.undos,
      reshufflesLeft: cfg.reshuffles,
      hintReadyAt: 0,
      elapsedSec: 0,
      softWarned: false,
      ended: false,
    };

    els.levelScreen.classList.add("hidden");
    els.gameScreen.classList.remove("hidden");
    els.resultOverlay.classList.add("hidden");
    els.warnText.classList.add("hidden");
    els.warnText.textContent = "";
    els.levelBadge.textContent = cfg.name;
    els.reshuffleFromResultBtn.classList.add("hidden");

    renderBoard();
    updateHud();
    updateButtons();
    scaleBoard();

    if (cfg.timerSec != null) {
      timerId = setInterval(onTick, 1000);
    }

    checkStuckOrWin();
  }

  function onTick() {
    if (!state || state.ended) return;
    state.elapsedSec += 1;
    updateHud();

    const cfg = state.cfg;
    if (cfg.softWarnSec != null && !cfg.hardLose && !state.softWarned) {
      if (state.elapsedSec >= cfg.softWarnSec) {
        state.softWarned = true;
        els.warnText.textContent =
          "Time warning: 12 minutes have passed. Keep playing — no auto-lose.";
        els.warnText.classList.remove("hidden");
      }
    }

    if (cfg.hardLose && cfg.timerSec != null && state.elapsedSec >= cfg.timerSec) {
      endGame("time", "Time's up", "The 8-minute limit ran out. Try again or pick an easier level.");
    }
  }

  function renderBoard() {
    const tiles = state.tiles;
    const bounds = layoutBounds(tiles);
    const pad = 0.35;
    const width = (bounds.maxX - bounds.minX + 1 + pad * 2) * TILE_W + bounds.maxZ * Z_LIFT + 8;
    const height = (bounds.maxY - bounds.minY + 1 + pad * 2) * TILE_H + bounds.maxZ * Z_LIFT + 8;

    els.board.innerHTML = "";
    els.board.style.width = width + "px";
    els.board.style.height = height + "px";
    els.board.style.transform = "scale(1)";

    const sorted = tiles.slice().sort(function (a, b) {
      if (a.z !== b.z) return a.z - b.z;
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    sorted.forEach(function (tile) {
      if (tile.removed) return;
      const face = faceById(tile.faceId);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile suit-" + face.suit;
      if (face.dragon) btn.classList.add("dragon-" + face.dragon);
      btn.dataset.id = tile.id;
      btn.setAttribute("aria-label", face.label + " " + face.sub);

      const left = (tile.x - bounds.minX + pad) * TILE_W + tile.z * Z_LIFT;
      const top = (tile.y - bounds.minY + pad) * TILE_H + tile.z * Z_LIFT;
      btn.style.left = left + "px";
      btn.style.top = top + "px";
      btn.style.zIndex = String(100 + tile.z * 20 + Math.floor(tile.y * 2) + Math.floor(tile.x));

      const lab = document.createElement("span");
      lab.className = "face-label";
      lab.textContent = face.label;
      const sub = document.createElement("span");
      sub.className = "face-sub";
      sub.textContent = face.sub;
      btn.appendChild(lab);
      btn.appendChild(sub);

      btn.addEventListener("click", function () {
        onTileClick(tile.id);
      });

      tile.el = btn;
      els.board.appendChild(btn);
    });

    refreshFreeStyles();
  }

  function refreshFreeStyles() {
    if (!state) return;
    state.tiles.forEach(function (t) {
      if (!t.el || t.removed) return;
      const free = isFree(t, state.tiles);
      t.el.classList.toggle("free", free);
      t.el.classList.toggle("selected", state.selectedId === t.id);
      t.el.disabled = !free;
    });
  }

  function scaleBoard() {
    const scroll = els.board.parentElement;
    if (!scroll) return;
    els.board.style.transform = "scale(1)";
    const bw = els.board.offsetWidth;
    const bh = els.board.offsetHeight;
    const availW = Math.max(200, scroll.clientWidth - 8);
    const availH = Math.max(200, Math.min(window.innerHeight * 0.62, 640));
    const scale = Math.min(1, availW / bw, availH / bh);
    els.board.style.transform = "scale(" + scale + ")";
    els.board.style.marginBottom = (bh * (scale - 1)) + "px";
  }

  function updateHud() {
    if (!state) return;
    const left = tilesLeftCount(state.tiles);
    let text = "Tiles: " + left;
    if (state.cfg.timerSec != null) {
      const remaining =
        state.cfg.hardLose
          ? Math.max(0, state.cfg.timerSec - state.elapsedSec)
          : state.elapsedSec;
      const label = state.cfg.hardLose ? "Time left" : "Time";
      text += " · " + label + ": " + formatTime(remaining);
    }
    els.hud.textContent = text;
  }

  function updateButtons() {
    if (!state) return;
    const cfg = state.cfg;
    const now = Date.now();

    if (cfg.hints === 0) {
      els.hintBtn.disabled = true;
      els.hintBtn.textContent = "Hint";
    } else if (cfg.hints === Infinity) {
      const cooling = now < state.hintReadyAt;
      els.hintBtn.disabled = cooling || state.ended;
      els.hintBtn.textContent = cooling
        ? "Hint (" + Math.ceil((state.hintReadyAt - now) / 1000) + "s)"
        : "Hint";
    } else {
      els.hintBtn.disabled = state.hintsLeft <= 0 || state.ended;
      els.hintBtn.textContent = "Hint (" + state.hintsLeft + ")";
    }

    if (cfg.undos === 0) {
      els.undoBtn.disabled = true;
      els.undoBtn.textContent = "Undo";
    } else if (cfg.undos === Infinity) {
      els.undoBtn.disabled = state.undoStack.length === 0 || state.ended;
      els.undoBtn.textContent = "Undo";
    } else {
      els.undoBtn.disabled =
        state.undosLeft <= 0 || state.undoStack.length === 0 || state.ended;
      els.undoBtn.textContent = "Undo (" + state.undosLeft + ")";
    }

    if (cfg.reshuffles === 0) {
      els.reshuffleBtn.disabled = true;
      els.reshuffleBtn.textContent = "Reshuffle";
    } else {
      els.reshuffleBtn.disabled = state.reshufflesLeft <= 0 || state.ended;
      els.reshuffleBtn.textContent = "Reshuffle (" + state.reshufflesLeft + ")";
    }
  }

  function clearHints() {
    if (!state) return;
    state.tiles.forEach(function (t) {
      if (t.el) t.el.classList.remove("hint");
    });
  }

  function onTileClick(tileId) {
    if (!state || state.ended) return;
    const tile = state.tiles.find(function (t) {
      return t.id === tileId;
    });
    if (!tile || tile.removed || !isFree(tile, state.tiles)) return;

    clearHints();

    if (!state.selectedId) {
      state.selectedId = tile.id;
      refreshFreeStyles();
      return;
    }

    if (state.selectedId === tile.id) {
      state.selectedId = null;
      refreshFreeStyles();
      return;
    }

    const first = state.tiles.find(function (t) {
      return t.id === state.selectedId;
    });
    if (!first || first.removed || !isFree(first, state.tiles)) {
      state.selectedId = tile.id;
      refreshFreeStyles();
      return;
    }

    if (first.faceId === tile.faceId) {
      removePair(first, tile);
    } else {
      state.selectedId = tile.id;
      refreshFreeStyles();
    }
  }

  function removePair(a, b) {
    state.selectedId = null;
    state.undoStack.push({
      aId: a.id,
      bId: b.id,
      aFace: a.faceId,
      bFace: b.faceId,
    });

    a.removed = true;
    b.removed = true;

    if (a.el) {
      a.el.classList.add("removing");
      a.el.classList.remove("selected", "free", "hint");
    }
    if (b.el) {
      b.el.classList.add("removing");
      b.el.classList.remove("selected", "free", "hint");
    }

    setTimeout(function () {
      if (a.el && a.el.parentNode) a.el.parentNode.removeChild(a.el);
      if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
      a.el = null;
      b.el = null;
      refreshFreeStyles();
      updateHud();
      updateButtons();
      checkStuckOrWin();
    }, 260);
  }

  function doUndo() {
    if (!state || state.ended) return;
    if (state.undoStack.length === 0) return;
    if (state.cfg.undos !== Infinity && state.undosLeft <= 0) return;

    const entry = state.undoStack.pop();
    if (state.cfg.undos !== Infinity) state.undosLeft -= 1;

    const a = state.tiles.find(function (t) {
      return t.id === entry.aId;
    });
    const b = state.tiles.find(function (t) {
      return t.id === entry.bId;
    });
    if (a) {
      a.removed = false;
      a.faceId = entry.aFace;
    }
    if (b) {
      b.removed = false;
      b.faceId = entry.bFace;
    }

    state.selectedId = null;
    els.resultOverlay.classList.add("hidden");
    state.ended = false;
    renderBoard();
    updateHud();
    updateButtons();
    scaleBoard();
  }

  function doHint() {
    if (!state || state.ended) return;
    const cfg = state.cfg;
    const now = Date.now();

    if (cfg.hints === 0) return;
    if (cfg.hints === Infinity) {
      if (now < state.hintReadyAt) return;
    } else if (state.hintsLeft <= 0) {
      return;
    }

    const pair = findMatchingPair(state.tiles);
    if (!pair) {
      checkStuckOrWin();
      return;
    }

    clearHints();
    pair.forEach(function (t) {
      if (t.el) t.el.classList.add("hint");
    });

    if (cfg.hints === Infinity) {
      state.hintReadyAt = now + cfg.hintCooldownMs;
      if (hintTimerId) clearTimeout(hintTimerId);
      hintTimerId = setTimeout(function () {
        updateButtons();
      }, cfg.hintCooldownMs + 50);
      const tick = setInterval(function () {
        updateButtons();
        if (!state || Date.now() >= state.hintReadyAt) clearInterval(tick);
      }, 250);
    } else {
      state.hintsLeft -= 1;
    }
    updateButtons();
  }

  function doReshuffle() {
    if (!state || state.ended) return;
    if (state.reshufflesLeft <= 0) return;

    state.reshufflesLeft -= 1;
    const slots = remainingSlots(state.tiles);
    const faces = remainingFaceIds(state.tiles);
    const alive = state.tiles.filter(function (t) {
      return !t.removed;
    });

    const redealt = dealOntoSlots(slots, faces);
    for (let i = 0; i < alive.length; i++) {
      alive[i].x = redealt[i].x;
      alive[i].y = redealt[i].y;
      alive[i].z = redealt[i].z;
      alive[i].faceId = redealt[i].faceId;
    }

    state.selectedId = null;
    state.undoStack = [];
    els.resultOverlay.classList.add("hidden");
    state.ended = false;
    renderBoard();
    updateHud();
    updateButtons();
    scaleBoard();
    checkStuckOrWin();
  }

  function checkStuckOrWin() {
    if (!state || state.ended) return;
    const left = tilesLeftCount(state.tiles);
    if (left === 0) {
      endGame("win", "You win!", "All tiles cleared. Great match.");
      return;
    }
    const pair = findMatchingPair(state.tiles);
    if (!pair) {
      if (state.reshufflesLeft > 0) {
        endGame(
          "stuck",
          "No moves left",
          "No free matching pairs. You can reshuffle remaining tiles or start over.",
          true
        );
      } else {
        endGame(
          "stuck",
          "Stuck",
          "No free matching pairs and no reshuffles left."
        );
      }
    }
  }

  function endGame(kind, title, msg, offerReshuffle) {
    if (!state) return;
    state.ended = true;
    state.selectedId = null;
    clearHints();
    if (kind === "time" || (kind === "stuck" && !offerReshuffle) || kind === "win") {
      clearTimers();
    }
    els.resultTitle.textContent = title;
    els.resultMsg.textContent = msg;
    els.resultOverlay.classList.remove("hidden");
    if (offerReshuffle) {
      els.reshuffleFromResultBtn.classList.remove("hidden");
    } else {
      els.reshuffleFromResultBtn.classList.add("hidden");
    }
    updateButtons();
  }

  function openHelp() {
    els.helpOverlay.classList.remove("hidden");
  }

  function closeHelp() {
    els.helpOverlay.classList.add("hidden");
  }

  document.querySelectorAll(".level-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      startGame(btn.getAttribute("data-level"));
    });
  });

  els.hintBtn.addEventListener("click", doHint);
  els.undoBtn.addEventListener("click", doUndo);
  els.reshuffleBtn.addEventListener("click", doReshuffle);
  els.newGameBtn.addEventListener("click", function () {
    if (state) startGame(state.levelKey);
  });
  els.changeLevelBtn.addEventListener("click", showLevelScreen);
  els.changeLevelFromResultBtn.addEventListener("click", showLevelScreen);
  els.playAgainBtn.addEventListener("click", function () {
    if (state) startGame(state.levelKey);
  });
  els.reshuffleFromResultBtn.addEventListener("click", function () {
    if (!state) return;
    state.ended = false;
    els.resultOverlay.classList.add("hidden");
    doReshuffle();
  });

  els.helpBtnLevel.addEventListener("click", openHelp);
  els.helpBtnGame.addEventListener("click", openHelp);
  els.helpClose.addEventListener("click", closeHelp);
  els.helpOverlay.addEventListener("click", function (e) {
    if (e.target === els.helpOverlay) closeHelp();
  });

  window.addEventListener("resize", function () {
    if (state && !els.gameScreen.classList.contains("hidden")) scaleBoard();
  });
})();
