(function () {
  "use strict";

  const SIZE = 8;
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = -1;
  const DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  const WEIGHTS = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [10, -5, 2, 1, 1, 2, -5, 10],
    [5, -5, 1, 0, 0, 1, -5, 5],
    [5, -5, 1, 0, 0, 1, -5, 5],
    [10, -5, 2, 1, 1, 2, -5, 10],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [100, -20, 10, 5, 5, 10, -20, 100],
  ];

  const LEVELS = {
    easy: { label: "Easy", ai: "random", hint: true, undo: Infinity, delay: 250 },
    medium: { label: "Medium", ai: "greedy", hint: false, undo: 3, delay: 400 },
    hard: { label: "Hard", ai: "minimax", hint: false, undo: 0, delay: 600 },
  };

  let board = [];
  let level = "easy";
  let current = BLACK;
  let gameOver = false;
  let aiThinking = false;
  let legal = [];
  let hintSquare = null;
  let history = [];
  let undosLeft = Infinity;

  const $ = (s) => document.querySelector(s);

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function cloneBoard(b) {
    return b.map((row) => row.slice());
  }

  function createBoard() {
    const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
    b[3][3] = WHITE;
    b[3][4] = BLACK;
    b[4][3] = BLACK;
    b[4][4] = WHITE;
    return b;
  }

  function flipsFor(b, r, c, color) {
    if (b[r][c] !== EMPTY) return [];
    const flips = [];
    for (const [dr, dc] of DIRS) {
      const line = [];
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc) && b[nr][nc] === -color) {
        line.push([nr, nc]);
        nr += dr;
        nc += dc;
      }
      if (line.length && inBounds(nr, nc) && b[nr][nc] === color) {
        flips.push(...line);
      }
    }
    return flips;
  }

  function legalMoves(b, color) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const flips = flipsFor(b, r, c, color);
        if (flips.length) moves.push({ r, c, flips });
      }
    }
    return moves;
  }

  function applyMove(b, move, color) {
    const next = cloneBoard(b);
    next[move.r][move.c] = color;
    for (const [fr, fc] of move.flips) next[fr][fc] = color;
    return next;
  }

  function count(b, color) {
    let n = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === color) n++;
      }
    }
    return n;
  }

  function evaluate(b) {
    let score = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === BLACK) score += WEIGHTS[r][c];
        else if (b[r][c] === WHITE) score -= WEIGHTS[r][c];
      }
    }
    score += (legalMoves(b, BLACK).length - legalMoves(b, WHITE).length) * 3;
    return score;
  }

  function minimax(b, depth, maximizing, alpha, beta) {
    const color = maximizing ? BLACK : WHITE;
    const moves = legalMoves(b, color);
    if (depth === 0) return evaluate(b);

    if (!moves.length) {
      const opp = legalMoves(b, -color);
      if (!opp.length) {
        const bc = count(b, BLACK);
        const wc = count(b, WHITE);
        if (bc > wc) return 100000;
        if (wc > bc) return -100000;
        return 0;
      }
      return minimax(b, depth - 1, !maximizing, alpha, beta);
    }

    if (maximizing) {
      let best = -Infinity;
      for (const m of moves) {
        const val = minimax(applyMove(b, m, color), depth - 1, false, alpha, beta);
        best = Math.max(best, val);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }

    let best = Infinity;
    for (const m of moves) {
      const val = minimax(applyMove(b, m, color), depth - 1, true, alpha, beta);
      best = Math.min(best, val);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  function pickAIMove() {
    const moves = legalMoves(board, WHITE);
    if (!moves.length) return null;
    const mode = LEVELS[level].ai;

    if (mode === "random") {
      const edges = moves.filter(
        (m) => m.r === 0 || m.r === 7 || m.c === 0 || m.c === 7
      );
      const pool = Math.random() < 0.3 && edges.length ? edges : moves;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    if (mode === "greedy") {
      const corners = moves.filter(
        (m) =>
          (m.r === 0 || m.r === 7) && (m.c === 0 || m.c === 7)
      );
      if (corners.length) return corners[0];
      moves.sort((a, b) => b.flips.length - a.flips.length);
      return moves[0];
    }

    let bestScore = Infinity;
    let best = [];
    for (const m of moves) {
      const score = minimax(applyMove(board, m, WHITE), 2, true, -Infinity, Infinity);
      if (score < bestScore) {
        bestScore = score;
        best = [m];
      } else if (score === bestScore) best.push(m);
    }
    return best[Math.floor(Math.random() * best.length)];
  }

  function pushHistory() {
    history.push({
      board: cloneBoard(board),
      current,
      undosLeft,
    });
  }

  function updateScore() {
    const b = count(board, BLACK);
    const w = count(board, WHITE);
    $("#scoreLabel").textContent = "● " + b + " · ○ " + w;
  }

  function updateButtons() {
    const cfg = LEVELS[level];
    $("#hintBtn").classList.toggle("hidden", !cfg.hint);
    $("#hintBtn").disabled = gameOver || aiThinking || current !== BLACK;
    const showUndo = cfg.undo > 0;
    $("#undoBtn").classList.toggle("hidden", !showUndo);
    $("#undoBtn").disabled =
      !showUndo || history.length === 0 || undosLeft <= 0 || aiThinking || gameOver;
    $("#undoBtn").textContent =
      cfg.undo === Infinity ? "Undo" : "Undo (" + undosLeft + ")";
  }

  function render() {
    const boardEl = $("#board");
    boardEl.innerHTML = "";
    const legalKeys = new Set(legal.map((m) => m.r + "," + m.c));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const sq = document.createElement("div");
        sq.className = "square";
        const key = r + "," + c;
        if (
          !gameOver &&
          !aiThinking &&
          current === BLACK &&
          legalKeys.has(key)
        ) {
          sq.classList.add("legal");
        }
        if (hintSquare && hintSquare.r === r && hintSquare.c === c) {
          sq.classList.add("hint");
        }
        if (board[r][c] === BLACK) {
          const d = document.createElement("div");
          d.className = "disc black";
          sq.appendChild(d);
        } else if (board[r][c] === WHITE) {
          const d = document.createElement("div");
          d.className = "disc white";
          sq.appendChild(d);
        }
        sq.addEventListener("click", () => onClick(r, c));
        boardEl.appendChild(sq);
      }
    }
    updateScore();
    updateButtons();
  }

  function endGame() {
    gameOver = true;
    legal = [];
    hintSquare = null;
    aiThinking = false;
    const b = count(board, BLACK);
    const w = count(board, WHITE);
    let title;
    let msg;
    if (b > w) {
      title = "You win!";
      msg = "Black " + b + " – White " + w;
    } else if (w > b) {
      title = "You lose";
      msg = "Black " + b + " – White " + w;
    } else {
      title = "Draw";
      msg = "Both have " + b + " discs.";
    }
    $("#turnLabel").textContent = title;
    $("#resultTitle").textContent = title;
    $("#resultMessage").textContent = msg;
    $("#resultOverlay").classList.remove("hidden");
    render();
  }

  function afterMove() {
    hintSquare = null;
    const mover = current;
    const opp = -mover;
    const oppMoves = legalMoves(board, opp);
    if (oppMoves.length) {
      current = opp;
      if (current === WHITE) startAI();
      else beginPlayer();
      return;
    }
    const again = legalMoves(board, mover);
    if (!again.length) {
      endGame();
      return;
    }
    $("#turnLabel").textContent =
      opp === WHITE ? "AI passes — your turn" : "You pass — AI turn";
    if (mover === WHITE) startAI();
    else beginPlayer();
  }

  function beginPlayer() {
    current = BLACK;
    aiThinking = false;
    legal = legalMoves(board, BLACK);
    $("#turnLabel").classList.remove("ai");
    if (!legal.length) {
      const aiMoves = legalMoves(board, WHITE);
      if (!aiMoves.length) {
        endGame();
        return;
      }
      $("#turnLabel").textContent = "You pass — AI turn";
      startAI();
      return;
    }
    $("#turnLabel").textContent = "Your turn";
    render();
  }

  function startAI() {
    current = WHITE;
    aiThinking = true;
    legal = [];
    hintSquare = null;
    $("#turnLabel").textContent = "AI thinking…";
    $("#turnLabel").classList.add("ai");
    render();
    setTimeout(() => {
      if (gameOver) return;
      const move = pickAIMove();
      if (!move) {
        afterMove();
        return;
      }
      board = applyMove(board, move, WHITE);
      aiThinking = false;
      afterMove();
    }, LEVELS[level].delay);
  }

  function onClick(r, c) {
    if (gameOver || aiThinking || current !== BLACK) return;
    const move = legal.find((m) => m.r === r && m.c === c);
    if (!move) return;
    pushHistory();
    board = applyMove(board, move, BLACK);
    afterMove();
  }

  function doHint() {
    if (!LEVELS[level].hint || gameOver || aiThinking || current !== BLACK) return;
    if (!legal.length) return;
    const corners = legal.filter(
      (m) => (m.r === 0 || m.r === 7) && (m.c === 0 || m.c === 7)
    );
    hintSquare = corners[0] || legal.slice().sort((a, b) => b.flips.length - a.flips.length)[0];
    render();
  }

  function doUndo() {
    if (undosLeft <= 0 || !history.length || aiThinking || gameOver) return;
    const snap = history.pop();
    board = snap.board;
    current = snap.current;
    undosLeft--;
    hintSquare = null;
    gameOver = false;
    $("#resultOverlay").classList.add("hidden");
    if (current === BLACK) beginPlayer();
    else startAI();
  }

  function startGame(selectedLevel) {
    level = selectedLevel;
    const cfg = LEVELS[level];
    $("#levelBadge").textContent = cfg.label;
    board = createBoard();
    current = BLACK;
    gameOver = false;
    aiThinking = false;
    hintSquare = null;
    history = [];
    undosLeft = cfg.undo;
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    beginPlayer();
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
    $("#newGameBtn").addEventListener("click", () => startGame(level));
    $("#playAgainBtn").addEventListener("click", () => startGame(level));
    $("#changeLevelBtn").addEventListener("click", goToLevel);
    $("#changeLevelFromResultBtn").addEventListener("click", goToLevel);
    $("#hintBtn").addEventListener("click", doHint);
    $("#undoBtn").addEventListener("click", doUndo);
    $("#helpBtnLevel").addEventListener("click", () =>
      $("#helpOverlay").classList.remove("hidden")
    );
    $("#helpBtnGame").addEventListener("click", () =>
      $("#helpOverlay").classList.remove("hidden")
    );
    $("#helpClose").addEventListener("click", () =>
      $("#helpOverlay").classList.add("hidden")
    );
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") $("#helpOverlay").classList.add("hidden");
    });
  });
})();
