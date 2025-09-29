
import { useState, useRef } from 'react';
import Button from '../../../components/base/Button';
import Terminal from '../../../components/feature/Terminal';

export default function TerminalPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleCommand = (command: string) => {
    setCommandHistory(prev => [...prev, command]);
    
    // Log command for debugging
    console.log('Terminal command executed:', command);
    
    // Simulate connection status for SSH commands
    if (command.toLowerCase().startsWith('ssh')) {
      setIsConnected(true);
      setTimeout(() => setIsConnected(false), 5000);
    }
  };

  const toggleTerminal = () => {
    setIsExpanded(!isExpanded);
    
    // Fit terminal when expanded
    setTimeout(() => {
      const terminalApi = (terminalRef.current as any)?.terminalApi;
      if (terminalApi) {
        terminalApi.fit();
      }
    }, 150);
  };

  const clearTerminal = () => {
    const terminalApi = (terminalRef.current as any)?.terminalApi;
    if (terminalApi) {
      terminalApi.clear();
    }
    setCommandHistory([]);
  };

  const restartTerminal = () => {
    clearTerminal();
    setIsConnected(false);
    // In Electron version, this would restart the pty process
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          {/* Terminal Traffic Lights */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 cursor-pointer transition-colors"></div>
          </div>
          
          <div className="flex items-center space-x-2">
            <i className="ri-terminal-box-line text-blue-400 text-lg"></i>
            <h3 className="text-white font-semibold">Integrated Terminal</h3>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full font-medium">
              Web Mode
            </span>
            {isConnected && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium animate-pulse">
                SSH Simulated
              </span>
            )}
          </div>
        </div>
        
        {/* Terminal Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={restartTerminal}
            variant="secondary"
            size="sm"
            className="text-xs bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            <i className="ri-restart-line mr-1"></i>
            Restart
          </Button>
          <Button
            onClick={clearTerminal}
            variant="secondary"
            size="sm"
            className="text-xs bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            <i className="ri-delete-bin-line mr-1"></i>
            Clear
          </Button>
          <Button
            onClick={toggleTerminal}
            variant="secondary"
            size="sm"
            className="text-xs bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            <i className={`${isExpanded ? 'ri-contract-up-down-line' : 'ri-expand-up-down-line'} mr-1`}></i>
            {isExpanded ? 'Minimize' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'h-[500px]' : 'h-80'
        }`}
      >
        <div ref={terminalRef} className="h-full">
          <Terminal 
            onCommand={handleCommand}
            className="h-full"
          />
        </div>
      </div>

      {/* Terminal Status Bar */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-1">
              <i className="ri-command-line text-blue-400"></i>
              <span>Commands: {commandHistory.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
              <span>Status: {isConnected ? 'Connected' : 'Ready'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-global-line text-orange-400"></i>
              <span>Mode: Web Browser</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-yellow-400">
            <i className="ri-information-line"></i>
            <span className="font-medium">Migrate to Electron for full system access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
