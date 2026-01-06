const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
        }
    });

    // Charger le frontend statique Next.js
    mainWindow.loadFile(path.join(__dirname, 'front', 'out', 'index.html'));
}

app.whenReady().then(() => {
    // Lancer le backend Python (PyInstaller)
    const backendPath = path.join(__dirname, 'backend', 'dist', 'snap-exporter-backend');
    backendProcess = spawn(backendPath);

    backendProcess.stdout.on('data', (data) => {
        console.log(`Python: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
    });

    createWindow();
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});
