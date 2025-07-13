// Core transaction interfaces following EIP-155 specification
export interface BaseTransaction {
  nonce: bigint;
  gasPrice: bigint;
  gasLimit: bigint;
  to: string;
  value: bigint;
  data: string;
}

export interface EIP155Transaction extends BaseTransaction {
  chainId: number;
}

export interface SignedTransaction extends EIP155Transaction {
  v: number;
  r: bigint;
  s: bigint;
  hash: string;
  rawTransaction: string;
}

// Type-safe branded types for domain values
export type EthereumAddress = string & { __brand: 'EthereumAddress' };
export type WeiAmount = bigint & { __brand: 'Wei' };
export type GasLimit = number & { __brand: 'GasLimit' };
export type PrivateKey = Uint8Array & { __brand: 'PrivateKey' };

// Wallet account interface
export interface WalletAccount {
  address: EthereumAddress;
  privateKey: PrivateKey;
  publicKey: Uint8Array;
  derivationPath: string;
  index: number;
}

// CLI options interface
export interface WalletCLIOptions {
  to: string;
  value: string;
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  chainId: string;
}

// Error types
export class WalletError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

// RPC types
export interface RPCResponse<T> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: RPCError;
}

export interface RPCError {
  code: number;
  message: string;
  data?: unknown;
}

export type ProviderErrorCode = 
  | -32000  // Invalid input
  | -32001  // Resource not found
  | -32002  // Resource unavailable
  | -32003  // Transaction rejected
  | -32004  // Method not supported
  | -32005; // Request limit exceeded