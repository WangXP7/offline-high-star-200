#!/bin/bash
# Botlab: run an INKWAVE harness offscreen and muted in its own Electron instance, under a slot lock (at most SLOTS at
# once, default 8; each slot keeps its own isolated profile).
#   tools/botlab/run.sh tools/botlab/match.cjs            (settings via env vars — see tools/botlab/README.md)
# Scratch output (profiles, locks) goes to $BOTLAB_OUT (default <repo>/.botlab, git-ignored).
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
export S="$HERE" BOTLAB_ROOT="$ROOT"
OUTDIR="${BOTLAB_OUT:-$ROOT/.botlab}"
LOCKS="$OUTDIR/locks"; mkdir -p "$LOCKS"
SLOTS="${SLOTS:-8}"
slot=""
for i in $(seq 1 900); do
  for n in $(seq 1 "$SLOTS"); do
    d="$LOCKS/slot$n"
    if mkdir "$d" 2>/dev/null; then echo $$ > "$d/pid"; slot=$n; break 2; fi
    # stale lock (its owner is gone): move it aside atomically, then check it's still the lock we judged stale — a
    # new owner may have taken the slot between our read and the move (then it goes straight back)
    p=$(cat "$d/pid" 2>/dev/null)
    if [ -n "$p" ] && ! kill -0 "$p" 2>/dev/null; then
      s="$d.stale.$$"
      if mv "$d" "$s" 2>/dev/null; then
        if [ "$(cat "$s/pid" 2>/dev/null)" = "$p" ]; then rm -rf "$s"; else mv "$s" "$d" 2>/dev/null || rm -rf "$s"; fi
      fi
    fi
  done
  sleep 2
done
[ -z "$slot" ] && { echo "botlab: no free slot after 30 min"; exit 3; }
trap 'rm -rf "$LOCKS/slot$slot"' EXIT
export UD="$OUTDIR/ud-slot$slot"
cd "$ROOT"
"$ROOT/node_modules/.bin/electron" --mute-audio "$@" 2>&1 | grep -v "Security Warning\|DevTools\|^$\|GPU stall\|ffmpeg\|Fontconfig\|task_policy\|SharedImageManager\|gpu_memory_buffer"
