import { SecureKeyManager } from './keyDerivation.js';
import { EIP155Signer } from './signing.js';
import { InputValidator } from './validation.js';
import { TransactionBuilder } from './transaction.js';
import { TransactionBroadcaster } from './broadcaster.js';
import { WalletError, WalletAccount, EIP155Transaction, SignedTransaction } from './types.js';

export interface WalletAPI {
  // Account management
  createFromMnemonic(mnemonic: string): void;
  deriveAccount(index: number): WalletAccount;
  getAddress(accountIndex?: number): string;
  
  // Transaction operations
  buildTransaction(params: {
    to: string;
    value: string;
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    chainId: string;
    data?: string;
  }): EIP155Transaction;
  
  signTransaction(transaction: EIP155Transaction, accountIndex?: number): Promise<SignedTransaction>;
  broadcastTransaction(signedTx: SignedTransaction): Promise<string>;
  
  // Utilities
  validateAddress(address: string): string;
  convertToWei(amount: string): bigint;
  dispose(): void;
}

export class MinimalEVMWallet implements WalletAPI {
  private keyManager: SecureKeyManager | null = null;
  private signer: EIP155Signer;
  private broadcaster: TransactionBroadcaster;

  constructor() {
    this.signer = new EIP155Signer();
    this.broadcaster = new TransactionBroadcaster();
  }

  createFromMnemonic(mnemonic: string): void {
    if (this.keyManager) {
      this.keyManager.dispose();
    }
    this.keyManager = new SecureKeyManager(mnemonic);
  }

  deriveAccount(index: number): WalletAccount {
    if (!this.keyManager) {
      throw new WalletError('Wallet not initialized. Call createFromMnemonic first.', 'WALLET_NOT_INITIALIZED');
    }
    return this.keyManager.deriveAccount(index);
  }

  getAddress(accountIndex: number = 0): string {
    return this.deriveAccount(accountIndex).address;
  }

  buildTransaction(params: {
    to: string;
    value: string;
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    chainId: string;
    data?: string;
  }): EIP155Transaction {
    return TransactionBuilder.fromParams(params);
  }

  async signTransaction(transaction: EIP155Transaction, accountIndex: number = 0): Promise<SignedTransaction> {
    const account = this.deriveAccount(accountIndex);
    return await this.signer.signTransaction(transaction, account.privateKey);
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<string> {
    return await this.broadcaster.broadcastTransaction(signedTx);
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    return await this.broadcaster.getTransactionReceipt(txHash);
  }

  validateAddress(address: string): string {
    return InputValidator.validateAddress(address);
  }

  convertToWei(amount: string): bigint {
    return InputValidator.validateWeiAmount(amount);
  }

  dispose(): void {
    if (this.keyManager) {
      this.keyManager.dispose();
      this.keyManager = null;
    }
  }
}

// Create a default demo wallet instance
export function createDemoWallet(): MinimalEVMWallet {
  const wallet = new MinimalEVMWallet();
  wallet.createFromMnemonic('test test test test test test test test test test test junk');
  return wallet;
}

// High-level API for simple operations
export class SimpleWalletAPI {
  private wallet: MinimalEVMWallet;

  constructor(mnemonic?: string) {
    this.wallet = new MinimalEVMWallet();
    if (mnemonic) {
      this.wallet.createFromMnemonic(mnemonic);
    } else {
      // Use demo mnemonic
      this.wallet.createFromMnemonic('test test test test test test test test test test test junk');
    }
  }

  // One-function to rule them all: create, sign and optionally broadcast
  async createSignedTransaction(params: {
    to: string;
    value: string;
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    chainId: string;
    data?: string;
    accountIndex?: number;
    broadcast?: boolean;
  }): Promise<{ signed: SignedTransaction; txHash?: string }> {
    // Build transaction
    const transaction = this.wallet.buildTransaction(params);
    
    // Sign transaction
    const signed = await this.wallet.signTransaction(transaction, params.accountIndex);
    
    // Broadcast if requested
    let txHash: string | undefined;
    if (params.broadcast) {
      txHash = await this.wallet.broadcastTransaction(signed);
    }
    
    return { signed, txHash };
  }

  getAddress(accountIndex: number = 0): string {
    return this.wallet.getAddress(accountIndex);
  }

  validateAddress(address: string): string {
    return this.wallet.validateAddress(address);
  }

  convertToWei(amount: string): bigint {
    return this.wallet.convertToWei(amount);
  }

  dispose(): void {
    this.wallet.dispose();
  }
}