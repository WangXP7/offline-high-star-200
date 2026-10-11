(function () {
  "use strict";

  const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316"];
  const LEVELS = {
    easy: { colors: 4, rows: 4, speed: 6 },
    medium: { colors: 5, rows: 5, speed: 8 },
    hard: { colors: 6, rows: 6, speed: 10 },
  };

  const COLS = 8;
  const R = 18;
  const ROW_H = R * 1.75;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let state = {
    level: "easy",
    grid: [],
    score: 0,
    aimAngle: -Math.PI / 2,
    current: 0,
    next: 0,
    flying: null,
    running: false,
    gameOver: false,
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  function cfg() {
    return LEVELS[state.level];
  }

  function colsInRow(row) {
    return row % 2 === 0 ? COLS : COLS - 1;
  }

  function cellCenter(row, col) {
    const odd = row % 2 === 1;
    const x = R + col * (R * 2) + (odd ? R : 0) + 8;
    const y = R + row * ROW_H + 8;
    return { x, y };
  }

  function randomColor() {
    return Math.floor(Math.random() * cfg().colors);
  }

  function initGrid() {
    state.grid = [];
    const rows = cfg().rows;
    for (let r = 0; r < rows; r++) {
      const row = [];
      const n = colsInRow(r);
      for (let c = 0; c < n; c++) row.push(randomColor());
      state.grid.push(row);
    }
  }

  function neighbors(row, col) {
    const odd = row % 2 === 1;
    const deltas = odd
      ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]
      : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
    const out = [];
    for (const [dr, dc] of deltas) {
      const rr = row + dr;
      const cc = col + dc;
      if (rr >= 0 && rr < state.grid.length && cc >= 0 && cc < state.grid[rr].length && state.grid[rr][cc] !== null) {
        out.push([rr, cc]);
      }
    }
    return out;
  }

  function findCluster(row, col) {
    const color = state.grid[row][col];
    if (color === null) return [];
    const visited = new Set();
    const stack = [[row, col]];
    const cluster = [];
    while (stack.length) {
      const [r, c] = stack.pop();
      const key = r + "," + c;
      if (visited.has(key)) continue;
      visited.add(key);
      if (state.grid[r][c] !== color) continue;
      cluster.push([r, c]);
      neighbors(r, c).forEach(([nr, nc]) => stack.push([nr, nc]));
    }
    return cluster;
  }

  function connectedToCeiling() {
    const visited = new Set();
    const stack = [];
    if (!state.grid.length) return visited;
    for (let c = 0; c < state.grid[0].length; c++) {
      if (state.grid[0][c] !== null) stack.push([0, c]);
    }
    while (stack.length) {
      const [r, c] = stack.pop();
      const key = r + "," + c;
      if (visited.has(key)) continue;
      visited.add(key);
      neighbors(r, c).forEach(([nr, nc]) => stack.push([nr, nc]));
    }
    return visited;
  }

  function dropOrphans() {
    const connected = connectedToCeiling();
    let dropped = 0;
    for (let r = 0; r < state.grid.length; r++) {
      for (let c = 0; c < state.grid[r].length; c++) {
        if (state.grid[r][c] !== null && !connected.has(r + "," + c)) {
          state.grid[r][c] = null;
          dropped++;
        }
      }
    }
    while (state.grid.length && state.grid[state.grid.length - 1].every((v) => v === null)) {
      state.grid.pop();
    }
    return dropped;
  }

  function snapBubble(x, y, color) {
    let best = null;
    let bestDist = Infinity;
    const maxRows = Math.max(state.grid.length + 1, cfg().rows + 2);
    for (let r = 0; r < maxRows; r++) {
      const n = colsInRow(r);
      if (!state.grid[r]) state.grid[r] = Array(n).fill(null);
      while (state.grid[r].length < n) state.grid[r].push(null);
      for (let c = 0; c < n; c++) {
        if (state.grid[r][c] !== null) continue;
        const p = cellCenter(r, c);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestDist) {
          bestDist = d;
          best = { r, c };
        }
      }
    }
    if (!best) return;
    const n = colsInRow(best.r);
    if (!state.grid[best.r]) state.grid[best.r] = Array(n).fill(null);
    state.grid[best.r][best.c] = color;
    const cluster = findCluster(best.r, best.c);
    if (cluster.length >= 3) {
      cluster.forEach(([r, c]) => {
        state.grid[r][c] = null;
      });
      state.score += cluster.length * 10;
      const dropped = dropOrphans();
      state.score += dropped * 15;
    }
    $("#scoreDisplay").textContent = "Score: " + state.score;
    checkEnd();
  }

  function checkEnd() {
    let any = false;
    let tooLow = false;
    const dangerY = canvas.height - 80;
    for (let r = 0; r < state.grid.length; r++) {
      for (let c = 0; c < state.grid[r].length; c++) {
        if (state.grid[r][c] !== null) {
          any = true;
          if (cellCenter(r, c).y + R > dangerY) tooLow = true;
        }
      }
    }
    if (!any) {
      endGame(true);
    } else if (tooLow) {
      endGame(false);
    }
  }

  function endGame(won) {
    state.gameOver = true;
    state.running = false;
    state.flying = null;
    $("#resultTitle").textContent = won ? "You cleared it!" : "Game Over";
    $("#resultMsg").textContent = "Score: " + state.score;
    $("#resultOverlay").classList.remove("hidden");
  }

  function shoot() {
    if (!state.running || state.flying || state.gameOver) return;
    const speed = cfg().speed;
    state.flying = {
      x: canvas.width / 2,
      y: canvas.height - 40,
      vx: Math.cos(state.aimAngle) * speed,
      vy: Math.sin(state.aimAngle) * speed,
      color: state.current,
    };
    state.current = state.next;
    state.next = randomColor();
  }

  function update() {
    if (!state.flying) return;
    const b = state.flying;
    b.x += b.vx;
    b.y += b.vy;
    if (b.x - R < 0) {
      b.x = R;
      b.vx *= -1;
    }
    if (b.x + R > canvas.width) {
      b.x = canvas.width - R;
      b.vx *= -1;
    }
    if (b.y - R <= 0) {
      snapBubble(b.x, R, b.color);
      state.flying = null;
      return;
    }
    for (let r = 0; r < state.grid.length; r++) {
      for (let c = 0; c < state.grid[r].length; c++) {
        if (state.grid[r][c] === null) continue;
        const p = cellCenter(r, c);
        if (Math.hypot(p.x - b.x, p.y - b.y) < R * 1.85) {
          snapBubble(b.x, b.y, b.color);
          state.flying = null;
          return;
        }
      }
    }
  }

  function drawBubble(x, y, colorIndex) {
    ctx.beginPath();
    ctx.arc(x, y, R - 1, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // danger line
    ctx.strokeStyle = "rgba(239,68,68,0.5)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80);
    ctx.lineTo(canvas.width, canvas.height - 80);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let r = 0; r < state.grid.length; r++) {
      for (let c = 0; c < state.grid[r].length; c++) {
        if (state.grid[r][c] === null) continue;
        const p = cellCenter(r, c);
        drawBubble(p.x, p.y, state.grid[r][c]);
      }
    }

    // aim line
    if (!state.flying && state.running) {
      const sx = canvas.width / 2;
      const sy = canvas.height - 40;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      let ax = sx;
      let ay = sy;
      let vx = Math.cos(state.aimAngle);
      let vy = Math.sin(state.aimAngle);
      for (let i = 0; i < 80; i++) {
        ax += vx * 8;
        ay += vy * 8;
        if (ax < R || ax > canvas.width - R) vx *= -1;
        if (ay < 0) break;
        ctx.lineTo(ax, ay);
      }
      ctx.stroke();
    }

    if (state.flying) drawBubble(state.flying.x, state.flying.y, state.flying.color);
    else if (state.running) drawBubble(canvas.width / 2, canvas.height - 40, state.current);

    // next preview
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px Outfit, sans-serif";
    ctx.fillText("Next", 12, canvas.height - 12);
    drawBubble(50, canvas.height - 28, state.next);
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function setAimFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const sx = canvas.width / 2;
    const sy = canvas.height - 40;
    let angle = Math.atan2(y - sy, x - sx);
    const minA = -Math.PI + 0.2;
    const maxA = -0.2;
    if (angle > 0) angle = -0.2;
    state.aimAngle = Math.max(minA, Math.min(maxA, angle));
  }

  function startNewGame() {
    initGrid();
    state.score = 0;
    state.current = randomColor();
    state.next = randomColor();
    state.flying = null;
    state.gameOver = false;
    state.running = true;
    state.aimAngle = -Math.PI / 2;
    $("#scoreDisplay").textContent = "Score: 0";
    $("#resultOverlay").classList.add("hidden");
    draw();
    requestAnimationFrame(loop);
  }

  function startGame(level) {
    state.level = level;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    $("#levelBadge").textContent = level.charAt(0).toUpperCase() + level.slice(1);
    startNewGame();
  }

  function goToLevelScreen() {
    state.running = false;
    $("#gameScreen").classList.add("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".level-btn").forEach((btn) => btn.addEventListener("click", () => startGame(btn.dataset.level)));
    $("#newGameBtn").addEventListener("click", startNewGame);
    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);
    $("#playAgainBtn").addEventListener("click", startNewGame);
    $("#changeLevelFromResultBtn").addEventListener("click", goToLevelScreen);
    $("#fireBtn").addEventListener("click", shoot);
    canvas.addEventListener("mousemove", setAimFromEvent);
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      setAimFromEvent(e);
    }, { passive: false });
    canvas.addEventListener("click", shoot);
    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      shoot();
    });
    $("#helpBtnLevel").addEventListener("click", () => $("#helpOverlay").classList.remove("hidden"));
    $("#helpBtnGame").addEventListener("click", () => $("#helpOverlay").classList.remove("hidden"));
    $("#helpClose").addEventListener("click", () => $("#helpOverlay").classList.add("hidden"));
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") $("#helpOverlay").classList.add("hidden");
    });
  });
})();
