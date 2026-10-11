// The battle's two armies (sim): the foe army and its allies (game.army = { foe, ally }, crowd/armies.js — the sim
// only reads names / looks from it; colours are the view's). Struct-of-arrays for every soldier.
//  · Squads: the army stands in rectangular blocks led by a standard-bearer and a captain. A director keeps
//    ~CROWD.engaged soldiers on the hero: only free soldiers standing in the ring count (+ a third of every block en
//    route), so a sweep releases the next block at once. It sends the nearest block marching in formation (it wheels
//    to face him), halts it for a beat, then it charges and folds into the ring.
//  · Ring: engaged soldiers hold an inner ring (1-1.5 H, 14-18 of them in 16 angular slots, 360° incl. the camera
//    side), a second row (2-3 H, 20-30, clear of the lens) or an outer crowd on the far side of the hero as the camera
//    sees it. Every 0.1 s a ring manager refills each row's whole deficit at once (an empty inner slot takes the
//    soldier nearest to it), so the ring re-closes within ~1-2 s of a sweep. CROWD.tokens soldiers step in to
//    attack (tokens favour soldiers the camera can see, off the line the hero swings along). Up to
//    game.diff.strikers of them (core/difficulty.js) wind up at once; starts are jittered (CROWD.strikeGap, officers at half the gap), each
//    telegraphed by a 0.67 s wind-up, and every start makes the 3-5 guards nearest the striker raise their weapons,
//    shout and surge half a step in with him (c.raiseF). Posture over pressure: once a blow lands, the next
//    2.5-4 s of strikes are feints (c.feint: full wind-up, the blow stops short of him), so the ring keeps
//    threatening while only about one blow in 4-6 s connects. A flinch still cancels a wind-up.
//  · Reinforcements: while the ring is under strength and no block waits nearer, a column of 8-15 (with its bearer)
//    spawns 16-26 m out in front of the camera and runs in; `crowd:wave` announces it. Waves only run once a scenario
//    spawned an army or a ring (setWaves).
//  · Story API (src/story drives it): spawnSquad, spawnOfficer, setWaves, retire, spawnAllies, setAllies — see
//    below. Officers carry a name (c.offName[i - grunts] = {zh, en}, shown by the HUD tags), a look (c.offLook[i - grunts]:
//    null = the army's officer, else armies.js look — the view draws it) and a boss flag (c.boss[i]). Free mode fields
//    the foe army's named officers (game.army.foe.officers, slot order); so does a trial beat's `army`.
//  · Allies (the ally army, e.g. 蜀): the same arrays past the foe army, indices N … T-1 (N = foe grunts + officer slots). Everything that
//    loops i < N (hero hits, arrows, Musou, lock-on, HUD tags, the director, rings, tokens) never sees them; the AI loop,
//    separate(), combat reactions() and the view run to T. An ally keeps pace with the hero in a slot 7.5-11.5 m off
//    him, 35-80° off the front on either side (the front = the camera yaw, eased: in view, beside the fight), takes the
//    road (map.js routeS / routeAt) when he is far ahead or a palisade / pool / cliff is in the way, and pairs with a
//    foe grunt 7-20 m from the hero (never the hero's ring, never across him): c.foe links the two, both square up at
//    arm's length and trade blows (duel(): the strike timings / poses of a blow on the hero, no telegraph; combat.clash
//    lands it). A foe soldier the hero comes within CROWD.duelBreak of is released to the ring. Columns of 5-8 run up
//    the road behind the hero while the allies are under strength (`crowd:allies`); they cheer when he sweeps a ring
//    (≥ 10 KOs in 1 s) or fells an officer.
// Reaction states (HURT..GETUP) are driven by src/combat; this module owns the rest.
import { rng, hash01 } from '../core/rng.js';
import { emit, on } from '../core/events.js';
import { clampWalk, routeS, routeAt, MAP } from '../world/map.js';

export const ST = { OFF: 0, IDLE: 1, ADVANCE: 2, GUARD: 3, ATTACK: 4, HURT: 5, KNOCK: 6, AIR: 7, DOWN: 8, GETUP: 9, DEAD: 10 };
const isReacting = (s) => s >= ST.HURT && s <= ST.GETUP;
export const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
/** Visual/role kind (type stays 0 grunt / 1 officer for combat). */
export const KIND = { SPEAR: 0, SWORD: 1, CAPTAIN: 2, BEARER: 3, OFFICER: 4 };
const SQ_HOLD = 1, SQ_MARCH = 2, SQ_HALT = 3, SQ_CHARGE = 4;

export const CROWD = {
  officers: 4,                  // officers the free-mode army fields (and brings back with the waves)
  officerSlots: 6,              // officer slots (indices grunts … N-1); the story may field up to this many at once
  walk: 2.4, run: 4.8, march: 3.0, charge: 5.0, turn: 7,
  radius: 0.48, heroR: 0.8,
  bands: [[1.9, 2.8], [3.4, 5.6], [6.5, 10]], share: [0.4, 0.85], bandMin: [14, 20], bandMax: [18, 30],   // inner ring, second row, outer
  aggro: 9, officerAggro: 16,
  tokens: 3, attackRange: 1.7,                               // ≤ 3 committed step in (how many wind up at once: game.diff.strikers)
  strikeGap: [[40, 90], [30, 80]],                            // next start after 40-90 sf (hero calm) / 30-80 (he attacks)
  grace: [150, 240], rally: [3, 5], rallyTime: 44,             // feints for 2.5-4 s after a blow lands; guards raising
  windup: 40, strike: 40, recover: 24, cooldown: [110, 260], officerCd: [40, 90],  // duel blow lands 0.67 s after wind-up
                                                              // starts; blows on the hero: game.diff.windup
  hp: 30, captainHp: 80, officerHp: 520,
  deadTime: 210,
  engaged: 84, transit: 72,                                   // director target: soldiers on the hero; cap on blocks en route
  halt: 15, haltFrames: 36, fold: 7.5,                        // squad: halt at 15 m, then charge, fold at 7.5 m
  wave: [8, 15], waveEvery: [45, 110], waveDist: [16, 26],   // columns every 0.75 s below half strength, else 1.8 s
  allySlots: 40, allyKeep: 24, allyCol: [5, 8], allyEvery: 1200, allyHp: 50,   // allies: a column every 20 s while below 24
  allyScan: 12, allyReach: [7, 20], duelBreak: 4.5, duelR: 1.5,              // foe ≤ 12 m off the ally, 7-20 m off the hero
  duelCd: [50, 150], duelHit: 0.55, duelDmg: [[7, 11], [5, 8]],              // blow lands 55 %: ally → foe 7-11, foe → ally 5-8
};
const DT = 1 / 60;
const CELL = 1.2, GRID = 400, HALF = GRID * CELL / 2;           // ±240 m: every map fits within ±230 m (world/maps)
const MAXSQ = 64;

export function createCrowd(game, grunts) {
  const N = grunts + CROWD.officerSlots, T = N + CROWD.allySlots;
  const F = (n = T) => new Float64Array(n), I = (n = T) => new Int32Array(n);
  const c = {
    N, T, grunts,
    x: F(), z: F(), y: F(), vx: F(), vz: F(), vy: F(), yaw: F(), hp: F(), hpMax: F(),
    st: I(), stT: I(), type: I(), kind: I(), token: I(), cd: I(), hs: I(), flash: I(),
    rx: F(), rxV: F(), spinV: F(), pref: F(), band: I(), phase: F(), bounce: I(),
    lastHit: I(), strafe: F(), kod: I(), tokT: I(), ang: F(), seated: I(),
    squad: I(), slotX: F(), slotZ: F(), form: I(),
    sq: { x: F(MAXSQ), z: F(MAXSQ), face: F(MAXSQ), st: I(MAXSQ), t: I(MAXSQ), n: 0 },
    raiseF: I(), feint: I(), wind: I(),                         // raiseF: rallying until (render + ring surge); feint strike; winding up
    hitHeavy: I(),                                              // last hit was heavy (set by combat, read by view.js hitGlow)
    foe: I(),                                                   // duel partner (ally ↔ foe grunt), -1 = none
    via: I(),                                                   // ally: sf left on the road (the straight line was blocked)
    boss: I(), offName: new Array(CROWD.officerSlots).fill(null),   // story: boss flag; officer display names {zh, en}
    offLook: new Array(CROWD.officerSlots).fill(null),              // officer looks (armies.js), null = the army's officer
    waveT: 0, tokensUsed: 0, strikeF: 0, gap: 0, graceF: 0, heroHp: 0, wavesOn: false, armyOn: false, engaged: 0, zMax: Infinity,   // zMax: story stage bound (waves); armyOn: spawnArmy fielded the free army
    alliesOn: false, allyT: 0, front: 0, kosAgo: [0, 0], cheerF: 0, allyKos: 0, allyLost: 0,   // allyKos / allyLost: duel KOs
  };
  const head = new Int32Array(GRID * GRID), next = new Int32Array(T);
  const px = new Float64Array(T), pz = new Float64Array(T), sqAlive = new Int32Array(MAXSQ);
  let holdNear = false;

  function place(i, x, z, engaged, kind) {
    const off = i >= grunts && i < N;
    if (off) kind = KIND.OFFICER;
    [x, z] = clampWalk(x, z, -0.5);
    c.x[i] = x; c.z[i] = z; c.y[i] = 0; c.vx[i] = c.vz[i] = c.vy[i] = 0;
    c.yaw[i] = Math.atan2(game.hero.x - x, game.hero.z - z);
    c.type[i] = off ? 1 : 0; c.kind[i] = kind;
    c.hpMax[i] = c.hp[i] = i >= N ? CROWD.allyHp : off ? CROWD.officerHp * game.diff.officerHp : (kind === KIND.CAPTAIN ? CROWD.captainHp : CROWD.hp) * game.diff.gruntHp;
    c.st[i] = engaged ? ST.ADVANCE : ST.IDLE; c.stT[i] = rng.int(0, 60);
    c.token[i] = 0; c.cd[i] = rng.int(0, 120); c.hs[i] = 0; c.flash[i] = 0; c.raiseF[i] = 0; c.feint[i] = 0; c.wind[i] = 0;
    c.rx[i] = c.rxV[i] = c.spinV[i] = 0; c.bounce[i] = 0; c.lastHit[i] = -1; c.kod[i] = 0; c.boss[i] = 0;
    const r = rng.next();
    if (kind === KIND.BEARER) { c.band[i] = 2; c.pref[i] = rng.range(7, 11); }
    else setBand(i, off ? 0 : r < CROWD.share[0] ? 0 : r < CROWD.share[1] ? 1 : 2);
    c.phase[i] = rng.range(0, 6.28);
    c.strafe[i] = rng.chance(0.5) ? 1 : -1;
    c.squad[i] = -1; c.form[i] = 0; c.foe[i] = -1; c.via[i] = 0;
  }
  /** Free-mode officer in slot i: the foe army's named officer for that slot (name + look). */
  function freeOfficer(i) {
    const list = game.army.foe.officers, o = list[(i - grunts) % list.length];
    c.offName[i - grunts] = o; c.offLook[i - grunts] = o.look || null;
  }
  function setBand(i, k) { c.band[i] = k; c.pref[i] = rng.range(CROWD.bands[k][0], CROWD.bands[k][1]); c.seated[i] = 0; }

  c.reset = () => {
    c.offName.fill(null); c.offLook.fill(null);
    c.st.fill(ST.OFF); c.token.fill(0); c.tokensUsed = 0; c.strikeF = 0; c.gap = 0; c.graceF = 0; c.heroHp = game.hero.hp; c.waveT = 0; c.sq.n = 0; c.wavesOn = c.armyOn = false; c.zMax = Infinity;
    c.foe.fill(-1); Object.assign(c, { alliesOn: false, allyT: 0, front: game.cam.yaw, kosAgo: [0, 0], cheerF: 0, allyKos: 0, allyLost: 0 });
  };

  function freeSlots(officer, ally) {
    const out = [];
    const [a, b] = ally ? [N, T] : officer ? [grunts, N] : [0, grunts];
    for (let i = a; i < b; i++) if (c.st[i] === ST.OFF) out.push(i);
    return out;
  }

  /** New squad at (sx, sz) facing `face`; members fill a block `cols` wide, 1.15 m apart; bearer ahead, captain on
   *  the front-left. Does nothing when the table is full (returns the squad id, or -1). */
  function makeSquad(slots, sx, sz, face, cols, st) {
    let q = -1;
    for (let k = 0; k < c.sq.n; k++) if (!c.sq.st[k]) { q = k; break; }
    if (q < 0) { if (c.sq.n >= MAXSQ) return -1; q = c.sq.n++; }
    c.sq.x[q] = sx; c.sq.z[q] = sz; c.sq.face[q] = face; c.sq.st[q] = st; c.sq.t[q] = 0;
    const sn = Math.sin(face), cs = Math.cos(face);
    const rows = Math.ceil((slots.length - 1) / cols);
    slots.forEach((i, k) => {
      let lx, lz, kind;
      if (k === 0) { lx = 0; lz = 1.5; kind = KIND.BEARER; }
      else {
        const m = k - 1, r = Math.floor(m / cols), q2 = m % cols;
        lx = (q2 - (cols - 1) / 2) * 1.15 + rng.range(-0.12, 0.12); lz = -r * 1.15 + rng.range(-0.12, 0.12) + (rows - 1) * 0.3;
        const g = m ? rng.next() : 0;
        kind = !m ? KIND.CAPTAIN : g >= 0.05 && g < 0.42 ? KIND.SWORD : KIND.SPEAR;
      }
      place(i, sx + lx * cs + lz * sn, sz - lx * sn + lz * cs, false, kind);
      c.squad[i] = q; c.slotX[i] = lx; c.slotZ[i] = lz; c.form[i] = 1;
      c.yaw[i] = face;
      if (st !== SQ_HOLD) c.st[i] = ST.ADVANCE;
    });
    return q;
  }

  /** Squads spread over the field around the free-mode arena centre (the map's spawn.free): the default army layout.
   *  One big block waits in front of the camera (the way forward), most other squads stand on that side too, a few
   *  flank and close the rear. */
  c.spawnArmy = () => {
    c.wavesOn = c.armyOn = true;
    const slots = freeSlots(false);
    const fwd = game.cam.yaw, { x: ox, z: oz } = MAP.spawn.free;
    let k = 0, n = 0;
    while (k < slots.length) {
      const big = n === 0 && slots.length >= 120;
      const size = Math.min(slots.length - k, big ? rng.int(50, 60) : rng.int(18, 30));
      const a = big ? fwd + rng.range(-0.25, 0.25) : n % 3 === 2 ? fwd + Math.PI + rng.range(-1.4, 1.4) : fwd + rng.range(-1.8, 1.8);
      const d = big ? rng.range(24, 28) : rng.range(11, 34);
      const sx = ox + Math.sin(a) * d, sz = clampWalk(sx, oz + Math.cos(a) * d, 3)[1];
      const face = Math.atan2(ox - sx, oz - sz);
      makeSquad(slots.slice(k, k + size), sx, sz, face, big ? 10 : Math.max(4, Math.round(Math.sqrt(size * 1.6))), SQ_HOLD);
      k += size; n++;
    }
    for (const i of freeSlots(true)) {
      if (i >= grunts + CROWD.officers) break;
      const a = rng.range(0, Math.PI * 2), d = rng.range(12, 30);
      place(i, ox + Math.cos(a) * d, oz + Math.sin(a) * d, false);
      freeOfficer(i);
    }
  };

  // ---- story API (sim: call from story.step / story.reset only). All positions go through clampWalk.
  /** A block of n grunts (standard-bearer + captain + rank and file) at (x, z) facing `face` (default: toward the
   *  hero). hold (default): waits until the director sends it or the hero walks into it; charge: runs straight in.
   *  Fields what is free if fewer than n grunt slots are OFF. Returns the squad id, or -1 (no free slot / squad table full). */
  c.spawnSquad = ({ x, z, n = 20, face, cols, charge = false }) => {
    const slots = freeSlots(false).slice(0, n);
    if (!slots.length) return -1;
    [x, z] = clampWalk(x, z, 3);
    return makeSquad(slots, x, z, face ?? Math.atan2(game.hero.x - x, game.hero.z - z), cols || Math.max(3, Math.round(Math.sqrt(slots.length * 1.6))), charge ? SQ_CHARGE : SQ_HOLD);
  };
  /** A named officer at (x, z): name {zh, en} (HUD tag / target bar / KO banner), hp (default CROWD.officerHp), boss
   *  (flag for the story / HUD), engaged: start closing in at once (else he waits until the hero comes within
   *  CROWD.officerAggro), look (armies.js officer look; default: the army's officer). Returns his soldier index, or -1
   *  when every officer slot is taken. */
  c.spawnOfficer = ({ x, z, name, hp = CROWD.officerHp, boss = false, engaged = false, look = null }) => {
    const i = freeSlots(true)[0];
    if (i === undefined) return -1;
    place(i, x, z, engaged);
    c.hp[i] = c.hpMax[i] = hp * game.diff.officerHp; c.boss[i] = boss ? 1 : 0;
    c.offName[i - grunts] = name; c.offLook[i - grunts] = look;
    return i;
  };
  /** Reinforcement columns on/off (they run while the ring is under strength, see waves()). */
  c.setWaves = (on) => { c.wavesOn = !!on; };
  /** Stage change: grunts still standing idle (holding blocks never sent) south of z are removed, freeing their slots
   *  for the next area; soldiers already on the move keep coming. A squad left empty is freed by squads(). */
  c.retire = (z) => { for (let i = 0; i < grunts; i++) if (c.st[i] === ST.IDLE && c.z[i] < z) c.st[i] = ST.OFF; };
  /** Allies: a block of n (what is free of CROWD.allySlots) at (x, z) facing `face`, `cols` wide, 1.25 × 1.45 m apart,
   *  a standard-bearer every 9th. hold: stand in rank (the story van) until the hero has marched past; else they
   *  fall in with him at once. */
  c.spawnAllies = ({ x, z, n, face = 0, cols = 4, hold = false }) => {
    const sn = Math.sin(face), cs = Math.cos(face);
    freeSlots(false, true).slice(0, n).forEach((i, k) => {
      const lx = (k % cols - (cols - 1) / 2) * 1.25 + rng.range(-0.12, 0.12), lz = -Math.floor(k / cols) * 1.45 + rng.range(-0.12, 0.12);
      place(i, x + lx * cs + lz * sn, z - lx * sn + lz * cs, !hold, k % 9 === 0 ? KIND.BEARER : rng.chance(0.35) ? KIND.SWORD : KIND.SPEAR);
      c.yaw[i] = face; c.form[i] = hold ? 1 : 0; c.band[i] = 1;
    });
  };
  /** Ally reinforcement columns on/off (they run up the road while the allies are under strength, see allyColumns()). */
  c.setAllies = (on) => { c.alliesOn = !!on; };

  /** Nearest alive enemy within maxR whose bearing is within `cone` radians of `yaw`. */
  c.nearest = (x, z, maxR, yaw, cone) => {
    let best = -1, bd = maxR * maxR;
    for (let i = 0; i < N; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD) continue;
      const dx = c.x[i] - x, dz = c.z[i] - z, d2 = dx * dx + dz * dz;
      if (d2 >= bd) continue;
      if (Math.abs(wrap(Math.atan2(dx, dz) - yaw)) > cone) continue;
      bd = d2; best = i;
    }
    return best;
  };

  function releaseToken(i) { if (c.token[i]) { c.token[i] = 0; c.tokensUsed--; } }
  c.releaseToken = releaseToken;

  function setSt(i, s) { c.st[i] = s; c.stT[i] = 0; }

  c.step = () => {
    const h = game.hero, frozen = game.freeze > 0;
    if (game.freeze > 0) game.freeze--;
    if (!frozen) squads(h);
    // a blow landed: the next strikes are feints for a while (the ring threatens, the hero keeps fighting)
    if (h.hp < c.heroHp) c.graceF = game.frame + Math.round(rng.int(CROWD.grace[0], CROWD.grace[1]) * game.diff.grace);
    c.heroHp = h.hp;
    let strikers = 0;
    for (let i = 0; i < N; i++) if (c.st[i] === ST.ATTACK && c.stT[i] < game.diff.windup && c.foe[i] < 0) strikers++;
    const busy = h.state === 'attack';
    c.front += wrap(game.cam.yaw - c.front) * 0.01;                 // allies' front: the view direction, eased (≈ 1.7 s)
    // ---- AI (foe army, then the allies)
    for (let i = 0; i < T; i++) {
      const s = c.st[i];
      if (s === ST.OFF) continue;
      if (c.flash[i] > 0) c.flash[i]--;
      if (c.hs[i] > 0) { c.hs[i]--; continue; }
      if (frozen) continue;
      c.stT[i]++;
      if (s === ST.DEAD) {
        if (c.stT[i] > CROWD.deadTime) { c.st[i] = ST.OFF; releaseToken(i); }
        continue;
      }
      if (isReacting(s)) {
        if (c.wind[i]) { c.wind[i] = 0; c.strikeF = Math.min(c.strikeF, game.frame - c.gap + 20); }   // swing knocked out of him: next one soon
        releaseToken(i); c.form[i] = 0; continue;
      }
      if (c.cd[i] > 0) c.cd[i]--;
      const dx = h.x - c.x[i], dz = h.z - c.z[i], d = Math.hypot(dx, dz) || 1e-6;
      const face = Math.atan2(dx, dz);
      let vx = 0, vz = 0;
      if ((c.foe[i] >= 0 && duel(i, h)) || (i >= N && ally(i, h))) { vx = mvx; vz = mvz; }
      else if (c.form[i]) {
        // in formation: hold / march to the squad slot, facing the squad's heading
        const q = c.squad[i], f = c.sq.face[q], sn = Math.sin(f), cs = Math.cos(f);
        const tx = c.sq.x[q] + c.slotX[i] * cs + c.slotZ[i] * sn, tz = c.sq.z[q] - c.slotX[i] * sn + c.slotZ[i] * cs;
        const ex = tx - c.x[i], ez = tz - c.z[i], e = Math.hypot(ex, ez);
        const cap = c.sq.st[q] === SQ_CHARGE ? CROWD.charge * 1.15 : CROWD.run;
        if (e > 0.06) { const sp = Math.min(cap, e * 4); vx = ex / e * sp; vz = ez / e * sp; }
        turn(i, f, 3);
        if (s === ST.IDLE && c.sq.st[q] > SQ_HOLD) setSt(i, ST.ADVANCE);  // the block got its orders
        else if (s === ST.IDLE && d < (c.type[i] ? CROWD.officerAggro : CROWD.aggro)) c.sq.st[q] = SQ_CHARGE;   // hero walked into the block: it charges
      } else if (s === ST.IDLE) {
        if (d < (c.type[i] ? CROWD.officerAggro : CROWD.aggro)) setSt(i, ST.ADVANCE);
        turn(i, face, 1.5);
      } else if (s === ST.ATTACK) {
        const t = c.stT[i], W = game.diff.windup;                      // the telegraph: blow lands W sf after wind-up start
        turn(i, face, t < W - 8 ? CROWD.turn : 0);
        if (t === W) {
          c.wind[i] = 0;
          emit('enemy:attack', { x: c.x[i], z: c.z[i], officer: c.type[i] === 1 });
          if (!c.feint[i]) game.combat.enemyStrike(i);                 // a feint swings at the air
        }
        // creep into reach (a feint stops a pace short: the blow cuts the air in front of him)
        const reach = c.feint[i] ? 2.45 : CROWD.attackRange - 0.2;
        if (t < W - 6 && d > reach) { vx = dx / d * CROWD.walk; vz = dz / d * CROWD.walk; }
        else if (c.feint[i] && t < W + 8 && d < reach - 0.3) { vx = -dx / d * 1.2; vz = -dz / d * 1.2; }
        if (t >= W + CROWD.recover) {
          const cd = c.type[i] ? CROWD.officerCd : CROWD.cooldown;
          setSt(i, ST.GUARD); releaseToken(i); c.cd[i] = rng.int(cd[0], cd[1]);
        }
      } else if (c.kind[i] === KIND.BEARER) {
        // standard-bearers keep to the far side of the fight as the camera sees it: banners over the crowd, never
        // between the camera and the hero; each keeps his own bearing (golden-ratio spread over ±1.3 rad) so several
        // banners stand apart over the crowd instead of bunching
        const a = game.cam.yaw + c.strafe[i] * (0.25 + 1.05 * ((i * 0.618034) % 1) + 0.12 * Math.sin(game.frame * 0.004 + i));
        const ex = h.x + Math.sin(a) * c.pref[i] - c.x[i], ez = h.z + Math.cos(a) * c.pref[i] - c.z[i], e = Math.hypot(ex, ez);
        if (e > 0.6) {
          const sp = e > 5 ? CROWD.run : CROWD.walk;
          vx = ex / e * sp; vz = ez / e * sp;
          if (s !== ST.ADVANCE) setSt(i, ST.ADVANCE);
        } else if (s !== ST.GUARD) setSt(i, ST.GUARD);
        turn(i, face, CROWD.turn);
      } else {
        // ADVANCE / GUARD: hold a ring at the preferred distance (with a slow in/out shuffle); token holders close in
        const shuffle = Math.sin(game.frame * 0.021 + c.phase[i] * 3) * 0.4;
        // rallying guards surge half a step in on the striker's beat
        const want = c.token[i] ? CROWD.attackRange * 0.85 : c.pref[i] + shuffle - (game.frame < c.raiseF[i] ? 0.55 : 0);
        let tx = dx, tz = dz, e = d - want;                        // default: straight at the hero
        // a bearing to hold: the inner ring its slot from rings() (360°, camera side included); the outer crowd its
        // own spot on the far side of the hero as the camera sees it (in view, behind the fight)
        let tA = NaN;
        if (!c.token[i]) {
          if (!c.band[i] && c.seated[i] && d < want + 3) tA = c.ang[i];
          else if (c.band[i] === 2 && d < want + 6) tA = game.cam.yaw + c.strafe[i] * (0.15 + 1.35 * ((i * 0.618034) % 1));
        }
        if (tA === tA) {
          // walk round the hero (≤ 0.45 rad per look-ahead) instead of through the fight
          const ra = Math.atan2(-dx, -dz);
          const ta = ra + Math.max(-0.45, Math.min(0.45, wrap(tA - ra)));
          tx = h.x + Math.sin(ta) * want - c.x[i]; tz = h.z + Math.cos(ta) * want - c.z[i]; e = Math.hypot(tx, tz);
        }
        let faceTo = face;
        if (e > 0.35) {
          const sp = e > 1.2 ? CROWD.run : CROWD.walk * (c.type[i] ? 0.9 : 1);   // run to close the ring, walk the last metre
          const tl = Math.hypot(tx, tz) || 1e-6;
          vx = tx / tl * sp; vz = tz / tl * sp;
          if (sp === CROWD.run) faceTo = Math.atan2(vx, vz);        // running round the ring: look where he runs
          if (s !== ST.ADVANCE) setSt(i, ST.ADVANCE);
        } else {
          const fx = Math.sin(game.cam.yaw), fz = Math.cos(game.cam.yaw);
          if (d < want - 0.45) { vx = -dx / d * 1.3; vz = -dz / d * 1.3; }
          else if (c.band[i] && (-dx * fx - dz * fz) / d < (c.band[i] === 2 ? -0.1 : -0.75)) {
            // the outer crowd drifts round to the far side of the hero (in view); the second row only clears the
            // sector right in front of the lens; the inner ring stays 360°
            let tx = dz / d, tz = -dx / d;
            if (tx * fx + tz * fz < 0) { tx = -tx; tz = -tz; }
            vx = tx * 1.5; vz = tz * 1.5;
          } else if (((c.stT[i] + i * 7) % 240) < 70) {           // occasional sidestep around the hero
            vx = -dz / d * 0.9 * c.strafe[i]; vz = dx / d * 0.9 * c.strafe[i];
          }
          if (s !== ST.GUARD) setSt(i, ST.GUARD);
        }
        // token holder within a step of reach swings when the strike clock allows (officers at half the gap); the
        // wind-up closes the last metre
        if (c.token[i] && d <= CROWD.attackRange + 0.9 && c.cd[i] === 0 && !h.y && strikers < game.diff.strikers &&
            h.state !== 'hurt' && game.frame - c.strikeF >= (c.type[i] ? c.gap >> 1 : c.gap)) {
          setSt(i, ST.ATTACK); c.wind[i] = 1; c.feint[i] = game.frame < c.graceF ? 1 : 0; strikers++;
          const g = CROWD.strikeGap[busy ? 1 : 0];
          c.strikeF = game.frame; c.gap = Math.round(rng.int(g[0], g[1]) * game.diff.gap);
          rally(i);
        }
        turn(i, faceTo, CROWD.turn);
      }
      c.vx[i] = vx; c.vz[i] = vz;
      c.x[i] += vx * DT; c.z[i] += vz * DT;
      c.phase[i] += Math.hypot(vx, vz) * DT * 3.2;
    }
    if (!frozen) {
      // a token that doesn't turn into a strike within 3 s goes back to the pool
      for (let i = 0; i < N; i++) if (c.token[i] && c.st[i] !== ST.ATTACK && ++c.tokT[i] > 180) { releaseToken(i); c.cd[i] = 60; }
      if (game.frame % 6 === 0) rings(h);
      grantTokens(h);
      separate(h);
      waves(h);
      allyColumns(h);
      // the hero swept a ring (≥ 10 KOs within ≈ 1 s): the allies near him cheer
      if (game.frame % 30 === 0) { if (h.kos - c.kosAgo[1] >= 10) cheer(); c.kosAgo[1] = c.kosAgo[0]; c.kosAgo[0] = h.kos; }
    }
  };
  on('ko', (e) => { if (e.officer) cheer(); });                      // (sim-side: combat emits it inside step())

  // ---- allies + duels. ally() / duel() leave the step's velocity in mvx, mvz.
  let mvx = 0, mvz = 0;
  const alive = (s) => s !== ST.OFF && s !== ST.DEAD;
  /** Straight walk (x0, z0) → (x1, z1) stays on open ground (samples at ¼ ½ ¾; palisades, pools, closed gates, cliffs). */
  function clear(x0, z0, x1, z1) {
    for (let k = 1; k < 4; k++) {
      const x = x0 + (x1 - x0) * k / 4, z = z0 + (z1 - z0) * k / 4, q = clampWalk(x, z, 0);
      if ((q[0] - x) ** 2 + (q[1] - z) ** 2 > 0.01) return false;
    }
    return true;
  }
  function unpair(i) { const f = c.foe[i]; if (f >= 0 && c.foe[f] === i) c.foe[f] = -1; c.foe[i] = -1; }
  /** Duel of i with c.foe[i]: square up at arm's length, circle, trade blows (the wind-up / strike / recover timings
   *  and poses of a blow on the hero, no telegraph); one side swings at a time, nobody hits a man on the ground.
   *  Returns false (unpaired: i falls back to its own AI) once the foe is gone, too far, or the foe side of the pair is
   *  within CROWD.duelBreak of the hero (he is the hero's now) or the ally side over 26 m off him (back to the front). */
  function duel(i, h) {
    const f = c.foe[i], sf = c.st[f], w = i < N ? i : f, a = i < N ? f : i;
    const ex = c.x[f] - c.x[i], ez = c.z[f] - c.z[i], e = Math.hypot(ex, ez) || 1e-6, ux = ex / e, uz = ez / e;
    if (c.foe[f] !== i || !alive(sf) || e > 16 || (c.x[w] - h.x) ** 2 + (c.z[w] - h.z) ** 2 < CROWD.duelBreak ** 2 ||
        (c.x[a] - h.x) ** 2 + (c.z[a] - h.z) ** 2 > 26 * 26) { unpair(i); return false; }   // the ally stays with the front
    const s = c.st[i], R = CROWD.duelR;
    mvx = mvz = 0;
    turn(i, Math.atan2(ex, ez), CROWD.turn);
    if (s === ST.ATTACK) {
      const t = c.stT[i];
      if (t < CROWD.windup - 6 && e > R) { mvx = ux * CROWD.walk; mvz = uz * CROWD.walk; }
      if (t === CROWD.strike && e < R + 0.9 && sf <= ST.KNOCK && rng.chance(CROWD.duelHit)) {
        const d = CROWD.duelDmg[i < N ? 1 : 0];
        if (game.combat.clash(i, f, rng.int(d[0], d[1]))) { if (i < N) c.allyLost++; else c.allyKos++; }
      }
      if (t >= CROWD.windup + CROWD.recover) { setSt(i, ST.GUARD); c.cd[i] = rng.int(CROWD.duelCd[0], CROWD.duelCd[1]); }
      return true;
    }
    if (e > R + 0.35) {
      const sp = e > 3 ? CROWD.run : CROWD.walk;
      mvx = ux * sp; mvz = uz * sp;
      if (s !== ST.ADVANCE) setSt(i, ST.ADVANCE);
    } else {
      if (e < R - 0.35) { mvx = -ux * 1.3; mvz = -uz * 1.3; }
      else if (((c.stT[i] + i * 7) % 200) < 60) { mvx = -uz * 0.8 * c.strafe[i]; mvz = ux * 0.8 * c.strafe[i]; }   // circle
      if (s !== ST.GUARD) setSt(i, ST.GUARD);
      if (c.cd[i] === 0 && sf !== ST.ATTACK && sf < ST.AIR) { setSt(i, ST.ATTACK); c.feint[i] = 0; }
    }
    return true;
  }
  /** Unpaired ally i: the van holds its rank until the hero has marched past; then a flank slot off the hero (bearers
   *  further out); up the road while he is far ahead or the straight line to the slot is blocked (checked every 10 sf,
   *  then 40 sf on the road); picks a foe every 12 sf. Always returns true (mvx, mvz set). */
  function ally(i, h) {
    mvx = mvz = 0;
    const x = c.x[i], z = c.z[i], dh = Math.hypot(h.x - x, h.z - z);
    if (c.form[i]) {
      if (h.z < z - 1 + (i % 4) * 0.8 && dh < 16) return true;
      c.form[i] = 0; setSt(i, ST.ADVANCE);
    }
    const u = hash01(i, 3), a = c.front + (i & 1 ? 1 : -1) * (0.6 + 0.8 * u);   // ahead on the flanks: in view, beside the fight
    const r = (c.kind[i] === KIND.BEARER ? 11 : 7.5) + 4 * hash01(i, 4);
    let tx = h.x + Math.sin(a) * r, tz = Math.min(h.z + Math.cos(a) * r, c.zMax - 1);
    [tx, tz] = clampWalk(tx, tz, 1);                                  // a slot over the river / a cliff: its nearest dry spot
    if (c.via[i] > 0) c.via[i]--;
    else if ((game.frame + i) % 10 === 0 && !clear(x, z, tx, tz)) c.via[i] = 40;
    if (dh > 18 || c.via[i]) {                                       // along the road, never across a cliff / palisade
      const sa = routeS(x, z), sh = routeS(h.x, h.z);
      // ≤ 8 m along the road toward him; level with him: the road just past him (through the gate / crossing he took)
      if (Math.abs(sh - sa) > 12 || c.via[i]) {
        const p = routeAt(Math.abs(sh - sa) < 8 ? sh + 4 : sa + Math.sign(sh - sa) * 8);
        tx = p[0] + (u - 0.5) * 4; tz = p[1];
      }
    }
    const ex = tx - x, ez = tz - z, e = Math.hypot(ex, ez);
    if (e > 0.5 || h.speed > 1) {
      // keep pace with the hero (his velocity) and close on the slot; ≤ 9.5 m/s, so they catch up with his run (8.5)
      mvx = h.vx + ex * 1.6; mvz = h.vz + ez * 1.6;
      const sp = Math.hypot(mvx, mvz) || 1e-6, k = Math.min(1, 9.5 / sp);
      mvx *= k; mvz *= k;
      if (c.st[i] !== ST.ADVANCE) setSt(i, ST.ADVANCE);
      turn(i, Math.atan2(mvx, mvz), CROWD.turn);
    } else {
      if (c.st[i] !== ST.GUARD) setSt(i, ST.GUARD);
      turn(i, c.front, 3);
    }
    if ((game.frame + i) % 12 === 0 && c.kind[i] !== KIND.BEARER) pickFoe(i, h);
    return true;
  }
  /** Nearest foe grunt for ally i: free (not in a duel, no attack token, not mid-strike or reacting), 7-20 m off the
   *  hero (his ring stays his), inside the stage bound, ≤ CROWD.allyScan off the ally, and not across the hero. */
  function pickFoe(i, h) {
    let best = -1, bd = CROWD.allyScan ** 2;
    const [r0, r1] = CROWD.allyReach, ax = c.x[i] - h.x, az = c.z[i] - h.z;
    if (ax * ax + az * az > 24 * 24) return;                         // still catching up with the hero
    for (let j = 0; j < grunts; j++) {
      const s = c.st[j];
      if ((s !== ST.IDLE && s !== ST.ADVANCE && s !== ST.GUARD) || c.foe[j] >= 0 || c.token[j] || c.kind[j] === KIND.BEARER || c.z[j] > c.zMax) continue;
      const wx = c.x[j] - h.x, wz = c.z[j] - h.z, w2 = wx * wx + wz * wz;
      if (w2 < r0 * r0 || w2 > r1 * r1) continue;
      const d2 = (wx - ax) ** 2 + (wz - az) ** 2;
      if (d2 >= bd) continue;
      // the hero's distance from the ally → foe segment: the ally doesn't run through the fight to reach him
      const ex = wx - ax, ez = wz - az, t = Math.max(0, Math.min(1, -(ax * ex + az * ez) / (d2 || 1)));
      if ((ax + ex * t) ** 2 + (az + ez * t) ** 2 < 25) continue;
      bd = d2; best = j;
    }
    if (best < 0 || !clear(c.x[i], c.z[i], c.x[best], c.z[best])) return;
    c.foe[i] = best; c.foe[best] = i; releaseToken(best);
    c.form[best] = 0; if (c.st[best] === ST.IDLE) setSt(best, ST.ADVANCE);
    c.cd[i] = rng.int(20, 70); c.cd[best] = rng.int(40, 100);
  }
  /** Unpaired allies within 30 m of the hero raise their weapons and roar (view: the crowd's rally pose). */
  function cheer() {
    const h = game.hero;
    if (game.frame < c.cheerF) return;
    c.cheerF = game.frame + 300;
    for (let i = N; i < T; i++) {
      const s = c.st[i];
      if ((s === ST.GUARD || s === ST.ADVANCE) && c.foe[i] < 0 && !c.form[i] && (c.x[i] - h.x) ** 2 + (c.z[i] - h.z) ** 2 < 900) c.raiseF[i] = game.frame + 70 - (i % 5) * 5;
    }
  }
  /** An ally column (CROWD.allyCol) runs up the road from ≈ 26 m behind the hero every CROWD.allyEvery sf while the
   *  allies are under CROWD.allyKeep. */
  function allyColumns(h) {
    if (!c.alliesOn || ++c.allyT < CROWD.allyEvery) return;
    let n = 0;
    for (let i = N; i < T; i++) if (alive(c.st[i])) n++;
    if (n > CROWD.allyKeep - CROWD.allyCol[0]) return;
    c.allyT = 0;
    const [x, z] = clampWalk(...routeAt(routeS(h.x, h.z) - 26), 1);
    c.spawnAllies({ x, z, n: Math.min(CROWD.allyKeep - n, rng.int(CROWD.allyCol[0], CROWD.allyCol[1])), face: Math.atan2(h.x - x, h.z - z), cols: 2 });
    emit('crowd:allies', { x, z });
  }

  /** A strike starts: the guards nearest the striker raise their weapons and shout with him (DW9: 4-5 of ~30 raise
   *  together), and surge half a step in. The view reads raiseF for the war-cry pose. */
  function rally(s) {
    const k = rng.int(CROWD.rally[0], CROWD.rally[1]), near = [];
    for (let j = 0; j < N; j++) {
      if (j === s || c.st[j] !== ST.GUARD || c.token[j] || c.form[j] || c.kind[j] === KIND.BEARER || c.foe[j] >= 0) continue;
      const d2 = (c.x[j] - c.x[s]) ** 2 + (c.z[j] - c.z[s]) ** 2;
      if (d2 <= 30) near.push([d2, j]);
    }
    near.sort((a, b) => a[0] - b[0]).slice(0, k).forEach(([, j], m) => { c.raiseF[j] = game.frame + CROWD.rallyTime - m * 3; });
  }

  function turn(i, target, rate) {
    const d = wrap(target - c.yaw[i]), m = rate * DT;
    c.yaw[i] += Math.max(-m, Math.min(m, d));
  }

  /** Squad table: director + formation movement (march → halt → charge → fold into the ring). */
  function squads(h) {
    const S = c.sq;
    // members alive per squad (a squad whose members all died or broke off is freed)
    for (let q = 0; q < S.n; q++) S.t[q]++;
    const alive = sqAlive.fill(0);
    // engaged = free soldiers standing in the ring (reacting / downed bodies don't count, so a sweep frees the next
    // block at once) + a third of every block already on its way
    let engaged = 0, transit = 0;
    for (let i = 0; i < N; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD) continue;
      if (c.form[i]) alive[c.squad[i]]++;
      else if ((s === ST.ADVANCE || s === ST.GUARD || s === ST.ATTACK) && c.foe[i] < 0) engaged++;
    }
    for (let q = 0; q < S.n; q++) if (S.st[q] > SQ_HOLD) transit += alive[q];
    engaged += transit * 0.35;
    let holdBest = -1, holdD = Infinity;
    for (let q = 0; q < S.n; q++) {
      if (!S.st[q]) continue;
      if (!alive[q]) { S.st[q] = 0; continue; }
      const dx = h.x - S.x[q], dz = h.z - S.z[q], d = Math.hypot(dx, dz) || 1e-6;
      if (S.st[q] === SQ_HOLD) { if (d < holdD) { holdD = d; holdBest = q; } continue; }
      // wheel toward the hero (limited turn rate → the block visibly pivots)
      const da = wrap(Math.atan2(dx, dz) - S.face[q]);
      S.face[q] += Math.max(-1.1 * DT, Math.min(1.1 * DT, da));
      let sp = 0;
      if (S.st[q] === SQ_MARCH) { sp = CROWD.march; if (d < CROWD.halt) { S.st[q] = SQ_HALT; S.t[q] = 0; } }
      else if (S.st[q] === SQ_HALT) { if (S.t[q] > CROWD.haltFrames) S.st[q] = SQ_CHARGE; }
      else sp = CROWD.charge;
      if (Math.abs(da) > 0.9) sp *= 0.4;                                   // wheel first, then advance
      S.x[q] += Math.sin(S.face[q]) * sp * DT; S.z[q] += Math.cos(S.face[q]) * sp * DT;
      if (S.st[q] === SQ_CHARGE && d < CROWD.fold) {                       // fold: members break into the ring
        S.st[q] = 0;
        for (let i = 0; i < N; i++) if (c.form[i] && c.squad[i] === q) { c.form[i] = 0; if (c.st[i] === ST.IDLE) setSt(i, ST.ADVANCE); }
      }
    }
    // director: keep ~CROWD.engaged soldiers on the hero
    if (game.frame % 20 === 0 && holdBest >= 0 && engaged < CROWD.engaged && transit < CROWD.transit && holdD < 55) {
      S.st[holdBest] = holdD < CROWD.halt + 5 ? SQ_CHARGE : SQ_MARCH; S.t[holdBest] = 0;
    }
    c.engaged = engaged; holdNear = holdBest >= 0 && holdD < CROWD.waveDist[1];   // nearer than a column would spawn
  }

  /** Ring manager: when the inner ring or the second row thins out, the nearest soldier from further out steps up. */
  // inner-ring slots: SEC sectors around the hero; seat() gives a soldier slot `best`, by default the emptiest one
  // nearest to where he stands
  const SEC = 16, secN = new Int32Array(SEC);
  const secOf = (a) => Math.min(SEC - 1, Math.floor((a + Math.PI) / (2 * Math.PI) * SEC));
  const secAng = (s) => (s + 0.5) / SEC * 2 * Math.PI - Math.PI;
  function seat(i, h, best = -1) {
    if (best < 0) {
      const s0 = secOf(Math.atan2(c.x[i] - h.x, c.z[i] - h.z));
      best = s0;
      for (let k = 1; k <= SEC / 2; k++) {
        const a = (s0 + k) % SEC, b = (s0 - k + SEC) % SEC;
        if (secN[a] < secN[best]) best = a;
        if (secN[b] < secN[best]) best = b;
      }
    }
    secN[best]++; c.seated[i] = 1;
    c.ang[i] = secAng(best) + rng.range(-0.12, 0.12);
  }

  function rings(h) {
    const ok = (i) => { const s = c.st[i]; return (s === ST.ADVANCE || s === ST.GUARD || s === ST.ATTACK) && !c.form[i] && c.foe[i] < 0; };
    // seat the inner ring: new members take the emptiest slots; up to 4 soldiers from a doubled-up slot move to an
    // empty one per tick (a gap left by a sweep fills from both sides)
    secN.fill(0);
    for (let i = 0; i < N; i++) if (!c.band[i] && c.seated[i] && ok(i)) secN[secOf(wrap(c.ang[i]))]++;
    for (let i = 0; i < N; i++) if (!c.band[i] && !c.seated[i] && ok(i)) seat(i, h);
    for (let i = 0, moves = 0; i < N && moves < 4 && secN.includes(0); i++) {
      if (c.band[i] || !c.seated[i] || !ok(i) || c.token[i]) continue;
      const s0 = secOf(wrap(c.ang[i]));
      if (secN[s0] < 2) continue;
      secN[s0]--; seat(i, h); moves++;
    }
    for (let k = 0; k < 2; k++) {
      let n = 0;
      for (let i = 0; i < N; i++) if (c.band[i] === k && ok(i)) n++;
      // the whole deficit steps up at once, so a sweep's gap closes in one beat: the second row takes the nearest
      // soldiers from further out; each empty inner slot takes the soldier nearest to it (the flanks close the
      // camera side)
      for (let need = CROWD.bandMin[k] - n; need > 0; need--) {
        let slot = -1, px = h.x, pz = h.z;
        if (!k) {
          slot = 0;
          for (let q = 1; q < SEC; q++) if (secN[q] < secN[slot]) slot = q;
          const a = secAng(slot), r = (CROWD.bands[0][0] + CROWD.bands[0][1]) / 2;
          px += Math.sin(a) * r; pz += Math.cos(a) * r;
        }
        let best = -1, bd = Infinity;
        for (let i = 0; i < N; i++) {
          if (c.band[i] <= k || c.kind[i] === KIND.BEARER || !ok(i)) continue;
          const d2 = (c.x[i] - px) ** 2 + (c.z[i] - pz) ** 2;
          if (d2 < bd) { bd = d2; best = i; }
        }
        if (best < 0) break;
        setBand(best, k);
        if (!k) seat(best, h, slot);
        n++;
      }
      // an over-full row sheds its farthest soldiers to the next one (a ring, not a pile)
      for (; n > CROWD.bandMax[k]; n--) {
        let far = -1, fd = -1;
        for (let i = 0; i < N; i++) {
          if (c.band[i] !== k || c.token[i] || !ok(i)) continue;
          const d2 = (c.x[i] - h.x) ** 2 + (c.z[i] - h.z) ** 2;
          if (d2 > fd) { fd = d2; far = i; }
        }
        if (far < 0) break;
        setBand(far, k + 1);
      }
    }
  }

  function grantTokens(h) {
    if (game.frame % 6 !== 0 || c.tokensUsed >= CROWD.tokens) return;
    // favour soldiers in the inner ring that the camera sees (beyond the hero, within the view cone); while he attacks,
    // soldiers off his flanks and back (a swing in front of him gets swept away before it lands)
    const cy = game.cam.yaw, fx = Math.sin(cy), fz = Math.cos(cy);
    const hx = Math.sin(h.yaw), hz = Math.cos(h.yaw), busy = h.state === 'attack';
    let best = -1, bs = Infinity;
    const start = rng.int(0, N - 1);                             // rotate the scan start so tokens spread around
    for (let k = 0; k < N; k++) {
      const i = (start + k) % N;
      const s = c.st[i];
      if ((s !== ST.GUARD && s !== ST.ADVANCE) || c.token[i] || c.cd[i] > 0 || c.form[i] || c.kind[i] === KIND.BEARER || c.foe[i] >= 0) continue;
      const dx = c.x[i] - h.x, dz = c.z[i] - h.z, d = Math.hypot(dx, dz);
      if (d > 4.5) continue;
      const vis = (dx * fx + dz * fz) / (d || 1);             // 1 = straight beyond the hero (hidden behind his body)
      const score = d + (1 - vis) * 1.2 + (vis > 0.92 ? 1.2 : 0) + (busy && (dx * hx + dz * hz) / (d || 1) > -0.2 ? 3 : 0);
      if (score < bs) { bs = score; best = i; }
    }
    if (best >= 0) { c.token[best] = 1; c.tokensUsed++; c.tokT[best] = 0; }
  }

  function separate(h) {
    head.fill(-1);
    for (let i = 0; i < T; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD || s === ST.DOWN || c.y[i] > 0.6) continue;
      const gx = Math.floor((c.x[i] + HALF) / CELL), gz = Math.floor((c.z[i] + HALF) / CELL);
      if (gx < 0 || gz < 0 || gx >= GRID || gz >= GRID) continue;
      const cell = gx + gz * GRID;
      next[i] = head[cell]; head[cell] = i;
    }
    const R2 = CROWD.radius * 2, hr = CROWD.heroR + CROWD.radius;
    for (let i = 0; i < T; i++) {
      px[i] = 0; pz[i] = 0;
      const s = c.st[i];
      if (s === ST.OFF || s === ST.DEAD || s === ST.DOWN || c.y[i] > 0.6) continue;
      const gx = Math.floor((c.x[i] + HALF) / CELL), gz = Math.floor((c.z[i] + HALF) / CELL);
      for (let oz = -1; oz <= 1; oz++) for (let ox = -1; ox <= 1; ox++) {
        const x = gx + ox, z = gz + oz;
        if (x < 0 || z < 0 || x >= GRID || z >= GRID) continue;
        for (let j = head[x + z * GRID]; j >= 0; j = next[j]) {
          if (j === i) continue;
          const dx = c.x[i] - c.x[j], dz = c.z[i] - c.z[j], d2 = dx * dx + dz * dz;
          if (d2 >= R2 * R2) continue;
          // priority: attack-token holders, then the inner ring, push through; outer rows give way
          const pi = c.token[i] ? -1 : c.band[i], pj = c.token[j] ? -1 : c.band[j];
          const d = Math.sqrt(d2) || 1e-4, push = (R2 - d) * (pi > pj ? 0.9 : pi < pj ? 0.1 : 0.5);
          px[i] += d2 > 1e-8 ? dx / d * push : (i < j ? push : -push); pz[i] += d2 > 1e-8 ? dz / d * push : 0;
        }
      }
      const dx = c.x[i] - h.x, dz = c.z[i] - h.z, d = Math.hypot(dx, dz);
      if (d < hr && !h.y) { const k = (hr - d) / (d || 1e-4); px[i] += dx * k; pz[i] += dz * k; }
    }
    // every live body is clamped here, pushed or not: this runs after both movers of the step (the AI integrate above
    // and combat reactions(), which run first in main.js step()), so nobody walks, slides or is thrown through a
    // closed gate, the castle wall or a cliff (airborne bodies too: they stop at the fence instead of landing past it)
    for (let i = 0; i < T; i++) {
      if (c.st[i] === ST.OFF) continue;
      [c.x[i], c.z[i]] = clampWalk(c.x[i] + Math.max(-0.2, Math.min(0.2, px[i] * 0.6)), c.z[i] + Math.max(-0.2, Math.min(0.2, pz[i] * 0.6)), -1);
    }
  }

  /** Reinforcement column in front of the camera when the field runs dry. */
  function waves(h) {
    // columns keep coming while the ring is under strength, faster when it is below half
    if (!c.wavesOn || ++c.waveT < CROWD.waveEvery[c.engaged < CROWD.engaged / 2 ? 0 : 1]) return;
    if (c.engaged >= CROWD.engaged || holdNear) return;                  // a block waits closer: the director uses it
    const off = freeSlots(false);
    if (off.length < CROWD.wave[0]) return;
    c.waveT = 0;
    const n = Math.min(off.length, rng.int(CROWD.wave[0], CROWD.wave[1]));
    const a = game.cam.yaw + rng.range(-1.1, 1.1), d = rng.range(CROWD.waveDist[0], CROWD.waveDist[1]);
    // story stage bound (c.zMax, set by story fire() with its `limit`): a column that would land past it (behind a
    // closed barricade / gate it can't cross) is mirrored behind the hero instead
    let wz = h.z + Math.cos(a) * d;
    if (wz > c.zMax - 4) wz = Math.min(c.zMax - 4, 2 * h.z - wz);
    const [sx, sz] = clampWalk(h.x + Math.sin(a) * d, wz, 1);
    makeSquad(off.slice(0, n), sx, sz, Math.atan2(h.x - sx, h.z - sz), 3, SQ_CHARGE);   // a column that runs straight in
    // the free army (spawnArmy: free mode, a trial's `army`): its KO'd officers come back with the waves (scripted
    // officers are named and stay down)
    for (const i of freeSlots(true)) {
      if (!c.armyOn || i >= grunts + CROWD.officers) break;
      place(i, sx + rng.range(-2, 2), sz + rng.range(-2, 2), true); freeOfficer(i);
      break;
    }
    emit('crowd:wave', { x: sx, z: sz });
  }

  return c;
}
