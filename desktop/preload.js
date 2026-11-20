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
  store: (k, v) => ipcRenderer.send('cs-store', String(k), v == null ? null : String(v)),
  // Steam lobby transport for "Play with Friends" (only works when started through Steam)
  lobby: {
    create: max => ipcRenderer.invoke('cs-lobby-create', max | 0),
    join: id => ipcRenderer.invoke('cs-lobby-join', String(id)),
    leave: () => ipcRenderer.send('cs-lobby-leave'),
    invite: () => ipcRenderer.send('cs-lobby-invite'),
    launchLobby: () => { try { return ipcRenderer.sendSync('cs-lobby-launch'); } catch (_) { return null; } },
    send: (to, s) => ipcRenderer.send('cs-p2p-send', String(to), String(s)),
    onPacket: f => ipcRenderer.on('cs-p2p', (e, from, d) => f(String(from), String(d))),
    onMembers: f => ipcRenderer.on('cs-lobby-members', (e, list, owner) => f(Array.from(list || [], String), String(owner || ''))),
    onInvite: f => ipcRenderer.on('cs-lobby-joinreq', (e, id) => f(String(id)))
  }
});
