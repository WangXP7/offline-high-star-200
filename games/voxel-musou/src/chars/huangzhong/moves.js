// Huang Zhong moveset (data only), modelled on the DW7/DW8 弓 (bow) moveset: the string mixes bow-limb slashes at
// arm's length with point-blank shots, the charges are shots (fan, barrage, rain, fire arrow), plus the DW5 aim mode
// (瞄準: hold △ from neutral). All timings in 60 Hz sim frames. Format = header of src/hero/moves.js, plus:
//
//   shots: [{ f: frame (or [first, last] with `every`), n arrows, spread (total fan, degrees), dir (degrees, + = left),
//             pitch (degrees, + = up), speed (m/s), g (gravity, m/s²), range (m of homing flight before the arrow drops),
//             pierce (extra bodies it passes through), rad (hit radius, m), home: soft-lock cone (degrees, 0 = none;
//             DW auto-aim: the nearest soldier in the cone, the arrow curves after him), air: lock airborne bodies first,
//             big: 1 heavy arrow / 2 musou giant (render scale), fire: flaming arrow, burst: {range, dmg, kb, force, lift,
//             heavy, hitstop} ground/impact explosion, burstEnd: explode when the range runs out (not only on the
//             ground), rain: {n, r, ahead, delay, over, launchLast} — the shot goes skyward and n arrows fall in a
//             circle r (m) round the soft target (or `ahead` m in front) from `delay` frames later over `over` frames,
//             dmg, kb, force, lift, hitstop, heavy: the hit spec each arrow applies (combat.hitOne) }]
//   strafe      [f0, f1, m/s]: the stick moves him sideways/back through the window without turning him (C4)
//   tell        set by hand on shot moves (no hitbox to derive it from): frames to the first shot (charge ring, soft-lock)
//
// Reach & balance vs Zhao Yun: slashes are narrower and shorter (bow limb ≈ 0.9 m past the grip → arcs 2.2–2.5 m,
// 90–160°) and lighter, so a packed ring hurts more; shots reach 15–25 m (arrow 55–80 m/s: faster than anyone can run,
// ≈ 0.3 s to 20 m), soft-lock onto the nearest soldier in a cone and pierce 1–4 bodies, the finisher shots 12+. Clears
// come from lines (N6, C1, dash), fans (C3, jump charge), the barrage (C4), rain (C5) and the fire burst (C6).
// Timing: onsets N1–N6 ≈ 24–30 sf apart like the spear string; shots release on the frame the string snaps (the anims
// hold the full draw 2–4 sf before it). Charges hold the finish ≈ 0.3 s. dodgeCancel = the frame after the last
// shot/hit window. Aim mode (moves.aim, driven by src/chars/huangzhong/aim.js, not by combo.js): C1 from neutral held
// past AIM_AT becomes the aim; the aim clip is keyed draw 0 → 14 (full) → release 16 → follow-through → 30 = frame 0.
import { prepMoves } from '../../hero/moveset.js';

const ONCE = 99;
// point-blank shot defaults (the string's arrows): quick, soft-locked, one pierce
const PB = { n: 1, speed: 62, g: 3, range: 20, pierce: 1, rad: 0.3, home: 34, dmg: 13, kb: 'flinch', force: 4, hitstop: 1 };

export const MOVES = {
  // N1 bow-limb diagonal chop: bow raised over the right shoulder, the upper limb's blade edge cuts down-left
  n1: { frames: 34, next: 'n2', charge: 'c2', cancel: 22, branch: 12, dodgeCancel: 12, steer: 5, lunge: [[2, 9, 0.35]],
    hits: [{ f: [8, 11], every: ONCE, shape: 'arc', range: 2.3, ang: 110, dir: -15, dmg: 11, kb: 'flinch', force: 3, hitstop: 3 }] },
  // N2 half-draw point-blank shot from the hip (DW8 bow □2): step back, snap, the arrow pins the nearest soldier
  n2: { frames: 34, next: 'n3', charge: 'c3', cancel: 23, branch: 15, dodgeCancel: 15, steer: 5, lunge: [[0, 8, -0.3]], tell: 11,
    shots: [{ ...PB, f: 11, dmg: 14, kb: 'push', force: 5 }] },
  // N3 backhand flat sweep with the lower limb, right → left (the string's widest cut)
  n3: { frames: 32, next: 'n4', charge: 'c4', cancel: 21, branch: 15, dodgeCancel: 15, steer: 5, lunge: [[4, 11, 0.5]],
    hits: [{ f: [10, 13], sweep: 1, shape: 'arc', range: 2.5, ang: 160, dir: 10, dmg: 11, kb: 'flinch', force: 3, hitstop: 3 }] },
  // N4 pivot and a double shot (left, then right of centre), soft-locked — the string's first ranged surge
  n4: { frames: 40, next: 'n5', charge: 'c5', cancel: 28, branch: 25, dodgeCancel: 25, steer: 6, lunge: [[0, 6, 0.4]], tell: 13,
    shots: [{ ...PB, f: 13, dir: 6, pierce: 2 }, { ...PB, f: 21, dir: -6, pierce: 2 }] },
  // N5 spinning upward slash: the bow whirls round him once (both limbs cut), bodies pushed off his feet
  n5: { frames: 42, next: 'n6', charge: 'c6', cancel: 30, branch: 22, dodgeCancel: 22, steer: 5, lunge: [[6, 14, 0.5]],
    hits: [{ f: [12, 19], sweep: 1, sweepN: 6, dir: -180, shape: 'circle', range: 2.5, dmg: 12, kb: 'push', force: 5, hitstop: 3 }] },
  // N6 late accent: plant, full draw (armour), a heavy piercing shot that blows a whole line of soldiers away, and the
  // muzzle blast clears the point-blank ones; finish held ≈ 20 sf
  n6: { frames: 54, next: 'n1', cancel: 44, dodgeCancel: 26, steer: 10, lunge: [[0, 6, -0.3]], armor: true, tell: 22,
    shots: [{ f: 22, n: 1, speed: 80, g: 1, range: 28, pierce: 14, rad: 0.8, home: 16, big: 1,
      dmg: 26, kb: 'blow', force: 12, lift: 5, hitstop: 6, heavy: true }],
    hits: [{ f: [22, 23], every: ONCE, shape: 'arc', range: 2.6, ang: 80, dmg: 12, kb: 'blow', force: 9, lift: 4, hitstop: 2 }] },

  // C1 (from neutral) heavy knockback shot: draw (hold △ past AIM_AT → aim mode instead), the guard-breaking arrow plus a
  // muzzle shock that blows the soldiers in front off their feet (officers too: heavy)
  c1: { frames: 50, cancel: 44, dodgeCancel: 25, steer: 12, lunge: [[18, 22, -0.4]], armor: true, tell: 18,
    shots: [{ f: 18, n: 1, speed: 75, g: 2, range: 24, pierce: 4, rad: 0.6, home: 20, big: 1,
      dmg: 24, kb: 'blow', force: 12, lift: 4, hitstop: 6, heavy: true }],
    hits: [{ f: [18, 20], every: ONCE, shape: 'arc', range: 3.0, ang: 100, dmg: 12, kb: 'blow', force: 9, lift: 3, hitstop: 3, heavy: true }] },
  // C2 (N1 → C) launcher: an upward point-blank blast pops the front, then three follow shots at the airborne bodies
  // (juggle: each pop keeps them up)
  c2: { frames: 88, cancel: 80, dodgeCancel: 56, steer: 10, lunge: [[4, 14, 0.4]], armor: true,
    hits: [{ f: [15, 17], every: ONCE, shape: 'arc', range: 3.4, ang: 110, dmg: 16, kb: 'launch', force: 2, lift: 10, hitstop: 5, heavy: true }],
    shots: [{ f: 15, n: 1, pitch: 34, speed: 60, g: 2, range: 14, pierce: 3, rad: 0.5, dmg: 8, kb: 'launch', lift: 6, hitstop: 0 },
      { f: [34, 50], every: 8, n: 1, pitch: 22, speed: 64, g: 2, range: 16, pierce: 2, rad: 0.5, home: 50, air: true,
        dmg: 10, kb: 'launch', force: 1.5, lift: 5, hitstop: 1 }] },
  // C3 (N2 → C) fan volley: five arrows across ≈ 64°, each pierces 2
  c3: { frames: 64, cancel: 56, dodgeCancel: 36, steer: 12, lunge: [[18, 24, -0.5]], armor: true, tell: 20,
    shots: [{ f: 20, n: 5, spread: 64, speed: 64, g: 2, range: 20, pierce: 2, rad: 0.45, home: 0,
      dmg: 16, kb: 'push', force: 7, lift: 2, hitstop: 2, heavy: true }] },
  // C4 (N3 → C) rapid-fire barrage while strafing (stick moves him, facing held): 12 soft-locked arrows, 5 sf apart,
  // then a heavy last shot
  c4: { frames: 100, cancel: 92, dodgeCancel: 84, steer: 16, armor: true, tell: 14, strafe: [10, 76, 3.6],
    shots: [{ f: [14, 69], every: 5, n: 1, speed: 66, g: 2, range: 20, pierce: 1, rad: 0.35, home: 40, dmg: 7, kb: 'flinch', force: 2, hitstop: 0 },
      { f: 80, n: 1, speed: 75, g: 2, range: 24, pierce: 4, rad: 0.6, home: 24, big: 1, dmg: 20, kb: 'blow', force: 11, lift: 4, hitstop: 5, heavy: true }] },
  // C5 (N4 → C) arrow rain: three arrows loosed skyward, then ~40 fall in a 5 m circle round the soft target (or 8 m
  // ahead) over 0.6 s; the last volley launches. He recovers while it is still falling.
  c5: { frames: 70, cancel: 62, dodgeCancel: 30, steer: 12, armor: true, tell: 22,
    shots: [{ f: 22, n: 3, spread: 14, pitch: 72, speed: 50, g: 0, range: 18, pierce: 0, rad: 0, sky: true,
      rain: { n: 40, r: 5, ahead: 8, reach: 16, delay: 18, over: 36, launchLast: 8 },
      dmg: 9, kb: 'flinch', force: 2, lift: 7, hitstop: 0 }] },
  // C6 (N5 → C) explosive fire arrow driven into the ground ≈ 7 m ahead (or at the soft target): the burst launches the
  // whole ring there
  c6: { frames: 90, cancel: 82, dodgeCancel: 40, steer: 12, lunge: [[26, 30, -0.4]], armor: true, tell: 28,
    // (fx r2: pierce 20 — it flies through the bodies in the way and bursts on the ground ≥ 5 m out, not on the first
    // soldier at his elbow, which buried him in his own fireball; fx r4: lock 60° / 14 m — at 30° / 11 m it missed the
    // rank beside him and burst on empty grass; the burst distance stays capped at 12 m in projectiles.js)
    shots: [{ f: 28, n: 1, pitch: -9, speed: 48, g: 6, range: 16, pierce: 20, rad: 0.5, home: 60, fire: true, big: 1, groundAim: 7,
      dmg: 14, kb: 'flinch', force: 2, hitstop: 0,
      burst: { range: 4.8, dmg: 34, kb: 'launch', force: 4, lift: 11, hitstop: 8, heavy: true } }] },

  // Dash attack (run + □): feet-first slide 5 m, tripping whoever is in the way, and a 3-arrow shot out of the slide
  dash: { frames: 64, cancel: 56, dodgeCancel: 30, steer: 3, lunge: [[0, 24, 5.2, 'lin'], [24, 32, 0.6]], tell: 14,
    hits: [{ f: [3, 20], every: 6, shape: 'circle', range: 1.6, dmg: 6, kb: 'push', force: 5, hitstop: 1 }],
    shots: [{ f: 14, n: 3, spread: 22, speed: 66, g: 2, range: 20, pierce: 3, rad: 0.45, home: 24, dmg: 14, kb: 'push', force: 6, lift: 2, hitstop: 2 }] },
  // Jump attack: a downward shot every 13 sf while hovering; each arrow bursts small on the ground
  jatk: { frames: 24, air: true, hover: 2.4, next: 'jatk', charge: 'jc', cancel: 13, dodgeCancel: 99, steer: 3, tell: 7,
    shots: [{ f: 7, n: 1, pitch: -48, speed: 58, g: 4, range: 16, pierce: 0, rad: 0.4, home: 50, dmg: 11, kb: 'flinch', force: 3, hitstop: 1,
      burst: { range: 1.5, dmg: 6, kb: 'flinch', force: 3, hitstop: 0 } }] },
  // Jump charge: hang at the apex, a plunging fan of 7 arrows into the ground (each a launching burst), drop and land
  // (landFrame / hang / frames match the shared jump-charge squash and glow in anims/locomotion.js)
  jc: { frames: 56, air: true, hover: 3, landFrame: 36, hang: [6, 28], plunge: [28, -30], cancel: 50, dodgeCancel: 39, steer: 12, armor: true, tell: 18,
    shots: [{ f: 18, n: 7, spread: 80, pitch: -58, speed: 55, g: 6, range: 14, pierce: 0, rad: 0.4, fire: true,
      dmg: 10, kb: 'flinch', force: 2, hitstop: 0, burst: { range: 2.3, dmg: 12, kb: 'launch', force: 3, lift: 7, hitstop: 2, heavy: true } }],
    hits: [{ f: [36, 38], every: ONCE, shape: 'circle', range: 2.4, dmg: 10, kb: 'flinch', force: 4, hitstop: 3 }] },

  // 瞄準 aim mode (DW5): driven by aim.js; the clip is keyed on these frames, hits/shots are fired by aim.js itself
  aim: { frames: 30, cancel: 999, dodgeCancel: 0, steer: 0, tell: 14 },
};

export const AIR_CHAIN_MAX = 6;   // downward shots per jump
/** C1 from neutral with △ still held on this move frame → aim mode (a tap under ≈ 0.17 s is the knockback shot). */
export const AIM_AT = 10;

prepMoves(MOVES);
