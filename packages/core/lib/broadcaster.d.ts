import { SignedTransaction } from './types.js';
export declare class TransactionBroadcaster {
    private providers;
    private timeout;
    broadcastTransaction(signedTx: SignedTransaction | string): Promise<string>;
    private sendRawTransaction;
    private handleProviderError;
    private mapProviderError;
    private shouldRetryError;
    getTransactionReceipt(txHash: string): Promise<any>;
    private makeRPCCall;
}
//# sourceMappingURL=broadcaster.d.ts.map