// The battlefield scene (render-only): a persistent shell — hemisphere / sun (shadow) / rim / fill lights, three
// firelights + the select screen's 'stage-key', scene.fog (always a THREE.Fog) and the background — plus the loaded
// map's set in one `root` group: sky dome, voxel terrain with its cliffs, the water, the castle, the dressing and the
// map's own set pieces (maps/index.js: the def format). world.load(id, { army }) swaps maps in the page (under the
// loading card / ink): map.js loadMap, then setAtmo + the light / fog / post look re-tuned in place (the light rig and
// fog type never change, so no program recompiles for them), then the new set is built; the old root is disposed on
// the next update — after the caller compiled the new set, so programs both sets share never drop to zero users.
// Never touches sim state (it reads the gate states; the water reads who wades); all animation is a pure function of
// render time. story:set {id} runs the current map's build().sets[id].
import * as THREE from 'three';
import { SUN_DIR, HAZE, installHaze, createSky, setAtmo } from './sky.js';
import { buildTerrain, GRASS_TIME } from './terrain.js';
import { buildCastle } from './castle.js';
import { createRiver } from './river.js';
import { buildDressing } from './dressing.js';
import { GATES, ground, smooth, loadMap } from './map.js';
import { MAPS, HOME } from './maps/index.js';
import { on } from '../core/events.js';

// the default light rig (定軍山's golden hour): key light from behind-left of the up-valley view, higher than the visible
// sun so the ground reads (hard shadows fall toward the camera, soldiers get a warm rim)
const LIGHT = { hemi: [0x9cafd4, 0x9a7a5c, 2.2], sun: [0xffcf9a, 4.0], rim: [0xffa060, 1.6], dir: [0.5, 0.58, 0.64], fire: 0xff8a3a, key: null, fill: null };
const LIGHT_DIR = new THREE.Vector3();

installHaze();
// the sun's shadow fades out over the outer 20 % of its box instead of cutting off: soldiers and props at the box edge
// no longer pop a shadow on / off as the hero moves (must patch before any material compiles)
const SHADOW_BOX = 34;
{
  const RET = '\t\t\treturn mix( 1.0, shadow, shadowIntensity );\n\t\t}\n\t#elif defined( SHADOWMAP_TYPE_VSM )';
  const src = THREE.ShaderChunk.shadowmap_pars_fragment;
  if (src.includes(RET)) THREE.ShaderChunk.shadowmap_pars_fragment = src.replace(RET, RET.replace('\t\t\treturn',
    '\t\t\tshadow = mix( shadow, 1.0, smoothstep( 0.8, 0.98, max( abs( shadowCoord.x - 0.5 ), abs( shadowCoord.y - 0.5 ) ) * 2.0 ) );\n\t\t\treturn'));
}

/** Everything a map's set owns: geometries, materials and their textures (maps, uniforms, closure-held userData.tex). */
function dispose(root) {
  root.traverse((o) => {
    if (o.geometry && !o.isSprite) o.geometry.dispose();                     // (sprites share three's one quad)
    if (o.isInstancedMesh) o.dispose();
    for (const m of [].concat(o.material || [])) {
      for (const v of Object.values(m)) if (v?.isTexture) v.dispose();
      for (const u of Object.values(m.uniforms || {})) if (u.value?.isTexture) u.value.dispose();
      for (const t of m.userData.tex || []) t.dispose();
      m.dispose();
    }
  });
}

export function createWorld(scene, post) {
  scene.background = new THREE.Color();
  scene.fog = new THREE.Fog(new THREE.Color(), 36, 330);
  const hemi = new THREE.HemisphereLight();
  scene.add(hemi);
  const sun = new THREE.DirectionalLight();
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 2;
  const sc = sun.shadow.camera;
  sc.left = -SHADOW_BOX; sc.right = SHADOW_BOX; sc.top = SHADOW_BOX; sc.bottom = -SHADOW_BOX; sc.near = 1; sc.far = 160;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight();                          // back/rim light from the visible sun
  scene.add(rim);
  // firelight: three point lights that follow the fight — each frame they sit on the three light sites nearest the
  // focus (def.lightSites), faded by distance so a swap happens unseen; the same light count on every map (every lit
  // shader loops over them). The fourth, 'stage-key', rests at def.light.key: the select screen borrows it as the
  // officer's warm key (select.js).
  const fireLights = [0, 1, 2].map(() => { const l = new THREE.PointLight(0xff8a3a, 0, 11, 2); scene.add(l); return l; });
  const stageKey = new THREE.PointLight(0xff8a3a, 30, 11, 2);
  stageKey.name = 'stage-key'; scene.add(stageKey);
  // fill: a warm low fill from the valley side (the fires below / sky bounce) easing in over def.light.fill's z range
  const fill = new THREE.DirectionalLight(0xffb27a, 0);
  fill.position.set(-0.35, 0.45, -1).multiplyScalar(60); fill.target.position.set(0, 0, 0);
  scene.add(fill, fill.target);

  const FAR = { x: 0, y: -99, z: 0, i: 0, d: 1, k: 1e9 };            // stands in for missing sites (< 4 on a map)
  const NEAR = [null, null, null, null], CHAR = new THREE.Color(0x3a2a24), WHITE = new THREE.Color(1, 1, 1);
  const tmp = new THREE.Vector3();
  let t = 0, cur = null, curArmy, root = null, sky, river, castle, dressing, L, open = {}, SITES = [];
  const trash = [];
  on('story:set', (e) => dressing?.set.sets?.[e.id]?.());

  const world = {
    /** vfx embers: [{ position }] ground-level fires near the fight (y 0: vfx adds ground()); replaced on load. */
    fires: [],
    /** Load map `id` (maps/index.js) in army colours { foe, ally } (C3 ARMIES entries; omitted: the map's own 魏 / 蜀
     *  cloth). No-op when that map is already up in those armies, or at all when `army` is omitted (the title swap back
     *  to HOME keeps the last battle's). Sim + render: call between battles, then compile before the next frame. */
    load(id = HOME, { army } = {}) {
      const def = MAPS[id] || MAPS[HOME];
      if (def === cur && (!army || (army.foe === curArmy?.foe && army.ally === curArmy?.ally))) return;   // (compared by side: a fresh pair of the same armies is the same set)
      cur = def; curArmy = army;
      loadMap(def);
      setAtmo(def.sky);
      L = { ...LIGHT, ...def.light };
      scene.background.copy(HAZE); scene.fog.color.copy(HAZE); [scene.fog.near, scene.fog.far] = def.fog || [36, 330];
      hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2];
      sun.color.set(L.sun[0]); sun.intensity = L.sun[1];
      rim.color.set(L.rim[0]); rim.intensity = L.rim[1]; rim.position.copy(SUN_DIR).multiplyScalar(100);
      LIGHT_DIR.set(...L.dir).normalize();
      for (const l of [...fireLights, stageKey]) l.color.set(L.fire);
      if (L.key) stageKey.position.set(L.key[0], ground(L.key[0], L.key[1]) + 2.2, L.key[1]);
      post?.setLook(def.post);

      if (root) { scene.remove(root); trash.push(root); }
      root = new THREE.Group(); root.name = 'map-' + def.id;             // identity transform: fires carry world positions
      sky = createSky();
      root.add(sky);
      buildTerrain(root, def);
      river = createRiver(root);
      castle = null;
      if (def.castle) {
        const camp = new THREE.Group();                                   // the castle set stands on its plateau
        camp.position.y = def.castle.y;
        root.add(camp);
        castle = { ...buildCastle(camp, def.castle), ...def.castle };
      }
      // site: [x, y (above ground), z, intensity, range]
      SITES = (def.lightSites || []).map(([x, y, z, i, d]) => ({ x, y: ground(x, z) + y, z, i, d, k: 0 }));
      dressing = buildDressing(root, def, { army, castle, sites: SITES });
      world.fires = dressing.fires;
      // gates: render-side eased 0 (shut) … 1 (open) toward the sim state; doors swing in ≈ 1 s, barricades collapse and char
      open = Object.fromEntries(Object.keys(GATES).map((g) => [g, 1]));
      scene.add(root);
    },
    update(dt, focus, game) {
      for (const r of trash.splice(0)) dispose(r);
      t += dt;
      river?.update(dt, game);
      // shadow frustum follows the focus (snapped to texels to avoid shimmer), at the ground under it
      const step = 2 * SHADOW_BOX / 2048;
      tmp.set(Math.round(focus.x / step) * step, ground(focus.x, focus.z), Math.round(focus.z / step) * step);
      sun.target.position.copy(tmp);
      sun.position.copy(LIGHT_DIR).multiplyScalar(70).add(tmp);
      sky.material.uniforms.uTime.value = t; GRASS_TIME.value = t;
      dressing.update(t, focus);
      castle?.update(t);
      for (const id in open) {
        const k = open[id] += ((GATES[id].open ? 1 : 0) - open[id]) * Math.min(1, dt * 3), kind = GATES[id].kind;
        if (kind === 'doors' && castle?.gate === id) castle.setDoors(k * (2 - k));
        const g = kind === 'barricade' && dressing.gates[id];
        if (g) {
          g.m.rotation.x = -0.25 * k; g.m.scale.y = 1 - 0.72 * k; g.m.position.y = g.y - 0.1 * k;   // broken down to a low burning wreck
          g.mat.color.copy(WHITE).lerp(CHAR, k);
        }
      }
      dressing.set.update?.(dt, game);
      // the four sites nearest the focus (partial selection, no allocation); lights 0-2 take the first three, each faded
      // out as the fourth closes in on it, so the hand-over from one site to the next is never a pop
      for (const s of SITES) s.k = Math.hypot(s.x - focus.x, s.z - focus.z);
      for (let n = 0; n < 4; n++) {
        let best = null;
        for (const s of SITES) if (!s.used && (!best || s.k < best.k)) best = s;
        if (best) best.used = true;
        NEAR[n] = best || FAR;
      }
      for (let n = 0; n < 3; n++) {
        const b = NEAR[n], l = fireLights[n], fl = 0.93 + Math.sin(t * (13 + n * 3.1) + n) * 0.17 + Math.sin(t * 7.3 + n * 2) * 0.13;
        l.position.set(b.x, b.y, b.z); l.distance = b.d;
        l.intensity = b.i * fl * (1 - smooth(26, 40, b.k)) * smooth(0, 6, NEAR[3].k - b.k);
      }
      for (const s of SITES) s.used = false;
      stageKey.intensity = L.key ? 28 + Math.sin(t * 22.3 + 3) * 5 + Math.sin(t * 7.3 + 6) * 4 : 0;
      fill.intensity = L.fill ? L.fill[2] * smooth(L.fill[0], L.fill[1], focus.z) : 0;
      fill.target.position.set(focus.x, 0, focus.z); fill.position.set(focus.x - 21, 27, focus.z - 60);
    },
  };
  world.load(HOME);
  return world;
}
