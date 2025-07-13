// Error types
export class WalletError extends Error {
    constructor(message, code, field) {
        super(message);
        this.code = code;
        this.field = field;
        this.name = 'WalletError';
    }
}
