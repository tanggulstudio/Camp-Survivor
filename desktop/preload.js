const { contextBridge, ipcRenderer } = require('electron');
// Put the save files (synced by Steam Cloud) back into localStorage before the game scripts run.
try {
  const saved = ipcRenderer.sendSync('cs-store-load') || {};
  for (const k in saved) { try { if (localStorage.getItem(k) !== saved[k]) localStorage.setItem(k, saved[k]); } catch (_) {} }
} catch (_) {}
contextBridge.exposeInMainWorld('desktop', {
  platform: 'steam-desktop',
  steam: (() => { try { return ipcRenderer.sendSync('cs-steam'); } catch (_) { return false; } })(),
  quit: () => ipcRenderer.send('cs-quit'),
  toggleFullscreen: () => ipcRenderer.send('cs-fullscreen'),
  achieve: (id) => ipcRenderer.send('cs-ach', String(id)),
  store: (k, v) => ipcRenderer.send('cs-store', String(k), v == null ? null : String(v))
});
