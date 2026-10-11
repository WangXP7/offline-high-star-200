(function () {
  "use strict";

  const SIZE = 10;
  const FLEET = [
    { id: "carrier", name: "Carrier", length: 5 },
    { id: "battleship", name: "Battleship", length: 4 },
    { id: "cruiser", name: "Cruiser", length: 3 },
    { id: "submarine", name: "Submarine", length: 3 },
    { id: "destroyer", name: "Destroyer", length: 2 },
  ];

  const LEVEL_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };

  const levelScreen = document.getElementById("levelScreen");
  const gameScreen = document.getElementById("gameScreen");
  const levelBadge = document.getElementById("levelBadge");
  const hud = document.getElementById("hud");
  const placementBar = document.getElementById("placementBar");
  const shipTray = document.getElementById("shipTray");
  const rotateBtn = document.getElementById("rotateBtn");
  const readyBtn = document.getElementById("readyBtn");
  const playerBoardEl = document.getElementById("playerBoard");
  const enemyBoardEl = document.getElementById("enemyBoard");
  const resultOverlay = document.getElementById("resultOverlay");
  const resultTitle = document.getElementById("resultTitle");
  const resultMsg = document.getElementById("resultMsg");
  const helpOverlay = document.getElementById("helpOverlay");
  const newGameBtn = document.getElementById("newGameBtn");
  const changeLevelBtn = document.getElementById("changeLevelBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const changeLevelFromResultBtn = document.getElementById("changeLevelFromResultBtn");
  const helpBtnLevel = document.getElementById("helpBtnLevel");
  const helpBtnGame = document.getElementById("helpBtnGame");
  const helpClose = document.getElementById("helpClose");

  let level = "easy";
  let phase = "level"; // level | placement | combat | result
  let horizontal = true;
  let selectedShipId = null;
  let playerTurn = true;
  let aiThinking = false;
  let hoverCell = null;

  let playerGrid = createEmptyGrid();
  let enemyGrid = createEmptyGrid();
  let playerShips = [];
  let enemyShips = [];
  let playerShots = createShotMap();
  let enemyShots = createShotMap();

  let aiHuntQueue = [];
  let aiHitCells = [];
  let aiParity = 0;

  function createEmptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  }

  function createShotMap() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  }

  function key(r, c) {
    return r + "," + c;
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

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

  function shipCells(r, c, length, isHorizontal) {
    const cells = [];
    for (let i = 0; i < length; i++) {
      const rr = isHorizontal ? r : r + i;
      const cc = isHorizontal ? c + i : c;
      cells.push({ r: rr, c: cc });
    }
    return cells;
  }

  function canPlace(grid, r, c, length, isHorizontal) {
    const cells = shipCells(r, c, length, isHorizontal);
    for (const cell of cells) {
      if (!inBounds(cell.r, cell.c)) return false;
      if (grid[cell.r][cell.c] !== null) return false;
    }
    return true;
  }

  function placeShipOnGrid(grid, ships, def, r, c, isHorizontal) {
    if (!canPlace(grid, r, c, def.length, isHorizontal)) return false;
    const cells = shipCells(r, c, def.length, isHorizontal);
    const ship = {
      id: def.id,
      name: def.name,
      length: def.length,
      cells: cells.map(function (cell) {
        return { r: cell.r, c: cell.c };
      }),
      hits: 0,
      sunk: false,
    };
    cells.forEach(function (cell) {
      grid[cell.r][cell.c] = def.id;
    });
    ships.push(ship);
    return true;
  }

  function removeShip(grid, ships, shipId) {
    const idx = ships.findIndex(function (s) {
      return s.id === shipId;
    });
    if (idx === -1) return;
    const ship = ships[idx];
    ship.cells.forEach(function (cell) {
      grid[cell.r][cell.c] = null;
    });
    ships.splice(idx, 1);
  }

  function autoPlaceFleet(grid, ships) {
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) grid[i][j] = null;
    }
    ships.length = 0;
    for (const def of FLEET) {
      let placed = false;
      for (let attempt = 0; attempt < 400 && !placed; attempt++) {
        const isH = Math.random() < 0.5;
        const r = Math.floor(Math.random() * SIZE);
        const c = Math.floor(Math.random() * SIZE);
        placed = placeShipOnGrid(grid, ships, def, r, c, isH);
      }
      if (!placed) return false;
    }
    return true;
  }

  function findShip(ships, shipId) {
    return ships.find(function (s) {
      return s.id === shipId;
    });
  }

  function allPlaced() {
    return playerShips.length === FLEET.length;
  }

  function fleetSunk(ships) {
    return ships.length > 0 && ships.every(function (s) {
      return s.sunk;
    });
  }

  function applyShot(grid, ships, shots, r, c) {
    if (shots[r][c] !== null) return null;
    const shipId = grid[r][c];
    if (!shipId) {
      shots[r][c] = "miss";
      return { result: "miss", ship: null };
    }
    shots[r][c] = "hit";
    const ship = findShip(ships, shipId);
    ship.hits += 1;
    if (ship.hits >= ship.length) {
      ship.sunk = true;
      ship.cells.forEach(function (cell) {
        shots[cell.r][cell.c] = "sunk";
      });
      return { result: "sunk", ship: ship };
    }
    return { result: "hit", ship: ship };
  }

  function resetAiMemory() {
    aiHuntQueue = [];
    aiHitCells = [];
    aiParity = Math.random() < 0.5 ? 0 : 1;
  }

  function neighbors(r, c) {
    return [
      { r: r - 1, c: c },
      { r: r + 1, c: c },
      { r: r, c: c - 1 },
      { r: r, c: c + 1 },
    ].filter(function (n) {
      return inBounds(n.r, n.c);
    });
  }

  function unshotCells() {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (enemyShots[r][c] === null) cells.push({ r: r, c: c });
      }
    }
    return cells;
  }

  function enqueueHuntAround(r, c) {
    const around = shuffle(neighbors(r, c));
    around.forEach(function (n) {
      if (enemyShots[n.r][n.c] !== null) return;
      const exists = aiHuntQueue.some(function (q) {
        return q.r === n.r && q.c === n.c;
      });
      if (!exists) aiHuntQueue.push(n);
    });
  }

  function pruneHuntQueue() {
    aiHuntQueue = aiHuntQueue.filter(function (n) {
      return enemyShots[n.r][n.c] === null;
    });
  }

  function alignedContinuation() {
    if (aiHitCells.length < 2) return null;
    const rows = aiHitCells.map(function (h) {
      return h.r;
    });
    const cols = aiHitCells.map(function (h) {
      return h.c;
    });
    const sameRow = rows.every(function (r) {
      return r === rows[0];
    });
    const sameCol = cols.every(function (c) {
      return c === cols[0];
    });
    if (!sameRow && !sameCol) return null;

    const candidates = [];
    if (sameRow) {
      const row = rows[0];
      const sorted = cols.slice().sort(function (a, b) {
        return a - b;
      });
      const left = sorted[0] - 1;
      const right = sorted[sorted.length - 1] + 1;
      if (inBounds(row, left) && enemyShots[row][left] === null) {
        candidates.push({ r: row, c: left });
      }
      if (inBounds(row, right) && enemyShots[row][right] === null) {
        candidates.push({ r: row, c: right });
      }
    } else {
      const col = cols[0];
      const sorted = rows.slice().sort(function (a, b) {
        return a - b;
      });
      const up = sorted[0] - 1;
      const down = sorted[sorted.length - 1] + 1;
      if (inBounds(up, col) && enemyShots[up][col] === null) {
        candidates.push({ r: up, c: col });
      }
      if (inBounds(down, col) && enemyShots[down][col] === null) {
        candidates.push({ r: down, c: col });
      }
    }
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function pickParityCell() {
    const open = unshotCells();
    const parity = open.filter(function (cell) {
      return (cell.r + cell.c) % 2 === aiParity;
    });
    const pool = parity.length ? parity : open;
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickRandomUnshot() {
    const open = unshotCells();
    if (!open.length) return null;
    return open[Math.floor(Math.random() * open.length)];
  }

  function chooseAiShot() {
    if (level === "easy") {
      return pickRandomUnshot();
    }

    pruneHuntQueue();

    if (level === "hard") {
      const cont = alignedContinuation();
      if (cont) return cont;
    }

    while (aiHuntQueue.length) {
      const next = aiHuntQueue.shift();
      if (enemyShots[next.r][next.c] === null) return next;
    }

    if (level === "hard") {
      return pickParityCell();
    }
    return pickRandomUnshot();
  }

  function onAiShotResult(r, c, outcome) {
    if (level === "easy") return;

    if (outcome.result === "hit") {
      aiHitCells.push({ r: r, c: c });
      enqueueHuntAround(r, c);
    } else if (outcome.result === "sunk") {
      aiHitCells = [];
      aiHuntQueue = [];
    } else if (outcome.result === "miss") {
      pruneHuntQueue();
    }
  }

  function buildBoards() {
    playerBoardEl.innerHTML = "";
    enemyBoardEl.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const pCell = document.createElement("button");
        pCell.type = "button";
        pCell.className = "cell";
        pCell.dataset.r = String(r);
        pCell.dataset.c = String(c);
        pCell.setAttribute("aria-label", "Your fleet " + (r + 1) + "," + (c + 1));
        playerBoardEl.appendChild(pCell);

        const eCell = document.createElement("button");
        eCell.type = "button";
        eCell.className = "cell fog";
        eCell.dataset.r = String(r);
        eCell.dataset.c = String(c);
        eCell.setAttribute("aria-label", "Enemy waters " + (r + 1) + "," + (c + 1));
        enemyBoardEl.appendChild(eCell);
      }
    }
  }

  function renderShipTray() {
    shipTray.innerHTML = "";
    FLEET.forEach(function (def) {
      const placed = !!findShip(playerShips, def.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ship-chip" + (placed ? " placed" : "") + (selectedShipId === def.id ? " selected" : "");
      btn.disabled = placed;
      btn.dataset.shipId = def.id;

      const name = document.createElement("span");
      name.className = "ship-chip-name";
      name.textContent = def.name + " (" + def.length + ")";
      btn.appendChild(name);

      const cells = document.createElement("span");
      cells.className = "ship-chip-cells";
      for (let i = 0; i < def.length; i++) {
        const dot = document.createElement("span");
        dot.className = "ship-chip-cell";
        cells.appendChild(dot);
      }
      btn.appendChild(cells);

      if (!placed) {
        btn.addEventListener("click", function () {
          selectedShipId = def.id;
          renderShipTray();
          renderBoards();
          setHud("Place " + def.name + " · Rotate or R to turn");
        });
      }
      shipTray.appendChild(btn);
    });
    readyBtn.disabled = !allPlaced();
  }

  function getPreviewCells() {
    if (phase !== "placement" || !selectedShipId || !hoverCell) return null;
    const def = FLEET.find(function (s) {
      return s.id === selectedShipId;
    });
    if (!def) return null;
    const cells = shipCells(hoverCell.r, hoverCell.c, def.length, horizontal);
    const valid = canPlace(playerGrid, hoverCell.r, hoverCell.c, def.length, horizontal);
    return { cells: cells, valid: valid };
  }

  function renderBoards() {
    const preview = getPreviewCells();
    const previewSet = new Set();
    if (preview) {
      preview.cells.forEach(function (cell) {
        if (inBounds(cell.r, cell.c)) previewSet.add(key(cell.r, cell.c));
      });
    }

    playerBoardEl.querySelectorAll(".cell").forEach(function (el) {
      const r = Number(el.dataset.r);
      const c = Number(el.dataset.c);
      el.className = "cell";
      const shot = enemyShots[r][c];
      const occupied = playerGrid[r][c];

      if (shot === "sunk") el.classList.add("sunk");
      else if (shot === "hit") el.classList.add("hit");
      else if (shot === "miss") el.classList.add("miss");
      else if (occupied) el.classList.add("ship");

      if (preview && previewSet.has(key(r, c))) {
        el.classList.add(preview.valid ? "preview-valid" : "preview-invalid");
      }
    });

    enemyBoardEl.querySelectorAll(".cell").forEach(function (el) {
      const r = Number(el.dataset.r);
      const c = Number(el.dataset.c);
      el.className = "cell";
      const shot = playerShots[r][c];
      if (shot === "sunk") {
        el.classList.add("sunk");
      } else if (shot === "hit") {
        el.classList.add("hit");
      } else if (shot === "miss") {
        el.classList.add("miss");
      } else {
        el.classList.add("fog");
      }
    });

    playerBoardEl.classList.toggle("placing", phase === "placement");
    enemyBoardEl.classList.toggle(
      "combat-target",
      phase === "combat" && playerTurn && !aiThinking
    );
  }

  function setHud(text) {
    hud.textContent = text;
  }

  function showHelp(show) {
    helpOverlay.classList.toggle("hidden", !show);
    helpOverlay.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function showResult(won) {
    phase = "result";
    resultOverlay.classList.remove("hidden");
    if (won) {
      resultTitle.textContent = "Victory!";
      resultMsg.textContent = "You sank the enemy fleet. The seas are yours.";
    } else {
      resultTitle.textContent = "Defeat";
      resultMsg.textContent = "Your fleet has been destroyed. Better luck next time.";
    }
    playerTurn = false;
    aiThinking = false;
    renderBoards();
  }

  function startPlacement() {
    phase = "placement";
    horizontal = true;
    selectedShipId = FLEET[0].id;
    playerTurn = true;
    aiThinking = false;
    hoverCell = null;
    playerGrid = createEmptyGrid();
    enemyGrid = createEmptyGrid();
    playerShips = [];
    enemyShips = [];
    playerShots = createShotMap();
    enemyShots = createShotMap();
    resetAiMemory();
    resultOverlay.classList.add("hidden");
    placementBar.classList.remove("hidden-bar");
    levelBadge.textContent = LEVEL_LABELS[level];
    setHud("Select a ship and place it on your board");
    renderShipTray();
    renderBoards();
  }

  function startCombat() {
    let ok = false;
    for (let i = 0; i < 50 && !ok; i++) {
      ok = autoPlaceFleet(enemyGrid, enemyShips);
    }
    if (!ok) {
      setHud("Could not place enemy fleet — try Ready again");
      return;
    }
    phase = "combat";
    playerTurn = true;
    aiThinking = false;
    selectedShipId = null;
    hoverCell = null;
    placementBar.classList.add("hidden-bar");
    setHud("Your turn — fire on enemy waters");
    renderBoards();
  }

  function endIfOver() {
    if (fleetSunk(enemyShips)) {
      showResult(true);
      return true;
    }
    if (fleetSunk(playerShips)) {
      showResult(false);
      return true;
    }
    return false;
  }

  function handlePlayerFire(r, c) {
    if (phase !== "combat" || !playerTurn || aiThinking) return;
    if (playerShots[r][c] !== null) return;

    const outcome = applyShot(enemyGrid, enemyShips, playerShots, r, c);
    if (!outcome) return;

    if (outcome.result === "miss") {
      setHud("Miss");
    } else if (outcome.result === "hit") {
      setHud("Hit!");
    } else {
      setHud("You sank the enemy " + outcome.ship.name + "!");
    }
    renderBoards();

    if (endIfOver()) return;

    playerTurn = false;
    scheduleAiTurn();
  }

  function scheduleAiTurn() {
    aiThinking = true;
    setHud("Enemy targeting…");
    renderBoards();
    const delay = 400 + Math.floor(Math.random() * 201);
    setTimeout(function () {
      if (phase !== "combat") return;
      const target = chooseAiShot();
      if (!target) {
        aiThinking = false;
        playerTurn = true;
        setHud("Your turn — fire on enemy waters");
        renderBoards();
        return;
      }
      const outcome = applyShot(playerGrid, playerShips, enemyShots, target.r, target.c);
      onAiShotResult(target.r, target.c, outcome);
      if (outcome.result === "miss") {
        setHud("Enemy missed");
      } else if (outcome.result === "hit") {
        setHud("Enemy hit your " + outcome.ship.name + "!");
      } else {
        setHud("Enemy sank your " + outcome.ship.name + "!");
      }
      renderBoards();
      aiThinking = false;
      if (endIfOver()) return;
      playerTurn = true;
      setHud("Your turn — fire on enemy waters");
      renderBoards();
    }, delay);
  }

  function tryPlaceAt(r, c) {
    if (phase !== "placement" || !selectedShipId) return;
    const def = FLEET.find(function (s) {
      return s.id === selectedShipId;
    });
    if (!def) return;
    if (findShip(playerShips, def.id)) return;

    if (!canPlace(playerGrid, r, c, def.length, horizontal)) {
      setHud("Invalid placement — try another cell or rotate");
      return;
    }

    placeShipOnGrid(playerGrid, playerShips, def, r, c, horizontal);
    const next = FLEET.find(function (s) {
      return !findShip(playerShips, s.id);
    });
    selectedShipId = next ? next.id : null;
    hoverCell = null;
    renderShipTray();
    renderBoards();
    if (allPlaced()) {
      setHud("Fleet ready — press Ready to battle");
    } else if (selectedShipId) {
      const n = FLEET.find(function (s) {
        return s.id === selectedShipId;
      });
      setHud("Place " + n.name);
    }
  }

  function openLevelScreen() {
    phase = "level";
    gameScreen.classList.add("hidden");
    levelScreen.classList.remove("hidden");
    resultOverlay.classList.add("hidden");
    showHelp(false);
  }

  function beginLevel(selected) {
    level = selected;
    levelScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    startPlacement();
  }

  function onPlayerBoardClick(e) {
    const cell = e.target.closest(".cell");
    if (!cell || !playerBoardEl.contains(cell)) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    tryPlaceAt(r, c);
  }

  function onPlayerBoardMove(e) {
    if (phase !== "placement" || !selectedShipId) return;
    const cell = e.target.closest(".cell");
    if (!cell || !playerBoardEl.contains(cell)) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    if (!hoverCell || hoverCell.r !== r || hoverCell.c !== c) {
      hoverCell = { r: r, c: c };
      renderBoards();
    }
  }

  function onPlayerBoardLeave() {
    if (phase !== "placement") return;
    if (hoverCell) {
      hoverCell = null;
      renderBoards();
    }
  }

  function onEnemyBoardClick(e) {
    const cell = e.target.closest(".cell");
    if (!cell || !enemyBoardEl.contains(cell)) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    handlePlayerFire(r, c);
  }

  document.querySelectorAll(".level-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      beginLevel(btn.dataset.level);
    });
  });

  rotateBtn.addEventListener("click", function () {
    if (phase !== "placement") return;
    horizontal = !horizontal;
    renderBoards();
    setHud(horizontal ? "Orientation: horizontal" : "Orientation: vertical");
  });

  readyBtn.addEventListener("click", function () {
    if (!allPlaced()) return;
    startCombat();
  });

  newGameBtn.addEventListener("click", function () {
    startPlacement();
  });

  changeLevelBtn.addEventListener("click", openLevelScreen);
  playAgainBtn.addEventListener("click", function () {
    startPlacement();
  });
  changeLevelFromResultBtn.addEventListener("click", openLevelScreen);

  helpBtnLevel.addEventListener("click", function () {
    showHelp(true);
  });
  helpBtnGame.addEventListener("click", function () {
    showHelp(true);
  });
  helpClose.addEventListener("click", function () {
    showHelp(false);
  });
  helpOverlay.addEventListener("click", function (e) {
    if (e.target === helpOverlay) showHelp(false);
  });

  playerBoardEl.addEventListener("click", onPlayerBoardClick);
  playerBoardEl.addEventListener("mousemove", onPlayerBoardMove);
  playerBoardEl.addEventListener("mouseleave", onPlayerBoardLeave);
  enemyBoardEl.addEventListener("click", onEnemyBoardClick);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !helpOverlay.classList.contains("hidden")) {
      showHelp(false);
      return;
    }
    if (phase !== "placement") return;
    if (e.key === "r" || e.key === "R") {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      horizontal = !horizontal;
      renderBoards();
      setHud(horizontal ? "Orientation: horizontal" : "Orientation: vertical");
    }
  });

  // Allow re-selecting a placed ship to move it by clicking its chip after removing — chips are disabled when placed.
  // Double-click a placed ship on the board to pick it back up.
  playerBoardEl.addEventListener("dblclick", function (e) {
    if (phase !== "placement") return;
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    const shipId = playerGrid[r][c];
    if (!shipId) return;
    removeShip(playerGrid, playerShips, shipId);
    selectedShipId = shipId;
    renderShipTray();
    renderBoards();
    const def = FLEET.find(function (s) {
      return s.id === shipId;
    });
    setHud("Reposition " + def.name);
  });

  buildBoards();
  openLevelScreen();
})();
