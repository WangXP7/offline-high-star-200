// 瞄準 aim mode (sim), after the DW5 bow: hold △ from neutral — C1 still held on moves.AIM_AT becomes the aim (a tap is
// the knockback shot). He plants his feet; the stick (and a mouse drag) turns the aim, stick up/down raises / lowers it;
// the draw builds while △ is held (full in AIM.drawFull frames) and each release looses one precise, un-assisted arrow
// (no soft lock): dmg and pierce grow with the draw, a full draw is a heavy blow-away shot, and an arrow that reaches a
// standing officer above ARROW.headY is a headshot (× ARROW.headK, projectiles.js). After a loose he re-nocks; △ again
// draws again, otherwise he lowers the bow after AIM.grace frames. □ drops out into N1, ○/R1 dodges, × jumps.
// Also runs C4's strafe (moves.js `strafe`): the stick slides him while the barrage keeps firing.
// Runs from hero.js through the kit's per-battle sim (musou.stepSpecial): true = it moved the hero this frame.
//
// Camera (cam lane): game.musou.aimShot() → null | { id: 'aim', yaw, dist, pitch, fov, height, side, shake } in the same
// terms as musou.shot() (target = hero + height, camera `dist` back along `yaw` at `pitch`, `side` = aim offset to
// screen-right → over his right shoulder). Blend into it like a Musou cut (id stays 'aim' while he aims, so no cuts), keep
// game.cam.yaw on shot.yaw while it is non-null (the stick is camera-relative again the moment he lowers the bow).
import { AIM_AT } from './moves.js';
import { startDodge, startJump, setState, stickDir } from '../../hero/locomotion.js';
import { ARROW } from '../../combat/projectiles.js';
import { ST } from '../../crowd/crowd.js';

const D2R = Math.PI / 180;
export const AIM = {
  drawFull: 34,               // frames of △ for a full draw (incl. the C1 frames before the aim took over)
  turn: 1.7, pitchRate: 0.5,  // stick: rad/s (fine: a headshot window is ≈ 2 sf of stick at 20 m)
  pitchMin: -0.22, pitchMax: 0.42,
  grace: 40,                  // frames he stays in aim after a loose without △
  frames: { nock: 0, full: 14, loose: 16, end: 30 },    // the aim clip (anims.js)
  // the arrow: fast and flat (a precise shot has no soft lock), dmg / pierce from the draw, full draw = heavy
  base: { n: 1, speed: 88, g: 4, range: 34, rad: 0.22, head: true, kb: 'push', force: 6, lift: 2, hitstop: 2 },
  dmg: [18, 44], pierce: [0, 3],
  full: { dmg: 56, pierce: 4, kb: 'blow', force: 12, lift: 4, hitstop: 6, heavy: true, big: 1 },
};

export function createAim(game, proj) {
  const A = { active: false, yaw: 0, pitch: 0, held: 0, phase: 'draw', t: 0, d: 0 };
  const shot = { id: 'aim', yaw: 0, dist: 2.4, pitch: 0.1, fov: 38, height: 1.5, side: 0.55, shake: 0.5 };
  let crowdK = 0;
  A.reset = () => { crowdK = 0; A.active = false; A.held = 0; A.phase = 'draw'; A.t = 0; A.d = 0; };

  function enter(h) {
    A.active = true; A.yaw = h.yaw; A.pitch = 0; A.held = AIM_AT; A.phase = 'draw'; A.t = 0;
    h.move = 'aim'; h.moveSeq++; h.moveF0 = game.frame; h.moveT = 6; h.buf = null;
    setState(h, 'attack');
  }
  function leave(h) { A.active = false; h.move = null; setState(h, 'idle'); }

  function loose(h) {
    const d = A.d, full = d >= 1, s = { ...AIM.base, pitch: A.pitch / D2R };
    s.dmg = AIM.dmg[0] + (AIM.dmg[1] - AIM.dmg[0]) * d; s.pierce = Math.floor(AIM.pierce[0] + (AIM.pierce[1] - AIM.pierce[0]) * d);
    if (full) Object.assign(s, AIM.full);
    proj.shoot(s, 'aim', { x: h.x + Math.sin(A.yaw) * ARROW.ahead, y: h.y + ARROW.heroY, z: h.z + Math.cos(A.yaw) * ARROW.ahead, yaw: A.yaw });
    A.phase = 'loose'; A.t = 0; A.held = 0; h.moveT = AIM.frames.loose;
  }

  A.step = (inp) => {
    const h = game.hero;
    if (!A.active) {
      const m = h.state === 'attack' && h.kit.moves[h.move];
      if (m && h.move === 'c1' && h.moveT === AIM_AT && inp.held.charge && h.grounded) { enter(h); return true; }
      if (m && m.strafe && h.moveT >= m.strafe[0] && h.moveT < m.strafe[1]) {   // C4: stick slides him, facing held
        const [dx, dz, mag] = stickDir(inp, game.cam.yaw), v = m.strafe[2] * mag / 60;
        h.x += dx * v; h.z += dz * v;
      }
      return false;
    }
    if (h.state !== 'attack' || h.move !== 'aim') { A.active = false; return false; }   // hurt / Musou took over
    // leave on □ (N1 comes out of the buffer), dodge or jump
    if (h.buf === 'attack') { leave(h); return false; }
    if (h.buf === 'charge') h.buf = null;
    if (h.dodgeBuf) { leave(h); h.dodgeBuf = 0; startDodge(h, inp, game.cam.yaw); return true; }
    if (h.jumpBuf) { leave(h); h.jumpBuf = 0; startJump(h); return true; }
    // aim: the stick turns / raises it; the look (mouse, Q/E, right stick: orbit + tilt) turns and raises it with the view
    A.yaw += inp.orbit - inp.mx * AIM.turn / 60;
    A.pitch = Math.max(AIM.pitchMin, Math.min(AIM.pitchMax, A.pitch + inp.my * AIM.pitchRate / 60 - inp.tilt));
    h.yaw = A.yaw; h.vx = h.vz = 0;
    const F = AIM.frames;
    A.t++;
    if (A.phase === 'draw') {
      if (inp.held.charge) A.held++;
      A.d = Math.min(1, A.held / AIM.drawFull);
      h.moveT = Math.round(F.nock + (F.full - F.nock) * A.d);
      if (!inp.held.charge) loose(h);
    } else if (A.phase === 'loose') {
      h.moveT = Math.min(F.end, F.loose + A.t);
      if (h.moveT >= F.end) { A.phase = 'wait'; A.t = 0; h.moveT = F.nock; }
    } else {                                                  // nocked, waiting for △
      h.moveT = F.nock;
      if (inp.held.charge) { A.phase = 'draw'; A.held = 0; A.t = 0; }
      else if (A.t > AIM.grace) leave(h);
    }
    return true;
  };

  /** Over-the-shoulder aim camera (see header), or null. Zooms in as the draw builds. */
  A.shot = () => {
    if (!A.active) return null;
    const d = A.phase === 'draw' ? A.d : 0.6, h = game.hero, c = game.crowd;
    // fx r1: above the heads, pulled back and higher still when soldiers crowd the lens (≈ 2 m behind-right of him), so
    // the path and the target read over the crowd instead of through near-lens bodies
    const bx = h.x - Math.sin(A.yaw) * 2.4 + Math.cos(A.yaw) * 0.7, bz = h.z - Math.cos(A.yaw) * 2.4 - Math.sin(A.yaw) * 0.7;
    let near = 0;
    for (let i = 0; i < c.N; i++) {
      if (c.st[i] === ST.OFF || c.st[i] === ST.DEAD) continue;
      const dd = Math.hypot(c.x[i] - bx, c.z[i] - bz);
      if (dd < 1.8) near = Math.max(near, 1 - dd / 1.8);
    }
    for (const a of game.actors.list) {                        // actors lane: a hero-model officer at the lens (his size)
      if (a.state === 'gone' || a.state === 'down') continue;
      const dd = Math.hypot(a.x - bx, a.z - bz) - a.r + 0.4;
      if (dd < 1.8) near = Math.max(near, 1 - Math.max(0, dd) / 1.8);
    }
    crowdK += (near - crowdK) * (near > crowdK ? 0.3 : 0.05);                 // rise fast when they close in, settle slowly
    return Object.assign(shot, { yaw: A.yaw, dist: 3.2 - 0.5 * d + 1.0 * crowdK, pitch: 0.2 + 0.14 * crowdK - A.pitch * 0.85, fov: 42 - 8 * d,
      height: 2.1 + 0.6 * crowdK + A.pitch * 0.3, side: 0.62, shake: 0.4 });
  };
  return A;
}
