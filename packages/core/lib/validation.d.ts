import { EthereumAddress, WeiAmount, GasLimit } from './types.js';
export declare class InputValidator {
    static validateAddress(address: string): EthereumAddress;
    static validateWeiAmount(value: string): WeiAmount;
    private static ethToWei;
    static validateGasLimit(gasLimit: string): GasLimit;
    static validateGasPrice(gasPrice: string): bigint;
    static validateNonce(nonce: string): bigint;
    static validateChainId(chainId: string): number;
}
//# sourceMappingURL=validation.d.ts.map