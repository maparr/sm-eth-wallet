/**
 * Frontend constants
 */

export const DEFAULT_GAS_LIMIT = '21000';
export const DEFAULT_GAS_PRICE = '20'; // Gwei
export const DEFAULT_NETWORK = 'sepolia';

export const GAS_PRESETS = {
  slow: { gasPrice: '10', label: 'Slow (~30s)' },
  standard: { gasPrice: '20', label: 'Standard (~15s)' },
  fast: { gasPrice: '40', label: 'Fast (~5s)' }
};

export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
} as const;

export const UI_MESSAGES = {
  WALLET_GENERATED: 'Wallet generated successfully! 🎉',
  WALLET_IMPORTED: 'Wallet imported successfully! 🎉',
  WALLET_CLEARED: 'Wallet cleared successfully 🧹',
  TRANSACTION_SIGNED: 'Transaction signed successfully! ✅',
  TRANSACTION_BROADCAST: 'Transaction broadcast successfully! 🚀',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard! 📋'
};

export const VALIDATION_RULES = {
  MIN_GAS_LIMIT: 21000,
  MAX_GAS_LIMIT: 30000000,
  MIN_AMOUNT: 0,
  MNEMONIC_LENGTHS: [12, 24]
};

export const TAB_TYPES = {
  SEND: 'send',
  HISTORY: 'history',
  SETTINGS: 'settings'
} as const;

export const NETWORKS = {
  SEPOLIA: 'sepolia',
  MAINNET: 'mainnet'
} as const;