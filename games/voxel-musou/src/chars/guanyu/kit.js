// 關羽's kit: his model def (model.js) and moveset (moves.js) through the def-kit adapter (src/chars/defkit.js), plus his
// look: the default body scale (broad, not bigger), heavy (camera kicks × 1.3), a deep measured voice, jade-green light in
// every effect (ribbon, contacts, dodge ghosts, the blade glowing through a charge, the crescent waves), the 河東 關雲長 /
// 武聖 cut-in, and a jade 青龍 rising off the blade at the Musou's contact (musou/view.js look.dragon palette).
// Edge lead (view): the clips key a spear line, so a glaive would often cut with its flat or spine. Each rendered frame,
// after IK, the weapon rolls about its shaft so the edge (weapon +y) turns into the blade's motion — eased in through a
// swing, held through hitstop, relaxed back to the authored roll out of combat. Render only (hands sit on the shaft, hit
// shapes and the ribbon ignore roll).
import * as THREE from 'three';
import { defKit } from '../defkit.js';
import { GUANYU_DEF } from './model.js';
import * as MOVESET from './moves.js';

const TIP = 1.9, tipW = new THREE.Vector3(), tipP = new THREE.Vector3(), wq = new THREE.Quaternion();
let lead = 0, seen = false;
function edgeLead(hero, dt, rig) {
  const w = rig.joints.weapon;
  w.rotation.z += lead; w.updateMatrixWorld(true);
  w.localToWorld(tipW.set(0, 0, TIP));
  if (seen && dt > 0 && tipW.distanceToSquared(tipP) < 4) {
    const v = tipP.sub(tipW).negate().applyQuaternion(w.getWorldQuaternion(wq).invert());   // tip motion in weapon space
    const speed = Math.hypot(v.x, v.y) / dt, swing = hero.state === 'attack' || hero.state === 'musou';
    let d = 0;
    if (swing && speed > 2.5) d = Math.atan2(-v.x, v.y) * Math.min(1, dt * 18 * Math.min(1, speed / 8));   // roll +y onto v
    else if (!swing) d = -lead * Math.min(1, dt * 4);
    if (d) {
      lead = Math.atan2(Math.sin(lead + d), Math.cos(lead + d));
      w.rotation.z += d; w.updateMatrixWorld(true); w.localToWorld(tipW.set(0, 0, TIP));
    }
  }
  tipP.copy(tipW); seen = true;
}

export const GUANYU_KIT = defKit({
  ...GUANYU_DEF,
  reach: { tip: 2.2, butt: 0.92 },
  trail: { base: 1.5, baseHeavy: 1.3, tip: 2.2 },
  weight: 1.3,
  voice: { pitch: 0.76, fk: 0.88, growl: 0.14, gain: 1.05 },
  heat: [0x3cff90, 0.22, 1.4, 1.0],
  view: (model, hero, dt, rig) => edgeLead(hero, dt, rig),
  fx: {
    needle: [[0.5, 2.4, 1.0], [0.2, 1.8, 0.6], [1.6, 2.8, 1.8]],
    hot: [[0.06, 0.5, 0.18], [0.1, 0.58, 0.24], [0.2, 0.64, 0.32], [1.2, 2.2, 1.4]],
    burst: [0.08, 0.5, 0.2], flash: [0.9, 2.6, 1.3], slash: [1.2, 3.0, 1.6], pulse: [0.4, 1.9, 0.8],
    light: [0.45, 1, 0.62], crack: [0.6, 2.6, 1.1], wall: [0.2, 1.2, 0.5], ring: [0.6, 2.2, 1.0], shard: [0.9, 2.6, 1.3],
    glint: [1.6, 2.8, 1.8], glitter: [1.5, 2.8, 1.6],
    glow: [0x0f6a34, 0x3ae07a, 0.35],
    trail: { white: [0.85, 1.1, 0.9], fringe: [0.05, 0.9, 0.3], hot: [1.2, 1.7, 1.3], glow: [0.3, 1.6, 0.7], grad: true },
    ghost: [0x1f8a4a, 0x2fb866, 0xc8ffd8, 0x8af0b0, 0x2aa85a],
    mu: { crack: [0.6, 2.6, 1.1], wall: [0.2, 0.85, 0.35], light: [0.5, 1, 0.7] },
  },
  look: {
    cut: { sub: '河東 關雲長', seal: '武聖', css: {
      big: 'color: #f2fff4; text-shadow: 0 0 2px #04140a, 6px 8px 0 rgba(2,14,6,.55), 0 0 28px rgba(60,230,130,.6);',
      sub: 'color: #d8ffe4; text-shadow: 0 0 10px rgba(50,220,120,.75), 2px 2px 0 rgba(0,0,0,.6);' } },
    // the jade 青龍 (musou/view.js dragon palette: linear HDR; shell = its rim glow, ink = its outline)
    dragon: { body: [0.02, 0.3, 0.1], scale: [0.05, 0.56, 0.22], belly: [0.9, 0.82, 0.36], fin: [0.5, 1.3, 0.55], eye: [3.0, 2.2, 0.5],
      horn: [1.4, 1.15, 0.6], white: [1.05, 1.2, 1.0], whisker: [0.7, 1.5, 0.8], mouth: [0.32, 0.01, 0.03], shell: [0.25, 1.2, 0.55], ink: 0x021a0c },
    pal: { rays: [0.5, 1.3, 0.6], ring: [0.8, 2.1, 1.0], bolt: [1.4, 2.4, 1.5], burst: [0.5, 1.8, 0.8], ko: [0.3, 1.0, 0.45], glow: 0x8affb8,
      mote: [1.1, 1.4, 1.1], rib: [0.3, 1.5, 0.6], rib2: [1.3, 1.1, 0.3], aura: [0.3, 0.9, 0.45],
      dim: [[150, 214, 170], [80, 140, 100], [40, 80, 56]], cool: [196, 240, 210], wash: [[246, 255, 248], [210, 250, 222], [150, 220, 176]] },
  },
  sig: { roar: [0.5, 2.2, 1.0], core: [1.6, 2.6, 1.9], wave: [0.35, 2.1, 0.85], beam: [0.6, 2.2, 1.1], charge: [0.4, 2.2, 0.9] },
}, MOVESET);
