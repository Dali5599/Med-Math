
import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  className?: string;
  onCommand?: (command: string) => void;
}

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

export default function Terminal({ className = '', onCommand }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId] = useState(() => `terminal-${Date.now()}`);
  const [currentCommand, setCurrentCommand] = useState('');

  // Initialize terminal
  const initializeTerminal = useCallback(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const terminal = new XTerm({
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#f7768e',
        selection: '#33467c',
        black: '#32344a',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#ad8ee6',
        cyan: '#449dab',
        white: '#787c99',
        brightBlack: '#444b6a',
        brightRed: '#ff7a93',
        brightGreen: '#b9f27c',
        brightYellow: '#ff9e64',
        brightBlue: '#7da6ff',
        brightMagenta: '#bb9af7',
        brightCyan: '#0db9d7',
        brightWhite: '#acb0d0'
      },
      fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle terminal input
    terminal.onData((data) => {
      if (isElectron && window.electronAPI) {
        // In Electron: Send to real terminal
        window.electronAPI.terminal.write(sessionId, data);
      } else {
        // In web: Simulate terminal behavior
        handleWebTerminalInput(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      setTimeout(() => {
        fitAddon.fit();
        if (isElectron && window.electronAPI) {
          window.electronAPI.terminal.resize(sessionId, terminal.cols, terminal.rows);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [sessionId]);

  // Handle web terminal input (demo mode)
  const handleWebTerminalInput = useCallback((data: string) => {
    const terminal = xtermRef.current;
    if (!terminal) return;

    if (data === '\r') {
      // Enter pressed
      terminal.write('\r\n');
      if (currentCommand.trim()) {
        handleWebCommand(currentCommand.trim());
        onCommand?.(currentCommand.trim());
      }
      setCurrentCommand('');
      terminal.write('$ ');
    } else if (data === '\u007f') {
      // Backspace
      if (currentCommand.length > 0) {
        setCurrentCommand(prev => prev.slice(0, -1));
        terminal.write('\b \b');
      }
    } else if (data >= ' ') {
      // Printable character
      setCurrentCommand(prev => prev + data);
      terminal.write(data);
    }
  }, [currentCommand, onCommand]);

  // Handle web commands (demo responses)
  const handleWebCommand = useCallback((command: string) => {
    const terminal = xtermRef.current;
    if (!terminal) return;

    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'help') {
      terminal.write('Available commands:\r\n');
      terminal.write('  help     - Show this help message\r\n');
      terminal.write('  clear    - Clear terminal\r\n');
      terminal.write('  ls       - List directory contents\r\n');
      terminal.write('  pwd      - Show current directory\r\n');
      terminal.write('  whoami   - Show current user\r\n');
      terminal.write('  date     - Show current date\r\n');
      terminal.write('  ssh      - SSH connection (demo)\r\n');
      terminal.write('  docker   - Docker commands (demo)\r\n');
    } else if (cmd === 'clear') {
      terminal.clear();
    } else if (cmd === 'ls') {
      terminal.write('Documents/  Downloads/  Desktop/  Pictures/\r\n');
    } else if (cmd === 'pwd') {
      terminal.write('/home/user\r\n');
    } else if (cmd === 'whoami') {
      terminal.write('user\r\n');
    } else if (cmd === 'date') {
      terminal.write(new Date().toString() + '\r\n');
    } else if (cmd.startsWith('ssh')) {
      terminal.write('SSH Demo Mode - Connection simulated\r\n');
      terminal.write('Connected to demo server\r\n');
    } else if (cmd.startsWith('docker')) {
      terminal.write('Docker Demo Mode\r\n');
      terminal.write('CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS\r\n');
      terminal.write('abc123def456   nginx     "nginx"   2h ago    Up 2h\r\n');
    } else if (cmd) {
      terminal.write(`Command not found: ${command}\r\n`);
      terminal.write('Type "help" for available commands\r\n');
    }
  }, []);

  // Initialize Electron terminal
  const initializeElectronTerminal = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;

    try {
      const result = await window.electronAPI.terminal.create(sessionId);
      if (result.success) {
        setIsConnected(true);
        
        // Set up event listeners
        window.electronAPI.terminal.onOutput((id: string, data: string) => {
          if (id === sessionId && xtermRef.current) {
            xtermRef.current.write(data);
          }
        });

        window.electronAPI.terminal.onExit((id: string, code: number) => {
          if (id === sessionId) {
            setIsConnected(false);
            if (xtermRef.current) {
              xtermRef.current.write(`\r\nProcess exited with code ${code}\r\n`);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize Electron terminal:', error);
    }
  }, [sessionId]);

  // Initialize web terminal
  const initializeWebTerminal = useCallback(() => {
    const terminal = xtermRef.current;
    if (!terminal) return;

    terminal.write('Node Manager Terminal (Web Demo Mode)\r\n');
    terminal.write('For full functionality, use the desktop application\r\n');
    terminal.write('Type "help" for available demo commands\r\n\r\n');
    terminal.write('$ ');
    setIsConnected(true);
  }, []);

  useEffect(() => {
    const cleanup = initializeTerminal();

    // Initialize appropriate terminal mode
    setTimeout(() => {
      if (isElectron) {
        initializeElectronTerminal();
      } else {
        initializeWebTerminal();
      }
    }, 100);

    return () => {
      if (isElectron && window.electronAPI) {
        window.electronAPI.terminal.kill(sessionId);
        window.electronAPI.terminal.removeAllListeners();
      }
      cleanup?.();
    };
  }, [initializeTerminal, initializeElectronTerminal, initializeWebTerminal, sessionId]);

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs text-gray-400">
            {isElectron ? (isConnected ? 'Connected' : 'Disconnected') : 'Demo Mode'}
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef} 
        className="h-96 p-2"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
