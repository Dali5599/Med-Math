
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Terminal operations
  terminal: {
    create: (sessionId) => ipcRenderer.invoke('terminal-create', sessionId),
    write: (sessionId, data) => ipcRenderer.invoke('terminal-write', sessionId, data),
    resize: (sessionId, cols, rows) => ipcRenderer.invoke('terminal-resize', sessionId, cols, rows),
    kill: (sessionId) => ipcRenderer.invoke('terminal-kill', sessionId),
    
    // Event listeners
    onOutput: (callback) => {
      ipcRenderer.on('terminal-output', (event, sessionId, data) => {
        callback(sessionId, data);
      });
    },
    onExit: (callback) => {
      ipcRenderer.on('terminal-exit', (event, sessionId, code, signal) => {
        callback(sessionId, code, signal);
      });
    },
    
    // Remove listeners
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('terminal-output');
      ipcRenderer.removeAllListeners('terminal-exit');
    }
  },

  // System operations
  system: {
    executeCommand: (command, cwd) => ipcRenderer.invoke('execute-command', command, cwd),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info')
  },

  // File operations
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content)
  },

  // Utility functions
  isElectron: true,
  platform: process.platform
});

// Security: Remove Node.js globals in renderer
delete window.require;
delete window.exports;
delete window.module;
