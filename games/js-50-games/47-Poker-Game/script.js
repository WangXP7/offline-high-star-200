(function () {
  "use strict";

  const SUITS = ["♠", "♥", "♦", "♣"];
  const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const RANK_VAL = {};
  RANKS.forEach((r, i) => {
    RANK_VAL[r] = i + 2;
  });

  const HAND_NAMES = [
    "High Card",
    "Pair",
    "Two Pair",
    "Three of a Kind",
    "Straight",
    "Flush",
    "Full House",
    "Four of a Kind",
    "Straight Flush",
    "Royal Flush",
  ];

  const LEVELS = {
    easy: { chips: 1000, ante: 10, hints: true, ai: "weak", showAiDiscard: true },
    medium: { chips: 500, ante: 25, hints: false, ai: "solid", showAiDiscard: false },
    hard: { chips: 250, ante: 50, hints: false, ai: "solid+", showAiDiscard: false },
  };

  let state = {
    level: "easy",
    chips: 1000,
    pot: 0,
    deck: [],
    player: [],
    ai: [],
    playerMarked: [],
    aiDiscarded: [],
    phase: "betting",
    hideAi: true,
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  function cfg() {
    return LEVELS[state.level];
  }

  function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) deck.push({ suit, rank });
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function drawCard() {
    if (state.deck.length < 1) state.deck = createDeck();
    return state.deck.pop();
  }

  function isRed(suit) {
    return suit === "♥" || suit === "♦";
  }

  function evaluateHand(hand) {
    const vals = hand.map((c) => RANK_VAL[c.rank]).sort((a, b) => b - a);
    const suits = hand.map((c) => c.suit);
    const counts = {};
    vals.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });
    const byCount = Object.keys(counts)
      .map(Number)
      .sort((a, b) => counts[b] - counts[a] || b - a);
    const flush = suits.every((s) => s === suits[0]);

    let straight = false;
    let straightHigh = 0;
    const uniq = [...new Set(vals)].sort((a, b) => b - a);
    if (uniq.length === 5) {
      if (uniq[0] - uniq[4] === 4) {
        straight = true;
        straightHigh = uniq[0];
      } else if (uniq[0] === 14 && uniq[1] === 5 && uniq[2] === 4 && uniq[3] === 3 && uniq[4] === 2) {
        straight = true;
        straightHigh = 5;
      }
    }

    const c0 = counts[byCount[0]];
    const c1 = counts[byCount[1]] || 0;

    if (straight && flush) {
      const cat = straightHigh === 14 ? 9 : 8;
      return { cat, kickers: [straightHigh], name: HAND_NAMES[cat] };
    }
    if (c0 === 4) {
      return { cat: 7, kickers: [byCount[0], byCount[1]], name: HAND_NAMES[7] };
    }
    if (c0 === 3 && c1 === 2) {
      return { cat: 6, kickers: [byCount[0], byCount[1]], name: HAND_NAMES[6] };
    }
    if (flush) {
      return { cat: 5, kickers: vals.slice(), name: HAND_NAMES[5] };
    }
    if (straight) {
      return { cat: 4, kickers: [straightHigh], name: HAND_NAMES[4] };
    }
    if (c0 === 3) {
      const kick = byCount.filter((v) => v !== byCount[0]).sort((a, b) => b - a);
      return { cat: 3, kickers: [byCount[0], ...kick], name: HAND_NAMES[3] };
    }
    if (c0 === 2 && c1 === 2) {
      const pairs = byCount.filter((v) => counts[v] === 2).sort((a, b) => b - a);
      const kicker = byCount.find((v) => counts[v] === 1);
      return { cat: 2, kickers: [pairs[0], pairs[1], kicker], name: HAND_NAMES[2] };
    }
    if (c0 === 2) {
      const kick = byCount.filter((v) => v !== byCount[0]).sort((a, b) => b - a);
      return { cat: 1, kickers: [byCount[0], ...kick], name: HAND_NAMES[1] };
    }
    return { cat: 0, kickers: vals.slice(), name: HAND_NAMES[0] };
  }

  function compareHands(a, b) {
    if (a.cat !== b.cat) return a.cat - b.cat;
    for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
      const av = a.kickers[i] || 0;
      const bv = b.kickers[i] || 0;
      if (av !== bv) return av - bv;
    }
    return 0;
  }

  function cardEl(card, opts) {
    const d = document.createElement("div");
    if (opts.faceDown) {
      d.className = "card face-down";
      return d;
    }
    d.className = "card " + (isRed(card.suit) ? "red" : "black");
    if (opts.selectable) d.classList.add("selectable");
    if (opts.marked) d.classList.add("marked");
    d.innerHTML =
      '<span class="rank">' + card.rank + '</span><span class="suit">' + card.suit + "</span>";
    if (opts.onClick) d.addEventListener("click", opts.onClick);
    return d;
  }

  function renderHands() {
    const ah = $("#aiHand");
    const ph = $("#playerHand");
    ah.innerHTML = "";
    ph.innerHTML = "";

    state.ai.forEach((c, i) => {
      const hide =
        state.hideAi ||
        (state.phase === "discard" &&
          !cfg().showAiDiscard &&
          state.aiDiscarded.includes(i));
      const marked =
        cfg().showAiDiscard &&
        state.phase === "discard" &&
        state.aiDiscarded.includes(i);
      ah.appendChild(
        cardEl(c, {
          faceDown: hide && !marked,
          marked: marked,
        })
      );
    });

    state.player.forEach((c, i) => {
      const selectable = state.phase === "discard";
      ph.appendChild(
        cardEl(c, {
          selectable,
          marked: state.playerMarked.includes(i),
          onClick: selectable
            ? () => {
                togglePlayerMark(i);
              }
            : null,
        })
      );
    });

    if (state.phase === "showdown" || state.phase === "handOver") {
      const pr = evaluateHand(state.player);
      const ar = evaluateHand(state.ai);
      $("#playerRank").textContent = "(" + pr.name + ")";
      $("#aiRank").textContent = "(" + ar.name + ")";
    } else {
      $("#playerRank").textContent = "";
      $("#aiRank").textContent = state.hideAi ? "" : "";
    }
  }

  function togglePlayerMark(i) {
    const idx = state.playerMarked.indexOf(i);
    if (idx >= 0) {
      state.playerMarked.splice(idx, 1);
    } else {
      if (state.playerMarked.length >= 3) {
        $("#statusText").textContent = "Max 3 discards.";
        return;
      }
      state.playerMarked.push(i);
    }
    $("#statusText").textContent = "";
    renderHands();
  }

  function updateHud() {
    $("#chipCount").textContent = "Chips: " + state.chips;
    $("#anteDisplay").textContent = String(cfg().ante);
    $("#potDisplay").textContent = "Pot: " + state.pot;
  }

  function setPhase(phase) {
    state.phase = phase;
    $("#betPanel").classList.toggle("hidden", phase !== "betting");
    $("#actionPanel").classList.toggle("hidden", phase !== "discard");
    $("#hintBtn").classList.toggle("hidden", !cfg().hints || phase !== "discard");
    $("#hintText").classList.add("hidden");
  }

  function suggestDiscards(hand) {
    const ev = evaluateHand(hand);
    if (ev.cat >= 6) return [];
    if (ev.cat === 7 || ev.cat === 8 || ev.cat === 9) return [];
    if (ev.cat === 5 || ev.cat === 4) return [];

    const vals = hand.map((c) => RANK_VAL[c.rank]);
    const counts = {};
    vals.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });
    const keep = new Set();

    if (ev.cat >= 1) {
      Object.keys(counts).forEach((v) => {
        if (counts[v] >= 2) keep.add(Number(v));
      });
      if (ev.cat === 3) {
        Object.keys(counts).forEach((v) => {
          if (counts[v] === 3) keep.add(Number(v));
        });
      }
    }

    const indices = [];
    hand.forEach((c, i) => {
      const v = RANK_VAL[c.rank];
      if (keep.size && !keep.has(v)) indices.push(i);
      else if (!keep.size && v < 11) indices.push(i);
    });
    return indices.slice(0, 3);
  }

  function aiChooseDiscards(hand, mode) {
    const ev = evaluateHand(hand);
    if (mode === "solid+" && ev.cat >= 3) return [];
    if (ev.cat >= 4) return [];

    if (mode === "weak") {
      const vals = hand.map((c) => RANK_VAL[c.rank]);
      const counts = {};
      vals.forEach((v) => {
        counts[v] = (counts[v] || 0) + 1;
      });
      const hasPair = Object.values(counts).some((n) => n >= 2);
      if (hasPair) {
        return hand
          .map((c, i) => i)
          .filter((i) => counts[RANK_VAL[hand[i].rank]] === 1)
          .slice(0, 3);
      }
      return hand
        .map((c, i) => ({ i, v: RANK_VAL[c.rank] }))
        .sort((a, b) => a.v - b.v)
        .slice(0, 3)
        .map((x) => x.i);
    }

    return suggestDiscards(hand);
  }

  function anteAndDeal() {
    const ante = cfg().ante;
    if (state.chips < ante) {
      showSessionOver();
      return;
    }
    state.chips -= ante;
    state.pot = ante * 2;
    state.deck = createDeck();
    state.player = [drawCard(), drawCard(), drawCard(), drawCard(), drawCard()];
    state.ai = [drawCard(), drawCard(), drawCard(), drawCard(), drawCard()];
    state.playerMarked = [];
    state.aiDiscarded = aiChooseDiscards(state.ai, cfg().ai);
    state.hideAi = true;
    updateHud();
    setPhase("discard");
    renderHands();
    $("#statusText").textContent = "Select up to 3 cards to discard.";
    $("#resultOverlay").classList.add("hidden");
  }

  function doDraw() {
    if (state.phase !== "discard") return;

    const keepPlayer = state.player.filter((_, i) => !state.playerMarked.includes(i));
    while (keepPlayer.length < 5) keepPlayer.push(drawCard());
    state.player = keepPlayer;
    state.playerMarked = [];

    const keepAi = state.ai.filter((_, i) => !state.aiDiscarded.includes(i));
    while (keepAi.length < 5) keepAi.push(drawCard());
    state.ai = keepAi;
    state.aiDiscarded = [];
    state.hideAi = false;

    setPhase("showdown");
    renderHands();
    settle();
  }

  function settle() {
    const pr = evaluateHand(state.player);
    const ar = evaluateHand(state.ai);
    const cmp = compareHands(pr, ar);
    let title;
    let msg;
    if (cmp > 0) {
      state.chips += state.pot;
      title = "You win!";
      msg = pr.name + " beats " + ar.name + ". +" + state.pot + " chips.";
    } else if (cmp < 0) {
      title = "AI wins";
      msg = ar.name + " beats " + pr.name + ". Pot " + state.pot + " lost.";
    } else {
      state.chips += Math.floor(state.pot / 2);
      title = "Tie";
      msg = "Both " + pr.name + ". Ante returned.";
    }
    state.pot = 0;
    updateHud();
    state.phase = "handOver";
    $("#resultTitle").textContent = title;
    $("#resultMsg").textContent = msg;
    $("#nextHandBtn").textContent =
      state.chips < cfg().ante ? "Broke — New Game" : "Next Hand";
    $("#resultOverlay").classList.remove("hidden");
  }

  function showSessionOver() {
    $("#resultTitle").textContent = "Out of chips";
    $("#resultMsg").textContent = "Not enough chips to ante. Start a new game or change level.";
    $("#nextHandBtn").textContent = "New Game";
    $("#resultOverlay").classList.remove("hidden");
    setPhase("betting");
  }

  function startGame(level) {
    state.level = level;
    state.chips = cfg().chips;
    state.pot = 0;
    state.player = [];
    state.ai = [];
    state.playerMarked = [];
    state.aiDiscarded = [];
    state.hideAi = true;
    $("#levelBadge").textContent = level.charAt(0).toUpperCase() + level.slice(1);
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#hintBtn").classList.toggle("hidden", !cfg().hints);
    setPhase("betting");
    updateHud();
    renderHands();
    $("#statusText").textContent = "Ante to start a hand.";
  }

  function goToLevelScreen() {
    $("#gameScreen").classList.add("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  function nextHand() {
    if (state.chips < cfg().ante) {
      startGame(state.level);
      return;
    }
    $("#resultOverlay").classList.add("hidden");
    state.player = [];
    state.ai = [];
    state.pot = 0;
    setPhase("betting");
    updateHud();
    renderHands();
    $("#statusText").textContent = "Ante to start a hand.";
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".level-btn").forEach((btn) =>
      btn.addEventListener("click", () => startGame(btn.dataset.level))
    );
    $("#anteBtn").addEventListener("click", anteAndDeal);
    $("#drawBtn").addEventListener("click", doDraw);
    $("#hintBtn").addEventListener("click", () => {
      const sug = suggestDiscards(state.player);
      state.playerMarked = sug.slice();
      renderHands();
      $("#hintText").textContent =
        sug.length === 0
          ? "Hint: keep this hand."
          : "Hint: discard the highlighted cards.";
      $("#hintText").classList.remove("hidden");
    });
    $("#newGameBtn").addEventListener("click", () => startGame(state.level));
    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);
    $("#nextHandBtn").addEventListener("click", nextHand);
    $("#changeLevelFromResultBtn").addEventListener("click", goToLevelScreen);
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
