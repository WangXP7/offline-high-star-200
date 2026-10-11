// Hero-model actors (sim): named officers who take the field with a whole kit (a CHARS id: model, chains, clips and move
// table) on their own rig instead of a crowd slot (render: src/actors/view.js) — the boss (呂布 at 虎牢關) and allied
// officers fighting beside the hero. Deterministic (sim rng only), stepped once per sim step after the crowd (main.js);
// everyone holds still through the Musou freeze, a foe also through hitstop (he never swings into a frozen hero).
//
//   game.actors = createActors(game)
//   reset()                 battle start (main.js startBattle, after the crowd, before story.reset)
//   step()
//   spawn(key, def) → actor def = { kit: CHARS id | NPCS id (src/chars/npc) | a kit object, role: 'boss' | 'ally' | 'npc', at: {x, z} | [x, z], yaw (default:
//                           facing the hero), hp (boss: × game.diff.officerHp), name {zh, en}, seal (red seal glyphs), poise (default: kit.bossPoise, else ACTOR.poise),
//                           attacks (default: kit.bossAttacks, else SPEAR), scale (× the kit body scale: kit.scale, else HERO_SCALE), retreatAt
//                           (HP fraction where a boss breaks off instead of falling), intro {zh, en} (HUD spawn banner),
//                           invuln (default: every role but the boss) }. A key already on the field is replaced.
//   get(key) → actor | null the live record (read it, never write it): { key, role, x, z, y (above ground), yaw, hp, hpMax,
//                           dead, state, ... }; dead = beaten (down, or broke off at retreatAt)
//   order(key, do, at)      'retreat' | 'join' | 'hold' | 'follow'; at: {x, z} | [x, z] (see Orders; ignored once he is beaten)
//   list                    this battle's actors in spawn order (gone ones included)
//   foe(a)                  a can be hit right now (a boss standing: not down / retreating / gone / invulnerable)
//   nearestFoe(x, z, r, yaw, cone) → actor | null     (soft lock, arrow lock-on, camera target, aim)
//   hurt(a, dmg, heavy, musou) → true when this blow beat him     (combat.js: every hero hitbox / arrow / Musou window)
//   chip(a, dmg)            an allied officer's blow: HP only, never below 1 (or the retreat mark: the hero beats him)
//
// Roles
//   boss  foe. Chases the hero and swings telegraphed attacks from data (attacks[] below): the warning decal on the ground
//         IS the hitbox and fills over the wind-up (sim frames, so it holds through hitstop). He never flinches, but
//         poise (dmg × 1.6 heavy × 0.5 Musou) breaks into a stagger (the swing is cancelled, free hits). Enraged under
//         ACTOR.rage HP: wind-ups × rageK, shorter pauses. At retreatAt he breaks off and runs (actor:retreat), at 0 HP he
//         falls (actor:down); either counts as the hero's KO. Blows × game.diff.dmg on the hero (i-frames after one even
//         through armour: hero.hurt), and they throw the Shu soldiers caught in them (combat.npcStrike). A kit with a
//         `taunt` clip (the NPC kits) squares up first: ACTOR.taunt sf of it on the spot, facing the hero, on spawn and when
//         a holding boss is called in (join); a stagger cuts it short.
//   ally  friend, invulnerable by default. Keeps 4-8 m off the hero on his flank; picks Wei grunts ≥ 3 m off him (his ring
//         stays his, formations are left alone) and fights them with the kit's own moves (n1 → n2 …, now and then the
//         charge off the string); they land through combat.npcStrike (the reactions of a hero blow, no hero credit, never
//         on an officer). A boss within ACTOR.scan m comes first: his blows chip it (× ACTOR.chip, never past its retreat
//         mark / 1 HP — the hero beats him).
//   npc   friend, never fights (an escort): follows or holds.
// Orders: follow — keep with the hero (ally / npc default) · join — boss: fight the hero (default), friends: follow ·
//   hold — go to `at` (default: where he stands) and stay (a boss only swings at a hero within ACTOR.leash of the post, an
//   ally only at foes near it) · retreat — run to `at` (default ACTOR.retreat m straight away from the hero), then leave
//   (state 'gone'); another order calls him back until then.
// States: idle | move | attack | stagger | down | retreat | gone.
//
// attacks[] = { id, clip, t0, t1, f, win, windup, active, recover (frames), dmg, shape: 'circle' | 'lane' | 'leap', r | w + len,
//   every, lunge, h, range: [min, max] (hero distance it is picked at), weight }
//   · circle: r round where he stands · lane: w × len ahead of where he stood, swept by a lunge of `lunge` m over the active
//     phase (the reach grows with it) · leap: onto where the hero stood (≤ len m off), an `h` m hop over the active phase, r
//     round the landing. circle / lane hit every `every` frames of the active phase (its first frame included), a leap once
//     on landing; the hero only while he is below 1.2 m (a jump clears it).
//   · clip = a kit move id: its hit window hits[win].f (or `f` = [a, b] move frames; leap default: take-off → landing) is
//     stretched onto the active phase, the wind-up plays the move from t0 (fraction of its frames, default 0), the
//     recovery on to t1 (default: f1 + recover frames). Any other kit clip plays t0 → t1 (default 0 → 1) over the attack.
// Events: actor:spawn {key, role, name, seal, intro} · actor:hit {key, x,y,z, dmg, heavy, stagger, hp} (hp: fraction) ·
//   actor:strike {key, kind, x, z, yaw, r, len, w} (first active frame; a leap on landing) · actor:down {key, x, z} ·
//   actor:retreat {key, x, z, beaten} · clash (an ally's chip on a boss: the soldiers' duel spark).
import { rng } from '../core/rng.js';
import { emit } from '../core/events.js';
import { clampWalk } from '../world/map.js';
import { CHARS } from '../chars/index.js';
import { NPCS } from '../chars/npc/index.js';
import { moveClip, lungeAt } from '../hero/moveset.js';
import { cadence, LOCO } from '../hero/locomotion.js';
import { ST, CROWD, wrap } from '../crowd/crowd.js';
import { inShapeAt } from '../combat/combat.js';

const DT = 1 / 60;
export const ACTOR = {
  hp: 3000, allyHp: 1000, poise: 320, stagger: 70, rage: 0.4, rageK: 0.75,
  walk: 3.4, run: 6.6, turn: 6, r: 0.55,                   // m/s, rad/s, body radius (× scale)
  pause: [40, 80], ragePause: [14, 30], far: 0.025,        // sf between a boss's attacks; chance per sf of a long-range one
  intro: 70, taunt: 90, leash: 7, heroIF: 40,             // sf before his first swing; taunt sf; hold post reach; hero i-frames
  follow: [4, 8], allyRun: 8.2, catchUp: 9.6, scan: 9, reach: 2.6, heroGap: 3, fightR: 16, holdR: 6,
  string: [3, 5], rest: [20, 50], chip: 0.25, chargeP: 0.3,
  retreat: 36, retreatMax: 420, downGone: 600,
};
const NPC_KEY = 1.5e9;                                     // combat keys of actor blows (hero windows / arrows stay below)

// Default boss attacks: a spear kit's moves (趙雲's table). sweep = the C4 360° spin, thrust = the C3 stepping flurry
// (window 1:1), leap = C6's leap → plunge (move frames 72 → 82).
export const SPEAR = [
  { id: 'sweep', clip: 'c4', windup: 34, active: 28, recover: 30, every: 9, dmg: 34, shape: 'circle', r: 4.2, range: [0, 4.2], weight: 5 },
  { id: 'thrust', clip: 'c3', t1: 0.42, windup: 28, active: 30, recover: 30, every: 5, dmg: 38, shape: 'lane', w: 2.2, len: 7.5, lunge: 4,
    range: [2.4, 8.5], weight: 3 },
  { id: 'leap', clip: 'c6', f: [72, 82], t0: 0.46, t1: 0.8, windup: 24, active: 34, recover: 32, dmg: 48, shape: 'leap', r: 4.4, len: 13, h: 2.6,
    range: [5.5, 14], weight: 2 },
];

const ease = (u) => { u = Math.min(1, Math.max(0, u)); return 1 - (1 - u) * (1 - u); };
const lerp = (a, b, u) => a + (b - a) * u;
/** An ally string may use move m: grounded, lands a hitbox, no vertical script. */
const usable = (m) => !!m && m.hits.length > 0 && !m.air && !m.leap && !m.plunge && !m.landFrame && m.id !== 'aim';

/** Per-actor copy of an attack table: the move-frame map of kit-move clips and the soldier hit spec. */
function prepAttacks(kit, list) {
  return list.map((d) => {
    const A = { weight: 1, every: 0, ...d }, m = kit.moves[d.clip];
    if (m) {
      const F = m.frames, [fa, fb] = d.f || (d.shape === 'leap' && m.leap ? [m.leap[0], m.landFrame ?? F * 0.7] : m.hits[d.win || 0]?.f ?? [F * 0.3, F * 0.6]);
      A.m = m; A.map = [(d.t0 ?? 0) * F, fa, fb, d.t1 != null ? d.t1 * F : Math.min(F, fb + d.recover)];
    } else if (!kit.clips[d.clip]) console.warn(`actors: attack '${d.id}' has no clip '${d.clip}' in its kit`);
    const leap = d.shape === 'leap';
    A.spec = { shape: d.shape === 'lane' ? 'line' : 'circle', range: d.r || 0, len: d.len || 0, width: d.w || 0, dmg: d.dmg,
      kb: leap ? 'launch' : 'blow', force: leap ? 4 : 10, lift: leap ? 9 : 5, heavy: true };
    return A;
  });
}
/** Move frame of attack frame t: wind-up → [m0, fa], active → [fa, fb], recovery → [fb, m1]. */
function moveFrame([m0, fa, fb, m1], k, t) {
  const E = k.w + k.a;
  return t <= k.w ? lerp(m0, fa, t / k.w) : t <= E ? lerp(fa, fb, (t - k.w) / k.a) : lerp(fb, m1, Math.min(1, (t - E) / k.r));
}

export function createActors(game) {
  const A = { list: [] };
  const byKey = new Map();
  let ids = 0, keys = 0;
  const clashEv = { x: 0, y: 0, z: 0, dx: 0, dz: 0, killed: false };
  const set = (a, s) => { a.state = s; a.stT = 0; };
  const turn = (a, yaw, rate) => { const d = wrap(yaw - a.yaw), m = rate * DT; a.yaw += Math.max(-m, Math.min(m, d)); };
  const go = (a, yaw, sp) => { a.x += Math.sin(yaw) * sp * DT; a.z += Math.cos(yaw) * sp * DT; a.speed = sp; };

  A.reset = () => { A.list.length = 0; byKey.clear(); keys = 0; };
  A.get = (key) => byKey.get(key) || null;
  A.foe = (a) => a.isFoe && !a.invuln && a.state !== 'down' && a.state !== 'retreat' && a.state !== 'gone';
  A.nearestFoe = (x, z, maxR, yaw = 0, cone = Math.PI) => {
    let best = null, bd = maxR * maxR;
    for (const a of A.list) {
      if (!A.foe(a)) continue;
      const dx = a.x - x, dz = a.z - z, d2 = dx * dx + dz * dz;
      if (d2 >= bd || (cone < Math.PI && Math.abs(wrap(Math.atan2(dx, dz) - yaw)) > cone)) continue;
      bd = d2; best = a;
    }
    return best;
  };

  A.spawn = (key, d = {}) => {
    const old = byKey.get(key);
    if (old) A.list.splice(A.list.indexOf(old), 1);
    const ch = typeof d.kit === 'string' ? CHARS[d.kit] || NPCS[d.kit] : null, kit = ch ? ch.kit : d.kit || CHARS.zhaoyun.kit;
    const role = d.role || 'ally', foe = role === 'boss', h = game.hero;
    const at = Array.isArray(d.at) ? d.at : d.at ? [d.at.x, d.at.z] : [h.x, h.z + 6], [x, z] = clampWalk(at[0], at[1]);
    const hp = Math.round((d.hp ?? (foe ? ACTOR.hp : ACTOR.allyHp)) * (foe ? game.diff.officerHp : 1)), poise = d.poise ?? kit.bossPoise ?? ACTOR.poise;   // (kit.bossPoise: the kit's boss profile)
    const a = {
      id: ++ids, key, role, isFoe: foe, kit, char: ch, intro: d.intro || null,
      name: d.name || (ch ? ch.name : { zh: '敵將', en: 'OFFICER' }), seal: d.seal ?? (ch ? ch.seal : '將'),
      scale: d.scale ?? (foe ? 1.15 : 1), x, z, y: 0, yaw: d.yaw ?? Math.atan2(h.x - x, h.z - z),
      hp, hpMax: hp, poise, poiseMax: poise, retreatAt: d.retreatAt || 0, invuln: d.invuln ?? !foe, dead: false,
      state: 'idle', stT: 0, mode: foe ? 'join' : 'follow', hx: x, hz: z, rx: x, rz: z, far: false,
      attacks: foe ? prepAttacks(kit, d.attacks || kit.bossAttacks || SPEAR) : null, atk: null, taunt: foe && kit.clips.taunt ? ACTOR.taunt : 0, seq: 0, pause: 0, cd: foe ? ACTOR.intro : 0,
      move: null, moveT: 0, moveSeq: 0, keyBase: 0, str: 0, tgt: -1, tgtA: null,
      speed: 0, phase: 0, flash: 0, lastHit: -1, chipKey: -1,
      anim: { id: 'idle', t: 0, k: 0, seq: -2, mv: null, mt: 0 },   // render reads: clip id, clip time, run speed share, blend seq
    };
    a.r = ACTOR.r * a.scale;
    A.list.push(a); byKey.set(key, a);
    emit('actor:spawn', { key, role, name: a.name, seal: a.seal, intro: a.intro });
    return a;
  };

  A.order = (key, what, at) => {
    const a = byKey.get(key);
    if (!a || a.dead || a.state === 'gone') return;                   // (a beaten one is out of the fight for good)
    const p = at ? (Array.isArray(at) ? at : [at.x, at.z]) : null;
    if (what === 'retreat') { retreat(a, p, false); return; }
    if (a.isFoe && a.mode === 'hold' && what !== 'hold' && a.kit.clips.taunt) a.taunt = ACTOR.taunt;   // called in: he squares up
    a.mode = what === 'hold' ? 'hold' : a.isFoe ? 'join' : 'follow';
    if (what === 'hold') [a.hx, a.hz] = p ? clampWalk(p[0], p[1]) : [a.x, a.z];
    if (a.state === 'retreat') set(a, 'idle');
  };

  // ---- damage (combat.js)
  A.hurt = (a, dmg, heavy, musou) => {
    a.hp = Math.max(0, a.hp - dmg); a.flash = heavy ? 12 : 7;
    const off = a.retreatAt && a.hp <= a.hpMax * a.retreatAt, fell = !off && a.hp <= 0;
    let stagger = false;
    if (!off && !fell && a.state !== 'stagger' && a.y < 0.3) {       // (never mid-leap: he would drop out of the air)
      a.poise -= dmg * (heavy ? 1.6 : 1) * (musou ? 0.5 : 1);
      if (a.poise <= 0) { a.poise = a.poiseMax; a.atk = null; a.taunt = 0; set(a, 'stagger'); stagger = true; }
    }
    emit('actor:hit', { key: a.key, x: a.x, y: a.y + 1.3 * a.scale, z: a.z, dmg, heavy, stagger, hp: a.hp / a.hpMax });
    if (off) { a.hp = Math.max(1, a.hp); retreat(a, null, true); }
    else if (fell) { a.dead = true; a.atk = null; a.y = 0; set(a, 'down'); emit('actor:down', { key: a.key, x: a.x, z: a.z }); }
    return off || fell;
  };
  A.chip = (a, dmg) => {
    a.hp = Math.max(a.retreatAt ? Math.ceil(a.hpMax * a.retreatAt) + 1 : 1, a.hp - dmg);
    a.flash = Math.max(a.flash, 4);
  };

  function retreat(a, p, beaten) {
    const h = game.hero;
    if (!p) { const dx = a.x - h.x, dz = a.z - h.z, l = Math.hypot(dx, dz) || 1; p = [a.x + dx / l * ACTOR.retreat, a.z + dz / l * ACTOR.retreat]; }
    [a.rx, a.rz] = clampWalk(p[0], p[1], 1);
    if (beaten) a.dead = true;
    a.atk = null; a.move = null; a.y = 0; set(a, 'retreat');
    emit('actor:retreat', { key: a.key, x: a.x, z: a.z, beaten });
  }
  function runOff(a) {
    const ex = a.rx - a.x, ez = a.rz - a.z;
    if (Math.hypot(ex, ez) < 1.5 || a.stT > ACTOR.retreatMax) { set(a, 'gone'); return; }
    turn(a, Math.atan2(ex, ez), 12); go(a, a.yaw, ACTOR.allyRun);
  }

  // ---- boss
  function pick(a, d) {
    let sum = 0;
    for (const k of a.attacks) if (d >= k.range[0] && d <= k.range[1]) sum += k.weight;
    let r = sum ? rng.next() * sum : 0;
    for (const k of a.attacks) if (d >= k.range[0] && d <= k.range[1] && (r -= k.weight) < 0) return k;
    return null;
  }
  function start(a, D) {
    const h = game.hero, rage = a.hp < a.hpMax * ACTOR.rage;
    a.yaw = Math.atan2(h.x - a.x, h.z - a.z);
    const k = { A: D, t: 0, w: Math.max(8, Math.round(D.windup * (rage ? ACTOR.rageK : 1))), a: D.active, r: D.recover, x: a.x, z: a.z,
      yaw: a.yaw, tx: a.x, tz: a.z, key: NPC_KEY + (keys = (keys + 64) % 5e8), seq: ++a.seq };
    if (D.shape === 'leap') {                                         // onto where the hero stands, ≤ len m
      const ex = h.x - a.x, ez = h.z - a.z, s = Math.min(1, D.len / (Math.hypot(ex, ez) || 1));
      [k.tx, k.tz] = clampWalk(a.x + ex * s, a.z + ez * s, 0.5);
    }
    a.atk = k; set(a, 'attack');
  }
  /** One hit tick of the attack in progress: the hero (a point test against exactly the decal's shape), then the Shu
   *  soldiers in it. first: the attack's opening tick (actor:strike, the effects' cue). */
  function blow(a, k, first) {
    const D = k.A, h = game.hero, lane = D.shape === 'lane';
    const ox = D.shape === 'leap' ? k.tx : k.x, oz = D.shape === 'leap' ? k.tz : k.z, sn = Math.sin(k.yaw), cs = Math.cos(k.yaw);
    const reach = lane ? Math.min(D.len, (a.x - k.x) * sn + (a.z - k.z) * cs + D.len - (D.lunge || 0)) : 0;
    if (first) emit('actor:strike', { key: a.key, kind: D.shape, x: ox, z: oz, yaw: k.yaw, r: D.r || 0, len: D.len || 0, w: D.w || 0 });
    const dx = h.x - ox, dz = h.z - oz, lz = dx * sn + dz * cs, lx = dx * cs - dz * sn;
    const inside = lane ? lz >= 0 && lz <= reach && Math.abs(lx) <= D.w / 2 : dx * dx + dz * dz <= D.r * D.r;
    if (inside && h.y < 1.2) h.hurt(Math.round(D.dmg * game.diff.dmg), lane ? a.x : ox, lane ? a.z : oz, true, ACTOR.heroIF);
    if (lane) D.spec.len = reach;
    game.combat.npcStrike(D.spec, ox, oz, k.yaw, k.key, true);
  }
  function attack(a) {
    const k = a.atk, D = k.A, t = ++k.t, E = k.w + k.a;
    if (D.shape === 'leap') {
      if (t > k.w && t <= E) {
        const u = (t - k.w) / k.a, e = u * u * (3 - 2 * u);
        a.x = lerp(k.x, k.tx, e); a.z = lerp(k.z, k.tz, e); a.y = 4 * D.h * u * (1 - u);
        if (t === E) { a.y = 0; blow(a, k, true); }
      }
    } else if (t > k.w && t <= E) {
      if (D.lunge) { const s = D.lunge * (ease((t - k.w) / k.a) - ease((t - k.w - 1) / k.a)); a.x += Math.sin(k.yaw) * s; a.z += Math.cos(k.yaw) * s; }
      if (!D.every ? t === k.w + 1 : (t - k.w - 1) % D.every === 0) blow(a, k, t === k.w + 1);
    }
    if (t >= E + k.r) {
      const p = a.hp < a.hpMax * ACTOR.rage ? ACTOR.ragePause : ACTOR.pause;
      a.atk = null; set(a, 'idle'); a.pause = rng.int(p[0], p[1]);
    }
  }
  function boss(a) {
    if (a.state === 'attack') return attack(a);
    if (a.state === 'stagger') { if (a.stT >= ACTOR.stagger) set(a, 'idle'); return; }
    const h = game.hero, dx = h.x - a.x, dz = h.z - a.z, d = Math.hypot(dx, dz), face = Math.atan2(dx, dz);
    if (a.taunt > 0 && !h.dead) { a.taunt--; turn(a, face, ACTOR.turn); return; }
    if (a.cd > 0) a.cd--;
    if (h.dead) { turn(a, face, ACTOR.turn); return; }
    if (a.mode === 'hold' && Math.hypot(h.x - a.hx, h.z - a.hz) > ACTOR.leash) {   // hero off his post: back to it
      const ex = a.hx - a.x, ez = a.hz - a.z;
      if (Math.hypot(ex, ez) > 1) { turn(a, Math.atan2(ex, ez), ACTOR.turn); go(a, a.yaw, ACTOR.walk); } else turn(a, face, ACTOR.turn);
      return;
    }
    turn(a, face, ACTOR.turn);
    if (a.pause > 0) { a.pause--; go(a, face + (a.seq & 1 ? 1 : -1) * Math.PI / 2, 1.4); }   // circles him between attacks
    else if (d > 3.2) go(a, a.yaw, d > 8 ? ACTOR.run : ACTOR.walk);
    if (!a.cd && !a.pause) {
      const D = d < 4.2 || rng.chance(ACTOR.far) ? pick(a, d) : null;
      if (D) start(a, D);
    }
  }

  // ---- allied officers
  /** Next foe for ally a fighting round (ax, az): a boss within ACTOR.scan m first (chip), else the nearest free Wei grunt. */
  function target(a, ax, az) {
    a.tgt = -1; a.tgtA = null;
    let bd = ACTOR.scan * ACTOR.scan;
    for (const f of A.list) if (A.foe(f) && (f.x - a.x) ** 2 + (f.z - a.z) ** 2 < bd) { a.tgtA = f; return; }
    const c = game.crowd, h = game.hero, R = a.mode === 'hold' ? ACTOR.holdR : ACTOR.fightR;
    for (let i = 0; i < c.grunts; i++) {
      const s = c.st[i];
      if (s === ST.OFF || s >= ST.AIR || c.form[i]) continue;          // airborne / down / dead, and blocks still in rank
      const d2 = (c.x[i] - a.x) ** 2 + (c.z[i] - a.z) ** 2;
      if (d2 >= bd || (c.x[i] - h.x) ** 2 + (c.z[i] - h.z) ** 2 < ACTOR.heroGap ** 2 || (c.x[i] - ax) ** 2 + (c.z[i] - az) ** 2 > R * R) continue;
      bd = d2; a.tgt = i;
    }
  }
  const _t = [0, 0, 0];
  /** [x, z, reach] of ally a's target, or null once it is gone. */
  function tpos(a) {
    if (a.tgtA) { if (A.foe(a.tgtA)) { _t[0] = a.tgtA.x; _t[1] = a.tgtA.z; _t[2] = ACTOR.reach + a.tgtA.r - 0.4; return _t; } a.tgtA = null; }
    const i = a.tgt, c = game.crowd;
    if (i >= 0) { if (c.st[i] !== ST.OFF && c.st[i] < ST.AIR) { _t[0] = c.x[i]; _t[1] = c.z[i]; _t[2] = ACTOR.reach; return _t; } a.tgt = -1; }
    return null;
  }
  function begin(a, id) {
    a.move = id; a.moveT = 0; a.moveSeq++; a.keyBase = keys = (keys + 64) % 5e8;
    set(a, 'attack');
  }
  /** One frame of ally a's kit move: lunge, hit windows (the hero's rules: `every` re-hits, else each foe once per
   *  window), then the string (m.next, now and then m.charge) while the target stays in reach. */
  function swing(a) {
    const m = a.kit.moves[a.move], t = a.moveT, d = lungeAt(m, t + 1) - lungeAt(m, t);
    a.x += Math.sin(a.yaw) * d; a.z += Math.cos(a.yaw) * d;
    for (let w = 0; w < m.hits.length; w++) {
      const hit = m.hits[w];
      if (t < hit.f[0] || t > hit.f[1] || (hit.every && (t - hit.f[0]) % hit.every)) continue;
      const key = NPC_KEY + a.keyBase + w * 8 + (hit.every ? Math.min(7, (t - hit.f[0]) / hit.every | 0) : 0);
      game.combat.npcStrike(hit, a.x, a.z, a.yaw, key, false);
      for (const f of A.list) {
        if (!A.foe(f) || f.chipKey === key || !inShapeAt(hit, a.x, a.z, a.yaw, f.x, f.z, f.r)) continue;
        f.chipKey = key; A.chip(f, hit.dmg * ACTOR.chip);
        const l = Math.hypot(f.x - a.x, f.z - a.z) || 1;
        Object.assign(clashEv, { x: f.x, y: f.y + 1.3 * f.scale, z: f.z, dx: (f.x - a.x) / l, dz: (f.z - a.z) / l });
        emit('clash', clashEv);
      }
    }
    a.moveT++;
    const tp = a.moveT >= m.cancel && a.str > 1 ? tpos(a) : null;
    if (tp && Math.hypot(tp[0] - a.x, tp[1] - a.z) < tp[2] + 2) {
      const next = rng.chance(ACTOR.chargeP) && usable(a.kit.moves[m.charge]) ? m.charge : m.next;
      if (usable(a.kit.moves[next])) {
        a.str = next === m.charge ? 0 : a.str - 1; a.yaw = Math.atan2(tp[0] - a.x, tp[1] - a.z);
        return begin(a, next);
      }
    }
    if (a.moveT >= m.frames) { a.move = null; set(a, 'idle'); a.cd = rng.int(ACTOR.rest[0], ACTOR.rest[1]); }
  }
  function friend(a) {
    if (a.state === 'attack') return swing(a);
    const h = game.hero, hold = a.mode === 'hold', ax = hold ? a.hx : h.x, az = hold ? a.hz : h.z;
    if (a.cd > 0) a.cd--;
    if (a.role === 'ally' && (game.frame + a.id * 5) % 12 === 0) target(a, ax, az);
    const tp = a.role === 'ally' ? tpos(a) : null;
    if (tp) {
      const ex = tp[0] - a.x, ez = tp[1] - a.z, e = Math.hypot(ex, ez), f = Math.atan2(ex, ez);
      turn(a, f, 10);
      if (e > tp[2]) go(a, a.yaw, e > 4 ? ACTOR.allyRun : ACTOR.walk);
      else if (!a.cd && usable(a.kit.moves.n1)) { a.yaw = f; a.str = rng.int(ACTOR.string[0], ACTOR.string[1]); begin(a, 'n1'); }
      return;
    }
    // no foe: the post, or a slot on the hero's flank (in view, beside the fight), 4-8 m off him
    let tx = a.hx, tz = a.hz;
    if (!hold) { const s = game.cam.yaw + (a.id & 1 ? 1.1 : -1.1); tx = h.x + Math.sin(s) * 5.5; tz = h.z + Math.cos(s) * 5.5; }
    const ex = tx - a.x, ez = tz - a.z, e = Math.hypot(ex, ez), dh = Math.hypot(h.x - a.x, h.z - a.z);
    if (hold ? e > 1 : dh > ACTOR.follow[1] || dh < ACTOR.follow[0] - 1) a.far = true;
    if (e < 1) a.far = false;
    if (a.far) { turn(a, Math.atan2(ex, ez), 10); go(a, a.yaw, e < 3 ? ACTOR.walk : dh > 12 ? ACTOR.catchUp : ACTOR.allyRun); }
    else turn(a, hold ? Math.atan2(h.x - a.x, h.z - a.z) : game.cam.yaw, 3);
  }

  // ---- bodies: soldiers are shouldered aside, the hero can't run through a standing officer (a dodge / his Musou slips past)
  function separate() {
    const c = game.crowd, h = game.hero, L = A.list;
    for (const a of L) {
      if (a.state === 'gone' || a.state === 'down' || a.y > 0.6) continue;
      const R = a.r + CROWD.radius;
      for (let i = 0; i < c.T; i++) {
        const s = c.st[i];
        if (s === ST.OFF || s === ST.DEAD || s === ST.DOWN || c.y[i] > 0.6) continue;
        const dx = c.x[i] - a.x, dz = c.z[i] - a.z, d2 = dx * dx + dz * dz;
        if (d2 >= R * R) continue;
        const d = Math.sqrt(d2), k = Math.min(0.25, R - d) / (d || 1), p = clampWalk(c.x[i] + (d ? dx * k : 0.25), c.z[i] + dz * k, -1);
        c.x[i] = p[0]; c.z[i] = p[1];
      }
      const hr = a.r + 0.45, ex = h.x - a.x, ez = h.z - a.z, e = Math.hypot(ex, ez);
      if (e < hr && !h.dead && h.y < 0.6 && h.state !== 'dodge' && h.state !== 'musou') {
        const k = (hr - e) / (e || 1e-3), p = clampWalk(h.x + ex * k * 0.7, h.z + ez * k * 0.7);
        h.x = p[0]; h.z = p[1]; a.x -= ex * k * 0.3; a.z -= ez * k * 0.3;
      }
    }
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const a = L[i], b = L[j];
      if (a.state === 'gone' || b.state === 'gone' || a.state === 'down' || b.state === 'down' || a.y > 0.6 || b.y > 0.6) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), R = a.r + b.r;
      if (d >= R) continue;
      const k = (R - d) / 2 / (d || 1e-3);
      a.x -= dx * k; a.z -= dz * k; b.x += dx * k; b.z += dz * k;
    }
    for (const a of L) if (a.state !== 'gone') { const p = clampWalk(a.x, a.z); a.x = p[0]; a.z = p[1]; }
  }

  /** Animation bookkeeping (render reads a.anim): clip id, clip time, run speed share, blend seq. */
  function anim(a) {
    const an = a.anim;
    an.mv = null; an.k = 0;
    if (a.atk) {
      const k = a.atk, D = k.A, t = Math.min(k.t, k.w + k.a + k.r);
      if (D.m) { const f = moveFrame(D.map, k, t), c = moveClip(D.m, f); an.id = c[0]; an.t = c[1]; an.seq = k.seq * 16 + c[2]; an.mv = D.clip; an.mt = f; }
      else { an.id = D.clip; an.t = lerp(D.t0 ?? 0, D.t1 ?? 1, t / (k.w + k.a + k.r)); an.seq = k.seq * 16; }
    } else if (a.move) {
      const c = moveClip(a.kit.moves[a.move], a.moveT);
      an.id = c[0]; an.t = c[1]; an.seq = a.moveSeq * 16 + c[2]; an.mv = a.move; an.mt = a.moveT;
    } else if (a.state === 'stagger' || a.state === 'down') { an.id = 'hurt'; an.t = Math.min(1, a.stT / 20); an.seq = -3; }
    else if (a.taunt > 0) { an.id = 'taunt'; an.t = 1 - a.taunt / ACTOR.taunt; an.seq = -4; }
    else if (a.speed > 0.5) {
      a.phase = (a.phase + Math.PI * cadence(a.speed) * DT) % (Math.PI * 128);
      an.id = 'run'; an.t = a.phase; an.k = Math.min(1, a.speed / LOCO.runSpeed); an.seq = -1;
    } else { an.id = 'idle'; an.t = (game.frame % 150) / 150; an.seq = -2; }
  }

  A.step = () => {
    for (const a of A.list) if (a.flash > 0) a.flash--;
    if (game.freeze > 0) return;                                        // Musou activation: the field holds still
    for (const a of A.list) {
      if (a.state === 'gone' || (a.isFoe && game.hitstop > 0)) continue;
      a.stT++; a.speed = 0;
      if (a.state === 'retreat') runOff(a);
      else if (a.state === 'down') { if (a.stT > ACTOR.downGone) set(a, 'gone'); }
      else if (a.isFoe) boss(a);
      else friend(a);
      if (a.state === 'idle' || a.state === 'move') a.state = a.speed > 0 ? 'move' : 'idle';
      anim(a);
    }
    separate();
  };
  return A;
}
