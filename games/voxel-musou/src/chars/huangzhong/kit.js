// Huang Zhong's kit (contract: src/chars/index.js): the bow moveset (moves.js, anims.js), the voxel veteran on the shared
// rig in bow mode (model.js), the per-battle sim with 百步穿楊, the arrow pool and aim mode (musou.js, aim.js), and its
// view (view.js: arrows, aim preview, Musou presentation). Locomotion physics, dodge ghosts and roll are shared (hero.js).
import { MOVES, AIR_CHAIN_MAX } from './moves.js';
import { HZ_CLIPS, runPose, rollPose } from './anims.js';
import { createHzModel, createHzSecondary } from './model.js';
import { createMusou } from './musou.js';
import { createMusouView } from './view.js';

export const HUANGZHONG_KIT = {
  moves: MOVES, airChainMax: AIR_CHAIN_MAX,
  clips: HZ_CLIPS, feet: {},
  runPose, rollPose,
  dashPlant: -1,                  // the dash is a slide: no lunge landing
  model: createHzModel, secondary: createHzSecondary,
  // bow-limb ribbon (vfx.js): the upper limb runs along the weapon frame's y (axis), from the grip to past the tip; only
  // the slashes draw it (moves), over the hit window widened by pad [before, after] frames; a slower limb than the spear
  // still reads (gain: tip travel per sim frame, m, where the ribbon fades in → is full)
  trail: { axis: 'y', base: 0.12, tip: 1.12, moves: ['n1', 'n3', 'n5'], pad: [6, 5], gain: [0.02, 0.09] },
  // vfx.js palette (linear HDR; hot/burst in near-display values, see vfx.js): amber / fire instead of Zhao Yun's ice
  fx: {
    needle: [[2.8, 1.5, 0.45], [2.4, 1.0, 0.22], [3.0, 2.3, 1.2]],
    hot: [[0.55, 0.2, 0.03], [0.6, 0.3, 0.05], [0.62, 0.4, 0.1], [2.2, 1.6, 0.8]],
    burst: [0.52, 0.2, 0.03], flash: [2.6, 1.5, 0.45], slash: [3.0, 1.8, 0.6], pulse: [1.8, 0.8, 0.18],
    light: [1, 0.6, 0.25], crack: [2.8, 1.1, 0.25], wall: [1.3, 0.55, 0.12], ring: [2.0, 1.05, 0.3], shard: [2.6, 1.4, 0.4],
    glint: null, glitter: [2.8, 1.8, 0.7],
    // jump-charge body glow (additive) / rim (back-face outline) / strength, anims/locomotion.js — fx r3 acc: 0.3 strength
    // (a thin rim hugging him, shading kept): at full strength the 1.1× back-face shell filled his whole silhouette in
    // flat orange; the charge reads from the aura round him instead (arrows.js updateDraw)
    glow: [0x9a3c0c, 0xe07828, 0.3],
    trail: { white: [1.1, 0.95, 0.68], fringe: [1.0, 0.42, 0.06], hot: [1.7, 1.3, 0.7], glow: [1.6, 0.72, 0.14], grad: true },   // grad: white leading edge → amber → clear tail (vfx.js)
  },
  createMusou, createMusouView,
};
