// Animation-system reel, recorded in tools/character-lab.html (page-side spec for tools/reel.mjs).
(() => {
  const lab = window.lab;
  const THREE = lab.THREE, S = lab.S;
  const _h = new THREE.Vector3();
  const hero = () => lab.hero;
  const look = (px, py, pz, tx, ty, tz) => { lab.camera.position.set(px, py, pz); lab.camera.lookAt(tx, ty, tz); };
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const fidget = (id) => { const h = hero(); h.fidget = id; h.fidgetT = 0; h.lastFidget = id; h.nextFidget = 99; };
  const hit = (x, z, amp) => lab.trigger('hit', { x, z, amp, valueOf() { return amp; } });
  const setDance = (name, v) => { lab.dance(null); lab.dance(name); hero().danceVar = v; };
  // damped follow of the hero root (reset per segment)
  const C = { x: 0, y: 0, z: 0, ty: 0, on: false };
  function track(dt, k = 5) {
    const p = hero().root.position;
    if (!C.on) { C.x = p.x; C.y = p.y; C.z = p.z; C.on = true; }
    C.x = damp(C.x, p.x, k, dt); C.y = damp(C.y, p.y, k * 0.8, dt); C.z = damp(C.z, p.z, k, dt);
    return C;
  }
  const travel = (o) => lab.go({ travel: true, follow: false, t: 0.2, ...o });
  const still = (o) => lab.go({ follow: false, t: 0.3, ...o });

  const segs = [
    { order: 1, title: 'Idle', sub: 'Breathing, weight shifts and fidgets: goggles, weapon twirl, look-around', dur: 6.0,
      setup() { still({ weapon: 'shooter', style: { hair: 0, skin: 1, outfit: 1 }, t: 1.0 }); hero().nextFidget = 99; },
      events: [[0.3, () => fidget(0)], [2.0, () => fidget(1)], [3.6, () => fidget(2)]],
      cam(t) { const a = 0.62 - 0.11 * t; look(Math.sin(a) * 2.45, 1.2, Math.cos(a) * 2.45, 0, 0.82, 0); } },

    { order: 2, title: 'Run start & skid stop', sub: 'Stride matched to speed, feet locked to the ground, brake and settle', dur: 4.8,
      setup() { travel({ weapon: 'shooter', style: { hair: 1, skin: 0, outfit: 2 }, yaw: Math.PI / 2 }); },
      events: [[0.25, () => lab.move(1, 0, 6)], [2.55, () => lab.move(0, 0)]],
      cam(t, dt) { const c = track(dt, 4.5); look(c.x - 0.9, 1.15, 3.4, c.x + 0.8, 0.8, 0); } },

    { order: 3, title: 'Turns, pivots & strafing', sub: '180° pivot, 90° turn steps, strafe crossovers, backpedal', dur: 6.6,
      setup() { travel({ weapon: 'blaster', style: { hair: 2, skin: 2, outfit: 0 }, yaw: 0 }); },
      events: [[0.2, () => lab.move(0, 1, 6)], [1.25, () => lab.move(0, -1, 6)], [2.3, () => lab.move(1, 0, 6)],
        [3.2, () => { lab.face('fixed', 0); lab.move(-1, 0, 4.6); }], [4.25, () => lab.move(0, -1, 4.2)], [5.4, () => { lab.move(0, 0); lab.face('move'); }]],
      cam(t, dt) { const c = track(dt, 6); look(c.x - 2.9, 1.75, c.z + 2.9, c.x, 0.8, c.z); } },

    { order: 4, title: 'Stairs', sub: 'Foot IK plants every step; the hips drop onto the lower foot', dur: 4.2,
      setup() { travel({ terrain: 'stairs', weapon: 'roller', style: { hair: 3, skin: 1, outfit: 3 }, yaw: 0 }); },
      events: [[0.2, () => lab.move(0, 1, 4.0)], [2.9, () => lab.move(0, 0)]],
      cam(t, dt) { const c = track(dt, 4); look(4.3, 1.3 + c.y * 0.6, c.z + 0.2, 0, 0.78 + c.y, c.z + 0.8); } },

    { order: 5, title: 'Ramps & jumps', sub: 'Anticipation squash, tucked legs, reaching fall, landing squash scaled by impact', dur: 4.4,
      setup() { travel({ terrain: 'ramp', weapon: 'charger', style: { hair: 0, skin: 3, outfit: 1 }, yaw: 0 }); },
      events: [[0.2, () => lab.move(0, 1, 6)], [0.95, () => lab.jump()], [2.05, () => lab.jump()], [3.0, () => lab.move(0, 0)]],
      cam(t, dt) { const c = track(dt, 4); look(5.4, 1.55 + c.y * 0.5, c.z + 0.4, 0, 0.9 + c.y, c.z + 1.0); } },

    { order: 6, title: 'Shooter', sub: 'Aim tracking with upper-body twist, recoil and settle', dur: 3.3,
      setup() { still({ weapon: 'shooter', autoFire: true, state: { firing: true }, style: { hair: 1, skin: 2, outfit: 0 } }); },
      tick(t) { S.aimPitch = 0.32 * Math.sin(t * 1.9); },
      cam(t) { look(1.9 - 0.15 * t, 1.32, 1.7 + 0.1 * t, 0.05, 0.98, 0.35); } },

    { order: 7, title: 'Roller', sub: 'Leaning push, then the overhead flick with wind-up and follow-through', dur: 3.8,
      setup() { travel({ weapon: 'roller', style: { hair: 2, skin: 1, outfit: 2 }, yaw: 0, state: { rolling: true } }); },
      events: [[0.1, () => lab.move(0, 1, 4.4)], [1.8, () => { lab.move(0, 0); S.rolling = false; }], [2.05, () => lab.trigger('flick')], [2.85, () => lab.trigger('flick')]],
      cam(t, dt) { const c = track(dt, 4); look(c.x + 2.7, 1.35, c.z + 2.3, c.x, 0.72, c.z + 0.4); } },

    { order: 8, title: 'Charger', sub: 'Charge breathing, full-charge focus, release snap', dur: 3.5,
      setup() { still({ weapon: 'charger', autoFire: true, state: { firing: true }, style: { hair: 3, skin: 0, outfit: 1 }, t: 0.25 }); },
      cam(t) { look(2.9, 1.35, 1.45 + 0.1 * t, 0, 0.95, 0.45); } },

    { order: 9, title: 'Blaster & splat bomb', sub: 'Heavy kick; bomb held cocked behind the head, then a whip throw', dur: 3.9,
      setup() { still({ weapon: 'blaster', state: { firing: true }, style: { hair: 0, skin: 2, outfit: 3 }, t: 0.2 }); },
      events: [[0.25, () => lab.trigger('shoot')], [1.05, () => lab.trigger('shoot')], [1.6, () => { S.firing = false; }],
        [1.85, () => { S.subAim = true; }], [2.75, () => { lab.trigger('throw'); S.subAim = false; }]],
      cam(t) { look(1.6, 1.3, 2.1, 0, 0.95, 0.2); } },

    { order: 10, title: 'Hit reactions', sub: 'Directional flinch from the left, right, front and back, plus enemy-ink splotches', dur: 3.8,
      setup() { still({ weapon: 'shooter', style: { hair: 1, skin: 3, outfit: 0 } }); },
      events: [[0.3, () => { hit(1, 0, 1); lab.hurt(0.25); }], [1.2, () => { hit(-1, 0, 1); lab.hurt(0.4); }], [2.1, () => { hit(0, 1, 1.1); lab.hurt(0.5); }], [2.9, () => { hit(0, -1, 1.2); lab.hurt(0.65); }]],
      cam(t) { look(0.9, 1.25, 2.6, 0, 0.9, 0); } },

    { order: 11, title: 'Squid form', sub: 'Transform pop, dry-ground hops, a dip into ink, pop back out', dur: 5.4,
      setup() { still({ weapon: 'shooter', style: { hair: 2, skin: 0, outfit: 2 }, isLocal: true }); C.ty = 1; C.x = 0; },
      events: [[0.45, () => lab.form('squid')], [1.3, () => lab.loco('run')], [2.75, () => { lab.form('swim'); lab.loco('run'); }], [3.9, () => lab.loco('idle')], [4.1, () => { lab.form('kid'); lab.loco('idle'); }]],
      cam(t, dt) {
        // blend three framings: kid (1,0) · dry squid (0,0) · swimming (0,1)
        const k = (C.ty = damp(C.ty, S.form === 'kid' ? 1 : 0, 3.5, dt));
        const w = (C.x = damp(C.x || 0, S.form === 'swim' ? 1 : 0, 3.0, dt));
        const px = 1.1 + 0.85 * k + 0.2 * w, py = 1.05 + 0.1 * k + 1.2 * w, pz = 1.3 + 0.95 * k + 0.7 * w;
        look(px, py, pz, 0, (0.15 + 0.63 * k) * (1 - w), 0.1 + 0.05 * k);
      } },

    { order: 13, title: 'Face', sub: 'Blinks and eye darts; focus, wince, worry, determined and tired expressions', dur: 5.6,
      setup() { still({ weapon: 'shooter', style: { hair: 3, skin: 1, outfit: 1, eyes: 1 }, t: 0.5 }); C.on = false; },
      events: [[0.5, () => { S.firing = true; }], [1.4, () => { S.firing = false; }], [1.6, () => hit(0.7, 0.7, 0.8)],
        [2.4, () => { S.lowInk = true; S.ink = 0.08; }], [3.3, () => { S.lowInk = false; S.ink = 0.9; S.special = 1; }], [4.4, () => { S.special = 0; S.hp = 0.2; }]],
      cam(t, dt) {
        const h = hero();
        if (h.getHeadPosition) h.getHeadPosition(_h); else _h.copy(h.root.position).setY(1.2);
        if (!C.on) { C.x = _h.x; C.y = _h.y; C.z = _h.z; C.on = true; }
        C.x = damp(C.x, _h.x, 6, dt); C.y = damp(C.y, _h.y, 6, dt); C.z = damp(C.z, _h.z, 6, dt);
        look(C.x + 0.12, C.y + 0.05, C.z + 0.66, C.x, C.y - 0.02, C.z);
      } },

    { order: 14, title: 'Victory & defeat', sub: 'Three victory dances and a defeat slump; each squidkid picks its own', dur: 9.2,
      setup() { still({ dance: 'victory', weapon: 'shooter', style: { hair: 1, skin: 2, outfit: 3 }, t: 0.1 }); hero().danceVar = 0; },
      events: [[2.5, () => setDance('victory', 1)], [4.9, () => setDance('victory', 2)], [7.0, () => setDance('defeat', 0)]],
      cam(t) { const a = 0.32 - 0.07 * t; look(Math.sin(a) * 3.4, 1.3, Math.cos(a) * 3.4, 0, 0.85, 0); } },

    { order: 15, title: 'The squad', sub: 'Hair styles, skin tones, outfits and weapons, all animating together', dur: 3.6,
      setup() { lab.go({ lineup: true, follow: false, t: 0.6 }); },
      cam(t) { const x = -2.4 + 1.33 * t; look(x, 1.25, 4.6, x * 0.85, 0.78, 0); } },
  ];

  window.REEL = {
    segs,
    init() { window.requestAnimationFrame = () => 0; document.body.classList.add('hide'); },
    begin(i) { const s = segs[i]; C.on = false; s._fired = new Set(); s.setup(); return { order: s.order, title: s.title, sub: s.sub, dur: s.dur }; },
    frame(i, f, fps, cap = true) {
      const s = segs[i], dt = 1 / fps, t = f / fps;
      if (s.events) s.events.forEach(([et, fn], k) => { if (et <= t + 1e-6 && !s._fired.has(k)) { s._fired.add(k); fn(); } });
      if (s.tick) s.tick(t, dt);
      if (s.cam) s.cam(t, dt);
      lab.step(dt);
      return cap ? lab.renderer.domElement.toDataURL('image/jpeg', 0.93) : '';
    },
  };
})();
