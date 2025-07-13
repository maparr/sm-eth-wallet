import { WalletAccount } from './types.js';
export declare class SecureKeyManager {
    private seed;
    private hdkey;
    constructor(mnemonic?: string);
    private validateMnemonic;
    private initializeKeys;
    deriveAccount(index?: number): WalletAccount;
    private publicKeyToAddress;
    dispose(): void;
}
//# sourceMappingURL=keyDerivation.d.ts.map