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

// Steam achievements: active only once the Steam App ID exists (steam_appid.txt next to the exe)
// and the steamworks.js package is installed. Until then this quietly does nothing.
let steam = null;
try {
  const fs = require('fs');
  const idFile = [path.join(process.cwd(), 'steam_appid.txt'), path.join(path.dirname(process.execPath), 'steam_appid.txt')].find(f => fs.existsSync(f));
  const appId = Number(process.env.STEAM_APP_ID || (idFile ? fs.readFileSync(idFile, 'utf8').trim() : 0));
  if (appId) steam = require('steamworks.js').init(appId);
} catch (e) { steam = null; }
ipcMain.on('cs-ach', (e, id) => {
  try { if (steam && /^[a-z0-9_]{1,32}$/i.test(id)) steam.achievement.activate('ACH_' + id.toUpperCase()); } catch (_) {}
});

ipcMain.on('cs-quit', () => app.quit());
ipcMain.on('cs-fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });

app.whenReady().then(() => {
  // Let the game's procedural music start without an extra click.
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(false));
  createWindow();
});
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.on('window-all-closed', () => app.quit());
