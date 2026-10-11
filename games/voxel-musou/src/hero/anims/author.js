// Clip-authoring kit shared by every hero moveset (Zhao Yun's attacks.js, the def kits in src/chars/*): frame-keyed
// attack clips whose keys are anchored to the move's own hit windows, and planted feet baked per sim frame against the
// move's own lunge. makeAuthor(MOVES, ENTRY) binds it to one move table (prepMoves'd) and its string order: ENTRY maps a
// move to the one it follows in a string (n2: 'n1', ..., ja3: 'ja2'), and each clip starts on the feet that move left at
// its cancel frame — so clips must be built in string order (n1 before n2, jatk before ja2).
//
// Keys: [frame, spec, ease] — spec = rig.js P() spec (plant forced to 1); fL / fR = [x, y, z, pitch°, yaw°] are GROUND
// SPOTS in move-start coordinates (the hero-facing frame at the start of the move, before its lunge, not turned by
// `spin`); ft(f, fL, fR) is a feet-only key. A grounded foot (y < 0.12) holds its spot while the lunge carries the root
// and `spin` turns the body over it; an authored slide of a grounded foot becomes a lifted step; every touchdown dips the
// pelvis a few cm (weight).
//
// → { clipF(id, keys) → clip (+ .feet, .exit), bakeFeet(id, keys, entry?) → { feet(u, out), exit }, ft, body(id, f, spin°,
//     [x, y, z, pitch, yaw]) (a body-frame foot → move-start coords), endFeet(id) → { fL, fR }, lungeAt(id, f), hit(id, i)
//     → [f0, f1], BUILT {id: clip} }
import { P, clip, sampleClip, STANCE, CH, POSE_SIZE } from '../rig.js';
import { lungeAt as lungeOf } from '../moveset.js';

const D2R = Math.PI / 180;
const ST = STANCE;
const CONTACT = 0.12, HOLD = 0.035, STILL = 0.004, STEP_MIN = 3, STEP_MAX = 10;
const hd = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
/**
 * One foot's per-frame track W ([x,y,z,pitch,yaw], move-start coords) → planted track. Airborne frames (y >= CONTACT) are
 * kept as authored. A grounded foot holds its spot until the authored spot drifts > HOLD, then steps there in one lifted
 * arc timed to the authored motion (STEP_MIN..STEP_MAX frames). `busy(f)` = the other foot is off the ground at f: a
 * generated step waits for it (no accidental hops).
 */
function plantFoot(W, busy) {
  const n = W.length, O = W.map((r) => r.slice());
  let anc = null;
  for (let f = 0; f < n;) {
    const w = W[f];
    if (w[1] >= CONTACT) { anc = null; f++; continue; }
    if (!anc || hd(w, anc) <= HOLD || (busy(f) && f < n - STEP_MIN - 1)) {
      anc = anc || w; O[f][0] = anc[0]; O[f][1] = anc[1]; O[f][2] = anc[2]; f++; continue;
    }
    const a = f - 1;
    let g = f;
    while (g - a < STEP_MAX && g + 1 < n && W[g + 1][1] < CONTACT && hd(W[g + 1], W[g]) > STILL) g++;
    g = Math.min(n - 1, Math.max(g, a + STEP_MIN));
    const B = W[g], d = hd(B, anc), lift = Math.min(0.24, Math.max(0.07, 0.45 * d));
    for (let k = f; k <= g; k++) {
      const u = (k - a) / (g - a), s = u * u * (3 - 2 * u), h = 4 * u * (1 - u);
      O[k][0] = anc[0] + (B[0] - anc[0]) * s; O[k][2] = anc[2] + (B[2] - anc[2]) * s;
      O[k][1] = Math.max(W[k][1], anc[1] + (B[1] - anc[1]) * s + lift * h);
      O[k][3] = W[k][3] - 0.3 * h;                              // toe comes up through the swing
    }
    anc = B[1] < CONTACT ? B : null; f = g + 1;
  }
  return O;
}
const fdeg = (v, yaw) => [v[0], v[1], v[2], v[3] || 0, v[4] == null ? yaw : v[4]];

export function makeAuthor(MOVES, ENTRY = {}) {
  const lungeAt = (id, f) => lungeOf(MOVES[id], f);
  /** Stance feet at the end of move `id` (move-start coords: stance + the move's whole lunge). */
  const endFeet = (id) => {
    const d = lungeAt(id, MOVES[id].frames), fwd = (v) => v.map((x, i) => (i === 2 ? x + d : x));
    return { fL: fwd(ST.footL), fR: fwd(ST.footR) };
  };
  /** Foot given root-relative in the BODY frame (stance-like coords) at spin `sp` and move frame f → move-start coords. */
  const body = (id, f, sp, v) => {
    const a = sp * D2R, c = Math.cos(a), s = Math.sin(a);
    return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c + lungeAt(id, f), v[3] || 0, v[4] + sp];
  };
  /** A key that carries only feet (either may be null). */
  const ft = (f, fL, fR) => [f, { feet: 1, fL, fR }];

  const BUILT = {};
  /**
   * Bake the feet of move `id` from keys (fL/fR in move-start coords; frame 0 = `entry` feet or stance, last frame = stance
   * unless keyed) → per-frame table (root-relative, this move's lunge undone) + sampler over normalised move time.
   */
  function bakeFeet(id, keys, entry) {
    const F = MOVES[id].frames;
    const tracks = [['fL', CH.footL, ST.footL, 15, 0], ['fR', CH.footR, ST.footR, -30, 1]].map(([k, ch, st, yaw, j]) => {
      const fk = keys.filter(([f, s]) => s[k] && f > 0).map(([f, s]) => [f, fdeg(s[k], yaw)]);
      if (!fk.length || fk[fk.length - 1][0] < F) fk.push([F, fdeg(endFeet(id)[k], yaw)]);
      const tk = [[0, entry ? entry[j] : st], ...fk].map(([f, v]) => [Math.min(1, f / F), P({ [k === 'fL' ? 'footL' : 'footR']: v }), 'lin']);
      const tc = clip(tk, false, true), p = new Float32Array(POSE_SIZE), W = [];
      for (let f = 0; f <= F; f++) { sampleClip(tc, f / F, p); W.push(Array.from(p.subarray(ch, ch + 5))); }
      return W;
    });
    const OL = plantFoot(tracks[0], (f) => tracks[1][f][1] >= CONTACT);
    const OR = plantFoot(tracks[1], (f) => OL[f][1] >= CONTACT);
    // weight: every touchdown sinks the pelvis a few cm for a few frames (scaled by how fast the foot came down)
    const dip = new Float32Array(F + 1), K = [1, 0.75, 0.4, 0.15];
    for (const O of [OL, OR]) for (let f = 1; f <= F; f++) {
      if (O[f - 1][1] < CONTACT || O[f][1] >= CONTACT) continue;
      const v = Math.min(1, (O[f - 1][1] - O[f][1]) / 0.06);
      K.forEach((w, k) => { if (f + k <= F) dip[f + k] = Math.min(dip[f + k], -0.04 * v * w); });
    }
    const tab = new Float32Array((F + 1) * 10);
    [OL, OR].forEach((O, j) => O.forEach((r, f) => { r[2] -= lungeAt(id, f); tab.set(r, f * 10 + j * 5); }));
    const feet = (t, out) => {
      const x = Math.min(F, Math.max(0, t * F)), i = Math.min(F - 1, Math.floor(x)), u = x - i;
      for (let j = 0; j < 10; j++) out[CH.footL + j] = tab[i * 10 + j] + (tab[i * 10 + 10 + j] - tab[i * 10 + j]) * u;
      out[CH.hips + 1] += dip[i] + (dip[i + 1] - dip[i]) * u;
      out[CH.plant] = 1;
    };
    const row = (f, j) => { const r = tab.subarray(f * 10 + j * 5, f * 10 + j * 5 + 5); return [r[0], r[1], r[2], r[3] / D2R, r[4] / D2R]; };
    return { feet, exit: [row(MOVES[id].cancel, 0), row(MOVES[id].cancel, 1)] };
  }
  /** Frame-keyed clip: keys [frame, spec, ease]. Body keys make the pose clip; fL/fR (any key, incl. ft()) make the feet. */
  function clipF(id, keys) {
    const F = MOVES[id].frames, prev = BUILT[ENTRY[id]];
    keys = keys.slice().sort((a, b) => a[0] - b[0]);
    const c = clip(keys.filter(([, s]) => !s.feet).map(([f, spec, e]) => [Math.min(1, f / F), P({ ...spec, plant: 1 }), e]), false, true);
    Object.assign(c, bakeFeet(id, keys, prev && prev.exit));
    BUILT[id] = c;
    return c;
  }
  const hit = (id, i = 0) => MOVES[id].hits[i].f;
  return { clipF, bakeFeet, ft, body, endFeet, lungeAt, hit, BUILT };
}
