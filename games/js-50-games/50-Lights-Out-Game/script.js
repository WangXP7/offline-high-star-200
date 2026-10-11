(function () {
  "use strict";

  const LEVELS = {
    easy: { label: "Easy", size: 3 },
    medium: { label: "Medium", size: 5 },
    hard: { label: "Hard", size: 7 },
  };

  let level = "easy";
  let size = 3;
  let grid = [];
  let moves = 0;
  let won = false;

  const $ = (s) => document.querySelector(s);

  function cfg() {
    return LEVELS[level];
  }

  function emptyGrid(n) {
    return Array.from({ length: n }, () => Array(n).fill(0));
  }

  function toggleAt(g, r, c) {
    const n = g.length;
    const dirs = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    dirs.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        g[nr][nc] ^= 1;
      }
    });
  }

  function generatePuzzle(n) {
    const g = emptyGrid(n);
    const presses = Math.max(n * n, n * n + Math.floor(Math.random() * n * 2));
    for (let i = 0; i < presses; i++) {
      const r = Math.floor(Math.random() * n);
      const c = Math.floor(Math.random() * n);
      toggleAt(g, r, c);
    }
    if (isAllOff(g)) {
      toggleAt(g, 0, 0);
    }
    return g;
  }

  function isAllOff(g) {
    return g.every((row) => row.every((v) => v === 0));
  }

  function updateHud() {
    $("#moveCount").textContent = "Moves: " + moves;
  }

  function render() {
    const board = $("#board");
    board.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
    board.innerHTML = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cell" + (grid[r][c] ? " on" : "");
        btn.setAttribute("aria-label", "Light " + (r + 1) + "," + (c + 1));
        btn.addEventListener("click", () => press(r, c));
        board.appendChild(btn);
      }
    }
    updateHud();
  }

  function press(r, c) {
    if (won) return;
    toggleAt(grid, r, c);
    moves += 1;
    render();
    if (isAllOff(grid)) {
      won = true;
      $("#resultTitle").textContent = "You win!";
      $("#resultMsg").textContent = "Board cleared in " + moves + " moves.";
      $("#resultOverlay").classList.remove("hidden");
    }
  }

  function startPuzzle() {
    size = cfg().size;
    grid = generatePuzzle(size);
    moves = 0;
    won = false;
    $("#resultOverlay").classList.add("hidden");
    $("#levelBadge").textContent = cfg().label;
    render();
  }

  function startGame(selected) {
    level = selected;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    startPuzzle();
  }

  function goToLevel() {
    $("#gameScreen").classList.add("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".level-btn").forEach((btn) => {
      btn.addEventListener("click", () => startGame(btn.dataset.level));
    });
    $("#newGameBtn").addEventListener("click", startPuzzle);
    $("#playAgainBtn").addEventListener("click", startPuzzle);
    $("#changeLevelBtn").addEventListener("click", goToLevel);
    $("#changeLevelFromResultBtn").addEventListener("click", goToLevel);

    const openHelp = () => $("#helpOverlay").classList.remove("hidden");
    const closeHelp = () => $("#helpOverlay").classList.add("hidden");
    $("#helpBtnLevel").addEventListener("click", openHelp);
    $("#helpBtnGame").addEventListener("click", openHelp);
    $("#helpClose").addEventListener("click", closeHelp);
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") closeHelp();
    });
  });
})();
