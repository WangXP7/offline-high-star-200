// Voxel Huang Zhong on the shared rig, same build / scale / armour cut as Zhao Yun (src/hero/model.js bodyParts, recoloured):
// red lamellar with gold plates and a bronze-gold scale mantle over a dark underlayer, dark crimson sash and trim; the
// veteran's head — grey topknot with a red band and gold pin, red headband, long drooping white brows, white moustache
// and full beard (the long end hangs as a chain); a big lacquered recurve 勁弓 whose back carries a steel blade edge
// (the melee "sword" of the DW bow moveset) with gold dragon-tip finials; a red quiver of white-fletched arrows on the
// right hip. Secondary (render-only): dark red cape, crimson apron, beard, topknot tails, pauldrons, plus the bowstring
// (drawn through the right hand when it holds the nock) and the nocked arrow (flaming for fire shots). The bow-blade slash
// ribbon is vfx.js's (kit.trail: the upper limb along the weapon frame's y).
import * as THREE from 'three';
import { vox, V, HV, C, bodyParts, buildBody, heroLook } from '../../hero/model.js';
import { bodyChains } from '../../hero/secondary.js';
import { hash01 } from '../../core/rng.js';

export const HC = {
  ...C,
  W: 0xa8281c, W2: 0x6c1812, Wh: 0xc4963c, S: 0xd4a84c, Sd: 0x8a6424,                     // red lamellar, bronze-gold mantle, gold
  G: 0x2c2420, Gd: 0x1e1916, Gm: 0x3c322c, Gl: 0x74604e,                                   // dark underlayer
  T: 0x5c1410, Td: 0x3e0e0b, Tl: 0xffc24a,                                                 // crimson sash / trim, amber gem
  skin: 0xe4b390, skinD: 0xc28c6e, lip: 0xb07464,
  hair: 0xd6d0c6, hairH: 0xf4f1ea, hairT: 0xa8a298, band: 0xb3261e,                        // white-grey hair, red headband
  bow: 0x2a1614, bowH: 0x4c2c22, edge: 0xeef3f8, edgeD: 0x98a4b2, feather: 0xf2efe8,
  cape: 0x7c1a14, capeD: 0x561210, emb: 0xd9a53a,
};
const B = (a, b, c, paint) => ({ a, b, c, paint });
const Pt = (a, b, c) => ({ a, b, c, paint: true });
const md = (a, m) => ((a % m) + m) % m;

// ---------------------------------------------------------------- head (HV voxels, chin y 0, crown y 13; as Zhao Yun's)
function head() {
  const hairP = (x, y, z) => (md(x * 3 + z, 5) === 0 ? HC.hairH : md(x + y * 2, 7) === 0 ? HC.hairT : HC.hair);
  const beard = (x, y, z) => (y <= -3 && md(x + z, 2) ? null : md(x * 2 + y, 5) === 0 ? HC.hairT : md(x + z * 3, 4) === 0 ? HC.hair : HC.hairH);
  return [
    B([-3, 0, -2], [4, 2, 5], HC.skin),                               // jaw
    B([-4, 2, -4], [5, 10, 5], HC.skin),                              // skull / face
    B([-5, 5, -1], [6, 8, 1], HC.skinD),                              // ears
    B([-5, 9, -6], [6, 13, 4], hairP),                                // swept-back hair cap (high forehead)
    B([-4, 13, -5], [5, 14, 3], hairP),
    B([-5, 2, -6], [6, 13, -2], hairP),                               // back hair
    B([-5, 5, -2], [-3, 11, 1], hairP), B([4, 5, -2], [6, 11, 1], hairP),   // temples
    B([-2, 13, -3], [3, 17, 2], hairP),                               // topknot
    B([-2, 14, -3], [3, 15, 2], HC.band),                             // red topknot band
    B([-4, 16, -1], [5, 17, 0], HC.S),                                // gold pin through it
    B([-6, 9, -7], [7, 10, 6], HC.band),                              // red headband, gold plate, amber gem
    B([-1, 8, 5], [2, 11, 6], HC.S), B([0, 9, 6], [1, 10, 7], HC.Tl),
    Pt([-3, 8, 4], [0, 9, 5], HC.skinD), Pt([1, 8, 4], [4, 9, 5], HC.skinD),   // forehead lines under the band
    // deep-set narrow eyes (one row), a crease under them
    Pt([-3, 5, 4], [0, 6, 5], C.eye), Pt([1, 5, 4], [4, 6, 5], C.eye),
    Pt([-2, 5, 4], [-1, 6, 5], C.iris), Pt([2, 5, 4], [3, 6, 5], C.iris),
    Pt([-3, 4, 4], [0, 5, 5], HC.skinD), Pt([1, 4, 4], [4, 5, 5], HC.skinD),
    // long white brows: thick over the eyes, drooping past the temples
    B([-4, 6, 5], [0, 8, 6], (x, y) => (y === 7 || x > -3 ? HC.hairH : null)), B([1, 6, 5], [5, 8, 6], (x, y) => (y === 7 || x < 4 ? HC.hairH : null)),
    B([-6, 4, 3], [-4, 7, 6], (x, y) => (y >= 5 - (x + 6) * 0 ? HC.hairH : null)), B([5, 4, 3], [7, 7, 6], HC.hairH),
    B([0, 3, 5], [1, 5, 7], HC.skin), Pt([0, 3, 6], [1, 4, 7], HC.skinD),   // strong nose
    // moustache: white, drooping to the jaw corners
    B([-3, 2, 5], [4, 3, 7], HC.hairH), B([-4, 0, 4], [-2, 3, 6], HC.hair), B([3, 0, 4], [5, 3, 6], HC.hair),
    // full beard under the chin (the long end is a chain), sideburns running into it
    B([-4, -4, -1], [5, 2, 6], beard),
    B([-5, 0, -2], [-4, 7, 3], hairP), B([5, 0, -2], [6, 7, 3], hairP),
  ];
}

// ---------------------------------------------------------------- bow (weapon joint: origin = grip, +Z = arrow line, limbs ±Y)
export const BOW = { v: 0.02, R: 42, brace: -0.13 };   // voxel, limb length (voxels: 0.84 m), string plane z (m) behind the grip
/** Limb profile z (voxels) at |y| = u·R: the limb bends back toward the string, the tips recurve forward. */
const bowZ = (u) => Math.round(14 * Math.pow(Math.cos(Math.min(1, u) * Math.PI / 2), 1.2) - 14 + (u > 0.76 ? ((u - 0.76) / 0.24) ** 1.5 * 7.6 : 0));   // deep D, hooked tips (string plane unchanged)
function bowGeo() {
  const { R } = BOW, boxes = [];
  for (let y = -R; y <= R; y++) {
    const u = Math.abs(y) / R, z = bowZ(u), grip = Math.abs(y) <= 4;
    const band = !grip && Math.abs(y) % 10 === 5;
    // limb: lacquered dark red-black, thicker at the grip (leather-wrapped), gold bands
    boxes.push(B([-1, y, z - (grip ? 2 : u < 0.5 ? 2 : 1)], [1, y + 1, z + 1], grip ? HC.leather : band ? HC.S : md(y, 3) ? HC.bow : HC.bowH));
    if (grip && Math.abs(y) === 4) boxes.push(B([-2, y, z - 3], [2, y + 1, z + 2], HC.S));
    // the blade: a steel edge along the limb's back (facing the target), widest mid-limb
    if (u > 0.14 && u < 0.8) {
      const ew = Math.max(1, Math.round(3.4 * Math.sin((u - 0.14) / 0.66 * Math.PI)));
      boxes.push(B([0, y, z + 1], [1, y + 1, z + 1 + ew], (x, yy, zz) => (zz === z + ew ? HC.edge : HC.edgeD)));
    }
  }
  for (const s of [1, -1]) {                                           // gold dragon-head finials
    const y = s * R, z = bowZ(1);
    boxes.push(B([-2, s > 0 ? y : y - 3, z - 1], [2, s > 0 ? y + 4 : y + 1, z + 3], HC.S));
    boxes.push(B([-1, s > 0 ? y + 1 : y - 2, z + 3], [1, s > 0 ? y + 3 : y, z + 5], HC.S));
    boxes.push(B([-3, s > 0 ? y + 2 : y - 1, z + 1], [3, s > 0 ? y + 3 : y, z + 2], HC.Tl));
  }
  return vox(boxes, BOW.v, { jitter: 0.04, ao: 0.3 });
}
/** String tips in bow-local metres. */
export const TIPS = [new THREE.Vector3(0, (BOW.R + 1) * BOW.v, BOW.brace), new THREE.Vector3(0, -(BOW.R) * BOW.v, BOW.brace)];

function quiverGeo() {
  // red lacquered quiver (axis +Y), gold bands, a sheaf of white-fletched arrows out of the top
  const boxes = [B([-3, 0, -3], [3, 22, 3], (x, y) => (y % 7 === 1 ? HC.S : md(x + y, 5) === 0 ? HC.W2 : HC.W))];
  for (let k = 0; k < 7; k++) {
    const x = -2 + (k % 3) * 2, z = -2 + Math.floor(k / 3) * 2, h = 25 + (k % 2) * 2;
    boxes.push(B([x, 22, z], [x + 1, h, z + 1], HC.bowH));
    boxes.push(B([x - 1, h - 3, z], [x + 2, h + 1, z + 1], (xx, y) => (y === h - 3 ? HC.band : HC.feather)));
  }
  return vox(boxes, V, { off: [-0.5, 0, -0.5] });
}

export function createHzModel(rig) {
  const mat = heroLook(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.82, 0.82, 0.82), vertexColors: true, roughness: 0.55, metalness: 0.1, flatShading: true }));
  const body = bodyParts(HC);
  // tiger-face gold belt plate over the buckle
  body.parts.hips.push(B([-3, -1, 5], [3, 4, 7], HC.S), Pt([-2, 2, 6], [-1, 3, 7], HC.Tl), Pt([1, 2, 6], [2, 3, 7], HC.Tl), Pt([-1, 0, 6], [1, 1, 7], HC.Sd));
  const { meshes, add } = buildBody(rig, mat, body, head());
  const quiver = new THREE.Object3D();                                // right hip, tilted back, fletchings behind the elbow
  quiver.position.set(-0.19, -0.02, -0.08); quiver.rotation.set(-0.55, 0, 0.18);
  rig.joints.hips.add(quiver);
  add(quiver, quiverGeo(), 'quiver');
  add(rig.joints.weapon, bowGeo(), 'bow', heroLook(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.35, flatShading: true }), 0.3, 0.7));
  return { meshes, material: mat };
}

// ---------------------------------------------------------------- secondary: cloth, beard, bowstring, nocked arrow, slash
const capeSeg = (i, n) => {
  const w = Math.round(6 + (i * 2.5) / (n - 1)), last = i === n - 1;
  const paint = (x, y) => {
    if (last && y === -7 && hash01(x, i, 5) < 0.45) return null;
    if (last && (y === -5 || y === -4)) return HC.emb;               // gold hem band
    return x === -w || x === w - 1 ? HC.capeD : HC.cape;
  };
  const curl = (x) => x === -w || x === w - 1 || (i >= 3 && (x === -w + 1 || x === w - 2));
  return vox([B([-w, -7, 0], [w, 0, 1], (x, y) => (curl(x) ? null : paint(x, y))), B([-w, -7, -1], [w, 0, 0], (x, y) => (curl(x) ? paint(x, y) : null))],
    0.025, { off: [0, 0, -0.5], jitter: 0.04, ao: 0.18 });
};
const apronSeg = (i, n) => vox([B([-3, -5, 0], [3, 0, 1], (x, y) => (i === n - 1 && y === -5 ? (x % 2 ? null : HC.S) : x === -3 || x === 2 ? HC.Td : HC.T))],
  0.025, { off: [0, 0, -0.5], jitter: 0.05, ao: 0.2 });
const beardSeg = (i, n) => {
  const w = Math.max(1, 4 - i), tip = i === n - 1;
  return vox([B([-w, tip ? -6 : -4, -1], [w, 0, 2], (x, y, z) => (tip && y < -3 && hash01(x, z, i) < 0.5 ? null : md(x * 2 + y, 5) === 0 ? HC.hairT : HC.hairH))],
    HV, { jitter: 0.06, ao: 0.3 });
};
const tailSeg = () => vox([B([-1, -6, 0], [1, 0, 1], HC.band)], 0.014, { off: [0, 0, -0.5], jitter: 0.03, ao: 0.15 });

/** hero (hero.js; select / title models pass none): whose state lights the fire arrow. */
export function createHzSecondary(scene, rig, mat, hero) {
  const j = rig.joints, body = bodyChains(scene, rig, mat, capeSeg, apronSeg), { add } = body;
  add(j.head, { anchor: [0, -4 * HV, 3 * HV], rest: [0, -1, 0.3], n: 3, len: 0.055, stiff: 0.2, drag: 0.2, wind: 0.6, face: [0, 0, 1], cone: 60, sway: 0.1,
    seg: beardSeg, hit: [['chest', 0.03]] });
  for (const sx of [-1, 1]) add(j.head, { anchor: [sx * 1.5 * HV, 15 * HV, -3 * HV], rest: [sx * 0.3, -0.4, -1], n: 3, len: 0.08, stiff: 0.03, drag: 0.06,
    wind: 2.2, cone: 110, sway: 0.5, seg: tailSeg, hit: ['head'] });

  // bowstring (2 thin segments via the nock), nocked arrow, fire glow at its head (the slash ribbon: vfx.js, kit.trail)
  const strMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.38, 1.15) });   // bright: the string must read against a bright sky at select scale
  const unit = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);    // unit box from y 0 → 1 (scaled along a segment)
  const str = [0, 1].map(() => { const m = new THREE.Mesh(unit, strMat); m.matrixAutoUpdate = false; m.frustumCulled = false; scene.add(m); return m; });
  const arrowGeo = vox([B([0, 0, 0], [1, 1, 44], (x, y, z) => (z > 40 ? 0xd8dde4 : z < 5 ? HC.feather : HC.bowH)), B([-1, 0, 0], [2, 1, 4], HC.feather),
    B([0, -1, 0], [1, 2, 4], HC.band), B([-1, 0, 40], [2, 1, 43], 0xc8ced6)], 0.022, { off: [-0.5, -0.5, 0], jitter: 0, ao: 0.1 });
  const arrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, flatShading: true }));
  arrow.matrixAutoUpdate = false; scene.add(arrow);
  const flame = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.3, 0.3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.matrixAutoUpdate = false; scene.add(flame);
  const hand = new THREE.Vector3(), loc = new THREE.Vector3(), t0 = new THREE.Vector3(), t1 = new THREE.Vector3(), nock = new THREE.Vector3();
  const m4 = new THREE.Matrix4(), inv = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
  const m4b = new THREE.Matrix4(), m4c = new THREE.Matrix4();
  /** Segment mesh from a to b (world), thickness w. */
  const seg = (m, a, b, w) => {
    _y.subVectors(b, a); const len = _y.length(); _y.normalize();
    _x.set(1, 0, 0); if (Math.abs(_y.x) > 0.9) _x.set(0, 0, 1);
    _z.crossVectors(_x, _y).normalize(); _x.crossVectors(_y, _z);
    m.matrix.makeBasis(_x.multiplyScalar(w), _y.multiplyScalar(len), _z.multiplyScalar(w)).setPosition(a); m.matrixWorldNeedsUpdate = true;
  };
  const FIRE = new Set(['c6', 'jc']);
  return {
    reset: body.reset,
    update(dt) {
      const t = body.update(dt);            // cloth, beard, tails, pauldrons (world matrices now current)

      // bowstring: through the right hand when it holds the nock (behind the bow, on the arrow line), else straight
      const W = j.weapon.matrixWorld;
      inv.copy(W).invert();
      j.handR.getWorldPosition(hand);
      loc.copy(hand).applyMatrix4(inv);
      const drawn = loc.z < BOW.brace - 0.04 && Math.abs(loc.x) < 0.16 && Math.abs(loc.y) < 0.16;
      t0.copy(TIPS[0]).applyMatrix4(W); t1.copy(TIPS[1]).applyMatrix4(W);
      const sc = rig.root.scale.y;
      if (drawn) {
        nock.set(0, 0, loc.z).applyMatrix4(W);
        seg(str[0], nock, t0, 0.018 * sc); seg(str[1], t1, nock, 0.018 * sc);
        // nocked arrow along the line from the nock (bow-local frame)
        m4.copy(W).multiply(m4b.makeTranslation(0, 0, loc.z - 0.02));
        arrow.matrix.copy(m4); arrow.matrixWorldNeedsUpdate = true;
        const h = hero, fire = h && ((h.state === 'attack' && FIRE.has(h.move)) || h.state === 'musou');
        flame.visible = !!fire;
        if (fire) {
          const k = 1 + 0.25 * Math.sin(t * 40);
          flame.matrix.copy(W).multiply(m4b.makeTranslation(0, 0, loc.z + 0.98 * sc)).multiply(m4c.makeScale(k, k, k));
          flame.matrixWorldNeedsUpdate = true;
        }
      } else { str[0].visible = true; seg(str[0], t1, t0, 0.018 * sc); flame.visible = false; }
      str[1].visible = drawn; arrow.visible = drawn;
    },
  };
}
