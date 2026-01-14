const { app, BrowserWindow, protocol, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

let mainWindow;
let backendProcess;
let loadURL;
let backendPort = 8000;

function findAvailablePort(startPort) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, '127.0.0.1');
        server.on('listening', () => {
            server.close();
            resolve(startPort);
        });
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// Import dynamique pour electron-serve (ESM dans CommonJS)
let serve;
const isDev = !app.isPackaged;

const servePromise = (async () => {
    if (isDev) {
        loadURL = async (window) => {
            await window.loadURL('http://localhost:3000');
        };
    } else {
        const module = await import('electron-serve');
        serve = module.default;
        loadURL = serve({ directory: path.join(__dirname, 'front', 'out') });
    }
})();

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    try {
        if (!loadURL) await servePromise;
        await loadURL(mainWindow);
        //mainWindow.webContents.openDevTools();
    } catch (err) {
        console.error("Failed to load frontend:", err);
    }
}

// Handler pour la sélection de dossier
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});

// Handler pour récupérer le port du backend
ipcMain.handle('get-backend-port', () => {
    return backendPort;
});

app.whenReady().then(async () => {
    const shouldStartBackend = !process.argv.includes('--no-backend');

    if (shouldStartBackend) {
        // Trouver un port libre pour le backend
        backendPort = await findAvailablePort(8000);
        console.log(`Using port ${backendPort} for backend`);

        // Lancer le backend Python (PyInstaller)
        const isWindows = process.platform === 'win32';
        const backendExecutable = isWindows ? 'snap-exporter-backend.exe' : 'snap-exporter-backend';
        
        // Si l'application est packagée, le backend se trouve dans les ressources
        let backendPath;
        if (app.isPackaged) {
            backendPath = path.join(process.resourcesPath, 'backend', 'dist', backendExecutable);
        } else {
            backendPath = path.join(__dirname, 'backend', 'dist', backendExecutable);
        }

        console.log(`Starting backend at: ${backendPath}`);
        
        backendProcess = spawn(backendPath, ['--port', backendPort.toString()]);

        backendProcess.stdout.on('data', (data) => {
            console.log(`Python: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`Python error: ${data}`);
        });

        backendProcess.on('error', (err) => {
            console.error('Failed to start backend process:', err);
        });
    } else {
        backendPort = 8000;
        console.log('Backend execution skipped due to --no-backend flag. Assuming backend is running on port 8000.');
    }

    createWindow();
});

app.on('window-all-closed', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
