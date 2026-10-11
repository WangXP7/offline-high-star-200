/**
 * Talha - Frogger Game
 * Classic fixed-screen Frogger with hop animation and HD canvas rendering.
 */

(function () {
  "use strict";

  const COLS = 13;
  const ROWS = 13;
  const CELL = 40;
  const WIDTH = COLS * CELL;
  const HEIGHT = ROWS * CELL;
  const HOP_MS = 160;

  const HOME_ROW = 0;
  const RIVER_ROWS = [1, 2, 3, 4, 5];
  const MEDIAN_ROW = 6;
  const ROAD_ROWS = [7, 8, 9, 10, 11];
  const START_ROW = 12;
  const HOME_COLS = [1, 3, 6, 9, 11];
  const DIVE_TURTLE_ROWS = [2, 4];

  const LEVELS = {
    easy: {
      label: "Easy",
      lives: 5,
      homesNeeded: 3,
      timer: 45,
      traffic: 0.7,
      diving: false,
      snake: false,
      rounds: 1,
    },
    medium: {
      label: "Medium",
      lives: 3,
      homesNeeded: 5,
      timer: 35,
      traffic: 1.0,
      diving: true,
      snake: false,
      rounds: 1,
    },
    hard: {
      label: "Hard",
      lives: 3,
      homesNeeded: 5,
      timer: 28,
      traffic: 1.3,
      diving: true,
      snake: true,
      rounds: 2,
    },
  };

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const state = {
    level: "easy",
    score: 0,
    lives: 5,
    homesFilled: 0,
    homes: [false, false, false, false, false],
    timer: 45,
    round: 1,
    running: false,
    gameOver: false,
    won: false,
    frog: null,
    hop: null,
    cars: [],
    floaters: [],
    snake: null,
    lastTs: 0,
    maxRowReached: START_ROW,
    animTime: 0,
  };

  function setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(WIDTH * dpr);
    canvas.height = Math.round(HEIGHT * dpr);
    canvas.style.width = "100%";
    canvas.style.maxWidth = WIDTH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
  }

  function cfg() {
    return LEVELS[state.level];
  }

  function speedScale() {
    const roundBoost = state.round > 1 ? 1.15 : 1;
    return cfg().traffic * roundBoost;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frogDrawPos() {
    const f = state.frog;
    if (!f) return { x: 0, y: 0 };
    if (state.hop) {
      const t = easeOutCubic(Math.min(1, state.hop.elapsed / state.hop.duration));
      const x = state.hop.fromX + (state.hop.toX - state.hop.fromX) * t;
      const y = state.hop.fromY + (state.hop.toY - state.hop.fromY) * t;
      const arc = Math.sin(t * Math.PI) * (CELL * 0.28);
      return { x, y: y - arc, t, hopping: true };
    }
    return { x: f.x, y: f.row * CELL, hopping: false, t: 1 };
  }

  function frogHitbox() {
    const pos = frogDrawPos();
    const pad = 7;
    return {
      x: pos.x + pad,
      y: pos.y + pad,
      w: CELL - pad * 2,
      h: CELL - pad * 2,
    };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function createFrog() {
    const col = 6;
    return {
      col,
      row: START_ROW,
      x: col * CELL,
      riding: null,
      facing: "up",
      legPhase: 0,
    };
  }

  function spawnLaneVehicles(row, dir, count, gap, baseSpeed, colors, kind) {
    const scale = speedScale();
    const speed = baseSpeed * scale * dir;
    const items = [];
    const totalSpan = WIDTH + gap * count;
    for (let i = 0; i < count; i++) {
      const w = kind === "car" ? CELL * (1.45 + (i % 3) * 0.4) : CELL * (2.1 + (i % 2) * 0.55);
      let x = (i * gap) % totalSpan - CELL;
      if (dir < 0) x = WIDTH - x - w;
      items.push({
        x,
        y: row * CELL + 5,
        w,
        h: CELL - 10,
        vx: speed,
        row,
        color: colors[i % colors.length],
        kind,
        style: i % 3,
        submerged: false,
        divePhase: Math.random() * Math.PI * 2,
        divePeriod: 3.2 + (i % 3) * 0.6,
      });
    }
    return items;
  }

  function buildTraffic() {
    const cars = [];
    const floaters = [];
    const carColors = ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#e67e22", "#1abc9c"];
    const roadSpecs = [
      { row: 11, dir: 1, count: 3, gap: 200, speed: 55, colors: carColors },
      { row: 10, dir: -1, count: 3, gap: 220, speed: 70, colors: carColors },
      { row: 9, dir: 1, count: 2, gap: 260, speed: 90, colors: carColors },
      { row: 8, dir: -1, count: 3, gap: 210, speed: 60, colors: carColors },
      { row: 7, dir: 1, count: 2, gap: 280, speed: 100, colors: carColors },
    ];
    roadSpecs.forEach((s) => {
      cars.push(...spawnLaneVehicles(s.row, s.dir, s.count, s.gap, s.speed, s.colors, "car"));
    });

    const riverSpecs = [
      { row: 5, dir: -1, count: 3, gap: 200, speed: 40, kind: "log" },
      { row: 4, dir: 1, count: 3, gap: 190, speed: 48, kind: "turtle" },
      { row: 3, dir: -1, count: 2, gap: 240, speed: 55, kind: "log" },
      { row: 2, dir: 1, count: 3, gap: 200, speed: 42, kind: "turtle" },
      { row: 1, dir: -1, count: 2, gap: 260, speed: 62, kind: "log" },
    ];
    riverSpecs.forEach((s) => {
      const colors =
        s.kind === "log" ? ["#8b5a2b", "#a06a3a", "#6e4220"] : ["#3cb371", "#2e8b57", "#66cdaa"];
      floaters.push(...spawnLaneVehicles(s.row, s.dir, s.count, s.gap, s.speed, colors, s.kind));
    });

    let snake = null;
    if (cfg().snake) {
      snake = {
        x: CELL * 2,
        y: MEDIAN_ROW * CELL + 8,
        w: CELL * 1.8,
        h: CELL - 16,
        vx: 70 * speedScale(),
        phase: 0,
      };
    }

    state.cars = cars;
    state.floaters = floaters;
    state.snake = snake;
  }

  function updateHud() {
    const need = cfg().homesNeeded;
    const timeLeft = Math.max(0, Math.ceil(state.timer));
    let text =
      "Score: " +
      state.score +
      " · Lives: " +
      state.lives +
      " · Time: " +
      timeLeft +
      " · Homes: " +
      state.homesFilled +
      "/" +
      need;
    if (cfg().rounds > 1) {
      text += " · R" + state.round + "/" + cfg().rounds;
    }
    $("#hud").textContent = text;
  }

  function resetFrogOnly() {
    state.frog = createFrog();
    state.hop = null;
    state.timer = cfg().timer;
    state.maxRowReached = START_ROW;
  }

  function clearHomes() {
    state.homes = [false, false, false, false, false];
    state.homesFilled = 0;
  }

  function resetRound(full) {
    if (full) {
      state.score = 0;
      state.lives = cfg().lives;
      state.round = 1;
      state.won = false;
      state.gameOver = false;
      clearHomes();
    }
    buildTraffic();
    resetFrogOnly();
    state.running = true;
    state.gameOver = false;
    $("#resultOverlay").classList.add("hidden");
    updateHud();
  }

  function showResult(title, msg) {
    state.running = false;
    state.gameOver = true;
    state.hop = null;
    $("#resultTitle").textContent = title;
    $("#resultMsg").textContent = msg;
    $("#resultOverlay").classList.remove("hidden");
  }

  function loseLife(reason) {
    state.hop = null;
    state.lives -= 1;
    updateHud();
    if (state.lives <= 0) {
      showResult("Game Over", reason + " Final score: " + state.score + ".");
      return;
    }
    resetFrogOnly();
    updateHud();
  }

  function fillHome(index) {
    if (state.homes[index]) return false;
    state.homes[index] = true;
    state.homesFilled += 1;
    const timeBonus = Math.floor(state.timer * 10);
    state.score += 200 + timeBonus;
    updateHud();

    if (state.homesFilled >= cfg().homesNeeded) {
      if (state.round < cfg().rounds) {
        state.round += 1;
        clearHomes();
        buildTraffic();
        resetFrogOnly();
        state.score += 500;
        updateHud();
        return true;
      }
      state.score += 1000;
      state.won = true;
      showResult("You Win!", "All homes filled. Score: " + state.score + ".");
      return true;
    }

    resetFrogOnly();
    updateHud();
    return true;
  }

  function homeIndexAtCol(col) {
    return HOME_COLS.indexOf(col);
  }

  function isRiver(row) {
    return RIVER_ROWS.indexOf(row) !== -1;
  }

  function isRoad(row) {
    return ROAD_ROWS.indexOf(row) !== -1;
  }

  function findRideAt(row, xCenter) {
    const probe = { x: xCenter - CELL * 0.3, y: row * CELL + 8, w: CELL * 0.6, h: CELL - 16 };
    for (let i = 0; i < state.floaters.length; i++) {
      const f = state.floaters[i];
      if (f.row !== row) continue;
      if (f.kind === "turtle" && f.submerged) continue;
      if (overlaps(probe, f)) return f;
    }
    return null;
  }

  function finishHop() {
    const hop = state.hop;
    const f = state.frog;
    if (!hop || !f) {
      state.hop = null;
      return;
    }

    f.col = hop.toCol;
    f.row = hop.toRow;
    f.x = hop.toX;
    f.riding = null;
    state.hop = null;

    if (hop.toRow < state.maxRowReached) {
      state.score += 10;
      state.maxRowReached = hop.toRow;
      updateHud();
    }

    if (hop.homeIndex != null) {
      fillHome(hop.homeIndex);
      return;
    }

    if (isRiver(f.row)) {
      const ride = findRideAt(f.row, f.x + CELL / 2);
      if (!ride) {
        loseLife("Fell in the water.");
        return;
      }
      f.riding = ride;
      f.x = Math.max(ride.x, Math.min(ride.x + ride.w - CELL, f.x));
    }

    checkCollisions();
  }

  function tryHop(dx, dy) {
    if (!state.running || state.gameOver || !state.frog || state.hop) return;
    const f = state.frog;
    const nextCol = f.col + dx;
    const nextRow = f.row + dy;

    if (dx < 0) f.facing = "left";
    else if (dx > 0) f.facing = "right";
    else if (dy < 0) f.facing = "up";
    else if (dy > 0) f.facing = "down";

    if (nextRow < 0 || nextRow >= ROWS) {
      loseLife("Left the playfield.");
      return;
    }

    let homeIndex = null;
    let toCol = nextCol;
    let toRow = nextRow;
    let toX = nextCol * CELL;

    if (nextRow === HOME_ROW) {
      if (f.row !== 1) {
        loseLife("Missed the home bank.");
        return;
      }
      const idx = homeIndexAtCol(nextCol);
      if (idx === -1 || state.homes[idx]) {
        loseLife("Invalid or occupied home.");
        return;
      }
      homeIndex = idx;
      toCol = nextCol;
      toRow = nextRow;
      toX = nextCol * CELL;
    } else if (nextCol < 0 || nextCol >= COLS) {
      loseLife("Left the playfield.");
      return;
    }

    const from = frogDrawPos();
    state.hop = {
      fromX: from.x,
      fromY: f.row * CELL,
      toX,
      toY: toRow * CELL,
      toCol,
      toRow,
      homeIndex,
      elapsed: 0,
      duration: HOP_MS / 1000,
    };
    f.legPhase = 0;
  }

  function wrapEntity(e) {
    if (e.vx > 0 && e.x > WIDTH + 20) e.x = -e.w - 20;
    if (e.vx < 0 && e.x + e.w < -20) e.x = WIDTH + 20;
  }

  function updateEntities(dt) {
    const diving = cfg().diving;
    state.cars.forEach((c) => {
      c.x += c.vx * dt;
      wrapEntity(c);
    });

    state.floaters.forEach((f) => {
      f.x += f.vx * dt;
      wrapEntity(f);
      if (diving && f.kind === "turtle" && DIVE_TURTLE_ROWS.indexOf(f.row) !== -1) {
        f.divePhase += dt;
        const cycle = f.divePeriod;
        const t = f.divePhase % cycle;
        f.submerged = t > cycle * 0.55 && t < cycle * 0.85;
      } else {
        f.submerged = false;
      }
    });

    if (state.snake) {
      const s = state.snake;
      s.x += s.vx * dt;
      s.phase += dt * 8;
      if (s.x < CELL || s.x + s.w > WIDTH - CELL) s.vx *= -1;
    }
  }

  function checkCollisions() {
    const f = state.frog;
    if (!f || state.hop) return;
    const box = frogHitbox();

    if (isRoad(f.row)) {
      for (let i = 0; i < state.cars.length; i++) {
        if (state.cars[i].row === f.row && overlaps(box, state.cars[i])) {
          loseLife("Hit by a car.");
          return;
        }
      }
    }

    if (f.row === MEDIAN_ROW && state.snake && overlaps(box, state.snake)) {
      loseLife("Bitten by the snake.");
      return;
    }

    if (isRiver(f.row)) {
      let ride = f.riding;
      if (ride && ride.kind === "turtle" && ride.submerged) {
        loseLife("Turtles dived under.");
        return;
      }

      const onRide =
        ride &&
        f.x + CELL * 0.25 < ride.x + ride.w &&
        f.x + CELL * 0.75 > ride.x &&
        !(ride.kind === "turtle" && ride.submerged);

      if (!onRide) {
        ride = findRideAt(f.row, f.x + CELL / 2);
        f.riding = ride;
        if (!ride) {
          loseLife("Fell in the water.");
          return;
        }
      }

      if (f.x < -CELL * 0.35 || f.x > WIDTH - CELL * 0.65) {
        loseLife("Floated off screen.");
      }
    }
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function shadeColor(hex, amt) {
    const n = hex.replace("#", "");
    const num = parseInt(n.length === 3 ? n.split("").map((c) => c + c).join("") : n, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0xff) + amt;
    let b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function drawBackground() {
    const t = state.animTime;
    for (let r = 0; r < ROWS; r++) {
      const y = r * CELL;
      if (r === HOME_ROW) {
        const bank = ctx.createLinearGradient(0, y, 0, y + CELL);
        bank.addColorStop(0, "#1f6b3d");
        bank.addColorStop(1, "#0f3d24");
        ctx.fillStyle = bank;
        ctx.fillRect(0, y, WIDTH, CELL);
        for (let c = 0; c < COLS; c++) {
          const hi = homeIndexAtCol(c);
          if (hi === -1) {
            ctx.fillStyle = "#0a2e1a";
            ctx.fillRect(c * CELL, y, CELL, CELL);
            const bush = ctx.createRadialGradient(
              c * CELL + CELL / 2,
              y + CELL / 2,
              2,
              c * CELL + CELL / 2,
              y + CELL / 2,
              CELL * 0.42
            );
            bush.addColorStop(0, "#3d9b55");
            bush.addColorStop(1, "#1a5c32");
            ctx.fillStyle = bush;
            ctx.beginPath();
            ctx.ellipse(c * CELL + CELL / 2, y + CELL * 0.55, CELL * 0.38, CELL * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const filled = state.homes[hi];
            const alcove = ctx.createLinearGradient(c * CELL, y, c * CELL, y + CELL);
            alcove.addColorStop(0, filled ? "#5dce6a" : "#163d28");
            alcove.addColorStop(1, filled ? "#2e8b45" : "#0c2418");
            ctx.fillStyle = alcove;
            ctx.beginPath();
            ctx.moveTo(c * CELL + 3, y + CELL - 2);
            ctx.quadraticCurveTo(c * CELL + CELL / 2, y + 2, c * CELL + CELL - 3, y + CELL - 2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = filled ? "#ffe082" : "#c9a227";
            ctx.lineWidth = 2;
            ctx.stroke();
            if (filled) {
              drawFrogIcon(c * CELL + 5, y + 8, CELL - 10, "up", true, 1);
            }
          }
        }
      } else if (isRiver(r)) {
        const g = ctx.createLinearGradient(0, y, 0, y + CELL);
        g.addColorStop(0, "#1565c0");
        g.addColorStop(0.45, "#1e88e5");
        g.addColorStop(1, "#0d47a1");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, WIDTH, CELL);
        for (let i = 0; i < 8; i++) {
          const wx = ((i * 73 + t * 28 + r * 40) % (WIDTH + 40)) - 20;
          ctx.strokeStyle = "rgba(255,255,255," + (0.08 + (i % 3) * 0.04) + ")";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(wx, y + 8 + (i % 4) * 7);
          ctx.quadraticCurveTo(wx + 18, y + 4 + (i % 4) * 7, wx + 36, y + 8 + (i % 4) * 7);
          ctx.stroke();
        }
      } else if (r === MEDIAN_ROW) {
        const g = ctx.createLinearGradient(0, y, 0, y + CELL);
        g.addColorStop(0, "#4caf50");
        g.addColorStop(1, "#2e7d32");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, WIDTH, CELL);
        for (let c = 0; c < COLS; c++) {
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(c * CELL + 4, y + 6, 4, 8);
          ctx.fillRect(c * CELL + 14, y + 18, 3, 10);
          ctx.fillRect(c * CELL + 26, y + 10, 4, 7);
        }
      } else if (isRoad(r)) {
        ctx.fillStyle = "#2c2c30";
        ctx.fillRect(0, y, WIDTH, CELL);
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        for (let i = 0; i < 20; i++) {
          ctx.fillRect((i * 41 + r * 13) % WIDTH, y + (i % 5) * 7, 12, 2);
        }
        ctx.strokeStyle = "rgba(255,220,80,0.55)";
        ctx.setLineDash([10, 12]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y + CELL / 2);
        ctx.lineTo(WIDTH, y + CELL / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(0, y, WIDTH, 1);
        ctx.fillRect(0, y + CELL - 1, WIDTH, 1);
      } else {
        const g = ctx.createLinearGradient(0, y, 0, y + CELL);
        g.addColorStop(0, "#66bb6a");
        g.addColorStop(1, "#43a047");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, WIDTH, CELL);
        for (let c = 0; c < COLS; c++) {
          if ((c + r) % 2 === 0) {
            ctx.fillStyle = "rgba(255,255,255,0.07)";
            ctx.fillRect(c * CELL, y, CELL, CELL);
          }
          ctx.fillStyle = "rgba(0,0,0,0.08)";
          ctx.beginPath();
          ctx.ellipse(c * CELL + 12, y + 14, 3, 5, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(c * CELL + 28, y + 26, 2.5, 4, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function drawCar(c) {
    const goingRight = c.vx > 0;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    const body = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.h);
    body.addColorStop(0, shadeColor(c.color, 35));
    body.addColorStop(0.5, c.color);
    body.addColorStop(1, shadeColor(c.color, -40));
    ctx.fillStyle = body;
    roundRect(c.x, c.y + 4, c.w, c.h - 6, 7);
    ctx.fill();
    ctx.shadowColor = "transparent";

    const cabinX = goingRight ? c.x + c.w * 0.28 : c.x + c.w * 0.12;
    const cabinW = c.w * 0.45;
    const glass = ctx.createLinearGradient(cabinX, c.y, cabinX, c.y + c.h * 0.55);
    glass.addColorStop(0, "rgba(200,230,255,0.85)");
    glass.addColorStop(1, "rgba(80,120,160,0.7)");
    ctx.fillStyle = glass;
    roundRect(cabinX, c.y + 2, cabinW, c.h * 0.42, 4);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,220,0.9)";
    if (goingRight) {
      ctx.beginPath();
      ctx.ellipse(c.x + c.w - 4, c.y + c.h * 0.45, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(c.x + 4, c.y + c.h * 0.45, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#1a1a1a";
    const wy = c.y + c.h - 5;
    ctx.beginPath();
    ctx.ellipse(c.x + 10, wy, 5, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w - 10, wy, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.ellipse(c.x + 10, wy, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w - 10, wy, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCars() {
    state.cars.forEach(drawCar);
  }

  function drawLog(f) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    const g = ctx.createLinearGradient(f.x, f.y, f.x, f.y + f.h);
    g.addColorStop(0, shadeColor(f.color, 30));
    g.addColorStop(0.4, f.color);
    g.addColorStop(1, shadeColor(f.color, -35));
    ctx.fillStyle = g;
    roundRect(f.x, f.y, f.w, f.h, 10);
    ctx.fill();
    ctx.shadowColor = "transparent";

    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) {
      const lx = f.x + (f.w * i) / 4;
      ctx.beginPath();
      ctx.moveTo(lx, f.y + 3);
      ctx.quadraticCurveTo(lx + 3, f.y + f.h / 2, lx, f.y + f.h - 3);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(f.x + 8, f.y + 4, f.w - 16, 5, 3);
    ctx.fill();
    ctx.restore();
  }

  function drawTurtle(f) {
    const n = Math.max(1, Math.round(f.w / CELL));
    const unit = f.w / n;
    for (let i = 0; i < n; i++) {
      const cx = f.x + unit * i + unit / 2;
      const cy = f.y + f.h / 2;
      ctx.save();
      if (f.submerged) ctx.globalAlpha = 0.22;

      ctx.fillStyle = "#2e7d32";
      ctx.beginPath();
      ctx.ellipse(cx - unit * 0.28, cy + 2, 5, 3, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + unit * 0.28, cy + 2, 5, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();

      const shell = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, unit * 0.38);
      shell.addColorStop(0, "#81c784");
      shell.addColorStop(0.55, f.color);
      shell.addColorStop(1, "#1b5e20");
      ctx.fillStyle = shell;
      ctx.beginPath();
      ctx.ellipse(cx, cy, unit * 0.36, f.h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - f.h * 0.25);
      ctx.lineTo(cx, cy + f.h * 0.2);
      ctx.moveTo(cx - unit * 0.18, cy);
      ctx.lineTo(cx + unit * 0.18, cy);
      ctx.stroke();

      const headX = f.vx >= 0 ? cx + unit * 0.32 : cx - unit * 0.32;
      ctx.fillStyle = "#66bb6a";
      ctx.beginPath();
      ctx.ellipse(headX, cy - 2, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(headX + (f.vx >= 0 ? 2 : -2), cy - 3, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloaters() {
    state.floaters.forEach((f) => {
      if (f.kind === "log") drawLog(f);
      else drawTurtle(f);
    });
  }

  function drawSnake() {
    if (!state.snake) return;
    const s = state.snake;
    const segs = 6;
    const segW = s.w / segs;
    ctx.save();
    for (let i = 0; i < segs; i++) {
      const wave = Math.sin(s.phase + i * 0.7) * 3;
      const x = s.x + i * segW;
      const g = ctx.createRadialGradient(x + segW / 2, s.y + s.h / 2 + wave, 1, x + segW / 2, s.y + s.h / 2 + wave, segW);
      g.addColorStop(0, "#c5e1a5");
      g.addColorStop(1, "#558b2f");
      ctx.fillStyle = g;
      roundRect(x, s.y + wave, segW + 1, s.h - Math.abs(wave), 8);
      ctx.fill();
    }
    const headX = s.vx > 0 ? s.x + s.w - 8 : s.x + 8;
    ctx.fillStyle = "#8bc34a";
    ctx.beginPath();
    ctx.arc(headX, s.y + s.h / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(headX + (s.vx > 0 ? 2 : -2), s.y + s.h / 2 - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e53935";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headX + (s.vx > 0 ? 6 : -6), s.y + s.h / 2 + 2);
    ctx.lineTo(headX + (s.vx > 0 ? 12 : -12), s.y + s.h / 2 + 6);
    ctx.stroke();
    ctx.restore();
  }

  function drawFrogIcon(x, y, size, facing, settled, hopT) {
    const t = hopT == null ? 1 : hopT;
    const stretchY = settled ? 1 : 1 - Math.sin(t * Math.PI) * 0.18;
    const stretchX = settled ? 1 : 1 + Math.sin(t * Math.PI) * 0.22;
    const legKick = settled ? 0 : Math.sin(t * Math.PI) * size * 0.18;

    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    if (facing === "left") ctx.rotate(-Math.PI / 2);
    else if (facing === "right") ctx.rotate(Math.PI / 2);
    else if (facing === "down") ctx.rotate(Math.PI);
    ctx.scale(stretchX, stretchY);

    if (!settled) {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(0, size * 0.38, size * 0.28, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = settled ? "#81c784" : "#2e7d32";
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = "round";
    // rear legs
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, size * 0.08);
    ctx.quadraticCurveTo(-size * 0.42, size * 0.05 + legKick, -size * 0.38, size * 0.32);
    ctx.moveTo(size * 0.12, size * 0.08);
    ctx.quadraticCurveTo(size * 0.42, size * 0.05 + legKick, size * 0.38, size * 0.32);
    // front legs
    ctx.moveTo(-size * 0.1, -size * 0.02);
    ctx.quadraticCurveTo(-size * 0.3, -size * 0.15 - legKick * 0.5, -size * 0.28, size * 0.12);
    ctx.moveTo(size * 0.1, -size * 0.02);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.15 - legKick * 0.5, size * 0.28, size * 0.12);
    ctx.stroke();

    const body = ctx.createRadialGradient(-size * 0.1, -size * 0.1, size * 0.05, 0, 0, size * 0.42);
    body.addColorStop(0, settled ? "#e8f5e9" : "#b9f6ca");
    body.addColorStop(0.45, settled ? "#a5d6a7" : "#69f0ae");
    body.addColorStop(1, settled ? "#66bb6a" : "#00c853");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.04, size * 0.36, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = settled ? "#c8e6c9" : "#00e676";
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.02, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    const eyeY = -size * 0.22;
    [[-1, -size * 0.16], [1, size * 0.16]].forEach((e) => {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(e[1], eyeY, size * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1b5e20";
      ctx.beginPath();
      ctx.arc(e[1], eyeY - size * 0.02, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(e[1] + size * 0.02, eyeY - size * 0.03, size * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(e[1] - size * 0.03, eyeY - size * 0.05, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawFrog() {
    const f = state.frog;
    if (!f) return;
    const pos = frogDrawPos();
    const hopT = state.hop ? Math.min(1, state.hop.elapsed / state.hop.duration) : 1;
    drawFrogIcon(pos.x + 3, pos.y + 3, CELL - 6, f.facing, false, hopT);
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBackground();
    drawFloaters();
    drawCars();
    drawSnake();
    drawFrog();
  }

  function loop(ts) {
    if (!state.running) return;
    if (!state.lastTs) state.lastTs = ts;
    let dt = (ts - state.lastTs) / 1000;
    state.lastTs = ts;
    if (dt > 0.05) dt = 0.05;
    state.animTime += dt;

    state.timer -= dt;
    if (state.timer <= 0) {
      loseLife("Time ran out.");
      state.lastTs = ts;
      if (state.running) requestAnimationFrame(loop);
      return;
    }
    updateHud();

    updateEntities(dt);

    if (state.hop) {
      state.hop.elapsed += dt;
      if (state.hop.elapsed >= state.hop.duration) {
        finishHop();
      }
    } else {
      const f = state.frog;
      if (f && f.riding && isRiver(f.row)) {
        f.x += f.riding.vx * dt;
        f.col = Math.floor((f.x + CELL / 2) / CELL);
      }
      checkCollisions();
    }

    draw();

    if (state.running) requestAnimationFrame(loop);
  }

  function startGame(level) {
    state.level = level;
    $("#levelBadge").textContent = cfg().label;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    setupCanvas();
    const needsRestart = !state.running;
    resetRound(true);
    state.lastTs = 0;
    if (needsRestart) requestAnimationFrame(loop);
  }

  function goToLevelScreen() {
    state.running = false;
    state.gameOver = false;
    state.hop = null;
    $("#resultOverlay").classList.add("hidden");
    $("#gameScreen").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  function bindHop(dir) {
    const map = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const d = map[dir];
    if (d) tryHop(d[0], d[1]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupCanvas();

    $$(".level-btn").forEach((btn) => {
      btn.addEventListener("click", () => startGame(btn.dataset.level));
    });

    $("#newGameBtn").addEventListener("click", () => {
      const needsRestart = !state.running;
      resetRound(true);
      state.lastTs = 0;
      if (needsRestart) requestAnimationFrame(loop);
    });

    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);

    $("#playAgainBtn").addEventListener("click", () => {
      const needsRestart = !state.running;
      resetRound(true);
      state.lastTs = 0;
      if (needsRestart) requestAnimationFrame(loop);
    });

    $("#changeLevelFromResultBtn").addEventListener("click", goToLevelScreen);

    window.addEventListener("keydown", (e) => {
      const key = e.key;
      let handled = true;
      if (key === "ArrowUp" || key === "w" || key === "W") bindHop("up");
      else if (key === "ArrowDown" || key === "s" || key === "S") bindHop("down");
      else if (key === "ArrowLeft" || key === "a" || key === "A") bindHop("left");
      else if (key === "ArrowRight" || key === "d" || key === "D") bindHop("right");
      else handled = false;
      if (handled) e.preventDefault();
    });

    $$(".ctrl-btn[data-dir]").forEach((btn) => {
      const fire = (ev) => {
        ev.preventDefault();
        bindHop(btn.dataset.dir);
      };
      btn.addEventListener("click", fire);
      btn.addEventListener("touchstart", fire, { passive: false });
    });

    const openHelp = () => {
      $("#helpOverlay").classList.remove("hidden");
      $("#helpOverlay").setAttribute("aria-hidden", "false");
    };
    const closeHelp = () => {
      $("#helpOverlay").classList.add("hidden");
      $("#helpOverlay").setAttribute("aria-hidden", "true");
    };

    $("#helpBtnLevel").addEventListener("click", openHelp);
    $("#helpBtnGame").addEventListener("click", openHelp);
    $("#helpClose").addEventListener("click", closeHelp);
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") closeHelp();
    });

    window.addEventListener("resize", () => {
      setupCanvas();
      if (!state.running) draw();
    });

    draw();
  });
})();
