// 劉備's kit: his model def (model.js) and moveset (moves.js) through the def-kit adapter (src/chars/defkit.js), plus what
// a twin-sword lord needs on top of it:
//  · the second sword: the weapon meshes again on the left hand. After the rig's pass (the left arm by FK: lfree 1) the
//    left hand turns to the root-space blade keyed in the pose's armR channels [yaw, elev, roll, weight] — unused while
//    rfree is 0 — slerped from the natural grip (weight 0: the blade reversed along the forearm, as in the run / roll) to
//    the keyed blade (weight 90° = 1). Patched into rig.apply, so the hero, the select stage and actors all see it.
//  · 仁德 (C6): on its shock frame his side within 20 m is restored and cheers, and he recovers 5 % of his health (sim,
//    stepped with the kit's Musou sim).
//  · the view (view.js): the twin dragons of the Musou, C6's 義 and the left sword's ribbon.
// Look: gold and jade light in every effect, a warm voice, the 昭烈 cut-in (中山靖王之後 · 仁德).
import * as THREE from 'three';
import { defKit } from '../defkit.js';
import { CH } from '../../hero/rig.js';
import { ST } from '../../crowd/crowd.js';
import { LIUBEI_DEF } from './model.js';
import * as MOVESET from './moves.js';
import { createTwinView, LEFT } from './view.js';

const W = Math.PI / 2;
const NAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(150 * Math.PI / 180, 0, 0));   // natural grip (forearm frame)
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');

/** The left sword on the left hand, turned to the pose's armR blade after every rig pass. */
function twinSwords(rig, m) {
  const hand = rig.joints.handL, fore = rig.joints.foreArmL, root = rig.root, apply = rig.apply.bind(rig);
  for (let i = 0; m.meshes['weapon' + i]; i++) {
    const w = m.meshes['weapon' + i], s = new THREE.Mesh(w.geometry, w.material);
    s.castShadow = true; s.receiveShadow = true;
    hand.add(s); m.meshes['swordL' + i] = s;
  }
  rig.apply = (pose, pos, yaw, h) => {
    apply(pose, pos, yaw, h);
    const k = Math.min(1, Math.max(0, pose[CH.armR + 3] / W));
    fore.getWorldQuaternion(_q).multiply(NAT);
    if (k > 0) {
      root.getWorldQuaternion(_q2).multiply(_q3.setFromEuler(_e.set(-pose[CH.armR + 1], pose[CH.armR], pose[CH.armR + 2])));
      _q.slerp(_q2, k);
    }
    hand.quaternion.copy(fore.getWorldQuaternion(_q2).invert().multiply(_q));
    hand.updateMatrixWorld(true);
  };
  return m;
}

/** 仁德: once per C6, on its shock frame. */
function rally(game, mu) {
  const step = mu.step, reset = mu.reset;
  let seq = -1;
  mu.reset = () => { seq = -1; reset(); };
  mu.step = () => {
    step();
    const h = game.hero, c = game.crowd;
    if (h.state !== 'attack' || h.move !== 'c6' || h.moveT < h.kit.moves.c6.hits[0].f[0] || h.moveSeq === seq) return;
    seq = h.moveSeq;
    h.hp = Math.min(h.hpMax, h.hp + Math.round(h.hpMax * 0.05));
    for (let i = c.N; i < c.T; i++) {
      if (c.st[i] === ST.OFF || c.st[i] === ST.DEAD || (c.x[i] - h.x) ** 2 + (c.z[i] - h.z) ** 2 > 400) continue;
      c.hp[i] = c.hpMax[i];
      c.raiseF[i] = game.frame + 70 - (i % 5) * 5;
    }
  };
  return mu;
}

const kit = defKit({
  ...LIUBEI_DEF,
  reach: { tip: 0.9, butt: 0.16 },
  trail: { base: 0.3, baseHeavy: 0.2, tip: 0.9 },
  weight: 1.05,
  voice: { pitch: 0.86, fk: 0.93, growl: 0.04, gain: 1 },
  heat: [0xe8eed8, 0.25, 1.3, 1.0],
  view(model) { LEFT.blade = model.meshes.swordL2; },           // the left sword's ribbon (view.js)
  fx: {
    needle: [[2.4, 2.0, 0.8], [1.1, 2.1, 1.2], [2.6, 2.5, 1.7]],
    hot: [[0.5, 0.42, 0.12], [0.26, 0.52, 0.32], [0.6, 0.54, 0.22], [2.0, 1.9, 1.2]],
    burst: [0.44, 0.4, 0.14], flash: [2.2, 2.0, 1.0], slash: [2.4, 2.1, 0.9], pulse: [1.2, 1.8, 0.9],
    light: [1, 0.86, 0.46], crack: [2.2, 1.8, 0.6], wall: [0.8, 1.05, 0.5], ring: [1.6, 2.0, 0.9], shard: [1.8, 2.2, 1.2],
    glint: [2.6, 2.3, 1.2], glitter: [2.4, 2.3, 1.3],
    glow: [0x2a6a3a, 0xe0c060, 0.35],
    trail: { white: [1.05, 1.02, 0.86], fringe: [0.3, 0.95, 0.5], hot: [1.6, 1.5, 0.9], glow: [0.55, 1.4, 0.65], grad: true },
    ghost: [0x3a9a6a, 0x5cc084, 0xf2e2aa, 0xe2c870, 0x48b07e],
    mu: { crack: [2.2, 1.8, 0.6], wall: [0.7, 1.0, 0.42], light: [1, 0.9, 0.5] },
  },
  look: {
    cut: { sub: '中山靖王之後', seal: '仁德', css: {
      big: 'color: #fbf6e6; text-shadow: 0 0 2px #0c1a10, 6px 8px 0 rgba(6,16,8,.55), 0 0 28px rgba(230,200,90,.6);',
      sub: 'color: #eaf6dc; text-shadow: 0 0 10px rgba(90,210,140,.75), 2px 2px 0 rgba(0,0,0,.6);' } },
    pal: { rays: [1.3, 1.1, 0.4], ring: [1.5, 2.0, 0.8], bolt: null, burst: [1.8, 1.6, 0.6], ko: [0.9, 0.95, 0.4], glow: 0xffe6a0,
      mote: [1.3, 1.3, 0.9], rib: [0.6, 1.6, 0.8], rib2: [1.6, 1.3, 0.3], aura: [0.7, 0.9, 0.35],
      dim: [[176, 196, 150], [104, 128, 90], [52, 72, 48]], cool: [220, 236, 200], wash: [[252, 250, 232], [236, 240, 196], [196, 214, 150]] },
  },
  sig: { roar: [2.0, 1.6, 0.55], core: [2.4, 2.3, 1.5], wave: [0.7, 2.0, 1.1], beam: [1.8, 1.9, 0.9], charge: [2.0, 1.8, 0.7] },
}, MOVESET);

const model = kit.model, createMusou = kit.createMusou, createMusouView = kit.createMusouView;
kit.model = (rig) => twinSwords(rig, model(rig));
kit.createMusou = (game) => rally(game, createMusou(game));
kit.createMusouView = (scene, game, camera) => {
  const a = createMusouView(scene, game, camera), b = createTwinView(scene, game);
  return { update(dt) { a.update(dt); b.update(dt); }, dispose() { a.dispose(); b.dispose(); } };
};
export const LIUBEI_KIT = kit;
