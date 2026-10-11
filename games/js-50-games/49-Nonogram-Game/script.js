(() => {
  "use strict";

  const LEVELS = {
    easy: { size: 5, label: "Easy", hints: true },
    medium: { size: 10, label: "Medium", hints: false },
    hard: { size: 15, label: "Hard", hints: false },
  };

  /** Handcrafted binary puzzles: 1 = fill, 0 = empty */
  const PUZZLES = {
    easy: [
      // Heart
      [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
      ],
      // Plus
      [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
      // Frame with center
      [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
      // Arrow up
      [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
    ],
    medium: [
      // House
      [
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      ],
      // Tree
      [
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      ],
      // Cat face
      [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      ],
      // Anchor
      [
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      ],
    ],
    hard: [
      // Sailboat
      [
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Fish
      [
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      ],
      // Castle
      [
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      // Smiley
      [
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      ],
    ],
  };

  const EMPTY = 0;
  const FILL = 1;
  const MARK = 2;
  const LONG_PRESS_MS = 400;
  const MOVE_CANCEL_PX = 8;

  let currentLevel = "easy";
  let size = 5;
  let solution = null;
  let grid = null;
  let rowClues = [];
  let colClues = [];
  let puzzleIndex = -1;
  let usedOrder = [];
  let won = false;
  let longPressTimer = null;
  let longPressFired = false;
  let touchStart = null;

  const els = {
    levelScreen: document.getElementById("levelScreen"),
    gameScreen: document.getElementById("gameScreen"),
    board: document.getElementById("board"),
    levelBadge: document.getElementById("levelBadge"),
    hudProgress: document.getElementById("hudProgress"),
    statusText: document.getElementById("statusText"),
    hintBtn: document.getElementById("hintBtn"),
    changeLevelBtn: document.getElementById("changeLevelBtn"),
    newGameBtn: document.getElementById("newGameBtn"),
    resultOverlay: document.getElementById("resultOverlay"),
    resultTitle: document.getElementById("resultTitle"),
    resultMsg: document.getElementById("resultMsg"),
    playAgainBtn: document.getElementById("playAgainBtn"),
    changeLevelFromResultBtn: document.getElementById("changeLevelFromResultBtn"),
    helpOverlay: document.getElementById("helpOverlay"),
    helpBtnLevel: document.getElementById("helpBtnLevel"),
    helpBtnGame: document.getElementById("helpBtnGame"),
    helpClose: document.getElementById("helpClose"),
  };

  function cloneGrid(src) {
    return src.map((row) => row.slice());
  }

  function runsFromLine(line) {
    const runs = [];
    let count = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === 1) {
        count++;
      } else if (count > 0) {
        runs.push(count);
        count = 0;
      }
    }
    if (count > 0) runs.push(count);
    return runs.length ? runs : [0];
  }

  function cluesFromSolution(sol) {
    const n = sol.length;
    const rows = sol.map((row) => runsFromLine(row));
    const cols = [];
    for (let c = 0; c < n; c++) {
      const col = [];
      for (let r = 0; r < n; r++) col.push(sol[r][c]);
      cols.push(runsFromLine(col));
    }
    return { rows, cols };
  }

  function countFilled(sol) {
    let n = 0;
    for (let r = 0; r < sol.length; r++) {
      for (let c = 0; c < sol[r].length; c++) {
        if (sol[r][c] === 1) n++;
      }
    }
    return n;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickNextPuzzle(levelKey) {
    const bank = PUZZLES[levelKey];
    if (!usedOrder.length) {
      usedOrder = shuffle([...Array(bank.length).keys()]);
    }
    const idx = usedOrder.shift();
    puzzleIndex = idx;
    return cloneGrid(bank[idx]);
  }

  function emptyPlayerGrid(n) {
    return Array.from({ length: n }, () => Array(n).fill(EMPTY));
  }

  function updateHud() {
    const target = countFilled(solution);
    let filled = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === FILL) filled++;
      }
    }
    els.hudProgress.textContent = `${filled} / ${target}`;
  }

  function checkWin() {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const filled = grid[r][c] === FILL ? 1 : 0;
        if (filled !== solution[r][c]) return false;
      }
    }
    return true;
  }

  function showWin() {
    won = true;
    els.statusText.textContent = "Puzzle complete!";
    els.statusText.classList.add("win");
    els.resultTitle.textContent = "You win!";
    els.resultMsg.textContent = `Solved the ${LEVELS[currentLevel].label} ${size}×${size} nonogram.`;
    els.resultOverlay.classList.remove("hidden");
  }

  function applyCellClass(el, state) {
    el.classList.remove("filled", "marked");
    if (state === FILL) el.classList.add("filled");
    if (state === MARK) el.classList.add("marked");
    el.dataset.state = String(state);
  }

  function setCell(r, c, state) {
    if (won) return;
    grid[r][c] = state;
    const el = els.board.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    if (el) applyCellClass(el, state);
    updateHud();
    if (checkWin()) showWin();
  }

  function toggleFill(r, c) {
    const cur = grid[r][c];
    if (cur === MARK) {
      setCell(r, c, EMPTY);
      return;
    }
    setCell(r, c, cur === FILL ? EMPTY : FILL);
  }

  function toggleMark(r, c) {
    const cur = grid[r][c];
    if (cur === FILL) {
      setCell(r, c, MARK);
      return;
    }
    setCell(r, c, cur === MARK ? EMPTY : MARK);
  }

  function clearLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function bindCell(el, r, c) {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (longPressFired) {
        longPressFired = false;
        return;
      }
      toggleFill(r, c);
    });

    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      toggleMark(r, c);
    });

    el.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        touchStart = { x: t.clientX, y: t.clientY, r, c };
        longPressFired = false;
        clearLongPress();
        longPressTimer = setTimeout(() => {
          longPressFired = true;
          toggleMark(r, c);
          if (navigator.vibrate) navigator.vibrate(20);
        }, LONG_PRESS_MS);
      },
      { passive: true }
    );

    el.addEventListener(
      "touchmove",
      (e) => {
        if (!touchStart || !e.touches.length) return;
        const t = e.touches[0];
        const dx = Math.abs(t.clientX - touchStart.x);
        const dy = Math.abs(t.clientY - touchStart.y);
        if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) {
          clearLongPress();
          touchStart = null;
        }
      },
      { passive: true }
    );

    el.addEventListener(
      "touchend",
      () => {
        clearLongPress();
        touchStart = null;
      },
      { passive: true }
    );

    el.addEventListener(
      "touchcancel",
      () => {
        clearLongPress();
        touchStart = null;
        longPressFired = false;
      },
      { passive: true }
    );
  }

  function renderBoard() {
    const n = size;
    els.board.innerHTML = "";
    els.board.className = `board size-${n}`;
    els.board.style.gridTemplateColumns = `auto repeat(${n}, var(--cell-size))`;
    els.board.style.gridTemplateRows = `auto repeat(${n}, var(--cell-size))`;

    const corner = document.createElement("div");
    corner.className = "clue-corner";
    els.board.appendChild(corner);

    for (let c = 0; c < n; c++) {
      const colEl = document.createElement("div");
      colEl.className = "col-clues";
      colClues[c].forEach((num) => {
        const span = document.createElement("span");
        span.textContent = String(num);
        colEl.appendChild(span);
      });
      els.board.appendChild(colEl);
    }

    for (let r = 0; r < n; r++) {
      const rowEl = document.createElement("div");
      rowEl.className = "row-clues";
      rowClues[r].forEach((num) => {
        const span = document.createElement("span");
        span.textContent = String(num);
        rowEl.appendChild(span);
      });
      els.board.appendChild(rowEl);

      for (let c = 0; c < n; c++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        cell.setAttribute("aria-label", `Row ${r + 1} column ${c + 1}`);
        if (c > 0 && c % 5 === 0) cell.classList.add("grid-thick-left");
        if (r > 0 && r % 5 === 0) cell.classList.add("grid-thick-top");
        applyCellClass(cell, grid[r][c]);
        bindCell(cell, r, c);
        els.board.appendChild(cell);
      }
    }
  }

  function startGame(levelKey, newPuzzle) {
    currentLevel = levelKey;
    const cfg = LEVELS[levelKey];
    size = cfg.size;
    won = false;

    if (newPuzzle) {
      solution = pickNextPuzzle(levelKey);
    } else if (!solution || solution.length !== size) {
      solution = pickNextPuzzle(levelKey);
    }

    grid = emptyPlayerGrid(size);
    const clues = cluesFromSolution(solution);
    rowClues = clues.rows;
    colClues = clues.cols;

    els.levelBadge.textContent = cfg.label;
    els.hintBtn.classList.toggle("hidden", !cfg.hints);
    els.gameScreen.classList.toggle("size-15", size === 15);
    els.statusText.textContent = "Fill cells to match the clues";
    els.statusText.classList.remove("win");
    els.resultOverlay.classList.add("hidden");

    renderBoard();
    updateHud();
  }

  function showGame(levelKey) {
    usedOrder = [];
    els.levelScreen.classList.add("hidden");
    els.gameScreen.classList.remove("hidden");
    startGame(levelKey, true);
  }

  function showLevelSelect() {
    els.gameScreen.classList.add("hidden");
    els.levelScreen.classList.remove("hidden");
    els.resultOverlay.classList.add("hidden");
    won = false;
  }

  function useHint() {
    if (won || !LEVELS[currentLevel].hints) return;
    const candidates = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (solution[r][c] === 1 && grid[r][c] !== FILL) {
          candidates.push({ r, c });
        }
      }
    }
    if (!candidates.length) {
      els.statusText.textContent = "No more cells to hint";
      return;
    }
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    setCell(pick.r, pick.c, FILL);
    const el = els.board.querySelector(`[data-r="${pick.r}"][data-c="${pick.c}"]`);
    if (el) {
      el.classList.add("hint-flash");
      setTimeout(() => el.classList.remove("hint-flash"), 600);
    }
    if (!won) els.statusText.textContent = "Hint: one cell revealed";
  }

  function openHelp() {
    els.helpOverlay.classList.remove("hidden");
    els.helpOverlay.setAttribute("aria-hidden", "false");
  }

  function closeHelp() {
    els.helpOverlay.classList.add("hidden");
    els.helpOverlay.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      showGame(btn.dataset.level);
    });
  });

  els.changeLevelBtn.addEventListener("click", showLevelSelect);
  els.changeLevelFromResultBtn.addEventListener("click", showLevelSelect);
  els.newGameBtn.addEventListener("click", () => startGame(currentLevel, true));
  els.playAgainBtn.addEventListener("click", () => startGame(currentLevel, true));
  els.hintBtn.addEventListener("click", useHint);

  els.helpBtnLevel.addEventListener("click", openHelp);
  els.helpBtnGame.addEventListener("click", openHelp);
  els.helpClose.addEventListener("click", closeHelp);
  els.helpOverlay.addEventListener("click", (e) => {
    if (e.target === els.helpOverlay) closeHelp();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeHelp();
  });
})();
