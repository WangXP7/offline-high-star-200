(function () {
  "use strict";

  const SUITS = ["♠", "♥", "♦", "♣"];
  const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const LEVELS = {
    easy: { chips: 1000, minBet: 10, hints: true },
    medium: { chips: 500, minBet: 25, hints: false },
    hard: { chips: 200, minBet: 50, hints: false },
  };

  let state = {
    level: "easy",
    chips: 1000,
    bet: 10,
    deck: [],
    player: [],
    dealer: [],
    phase: "betting",
    hideDealer: true,
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

  function ensureDeck() {
    if (state.deck.length < 20) state.deck = createDeck();
  }

  function draw() {
    ensureDeck();
    return state.deck.pop();
  }

  function cardValue(rank) {
    if (rank === "A") return 11;
    if (["K", "Q", "J"].includes(rank)) return 10;
    return parseInt(rank, 10);
  }

  function handValue(hand) {
    let total = 0;
    let aces = 0;
    for (const c of hand) {
      total += cardValue(c.rank);
      if (c.rank === "A") aces++;
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  }

  function isBlackjack(hand) {
    return hand.length === 2 && handValue(hand) === 21;
  }

  function isRed(suit) {
    return suit === "♥" || suit === "♦";
  }

  function cardEl(card, faceDown) {
    const d = document.createElement("div");
    if (faceDown) {
      d.className = "card face-down";
      return d;
    }
    d.className = "card " + (isRed(card.suit) ? "red" : "black");
    d.innerHTML = '<span class="rank">' + card.rank + '</span><span class="suit">' + card.suit + "</span>";
    return d;
  }

  function renderHands() {
    const dh = $("#dealerHand");
    const ph = $("#playerHand");
    dh.innerHTML = "";
    ph.innerHTML = "";
    state.dealer.forEach((c, i) => {
      dh.appendChild(cardEl(c, state.hideDealer && i === 0));
    });
    state.player.forEach((c) => ph.appendChild(cardEl(c)));
    $("#playerTotal").textContent = state.player.length ? "(" + handValue(state.player) + ")" : "";
    if (state.hideDealer && state.dealer.length) {
      $("#dealerTotal").textContent = "(?)";
    } else {
      $("#dealerTotal").textContent = state.dealer.length ? "(" + handValue(state.dealer) + ")" : "";
    }
  }

  function updateChips() {
    $("#chipCount").textContent = "Chips: " + state.chips;
    $("#betDisplay").textContent = String(state.bet);
  }

  function setPhase(phase) {
    state.phase = phase;
    $("#betPanel").classList.toggle("hidden", phase !== "betting");
    $("#actionPanel").classList.toggle("hidden", phase !== "playing");
    $("#hintBtn").classList.toggle("hidden", !cfg().hints || phase !== "playing");
    $("#hintText").classList.add("hidden");
    $("#doubleBtn").disabled = !(phase === "playing" && state.player.length === 2 && state.chips >= state.bet);
  }

  function basicHint() {
    const p = handValue(state.player);
    const up = state.hideDealer ? cardValue(state.dealer[1].rank) : handValue(state.dealer);
    if (p >= 17) return "Stand";
    if (p <= 11) return "Hit";
    if (p >= 12 && p <= 16 && up >= 7) return "Hit";
    if (p >= 12 && p <= 16 && up <= 6) return "Stand";
    return p < 17 ? "Hit" : "Stand";
  }

  function deal() {
    if (state.chips < state.bet) {
      $("#statusText").textContent = "Not enough chips.";
      return;
    }
    state.chips -= state.bet;
    state.player = [draw(), draw()];
    state.dealer = [draw(), draw()];
    state.hideDealer = true;
    updateChips();
    renderHands();
    $("#statusText").textContent = "";
    $("#resultOverlay").classList.add("hidden");

    if (isBlackjack(state.player) || isBlackjack(state.dealer)) {
      settle(true);
      return;
    }
    setPhase("playing");
  }

  function hit() {
    if (state.phase !== "playing") return;
    state.player.push(draw());
    renderHands();
    $("#doubleBtn").disabled = true;
    if (handValue(state.player) > 21) settle(false);
  }

  function stand() {
    if (state.phase !== "playing") return;
    playDealer();
  }

  function doubleDown() {
    if (state.phase !== "playing" || state.player.length !== 2 || state.chips < state.bet) return;
    state.chips -= state.bet;
    state.bet *= 2;
    updateChips();
    state.player.push(draw());
    renderHands();
    if (handValue(state.player) > 21) settle(false);
    else playDealer();
  }

  function playDealer() {
    state.hideDealer = false;
    while (handValue(state.dealer) < 17) state.dealer.push(draw());
    renderHands();
    settle(false);
  }

  function settle(checkNatural) {
    state.hideDealer = false;
    renderHands();
    setPhase("settled");

    const pv = handValue(state.player);
    const dv = handValue(state.dealer);
    const pBJ = isBlackjack(state.player);
    const dBJ = isBlackjack(state.dealer);
    let title = "";
    let msg = "";
    let payout = 0;

    if (checkNatural) {
      if (pBJ && dBJ) {
        title = "Push";
        msg = "Both have blackjack.";
        payout = state.bet;
      } else if (pBJ) {
        title = "Blackjack!";
        msg = "Pays 3:2.";
        payout = state.bet + Math.floor(state.bet * 1.5);
      } else if (dBJ) {
        title = "Dealer blackjack";
        msg = "You lose this round.";
        payout = 0;
      }
    } else if (pv > 21) {
      title = "Bust";
      msg = "You went over 21.";
      payout = 0;
    } else if (dv > 21) {
      title = "You win!";
      msg = "Dealer busted.";
      payout = state.bet * 2;
    } else if (pv > dv) {
      title = "You win!";
      msg = pv + " beats " + dv + ".";
      payout = state.bet * 2;
    } else if (pv < dv) {
      title = "Dealer wins";
      msg = dv + " beats " + pv + ".";
      payout = 0;
    } else {
      title = "Push";
      msg = "Same total (" + pv + ").";
      payout = state.bet;
    }

    state.chips += payout;
    updateChips();
    $("#resultTitle").textContent = title;
    $("#resultMsg").textContent = msg;
    $("#resultOverlay").classList.remove("hidden");

    if (state.chips < cfg().minBet) {
      $("#resultMsg").textContent += " You're out of chips for this level.";
      $("#nextRoundBtn").textContent = "New Game";
    } else {
      $("#nextRoundBtn").textContent = "Next Round";
    }
  }

  function resetRound() {
    const c = cfg();
    if (state.chips < c.minBet) {
      state.chips = c.chips;
      state.bet = c.minBet;
    }
    state.bet = Math.min(Math.max(state.bet, c.minBet), state.chips);
    // restore bet if doubled
    if (state.bet > state.chips) state.bet = c.minBet;
    state.player = [];
    state.dealer = [];
    state.hideDealer = true;
    updateChips();
    renderHands();
    setPhase("betting");
    $("#statusText").textContent = "";
    $("#resultOverlay").classList.add("hidden");
  }

  function startSession() {
    const c = cfg();
    state.chips = c.chips;
    state.bet = c.minBet;
    state.deck = createDeck();
    resetRound();
  }

  function startGame(level) {
    state.level = level;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    $("#levelBadge").textContent = level.charAt(0).toUpperCase() + level.slice(1);
    startSession();
  }

  function goToLevelScreen() {
    $("#gameScreen").classList.add("hidden");
    $("#resultOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  function showHelp() {
    $("#helpOverlay").classList.remove("hidden");
  }
  function hideHelp() {
    $("#helpOverlay").classList.add("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".level-btn").forEach((btn) => btn.addEventListener("click", () => startGame(btn.dataset.level)));
    $("#newGameBtn").addEventListener("click", startSession);
    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);
    $("#dealBtn").addEventListener("click", deal);
    $("#hitBtn").addEventListener("click", hit);
    $("#standBtn").addEventListener("click", stand);
    $("#doubleBtn").addEventListener("click", doubleDown);
    $("#hintBtn").addEventListener("click", () => {
      $("#hintText").textContent = "Suggestion: " + basicHint();
      $("#hintText").classList.remove("hidden");
    });
    $("#betPlus").addEventListener("click", () => {
      const step = cfg().minBet;
      state.bet = Math.min(state.bet + step, state.chips);
      updateChips();
    });
    $("#betMinus").addEventListener("click", () => {
      const step = cfg().minBet;
      state.bet = Math.max(state.bet - step, cfg().minBet);
      updateChips();
    });
    $("#nextRoundBtn").addEventListener("click", () => {
      if (state.chips < cfg().minBet) startSession();
      else {
        // reset bet to min if it was doubled
        const half = Math.floor(state.bet / 2);
        if (half >= cfg().minBet && half * 2 === state.bet) state.bet = Math.max(half, cfg().minBet);
        state.bet = Math.min(Math.max(state.bet, cfg().minBet), state.chips);
        resetRound();
      }
    });
    $("#changeLevelFromResultBtn").addEventListener("click", goToLevelScreen);
    $("#helpBtnLevel").addEventListener("click", showHelp);
    $("#helpBtnGame").addEventListener("click", showHelp);
    $("#helpClose").addEventListener("click", hideHelp);
    $("#helpOverlay").addEventListener("click", (e) => {
      if (e.target.id === "helpOverlay") hideHelp();
    });
  });
})();
