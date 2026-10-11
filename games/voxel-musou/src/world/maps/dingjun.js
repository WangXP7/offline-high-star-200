// 定軍山 (Mount Dingjun, 219 AD) laid out along +Z, ≈ 370 m from the Shu camp to the summit — the DW8 stage shape:
// a wide opening field, a narrowing valley with one chokepoint, a gate you break through, then the climb to the
// enemy commander on the high ground, who stands where the whole map can see him. The HOME map (title / select).
//   蜀軍本陣  Shu main camp       z -156 … -119   h 0    palisade, tents, 蜀 banners; story start
//   漢水渡口  Han River ford      z -120 …  -44   h 0    open plain cut by the river: three shallow crossings
//   山道      mountain pass       z  -52 …   80   h 1→12 valley mouth → basin (free-mode arena, origin) → climb →
//                                                        chokepoint (z ≈ 62, 14 m wide, barricade gate 'pass')
//   魏軍營寨  Wei fortified camp  z   76 …  140   h 12   plaza at the castle wall (face z = WALL_Z), gate passage at
//                                                        GATE_X (gate 'weiCamp'), courtyard behind it
//   (ramp)    switchback          z  134 …  180   h 12→28 up the west flank (barricade gate 'summit' at x ≈ -20)
//   定軍山頂  summit plateau      z  168 …  220   h 28   夏侯淵's command tent, drums, the great 夏侯 banner
// Golden hour (the sky / light / post defaults): a low sun straight up the valley between the castle's corner tower
// and the camp-shelf watchtowers. Format: ./index.js.
const WALL_Z = 100, GATE_X = -10;      // castle wall face / gate centre
const CAMP_H = 12, SUMMIT_H = 28;      // plateau heights (m): the camp (the castle set sits on it), the summit

export default {
  id: 'dingjun',
  name: { zh: '定軍山', en: 'Mount Dingjun' },
  grid: [-112, -178, 112, 238],
  pieces: [
    { id: 'honjin', rect: [-24, -156, 24, -119], h: 0, rise: 5 },
    { id: 'ford', rect: [-44, -120, 44, -44], h: 0, edge: 3, rise: 9 },
    { id: 'mouth', path: [[0, -52, 15, 0], [0, -30, 15, 1.2]], edge: 2, rise: 22 },
    { id: 'basin', ell: [0, 0, 38, 36], h: (x, z) => 3 + z / 18, edge: 3, rise: 26 },
    { id: 'climb', path: [[0, 28, 13, 4.6], [7, 44, 11, 7], [4, 55, 7.5, 9], [2, 64, 7, 10.2], [-5, 72, 11, 11.4], [-10, 80, 14, 12]], edge: 1.5, rise: 34 },
    { id: 'plaza', rect: [-29, 76, 4, 96.5], h: CAMP_H, rise: 3 },
    { id: 'gateway', rect: [GATE_X - 3.4, 95, GATE_X + 3.4, 111], h: CAMP_H, rise: 3 },
    { id: 'court', rect: [-42, 110, 5, 140], h: CAMP_H, rise: 3.5 },
    { id: 'ramp', path: [[-30, 133, 6, CAMP_H], [-41, 145, 6, 13.5], [-45, 159, 6, 18], [-33, 171, 6, 23], [-17, 176.5, 6, 26.5], [-6, 180, 7, SUMMIT_H]], rise: 16 },
    { id: 'summit', ell: [2, 194, 26, 26], h: SUMMIT_H, edge: 1.5, rise: 40, drop: 212 },   // the vista: a rim, then the drop
  ],
  // the 本陣 front palisade either side of its gate
  carve: [[-25, -121.5, -9, -117.5], [9, -121.5, 25, -117.5]],
  // 夏侯淵's pavilion platform on the summit (stair, balustrade and step braziers included: 1.2 m of stone nobody may
  // walk through); the Wei camp courtyard's command table with its stools and brazier (solid set pieces)
  props: [[-4.8, 201.8, 12.8, 214.8], [-6.5, 127.6, -1.5, 132.4]],
  zones: [
    { id: 'honjin', name: { zh: '蜀軍本陣', en: 'Shu Main Camp' }, x: 0, z: -138, w: 52, d: 40 },
    { id: 'ford', name: { zh: '漢水渡口', en: 'Han River Ford' }, x: 0, z: -81, w: 96, d: 74 },
    { id: 'pass', name: { zh: '山道', en: 'Mountain Pass' }, x: 0, z: 16, w: 84, d: 124 },
    { id: 'camp', name: { zh: '魏軍營寨', en: 'Wei Fortified Camp' }, x: -16, z: 123, w: 76, d: 90 },
    { id: 'summit', name: { zh: '定軍山頂', en: 'Dingjun Summit' }, x: 2, z: 194, r: 34 },
  ],
  route: [[0, -150], [0, -118], [0, -86], [0, -46], [0, 0], [0, 28], [7, 44], [4, 55], [2, 64], [-5, 72], [-10, 84], [GATE_X, 104],
    [GATE_X, 118], [-22, 128], [-30, 133], [-41, 145], [-45, 159], [-33, 171], [-17, 176.5], [-6, 180], [2, 192]],
  gates: {
    pass: { rect: [-14, 59.5, 20, 62.5], name: { zh: '山道柵', en: 'Pass Barricade' }, kind: 'barricade', at: [2, 61, 0, 11] },
    weiCamp: { rect: [GATE_X - 7, 99.5, GATE_X + 7, 102.5], name: { zh: '營寨門', en: 'Camp Gate' }, kind: 'doors' },
    summit: { rect: [-21.5, 166, -18.5, 186], name: { zh: '山頂柵', en: 'Summit Barricade' }, kind: 'barricade', at: [-20, 176, Math.PI / 2, 9] },
  },
  anchors: { gate: [GATE_X, WALL_Z] },   // ch1.js ['gate', dx, dz]: metres from the camp gate
  // story: at the head of the Shu ranks just inside the 本陣 gate, facing the ford through it (tilt levels the camera a
  // little so the gate towers, standards and the valley fill the top of the first frame, not the paving); free: the
  // pass basin
  spawn: { story: { x: 0, z: -127, yaw: 0, tilt: -0.09 }, free: { x: 0, z: 0, yaw: 0 } },
  // the Han River: deep pools between three shallow crossings; bed -0.45 at the fords, -1.4 in the pools
  water: { along: 'x', c: (x) => -86 + 5 * Math.sin(x * 0.055 + 0.6), dc: (x) => 5 * 0.055 * Math.cos(x * 0.055 + 0.6), hw: 4.5, bed: [1.4, 0.45],
    fords: [[-30, -18], [-6, 6], [18, 30]], y: -0.2 },
  // clear fight disc; haze reaches 63 % 28 + 290 m out: the far zones of the 370 m valley stay silhouettes, the summit a
  // dark shoulder under its beacon smoke from the Shu camp
  sky: {}, fog: [36, 330], post: {},
  // key: the select screen's warm key rests by the ford wreck; fill: the sun sits straight behind 夏侯淵's pavilion,
  // so its lacquer and gilt face the lens in shade — a warm low fill eases in on the summit approach (z 160 → 188)
  light: { key: [-33, -64], fill: [160, 188, 1.5] },
  castle: { gate: 'weiCamp', wallZ: WALL_Z, gateX: GATE_X, x0: -64, y: CAMP_H },
  terrain: {
    pave: (x, z) => (z > 76 && z < 140 && x > -30 && x < 5 ? 0.55 : 0)      // plaza + courtyard: worn paving
      + (Math.hypot(x - 2, z - 194) < 13 ? 0.7 : 0)                          // summit parade ground
      + (Math.hypot(x, z + 140) < 11 ? 0.6 : 0),                             // 本陣 square
    bare: (x, z) => z > 74 && z < 142 && x > -44 && x < 7,                   // the Wei camp: beaten earth
    rock: (h, x, z) => h - 3 - z / 18,                                       // bare rock above the basin's slope
    // burnt ground where the camp and the summit were fought over (courtyard, parade ground, round the beacon)
    scorch: { n: 26, area: [-40, -110, 40, 200], spots: [[-20, 132, 0.8], [-3, 116, 0.7], [-30, 121, 0.6], [-9, 186, 0.8], [13, 188, 0.7], [15, 215, 1.1], [-4, 176, 0.6]] },
    rubble: [-60, -156, 60, 215],
    pines: [60, 200],
    mountains: { peakA: -0.1, peak: 34 },                                    // Dingjun's peak behind the summit
  },
  // burning wrecks on the field, near the walkable edges so the fight stays clear: [x, z, scale]
  fires: [[-33, -64, 1.2], [32, -58, 1.1], [-30, 8, 1.3], [30, -8, 1.2], [-22, -28, 1.0], [24, 24, 1.1], [15, 40, 1.0],
    [-36, 126, 1.2], [-12, 202, 1.1]],
  // firelight: gate fires, the summit's step braziers and beacon, the courtyard braziers, field wrecks
  lightSites: [[GATE_X - 6.5, 2.2, WALL_Z - 3.5, 30, 11], [GATE_X + 7, 2.2, WALL_Z - 3.5, 30, 11], [-30, 2.2, 8, 30, 11], [30, 2.2, -8, 26, 10],
    [-2.5, 1.9, 202.0, 30, 12], [10.5, 1.9, 202.0, 30, 12], [15, 9, 213, 60, 18], [-2.2, 1.9, 127.6, 30, 10], [-14, 1.9, 137.2, 26, 10], [-8, 1.9, 196, 24, 10]],
  hq: [4, 208],
  stage: { title: [0, 23.44], select: [0, -36] },   // the pass road: the key-art pair up it; the select officer at its foot

  dress(k) {
    const { r, mats, props, poles, shade } = k;
    const han = k.banner('漢', { bg: '#2f5a3a', fg: '#e8d6a8', border: '#c7a574', w: 128, h: 256, seed: 8 });
    const xiahou = k.banner('夏侯', { bg: '#1c1414', fg: '#d8b060', border: '#7d2a1f', w: 160, h: 320, seed: 9 });
    // ---- 蜀軍本陣: palisade round three sides and either side of the gate, gate towers, tents, HQ, standards
    k.palisade([[-25.5, -118], [-25.5, -157.5], [25.5, -157.5], [25.5, -118]]);
    k.palisade([[-25, -119.5], [-10.5, -119.5]]);
    k.palisade([[10.5, -119.5], [25, -119.5]]);
    k.tower(-11.8, -119.5, 5.5, 1.3, mats.allyFlag); k.tower(11.8, -119.5, 5.5, 1.3, mats.allyFlag);
    for (let z = -150; z <= -127; z += 7.5) for (const sx of [-1, 1]) k.tent(sx * 19.5, z + r.range(-1, 1), Math.PI / 2 + r.range(-0.1, 0.1), r.chance(0.35) ? 0x7a8a66 : 0xb8a684, 4.6, 5.6);
    { const gy = k.ground(0, -152);
      props.push({ s: [13, 0.9, 8], p: [0, gy + 0.45, -152.5], c: 0x6a5a50 });
      k.pagoda(0, gy + 0.9, -152.5, 10.5, 6, 1, 0.9); }
    for (const sx of [-1, 1]) { k.standard(sx * 7, -148.5, 1.3, han, 10, [0, -120]); k.standard(sx * 21, -154, 1.1, mats.ally, 8.5, [0, -136]); k.standard(sx * 21, -123, 1.1, mats.ally, 8.5, [0, -136]); }
    for (const [x, z] of [[-6, -128], [6, -128], [-6, -143], [6, -143], [-15.5, -121.5], [15.5, -121.5]]) k.lamp(x, z, 0.6);
    for (let i = 0; i < 10; i++) {                                               // crates stacked against the palisade
      const back = r.chance(0.4), x = back ? r.range(-22, 22) : (r.chance(0.5) ? -1 : 1) * 23.6, z = back ? -155.6 : r.range(-150, -124);
      const L = k.local(x, k.ground(x, z), z, r.range(0, 3));
      L(0, 0.45, 0, [0.9, 0.9, 0.9], shade(0x6e5038, r.range(0.8, 1.1))); L(0.3, 1.2, 0.1, [0.7, 0.6, 0.7], shade(0x5a4030, r.range(0.8, 1.1)));
    }
    // ---- 漢水渡口: reeds on the banks, the Shu supply train on the south side, wrecks and Wei standards to the north
    k.reeds();
    for (const [x, z, yaw] of [[-38, -112, 0.4], [-33, -106, 0.2], [36, -110, -0.3], [31, -114, -0.5], [-24, -115, 1.2]]) k.cart(x, z, yaw);
    for (const [x, z, yaw] of [[-33, -64, 2.2], [32, -58, 0.8]]) k.cart(x, z, yaw, true);
    for (const [x, z] of [[-40, -115], [40, -115], [-12, -116], [12, -116]]) k.standard(x, z, 1.1, mats.ally);
    for (const [x, z] of [[-41, -52], [41, -54], [-22, -46], [22, -46]]) k.standard(x, z, 1.1, r.chance(0.2) ? mats.pennant : mats.foe);
    // ---- 山道: standards round the basin rim and along the climb, towers + archers on the cliffs over the chokepoint
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.2, x = Math.sin(a) * 36.5, z = Math.cos(a) * 34.5;
      if (Math.abs(x) < 16 && Math.abs(z) > 28) continue;                      // keep the road mouths clear
      k.standard(x, z, r.range(1, 1.2), r.chance(0.15) ? mats.pennant : mats.foe);
    }
    // (none at the foot of the climb: the title key art stands there, its sky gap above the officers' heads kept clear)
    for (const [x, z] of [[-16, -42], [16, -42], [19, 47], [-4, 53], [12, 55], [-11, 72], [4, 74]]) k.standard(x, z, 1.05, mats.foe, 7.6);
    k.tower(-10.5, 60, 5.5, 1.3); k.tower(16, 57, 6, 1.35);
    k.barricade('pass');
    k.burn(-1, 61.5, 1.1, 'pass'); k.burn(6.5, 61, 1.0, 'pass');
    // ---- plaza before the wall: the siege line of standards, rubble at the wall foot (the castle adds ladders + fires)
    for (const [x, z, s] of [[-27, 79, 1.05], [2, 80, 1], [-27, 93, 1.1], [3, 91, 1.05]]) k.standard(x, z, s, mats.foe, 7.3 * s);
    for (let i = 0; i < 60; i++) {
      const x = r.range(-28, 4), s = r.range(0.3, 0.9);
      if (Math.abs(x - GATE_X) < 6) continue;
      props.push({ s: [s, s * r.range(0.5, 1), s], p: [x, CAMP_H + s * 0.35, WALL_Z - r.range(0.6, 3.5)], r: [r.range(-0.3, 0.3), r.range(0, 3), r.range(-0.3, 0.3)], c: shade(0x5e4e4c, r.range(0.75, 1.15)) });
    }
    // ---- 魏軍營寨 courtyard: palisade on the open sides (the ramp leaves through the north-west corner), tents beyond
    k.palisade([[-43.5, 109.5], [-43.5, 135]]);
    k.palisade([[-29.5, 141], [6.5, 141]]);
    for (let z = 113; z < 136; z += 7) k.tent(-52 + r.range(-2, 2), z, Math.PI / 2 + r.range(-0.2, 0.2), r.chance(0.5) ? 0x8a3025 : 0xb09a7c);
    for (let x = -22; x < 6; x += 8) k.tent(x + r.range(-1.5, 1.5), 148 + r.range(-1, 1), r.range(-0.2, 0.2), r.chance(0.5) ? 0x8a3025 : 0xb09a7c);
    for (const [x, z] of [[-39, 114], [2, 114], [-39, 136], [2, 136], [-14, 138]]) k.lamp(x, z, 0.6);
    for (const [x, z] of [[-41, 111.5], [-41, 138.5], [4, 138.5], [-20, 139]]) k.standard(x, z, 1.1, mats.foe, 8.5, [-18, 125]);
    for (let i = 0; i < 6; i++) {                                                // spear racks against the north palisade
      const x = r.range(-26, 3), L = k.local(x, k.ground(x, 140), 140, 0);
      L(0, 0.9, 0, [2.2, 0.12, 0.12], 0x3a2618); L(0, 0.2, 0, [2.2, 0.12, 0.12], 0x3a2618);
      for (let q = 0; q < 6; q++) L(-0.9 + q * 0.36, 1.3, -0.1, [0.06, 2.6, 0.06], 0x4a3222, [-0.15, 0, 0]);
    }
    // the camp is lived in: supply piles along the palisades, shield racks, the officers' command table under two
    // standards, a war drum by the east wall, scorched earth (terrain) and the fallen (aftermath)
    for (const [x, z, yaw] of [[2.5, 113, Math.PI / 2], [2.5, 124, Math.PI / 2], [-40.5, 128, -Math.PI / 2], [-6, 138.6, Math.PI], [-26, 138.6, Math.PI]]) k.supplies(x, z, yaw, r.int(5, 7));
    for (const [x, z, yaw] of [[-41.2, 118, Math.PI / 2], [-41.2, 122.5, Math.PI / 2], [-14, 139.3, Math.PI], [3.4, 131, -Math.PI / 2]]) k.shieldRack(x, z, yaw);
    k.commandTable(-4, 130.5, 0.2);
    k.standard(-7.5, 134.5, 1.0, xiahou, 7.5, [-4, 124]); k.standard(-0.5, 134.5, 1.0, mats.foe, 7.5, [-4, 124]);
    k.lamp(-2.2, 128.3, 0.55); k.lamp(-30, 116, 0.55);                           // (the table + this brazier: a map prop cut-out)
    k.supplies(-33, 113, 0.1, 6); k.supplies(-16, 138.6, Math.PI, 6); k.supplies(0.5, 138.6, Math.PI, 5);
    k.drum(1.5, 119, -Math.PI / 2); k.drum(-24, 137.5, 0.15);
    // watchtowers on the camp shelf beyond the flank wall (the old concept view: the sun between the corner tower and them)
    k.tower(35, 114, 6.5, 1.5); k.tower(51, 125, 8, 1.55); k.tower(60, 103, 6, 1.45);
    // ---- ramp: torches on both sides, a flag at each bend, the summit barricade
    const rampPts = [[-30, 133], [-41, 145], [-45, 159], [-33, 171], [-17, 176.5], [-6, 180]];
    for (let i = 0; i < rampPts.length - 1; i++) {
      const [ax, az] = rampPts[i], [bx, bz] = rampPts[i + 1], L = Math.hypot(bx - ax, bz - az), nx = (bz - az) / L, nz = -(bx - ax) / L;
      for (let d = 3; d < L; d += 8) for (const sd of [-1, 1]) {
        const x = ax + (bx - ax) * d / L + nx * sd * 6.8, z = az + (bz - az) * d / L + nz * sd * 6.8;
        if (k.inAt(x, z) > -0.5 || k.inAt(x, z) < -3) continue;                 // on the verge, not in the rock
        k.fire(...k.brazier(x, z, 0.45));
      }
      if (i) k.flag(ax + nx * 7.5, k.ground(ax, az), az + nz * 7.5, 3.4, mats.pennant);
    }
    k.barricade('summit');
    k.burn(-20, 172.5, 1.0, 'summit'); k.burn(-20.5, 179.5, 1.1, 'summit');
    // ---- 定軍山頂: 夏侯淵's pavilion on a stone platform, war drums, the great 夏侯 banner, the beacon, rim standards
    { const gy = k.ground(4, 209);
      props.push({ s: [17, 1.2, 11], p: [4, gy + 0.6, 209], c: 0x6a5a50 }, { s: [17.2, 0.1, 0.16], p: [4, gy + 1.2, 203.5], c: 0x9a8a78 });
      for (let q = 0; q < 3; q++) {                                            // stepped stair, pale worn nosing
        const top = 0.4 * (q + 1), d = 1.35 - q * 0.45, z = 203.5 - d / 2 - 0.01;
        props.push({ s: [6.2 - q * 0.2, top, d], p: [4, gy + top / 2, z - 0.001 * q], c: shade(0x5e4e46, 1 + q * 0.04) }, { s: [6.2 - q * 0.2, 0.06, 0.14], p: [4, gy + top, 203.5 - d + 0.07], c: 0x9a8a78 });
      }
      for (const [x0, x1] of [[-4.4, 0.8], [7.2, 12.4]]) {                     // red lacquer balustrade either side of the stair
        props.push({ s: [x1 - x0, 0.12, 0.12], p: [(x0 + x1) / 2, gy + 1.95, 203.35], c: 0x8a2a1c }, { s: [x1 - x0, 0.08, 0.08], p: [(x0 + x1) / 2, gy + 1.5, 203.35], c: 0x6a2016 });
        for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 4) props.push({ s: [0.18, 0.85, 0.18], p: [x, gy + 1.62, 203.35], c: 0x7a2418 }, { s: [0.24, 0.12, 0.24], p: [x, gy + 2.08, 203.35], c: 0xa07c34 });
      }
      for (const x of [0.2, 7.8]) {                                              // stone lanterns at the stair foot, a small flame inside
        const lz = 202.45;
        props.push({ s: [0.7, 0.3, 0.7], p: [x, gy + 0.15, lz], c: 0x6a5a50 }, { s: [0.3, 0.8, 0.3], p: [x, gy + 0.7, lz], c: 0x6a5a50 },
          { s: [0.62, 0.08, 0.62], p: [x, gy + 1.12, lz], c: 0x5a4c44 }, { s: [0.9, 0.16, 0.9], p: [x, gy + 1.62, lz], c: 0x5a4c44 }, { s: [0.3, 0.2, 0.3], p: [x, gy + 1.8, lz], c: 0x6a5a50 });
        for (const [dx, dz] of [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]]) props.push({ s: [0.1, 0.42, 0.1], p: [x + dx, gy + 1.35, lz + dz], c: 0x5a4c44 });
        k.fire(x, gy + 1.16, lz, 0.2, false);
      }
      k.pagoda(4, gy + 1.2, 209, 13, 8, 2, 1);
      // paper lanterns under both eaves: self-lit, they carry the backlit facade (the sun sits straight behind it)
      for (const lx of [-4.6, -1.6, 1.6, 4.6]) k.lantern(4 + lx, gy + 4.05, 205.3, 1.15);
      for (const lx of [-2.6, 0, 2.6]) k.lantern(4 + lx, gy + 7.2, 206.4, 0.95);
      // war drums on the terrace either side of the stair, lit by the step braziers (on the stone: nobody walks there)
      k.drum(-2.5, 205.4, -Math.PI / 2 + 0.35, gy + 1.2); k.drum(10.5, 205.4, Math.PI / 2 - 0.35, gy + 1.2); }   // side-on: frame to the lens
    { const x = -6, z = 213, gy = k.ground(x, z), P = 20;
      poles.push({ s: [0.4, P, 0.4], p: [x, gy + P / 2, z], c: 0x2e1d15 }, { s: [5.6, 0.3, 0.3], p: [x + 2.6, gy + P - 0.5, z], c: 0x2e1d15 }, { s: [0.3, 1.4, 0.3], p: [x, gy + P + 0.7, z], c: 0xc9a040 });
      k.cloth(xiahou, 5, 10, 'hang', x + 0.2, gy + P - 0.7, z, 0.1); }
    k.fire(15, k.beaconTower(15, 215), 215, 3.2, true);                         // the beacon: its smoke marks the goal from the valley
    // braziers flanking the pavilion steps (they light its backlit front), and a jagged crest of voxel crags round the
    // back of the rim so the summit reads as a mountain top against the sky
    // (the pavilion terrace is a map prop cut-out; nothing else stands on the walkable parade ground but thin standards)
    for (const [x, z] of [[-2.5, 203], [10.5, 203]]) k.lamp(x, z, 0.85);
    for (let i = 0; i < 34; i++) {
      const a = -2.0 + (i / 33) * 4.0 + r.range(-0.04, 0.04), rr = r.range(27.5, 32), x = 2 + Math.sin(a) * rr, z = 194 + Math.cos(a) * rr;
      if (k.inAt(x, z) > -1.5 || Math.hypot(x + 6, z - 227) < 9 || Math.hypot(x - 20, z - 229) < 9) continue;
      const gy = k.topAt(x, z), h = r.range(2, 6.5), w = r.range(1.6, 3.2);
      props.push({ s: [w, h, w * r.range(0.7, 1.2)], p: [x, gy + h / 2 - 0.3, z], r: [r.range(-0.12, 0.12), r.range(0, 3), r.range(-0.12, 0.12)], c: shade(0x6a5448, r.range(0.75, 1.05)) });
      props.push({ s: [w * 0.55, h * 0.5, w * 0.55], p: [x + r.range(-0.4, 0.4), gy + h * 1.1 - 0.4, z + r.range(-0.4, 0.4)], r: [r.range(-0.2, 0.2), r.range(0, 3), r.range(-0.2, 0.2)], c: shade(0x76604f, r.range(0.8, 1.05)) });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3, x = 2 + Math.sin(a) * 23.5, z = 194 + Math.cos(a) * 23.5;
      if (Math.hypot(x + 10, z - 178) < 10) continue;                          // the ramp's arrival
      k.standard(x, z, 1.15, r.chance(0.3) ? mats.pennant : mats.foe, 8.5, [2, 194]);
    }
    k.palisade([[-16, 214], [-6, 219.5], [10, 220], [22, 212]]);
    for (const [x, z] of [[-8, 196], [14, 194], [0, 186]]) k.lamp(x, z, 0.7);

    // ---- the field: burning wrecks (scorch: terrain), arrow volleys, the fallen's gear, torch posts along the ford and pass
    k.wrecks();
    k.arrows([-40, -115, 40, 200]);
    k.debris([-44, -118, 44, 215]);
    k.torchPosts(-118, 70);

    // ---- the castle's banners (castle frame → + its plateau): 夏侯 drape beside the gate, red flags along the wall walk
    const c = k.castle, wy = CAMP_H + c.H;
    k.cloth(xiahou, 6, 9.5, 'drape', GATE_X - 18 + 3, wy - 0.3, WALL_Z - 0.35, Math.PI);   // faces the plaza (-Z)
    poles.push({ s: [7.1, 0.35, 0.35], p: [GATE_X - 18, wy - 0.15, WALL_Z - 0.4], c: 0x3b2a1e });
    for (let x = c.x0 + 4; x < c.x1 - 4; x += 16) if (Math.abs(x - GATE_X) > 12) k.flag(x + r.range(-2, 2), wy, WALL_Z + 0.8, 3.2, mats.pennant);
    k.flag(GATE_X - 7, wy + 0.6, WALL_Z + 1, 9, mats.pennant);
    k.flag(GATE_X + 7, wy + 0.6, WALL_Z + 1, 9, mats.pennant);
    k.flag(c.cornerX + 4, CAMP_H + c.towerH, WALL_Z - 0.5, 4, mats.pennant);

    // ---- reserve armies off the walkable ground: 蜀 behind the 本陣 and on the ford hills, 魏 on the camp shelf,
    // archers lining the cliffs over the chokepoint, a guard on the summit's back shoulder
    for (const [x, z, f] of [[-32, -170, 0], [0, -171, 0], [32, -170, 0], [-58, -138, 0.9], [58, -136, -0.9], [-60, -100, 1.3], [60, -96, -1.3]]) k.formation('ally', x, z, f, r.int(10, 16), r.int(5, 8));
    for (const [x, z, f] of [[30, 124, -1.4], [44, 136, -1.6], [42, 106, -1.2], [60, 118, -1.5], [-58, 124, 1.5], [-6, 227, Math.PI], [20, 229, Math.PI]]) k.formation('foe', x, z, f, r.int(9, 14), r.int(4, 7));
    const rims = [[], []];
    k.troops('foe', rims[0]); k.troops('foe', rims[1]);
    for (let z = 44; z < 78; z += 1.6) for (const x of [-15 - (z - 44) * 0.1, 21 - (z - 44) * 0.15]) {   // archers on both rims, facing into the pass
      const ax = x + r.range(-1.2, 1.2);
      if (k.inAt(ax, z) > -3) continue;
      rims[x < 0 ? 0 : 1].push({ x: ax, y: k.topAt(ax, z), z, yaw: (x < 0 ? Math.PI / 2 : -Math.PI / 2) + r.range(-0.3, 0.3), ph: r.range(0, 6.28) });
    }
    // the fallen in the courtyard, the plaza, on the summit and round the field wrecks; trampled standards; dust banks
    // drifting at the wall foot, over the ford and the basin (backlit haze in the middle distance)
    k.aftermath({ fallen: [[-40, 3, 112, 138, 16], [-27, 3, 78, 95, 8], [-20, 24, 180, 210, 14], [-40, 40, -110, 60, 22]],
      standards: [10, -40, -110, 40, 200], dust: { n: 34, area: [-50, -120, 50, 40], wall: [8, -40, 10, WALL_Z] } });
    // far-off burning 60-140 m off the route: warm points of fire in the hazy band — a battlefield ablaze to the horizon
    k.farFires([[-72, -96], [70, -62], [-78, 28], [72, 148], [-74, 172], [40, 236], [-86, -150]]);
  },
};

