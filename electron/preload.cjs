const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process
// to use ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Flags
    isDesktop: true,
    
    // Commands
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    
    // Extend with save file, db queries, etc.
  }
);
