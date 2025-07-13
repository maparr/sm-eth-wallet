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
export type EthereumAddress = string & {
    __brand: 'EthereumAddress';
};
export type WeiAmount = bigint & {
    __brand: 'Wei';
};
export type GasLimit = number & {
    __brand: 'GasLimit';
};
export type PrivateKey = Uint8Array & {
    __brand: 'PrivateKey';
};
export interface WalletAccount {
    address: EthereumAddress;
    privateKey: PrivateKey;
    publicKey: Uint8Array;
    derivationPath: string;
    index: number;
}
export interface WalletCLIOptions {
    to: string;
    value: string;
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    chainId: string;
}
export declare class WalletError extends Error {
    code: string;
    field?: string | undefined;
    constructor(message: string, code: string, field?: string | undefined);
}
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
export type ProviderErrorCode = -32000 | -32001 | -32002 | -32003 | -32004 | -32005;
//# sourceMappingURL=types.d.ts.map