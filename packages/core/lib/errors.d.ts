import { WalletError } from './types.js';
export declare const ERROR_MESSAGES: {
    INVALID_MNEMONIC_LENGTH: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
    INVALID_MNEMONIC_WORDS: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
    INVALID_MNEMONIC_CHECKSUM: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
    INVALID_ADDRESS: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
    INVALID_VALUE: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
    GAS_LIMIT_TOO_LOW: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
    NETWORK_TIMEOUT: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
    ALL_PROVIDERS_FAILED: {
        title: string;
        message: string;
        action: string;
        severity: string;
    };
};
export declare function mapProviderError(error: any, provider: string): WalletError;
export declare function shouldRetryError(error: WalletError): boolean;
export declare function formatErrorForDisplay(error: WalletError): string;
//# sourceMappingURL=errors.d.ts.map