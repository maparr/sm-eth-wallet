import { InputValidator } from './validation.js';
export class TransactionBuilder {
    constructor() {
        this.transaction = {};
    }
    setTo(to) {
        this.transaction.to = InputValidator.validateAddress(to);
        return this;
    }
    setValue(value) {
        this.transaction.value = InputValidator.validateWeiAmount(value);
        return this;
    }
    setGasPrice(gasPrice) {
        this.transaction.gasPrice = InputValidator.validateGasPrice(gasPrice);
        return this;
    }
    setGasLimit(gasLimit) {
        this.transaction.gasLimit = BigInt(InputValidator.validateGasLimit(gasLimit));
        return this;
    }
    setNonce(nonce) {
        this.transaction.nonce = InputValidator.validateNonce(nonce);
        return this;
    }
    setChainId(chainId) {
        this.transaction.chainId = InputValidator.validateChainId(chainId);
        return this;
    }
    setData(data) {
        // Ensure data has 0x prefix
        this.transaction.data = data.startsWith('0x') ? data : '0x' + data;
        return this;
    }
    build() {
        // Validate all required fields are present
        const required = ['to', 'value', 'nonce', 'gasPrice', 'gasLimit', 'chainId'];
        const missing = required.filter(field => this.transaction[field] === undefined);
        if (missing.length > 0) {
            throw new Error(`Missing required transaction fields: ${missing.join(', ')}`);
        }
        // Set default data if not provided
        if (!this.transaction.data) {
            this.transaction.data = '0x';
        }
        return this.transaction;
    }
    // Create transaction from raw parameters
    static fromParams(params) {
        const builder = new TransactionBuilder();
        builder
            .setTo(params.to)
            .setValue(params.value)
            .setNonce(params.nonce)
            .setGasPrice(params.gasPrice)
            .setGasLimit(params.gasLimit)
            .setChainId(params.chainId);
        if (params.data) {
            builder.setData(params.data);
        }
        return builder.build();
    }
}
