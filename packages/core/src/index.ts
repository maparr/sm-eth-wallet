// Core wallet functionality exports
export { SecureKeyManager } from './keyDerivation.js';
export { EIP155Signer } from './signing.js';
export { InputValidator } from './validation.js';
export { TransactionBuilder } from './transaction.js';
export { TransactionBroadcaster } from './broadcaster.js';

// High-level wallet API
export { MinimalEVMWallet, SimpleWalletAPI, createDemoWallet } from './wallet.js';
export type { WalletAPI } from './wallet.js';

// Error handling utilities
export { 
  mapProviderError, 
  shouldRetryError, 
  formatErrorForDisplay,
  ERROR_MESSAGES 
} from './errors.js';

// Network configuration utilities
export { 
  NETWORKS, 
  getNetworkByChainId, 
  isValidChainId, 
  getSupportedChainIds, 
  getNetworkNames 
} from './networks.js';
export type { NetworkConfig } from './networks.js';

// Test constants and utilities
// export { TEST_MNEMONIC, BIP44_TEST_VECTORS, TEST_TRANSACTIONS } from './__tests__/test-constants';

// Type exports
export type {
  BaseTransaction,
  EIP155Transaction,
  SignedTransaction,
  EthereumAddress,
  WeiAmount,
  GasLimit,
  PrivateKey,
  WalletAccount,
  WalletCLIOptions,
  RPCResponse,
  RPCError,
  ProviderErrorCode
} from './types.js';

export { WalletError } from './types.js';