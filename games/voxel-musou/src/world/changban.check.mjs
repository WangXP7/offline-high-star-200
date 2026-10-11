// Run: node src/world/changban.check.mjs (vendored Three.js, no renderer or build).
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(id, context, next) {
  return next(id === 'three' ? new URL('../../vendor/three/three.module.js', import.meta.url).href : id, context);
} });
const THREE = await import('three');
const { default: def } = await import('./maps/changban.js');
const { loadMap, ground } = await import('./map.js');
loadMap(def);
const { x0, z0, x1, z1, nx, nz } = (await import('./map.js')).TERRAIN;
const geometry = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx - 1, nz - 1);
geometry.rotateX(-Math.PI / 2); geometry.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
const positions = geometry.attributes.position;
for (let i = 0; i < positions.count; i++) positions.setY(i, ground(positions.getX(i), positions.getZ(i)));
const before = positions.array.slice(), root = new THREE.Group(), mesh = new THREE.Mesh(geometry);
mesh.name = 'ground'; root.add(mesh);
const walkHeight = ground(0, -128), set = def.build(root, { ground });
assert.ok(walkHeight > 0.7, 'bridge remains walkable at deck height');
assert.ok(def.water.y - def.water.bedHeight(0, -128, walkHeight) > 1, 'the water shader sees a wet riverbed under the deck');
let submerged = 0;
for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i), z = positions.getZ(i);
  if (Math.abs(x) <= 4 && Math.abs(z + 128) <= 4) {
    assert.ok(positions.getY(i) < def.water.y, 'no earth deck can remain in the broken span'); submerged++;
  }
  if (Math.abs(z + 128) > 12) assert.equal(positions.getY(i), before[i * 3 + 1], 'terrain away from the bridge is unchanged');
}
assert.ok(submerged > 0);
const spans = root.children.slice(2, 10);
set.sets.bridge(); set.update(3);
assert.ok(spans.every((span) => span.position.y < def.water.y), 'all eight sections fall below the water');
assert.equal(ground(0, -128), walkHeight, 'rendering the break never mutates sim heights');
console.log('Changban bridge: submerged riverbed, falling span, unchanged sim and distant terrain — passed');
