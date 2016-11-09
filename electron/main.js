const electron = require('electron');
const _ = require('lodash');
const fs = require('fs');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const lib = require('./../lib/index');
const stream = require('stream');
const path = require('path');

let mainWindow;

process.chdir(process.env.CWD || path.dirname(process.execPath).replace(/\/screeps_server\.app.*$/,''));

function createWindow () {

    mainWindow = new BrowserWindow({
        width: 900,
        height: 500,
        minWidth: 300,
        minHeight: 300,
        title: 'Screeps server',
        icon: `${__dirname}/ui/icon.png`
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file://${__dirname}/ui/index.html`);
    //mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

ipcMain.once('ready', () => {

    lib.start(undefined, new stream.Writable({
            write(chunk, encoding, callback) {
                mainWindow.webContents.send('launcherOutput', chunk.toString('utf8'));
                callback();
            }
        }))
        .then(result => {
            mainWindow.webContents.send('started', result);
        })
        .catch(err => {
            console.error(err);
            process.exit();
        });
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
