// 虎牢關 (Hulao Gate, 190 AD) laid out along +Z, ≈ 330 m from the coalition camp to the gate — 汜水 country: a dry loess
// plain, then a gorge cut through banded loess and rock, then the killing ground under the pass fortress. Noon: a hard
// white sun high behind the lens's left shoulder, so the gate's rammed-earth face and its twin towers stand sunlit
// with black shadow under every eave, and dust hangs pale over the plain.
//   聯軍本陣  coalition camp     z -176 … -126  h 0    袁紹's pavilion, the five lords' standards (袁 曹 孫 公孫 劉), the
//                                                    wine table by its brazier (anchor 'wine'); story start
//   汜水關前  the plain           z -128 …  -34  h 0    open loess field (free-mode arena, spawn.free); 華雄's forward
//                                                    outworks across its far end: palisades, towers, stakes
//   峽谷      the gorge           z  -44 …   78  h 0→5 walls of banded loess that climb to 30-40 m and narrow to 15 m;
//                                                    barricade gate 'gorge' at z ≈ 60
//   關前      the forecourt       z   72 …  134  h 5    60 m of killing ground under the wall: braziers, siege wrecks
//   虎牢關    the gatehouse       z  136 …  146        custom set piece (build): rammed-earth curtain wall, two 闕
//                                                    towers, the three-storey gate tower, the double doors (gate
//                                                    'hulao', anchor 'hulao' = the gate's face) that 呂布 rides out of
//   (inner)   the gate yard       z  146 …  170  h 5    behind the doors: where 呂布 waits and withdraws to
// Format: ./index.js.
import * as THREE from 'three';
import { boxesGeometry, shade } from '../../core/voxel.js';
import { makeRng } from '../../core/rng.js';
import { lit, pagoda } from '../castle.js';
import { voxelGrain } from '../terrain.js';
import { GATES } from '../map.js';

const WALL_Z = 136, WALL_T = 10, FORE_H = 5;   // wall face (faces -Z), thickness, forecourt / gate-yard plateau height
const WALL_H = 13, GATE_W = 7.6, GATE_H = 7.2;  // wall height above the forecourt, gate passage width / height
const TOWER_X = 14, TOWER_W = 9.4, TOWER_D = 11, TOWER_H = 20;   // the two 闕: centre x (±), footprint, earth height

export default {
  id: 'hulao',
  name: { zh: '虎牢關', en: 'Hulao Gate' },
  grid: [-120, -206, 120, 232],
  pieces: [
    { id: 'camp', rect: [-32, -176, 32, -126], h: 0, rise: 6 },
    { id: 'plain', rect: [-56, -128, 56, -34], h: 0, edge: 2, rise: 12 },
    { id: 'gorge', path: [[0, -44, 26, 0], [-5, -18, 19, 0.6], [4, 8, 14.5, 1.6], [1, 32, 11, 2.6], [3, 50, 8.5, 3.6], [2, 62, 7.5, 4.3], [0, 78, 12, FORE_H]], edge: 1, rise: 36 },
    { id: 'fore', rect: [-34, 72, 34, 134], h: FORE_H, edge: 2.5, rise: 24 },
    { id: 'gateway', rect: [-GATE_W / 2, 128, GATE_W / 2, 148], h: FORE_H, rise: 3 },
    { id: 'yard', rect: [-16, 146, 16, 170], h: FORE_H, edge: 1.5, rise: 16 },
  ],
  // the camp's front palisade either side of its gate; 華雄's outworks (two palisade arms leaving a 24 m gap on the road)
  carve: [[-33, -129.5, -9, -125.5], [9, -129.5, 33, -125.5], [-56, -47.5, -12, -44.5], [12, -47.5, 56, -44.5]],
  // the gatehouse (curtain wall either side of the passage, the two towers, the horse-face bastions) and the outworks'
  // two watchtowers, 袁紹's pavilion terrace
  props: [[-76, WALL_Z, -GATE_W / 2 - 0.3, WALL_Z + WALL_T + 0.5], [GATE_W / 2 + 0.3, WALL_Z, 76, WALL_Z + WALL_T + 0.5],
    [-TOWER_X - TOWER_W / 2, WALL_Z - 6.4, -TOWER_X + TOWER_W / 2, WALL_Z], [TOWER_X - TOWER_W / 2, WALL_Z - 6.4, TOWER_X + TOWER_W / 2, WALL_Z],
    [-32.6, WALL_Z - 3, -27.4, WALL_Z], [27.4, WALL_Z - 3, 32.6, WALL_Z],
    [-18.5, -44, -13.5, -39.5], [13.5, -44, 18.5, -39.5], [-8, -172, 8, -161]],
  zones: [
    { id: 'camp', name: { zh: '聯軍本陣', en: 'Coalition Camp' }, x: 0, z: -151, w: 64, d: 50 },
    { id: 'plain', name: { zh: '汜水關前', en: 'Before Sishui' }, x: 0, z: -81, w: 112, d: 94 },
    { id: 'gorge', name: { zh: '峽谷', en: 'The Gorge' }, x: 0, z: 22, w: 56, d: 112 },
    { id: 'fore', name: { zh: '關前', en: 'Gate Forecourt' }, x: 0, z: 106, w: 68, d: 56 },
    { id: 'yard', name: { zh: '虎牢關', en: 'Hulao Gate' }, x: 0, z: 158, w: 32, d: 24 },
  ],
  route: [[0, -168], [0, -126], [0, -90], [0, -46], [-5, -18], [4, 8], [1, 32], [3, 50], [2, 62], [0, 80], [0, 110], [0, WALL_Z], [0, 160]],
  gates: {
    gorge: { rect: [-12, 58.5, 16, 61.5], name: { zh: '峽谷柵', en: 'Gorge Barricade' }, kind: 'barricade', at: [2, 60, 0, 9.5] },
    hulao: { rect: [-7, WALL_Z - 2, 7, WALL_Z + 2], name: { zh: '虎牢關門', en: 'Hulao Gate' }, kind: 'doors' },
  },
  anchors: { hulao: [0, WALL_Z], wine: [-10, -148], outworks: [0, -46] },
  // story: at the head of the coalition van inside the camp gate, the plain and the far gorge through it; free: the plain
  spawn: { story: { x: 0, z: -137, yaw: 0, tilt: -0.07 }, free: { x: 0, z: -86, yaw: 0 } },
  water: null,
  // noon: the sun high (≈ 58°) behind-right of the up-valley view; pale dust-blue sky, loess-white haze
  sky: {
    sunElev: 1.0, sunAz: Math.PI - 0.55, sunCore: [5.2, 5.0, 4.6],
    haze: 0xc2bfb4, hazeWarm: 0xd6c7a6, glow: 0xfff4e0, skyMid: 0xa8bccc, skyTop: 0x4f7fb4,
    hznSun: 0xe8dcc0, hznAway: 0xd4cdb8, cloudRose: 0xece4d4, cloudShade: 0x9ca4b0, cloudLit: 0xfffaf0,
    dust: [22.0, 70.0, 1.4, 0.05], dustLit: 0xd8c29c, dustShade: 0xa29c8e, apCool: 0xb4b2aa,
  },
  fog: [60, 420],
  light: { hemi: [0xbcd0ea, 0xa88a60, 1.9], sun: [0xfff2dc, 4.4], rim: [0xfff0dc, 0.5], dir: [0.34, 0.86, -0.38], fire: 0xff9a4a, key: [-10, -150], fill: null },
  post: { exposure: 1.08, sat: 1.12, highTint: [1.06, 1.0, 0.9], shadowTint: [0.86, 0.94, 1.14], tintHi: 0.3, rays: 0, bloom: 0.45,
    hazeCool: [0.2, 0.2, 0.2], hazeWarm: [0.3, 0.26, 0.2], sunGlow: [0.3, 0.26, 0.2], inscatter: [0.012, 0.01, 0.008], sunBurst: [0, 0, 0], vignette: 0.24 },
  castle: null,
  terrain: {
    pave: (x, z) => (Math.hypot(x, z + 146) < 12 ? 0.6 : 0)                   // the camp's muster square
      + (z > 112 && z < 150 && Math.abs(x) < 14 ? 0.55 : 0),                  // the worn apron before the gate
    bare: (x, z) => (z < -124 && Math.abs(x) < 32) || z > 70,                // camp + forecourt: trampled bare
    rock: (h, x, z) => h - (z < -40 ? 0 : Math.min(FORE_H, (z + 40) / 23)) - 2,
    scorch: { n: 18, area: [-40, -60, 40, 132], spots: [[-2, 58, 0.9], [8, 61, 0.8], [-12, 120, 0.9], [14, 126, 0.8], [0, 130, 1.0]] },
    rubble: [-60, -176, 60, 150],
    pines: [400, 500],                                                        // sparse: loess scrub, not forest
    // banded loess: pale ochre strata over darker umber, sun-bleached tops, dry-scrub caps on the heights
    cliff: { rock: 0xb4916a, dark: 0x7c5a3e, top: 0x8a7454, moss: 0x6a6a3a, grassy: 0x8a8448 },
    mountains: { peakA: 0.05, peak: 30 },                                     // 邙山's shoulder over the pass
  },
  fires: [[-34, -104, 1.1], [36, -76, 1.2], [-30, -58, 1.0], [22, -6, 1.1], [-14, 26, 1.0], [-20, 96, 1.3], [22, 112, 1.2]],
  // firelight: the wine brazier, the outworks' gap, the gorge barricade, the gate braziers, forecourt wrecks
  lightSites: [[-8.2, 1.9, -148, 24, 9], [-11, 1.9, -46, 24, 10], [11, 1.9, -46, 24, 10], [-2, 2.2, 60.5, 30, 11], [6, 2.2, 60, 26, 10],
    [-7.5, 1.9, WALL_Z - 5, 28, 11], [7.5, 1.9, WALL_Z - 5, 28, 11], [-20, 2.2, 96, 22, 10], [22, 2.2, 112, 22, 10]],
  hq: [0, 150],
  minimap: { walls: [[-76, WALL_Z, -GATE_W / 2, WALL_Z + WALL_T], [GATE_W / 2, WALL_Z, 76, WALL_Z + WALL_T]] },

  dress(k) {
    const { r, mats, props, poles, shade: sh } = k;
    const lord = (g, bg, fg, border, seed) => k.banner(g, { bg, fg, border, w: 128, h: 256, seed });
    const LORDS = [lord('袁', '#c49a34', '#2a1608', '#6a3a14', 21), lord('曹', '#26324e', '#e8d8b0', '#b89048', 22),
      lord('孫', '#9a2a1c', '#f0dcb0', '#3a120c', 23), lord('公孫', '#e4e0d4', '#2a2420', '#5a5048', 24), lord('劉', '#2a6a4a', '#f0e6c8', '#c8a050', 25)];
    const hua = k.banner('華', { bg: '#3a1a4a', fg: '#e8c878', border: '#1a0c20', w: 128, h: 256, seed: 26 });

    // ---- 聯軍本陣: palisade on three sides and either side of the gate, gate towers, tents of the lords' contingents
    k.palisade([[-33.5, -126], [-33.5, -177.5], [33.5, -177.5], [33.5, -126]]);
    k.palisade([[-33, -127.5], [-10.5, -127.5]]);
    k.palisade([[10.5, -127.5], [33, -127.5]]);
    k.tower(-11.8, -127.5, 5.5, 1.3, mats.allyFlag); k.tower(11.8, -127.5, 5.5, 1.3, mats.allyFlag);
    const TENT = [0x6e5e44, 0x5e5038, 0x4e5238, 0x7a6848, 0x5a4a36];   // (the noon sun bleaches them: kept dark)
    for (let z = -170; z <= -135; z += 7) for (const sx of [-1, 1]) k.tent(sx * (26 + r.range(-1, 1)), z + r.range(-1, 1), Math.PI / 2 + r.range(-0.1, 0.1), TENT[r.int(0, 4)], 4.6, 5.6);
    for (const sx of [-1, 1]) for (let z = -172; z <= -156; z += 8) k.tent(sx * 16 + r.range(-1, 1), z, r.range(-0.15, 0.15), TENT[r.int(0, 4)], 4.2, 5);
    // 盟主 袁紹's pavilion on a stone terrace at the back of the camp, the lords' standards in an arc before it
    { const gy = k.ground(0, -166.5);
      props.push({ s: [16, 1.1, 11], p: [0, gy + 0.55, -166.5], c: 0x8a7866 }, { s: [16.2, 0.1, 0.18], p: [0, gy + 1.1, -161.1], c: 0xb8a890 });
      for (let q = 0; q < 3; q++) props.push({ s: [6 - q * 0.3, 0.37 * (q + 1), 1.3 - q * 0.4], p: [0, gy + 0.185 * (q + 1), -160.4 - (1.3 - q * 0.4) / 2 + 0.65], c: sh(0x7a6a5a, 1 + q * 0.05) });
      k.pagoda(0, gy + 1.1, -166.5, 12.5, 7.5, 2, 1);
      for (const lx of [-4.4, -1.5, 1.5, 4.4]) k.lantern(lx, gy + 4.0, -163.1, 1.1); }
    LORDS.forEach((m, i) => { const a = (i - 2) * 0.42; k.standard(Math.sin(a) * 15, -160 + Math.cos(a) * 6 - 6, 1.25, m, 10.5, [0, -146]); });
    for (const sx of [-1, 1]) k.standard(sx * 7, -158, 1.05, mats.ally, 8, [0, -140]);
    for (const [x, z, i] of [[-24, -130, 0], [24, -130, 1], [-24, -174, 2], [24, -174, 3], [-4, -176, 4], [4, -176, 0]]) k.standard(x, z, 1.1, LORDS[i], 8.5, [0, -150]);
    // the wine table: 曹操's cup warming over a brazier beside the war council's table (anchor 'wine')
    k.commandTable(-10, -148, 0.15);
    { const gy = k.ground(-10, -148), L = k.local(-10, gy, -148, 0.15);
      for (const [lx, lz] of [[-1.0, 0.45], [-0.7, -0.4], [1.1, -0.35]]) { L(lx, 1.05, lz, [0.34, 0.32, 0.34], 0x5a4030); L(lx, 1.25, lz, [0.2, 0.1, 0.2], 0x3a2618); }   // wine jars
      L(0.4, 0.97, 0.3, [0.14, 0.12, 0.14], 0xb89048); L(-0.1, 0.97, -0.1, [0.14, 0.12, 0.14], 0xb89048);   // bronze cups
      for (let q = 0; q < 5; q++) L(2.6 + (q % 3) * 0.6, 0.35 + (q > 2 ? 0.6 : 0), -1.6 + (q > 2 ? 0.3 : 0), [0.55, 0.6, 0.55], sh(0x6a4a34, r.range(0.85, 1.1)));   // jars stacked by the table
    }
    k.lamp(-8.2, -148, 0.5);
    for (const [x, z] of [[-6, -136], [6, -136], [-14, -156], [14, -156], [-15.5, -129.5], [15.5, -129.5]]) k.lamp(x, z, 0.55);
    for (const [x, z, yaw] of [[-30, -140, Math.PI / 2], [30, -150, -Math.PI / 2], [-20, -176, 0], [18, -176, 0]]) k.supplies(x, z, yaw, r.int(5, 7));
    for (const [x, z, yaw] of [[-31, -160, Math.PI / 2], [31, -136, -Math.PI / 2], [20, -142, 0.3]]) k.shieldRack(x, z, yaw);
    k.drum(12, -146, -Math.PI / 2 - 0.3); k.drum(-17, -134, Math.PI / 2 + 0.2);
    for (const [x, z, yaw] of [[-40, -120, 0.4], [-36, -114, 0.1], [42, -118, -0.3], [38, -123, -0.6]]) k.cart(x, z, yaw);

    // ---- 汜水關前: the plain; 華雄's outworks across its far end — palisade arms, towers at the gap, stakes, his standard
    k.palisade([[-55.5, -46], [-12.5, -46]]);
    k.palisade([[12.5, -46], [55.5, -46]]);
    k.tower(-16, -41.8, 6.5, 1.35); k.tower(16, -41.8, 6.5, 1.35);
    for (const sx of [-1, 1]) for (let x = 16; x < 52; x += 4.4) {                   // cheval-de-frise rows before the palisade
      if (r.chance(0.25)) continue;
      const L = k.local(sx * x, k.ground(sx * x, -52), -52 + r.range(-0.6, 0.6), r.range(-0.1, 0.1));
      for (const a of [-0.7, 0.7]) L(0, 0.75, 0, [0.14, 2.1, 0.14], 0x4a3222, [a, 0, 0]);
      L(0, 0.75, 0, [2.6, 0.16, 0.16], 0x3e2a1d);
    }
    for (const [x, z] of [[-11, -46], [11, -46]]) k.lamp(x, z, 0.75);
    for (const [x, z] of [[-6, -38], [6, -38]]) k.standard(x, z, 1.25, hua, 10, [0, -80]);
    for (const [x, z] of [[-30, -49], [30, -49], [-48, -50], [48, -50], [-50, -100], [50, -96]]) k.standard(x, z, 1.05, r.chance(0.3) ? mats.pennant : mats.foe);
    for (const [x, z, yaw] of [[-34, -104, 2.2], [36, -76, 0.8]]) k.cart(x, z, yaw, true);
    for (const [x, z, yaw] of [[-40, -40, 0.3], [40, -41, -0.2]]) k.supplies(x, z, yaw, 6);

    // ---- 峽谷: standards up the gorge floor's edges, archers along both rims, the barricade, rocks tumbled on the floor
    for (const [x, z] of [[-20, -24], [18, -12], [-12, 18], [16, 26], [-9, 44], [12, 48], [-8, 70], [10, 72]]) k.standard(x, z, 1.05, mats.foe, 7.6);
    k.barricade('gorge');
    k.burn(-2, 60.5, 1.1, 'gorge'); k.burn(6, 60, 1.0, 'gorge');
    k.tower(-16, 64, 6, 1.3); k.tower(19, 57, 6.5, 1.35);
    for (let i = 0; i < 26; i++) {                                               // rockfall: loess blocks at the wall feet
      const z = r.range(-20, 70), side = r.chance(0.5) ? -1 : 1;
      let x = side * 4;
      while (k.inAt(x, z) > 1.2 && Math.abs(x) < 30) x += side * 0.8;
      const s = r.range(0.7, 1.8), gy = k.ground(x, z);
      props.push({ s: [s * 1.3, s, s * r.range(0.9, 1.4)], p: [x, gy + s * 0.4, z], r: [r.range(-0.2, 0.2), r.range(0, 3), r.range(-0.2, 0.2)], c: sh(0xa88660, r.range(0.8, 1.05)) });
    }
    const rims = [[], []];
    k.troops('foe', rims[0]); k.troops('foe', rims[1]);
    for (let z = 20; z < 76; z += 1.7) for (const side of [-1, 1]) {           // the ambush's archers on both rims, facing in
      let x = side * 8;
      while (k.inAt(x, z) > -4 && Math.abs(x) < 40) x += side;
      x += side * r.range(0, 3);
      if (r.chance(0.35)) continue;
      rims[side < 0 ? 0 : 1].push({ x, y: k.topAt(x, z), z, yaw: -side * Math.PI / 2 + r.range(-0.3, 0.3), ph: r.range(0, 6.28) });
    }

    // ---- 關前: braziers along the gate apron, siege wrecks (a burnt ram, broken ladders), the coalition's dead
    for (const [x, z] of [[-7.5, WALL_Z - 5], [7.5, WALL_Z - 5], [-24, WALL_Z - 8], [24, WALL_Z - 8], [-14, 100], [14, 100]]) k.lamp(x, z, 0.8);
    { const x = -14, z = 120, L = k.local(x, k.ground(x, z), z, 0.35);          // burnt battering ram on its wheels
      L(0, 1.3, 0, [2.4, 0.2, 5.5], 0x241610, [0.1, 0, 0.12]); L(0, 2.2, 0.5, [0.7, 0.7, 6.4], 0x2e1c12, [0.05, 0, 0]);
      for (const sx of [-1, 1]) for (const lz of [-1.8, 1.8]) L(sx * 1.3, 0.6, lz, [0.2, 1.2, 1.2], 0x1c120c, [0.4, 0, 0]);
      for (const sx of [-1, 1]) L(sx * 1.1, 2.6, 0, [0.16, 2.4, 0.16], 0x241610, [0, 0, sx * 0.25]);
      k.burn(x + 0.6, z + 1, 0.9); }
    for (const [x, z, yaw] of [[10, 118, 1.2], [26, 96, 2.4], [-26, 108, 0.5]]) k.cart(x, z, yaw, true);
    for (const lx of [-40, -24, 22, 38]) {                                       // scaling ladders against the wall
      const lean = 0.28, len = WALL_H / Math.cos(lean) + 0.4, zc = WALL_Z - 0.4 - Math.sin(lean) * len / 2, yc = FORE_H + Math.cos(lean) * len / 2 - 0.3;
      for (const sx of [-0.45, 0.45]) poles.push({ s: [0.14, len, 0.14], p: [lx + sx, yc, zc], r: [-lean, 0, 0], c: 0x4a3222 });
      for (let q = 0.6; q < len - 0.3; q += 0.55) poles.push({ s: [0.9, 0.08, 0.08], p: [lx, FORE_H - 0.3 + Math.cos(lean) * q, WALL_Z - 0.4 - Math.sin(lean) * q], c: 0x3a2618 });
    }
    for (const [x, z] of [[-30, 80], [30, 82], [-30, 128], [30, 128]]) k.standard(x, z, 1.1, mats.foe, 8.5, [0, 106]);

    // ---- the field: wrecks, arrows, the fallen's gear, torches up the gorge
    k.wrecks();
    k.arrows([-50, -120, 50, 132]);
    k.debris([-50, -124, 50, 132]);
    k.torchPosts(-30, 70);

    // ---- reserve armies off the walkable ground: the coalition behind its camp and on the plain's flanks, 董卓軍 on the
    // heights over the gorge mouth and behind the pass
    for (const [x, z, f] of [[-34, -192, 0], [0, -194, 0], [34, -192, 0], [-66, -150, 0.9], [66, -146, -0.9], [-70, -104, 1.2], [70, -98, -1.2]]) k.formation('ally', x, z, f, r.int(10, 16), r.int(5, 8));
    for (const [x, z, f] of [[-60, -30, Math.PI - 0.8], [62, -26, Math.PI + 0.8], [-44, 98, Math.PI / 2 + 0.6], [46, 104, -Math.PI / 2 - 0.6], [-30, 186, Math.PI], [28, 188, Math.PI]]) k.formation('foe', x, z, f, r.int(9, 13), r.int(4, 6));
    k.aftermath({ fallen: [[-40, 40, -110, -50, 18], [-12, 12, -10, 70, 10], [-30, 30, 80, 130, 20]],
      standards: [5, -44, -110, 44, 128], dust: { n: 30, area: [-54, -120, 54, 60], wall: [6, -30, 30, WALL_Z] } });
    k.farFires([[-80, -60], [84, -20], [-90, 60], [88, 140], [-76, 200]], 2.6);

    // ---- 董 on the pass: flags along the wall walk (the gatehouse itself: build)
    for (let x = -60; x <= 60; x += 9) if (Math.abs(x) > 21) k.flag(x + r.range(-1.5, 1.5), FORE_H + WALL_H + 0.3, WALL_Z + WALL_H * 0.07 + 1.2, 3.2, r.chance(0.5) ? mats.foe : mats.pennant);
  },

  // 虎牢關: the gatehouse. Rammed earth (夯土) laid in 0.45 m lifts with a batter, timber lacing every sixth lift and rows
  // of putlog holes, a brick parapet with crenels; two 闕 towers stand forward of the wall either side of the passage,
  // each crowned with a pavilion; the three-storey gate tower spans the passage between them. The doors (gate 'hulao')
  // swing inward when the story opens it; 董卓's yellow parasol (華蓋) stands on the wall walk.
  build(root, k) {
    const r = makeRng(190), b = [], y0 = FORE_H - 2, top = FORE_H + WALL_H;
    const EARTH = [0xbc9a6c, 0xc6a676, 0xb08e62, 0xa88658], LACE = 0x5a3e2a, HOLE = 0x2e2018, BRICK = 0x8c7058;
    // one face of rammed earth: along u (x or z) a0 … a1, heights ya … yb; the face at coordinate f with outward normal
    // sign s on axis ax ('z' | 'x'), receding `bat` m per m of height; each lift is 1.4 m deep so it always meets the core
    const face = (ax, a0, a1, ya, yb, f, s, bat = 0.07, hole = () => false) => {
      for (let y = ya, row = 0; y < yb - 0.05; y += 0.45, row++) {
        const h = Math.min(0.45, yb - y), d = f - s * ((y - ya) * bat + 0.7), lace = row % 6 === 5, band = Math.floor(row / 3) % 2;
        for (let a = a0; a < a1 - 0.05;) {
          const w = Math.min(r.range(2.2, 6.5), a1 - a), c = a + w / 2;
          if (!hole(c, y + h / 2)) {
            const col = lace ? shade(LACE, r.range(0.85, 1.15)) : shade(EARTH[r.int(0, 3)], r.range(0.9, 1.06) * (band ? 0.95 : 1) * (1 - 0.1 * Math.max(0, 1 - (y - ya) / 3)));
            const dz = d - s * r.range(-0.03, 0.03) + (lace ? s * 0.05 : 0);
            b.push(ax === 'z' ? { s: [w, h - 0.02, 1.4], p: [c, y + h / 2, dz], c: col } : { s: [1.4, h - 0.02, w], p: [dz, y + h / 2, c], c: col });
          }
          a += w;
        }
        if (row % 3 === 1 && y > ya + 1) for (let a = a0 + r.range(0.5, 2); a < a1 - 0.4; a += r.range(1.8, 3.2)) {   // putlog holes
          if (hole(a, y)) continue;
          const dd = f - s * ((y - ya) * bat) + s * 0.01;
          b.push(ax === 'z' ? { s: [0.22, 0.2, 0.06], p: [a, y + 0.2, dd], c: HOLE } : { s: [0.06, 0.2, 0.22], p: [dd, y + 0.2, a], c: HOLE });
        }
      }
    };
    const crenels = (ax, a0, a1, y, f, s) => {                                   // brick parapet course + merlons
      b.push(ax === 'z' ? { s: [a1 - a0, 0.7, 0.7], p: [(a0 + a1) / 2, y + 0.35, f - s * 0.35], c: BRICK } : { s: [0.7, 0.7, a1 - a0], p: [f - s * 0.35, y + 0.35, (a0 + a1) / 2], c: BRICK });
      for (let a = a0 + 0.2; a + 1.1 <= a1; a += 2) {
        const c = shade(BRICK, r.range(0.85, 1.08));
        b.push(ax === 'z' ? { s: [1.15, 1.2, 0.7], p: [a + 0.575, y + 1.3, f - s * 0.35], c } : { s: [0.7, 1.2, 1.15], p: [f - s * 0.35, y + 1.3, a + 0.575], c });
      }
    };
    const gx = GATE_W / 2, bat = 0.07, topIn = WALL_H * bat;                    // the face recedes topIn m over the wall
    // ---- curtain wall either side of the passage (x gx … 76), core + face + parapet + wall walk
    for (const sx of [-1, 1]) {
      const a0 = sx < 0 ? -76 : gx, a1 = sx < 0 ? -gx : 76;
      b.push({ s: [a1 - a0, top - y0, WALL_T - 1], p: [(a0 + a1) / 2, (top + y0) / 2, WALL_Z + 1 + (WALL_T - 1) / 2], c: 0x9c7c56 });
      face('z', a0, a1, y0, top, WALL_Z, -1, bat);
      b.push({ s: [a1 - a0, 0.3, WALL_T - topIn], p: [(a0 + a1) / 2, top + 0.15, WALL_Z + topIn + (WALL_T - topIn) / 2], c: 0x8a7258 });   // wall walk
      crenels('z', a0, a1, top + 0.3, WALL_Z + topIn, -1);
      b.push({ s: [a1 - a0, 1.0, 0.5], p: [(a0 + a1) / 2, top + 0.8, WALL_Z + WALL_T - 0.25], c: BRICK });   // rear parapet
      face('x', WALL_Z + 0.5, WALL_Z + WALL_T, y0, top, sx < 0 ? -gx : gx, -sx, 0);   // the passage's side walls
    }
    // ---- horse-face bastions (馬面) at ±30
    for (const bx of [-30, 30]) {
      b.push({ s: [5, top - y0, 3], p: [bx, (top + y0) / 2, WALL_Z - 1.5 + 0.8], c: 0x9c7c56 });
      face('z', bx - 2.6, bx + 2.6, y0, top, WALL_Z - 3, -1, 0.05);
      for (const s of [-1, 1]) face('x', WALL_Z - 3, WALL_Z, y0, top, bx + s * 2.6, s, 0.05);
      crenels('z', bx - 2.6, bx + 2.6, top + 0.3, WALL_Z - 3 + 0.65, -1);
    }
    // ---- the two 闕: earth towers forward of the wall, a timber gallery and a pavilion on each
    const tz0 = WALL_Z - 6.4, tz1 = tz0 + TOWER_D, TH = FORE_H + TOWER_H, tbat = 0.045, tin = TOWER_H * tbat;
    for (const sx of [-1, 1]) {
      const cx = sx * TOWER_X, x0 = cx - TOWER_W / 2, x1 = cx + TOWER_W / 2;
      b.push({ s: [TOWER_W - 2, TH - y0, TOWER_D - 1.5], p: [cx, (TH + y0) / 2, tz0 + 0.8 + (TOWER_D - 1.5) / 2], c: 0x9c7c56 });
      face('z', x0, x1, y0, TH, tz0, -1, tbat);
      face('x', tz0, tz1, y0, TH, x0, -1, tbat);
      face('x', tz0, tz1, y0, TH, x1, 1, tbat);
      // (the inner faces x0 / x1 toward the passage double as the gate tower's jambs above the wall line)
      const px0 = x0 + tin, px1 = x1 - tin, pz0 = tz0 + tin;
      b.push({ s: [px1 - px0, 0.4, tz1 - pz0], p: [cx, TH + 0.2, (pz0 + tz1) / 2], c: 0x6a5240 });
      // projecting timber gallery (平坐): beams out over the face, a railed deck
      for (let x = px0 + 0.4; x < px1; x += 1.6) b.push({ s: [0.3, 0.3, 1.8], p: [x, TH - 0.2, pz0 - 0.4], c: 0x3a2618 });
      b.push({ s: [px1 - px0 + 1.6, 0.25, 1.4], p: [cx, TH + 0.1, pz0 - 0.5], c: 0x4a2f22 });
      b.push({ s: [px1 - px0 + 1.6, 0.14, 0.14], p: [cx, TH + 1.2, pz0 - 1.15], c: 0x7c2b1d });
      for (let x = px0 - 0.7; x <= px1 + 0.75; x += 1.1) b.push({ s: [0.14, 1.1, 0.14], p: [x, TH + 0.7, pz0 - 1.15], c: 0x6a2418 });
      pagoda(b, cx, TH + 0.4, (pz0 + tz1) / 2 + 0.6, 8.2, 7.6, 2, 0.95);
    }
    // ---- the gate: timber-framed flat passage (Han gates are post-and-lintel) through the wall, earth above it, the
    // lintel and the name board, the three-storey gate tower on the wall walk between the 闕
    const gTop = FORE_H + GATE_H + 1.2, fAt = (y) => WALL_Z + (y - y0) * bat;   // the curtain face at height y
    b.push({ s: [GATE_W + 0.2, top - gTop, WALL_T - 1], p: [0, (top + gTop) / 2, WALL_Z + 1 + (WALL_T - 1) / 2], c: 0x9c7c56 });
    face('z', -gx, gx, gTop, top, fAt(gTop), -1, bat);
    b.push({ s: [GATE_W + 0.4, 1.2, WALL_T], p: [0, FORE_H + GATE_H + 0.6, WALL_Z + WALL_T / 2 + 0.3], c: 0x3a2618 });   // ceiling planks
    for (let z = WALL_Z + 0.9; z < WALL_Z + WALL_T; z += 2.2) {
      b.push({ s: [GATE_W + 0.6, 0.4, 0.4], p: [0, FORE_H + GATE_H - 0.15, z], c: 0x2a1a10 });
      for (const sx of [-1, 1]) b.push({ s: [0.4, GATE_H, 0.4], p: [sx * (gx - 0.1), FORE_H + GATE_H / 2, z], c: 0x3a2618 });
    }
    b.push({ s: [GATE_W + 2.4, 0.9, 0.9], p: [0, FORE_H + GATE_H + 0.5, fAt(FORE_H + GATE_H) - 0.3], c: 0x4a2f22 });   // lintel
    for (const sx of [-1, 1]) b.push({ s: [0.7, GATE_H + 0.2, 0.7], p: [sx * (gx + 0.25), FORE_H + GATE_H / 2, fAt(FORE_H) - 0.2], c: 0x4a2f22 });   // jamb posts
    const tIn = TOWER_X - TOWER_W / 2;                                            // the towers' inner faces
    b.push({ s: [tIn * 2 - 0.4, 0.5, WALL_T - topIn], p: [0, top + 0.25, WALL_Z + topIn + (WALL_T - topIn) / 2], c: 0x6a5240 });
    pagoda(b, 0, top + 0.5, WALL_Z + topIn + 4.4, 12.4, 8, 3, 1.02);
    // ---- 董卓's parasol (華蓋) on the wall walk left of the gate tower: a tiered yellow canopy, purple fringe, tassels
    { const x = -24, z = WALL_Z + 4, y = top + 0.3, P = 7;
      b.push({ s: [0.28, P, 0.28], p: [x, y + P / 2, z], c: 0x5a2a14 });
      for (const [w, dy, c] of [[4.6, 0, 0x5a2a7a], [4.2, 0.25, 0xd0a838], [3.2, 0.55, 0xc49a30], [2.0, 0.85, 0xb88a28], [0.5, 1.2, 0xe0c060]]) for (const a of [0, Math.PI / 4]) b.push({ s: [w, 0.3, w], p: [x, y + P + dy, z], r: [0, a, 0], c });
      for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4 + 0.2; b.push({ s: [0.14, 1.3, 0.14], p: [x + Math.sin(a) * 2.2, y + P - 0.7, z + Math.cos(a) * 2.2], c: q % 2 ? 0x8a2a1c : 0xd0a838 }); }
      // his guard of honour under it: two halberdiers' poles with pennants
      for (const sx of [-1.6, 1.6]) k.flag(x + sx, y, z - 1.8, 3.6, k.mats.foe); }
    // great 董 drapes down the towers' faces
    const dong = k.banner('董', { bg: '#2e1440', fg: '#e8c878', border: '#c8a050', w: 160, h: 320, seed: 27 });
    for (const sx of [-1, 1]) k.cloth(dong, 4.2, 9, 'drape', sx * TOWER_X + 2.1, TH - 1.6, tz0 - 0.3, Math.PI);
    const earth = new THREE.Mesh(boxesGeometry(b), voxelGrain(lit(), 0.25, 0.16));
    earth.castShadow = true; earth.receiveShadow = true; earth.name = 'hulao-gatehouse';
    root.add(earth);
    // garrison: spearmen along the wall walk, on the tower galleries and the bastions (instanced by the kit, facing -Z)
    const guard = [];
    for (let x = -64; x < 64; x += r.range(1.8, 3.8)) if (Math.abs(x) > 19.5) guard.push({ x, y: top + 0.3, z: WALL_Z + topIn + r.range(0.9, 1.8), yaw: Math.PI + r.range(-0.3, 0.3), ph: r.range(0, 6.28) });
    for (const sx of [-1, 1]) for (let q = 0; q < 4; q++) guard.push({ x: sx * TOWER_X + r.range(-3.5, 3.5), y: TH + 0.25, z: tz0 + tin - 0.6, yaw: Math.PI + r.range(-0.3, 0.3), ph: r.range(0, 6.28) });
    k.troops('foe', guard);
    // the name board over the gate: 虎牢關 in gold on black lacquer
    { const c = document.createElement('canvas'); c.width = 512; c.height = 176;
      const g = c.getContext('2d');
      g.fillStyle = '#1a1210'; g.fillRect(0, 0, 512, 176); g.strokeStyle = '#b08a40'; g.lineWidth = 14; g.strokeRect(10, 10, 492, 156);
      g.fillStyle = '#e0bc68'; g.font = 'bold 118px "Kaiti SC","STKaiti","KaiTi","Songti SC",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('虎牢關', 256, 94);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.8), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.15, roughness: 0.7 }));
      m.position.set(0, FORE_H + GATE_H + 2.6, fAt(FORE_H + GATE_H + 2.6) - 0.12); m.rotation.y = Math.PI;
      root.add(m); }
    // the doors: two studded leaves hinged at the passage sides, swung inward flat against the passage when open
    const doors = [-1, 1].map((sx) => {
      const lb = [], w = gx - 0.2, h = GATE_H - 0.2, cxl = -sx * w / 2;
      lb.push({ s: [w, h, 0.3], p: [cxl, h / 2, 0], c: 0x4b2a1a });
      for (let y = 1.0; y < h - 0.3; y += 1.5) lb.push({ s: [w - 0.1, 0.22, 0.1], p: [cxl, y, -0.2], c: 0x2b2522 });
      for (let q = 0; q < 4; q++) lb.push({ s: [0.14, h - 0.2, 0.06], p: [-sx * (0.4 + q * (w - 0.8) / 3), h / 2, -0.18], c: 0x3a2014 });
      for (let y = 0.6; y < h - 0.4; y += 0.7) for (let q = 0; q < 4; q++) lb.push({ s: [0.13, 0.13, 0.08], p: [-sx * (0.5 + q * (w - 1.0) / 3), y, -0.2], c: 0xb89048 });   // gilt studs
      lb.push({ s: [0.5, 0.5, 0.12], p: [-sx * (w - 0.6), h * 0.48, -0.24], c: 0xc8a048 });   // ring plate
      const m = new THREE.Mesh(boxesGeometry(lb), lit());
      m.position.set(sx * (gx - 0.15), FORE_H, WALL_Z + 0.6); m.castShadow = true; m.receiveShadow = true;
      root.add(m);
      return m;
    });
    let open = 0;
    return {
      update(dt) {
        open += ((GATES.hulao?.open ? 1 : 0) - open) * Math.min(1, dt * 1.6);   // heavy leaves: ≈ 2 s to swing
        const e = open * (2 - open);
        doors[0].rotation.y = -e * Math.PI * 0.48; doors[1].rotation.y = e * Math.PI * 0.48;
      },
    };
  },
};
