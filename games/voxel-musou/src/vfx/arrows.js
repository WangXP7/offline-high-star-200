// Arrow VFX (render-only; reads the projectile pool src/combat/projectiles.js, its events and the hero's move state,
// never writes sim state). Built on the Huang Zhong fx primitives (src/chars/huangzhong/fx.js). Layers per stage:
//  · draw / charge (the frames before every shot, and aim mode): light gathers on the arrowhead (motes converging, a
//    small gold point core capped in screen pixels — never a disc at the aim lens), contracting charge rings on the charge
//    shots, a full-draw ping in aim mode
//  · release (arrow:fire): muzzle flash (hot core + warm halo), a tracer down the flight line, a forward spark cone,
//    muzzle smoke, forward star rays, string glint, an air-burst ring on the
//    arrow line (two on heavy shots), a spray line per arrow of a fan, dust kicked back from his feet + camera thump +
//    light flash on heavy shots, a flare column on the skyward rain volley
//  · flight: the voxel arrow + a bright core streak + a soft glow trail + fading afterimages; heavy arrows cut air rings
//    along their line; fire arrows burn (flickering head, flame trail, smoke); rain falls as long streaks; the Musou
//    giant carries a sun core, a double spiral aura, a flame shell, torn-up dust under its path and a light trail that
//    lingers after it explodes
//  · impact (arrow:hit): hit flash, spark burst along the flight, dust puff, a pierce streak out of the body, and the
//    spent arrow stays pinned in the soldier for ≈ 1.5 s; a ground bite = dust + chips + a small ring, the arrow stands
//    in the ground at its flight angle and sinks away
//  · heavy shots (fx r2): a core beam bow → arrow that holds ≈ 0.35 s on the whole line, air rings every 4 m, ground
//    scuffs; under the aim lens every release layer is capped in screen pixels
//  · rain (arrow:rain): a thin reticle (rim + ticks) with a ring closing onto it, a sky flare, and a render-only sheet of
//    ≈ 150 voxel arrows a second (own instanced mesh) falling inside it on one slant, each landing with a puff and
//    standing in the ground for 0.7 s, so the circle visibly gets riddled (fx r3)
//  · bursts (arrow:burst): small = flash, ring, dust (+ mini fireball and scorch when fire); big (C6) = explode(): ≈ 7
//    frame yellow-white core (fx r5), a soft fireball (fx r3: big hot body lumps + fast outer lumps, heat broken by 3-octave billows,
//    drawn nearer the lens so it engulfs the rank inside it, kept off the lens side), a column into a cap, dark
//    smoke behind, thin shock ring + front, dust skirt, sparks, embers, thrown earth, scorch decal, light, thump; the
//    Musou giant's is the same ×1.9 with a thin hot light pillar
//  · headshot: gold star burst, rings and flash over the officer's head
// Positions stay in sim space (y = height above ground); ground(x, z) is added when composing.
import * as THREE from 'three';
import { on } from '../core/events.js';
import { vrng } from '../core/rng.js';
import { vox } from '../hero/model.js';
import { heroPose } from '../hero/hero.js';
import { POSE_SIZE, spearWorld } from '../hero/rig.js';
import { AS, ARROW } from '../combat/projectiles.js';
import { ground } from '../world/map.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3();
const FWD = new THREE.Vector3(0, 0, 1);
const B = (a, b, c) => ({ a, b, c });
// palette (linear HDR): Huang Zhong's gold / fire, off Zhao Yun's teal
// fire stays under the grade's per-channel shoulder (R ≈ 2.4, G ≤ 1): hotter values bleached to a pale yellow line
const CORE = [3.4, 2.7, 1.6], CORE_HEAVY = [3.8, 2.9, 1.5], CORE_FIRE = [2.4, 0.95, 0.18], GLOW = [0.55, 0.36, 0.15], GLOW_FIRE = [0.85, 0.28, 0.04];
const GOLD = [2.4, 1.6, 0.55], SPARK = [3.2, 2.1, 0.8], EARTH = [[0.2, 0.13, 0.09], [0.26, 0.18, 0.12], [0.16, 0.1, 0.07], [0.32, 0.23, 0.15]];
const DUSTC = [0.52, 0.4, 0.3], EARTH_DUST = [0.3, 0.22, 0.16];
const NPIN = 64, PIN_T = 1.5;                                  // pinned arrows stay 1.5 s (sink over the last 0.25)

export function createArrowView(scene, game, proj, fx) {
  const root = new THREE.Group();
  scene.add(root);
  const N = proj.N, c = game.crowd, hero = game.hero;
  // arrow: tip at the origin, shaft back along −Z (0.95 m): steel head, dark shaft, white-red fletching
  const geo = vox([B([0, 0, -43], [1, 1, 0], (x, y, z) => (z > -4 ? 0xd8dee6 : z < -38 ? 0xf2efe8 : 0x4a2c22)),
    B([-1, 0, -3], [2, 1, -1], 0xc0c8d2), B([-1, 0, -42], [2, 1, -37], 0xf2efe8), B([0, -1, -42], [1, 2, -37], 0xb3261e)], 0.022,
  { off: [-0.5, -0.5, 0], jitter: 0, ao: 0.1 });
  const arrows = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, flatShading: true }), N + NPIN);
  arrows.instanceMatrix.setUsage(THREE.DynamicDrawUsage); arrows.frustumCulled = false; arrows.castShadow = true;
  arrows.count = 0;
  root.add(arrows);

  const prev = new Int32Array(N), ringAcc = new Float32Array(N);
  // fx r2: heavy shots (N6, C1, the C3 fan, C4's last, a full-draw aim shot) draw a core beam from the bow to the arrow
  // while it flies, which stays on the whole line for ≈ 0.35 s after it stops (tapering), with air rings every 4 m
  const ox = new Float32Array(N), oy = new Float32Array(N), oz = new Float32Array(N), bw = new Float32Array(N), beamOn = new Uint8Array(N);
  const isBeam = (i) => proj.kind[i] === 0 && proj.big[i] < 2 && !proj.fire[i] && !!(proj.spec[i] && proj.spec[i].heavy);
  function endBeam(i, x, y, z) {
    beamOn[i] = 0;
    const ex = x - ox[i], ey = y - oy[i], ez = z - oz[i], L = Math.hypot(ex, ey, ez);
    if (L < 0.3 || ex * proj.vx[i] + ey * proj.vy[i] + ez * proj.vz[i] < 0) return;     // (spent before it passed the beam root)
    // in a packed crowd the arrow is spent within 2-3 m: the force line still reads ≥ 7 m through the ranks
    const w = (proj.big[i] ? 1 : 0.7) * bw[i], dx = ex / L, dy = ey / L, dz = ez / L, Lb = Math.max(L, 7);
    const hx = ox[i] + dx * Lb, hy = oy[i] + dy * Lb, hz = oz[i] + dz * Lb;
    // (fx r3 acc: bold — a white core ≈ 15 cm, an amber glow ≈ 0.5 m and a faint haze, held ≈ 0.4 s: at 0.18 / 0.7 m the
    // shader's gaussian profile left a hairline three frames after the loose)
    if (L > 13) heavyBeam(hx, hy, hz, dx, dy, dz, Lb, w, 0.3);          // a line longer than the release beam (open ground)
  }
  // comet tail per arrow: a point that chases the head (≈ 70 ms lag), so the streak is as long as the flight is fast and
  // collapses onto the arrow when it stops; when an arrow vanishes into a body the tail finishes as a fading streak
  const tx = new Float32Array(N), ty = new Float32Array(N), tz = new Float32Array(N);
  // pinned arrows (spent in a soldier): soldier, offset from his feet, flight dir, age
  const pin = { e: new Int32Array(NPIN), ox: new Float32Array(NPIN), oy: new Float32Array(NPIN), oz: new Float32Array(NPIN),
    dx: new Float32Array(NPIN), dy: new Float32Array(NPIN), dz: new Float32Array(NPIN), t: new Float32Array(NPIN).fill(9), s: new Float32Array(NPIN), next: 0 };
  // the Musou giant: release point, last head, trail fade
  const giant = { on: false, x0: 0, y0: 0, z0: 0, x: 0, y: 0, z: 0, fade: 0, t: 0 };

  // ---------------------------------------------------------------- effect recipes
  function flash(x, y, z, s, k, life = 0.08) {
    fx.glow(x, y, z, s * 0.3, s * 0.8, life, 3.2 * k, 2.5 * k, 1.5 * k);
    fx.glow(x, y, z, s * 0.5, s * 1.2, life * 1.5, 0.4 * k, 0.24 * k, 0.08 * k);
  }
  function sparks(x, y, z, n, dx, dy, dz, cone, spd, len, col = SPARK, life = 0.2) {
    for (let k = 0; k < n; k++) {
      const vx = dx + vrng.range(-cone, cone), vy = dy + vrng.range(-cone, cone) + 0.25, vz = dz + vrng.range(-cone, cone), l = Math.hypot(vx, vy, vz) || 1, s = spd * vrng.range(0.5, 1);
      fx.spark(x, y, z, vx / l * s, vy / l * s, vz / l * s, len, vrng.range(0.025, 0.045), life * vrng.range(0.6, 1.2), col[0], col[1], col[2], 3, -12);
    }
  }
  function dust(x, y, z, n, spd, s0, s1, life, a0 = 0.5, col = DUSTC) {
    for (let k = 0; k < n; k++) {
      const a = vrng.range(0, 6.283), v = spd * vrng.range(0.4, 1);
      fx.smoke(x + Math.cos(a) * 0.2, y, z + Math.sin(a) * 0.2, s0, s1 * vrng.range(0.8, 1.2), life * vrng.range(0.8, 1.2),
        col[0] * vrng.range(0.9, 1.1), col[1], col[2], a0, Math.cos(a) * v, vrng.range(0.3, 1.2), Math.sin(a) * v, 3, 0.4);
    }
  }
  function embers(x, y, z, n, spd, up, life = 1) {
    for (let k = 0; k < n; k++) {
      const a = vrng.range(0, 6.283), s = spd * vrng.range(0.2, 1), w = vrng.range(0.7, 1.2);
      fx.glow(x, y, z, vrng.range(0.06, 0.12), 0.02, life * vrng.range(0.5, 1.2), 3 * w, 1.2 * w, 0.25 * w,
        Math.cos(a) * s, up * vrng.range(0.4, 1), Math.sin(a) * s, 1.2, -6, 0.5);
    }
  }
  /** Fireball (fx r2): n soft fire lumps (fx.fire: white-hot heart → orange → deep-red rim, cooling into the smoke that
   *  rises out of it) thrown out of a ball of radius R and slowed by drag, so the ball swells to ≈ R in ≈ 0.2 s and keeps
   *  its lumpy structure; a ≈ 7 frame yellow-white heart and a brief orange bloom under it. */
  // fx r3: two layers — a few big slow body lumps hold the ball's mass (hot heart), smaller fast lumps swell its
  // silhouette out to ≈ R and cool first into the dark rim; the body lumps spawn last so the hot heart draws on top
  // (lumps heading at the lens are mirrored away, and a burst near the camera sits back behind its blast point, so the
  // ball rises beyond the camera instead of filling it — C6 loosed back toward the gameplay lens burst 3 m from it)
  // fx r5: `under(x, z)` spawns lumps at the placed ball before its own — the smoke pool draws in spawn (slot) order
  // with "over" blending, so anything spawned after the body lumps paints over the hot heart
  let ballX = 0, ballZ = 0;
  function fireball(x, y, z, r, n, life, s0 = 0.4, sk = 1, under = null) {
    const R = Math.min(r, 7), nb = Math.max(3, Math.round(n * 0.3));
    let cx = fx.cam.x - x, cz = fx.cam.z - z;
    const cl = Math.hypot(cx, cz) || 1, back = Math.max(0, R * 1.8 - cl);          // (fx r3 acc: 1.8 R, was 3 R — it shoved
    cx /= cl; cz /= cl; x -= cx * back; z -= cz * back; ballX = x; ballZ = z;        // the finale's ball 6 m off its blast point)
    if (under) under(x, z);
    for (let k = 0; k < n; k++) {
      let a = vrng.range(0, 6.283);
      if (Math.cos(a) * cx + Math.sin(a) * cz > 0.35) a += Math.PI;
      const body = k >= n - nb, el = vrng.range(-0.2, 1), ce = Math.sqrt(1 - el * el), rr = R * 0.15 * Math.sqrt(vrng.next());
      const sp = R * (body ? vrng.range(0.4, 1.1) : vrng.range(1.5, 2.9)), s = R * sk * (body ? vrng.range(0.95, 1.25) : vrng.range(0.5, 0.8));
      const heat = body ? vrng.range(0.9, 1.05) : vrng.range(0.6, 0.92);
      fx.fire(x + Math.cos(a) * rr, y + el * rr, z + Math.sin(a) * rr, s * s0, s, life * (body ? vrng.range(1.1, 1.4) : vrng.range(0.9, 1.3)), heat,
        Math.cos(a) * ce * sp, el * sp * 0.55 + 0.8, Math.sin(a) * ce * sp, 4.5, 1.3);
    }
    // fx r5: yellow-white heart ≈ 0.2-0.7 R across for ≈ 7 frames (was R 0.35 → 1.0 white for 2-3 frames: a pale disc the
    // size of the ball, gone before the lumps faded in)
    fx.glow(x, y + R * 0.1, z, R * 0.2, R * 0.7, 0.12, 3.2, 2.6, 1.5);
    fx.glow(x, y + R * 0.1, z, R * 0.6, R * 1.3, 0.22, 0.55, 0.2, 0.03);                // orange bloom round the ball
  }
  /** Explosion (C6 fire arrow S = 1, the Musou giant S = 1.9). fx r3 acceptance: a GROUND-level blast — the ball (C6 R ≈
   *  4.4 m, the giant ≤ 7 m) is centred 0.42 R up, so it sits in the ranks and the launched bodies are thrown through and
   *  cut out against it (it used to hang 2.6 m / 4.5 m up, a puff over the helmets); its lumps bloom to ≈ 70 % size at
   *  once. Layers: yellow-white core → hot heart / orange body / dark cooled rim (fireball) → a stem of lumps punching
   *  up and spreading into a mushroom cap past the top of the frame → dark smoke rolling in behind; on the ground a broad
   *  bright shock ring, a hot inner wave, a ring wall of dark dust driven outward, sparks, embers, thrown earth, scorch,
   *  light, thump. */
  function explode(x0, z0, r, S) {
    const R = S > 1 ? Math.min(7, r * 0.75) : Math.min(5.5, r * 1.15), sq = Math.sqrt(S);
    // fx r5: the orange stem lumps spawn under the fireball (they sat at the heart's height, drawn over it: no core)
    fireball(x0, R * 0.42, z0, R, Math.round(40 * S), 1.35 * sq, 0.7, 1.25, (x, z) => {
      for (let k = 0; k < 10 * S; k++) {                                                // stem → mushroom cap
        const a = vrng.range(0, 6.283), rr = vrng.range(0, 0.25) * R, cap = k % 3 === 0, v = cap ? 2.6 : 0.6;
        fx.fire(x + Math.cos(a) * rr, R * 0.55, z + Math.sin(a) * rr, R * 0.3, R * vrng.range(0.7, cap ? 1.05 : 0.8), vrng.range(1.8, 2.5) * sq, vrng.range(0.72, 0.88),
          Math.cos(a) * v * S, vrng.range(6.5, 9) * sq, Math.sin(a) * v * S, 1.5, 0.7);
      }
    });
    const x = ballX, z = ballZ;                                                         // (fx r5: core flash R 0.6 → 1.6 cut — the heart is fireball's)
    for (let k = 0; k < 8 * S; k++) {                                                   // flame tongues licking up
      const a = vrng.range(0, 6.283), d = vrng.range(0.2, 0.8) * R;
      fx.spark(x + Math.cos(a) * d, 0.4, z + Math.sin(a) * d, Math.cos(a) * 2, vrng.range(7, 13) * sq, Math.sin(a) * 2,
        1.4 * S, 0.12 * S, vrng.range(0.25, 0.4), 2.2, 0.75, 0.1, 2.5, -6, 0.6);
    }
    for (let k = 0; k < 7 * S; k++) {                                                   // dark smoke rolling in behind
      const a = vrng.range(0, 6.283), rr = vrng.range(0.2, 0.9) * R, g = vrng.range(0.06, 0.1);
      fx.smoke(x + Math.cos(a) * rr, vrng.range(0.5, 1.1) * R, z + Math.sin(a) * rr, R * 0.5, R * vrng.range(1.0, 1.4), vrng.range(2.5, 3.5),
        g * 1.15, g, g * 0.85, 0.85, Math.cos(a) * 1.5, vrng.range(0.6, 1.2) * sq, Math.sin(a) * 1.5, 1.2, 0.3, vrng.range(0.25, 0.5));
    }
    fx.groundRing(x0, z0, 0.6, r * 1.9, 0.016, 0.38, 2.2, 1.7, 1.0);                           // shock ring: broad enough to read at 20 m
    fx.groundRing(x0, z0, 0.4, r * 1.25, 0.1, 0.5, 1.1, 0.34, 0.05, 0.03);                      // hot inner wave
    fx.ring(x, R * 0.45, z, 0, 0, 0, R * 0.5, R * 1.5, 0.03, 0.14, 1.2, 1.0, 0.8, 0, 1);       // shock front (camera-facing)
    const nw = Math.round(22 * S);
    for (let k = 0; k < nw; k++) {                                                      // dust wall driven outward
      const a = (k + vrng.next()) / nw * 6.283, v = vrng.range(7, 10) * sq, c = vrng.range(0.85, 1.1);
      fx.smoke(x0 + Math.cos(a) * R * 0.45, 0.3, z0 + Math.sin(a) * R * 0.45, 0.7 * S, vrng.range(1.9, 2.6) * S, vrng.range(1.1, 1.6),
        EARTH_DUST[0] * c, EARTH_DUST[1] * c, EARTH_DUST[2] * c, 0.75, Math.cos(a) * v, vrng.range(0.6, 1.6), Math.sin(a) * v, 2.4, 0.5);
    }
    sparks(x, 0.8, z, Math.round(26 * S), 0, 0.6, 0, 1.1, 20 * sq, 0.9, CORE_FIRE, 0.4);
    embers(x, 0.6, z, Math.round(40 * S), 6 * S, 11 * sq, 1.6);
    thrown(x, z, Math.round(16 * S), 6 * S, 10 * sq, 0.12, 0.28 * sq);
    fx.scorch(x0, z0, r * 0.8, 9 * S, 1.4);
    fx.light(x, 1.8 * S, z, 7 * S, 0xff7020, 3);
    fx.kick(3.2 * sq, 0.32 * sq, 0.25, 1);
  }
  function smokeColumn(x, z, r, n, life) {
    for (let k = 0; k < n; k++) {
      const a = vrng.range(0, 6.283), rr = r * 0.4 * vrng.next(), g = vrng.range(0.07, 0.13);
      fx.smoke(x + Math.cos(a) * rr, vrng.range(0.3, 1.2) * r * 0.3, z + Math.sin(a) * rr, r * 0.3, r * vrng.range(0.7, 1.0), life * vrng.range(0.7, 1.2),
        g, g * 0.85, g * 0.75, 0.85, Math.cos(a) * r * 0.5, vrng.range(1.5, 3.5), Math.sin(a) * r * 0.5, 1.2, 1.5);
    }
  }
  function thrown(x, z, n, spd, up, s0, s1) {
    for (let k = 0; k < n; k++) {
      const a = vrng.range(0, 6.283), v = spd * vrng.range(0.4, 1), col = EARTH[k % EARTH.length];
      fx.debris(x + Math.cos(a) * 0.4, 0.3, z + Math.sin(a) * 0.4, Math.cos(a) * v, up * vrng.range(0.6, 1.1), Math.sin(a) * v, vrng.range(s0, s1), vrng.range(1.4, 2.4), col[0], col[1], col[2]);
    }
  }

  /** fx r3 acc: the heavy shot's force line — white core ≈ 15 cm, amber glow ≈ 0.5 m, faint haze — held ≈ 0.4 s. */
  function heavyBeam(hx, hy, hz, dx, dy, dz, L, w, life) {
    fx.streak(hx, hy, hz, dx, dy, dz, L, 0.38 * w, life, 3.0, 2.3, 1.2, 0.3);
    fx.streak(hx, hy, hz, dx, dy, dz, L, 1.3 * w, life * 0.9, 1.0, 0.48, 0.1, 0.25);
    fx.streak(hx, hy, hz, dx, dy, dz, L, 2.6 * w, life * 0.55, 0.3, 0.13, 0.03, 0.2);
  }
  // ---------------------------------------------------------------- release
  on('arrow:fire', (e) => {
    const cp = Math.cos(e.pitch || 0), dx = Math.sin(e.yaw) * cp, dy = Math.sin(e.pitch || 0), dz = Math.cos(e.yaw) * cp;
    const k = e.big > 1 ? 2.6 : e.heavy || e.big ? 1.5 : 1, mu = e.move === 'musou' && e.big < 2;
    const x = e.x + dx * 0.25, y = e.y + dy * 0.25, z = e.z + dz * 0.25;
    // fx r2: shots loosed under the over-the-shoulder lens (aim mode ≈ 2.7 m, the giant's draw cam) keep the muzzle
    // light to a capped screen size — at metre sizes it covered ≈ 40 % of the frame and erased the target just lined up;
    // the emphasis moves down range (the tracer / beam, the rings farther out, the hit confirmation at the target)
    const lens = e.move === 'aim' || e.big > 1, px = fx.px(x, y, z), cap = (m, p) => (lens ? Math.min(m, p * px) : m);
    if (e.big > 1) {                                          // the giant: a crisp 4-point star + pinpoint, 2-3 frames
      fx.glow(x, y, z, cap(0.4, 14), cap(1.2, 40), 0.06, 3.4, 3.0, 2.2);
      const sx = -dz, sz = dx;
      for (const [ax, ay, az, L] of [[sx, 0, sz, 150], [-sx, 0, -sz, 150], [0, 1, 0, 95], [0, -1, 0, 95]]) {
        const l = cap(3, L);
        fx.streak(x + ax * l, y + ay * l, z + az * l, ax, ay, az, l, cap(0.06, 3), 0.08, 3.2, 2.7, 1.8, 0.3);
      }
    } else flash(x, y, z, cap((mu ? 0.75 : 0.9) * k, 45), e.fire ? 0.9 : 1, 0.1 + 0.02 * k);
    // fx r1: a tracer ripping down the flight line (reads the shot at gameplay speed), a forward spark cone, muzzle smoke
    const tl = (mu ? 4 : 6) * Math.min(k, 1.6), tc = e.fire ? CORE_FIRE : CORE;
    fx.streak(x + dx * tl, y + dy * tl, z + dz * tl, dx, dy, dz, tl, cap(0.14 * Math.min(k, 1.6), 5), 0.15, tc[0] * 0.8, tc[1] * 0.8, tc[2] * 0.8, 0.5, dx * 30, dy * 30, dz * 30);
    sparks(x, y, z, mu || lens ? 2 : Math.round(5 * k), dx, dy, dz, 0.3, 16, 0.45, e.fire ? CORE_FIRE : SPARK, 0.16);
    if (!lens) fx.smoke(x, y, z, 0.2, (mu ? 0.5 : 0.95) * Math.min(k, 1.6), 0.6, 0.5, 0.42, 0.34, mu ? 0.2 : 0.42, dx * 2.5, 0.4, dz * 2.5, 3, 0.4);
    // forward star rays
    const rays = mu || lens ? 3 : Math.round(4 + 3 * k);
    for (let r = 0; r < rays; r++) {
      const ox = dx + vrng.range(-0.35, 0.35), oy = dy + vrng.range(-0.3, 0.3), oz = dz + vrng.range(-0.35, 0.35), l = Math.hypot(ox, oy, oz);
      const len = cap(vrng.range(0.6, 1.4) * k, 60);
      fx.streak(x + ox / l * len, y + oy / l * len, z + oz / l * len, ox / l, oy / l, oz / l, len, cap(0.05 * k, 2.5), 0.07, 3, 2.3, 1.2, 0.8);
    }
    // string glint: a vertical flick of light at the bow
    if (!mu && !lens) fx.streak(e.x, e.y + 0.62, e.z, 0, 1, 0, 1.24, 0.035, 0.07, 2.6, 2.6, 2.2, 0.2);
    // air-burst ring on the arrow line (two on heavy shots); under the aim lens they open down range, not over the target
    const r0 = lens ? 5 : 1.2, r1 = lens ? 10 : 3.2, rk = lens ? 0.45 : 1;
    fx.ring(x + dx * r0, y + dy * r0, z + dz * r0, dx, dy, dz, 0.1, Math.min(0.9, 0.45 * k) * rk, 0.05, 0.14, 1.5, 1.25, 0.85);
    if (k > 1) fx.ring(x + dx * r1, y + dy * r1, z + dz * r1, dx, dy, dz, 0.15, Math.min(1.2, 0.7 * k) * rk, 0.045, 0.2, 1.3, 1.05, 0.7, 0.03);
    if (e.fire) for (let f = 0; f < (lens ? 2 : 6 * k); f++) fx.glow(x, y, z, 0.2, 0.5, vrng.range(0.12, 0.25), 3, 1.2, 0.25, dx * vrng.range(2, 6) + vrng.range(-1, 1), vrng.range(0, 2), dz * vrng.range(2, 6) + vrng.range(-1, 1), 4, 2, 0.4);
    if (e.sky) {                                              // rain volley: a flare column climbs off the bow
      fx.streak(x + dx * 5, y + dy * 5, z + dz * 5, dx, dy, dz, 5, 0.18, 0.25, 2.6, 1.6, 0.6, 0.6);
      fx.ring(x, y, z, dx, dy, dz, 0.2, 1.4, 0.08, 0.3, 1.8, 1.2, 0.5);
    }
    // fx r3 acc: heavy single shots (N6, C1, C4's last, a full-draw aim shot) draw their force line on the loose itself —
    // a point-blank arrow is often spent inside a sim step before any render sees it fly, so the in-flight beam never showed
    if (e.heavy && e.big === 1 && !e.fire && e.n === 1) {
      const o = lens ? 2.5 : 0.3, L = lens ? 16 : e.reach ? Math.min(12, Math.max(6, e.reach + 4)) : 12,   // r5: ends ≈ 4 m past a locked soldier
        bw0 = lens ? Math.max(0.25, Math.min(1, fx.px(x + dx * o, y + dy * o, z + dz * o) * 90)) : 1;
      heavyBeam(x + dx * (o + L), y + dy * (o + L), z + dz * (o + L), dx, dy, dz, L, bw0, 0.42);
    }
    if ((e.heavy || e.big) && !e.fire && !e.sky && e.big < 2 && !lens) {   // fx r3 acc: a shock cone punched off the bow
      for (let q = 0; q < 3; q++) fx.ring(x + dx * (0.5 + q * 0.9), y + dy * (0.5 + q * 0.9), z + dz * (0.5 + q * 0.9), dx, dy, dz, 0.15 + q * 0.2, 0.7 + q * 0.45, 0.07, 0.16, 2.6, 1.8, 0.7, q * 0.02);
      for (let q = 0; q < 8; q++) {
        const a = q / 8 * 6.283, sx = -dz * Math.cos(a), sy = Math.sin(a), sz = dx * Math.cos(a), cx = dx + sx * 0.3, cy = dy + sy * 0.3, cz = dz + sz * 0.3, l = Math.hypot(cx, cy, cz);
        fx.streak(x + cx / l * 1.8, y + cy / l * 1.8, z + cz / l * 1.8, cx / l, cy / l, cz / l, 1.6, 0.06, 0.1, 2.4, 1.7, 0.7, 0.6);
      }
    }
    if ((e.heavy || e.big) && !mu && e.move !== 'aim') {      // weight: dust kicked back off his feet, thump, light (not under the aim lens)
      const hx = hero.x - dx * 0.3, hz = hero.z - dz * 0.3;
      for (let d = 0; d < 5 * k; d++) {
        const a = e.yaw + Math.PI + vrng.range(-1.1, 1.1), v = vrng.range(1.5, 4) * k;
        fx.smoke(hx, 0.15, hz, 0.25, vrng.range(0.6, 0.9) * k, vrng.range(0.45, 0.7), DUSTC[0], DUSTC[1], DUSTC[2], 0.3, Math.sin(a) * v, vrng.range(0.2, 0.8), Math.cos(a) * v, 3, 0.3);
      }
      fx.groundRing(hero.x, hero.z, 0.3, 1.6 * k, 0.045, 0.3, 0.9, 0.6, 0.3);
      fx.kick(e.big > 1 ? 4 : 2.2, e.big > 1 ? 0.3 : 0.16, 0.15, 1);
      fx.light(x, y + 0.2, z, e.big > 1 ? 3 : 1.4, e.fire ? 0xff8a30 : 0xfff0d0, 9);
    }
  });

  // ---------------------------------------------------------------- impact
  let hitFrame = -1, hitN = 0;
  on('arrow:hit', (e) => {
    if (game.frame !== hitFrame) { hitFrame = game.frame; hitN = 0; }
    // (fx r3: a big pierce shot — C6 through 20, N6 through 14 — keeps its full contacts to the first 1-3 bodies of a frame;
    // the rest are small, so the line and the burst stay the event instead of a sheet of yellow spikes)
    const full = ++hitN <= (e.fire && e.big ? 1 : e.big ? 3 : 6), k = e.big > 1 ? 1.8 : e.big ? 1.4 : 1;
    const hp = fx.px(e.x, e.y, e.z) * 70;                                          // fx r2: a contact near the lens stays ≤ ≈ 70 px
    fx.glow(e.x, e.y, e.z, Math.min(0.25, hp * 0.2), Math.min((full ? 1.2 : 0.6) * k, hp), 0.09, 3.2, 2.4, 1.3);
    if (full) fx.glow(e.x, e.y, e.z, Math.min(0.6 * k, hp * 0.5), Math.min(1.8 * k, hp * 1.4), 0.16, 0.9, 0.45, 0.12);   // warm halo round the contact
    if (full) {
      sparks(e.x, e.y, e.z, Math.round(7 * k), e.dx, e.dy, e.dz, 0.8, 12 * k, 0.5, e.fire ? CORE_FIRE : SPARK);
      sparks(e.x, e.y, e.z, 3, -e.dx, 0.4, -e.dz, 0.9, 5, 0.3);                     // a few kicked back at the shooter
      fx.smoke(e.x, e.y - 0.3, e.z, 0.25, 0.9 * k, 0.45, DUSTC[0], DUSTC[1], DUSTC[2], 0.35, e.dx * 1.5, 0.5, e.dz * 1.5, 3, 0.5);
      if (e.fire) embers(e.x, e.y, e.z, 5, 2.5, 3, 0.6);
    }
    if (!e.spent) fx.streak(e.x + e.dx * 1.3, e.y + e.dy * 1.3, e.z + e.dz * 1.3, e.dx, e.dy, e.dz, 1.2, 0.06 * k, 0.08, 2.8, 2.2, 1.2, 0.7);   // pierce
    else if (e.big < 2 && e.e >= 0) {                                              // pinned in the body (a soldier; e -1: an actor)
      const j = pin.next; pin.next = (pin.next + 1) % NPIN;
      pin.e[j] = e.e; pin.ox[j] = e.x - c.x[e.e] + e.dx * 0.3; pin.oy[j] = e.y - c.y[e.e] + e.dy * 0.3; pin.oz[j] = e.z - c.z[e.e] + e.dz * 0.3;
      pin.dx[j] = e.dx; pin.dy[j] = e.dy; pin.dz[j] = e.dz; pin.t[j] = 0; pin.s[j] = e.big ? 1.7 : 1.25;
    }
  });

  // ---------------------------------------------------------------- rain marker
  // fx r2: a crisp thin reticle (rim + 12 tick marks) with a ring closing onto it — the stacked filled rings / pulses
  // smeared into a flat cream disc under DoF — plus a render-only sheet of short dark arrow streaks falling inside it
  // while the real arrows land (they pin in the ground / bodies with a puff each)
  const rainFx = { x: 0, z: 0, r: 0, t: 1, t0: 0, t1: 0, acc: 0 };
  on('arrow:rain', (e) => {
    const life = e.delay + e.over + 0.25;
    // (fx r3 acc: a bolder rim + ticks and two closing rings, readable before the arrows land)
    fx.groundRing(e.x, e.z, e.r, e.r, 0.03, life, 2.4, 0.75, 0.15);
    fx.groundRing(e.x, e.z, e.r * 0.32, e.r * 0.32, 0.04, life, 1.5, 0.45, 0.08);
    fx.groundRing(e.x, e.z, e.r * 1.7, e.r, 0.025, e.delay + 0.05, 2.2, 0.9, 0.3);           // closing in: "here it comes"
    fx.groundRing(e.x, e.z, e.r * 2.2, e.r, 0.02, e.delay * 0.8, 1.6, 0.6, 0.2, e.delay * 0.2);
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * 6.283, ca = Math.cos(a), sa = Math.sin(a), l = k % 3 ? 0.5 : 1.1;
      fx.streak(e.x + ca * (e.r + 0.15), 0.12, e.z + sa * (e.r + 0.15), ca, 0, sa, l, 0.12, life, 2.4, 0.8, 0.18, 0.3);
    }
    fx.glow(e.x, 6.5, e.z, 0.8, 2.5, 0.4, 2.6, 1.5, 0.45);                                     // sky flare at the apex
    // the sheet slants in from over his shoulder toward the circle (hero → target), ≈ 38° off vertical, so from the
    // gameplay lens it crosses the upper half of the frame instead of dropping straight down out of sight above it
    let fx0 = e.x - hero.x, fz0 = e.z - hero.z;
    const fl = Math.hypot(fx0, fz0) || 1; fx0 /= fl; fz0 /= fl;
    Object.assign(rainFx, { x: e.x, z: e.z, r: e.r, t: 0, t0: e.delay * 0.55, t1: e.delay + e.over, acc: 0, sx: fx0 * 0.78, sz: fz0 * 0.78 });
  });
  // fx r3: the sheet is real voxel arrows (render-only, own instanced mesh, compacted: idle = no draw), ≈ 150 a second
  // from 4-8 m falling on one slant, each with a faint motion streak, that stand in the ground at the slant for 0.7 s
  // with a puff — the additive streak sheet read as ≈ 10 pale lines and the ground never looked riddled
  // fx r3 acc: ≈ 380 a second through the first 0.5 s (a dark curtain), then 110; 7-13 m up on the slant at 44 m/s
  const NRAIN = 256, RAIN_STUCK = 0.7;
  const rainMesh = new THREE.InstancedMesh(geo, arrows.material, NRAIN);
  rainMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); rainMesh.frustumCulled = false; rainMesh.count = 0;
  root.add(rainMesh);
  const rn = { x: new Float32Array(NRAIN), y: new Float32Array(NRAIN), z: new Float32Array(NRAIN), dx: new Float32Array(NRAIN), dy: new Float32Array(NRAIN),
    dz: new Float32Array(NRAIN), t: new Float32Array(NRAIN).fill(9), fall: new Uint8Array(NRAIN), next: 0 };
  function updateRain(dt) {
    if (rainFx.t <= rainFx.t1) {
      rainFx.t += dt;
      if (rainFx.t >= rainFx.t0) rainFx.acc += dt * (rainFx.t < rainFx.t0 + 0.5 ? 380 : 110);
      while (rainFx.acc >= 1) {
        rainFx.acc--;
        const j = rn.next; rn.next = (rn.next + 1) % NRAIN;
        const a = vrng.range(0, 6.283), rr = rainFx.r * Math.sqrt(vrng.next()), h = vrng.range(7, 13), l = Math.hypot(rainFx.sx, 1, rainFx.sz);
        rn.x[j] = rainFx.x + Math.cos(a) * rr - rainFx.sx * h; rn.y[j] = h; rn.z[j] = rainFx.z + Math.sin(a) * rr - rainFx.sz * h;
        rn.dx[j] = rainFx.sx / l; rn.dy[j] = -1 / l; rn.dz[j] = rainFx.sz / l; rn.fall[j] = 1; rn.t[j] = 0;
      }
    }
    let n = 0;
    for (let j = 0; j < NRAIN; j++) {
      if (rn.t[j] >= RAIN_STUCK) continue;
      const dx = rn.dx[j], dy = rn.dy[j], dz = rn.dz[j];
      let y = rn.y[j], s = 1.4;
      if (rn.fall[j]) {
        const v = 44 * dt;
        rn.x[j] += dx * v; rn.y[j] += dy * v; rn.z[j] += dz * v; y = rn.y[j];
        if (y <= 0) {                                          // lands: stands in the ground, a puff and a tick of dust
          const k = -y / dy; rn.x[j] -= dx * k; rn.z[j] -= dz * k; rn.y[j] = y = 0; rn.fall[j] = 0; rn.t[j] = 0;
          if (vrng.chance(0.5)) fx.smoke(rn.x[j], 0.1, rn.z[j], 0.15, 0.7, 0.5, DUSTC[0], DUSTC[1], DUSTC[2], 0.5, 0, 0.7, 0, 3, 0.3);
          if (vrng.chance(0.3)) sparks(rn.x[j], 0.1, rn.z[j], 2, 0, 1, 0, 0.8, 3, 0.18, [1.1, 0.8, 0.5], 0.2);
        } else fx.line(rn.x[j], y, rn.z[j], dx, dy, dz, 2.2, 0.05, 0.7, 0.45, 0.2, 1.2);   // faint motion streak behind the shaft
      } else {
        rn.t[j] += dt;
        y = -0.3 - Math.max(0, rn.t[j] - (RAIN_STUCK - 0.2)) / 0.2 * 0.9;                 // tip buried, sinks away at the end
      }
      const gy = y + ground(rn.x[j], rn.z[j]);
      if (Math.hypot(rn.x[j] - fx.cam.x, gy - fx.cam.y, rn.z[j] - fx.cam.z) < 3.5) continue;   // one falling past the lens was a black bar
      _q.setFromUnitVectors(FWD, _d.set(dx, dy, dz));
      _m.compose(_p.set(rn.x[j], gy, rn.z[j]), _q, _s.setScalar(s));
      rainMesh.setMatrixAt(n++, _m);
    }
    rainMesh.count = n;
    if (n) rainMesh.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------------------------- bursts
  on('arrow:burst', (e) => {
    const x = e.x, z = e.z, r = e.r;
    if (e.big > 1) {                                          // the Musou giant: the explosion x1.9 + a thin hot light pillar
      explode(x, z, r, 1.9);
      fx.streak(x, 16, z, 0, 1, 0, 16, 0.9, 0.35, 3.0, 2.0, 0.8, 0.35);
      fx.streak(x, 14, z, 0, 1, 0, 14, 2.6, 0.5, 0.5, 0.24, 0.05, 0.3);
      return;
    }
    if (r > 3) { explode(x, z, r, 1); return; }               // C6 fire arrow
    // small bursts: jump attack (dust), jump-charge fan and Musou volley (fire)
    fx.glow(x, 0.5, z, 0.3, r * 0.7, 0.08, 2.8, e.fire ? 1.4 : 2, e.fire ? 0.4 : 1.1);
    fx.groundRing(x, z, 0.2, r * 1.15, 0.05, 0.26, e.fire ? 1.8 : 1.2, e.fire ? 0.9 : 0.95, e.fire ? 0.3 : 0.7);
    if (e.fire) {
      fireball(x, 0.4, z, r * 0.6, 6, 0.6);
      smokeColumn(x, z, r * 0.7, 3, 1.4);
      embers(x, 0.4, z, 8, 3, 6, 0.9);
      fx.scorch(x, z, r * 0.55, 3.5, 0.7, 0.7);
      fx.light(x, 1, z, 1.5, 0xff8a38, 8);
    } else sparks(x, 0.3, z, 8, 0, 1, 0, 1, 8, 0.4);
    dust(x, 0.2, z, e.fire ? 3 : 6, 3 + r, 0.4, 1.2, 0.6, 0.45);
  });

  on('arrow:headshot', (e) => {
    fx.glow(e.x, e.y, e.z, 0.5, 2.2, 0.16, 3.6, 2.8, 1);
    sparks(e.x, e.y, e.z, 26, 0, 0.3, 0, 1.5, 14, 0.7, [3.4, 2.6, 0.7], 0.3);
    fx.ring(e.x, e.y, e.z, 0, 0, 0, 0.2, 1.6, 0.07, 0.3, 3, 2.2, 0.6, 0, 1);
    fx.ring(e.x, e.y, e.z, 0, 0, 0, 0.1, 0.9, 0.12, 0.22, 2.4, 1.8, 0.5, 0.05, 1);
  });

  on('scenario', () => {
    fx.clear(); prev.fill(0); pin.t.fill(9); giant.on = false; giant.fade = 0; rn.t.fill(9); rainFx.t = rainFx.t1 + 1; rainMesh.count = 0;
    arrows.count = 0;
  });

  // ---------------------------------------------------------------- draw / charge on the arrowhead
  const pose = new Float32Array(POSE_SIZE), tip = new THREE.Vector3(), nock = new THREE.Vector3(), hpos = new THREE.Vector3();
  let fullPing = false, moteAcc = 0, chargeAcc = 0;
  /** Frames to the next shot of the current move (or -1) and whether it is a charge shot. */
  function nextShot() {
    if (hero.state !== 'attack' || !hero.move) return -1;
    const m = hero.kit.moves[hero.move];
    if (!m || !m.shots) return -1;
    const t = hero.moveT;
    let best = 1e9;
    for (const s of m.shots) {
      if (Array.isArray(s.f)) { for (let f = s.f[0]; f <= s.f[1]; f += s.every) if (f >= t) { best = Math.min(best, f); break; } }
      else if (s.f >= t) best = Math.min(best, s.f);
    }
    return best < 1e9 ? best - t : -1;
  }
  // fx r3 acc: the jump-charge hang reads from an aura AROUND him (the body glow is only a thin rim now): camera-facing
  // rings closing onto his body, embers spiralling up round him, a warm light
  let jcAcc = 0;
  function jcAura(dt) {
    const t = hero.moveT, m = hero.kit.moves.jc;
    if (hero.state !== 'attack' || hero.move !== 'jc' || !m || !m.hang || t < m.hang[0] - 2 || t > m.plunge[0] + 1) return;
    const u = Math.min(1, (t - m.hang[0] + 2) / 10), cy = hero.y + 1.0;
    jcAcc += dt;
    if (jcAcc > 0.1) {
      jcAcc = 0;
      fx.ring(hero.x, cy, hero.z, 0, 0, 0, 2.2, 1.15, 0.03, 0.16, 1.5 * u, 0.62 * u, 0.12 * u, 0, 1);
    }
    for (let k = 0; k < 2; k++) {
      const a = vrng.range(0, 6.283), r = vrng.range(0.9, 1.4);
      fx.glow(hero.x + Math.cos(a) * r, cy + vrng.range(-0.9, 0.5), hero.z + Math.sin(a) * r, 0.07, 0.02, vrng.range(0.3, 0.5), 2.8, 1.2, 0.25,
        -Math.sin(a) * 2.2, vrng.range(1.5, 3), Math.cos(a) * 2.2, 1, 0, 0.4);
    }
    fx.light(hero.x, cy, hero.z, 1.2 * u, 0xff8a30, 10, 1);
  }
  function updateDraw(dt) {
    jcAura(dt);
    const aim = game.musou.aim, aiming = aim && aim.active;
    let u = 0, charge = false;
    if (aiming) { u = aim.phase === 'draw' ? aim.d : 0; charge = true; }
    else {
      const d = nextShot(), m = d >= 0 && hero.kit.moves[hero.move], W = m && m.armor ? 16 : 7;
      if (d >= 0 && d <= W) { u = 1 - d / W; charge = !!m.armor; }
    }
    if (u <= 0) { fullPing = false; return; }
    hpos.set(hero.x, hero.y, hero.z);
    heroPose(hero, pose);
    spearWorld(pose, hpos, hero.yaw, -0.55, 0.22, nock, tip);                  // bow line: nock ← grip → arrowhead
    const ty = tip.y, dx = tip.x - nock.x, dy = tip.y - nock.y, dz = tip.z - nock.z, dl = Math.hypot(dx, dy, dz) || 1;
    const k = charge ? 1 : 0.6;
    // fx r1: a small intense point with a soft halo, capped in screen pixels — sized in metres, the over-the-shoulder aim
    // camera (≈ 3 m away) blew it up into a hard-edged yellow disc over his head and the target; the draw strength reads
    // from the string glow, the converging motes and the contracting rings instead
    const px = fx.px(tip.x, ty, tip.z), ak = aiming ? 0.6 : 1;
    fx.dot(tip.x, ty, tip.z, Math.min((0.1 + 0.2 * u * u) * k, (5 + 6 * u) * px), 2.4 * u * ak, 1.6 * u * ak, 0.5 * u * ak);
    fx.dot(tip.x, ty, tip.z, Math.min((0.3 + 0.4 * u) * k, (14 + 12 * u) * px), 0.22 * u * ak, 0.13 * u * ak, 0.04 * u * ak);
    // motes converge on the head
    moteAcc += dt * (charge ? 70 : 30) * u;
    while (moteAcc >= 1) {
      moteAcc--;
      const a = vrng.range(0, 6.283), b = vrng.range(-1, 1), R = vrng.range(0.7, 1.4) * k, sb = Math.sqrt(1 - b * b), life = 0.18;
      const ox = Math.cos(a) * sb * R, oy = b * R, oz = Math.sin(a) * sb * R;
      fx.spark(tip.x + ox, ty + oy, tip.z + oz, -ox / life, -oy / life, -oz / life, 0.35, 0.025, life, 2.6, 1.8, 0.7, 0, 0, 1);
    }
    if (charge) {                                                               // contracting charge rings on the aim line
      chargeAcc += dt;
      if (chargeAcc > 0.09) {
        chargeAcc = 0;
        fx.ring(tip.x + dx / dl * 0.2, ty + dy / dl * 0.2, tip.z + dz / dl * 0.2, dx, dy, dz, Math.min(0.9 * k, 60 * px), 0.12, 0.09, 0.14, 1.8 * u, 1.3 * u, 0.5 * u);
      }
      // the string glows as it comes to full draw
      if (u > 0.5) fx.line(nock.x, nock.y + 0.55, nock.z, 0, 1, 0, 1.1, 0.025, 1.6 * u, 1.5 * u, 1.2 * u, 0.3);
    }
    if (aiming && u >= 1 && !fullPing) {                                        // full draw: a ping you can read mid-fight
      fullPing = true;
      fx.glow(tip.x, ty, tip.z, 8 * px, Math.min(1.4, 40 * px), 0.12, 3.4, 2.6, 1);
      fx.ring(tip.x, ty, tip.z, 0, 0, 0, 0.1, Math.min(0.8, 70 * px), 0.1, 0.2, 2.8, 2, 0.6, 0, 1);
    }
  }

  // ---------------------------------------------------------------- per-frame arrows
  let shed = 0;
  function update(dt) {
    const P = proj;
    shed += dt;
    const emit = shed >= 1 / 60;                               // trail particles at ≤ 60 Hz whatever the frame rate
    if (emit) shed = 0;
    // perf r5: live arrows are packed from slot 0 (count = live). "Up to the last live slot" drew all 544 × 468 tris
    // (× 2 with the shadow pass) as soon as one arrow was pinned: ≈ 510k of C6's 2.1M.
    let hi = 0;
    for (let i = 0; i < N; i++) {
      const st = P.st[i];
      if (!st) {
        if (prev[i]) {
          if (beamOn[i]) endBeam(i, P.x[i], P.y[i], P.z[i]);
          if (prev[i] === AS.FLY && P.big[i] < 2 && P.kind[i] !== 3) {
            const ex = P.x[i] - tx[i], ey = P.y[i] - ty[i], ez = P.z[i] - tz[i], L = Math.hypot(ex, ey, ez);
            if (L > 0.3) fx.streak(P.x[i], P.y[i], P.z[i], ex / L, ey / L, ez / L, Math.min(L, 8), P.big[i] ? 0.12 : 0.08, 0.12,
              P.fire[i] ? 2.2 : 1.8, P.fire[i] ? 0.9 : 1.4, P.fire[i] ? 0.25 : 0.7, 0.6);
          }
        }
        prev[i] = 0; continue;
      }
      const bigK = P.big[i] === 2 ? 5 : P.big[i] ? 1.6 : 1, kind = P.kind[i];
      _d.set(P.vx[i], P.vy[i], P.vz[i]);
      const v = _d.length();
      if (v > 1e-4) _d.divideScalar(v); else _d.set(0, -1, 0);
      _q.setFromUnitVectors(FWD, _d);
      const x = P.x[i], z = P.z[i], dx = _d.x, dy = _d.y, dz = _d.z;
      let y = P.y[i];
      if (st === AS.STUCK) {
        if (beamOn[i]) endBeam(i, x, y, z);
        if (prev[i] === AS.FLY) {                              // ground bite
          dust(x, 0.1, z, 2, 1.8, 0.2, kind === 4 ? 0.9 : 0.7, 0.5, 0.5);
          fx.glow(x, 0.25, z, 0.15, 0.6, 0.08, 2.4, 1.6, 0.6);
          sparks(x, 0.1, z, 3, -dx * 0.3, 0.9, -dz * 0.3, 0.8, 4, 0.2, [1.2, 0.9, 0.6], 0.25);
          fx.groundRing(x, z, 0.1, 0.6 * bigK, 0.1, 0.2, 0.9, 0.7, 0.4);
          if (P.fire[i]) embers(x, 0.1, z, 4, 1, 2, 0.6);
        }
        y -= 0.14 * bigK + Math.max(0, P.t[i] - (ARROW.stuck - 40)) / 40 * 0.9 * bigK;
      } else if (P.big[i] === 2) flyGiant(i, x, y, z, dx, dy, dz, v, emit, dt);
      else {
        const fire = P.fire[i], heavy = P.big[i] === 1;
        const col = fire ? CORE_FIRE : heavy ? CORE_HEAVY : CORE, gc = fire ? GLOW_FIRE : GLOW;
        if (kind === 4) {                                       // falling rain: short, fast, darker streaks (fx r2: part of a sheet)
          fx.line(x, y, z, dx, dy, dz, 1.6, 0.05, 1.5, 0.9, 0.4, 1.1);
          fx.line(x, y, z, dx, dy, dz, 2.4, 0.16, 0.4, 0.22, 0.07, 0.8);
        } else if (kind === 3) {                                // the skyward volley: a climbing flare
          fx.line(x, y, z, dx, dy, dz, 4, 0.1, 3, 2, 0.8, 1);
          fx.dot(x, y, z, 0.6, 2.6, 1.6, 0.5);
        } else {
          if (prev[i] !== AS.FLY) {
            tx[i] = x - dx * 0.5; ty[i] = y - dy * 0.5; tz[i] = z - dz * 0.5;
            beamOn[i] = isBeam(i) ? 1 : 0; ringAcc[i] = 0;
            if (beamOn[i]) {
              // (fx r3: under the aim lens the beam starts 2.5 m down range — its root at the bow, 3 m from the lens, was a
              // screen-wide yellow bar over the target just lined up)
              const o = hero.move === 'aim' ? -2.5 : v / 60;
              ox[i] = x - dx * o; oy[i] = y - dy * o; oz[i] = z - dz * o;
              bw[i] = Math.max(0.25, Math.min(1, fx.px(ox[i], oy[i], oz[i]) * 90));   // thin from the aim lens: no haze over the target
            }
          }
          if (beamOn[i]) {                                      // the live beam: bow → arrow
            const ex = x - ox[i], ey = y - oy[i], ez = z - oz[i], L = Math.hypot(ex, ey, ez), w = (heavy ? 1 : 0.7) * bw[i];
            if (L > 0.5 && ex * dx + ey * dy + ez * dz > 0) {
              fx.line(x, y, z, ex / L, ey / L, ez / L, L, 0.38 * w, 3.0, 2.3, 1.2, 0.3);
              fx.line(x, y, z, ex / L, ey / L, ez / L, L, 1.3 * w, 1.0, 0.48, 0.1, 0.25);
            }
          }
          const kf = 1 - Math.exp(-dt * 14);
          tx[i] += (x - tx[i]) * kf; ty[i] += (y - ty[i]) * kf; tz[i] += (z - tz[i]) * kf;
          const ex = x - tx[i], ey = y - ty[i], ez = z - tz[i], tl = Math.min(9, Math.hypot(ex, ey, ez));
          const len = Math.min(3.2, Math.max(0.8, v * 0.045)) * (heavy ? 1.3 : 1);
          fx.line(x, y, z, dx, dy, dz, len, 0.07 * bigK * (fire ? 1.3 : 1), col[0], col[1], col[2], 1.5);          // hot core
          const gw = P.move[i] === 'jc' ? 0.12 : 0.28;                  // (fx r3 acc: the jump-charge fan's 7 glows merged into one thick beam)
          if (tl > 0.3) fx.line(x, y, z, ex / tl, ey / tl, ez / tl, tl, gw * bigK, gc[0] * 1.6, gc[1] * 1.6, gc[2] * 1.6, 0.7);   // comet glow
          fx.dot(x, y, z, 0.2 * bigK, col[0] * 0.6, col[1] * 0.6, col[2] * 0.6);
          if (emit) fx.streak(x - dx * 0.6, y - dy * 0.6, z - dz * 0.6, dx, dy, dz, 1.1 * bigK, 0.06 * bigK, 0.16, gc[0] * 2.2, gc[1] * 2.2, gc[2] * 2.2, 1);   // afterimage
          if (beamOn[i]) {                                      // air rings every 4 m (≤ 3) + a scuff on the ground under a low shot
            const n = Math.floor(Math.hypot(x - ox[i], y - oy[i], z - oz[i]) / 4);
            if (n > ringAcc[i] && n <= 3) {
              ringAcc[i] = n;
              fx.ring(x - dx * 0.8, y - dy * 0.8, z - dz * 0.8, dx, dy, dz, 0.25 * bw[i], (heavy ? 1.1 : 0.7) * bw[i], 0.07, 0.32, 1.5, 1.15, 0.65);
              if (y < 2.4) for (const sd of [-1, 1]) fx.smoke(x, 0.1, z, 0.3, 1.1, 0.6, DUSTC[0], DUSTC[1], DUSTC[2], 0.4, -dz * sd * 2.5, 0.5, dx * sd * 2.5, 3, 0.3);
            }
          }
          if (fire) {
            fx.dot(x, y, z, 0.32 + 0.14 * vrng.next(), 2.4, 0.95, 0.16);                  // hot orange head (under the shoulder: stays orange)
            fx.dot(x, y, z, 0.1, 2.6, 2.2, 1.4);
            if (emit) {
              for (let f = 0; f < 2; f++) fx.glow(x - dx * vrng.range(0, 0.8), y + vrng.range(-0.05, 0.1), z - dz * vrng.range(0, 0.8), 0.22, 0.05, vrng.range(0.18, 0.32),
                2.2, vrng.range(0.6, 0.95), 0.1, vrng.range(-0.6, 0.6), vrng.range(0.5, 1.6), vrng.range(-0.6, 0.6), 2, 1.5, 0.4);
              if (vrng.chance(0.5)) fx.smoke(x - dx, y, z - dz, 0.15, 0.7, 0.8, 0.12, 0.1, 0.09, 0.4, 0, 0.8, 0, 2, 0.8);
            }
          }
        }
      }
      // (fx r2: the ×5 giant shrinks near the lens — right after the loose its fletching filled the release frame)
      const sc = P.big[i] === 2 && st !== AS.STUCK ? bigK * Math.max(0.35, Math.min(1, fx.px(x, y, z) * 90)) : bigK;
      _m.compose(_p.set(x, y + ground(x, z), z), _q, _s.setScalar(sc));
      arrows.setMatrixAt(hi++, _m);
      prev[i] = st;
    }
    // pinned arrows ride the soldier they stopped in
    for (let j = 0; j < NPIN; j++) {
      if (pin.t[j] >= PIN_T) { pin.t[j] = 9; continue; }
      pin.t[j] += dt;
      const e = pin.e[j], sink = Math.min(1, (PIN_T - pin.t[j]) / 0.25);
      _d.set(pin.dx[j], pin.dy[j], pin.dz[j]);
      _q.setFromUnitVectors(FWD, _d);
      const px = c.x[e] + pin.ox[j], pz = c.z[e] + pin.oz[j];
      _m.compose(_p.set(px, c.y[e] + pin.oy[j] + ground(px, pz), pz), _q, _s.setScalar(pin.s[j] * sink));
      arrows.setMatrixAt(hi++, _m);
    }
    arrows.count = hi;
    arrows.instanceMatrix.needsUpdate = true;
    updateGiantTrail(dt);
    updateDraw(dt);
    updateRain(dt);
  }

  // ---------------------------------------------------------------- the Musou giant in flight + its lingering trail
  function flyGiant(i, x, y, z, dx, dy, dz, v, emit, dt) {
    if (!giant.on) { giant.on = true; giant.x0 = x - dx * 1.5; giant.y0 = y; giant.z0 = z - dz * 1.5; giant.t = 0; }
    giant.x = x; giant.y = y; giant.z = z; giant.fade = 1; giant.t += dt;
    const t = giant.t, sx = -dz, sz = dx;                      // side axis (flat flight)
    fx.light(x, y + 0.8, z, 1.6, 0xff8a30, 10, 1);             // the blaze rides it
    // sun core + beam
    // (sizes kept modest: the first frames of the flight pass the over-the-shoulder lens and washed the frame out)
    const px = fx.px(x, y, z), lk = Math.min(1, px * 90);        // fx r2: shrinks near the lens (the release cam: a cream haze)
    fx.dot(x, y, z, Math.min(1.0, 45 * px), 3.4, 2.6, 1.4);
    fx.dot(x, y, z, Math.min(2.4, 110 * px), 0.6, 0.3, 0.06);
    fx.line(x + dx * 1.5, y, z + dz * 1.5, dx, dy, dz, 8, 0.4 * lk, 3.4, 2.5, 1.1, 1.4);
    fx.line(x + dx * 1.5, y, z + dz * 1.5, dx, dy, dz, 12, 1.0 * lk, 0.7, 0.36, 0.1, 0.7);
    // double spiral aura wound round the flight line
    for (let s = 0; s < 2; s++) for (let k = 0; k < 14; k++) {
      const back = k * 0.55, a = t * 22 - k * 0.7 + s * Math.PI, rr = 0.9 + 0.05 * k, f = 1 - k / 14;
      fx.dot(x - dx * back + sx * Math.cos(a) * rr, y + Math.sin(a) * rr, z - dz * back + sz * Math.cos(a) * rr, (0.28 * f + 0.08) * lk, 2.6 * f, 1.8 * f, 0.6 * f);
    }
    if (emit) {
      for (let f = 0; f < 5; f++) {                            // flame shell + embers peeling off
        const a = vrng.range(0, 6.283), rr = vrng.range(0.2, 0.9);
        fx.glow(x - dx * vrng.range(0, 2) + sx * Math.cos(a) * rr, y + Math.sin(a) * rr, z - dz * vrng.range(0, 2) + sz * Math.cos(a) * rr, 0.9 * lk, 0.2 * lk, vrng.range(0.25, 0.45),
          3, vrng.range(0.9, 1.5), 0.25, sx * Math.cos(a) * 2, Math.sin(a) * 2 + 1, sz * Math.cos(a) * 2, 2, 2, 0.3);
      }
      embers(x - dx * 2, y, z - dz * 2, 3, 3, 4, 0.9);
      fx.smoke(x - dx * 3, y, z - dz * 3, 0.6, 2.4, 1.6, 0.14, 0.11, 0.09, 0.45, 0, 1, 0, 1.5, 1);
      if (giant.t > 0.12) for (const side of [-1, 1]) {                         // the ground torn up under its path
        const v2 = vrng.range(3, 6);
        fx.smoke(x + sx * side * 0.6, 0.15, z + sz * side * 0.6, 0.5, 1.8, 0.9, DUSTC[0], DUSTC[1], DUSTC[2], 0.5, sx * side * v2, vrng.range(0.5, 2), sz * side * v2, 2.5, 0.5);
      }
      fx.ring(x - dx * 2.5, y, z - dz * 2.5, dx, dy, dz, 0.6 * lk, 1.2 * lk, 0.06, 0.22, 2, 1.5, 0.7);
    }
  }
  function updateGiantTrail(dt) {
    if (!giant.on) return;
    const g = game.musou.giantI, alive = g >= 0 && proj.st[g] === AS.FLY && proj.big[g] === 2;
    if (!alive) giant.fade -= dt / 1.4;
    if (giant.fade <= 0) { giant.on = false; return; }
    const dx = giant.x - giant.x0, dy = giant.y - giant.y0, dz = giant.z - giant.z0, L = Math.hypot(dx, dy, dz);
    if (L < 0.5) return;
    const f = giant.fade * giant.fade, lk = Math.min(1, fx.px(giant.x0, giant.y0, giant.z0) * 90);
    fx.line(giant.x, giant.y, giant.z, dx / L, dy / L, dz / L, L, (0.3 * f + 0.05) * lk, 2.6 * f, 1.8 * f, 0.7 * f, 0.15);
    fx.line(giant.x, giant.y, giant.z, dx / L, dy / L, dz / L, L, 0.9 * f * lk, 0.4 * f, 0.22 * f, 0.06 * f, 0.1);
  }

  return {
    update,
    dispose() {
      scene.remove(root);
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    },
  };
}
