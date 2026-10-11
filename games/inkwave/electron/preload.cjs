// Bridge exposed to the game page as window.inkwaveNative (desktop app only; the web build never sees it).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('inkwaveNative', {
  platform: process.platform,
  isFullScreen: () => ipcRenderer.sendSync('fs:get'),
  setFullScreen: (on) => ipcRenderer.send('fs:set', !!on),
  onFullScreenChange: (cb) => { ipcRenderer.on('fs:changed', (_e, on) => cb(!!on)); },
});
