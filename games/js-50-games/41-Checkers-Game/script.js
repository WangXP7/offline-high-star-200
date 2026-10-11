/**
 * Talha - Checkers Game
 * American draughts: 8×8, optional captures, multi-jump.
 * Board: 0 empty | 1 red man | 2 red king | -1 black man | -2 black king
 * Player Red vs AI Black.
 * Easy = random (prefer capture); Medium = minimax depth 2; Hard = depth 4.
 */

(() => {
  "use strict";

  const SIZE = 8;
  const LEVELS = {
    easy: { label: "Easy", depth: 0 },
    medium: { label: "Medium", depth: 2 },
    hard: { label: "Hard", depth: 4 },
  };

  const levelScreen = document.getElementById("levelScreen");
  const gameScreen = document.getElementById("gameScreen");
  const boardEl = document.getElementById("board");
  const levelBadge = document.getElementById("levelBadge");
  const turnLabel = document.getElementById("turnLabel");
  const resultOverlay = document.getElementById("resultOverlay");
  const resultTitle = document.getElementById("resultTitle");
  const resultMessage = document.getElementById("resultMessage");
  const helpOverlay = document.getElementById("helpOverlay");

  let board = [];
  let level = "easy";
  let currentPlayer = 1;
  let selected = null;
  let legalMoves = [];
  let allPlayerMoves = [];
  let gameOver = false;
  let aiThinking = false;
  let animating = false;
  let positionHistory = [];

  // ----- Board helpers -----

  function isDark(r, c) {
    return (r + c) % 2 === 1;
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function cloneBoard(b) {
    return b.map((row) => row.slice());
  }

  function pieceOwner(v) {
    if (v > 0) return 1;
    if (v < 0) return -1;
    return 0;
  }

  function isKing(v) {
    return Math.abs(v) === 2;
  }

  function boardKey(b, player) {
    return player + "|" + b.map((row) => row.join(",")).join(";");
  }

  function createInitialBoard() {
    const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!isDark(r, c)) continue;
        if (r < 3) b[r][c] = -1;
        else if (r > 4) b[r][c] = 1;
      }
    }
    return b;
  }

  function moveDirs(piece) {
    if (isKing(piece)) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    if (piece === 1) return [[-1, -1], [-1, 1]]; // red forward (toward row 0)
    return [[1, -1], [1, 1]]; // black forward (toward row 7)
  }

  // ----- Move generation -----

  function getQuietMovesFrom(b, r, c) {
    const piece = b[r][c];
    const moves = [];
    for (const [dr, dc] of moveDirs(piece)) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && isDark(nr, nc) && b[nr][nc] === 0) {
        moves.push({
          from: { r, c },
          path: [{ r: nr, c: nc }],
          captures: [],
        });
      }
    }
    return moves;
  }

  function getJumpsFrom(b, startR, startC) {
    const results = [];
    const startPiece = b[startR][startC];

    function dfs(curB, r, c, path, captures, pieceVal) {
      let extended = false;
      for (const [dr, dc] of moveDirs(pieceVal)) {
        const mr = r + dr;
        const mc = c + dc;
        const lr = r + 2 * dr;
        const lc = c + 2 * dc;
        if (!inBounds(lr, lc) || !isDark(lr, lc)) continue;
        if (curB[lr][lc] !== 0) continue;
        const mid = curB[mr][mc];
        if (pieceOwner(mid) !== -pieceOwner(pieceVal)) continue;
        if (captures.some((cap) => cap.r === mr && cap.c === mc)) continue;

        extended = true;
        const nextB = cloneBoard(curB);
        nextB[r][c] = 0;
        nextB[mr][mc] = 0;
        nextB[lr][lc] = pieceVal;

        dfs(
          nextB,
          lr,
          lc,
          path.concat([{ r: lr, c: lc }]),
          captures.concat([{ r: mr, c: mc }]),
          pieceVal
        );
      }

      if (!extended && path.length > 0) {
        results.push({
          from: { r: startR, c: startC },
          path: path.slice(),
          captures: captures.slice(),
        });
      }
    }

    dfs(b, startR, startC, [], [], startPiece);
    return results;
  }

  function getAllMoves(b, player) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (pieceOwner(b[r][c]) !== player) continue;
        moves.push(...getJumpsFrom(b, r, c));
        moves.push(...getQuietMovesFrom(b, r, c));
      }
    }
    return moves;
  }

  function applyMove(b, move) {
    const next = cloneBoard(b);
    const { from, path, captures } = move;
    let piece = next[from.r][from.c];
    next[from.r][from.c] = 0;
    for (const cap of captures) next[cap.r][cap.c] = 0;
    const dest = path[path.length - 1];
    if (piece === 1 && dest.r === 0) piece = 2;
    if (piece === -1 && dest.r === SIZE - 1) piece = -2;
    next[dest.r][dest.c] = piece;
    return next;
  }

  function countPieces(b, player) {
    let n = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (pieceOwner(b[r][c]) === player) n++;
      }
    }
    return n;
  }

  // ----- Evaluation & AI -----

  function evaluate(b) {
    let score = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = b[r][c];
        if (v === 0) continue;
        let val = Math.abs(v) === 2 ? 175 : 100;
        if (v === 1) val += (SIZE - 1 - r) * 3;
        if (v === -1) val += r * 3;
        val += (3 - Math.abs(c - 3.5)) * 2;
        score += v > 0 ? val : -val;
      }
    }
    return score;
  }

  function minimax(b, depth, maximizing, alpha, beta) {
    const player = maximizing ? 1 : -1;
    const moves = getAllMoves(b, player);

    if (depth === 0 || moves.length === 0) {
      if (moves.length === 0) {
        return maximizing ? -100000 + depth : 100000 - depth;
      }
      return evaluate(b);
    }

    if (maximizing) {
      let best = -Infinity;
      for (const m of moves) {
        const val = minimax(applyMove(b, m), depth - 1, false, alpha, beta);
        best = Math.max(best, val);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }

    let best = Infinity;
    for (const m of moves) {
      const val = minimax(applyMove(b, m), depth - 1, true, alpha, beta);
      best = Math.min(best, val);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  function pickAIMove() {
    const moves = getAllMoves(board, -1);
    if (!moves.length) return null;

    if (level === "easy") {
      const captures = moves.filter((m) => m.captures.length > 0);
      const pool = captures.length ? captures : moves;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const depth = LEVELS[level].depth;
    let bestScore = Infinity;
    let bestMoves = [];

    for (const m of moves) {
      const score = minimax(applyMove(board, m), depth - 1, true, -Infinity, Infinity);
      if (score < bestScore) {
        bestScore = score;
        bestMoves = [m];
      } else if (score === bestScore) {
        bestMoves.push(m);
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  // ----- UI -----

  function movesFromSquare(r, c) {
    return allPlayerMoves.filter((m) => m.from.r === r && m.from.c === c);
  }

  function renderBoard() {
    boardEl.innerHTML = "";

    const moveTargets = new Map();
    for (const m of legalMoves) {
      const dest = m.path[m.path.length - 1];
      const key = dest.r + "," + dest.c;
      if (!moveTargets.has(key)) moveTargets.set(key, []);
      moveTargets.get(key).push(m);
    }

    const captureOrigins = new Set();
    for (const m of allPlayerMoves) {
      if (m.captures.length) captureOrigins.add(m.from.r + "," + m.from.c);
    }

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const sq = document.createElement("div");
        sq.className = "square " + (isDark(r, c) ? "dark" : "light");
        sq.dataset.r = String(r);
        sq.dataset.c = String(c);
        sq.setAttribute("role", "gridcell");

        if (selected && selected.r === r && selected.c === c) {
          sq.classList.add("selected");
        }

        const tKey = r + "," + c;
        if (moveTargets.has(tKey)) {
          sq.classList.add("highlight");
          if (moveTargets.get(tKey).some((m) => m.captures.length)) {
            sq.classList.add("capture");
          }
        }

        if (
          currentPlayer === 1 &&
          !aiThinking &&
          !animating &&
          !selected &&
          captureOrigins.has(tKey)
        ) {
          sq.classList.add("can-capture");
        }

        const v = board[r][c];
        if (v !== 0) {
          const piece = document.createElement("div");
          piece.className =
            "piece " + (v > 0 ? "red" : "black") + (isKing(v) ? " king" : "");
          if (aiThinking || animating || gameOver || currentPlayer !== 1 || v < 0) {
            piece.classList.add("disabled");
          }
          sq.appendChild(piece);
        }

        sq.addEventListener("click", () => onSquareClick(r, c));
        boardEl.appendChild(sq);
      }
    }
  }

  function onSquareClick(r, c) {
    if (gameOver || aiThinking || animating || currentPlayer !== 1) return;

    const destMoves = legalMoves.filter((m) => {
      const dest = m.path[m.path.length - 1];
      return dest.r === r && dest.c === c;
    });

    if (destMoves.length && selected) {
      destMoves.sort((a, b) => b.captures.length - a.captures.length);
      executePlayerMove(destMoves[0]);
      return;
    }

    if (pieceOwner(board[r][c]) === 1) {
      const pieceMoves = movesFromSquare(r, c);
      if (!pieceMoves.length) {
        selected = null;
        legalMoves = [];
        renderBoard();
        return;
      }
      selected = { r, c };
      legalMoves = pieceMoves;
      renderBoard();
      return;
    }

    selected = null;
    legalMoves = [];
    renderBoard();
  }

  function squareEl(r, c) {
    return boardEl.querySelector('.square[data-r="' + r + '"][data-c="' + c + '"]');
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function waitTransition(el) {
    return new Promise((resolve) => {
      const done = () => {
        el.removeEventListener("transitionend", done);
        resolve();
      };
      el.addEventListener("transitionend", done);
      setTimeout(resolve, 280);
    });
  }

  async function animateMove(move) {
    animating = true;
    boardEl.classList.add("animating");

    const fromSq = squareEl(move.from.r, move.from.c);
    const pieceEl = fromSq && fromSq.querySelector(".piece");
    if (!fromSq || !pieceEl) {
      board = applyMove(board, move);
      animating = false;
      boardEl.classList.remove("animating");
      return;
    }

    const boardRect = boardEl.getBoundingClientRect();
    const fromRect = fromSq.getBoundingClientRect();
    const pieceSize = fromRect.width * 0.72;

    const flying = pieceEl.cloneNode(true);
    flying.classList.add("flying");
    flying.classList.remove("disabled");
    flying.style.width = pieceSize + "px";
    flying.style.height = pieceSize + "px";
    flying.style.left = fromRect.left - boardRect.left + (fromRect.width - pieceSize) / 2 + "px";
    flying.style.top = fromRect.top - boardRect.top + (fromRect.height - pieceSize) / 2 + "px";
    boardEl.appendChild(flying);
    fromSq.classList.add("anim-source");

    const steps = [{ r: move.from.r, c: move.from.c }, ...move.path];

    for (let i = 1; i < steps.length; i++) {
      const dest = steps[i];
      const destSq = squareEl(dest.r, dest.c);
      if (!destSq) continue;
      const destRect = destSq.getBoundingClientRect();

      // Fade captured piece between previous and this landing
      if (move.captures[i - 1]) {
        const cap = move.captures[i - 1];
        const capSq = squareEl(cap.r, cap.c);
        const capPiece = capSq && capSq.querySelector(".piece");
        if (capPiece) {
          capPiece.classList.add("capturing");
        }
      }

      void flying.offsetWidth;
      flying.style.left =
        destRect.left - boardRect.left + (destRect.width - pieceSize) / 2 + "px";
      flying.style.top =
        destRect.top - boardRect.top + (destRect.height - pieceSize) / 2 + "px";
      await waitTransition(flying);
      await wait(40);
    }

    flying.classList.add("landing");
    await wait(80);

    board = applyMove(board, move);
    flying.remove();
    animating = false;
    boardEl.classList.remove("animating");
  }

  async function executePlayerMove(move) {
    selected = null;
    legalMoves = [];
    allPlayerMoves = [];
    renderBoard();
    await animateMove(move);
    afterMove(1);
  }

  function afterMove(whoMoved) {
    const nextPlayer = -whoMoved;
    positionHistory.push(boardKey(board, nextPlayer));

    if (countPieces(board, nextPlayer) === 0) {
      endGame(
        whoMoved === 1 ? "win" : "lose",
        whoMoved === 1
          ? "All black pieces captured."
          : "All your pieces were captured."
      );
      return;
    }

    const nextMoves = getAllMoves(board, nextPlayer);
    if (nextMoves.length === 0) {
      endGame(
        whoMoved === 1 ? "win" : "lose",
        whoMoved === 1
          ? "Black has no legal moves."
          : "You have no legal moves."
      );
      return;
    }

    const key = boardKey(board, nextPlayer);
    if (positionHistory.filter((h) => h === key).length >= 3) {
      endGame("draw", "The same position repeated three times.");
      return;
    }

    currentPlayer = nextPlayer;
    if (currentPlayer === -1) {
      startAITurn();
    } else {
      beginPlayerTurn();
    }
  }

  function beginPlayerTurn() {
    currentPlayer = 1;
    aiThinking = false;
    selected = null;
    legalMoves = [];
    allPlayerMoves = getAllMoves(board, 1);
    turnLabel.textContent = "Your turn";
    turnLabel.classList.remove("ai-thinking");
    renderBoard();

    const origins = new Set(
      allPlayerMoves.map((m) => m.from.r + "," + m.from.c)
    );
    if (origins.size === 1) {
      const [rc] = origins;
      const [r, c] = rc.split(",").map(Number);
      selected = { r, c };
      legalMoves = movesFromSquare(r, c);
      renderBoard();
    }
  }

  function startAITurn() {
    currentPlayer = -1;
    aiThinking = true;
    turnLabel.textContent = "AI thinking…";
    turnLabel.classList.add("ai-thinking");
    selected = null;
    legalMoves = [];
    allPlayerMoves = [];
    renderBoard();

    const delay = level === "hard" ? 300 : 200;
    setTimeout(async () => {
      if (gameOver) return;
      const move = pickAIMove();
      if (!move) {
        endGame("win", "Black has no legal moves.");
        return;
      }
      await animateMove(move);
      aiThinking = false;
      afterMove(-1);
    }, delay);
  }

  function endGame(result, message) {
    gameOver = true;
    aiThinking = false;
    turnLabel.textContent =
      result === "win" ? "You win!" : result === "lose" ? "You lose" : "Draw";
    turnLabel.classList.remove("ai-thinking");
    resultTitle.textContent =
      result === "win" ? "You win!" : result === "lose" ? "You lose" : "Draw";
    resultTitle.className = result === "win" ? "" : result;
    resultMessage.textContent = message;
    resultOverlay.classList.remove("hidden");
    renderBoard();
  }

  function startGame(selectedLevel) {
    level = selectedLevel;
    levelBadge.textContent = LEVELS[level].label;
    board = createInitialBoard();
    gameOver = false;
    aiThinking = false;
    selected = null;
    legalMoves = [];
    allPlayerMoves = [];
    positionHistory = [boardKey(board, 1)];
    resultOverlay.classList.add("hidden");
    levelScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    beginPlayerTurn();
  }

  function showLevelScreen() {
    gameScreen.classList.add("hidden");
    levelScreen.classList.remove("hidden");
    resultOverlay.classList.add("hidden");
  }

  function openHelp() {
    helpOverlay.classList.remove("hidden");
    helpOverlay.setAttribute("aria-hidden", "false");
  }

  function closeHelp() {
    helpOverlay.classList.add("hidden");
    helpOverlay.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => startGame(btn.dataset.level));
  });

  document.getElementById("newGameBtn").addEventListener("click", () => {
    startGame(level);
  });
  document.getElementById("playAgainBtn").addEventListener("click", () => {
    startGame(level);
  });
  document.getElementById("changeLevelBtn").addEventListener("click", showLevelScreen);
  document
    .getElementById("changeLevelFromResultBtn")
    .addEventListener("click", showLevelScreen);

  document.getElementById("helpBtnLevel").addEventListener("click", openHelp);
  document.getElementById("helpBtnGame").addEventListener("click", openHelp);
  document.getElementById("helpClose").addEventListener("click", closeHelp);
  helpOverlay.addEventListener("click", (e) => {
    if (e.target === helpOverlay) closeHelp();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeHelp();
  });
})();
