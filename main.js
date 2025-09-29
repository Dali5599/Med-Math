
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('node-pty');

// Keep a global reference of the window object
let mainWindow;
let terminals = new Map(); // Store active terminal sessions

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Add your app icon
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Clean up all terminal sessions
    terminals.forEach((terminal) => {
      terminal.kill();
    });
    terminals.clear();
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for Terminal Operations

// Create new terminal session
ipcMain.handle('terminal-create', async (event, sessionId) => {
  try {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
    const terminal = spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.env.USERPROFILE,
      env: process.env
    });

    terminals.set(sessionId, terminal);

    // Handle terminal output
    terminal.onData((data) => {
      mainWindow?.webContents.send('terminal-output', sessionId, data);
    });

    // Handle terminal exit
    terminal.onExit((code, signal) => {
      terminals.delete(sessionId);
      mainWindow?.webContents.send('terminal-exit', sessionId, code, signal);
    });

    return { success: true, sessionId };
  } catch (error) {
    console.error('Failed to create terminal:', error);
    return { success: false, error: error.message };
  }
});

// Write to terminal
ipcMain.handle('terminal-write', async (event, sessionId, data) => {
  const terminal = terminals.get(sessionId);
  if (terminal) {
    terminal.write(data);
    return { success: true };
  }
  return { success: false, error: 'Terminal session not found' };
});

// Resize terminal
ipcMain.handle('terminal-resize', async (event, sessionId, cols, rows) => {
  const terminal = terminals.get(sessionId);
  if (terminal) {
    terminal.resize(cols, rows);
    return { success: true };
  }
  return { success: false, error: 'Terminal session not found' };
});

// Kill terminal session
ipcMain.handle('terminal-kill', async (event, sessionId) => {
  const terminal = terminals.get(sessionId);
  if (terminal) {
    terminal.kill();
    terminals.delete(sessionId);
    return { success: true };
  }
  return { success: false, error: 'Terminal session not found' };
});

// Execute single command (for quick operations)
ipcMain.handle('execute-command', async (event, command, cwd = null) => {
  return new Promise((resolve) => {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
    const args = process.platform === 'win32' ? ['-Command', command] : ['-c', command];
    
    const child = spawn(shell, args, {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: cwd || process.env.HOME || process.env.USERPROFILE,
      env: process.env
    });

    let output = '';
    let error = '';

    child.onData((data) => {
      output += data;
    });

    child.onExit((code) => {
      resolve({
        success: code === 0,
        output,
        error,
        exitCode: code
      });
    });
  });
});

// Get system information
ipcMain.handle('get-system-info', async () => {
  const os = require('os');
  return {
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    username: os.userInfo().username,
    homedir: os.homedir(),
    shell: process.env.SHELL || process.env.ComSpec
  };
});

// File system operations (for SSH key management, etc.)
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
