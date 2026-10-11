// Battlefield registry + the map def format. A map is one plain module `src/world/maps/<id>.js` whose default export is
// the def below, registered in MAPS. world.load(id, { army }) (render) swaps it in under the loading card: map.js
// loadMap(def) (sim: walk / height grids, gates, water, road), then the scene set (sky, terrain, water, castle,
// dressing, set pieces) into a fresh root group; the old set is disposed once the new one has compiled. Menus (title /
// select) always stand on HOME.
//
// Conventions: metres; +Z is the way forward (story triggers, stage limits, crowd zMax, minimap north and camera yaw 0
// all assume it); everything within ±230 m of the origin (crowd hash / arrow grid). Sim y is height above ground, so a
// def never adds ground() to sim positions. Keep ~30 m between a plateau or full-height cliff and the grid edge (the
// rock settles onto the outer plain there). Required keys: id, name, grid, pieces, zones, route, spawn; the rest
// defaults to nothing (no water / castle / dressing / fires) and 定軍山's golden-hour atmosphere. Worked example:
// ./dingjun.js.
//
// ---- sim (map.js)
//   id, name: { zh, en }                 name.zh is the minimap seal
//   grid: [x0, z0, x1, z1]               extents of the 2 m walk / height grid (even numbers; the terrain mesh covers it)
//   pieces: [{ id, rect | ell | path, h, edge, rise, drop }]   the walkable ground, a union of:
//       rect: [x0, z0, x1, z1] | ell: [cx, cz, rx, rz]         h: plateau height (m) or (x, z) => m (a slope)
//       path: [[x, z, halfWidth, h], …]  a width- and height-varying road (h per point, no `h` key)
//       edge: m of noise wobble on the boundary (natural edges; 0 = straight walls)
//       rise: m the rock climbs toward outside the piece (cliff height × 0.65-1.35 ridge noise; default 8; small = low
//             ridges / a palisade line, 20-40 = a canyon)
//       drop: z — outside the piece and south of this z, a 1 m rim then a fall-away (a plateau's vista edge) instead of rock
//     The piece with the largest inside value owns a cell (its height wins), so pieces at different heights may only
//     touch where their heights agree (path ends). Pieces tile the field: a small plateau nested inside a big rect is
//     swallowed by it (deeper inside the big one) and stays at the big one's height. ≤ 256 pieces.
//   carve: [[x0, z0, x1, z1], …]         non-walkable cut-outs (palisade lines, wall stubs)
//   props: [[x0, z0, x1, z1], …]         solid set-piece footprints: carved AND no rock / boulders grow there
//   zones: [{ id, name: { zh, en }, x, z, w, d } | { id, name, x, z, r }]   named areas (minimap label, story
//                                        positions [zoneId, fx, fz] = fractions of the half extents, `zone` triggers use
//                                        the near (-Z) edge)
//   route: [[x, z], …]                   the road through every zone: allies follow it, Shu columns run up it, paving /
//                                        road dust / torch posts / the minimap trail
//   gates: { id: { rect: [x0, z0, x1, z1], name: { zh, en }, kind: 'doors' | 'barricade', at } }
//       a closed gate is that rect cut out of the walk field (make it wider than its corridor); story opens / closes
//       them (map.js setGate; all open at battle start). 'doors': the castle's gate leaves (castle.gate names it);
//       'barricade': at: [x, z, yaw, halfWidth] — the dress must call k.barricade(id) to build it (burns down on open)
//   anchors: { id: [x, z] }              named story positions: beats use [anchorId, dx, dz] (metres from it)
//   spawn: { story: { x, z, yaw, tilt }, free: { x, z, yaw } }   tilt: camera pitch offset (rad); free = the free-mode
//                                        arena centre (the army forms up round it, allies 9 m behind): open ground r ≥ 35 m
//   water: null | { along, c, dc, hw, bed, fords, y, stones, tint }   a band round a centre line:
//       along: 'x' — it runs across the map (a river the lane crosses; centre z = c(x)); 'z' — it runs beside the lane
//              (a long bank / shore; centre x = c(z))
//       c: (a) => m, or a polyline [[x, z], …] sorted along that axis (clamped at its ends); dc: its slope (optional)
//       hw: deep-water half width (default 4.5): off the walk field, open to arrows and the camera boom; the banks,
//           bed, reeds, damp ground, grass and paving margins all follow it (bed carve from hw − 1 to hw + 3, the
//           visible strip reaches hw + 3.3). A wide Yangtze: hw 60 with c(z) out beside the lane.
//       bed: [pool depth, ford depth] m below the plain (default [1.4, 0.45]); y: surface height (default -0.2)
//       fords: [[a0, a1, depth?], …]   walkable crossings along the axis (stepping stones); a negative depth raises a
//              causeway / bridge deck that far above the plain in the middle of the crossing (no stepping stones; an
//              earth deck, full height out to hw − 1 across, gone by hw + 3, its sides 4 m ramps: dress a bridge on it)
//       bedHeight?: (x, z, simHeight) → m   water's rendered bed height for a raised bridge (not an earth causeway);
//              the map's build() applies the same sampler to its ground mesh; sim walk/deck heights stay unchanged
//       stones: scattered boulders (default 40; 0 for open water); tint: { deep, shallow, sun: [r, g, b] }
//
// ---- render (world.js)
//   sky: { … }                           palette keys of sky.js SKY (sunElev, sunAz, sunCore, haze, hazeWarm, glow,
//                                        skyMid, skyTop, hznSun, hznAway, cloudRose, cloudShade, cloudLit, dust, dustLit,
//                                        dustShade, apCool) merged over the golden-hour defaults
//   fog: [near, far]                     haze start / 63 % distance past it (default [36, 330])
//   light: { hemi: [sky, ground, i], sun: [colour, i], rim: [colour, i], dir: [x, y, z] key-light direction (shadows),
//            fire: firelight colour, key: [x, z] the select screen's warm key (HOME), fill: [z0, z1, i] a warm fill
//            easing in as the focus goes from z0 to z1 }            (defaults: 定軍山's)
//   post: { … }                          post.js look overrides (keys of its P: exposure, sat, bloom, rays, …)
//   castle: null | { gate, wallZ, gateX, x0, y }   castle.js: wall face at z = wallZ facing -Z, from x0 to gateX + 18
//                                        (corner tower beyond), standing on ground y (a plateau height); gate = its
//                                        'doors' gate id
//   terrain: { pave(x, z) → paving boost (squares), bare(x, z) → no grass, rock(h, x, z) → m above the valley floor
//              (bare rock tint), scorch: { n, area: [x0, z0, x1, z1], spots: [[x, z, s]] }, rubble: area, pines: [z0, z1]
//              (denser toward z1), mountains: { peakA: bearing (rad, 0 = +Z), peak: m }, cliff: { rock, dark, top,
//              moss, grassy } strata palette }
//   fires: [[x, z, scale], …]            burning wrecks (scorched ground; k.wrecks() dresses them)
//   lightSites: [[x, yAboveGround, z, intensity, range], …]   firelight: 3 point lights follow the nearest sites
//   hq: [x, z] | null                    minimap enemy-HQ marker;  minimap: { walls: [[x0, z0, x1, z1], …] } extra walls
//                                        (the castle's are drawn from castle)
//   stage: { title: [x, z], select: [x, z] }   HOME only: the title key-art point and the select officer's point
//   dress(k)                             the authored layout, through the dressing kit k (below)
//   build(root, k) → { update(dt, game)?, sets?: { name() } }   optional custom set pieces (ships, a bridge, a twin-tower
//                                        gate …) added to root; `sets` are named scene changes the story triggers
//                                        (story:set {id}, e.g. 'ignite'); may add fires / light sites through k
//
// ---- the dressing kit k (dressing.js). Every placement draws from one layout rng, k.r, in call order (a def's
// layout is deterministic; reordering calls reshuffles everything after them).
//   k.r, k.def, k.army ({ foe, ally }: glyph, flag, banner?), k.castle (castle params + H, cornerX, towerH, x0, x1) | null
//   k.mats: { foe, ally, allyFlag, pennant }   cloth in army colours; k.banner(glyph, { bg, fg, border, w, h, tatter,
//           seed }) → a custom cloth material ('' = blank, two glyphs stack)
//   k.props / k.poles: box arrays merged into one mesh ({ s: [w, h, d], p: [x, y, z], r?: [rx, ry, rz], c: hex });
//   k.glow: self-lit box array; k.local(x0, y0, z0, yaw) → L(lx, ly, lz, size, colour, rot) box pusher; k.shade(hex, f)
//   k.ground / k.topAt (ground incl. rock tops) / k.inAt (walk inside value) / k.routeNear / k.routeDist / k.waterD
//   k.standard(x, z, s, mat = foe, poleH, face = road point) · k.flag(x, y, z, h, mat = allyFlag) · k.tower(x, z, h, s,
//   mat = pennant) watchtower · k.cloth(mat, w, h, 'hang' | 'flag' | 'drape', x, y, z, yaw)
//   k.palisade([[x, z], …]) · k.tent(x, z, yaw, colour, w, d) · k.cart(x, z, yaw, burnt) · k.supplies(x, z, yaw, n) ·
//   k.shieldRack(x, z, yaw) · k.commandTable(x, z, yaw) · k.drum(x, z, yaw, y) · k.beaconTower(x, z) → fire y ·
//   k.pagoda(x, y, z, w, d, tiers, s) · k.lantern(x, y, z, s) paper lantern · k.barricade(gateId)
//   fires: k.burn(x, z, s, gate?) ground fire · k.lamp(x, z, s) brazier + fire · k.brazier(x, z, s) → spot ·
//   k.fire(x, y, z, s, smoke = s ≥ 1.3, gate = null, wall = false) raw (gate: a gate id — burns once it is open — or a
//   () => bool switch for set pieces) · k.farFires([[x, z], …], s) · k.wrecks() at def.fires
//   k.formation('foe' | 'ally', cx, cz, face, cols, rows, gap) reserve troops off the walk field · k.troops(side, list)
//   k.reeds() along the water's banks · k.arrows(area, n) · k.debris(area, n, tries) · k.torchPosts(z0, z1) along the
//   road · k.aftermath({ fallen: [[x0, x1, z0, z1, n], …], standards: [n, x0, z0, x1, z1], dust: { n, area, wall:
//   [n, x0, x1, z] } }) — after every formation
//   k.sites: the world's firelight sites [{ x, y (world height), z, i, d }] (a set piece may push sites or change their i)
import dingjun from './dingjun.js';
import hulao from './hulao.js';
import changban from './changban.js';
import chibi from './chibi.js';

export const MAPS = { hulao, changban, chibi, dingjun };
/** The map the menus stand on (title / select) and free mode's default. */
export const HOME = 'dingjun';
