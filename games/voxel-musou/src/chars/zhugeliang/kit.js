// 諸葛亮's kit: his model def (model.js) and moveset (moves.js) through the def-kit adapter (src/chars/defkit.js), plus
// his look: default size, light (camera kicks × 0.8), a light clear voice; violet-white wind and starlight in every
// effect (the ribbon along the fan's wind blade, contacts, dodge ghosts), gold for the 八卦; the wind blade on the fan
// shows while he attacks (view hook below); his own render layer (fx.js: the 八卦 sigils, the Musou's rain and east
// wind); the 東風・八陣 cut-in (臥龍 / 南陽 諸葛孔明), no dragon.
import { defKit } from '../defkit.js';
import { ZHUGELIANG_DEF } from './model.js';
import { createZhugeFx } from './fx.js';
import * as MOVESET from './moves.js';

let glow = 0, t = 0;
export const ZHUGELIANG_KIT = defKit({
  ...ZHUGELIANG_DEF,
  reach: { tip: 0.64, butt: 0.14 },
  trail: { base: 0.8, baseHeavy: 0.66, tip: 1.9 },                    // along the wind blade
  weight: 0.8,
  voice: { pitch: 1.1, fk: 1.07, growl: -0.1, gain: 0.8 },
  fx: {
    needle: [[1.8, 1.6, 2.8], [1.1, 0.9, 2.4], [2.6, 2.5, 2.8]],
    hot: [[0.3, 0.2, 0.6], [0.4, 0.3, 0.7], [0.55, 0.45, 0.85], [1.8, 1.7, 2.2]],
    burst: [0.34, 0.24, 0.62], flash: [1.8, 1.6, 2.8], slash: [2.0, 1.8, 3.0], pulse: [0.9, 0.7, 1.8],
    light: [0.85, 0.78, 1], crack: [2.4, 1.9, 0.8], wall: [0.8, 0.7, 1.4], ring: [1.4, 1.2, 2.2], shard: [1.8, 1.6, 2.8],
    glint: [2.2, 2.0, 2.8], glitter: [2.0, 1.9, 2.8],
    glow: [0x5a48b0, 0xa898f0, 0.35],
    trail: { white: [0.95, 0.93, 1.0], fringe: [0.5, 0.35, 1.0], hot: [1.6, 1.55, 1.75], glow: [0.7, 0.55, 1.5] },
    ghost: [0x6a58c8, 0x9c8cf0, 0xf0ecff, 0xc8bcff, 0x7c6ce0],
    mu: { crack: [2.4, 1.9, 0.8], wall: [0.8, 0.7, 1.4], light: [0.85, 0.78, 1] },
  },
  look: {
    cut: { sub: '南陽 諸葛孔明', seal: '臥龍', css: {
      big: 'color: #f6f4ff; text-shadow: 0 0 2px #0a0818, 6px 8px 0 rgba(6,4,16,.55), 0 0 28px rgba(160,140,255,.6);',
      sub: 'color: #e6e0ff; text-shadow: 0 0 10px rgba(150,130,255,.75), 2px 2px 0 rgba(0,0,0,.6);' } },
    pal: { rays: [1.0, 0.9, 1.4], ring: [1.7, 1.5, 2.4], bolt: null, burst: [1.4, 1.2, 2.0], ko: [0.8, 0.7, 1.1], glow: 0xc8b8ff,
      mote: [1.4, 1.35, 1.5], rib: [1.0, 0.8, 1.7], rib2: [1.7, 1.4, 0.6], aura: [0.7, 0.6, 1.0],
      dim: [[176, 170, 214], [108, 100, 150], [60, 54, 96]], cool: [222, 214, 246], wash: [[252, 250, 255], [232, 224, 252], [190, 176, 232]] },
  },
  sig: { roar: [1.4, 1.2, 2.4], core: [1.7, 1.6, 2.4], wave: [1.3, 1.2, 2.6], beam: [1.9, 1.8, 2.8], charge: [1.5, 1.3, 2.7] },
  /** The fan's wind blade (weapon1): in fast while he attacks or casts his Musou, out slowly, flickering. */
  view(model, h, dt) {
    const want = h.state === 'attack' || h.state === 'musou' ? 1 : 0, m = model.meshes.weapon1;
    t += dt; glow += (want - glow) * Math.min(1, dt * (want ? 18 : 5));
    m.visible = glow > 0.02;
    m.material.opacity = glow * (0.8 + 0.2 * Math.sin(t * 31));
  },
  fxView: createZhugeFx,
}, MOVESET);
