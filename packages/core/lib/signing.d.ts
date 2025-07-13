import { EIP155Transaction, SignedTransaction, PrivateKey } from './types.js';
export declare class EIP155Signer {
    signTransaction(txData: EIP155Transaction, privateKey: PrivateKey): Promise<SignedTransaction>;
    private validateTransaction;
    private toRLPValue;
}
//# sourceMappingURL=signing.d.ts.map