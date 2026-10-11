// Camera occlusion (render-only helpers).
import { ground, clampWalk, openWater } from '../world/map.js';

/**
 * Lens clear: fragments closer than `near` m to the camera are cut away, so debris flying past the lens
 * (a C6 boulder, a KO burst) never blacks out the frame. Chains with an earlier onBeforeCompile (works instanced).
 */
export function lensClear(material, near = 2) {
  const prev = material.onBeforeCompile, key = material.customProgramCacheKey() + '|lens' + near;
  material.onBeforeCompile = function (shader, renderer) {
    prev.call(this, shader, renderer);
    shader.vertexShader = shader.vertexShader.replace('void main() {', 'varying float vLensD;\nvoid main() {')
      .replace('#include <project_vertex>', '#include <project_vertex>\n  vLensD = -mvPosition.z;');
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `varying float vLensD;\nvoid main() {\n  if (vLensD < ${near.toFixed(2)}) discard;`);
  };
  material.customProgramCacheKey = () => key;
  material.needsUpdate = true;
  return material;
}

/**
 * Boom clearance: the share (0..1] of the focus → camera segment that stays over open, walkable ground. The boom is
 * marched in `n` samples; it is blocked where it leaves the walkable field by more than `slack` m (castle wall, cliff
 * edge, valley side: whatever map.js clampWalk fences off — but never over open water: a pool or a wide river behind
 * the hero is off the walk field, not a wall) or dips under `floor` m above the terrain (a slope rising behind the
 * hero). The rig pulls the camera in to the last clear sample (DW8: the camera slides in along the boom at walls
 * instead of clipping through them). Pure: only map.js lookups, no scene raycast (voxel sets are instanced).
 * ponytail: the walk fence stands in for wall geometry (the castle wall face sits 3 m past it); an invisible fence on
 * open ground (the old arena disc) also pulls in, and a prop inside the field (a tower) is not tested. Upgrade: a
 * map.js blocker query (walls / cliffs as segments) if the long field needs finer occlusion.
 */
export function clearance(fx, fy, fz, cx, cy, cz, n = 10, slack = 3, floor = 0.35) {
  for (let i = 1; i <= n; i++) {
    const t = i / n, x = fx + (cx - fx) * t, z = fz + (cz - fz) * t, y = fy + (cy - fy) * t;
    const w = clampWalk(x, z, -slack);
    if ((Math.abs(w[0] - x) + Math.abs(w[1] - z) > 0.01 && !openWater(x, z)) || y < ground(x, z) + floor) return (i - 1) / n;
  }
  return 1;
}
