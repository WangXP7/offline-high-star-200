// In-match footage for the animation reel (page-side spec for tools/reel.mjs, screenshot mode, real HUD).
// A scripted run from the spawn deck: run + fire, drop off the deck, swim through fresh ink, dolphin-jump out,
// strafe-fire, aim and throw a splat bomb, then run on with the camera swinging round. Bots play normally.
(() => {
  const g = window.__inkwave, d = g.debug;
  const segs = [{ order: 90, title: 'In a match', sub: 'The same animation driving live gameplay: run, fire, swim, jump, strafe, throw', dur: 10.0 }];
  const script = [
    [0.0, () => { d.key('KeyW', true); d.fire(true); }],
    [2.1, () => { d.fire(false); d.key('ShiftLeft', true); }],
    [3.5, () => d.key('Space', true)], [3.8, () => d.key('Space', false)],
    [4.5, () => { d.key('ShiftLeft', false); d.key('KeyW', false); d.key('KeyA', true); d.fire(true); }],
    [6.0, () => { d.fire(false); d.key('KeyA', false); g.input.mouse.right = true; }],
    [6.8, () => { g.input.mouse.right = false; }],
    [7.2, () => { d.key('KeyW', true); d.fire(true); }],
    [9.6, () => { d.fire(false); d.key('KeyW', false); }],
  ];
  let fired;
  window.REEL = {
    segs,
    init() {},
    begin(i) {
      d.freeze();
      const a = g.match.local;
      if (a && !a.alive) a.respawn();
      g.hud?.hideSplatted?.();
      g.rig.yaw = 0; g.rig.pitch = -0.12;
      fired = new Set();
      d.step(50);
      return { order: segs[i].order, title: segs[i].title, sub: segs[i].sub, dur: segs[i].dur };
    },
    frame(i, f, fps) {
      const t = f / fps;
      script.forEach(([et, fn], k) => { if (et <= t + 1e-6 && !fired.has(k)) { fired.add(k); fn(); } });
      const a = g.match.local;
      if (a) a.invuln = Math.max(a.invuln, 0.5);            // no deaths during the shot
      if (t > 7.2) g.rig.yaw += 0.55 / fps;                 // slow swing round while running
      if (t > 1.0 && t < 4.4) g.rig.pitch = -0.28;          // look down at the ink while swimming
      else g.rig.pitch += (-0.1 - g.rig.pitch) * 0.08;
      d.step(1000 / fps);
      return null;
    },
  };
})();
