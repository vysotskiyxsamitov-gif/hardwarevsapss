/* HardwareVS — настольное приложение: открывает сайт в своём окне. */
'use strict';
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

const SITE = 'https://vysotskiyxsamitov-gif.github.io/hardwarevs/index.html';
const SITE_ORIGIN = 'https://vysotskiyxsamitov-gif.github.io';
const SITE_PATH = '/hardwarevs/';

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;

function isOurSite(url) {
    try { const u = new URL(url); return u.origin === SITE_ORIGIN && u.pathname.indexOf(SITE_PATH) === 0; }
    catch (e) { return false; }
}

function create() {
    Menu.setApplicationMenu(null);
    win = new BrowserWindow({
        width: 1280, height: 820, minWidth: 420, minHeight: 600,
        backgroundColor: '#08090b', title: 'HardwareVS', autoHideMenuBar: true,
        icon: path.join(__dirname, 'build', 'icon.png'),
        webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false }
    });

    win.loadURL(SITE);

    // Свои страницы остаются в приложении, любые чужие ссылки открываются в обычном браузере
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (isOurSite(url)) { win.loadURL(url); } else { shell.openExternal(url); }
        return { action: 'deny' };
    });
    win.webContents.on('will-navigate', (e, url) => {
        if (!isOurSite(url) && url.indexOf('file:') !== 0) { e.preventDefault(); shell.openExternal(url); }
    });

    // Нет интернета — показываем страницу с кнопкой «Повторить»
    win.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
        if (isMain && code !== -3) { win.loadFile(path.join(__dirname, 'offline.html')); }
    });

    win.on('closed', () => { win = null; });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
