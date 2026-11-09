// Camp Survivor desktop shell (Steam / Windows)
const { app, BrowserWindow, Menu, shell, ipcMain, session } = require('electron');
const path = require('path');

app.setName('Camp Survivor');
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 960, minHeight: 600,
    backgroundColor: '#0e1912', show: false, autoHideMenuBar: true,
    title: 'Camp Survivor', icon: path.join(__dirname, 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // Links (privacy policy etc.) open in the player's normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); }
  });
  // F11 / Alt+Enter: toggle fullscreen
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
}

ipcMain.on('cs-quit', () => app.quit());
ipcMain.on('cs-fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });

app.whenReady().then(() => {
  // Let the game's procedural music start without an extra click.
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(false));
  createWindow();
});
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.on('window-all-closed', () => app.quit());
