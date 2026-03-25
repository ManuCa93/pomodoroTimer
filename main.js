const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow    = null;
let miniTimerWin  = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'favicon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false   // serve per usare require() nel renderer
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        if (miniTimerWin && !miniTimerWin.isDestroyed()) miniTimerWin.close();
        mainWindow = null;
    });

    mainWindow.on('minimize', () => {
        // Quando la finestra principale si minimizza, il popup rimane visibile
        if (miniTimerWin && !miniTimerWin.isDestroyed()) {
            miniTimerWin.show();
            miniTimerWin.setAlwaysOnTop(true, 'floating'); // rinforza always on top
        }
    });

}

ipcMain.on('open-mini-timer', () => {
    // Toggle: se già aperto, chiudi
    if (miniTimerWin && !miniTimerWin.isDestroyed()) {
        miniTimerWin.close();
        miniTimerWin = null;
        return;
    }

    miniTimerWin = new BrowserWindow({
        width: 210,
        height: 80,
        alwaysOnTop: true,      // sempre sopra tutto
        
        frame: false,           // niente barra del titolo OS
        transparent: true,      // bordi trasparenti
        resizable: false,
        skipTaskbar: true,      // non appare nella taskbar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    miniTimerWin.loadFile('mini-timer-popup.html');
    miniTimerWin.on('closed', () => { miniTimerWin = null; });
});

app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createMainWindow(); });
