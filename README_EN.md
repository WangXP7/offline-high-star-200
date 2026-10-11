# 🎮 Offline Mini Games Collection · 50 GitHub Favorites → **200**

> [中文说明](README.md) ｜ **English**

> 3,652 candidate repos → 8-dimension scoring → **four review rounds** → **all 200 games downloaded locally, playable offline**
> GitHub stars combined: **173,382+** ｜ Local size: **~3.9 GB** ｜ Genres: **43**

---

## 🌐 Online version

**This repository IS the online version** (GitHub Pages): <https://wangxp7.github.io/offline-high-star-200/>

The online site includes **194 of the 200 games**. Six extra-large items are **local-only**:
GameZone 700-in-1 (2.4GB), Koi Farm (130MB), TapTapTap (54MB), Zero Volt X (55MB), RxJS Fruits (74MB), HTML5 Game Book (45MB) — grab the full repo or run locally for all 200.

## 🚀 Quick Start (30 seconds · local)

1. **Double-click `启动合集.bat`** (Windows) — starts the local server and opens your browser
2. Or run manually: `python server.py`, then visit <http://127.0.0.1:8137>
3. Click **“▶ PLAY”** on any card; toggle **中文 / EN** at the top-right

> ⚠️ Must be served over HTTP — **do not open index.html directly from disk** (XHR-based games break under `file://`).
> Git Bash / Linux / macOS: `bash start.sh`.

---

## 📦 What's Inside (200 games)

| Category | Highlights |
|---|---|
| Typing / words | Qwerty Learner (23.3k★), Wordle+, Word Master, Chengyu Wordle, Kotobade (JP), Letreco (PT), Globle, 32-wordle Duotrigordle… |
| Classic arcade | Pac-Man ×4 versions, Chrome dino ×2, Super Mario JS, Prince of Persia, Lode Runner, Icy Tower, Blastar… |
| Shooters / action | Battle City ×2, Space Invaders ×3, Asteroids, Space Huggers, Ironhold FPS, Gauntlet, Isaac-web… 20+ |
| Blocks / match-3 | Tetris ×7 variants, Hextris, Candy Crush JS, Bubble Shooter, LinkUp… |
| Board / cards | Gomoku ×2, Xiangqi ×2, Chess, Connect Four ×2, Monopoly, Hearts, Blackjack, Roulette, Pool, Royal Game of Ur, Spider… |
| 3D games | HexGL, JavaScript Racer, Astray ×2, Rubik's Cube, Voxel Musou, JS Minecraft… 15+ |
| Sandbox / sim | Sandspiel ×2, Particle Life ×2, MicropolisJS, IsoCity, Koi Farm… |
| Idle / roguelike | A Dark Room (8.3k★), Life Restart (10.4k★), Particle Clicker, Progress Knight, Rogule, Sleeping Beauty… 15+ |
| Puzzles | Breaklock, Catch the Cat, Minesweeper ×5, Sudoku ×2, Queens, Black Hole Square… 20+ |
| Learn to code | Flexbox Froggy, Grid Garden, VIM Master, Untrusted… |
| Collections | GameZone (700+ games), 124-in-1, 50 JS Games, Vanilla 20, 7-in-1, LCD Games Museum… 9 packs |
| Others | RTS, Tower Defense, Uncharted Waters 2, Mahjong Solitaire, AI showcases ×6… |

Full list: the hub page (genre filter + search) or `games/manifest.json`.

---

## 🧭 Curation Method (why these 200)

### Data sources
- **80+ GitHub Search queries** (topics: html5-game, browser-game, tetris, snake, pacman, wordle, idle, roguelike, tower-defense, typing, chess, mahjong, js13k, match-3, breakout, quiz…) + **40 targeted lookups** of well-known repos
- Deduplicated candidate pool: **3,652** repos

### The 8 scoring dimensions
| # | Dimension | Notes |
|---|---|---|
| 1 | **Popularity** | GitHub stars (log-normalized, heaviest weight) |
| 2 | **Offline playability** | Static HTML/JS > gh-pages build > needs compiling (reject) > needs server/network (instant reject) |
| 3 | **Completeness** | Real gameplay loop, not engine demos or tutorial stubs |
| 4 | **Size** | Prefer small; oversized repos trimmed (untrusted lost 214MB of music) |
| 5 | **Genre diversity** | 43 genres, no piling up |
| 6 | **Maintenance** | Recently active; well-preserved classics kept |
| 7 | **License** | All open-source, attribution kept |
| 8 | **Chinese friendliness** | Bonus: 15+ games ship native Chinese UIs |

### The four review rounds
- **Round 1 · Hard filter (3652 → 213)**: archived repos, non-browser languages, engine/framework keywords, low stars, oversized repos, manual exclusion list.
- **Round 2 · Manual curation (→ 150)**: inspected each repo's real nature; removed libraries masquerading as games, CLI games, online-multiplayer titles; targeted-in missed classics (Life Restart 10.4k★, Untrusted, A Dark Room…).
- **Round 3 · Download & verify**: entry detection, HTTP checks, real-browser testing for every game. **23 games couldn't run offline — all fixed or replaced**:
  - codeload 404 → `git clone --depth 1` workaround
  - source-only repos → replaced with same-genre playable alternatives (handle→Wordle+, slaytheweb→7-in-1, candy-box-2→Quantum Game, duckhunt→Clumsy Bird, and 20+ more)
  - non-index entries → fixed 10 paths (chess.html, Tetris.html, block-it.html…)
  - absolute paths / webpack-required → path rewrites, hand-wired ES modules
- **Round 4 · Scale to 200 (+150 re-verified)**: full re-check of the first 50 + same pipeline for 150 new; during network outages used **git clone / jsDelivr CDN dual channels** (e.g., anime-guessr fetched file-by-file, 563 files); fixed slug collisions, folder renames (mini-games matching its build base path) and 5 engineering issues.

### Notable rejections
- warriorjs (9.5k★ — CLI, not a browser game), BrowserQuest (needs server), pokeclicker (412MB), blockly-games (816MB), multiplayer-only titles…
- A few genre-fillers have lower stars (minimum 21★ — Mandelbrot explorer), flagged on their cards.

---

## ✅ Quality Verification

1. **HTTP smoke test**: 200/200 entry pages 200 + every referenced local asset checked (remaining warnings are false positives: JS template strings, commented-out tags, favicon variants, analytics scripts)
2. **Real-browser test**: 200/200 rendered playable screens (menus / boards / canvases), key pages screenshot-verified
3. **In-game Chinese layer (new)**: every game page auto-injects a generic translation layer —
   - A floating **中 | EN** toggle at the bottom-right, remembered per game, defaults to the hub language; off = original English
   - Covers **DOM text, canvas fillText/strokeText, CSS pseudo-elements, title/placeholder attributes, and alert/confirm/prompt dialogs** (verified: 2048 fully Chinese; canvas-drawn "GAME OVER/Score" translated live)
   - 200+ common game phrases built in, extensible per game via `games/__i18n/<slug>.json`
   - Limitation: English baked as bitmap/sprite fonts (e.g. pixel titles in Radius Raid) can't be translated generically — those are image assets needing per-game font edits
4. **Known caveats** (flagged on cards): Server Survival styling degrades offline; webgbcam needs a webcam; Untrusted music trimmed; GameZone is a 2.4GB mega-collection (700+ games); some games reference analytics that fail silently offline

---

## 📁 Layout

```
offline-games-collection/
├── index.html          ← Hub (43 genre filters + search + 中文/EN toggle)
├── server.py           ← Zero-dependency server (path aliasing)
├── 启动合集.bat         ← One-click launcher (Windows)
├── start.sh            ← Git Bash / Linux / macOS
├── README.md / README_EN.md
├── games/
│   ├── manifest.json   ← Full bilingual metadata for 200 games
│   └── <200 game folders>
└── (curation/download scripts kept locally, not distributed)
```

---

## ⚖️ License

All games belong to their original authors; this collection is for **local learning and personal entertainment**.
Every card links to the game's GitHub repo — please honor each project's LICENSE.

## 🛠 FAQ

- **The .bat flashes and exits?** Install Python 3 (check “Add to PATH”)
- **Port taken?** `python server.py 9000`
- **Want the source?** It's in `games/<game>/`
- **Game won't load?** Use `http://127.0.0.1:8137`, not `file://`
