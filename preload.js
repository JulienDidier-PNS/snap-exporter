const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    getBackendPort: () => ipcRenderer.invoke('get-backend-port'),
});
