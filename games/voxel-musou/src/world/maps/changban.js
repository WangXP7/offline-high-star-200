// 長坂坡 (Changban, 208 AD) laid out along +Z, ≈ 360 m from 劉備's side of the river to 曹操 on 景山 — an out-and-back
// stage: the hero starts on the bridge, rides north through the host to the burnt village, and fights his way back.
//   長坂橋南  Liu Bei's side     z -176 … -134  h 0     a grove (張飛's riders drag branches for dust), the fleeing column
//   長坂橋    Changban Bridge    z -137 … -119  h 0→1.3 the only crossing: a narrow plank bridge on a raised stone
//                                                       footing (water ford with a negative depth), 2.3 m either side
//   長坂      the slopes          z -130 …   22  h 0→3   rolling open ground: abandoned refugee carts, dropped bundles,
//                                                       burning wrecks (free-mode arena at z -40)
//   當陽      village ruins       z   14 …  100  h ≈ 3   burnt farmhouses and broken courtyard walls (solid props /
//                                                       carves), 糜夫人's well (anchor 'well', set 'well')
//   景山      the hillside        z   96 …  188  h 3→16  a ramp up to 曹操's command post under his banners and parasol;
//                                                       barricade gate 'jingshan' on the ramp (story never opens it)
// Dusk: a low amber sun straight up the valley behind 景山, the air thick with the smoke of burning farmland. Sets (story
// `set`): 'well' — the earthen wall beside the well topples over it; 'bridge' — the bridge's middle span comes down into
// the river (據水斷橋). Format: ./index.js.
import * as THREE from 'three';
import { boxesGeometry, shade } from '../../core/voxel.js';
import { lit } from '../castle.js';

const RIVER_Z = -128, HW = 6;           // the river's centre at the bridge / deep half width
const WELL = [15, 66];                  // 糜夫人's well
const JS_H = 16;                        // 景山 plateau height (m)

// the slopes / village ground: flat at the river, rolling hills over the slopes, levelling out in the village
const roll = (x, z) => 1.7 * Math.sin(x * 0.055 + 1.1) * Math.sin(z * 0.05 + 0.4) + 0.9 * Math.sin(x * 0.021 - z * 0.03);
const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const H = (x, z) => smooth(-124, -96, z) * (1.8 + (z + 100) * 0.008 + roll(x, z) * (1 - smooth(4, 26, z)));

// the village: farmhouse ruins [x, z, turned (x ↔ z), w, d, burning] (solid footprints) and broken courtyard walls
// [x0, z0, x1, z1] (carved)
const HOUSES = [[-22, 30, 0, 9, 6, 1], [-35, 46, 1, 8, 6, 0], [-19, 53, 0, 7, 5, 1], [-31, 71, 0, 10, 6, 0], [-17, 86, 1, 7, 6, 1],
  [22, 32, 1, 8, 6, 0], [31, 50, 0, 9, 6, 1], [34, 79, 1, 8, 7, 1], [22, 91, 0, 7, 5, 0]];
const foot = ([x, z, t, w, d]) => (t ? [x - d / 2, z - w / 2, x + d / 2, z + w / 2] : [x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
const WALLS = [[-42, 60, -27, 60.7], [-12.6, 62, -11.9, 75], [26, 60, 38, 60.7], [38.5, 36, 39.2, 46], [-28, 94, -20, 94.7], [9.4, 40, 10.1, 48]];

export default {
  id: 'changban',
  name: { zh: '長坂坡', en: 'Changban' },
  grid: [-112, -206, 112, 232],
  pieces: [
    { id: 'south', rect: [-34, -176, 34, -126], h: 0, edge: 3, rise: 6 },
    { id: 'slopes', rect: [-54, -130, 54, 22], h: H, edge: 4, rise: 8 },
    { id: 'village', rect: [-46, 14, 46, 100], h: H, edge: 3, rise: 7 },
    { id: 'ramp', path: [[0, 97, 9, H(0, 97)], [2, 124, 8, 9.5], [0, 148, 9, JS_H]], edge: 1.5, rise: 6 },
    { id: 'jingshan', ell: [0, 166, 28, 22], h: JS_H, edge: 2, rise: 22, drop: 172 },   // the near half falls away: a hill, not a wall
  ],
  // the bridge's sides over the deep water (the ford below is wider than the deck), the village's broken walls
  carve: [[-10, RIVER_Z - HW, -2.3, RIVER_Z + HW], [2.3, RIVER_Z - HW, 10, RIVER_Z + HW], ...WALLS],
  // farmhouse ruins, the well with its wall, 曹操's dais on 景山
  props: [...HOUSES.map(foot), [WELL[0] - 1.4, WELL[1] - 2.4, WELL[0] + 2.6, WELL[1] + 2.4], [-5, 170, 5, 177]],
  zones: [
    { id: 'grove', name: { zh: '長坂橋南', en: 'South of the Bridge' }, x: 0, z: -155, w: 64, d: 42 },
    { id: 'bridge', name: { zh: '長坂橋', en: 'Changban Bridge' }, x: 0, z: -115, w: 80, d: 30 },
    { id: 'slopes', name: { zh: '長坂', en: 'Changban Slopes' }, x: 0, z: -40, w: 108, d: 120 },
    { id: 'village', name: { zh: '當陽', en: 'Dangyang' }, x: 0, z: 58, w: 92, d: 76 },
    { id: 'jingshan', name: { zh: '景山', en: 'Mount Jing' }, x: 0, z: 164, r: 30 },
  ],
  route: [[0, -168], [0, -140], [0, -128], [0, -114], [-6, -84], [4, -52], [-4, -20], [2, 10], [0, 30], [5, 55], [4, 80], [1, 97],
    [2, 124], [0, 148], [0, 164]],
  gates: {
    jingshan: { rect: [-10, 121.5, 12, 124.5], name: { zh: '景山柵', en: 'Mount Jing Barricade' }, kind: 'barricade', at: [2, 123, 0, 9] },
  },
  // bridge: the deck's middle · gan / mizhu: where 甘夫人 and 糜竺 are found · well · jingshan: 曹操's post
  anchors: { bridge: [0, RIVER_Z], gan: [-30, -52], mizhu: [28, -18], well: WELL, cao: [0, 168] },
  // story: the north end of the deck, facing up the slopes (张飛 beside him on the planks); free: the open slopes
  spawn: { story: { x: 0, z: -121, yaw: 0, tilt: -0.06 }, free: { x: 0, z: -40, yaw: 0 } },
  // the river the lane crosses: deep everywhere but the bridge (a raised deck 1.3 m over the plain)
  water: { along: 'x', c: (x) => RIVER_Z + 7 * Math.sin(x * 0.04) * Math.min(1, (x / 22) ** 2), hw: HW, bed: [1.8, 0.45],
    fords: [[-4.4, 4.4, -1.3]], y: -0.2, stones: 24, tint: { deep: 0x17201c, shallow: 0x4e4a36, sun: [1, 0.62, 0.32] },
    bedHeight(x, z, h) {
      const wet = 1 - smooth(HW - 1, HW + 3, Math.abs(z - this.c(x)));
      return Math.abs(x) <= 12 && wet > 0 ? Math.min(h, -this.bed[0] * wet) : h;
    } },
  // dusk behind 景山, the sun a smoky orange disc low over the hill; brown-amber haze, the far field sinks into smoke
  sky: {
    sunElev: 0.035, sunAz: -0.12, sunCore: [4.4, 2.9, 1.5],
    haze: 0x7c6a70, hazeWarm: 0xc27844, glow: 0xf09a5a, skyMid: 0x8a6e76, skyTop: 0x3a3452,
    hznSun: 0xff8a34, hznAway: 0xb87062, cloudRose: 0xb46a52, cloudShade: 0x4a3c48, cloudLit: 0xffae6a,
    dust: [12, 44, 1.3, 0.075], dustLit: 0xc2804e, dustShade: 0x5a4652, apCool: 0x7a6c8c,
  },
  fog: [30, 250],
  post: { sat: 1.26, rays: 1.05, rayTint: [1.0, 0.6, 0.3], exposure: 1.42 },
  // key light from behind 景山 on the left; the warm fill (burning fields) always on
  light: { hemi: [0x9a8494, 0x7a5040, 2.35], sun: [0xff9a58, 3.6], rim: [0xff7a38, 1.9], dir: [-0.3, 0.55, 0.78], fire: 0xff7a30, fill: [-400, -390, 0.9] },
  castle: null,
  terrain: {
    pave: () => -0.3,                                                         // a country road, not a paved one
    bare: (x, z) => (z > 18 && z < 98 && Math.abs(x) < 44) || Math.hypot(x, z - 166) < 16,   // the village, the command post
    rock: (h, x, z) => h - 3.5 - Math.max(0, z - 96) * 0.5,                  // 景山 stays grassy
    scorch: { n: 44, area: [-52, -112, 52, 98], spots: [...HOUSES.filter((q) => q[5]).map(([x, z]) => [x, z, 1.1]), [-8, -64, 0.8], [20, -44, 0.9], [-30, -6, 0.7]] },
    rubble: [-52, -172, 52, 190],
    pines: [-60, 200],
    mountains: { peakA: -0.05, peak: 24 },
    cliff: { rock: 0x7a5e4e, dark: 0x4c3a34, top: 0x86684e, moss: 0x5a5638, grassy: 0x74703c },
  },
  fires: [[-28, -74, 1.2], [30, -34, 1.3], [-22, -2, 1.1], [36, -90, 1.0], [-42, -26, 1.2], [22, 8, 1.0]],
  // firelight: the bridge braziers, field wrecks, burning houses, the well-side brazier, 景山's braziers
  lightSites: [[-3.4, 1.9, -116.5, 30, 11], [3.4, 1.9, -116.5, 30, 11], [0, 1.9, -141, 24, 10], [-28, 2.2, -74, 28, 11], [30, 2.2, -34, 30, 11],
    [-22, 2.2, -2, 26, 10], [-22, 3, 30, 34, 13], [31, 3, 50, 32, 12], [-17, 3, 86, 30, 12], [11, 1.9, 63, 24, 10], [-6, 1.9, 160, 30, 12], [6, 1.9, 160, 30, 12]],
  hq: [0, 168],

  dress(k) {
    const { r, mats, props, poles, shade: sh } = k;
    const liu = k.banner('劉', { bg: '#2f5a3a', fg: '#e8d6a8', border: '#c7a574', w: 128, h: 256, seed: 12 });
    const cao = k.banner('曹', { bg: '#141a2e', fg: '#e6c870', border: '#8a6a2a', w: 160, h: 320, seed: 13 });
    const han = k.banner('漢', { bg: '#6a1a14', fg: '#f0d8a0', border: '#c8a050', w: 128, h: 256, seed: 14 });
    const CLOTH = [0x3a4a6a, 0x9a7a3a, 0x8a4a3a, 0x5a6a4a, 0x7a6a5a, 0xa89a7a];
    /** A tree: trunk and autumn canopy clumps (burnt: a black stump with bare limbs). */
    const tree = (x, z, s = 1, burnt = false) => {
      const gy = k.topAt(x, z), L = k.local(x, gy, z, r.range(0, 3)), h = r.range(3.2, 4.6) * s;
      L(0, h / 2, 0, [0.42 * s, h, 0.42 * s], burnt ? 0x1c1410 : sh(0x4a3626, r.range(0.85, 1.1)));
      if (burnt) {
        for (let q = 0; q < 3; q++) L(r.range(-0.3, 0.3) * s, h * r.range(0.6, 0.95), 0, [0.16 * s, h * 0.45, 0.16 * s], 0x1a120e, [r.range(-0.9, 0.9), r.range(0, 3), r.range(-0.9, 0.9)]);
        return;
      }
      for (let q = 0, n = r.int(4, 6); q < n; q++) {
        const w = r.range(1.6, 2.8) * s, c = [0x4e5a2a, 0x5f6a30, 0x7a6a2c, 0x8a5a26, 0x3e4a26][r.int(0, 4)];
        L(r.range(-1.1, 1.1) * s, h + r.range(-0.4, 1.4) * s, r.range(-1.1, 1.1) * s, [w, w * r.range(0.6, 0.85), w], sh(c, r.range(0.85, 1.1)), [0, r.range(0, 1.5), 0]);
      }
    };
    /** What the refugees dropped: cloth bundles, baskets, pots, a rolled mat. */
    const dropped = (x, z) => {
      const gy = k.ground(x, z), L = k.local(x, gy, z, r.range(0, 6.28)), kind = r.int(0, 3), c = CLOTH[r.int(0, CLOTH.length - 1)];
      if (kind === 0) { L(0, 0.2, 0, [0.7, 0.4, 0.55], sh(c, r.range(0.8, 1.05)), [0, 0, r.range(-0.2, 0.2)]); L(0.05, 0.43, 0, [0.22, 0.12, 0.22], sh(c, 0.7)); }
      else if (kind === 1) { L(0, 0.22, 0, [0.6, 0.44, 0.6], sh(0x8a6a40, r.range(0.85, 1.1))); L(0, 0.46, 0, [0.66, 0.06, 0.66], 0x5e4428); }
      else if (kind === 2) { L(0, 0.25, 0, [0.46, 0.5, 0.46], sh(0x6a4a34, r.range(0.8, 1.1)), [r.chance(0.4) ? 1.4 : 0, 0, 0]); L(0, 0.52, 0, [0.3, 0.08, 0.3], 0x4a3424); }
      else L(0, 0.14, 0, [1.4, 0.26, 0.26], sh(0xb09a6a, r.range(0.8, 1.05)));
    };
    /** Earthen wall run from (ax, az) to (bx, bz), broken: courses of rammed earth, the top eaten away, soot on top. */
    const earthWall = (ax, az, bx, bz, h = 2.4, t = 0.6) => {
      const len = Math.hypot(bx - ax, bz - az), yaw = Math.atan2(bx - ax, bz - az);
      for (let d = 0; d < len; d += 0.9) {
        const x = ax + (bx - ax) * (d + 0.45) / len, z = az + (bz - az) * (d + 0.45) / len, hh = h * (0.35 + 0.65 * Math.abs(Math.sin(d * 0.7 + x))) * r.range(0.8, 1.05);
        if (r.chance(0.08)) continue;                                                  // a breach
        const gy = k.ground(x, z) - 0.2;
        props.push({ s: [t, hh * 0.75, 0.92], p: [x, gy + hh * 0.375, z], r: [0, yaw, 0], c: sh(0x9c7e5c, r.range(0.85, 1.05)) },
          { s: [t * 0.94, hh * 0.25, 0.9], p: [x, gy + hh * 0.875, z], r: [0, yaw, 0], c: sh(0x4a3a30, r.range(0.8, 1.2)) });
      }
    };
    /** A farmhouse ruin: rammed-earth walls broken down to stubs, a door gap, charred beams, the roof half fallen in. */
    const house = ([x, z, turned, w, d, burning]) => {
      const yaw = turned ? Math.PI / 2 : 0, gy = k.ground(x, z) - 0.2, L = k.local(x, gy, z, yaw);
      const wall = (lx, lz, len, alongX) => {
        for (let q = -len / 2 + 0.45; q < len / 2; q += 0.9) {
          if (!alongX && lx < 0 && Math.abs(q) < 0.9) continue;                        // the door
          const hh = r.chance(0.2) ? r.range(0.6, 1.4) : r.range(2.2, 3.1);
          const [px, pz] = alongX ? [lx + q, lz] : [lx, lz + q];
          L(px, hh * 0.4, pz, alongX ? [0.92, hh * 0.8, 0.55] : [0.55, hh * 0.8, 0.92], sh(0xa0805e, r.range(0.85, 1.05)));
          L(px, hh * 0.9, pz, alongX ? [0.9, hh * 0.2, 0.53] : [0.53, hh * 0.2, 0.9], burning ? sh(0x3a2c24, r.range(0.8, 1.2)) : sh(0x7a6048, r.range(0.9, 1.1)));
        }
      };
      // walls: lx across, lz along (d = the gable depth along z, door in the -x wall)
      wall(-w / 2, 0, d, false); wall(w / 2, 0, d, false); wall(0, -d / 2, w, true); wall(0, d / 2, w, true);
      for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L(cx * w / 2, 1.7, cz * d / 2, [0.34, 3.4, 0.34], burning ? 0x1a120c : 0x3a2a1c);   // timber frame
      L(-w / 2, 1.1, -0.95, [0.62, 2.2, 0.16], 0x2a1e16); L(-w / 2, 1.1, 0.95, [0.62, 2.2, 0.16], 0x2a1e16); L(-w / 2, 2.25, 0, [0.62, 0.2, 2.1], 0x2a1e16);   // door frame
      L(0, 0.08, 0, [w - 0.6, 0.16, d - 0.6], 0x3a2c22);                                 // ash floor
      for (let q = 0; q < 4; q++) L(r.range(-w / 3, w / 3), r.range(1.2, 2.4), r.range(-d / 3, d / 3), [0.26, 0.26, d * r.range(0.6, 1)], 0x1e1410, [r.range(-0.6, 0.6), r.range(-0.4, 0.4), 0]);   // charred beams
      if (!burning) {                                                                  // the roof's back slope still up, tiles slipping
        for (let q = 0; q < 5; q++) L(0, 3.0 + q * 0.32, d / 2 - 0.4 - q * 0.55, [w + 0.4, 0.18, 0.7], sh(0x3e3a38, r.range(0.85, 1.1)), [-0.52, 0, 0]);
        L(0, 4.5, 0, [w + 0.6, 0.3, 0.3], 0x2e241c);
      }
      for (let q = 0; q < 6; q++) L(r.range(-w / 2 - 1, w / 2 + 1), 0.25, r.range(-d / 2 - 1.2, -d / 2 - 0.4), [r.range(0.4, 0.9), r.range(0.3, 0.6), r.range(0.4, 0.8)], sh(0x5a4a42, r.range(0.7, 1.1)), [0, r.range(0, 3), 0]);
      if (burning) k.fire(x + r.range(-1, 1), k.ground(x, z) + 0.6, z + r.range(-1, 1), r.range(1.3, 1.7), true);
    };

    // ---- 長坂橋南: the grove, 劉 standards at the bridge foot, the column retreating south, 張飛's riders' dust
    for (let i = 0; i < 26; i++) {
      const x = (r.chance(0.5) ? -1 : 1) * r.range(11, 33), z = r.range(-172, -142);
      tree(x, z, r.range(0.9, 1.25));
    }
    for (let i = 0; i < 30; i++) { const x = r.range(-80, 80), z = r.range(-200, -150); if (k.inAt(x, z) < -3) tree(x, z, r.range(1, 1.4)); }   // the woods beyond
    for (const sx of [-1, 1]) { k.standard(sx * 5.5, -143, 1.15, liu, 9, [0, -128]); k.standard(sx * 14, -150, 1.05, mats.ally, 8, [0, -128]); }
    k.lamp(0, -141, 0.7);
    for (const [x, z, yaw] of [[-18, -160, 0.3], [16, -165, -0.4], [-8, -170, 0.1], [24, -150, 1.2]]) k.cart(x, z, yaw);
    // ---- the bridge foot on the north bank: braziers, a pair of 漢 standards the bridge's guard planted
    for (const sx of [-1, 1]) k.lamp(sx * 3.4, -116.5, 0.6);
    k.standard(-7, -113, 1.1, han, 9, [0, -128]); k.standard(7, -113, 1.1, mats.ally, 8.5, [0, -128]);
    k.reeds();
    // ---- 長坂: the refugees' flight — carts left where they stuck, their loads spilled, the dead; burning wrecks
    for (const [x, z, yaw, b] of [[-14, -104, 0.5, 0], [12, -96, -0.4, 1], [-24, -88, 1.9, 0], [18, -70, 2.6, 0], [-10, -58, 0.2, 1], [28, -60, 1.1, 0],
      [-34, -40, 0.7, 0], [14, -28, 2.2, 1], [-18, -16, 1.4, 0], [34, -8, 0.3, 1], [-30, 6, 2.8, 0], [12, 14, 0.9, 0], [-40, -64, 1.6, 1]]) k.cart(x, z, yaw, !!b);
    for (let i = 0; i < 90; i++) {
      const x = r.range(-48, 48), z = r.range(-110, 18);
      if (k.inAt(x, z) < 1.5 || k.routeDist(x, z) < 2.5) continue;
      dropped(x, z);
    }
    // 甘夫人's overturned cart and 糜竺's cart
    { const [x, z] = [-30, -52]; k.cart(x + 3, z + 2, 2.4, true); for (let i = 0; i < 6; i++) dropped(x + r.range(-3, 3), z + r.range(-2, 3)); }
    { const [x, z] = [28, -18]; k.cart(x - 2, z + 3, -0.6); k.standard(x + 5, z + 5, 1.05, mats.foe, 8); }
    for (const [x, z] of [[-46, -96], [46, -84], [-50, -46], [48, -40], [-46, 4], [44, 14], [-26, -112], [26, -110]]) k.standard(x, z, 1.05, r.chance(0.25) ? mats.pennant : mats.foe);
    for (let i = 0; i < 24; i++) { const x = (r.chance(0.5) ? -1 : 1) * r.range(56, 90), z = r.range(-120, 100); if (k.inAt(x, z) < -3) tree(x, z, r.range(0.9, 1.3), r.chance(0.3)); }
    for (const [x, z] of [[-48, -110], [49, -66], [-49, -12], [47, 20]]) tree(x, z, 1.1, true);
    // ---- 當陽: the burnt village — farmhouse ruins, broken walls, burnt trees, the well
    HOUSES.forEach(house);
    for (const [x0, z0, x1, z1] of WALLS) (x1 - x0 > z1 - z0) ? earthWall(x0, (z0 + z1) / 2, x1, (z0 + z1) / 2) : earthWall((x0 + x1) / 2, z0, (x0 + x1) / 2, z1);
    for (const [x, z] of [[-8, 36], [12, 26], [-40, 58], [40, 64], [-8, 72], [18, 76], [-38, 88], [36, 92], [-4, 94]]) tree(x, z, r.range(0.9, 1.15), true);
    for (let i = 0; i < 40; i++) { const x = r.range(-42, 42), z = r.range(20, 96); if (k.inAt(x, z) > 1.5 && k.routeDist(x, z) > 2.5) dropped(x, z); }
    for (const [x, z] of [[-40, 24], [40, 26], [-42, 96], [42, 94], [-10, 98], [14, 98]]) k.standard(x, z, 1.1, mats.foe, 8.5);
    k.lamp(11, 63, 0.55);                                                                // a brazier the looters left by the well
    { const [x, z] = WELL, gy = k.ground(x, z) - 0.1;                                    // 糜夫人's well: stone curb, winch, bucket
      for (let q = 0; q < 8; q++) {
        const a = q / 8 * Math.PI * 2, L = k.local(x + Math.sin(a) * 0.95, gy, z + Math.cos(a) * 0.95, a);
        L(0, 0.45, 0, [0.82, 0.9, 0.36], sh(0x7a7068, 0.85 + 0.2 * ((q * 5) % 3) / 2));
        L(0, 0.93, 0, [0.86, 0.08, 0.42], 0x928a80);
      }
      props.push({ s: [1.5, 0.05, 1.5], p: [x, gy + 0.72, z], c: 0x0c0a0a });
      for (const sx of [-1, 1]) poles.push({ s: [0.16, 2.3, 0.16], p: [x + sx * 1.05, gy + 1.15, z], c: 0x3a2618 });
      poles.push({ s: [2.3, 0.18, 0.18], p: [x, gy + 2.2, z], c: 0x4a3222 }, { s: [0.03, 1.2, 0.03], p: [x + 0.2, gy + 1.6, z], c: 0x9a8a6a });
      props.push({ s: [0.36, 0.34, 0.36], p: [x - 1.5, gy + 0.17, z - 1.2], r: [0, 0.4, 1.3], c: 0x5a4028 }); }   // the bucket, kicked over
    // ---- 景山: the ramp and its barricade, 曹操's command post — dais, parasol, the great 曹 standard, drums, tents
    k.barricade('jingshan');
    k.burn(-3, 121.5, 1.0, 'jingshan'); k.burn(6, 121, 1.0, 'jingshan');
    for (const [x, z] of [[-9, 108], [11, 110], [-8, 134], [10, 136]]) k.standard(x, z, 1.05, mats.foe, 8);
    { const gy = k.ground(0, 173.5);
      props.push({ s: [10, 1.0, 7], p: [0, gy + 0.5, 173.5], c: 0x5e524a }, { s: [10.2, 0.1, 0.16], p: [0, gy + 1.0, 170], c: 0x8a7a68 });
      for (let q = 0; q < 2; q++) props.push({ s: [4, 0.35 * (q + 1), 1.1 - q * 0.45], p: [0, gy + 0.175 * (q + 1), 169.5 - (1.1 - q * 0.45) / 2 + 0.05], c: sh(0x5a4e46, 1 + q * 0.05) });
      k.commandTable(0, 173.5, Math.PI);
      // 曹操's parasol (華蓋): a tall pole, a gilt finial, a red canopy in stepped rings, a fringe of short hangings
      const px = 2.6, pz = 174.5, top = gy + 1 + 5.2;
      poles.push({ s: [0.18, 5.4, 0.18], p: [px, gy + 1 + 2.7, pz], c: 0x2a1c14 }, { s: [0.3, 0.6, 0.3], p: [px, top + 0.7, pz], c: 0xd0a040 });
      for (const [w, dy, c] of [[3.6, 0, 0x8a1a14], [2.8, 0.22, 0xa02418], [1.8, 0.42, 0x8a1a14], [0.9, 0.58, 0xc8a040]]) props.push({ s: [w, 0.22, w], p: [px, top + dy, pz], c });
      for (let q = 0; q < 12; q++) { const a = q / 12 * Math.PI * 2; props.push({ s: [0.5, 0.7, 0.05], p: [px + Math.sin(a) * 1.78, top - 0.4, pz + Math.cos(a) * 1.78], r: [0, a, 0], c: q % 2 ? 0xc8a040 : 0x6a1410 }); }
      for (const sx of [-1, 1]) { k.drum(sx * 6.5, 171, sx * (Math.PI / 2 - 0.4)); k.lamp(sx * 6, 160, 0.8); }
      const x = -4, z = 178, P = 20;                                                    // the great 曹 standard behind the dais
      poles.push({ s: [0.4, P, 0.4], p: [x, gy + P / 2, z], c: 0x2e1d15 }, { s: [5.6, 0.3, 0.3], p: [x + 2.6, gy + P - 0.5, z], c: 0x2e1d15 }, { s: [0.3, 1.4, 0.3], p: [x, gy + P + 0.7, z], c: 0xc9a040 });
      k.cloth(cao, 5, 10, 'hang', x + 0.2, gy + P - 0.7, z, 0.05); }
    for (let i = 0; i < 12; i++) {                                                       // standards round the brow of the hill
      const a = -1.35 + (i / 11) * 2.7, x = Math.sin(a) * 23, z = 166 - Math.cos(a) * 19;
      if (Math.abs(x) < 7) continue;                                                     // the ramp's arrival
      k.standard(x, z, 1.15, r.chance(0.3) ? cao : mats.foe, 9, [0, 100]);
    }
    for (const [x, z, yaw] of [[-18, 176, 0.4], [18, 178, -0.4], [-10, 184, 0.1], [11, 185, -0.1]]) k.tent(x, z, yaw, r.chance(0.5) ? 0x2a3a6a : 0xb09a7c, 5, 5.5);
    k.palisade([[-26, 182], [-12, 190], [12, 190], [26, 182]]);
    k.fire(22, k.beaconTower(22, 186), 186, 3, true);                                    // 曹操's signal beacon: its smoke marks the goal

    // ---- the field: burning wrecks, arrow volleys, the fallen's gear, torch posts along the slopes road
    k.wrecks();
    k.arrows([-48, -118, 48, 96], 60);
    k.debris([-50, -118, 50, 96], 140);
    k.torchPosts(-114, 96);
    // ---- reserve armies off the walkable ground: 劉 south of the river, the 曹 host on the ridges and round 景山
    for (const [x, z, f] of [[-48, -150, Math.PI], [48, -156, Math.PI], [0, -190, Math.PI], [-44, -178, Math.PI - 0.3]]) k.formation('ally', x, z, f, r.int(8, 12), r.int(4, 6));
    for (const [x, z, f] of [[-66, -30, 1.4], [66, -50, -1.4], [-64, 40, 1.5], [64, 70, -1.5], [-40, 150, 0.6], [40, 150, -0.6], [-30, 200, Math.PI], [30, 204, Math.PI], [-62, 110, 1.2], [62, 118, -1.2]]) k.formation('foe', x, z, f, r.int(9, 14), r.int(4, 7));
    k.aftermath({ fallen: [[-44, 44, -110, 16, 30], [-40, 40, 20, 96, 16], [-20, 20, -122, -104, 6]], standards: [10, -44, -108, 44, 90],
      dust: { n: 40, area: [-56, -176, 56, 110] } });
    k.farFires([[-82, -62], [86, -20], [-90, 40], [82, 92], [-76, 134], [70, 164], [-40, 222], [92, -120], [-88, -150], [40, 226]]);
  },

  // the plank bridge (static deck + the middle span that falls: set 'bridge') and the wall beside the well (set 'well')
  build(root, k) {
    // The negative ford depth supplies the walk height, not an earth causeway: the wooden deck spans real water.
    // Keep the sim grid for crossing the bridge, but cut the render mesh back to the riverbed below the planks.
    const bed = root.getObjectByName('ground').geometry, pos = bed.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, this.water.bedHeight(pos.getX(i), pos.getZ(i), pos.getY(i)));
    }
    pos.needsUpdate = true; bed.computeVertexNormals(); bed.computeBoundingSphere();
    const mat = lit(), stat = [], y0 = (z) => k.ground(0, z) + 0.1;               // deck top follows the causeway
    const span = [];                                                               // the middle span: 8 falling sections
    const Z0 = RIVER_Z - 9.5, Z1 = RIVER_Z + 9.5, S0 = RIVER_Z - 4.6, S1 = RIVER_Z + 4.6, n = 8;
    for (let i = 0; i < n; i++) span.push([]);
    const into = (z) => (z > S0 && z < S1 ? span[Math.min(n - 1, Math.floor((z - S0) / (S1 - S0) * n))] : stat);
    let q = 0;
    for (let z = Z0; z < Z1; z += 0.56, q++) {                                   // planks, a little uneven, one missing here and there
      if (q % 11 === 7) continue;
      into(z).push({ s: [5.2 + (q % 3) * 0.12, 0.14, 0.5], p: [(q % 2) * 0.08, y0(z) - 0.07, z], r: [0, ((q * 7) % 5 - 2) * 0.012, 0], c: shade(0x6e4c30, 0.8 + ((q * 13) % 7) / 20) });
    }
    for (const sx of [-1, 1]) for (let z = Z0; z < Z1 - 0.1; z += 1.6) {        // posts, two rails, the fascia under the deck edge
      const za = z, zb = Math.min(Z1, z + 1.6), ya = y0(za), yb = y0(zb), L = Math.hypot(zb - za, yb - ya), pitch = -Math.atan2(yb - ya, zb - za), zm = (za + zb) / 2, ym = (ya + yb) / 2;
      into(za + 0.01).push({ s: [0.2, 1.15, 0.2], p: [sx * 2.55, ya + 0.5, za], c: 0x4a3222 });
      for (const [dy, t, c] of [[1.0, 0.14, 0x5a3c26], [0.55, 0.1, 0x4a3222], [-0.25, 0.4, 0x3a2818]]) into(zm).push({ s: [dy < 0 ? 0.24 : t, t, L + 0.04], p: [sx * (dy < 0 ? 2.62 : 2.55), ym + dy, zm], r: [pitch, 0, 0], c });
    }
    for (let z = RIVER_Z - HW + 0.5; z < RIVER_Z + HW; z += 2.8) for (const sx of [-1, 1]) stat.push({ s: [0.36, 3.2, 0.36], p: [sx * 2.2, y0(z) - 1.75, z], c: 0x2e2018 });   // piles
    for (let z = Z0; z < Z1; z += 0.8) for (const sx of [-1, 1]) {                // the stone footing's riprap down to the water
      const x = sx * (3 + ((z * 7.3) % 1.2)), s = 0.5 + ((z * 3.1) % 0.4);
      stat.push({ s: [s * 1.6, s, s * 1.3], p: [x, k.ground(x, z) + s * 0.2, z], r: [0, z % 1.5, 0.2 * sx], c: shade(0x6a625a, 0.8 + ((z * 5.7) % 0.3)) });
    }
    const mesh = (boxes, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(boxesGeometry(boxes.map((b) => ({ ...b, p: [b.p[0] - x, b.p[1] - y, b.p[2] - z] }))), mat);
      m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; root.add(m);
      return m;
    };
    mesh(stat);
    const pieces = span.map((b, i) => { const z = S0 + (i + 0.5) * (S1 - S0) / n, y = y0(z); return { m: mesh(b, 0, y, z), y, z, i }; });
    // the well's wall: rammed earth standing along z just east of the curb, pivoting on its foot toward the well
    const wall = [], px = WELL[0] + 1.95, gy = k.ground(WELL[0], WELL[1]) - 0.15;
    for (let dz = -2.3; dz < 2.3; dz += 0.92) {
      const h = 2.3 + Math.sin(dz * 2.1) * 0.35;
      wall.push({ s: [0.56, h * 0.8, 0.9], p: [px + 0.28, gy + h * 0.4, WELL[1] + dz + 0.46], c: shade(0xa0805e, 0.9 + (dz % 0.2)) },
        { s: [0.54, h * 0.2, 0.88], p: [px + 0.28, gy + h * 0.9, WELL[1] + dz + 0.46], c: 0x5a4636 });
    }
    const wm = mesh(wall, px, gy, WELL[1]);
    let tWell = -1, tBridge = -1;
    return {
      sets: { well() { tWell = 0; }, bridge() { tBridge = 0; } },
      update(dt) {
        if (tWell >= 0 && tWell < 2) { tWell += dt; wm.rotation.z = 1.38 * Math.min(1, (tWell / 1.1) ** 2); }   // tips slowly, then crashes
        if (tBridge >= 0 && tBridge < 12) {
          tBridge += dt;
          for (const p of pieces) {                                              // section by section from the middle out
            const t = tBridge - Math.abs(p.i - (n - 1) / 2) * 0.16, s = ((p.i * 37) % 11) / 11 - 0.5;
            if (t <= 0) continue;
            const fall = Math.min(t, 0.75), sink = Math.max(0, t - 0.75);
            p.m.position.y = Math.max(-0.35 - sink * 0.12, p.y - 4.9 * fall * fall);
            p.m.position.x = s * 1.5 * fall + sink * 0.7;                          // then the current takes it downstream
            p.m.rotation.set(s * 1.2 * Math.min(1, t * 1.6), s * 0.5 * Math.min(1, sink * 0.3), (p.i % 2 ? 0.5 : -0.5) * Math.min(1, t * 1.6));
          }
        }
      },
    };
  },
};
