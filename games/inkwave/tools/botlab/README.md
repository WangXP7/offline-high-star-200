# Botlab — headless bot matches and page tests

Runs the real game (Electron, `electron/main.cjs`) offscreen and muted, in isolated profiles, to measure and tune the
bots without touching a normal install. Needs `npm install` (Electron) and macOS / Linux with a GPU.

```bash
# a stepped all-bot match (sim time: machine load doesn't change the numbers)
MAP=halyard MODE=turf SECS=180 tools/botlab/run.sh tools/botlab/match.cjs
MAP=lockgate MODE=zones tools/botlab/run.sh tools/botlab/match.cjs          # full 5:00 Zone Control
WEAPONS='team0=blade;team1=shooter' SUBS='all=waddle' MAP=crossmarket MODE=turf tools/botlab/run.sh tools/botlab/match.cjs

# an in-page test (your script returns [{ name, ok, info }])
MAP=testbox PAGE=path/to/test-page.js tools/botlab/run.sh tools/botlab/page.cjs
```

- **Parallel runs:** start several at once (`… & … & wait`). `run.sh` keeps at most `SLOTS` (default 8) Electron
  instances alive and queues the rest.
- **match.cjs env:**
  - `MAP` (stage id), `MODE` (`turf` / `zones`), `SECS` (turf length)
  - `WEAPONS` / `SUBS`: `all=<id>`, `team0=<id>;team1=<id>`, or a comma list per slot (team 0 first)
  - `OUT` (write the result JSON), `WATCHDOG` (ms)
  - `TRACK=<weapon>` (+ `TRACK_TEAM=0|1`): a closer look at the players on that weapon — damage dealt / taken and from
    how far, what they were doing when splatted, deaths without touching the killer, nearest-enemy distance; the Sponge
    Mitts add fist / splash / leap damage and leap outcomes (`RESULT_JSON.track`)
  - `TUNE='mitts.punchInterval=0.12,mitts.fistRange=4.6'`: what-if tuning for this run only (patched into the live
    `WEAPONS` / `SUBS` config; nothing in the repo changes)
  - keep `SLOTS` at 4 or less for full Zone Control matches: 8 at once crashed the GPU process on a 16 GB Mac
- **match.cjs output:**
  - stuck % and the longest stuck episodes
  - splats by cause
  - per weapon: players, splats dealt, deaths, average turf
  - specials and super jumps
  - Zone Control: objective stats
  - console warnings/errors
  - a final `RESULT_JSON {…}` line for scripts
- **Scratch files** (profiles, locks) go to `.botlab/` (git-ignored); set `BOTLAB_OUT` to move them.
- **Useful page-script globals:**
  - `window.__inkwave` (the game): `.match`, `.match.local`, `.debug.freeze()` / `.step(ms)` / `.freezeBots()`
  - `window.__G` (shared systems)
  - Equip players with `actor.setWeapon(id)` / `setSub(id)` / `setSpecial(id)`
