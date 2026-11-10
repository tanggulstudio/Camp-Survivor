const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  platform: 'steam-desktop',
  quit: () => ipcRenderer.send('cs-quit'),
  toggleFullscreen: () => ipcRenderer.send('cs-fullscreen'),
  achieve: (id) => ipcRenderer.send('cs-ach', String(id))
});
