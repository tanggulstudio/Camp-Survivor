// Camp Survivor desktop shell (Steam / Windows)
const { app, BrowserWindow, Menu, shell, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setName('Camp Survivor');
// The full game and the demo share one save folder, so a demo run carries over to the full game.
app.setPath('userData', path.join(app.getPath('appData'), 'Camp Survivor'));
let win;

// ---- Steam (steamworks.js) ----
// Starts only when an App ID is known: steam_appid.txt next to the exe (Steam adds the ID itself
// when the game is launched from the Steam client) or the STEAM_APP_ID variable. Must run before the window exists.
let steam = null;
try {
  const idFile = [path.join(process.cwd(), 'steam_appid.txt'), path.join(path.dirname(process.execPath), 'steam_appid.txt')].find(f => fs.existsSync(f));
  const appId = Number(process.env.STEAM_APP_ID || process.env.SteamAppId || (idFile ? fs.readFileSync(idFile, 'utf8').trim() : 0));
  if (appId) steam = require('steamworks.js').init(appId);
} catch (e) { steam = null; }

// ---- save files for Steam Cloud ----
// The game keeps its saves in localStorage; every write is mirrored to %APPDATA%/Camp Survivor/saves/<key>.json.
// In Steamworks, Auto-Cloud syncs that folder. On start the files are loaded back into the game.
const SAVE_DIR = path.join(app.getPath('userData'), 'saves');
const okKey = k => typeof k === 'string' && /^[a-z0-9_-]{1,48}$/i.test(k);
ipcMain.on('cs-store', (e, k, v) => {
  if (!okKey(k)) return;
  try {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
    const f = path.join(SAVE_DIR, k + '.json');
    if (v == null) { fs.rmSync(f, { force: true }); return; }
    const tmp = f + '.tmp';
    fs.writeFileSync(tmp, String(v));
    fs.renameSync(tmp, f);
  } catch (_) {}
});
ipcMain.on('cs-store-load', e => {
  const out = {};
  try {
    for (const n of fs.readdirSync(SAVE_DIR)) {
      if (!n.endsWith('.json')) continue;
      const k = n.slice(0, -5);
      if (okKey(k)) out[k] = fs.readFileSync(path.join(SAVE_DIR, n), 'utf8');
    }
  } catch (_) {}
  e.returnValue = out;
});

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

  // Links (store page, privacy policy) open in the Steam overlay when available, otherwise the normal browser.
  const openUrl = url => {
    try { if (steam && steam.overlay && /^https:\/\/store\.steampowered\.com\//.test(url)) { steam.overlay.activateToWebPage(url); return; } } catch (_) {}
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
  };
  win.webContents.setWindowOpenHandler(({ url }) => { openUrl(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); openUrl(url); } });
  // F11 / Alt+Enter: toggle fullscreen
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
}

ipcMain.on('cs-ach', (e, id) => {
  try { if (steam && /^[a-z0-9_]{1,32}$/i.test(id)) steam.achievement.activate('ACH_' + id.toUpperCase()); } catch (_) {}
});
ipcMain.on('cs-quit', () => app.quit());
ipcMain.on('cs-fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.on('cs-steam', e => { e.returnValue = !!steam; });

// ---- Steam lobbies + P2P packets for "Play with Friends" ----
// The game keeps its own host/client protocol; Steam only carries the messages (JSON text) between players.
// Numbers below are steamworks.js enum values: LobbyType.FriendsOnly = 1, SendType.Reliable = 2,
// SteamCallback.P2PSessionRequest = 6, SteamCallback.GameLobbyJoinRequested = 8.
let lobby = null, lastMembers = '', launchLobby = null;
{ const i = process.argv.indexOf('+connect_lobby'); if (i >= 0 && process.argv[i + 1]) launchLobby = process.argv[i + 1]; }
const LOBBY_MIN = 0x0180000000000000n;// lobby IDs sit above every player ID
const bigints = v => { const out = []; const walk = (x, d) => { if (d > 3 || x == null) return; if (typeof x === 'bigint') out.push(x); else if (typeof x === 'object') for (const k in x) walk(x[k], d + 1); }; walk(v, 0); return out; };
const lobbyInfo = () => ({ id: String(lobby.id), owner: String(lobby.getOwner().steamId64), me: String(steam.localplayer.getSteamId().steamId64), name: steam.localplayer.getName() });
const toWin = (ch, ...a) => { try { if (win && !win.isDestroyed()) win.webContents.send(ch, ...a); } catch (_) {} };
ipcMain.handle('cs-lobby-create', async (e, max) => {
  if (!steam) throw new Error('no-steam');
  if (lobby) { try { lobby.leave(); } catch (_) {} }
  lobby = await steam.matchmaking.createLobby(1, Math.max(2, Math.min(8, max | 0 || 4)));
  try { lobby.setJoinable(true); } catch (_) {}
  try { steam.localplayer.setRichPresence('connect', '+connect_lobby ' + lobby.id); } catch (_) {}
  lastMembers = ''; return lobbyInfo();
});
ipcMain.handle('cs-lobby-join', async (e, id) => {
  if (!steam) throw new Error('no-steam');
  if (lobby) { try { lobby.leave(); } catch (_) {} }
  lobby = await steam.matchmaking.joinLobby(BigInt(id));
  lastMembers = ''; return lobbyInfo();
});
ipcMain.on('cs-lobby-leave', () => { try { if (lobby) lobby.leave(); } catch (_) {} lobby = null; lastMembers = ''; try { steam && steam.localplayer.setRichPresence('connect', null); } catch (_) {} });
ipcMain.on('cs-lobby-invite', () => { try { if (lobby) steam.overlay.activateInviteDialog(lobby.id); } catch (_) {} });
ipcMain.on('cs-lobby-launch', e => { e.returnValue = launchLobby; launchLobby = null; });
ipcMain.on('cs-p2p-send', (e, to, data) => { try { if (steam) steam.networking.sendP2PPacket(BigInt(to), 2, Buffer.from(String(data), 'utf8')); } catch (_) {} });
if (steam) {
  try { steam.callback.register(6, v => { for (const id of bigints(v)) if (id < LOBBY_MIN) try { steam.networking.acceptP2PSession(id); } catch (_) {} }); } catch (_) {}
  try { steam.callback.register(8, v => { const id = bigints(v).find(x => x >= LOBBY_MIN); if (id) toWin('cs-lobby-joinreq', String(id)); }); } catch (_) {}
  // Packets: read everything waiting, ~60 times a second.
  setInterval(() => {
    try { let n, guard = 0; while ((n = steam.networking.isP2PPacketAvailable()) > 0 && guard++ < 200) { const p = steam.networking.readP2PPacket(n); toWin('cs-p2p', String(p.steamId.steamId64), p.data.toString('utf8')); } } catch (_) {}
  }, 16);
  // Members: tell the game when someone joins or leaves the lobby.
  setInterval(() => {
    if (!lobby) return;
    try { const m = lobby.getMembers().map(x => String(x.steamId64)), key = m.join(','); if (key !== lastMembers) { lastMembers = key; for (const id of m) try { steam.networking.acceptP2PSession(BigInt(id)); } catch (_) {} toWin('cs-lobby-members', m, String(lobby.getOwner().steamId64)); } } catch (_) {}
  }, 500);
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(false));
  createWindow();
});
// Let the game's procedural music start without an extra click.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.on('window-all-closed', () => app.quit());

// Steam overlay (Shift+Tab) has to be enabled at the very end of main.js.
if (steam) { try { require('steamworks.js').electronEnableSteamOverlay(); } catch (_) {} }
