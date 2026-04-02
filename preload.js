// Copyright (c) 2026 Julien Didier
// Licensed under the MIT License
const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    getBackendPort: () => ipcRenderer.invoke('get-backend-port'),
    isElectron: true
});
