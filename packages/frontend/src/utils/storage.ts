/**
 * Local storage utilities for wallet data
 */

const STORAGE_KEYS = {
  WALLET_SETTINGS: 'minimal_wallet_settings',
  TRANSACTION_HISTORY: 'minimal_wallet_history',
  NETWORK_PREFERENCE: 'minimal_wallet_network'
};

export interface WalletSettings {
  selectedNetwork: string;
  gasPreference: 'slow' | 'standard' | 'fast';
  autoRefreshBalance: boolean;
}

export interface StoredTransaction {
  hash: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  network: string;
}

export const saveWalletSettings = (settings: WalletSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLET_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save wallet settings:', error);
  }
};

export const loadWalletSettings = (): WalletSettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WALLET_SETTINGS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load wallet settings:', error);
    return null;
  }
};

export const saveTransactionHistory = (transactions: StoredTransaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTION_HISTORY, JSON.stringify(transactions));
  } catch (error) {
    console.warn('Failed to save transaction history:', error);
  }
};

export const loadTransactionHistory = (): StoredTransaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTION_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load transaction history:', error);
    return [];
  }
};

export const clearWalletData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear wallet data:', error);
  }
};