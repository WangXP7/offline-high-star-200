(function () {
  "use strict";

  const LEVELS = {
    easy: {
      lives: 5,
      startRocks: 3,
      wavesToWin: 3,
      speed: 0.8,
      fireCd: 220,
      ufoFromWave: 0,
      hyperspace: 3,
      ufoFireMs: 1400,
    },
    medium: {
      lives: 3,
      startRocks: 4,
      wavesToWin: 5,
      speed: 1.0,
      fireCd: 180,
      ufoFromWave: 3,
      hyperspace: 1,
      ufoFireMs: 1100,
    },
    hard: {
      lives: 2,
      startRocks: 5,
      wavesToWin: 7,
      speed: 1.35,
      fireCd: 140,
      ufoFromWave: 2,
      hyperspace: 0,
      ufoFireMs: 700,
    },
  };

  const ROCK_RADII = { large: 40, medium: 24, small: 12 };
  const ROCK_SCORES = { large: 20, medium: 50, small: 100 };
  const BULLET_LIFE = 1.15;
  const BULLET_SPEED = 420;
  const SHIP_RADIUS = 12;
  const INVULN_MS = 2000;
  const ROT_SPEED = 3.6;
  const THRUST = 260;
  const DRAG = 0.985;
  const MAX_SPEED = 320;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  let lastTime = 0;

  const state = {
    level: "easy",
    score: 0,
    lives: 5,
    wave: 1,
    hyperspaceLeft: 3,
    running: false,
    gameOver: false,
    won: false,
    ship: null,
    rocks: [],
    bullets: [],
    ufo: null,
    ufoBullets: [],
    fireCooldown: 0,
    keys: {
      left: false,
      right: false,
      thrust: false,
      fire: false,
    },
  };

  function cfg() {
    return LEVELS[state.level];
  }

  function wrap(v, max) {
    if (v < 0) return v + max;
    if (v >= max) return v - max;
    return v;
  }

  function dist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function circleHit(ax, ay, ar, bx, by, br) {
    return dist(ax, ay, bx, by) < ar + br;
  }

  function makeShip() {
    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      invulnUntil: performance.now() + INVULN_MS,
      alive: true,
    };
  }

  function rockVerts(radius) {
    const verts = [];
    const n = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const jagged = radius * (0.75 + Math.random() * 0.35);
      verts.push({ x: Math.cos(a) * jagged, y: Math.sin(a) * jagged });
    }
    return verts;
  }

  function makeRock(size, x, y, speedMul) {
    const radius = ROCK_RADII[size];
    const angle = Math.random() * Math.PI * 2;
    const speed = (20 + Math.random() * 50) * speedMul;
    return {
      size,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      verts: rockVerts(radius),
    };
  }

  function spawnRocks(count) {
    const rocks = [];
    const speedMul = cfg().speed * (1 + (state.wave - 1) * 0.08);
    const ship = state.ship;
    let attempts = 0;
    while (rocks.length < count && attempts < count * 40) {
      attempts++;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      if (ship && dist(x, y, ship.x, ship.y) < 120) continue;
      rocks.push(makeRock("large", x, y, speedMul));
    }
    while (rocks.length < count) {
      const edge = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (edge === 0) {
        x = Math.random() * canvas.width;
        y = 20;
      } else if (edge === 1) {
        x = canvas.width - 20;
        y = Math.random() * canvas.height;
      } else if (edge === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height - 20;
      } else {
        x = 20;
        y = Math.random() * canvas.height;
      }
      rocks.push(makeRock("large", x, y, speedMul));
    }
    return rocks;
  }

  function splitRock(rock) {
    const next = rock.size === "large" ? "medium" : rock.size === "medium" ? "small" : null;
    if (!next) return [];
    const speedMul = cfg().speed * (1 + (state.wave - 1) * 0.08);
    return [
      makeRock(next, rock.x, rock.y, speedMul * 1.15),
      makeRock(next, rock.x, rock.y, speedMul * 1.15),
    ];
  }

  function updateHud() {
    $("#hud").textContent =
      "Score: " +
      state.score +
      " · Lives: " +
      state.lives +
      " · Wave: " +
      state.wave +
      " · HS: " +
      state.hyperspaceLeft;
  }

  function updateHyperspaceBtn() {
    const btn = $("#hyperspaceBtn");
    if (cfg().hyperspace <= 0) {
      btn.classList.add("hidden");
    } else {
      btn.classList.remove("hidden");
    }
  }

  function resetGame() {
    const c = cfg();
    state.score = 0;
    state.lives = c.lives;
    state.wave = 1;
    state.hyperspaceLeft = c.hyperspace;
    state.gameOver = false;
    state.won = false;
    state.ship = makeShip();
    state.rocks = spawnRocks(c.startRocks);
    state.bullets = [];
    state.ufo = null;
    state.ufoBullets = [];
    state.fireCooldown = 0;
    state.running = true;
    updateHud();
    updateHyperspaceBtn();
    $("#resultOverlay").classList.add("hidden");
    $("#resultTitle").classList.remove("lose");
    $("#playAgainBtn").textContent = "Play Again";
    lastTime = performance.now();
  }

  function startNextWave() {
    state.wave++;
    const count = cfg().startRocks + (state.wave - 1);
    state.rocks = spawnRocks(count);
    state.bullets = [];
    state.ufoBullets = [];
    state.ufo = null;
    state.ship.invulnUntil = performance.now() + INVULN_MS;
    updateHud();
  }

  function endGame(won) {
    state.running = false;
    state.gameOver = true;
    state.won = won;
    const title = $("#resultTitle");
    title.textContent = won ? "You Win!" : "Game Over";
    title.classList.toggle("lose", !won);
    $("#resultMsg").textContent =
      "Score: " + state.score + " · Waves cleared: " + (won ? cfg().wavesToWin : state.wave - 1);
    $("#playAgainBtn").textContent = "Play Again";
    $("#resultOverlay").classList.remove("hidden");
  }

  function fireBullet() {
    if (!state.running || !state.ship || !state.ship.alive) return;
    if (state.fireCooldown > 0) return;
    const s = state.ship;
    state.bullets.push({
      x: s.x + Math.cos(s.angle) * 16,
      y: s.y + Math.sin(s.angle) * 16,
      vx: Math.cos(s.angle) * BULLET_SPEED + s.vx * 0.2,
      vy: Math.sin(s.angle) * BULLET_SPEED + s.vy * 0.2,
      life: BULLET_LIFE,
    });
    state.fireCooldown = cfg().fireCd / 1000;
  }

  function tryHyperspace() {
    if (!state.running || !state.ship || !state.ship.alive) return;
    if (state.hyperspaceLeft <= 0) return;
    const ship = state.ship;
    let placed = false;
    for (let i = 0; i < 12; i++) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.height - 60);
      let ok = true;
      for (let r = 0; r < state.rocks.length; r++) {
        const rock = state.rocks[r];
        if (circleHit(x, y, SHIP_RADIUS + 8, rock.x, rock.y, rock.radius)) {
          ok = false;
          break;
        }
      }
      if (ok) {
        ship.x = x;
        ship.y = y;
        ship.vx = 0;
        ship.vy = 0;
        ship.invulnUntil = performance.now() + INVULN_MS * 0.5;
        placed = true;
        break;
      }
    }
    state.hyperspaceLeft--;
    updateHud();
    if (!placed) {
      // fail after retries: still burn charge, no teleport
      return;
    }
  }

  function spawnUfoIfNeeded() {
    const c = cfg();
    if (!c.ufoFromWave || state.wave < c.ufoFromWave) return;
    if (state.ufo) return;
    if (Math.random() > 0.008) return;
    const fromLeft = Math.random() < 0.5;
    state.ufo = {
      x: fromLeft ? -20 : canvas.width + 20,
      y: 60 + Math.random() * (canvas.height * 0.5),
      vx: (fromLeft ? 1 : -1) * (70 + Math.random() * 40) * c.speed,
      vy: (Math.random() - 0.5) * 30,
      r: 14,
      fireTimer: 0.6,
    };
  }

  function killShip() {
    const now = performance.now();
    if (now < state.ship.invulnUntil) return;
    state.lives--;
    updateHud();
    state.bullets = [];
    state.ufoBullets = [];
    if (state.lives <= 0) {
      endGame(false);
      return;
    }
    state.ship = makeShip();
  }

  function update(dt) {
    if (!state.running) return;
    const ship = state.ship;
    const speedScale = cfg().speed;

    if (state.fireCooldown > 0) state.fireCooldown -= dt;
    if (state.keys.fire) fireBullet();

    if (ship && ship.alive) {
      if (state.keys.left) ship.angle -= ROT_SPEED * dt;
      if (state.keys.right) ship.angle += ROT_SPEED * dt;
      if (state.keys.thrust) {
        ship.vx += Math.cos(ship.angle) * THRUST * speedScale * dt;
        ship.vy += Math.sin(ship.angle) * THRUST * speedScale * dt;
      }
      const sp = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
      const maxSp = MAX_SPEED * speedScale;
      if (sp > maxSp) {
        ship.vx = (ship.vx / sp) * maxSp;
        ship.vy = (ship.vy / sp) * maxSp;
      }
      const drag = Math.pow(DRAG, dt * 60);
      ship.vx *= drag;
      ship.vy *= drag;
      ship.x = wrap(ship.x + ship.vx * dt, canvas.width);
      ship.y = wrap(ship.y + ship.vy * dt, canvas.height);
    }

    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.life -= dt;
      b.x = wrap(b.x + b.vx * dt, canvas.width);
      b.y = wrap(b.y + b.vy * dt, canvas.height);
      if (b.life <= 0) state.bullets.splice(i, 1);
    }

    for (let i = 0; i < state.rocks.length; i++) {
      const r = state.rocks[i];
      r.x = wrap(r.x + r.vx * dt, canvas.width);
      r.y = wrap(r.y + r.vy * dt, canvas.height);
      r.rot += r.rotSpeed * dt;
    }

    spawnUfoIfNeeded();
    if (state.ufo) {
      const u = state.ufo;
      u.x += u.vx * dt;
      u.y += u.vy * dt;
      if (u.y < 40 || u.y > canvas.height * 0.7) u.vy *= -1;
      u.fireTimer -= dt;
      if (u.fireTimer <= 0 && ship) {
        const ang = Math.atan2(ship.y - u.y, ship.x - u.x);
        const spd = 180 * speedScale;
        state.ufoBullets.push({
          x: u.x,
          y: u.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 2.2,
        });
        u.fireTimer = cfg().ufoFireMs / 1000;
      }
      if (u.x < -40 || u.x > canvas.width + 40) state.ufo = null;
    }

    for (let i = state.ufoBullets.length - 1; i >= 0; i--) {
      const b = state.ufoBullets[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life <= 0 || b.x < -20 || b.x > canvas.width + 20 || b.y < -20 || b.y > canvas.height + 20) {
        state.ufoBullets.splice(i, 1);
      }
    }

    // bullets vs rocks
    for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
      const b = state.bullets[bi];
      let hit = false;
      for (let ri = state.rocks.length - 1; ri >= 0; ri--) {
        const r = state.rocks[ri];
        if (circleHit(b.x, b.y, 2, r.x, r.y, r.radius)) {
          state.score += ROCK_SCORES[r.size];
          const pieces = splitRock(r);
          state.rocks.splice(ri, 1);
          for (let p = 0; p < pieces.length; p++) state.rocks.push(pieces[p]);
          state.bullets.splice(bi, 1);
          hit = true;
          updateHud();
          break;
        }
      }
      if (hit) continue;
      if (state.ufo && circleHit(b.x, b.y, 2, state.ufo.x, state.ufo.y, state.ufo.r)) {
        state.score += 200;
        state.ufo = null;
        state.bullets.splice(bi, 1);
        updateHud();
      }
    }

    // ship vs rocks / ufo / ufo bullets
    if (ship && ship.alive) {
      for (let i = 0; i < state.rocks.length; i++) {
        const r = state.rocks[i];
        if (circleHit(ship.x, ship.y, SHIP_RADIUS, r.x, r.y, r.radius)) {
          killShip();
          break;
        }
      }
      if (state.running && state.ufo && circleHit(ship.x, ship.y, SHIP_RADIUS, state.ufo.x, state.ufo.y, state.ufo.r)) {
        killShip();
      }
      if (state.running) {
        for (let i = 0; i < state.ufoBullets.length; i++) {
          const b = state.ufoBullets[i];
          if (circleHit(ship.x, ship.y, SHIP_RADIUS, b.x, b.y, 3)) {
            killShip();
            break;
          }
        }
      }
    }

    if (state.running && state.rocks.length === 0) {
      if (state.wave >= cfg().wavesToWin) {
        endGame(true);
      } else {
        startNextWave();
      }
    }
  }

  function drawShip(ship, now) {
    const blinking = now < ship.invulnUntil;
    if (blinking && Math.floor(now / 100) % 2 === 0) return;
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = "#f8fafc";
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-12, 10);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-12, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (state.keys.thrust) {
      ctx.strokeStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-18 - Math.random() * 6, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRock(rock) {
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate(rock.rot);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < rock.verts.length; i++) {
      const v = rock.verts[i];
      if (i === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0b1224";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // stars
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 97) % canvas.width);
      const sy = ((i * 53) % canvas.height);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    const now = performance.now();
    for (let i = 0; i < state.rocks.length; i++) drawRock(state.rocks[i]);

    ctx.fillStyle = "#f8fafc";
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ef4444";
    for (let i = 0; i < state.ufoBullets.length; i++) {
      const b = state.ufoBullets[i];
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (state.ufo) {
      const u = state.ufo;
      ctx.save();
      ctx.translate(u.x, u.y);
      ctx.fillStyle = "#a78bfa";
      ctx.strokeStyle = "#e9d5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, -4, 8, 6, 0, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
    }

    if (state.ship && state.ship.alive) drawShip(state.ship, now);
  }

  function loop(ts) {
    if (!state.running) return;
    if (!lastTime) lastTime = ts;
    let dt = (ts - lastTime) / 1000;
    lastTime = ts;
    if (dt > 0.05) dt = 0.05;
    update(dt);
    draw();
    if (state.running) requestAnimationFrame(loop);
  }

  function startGame(level) {
    state.level = level;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    $("#levelBadge").textContent = level.charAt(0).toUpperCase() + level.slice(1);
    resetGame();
    requestAnimationFrame(loop);
  }

  function goToLevelScreen() {
    state.running = false;
    $("#gameScreen").classList.add("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  function bindHold(el, key) {
    const on = (e) => {
      e.preventDefault();
      state.keys[key] = true;
    };
    const off = () => {
      state.keys[key] = false;
    };
    el.addEventListener("touchstart", on, { passive: false });
    el.addEventListener("touchend", off);
    el.addEventListener("touchcancel", off);
    el.addEventListener("mousedown", on);
    el.addEventListener("mouseup", off);
    el.addEventListener("mouseleave", off);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".level-btn").forEach((btn) =>
      btn.addEventListener("click", () => startGame(btn.dataset.level))
    );

    $("#newGameBtn").addEventListener("click", () => {
      const needsRestart = !state.running;
      resetGame();
      if (needsRestart) requestAnimationFrame(loop);
    });

    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);

    $("#playAgainBtn").addEventListener("click", () => {
      const needsRestart = !state.running;
      resetGame();
      if (needsRestart) requestAnimationFrame(loop);
    });

    $("#changeLevelFromResultBtn").addEventListener("click", goToLevelScreen);

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") state.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") state.keys.right = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        state.keys.thrust = true;
      }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        state.keys.fire = true;
        fireBullet();
      }
      if ((e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight") && !e.repeat) {
        e.preventDefault();
        tryHyperspace();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") state.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") state.keys.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") state.keys.thrust = false;
      if (e.key === " " || e.key === "Spacebar") state.keys.fire = false;
    });

    bindHold($("#rotLeftBtn"), "left");
    bindHold($("#rotRightBtn"), "right");
    bindHold($("#thrustBtn"), "thrust");

    $("#fireBtn").addEventListener("click", fireBullet);
    $("#fireBtn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      fireBullet();
    }, { passive: false });

    $("#hyperspaceBtn").addEventListener("click", tryHyperspace);
    $("#hyperspaceBtn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      tryHyperspace();
    }, { passive: false });

    $("#helpBtnLevel").addEventListener("click", () => $("#helpOverlay").classList.remove("hidden"));
    $("#helpBtnGame").addEventListener("click", () => $("#helpOverlay").classList.remove("hidden"));
    $("#helpClose").addEventListener("click", () => $("#helpOverlay").classList.add("hidden"));
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") $("#helpOverlay").classList.add("hidden");
    });
  });
})();
