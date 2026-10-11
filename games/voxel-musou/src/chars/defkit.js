// Def-kit adapter: an officer written as data — a model def and a moveset — becomes a full kit (contract: src/chars/
// index.js) on the shared engine. Zhang Fei (src/chars/zhangfei) is the reference kit; Guan Yu, Zhuge Liang, Lü Bu and
// Liu Bei are built the same way:
//
//   export const X_KIT = defKit(def, moveset);      // CHARS.x.kit (src/chars/index.js)
//
// def = {
//   build() → { parts: {joint: boxes}, head: boxes, bv, hv, pauldron?(sx) → boxes | [], weapon: [{ geo, mat }] }
//              fine voxel body (chars/parts.js FV = 0.0125, parts centred on the joints), head voxel hv; pauldron absent =
//              none, [] = none on that side; weapon meshes on the weapon joint (shaft +Z, origin = the rear grip), mat
//              'body' | 'metal' | 'blade' | a Material (hero/model.js buildDef)
//   chains() → [{ joint: rig joint name, anchor, rest, n, len, seg(i, n) → geometry, ...hero/secondary.js chain options
//              (stiff drag wind face hit cone sway grav) }]            cloth, hair, beard, tassels (chainSet)
//   scale      body scale (default rig.js HERO_SCALE 1.08; the rig, IK and the weapon line scale with it)
//   reach      { tip, butt } m from the rear grip: the weapon's ground contact (rig.js spearElev)
//   trail      weapon ribbon { base, baseHeavy, tip } m along the weapon (vfx.js)
//   weight     camera kick × (1 = Zhao Yun; > 1.2 every normal contact kicks: camera.js)
//   voice      { pitch, fk, growl, gain } his kiai (audio/bank.js bakeVoice)
//   fx         vfx.js palette overrides over ZY_FX (needle hot burst flash slash pulse light crack wall ring shard glint
//              glitter glow trail) + ghost (dodge colours: anims/locomotion.js) + mu {crack, wall, light} (Musou ground)
//   look       { cut: {sub, seal, css}, pal: {...} } his Musou presentation over Zhao Yun's (musou/view.js ZY_LOOK; no dragon)
//   sig        { roar, core, wave, beam, charge } colours of his own effects (chars/kitview.js)
//   heat?      [hex, base, charge, musou]: the blade mesh (weapon mat 'blade') glows `hex`, emissive base → + charge while a
//              charge winds up, + musou through his Musou
//   view?(model, hero, dt, rig)   extra per-frame render hook (after IK, before the chains)
//   fxView?(scene, game, camera) → { update(dt), dispose() }   his own render layer beside the shared kit view (built
//              with his Musou view, e.g. 諸葛亮's 八卦 sigils: src/chars/zhugeliang/fx.js)
// }
// moveset = {
//   moves() → move table (hero/moves.js format incl. proj / roar / beam / rain windows); must have n1 c1 dash jatk jc,
//             every air move a hover; airChainMax (default 6)
//   entry    { move: the move it follows in a string } (n2: 'n1', …, ja2: 'jatk') — clips start on its exit feet
//   carry    { run?, roll? } weapon + arm channels (spear … armL) laid over the shared run / dive roll
//   clips(A, M) → { moveId: clip, idle, air, airFall, land, hurt } — A = hero/anims/author.js makeAuthor(M, entry) (build
//             in string order), chars/loco.js locoClips for the locomotion ones; every move id needs a clip
//   musou    the Musou script (musou/scripted.js) — its seq / fin clip ids are his move ids
// }
import { P, CH, POSE_SIZE, HERO_SCALE } from '../hero/rig.js';
import { prepMoves } from '../hero/moveset.js';
import { makeAuthor } from '../hero/anims/author.js';
import { LOCO_CLIPS, runPose, rollPose } from '../hero/anims/locomotion.js';
import { buildDef } from '../hero/model.js';
import { chainSet } from '../hero/secondary.js';
import { ZY_FX } from '../vfx/vfx.js';
import { createScriptedMusou, scriptClips } from '../musou/scripted.js';
import { createMusouView, ZY_LOOK } from '../musou/view.js';
import { createKitView } from './kitview.js';

const RUN_REF = new Float32Array(POSE_SIZE);
runPose(0, 0, RUN_REF);                                       // the shared run's base pose (its stride sway rides on top)

/** Carry overlay: the spear channels keep the run's stride sway around the carry pose; grips / left arm come from it
 *  (a free left arm keeps the run's swing). */
export function carried(spec) {                 // (also the NPC kits: src/chars/npc/kit.js)
  const C = P(spec), free = C[CH.lfree] > 0.5;
  return (out) => {
    for (let i = CH.spear; i < CH.spear + 6; i++) out[i] += C[i] - RUN_REF[i];
    out[CH.gripR] = C[CH.gripR]; out[CH.gripL] = C[CH.gripL]; out[CH.lfree] = C[CH.lfree];
    if (!free) for (let i = 0; i < 4; i++) out[CH.armL + i] = C[CH.armL + i];
    return out;
  };
}

export function defKit(def, ms) {
  const M = prepMoves(ms.moves()), own = ms.clips(makeAuthor(M, ms.entry || {}), M);
  for (const id in M) if (!own[id]) console.warn(`defKit: no clip for move ${id}`);
  const run = ms.carry?.run && carried(ms.carry.run), roll = ms.carry?.roll && P(ms.carry.roll);
  const scale = def.scale || HERO_SCALE;
  const look = { ...ZY_LOOK, dragon: false, ...def.look, pal: { ...ZY_LOOK.pal, ...def.look?.pal } };
  const blade = (def.trail.base + def.trail.tip) / 2, heat = def.heat;
  let e = 0;
  return {
    moves: M, airChainMax: ms.airChainMax ?? 6,
    clips: { ...LOCO_CLIPS, ...own, ...scriptClips(ms.musou) }, feet: {},
    runPose(ph, k, out, lean) {
      runPose(ph, k, out, lean); run?.(out);
      // Stride distances come from the sim's metres, before the rig applies the officer's body scale.
      out[CH.footL + 2] /= scale; out[CH.footR + 2] /= scale;
      return out;
    },
    rollPose: roll ? (u, out) => { rollPose(u, out); for (let i = CH.spear; i < CH.spin; i++) out[i] = roll[i]; return out; } : rollPose,
    dashPlant: M.dash.lunge.length > 1 ? M.dash.lunge[1][0] + 4 : -1,
    model: (rig) => buildDef(rig, def.build()),
    secondary: (scene, rig, mat) => chainSet(scene, rig, mat, def.chains()),
    scale: def.scale, reach: def.reach, trail: def.trail, weight: def.weight ?? 1, voice: def.voice,
    fx: { ...ZY_FX, musou: 'own', ...def.fx },
    view(model, hero, dt, rig) {
      if (heat) {                                        // blade heat: charge wind-up / Musou
        const m = hero.state === 'attack' && hero.kit.moves[hero.move];
        const want = hero.state === 'musou' ? heat[3] : m && hero.move[0] === 'c' && hero.moveT < m.tell ? heat[2] : 0;
        e += (want - e) * Math.min(1, dt * 8);
        model.blade.emissive.setHex(heat[0]); model.blade.emissiveIntensity = heat[1] + e;
      }
      def.view?.(model, hero, dt, rig);
    },
    createMusou: (game) => createScriptedMusou(game, ms.musou),
    createMusouView(scene, game, camera) {
      const a = createMusouView(scene, game, camera, look), b = createKitView(scene, game, camera, { sig: def.sig, blade });
      const c = def.fxView?.(scene, game, camera);
      return { update(dt) { a.update(dt); b.update(dt); c?.update(dt); }, dispose() { a.dispose(); b.dispose(); c?.dispose(); } };
    },
  };
}
