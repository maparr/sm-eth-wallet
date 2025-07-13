import { EIP155Transaction } from './types.js';
export declare class TransactionBuilder {
    private transaction;
    setTo(to: string): TransactionBuilder;
    setValue(value: string): TransactionBuilder;
    setGasPrice(gasPrice: string): TransactionBuilder;
    setGasLimit(gasLimit: string): TransactionBuilder;
    setNonce(nonce: string): TransactionBuilder;
    setChainId(chainId: string): TransactionBuilder;
    setData(data: string): TransactionBuilder;
    build(): EIP155Transaction;
    static fromParams(params: {
        to: string;
        value: string;
        nonce: string;
        gasPrice: string;
        gasLimit: string;
        chainId: string;
        data?: string;
    }): EIP155Transaction;
}
//# sourceMappingURL=transaction.d.ts.map