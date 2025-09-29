
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { VaultState, VaultData, Node, Wallet, Airdrop, Preferences } from '../types/vault';
import { encryptData, decryptData, generateId } from '../utils/crypto';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

interface VaultContextType {
  state: VaultState;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  saveData: () => Promise<void>;
  addNode: (node: Omit<Node, 'id'>) => void;
  updateNode: (id: string, node: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  deleteWallets: (ids: string[]) => void;
  addAirdrop: (airdrop: Omit<Airdrop, 'id'>) => void;
  updateAirdrop: (id: string, airdrop: Partial<Airdrop>) => void;
  deleteAirdrop: (id: string) => void;
  deleteAirdrops: (ids: string[]) => void;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  exportData: () => Promise<string>;
  importData: (encryptedData: string, password: string) => Promise<boolean>;
}

type VaultAction = 
  | { type: 'UNLOCK'; payload: { password: string; data: VaultData } }
  | { type: 'LOCK' }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'ADD_NODE'; payload: Node }
  | { type: 'UPDATE_NODE'; payload: { id: string; node: Partial<Node> } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'DELETE_NODES'; payload: string[] }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'UPDATE_WALLET'; payload: { id: string; wallet: Partial<Wallet> } }
  | { type: 'DELETE_WALLET'; payload: string }
  | { type: 'DELETE_WALLETS'; payload: string[] }
  | { type: 'ADD_AIRDROP'; payload: Airdrop }
  | { type: 'UPDATE_AIRDROP'; payload: { id: string; airdrop: Partial<Airdrop> } }
  | { type: 'DELETE_AIRDROP'; payload: string }
  | { type: 'DELETE_AIRDROPS'; payload: string[] }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<Preferences> }
  | { type: 'SET_DATA'; payload: VaultData };

const initialState: VaultState = {
  nodes: [],
  wallets: [],
  airdrops: [],
  preferences: {
    language: 'en',
    theme: 'dark',
    autoLockMinutes: 15
  },
  isLocked: true,
  masterPassword: null,
  lastActivity: Date.now()
};

function vaultReducer(state: VaultState, action: VaultAction): VaultState {
  switch (action.type) {
    case 'UNLOCK':
      return {
        ...state,
        ...action.payload.data,
        isLocked: false,
        masterPassword: action.payload.password,
        lastActivity: Date.now()
      };
    case 'LOCK':
      return {
        ...initialState,
        preferences: state.preferences
      };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: Date.now()
      };
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        lastActivity: Date.now()
      };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(node => 
          node.id === action.payload.id 
            ? { ...node, ...action.payload.node }
            : node
        ),
        lastActivity: Date.now()
      };
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        lastActivity: Date.now()
      };
    case 'DELETE_NODES':
      return {
        ...state,
        nodes: state.nodes.filter(node => !action.payload.includes(node.id)),
        lastActivity: Date.now()
      };
    case 'ADD_WALLET':
      return {
        ...state,
        wallets: [...state.wallets, action.payload],
        lastActivity: Date.now()
      };
    case 'UPDATE_WALLET':
      return {
        ...state,
        wallets: state.wallets.map(wallet => 
          wallet.id === action.payload.id 
            ? { ...wallet, ...action.payload.wallet }
            : wallet
        ),
        lastActivity: Date.now()
      };
    case 'DELETE_WALLET':
      return {
        ...state,
        wallets: state.wallets.filter(wallet => wallet.id !== action.payload),
        lastActivity: Date.now()
      };
    case 'DELETE_WALLETS':
      return {
        ...state,
        wallets: state.wallets.filter(wallet => !action.payload.includes(wallet.id)),
        lastActivity: Date.now()
      };
    case 'ADD_AIRDROP':
      return {
        ...state,
        airdrops: [...state.airdrops, action.payload],
        lastActivity: Date.now()
      };
    case 'UPDATE_AIRDROP':
      return {
        ...state,
        airdrops: state.airdrops.map(airdrop => 
          airdrop.id === action.payload.id 
            ? { ...airdrop, ...action.payload.airdrop }
            : airdrop
        ),
        lastActivity: Date.now()
      };
    case 'DELETE_AIRDROP':
      return {
        ...state,
        airdrops: state.airdrops.filter(airdrop => airdrop.id !== action.payload),
        lastActivity: Date.now()
      };
    case 'DELETE_AIRDROPS':
      return {
        ...state,
        airdrops: state.airdrops.filter(airdrop => !action.payload.includes(airdrop.id)),
        lastActivity: Date.now()
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
        lastActivity: Date.now()
      };
    case 'SET_DATA':
      return {
        ...state,
        ...action.payload,
        lastActivity: Date.now()
      };
    default:
      return state;
  }
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(vaultReducer, initialState);
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();

  // Auto-lock functionality
  useEffect(() => {
    if (state.isLocked || !state.masterPassword) return;

    const checkAutoLock = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - state.lastActivity;
      const autoLockMs = state.preferences.autoLockMinutes * 60 * 1000;

      if (timeSinceLastActivity >= autoLockMs) {
        dispatch({ type: 'LOCK' });
        showToast(t('vaultLockedInactivity'), 'info');
      }
    };

    const interval = setInterval(checkAutoLock, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.isLocked, state.masterPassword, state.lastActivity, state.preferences.autoLockMinutes, showToast, t]);

  // Update language when preferences change
  useEffect(() => {
    if (state.preferences.language !== i18n.language) {
      i18n.changeLanguage(state.preferences.language);
    }
  }, [state.preferences.language, i18n]);

  // Update activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (!state.isLocked) {
        dispatch({ type: 'UPDATE_ACTIVITY' });
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [state.isLocked]);

  const unlock = async (password: string): Promise<boolean> => {
    try {
      const encryptedData = localStorage.getItem('vault-data');
      if (!encryptedData) {
        // First time setup
        const defaultData: VaultData = {
          nodes: [],
          wallets: [],
          airdrops: [],
          preferences: state.preferences
        };
        dispatch({ type: 'UNLOCK', payload: { password, data: defaultData } });
        return true;
      }

      const parsed = JSON.parse(encryptedData);
      const decryptedData = await decryptData(parsed, password);
      const vaultData: VaultData = JSON.parse(decryptedData);
      
      dispatch({ type: 'UNLOCK', payload: { password, data: vaultData } });
      return true;
    } catch (error) {
      showToast(t('invalidPassword'), 'error');
      return false;
    }
  };

  const lock = () => {
    dispatch({ type: 'LOCK' });
    showToast(t('vaultLocked'), 'info');
  };

  const saveData = async () => {
    if (!state.masterPassword) return;

    try {
      const dataToSave: VaultData = {
        nodes: state.nodes,
        wallets: state.wallets,
        airdrops: state.airdrops,
        preferences: state.preferences
      };

      const encrypted = await encryptData(JSON.stringify(dataToSave), state.masterPassword);
      localStorage.setItem('vault-data', JSON.stringify(encrypted));
      showToast(t('dataSaved'), 'success');
    } catch (error) {
      showToast(t('failedToSave'), 'error');
    }
  };

  const exportData = async (): Promise<string> => {
    if (!state.masterPassword) throw new Error('Vault is locked');

    const dataToExport: VaultData = {
      nodes: state.nodes,
      wallets: state.wallets,
      airdrops: state.airdrops,
      preferences: state.preferences
    };

    const encrypted = await encryptData(JSON.stringify(dataToExport), state.masterPassword);
    return JSON.stringify(encrypted);
  };

  const importData = async (encryptedData: string, password: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(encryptedData);
      const decryptedData = await decryptData(parsed, password);
      const vaultData: VaultData = JSON.parse(decryptedData);
      
      dispatch({ type: 'SET_DATA', payload: vaultData });
      showToast(t('vaultImported'), 'success');
      return true;
    } catch (error) {
      showToast(t('failedToImport'), 'error');
      return false;
    }
  };

  const addNode = (node: Omit<Node, 'id'>) => {
    dispatch({ type: 'ADD_NODE', payload: { ...node, id: generateId() } });
  };

  const updateNode = (id: string, node: Partial<Node>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, node } });
  };

  const deleteNode = (id: string) => {
    dispatch({ type: 'DELETE_NODE', payload: id });
  };

  const deleteNodes = (ids: string[]) => {
    dispatch({ type: 'DELETE_NODES', payload: ids });
  };

  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    dispatch({ type: 'ADD_WALLET', payload: { ...wallet, id: generateId() } });
  };

  const updateWallet = (id: string, wallet: Partial<Wallet>) => {
    dispatch({ type: 'UPDATE_WALLET', payload: { id, wallet } });
  };

  const deleteWallet = (id: string) => {
    dispatch({ type: 'DELETE_WALLET', payload: id });
  };

  const deleteWallets = (ids: string[]) => {
    dispatch({ type: 'DELETE_WALLETS', payload: ids });
  };

  const addAirdrop = (airdrop: Omit<Airdrop, 'id'>) => {
    dispatch({ type: 'ADD_AIRDROP', payload: { ...airdrop, id: generateId() } });
  };

  const updateAirdrop = (id: string, airdrop: Partial<Airdrop>) => {
    dispatch({ type: 'UPDATE_AIRDROP', payload: { id, airdrop } });
  };

  const deleteAirdrop = (id: string) => {
    dispatch({ type: 'DELETE_AIRDROP', payload: id });
  };

  const deleteAirdrops = (ids: string[]) => {
    dispatch({ type: 'DELETE_AIRDROPS', payload: ids });
  };

  const updatePreferences = (preferences: Partial<Preferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  return (
    <VaultContext.Provider value={{
      state,
      unlock,
      lock,
      saveData,
      addNode,
      updateNode,
      deleteNode,
      deleteNodes,
      addWallet,
      updateWallet,
      deleteWallet,
      deleteWallets,
      addAirdrop,
      updateAirdrop,
      deleteAirdrop,
      deleteAirdrops,
      updatePreferences,
      exportData,
      importData
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
