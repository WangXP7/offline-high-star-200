(function () {
  "use strict";

  const LEVELS = {
    easy: { rows: 3, cols: 8, speed: 0.6, lives: 3, fireChance: 0.004 },
    medium: { rows: 4, cols: 10, speed: 0.9, lives: 3, fireChance: 0.008 },
    hard: { rows: 5, cols: 11, speed: 1.3, lives: 2, fireChance: 0.012 },
  };

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let state = {
    level: "easy",
    score: 0,
    lives: 3,
    wave: 1,
    running: false,
    gameOver: false,
    ship: { x: 220, y: 520, w: 40, h: 16 },
    bullets: [],
    enemyBullets: [],
    aliens: [],
    bunkers: [],
    dir: 1,
    stepTimer: 0,
    keys: { left: false, right: false },
    shootCooldown: 0,
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  function cfg() {
    return LEVELS[state.level];
  }

  function createAliens() {
    const { rows, cols } = cfg();
    const aliens = [];
    const gapX = Math.min(42, (canvas.width - 40) / cols);
    const startX = (canvas.width - cols * gapX) / 2 + 10;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          x: startX + c * gapX,
          y: 40 + r * 36 + (state.wave - 1) * 8,
          w: 28,
          h: 20,
          alive: true,
        });
      }
    }
    return aliens;
  }

  function createBunkers() {
    const bunkers = [];
    const positions = [70, 200, 330];
    positions.forEach((bx) => {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          if (r === 2 && c > 0 && c < 4) continue;
          bunkers.push({ x: bx + c * 12, y: 440 + r * 10, w: 11, h: 9, hp: 3 });
        }
      }
    });
    return bunkers;
  }

  function updateHud() {
    $("#hud").textContent = "Score: " + state.score + " · Lives: " + state.lives + " · Wave: " + state.wave;
  }

  function resetRound(full) {
    if (full) {
      state.score = 0;
      state.lives = cfg().lives;
      state.wave = 1;
    }
    state.ship.x = canvas.width / 2 - 20;
    state.bullets = [];
    state.enemyBullets = [];
    state.aliens = createAliens();
    state.bunkers = createBunkers();
    state.dir = 1;
    state.stepTimer = 0;
    state.shootCooldown = 0;
    state.gameOver = false;
    state.running = true;
    updateHud();
    $("#resultOverlay").classList.add("hidden");
  }

  function aliveAliens() {
    return state.aliens.filter((a) => a.alive);
  }

  function firePlayer() {
    if (state.shootCooldown > 0 || !state.running) return;
    state.bullets.push({
      x: state.ship.x + state.ship.w / 2 - 2,
      y: state.ship.y,
      w: 4,
      h: 10,
      vy: -8,
    });
    state.shootCooldown = 12;
  }

  function hit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function endGame(won) {
    state.running = false;
    state.gameOver = true;
    $("#resultTitle").textContent = won ? "Wave cleared!" : "Game Over";
    $("#resultMsg").textContent = "Score: " + state.score;
    if (won) {
      state.wave++;
      $("#resultTitle").textContent = "Wave " + (state.wave - 1) + " cleared!";
      $("#playAgainBtn").textContent = "Next Wave";
    } else {
      $("#playAgainBtn").textContent = "Play Again";
    }
    $("#resultOverlay").classList.remove("hidden");
  }

  function update() {
    if (!state.running) return;
    const c = cfg();
    const speed = c.speed * (1 + (state.wave - 1) * 0.15);

    if (state.keys.left) state.ship.x -= 5;
    if (state.keys.right) state.ship.x += 5;
    state.ship.x = Math.max(8, Math.min(canvas.width - state.ship.w - 8, state.ship.x));
    if (state.shootCooldown > 0) state.shootCooldown--;

    state.stepTimer++;
    if (state.stepTimer > Math.max(18, 40 - speed * 10)) {
      state.stepTimer = 0;
      let hitEdge = false;
      const living = aliveAliens();
      living.forEach((a) => {
        a.x += state.dir * 12 * Math.min(speed, 2);
        if (a.x < 8 || a.x + a.w > canvas.width - 8) hitEdge = true;
      });
      if (hitEdge) {
        state.dir *= -1;
        living.forEach((a) => {
          a.y += 16;
        });
      }
    }

    const livingAfter = aliveAliens();
    livingAfter.forEach((a) => {
      if (Math.random() < c.fireChance * (1 + state.wave * 0.1)) {
        state.enemyBullets.push({
          x: a.x + a.w / 2 - 2,
          y: a.y + a.h,
          w: 4,
          h: 10,
          vy: 4 + speed,
        });
      }
      if (a.y + a.h >= state.ship.y) {
        endGame(false);
      }
    });

    state.bullets.forEach((b) => {
      b.y += b.vy;
    });
    state.enemyBullets.forEach((b) => {
      b.y += b.vy;
    });

    // player bullets vs aliens / bunkers
    state.bullets = state.bullets.filter((b) => {
      if (b.y + b.h < 0) return false;
      for (const a of state.aliens) {
        if (a.alive && hit(b, a)) {
          a.alive = false;
          state.score += 10;
          updateHud();
          return false;
        }
      }
      for (const bk of state.bunkers) {
        if (bk.hp > 0 && hit(b, bk)) {
          bk.hp--;
          return false;
        }
      }
      return true;
    });

    state.enemyBullets = state.enemyBullets.filter((b) => {
      if (b.y > canvas.height) return false;
      if (hit(b, state.ship)) {
        state.lives--;
        updateHud();
        if (state.lives <= 0) endGame(false);
        return false;
      }
      for (const bk of state.bunkers) {
        if (bk.hp > 0 && hit(b, bk)) {
          bk.hp--;
          return false;
        }
      }
      return true;
    });

    if (aliveAliens().length === 0) endGame(true);
  }

  function draw() {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // stars
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 40; i++) {
      ctx.fillRect((i * 97) % canvas.width, (i * 53) % canvas.height, 2, 2);
    }

    // bunkers
    state.bunkers.forEach((bk) => {
      if (bk.hp <= 0) return;
      ctx.fillStyle = bk.hp === 3 ? "#22c55e" : bk.hp === 2 ? "#84cc16" : "#a3e635";
      ctx.fillRect(bk.x, bk.y, bk.w, bk.h);
    });

    // aliens
    state.aliens.forEach((a) => {
      if (!a.alive) return;
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.fillStyle = "#e9d5ff";
      ctx.fillRect(a.x + 6, a.y + 6, 6, 6);
      ctx.fillRect(a.x + 16, a.y + 6, 6, 6);
    });

    // ship
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(state.ship.x, state.ship.y, state.ship.w, state.ship.h);
    ctx.fillRect(state.ship.x + 14, state.ship.y - 8, 12, 8);

    // bullets
    ctx.fillStyle = "#f8fafc";
    state.bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
    ctx.fillStyle = "#ef4444";
    state.enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
  }

  function loop() {
    update();
    draw();
    if (state.running) requestAnimationFrame(loop);
  }

  function startGame(level) {
    state.level = level;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    $("#levelBadge").textContent = level.charAt(0).toUpperCase() + level.slice(1);
    resetRound(true);
    requestAnimationFrame(loop);
  }

  function goToLevelScreen() {
    state.running = false;
    $("#gameScreen").classList.add("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".level-btn").forEach((btn) => btn.addEventListener("click", () => startGame(btn.dataset.level)));
    $("#newGameBtn").addEventListener("click", () => {
      const needsRestart = !state.running;
      resetRound(true);
      if (needsRestart) requestAnimationFrame(loop);
    });
    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);
    $("#playAgainBtn").addEventListener("click", () => {
      const nextWave = $("#playAgainBtn").textContent === "Next Wave";
      const needsRestart = !state.running;
      resetRound(!nextWave);
      if (needsRestart) requestAnimationFrame(loop);
    });
    $("#changeLevelFromResultBtn").addEventListener("click", goToLevelScreen);

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") state.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") state.keys.right = true;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        firePlayer();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") state.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") state.keys.right = false;
    });

    const bindHold = (el, key) => {
      el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        state.keys[key] = true;
      });
      el.addEventListener("touchend", () => {
        state.keys[key] = false;
      });
      el.addEventListener("mousedown", () => {
        state.keys[key] = true;
      });
      el.addEventListener("mouseup", () => {
        state.keys[key] = false;
      });
      el.addEventListener("mouseleave", () => {
        state.keys[key] = false;
      });
    };
    bindHold($("#leftBtn"), "left");
    bindHold($("#rightBtn"), "right");
    $("#fireBtn").addEventListener("click", firePlayer);
    $("#fireBtn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      firePlayer();
    });

    $("#helpBtnLevel").addEventListener("click", () => $("#helpOverlay").classList.remove("hidden"));
    $("#helpBtnGame").addEventListener("click", () => $("#helpOverlay").classList.remove("hidden"));
    $("#helpClose").addEventListener("click", () => $("#helpOverlay").classList.add("hidden"));
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") $("#helpOverlay").classList.add("hidden");
    });
  });
})();
