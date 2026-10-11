// Fine-voxel building blocks for def-kit officers (src/chars/defkit.js, hero/model.js buildDef). A fine body voxel is FV
// = 0.0125 m, half of Zhao Yun's V, and every part is authored CENTRED on its joint (no odd-width offset), +x = the
// officer's left, +z = forward, limbs hang along −y. Joint extents in FV: hips ≈ [-12,-10,-8]..[12,6,8], spine -6..16,
// chest -4..21 (shoulders at ±19), neck -2..6, upper arm 2..-24, forearm 0..-22, hand ±4 round the joint, thigh 2..-36,
// shin 0..-35, foot y -7..2 (the sole sits 0.08 m under the ankle), z -5..17 (toe forward). Colours come from the
// officer's palette; boxes are hero/model.js B / P boxes.
import { B, md } from '../hero/model.js';

export const FV = 0.0125;

/** Closed grip: a narrow palm, four raised finger pads, and a diagonal thumb across their front. */
export function hand(sx, skin, skinD) {
  return [
    B([-3, -5, -3], [4, 3, 2], skin),
    ...[-3, -1, 1, 3].map((x) => B([x, -4, 2], [x + 1, 2, 5], (xx, y) => y < -2 ? skinD : skin)),
    B([-4, 2, -2], [5, 4, 2], skinD),
    B([-4, -3, 4], [5, 3, 6], (x, y) => Math.abs(y - sx * x * 0.45) < 1.2 ? skin : null),
  ];
}

/** Gloved fist: the hand in leather c with a flared cuff. */
export function glove(sx, c, cuff) {
  return [...hand(sx, c, cuff), B([-5, 3, -4], [6, 6, 3], (x, y, z) => Math.abs(x) + Math.abs(z) < 7 ? cuff : null)];
}

/** Bare, muscled upper arm: round deltoid cap, biceps bulging forward, triceps behind, the groove under the deltoid;
 *  band = [c, dark, light] armlet above the elbow (or null). */
export function bareArm({ skin, skinD, skinH }, band) {
  const outline = (x, y, z) => {
    const width = y > -7 ? 5 : y > -17 ? 4 : 3;
    if (Math.abs(x) + Math.abs(z) > width + 3) return null;
    if (y > -4 && z > 0) return skinH;
    return x > 2 || z < -2 ? skinD : skin;
  };
  return [
    B([-5, -25, -5], [6, 3, 6], outline),
    B([-3, -16, 3], [4, -7, 6], (x, y) => Math.abs(x) < 2 && y > -14 ? skinH : skin),
    ...(band ? [B([-5, -22, -5], [6, -18, 6], (x, y, z) => {
      if (Math.abs(x) + Math.abs(z) > 8) return null;
      return z > 2 && Math.abs(x) < 2 ? band[2] : y === -22 ? band[1] : band[0];
    })] : []),
  ];
}

/** Forearm with a bracer over its lower two thirds ([c, dark, light]: banded, a light rim at both ends, an optional ridge). */
export function bracer(skin, [c, d, l], ridge = true) {
  return [
    B([-3, -23, -3], [4, 1, 4], skin),
    ...[-21, -15, -9].map((y, i) => B([-5, y, -5], [6, y + 5, 6], (x, yy, z) => {
      if (Math.abs(x) + Math.abs(z) > 8) return null;
      if (yy === y + 4) return l;
      return z > 2 && md(x + i, 3) === 0 ? d : c;
    })),
    ...(ridge ? [B([-2, -19, 5], [3, -8, 7], (x, y) => Math.abs(x) + Math.abs(y + 13) < 6 ? l : null)] : []),
  ];
}

/** Boot: foot block, toe cap (or a curled toe), a sole plate and an optional trim band round the top. */
export function boot(c, cd, sole, { curl = false, trim = null } = {}) {
  return [
    B([-6, -7, -5], [7, 4, 17], (x, y, z) => {
      const toe = z > 8, width = toe ? 5 - Math.floor((z - 8) / 4) : 6;
      if (Math.abs(x) > width || (z < -2 && Math.abs(x) > 4)) return null;
      const top = toe ? (curl ? Math.floor((z - 8) / 3) : -1) : z < 3 ? 3 : 1;
      if (y > top) return null;
      if (y === -7) return sole;
      if (trim && y === top && z < 4) return trim;
      return toe || x === -width ? cd : c;
    }),
    B([-3, -7, -5], [4, -3, -2], sole),
  ];
}

/** A head feature on both sides of the face: x range [a, b) on the +x side and its mirror (head voxels are centred on
 *  column 0 by buildBody's −0.5 offset). */
export function symH(a, b, y0, y1, z0, z1, c, paint = true) {
  return [{ a: [a, y0, z0], b: [b, y1, z1], c, paint }, { a: [-b + 1, y0, z0], b: [-a + 1, y1, z1], c, paint }];
}
