// Combat (sim): data-driven hit detection from moves.js hitboxes (never from animated bones → deterministic),
// damage, hitstop, knockback / launch / juggle / spin physics and reaction states on enemies, KO, enemy strikes.
// Soldier-on-soldier blows (Shu ally ↔ Wei grunt duels, crowd.js duel()) land through clash(): flinch or KO throw, no
// hero rewards; reactions() runs on the allies too (crowd indices N … T-1).
// Emits: attack:swing, hit, hits, ko, enemy:land, clash. Hero moves come from the hero's kit (game.hero.kit.moves); a moveId that
// is not in it (the Musou passes 'musou') skips the hero-move rules (hitstop scaling, lens cut, heavy blow-away).
// Hero-model actors (src/actors/actors.js, game.actors): every hero hitbox, arrow (hitActor) and Musou window also strikes
// the foe actors (the boss) — actors.hurt keeps his HP / poise / stagger, here the hero gets his rewards, a `hit` (i -1,
// actor: key) and the tick's hitstop (the soldiers' victims[] stays theirs). An allied actor's blows, and the boss's on
// the Shu soldiers, land through npcStrike: a hero blow's reactions, none of his rewards, `clash` per victim.
// A window with `proj` (moves.js) never strikes here: it launches flat waves through the kit's Musou sim
// (game.musou.wave(hit, moveId), src/musou/scripted.js) on its first frame (and every `every` frames), which strike as they fly.
//
// Feel targets (bench/notes/hit-feedback.md):
// - Hitstop is hero-local and scaled: 1 sf per mook tick + 1 per 5 extra victims (cap 4), 6-8 sf on heavy contact.
//   Victims shudder for at most 3 sf, then react — the weight comes from their reactions, not a freeze.
// - Launch: ≈1 s airborne with a ≈0.3 s apex float, tumbling to horizontal, one small rebound, down ≥ 2 s.
// - Rotation in the air is planned so bodies touch down already lying (no snap on landing); juggles re-plan it.
import { ST, wrap } from '../crowd/crowd.js';
import { emit } from '../core/events.js';
import { hash01 } from '../core/rng.js';

export const COMBAT = {
  enemyR: 0.4, yMaxDefault: 2.4, gravity: 24, groundFriction: 0.86, airDrag: 0.985,
  floatV: 1.8, floatK: 0.5,             // launched bodies: gravity × floatK while |vy| < floatV (apex hang ≈ 0.3 s)
  bounceMin: 3, bounceK: 0.28, bounceMax: 2.8,   // one rebound ≤ 0.15 m, settled in ≈ 0.2 s
  hurtFrames: 16, downFrames: 108, getupFrames: 24, comboWindow: 150,
  tintFrames: 12,                       // victim flash: 1 sf hot silhouette, then a warm tint held ≈ 6 sf, gone by ≈ 11 sf
  stopPer: 5, stopMax: 4, stopHeavy: [6, 8], victimStopMax: 3,
  farStop: 4,                           // projectile contacts beyond this (m): no shooter hitstop (tickDone)
  // KO throw: a killing flinch/push/spin hit blasts the body 2.2-3 H out, ≈ 0.6 s airborne, cartwheeling 270-450°
  koLift: 7.5, koForce: 9.5, koFlip2: 0.4, otgLift: 3.4,
  lensCut: 0.8,                         // hero blow-aways straight at the camera swing ≈ 75° sideways
  pileAhead: 2.2, pileGather: 0.8, pileMaxV: 3.5, // arc/line launchers pull victims 80 % of the way to a pile ahead
  launchMaxV: 2.5,                      // radial (circle) launchers: bodies go up, not out at the camera
  heavyBlow: [0.65, 1.2],               // hero finishers: horizontal × 0.65, lift × 1.2 → thrown 2-3 H
  juggleY: 2.4,                         // juggled bodies hover around 1.2-1.6 H instead of climbing
  musouPerHit: 0.3, musouPerKO: 0.55,   // musou part r3: one Musou now spends one of 3 segments, so a segment fills at the old whole-bar rate (≈ 90 hits)
  // flinch: the victim snaps round to face the blow and stumbles back ≈ 0.3 H (force 3) with its arms thrown up
  // (pose: crowd/view.js recoilPose); a grunt hit by a 'push' is knocked flat on its back, floor in ≈ 12 sf
  flinchKick: 1.6, flinchDamp: 0.85, knockLift: 1.7, knockK: 0.7,
};
const DT = 1 / 60, HALF_PI = Math.PI / 2;

/** Is a body at (x, z) of radius r inside `hit` cast from (ox, oz) facing yaw? Shape only (the caller checks height);
 *  arcs always take a body closer than 1 m. Also the actors' test (src/actors). */
export function inShapeAt(hit, ox, oz, yaw, x, z, r) {
  const dx = x - ox, dz = z - oz;
  const sn = Math.sin(yaw), cs = Math.cos(yaw);
  const lz = dx * sn + dz * cs, lx = dx * cs - dz * sn;          // forward, left
  if (hit.shape === 'line') {
    const off = hit.off || 0;
    return lz >= off - r && lz <= off + hit.len + r && Math.abs(lx) <= hit.width / 2 + r;
  }
  const d2 = dx * dx + dz * dz, R = hit.range + r;
  if (d2 > R * R) return false;
  if (hit.shape === 'circle' || d2 < 1.0) return true;
  return Math.abs(wrap(Math.atan2(lx, lz) - (hit.dir || 0) * Math.PI / 180)) <= hit.ang * Math.PI / 360;
}

/** Largest "lying" angle (−π/2 + kπ: on the back / face down) at or below a. */
const lieBelow = (a) => -HALF_PI + Math.floor((a + HALF_PI + 1e-6) / Math.PI) * Math.PI;

export function createCombat(game) {
  const cb = {};
  const hitsPayload = { count: 0, x: 0, z: 0, move: '', hitstop: 0, heavy: false };
  const landPayload = { x: 0, z: 0, bounce: false };
  const floaty = new Uint8Array(game.crowd.T);              // launched (apex hang) vs thrown (flat arc)
  const rxEnd = new Float64Array(game.crowd.T);             // planned lying angle at touchdown
  const victims = new Int32Array(game.crowd.N);

  const clashPayload = { x: 0, y: 0, z: 0, dx: 0, dz: 0, killed: false };
  let lastTick = -1;                                         // a move frame is resolved once, even across hitstop
  let heavyKey = null;                                       // window that already paid its heavy hitstop
  let sweepKey = null;                                       // combo-system r4: sweep window that already paid its hitstop
  cb.reset = () => { lastTick = -1; heavyKey = null; sweepKey = null; };
  const heroMove = (id) => !!game.hero.kit.moves[id];

  /** Is enemy i inside `hit` cast from (ox, oz) facing yaw? */
  function inShape(i, hit, ox, oz, yaw) {
    const c = game.crowd;
    return c.y[i] <= (hit.yMax ?? COMBAT.yMaxDefault) && inShapeAt(hit, ox, oz, yaw, c.x[i], c.z[i], COMBAT.enemyR);
  }

  /** Hero hitstop for one tick of `hit` that connected with `count` enemies (musou keeps its own numbers). */
  function heroStop(hit, count, moveId, key) {
    const base = hit.hitstop || 0;
    if (!base || !heroMove(moveId)) return base;
    if (hit.sweep) { if (key === sweepKey) return 0; sweepKey = key; }   // combo-system r4: one stop per sweep
    if (hit.heavy && key !== heavyKey) {                     // once per window: late stragglers get the mook stop
      heavyKey = key;
      return Math.max(COMBAT.stopHeavy[0], Math.min(COMBAT.stopHeavy[1], base));
    }
    return Math.min(COMBAT.stopMax, 1 + Math.floor((count - 1) / COMBAT.stopPer));
  }

  /**
   * Resolve one hitbox window tick from origin (ox,oz,yaw). key identifies the window (an enemy is hit once per key
   * unless `rehit`). Returns the number of enemies hit. Used by hero moves and the Musou.
   */
  cb.strike = (hit, ox, oz, yaw, key, rehit, moveId) => {
    const c = game.crowd;
    let count = 0, sx = 0, sz = 0, na = 0;
    for (let i = 0; i < c.N; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD) continue;
      if (!rehit && c.lastHit[i] === key) continue;
      if (!inShape(i, hit, ox, oz, yaw)) continue;
      c.lastHit[i] = key;
      applyHit(i, hit, ox, oz, yaw, moveId);
      victims[count++] = i; sx += c.x[i]; sz += c.z[i];
    }
    for (const a of game.actors.list) {                      // actors lane: the foe hero-model actors (the boss)
      if (!game.actors.foe(a) || (!rehit && a.lastHit === key) || a.y > (hit.yMax ?? COMBAT.yMaxDefault) || !inShapeAt(hit, ox, oz, yaw, a.x, a.z, a.r)) continue;
      a.lastHit = key; hurtActor(a, hit, ox, oz, moveId);
      na++; sx += a.x; sz += a.z;
    }
    if (count + na) tickDone(hit, count, sx, sz, key, moveId, false, na);
    return count + na;
  };

  /** After a tick's applyHit()s: hero / victim hitstop and the aggregate `hits` event. far: a ranged hero-move contact
   *  beyond COMBAT.farStop m (hitOne) — the victim keeps its stop, the shooter takes none (DW bows: no shooter freeze on
   *  distant arrows; the weight is the victim's reaction). na: hero-model actors struck besides the `count` soldiers
   *  (victims[] holds only soldiers; sx / sz sum over both). */
  function tickDone(hit, count, sx, sz, key, moveId, far = false, na = 0) {
    const c = game.crowd, n = count + na;
    let hs = heroStop(hit, n, moveId, key);
    const vs = heroMove(moveId) ? Math.min(Math.max(hs, hit.sweep ? 2 : 0), COMBAT.victimStopMax) : hs;
    for (let k = 0; k < count; k++) c.hs[victims[k]] = vs;
    if (far && heroMove(moveId)) hs = 0;
    game.hitstop = Math.max(game.hitstop, hs);
    Object.assign(hitsPayload, { count: n, x: sx / n, z: sz / n, move: moveId, hitstop: hs, heavy: !!hit.heavy });
    emit('hits', hitsPayload);
  }

  /** Hero hit on foe actor a (actors.hurt: HP, poise, stagger, down / retreat): his rewards, a KO when it beat him, the
   *  `hit` event (i -1, y above ground). */
  function hurtActor(a, hit, ox, oz, moveId) {
    let dx = a.x - ox, dz = a.z - oz;
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const killed = game.actors.hurt(a, hit.dmg, !!hit.heavy, moveId === 'musou');
    reward(killed);
    if (killed) game.hero.kos++;
    emit('hit', { i: -1, actor: a.key, x: a.x, y: a.y + 1.3 * a.scale, z: a.z, dx, dz, move: moveId, killed, officer: false, heavy: !!hit.heavy });
  }
  /** Projectile hook for a foe hero-model actor (projectiles.js sweep): hitOne for actor a. */
  cb.hitActor = (a, hit, ox, oz, yaw, key, rehit, moveId) => {
    if (!game.actors.foe(a) || (!rehit && a.lastHit === key)) return false;
    a.lastHit = key; hurtActor(a, hit, ox, oz, moveId);
    const h = game.hero;
    tickDone(hit, 0, a.x, a.z, key, moveId, Math.hypot(a.x - h.x, a.z - h.z) > COMBAT.farStop, 1);
    return true;
  };

  /** A hero-model actor's blow on the crowd (src/actors): an allied officer's kit move on the Wei grunts (foe false;
   *  officers are left to the hero), or the boss's blow on the Shu soldiers (foe true). The reactions of a hero hit, none
   *  of his rewards (combo, gauge, KO count, hitstop): `clash` per victim, the duel tallies (crowd.allyKos / allyLost).
   *  key as in strike() (actor keys ≥ 1.5e9), each soldier once per key. Returns the number hit. */
  cb.npcStrike = (hit, ox, oz, yaw, key, foe) => {
    const c = game.crowd, i1 = foe ? c.T : c.grunts;
    let n = 0;
    for (let i = foe ? c.N : 0; i < i1; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD || c.lastHit[i] === key || !inShape(i, hit, ox, oz, yaw)) continue;
      c.lastHit[i] = key; applyHit(i, hit, ox, oz, yaw, 'npc'); c.hs[i] = 2; n++;
    }
    return n;
  };

  /**
   * Projectile hook: apply one hit spec to enemy i as if a hitbox cast from (ox, oz) facing yaw had caught it — no shape
   * test, the caller (src/combat/projectiles.js) already decided it connects. `hit` takes the moves.js hit fields that
   * matter per victim: dmg, kb ('flinch'|'push'|'launch'|'blow'|'spin'), force, lift, hitstop, heavy, shape
   * ('line' = thrust: the push leans along yaw; else radial from the origin). Pass the arrow's launch point / flight
   * direction as origin + yaw. `key` works as in strike(): an enemy already hit with this key is skipped unless `rehit`
   * (one key per arrow = each arrow hits each soldier once; a piercing arrow keeps its key). moveId = the kit move that
   * fired it (hero-move rules: hitstop scaling, lens cut, heavy blow-away, musou gain) or 'musou' for a Musou volley.
   * Same reactions / events / rewards as a melee hit: hit, ko, hits (count 1). Returns true if it connected.
   */
  cb.hitOne = (i, hit, ox, oz, yaw, key, rehit, moveId) => {
    const c = game.crowd, s = c.st[i];
    if (s === ST.OFF || s === ST.DEAD || (!rehit && c.lastHit[i] === key)) return false;
    c.lastHit[i] = key;
    applyHit(i, hit, ox, oz, yaw, moveId);
    victims[0] = i;
    const h = game.hero;
    tickDone(hit, 1, c.x[i], c.z[i], key, moveId, Math.hypot(c.x[i] - h.x, c.z[i] - h.z) > COMBAT.farStop);
    return true;
  };

  /** Frames until touchdown from (y, vy), with the same integrator as reactions(). */
  function flightFrames(y, vy, float) {
    let n = 0;
    while (n < 300) {
      vy -= (float && Math.abs(vy) < COMBAT.floatV ? COMBAT.gravity * COMBAT.floatK : COMBAT.gravity) * DT;
      y += vy * DT; n++;
      if (y <= 0 && vy < 0) break;
    }
    return n;
  }

  /**
   * Throw enemy i into the air; tumble so it touches down lying after ≥ `turn` radians of backward rotation.
   * `early` < 1 finishes the rotation at that fraction of the flight and holds it (launched bodies lie flat at the apex).
   */
  function airborne(i, vy, vh, dx, dz, float, turn, spin, early = 1) {
    const c = game.crowd;
    c.st[i] = ST.AIR; c.stT[i] = 0; c.bounce[i] = 0; floaty[i] = float ? 1 : 0;
    c.y[i] = Math.max(c.y[i], 0.02);
    c.vy[i] = vy; c.vx[i] = dx * vh; c.vz[i] = dz * vh;
    const n = flightFrames(c.y[i], vy, float);
    rxEnd[i] = lieBelow(c.rx[i] - turn);
    c.rxV[i] = (rxEnd[i] - c.rx[i]) / (Math.max(1, n * early) * DT);
    c.spinV[i] = spin;
  }

  function applyHit(i, hit, ox, oz, yaw, moveId) {
    const c = game.crowd, h = game.hero;
    const officer = c.type[i] === 1;
    // push direction: radial from the attacker, biased along the attack facing for thrusts
    let dx = c.x[i] - ox, dz = c.z[i] - oz;
    const l = Math.hypot(dx, dz) || 1;
    dx /= l; dz /= l;
    if (hit.shape === 'line') { dx = dx * 0.35 + Math.sin(yaw) * 0.65; dz = dz * 0.35 + Math.cos(yaw) * 0.65; }
    const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;

    c.hp[i] -= hit.dmg * h.atkK;                                   // atkK: story buff (story/index.js), 1 otherwise
    // hot silhouette only on a fresh contact (crowd/view.js hitGlow); rapid re-hits (multi-hit moves, juggles) just refresh the tint.
    // Heavy hits tint 3 sf longer and deeper (amber).
    c.flash[i] = c.flash[i] > COMBAT.tintFrames / 2 ? COMBAT.tintFrames - 2 : COMBAT.tintFrames + (hit.heavy ? 3 : 0);
    c.hitHeavy[i] = hit.heavy ? 1 : 0;
    game.crowd.releaseToken(i);
    let kb = hit.kb, force = hit.force || 0, lift = hit.lift || 0;
    const killed = c.hp[i] <= 0 && !c.kod[i];
    const s0 = c.st[i], air = s0 === ST.AIR, downed = s0 === ST.DOWN || s0 === ST.GETUP;
    if (officer && !hit.heavy && !killed) { if (kb === 'launch' || kb === 'blow' || kb === 'spin') kb = 'push'; force *= 0.4; }
    // 修羅 (game.diff.armor): officers standing take a light kit hit without a reaction and keep swinging (heavies / Musou still stagger)
    if (officer && game.diff.armor && !hit.heavy && !killed && heroMove(moveId) && s0 <= ST.ATTACK) kb = 'armor';
    let koThrow = false;
    if (killed) {
      c.kod[i] = 1;
      if (kb === 'flinch' || kb === 'push') {
        kb = 'blow'; koThrow = true; lift = Math.max(lift, COMBAT.koLift); force = Math.max(force * 1.6, COMBAT.koForce);
      } else if (kb === 'spin') { lift = Math.max(lift, COMBAT.koLift * 0.7); force *= 1.4; }   // killing spin: whirls further out
    }
    const sgn = hash01(i, 71) < 0.5 ? -1 : 1, var01 = hash01(i, 13);
    // hero blow-aways never fly into the lens: a throw toward the camera swings sideways (same speed), so it crosses
    // the screen instead of filling it; the Musou keeps its full radial fan
    let bx = dx, bz = dz;
    const cx = -Math.sin(game.cam.yaw), cz = -Math.cos(game.cam.yaw), tc = dx * cx + dz * cz;
    if (heroMove(moveId) && tc > 0.3) {
      const side = dx * cz - dz * cx, s = side > 0 ? 1 : side < 0 ? -1 : sgn, k = (tc - 0.3) / 0.7 * COMBAT.lensCut;
      bx = dx * (1 - k) + cz * s * k; bz = dz * (1 - k) - cx * s * k;
      const bl = Math.hypot(bx, bz) || 1; bx /= bl; bz /= bl;
    }
    if (air) {                                                 // juggle: every hit re-pops the body and re-plans its tumble
      const ceil = Math.min(1, Math.max(0.25, 1 - (c.y[i] - COMBAT.juggleY) / 1.2));   // pops weaken above juggleY
      const vy = Math.max(c.vy[i], (lift ? lift * 0.8 : 4.2) * ceil);
      airborne(i, vy, Math.max(1.2, force * 0.5), dx, dz, floaty[i] || kb === 'launch', 0.6, c.spinV[i] * 0.6 + sgn * 1.5);
    } else if (downed && (kb === 'flinch' || kb === 'push')) { // hit on the ground: bounce the body, it stays lying
      airborne(i, COMBAT.otgLift, force * 0.4, dx, dz, false, 0, sgn * 2);
    } else if (kb === 'armor') {                             // no reaction (the tint and hitstop still land)
    } else if (kb === 'flinch') {
      c.st[i] = ST.HURT; c.stT[i] = 0;
      c.yaw[i] = Math.atan2(-dx, -dz);                         // face the blow: the recoil reads along the hit
      c.vx[i] = dx * force * COMBAT.flinchKick; c.vz[i] = dz * force * COMBAT.flinchKick;
    } else if (kb === 'push' && !officer) {                    // quick knockdown: lifted off the feet, lands lying
      c.yaw[i] = Math.atan2(-dx, -dz);
      airborne(i, COMBAT.knockLift, force * COMBAT.knockK, dx, dz, false, 1.2, 0);
    } else if (kb === 'push') {                                // officers stagger standing
      c.yaw[i] = Math.atan2(-dx, -dz);
      c.st[i] = ST.KNOCK; c.stT[i] = 0;
      c.vx[i] = dx * force; c.vz[i] = dz * force;
    } else if (kb === 'launch') {                              // straight up with an apex hang, lands on its back
      const vy = (lift || 9) * (0.94 + 0.12 * var01);
      // most flip onto their backs by the apex; about a quarter somersault on over and land face down
      const turn = hash01(i, 29) < 0.25 ? 1.2 + Math.PI : 1.2, early = 0.4 + 0.35 * hash01(i, 5);
      if (hit.shape !== 'circle') {                            // arcs/thrusts gather the victims into one pile in front
        const T = flightFrames(c.y[i], vy, true) * DT;
        const gx = ox + Math.sin(yaw) * COMBAT.pileAhead - c.x[i], gz = oz + Math.cos(yaw) * COMBAT.pileAhead - c.z[i];
        const gl = Math.hypot(gx, gz) || 1, v = Math.min(COMBAT.pileMaxV, gl * COMBAT.pileGather / T);
        airborne(i, vy, v, gx / gl, gz / gl, true, turn, sgn * (0.8 + 1.6 * var01), early);
      } else airborne(i, vy, Math.min(force, COMBAT.launchMaxV), dx, dz, true, turn, sgn * (0.8 + 1.6 * var01), early);
    } else if (kb === 'spin') {                                // spin-fall: whirls about the vertical and collapses
      airborne(i, lift || 3, force, bx, bz, false, 1.2, sgn * (15 + 5 * var01));
    } else {
      if (koThrow && !hit.heavy) {                             // KO throw: blasted out, cartwheels, lands lying
        const flips = hash01(i, 37) < COMBAT.koFlip2 ? 2 * Math.PI : Math.PI;
        airborne(i, lift * (0.94 + 0.12 * var01), force * (0.92 + 0.16 * hash01(i, 41)), bx, bz, false, 1.2 + flips, sgn * (3 + 3 * var01));
      } else {                                                 // blow-away: low throw, heavy ones cartwheel
        const flips = hit.heavy ? (var01 < 0.35 ? 2 * Math.PI : Math.PI) : 0;
        const k = hit.heavy && heroMove(moveId) ? COMBAT.heavyBlow : [1, 1];   // slower and higher: the tumble stays on screen
        airborne(i, (lift || 4) * k[1], force * k[0], bx, bz, false, 1.2 + flips, sgn * (hit.heavy ? 4 + 4 * var01 : 2.5));
      }
    }
    if (moveId === 'npc') {                                    // an actor's blow (npcStrike): no hero credit
      Object.assign(clashPayload, { x: c.x[i], y: c.y[i] + 1.1, z: c.z[i], dx, dz, killed });
      if (killed) { if (i < c.N) c.allyKos++; else c.allyLost++; }
      emit('clash', clashPayload);
      return;
    }
    reward(killed);
    emit('hit', { i, x: c.x[i], y: c.y[i] + 1.1, z: c.z[i], dx, dz, move: moveId, killed, officer, heavy: !!hit.heavy });
    if (killed) {
      h.kos++;
      emit('ko', { i, x: c.x[i], y: c.y[i] + 0.9, z: c.z[i], dx, dz, officer });
    }
  }

  /** Hero rewards for one hit: combo, and Musou gauge (+ a KO bonus) outside the Musou. */
  function reward(killed) {
    const h = game.hero;
    h.combo++; h.comboT = COMBAT.comboWindow;
    if (h.state !== 'musou') h.musou = Math.min(h.musouMax, h.musou + COMBAT.musouPerHit + (killed ? COMBAT.musouPerKO : 0));
  }

  /** Soldier a's duel blow lands on soldier v (crowd indices, either side) for dmg: a flinch facing the blow, or a KO
   *  throw (blasted ≈ 2 m out, cartwheels, lands lying). Returns true on the KO. */
  cb.clash = (a, v, dmg) => {
    const c = game.crowd;
    let dx = c.x[v] - c.x[a], dz = c.z[v] - c.z[a];
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    c.hp[v] -= dmg; c.flash[v] = COMBAT.tintFrames; c.hitHeavy[v] = 0; c.hs[v] = 2;
    const killed = c.hp[v] <= 0 && !c.kod[v];
    if (killed) {
      c.kod[v] = 1;
      const sgn = hash01(v, 71) < 0.5 ? -1 : 1;
      airborne(v, COMBAT.koLift * 0.75, COMBAT.koForce * 0.45, dx, dz, false, 1.2 + Math.PI, sgn * 3);
    } else if (c.st[v] <= ST.KNOCK) {                          // standing (a body already down just takes the damage)
      c.st[v] = ST.HURT; c.stT[v] = 0;
      c.yaw[v] = Math.atan2(-dx, -dz);
      c.vx[v] = dx * 2 * COMBAT.flinchKick; c.vz[v] = dz * 2 * COMBAT.flinchKick;
    }
    Object.assign(clashPayload, { x: c.x[v], y: c.y[v] + 1.1, z: c.z[v], dx, dz, killed });
    emit('clash', clashPayload);
    return killed;
  };

  /** Hero hitboxes for the current move frame. */
  function heroAttacks() {
    const h = game.hero;
    if (h.state !== 'attack' || game.hitstop > 0) return;
    const tick = h.moveSeq * 1000 + h.moveT;
    if (tick === lastTick) return;
    lastTick = tick;
    const m = h.kit.moves[h.move];
    for (let w = 0; w < m.hits.length; w++) {
      const hit = m.hits[w];
      const t = h.moveT;
      if (t < hit.f[0] || t > hit.f[1]) continue;
      if (t === hit.f[0]) emit('attack:swing', { move: h.move, win: w, yaw: h.yaw, heavy: !!hit.heavy });
      const rel = t - hit.f[0];
      if (hit.proj) { if (hit.every ? rel % hit.every === 0 : !rel) game.musou.wave?.(hit, h.move); continue; }   // waves (header)
      // combo-system r4: a `sweep` window (moves.js) resolves in swing order — the sector grows from the start side over
      // sweepN frames, so victims fall with the blade and the chain ticks +1…+4 per frame instead of all on one frame
      if (hit.sweep) {
        const n = hit.sweepN || hit.f[1] - hit.f[0] + 1, ang = hit.shape === 'circle' ? 360 : hit.ang;
        if (rel >= n) continue;
        const span = ang * (rel + 1) / n, dir = (hit.dir || 0) - hit.sweep * (ang - span) / 2;
        cb.strike({ ...hit, shape: 'arc', ang: span, dir }, h.x, h.z, h.yaw, h.moveSeq * 16 + w, false, h.move);
        continue;
      }
      if (hit.every && rel % hit.every !== 0) continue;
      cb.strike(hit, h.x, h.z, h.yaw, h.moveSeq * 16 + w, !!hit.every, h.move);
    }
  }

  function land(i, bounce) {
    const c = game.crowd;
    Object.assign(landPayload, { x: c.x[i], z: c.z[i], bounce });
    emit('enemy:land', landPayload);
  }

  /** Reaction physics for launched / knocked / downed enemies. */
  function reactions() {
    const c = game.crowd;
    if (game.freeze > 0) return;
    for (let i = 0; i < c.T; i++) {
      const s = c.st[i];
      if (s < ST.HURT || s > ST.DEAD || c.hs[i] > 0) continue;
      if (s === ST.HURT) {
        c.x[i] += c.vx[i] * DT; c.z[i] += c.vz[i] * DT; c.vx[i] *= COMBAT.flinchDamp; c.vz[i] *= COMBAT.flinchDamp;
        if (c.stT[i] >= COMBAT.hurtFrames) { c.st[i] = ST.GUARD; c.stT[i] = 0; }
      } else if (s === ST.KNOCK) {
        c.x[i] += c.vx[i] * DT; c.z[i] += c.vz[i] * DT; c.vx[i] *= COMBAT.groundFriction; c.vz[i] *= COMBAT.groundFriction;
        if (c.stT[i] >= 22) { c.st[i] = ST.GUARD; c.stT[i] = 0; }
      } else if (s === ST.AIR) {
        const float = floaty[i] && !c.bounce[i] && Math.abs(c.vy[i]) < COMBAT.floatV;
        c.vy[i] -= (float ? COMBAT.gravity * COMBAT.floatK : COMBAT.gravity) * DT;
        c.x[i] += c.vx[i] * DT; c.y[i] += c.vy[i] * DT; c.z[i] += c.vz[i] * DT;
        c.yaw[i] += c.spinV[i] * DT;
        c.vx[i] *= COMBAT.airDrag; c.vz[i] *= COMBAT.airDrag;
        if (c.bounce[i]) settle(i, 0.3);                        // rebound: flatten out onto the ground
        else c.rx[i] = Math.max(rxEnd[i], c.rx[i] + c.rxV[i] * DT);   // rotation is always backward (rxV ≤ 0)
        if (c.y[i] <= 0 && c.vy[i] < 0) {
          const v = -c.vy[i];
          c.y[i] = 0;
          c.rx[i] = wrap(c.rx[i]);                              // same pose, unwound
          if (v > COMBAT.bounceMin && !c.bounce[i]) {
            c.bounce[i] = 1; c.vy[i] = Math.min(COMBAT.bounceMax, v * COMBAT.bounceK);
            c.vx[i] *= 0.5; c.vz[i] *= 0.5; c.spinV[i] *= 0.3;
            land(i, true);
          } else {
            c.st[i] = c.hp[i] <= 0 ? ST.DEAD : ST.DOWN; c.stT[i] = 0;
            c.rxV[i] = 0; c.spinV[i] = 0; c.vy[i] = 0; c.vx[i] *= 0.4; c.vz[i] *= 0.4;
            land(i, false);
          }
        }
      } else if (s === ST.DOWN || s === ST.DEAD) {
        c.x[i] += c.vx[i] * DT; c.z[i] += c.vz[i] * DT; c.vx[i] *= 0.8; c.vz[i] *= 0.8;
        settle(i, 0.35);
        if (s === ST.DOWN && c.stT[i] >= COMBAT.downFrames) { c.st[i] = ST.GETUP; c.stT[i] = 0; }
      } else if (s === ST.GETUP) {
        const u = Math.min(1, c.stT[i] / COMBAT.getupFrames);
        c.rx[i] = (c.rx[i] < 0 ? -HALF_PI : HALF_PI) * (1 - u * u * (3 - 2 * u));
        if (c.stT[i] >= COMBAT.getupFrames) { c.st[i] = ST.GUARD; c.stT[i] = 0; c.rx[i] = 0; }
      }
      // grounded-with-KO: anyone whose hp ran out while staggering collapses where they stand
      if ((c.st[i] === ST.HURT || c.st[i] === ST.KNOCK) && c.hp[i] <= 0) airborne(i, 1.5, 0, 0, 0, false, 1.2, 0);
    }
  }

  /** Ease a grounded / rebounding body to the nearest lying angle (on its back or face down). */
  function settle(i, k) {
    const c = game.crowd;
    c.rx[i] += ((c.rx[i] < 0 ? -HALF_PI : HALF_PI) - c.rx[i]) * k;
  }

  /** An enemy's real (non-feint) strike reaches its active frame (called by crowd AI, which emits enemy:attack). */
  cb.enemyStrike = (i) => {
    const c = game.crowd, h = game.hero;
    const officer = c.type[i] === 1;
    const dx = h.x - c.x[i], dz = h.z - c.z[i], d = Math.hypot(dx, dz);
    if (d > (officer ? 2.3 : 1.9) || h.y > 1.2) return;
    if (Math.abs(wrap(Math.atan2(dx, dz) - c.yaw[i])) > 1.1) return;
    h.hurt(Math.round((officer ? 22 : 10) * game.diff.dmg), c.x[i], c.z[i], officer);
  };

  cb.step = () => {
    heroAttacks();
    reactions();
  };
  return cb;
}
