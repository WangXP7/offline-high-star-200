// NPC kit adapter: a story character who takes the field only as a hero-model actor (game.actors, src/actors/actors.js —
// a boss, or an npc who stands by) gets the render half of a kit plus a boss attack table, without the hero's moveset,
// Musou or effects palette (they never play the hero):
//
//   export const X = npcKit(def, set);      // NPCS.x.kit (./index.js)
//
// def = { build, chains, scale, reach }     the model def, as src/chars/defkit.js (fine voxels, chars/parts.js FV)
// set = a weapon class (./sword.js, ./polearm.js) = {
//   attacks      kit.bossAttacks (format: actors.js header), one move per attack (clip = move id). The move is laid out
//                1:1 on the attack: frames = windup + active + recover, its hit window [windup, windup + active] with the
//                attack's lunge over it (a leap: none — the sim carries him), so the clip plays at the boss's own pace
//                (actors.js moveFrame) and the baked feet stay planted under his sim lunge
//   clips(A, M)  → { moveId: clip (hero/anims/author.js clipF), idle, hurt (t 0 → 1 over the first 20 sf of a stagger /
//                fall, then held: it ends on the reeling pose), taunt (actors.js ACTOR.taunt sf, facing the hero) }
//   carry        run overlay (defkit.js carried: weapon + arm channels over the shared run)
// }
import { prepMoves } from '../../hero/moveset.js';
import { makeAuthor } from '../../hero/anims/author.js';
import { runPose } from '../../hero/anims/locomotion.js';
import { buildDef } from '../../hero/model.js';
import { chainSet } from '../../hero/secondary.js';
import { carried } from '../defkit.js';

export function npcKit(def, set) {
  const M = prepMoves(Object.fromEntries(set.attacks.map(({ clip, windup: w, active: a, recover: r, shape, lunge }) =>
    [clip, { frames: w + a + r, cancel: w + a + r, hits: [{ f: [w, w + a] }], lunge: lunge && shape !== 'leap' ? [[w, w + a, lunge]] : [] }])));
  const run = carried(set.carry);
  return {
    moves: M, clips: set.clips(makeAuthor(M), M), feet: {},
    runPose: (ph, k, out, lean) => run(runPose(ph, k, out, lean)),
    model: (rig) => buildDef(rig, def.build()),
    secondary: (scene, rig, mat) => chainSet(scene, rig, mat, def.chains()),
    scale: def.scale, reach: def.reach, bossAttacks: set.attacks,
  };
}
