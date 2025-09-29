
export interface Node {
  id: string;
  name: string;
  network: string;
  nodeId: string;
  publicAddress: string;
  notes: string;
}

export interface Wallet {
  id: string;
  name: string;
  network: string;
  publicAddress: string;
  notes: string;
}

export interface Airdrop {
  id: string;
  label: string;
  url: string;
  tags: string[];
  notes: string;
}

export interface Preferences {
  language: 'en' | 'fr' | 'ar';
  theme: 'dark' | 'light';
  autoLockMinutes: number;
}

export interface VaultData {
  nodes: Node[];
  wallets: Wallet[];
  airdrops: Airdrop[];
  preferences: Preferences;
}

export interface VaultState extends VaultData {
  isLocked: boolean;
  masterPassword: string | null;
  lastActivity: number;
}
