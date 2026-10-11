// 張飛's kit: his model def (model.js) and moveset (moves.js) through the def-kit adapter (src/chars/defkit.js), plus
// his look: a size up and heavy (camera kicks × 1.45), the deepest growling voice, crimson-orange fire in every effect
// (ribbon, contacts, dodge ghosts, the blade heating through a charge), the 燕人咆哮 cut-in, no dragon.
import { defKit } from '../defkit.js';
import { ZHANGFEI_DEF } from './model.js';
import * as MOVESET from './moves.js';

export const ZHANGFEI_KIT = defKit({
  ...ZHANGFEI_DEF,
  scale: 1.13,
  reach: { tip: 2.24, butt: 0.86 },
  trail: { base: 1.32, baseHeavy: 1.1, tip: 2.4 },
  weight: 1.45,
  voice: { pitch: 0.7, fk: 0.84, growl: 0.4, gain: 1.1 },
  heat: [0xff6a24, 0.25, 1.5, 1.1],
  fx: {
    needle: [[2.8, 1.1, 0.3], [2.3, 0.6, 0.12], [3.0, 2.0, 1.0]],
    hot: [[0.56, 0.12, 0.02], [0.62, 0.22, 0.04], [0.64, 0.34, 0.08], [2.2, 1.4, 0.7]],
    burst: [0.52, 0.12, 0.02], flash: [2.6, 1.0, 0.3], slash: [3.0, 1.4, 0.45], pulse: [1.9, 0.6, 0.12],
    light: [1, 0.48, 0.2], crack: [2.8, 0.8, 0.18], wall: [1.3, 0.42, 0.1], ring: [2.2, 0.8, 0.22], shard: [2.6, 1.1, 0.3],
    glint: [2.8, 1.5, 0.5], glitter: [2.8, 1.4, 0.5],
    glow: [0x8a2206, 0xe0501a, 0.35],
    trail: { white: [1.1, 0.9, 0.66], fringe: [1.0, 0.2, 0.04], hot: [1.7, 1.15, 0.55], glow: [1.6, 0.42, 0.08], grad: true },
    ghost: [0xb8401a, 0xe06628, 0xffd2a8, 0xffa870, 0xe05a1e],
    mu: { crack: [2.8, 0.8, 0.18], wall: [0.85, 0.26, 0.06], light: [1, 0.5, 0.22] },
  },
  look: {
    cut: { sub: '燕人 張翼德', seal: '咆哮', css: {
      big: 'color: #fff3e4; text-shadow: 0 0 2px #1c0804, 6px 8px 0 rgba(22,5,2,.55), 0 0 28px rgba(255,110,40,.6);',
      sub: 'color: #ffe0c4; text-shadow: 0 0 10px rgba(255,100,36,.75), 2px 2px 0 rgba(0,0,0,.6);' } },
    pal: { rays: [1.35, 0.6, 0.16], ring: [2.2, 0.95, 0.28], bolt: null, burst: [1.9, 0.85, 0.28], ko: [1.05, 0.48, 0.14], glow: 0xffa060,
      mote: [1.4, 1.1, 0.8], rib: [1.6, 0.6, 0.15], rib2: [1.6, 0.3, 0.18], aura: [0.95, 0.48, 0.16],
      dim: [[224, 172, 142], [160, 98, 76], [92, 50, 40]], cool: [242, 216, 192], wash: [[255, 246, 232], [255, 212, 170], [230, 156, 116]] },
  },
  sig: { roar: [2.2, 0.85, 0.28], core: [2.4, 1.8, 1.1], wave: [2.0, 0.85, 0.28], beam: [2.0, 1.1, 0.45], charge: [2.2, 0.95, 0.28] },
}, MOVESET);
