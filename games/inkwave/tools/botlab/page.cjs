// Botlab page test: boots a match, then runs PAGE (a script evaluated in the game page that returns [{ name, ok, info }])
// and prints PASS / FAIL lines + RESULT n/m.
//   MAP=halyard MODE=turf PAGE=path/to/test-page.js tools/botlab/run.sh tools/botlab/page.cjs
// MAP=testbox is a flat test arena defined here (never shipped).
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
require(process.env.S + '/offscreen-boot.cjs');
setTimeout(() => { console.log('WATCHDOG'); app.exit(1); setTimeout(() => process.exit(1), 3000); }, +(process.env.WATCHDOG || 600000));   // (hard exit if a hung page blocks quitting)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const MAP = process.env.MAP || 'halyard', MODE = process.env.MODE || 'turf';
let claimed = false; app.on('browser-window-created', (_, win) => { if (claimed) return; claimed = true;
  if (BrowserWindow.getAllWindows().length > 1) return;
  win.webContents.setBackgroundThrottling(false);
  const errs = [];
  win.webContents.on('console-message', (e) => { const m = String(e.message); if (/error/i.test(String(e.level)) || /TypeError|ReferenceError/.test(m)) errs.push(m.slice(0, 300)); });
  let started = false;
  win.webContents.on('did-finish-load', async () => {
    if (started) return; started = true;
    await win.loadURL('app://inkwave/index.html?autopilot');
    const js = (c) => win.webContents.executeJavaScript(c, true);
    for (let i = 0; i < 80; i++) { if (await js('!!window.__inkwave?.api')) break; await wait(250); }
    await js('window.__inkwave._onPointerUnlock = () => {}; 0');
    if (MAP === 'testbox') await js(`(async () => {
      // test-only arena: a flat 56 x 96 m deck, spawn steps and one wall (zipline target); never shipped
      const { MAPS } = await import('./src/config.js'); const { MAP_LAYOUTS } = await import('./src/world/maps.js');
      if (!MAPS.find((m) => m.id === 'testbox')) MAPS.push({ id: 'testbox', name: 'Test Box', blurb: '', theme: 'day', times: { day: 'day', dusk: 'sunset' } });
      const B = (x0, x1, y0, y1, z0, z1, o = {}) => ({ kind: 'box', min: [x0, y0, z0], max: [x1, y1, z1], color: '#d8d2c4', pattern: 3, ...o });
      MAP_LAYOUTS.testbox = { id: 'testbox', bounds: { minX: -28, maxX: 28, minZ: -48, maxZ: 48 }, spawnPads: [[0, 2.4, -44], [0, 2.4, 44]], spawnBarrier: 4.2,
        single: [B(-28, 28, -1.2, 0, -40, 40)], half: [B(-8, 8, -1.2, 2.4, -48, -40), B(14, 15, 0, 4, -8, 8)], decor: { lamps: [], palms: [], flags: [] } };
      return true; })()`);
    await js(`window.__inkwave.api.startMatch({ mapId: '${MAP}', duration: 180, mode: '${MODE}' })`);
    for (let i = 0; i < 240; i++) { if (await js(`window.__inkwave.match?.state === 'playing'`)) break; await wait(250); }
    try {
      const out = await js(fs.readFileSync(process.env.PAGE, 'utf8'));
      let pass = 0;
      for (const r of out) { console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.info !== undefined ? '  ' + JSON.stringify(r.info) : '')); pass += r.ok; }
      console.log(`RESULT ${pass}/${out.length}`);
    } catch (e) { console.log('HARNESS ERROR', e.message); }
    console.log('console errors:', errs.length ? [...new Set(errs)].slice(0, 5).join(' || ') : 'none');
    app.quit();
  });
});
