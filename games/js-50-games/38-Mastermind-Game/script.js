(function () {
  "use strict";

  const COLORS = [
    "#e74c3c", "#3498db", "#2ecc71", "#f1c40f",
    "#9b59b6", "#e67e22", "#1abc9c", "#ecf0f1",
  ];

  const LEVELS = {
    easy: { pegs: 4, colors: 4, maxGuesses: 12 },
    medium: { pegs: 4, colors: 6, maxGuesses: 10 },
    hard: { pegs: 5, colors: 8, maxGuesses: 8 },
  };

  let state = {
    level: "easy",
    secret: [],
    current: [],
    history: [],
    gameOver: false,
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  function cfg() {
    return LEVELS[state.level];
  }

  function makeSecret() {
    const { pegs, colors } = cfg();
    const secret = [];
    for (let i = 0; i < pegs; i++) {
      secret.push(Math.floor(Math.random() * colors));
    }
    return secret;
  }

  function scoreGuess(guess, secret) {
    const n = secret.length;
    let blacks = 0;
    const secretLeft = [];
    const guessLeft = [];
    for (let i = 0; i < n; i++) {
      if (guess[i] === secret[i]) blacks++;
      else {
        secretLeft.push(secret[i]);
        guessLeft.push(guess[i]);
      }
    }
    let whites = 0;
    const used = new Array(secretLeft.length).fill(false);
    for (let i = 0; i < guessLeft.length; i++) {
      for (let j = 0; j < secretLeft.length; j++) {
        if (!used[j] && guessLeft[i] === secretLeft[j]) {
          used[j] = true;
          whites++;
          break;
        }
      }
    }
    return { blacks, whites };
  }

  function pegEl(colorIndex, extraClass) {
    const d = document.createElement("div");
    d.className = "peg" + (extraClass ? " " + extraClass : "");
    if (colorIndex === null || colorIndex === undefined) {
      d.classList.add("empty");
    } else if (colorIndex === -1) {
      d.classList.add("hidden-secret");
    } else {
      d.style.background = COLORS[colorIndex];
    }
    return d;
  }

  function renderSecret(reveal) {
    const row = $("#secretRow");
    row.innerHTML = "";
    const label = document.createElement("span");
    label.textContent = reveal ? "Code:" : "Secret:";
    label.style.marginRight = "8px";
    label.style.opacity = "0.8";
    row.appendChild(label);
    const { pegs } = cfg();
    for (let i = 0; i < pegs; i++) {
      row.appendChild(pegEl(reveal ? state.secret[i] : -1));
    }
  }

  function renderHistory() {
    const hist = $("#history");
    hist.innerHTML = "";
    state.history.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "guess-row";
      entry.guess.forEach((c) => row.appendChild(pegEl(c)));
      const fb = document.createElement("div");
      fb.className = "feedback";
      const total = cfg().pegs;
      let placed = 0;
      for (let i = 0; i < entry.blacks; i++) {
        const p = document.createElement("div");
        p.className = "fb-peg black";
        fb.appendChild(p);
        placed++;
      }
      for (let i = 0; i < entry.whites; i++) {
        const p = document.createElement("div");
        p.className = "fb-peg white";
        fb.appendChild(p);
        placed++;
      }
      while (placed < total) {
        const p = document.createElement("div");
        p.className = "fb-peg empty";
        fb.appendChild(p);
        placed++;
      }
      row.appendChild(fb);
      hist.appendChild(row);
    });
    hist.scrollTop = hist.scrollHeight;
  }

  function renderCurrent() {
    const row = $("#currentGuess");
    row.innerHTML = "";
    const { pegs } = cfg();
    for (let i = 0; i < pegs; i++) {
      const peg = pegEl(state.current[i] ?? null);
      peg.dataset.slot = i;
      peg.addEventListener("click", () => {
        if (state.gameOver) return;
        state.current[i] = undefined;
        renderCurrent();
      });
      row.appendChild(peg);
    }
    $("#submitBtn").disabled = state.gameOver || state.current.filter((c) => c !== undefined).length !== pegs;
  }

  function renderPalette() {
    const pal = $("#palette");
    pal.innerHTML = "";
    const { colors } = cfg();
    for (let i = 0; i < colors; i++) {
      const peg = pegEl(i);
      peg.addEventListener("click", () => pickColor(i));
      pal.appendChild(peg);
    }
  }

  function pickColor(colorIndex) {
    if (state.gameOver) return;
    const { pegs } = cfg();
    const slot = state.current.findIndex((c) => c === undefined);
    const idx = slot === -1 ? state.current.length : slot;
    if (idx >= pegs) return;
    state.current[idx] = colorIndex;
    while (state.current.length < pegs) state.current.push(undefined);
    state.current = state.current.slice(0, pegs);
    renderCurrent();
  }

  function updateGuessesLeft() {
    const left = cfg().maxGuesses - state.history.length;
    $("#guessesLeft").textContent = "Guesses: " + left;
  }

  function submitGuess() {
    if (state.gameOver) return;
    const { pegs, maxGuesses } = cfg();
    if (state.current.filter((c) => c !== undefined).length !== pegs) return;
    const guess = state.current.slice();
    const { blacks, whites } = scoreGuess(guess, state.secret);
    state.history.push({ guess, blacks, whites });
    state.current = Array(pegs).fill(undefined);
    renderHistory();
    renderCurrent();
    updateGuessesLeft();

    if (blacks === pegs) {
      endGame(true);
    } else if (state.history.length >= maxGuesses) {
      endGame(false);
    }
  }

  function endGame(won) {
    state.gameOver = true;
    renderSecret(true);
    $("#resultTitle").textContent = won ? "You cracked it!" : "Out of guesses";
    $("#resultMsg").textContent = won
      ? "You found the code in " + state.history.length + " guess(es)."
      : "Better luck next time. The code is revealed above.";
    $("#resultOverlay").classList.remove("hidden");
    renderCurrent();
  }

  function startNewGame() {
    const { pegs } = cfg();
    state.secret = makeSecret();
    state.current = Array(pegs).fill(undefined);
    state.history = [];
    state.gameOver = false;
    $("#resultOverlay").classList.add("hidden");
    renderSecret(false);
    renderHistory();
    renderPalette();
    renderCurrent();
    updateGuessesLeft();
  }

  function startGame(level) {
    state.level = level;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    $("#levelBadge").textContent = level.charAt(0).toUpperCase() + level.slice(1);
    startNewGame();
  }

  function goToLevelScreen() {
    $("#gameScreen").classList.add("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  function showHelp() {
    $("#helpOverlay").classList.remove("hidden");
    $("#helpOverlay").setAttribute("aria-hidden", "false");
  }

  function hideHelp() {
    $("#helpOverlay").classList.add("hidden");
    $("#helpOverlay").setAttribute("aria-hidden", "true");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".level-btn").forEach((btn) => {
      btn.addEventListener("click", () => startGame(btn.dataset.level));
    });
    $("#newGameBtn").addEventListener("click", startNewGame);
    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);
    $("#clearBtn").addEventListener("click", () => {
      if (state.gameOver) return;
      state.current = Array(cfg().pegs).fill(undefined);
      renderCurrent();
    });
    $("#submitBtn").addEventListener("click", submitGuess);
    $("#playAgainBtn").addEventListener("click", startNewGame);
    $("#changeLevelFromResultBtn").addEventListener("click", goToLevelScreen);
    $("#helpBtnLevel").addEventListener("click", showHelp);
    $("#helpBtnGame").addEventListener("click", showHelp);
    $("#helpClose").addEventListener("click", hideHelp);
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") hideHelp();
    });
  });
})();
