
# 🚀 Electron Migration Guide - Real Terminal Integration

This guide will help you migrate your React application to Electron with full terminal functionality using `node-pty` and `xterm.js`.

## 📋 Prerequisites

- Node.js 18+ installed
- Your exported React project from Readdy.ai
- Basic understanding of Electron architecture

## 🔧 Step 1: Install Electron Dependencies

```bash
# Core Electron dependencies
npm install --save-dev electron electron-builder concurrently wait-on

# Terminal functionality
npm install node-pty

# Development dependencies
npm install --save-dev @types/node
```

## 📁 Step 2: Project Structure Setup

Create the following Electron-specific files in your project root:

```
your-project/
├── electron/
│   ├── main.ts              # Main Electron process
│   ├── preload.ts           # Preload script for IPC
│   └── terminal.ts          # Terminal process manager
├── src/                     # Your existing React code
└── package.json             # Updated with Electron scripts
```

## 🔌 Step 3: Main Electron Process

Create `electron/main.ts`:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn } from 'node-pty';
import { TerminalManager } from './terminal';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow;
let terminalManager: TerminalManager;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../assets/icon.png'), // Add your app icon
  });

  // Load the React app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Initialize terminal manager
  terminalManager = new TerminalManager(mainWindow);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Terminal IPC handlers
ipcMain.handle('terminal:create', async (event, options) => {
  return terminalManager.createTerminal(options);
});

ipcMain.handle('terminal:write', async (event, terminalId, data) => {
  return terminalManager.writeToTerminal(terminalId, data);
});

ipcMain.handle('terminal:resize', async (event, terminalId, cols, rows) => {
  return terminalManager.resizeTerminal(terminalId, cols, rows);
});

ipcMain.handle('terminal:kill', async (event, terminalId) => {
  return terminalManager.killTerminal(terminalId);
});
```

## 🔄 Step 4: Terminal Manager

Create `electron/terminal.ts`:

```typescript
import { spawn, IPty } from 'node-pty';
import { BrowserWindow } from 'electron';
import * as os from 'os';

export interface TerminalOptions {
  shell?: string;
  cwd?: string;
  env?: { [key: string]: string };
}

export class TerminalManager {
  private terminals: Map<string, IPty> = new Map();
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  createTerminal(options: TerminalOptions = {}): string {
    const terminalId = `terminal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const shell = options.shell || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');
    const cwd = options.cwd || os.homedir();
    
    const ptyProcess = spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: cwd,
      env: { ...process.env, ...options.env },
    });

    // Handle terminal output
    ptyProcess.onData((data) => {
      this.mainWindow.webContents.send('terminal:data', terminalId, data);
    });

    // Handle terminal exit
    ptyProcess.onExit((exitCode) => {
      this.mainWindow.webContents.send('terminal:exit', terminalId, exitCode);
      this.terminals.delete(terminalId);
    });

    this.terminals.set(terminalId, ptyProcess);
    return terminalId;
  }

  writeToTerminal(terminalId: string, data: string): boolean {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.write(data);
      return true;
    }
    return false;
  }

  resizeTerminal(terminalId: string, cols: number, rows: number): boolean {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.resize(cols, rows);
      return true;
    }
    return false;
  }

  killTerminal(terminalId: string): boolean {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.kill();
      this.terminals.delete(terminalId);
      return true;
    }
    return false;
  }

  killAllTerminals(): void {
    this.terminals.forEach((terminal) => {
      terminal.kill();
    });
    this.terminals.clear();
  }
}
```

## 🔐 Step 5: Preload Script

Create `electron/preload.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose terminal API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  terminal: {
    create: (options?: any) => ipcRenderer.invoke('terminal:create', options),
    write: (terminalId: string, data: string) => ipcRenderer.invoke('terminal:write', terminalId, data),
    resize: (terminalId: string, cols: number, rows: number) => ipcRenderer.invoke('terminal:resize', terminalId, cols, rows),
    kill: (terminalId: string) => ipcRenderer.invoke('terminal:kill', terminalId),
    onData: (callback: (terminalId: string, data: string) => void) => {
      ipcRenderer.on('terminal:data', (event, terminalId, data) => callback(terminalId, data));
    },
    onExit: (callback: (terminalId: string, exitCode: number) => void) => {
      ipcRenderer.on('terminal:exit', (event, terminalId, exitCode) => callback(terminalId, exitCode));
    },
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      terminal: {
        create: (options?: any) => Promise<string>;
        write: (terminalId: string, data: string) => Promise<boolean>;
        resize: (terminalId: string, cols: number, rows: number) => Promise<boolean>;
        kill: (terminalId: string) => Promise<boolean>;
        onData: (callback: (terminalId: string, data: string) => void) => void;
        onExit: (callback: (terminalId: string, exitCode: number) => void) => void;
      };
    };
  }
}
```

## ⚛️ Step 6: Update React Terminal Component

Update your `src/components/feature/Terminal.tsx`:

```typescript
import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

interface TerminalProps {
  onCommand?: (command: string) => void;
  className?: string;
}

export default function Terminal({ onCommand, className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [terminalId, setTerminalId] = useState<string | null>(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    const electronAvailable = typeof window !== 'undefined' && window.electronAPI;
    setIsElectron(!!electronAvailable);

    if (!terminalRef.current) return;

    // Initialize xterm.js
    const terminal = new XTerm({
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        // ... your existing theme
      },
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", Monaco, Menlo, "Ubuntu Mono", monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 2000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    if (electronAvailable) {
      // Electron mode - real terminal
      initializeElectronTerminal(terminal);
    } else {
      // Web mode - simulated terminal
      initializeWebTerminal(terminal);
    }

    return () => {
      if (terminalId && electronAvailable) {
        window.electronAPI.terminal.kill(terminalId);
      }
      terminal.dispose();
    };
  }, []);

  const initializeElectronTerminal = async (terminal: XTerm) => {
    try {
      // Create real terminal process
      const id = await window.electronAPI.terminal.create({
        shell: process.platform === 'win32' ? 'powershell.exe' : 'bash',
        cwd: process.env.HOME || process.env.USERPROFILE,
      });
      
      setTerminalId(id);

      // Handle terminal data
      window.electronAPI.terminal.onData((receivedId: string, data: string) => {
        if (receivedId === id) {
          terminal.write(data);
        }
      });

      // Handle terminal exit
      window.electronAPI.terminal.onExit((receivedId: string, exitCode: number) => {
        if (receivedId === id) {
          terminal.writeln(`\r\n\x1b[1;31mTerminal exited with code: ${exitCode}\x1b[0m`);
        }
      });

      // Handle user input
      terminal.onData((data) => {
        window.electronAPI.terminal.write(id, data);
        onCommand?.(data.trim());
      });

      // Handle resize
      terminal.onResize(({ cols, rows }) => {
        window.electronAPI.terminal.resize(id, cols, rows);
      });

      // Welcome message for Electron
      terminal.writeln('\x1b[1;32m🚀 Real Terminal Active - Full System Access Enabled!\x1b[0m');
      terminal.writeln('\x1b[36mYou can now use SSH, Docker, Screen, and all system commands.\x1b[0m');
      terminal.writeln('');

    } catch (error) {
      terminal.writeln('\x1b[1;31mError initializing terminal: ' + error + '\x1b[0m');
    }
  };

  const initializeWebTerminal = (terminal: XTerm) => {
    // Your existing web terminal implementation
    // ... (keep your current web mode code)
  };

  // ... rest of your component methods

  return (
    <div className={`terminal-container ${className}`}>
      <div 
        ref={terminalRef} 
        className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
        style={{ minHeight: '400px' }}
      />
      {isElectron && (
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
          Electron Mode
        </div>
      )}
    </div>
  );
}
```

## 📦 Step 7: Update Package.json

Update your `package.json` with Electron scripts:

```json
{
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build && npm run build:electron",
    "build:electron": "tsc electron/*.ts --outDir dist-electron --target es2020 --module commonjs --esModuleInterop --skipLibCheck",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && npm run build:electron && electron dist-electron/main.js\"",
    "electron-build": "npm run build && electron-builder",
    "preview": "vite preview"
  },
  "build": {
    "appId": "com.yourcompany.node-manager",
    "productName": "Node Manager",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.developer-tools"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

## 🚀 Step 8: Development & Build Commands

### Development Mode
```bash
# Start development with hot reload
npm run electron-dev
```

### Production Build
```bash
# Build for production
npm run electron-build
```

## 🔧 Step 9: TypeScript Configuration

Create `electron/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "../dist-electron",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["./**/*"],
  "exclude": ["node_modules", "../dist", "../dist-electron"]
}
```

## 🎯 Step 10: Testing Real Terminal Features

After migration, you'll be able to:

### SSH Connections
```bash
ssh user@your-vps-ip
ssh -i ~/.ssh/your-key user@server.com
```

### Docker Commands
```bash
docker ps
docker logs container-name
docker exec -it container-name bash
```

### Screen Sessions
```bash
screen -ls
screen -r session-name
screen -S new-session
```

### System Commands
```bash
tail -f /var/log/nginx/access.log
htop
ps aux | grep node
```

## 🔒 Security Considerations

1. **Validate Commands**: Implement command validation in production
2. **User Permissions**: Run with appropriate user permissions
3. **Network Security**: Secure SSH key management
4. **Process Isolation**: Isolate terminal processes

## 🐛 Troubleshooting

### Common Issues:

1. **node-pty compilation errors**:
   ```bash
   npm install --save-dev node-gyp
   npm rebuild node-pty
   ```

2. **Permission errors on Linux/Mac**:
   ```bash
   chmod +x node_modules/.bin/electron
   ```

3. **Terminal not displaying**:
   - Check console for IPC errors
   - Verify preload script is loaded
   - Ensure terminal container has proper dimensions

## 🎉 Success!

After completing this migration, your terminal will have:

- ✅ Real SSH connections to VPS servers
- ✅ Full Docker command support
- ✅ Screen session management
- ✅ Real-time log monitoring
- ✅ Complete system command access
- ✅ Multiple terminal sessions
- ✅ Professional terminal interface

Your Node Manager app will now be a powerful desktop application with full system access capabilities!

## 📞 Support

If you encounter issues during migration:
1. Check the Electron documentation
2. Verify node-pty compatibility with your OS
3. Test with simple commands first
4. Use Electron DevTools for debugging

Happy coding! 🚀
