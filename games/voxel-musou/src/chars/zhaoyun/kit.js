// Zhao Yun's kit: everything the generic hero / combat / musou / vfx / audio code needs from a character, wired from the
// spear modules that still live in src/hero (moves, anims, model, secondary) and src/musou (真・無雙 + its view).
// The kit contract (every field) is documented in src/chars/index.js.
import { MOVES, AIR_CHAIN_MAX } from '../../hero/moves.js';
import { ATTACK_CLIPS, MOVE_FEET } from '../../hero/anims/attacks.js';
import { LOCO_CLIPS, runPose, rollPose } from '../../hero/anims/locomotion.js';
import { createHeroModel } from '../../hero/model.js';
import { createSecondary } from '../../hero/secondary.js';
import { createMusou, MUSOU_CLIPS } from '../../musou/musou.js';
import { createMusouView } from '../../musou/view.js';

export const ZHAOYUN_KIT = {
  moves: MOVES, airChainMax: AIR_CHAIN_MAX,
  clips: { ...ATTACK_CLIPS, ...LOCO_CLIPS, ...MUSOU_CLIPS }, feet: MOVE_FEET,
  runPose, rollPose,
  dashPlant: MOVES.dash.lunge[1][0] + 8,     // dash: the front foot lands out of the lunge leap 8 sf into the lunge (dust)
  model: createHeroModel, secondary: createSecondary,
  trail: { base: 1.25, baseHeavy: 1.05, tip: 2.18 },   // spear ribbon: distances along the spear (vfx.js spearWorld)
  createMusou, createMusouView,
};
