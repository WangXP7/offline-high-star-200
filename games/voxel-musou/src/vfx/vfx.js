// VFX (render-only, visual RNG). Everything reads sim state / bus events and never writes the sim.
//  - Slash arc: the concept's white-blue ribbon, sampled every sim step from the same pose function the renderer uses
//    (follows the rendered spear tip exactly). Bold near-white core + blue fringe under an HDR rim over a translucent
//    veil of voxel-stepped speed lines; flat spins seen edge-on fill into a full disc; only a fast tip draws; older
//    ribbons dim; keeps ageing (half rate) through hitstop.
//  - Thrust streaks: camera-facing beams shot along every line-shaped hitbox tick (N3, N5, C2, C3 flurry, dash, musou).
//  - Contact: soft star flash + radial needle streaks per struck soldier (budgeted per frame so sweeps stay readable),
//    the kit's heavy palette for charge hits, orange-gold for normals; fx r2: a normal hit is small and sharp, charge /
//    heavy contacts escalate in size, count and light.
//  - Finishers with mass: C6 rock eruption (voxel boulders 1-2 H up inside a ≥ 2.5 H dust wall), C3 dark smoke arc →
//    gold pillar ring, C5 fan of ice shafts, jump charge / N6 quake; other heavy windows shaped by the hitbox. Volumes
//    keep the sector toward the camera clear. Musou burst = teal-white ray burst + whiteout + rock eruption.
//  - Every KO breaks the soldier apart: voxel-clump debris in his army's palette (game.army.foe, re-read on 'scenario')
//    plus helmet / torso / shield blocks (bounce, settle, persist), warm voxel dust, embers, charge glint.
//  - Layering pass (DW8 bar): the ribbon gets an additive HDR glow under its stepped core and sheds glitter off the tip;
//    each contact adds a razor cut mark across the body + a shock pulse ring, heavy contacts / officer KOs an impact
//    point light; every finisher slam tears a glowing ground-crack decal (draped on the terrain) and throws a shock wall;
//    a banked Musou shows as a gold flame aura under the hero, for every character.
//  - Per kit (fx r1): heavy / charge / musou layers take kit.fx (ZY_FX ice by default; Huang Zhong amber-fire), and the
//    ribbon takes kit.trail: a spear line, or a bow limb along the weapon frame's y restricted to the slash moves, with
//    the kit's colours and speed gate; bow slashes add a razor air cut / spin ground ring.
//  - Hero-model actors (src/actors): boss blows (actor:strike, by hitbox shape), poise breaks, 肉包 pickups.
//    the kit's colours and speed gate; bow slashes add a razor air cut / spin ground ring. kit.fx.musou = 'dragon' (Zhao
//    Yun: his teal Musou layers, C5 shaft fan, C3 dark smoke arc) | 'own' (the kit's Musou view draws its own; kit.fx.mu
//    = {crack, wall, light} colours the shared Musou ground layers). Windows flagged beam / proj / roar are drawn by the
//    kit's own view (src/chars/kitview.js): no default heavy volume here.
//  - game.vfx = this; game.vfx.fx = the effect primitives for kit views (ring star rayBurst columns dustRing dustPuff
//    dustColumn shards embers rocks crack wall streak lightFlash flash), sim-space positions (y above the ground).
import * as THREE from 'three';
import { on } from '../core/events.js';
import { vrng } from '../core/rng.js';
import { boxesGeometry } from '../core/voxel.js';
import { heroPose } from '../hero/hero.js';
import { POSE_SIZE, spearWorld, weaponWorld } from '../hero/rig.js';
import { lensClear } from '../camera/occlusion.js';        // camera part (r3): debris never blocks the lens
import { ground } from '../world/map.js';                  // effects live in sim space (y above ground); lifted at draw
import { palette } from '../crowd/armies.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const _d = new THREE.Vector3(), _up = new THREE.Vector3(0, 0, 1), _c = new THREE.Color();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
/** Debris chunk: a 2×2×2 voxel clump with one corner knocked out and per-voxel shade, so rocks and armour pieces read
 *  as broken voxel matter instead of smooth boxes (unit bounds; instance scale = size). */
function clumpGeometry() {
  const boxes = [], shade = [1.0, 0.8, 0.93, 0.74, 1.06, 0.86, 0.96];
  let k = 0;
  for (const x of [-0.25, 0.25]) for (const y of [-0.25, 0.25]) for (const z of [-0.25, 0.25]) {
    if (x > 0 && y > 0 && z > 0) continue;
    const v = shade[k++];
    // perf r5: drop the faces shared with a neighbour cube (never visible): 84 → 48 tris per chunk, ×1,300 chunks × 2
    // passes at C6. voxel.js faces are +x −x +y −y +z −z.
    const skip = [0, 1, 2, 3, 4, 5].filter((f) => { const p = [x, y, z]; p[f >> 1] += (f % 2 ? -0.5 : 0.5); return Math.abs(p[f >> 1]) < 0.5 && !(p[0] > 0 && p[1] > 0 && p[2] > 0); });
    boxes.push({ s: [0.5, 0.5, 0.5], p: [x, y, z], c: new THREE.Color(v, v, v), skip });   // (linear shade, may run > 1)
  }
  return boxesGeometry(boxes);
}
/** sRGB hex → linear rgb array, times k (k > 1 = HDR, blooms). */
const lin = (hex, k = 1) => { _c.set(hex); return [_c.r * k, _c.g * k, _c.b * k]; };

// ------------------------------------------------------------------ palettes (linear)
// KO debris in the foe army's colours (crowd/armies.js palette, rebuilt on 'scenario' from game.army.foe): chips weighted
// by how much of the soldier each colour covers — mostly dark lamellar, a few headband / shield / skin chips — and the
// KO body blocks [colour, size min, size max, height offset] = helmet, torso, shield / cape, headband / trim chip
let SOLDIER, OFFICER, SOLDIER_BODY, OFFICER_BODY;
function armyDebris(army) {
  const { grunt: g, officer: o } = palette(army);
  SOLDIER = [g.armor, g.armor, g.plate, g.lace, g.helm, g.cloth, g.pants, g.band, g.skin, g.shield[0]].map((c) => lin(c));
  OFFICER = [o.armor, o.armor, o.plate, o.helm, o.helmHi, o.cape[1], o.skin].map((c) => lin(c));
  SOLDIER_BODY = [[lin(g.helm), 0.27, 0.31, 0.45], [lin(g.armor), 0.34, 0.4, 0], [lin(g.shield[1]), 0.27, 0.32, -0.1], [lin(g.band), 0.13, 0.17, 0.5]];
  OFFICER_BODY = [[lin(o.helm), 0.3, 0.34, 0.45], [lin(o.armor), 0.4, 0.46, 0], [lin(o.cape[1]), 0.32, 0.38, -0.1], [lin(o.helmHi), 0.16, 0.2, 0.5]];
}
const GROUND = [lin(0x614549), lin(0x7a5a48), lin(0x8a6a50), lin(0x54403a), lin(0xbb8965)];
// erupting rocks: the cobbles' mauve-brown plus sun-bleached stone tops
const ROCK = [lin(0x7a5a48), lin(0x8a6a50), lin(0x9c8068), lin(0xb89a7c), lin(0xa88c70), lin(0x6e5446)];
const SMOKE = [lin(0x2a1f1a), lin(0x3b2b22), lin(0x1d1512), lin(0x4a3426)];
const DUST = [lin(0xbb8965, 1.05), lin(0xc99a76, 1.0), lin(0xe8bd9d, 0.9), lin(0xa87a5c, 1.1)];
// eruption dust: the warm dust plus shaded grey-brown billows, so the wall has depth instead of a flat beige sheet
const DUST_WALL = [...DUST, lin(0x8f7060), lin(0x76604f), lin(0x9a7a64)];
// normal contact: red-orange needles with a few white-hot ones — off the gold of the victim tint (hitfx), so the burst
// reads on a struck body instead of melting into it
const NEEDLE_WARM = [[0.36, 0.07, 0.012], [0.4, 0.12, 0.02], [0.45, 0.2, 0.04], [1.6, 1.2, 0.6]];   // ≈ display red-orange → orange → gold, one white-hot
const NEEDLE_COOL = [[1.2, 1.9, 2.8], [1.7, 2.2, 2.8], [0.6, 1.4, 2.6]];
// contact burst / needle colours for charge & heavy hits: ice blue in near-display values (same reason as NEEDLE_WARM)
const BURST_COOL = [0.06, 0.2, 0.45], HOT_COOL = [[0.06, 0.2, 0.45], [0.1, 0.3, 0.55], [0.15, 0.4, 0.7], [1.2, 1.6, 2.0]];
const FLASH_WARM = [0.38, 0.08, 0.015], FLASH_COOL = [0.8, 1.5, 2.6], TEAL = [0.35, 1.6, 2.2];
// cut marks / pulse rings (additive): the cut is the one white-hot line of the contact, the pulse a thin coloured wave
const EMBER = [2.4, 0.95, 0.28], GLITTER = [1.3, 1.9, 2.8], SLASH_WARM = [2.6, 1.5, 0.6], SLASH_COOL = [0.9, 1.7, 3.0], PULSE_WARM = [1.4, 0.55, 0.12], PULSE_COOL = [0.35, 0.8, 1.8];
// Per-kit palette of the heavy / charge layers (kit.fx, e.g. src/chars/huangzhong/kit.js); Zhao Yun's ice is the default
// (a def kit spreads it and overrides: src/chars/defkit.js). Normal contacts stay warm for everyone. glint null = no charge
// star on the weapon tip (the kit draws its own tell). musou: see the header.
export const ZY_FX = { musou: 'dragon',
  needle: NEEDLE_COOL, hot: HOT_COOL, burst: BURST_COOL, flash: FLASH_COOL, slash: SLASH_COOL, pulse: PULSE_COOL,
  light: [0.55, 0.8, 1], crack: [0.5, 1.2, 2.8], wall: [0.35, 0.7, 1.4], ring: [0.7, 1.2, 2.0], shard: [1.0, 1.7, 2.6],
  glint: [1.1, 1.8, 2.8], glitter: GLITTER,
  trail: { white: [0.74, 0.84, 0.95], fringe: [0.12, 0.36, 1.0], hot: [1.3, 1.42, 1.55], glow: [0.22, 0.5, 1.5] },
};

// ------------------------------------------------------------------ shaders
// Dust: camera-facing, billows quantised to ≈ 4 screen px (retro sprite dust), normal alpha blending. Each puff is a lumpy ball
// (3 + 5 lobes, seeded per slot, turning with the puff's own spin) shaded from above with a darker underside, so a
// dust wall reads as rolling cauliflower billows instead of flat blurred discs.
const DUST_VS = /* glsl */`
  attribute float aFade;
  varying vec3 vCol; varying float vA; varying vec2 vP; varying float vSeed;
  #include <fog_pars_vertex>
  void main() {
    vec4 mvPosition = viewMatrix * vec4(instanceMatrix[3].xyz, 1.0);
    float w = length(instanceMatrix[0].xyz);
    mvPosition.xy += position.xy * w;
    vP = position.xy; vCol = instanceColor;
    vA = aFade * smoothstep(2.0, 4.5, -mvPosition.z);              // a puff at the lens fades instead of filling the frame
    vSeed = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453) * 6.2832 + 2.0 * atan(instanceMatrix[0].z, instanceMatrix[0].x);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const DUST_FS = /* glsl */`
  varying vec3 vCol; varying float vA; varying vec2 vP; varying float vSeed;
  #include <fog_pars_fragment>
  void main() {
    // fx r3 acc: a soft noise puff (no pixel quantisation at all — the 4 px steps still read as a JPEG mosaic under the
    // DoF); the voxel feel is carried by the chunk debris, not by the smoke
    vec2 p = vP;
    float r = length(p), th = atan(p.y, p.x);
    vec2 q0 = p * 2.3 + vec2(vSeed * 1.7, vSeed * 0.9);
    vec2 fi = floor(q0), ff = fract(q0); ff = ff * ff * (3.0 - 2.0 * ff);
    float nz = mix(mix(fract(sin(dot(fi, vec2(127.1, 311.7))) * 43758.5), fract(sin(dot(fi + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5), ff.x),
                   mix(fract(sin(dot(fi + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5), fract(sin(dot(fi + 1.0, vec2(127.1, 311.7))) * 43758.5), ff.x), ff.y);
    float edge = 0.72 + 0.1 * sin(3.0 * th + vSeed) + 0.22 * nz;
    float a = vA * (1.0 - smoothstep(edge - 0.55, edge, r)) * (0.75 + 0.35 * nz);
    if (a < 0.01) discard;
    vec2 q = p / edge;
    vec3 n = vec3(q, sqrt(max(0.0, 1.0 - dot(q, q))));
    float sh = 0.58 + 0.55 * max(0.0, dot(n, vec3(0.28, 0.82, 0.5)));   // sunlit crown, shaded underside
    gl_FragColor = vec4(vCol * sh, a);
    #include <fog_fragment>
  }`;

const TRAIL_VS = /* glsl */`
  uniform vec3 uHeroA, uHeroB;            // hero feet / head in view space
  attribute vec4 aT; varying vec4 vT; varying float vNear; varying vec3 vView; varying float vVeil; varying float vNdcY;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vT = aT; vView = mv.xyz;
    vNear = smoothstep(1.8, 4.4, -mv.z);   // near-camera fade: a sweep past the lens must not white out (or bokeh into fog)
    // slide 3.5 m toward the camera along the view ray (same pixels, nearer depth): the slash reads over the ranks it
    // cuts through instead of vanishing inside a dense ring (a low sweep runs at knee height through 2-3 ranks). Where
    // the ray passes the hero's body axis and the ribbon is behind him, it stops 0.4 m behind it (never paints his back).
    float d = length(mv.xyz);
    vec3 dir = mv.xyz / d, u = uHeroB - uHeroA;
    float b = dot(u, dir), e = dot(dir, uHeroA);
    float s = clamp((b * e - dot(u, uHeroA)) / max(dot(u, u) - b * b, 1e-6), 0.0, 1.0);
    vec3 q = uHeroA + u * s;                                        // closest point of the body axis to the ray
    float t = dot(q, dir), miss = length(q - dir * t);
    float pull = mix(clamp(d - t - 0.4, 0.0, 3.5), 3.5, max(step(d, t), smoothstep(0.45, 0.9, miss)));
    // r4: body of the ribbon (veil + core, not the rim) thins where it crosses in front of the hero's body and inside
    // ≈ 5 m of the lens, so a C4 disc sweeping past his legs / the camera stays a translucent band under a bright rim
    vVeil = (1.0 - 0.7 * (1.0 - smoothstep(0.3, 0.85, miss)) * step(d, t - 0.1)) * (0.45 + 0.55 * smoothstep(2.2, 5.5, d));
    mv.xyz *= max(0.3, (d - pull) / d);
    gl_Position = projectionMatrix * mv;
    vNdcY = gl_Position.y / max(gl_Position.w, 0.05);   // fx r3 acc: screen coverage (fwidth vs the across coordinate)
  }`;
// aT = (age 0 new..1 old, across 0 inner..1 outer edge, gain, hue 0 white-blue..1 musou teal)
// The concept's arc: a translucent white veil streaked with voxel-stepped speed lines, a bold near-white core
// (#f0f6f9) with a blue fringe under a crisp HDR rim. Premultiplied "over" blending (rgb + dst·(1 − a)): the veil and
// the core can never add up past their own colour, so a bold ribbon over a bright body or its own folds stays below
// white; only the thin rim adds light (rgb > a) and blooms. Fill follows orientation: a vertical arc faces the gameplay
// camera (facing ≈ 1) and shows its full width, a flat spin is seen edge-on (facing ≈ 0.25-0.6, ~3× foreshortened),
// so it fills into a dense grey-white disc with a wider rim and core instead of thinning to a 2 px line.
// Passes: uEdge 0 = veil + speed lines, 1 = core + fringe + rim (colour, no depth), 2 (DEPTH_PASS: its own program,
// so the colour passes keep early depth) = depth only where the core draws, at the ribbon's real distance clamped into the DoF focus band, so the post keeps the arc sharp even over the
// sky; bodies really in front of that depth keep theirs.
const TRAIL_FS = /* glsl */`
  uniform float uEdge; uniform vec3 uHeroA, uHeroB; uniform mat4 projectionMatrix;
  uniform vec3 uWhite, uFringe, uHot, uGlowC; uniform float uGrad;                 // the kit's ribbon colours (hue 0; hue 1 = musou teal)
  varying vec4 vT; varying float vNear; varying vec3 vView; varying float vVeil; varying float vNdcY;
  float h1(float n) { return fract(sin(n * 91.7) * 43758.5453); }
  void main() {
    float age = clamp(vT.x, 0.0, 1.0), v = clamp(vT.y, 0.0, 1.0), g = vT.z * vNear, hue = vT.w;
    // fx r3 acc: the band's width as a share of the screen height (v runs 0 → 1 across it): a sweep past the lens (ZY N4
    // filled a quarter of the frame) fades out, so a near arc stays a streak instead of a slab
    float pxV = max(fwidth(vT.y), 1e-5), cover = fwidth(vNdcY) * 0.5 / pxV;
    g *= 1.0 - 0.85 * smoothstep(0.26, 0.55, cover);
    vec3 nrm = cross(dFdx(vView), dFdy(vView));
    float facing = abs(dot(nrm, normalize(vView))) / max(length(nrm), 1e-20);
    float graze = 1.0 - smoothstep(0.25, 0.7, facing);            // 0 face-on arc .. 1 flat spin seen edge-on
    float life = 1.0 - pow(age, 1.0 + 1.3 * graze);                // a spin holds its whole turn: the benchmark's full disc
    float band = floor(v * 14.0);                                  // voxel-stepped bands across the ribbon
    float vq = (band + 0.5) / 14.0;
    float lq = floor(life * 6.0 + 0.999) / 6.0;                    // stepped fade along the ribbon
    float r1 = h1(band * 1.7 + 3.0), r2 = h1(band * 3.1 + 11.0);
    float head = smoothstep(0.7, 1.0, life);
    vec3 white = mix(uWhite, vec3(0.55, 0.9, 0.9), hue);
    vec3 blue = mix(uFringe, vec3(0.02, 0.7, 0.85), hue);
    float rimLo = 12.5 - graze;                                    // flat spin: the rim takes 2 bands
    // fx r2 (kit trail.grad, the bow): only the leading ≈ half of the swing carries light, a hot white leading edge
    // → amber → transparent tail; a flat spin stays a translucent crescent (a solid cream disc read as paper)
    float gd = uGrad * (1.0 - hue), tf = mix(1.0, 1.0 - smoothstep(0.08, 0.6, age), gd), hd = 1.0 - smoothstep(0.0, 0.25, age);
    if (gd > 0.5) {
      // fx r3 acc — the bow (kit trail.grad): purely additive and smooth (no premultiplied fill, no voxel bands: those read
      // as an opaque banana-yellow plank / paper sheet). Across the band from the limb-tip path inward: a white-hot edge a
      // few pixels wide → amber → clear within ≤ 30 % of the width (and ≤ ≈ 45 px), plus a few speed streaks in the amber;
      // along it: brightest on the newest part, gone by ≈ 60 % of the 8-frame life (≈ 0.08 s). Brightness drops as the
      // band covers more of the screen, so a spin past the lens (N5) stays a light crescent, never a sheet.
      float e = 1.0 - v, px = pxV;
      float edge = exp(-pow(e / max(px * 3.0, 0.02), 2.0));
      float wa = min(0.3 - 0.14 * graze, 45.0 * px);                // (a flat spin: a narrower amber skirt)
      float amb = exp(-e / (wa * 0.3)) * (1.0 - smoothstep(wa * 0.5, wa, e));
      float strk = step(0.72, h1(floor(v * 36.0) + 7.0)) * step(age, 0.25 + 0.4 * h1(floor(v * 36.0))) * (1.0 - smoothstep(0.5, 0.95, e / 0.45)) * (1.0 - graze);
      float along = (1.0 - smoothstep(0.05, 0.6, age)) * (0.55 + 0.45 * hd);
      float k = 1.5 * g * along * mix(1.0, 0.45, smoothstep(0.1, 0.35, cover)) * mix(1.0, 0.5, graze);
      vec3 col = (uHot * 2.0 * edge * (0.55 + 0.45 * hd) + uFringe * (amb * 0.75 + strk * 0.35) + uGlowC * 0.25 * amb) * k;
      #ifdef DEPTH_PASS
        if (edge * along < 0.35) discard;
        float dd = length(vView), hh = length(mix(uHeroA, uHeroB, 0.55));
        float zg = vView.z * clamp(dd, hh - 1.2, hh + 4.0) / dd;
        gl_FragDepth = 0.5 + 0.5 * (projectionMatrix[2][2] * zg + projectionMatrix[3][2]) / -zg;
        gl_FragColor = vec4(0.0);
        return;
      #endif
      if (uEdge < 0.5 || uEdge > 2.5) discard;                     // one colour pass (the core pass) draws the bow ribbon
      if (max(col.r, max(col.g, col.b)) < 0.004) discard;
      gl_FragColor = vec4(col, 0.0);
      return;
    }
    rimLo += gd * graze;                                           // (one rim band, not two)
    vec4 o;
    if (uEdge > 2.5) {
      // glow pass (additive, smooth — under the stepped core): an HDR halo hugging the cutting edge with a soft falloff
      // into the ribbon, brightest on the newest part of the swing and tapering to nothing toward the tail, so the arc
      // blooms like a blade of light instead of a flat sticker; plus a faint wide haze over the whole swept area
      float edgeG = exp(-pow((v - 0.9) / mix(0.16 + 0.1 * graze, 0.08, gd), 2.0));   // (fx r3, bow: a thin halo on the edge — the wide one read as a solid banana band)
      float haze = pow(v, 2.0) * mix(0.22, 0.05, gd);             // fx r2: the bow disc: no yellow sheet
      float along = pow(life, 1.6) * (0.6 + 0.4 * head);
      vec3 gc = mix(uGlowC, vec3(0.1, 1.0, 1.2), hue);
      vec3 col = gc * (edgeG * 0.75 + haze) * along * g * mix(1.0, 0.7, graze) * (0.5 + 0.5 * vVeil) * mix(1.0, 0.45 * tf, gd);
      if (max(col.r, max(col.g, col.b)) < 0.004) discard;
      gl_FragColor = vec4(col, 0.0);
      return;
    }
    if (uEdge > 0.5) {
      // core: bold near-white band under the rim on the newest part of the arc, blue fringe beneath it, HDR rim on top
      float coreLo = 8.5 - 2.0 * graze;
      float core = step(coreLo, band) * (1.0 - step(rimLo, band)) * smoothstep(0.25, 0.6, life);
      float fringe = step(coreLo - 1.0, band) * (1.0 - step(coreLo, band)) * step(0.4, life);
      float rim = step(rimLo, band) * step(age, 0.8) * pow(life, 0.5);
      float aC = core * mix(0.5, 0.4, graze) * (0.55 + 0.45 * head) * (0.8 + 0.2 * r1) * vVeil;   // r4: flat disc translucent (DW8 C4 mid-grey), bright rim
      vec3 hot = mix(uHot, vec3(1.05, 1.55, 1.5), hue);
      vec3 wc = mix(white, mix(uFringe * 1.2, white, hd), gd);
      aC *= tf * mix(1.0, 0.55, graze * gd) * mix(1.0, (0.3 + 0.7 * smoothstep(coreLo / 14.0, rimLo / 14.0, vq)) * (0.6 + 0.5 * r1), gd);   // denser toward the edge, speed streaks
      rim *= tf;
      hot = mix(hot, mix(uFringe * 1.6, hot, hd), gd);            // the rim cools from white-hot to amber along the arc
      o = vec4(wc * aC + blue * fringe * 0.5 * vVeil * tf + hot * rim * (0.75 + 0.35 * head), aC + fringe * 0.4 * vVeil * tf + rim) * g;
      #ifdef DEPTH_PASS
        if (o.a < 0.3) discard;
        float d = length(vView), hd = length(mix(uHeroA, uHeroB, 0.55));
        float zv = vView.z * clamp(d, hd - 1.2, hd + 4.0) / d;
        gl_FragDepth = 0.5 + 0.5 * (projectionMatrix[2][2] * zv + projectionMatrix[3][2]) / -zv;
        gl_FragColor = vec4(0.0);
        return;
      #endif
    } else {
      // translucent veil, densest toward the outer edge, plus sparse speed lines that each trail for their own length
      float alive = step(age, (0.3 + 0.6 * r2) * (0.4 + 0.6 * vq));
      float lines = step(mix(0.45, 0.15, graze), r1) * (0.4 + 0.6 * r1) * alive * lq * (1.0 - step(rimLo, band));
      float veil = pow(vq, 1.4) * lq * mix(0.12, 0.22, graze) * vVeil * mix(1.0, 0.35 * tf, gd);   // fx r2: the bow disc stays a light amber haze
      float aL = lines * mix(0.26, 0.32, graze) * vVeil;
      o = vec4(mix(white, blue, 0.6 * gd) * veil * 0.85 + white * aL * 1.1 + blue * veil * 0.12, veil + aL) * g;
    }
    if (o.a < 0.015) discard;                                      // hard, stepped silhouette
    gl_FragColor = o;
  }`;

// Axial billboard beam: instance z column = axis (with length), x column length = width, translation = start.
const BEAM_VS = /* glsl */`
  attribute vec3 aF; varying vec2 vUv; varying vec3 vF; varying vec3 vCol; varying float vNear;
  void main() {
    vec3 start = instanceMatrix[3].xyz, axis = instanceMatrix[2].xyz;
    float w = length(instanceMatrix[0].xyz);
    vec3 p = start + axis * position.y;
    vec3 side = cross(axis, cameraPosition - p);
    float sl = length(side);
    side = sl > 1e-5 ? side / sl : vec3(1.0, 0.0, 0.0);
    p += side * position.x * w * 0.5;
    vUv = vec2(position.x, position.y); vF = aF; vCol = instanceColor;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    vNear = 0.3 + 0.7 * smoothstep(2.0, 5.0, -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const BEAM_FS = /* glsl */`
  varying vec2 vUv; varying vec3 vF; varying vec3 vCol; varying float vNear;
  void main() {
    float u = vF.x, k = vF.z;
    float y = floor(vUv.y * 16.0 + 0.5) / 16.0;
    float x = abs(vUv.x);
    float along;
    if (k < 0.5) along = pow(y, 1.3) * (1.0 - smoothstep(0.93, 1.0, y) * 0.6);          // thrust streak: hot head
    else if (k < 1.5) along = pow(1.0 - y, 0.8) * smoothstep(0.0, 0.08, y);              // ray: hot base
    else if (k < 2.5) along = pow(1.0 - y, 1.7) * smoothstep(0.0, 0.04, y);              // pillar: hot at the ground
    else if (k < 3.5) along = smoothstep(0.0, 0.3, y) * pow(1.0 - y, 1.1);               // shaft: the fan's roots don't stack
    else along = pow(max(0.0, sin(vUv.y * 3.1416)), 0.7);                                  // slash mark / bolt: tapered at both ends
    // across profile per kind: streak = bold lance, ray = thin needle of light, pillar = soft column, slash = razor line
    float c0 = k < 0.5 ? 0.12 : k < 1.5 ? 0.08 : k < 3.5 ? 0.14 : 0.07, c1 = k < 0.5 ? 0.3 : k < 1.5 ? 0.26 : k < 3.5 ? 0.42 : 0.2;
    float core = 1.0 - smoothstep(c0, max(c0 + 0.01, c1 * (k > 3.5 ? along : 1.0)), x);
    float glow = (1.0 - x) * (1.0 - x) * (k < 0.5 ? 0.45 : k < 1.5 ? 0.22 : k < 3.5 ? 0.45 : 0.7);
    float gain = k < 0.5 ? 1.0 : k < 1.5 ? 0.6 : k < 3.5 ? 0.75 : 1.2;
    float fade = (1.0 - u) * (1.0 - u);
    vec3 col = vCol * glow + mix(vCol, vec3(1.8, 1.95, 2.1), k > 1.5 && k < 3.5 ? 0.1 : 0.6) * core;   // columns keep their hue (gold / ice), no cream wash
    if (k > 2.5 && k < 3.5) col *= 0.45 + 0.55 * fract(sin((floor(vUv.x * 4.0) + vF.y * 17.0) * 91.7) * 43758.5);   // shaft: streaky, voxel-stepped
    gl_FragColor = vec4(col * along * fade * gain * vNear, 1.0);
  }`;

// Camera-facing star flash (contact spark core / charge glint), soft (fx r2).
const STAR_VS = /* glsl */`
  attribute vec3 aF; varying vec2 vP; varying vec3 vF; varying vec3 vCol;
  void main() {
    vec4 mv = viewMatrix * vec4(instanceMatrix[3].xyz, 1.0);
    float s = length(instanceMatrix[0].xyz);
    mv.xy += position.xy * s;
    // pull toward the camera: never buried in a body (a contact burst clears the victim and the rank in front of him)
    mv.z += aF.z > 0.5 ? min(1.3, 0.8 * s) : min(0.7, s);
    vP = position.xy; vF = aF; vCol = instanceColor;
    gl_Position = projectionMatrix * mv;
  }`;
const STAR_FS = /* glsl */`
  varying vec2 vP; varying vec3 vF; varying vec3 vCol;
  float h1(float n) { return fract(sin(n * 91.7) * 43758.5453); }
  void main() {
    float u = vF.x, a = vF.y * 6.2832;
    if (vF.z > 1.5) {
      // impact pulse: a thin camera-facing shock ring racing out of the contact (ease-out), hot rim + faint inner haze,
      // broken into a few arcs so it reads as a pressure wave, not a UI circle; additive (alpha 0)
      vec2 p = vP;
      float r = length(p), th = atan(p.y, p.x) + a;
      float R = 0.2 + 0.8 * (1.0 - (1.0 - u) * (1.0 - u) * (1.0 - u));
      float wR = 0.03 + 0.06 * (1.0 - u);
      float rim = exp(-pow((r - R) / wR, 2.0));
      float haze = smoothstep(R, 0.0, r) * 0.18 * (1.0 - u);
      float gaps = 0.55 + 0.45 * smoothstep(-0.2, 0.6, sin(th * 5.0) + 0.4 * sin(th * 11.0 + 2.0));
      float fade = (1.0 - u) * (1.0 - u);
      vec3 col = (vCol * rim * gaps * 0.7 + mix(vCol, vec3(2.0), 0.5) * pow(rim, 6.0) * gaps * 0.6 + vCol * haze) * fade;
      if (max(col.r, max(col.g, col.b)) < 0.004) discard;
      gl_FragColor = vec4(col, 0.0);
      return;
    }
    if (vF.z > 0.5) {
      // contact burst (benchmark DW8XL f372: 1-2 H radial explosion round a white core, gone in ≈ 8 sf): 13 seeded
      // spikes of random length, white-hot at the root and red-orange at the tip, shooting out and detaching from the
      // core as they age, over a short red-orange fireball;
      vec2 p = vP;                                                 // fx r2: soft, not pixel-stepped (read as flat white squares)
      float r = length(p), th = atan(p.y, p.x) + a;
      const float N = 13.0;
      float sec = floor(th / 6.2832 * N + 64.0);
      float ang = (sec + 0.5 + (h1(sec + vF.y * 7.0) - 0.5) * 0.5) / N * 6.2832;
      float dth = abs(mod(th - ang + 3.1416, 6.2832) - 3.1416);
      float len = mix(0.42, 1.0, h1(sec * 1.37 + vF.y * 13.0)) * (0.7 + 0.3 * min(1.0, u * 4.0));
      float rl = r / len;
      float w = 0.05 * (1.0 - rl) + 0.01;                        // spike: thick root, needle tip
      float spike = step(rl, 1.0) * smoothstep(w, w * 0.35, r * dth) * smoothstep(0.55 * u * u + 0.06 * u, 0.55 * u * u + 0.06 * u + 0.08, rl) * smoothstep(1.0, 0.75, rl);   // tail detaches outward
      float cr = 0.02 + 0.08 * (1.0 - u) * (1.0 - u), core = exp(-r * r / (cr * cr)) * step(u, 0.4);   // 1-2 sf hot pinpoint, then gone
      float ball = max(0.0, 1.0 - r / (0.34 - 0.14 * u));
      float fade = 1.0 - u * u, fb = (1.0 - u) * (1.0 - u);
      // premultiplied "over": the spikes replace the sand behind them instead of adding to it, so red-orange stays
      // red-orange on a bright frame (additive washed it to peach) and a cluster of bursts never sums to white
      // the grade bleaches anything far over its knee (post.js hotDesat), so the hue lives in near-display values:
      // white-hot root → yellow → vCol (orange, ≈ 0.5 linear) → dark-red tip (DW8XL flame edge); only the core blooms
      vec3 hot = vec3(2.4, 2.2, 1.9), yel = vCol * vec3(1.1, 2.0, 2.0);
      vec3 sc = mix(mix(hot, yel, smoothstep(0.02, 0.14, rl)), vCol, smoothstep(0.14, 0.4, rl));
      sc = mix(sc, vCol * vec3(0.8, 0.6, 0.6), smoothstep(0.7, 1.0, rl));
      float aS = spike * fade * 0.9, aB = ball * fb * 0.45, aC = core * fb * fb;
      vec3 col = sc * aS + vCol * aB * (1.0 - aS) + hot * aC;
      float al = max(max(aS, aB), aC);
      if (al < 0.01) discard;
      gl_FragColor = vec4(col, al);
      return;
    }
    vec2 p = vP;
    vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
    vec2 d = vec2(q.x + q.y, q.x - q.y) * 0.7071;
    float r = length(p);
    // tight hot core + long thin streaks: a big flash stays a crisp star under bloom instead of a glow blob
    float cr0 = 0.04 + 0.05 * (1.0 - u), core = exp(-r * r / (cr0 * cr0));
    float s1 = max(max(0.0, 1.0 - abs(q.x) * 14.0) * (1.0 - abs(q.y)), max(0.0, 1.0 - abs(q.y) * 14.0) * (1.0 - abs(q.x)));
    float s2 = max(max(0.0, 1.0 - abs(d.x) * 18.0) * max(0.0, 1.0 - abs(d.y) * 1.4), max(0.0, 1.0 - abs(d.y) * 18.0) * max(0.0, 1.0 - abs(d.x) * 1.4));
    float fade = (1.0 - u) * (1.0 - u);
    vec3 col = vCol * (s1 * 1.1 + s2 * 0.6) + vec3(2.2, 2.1, 2.0) * core;
    gl_FragColor = vec4(col * fade, 0.0);                          // alpha 0 = additive (premultiplied blend)
  }`;

// fx r2: spark / ember / glitter / flame-wisp particles (the `hot` and `sparks` pools) are soft camera-facing streaks,
// not lit boxes: the instance's z column is the long axis (head = +z end: needles along their velocity, flame wisps
// up), the x column's length the width. Hot at the head, tapering to the tail, gaussian across; round caps keep a
// streak seen end-on a soft spot. OVER = premultiplied "over" (the near-display red-orange contact needles), else additive.
const NEEDLE_VS = /* glsl */`
  varying vec2 vUv; varying vec3 vCol; varying float vNear;
  void main() {
    vec3 c = instanceMatrix[3].xyz, ax = instanceMatrix[2].xyz;
    float w = length(instanceMatrix[0].xyz);
    vec4 h = viewMatrix * vec4(c + ax * 0.5, 1.0), t = viewMatrix * vec4(c - ax * 0.5, 1.0);
    float u = position.y + 0.5;
    vec2 hs = h.xy / max(-h.z, 0.05), ts = t.xy / max(-t.z, 0.05), a2 = hs - ts;
    vec2 sd = dot(a2, a2) > 1e-10 ? normalize(a2) : vec2(0.0, 1.0);
    vec4 mv = mix(t, h, u);
    mv.xy += vec2(-sd.y, sd.x) * position.x * w * 1.5 + sd * (u - 0.5) * w * 1.2;
    vUv = vec2(position.x * 2.0, u); vCol = instanceColor;
    vNear = smoothstep(1.2, 3.5, -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const NEEDLE_FS = /* glsl */`
  varying vec2 vUv; varying vec3 vCol; varying float vNear;
  void main() {
    float x = vUv.x, u = vUv.y;
    float along = pow(clamp(u, 0.0, 1.0), 1.3) * smoothstep(1.0, 0.8, u) + 0.25 * smoothstep(0.0, 0.3, u) * smoothstep(1.0, 0.7, u);
    float m = (exp(-x * x * 4.0) * 0.45 + exp(-x * x * 22.0)) * along * vNear;
    if (m < 0.004) discard;
    #ifdef OVER
      gl_FragColor = vec4(vCol * m, min(1.0, m) * 0.9);
    #else
      gl_FragColor = vec4(vCol * m, 1.0);
    #endif
  }`;

const RING_VS = /* glsl */`varying vec2 vUv; void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RING_FS = /* glsl */`
  uniform float uU; uniform vec3 uColor; varying vec2 vUv;
  void main() {
    // fx r3 acc: smooth and thinner (the voxel-stepped 0.14-wide band read as an opaque stepped yellow sheet round N5)
    float r = length(vUv), aa = fwidth(r) * 1.5;
    float front = 0.3 + 0.7 * (1.0 - (1.0 - uU) * (1.0 - uU));
    float out_ = 1.0 - smoothstep(front - aa, front + aa, r);
    float band = smoothstep(front - 0.08, front, r) * out_;
    float edge = smoothstep(front - 0.025 - aa, front, r) * out_;
    float fade = (1.0 - uU) * (1.0 - uU);
    gl_FragColor = vec4(uColor * (band * 0.22 + edge * 0.9) * fade, 1.0);
  }`;

// Ground crack decal: a conforming grid on the terrain. Jagged radial fissures (wobbling, random length, thinning
// outward) + a broken fracture ring + a scorched centre, grown out over ≈ 0.12 s; the fissures glow hot (uGlow) and cool
// to dark over the first ≈ 0.6 s, then everything fades. Premultiplied over: dark cracks darken the ground, the glow adds.
const CRACK_VS = /* glsl */`varying vec2 vUv; void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const CRACK_FS = /* glsl */`
  uniform float uU, uGrow, uSeed; uniform vec3 uGlow; varying vec2 vUv;
  float h(float n) { return fract(sin(n * 91.7 + uSeed * 13.1) * 43758.5453); }
  void main() {
    vec2 p = vUv; float r = length(p);
    if (r > 1.0 || r > uGrow * 1.05) discard;
    float th = atan(p.y, p.x);
    const float N = 9.0;
    float sec = floor((th / 6.2832 + 0.5) * N), best = 1.0;
    for (int j = -1; j <= 1; j++) {
      float s = mod(sec + float(j) + N, N);
      float ang = (s + 0.5) / N * 6.2832 - 3.1416 + (h(s) - 0.5) * 0.45;
      float wig = 0.035 * sin(r * 11.0 + h(s + 3.0) * 6.28) + 0.03 * sin(r * 31.0 + h(s + 5.0) * 6.28);   // (fx r3: jagged, not noodles)
      float d = abs(mod(th - ang - wig + 3.1416, 6.2832) - 3.1416) * r;
      d += step(0.5 + 0.5 * h(s + 7.0), r);                          // each fissure has its own length
      // one fork per fissure
      float fa = ang + (h(s + 9.0) - 0.5) * 0.9, f0 = 0.3 + 0.3 * h(s + 11.0);
      float df = abs(mod(th - fa - wig * 1.4 + 3.1416, 6.2832) - 3.1416) * r + step(r, f0) + step(f0 + 0.3, r);
      best = min(best, min(d, df));
    }
    float w = 0.03 * (1.0 - r) + 0.005;
    float crack = 1.0 - smoothstep(w * 0.45, w, best);
    float rd = abs(r - (0.32 + 0.04 * sin(th * 7.0 + uSeed * 5.0)));
    crack = max(crack, (1.0 - smoothstep(0.006, 0.016, rd)) * step(0.45, fract(th * 1.1 + uSeed)) * 0.85);
    float scorch = (1.0 - smoothstep(0.0, 0.42, r)) * 0.45;
    float fade = 1.0 - smoothstep(0.5, 1.0, uU), edge = 1.0 - smoothstep(0.85, 1.0, r);
    float a = max(crack * 0.8, scorch) * fade * edge;
    float hot = pow(max(0.0, 1.0 - uU * 6.0), 2.0);                   // (fx r3: cools in ≈ 0.5 s; glowing gold worms lay on the grass for 1 s)
    vec3 glow = uGlow * crack * hot * (1.0 - r) * 0.6 + uGlow * scorch * hot * 0.08;   // (a hot scorch disc bloomed into a fog)
    if (a < 0.01 && hot <= 0.0) discard;
    gl_FragColor = vec4(vec3(0.045, 0.032, 0.028) * a + glow, a);
  }`;
// Shock wall: an open cylinder racing out of a slam (radius eases out, height sinks), hot at the ground and gone at the
// top, streaked; additive; fades inside ≈ 4 m of the lens so a wave passing the camera never fills the frame.
const WALL_VS = /* glsl */`
  varying vec2 vUv; varying float vNear;
  void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vNear = smoothstep(1.5, 4.5, -mv.z); gl_Position = projectionMatrix * mv; }`;
const WALL_FS = /* glsl */`
  uniform float uU, uSeed; uniform vec3 uColor; varying vec2 vUv; varying float vNear;
  void main() {
    float y = vUv.y, th = vUv.x * 6.2832;
    // sparse bright ribbons of pressure over a faint skirt (a solid band read as a fog wall under bloom)
    float streak = 0.18 + 0.82 * pow(max(0.0, sin(th * 17.0 + uSeed * 7.0) * sin(th * 5.0 - uSeed * 3.0)), 2.0);
    float top = 0.4 + 0.6 * fract(sin(floor(th * 10.0) * 12.9 + uSeed) * 437.5);   // ragged, voxel-stepped crown
    float prof = pow(max(0.0, 1.0 - y), 2.6) * (1.0 - smoothstep(top * 0.85, top, y)) + exp(-y * 30.0) * 0.6;   // MSAA can extrapolate UV past the wall's top edge
    float fade = (1.0 - uU) * (1.0 - uU);
    vec3 col = uColor * prof * streak * fade * vNear;
    gl_FragColor = vec4(col, 1.0);
  }`;
// Aura disc under the hero: a flickering ring of flame tongues + soft inner glow (musou gauge ready / Musou).
const AURA_FS = /* glsl */`
  uniform float uT, uK; uniform vec3 uColor; varying vec2 vUv;
  void main() {
    // fx r2: a soft breathing glow ring (no hard tongue starburst: from above it read as a clip-art sun sticker)
    float r = length(vUv), th = atan(vUv.y, vUv.x);
    float wob = 0.75 + 0.25 * sin(th * 5.0 - uT * 1.7) * sin(th * 3.0 + uT * 1.1);
    float ring = exp(-pow((r - 0.62) / 0.11, 2.0)) * wob;          // (fx r3: thinner, dimmer, deeper amber — a heat ring, not a yellow disc)
    float inner = (1.0 - smoothstep(0.0, 0.75, r)) * 0.05;
    float a = (ring * 0.6 + inner) * (1.0 - smoothstep(0.8, 1.0, r));
    gl_FragColor = vec4(uColor * a * uK * (0.9 + 0.1 * sin(uT * 5.0)), 1.0);
  }`;

// ------------------------------------------------------------------ particle pool
/** Pool of instanced cubes. kind: 0 needle spark, 1 debris (tumbles, bounces, settles), 2 dust, 3 ember/mote, 4 glow shard
 *  (also src/musou/view.js's light shards: drag = its xz drag (1/s), shrink = full size until the last 1/shrink of its
 *  life, near(p) = size factor at the world point p) */
// Ages are frame-exact (sim frames since spawn / last update), so a capture that renders every 2nd frame shows the
// same effect state as real-time play.
export function makePool(scene, n, mat, now, { castShadow = false, fade = false, geo = new THREE.BoxGeometry(1, 1, 1), drag = 2.5, shrink = 1, near = null } = {}) {
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.castShadow = castShadow;
  mesh.setColorAt(0, _c.setRGB(1, 1, 1)); mesh.count = 0;
  scene.add(mesh);
  const F = () => new Float32Array(n);
  const col = new Float32Array(n * 3);
  const p = { mesh, n, next: 0, x: F(), y: F(), z: F(), vx: F(), vy: F(), vz: F(), life: F(), max: F(), size: F(), kind: new Uint8Array(n), rot: F(), rv: F(), a: F(), last: F() };
  let fadeAttr = null;
  if (fade) {
    fadeAttr = new THREE.InstancedBufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage);
    mesh.geometry.setAttribute('aFade', fadeAttr);
  }
  p.spawn = (x, y, z, vx, vy, vz, life, size, kind, r, g, b, alpha = 1) => {
    const i = p.next; p.next = (p.next + 1) % n;
    p.x[i] = x; p.y[i] = y; p.z[i] = z; p.vx[i] = vx; p.vy[i] = vy; p.vz[i] = vz;
    p.life[i] = life; p.max[i] = life; p.size[i] = size; p.kind[i] = kind; p.rot[i] = vrng.range(0, 6.3); p.rv[i] = vrng.range(-12, 12) * (kind === 1 ? Math.min(1, 0.16 / size) : 1);   // big rocks tumble slowly (mass)
    p.a[i] = alpha; p.last[i] = now();
    col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b;
  };
  function integrate(i, dt) {
    const k = p.kind[i];
    if (k === 0) { p.vy[i] -= 9 * dt; const f = 1 - 7 * dt; p.vx[i] *= f; p.vy[i] *= f; p.vz[i] *= f; }
    else if (k === 1) {
      p.vy[i] -= 22 * dt;
      const h = p.size[i] * 0.5;
      if (p.y[i] < h) {
        p.y[i] = h;
        if (p.vy[i] < -1.5) { p.vy[i] *= -0.32; p.vx[i] *= 0.55; p.vz[i] *= 0.55; p.rv[i] *= 0.5; }
        else { p.vy[i] = 0; const f = 1 - 8 * dt; p.vx[i] *= f; p.vz[i] *= f; p.rv[i] *= f; }  // settle and rest
      }
    } else if (k === 2) { const f = 1 - 2.6 * dt; p.vx[i] *= f; p.vz[i] *= f; p.vy[i] *= 1 - 1.8 * dt; }
    else if (k === 3) { p.vx[i] += (0.7 + Math.sin(p.life[i] * 2.3 + i) * 0.9) * dt; p.vz[i] += Math.cos(p.life[i] * 1.7 + i) * 0.6 * dt; p.vy[i] *= 1 - 0.3 * dt; }
    else if (k === 5) { p.vy[i] += 2.5 * dt; const f = 1 - 3 * dt; p.vx[i] *= f; p.vz[i] *= f; }   // flame tongue: buoyant
    else { p.vy[i] -= 6 * dt; const f = 1 - drag * dt; p.vx[i] *= f; p.vz[i] *= f; }
    p.x[i] += p.vx[i] * dt; p.y[i] += p.vy[i] * dt; p.z[i] += p.vz[i] * dt;
    p.rot[i] += p.rv[i] * dt;
  }
  p.clear = () => { p.life.fill(0); mesh.count = 0; };
  p.update = () => {
    const f = now();
    let j = 0;
    for (let i = 0; i < n; i++) {
      if (p.life[i] <= 0) continue;
      const dtAll = Math.max(0, (f - p.last[i]) / 60);
      p.last[i] = f;
      if (p.life[i] <= dtAll) { p.life[i] = 0; continue; }
      if (dtAll > 0) {
        const sub = Math.ceil(dtAll / (1 / 30)), dt = dtAll / sub;       // substeps keep big capture gaps stable
        for (let k = 0; k < sub; k++) integrate(i, dt);
        p.life[i] -= dtAll;
      }
      const k = p.kind[i], u = p.life[i] / p.max[i];
      _p.set(p.x[i], p.y[i] + ground(p.x[i], p.z[i]), p.z[i]);          // particles live in sim space (y above ground)
      if (k === 0) {
        _d.set(p.vx[i], p.vy[i], p.vz[i]);
        const sp = _d.length();
        _q.setFromUnitVectors(_up, sp > 1e-4 ? _d.multiplyScalar(1 / sp) : _d.set(0, 1, 0));
        const w = p.size[i] * (0.35 + 0.65 * u);
        _s.set(w, w, Math.max(w, sp * 0.065 * p.a[i]));   // a = streak length factor for needles
      } else if (k === 2) {
        _q.setFromAxisAngle(_d.set(0, 1, 0), p.rot[i] * 0.15);
        const w = p.size[i] * (0.6 + (1 - u) * 0.9);
        _s.set(w, w * 0.8, w);
        if (fadeAttr) fadeAttr.array[j] = 0.8 * p.a[i] * Math.min(1, u * 1.4) * Math.min(1, (1 - u) * 12 + 0.25);
      } else if (k === 5) {
        _q.setFromUnitVectors(_up, _d.set(0, 1, 0));                    // flame wisp: long axis (z) up, head on top
        const w = p.size[i] * Math.min(1, u * 2.2) * Math.min(1, (1 - u) * 8);
        _s.set(w, w, w * (1.6 + 2 * (1 - u)));
      } else if (k === 3) {
        _q.setFromAxisAngle(_d.set(0.6, 1, 0.3).normalize(), p.rot[i]);
        const w = p.size[i] * Math.min(1, u * 3) * (0.65 + 0.35 * Math.sin(p.life[i] * 23 + i));
        _s.set(w, w, w);
      } else {
        _q.setFromAxisAngle(_d.set(0.6, 1, 0.3).normalize(), p.rot[i]);
        const w = p.size[i] * Math.min(1, u * (k === 1 ? 6 : shrink)) * (near ? near(_p) : 1);
        _s.set(w, w, w);
      }
      mesh.instanceColor.array.set(col.subarray(i * 3, i * 3 + 3), j * 3);
      mesh.setMatrixAt(j++, _m.compose(_p, _q, _s));
    }
    // perf r5: live particles are packed from slot 0 (count = live). "Up to the last live slot" drew the whole ring once
    // it wrapped, dead slots included (C6: up to 1,400 debris clumps × 2 passes for ≈ 580 alive)
    mesh.count = j;
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
    if (fadeAttr) fadeAttr.needsUpdate = true;
  };
  return p;
}

/** Pool of shader quads (beams or stars) with per-instance aF = (u elapsed 0..1, seed, kind). */
function makeQuadPool(scene, n, geo, vs, fs, premul = false) {
  const aF = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aF', aF);
  // premul: rgb + dst·(1 − a) — a = 0 is additive, a = 1 replaces the background (contact bursts)
  const mat = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: premul ? THREE.NormalBlending : THREE.AdditiveBlending, premultipliedAlpha: premul });
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  for (let i = 0; i < n; i++) { mesh.setMatrixAt(i, ZERO); mesh.setColorAt(i, _c.setRGB(1, 1, 1)); }
  scene.add(mesh);
  return { mesh, aF, n, next: 0 };
}

export function createVfx(scene, game, world) {
  const now = () => game.frame;
  const kp = () => game.hero.kit.fx || ZY_FX;                       // the active kit's heavy-layer palette
  const zy = () => kp().musou === 'dragon';                          // Zhao Yun's own layers (header)
  // contact needles: normal blending (not additive), so red-orange reads over the bright sand and gold-tinted bodies
  const needleMat = (over) => new THREE.ShaderMaterial({ vertexShader: NEEDLE_VS, fragmentShader: NEEDLE_FS, defines: over ? { OVER: 1 } : {},
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: over ? THREE.NormalBlending : THREE.AdditiveBlending, premultipliedAlpha: over });
  const hot = makePool(scene, 700, needleMat(true), now, { geo: new THREE.PlaneGeometry(1, 1) });
  const sparks = makePool(scene, 1400, needleMat(false), now, { geo: new THREE.PlaneGeometry(1, 1) });
  // camera part (r3): lensClear cuts debris closer than 2 m to the lens (a boulder at the lens blacked out the frame)
  const debris = makePool(scene, 2000, lensClear(new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true, vertexColors: true }), 2.8), now, { castShadow: true, geo: clumpGeometry() });
  const dust = makePool(scene, 900, new THREE.ShaderMaterial({
    vertexShader: DUST_VS, fragmentShader: DUST_FS, transparent: true, depthWrite: false, fog: true,
    uniforms: THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
  }), now, { fade: true, geo: new THREE.PlaneGeometry(2, 2) });

  /** n hidden meshes from make(), round-robin: take(dur, delay) shows the next one, aged from now + delay s. */
  const meshPool = (n, make) => {
    const ms = Array.from({ length: n }, () => { const m = make(); m.visible = false; m.frustumCulled = false; scene.add(m); return m; });
    let next = 0;
    ms.take = (dur, delay = 0) => { const m = ms[next]; next = (next + 1) % n; m.userData.f0 = now() + delay * 60; m.userData.dur = dur; m.visible = true; return m; };
    return ms;
  };
  /** Ages a mesh pool: hides the finished ones, tick(m, u, t) for the rest (u = age / dur, t = age s; < 0 while delayed). */
  const age = (ms, tick) => {
    for (const m of ms) {
      if (!m.visible) continue;
      const t = (now() - m.userData.f0) / 60, u = t / m.userData.dur;
      if (u >= 1) m.visible = false; else tick(m, u, t);
    }
  };

  // ---- shock rings (flat, voxel-stepped radial front)
  const ringGeo = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
  const rings = meshPool(8, () => new THREE.Mesh(ringGeo, new THREE.ShaderMaterial({ vertexShader: RING_VS, fragmentShader: RING_FS,
    uniforms: { uU: { value: 0 }, uColor: { value: new THREE.Color() } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })));
  const ring = (x, z, r, dur, rgb) => {
    const m = rings.take(dur);
    m.position.set(x, ground(x, z) + 0.06, z); m.scale.setScalar(r);
    m.material.uniforms.uColor.value.setRGB(rgb[0], rgb[1], rgb[2]);
    m.material.uniforms.uU.value = 0;
  };

  // ---- ground crack decals: conforming 20×20 grids, re-draped onto the terrain at each spawn
  const CG = 20;
  const cracks = meshPool(6, () => {
    const g = new THREE.PlaneGeometry(2, 2, CG, CG).rotateX(-Math.PI / 2);
    g.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: CRACK_VS, fragmentShader: CRACK_FS,
      uniforms: { uU: { value: 0 }, uGrow: { value: 0 }, uSeed: { value: 0 }, uGlow: { value: new THREE.Color() } },
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, premultipliedAlpha: true }));
    m.renderOrder = -1;
    m.userData.base = Float32Array.from(g.attributes.position.array);
    return m;
  });
  /** Ground crack decal of radius r at (x, z); glow = hot fissure colour (HDR), dur s. */
  const crack = (x, z, r, glow, dur = 3.2) => {
    const m = cracks.take(dur);
    const pos = m.geometry.attributes.position, b = m.userData.base, gy = ground(x, z);
    for (let v = 0; v < pos.count; v++) {
      const lx = b[v * 3] * r, lz = b[v * 3 + 2] * r;
      pos.array[v * 3] = lx; pos.array[v * 3 + 1] = ground(x + lx, z + lz) - gy + 0.03; pos.array[v * 3 + 2] = lz;
    }
    pos.needsUpdate = true;
    m.position.set(x, gy, z);                                          // (no spin: the drape is baked unrotated; uSeed varies the pattern)
    const u = m.material.uniforms; u.uSeed.value = vrng.range(0, 100); u.uGlow.value.setRGB(glow[0], glow[1], glow[2]); u.uU.value = 0; u.uGrow.value = 0;
  };

  // ---- shock walls (open cylinders racing out of a slam)
  const wallGeo = new THREE.CylinderGeometry(1, 1, 1, 48, 1, true).translate(0, 0.5, 0);
  const walls = meshPool(4, () => new THREE.Mesh(wallGeo, new THREE.ShaderMaterial({ vertexShader: WALL_VS, fragmentShader: WALL_FS,
    uniforms: { uU: { value: 0 }, uSeed: { value: 0 }, uColor: { value: new THREE.Color() } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })));
  const wall = (x, z, r, hgt, dur, rgb, delay = 0) => {
    const m = walls.take(dur, delay);
    m.position.set(x, ground(x, z) - 0.05, z); m.userData.r = r; m.userData.h = hgt; m.scale.set(0.01, 0.01, 0.01);
    m.material.uniforms.uColor.value.setRGB(rgb[0], rgb[1], rgb[2]); m.material.uniforms.uSeed.value = vrng.range(0, 100); m.material.uniforms.uU.value = 0;
  };

  // ---- impact light: a warm / cold point light pops on heavy contacts, KOs of officers, slams, Musou payoffs
  // (always in the scene at 0 so the lit materials compile with it at boot)
  // ponytail: one light (every lit fragment pays for each light in the scene); a second slot if flashes visibly clash
  const light = new THREE.PointLight(0xffffff, 0, 10, 2);
  light.userData = { f0: 0, dur: 1, I: 0 }; scene.add(light);
  const lightFlash = (x, y, z, rgb, I, dur = 0.18, dist = 10) => {
    if (light.intensity > I) return;
    light.position.set(x, y + ground(x, z), z); light.color.setRGB(rgb[0], rgb[1], rgb[2]); light.distance = dist;
    light.userData.f0 = now(); light.userData.dur = dur; light.userData.I = I; light.intensity = I;
  };

  // ---- musou aura: gold flame ring under the hero while a Musou is banked
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ vertexShader: RING_VS, fragmentShader: AURA_FS,
    uniforms: { uT: { value: 0 }, uK: { value: 0 }, uColor: { value: new THREE.Color() } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  aura.frustumCulled = false; aura.visible = false; scene.add(aura);
  let auraK = 0, auraAcc = 0;
  const AURA_GOLD = [1.2, 0.46, 0.08];

  // ---- beams: thrust streaks, rays, pillars
  const beamGeo = new THREE.BufferGeometry();
  beamGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3));
  beamGeo.setIndex([0, 1, 2, 0, 2, 3]);
  const beams = makeQuadPool(scene, 256, beamGeo, BEAM_VS, BEAM_FS);
  const BN = beams.n, B = { sx: new Float32Array(BN), sy: new Float32Array(BN), sz: new Float32Array(BN), dx: new Float32Array(BN),
    dy: new Float32Array(BN), dz: new Float32Array(BN), len: new Float32Array(BN), wid: new Float32Array(BN), t: new Float32Array(BN),
    dur: new Float32Array(BN), kind: new Uint8Array(BN), on: new Uint8Array(BN) };
  const STREAK = 0, RAY = 1, PILLAR = 2, SHAFT_K = 3, SLASH = 4;
  const beam = (kind, sx, sy, sz, dx, dy, dz, len, wid, dur, rgb, delay = 0) => {
    const i = beams.next; beams.next = (beams.next + 1) % BN;
    const l = Math.hypot(dx, dy, dz) || 1;
    B.sx[i] = sx; B.sy[i] = sy; B.sz[i] = sz; B.dx[i] = dx / l; B.dy[i] = dy / l; B.dz[i] = dz / l;
    B.len[i] = len; B.wid[i] = wid; B.t[i] = now() + delay * 60; B.dur[i] = dur; B.kind[i] = kind; B.on[i] = 1;
    beams.aF.array[i * 3 + 1] = vrng.next(); beams.aF.array[i * 3 + 2] = kind;
    beams.mesh.setColorAt(i, _c.setRGB(rgb[0], rgb[1], rgb[2])); beams.mesh.instanceColor.needsUpdate = true;
  };
  const _ax = new THREE.Vector3(), _sd = new THREE.Vector3(), _st = new THREE.Vector3(), _0 = new THREE.Vector3();
  const updateBeams = () => {
    const f = now();
    for (let i = 0; i < BN; i++) {
      if (!B.on[i]) continue;
      const u = (f - B.t[i]) / 60 / B.dur[i];
      if (u >= 1) { B.on[i] = 0; beams.mesh.setMatrixAt(i, ZERO); continue; }
      if (u < 0) { beams.mesh.setMatrixAt(i, ZERO); continue; }
      let a0 = 0, a1 = 1, w = B.wid[i];
      if (B.kind[i] === STREAK) {                    // shoots out, tail catches up
        a1 = 0.25 + 0.75 * Math.min(1, 1 - (1 - Math.min(1, u / 0.3)) ** 3);
        a0 = Math.max(0, (u - 0.3) / 0.7) ** 1.3 * 0.85;
        w *= 1 - 0.5 * u;
      } else if (B.kind[i] === SLASH) {              // cut mark: rips across in 2 frames, thins to a hair, gone
        a1 = Math.min(1, u / 0.18);
        a0 = Math.max(0, (u - 0.45) / 0.55) * 0.6;
        w *= 1.15 - u;
      } else {                                        // rays / pillars grow fast, thin out
        a1 = Math.min(1, 1 - (1 - Math.min(1, u / 0.22)) ** 3);
        w *= B.kind[i] >= PILLAR ? 0.7 + 0.5 * Math.min(1, u * 4) - 0.4 * u : 1 - 0.7 * u;
      }
      const L = B.len[i];
      _ax.set(B.dx[i], B.dy[i], B.dz[i]);
      _st.set(B.sx[i], B.sy[i] + ground(B.sx[i], B.sz[i]), B.sz[i]).addScaledVector(_ax, L * a0);
      _ax.multiplyScalar(L * Math.max(0.01, a1 - a0));
      // x column = any perpendicular with length w (shader only reads its length)
      _sd.set(0, 1, 0).cross(_ax); if (_sd.lengthSq() < 1e-8) _sd.set(1, 0, 0); _sd.setLength(w);
      beams.mesh.setMatrixAt(i, _m.makeBasis(_sd, _0, _ax).setPosition(_st));
      beams.aF.array[i * 3] = u;
    }
    beams.mesh.instanceMatrix.needsUpdate = true; beams.aF.needsUpdate = true;
  };

  // ---- star flashes (contact cores, charge glint). Slot 0 is the glint that tracks the spear tip.
  const stars = makeQuadPool(scene, 128, new THREE.PlaneGeometry(2, 2), STAR_VS, STAR_FS, true);
  const SN = stars.n, St = { x: new Float32Array(SN), y: new Float32Array(SN), z: new Float32Array(SN), size: new Float32Array(SN),
    t: new Float32Array(SN), dur: new Float32Array(SN), on: new Uint8Array(SN) };
  stars.next = 1;
  const star = (x, y, z, size, dur, rgb, slot = -1, burst = 0) => {
    const i = slot >= 0 ? slot : stars.next;
    if (slot < 0) stars.next = stars.next + 1 >= SN ? 1 : stars.next + 1;
    St.x[i] = x; St.y[i] = y; St.z[i] = z; St.size[i] = size; St.t[i] = now(); St.dur[i] = dur; St.on[i] = 1;
    stars.aF.array[i * 3 + 1] = vrng.next(); stars.aF.array[i * 3 + 2] = burst;
    stars.mesh.setColorAt(i, _c.setRGB(rgb[0], rgb[1], rgb[2])); stars.mesh.instanceColor.needsUpdate = true;
  };
  const updateStars = () => {
    const f = now();
    for (let i = 0; i < SN; i++) {
      if (!St.on[i]) continue;
      const u = (f - St.t[i]) / 60 / St.dur[i];
      if (u >= 1) { St.on[i] = 0; stars.mesh.setMatrixAt(i, ZERO); continue; }
      if (i === 0) { St.x[0] = tipNow.x; St.y[0] = tipNow.y; St.z[0] = tipNow.z; }
      const s = St.size[i] * (i === 0 ? 0.6 + 0.4 * Math.sin(u * Math.PI) : stars.aF.array[i * 3 + 2] ? Math.min(1, 0.8 + u * 3)   // burst: full on the contact frame
        : Math.min(1, 0.45 + u * 4) * (1 - 0.3 * u));
      stars.mesh.setMatrixAt(i, _m.compose(_p.set(St.x[i], St.y[i] + ground(St.x[i], St.z[i]), St.z[i]), _q.identity(), _s.set(s, s, s)));
      stars.aF.array[i * 3] = i === 0 ? u * 0.6 : u;
    }
    stars.mesh.instanceMatrix.needsUpdate = true; stars.aF.needsUpdate = true;
  };

  // ---- slash arc ribbon
  const LIFE = 8, SUB = 4, MAXS = 56, MAXV = MAXS * SUB * 2 + 16;
  const tgeo = new THREE.BufferGeometry();
  const tpos = new Float32Array(MAXV * 3), tat = new Float32Array(MAXV * 4);
  tgeo.setAttribute('position', new THREE.BufferAttribute(tpos, 3).setUsage(THREE.DynamicDrawUsage));
  tgeo.setAttribute('aT', new THREE.BufferAttribute(tat, 4).setUsage(THREE.DynamicDrawUsage));
  const tidx = [];
  for (let i = 0; i < MAXV / 2 - 1; i++) { const a = i * 2; tidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  tgeo.setIndex(tidx);
  // veil pass, core pass (drawn after every other effect), depth pass, additive glow under the core (see TRAIL_FS)
  const heroA = { value: new THREE.Vector3(0, -1, -5) }, heroB = { value: new THREE.Vector3(0, 1, -5) };   // hero axis, view space
  const tU = { uWhite: { value: new THREE.Vector3() }, uFringe: { value: new THREE.Vector3() }, uHot: { value: new THREE.Vector3() }, uGlowC: { value: new THREE.Vector3() }, uGrad: { value: 0 } };
  for (const edge of [0, 1, 2, 3]) {
    const m = new THREE.Mesh(tgeo, new THREE.ShaderMaterial({ vertexShader: TRAIL_VS, fragmentShader: TRAIL_FS,
      uniforms: { uEdge: { value: edge }, uHeroA: heroA, uHeroB: heroB, ...tU }, defines: edge === 2 ? { DEPTH_PASS: 1 } : {}, transparent: true, depthWrite: edge === 2, colorWrite: edge !== 2,
      side: THREE.DoubleSide, premultipliedAlpha: true }));   // premultiplied over
    m.frustumCulled = false; m.renderOrder = [0, 10, 11, 9][edge];
    if (!edge) m.onBeforeRender = (r, sc, cam) => {   // render camera, read by rocks/dustColumn and the ribbon's depth pull
      const h = game.hero, gy = ground(h.x, h.z), tc = kp().trail;
      tU.uWhite.value.fromArray(tc.white); tU.uFringe.value.fromArray(tc.fringe); tU.uHot.value.fromArray(tc.hot); tU.uGlowC.value.fromArray(tc.glow); tU.uGrad.value = tc.grad ? 1 : 0;
      camPos.copy(cam.position); camPos.y -= gy;                   // sim space, like every effect position
      heroA.value.set(h.x, h.y + gy + 0.05, h.z).applyMatrix4(cam.matrixWorldInverse);
      heroB.value.set(h.x, h.y + gy + 1.85, h.z).applyMatrix4(cam.matrixWorldInverse);
    };
    scene.add(m);
  }
  const samples = [];            // { b, t: ribbon edges, rt: real tip, c:clock, g:gain, hue, flat, fk: disc widening, brk }
  const camPos = new THREE.Vector3(0, 1e3, 0);
  let clock = 0;
  const pose = new Float32Array(POSE_SIZE), hpos = new THREE.Vector3(), tipNow = new THREE.Vector3(), baseNow = new THREE.Vector3();

  const vfx = { flash: 0 };
  let flashDecay = 2.2;
  const flash = (v, decay = 2.2) => { if (v >= vfx.flash) { vfx.flash = v; flashDecay = decay; } };

  const GAIN = [0.08, 0.3];
  const isHeavyMove = (id) => !!id && (id[0] === 'c' || id === 'jc' || id === 'n6');
  function trailActive(h) {
    const tr = h.kit.trail;
    if (tr.moves) { if (h.state !== 'attack' || !tr.moves.includes(h.move)) return false; }   // only these moves cut
    else if (h.state === 'musou') return h.stateT > 30;      // after the activation pose
    if (h.state !== 'attack') return false;
    const [p0, p1] = tr.pad || [3, 2];
    for (const w of h.kit.moves[h.move].hits || []) if (h.moveT >= w.f[0] - p0 && h.moveT <= w.f[1] + p1) return true;
    return false;
  }

  // ---- event-driven bursts
  const needleBurst = (x, y, z, n, dx, dz, spd, pal, size = 0.045, len = 1, pool = sparks) => {
    for (let i = 0; i < n; i++) {
      const a = vrng.range(0, 6.283), up = vrng.range(-0.35, 1);
      const s = spd * vrng.range(0.55, 1), c = pal[vrng.int(0, pal.length - 1)];
      pool.spawn(x, y, z, (Math.cos(a) * 0.8 + dx * 0.7) * s, up * s * 0.75 + 1, (Math.sin(a) * 0.8 + dz * 0.7) * s,
        vrng.range(0.11, 0.2), size * vrng.range(0.8, 1.2), 0, c[0], c[1], c[2], len);
    }
  };
  // dust = clusters of small warm voxels (2 per requested puff, 0.6× size) so it reads as a billow, not as boxes
  const dustPuff = (x, z, n, spread, size = 0.5, y = 0.15, alpha = 0.5) => {
    size *= 0.6;
    for (let i = 0; i < n * 2; i++) {
      const a = vrng.range(0, 6.283), s = vrng.range(0.4, 1) * spread, c = DUST[vrng.int(0, DUST.length - 1)];
      dust.spawn(x + Math.cos(a) * 0.25, y + vrng.range(0, 0.25), z + Math.sin(a) * 0.25, Math.cos(a) * s, vrng.range(0.3, 1.3), Math.sin(a) * s,
        vrng.range(0.6, 1.2), size * vrng.range(0.7, 1.3), 2, c[0], c[1], c[2], alpha * vrng.range(0.7, 1));
    }
  };
  /** Ring of dust rolling outward along the ground (shockwave in the voxel style). */
  const dustRing = (x, z, n, r0, spd, size, alpha) => {
    size *= 0.6; n *= 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + vrng.range(-0.15, 0.15), c = DUST[vrng.int(0, DUST.length - 1)], s = spd * vrng.range(0.75, 1.1);
      dust.spawn(x + Math.cos(a) * r0, 0.15 + vrng.range(0, 0.3), z + Math.sin(a) * r0, Math.cos(a) * s, vrng.range(0.4, 1.6), Math.sin(a) * s,
        vrng.range(0.7, 1.3), size * vrng.range(0.7, 1.3), 2, c[0], c[1], c[2], alpha * vrng.range(0.7, 1));
    }
  };
  // horizontal launch is mirrored away from the camera (a chunk heading at the lens flies behind the victim instead),
  // so KO debris bursts around soldiers instead of over the gameplay camera
  const chunks = (x, y, z, n, dx, dz, spd, pal, smin, smax, up, life) => {
    const cx = camPos.x - x, cz = camPos.z - z, cl = Math.hypot(cx, cz) || 1, ux = cx / cl, uz = cz / cl;
    for (let i = 0; i < n; i++) {
      const c = pal[vrng.int(0, pal.length - 1)], a = vrng.range(0, 6.283), s = spd * vrng.range(0.3, 1);
      let vx = (Math.cos(a) * 0.6 + dx) * s, vz = (Math.sin(a) * 0.6 + dz) * s;
      const tc = vx * ux + vz * uz;
      if (tc > 0) { vx -= 1.6 * tc * ux; vz -= 1.6 * tc * uz; }
      debris.spawn(x + vrng.range(-0.2, 0.2), y + vrng.range(-0.4, 0.4), z + vrng.range(-0.2, 0.2),
        vx, vrng.range(up[0], up[1]), vz, vrng.range(life[0], life[1]), vrng.range(smin, smax), 1, c[0], c[1], c[2]);
    }
  };
  const shards = (x, y, z, n, spd, rgb, size = 0.08) => {
    for (let i = 0; i < n; i++) {
      const a = vrng.range(0, 6.283), s = spd * vrng.range(0.4, 1);
      sparks.spawn(x, y, z, Math.cos(a) * s, vrng.range(2, 8), Math.sin(a) * s, vrng.range(0.35, 0.7), size * vrng.range(0.6, 1.3), 4,
        rgb[0] * vrng.range(0.7, 1.1), rgb[1] * vrng.range(0.8, 1.1), rgb[2]);
    }
  };
  const embers = (x, y, z, n, spread, rgb = EMBER) => {
    for (let i = 0; i < n; i++) {
      sparks.spawn(x + vrng.range(-spread, spread), y + vrng.range(0, 0.6), z + vrng.range(-spread, spread),
        vrng.range(-1.2, 1.2), vrng.range(1.2, 3.5), vrng.range(-1.2, 1.2), vrng.range(0.9, 2.0), vrng.range(0.03, 0.06), 3, rgb[0], rgb[1], rgb[2]);
    }
  };
  /** Radial ray burst: n beams from (x,z) tilted up-and-out, length L. */
  const rayBurst = (x, y, z, n, L, rgb, tilt = [0.35, 1.0], dur = 0.42, wid = 0.55, fan = null) => {
    for (let i = 0; i < n; i++) {
      const a = fan ? fan[0] + (i / Math.max(1, n - 1) - 0.5) * fan[1] + vrng.range(-0.08, 0.08) : (i / n) * 6.283 + vrng.range(-0.2, 0.2);
      const el = vrng.range(tilt[0], tilt[1]), ce = Math.cos(el);
      beam(RAY, x + Math.sin(a) * 0.3, y, z + Math.cos(a) * 0.3, Math.sin(a) * ce, Math.sin(el), Math.cos(a) * ce,
        L * vrng.range(0.7, 1.15), wid * vrng.range(0.7, 1.2), dur * vrng.range(0.85, 1.15), rgb, vrng.range(0, 0.04));
    }
  };

  // eruptions keep the ±60° sector toward the camera clear (mirrored to the far side), so the volume rises around and
  // behind the hero instead of burying the lens at the 5 m gameplay camera
  const offLens = (x, z, a) => {
    const cx = camPos.x - x, cz = camPos.z - z, l = Math.hypot(cx, cz) || 1;
    return (Math.cos(a) * cx + Math.sin(a) * cz) / l > 0.5 ? a + Math.PI : a;
  };
  /** Rock eruption: n voxel cobbles thrown out of a disc of radius r (peak height ≈ up² / 44 m), bounce once, settle. */
  const rocks = (x, z, n, r, smin, smax, up, spd) => {
    for (let i = 0; i < n; i++) {
      const a = offLens(x, z, vrng.range(0, 6.283)), d = r * Math.sqrt(vrng.range(0.04, 1)), s = spd * vrng.range(0.35, 1), sz = vrng.range(smin, smax);
      const c = ROCK[vrng.int(0, ROCK.length - 1)];
      debris.spawn(x + Math.cos(a) * d, sz * 0.5 + 0.05, z + Math.sin(a) * d, Math.cos(a) * s, vrng.range(up[0], up[1]), Math.sin(a) * s,
        vrng.range(2.6, 3.8), sz, 1, c[0], c[1], c[2]);
    }
  };
  /** Dust column: big warm puffs rising in a ring of radius r0..r1, tops near `top` m, holding ≈ 1 s (C6-style dust wall). */
  const dustColumn = (x, z, n, r0, r1, top, size, alpha) => {
    for (let i = 0; i < n; i++) {
      const a = offLens(x, z, vrng.range(0, 6.283)), d = vrng.range(r0, r1), c = DUST_WALL[vrng.int(0, DUST_WALL.length - 1)], k = vrng.range(0.3, 1);
      const vy = vrng.range(1.4, 3.2) * top / 4.6;                         // drag 1.8/s → rises vy / 1.8 m
      dust.spawn(x + Math.cos(a) * d, 0.3 + (top * 0.62 - 0.3) * k * k, z + Math.sin(a) * d, Math.cos(a) * vrng.range(0.8, 2.6), vy, Math.sin(a) * vrng.range(0.8, 2.6),
        vrng.range(1.0, 1.5), vrng.range(size[0], size[1]), 2, c[0], c[1], c[2], alpha * vrng.range(0.8, 1));
    }
  };
  /** Dark smoke arc over the hero (C3): arch in the plane across his facing, grown from the top down both sides (k 0..1). */
  const darkArc = (h, k0, k1) => {
    const rx = Math.cos(h.yaw), rz = -Math.sin(h.yaw), fx = Math.sin(h.yaw), fz = Math.cos(h.yaw), R = 2.5;
    for (let side = -1; side <= 1; side += 2) {
      for (let j = 0; j < 4; j++) {
        const th = Math.PI / 2 + side * (k0 + (k1 - k0) * (j + vrng.next()) / 4) * Math.PI / 2, c = SMOKE[vrng.int(0, SMOKE.length - 1)];
        const lx = Math.cos(th) * R, y = 0.25 + Math.sin(th) * R * 1.05;
        dust.spawn(h.x + rx * lx + fx * 0.6, y, h.z + rz * lx + fz * 0.6, rx * Math.cos(th) * 0.6, 0.3 + Math.sin(th) * 0.4, rz * Math.cos(th) * 0.6,
          vrng.range(0.28, 0.36), vrng.range(0.3, 0.42), 2, c[0], c[1], c[2], 0.9);
      }
    }
  };
  /** Ring of light columns (C3 gold pillars / C5 fan of shafts): PILLAR beams leaning `lean` rad outward. */
  const columns = (x, z, n, r, len, wid, dur, rgb, lean = 0.05, a0 = 0, kind = PILLAR) => {
    for (let i = 0; i < n; i++) {
      const a = offLens(x, z, a0 + (i / n) * 6.283 + vrng.range(-0.2, 0.2)), l = lean * vrng.range(0.7, 1.3), ca = Math.cos(a), sa = Math.sin(a);
      beam(kind, x + ca * r, 0, z + sa * r, ca * Math.sin(l), Math.cos(l), sa * Math.sin(l),
        len * vrng.range(0.85, 1.15), wid * vrng.range(0.8, 1.2), dur * vrng.range(0.9, 1.1), rgb, (i % 3) * 0.017);
    }
  };

  // per-frame hit budget: a sweep through 30+ soldiers must stay readable, so per-enemy effects shrink with the count
  // (but every struck soldier still gets a visible burst)
  let hitFrame = -1, hitN = 0, lastTick = -1;
  on('hit', (e) => {
    if (game.frame !== hitFrame) { hitFrame = game.frame; hitN = 0; }
    hitN++;
    const cool = e.heavy || e.move === 'musou', K = kp();       // "cool" = the kit's heavy palette (ice / fire)
    const pal = cool ? K.needle : NEEDLE_WARM;
    // musou part r2: the Musou lands ~100 hits in 0.4 s; at the normal budget their sparks + stars bloomed into a white
    // cloud over the launch fan, so musou hits get a tighter one (the musou view draws the payoff light itself)
    const mh = e.move === 'musou';
    // benchmark contact spark: 1-2 BH across, ≤ 8 sf, radial streaks round a white core; heavy hits a size up
    // (the first few struck soldiers of a frame get the full burst, the rest a small one, so a sweep does not fog white)
    // r4: the first 6 struck soldiers of a frame get the full 1-2 H burst (star spikes ≈ 1.6-1.9 m radius + 14-18
    // needles ≈ 1-1.5 m long, starting on the camera side of the body), 7-12 a half-size one, the rest today's speck
    if (mh) {
      needleBurst(e.x, e.y, e.z, hitN <= 3 ? 2 : 0, e.dx, e.dz, 16, pal, 0.05);
      // fx r1: one hot core per frame, 2-4 frames (≈ 5 HDR stars a frame stacked into the cyan fog over the launch fan)
      if (hitN <= 1) star(e.x, e.y, e.z, 0.7 * vrng.range(0.9, 1.1), 0.07, K.flash);
    } else {
      const tier = hitN <= (e.heavy ? 3 : 5) ? 0 : hitN <= 12 ? 1 : 2;   // (fx r3: a heavy pierce line: 3 full bursts, not a wall of confetti)
      const cx = camPos.x - e.x, cy = camPos.y - e.y, cz = camPos.z - e.z, cl = Math.hypot(cx, cy, cz) || 1, o = 0.45 / cl;
      const x = e.x + cx * o, y = e.y + cy * o, z = e.z + cz * o;
      // a burst near the lens (close finisher cameras) shrinks; fx r2: under the aim lens the contact is a small
      // confirmation at the target, not a bloom over the shot just lined up
      const near = Math.min(1, Math.max(0.35, (cl - 1) / 5)) * (game.musou.aim?.active ? 0.4 : 1);
      const n = Math.round((tier === 0 ? (e.heavy ? 13 : 6) : tier === 1 ? 5 : hitN % 2) * near);
      needleBurst(x, y, z, n, e.dx, e.dz, (e.heavy ? 20 : 16) * near, cool ? K.hot : NEEDLE_WARM, (e.heavy ? 0.06 : 0.032) * (tier ? 0.8 : 1) * near, e.heavy ? 1.5 : 1.0, hot);
      if (tier < 2) star(e.x, e.y, e.z, (e.heavy ? 1.5 : 0.75) * (tier ? 0.55 : 1) * near * vrng.range(0.85, 1.15), e.heavy ? 0.15 : 0.13, cool ? K.burst : FLASH_WARM, -1, 1);
      else if (hitN % 3 === 0) star(e.x, e.y, e.z, 0.6 * vrng.range(0.9, 1.1), 0.1, cool ? K.flash : FLASH_WARM);
      // layered contact (DW8): a razor cut mark ripping across the body (perpendicular to the blow, random tilt) and a
      // shock pulse ring on the first struck soldiers of a frame; the heaviest contact of a tick pops an impact light
      if (hitN <= (e.heavy ? 3 : 1)) {                  // fx r2: a normal hit is small and sharp; heavy / charge contacts escalate
        const L = (e.heavy ? 2.8 : 1.5) * near * vrng.range(0.85, 1.15), tilt = vrng.range(-0.75, 0.75);
        const ax = -e.dz, az = e.dx, al = Math.hypot(ax, tilt, az) || 1;
        beam(SLASH, x - ax / al * L * 0.5, y - tilt / al * L * 0.5, z - az / al * L * 0.5, ax, tilt, az, L, (e.heavy ? 0.5 : 0.2) * near, e.heavy ? 0.24 : 0.2, cool ? K.slash : SLASH_WARM);
      }
      if (hitN === 1) star(x, y, z, (e.heavy ? 1.1 : 0.4) * near, e.heavy ? 0.2 : 0.15, cool ? K.pulse : PULSE_WARM, -1, 2);
      if (hitN === 1 && (e.heavy || e.killed)) lightFlash(x, y, z, cool ? K.light : [1, 0.62, 0.3], (e.heavy ? 40 : 18) * near * near, e.heavy ? 0.22 : 0.14);
    }
    if (vrng.chance(mh ? 0.08 : e.heavy ? 0.7 : 0.35)) chunks(e.x, e.y - 0.2, e.z, 1, e.dx, e.dz, 3, e.officer ? OFFICER : SOLDIER, 0.07, 0.14, [2, 5], [1, 1.6]);
  });
  // KO: the soldier visibly breaks apart — chunky voxel debris in his own colours plus helmet / torso / shield blocks
  on('ko', (e) => {
    const pal = e.officer ? OFFICER : SOLDIER;
    // musou part r2: ~55 KOs land inside 1 s of Musou; full debris per KO buried the launch fan and the dragon once the
    // payoff stopped being a whiteout, so a Musou KO (not an officer) sheds a few smaller chunks and no body blocks
    const mk = game.hero.state === 'musou' && !e.officer;
    // a KO within ≈ 5 m of the lens sheds fewer, smaller chunks (big blocks there covered the frame)
    const near = Math.min(1, Math.max(0.45, Math.hypot(camPos.x - e.x, camPos.y - e.y, camPos.z - e.z) / 5));
    chunks(e.x, e.y, e.z, Math.round((e.officer ? 14 : mk ? 4 : 9) * near), e.dx, e.dz, 4.2, pal, (mk ? 0.08 : 0.11) * near, (mk ? 0.13 : 0.22) * near, [1.8, 4.2], [1.2, 2]);
    if (!mk && near > 0.7) for (const [c, s0, s1, dy] of e.officer ? OFFICER_BODY : SOLDIER_BODY) chunks(e.x, e.y + dy, e.z, 1, e.dx, e.dz, 3.4, [c], s0 * near, s1 * near, [2.2, 4], [1.1, 1.6]);
    needleBurst(e.x, e.y, e.z, 3, e.dx, e.dz, 9, NEEDLE_WARM, 0.05);
    // the blow carries through him: a spray of sparks thrown along the knockback, and officers go down with a flash
    if (!mk) needleBurst(e.x, e.y, e.z, Math.round(6 * near), e.dx * 2.2, e.dz * 2.2, 11, NEEDLE_WARM, 0.05, 1.4, hot);
    if (e.officer) { star(e.x, e.y, e.z, 2.6, 0.3, PULSE_WARM, -1, 2); lightFlash(e.x, e.y, e.z, [1, 0.55, 0.25], 45, 0.3); ring(e.x, e.z, 3, 0.4, [1.6, 0.9, 0.4]); }
    if (vrng.chance(0.5)) embers(e.x, e.y - 0.4, e.z, 2, 0.3);
    dustPuff(e.x, e.z, 2, 1.4, 0.55, 0.15, 0.4);
  });
  // duel blow (Shu ally ↔ Wei grunt): a small contact spark, a few needles on a KO — the hero's hits stay the big ones
  on('clash', (e) => { star(e.x, e.y, e.z, e.killed ? 0.6 : 0.35, 0.1, FLASH_WARM); needleBurst(e.x, e.y, e.z, e.killed ? 5 : 2, e.dx, e.dz, 9, NEEDLE_WARM, 0.035); });
  on('enemy:land', (e) => { dustPuff(e.x, e.z, e.bounce ? 2 : 3, 1.6, 0.46, 0.1, 0.5); if (!e.bounce) chunks(e.x, 0.1, e.z, 2, 0, 0, 1.8, GROUND, 0.08, 0.16, [1.5, 3.5], [1.4, 2.2]); });
  // locomotion-dodge r3: readable ground contact — a kick of dust behind every dodge push-off and roll plant (footstep
  // `kick`), a puff under each take-off, a dust ring on every landing, and sprint footfalls that leave a low trail
  on('dodge', (e) => { dustPuff(e.x - e.dx * 0.4, e.z - e.dz * 0.4, 7, 2.8, 0.5, 0.08, 0.5); });
  on('footstep', (e) => e.kick ? dustPuff(e.x, e.z, 6, 2.2, 0.46, 0.06, 0.5)
    : dustPuff(e.x, e.z, e.speed > 6 ? 3 : 1, e.speed > 6 ? 1.1 : 0.6, e.speed > 6 ? 0.36 : 0.22, 0.05, 0.42));
  on('jump', (e) => dustPuff(e.x, e.z, 4, 1.8, 0.42, 0.06, 0.45));
  on('land', (e) => { dustPuff(e.x, e.z, e.hard ? 9 : 5, 2.4, 0.4); dustRing(e.x, e.z, e.hard ? 12 : 9, 0.35, e.hard ? 4.5 : 3.2, 0.42, 0.5); });
  on('hero:hurt', (e) => e.armored ? star(e.x, e.y, e.z, 0.45, 0.06, [1.6, 0.5, 0.3]) : star(e.x, e.y, e.z, 0.9, 0.1, [2.4, 0.5, 0.3]));

  // Heavy windows open → finisher volume. Charge finishers get their benchmark identity (charge-attacks notes):
  // C3 gold pillar ring (after the dark smoke arc, see afterStep), C5 fan of blue-white shafts from the ground,
  // C6 rock eruption inside a 2.5 H dust wall, jump charge a small quake; the rest is shaped by the hitbox.
  const GOLD = [1.5, 0.72, 0.2], SHAFT = [0.28, 0.52, 0.92], BOW_RING = [0.9, 0.5, 0.16];   // (N5 spin ring: dimmer, fx r3 acc)
  const CRACK_WARM = [2.6, 1.0, 0.25], WALL_WARM = [1.2, 0.6, 0.2];
  on('attack:swing', (e) => {
    const h = game.hero, m = h.kit.moves[e.move], hit = m && m.hits[e.win];
    if (!m) return;
    if (!m.air && h.y < 0.3) dustPuff(h.x + Math.sin(e.yaw) * 0.4, h.z + Math.cos(e.yaw) * 0.4, e.heavy ? 4 : 2, 1.8, 0.34, 0.08, 0.4);
    if (!hit) return;
    if (hit.beam || hit.proj || hit.roar || hit.sigil) return;   // the kit's own view draws these windows (src/chars/kitview.js, sigil: zhugeliang/fx.js)
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), K = kp();
    const R = hit.range || hit.len || 4, charge = e.move[0] === 'c' || e.move === 'jc';   // light volumes = charge finishers only
    const tr = h.kit.trail;
    if (!e.heavy && tr.moves && tr.moves.includes(e.move)) {   // fx r1: bow-limb slashes (the ribbon is the arc itself)
      // fx r2: the crescent ribbon is the cut (a straight razor beam + pulse ring over it read as a lens flare)
      if (hit.shape === 'circle') {                          // N5 spin: ground ring + dust skirt under the disc
        ring(h.x, h.z, R * 1.2, 0.3, BOW_RING);
        dustRing(h.x, h.z, 16, 0.6, R * 1.7, 0.5, 0.55);
      }
      shards(h.x + fx * R * 0.5, 1.1, h.z + fz * R * 0.5, 8, 3.5, K.glitter, 0.03);
    }
    if (!e.heavy) return;
    // integration r2: combo-system split C3 / C6 into slam + delayed ground wave; the wave window carries the moves.js
    // `pillars` / `rocks` fields, so the finisher identity fires on that window (the slam / plunge impact is a quake)
    if (hit.rocks) {                                        // C6 eruption: boulders 1-2 H up, dust wall ≥ 2.5 H for ≈ 1 s
      rocks(h.x, h.z, 22, 3.2, 0.18, 0.42, [5.5, 10.5], 3.2);
      rocks(h.x, h.z, 4, 2.2, 0.45, 0.58, [6, 9], 2.2);
      rocks(h.x, h.z, 18, 3.6, 0.1, 0.2, [4, 9], 5);
      dustColumn(h.x, h.z, 24, 1.2, 3.6, 4.8, [0.9, 1.3], 0.66);
      dustColumn(h.x, h.z, 10, 0.2, 1.4, 2.6, [0.7, 1.0], 0.45);
      dustRing(h.x, h.z, 26, 0.8, R * 1.8, 0.7, 0.6);
      ring(h.x, h.z, R * 1.2, 0.45, [1.9, 1.3, 0.7]);
      star(h.x, 0.5, h.z, 1.6, 0.14, [2.2, 1.6, 1.0]);
      crack(h.x, h.z, 4.4, CRACK_WARM);
      wall(h.x, h.z, R * 1.5, 2.4, 0.5, WALL_WARM);
      lightFlash(h.x, 1.2, h.z, [1, 0.6, 0.3], 50, 0.35, 14);
      flash(0.14);
    } else if (hit.pillars) {                               // C3 ring of gold pillars, 3+ H tall, disc ≈ 1.4 H
      columns(h.x, h.z, hit.pillars, 2.6, 6.2, 1.0, 0.62, GOLD, 0.04, e.yaw);
      ring(h.x, h.z, R * 1.2, 0.45, [2.0, 1.3, 0.5]);
      dustRing(h.x, h.z, 22, 0.5, R * 1.6, 0.6, 0.6);
      dustColumn(h.x, h.z, 12, 1.6, 3.2, 3.2, [0.8, 1.1], 0.55);
      rocks(h.x, h.z, 14, 2.8, 0.14, 0.34, [4, 8], 3.5);
      crack(h.x, h.z, 3.6, [2.6, 1.5, 0.4]);
      wall(h.x, h.z, R * 1.4, 2.8, 0.55, [1.3, 0.75, 0.2]);
      lightFlash(h.x, 1.5, h.z, [1, 0.75, 0.35], 45, 0.4, 14);
      flash(0.12);
    } else if (e.move === 'c5' && zy()) {                   // fan of broad blue-white shafts ≈ 2.5 H from the ground, rock chips
      columns(h.x, h.z, 9, 0.7, 5.2, 0.95, 0.3, SHAFT, 0.62, e.yaw, SHAFT_K);
      rayBurst(h.x, 0.15, h.z, 4, R * 0.9, K.flash, [0.8, 1.3], 0.3, 0.35);
      ring(h.x, h.z, R * 1.2, 0.4, K.ring);
      dustRing(h.x, h.z, 20, 0.5, R * 1.7, 0.55, 0.6);
      rocks(h.x, h.z, 16, 2.2, 0.12, 0.32, [4.5, 9], 4);
      shards(h.x, 0.6, h.z, 12, 7, K.shard);
      crack(h.x, h.z, 3.0, K.crack);
      wall(h.x, h.z, R * 1.3, 2, 0.4, K.wall);
      lightFlash(h.x, 1.2, h.z, K.light, 55, 0.3, 12);
      flash(0.12);
    } else if (hit.shape === 'circle') {                    // N6 / jump charge / C6 plunge / other heavy circles: slam quake
      if (charge && e.move !== 'jc') rayBurst(h.x, 0.15, h.z, 10, R * 0.9, K.flash, [0.75, 1.35], 0.38, 0.45);
      ring(h.x, h.z, R * 1.25, 0.4, K.ring);
      dustRing(h.x, h.z, 22, 0.5, R * 1.9, 0.55, 0.6);
      dustColumn(h.x, h.z, 10, 0.8, 2.4, 2.4, [0.7, 1.0], 0.55);
      rocks(h.x, h.z, 14, 2.2, 0.13, 0.32, [4, 8], 3.5);
      if (charge) shards(h.x, 0.6, h.z, 14, 7, K.shard);
      crack(h.x, h.z, Math.max(2.4, R * 0.9), K.crack);
      wall(h.x, h.z, R * 1.35, charge ? 1.8 : 1.3, 0.4, K.wall);
      lightFlash(h.x, 1, h.z, K.light, 50, 0.28, 12);
      flash(0.12);
    } else if (hit.shape === 'line') {
      for (let k = 0; k < 4; k++) {
        const d = (hit.off || 0) + 1 + k * (hit.len - 1) / 3.2;
        const px = h.x + fx * d + vrng.range(-0.3, 0.3), pz = h.z + fz * d + vrng.range(-0.3, 0.3);
        beam(PILLAR, px, 0, pz, vrng.range(-0.05, 0.05), 1, vrng.range(-0.05, 0.05), vrng.range(5, 6.5), vrng.range(0.9, 1.2), 0.55, [2.4, 1.3, 0.4], k * 0.03);
        dustPuff(px, pz, 3, 2.2, 0.5, 0.1, 0.55);
      }
      ring(h.x + fx * 2.5, h.z + fz * 2.5, 3.2, 0.35, [1.8, 1.3, 0.7]);
      rocks(h.x + fx * 2.5, h.z + fz * 2.5, 12, 1.8, 0.13, 0.3, [4, 8], 3);
      crack(h.x + fx * 2.5, h.z + fz * 2.5, 2.6, CRACK_WARM);
      lightFlash(h.x + fx * 2.5, 1.2, h.z + fz * 2.5, [1, 0.62, 0.3], 50, 0.3, 12);
      flash(0.1);
    } else {
      const ang = (hit.ang || 180) * Math.PI / 180, dir = e.yaw + (hit.dir || 0) * Math.PI / 180;
      if (charge) rayBurst(h.x, 0.4, h.z, 7, R * 0.8, K.flash, [0.35, 0.9], 0.34, 0.4, [dir, ang]);
      ring(h.x, h.z, R * 1.15, 0.35, K.ring);
      dustRing(h.x, h.z, 14, 0.5, R * 1.5, 0.5, 0.55);
      rocks(h.x + fx, h.z + fz, 10, 1.6, 0.12, 0.28, [4, 7.5], 3);
      if (charge) { wall(h.x, h.z, R * 1.2, 1.0, 0.32, K.wall); lightFlash(h.x + fx, 1, h.z + fz, K.light, 35, 0.22); }
    }
    embers(h.x, 0.3, h.z, 8, 1.5);
  });

  // Charge tell: blue-white glint on the spear tip 10-28 sf before the first active frame.
  on('attack:start', (e) => {
    if (e.move === 'dash') dustPuff(e.x, e.z, 4, 2.2, 0.36, 0.08, 0.45);
    const K = kp();
    if (K.glint && e.move && (e.move[0] === 'c' || e.move === 'jc')) star(tipNow.x, tipNow.y, tipNow.z, 0.7, 0.2, K.glint, 0);
    // combo-system seam: ground ring that spreads over the charge tell (payload `tell` = frames to the first active)
    if (e.charge) ring(e.x, e.z, 2.4, Math.max(0.2, e.tell / 60), K.ring);
  });

  // actors lane: hero-model actors (src/actors) — a boss blow lands (shaped by its hitbox: leap = quake + rocks + crack,
  // sweep = ring + dust skirt, thrust = dust bursts down the lane under a hot streak), a poise break (star + ring), a 肉包
  // eaten (jade ring, star, motes). Struck actors get the normal contact burst through `hit`.
  const BOSS_RING = [2.2, 0.55, 0.28];
  on('actor:strike', (e) => {
    const R = e.r || 3;
    if (e.kind === 'leap') {
      ring(e.x, e.z, R * 1.25, 0.5, BOSS_RING); dustRing(e.x, e.z, 26, 0.6, R * 2, 0.7, 0.6);
      rocks(e.x, e.z, 18, R * 0.7, 0.14, 0.34, [5, 9], 4); dustColumn(e.x, e.z, 12, 0.6, R * 0.6, 3, [0.8, 1.1], 0.55);
      crack(e.x, e.z, R * 0.85, CRACK_WARM); wall(e.x, e.z, R * 1.3, 1.8, 0.4, WALL_WARM);
      lightFlash(e.x, 1, e.z, [1, 0.5, 0.25], 50, 0.3, 12); flash(0.14);
    } else if (e.kind === 'circle') {
      ring(e.x, e.z, R * 1.15, 0.4, BOSS_RING); dustRing(e.x, e.z, 18, 0.5, R * 1.7, 0.55, 0.55);
      rocks(e.x, e.z, 8, R * 0.6, 0.1, 0.24, [3, 6], 3); wall(e.x, e.z, R * 1.2, 1.2, 0.35, WALL_WARM);
      lightFlash(e.x, 1, e.z, [1, 0.5, 0.25], 30, 0.22);
    } else {
      const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
      for (let k = 0; k < 4; k++) { const d = 1 + k * (e.len - 1) / 3.2; dustPuff(e.x + fx * d, e.z + fz * d, 3, 2.2, 0.5, 0.1, 0.55); }
      beam(STREAK, e.x + fx * 0.6, 1.2, e.z + fz * 0.6, fx, 0, fz, e.len, 1.0, 0.3, [2.4, 0.7, 0.3]);
      rocks(e.x + fx * e.len * 0.6, e.z + fz * e.len * 0.6, 8, 1.4, 0.1, 0.24, [3, 6], 3);
    }
  });
  on('actor:hit', (e) => { if (e.stagger) { star(e.x, e.y + 0.5, e.z, 2.0, 0.3, [2.4, 2.0, 0.8]); ring(e.x, e.z, 3, 0.4, [2.2, 1.8, 0.8]); flash(0.08); } });
  on('pickup', (e) => {
    ring(e.x, e.z, 1.6, 0.45, [0.5, 2.0, 0.7]); star(e.x, 0.8, e.z, 1.1, 0.25, [1.2, 2.4, 1.0]);
    for (let i = 0; i < 10; i++) sparks.spawn(e.x + vrng.range(-0.5, 0.5), vrng.range(0.1, 0.6), e.z + vrng.range(-0.5, 0.5), 0, vrng.range(1.5, 3), 0, vrng.range(0.5, 0.9), vrng.range(0.03, 0.05), 3, 0.6, 2.2, 0.8);
  });

  // Musou payoff layers take the character's colour: Zhao Yun's azure dragon, Huang Zhong's fire volley, a def kit's fx.mu
  const MU_COOL = { crack: [0.4, 1.5, 2.6], wall: [0.07, 0.3, 0.45], light: [0.5, 0.9, 1] }, MU_FIRE = { crack: [2.8, 1.1, 0.25], wall: [0.8, 0.34, 0.09], light: [1, 0.6, 0.3] };
  const muPal = () => kp().mu || (zy() ? MU_COOL : MU_FIRE);
  on('musou:start', (e) => {
    // no screen flash here: src/musou/view.js owns the activation flash + dim (musou part)
    if (zy()) ring(e.x, e.z, 7, 0.5, TEAL);
    wall(e.x, e.z, 4.5, 1.8, 0.5, muPal().wall);
    lightFlash(e.x, 1.4, e.z, muPal().light, 40, 0.5, 12);
    if (!zy()) return;                                 // teal star / shards are Zhao Yun's; the other kits' views own theirs
    star(tipNow.x, tipNow.y, tipNow.z, 1.0, 0.5, [1.0, 1.9, 2.8], 0);
    shards(e.x, 1.0, e.z, 20, 4, [0.6, 1.6, 2.4], 0.06);
    dustRing(e.x, e.z, 16, 0.4, 5, 0.45, 0.45);
  });
  on('musou:hit', (e) => {
    const h = game.hero, fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), side = (e.n % 2 ? 1 : -1) * 0.25;
    const y = Math.min(1.8, Math.max(0.8, tipNow.y));
    // musou part r2: ~2 ticks land per frame and every streak runs from Zhao Yun along the rush line — right over the
    // dragon that now surges out of the spear — so they piled into a white bar that hid it and the launch fan: streaks
    // only on the contact thrust and every other sweep, slimmer; sparks elsewhere
    if (e.stage === 'contact' && e.n <= 1) {           // the first mass hit tears the ground open
      const P = muPal();
      crack(e.x, e.z, 4.5, P.crack, 3.6);
      wall(e.x, e.z, 7, 1.3, 0.4, P.wall);
      lightFlash(e.x, 1.5, e.z, P.light, 30, 0.4, 14);
    }
    if (!zy()) return;                                 // teal rush streaks run from the spear: Zhao Yun only
    if (!(e.stage === 'contact' || (e.stage === 'rush' && e.n % 6 === 0))) { needleBurst(e.x, e.y, e.z, 2, fx, fz, 12, NEEDLE_COOL, 0.045); return; }
    beam(STREAK, h.x + fz * side + fx * 0.6, y, h.z - fx * side + fz * 0.6, fx, 0, fz, 6, 0.4, 0.2, TEAL);
    beam(STREAK, h.x - fz * side * 2 + fx * 0.9, y + 0.3, h.z + fx * side * 2 + fz * 0.9, fx, 0.02, fz, 4.2, 0.3, 0.16, [1.2, 1.9, 2.4], 0.02);
    beam(STREAK, h.x + fz * side * 3 + fx * 0.9, y - 0.3, h.z - fx * side * 3 + fz * 0.9, fx, -0.02, fz, 3.6, 0.26, 0.15, [1.2, 1.9, 2.4], 0.04);
    needleBurst(e.x, e.y, e.z, 3, fx, fz, 12, NEEDLE_COOL, 0.05);
    if (e.n % 3 === 0) dustPuff(h.x, h.z, 2, 2.5, 0.4, 0.1, 0.45);
  });
  on('musou:burst', (e) => {
    // musou part r2: the finisher sits under the musou view's own burst light and the post's cool-biased bloom; at full
    // strength these stacked into a white fog over the launched tiers. Short flash
    // kick (was 0.3 held 0.35 s), fewer / slimmer / dimmer rays and sparks, so the bodies stay readable.
    const P = muPal();
    crack(e.x, e.z, 6, P.crack, 4);
    wall(e.x, e.z, 7, 1.4, 0.4, P.wall);                   // fx r1: lower / dimmer; fx r2: 7 m (11 m swept past the finisher lenses)
    lightFlash(e.x, 2, e.z, P.light, 40, 0.5, 18);
    if (!zy()) return;                                 // Huang Zhong's fireball (src/chars/huangzhong/fx.js), a def kit's finisher (kitview.js)
    flash(0.12, 4);                                    // ≈ 2 frames: the cream mix held a veil over the launched tiers
    // fx r1: a hot core of 2-4 frames, then clear air — 0.6-0.8 s of 16 rays + the dragon's shell bloomed into a cyan
    // fog over the launched bodies; fewer, slimmer, shorter rays below the bloom knee, so the bodies hold silhouette
    rayBurst(e.x, 0.2, e.z, 8, 10, [0.16, 0.7, 0.95], [0.2, 1.3], 0.28, 0.3);
    rayBurst(e.x, 0.2, e.z, 3, 7, [0.9, 1.0, 1.1], [0.9, 1.45], 0.2, 0.28);
    // musou part r3: the 13 m teal + 8 m gold ground rings passed under the finisher camera and filled the lower half of
    // the frame with additive haze for ≈ 0.3 s; the musou view's waist-high lightning band now carries the ring wave
    ring(e.x, e.z, 5.5, 0.4, TEAL);
    needleBurst(e.x, 1, e.z, 14, 0, 0, 20, NEEDLE_COOL, 0.06);
    shards(e.x, 1, e.z, 8, 10, [0.4, 1.0, 1.5], 0.1);
    dustRing(e.x, e.z, 28, 0.8, 7, 0.7, 0.35);           // musou part r3: shorter / thinner — it rolled over the finisher lens
    // musou part r2 budget: fewer boulders / dust than the vfx part's full eruption so the launched tiers stay readable;
    // thin dust (the pale billows around him held a cream fog over the frame for ≈ 1 s after the burst)
    rocks(e.x, e.z, 18, 3, 0.16, 0.4, [5, 11], 8);
    dustColumn(e.x, e.z, 8, 2, 5, 4.6, [0.9, 1.3], 0.4);
  });
  armyDebris(game.army.foe);
  on('scenario', () => {
    armyDebris(game.army.foe);
    sparks.clear(); hot.clear(); debris.clear(); dust.clear(); samples.length = 0;
    B.on.fill(0); St.on.fill(0); vfx.flash = 0; lastTick = -1; auraK = 0;
    for (const m of [...rings, ...cracks, ...walls]) m.visible = false;
    light.intensity = 0;
    for (const q of [beams, stars]) { for (let i = 0; i < q.n; i++) q.mesh.setMatrixAt(i, ZERO); q.mesh.instanceMatrix.needsUpdate = true; }
  });

  // ---- per sim step: trail samples, thrust streaks per line-hitbox tick, lunge dust (reads sim, never writes it)
  vfx.afterStep = () => {
    const h = game.hero;
    if (game.hitstop === 0 || game.hitstop % 2 === 0) clock++;   // half-rate ageing in hitstop: a heavy hit must not hang the crescent
    heroPose(h, pose);
    hpos.set(h.x, h.y, h.z);
    const musou = h.state === 'musou', heavy = musou || (h.state === 'attack' && isHeavyMove(h.move)), tr = h.kit.trail;
    if (tr.axis === 'y') { weaponWorld(pose, hpos, h.yaw, 0, tr.base, 0.02, baseNow, h.kit); weaponWorld(pose, hpos, h.yaw, 0, tr.tip, 0.05, tipNow, h.kit); }   // bow limb
    else spearWorld(pose, hpos, h.yaw, heavy ? tr.baseHeavy : tr.base, tr.tip, baseNow, tipNow, h.kit);   // ribbon ≈ 0.9-1.1 m wide: a crisp band, not a sheet

    if (h.state === 'attack' && game.hitstop === 0) {
      const tick = h.moveSeq * 1000 + h.moveT;
      if (tick !== lastTick) {
        lastTick = tick;
        const m = h.kit.moves[h.move], t = h.moveT;
        for (const hit of m.hits) {
          if (hit.shape !== 'line' || hit.sigil || t < hit.f[0] || t > hit.f[1]) continue;   // (a sigil's line box is ground, not a thrust)
          if (hit.every ? (t - hit.f[0]) % hit.every !== 0 : t !== hit.f[0]) continue;
          const fx = Math.sin(h.yaw), fz = Math.cos(h.yaw), off = (hit.off || 0) + 0.4;
          const y = Math.min(1.7, Math.max(0.7, tipNow.y)), rgb = hit.heavy ? [1.2, 1.9, 2.8] : [0.8, 1.3, 2.4];
          const sd = hit.every ? vrng.range(-0.35, 0.35) : 0;
          beam(STREAK, h.x + fx * off + fz * sd, y, h.z + fz * off - fx * sd, fx, 0, fz, hit.len, hit.heavy ? 0.9 : 0.62, hit.every ? 0.16 : 0.22, rgb);
          if (!hit.every) {
            beam(STREAK, h.x + fx * off + fz * 0.45, y + 0.3, h.z + fz * off - fx * 0.45, fx, 0.03, fz, hit.len * 0.7, 0.2, 0.16, [1.4, 1.8, 2.4], 0.03);
            beam(STREAK, h.x + fx * off - fz * 0.5, y - 0.25, h.z + fz * off + fx * 0.5, fx, -0.02, fz, hit.len * 0.6, 0.18, 0.15, [1.4, 1.8, 2.4], 0.05);
          }
        }
        // C3: dark smoke arc grows over the hero from ≈ 12 sf before the slam, so the gold pillars flash out of a dark
        // beat (benchmark: dark arc f341-348, pillars f349)
        // (integration r2: the pillar ring is the `pillars` window — combo-system's delayed ground wave — so the arc leads it)
        const pil = m.hits.find((w) => w.pillars), slam = pil ? pil.f[0] : 0;
        if (slam > 12 && zy()) { const k = t - (slam - 12); if (k >= 0 && k < 8) darkArc(h, k / 8, (k + 1) / 8); }
        // footfall dust while a lunge carries the hero along the ground (N4 run-in, dash, N6 hop-lunge…)
        if (!m.air && h.y < 0.2 && t % 4 === 0) for (const [f0, f1] of m.lunge) if (t >= f0 && t <= f1) { dustPuff(h.x, h.z, 2, 1.4, 0.3, 0.05, 0.4); break; }
      }
    }

    if (!trailActive(h)) {
      if (samples.length && !samples[samples.length - 1].brk) samples.push({ brk: true, c: clock });
      return;
    }
    const s = samples.length > MAXS ? samples.shift() : null;
    const smp = s && !s.brk ? s : { b: new THREE.Vector3(), t: new THREE.Vector3(), rt: new THREE.Vector3() };
    smp.rt.copy(tipNow);
    smp.c = clock; smp.brk = false; smp.g = heavy ? 1.15 : 1; smp.hue = musou && zy() ? 1 : 0;   // musou teal: Zhao Yun's; other kits keep their ribbon
    const last = samples[samples.length - 1], prev = last && !last.brk ? last : null;
    if (prev && prev.rt.distanceToSquared(tipNow) < 1e-6) { prev.c = clock; return; }
    // only a fast tip leaves a ribbon: wind-ups and holds (< ≈ 5 m/s) draw nothing, so no slow "flag" hangs on the spear
    const gn = tr.gain || GAIN;
    smp.g *= THREE.MathUtils.smoothstep(prev ? prev.rt.distanceTo(tipNow) : 0, gn[0], gn[1]);
    // flat sweeps (swept surface ≈ horizontal: N3 low sweep, N4 / C4 / dash spins) widen into the benchmark's disc:
    // the ribbon reaches in toward the hands and ≈ 1.2 m past the tip (C4 disc ≈ 2 H radius, BENCHMARK reconciled #3)
    let flat = prev ? prev.flat : 0;
    if (prev) {
      _d.subVectors(tipNow, prev.rt).cross(_sd.subVectors(tipNow, baseNow));
      const l = _d.length();
      if (l > 1e-4) flat = prev.flat * 0.4 + 0.6 * Math.abs(_d.y) / l;
    }
    smp.flat = flat;
    const k = smp.fk = THREE.MathUtils.smoothstep(flat, 0.55, 0.85);
    _sd.subVectors(tipNow, baseNow).normalize();
    smp.t.copy(tipNow).addScaledVector(_sd, 1.2 * k); smp.b.copy(baseNow).addScaledVector(_sd, -0.45 * k);
    samples.push(smp);
    // glitter shed by the blade edge: fine light specks peel off the tip and drift, so a swing leaves sparkle in the air
    if (prev && smp.g > 0.5 && game.hitstop === 0) {
      const vx = (tipNow.x - prev.rt.x) * 60, vy = (tipNow.y - prev.rt.y) * 60, vz = (tipNow.z - prev.rt.z) * 60;
      for (let i = 0; i < 2; i++) {
        const f = vrng.next(), c = musou && zy() ? TEAL : kp().glitter;
        sparks.spawn(prev.rt.x + (tipNow.x - prev.rt.x) * f, prev.rt.y + (tipNow.y - prev.rt.y) * f, prev.rt.z + (tipNow.z - prev.rt.z) * f,
          vx * 0.08 + vrng.range(-0.8, 0.8), vy * 0.08 + vrng.range(-0.3, 1.2), vz * 0.08 + vrng.range(-0.8, 0.8),
          vrng.range(0.25, 0.5), vrng.range(0.025, 0.045), 4, c[0], c[1], c[2]);
      }
    }
  };

  const cr = (p0, p1, p2, p3, u, out) => {
    const u2 = u * u, u3 = u2 * u;
    return out.set(
      0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
      0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
      0.5 * (2 * p1.z + (-p0.z + p2.z) * u + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * u2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * u3));
  };
  const vb = new THREE.Vector3(), vt = new THREE.Vector3();
  function buildTrail() {
    while (samples.length && clock - samples[0].c > LIFE) samples.shift();
    let v = 0;
    const gy = ground(game.hero.x, game.hero.z);                     // samples are sim space: lift onto the ground here
    const put = (b, t, age, g, hue, dead = false, fk = 0) => {
      if (v >= MAXV - 1) return;
      const a = Math.min(1, Math.max(0, age / LIFE));
      const k = 0.82 * a ** 1.25 * (1 - 0.75 * fk);   // crescent: the inner edge closes onto the tip path toward the tail (a flat spin keeps its width: disc)
      let o = v * 3, q = v * 4;
      tpos[o] = b.x + (t.x - b.x) * k; tpos[o + 1] = gy + b.y + (t.y - b.y) * k; tpos[o + 2] = b.z + (t.z - b.z) * k;
      tat[q] = dead ? 1 : a; tat[q + 1] = 0; tat[q + 2] = dead ? 0 : g; tat[q + 3] = hue;
      v++; o += 3; q += 4;
      tpos[o] = t.x; tpos[o + 1] = gy + t.y; tpos[o + 2] = t.z;
      tat[q] = dead ? 1 : a; tat[q + 1] = 1; tat[q + 2] = dead ? 0 : g; tat[q + 3] = hue;
      v++;
    };
    // each run is bracketed by zero-gain copies of its end pairs, so the quads joining runs are invisible
    // additive stacking cap: only the newest swing keeps full gain, older ribbons still fading out drop to 40 %
    let run = [], runs = 0, nRuns = 0;
    for (let i = 0; i < samples.length; i++) if (!samples[i].brk && (i === 0 || samples[i - 1].brk)) nRuns++;
    const emitRun = () => {
      const dim = ++runs < nRuns ? 0.4 : 1;
      if (run.length >= 2) {
        put(run[0].b, run[0].t, LIFE, 0, 0, true);
        for (let i = 0; i < run.length - 1; i++) {
          const p0 = run[Math.max(0, i - 1)], p1 = run[i], p2 = run[i + 1], p3 = run[Math.min(run.length - 1, i + 2)];
          for (let j = 0; j < SUB; j++) {
            const u = j / SUB;
            cr(p0.b, p1.b, p2.b, p3.b, u, vb); cr(p0.t, p1.t, p2.t, p3.t, u, vt);
            put(vb, vt, clock - (p1.c + (p2.c - p1.c) * u), p1.g * dim, p1.hue, false, p1.fk);
          }
        }
        const l = run[run.length - 1];
        put(l.b, l.t, clock - l.c, l.g * dim, l.hue, false, l.fk); put(l.b, l.t, LIFE, 0, 0, true);
      }
      run = [];
    };
    for (const s of samples) { if (s.brk) { if (run.length) emitRun(); } else run.push(s); }
    if (run.length) emitRun();
    tgeo.setDrawRange(0, Math.max(0, (v / 2 - 1) * 6));
    tgeo.attributes.position.needsUpdate = true; tgeo.attributes.aT.needsUpdate = true;
  }

  // ---- ambient embers: from the fires (world.fires: the loaded map's, read live), and drifting through the fight around the hero
  let emberAcc = 0, driftAcc = 0, moteAcc = 0;

  vfx.update = (dt) => {
    const fires = world.fires;
    emberAcc += dt * 30;
    while (emberAcc > 1 && fires.length) {
      emberAcc--;
      const f = fires[vrng.int(0, fires.length - 1)].position;
      sparks.spawn(f.x + vrng.range(-0.6, 0.6), 0.8, f.z + vrng.range(-0.6, 0.6), vrng.range(-0.4, 0.4), vrng.range(1.2, 2.6), vrng.range(-0.4, 0.4), vrng.range(1.5, 3.5), vrng.range(0.03, 0.06), 3, 2.0, 0.8, 0.2);
    }
    const h = game.hero;
    driftAcc += dt * 9;
    while (driftAcc > 1) {
      driftAcc--;
      const a = vrng.range(0, 6.283), r = vrng.range(2, 13);
      sparks.spawn(h.x + Math.cos(a) * r, vrng.range(0.2, 2.5), h.z + Math.sin(a) * r, vrng.range(-0.2, 0.6), vrng.range(0.3, 1.1), vrng.range(-0.3, 0.3),
        vrng.range(2.2, 4), vrng.range(0.028, 0.05), 3, 2.3, 0.85, 0.22);
    }
    // musou activation: cyan-white motes spiral up around the hero while the world holds still
    if (h.state === 'musou' && h.stateT < 34 && zy()) {
      moteAcc += dt * 70;
      while (moteAcc > 1) {
        moteAcc--;
        const a = vrng.range(0, 6.283), r = vrng.range(0.5, 2.2);
        sparks.spawn(h.x + Math.cos(a) * r, vrng.range(0, 1.2), h.z + Math.sin(a) * r, -Math.sin(a) * 1.5, vrng.range(1.5, 3.5), Math.cos(a) * 1.5,
          vrng.range(0.5, 0.9), vrng.range(0.04, 0.07), 3, 0.9, 1.9, 2.6);
      }
    }
    sparks.update(); hot.update(); debris.update(); dust.update();
    updateBeams(); updateStars();
    age(rings, (m, u) => { m.material.uniforms.uU.value = u; });
    age(cracks, (m, u, t) => { m.material.uniforms.uU.value = u; m.material.uniforms.uGrow.value = Math.min(1, t / 0.12); });
    age(walls, (m, u) => {
      const k = Math.max(0, u), R = m.userData.r * (0.08 + 0.92 * (1 - (1 - k) ** 3)), H = m.userData.h * (u < 0 ? 0.01 : 1 - 0.55 * k);
      m.scale.set(R, H, R);
      m.material.uniforms.uU.value = k;
    });
    if (light.intensity > 0) {
      const u = (now() - light.userData.f0) / 60 / light.userData.dur;
      light.intensity = u >= 1 ? 0 : light.userData.I * (1 - u) * (1 - u);
    }
    // musou aura: gold flame ring + rising tongues while a Musou is banked; eased in / out. Off during the Musou itself:
    // its close cinematic cameras turned the motes at his feet into lens-sized bokeh (the kit's musou view owns that light)
    const ready = h.state !== 'musou' && game.musou.ready && game.musou.ready();
    auraK += ((ready && !h.dead ? 1 : 0) - auraK) * Math.min(1, dt * 4);
    aura.visible = auraK > 0.01;
    if (aura.visible) {
      const col = AURA_GOLD, gy = ground(h.x, h.z);
      aura.position.set(h.x, gy + 0.05, h.z); aura.scale.setScalar(1.5 + 0.1 * Math.sin(now() * 0.11));
      const u = aura.material.uniforms; u.uT.value = now() / 60; u.uK.value = auraK * 0.55; u.uColor.value.setRGB(col[0], col[1], col[2]);
      // soft flame wisps rising round him (fx r2: sparks is a soft streak pool now — the old pale boxes read as confetti);
      // none while the lens is close (the aim camera), and the live ones are killed so none drifts over the shot
      const close = Math.hypot(camPos.x - h.x, camPos.z - h.z) <= 4.2;
      auraAcc += close ? 0 : dt * 30 * auraK;
      if (close) for (let i = 0; i < sparks.n; i++) if (sparks.kind[i] === 5 && sparks.life[i] > 0) sparks.life[i] = 1e-6;   // expires (and hides) on the next update
      while (auraAcc > 1) {
        auraAcc--;
        const a = vrng.range(0, 6.283), r = vrng.range(0.35, 0.85), b = vrng.range(0.5, 0.9);
        sparks.spawn(h.x + Math.cos(a) * r, h.y + vrng.range(0, 0.3), h.z + Math.sin(a) * r, Math.cos(a) * 0.3, vrng.range(0.6, 1.6), Math.sin(a) * 0.3,
          vrng.range(0.45, 0.85), vrng.range(0.05, 0.09), 5, col[0] * b, col[1] * b, col[2] * b);
      }
    }
    vfx.flash = Math.max(0, vfx.flash - dt * flashDecay);
    buildTrail();
  };
  // primitives for the kits' own views (header); streak = a thrust beam shot from (sx, sy, sz) along (dx, dy, dz)
  vfx.fx = { ring, star, rayBurst, columns, dustRing, dustPuff, dustColumn, shards, embers, rocks, crack, wall, lightFlash, flash,
    streak: (...a) => beam(STREAK, ...a) };
  game.vfx = vfx;
  return vfx;
}
