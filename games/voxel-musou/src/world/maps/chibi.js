// 赤壁 (Red Cliffs, winter 208 AD) laid out along +Z, ≈ 380 m from 七星壇 to the mouth of 華容道: a night battle
// between two walls — the 赤壁 red cliffs rise on the -X side, the Yangtze runs the whole length of the +X side, a
// 150 m band of black water with 曹操's chained fleet moored along our shore. Format: ./index.js.
//   七星壇    南屏山 altar mesa    z -188 … -144  h 7    Kongming's three-tier altar (28 mansion flags, 北斗 lamps); start
//   (ramp)    down the NE flank     z -150 … -128  h 7→0
//   江岸      the beach landing     z -130 …  -52  h 0    reeds, the allies' landing boats, 吳 / 劉 banners (free arena)
//   (neck)    赤壁 buttress         z  -58 …  -30  h 0    the cliff juts out (the carved 赤壁), the lane narrows to the
//                                                          water camp's palisade and barricade gate 'shuizhai' (z -42)
//   曹軍水寨  Cao's water camp      z  -34 …   58  h 0    tents, piers into the river; the 連環船 moored beyond them
//   烏林      the woods camp        z   56 …  148  h 0→4  a clearing ringed by dark woods, 曹操's command tent
//   華容道    the road north        z  140 …  200  h 3→5  a narrow muddy track into the woods (張遼 at its mouth)
// Night (the sky / light / post below): a low moon over the river to the NE lays a silver path on the water; everything
// warm comes from fire. build() owns the set pieces the story drives (story:set): 'wind' swings the wind from the winter
// north-wester round to the south-easterly (every flag turns, smoke and flames lean the other way), 'ignite' sends 黃蓋's
// fire boats across the river into the fleet and the fire runs down the chained lines ship by ship (sails burn away,
// hulls char, the river glows red), 'forest' sets 烏林's woods alight. Firelight uses the world's light sites only: the
// fleet / forest sites stay parked far off until their fire is lit. A new battle (frame back to 0) resets the set; free
// mode stands in the burning night from the start.
import * as THREE from 'three';
import { NOISE_GLSL } from '../sky.js';
import { WIND } from '../dressing.js';
import { boxesGeometry, shade } from '../../core/voxel.js';
import { makeRng } from '../../core/rng.js';

const HW = 74;                                                                   // the Yangtze's deep half width
const RIVER = (z) => 120 + 5 * Math.sin(z * 0.013 + 0.4) + z * 0.012;           // its centre line x(z)
const shore = (z) => RIVER(z) - HW;                                              // deep-water edge on our side (x ≈ 41-49)
const WY = -0.2;                                                                 // water surface
const ALTAR = [-6, -160], ALTAR_H = 7;                                           // altar centre, its mesa height
const GATE = [22, -42], TENT = [-12, 130];
const WINTER = [0.6, -0.8], EAST = [-0.46, 0.89];                               // wind toward: SE (north-wester) → NW (東南風)
const boat = (z) => [shore(z) - 1.5, z];                                        // a landing boat's centre on the bank

export default {
  id: 'chibi',
  name: { zh: '赤壁', en: 'Red Cliffs' },
  grid: [-130, -228, 214, 230],
  pieces: [
    { id: 'altar', ell: [-6, -166, 30, 22], h: ALTAR_H, edge: 2, drop: 0 },                      // a mesa: rim, then the fall-away
    { id: 'ramp', path: [[13, -150, 5.5, ALTAR_H], [21, -139, 5.5, 3.6], [26, -128, 6, 0]], rise: 1.5, drop: 0 },
    { id: 'beach', rect: [-44, -130, 76, -52], h: 0, edge: 2, rise: 24, drop: -127 },           // the red cliffs on the west
    { id: 'neck', rect: [4, -58, 76, -30], h: 0, edge: 1.5, rise: 26 },
    { id: 'camp', rect: [-24, -34, 76, 58], h: 0, edge: 2, rise: 12 },
    { id: 'wulin', rect: [-44, 56, 34, 148], h: (x, z) => Math.max(0, (z - 58) / 24), edge: 3, rise: 5 },   // low wooded banks
    { id: 'huarong', path: [[-14, 140, 12, 3.4], [-24, 160, 8, 4.2], [-34, 180, 6, 4.8], [-44, 200, 5, 5.4]], edge: 1, rise: 14 },
  ],
  // the water camp's palisade either side of its gate (on to the water)
  carve: [[2, -43, 14, -41], [30, -43, 60, -41]],
  // the altar (base tier + its two stairs), the water camp's pavilion platform, 曹操's command platform, the three
  // landing boats drawn up on the beach
  props: [[-15, -169, 3, -151], [-44, -53, 5, -44], [-8.6, -171.6, -3.4, -148.4], [-10.5, 25.5, 2.5, 34.5], [-20.5, 124.5, -3.5, 135.5],
    ...[-112, -96, -80].map((z) => [boat(z)[0] - 5.5, z - 1.8, boat(z)[0] + 4, z + 1.8])],
  zones: [
    { id: 'nanping', name: { zh: '七星壇', en: 'Altar of the Seven Stars' }, x: -6, z: -166, r: 28 },
    { id: 'beach', name: { zh: '江岸', en: 'Riverbank Landing' }, x: 12, z: -91, w: 100, d: 78 },
    { id: 'shuizhai', name: { zh: '曹軍水寨', en: 'Cao Water Camp' }, x: 20, z: 8, w: 92, d: 100 },
    { id: 'wulin', name: { zh: '烏林', en: 'Wulin' }, x: -6, z: 102, w: 80, d: 88 },
    { id: 'huarong', name: { zh: '華容道', en: 'Huarong Road' }, x: -30, z: 174, w: 44, d: 52 },
  ],
  route: [[4, -182], [13, -166], [13, -150], [21, -139], [26, -128], [24, -104], [20, -76], [22, -54], [22, -42], [18, -14],
    [10, 22], [2, 58], [-6, 92], [-10, 116], [-14, 140], [-24, 160], [-34, 180], [-44, 200]],
  gates: {
    shuizhai: { rect: [13, -43.5, 31, -40.5], name: { zh: '水寨門', en: 'Water Camp Gate' }, kind: 'barricade', at: [22, -42, 0, 8] },
  },
  anchors: { altar: ALTAR, gate: GATE, boat: boat(-96), tent: TENT, mouth: [-24, 160], road: [-44, 200] },
  // story: on the mesa south of the altar, looking up the river past it; free: the beach
  spawn: { story: { x: 0, z: -181, yaw: 0, tilt: -0.06 }, free: { x: 8, z: -90, yaw: 0 } },
  water: { along: 'z', c: RIVER, hw: HW, bed: [2.4, 0.45], stones: 0, y: WY, tint: { deep: 0x03070e, shallow: 0x0c1824, sun: [0.3, 0.36, 0.52] } },
  // the moon low over the river (NE): a cool silver lobe and path on the water; ink-blue night overhead, the horizon
  // away from the moon faintly red with distant fires
  sky: {
    sunElev: 0.075, sunAz: 0.5, sunCore: [2.1, 2.3, 2.7],
    haze: 0x161c2c, hazeWarm: 0x42506e, glow: 0x8a9cc8, skyMid: 0x121a2e, skyTop: 0x04060d,
    hznSun: 0x44527a, hznAway: 0x3a1c18, cloudRose: 0x221e2a, cloudShade: 0x0a0c14, cloudLit: 0x7c8cb0,
    dust: [14, 60, 1.2, 0.05], dustLit: 0x3a4666, dustShade: 0x241818, apCool: 0x34446e,
  },
  fog: [24, 210],
  light: { hemi: [0x4e5f8e, 0x2a1e20, 1.85], sun: [0x93aee6, 2.1], rim: [0xa8bcf0, 1.1], dir: [-0.5, 0.75, -0.4], fire: 0xff7a30 },
  post: { exposure: 1.6, sat: 1.12, shadowTint: [0.7, 0.86, 1.35], highTint: [1.2, 0.96, 0.72], rays: 0.2, rayTint: [0.6, 0.7, 1.0],
    bloom: 0.9, bloomThreshold: 1.25, hazeCool: [0.05, 0.07, 0.13], hazeWarm: [0.2, 0.12, 0.08], sunGlow: [0.5, 0.6, 0.85] },
  castle: null,
  terrain: {
    pave: (x, z) => (Math.hypot(x - ALTAR[0], z - ALTAR[1]) < 17 ? 0.9 : 0)                    // the altar's stone court
      + (z < -52 || z > 56 ? -3 : 0),                                                             // beach, woods: dirt tracks
    bare: (x, z) => (z > -44 && z < 58) || (z > 112 && z < 146 && x > -30 && x < 6),            // the camps: beaten earth
    rock: (h, x, z) => h - (z < -128 ? ALTAR_H : Math.max(0, (z - 58) / 24)),
    scorch: { n: 14, area: [-30, -120, 40, 140], spots: [[22, -46, 1.1], [18, -38, 0.9], [-12, 122, 0.8]] },
    rubble: [-40, -128, 44, 146],
    pines: [60, 230],
    mountains: { peakA: -0.55, peak: 26 },
    cliff: { rock: 0xb0452a, dark: 0x6e2416, top: 0x7a4a34, moss: 0x3a4230, grassy: 0x4a4a30 },   // 赤壁: red sandstone strata
  },
  fires: [[-22, -104, 1.1], [33, -70, 1.0]],                                                     // the raiders' burning skiffs
  // firelight: the altar's stair braziers, beach bonfires, the gate braziers, the camp pavilion, 曹操's tent, the road
  lightSites: [[-10.5, 2, -148, 34, 12], [-1.5, 2, -148, 34, 12], [-10.5, 2, -172, 30, 11], [-1.5, 2, -172, 30, 11],
    [-16, 2, -96, 36, 13], [10, 2, -70, 34, 12], [13, 2, -46, 36, 12], [31, 2, -46, 36, 12], [-4, 2, 22, 32, 12],
    [16, 2, 6, 28, 11], [-18, 2, 122, 34, 12], [-6, 2, 122, 34, 12], [-19, 2, 152, 30, 11]],
  hq: TENT,
  minimap: { walls: [] },

  dress(k) {
    const { r, mats, props, poles, shade } = k;
    WIND.set(WINTER[0], 0, WINTER[1]);                          // the winter north-wester: flags stream south-east
    const ban = (g, bg, fg, border, seed, w = 128, h = 256) => k.banner(g, { bg, fg, border, w, h, seed });
    const wu = ban('吳', '#8a2a1c', '#f2dcb0', '#3a120c', 21), zhou = ban('周', '#7a2418', '#f0d8a8', '#2c0e0a', 22);
    const huang = ban('黃', '#a0781c', '#2a1408', '#4a2a0c', 23), shuai = ban('帥', '#1c2a58', '#f2e6c8', '#b8963c', 24, 160, 320);
    const bigCao = ban('曹', '#16264e', '#f2e6c8', '#c8a040', 25, 160, 320), mao = ban('毛', '#22418a', '#f2e6c8', '#0e1a3a', 26);
    const yu = ban('于', '#22418a', '#f2e6c8', '#0e1a3a', 27);

    // ---- 南屏山 七星壇: three rammed-earth tiers faced with stone, a stair north and south; 28 mansion flags on the
    // base tier (east 青, north 皂, west 白, south 紅, each with its mansion's name), yellow pennants on the middle one,
    // the 北斗 lamps and the incense tripod on top (Kongming and his four attendants: build())
    {
      const [ax, az] = ALTAR, gy = k.ground(ax, az), T = [[18, 1.0], [12.6, 1.0], [8, 1.0]];
      let y = gy;
      T.forEach(([w, h], t) => {
        props.push({ s: [w, h, w], p: [ax, y + h / 2, az], c: shade(0x7a5e40, 1 - t * 0.04) });              // rammed earth
        props.push({ s: [w + 0.3, 0.22, w + 0.3], p: [ax, y + h - 0.02, az], c: 0x6c645c });                   // stone coping
        for (const [dx, dz, sx, sz] of [[0, -w / 2, w, 0.2], [0, w / 2, w, 0.2], [-w / 2, 0, 0.2, w], [w / 2, 0, 0.2, w]])
          props.push({ s: [sx + 0.1, h * 0.8, sz + 0.1], p: [ax + dx, y + h * 0.4, az + dz], c: 0x5a4e46 });      // stone facing band
        y += h;
      });
      for (const sd of [-1, 1]) for (let q = 0; q < 6; q++) {                                                  // stairs N + S
        const top = 0.5 * (q + 1), d = 3 - q * 0.5;
        props.push({ s: [4.6, top, d], p: [ax, gy + top / 2, az + sd * (9 + d / 2 - 0.02)], c: shade(0x6a6058, 1 + q * 0.03) });
      }
      const mansions = [
        ['角亢氐房心尾箕', '#2e6a58', '#f0e6c0', [1, 0]], ['斗牛女虛危室壁', '#1a1a20', '#e8e0d0', [0, 1]],
        ['奎婁胃昴畢觜參', '#d8d2c4', '#1a1410', [-1, 0]], ['井鬼柳星張翼軫', '#9a2a1c', '#f0d070', [0, -1]],
      ];
      mansions.forEach(([names, bg, fg, [nx, nz]], side) => {
        [...names].forEach((g, i) => {
          const o = -6.6 + i * 2.2, x = ax + nx * 8.3 + (nz ? o : 0), z = az + nz * 8.3 + (nx ? o : 0);
          if (nz && Math.abs(o) < 1) return;                                                                   // the stairs
          poles.push({ s: [0.1, 3.6, 0.1], p: [x, gy + 1 + 1.8, z], c: 0x2a1a10 }, { s: [0.14, 0.2, 0.14], p: [x, gy + 4.7, z], c: 0xb8963c });
          k.cloth(k.banner(g, { bg, fg, border: '', w: 64, h: 96, tatter: false, seed: 40 + side * 7 + i }), 1.3, 1.9, 'flag', x, gy + 4.55, z, Math.atan2(-WIND.z, WIND.x));
        });
      });
      const yellow = k.banner('', { bg: '#c8a038', fg: '#000', border: '#7a5a1c', w: 32, h: 64, tatter: false, seed: 60 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 12, x = ax + Math.sin(a) * 5.9, z = az + Math.cos(a) * 5.9;
        if (Math.abs(Math.sin(a) * 5.9) < 1.5) continue;
        poles.push({ s: [0.08, 2.4, 0.08], p: [x, gy + 2 + 1.2, z], c: 0x2a1a10 });
        k.cloth(yellow, 0.7, 1.1, 'flag', x, gy + 4.3, z, Math.atan2(-WIND.z, WIND.x));
      }
      // 北斗七星 lamps on the top tier: bronze stands, a small flame each, the dipper's shape
      const top = gy + 3;
      for (const [dx, dz] of [[-2.6, 1.7], [-1.4, 1.9], [-0.4, 1.3], [0.5, 0.6], [0.6, -0.6], [1.9, -0.8], [2.1, 0.5]]) {
        props.push({ s: [0.12, 0.7, 0.12], p: [ax + dx, top + 0.35, az + dz], c: 0x5a4a30 }, { s: [0.34, 0.12, 0.34], p: [ax + dx, top + 0.72, az + dz], c: 0x8a6a30 });
        k.fire(ax + dx, top + 0.76, az + dz, 0.16, false);
      }
      // incense tripod (鼎) on the south stair head: smoke curls with the wind
      { const L = k.local(ax, top, az - 3, 0);
        L(0, 0.55, 0, [1.0, 0.7, 1.0], 0x4a3a24); L(0, 0.95, 0, [1.2, 0.12, 1.2], 0x6a5430);
        for (const [dx, dz] of [[-0.35, -0.3], [0.35, -0.3], [0, 0.4]]) L(dx, 0.12, dz, [0.14, 0.3, 0.14], 0x3a2e1c);
        for (const dx of [-0.45, 0.45]) L(dx, 1.2, 0, [0.1, 0.35, 0.3], 0x4a3a24); }
      k.fire(ax, top + 1.0, az - 3, 0.22, true);
      for (const [x, z] of [[ax - 4.5, az - 12], [ax + 4.5, az - 12], [ax - 4.5, az + 12], [ax + 4.5, az + 12]]) k.lamp(x, z, 0.7);
      // Shu and Wu standards round the mesa, the altar's guard
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.3, x = -6 + Math.sin(a) * 27, z = -166 + Math.cos(a) * 19.5;
        if (Math.hypot(x - 13, z + 150) < 8 || Math.hypot(x - 0, z + 181) < 7) continue;               // the ramp head, the start
        k.standard(x, z, 1.05, i % 2 ? wu : mats.ally, 8, ALTAR);
      }
    }

    // ---- 江岸: reeds, the allies' landing boats drawn up on the bank, 吳 / 劉 / 周 / 黃 standards, bonfires
    k.reeds();
    for (const z of [-126, -112, -96, -80, -64]) {
      const [x] = boat(z), L = k.local(x, WY, z, Math.PI / 2 + r.range(-0.12, 0.12));   // lz → +x: bow on the sand (−lz)
      L(0, 0.35, 0, [2.6, 0.9, 9.4], 0x3a2a1c); L(0, 0.95, 0.2, [3.1, 0.5, 10], 0x5a3e28); L(0, 1.25, 0.2, [3.3, 0.14, 10.2], 0x7a2a1c);
      L(0, 1.2, -5.2, [2.2, 0.8, 1.4], 0x5a3e28); L(0, 1.7, -5.9, [1.4, 0.6, 0.8], 0x6a4a30);                  // raised prow
      for (let q = -3; q <= 3; q += 1.5) L(0, 1.05, q, [2.9, 0.08, 0.3], 0x2a1c12);                          // thwarts
      for (const sx of [-1, 1]) for (let q = -3; q <= 3; q += 2) L(sx * 1.5, 1.35, q, [0.9, 0.08, 0.14], 0x4a3220, [0, 0, sx * 0.4]);   // oars shipped
      L(0, 3.4, 1.5, [0.16, 4.2, 0.16], 0x2a1a10);
      k.cloth(r.chance(0.5) ? wu : mats.ally, 1.5, 2.2, 'flag', x + 1.5, WY + 5.4, z, Math.atan2(-WIND.z, WIND.x));
    }
    for (const [x, z, m] of [[-30, -120, mats.ally], [-34, -96, wu], [-30, -72, mats.ally], [-18, -60, zhou], [14, -122, wu], [36, -118, mats.ally], [34, -58, huang]])
      k.standard(x, z, 1.1, m, 8.5);
    for (const [x, z] of [[-16, -96], [10, -70], [-6, -118]]) k.lamp(x, z, 0.9);
    for (const [x, z, yaw] of [[-36, -112, 0.3], [-38, -84, -0.2], [-26, -64, 0.6]]) k.supplies(x, z, yaw, r.int(5, 7));
    k.shieldRack(-38, -104, Math.PI / 2); k.shieldRack(-38, -90, Math.PI / 2);

    // ---- the water camp gate: palisade from the cliff foot to the water, the barricade, two gate towers, braziers
    k.palisade([[2.5, -42], [14.5, -42]]); k.palisade([[29.5, -42], [shore(-42) + 6, -42]]);
    k.barricade('shuizhai');
    k.burn(19, -42.4, 1.1, 'shuizhai'); k.burn(25.5, -41.8, 1.0, 'shuizhai');
    k.tower(9, -40, 6.5, 1.4); k.tower(36, -40, 6.5, 1.4);
    k.lamp(13, -46, 0.8); k.lamp(31, -46, 0.8);
    k.standard(6, -46, 1.1, mao, 8, [22, -60]); k.standard(40, -46, 1.1, yu, 8, [22, -60]);

    // ---- 曹軍水寨: a stockade along the shore (gaps where the piers leave), piers on posts out to the fleet, tents under
    // the cliff, the admirals' pavilion, watchtowers, lanterns on poles
    const PIERS = [-28, 0, 28, 52];
    for (let z = -39; z < 56; z += 3) {
      if (PIERS.some((p) => Math.abs(z + 1.5 - p) < 3)) continue;
      k.palisade([[shore(z) - 2.2, z], [shore(z + 3) - 2.2, z + 3]]);
    }
    for (const pz of PIERS) {
      const x0 = shore(pz) - 5, x1 = shore(pz) + 13, dy = 0.9 + WY;
      for (let x = x0; x < x1; x += 0.55) props.push({ s: [0.5, 0.12, 3.4], p: [x, dy, pz], r: [0, 0, r.range(-0.02, 0.02)], c: shade(0x5e4630, r.range(0.75, 1.1)) });
      for (let x = x0 + 1; x < x1; x += 2.6) for (const sd of [-1, 1]) props.push({ s: [0.26, 3.4, 0.26], p: [x, dy - 1.2, pz + sd * 1.8], c: 0x3a2818 });
      for (const sd of [-1, 1]) props.push({ s: [x1 - x0, 0.14, 0.14], p: [(x0 + x1) / 2, dy + 0.9, pz + sd * 1.75], c: 0x3e2a1d });
      poles.push({ s: [0.16, 4.2, 0.16], p: [x1 - 0.6, dy + 2.1, pz + 1.9], c: 0x2a1a10 });
      k.lantern(x1 - 0.6, dy + 3.6, pz + 1.9, 1.0);
      const L = k.local(x1 - 6, WY, pz - 4.2, Math.PI / 2 + r.range(-0.1, 0.1));                           // a skiff tied alongside
      L(0, 0.2, 0, [1.8, 0.6, 6], 0x3a2a1c); L(0, 0.55, 0, [2.1, 0.2, 6.3], 0x5a3e28);
    }
    for (let z = -26; z < 52; z += 8.5) for (const x of [-16, -6]) if (!(z > 20 && z < 38 && x > -12)) k.tent(x + r.range(-1, 1), z + r.range(-1, 1), Math.PI / 2 + r.range(-0.15, 0.15), r.chance(0.5) ? 0x5a6278 : 0x8a8680, 4.6, 5.4);
    { const [px, pz] = [-4, 30], gy = k.ground(px, pz);                                                 // 毛玠 / 于禁's pavilion
      props.push({ s: [13, 0.9, 9], p: [px, gy + 0.45, pz], c: 0x5a4a40 });
      k.pagoda(px, gy + 0.9, pz, 10, 6, 1, 0.9);
      for (const lx of [-3, 0, 3]) k.lantern(px + lx, gy + 4.1, pz - 3.1, 1.0);
      k.lamp(-4, 22, 0.8); k.standard(-11.5, 22.5, 1.1, mao, 8, [10, 22]); k.standard(3.5, 22.5, 1.1, yu, 8, [10, 22]); }
    for (const [x, z, yaw] of [[-20, -4, Math.PI / 2], [-20, 14, Math.PI / 2], [30, 44, -Math.PI / 2], [-10, 50, Math.PI]]) k.supplies(x, z, yaw, r.int(5, 7));
    for (const [x, z, yaw] of [[-19, -18, Math.PI / 2], [-19, 38, Math.PI / 2]]) k.shieldRack(x, z, yaw);
    k.drum(34, 8, -Math.PI / 2); k.lamp(16, 6, 0.7); k.lamp(-10, 46, 0.6);
    k.tower(-19, -32, 7, 1.45); k.tower(38, 16, 7.5, 1.5); k.tower(-18, 54, 7, 1.45);
    for (const [x, z] of [[4, -30], [36, -24], [-8, 6], [34, 30], [8, 52]]) k.standard(x, z, 1.05, mats.foe, 8);

    // ---- 烏林: tents in the clearing, 曹操's command pavilion on its platform with the 帥 and the great 曹 banner
    for (let z = 70; z < 116; z += 9) for (const x of [-34, -24, 16, 26]) k.tent(x + r.range(-1.5, 1.5), z + r.range(-1.5, 1.5), Math.PI / 2 + r.range(-0.2, 0.2), r.chance(0.5) ? 0x5a6278 : 0x8a8680, 4.6, 5.6);
    { const [tx, tz] = TENT, gy = k.ground(tx, tz);
      props.push({ s: [17, 1.1, 11], p: [tx, gy + 0.55, tz], c: 0x4e4038 });
      for (let q = 0; q < 3; q++) props.push({ s: [5.4, 0.36 * (q + 1), 1.2 - q * 0.3], p: [tx, gy + 0.18 * (q + 1), tz - 5.5 - 0.6 + q * 0.3], c: shade(0x5e5048, 1 + q * 0.04) });
      k.pagoda(tx, gy + 1.1, tz + 0.5, 13, 8, 1, 1);
      for (const lx of [-4.4, -1.5, 1.5, 4.4]) k.lantern(tx + lx, gy + 4.9, tz - 3.4, 1.1);
      k.drum(tx - 7, tz - 3.5, -Math.PI / 2 + 0.3, gy + 1.1); k.drum(tx + 7, tz - 3.5, Math.PI / 2 - 0.3, gy + 1.1);
      for (const [x, z] of [[-18, 122], [-6, 122]]) k.lamp(x, z, 0.85);
      k.standard(tx - 9.5, tz - 7, 1.1, shuai, 9, [tx, tz - 20]);
      const x = tx + 11, z = tz + 3, P = 18;                                                               // the great 曹 banner
      poles.push({ s: [0.4, P, 0.4], p: [x, gy + P / 2, z], c: 0x2e1d15 }, { s: [5.6, 0.3, 0.3], p: [x - 2.6, gy + P - 0.5, z], c: 0x2e1d15 }, { s: [0.3, 1.4, 0.3], p: [x, gy + P + 0.7, z], c: 0xc9a040 });
      k.cloth(bigCao, 5, 9.5, 'hang', x - 0.2, gy + P - 0.7, z, Math.PI); }
    for (const [x, z, yaw] of [[-38, 118, Math.PI / 2], [28, 124, -Math.PI / 2], [4, 140, Math.PI]]) k.supplies(x, z, yaw, r.int(5, 7));
    k.commandTable(4, 124, -0.3); k.lamp(8, 120, 0.6);
    for (const [x, z] of [[-38, 64], [28, 66], [-40, 100], [30, 104], [-30, 140], [20, 142]]) k.standard(x, z, 1.05, mats.foe, 8);
    for (const [x, z] of [[-30, 84], [22, 90]]) k.lamp(x, z, 0.7);

    // ---- 華容道: the muddy road into the woods: a cart stuck in the ruts, dropped gear, a torch at the mouth
    k.cart(-30, 170, 2.6); k.cart(-20, 154, 0.4, true); k.lamp(-19, 152, 0.7);
    k.standard(-31, 157, 1.0, mats.foe, 7.5); k.standard(-17, 166, 1.0, mats.pennant, 7);

    // ---- the field: wrecks, torch posts, arrow volleys, the fallen's gear, the aftermath of the landing fight;
    // the allies' camps glowing across the river (樊口 / 夏口)
    k.wrecks();
    k.torchPosts(-132, 150);
    k.arrows([-40, -126, 44, 140], 36);
    k.debris([-40, -126, 44, 146], 110);
    k.aftermath({ fallen: [[-38, 40, -124, -56, 16], [-18, 40, -36, 50, 12]], standards: [6, -38, -120, 40, 50] });
    k.farFires([[RIVER(-160) + HW + 12, -160], [RIVER(-60) + HW + 14, -60], [RIVER(40) + HW + 10, 40], [RIVER(150) + HW + 12, 150]], 2.6);
  },

  build(root, k) {
    return buildSet(root, k);
  },
};

// ---------------------------------------------------------------- set pieces (build)
// burnable voxels: every box carries b = index × 4 + kind (kind 0 wood, 1 cloth / leaves — burn away, 2 iron — glows
// red-hot, 3 never burns); uB[index] (0 … 1) is that ship's / tree group's burn, written by update()
const burnGeometry = (boxes) => {
  const g = boxesGeometry(boxes), a = [];
  for (const b of boxes) for (let n = (6 - (b.skip?.length || 0)) * 4; n--;) a.push(b.b);
  g.setAttribute('aB', new THREE.Float32BufferAttribute(a, 1));
  return g;
};
function burnMaterial(uB, key) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uB = uB; sh.uniforms.uT = BURN_T;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
      attribute float aB; uniform float uB[${uB.value.length}]; varying float vBurn; varying float vKind; varying vec3 vBp;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
      vBurn = uB[int(aB * 0.25)]; vKind = mod(aB, 4.0); vBp = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      uniform float uT; varying float vBurn; varying float vKind; varying vec3 vBp;
      ${NOISE_GLSL}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
      float bn = dwNoise(vBp.xz * 0.35 + vBp.y * 0.3) * 0.65 + dwNoise(vBp.xy * 0.9 + vBp.z * 0.7) * 0.35;
      float cloth = step(0.5, vKind) * step(vKind, 1.5), iron = step(1.5, vKind) * step(vKind, 2.5), wood = step(vKind, 0.5);
      // cloth and leaves burn away in holes that open from the noise, with a glowing rim; wood chars from the edges in
      float hole = vBurn * 1.25 - 0.15;
      if (cloth > 0.5 && bn < hole) discard;
      float charK = (wood + cloth) * smoothstep(0.0, 0.8, vBurn * 1.3 - bn * 0.5);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.05, 0.035, 0.03), charK * 0.92);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float fl = 0.75 + 0.25 * sin(uT * 9.0 + bn * 20.0) * sin(uT * 5.3 + vBp.x);
      float live = vBurn * (1.0 - smoothstep(0.85, 1.0, vBurn) * 0.55);                  // the fire dies down toward the end
      float crack = pow(max(0.0, dwNoise(vBp.xz * 1.3 + vBp.y * 0.9 + uT * 0.25) - 0.55) / 0.45, 3.0) * charK;   // thin glowing seams
      totalEmissiveRadiance += vec3(1.0, 0.32, 0.06) * (wood * (crack * 1.6 + 0.08 * charK) * live + cloth * (1.0 - smoothstep(hole, hole + 0.14, bn)) * 4.0 * step(0.01, vBurn)) * fl;
      totalEmissiveRadiance += vec3(1.0, 0.25, 0.05) * iron * smoothstep(0.3, 0.9, vBurn) * 1.4 * fl;`);
  };
  m.customProgramCacheKey = () => 'chibi-burn|' + key + '|' + uB.value.length;
  return m;
}
const BURN_T = { value: 0 };

/** Soft radial glow (white centre → 0 at the rim) for the additive water / boat glows. */
function glowTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

/** Painted characters on a transparent plane (the cliff carving, the road sign). */
function glyphPlane(text, w, h, colour, font = 0.8, vertical = true) {
  const cv = document.createElement('canvas'); cv.width = vertical ? 256 : 128 * text.length; cv.height = vertical ? 256 * text.length : 256;
  const g = cv.getContext('2d');
  g.fillStyle = colour; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `bold ${Math.round(256 * font)}px "Xingkai SC","STXingkai","Kaiti SC","STKaiti","KaiTi","Songti SC",serif`;
  [...text].forEach((c, i) => g.fillText(c, vertical ? 128 : 64 + i * 128, vertical ? 128 + i * 256 : 128));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, roughness: 0.9, emissive: 0x8a1a0a, emissiveMap: t }));
}

function buildSet(root, k) {
  const r = makeRng(208), sites = k.sites, P = [];               // P: fleet / fire-boat / forest light sites (parked until lit)
  const park = (x, y, z, i, d) => { const s = { x: 9e3, y, z: 9e3, i: 0, d, k: 0, at: [x, z], full: i }; sites.push(s); P.push(s); return s; };

  // ---- 七星壇: Kongming at the top with his hair unbound and a sword raised, the four attendants (feather pole, the
  // 七星號帶 streamer — the wind's telltale —, the sword bearer, the censer bearer)
  const [ax, az] = ALTAR, top = k.ground(ax, az) + 3;
  const figure = (x, z, robe, trim, extra) => {
    const L = k.local(x, top, z, 0), b = [];                                                          // facing south (−Z)
    const B = (lx, ly, lz, s, c, rr) => { L(lx, ly, lz, s, c, rr); b.push(k.props.pop()); };
    B(0, 0.5, 0, [0.62, 1.0, 0.42], robe); B(0, 0.08, 0, [0.72, 0.16, 0.5], trim);                  // robe skirt + hem
    B(0, 1.25, 0, [0.56, 0.62, 0.36], robe); B(0, 1.25, -0.19, [0.14, 0.6, 0.02], trim);             // body, collar band
    for (const sd of [-1, 1]) B(sd * 0.38, 1.22, 0, [0.2, 0.6, 0.26], robe);                          // sleeves
    B(0, 1.72, 0, [0.28, 0.3, 0.28], 0xd8b08a); B(0, 1.9, 0.02, [0.3, 0.1, 0.3], 0x1a1414);          // head, hair
    extra(B);
    return b;
  };
  // Kongming (faces the start, south): white crane cloak with black trim, hair loose down his back, sword raised
  const kongBoxes = figure(ax, az + 0.4, 0xe8e4da, 0x1e1e24, (B) => {
    B(0, 1.45, 0.2, [0.34, 0.9, 0.1], 0x141012);                                                       // hair down the back
    B(0.42, 1.62, -0.1, [0.16, 0.5, 0.16], 0xe8e4da, [0.5, 0, 0]); B(0.42, 2.1, -0.34, [0.06, 1.0, 0.06], 0xc8d0d8, [0.5, 0, 0]);   // the sword
  });
  k.props.push(...figure(ax - 3, az - 2.6, 0x2a3a5a, 0xc8a040, (B) => B(-0.36, 2.2, 0, [0.07, 3.6, 0.07], 0x3a2a18)),   // feather pole
    ...figure(ax + 3, az - 2.6, 0x2a3a5a, 0xc8a040, (B) => B(0.36, 2.2, 0, [0.07, 3.6, 0.07], 0x3a2a18)),                 // streamer pole
    ...figure(ax - 3, az + 2.6, 0x2a3a5a, 0xc8a040, (B) => B(0, 1.25, -0.3, [0.12, 0.12, 0.9], 0x8a8a90)),                // sword bearer
    ...figure(ax + 3, az + 2.6, 0x2a3a5a, 0xc8a040, (B) => B(0, 1.2, -0.32, [0.36, 0.3, 0.36], 0x6a5430)));               // censer
  const figMesh = new THREE.Mesh(boxesGeometry(kongBoxes), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true }));
  figMesh.castShadow = true; figMesh.name = 'kongming';
  root.add(figMesh);
  k.cloth(k.banner('', { bg: '#c8b060', fg: '#000', border: '#6a1a12', w: 64, h: 16, tatter: false, seed: 61 }), 3.4, 0.36, 'flag', ax + 3 + 0.36, top + 4.0, az - 2.6, Math.atan2(-WIND.z, WIND.x));
  { const x = ax - 3 - 0.36, z = az - 2.6; for (let i = 0; i < 5; i++) k.props.push({ s: [0.34, 0.3, 0.1], p: [x, top + 3.95 + i * 0.08, z], r: [0, i * 0.7, 0.3], c: 0xe8e2d0 }); }   // 雞羽 tuft

  // ---- 赤壁: a sheer red-sandstone face on the buttress (its footprint is a map prop: no terrain rock there), the two
  // great characters painted on it facing the beach
  for (let y = 0, q = 0; y < 24; y += 2, q++) for (let x = -40 + r.range(0, 3); x < 2;) {       // strata, broken into blocks
    const w = Math.min(r.range(4, 9), 2 - x), flat = x + w > -25 && x < -13, jz = flat ? r.range(-0.12, 0.12) : r.range(-0.6, 0.5);
    k.props.push({ s: [w + 0.05, 2.02 + r.range(0, 0.3), 9], p: [x + w / 2, y + 1 - 0.8, -48.5 + jz], c: k.shade(q & 1 ? 0xa03c24 : 0x82301c, r.range(0.8, 1.12)) });
    x += w;
  }
  for (const [x, w, h] of [[-42, 6, 15], [3.5, 5, 12], [-37, 5, 26], [-2, 4, 25]]) k.props.push({ s: [w, h, 9], p: [x, h / 2 - 0.8, -48.4], c: k.shade(0x86301c, r.range(0.8, 1.0)) });
  { const cv = glyphPlane('赤壁', 8, 16, '#c8341c');
    cv.position.set(-19, 11.5, -53.25); cv.rotation.y = Math.PI;
    root.add(cv); }
  { const sg = glyphPlane('華容道', 0.9, 2.6, '#1a1008', 0.72);                                        // the road sign
    const x = -18.6, z = 156, gy = k.ground(x, z);
    k.props.push({ s: [0.18, 3.6, 0.18], p: [x, gy + 1.8, z + 0.1], c: 0x3a2818 }, { s: [1.1, 2.9, 0.12], p: [x, gy + 2.2, z + 0.05], c: 0x8a7a5a });
    sg.position.set(x, gy + 2.2, z - 0.03); sg.rotation.y = Math.PI; root.add(sg); }

  // ---- headlands: dark rock masses where the river strip leaves the grid (its ends must never show)
  for (const [z0, z1] of [[-250, -214], [214, 250]]) for (let i = 0; i < 70; i++) {
    const x = r.range(shore(z0) - 6, RIVER(z0) + HW + 8), z = r.range(z0, z1), w = r.range(6, 16), h = r.range(3, 14) * (1 - Math.abs(x - RIVER(z0)) / 140);
    k.props.push({ s: [w, h, w * r.range(0.6, 1.2)], p: [x, h / 2 - 1, z], r: [0, r.range(0, 3), 0], c: k.shade(0x4a2a22, r.range(0.6, 0.95)) });
  }

  // ---- 連環船: three rows of six war junks along our shore, bows downstream (−Z), chained bow to stern and row to row
  const ships = [], box = [];
  const ROWS = 3, PER = 6;
  for (let row = 0; row < ROWS; row++) for (let j = 0; j < PER; j++) {
    const z = -24 + j * 30 + row * 3, x = shore(z) + 17 + row * 21, s = r.range(0.94, 1.06);
    ships.push({ x, z, s, row, j, i: ships.length });
    junk(box, x, z, s, ships.length - 1, r, k);
  }
  const link = (a, b, idx, sag, kind = 2) => {                                                        // an iron chain a → b
    const d = Math.hypot(b[0] - a[0], b[2] - a[2]), n = Math.max(3, Math.round(d / 0.42)), yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
    for (let q = 1; q < n; q++) {
      const u = q / n, y = a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * sag, tilt = Math.atan2((b[1] - a[1]) / d - Math.cos(u * Math.PI) * Math.PI * sag / d, 1);
      box.push({ s: q & 1 ? [0.1, 0.3, 0.5] : [0.3, 0.1, 0.5], p: [a[0] + (b[0] - a[0]) * u, y, a[2] + (b[2] - a[2]) * u], r: [-tilt, yaw, 0], c: 0x2a2a2e, b: idx * 4 + kind });
    }
  };
  for (const A of ships) {
    const B = ships.find((q) => q.row === A.row && q.j === A.j + 1), C = ships.find((q) => q.row === A.row + 1 && q.j === A.j);
    if (B) for (const sd of [-1, 1]) link([A.x + sd * 2.6, WY + 2.7 * A.s, A.z + 12.2 * A.s], [B.x + sd * 2.2, WY + 3.4 * B.s, B.z - 11.6 * B.s], A.i, 0.35);
    if (C) {                                                                                            // 鋪闊板: a plank gangway + chains
      const a = [A.x + 3.7 * A.s, WY + 2.45, A.z + 3.5], c = [C.x - 3.7 * C.s, WY + 2.45, C.z + 3.5], d = c[0] - a[0];
      for (let q = 0; q < 3; q++) box.push({ s: [d, 0.16, 0.6], p: [(a[0] + c[0]) / 2, a[1] + 0.1, a[2] + (c[2] - a[2]) / 2 - 0.7 + q * 0.7], r: [0, 0, 0], c: k.shade(0x5e4630, 0.85 + q * 0.08), b: A.i * 4 });
      for (const o of [-2.4, 2.4]) link([a[0], a[1] + 0.2, a[2] + o], [c[0], c[1] + 0.2, c[2] + o], A.i, 1.4);
    }
  }
  const uShip = { value: new Array(ships.length).fill(0) };
  const fleet = new THREE.Mesh(burnGeometry(box), burnMaterial(uShip, 'fleet'));
  fleet.castShadow = true; fleet.receiveShadow = true; fleet.name = 'fleet';
  root.add(fleet);

  // ---- 黃蓋's fire boats: eight reed-laden skiffs that sail in from across the river with the east wind and ram the
  // fleet's south-east corner; the fire runs on from ship to ship along the chains (≈ 20 m/s)
  const R2 = ships.filter((s) => s.row === 2), R0 = ships.filter((s) => s.row === 0);
  const hits = [...[0, 1, 2, 3].map((j) => [R2[j].x + 6.5, R2[j].z - 4 + (j % 2) * 6]),
    [ships.find((s) => s.row === 1 && !s.j).x, ships.find((s) => s.row === 1 && !s.j).z - 17.5], [R2[0].x, R2[0].z - 17.5],
    [R2[4].x + 6.5, R2[4].z - 2], [R0[0].x + 1, R0[0].z - 17.5]];
  const SAIL = 7.5;                                                                                   // s from launch to impact
  const fb = hits.map(([x, z], n) => ({ x, z, x0: x + 78 - n * 3, z0: z - 56 + n * 2, t: SAIL + n * 0.35 }));
  for (const s of ships) s.d = Math.min(...fb.map((b) => b.t + Math.hypot(b.x - s.x, b.z - s.z) / 20));
  const boatBox = [];
  { const L = (lx, ly, lz, s, c, kind = 0) => boatBox.push({ s, p: [lx, ly, lz], c, b: kind });
    L(0, 0.15, 0, [2.6, 0.9, 9], 0x2e2216); L(0, 0.75, 0, [3, 0.4, 9.6], 0x4a3422); L(0, 1.2, -4.9, [2, 0.7, 1.4], 0x4a3422);
    for (let q = 0; q < 9; q++) L(r.range(-0.8, 0.8), 1.35 + (q % 3) * 0.45, -3 + q * 0.8, [1.1, 0.6, 1.4], k.shade(0x8a6a34, r.range(0.8, 1.1)), 1);   // reed bundles
    L(0, 2.6, 2.2, [0.14, 4.2, 0.14], 0x2a1a10); L(0.8, 3.9, 2.2, [1.4, 1.4, 0.06], 0x2e5a4a, 1); }       // 青龍牙旗
  const boatGeo = burnGeometry(boatBox), uBoat = { value: new Array(fb.length).fill(0) }, boatMat = burnMaterial(uBoat, 'boat');
  const glowT = glowTex(), fireMat = new THREE.MeshBasicMaterial({ map: glowT, color: 0xff7a2a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });
  const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.9, 0.25) });
  const boats = fb.map((b, n) => {
    const g = boatGeo.clone(), a = g.attributes.aB.array;
    for (let q = 0; q < a.length; q++) a[q] = n * 4 + a[q];
    const m = new THREE.Mesh(g, boatMat), fl = new THREE.Group();
    for (let q = 0; q < 6; q++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.9), flameMat); f.position.set(r.range(-0.7, 0.7), 1.9, -3 + q * 1.2); fl.add(f); }
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xff6a20, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
    halo.scale.set(16, 12, 1); halo.position.y = 3;
    m.add(fl, halo); m.visible = false; m.rotation.y = Math.atan2(b.x - b.x0, b.z - b.z0);
    root.add(m);
    return { ...b, m, fl, halo };
  });

  // ---- fires on every ship (flame cards: the dressing's fire system, switched on by the burn clock), light sites
  let fleetT = -1e9, windT = -1e9, forestT = -1e9, T = 0;
  const FIRES = [[0, 3.7, -9.6, 1.5, false, 0], [0, 5.0, -0.8, 1.9, true, 0.7], [0, 5.4, 9.4, 1.6, false, 1.3], [0.8, 9.5, -5.5, 1.4, false, 2.0], [-2.2, 2.6, 4.4, 1.1, false, 2.5]];
  for (const s of ships) {
    for (const [lx, ly, lz, sc, smoke, dt] of FIRES) k.fire(s.x + lx * s.s, WY + ly * s.s, s.z + lz * s.s, sc * s.s, smoke, () => fleetT >= s.d + dt);
    if (s.row === 0) s.site = park(s.x - 5, WY + 4.5, s.z, 70, 30);
  }
  for (const b of fb) k.fire(b.x, WY + 1.6, b.z, 1.6, false, () => fleetT >= b.t);
  for (const pz of [-28, 0, 28]) k.fire(shore(pz) + 10, WY + 1.4, pz + r.range(-0.8, 0.8), 1.0, false, () => fleetT >= 16 + pz * 0.05);   // the piers catch
  // the river under the fleet glows with it: one additive pool per ship / boat on the water
  const pools = [...ships.map((s) => [s.x, s.z, 18, 36]), ...fb.map((b) => [b.x, b.z, 14, 16])];
  const pm = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), fireMat, pools.length);
  pm.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(pools.length * 3), 3);
  pm.frustumCulled = false; pm.renderOrder = 1; pm.name = 'fleet-glow';
  root.add(pm);

  // ---- 烏林: dark winter woods ringing the clearing and lining 華容道 (voxel pines and broadleaves); 'forest' burns
  // them in from the river side, groups of trees catching one after another
  const trees = [], tbox = [], FROM = [40, 70];
  for (let z = 48; z < 226; z += 4.2) for (let x = -76; x < 44; x += 4.2) {
    const tx = x + r.range(-1.6, 1.6), tz = z + r.range(-1.6, 1.6), f = k.inAt(tx, tz);
    if (f > -1.6 || f < -26 || k.waterD(tx, tz) < HW + 5 || r.chance(0.28)) continue;
    const gy = k.topAt(tx, tz), g = Math.min(47, Math.floor(Math.hypot(tx - FROM[0], tz - FROM[1]) / 5));
    trees.push({ x: tx, z: tz, gy, g, edge: f > -7 });
    tree(tbox, tx, gy, tz, g, r);
  }
  const uTree = { value: new Array(48).fill(0) };
  const woods = new THREE.Mesh(burnGeometry(tbox), burnMaterial(uTree, 'woods'));
  woods.castShadow = true; woods.receiveShadow = true; woods.name = 'woods';
  root.add(woods);
  const tf = trees.filter((t) => t.edge && t.z < 160);
  for (let i = 0; i < tf.length; i += 3) {
    const t = tf[i];
    k.fire(t.x, t.gy + r.range(3, 5), t.z, r.range(1.3, 1.9), i % 9 === 0, () => forestT >= t.g * 0.6 + 0.5);
    if (i % 12 === 0) t.site = park(t.x, t.gy + 4, t.z, 60, 24);
  }

  // ---- the set's state: flags to swing, the river to warm
  const flags = [];
  root.traverse((o) => { if (o.userData?.kind === 'flag') flags.push(o); });
  const river = root.getObjectByName('river')?.material.uniforms;
  const RIVER0 = river && { deep: river.uDeep.value.clone(), shallow: river.uShallow.value.clone(), sun: river.uSunCol.value.clone() };
  const HOT = { deep: new THREE.Color(0x2a0a04), shallow: new THREE.Color(0x5a200c), sun: new THREE.Color(1.0, 0.5, 0.2) };
  const wind0 = Math.atan2(WINTER[1], WINTER[0]), wind1 = Math.atan2(EAST[1], EAST[0]);
  const m4 = new THREE.Matrix4(), c3 = new THREE.Color();
  let lastFrame = 0, kong = true, heroKong = false;
  const sets = {
    wind() { if (windT < -1e8) windT = T; },
    ignite() { if (fleetT < -1e8) fleetT = 0; },
    forest() { if (forestT < -1e8) forestT = 0; },
  };
  const reset = () => { fleetT = windT = forestT = -1e9; kong = true; };
  const sm = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  return {
    sets,
    update(dt, game) {
      T += dt; BURN_T.value = T;
      if (game.frame < lastFrame) reset();                                                             // a new battle
      lastFrame = game.frame;
      if (game.mode !== 'story' && fleetT < -1e8) { windT = T - 10; fleetT = 20; forestT = 20; }       // free: the burning night
      if (fleetT > -1e8) fleetT += dt;
      if (forestT > -1e8) forestT += dt;
      // wind: the winter north-wester swings round to the south-easterly over 4 s; every flag turns with it
      const w = windT > -1e8 ? sm(0, 4, T - windT) : 0, a = wind0 + (((wind1 - wind0 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * w;
      WIND.set(Math.cos(a), 0, Math.sin(a));
      const fy = Math.atan2(-WIND.z, WIND.x);
      for (const f of flags) f.rotation.y = fy;
      // Kongming stands on the altar (unless he is the hero) until the wind has risen and he has slipped away
      heroKong = game.hero.char?.id === 'zhugeliang';
      if (windT > -1e8 && T - windT > 7) kong = false;
      figMesh.visible = kong && !heroKong;
      // fire boats: sail in over SAIL s, burning, then lie against the hulls they rammed
      boats.forEach((b, n) => {
        const u = fleetT < 0 ? -1 : Math.min(1, fleetT / b.t);
        b.m.visible = u >= 0;
        if (u < 0) return;
        const e = u * (2 - u) * 0.3 + u * 0.7;                                                         // eases in on the ram
        b.m.position.set(b.x0 + (b.x - b.x0) * e, WY + Math.sin(T * 1.7 + b.t) * 0.08, b.z0 + (b.z - b.z0) * e);
        b.fl.visible = b.halo.visible = u < 1;
        for (const f of b.fl.children) f.scale.set(1, 1.2 + Math.sin(T * 11 + f.position.z * 3) * 0.6, 1);
        uBoat.value[n] = Math.min(1, Math.max(0, (fleetT - b.t) / 9 + 0.35 * u));
      });
      // ships: burn 0 → 1 over 7 s from the moment the fire reaches them; light sites and water pools follow
      let heat = 0;
      ships.forEach((s, i) => {
        const b = fleetT < 0 ? 0 : Math.min(1, Math.max(0, (fleetT - s.d) / 7));
        uShip.value[i] = b; heat += b / ships.length;
        const fl = 0.8 + 0.2 * Math.sin(T * 8 + i) * Math.sin(T * 13.7 + i * 2);
        pm.setMatrixAt(i, m4.makeScale(pools[i][2], 1, pools[i][3]).setPosition(s.x, WY + 0.06, s.z));
        pm.setColorAt(i, c3.setRGB(0.55, 0.2, 0.05).multiplyScalar(Math.min(1, b * 3) * (1 - b * 0.4) * fl));
        if (s.site) { const on = b > 0; s.site.x = on ? s.site.at[0] : 9e3; s.site.z = on ? s.site.at[1] : 9e3; s.site.i = s.site.full * Math.min(1, b * 4) * (1 - b * 0.35); }
      });
      fb.forEach((b, n) => {
        const u = fleetT < 0 ? 0 : Math.min(1, fleetT / b.t), q = ships.length + n;
        pm.setMatrixAt(q, m4.makeScale(pools[q][2], 1, pools[q][3]).setPosition(boats[n].m.position.x, WY + 0.07, boats[n].m.position.z));
        pm.setColorAt(q, c3.setRGB(0.6, 0.22, 0.05).multiplyScalar(fleetT >= 0 ? 0.6 + 0.4 * u : 0));
      });
      pm.instanceMatrix.needsUpdate = true; pm.instanceColor.needsUpdate = true;
      if (river) {
        const h = Math.min(1, heat * 1.6);
        river.uDeep.value.copy(RIVER0.deep).lerp(HOT.deep, h); river.uShallow.value.copy(RIVER0.shallow).lerp(HOT.shallow, h);
        river.uSunCol.value.copy(RIVER0.sun).lerp(HOT.sun, h * 0.7);
      }
      // the woods: each group burns over ≈ 10 s once the fire front (from the river side) reaches it
      for (let g = 0; g < 48; g++) uTree.value[g] = forestT < 0 ? 0 : Math.min(0.8, Math.max(0, (forestT - g * 0.6) / 12));   // charred crowns stay up
      for (const t of trees) if (t.site) { const b = uTree.value[t.g], on = b > 0; t.site.x = on ? t.site.at[0] : 9e3; t.site.z = on ? t.site.at[1] : 9e3; t.site.i = t.site.full * Math.min(1, b * 4); }
    },
  };
}

/** A war junk (樓船) centred at (x, z), bow toward −Z, scale s, burn index i: tarred planked hull with a red-lacquered
 *  gunwale and blue shields along it, a rising bow with a fore castle, a two-storey stern castle with tiled roofs and a
 *  transom, a two-tier deck house, main + fore masts with battened junk sails, the 曹 flag astern, lanterns. */
function junk(out, x, z, s, i, r, k) {
  const P = (kind, w, h, d, lx, ly, lz, c, rot) => out.push({ s: [w * s, h * s, d * s], p: [x + lx * s, WY + ly * s, z + lz * s], c, r: rot, b: i * 4 + kind });
  const W = 0x5c3c26, WD = 0x4a3020, TAR = 0x221812, RED = 0x8a2a1c, ROOF = 0x2a2628, ROOF2 = 0x34303a, COL = 0x7c2b1d;
  P(0, 5.2, 1.4, 19, 0, -0.3, 0.5, TAR); P(0, 6.2, 0.9, 21, 0, 0.8, 0.3, WD); P(0, 6.9, 0.8, 22.4, 0, 1.6, 0.2, W);
  P(0, 7.3, 0.35, 23, 0, 2.15, 0.2, 0x6a4630); P(0, 7.45, 0.2, 23.2, 0, 2.42, 0.2, RED);
  for (const [y, w, d] of [[0.42, 6.25, 20.9], [1.25, 6.95, 22.3], [1.9, 7.35, 22.9]]) P(0, w, 0.07, d, 0, y, 0.25, 0x2a1a10);   // strakes
  P(0, 6.6, 0.1, 21.5, 0, 2.3, 0.2, 0x7a5a3c);                                                            // deck
  P(0, 5.8, 1.2, 3.2, 0, 2.0, -11.8, W); P(0, 4.6, 1.1, 2.4, 0, 2.9, -13.4, W); P(0, 3.2, 1.0, 1.6, 0, 3.7, -14.6, 0x6a4630);
  P(0, 3.4, 0.16, 1.8, 0, 4.25, -14.6, RED);
  for (const sd of [-1, 1]) P(3, 0.5, 0.5, 0.06, sd * 1.2, 3.1, -15.42, 0xe8e0d0);                         // painted bow eyes
  P(0, 6.4, 0.3, 4.4, 0, 3.1, -9.6, 0x6a4a30);                                                            // fore castle
  for (const sd of [-1, 1]) P(0, 0.2, 0.9, 4.4, sd * 3.1, 3.7, -9.6, WD);
  P(0, 6.4, 0.9, 0.2, 0, 3.7, -11.7, WD);
  // stern castle, two storeys
  P(0, 6.8, 2.4, 5.2, 0, 3.5, 9.4, W);
  for (const sd of [-1, 1]) { for (let q = -1; q <= 1; q++) P(3, 0.12, 0.5, 0.9, sd * 3.42, 3.6, 9.4 + q * 1.5, 0x140c08); for (const e of [-1, 1]) P(0, 0.35, 2.5, 0.35, sd * 3.35, 3.5, 9.4 + e * 2.55, COL); }
  P(0, 7.8, 0.35, 6.4, 0, 4.9, 9.4, ROOF); P(0, 6.6, 0.3, 5.4, 0, 5.2, 9.4, ROOF2);
  for (const sd of [-1, 1]) for (const e of [-1, 1]) P(0, 0.6, 0.35, 0.6, sd * 3.9, 5.12, 9.4 + e * 3.2, 0x3c3840);
  P(0, 5.2, 1.8, 3.8, 0, 6.3, 9.8, W); P(3, 5.24, 0.4, 0.06, 0, 6.5, 7.88, 0x140c08);
  P(0, 6.2, 0.3, 4.8, 0, 7.35, 9.8, ROOF); P(0, 5, 0.25, 3.8, 0, 7.6, 9.8, ROOF2); P(0, 3.4, 0.3, 0.4, 0, 7.85, 9.8, ROOF);
  P(0, 6.6, 1.8, 1.4, 0, 2.6, 12.6, WD); P(0, 0.4, 3.2, 1.6, 0, 0.6, 13.6, 0x2a1a10);                     // transom, rudder
  // deck house, two tiers
  P(0, 5.4, 2.1, 7.2, 0, 3.4, -0.8, 0x6a4a30);
  for (const sd of [-1, 1]) { P(3, 0.1, 0.8, 5.6, sd * 2.72, 3.6, -0.8, 0x1a100a); for (let q = -1; q <= 1; q++) P(0, 0.3, 2.2, 0.3, sd * 2.75, 3.45, -0.8 + q * 3.3, COL); }
  P(0, 6.4, 0.3, 8.4, 0, 4.6, -0.8, ROOF); P(0, 5.4, 0.25, 7.2, 0, 4.85, -0.8, ROOF2);
  for (const sd of [-1, 1]) for (const e of [-1, 1]) P(0, 0.5, 0.35, 0.5, sd * 3.3, 4.85, -0.8 + e * 4.3, 0x3c3840);
  P(0, 3.8, 1.5, 4.6, 0, 5.75, -0.8, W); P(0, 4.8, 0.3, 5.8, 0, 6.65, -0.8, ROOF); P(0, 3.8, 0.25, 4.6, 0, 6.9, -0.8, ROOF2);
  // masts, battened sails (half raised), yards
  const sail = (lz, h0, n, w0, taper, mast) => {
    P(0, 0.45, mast, 0.45, 0, 2.3 + mast / 2, lz, 0x3a2616);
    for (let q = 0; q < n; q++) {                                    // rigged fore-and-aft (a lug: most of it abaft the mast)
      const w = w0 - q * taper, y = h0 + q * 1.42, c = lz + w * 0.28;
      P(1, 0.12, 1.3, w, 0.3, y, c, q & 1 ? 0xc8a878 : 0xb8966a);
      P(0, 0.2, 0.14, w + 0.3, 0.3, y + 0.72, c, 0x2a1a10);
    }
    const wt = w0 - n * taper;
    P(0, 0.24, 0.24, wt + 0.8, 0.3, h0 + n * 1.42 - 0.6, lz + wt * 0.28, 0x2a1a10);
  };
  sail(-5.8, 7.3, 6, 7.4, 0.5, 16.5);
  sail(-10.2, 5.2, 3, 4.4, 0.4, 9.5);
  for (let lz = -8; lz <= 7; lz += 1.5) for (const sd of [-1, 1]) P(0, 0.12, 0.8, 1.0, sd * 3.72, 2.95, lz, lz > 5 ? 0x162a52 : 0x22407e);   // shields
  for (const sd of [-1, 1]) P(2, 0.1, 0.1, 6, sd * 2.4, 0.9, -15.5, 0x2a2a2e, [0.9, 0, 0]);             // anchor cables
  // the 曹 flag astern and lanterns (the dressing kit's cloth / glow boxes)
  k.poles.push({ s: [0.16 * s, 6 * s, 0.16 * s], p: [x - 2.8 * s, WY + 8 * s, z + 11.6 * s], c: 0x2a1a10 });
  k.cloth(k.mats.foe, 2.2 * s, 3 * s, 'flag', x - 2.8 * s, WY + 10.8 * s, z + 11.6 * s, Math.atan2(-WIND.z, WIND.x));
  for (const [lx, ly, lz] of [[-3.9, 4.3, 12.1], [3.9, 4.3, 12.1], [0, 4.6, -14.4], [-3.3, 4.3, -0.8], [3.3, 4.3, -0.8]]) k.lantern(x + lx * s, WY + ly * s, z + lz * s, 0.9 * s);
}

/** A voxel tree on (x, gy, z), burn group g: dark winter pines and bare-crowned broadleaves. Trunk wood (kind 0),
 *  foliage burns away (kind 1). */
function tree(out, x, gy, z, g, r) {
  const b = g * 4, H = r.range(6, 10.5), pine = r.chance(0.55), tk = r.range(0.45, 0.7);
  out.push({ s: [tk, H * 0.6, tk], p: [x, gy + H * 0.3, z], r: [r.range(-0.05, 0.05), r.range(0, 3), r.range(-0.05, 0.05)], c: 0x2e2018, b });
  if (pine) for (let t = 0; t < 4; t++) {
    const w = (3.4 - t * 0.75) * r.range(0.85, 1.1);
    out.push({ s: [w, 1.3, w], p: [x, gy + H * 0.38 + t * H * 0.17, z], r: [0, r.range(0, 3), 0], c: shade(0x1c2a20, 0.8 + t * 0.08 + r.range(0, 0.15)), b: b + 1 });
  }
  else for (let t = 0; t < 5; t++) {
    const w = r.range(1.8, 3.2);
    out.push({ s: [w, w * 0.8, w], p: [x + r.range(-1.3, 1.3), gy + H * r.range(0.62, 0.95), z + r.range(-1.3, 1.3)], r: [0, r.range(0, 3), 0], c: shade(0x26301e, r.range(0.75, 1.05)), b: b + 1 });
  }
}
