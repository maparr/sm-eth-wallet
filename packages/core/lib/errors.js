import { WalletError } from './types.js';
// Error message templates for better UX
export const ERROR_MESSAGES = {
    // Mnemonic errors
    INVALID_MNEMONIC_LENGTH: {
        title: 'Incorrect Word Count',
        message: 'Recovery phrases must contain exactly 12, 15, 18, 21, or 24 words.',
        action: 'Please check your backup and enter the complete recovery phrase.',
        severity: 'error'
    },
    INVALID_MNEMONIC_WORDS: {
        title: 'Unrecognized Words',
        message: 'Some words are not in the BIP39 wordlist.',
        action: 'Check spelling or try selecting from suggested words.',
        severity: 'error'
    },
    INVALID_MNEMONIC_CHECKSUM: {
        title: 'Invalid Recovery Phrase',
        message: 'The recovery phrase checksum is invalid.',
        action: 'Verify the word order and spelling. Each word must be exactly as written.',
        severity: 'error'
    },
    // Transaction errors
    INVALID_ADDRESS: {
        title: 'Invalid Address',
        message: 'The Ethereum address format is incorrect.',
        action: 'Ensure the address starts with 0x and contains 40 hexadecimal characters.',
        severity: 'error'
    },
    INVALID_VALUE: {
        title: 'Invalid Amount',
        message: 'The transaction value is invalid.',
        action: 'Enter a valid amount in ETH or Wei.',
        severity: 'error'
    },
    GAS_LIMIT_TOO_LOW: {
        title: 'Gas Limit Too Low',
        message: 'The gas limit is below the minimum required.',
        action: 'Set gas limit to at least 21000.',
        severity: 'error'
    },
    // Network errors
    NETWORK_TIMEOUT: {
        title: 'Network Timeout',
        message: 'The request timed out.',
        action: 'Check your internet connection and try again.',
        severity: 'error'
    },
    ALL_PROVIDERS_FAILED: {
        title: 'Connection Failed',
        message: 'Unable to connect to any Ethereum node.',
        action: 'Please try again later or check network status.',
        severity: 'error'
    }
};
// Provider-specific error mapping
export function mapProviderError(error, provider) {
    const code = error.code || error.error?.code;
    switch (code) {
        case -32000:
            return new WalletError('Invalid transaction: ' + (error.message || 'Unknown error'), 'INVALID_TRANSACTION');
        case -32001:
            return new WalletError('Resource not found', 'RESOURCE_NOT_FOUND');
        case -32002:
            return new WalletError('Resource unavailable', 'RESOURCE_UNAVAILABLE');
        case -32003:
            return new WalletError('Transaction rejected', 'TRANSACTION_REJECTED');
        case -32005:
            return new WalletError('Request limit exceeded for ' + provider, 'RATE_LIMITED');
        default:
            return new WalletError(error.message || 'Unknown provider error', 'PROVIDER_ERROR');
    }
}
// Retry logic helper
export function shouldRetryError(error) {
    const retriableCodes = [
        'RATE_LIMITED',
        'RESOURCE_UNAVAILABLE',
        'NETWORK_TIMEOUT',
        'PROVIDER_ERROR'
    ];
    return retriableCodes.includes(error.code);
}
// Format error for user display
export function formatErrorForDisplay(error) {
    const template = ERROR_MESSAGES[error.code];
    if (template) {
        return `${template.title}: ${template.message}\n${template.action}`;
    }
    return `Error: ${error.message}`;
}
