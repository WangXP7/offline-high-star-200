// Moveset helpers shared by every character kit (src/chars/*/): move-table preparation, lunge and clip retiming.
// The move-table format is documented at the top of src/hero/moves.js (Zhao Yun's moveset); a kit's table goes through
// prepMoves() once at module load.

/** Fill derived fields in place: id, lunge (default []), hits (default []), tell (start → first active frame, the
 *  charge tell; a move without hitboxes — e.g. a pure projectile shot — may set `tell` itself), and the `anim` key
 *  table's carried-over clip ids and cut-segment indices. Returns the table. */
export function prepMoves(MOVES) {
  for (const [id, m] of Object.entries(MOVES)) {
    m.id = id; m.lunge = m.lunge || []; m.hits = m.hits || [];
    m.tell = m.tell ?? (m.hits[0] ? m.hits[0].f[0] : 0);
    if (m.anim) {
      let clip = id, seg = 0;
      m.anim.forEach((k, i) => {
        if (i && k[0] === m.anim[i - 1][0]) seg++;
        else if (i && k[2] && k[2] !== clip) seg++;
        clip = k[2] = k[2] || clip; k[3] = seg;
      });
    }
  }
  return MOVES;
}

/** Forward displacement (m) the lunge has applied by move frame f: each segment eased out (or linear), clamped to it. */
export function lungeAt(m, f) {
  let d = 0;
  for (const [a, b, dist, e] of m.lunge) {
    const u = Math.min(1, Math.max(0, (f - a) / (b - a)));
    d += dist * (e === 'lin' ? u : 1 - (1 - u) * (1 - u));
  }
  return d;
}

/** Clip sample for move frame t → [clipId, normalised clip time, segment]. Pure, used by the hero's anim bookkeeping. */
export function moveClip(m, t) {
  const a = m.anim;
  if (!a) return [m.id, t / m.frames, 0];
  let i = 0;
  while (i < a.length - 1 && a[i + 1][0] <= t) i++;
  const k = a[i], n = a[i + 1];
  if (!n || n[3] !== k[3] || t <= k[0]) return [k[2], k[1], k[3]];
  return [k[2], k[1] + (n[1] - k[1]) * (t - k[0]) / (n[0] - k[0]), k[3]];
}
