const electron = require('electron');
const remoteMain = require('@electron/remote/main');
const _ = require('lodash');
const fs = require('fs');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const lib = require('./../lib/index');
const stream = require('stream');
const path = require('path');
global.greenworks = require('./greenworks/greenworks');
if(!global.greenworks.initAPI()) {
    throw new Error('Error on initializing Steam API');
}
remoteMain.initialize();

let mainWindow, modsWindow;

process.chdir(process.env.CWD || path.dirname(process.execPath).replace(/\/screeps_server\.app.*$/,''));

function createWindow () {

    mainWindow = new BrowserWindow({
        width: 900,
        height: 500,
        minWidth: 300,
        minHeight: 300,
        title: 'Screeps server',
        icon: `${__dirname}/ui/icon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file://${__dirname}/ui/index.html`);
    remoteMain.enable(mainWindow.webContents);
    //mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
        if(modsWindow) {
            modsWindow.close();
            modsWindow = null;
        }

    });
}

ipcMain.once('ready', () => {

    const nodeBin = path.join(
        process.resourcesPath || path.dirname(process.execPath),
        process.platform === 'win32' ? 'node.exe' : 'node'
    );

    lib.start(undefined, new stream.Writable({
            write(chunk, encoding, callback) {
                mainWindow.webContents.send('launcherOutput', chunk.toString('utf8'));
                callback();
            }
        }), nodeBin)
        .then(result => {
            mainWindow.webContents.send('started', {
                gamePort: result.gamePort,
                cliPort: result.cliPort,
                storagePort: result.storagePort,
                logdir: result.logdir
            });
        })
        .catch(err => {
            console.error(err);
            process.exit();
        });
});

ipcMain.on('openMods', () => {
    if(modsWindow) {
        modsWindow.focus();
    }
    else {
        modsWindow = new BrowserWindow({
            width: 500,
            height: 570,
            minWidth: 500,
            minHeight: 300,
            title: 'Mods',
            icon: `${__dirname}/ui/icon.png`,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        modsWindow.setMenu(null);
        modsWindow.loadURL(`file://${__dirname}/ui/mods/mods.html`);
        remoteMain.enable(modsWindow.webContents);
        //modsWindow.webContents.openDevTools();
        modsWindow.on('closed', function () {
            modsWindow = null;
        });
    }
});

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
