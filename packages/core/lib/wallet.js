import { SecureKeyManager } from './keyDerivation.js';
import { EIP155Signer } from './signing.js';
import { InputValidator } from './validation.js';
import { TransactionBuilder } from './transaction.js';
import { TransactionBroadcaster } from './broadcaster.js';
import { WalletError } from './types.js';
export class MinimalEVMWallet {
    constructor() {
        this.keyManager = null;
        this.signer = new EIP155Signer();
        this.broadcaster = new TransactionBroadcaster();
    }
    createFromMnemonic(mnemonic) {
        if (this.keyManager) {
            this.keyManager.dispose();
        }
        this.keyManager = new SecureKeyManager(mnemonic);
    }
    deriveAccount(index) {
        if (!this.keyManager) {
            throw new WalletError('Wallet not initialized. Call createFromMnemonic first.', 'WALLET_NOT_INITIALIZED');
        }
        return this.keyManager.deriveAccount(index);
    }
    getAddress(accountIndex = 0) {
        return this.deriveAccount(accountIndex).address;
    }
    buildTransaction(params) {
        return TransactionBuilder.fromParams(params);
    }
    async signTransaction(transaction, accountIndex = 0) {
        const account = this.deriveAccount(accountIndex);
        return await this.signer.signTransaction(transaction, account.privateKey);
    }
    async broadcastTransaction(signedTx) {
        return await this.broadcaster.broadcastTransaction(signedTx);
    }
    async getTransactionReceipt(txHash) {
        return await this.broadcaster.getTransactionReceipt(txHash);
    }
    validateAddress(address) {
        return InputValidator.validateAddress(address);
    }
    convertToWei(amount) {
        return InputValidator.validateWeiAmount(amount);
    }
    dispose() {
        if (this.keyManager) {
            this.keyManager.dispose();
            this.keyManager = null;
        }
    }
}
// Create a default demo wallet instance
export function createDemoWallet() {
    const wallet = new MinimalEVMWallet();
    wallet.createFromMnemonic('test test test test test test test test test test test junk');
    return wallet;
}
// High-level API for simple operations
export class SimpleWalletAPI {
    constructor(mnemonic) {
        this.wallet = new MinimalEVMWallet();
        if (mnemonic) {
            this.wallet.createFromMnemonic(mnemonic);
        }
        else {
            // Use demo mnemonic
            this.wallet.createFromMnemonic('test test test test test test test test test test test junk');
        }
    }
    // One-function to rule them all: create, sign and optionally broadcast
    async createSignedTransaction(params) {
        // Build transaction
        const transaction = this.wallet.buildTransaction(params);
        // Sign transaction
        const signed = await this.wallet.signTransaction(transaction, params.accountIndex);
        // Broadcast if requested
        let txHash;
        if (params.broadcast) {
            txHash = await this.wallet.broadcastTransaction(signed);
        }
        return { signed, txHash };
    }
    getAddress(accountIndex = 0) {
        return this.wallet.getAddress(accountIndex);
    }
    validateAddress(address) {
        return this.wallet.validateAddress(address);
    }
    convertToWei(amount) {
        return this.wallet.convertToWei(amount);
    }
    dispose() {
        this.wallet.dispose();
    }
}
