// 呂布's kit: his model def (model.js) and moveset (moves.js) through the def-kit adapter (src/chars/defkit.js), plus his
// look — the tallest officer (scale 1.14), heavy (camera kicks × 1.35), a savage rasping voice, crimson in every effect
// (ribbon, contacts, dodge ghosts, the blade glowing blood-red through a charge and his Musou), a purple-gold glitter,
// the 人中呂布 cut-in — and his boss profile for the actors system (src/actors/actors.js: attacks table on his clips).
import { defKit } from '../defkit.js';
import { LUBU_DEF } from './model.js';
import * as MOVESET from './moves.js';

export const LUBU_KIT = defKit({
  ...LUBU_DEF,
  scale: 1.14,
  reach: { tip: 2.24, butt: 0.94 },
  trail: { base: 1.3, baseHeavy: 1.1, tip: 2.36 },
  weight: 1.35,
  voice: { pitch: 0.8, fk: 0.88, growl: 0.55, gain: 1.15 },
  heat: [0xff2a2a, 0.22, 1.5, 1.3],
  fx: {
    needle: [[2.8, 0.5, 0.4], [2.3, 0.22, 0.2], [3.0, 1.6, 1.2]],
    hot: [[0.6, 0.06, 0.05], [0.66, 0.12, 0.08], [0.7, 0.22, 0.15], [2.2, 1.1, 0.85]],
    burst: [0.55, 0.06, 0.05], flash: [2.6, 0.7, 0.55], slash: [3.0, 0.9, 0.7], pulse: [1.9, 0.35, 0.32],
    light: [1, 0.3, 0.28], crack: [2.8, 0.45, 0.35], wall: [1.3, 0.24, 0.2], ring: [2.2, 0.5, 0.42], shard: [2.6, 0.8, 0.6],
    glint: [2.8, 1.3, 1.0], glitter: [2.4, 1.1, 2.4],
    glow: [0x8a0a14, 0xe02838, 0.35],
    trail: { white: [1.1, 0.86, 0.82], fringe: [1.0, 0.05, 0.08], hot: [1.7, 0.95, 0.75], glow: [1.6, 0.12, 0.16], grad: true },
    ghost: [0xa01828, 0xd8303c, 0xffc8c8, 0xff8080, 0xc02030],
    mu: { crack: [2.8, 0.45, 0.35], wall: [0.9, 0.12, 0.12], light: [1, 0.3, 0.28] },
  },
  look: {
    cut: { sub: '人中呂布 呂奉先', seal: '飛將', css: {
      big: 'color: #fff0ee; text-shadow: 0 0 2px #1a0406, 6px 8px 0 rgba(24,2,6,.6), 0 0 30px rgba(255,40,60,.65);',
      sub: 'color: #ffd6de; text-shadow: 0 0 10px rgba(220,40,90,.8), 2px 2px 0 rgba(0,0,0,.6);' } },
    pal: { rays: [1.4, 0.2, 0.22], ring: [2.2, 0.4, 0.4], bolt: null, burst: [2.0, 0.4, 0.4], ko: [1.1, 0.2, 0.2], glow: 0xff5060,
      mote: [1.4, 0.9, 1.1], rib: [1.6, 0.14, 0.2], rib2: [1.2, 0.3, 1.2], aura: [1.0, 0.16, 0.2],
      dim: [[214, 150, 156], [150, 80, 92], [80, 34, 46]], cool: [236, 200, 206], wash: [[255, 242, 240], [255, 196, 196], [226, 120, 130]] },
  },
  sig: { roar: [2.2, 0.35, 0.3], core: [2.6, 1.4, 1.2], wave: [2.4, 0.28, 0.26], beam: [2.2, 0.5, 0.4], charge: [2.4, 0.35, 0.3] },
}, MOVESET);

// Boss profile (actors.js attacks[]; hitbox == telegraph decal): the tornado round him, the piercing charge down a lane,
// the leaping impale onto the hero, and — rarer, with the longest tell — the crescent storm's wide ring.
LUBU_KIT.bossAttacks = [
  { id: 'sweep', clip: 'c4', windup: 34, active: 30, recover: 30, every: 8, dmg: 34, shape: 'circle', r: 4.4, range: [0, 4.4], weight: 5 },
  { id: 'thrust', clip: 'c3', windup: 30, active: 16, recover: 28, every: 4, dmg: 40, shape: 'lane', w: 2.4, len: 8.5, lunge: 5.4,
    range: [2.4, 9], weight: 3 },
  { id: 'leap', clip: 'c5', t1: 0.7, windup: 24, active: 30, recover: 34, dmg: 50, shape: 'leap', r: 4.6, len: 13, h: 3, range: [5.5, 14], weight: 2 },
  { id: 'storm', clip: 'c6', f: [24, 85], t1: 0.9, windup: 44, active: 44, recover: 30, every: 11, dmg: 30, shape: 'circle', r: 6.4, range: [0, 6], weight: 1.5 },
];
LUBU_KIT.bossPoise = 420;
