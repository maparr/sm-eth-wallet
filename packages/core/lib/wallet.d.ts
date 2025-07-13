import { WalletAccount, EIP155Transaction, SignedTransaction } from './types.js';
export interface WalletAPI {
    createFromMnemonic(mnemonic: string): void;
    deriveAccount(index: number): WalletAccount;
    getAddress(accountIndex?: number): string;
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
    validateAddress(address: string): string;
    convertToWei(amount: string): bigint;
    dispose(): void;
}
export declare class MinimalEVMWallet implements WalletAPI {
    private keyManager;
    private signer;
    private broadcaster;
    constructor();
    createFromMnemonic(mnemonic: string): void;
    deriveAccount(index: number): WalletAccount;
    getAddress(accountIndex?: number): string;
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
    getTransactionReceipt(txHash: string): Promise<any>;
    validateAddress(address: string): string;
    convertToWei(amount: string): bigint;
    dispose(): void;
}
export declare function createDemoWallet(): MinimalEVMWallet;
export declare class SimpleWalletAPI {
    private wallet;
    constructor(mnemonic?: string);
    createSignedTransaction(params: {
        to: string;
        value: string;
        nonce: string;
        gasPrice: string;
        gasLimit: string;
        chainId: string;
        data?: string;
        accountIndex?: number;
        broadcast?: boolean;
    }): Promise<{
        signed: SignedTransaction;
        txHash?: string;
    }>;
    getAddress(accountIndex?: number): string;
    validateAddress(address: string): string;
    convertToWei(amount: string): bigint;
    dispose(): void;
}
//# sourceMappingURL=wallet.d.ts.map