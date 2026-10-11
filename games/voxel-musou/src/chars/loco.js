// Locomotion clips of a def-kit officer (src/chars/defkit.js) from a few full poses of his own (rig.js P specs: his
// stance, weapon and arms), on the time bases of the shared ones (src/hero/anims/locomotion.js LOCO_CLIPS, which fill in
// the dodge; run / roll are procedural, with his carry overlay):
//   idle     breathing loop (0.5 = idle + breath)
//   air      t 0 take-off (stretched) · 0.22 tuck · 0.55 apex · 1 falling at jumpV (legs reaching down)
//   airFall  after an air string: 0.5 (vy 0) → 1, legs gathering under him
//   land     hold the crouch, then rise into idle (LOCO.landFrames); hurt snaps into recoil, holds, then recovers
// The legs of the air poses are shared (Zhao Yun's); the officer's specs give the body, weapon and arms.
import { P, clip, CH } from '../hero/rig.js';
import { LOCO_CLIPS } from '../hero/anims/locomotion.js';

/** { idle, breath (delta at the loop's middle), takeoff, apex, fall, land, hurt } pose specs → { idle, air, airFall, land, hurt } */
export function locoClips({ idle, breath = {}, takeoff, apex, fall, land, hurt }) {
  // Take the jump's legs directly from Zhao Yun's existing clips; only the torso and carry pose vary by officer.
  const airborne = (base, body) => ({ ...base, keys: base.keys.map((key) => {
    const p = P(body(key.t));
    p.set(key.p.subarray(CH.footL, CH.spear), CH.footL);
    return { ...key, p };
  }) });
  const rest = P(idle), inhale = P({ ...idle, ...breath }), recoil = P(hurt), crouch = P(land);
  return {
    idle: clip([[0, rest], [0.5, inhale], [1, rest]], true),
    air: airborne(LOCO_CLIPS.air, (t) => t === 0 ? takeoff : apex),
    airFall: airborne(LOCO_CLIPS.airFall, () => fall),
    land: clip([[0, crouch], [0.2, crouch], [0.72, rest, 'out'], [1, rest]]),
    hurt: clip([[0, rest], [0.18, recoil, 'snap'], [0.42, recoil], [1, rest, 'out']]),
  };
}
