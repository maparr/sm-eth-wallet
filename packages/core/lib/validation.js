import { keccak_256 } from '@noble/hashes/sha3';
import { WalletError } from './types.js';
export class InputValidator {
    // Validate and convert Ethereum address with EIP-55 checksum
    static validateAddress(address) {
        // Basic format check
        if (!/^0x[0-9a-fA-F]{40}$/i.test(address)) {
            throw new WalletError('Invalid Ethereum address format', 'INVALID_ADDRESS', 'to');
        }
        // EIP-55 checksum validation
        const addressLower = address.toLowerCase().substring(2);
        const hashBytes = keccak_256(addressLower);
        const addressHash = Buffer.from(hashBytes).toString('hex');
        let checksumAddress = '0x';
        for (let i = 0; i < addressLower.length; i++) {
            const char = addressLower[i];
            // Only uppercase letters (a-f), not numbers
            if (/[a-f]/.test(char) && parseInt(addressHash[i], 16) >= 8) {
                checksumAddress += char.toUpperCase();
            }
            else {
                checksumAddress += char;
            }
        }
        // If not all lowercase, must match checksum
        if (address !== address.toLowerCase() && address !== checksumAddress) {
            throw new WalletError('Invalid address checksum', 'INVALID_ADDRESS_CHECKSUM', 'to');
        }
        // Always return the checksummed version
        return checksumAddress;
    }
    // Validate and convert Wei amount from string
    static validateWeiAmount(value) {
        try {
            // Handle different number formats
            const cleanValue = value.trim();
            // Reject empty values
            if (!cleanValue) {
                throw new Error('Empty value');
            }
            // Check for negative sign first
            if (cleanValue.startsWith('-')) {
                throw new WalletError('Value cannot be negative', 'NEGATIVE_VALUE', 'value');
            }
            // Convert ETH to Wei if it looks like ETH amount (has decimal or is small number)
            let wei;
            if (cleanValue.includes('.')) {
                wei = this.ethToWei(cleanValue);
            }
            else {
                // For whole numbers, if less than 1000000000000000 (0.001 ETH), treat as ETH
                const num = BigInt(cleanValue);
                if (num < 1000000000000000n) {
                    wei = this.ethToWei(cleanValue);
                }
                else {
                    wei = num;
                }
            }
            // Reject negative values
            if (wei < 0n) {
                throw new WalletError('Value cannot be negative', 'NEGATIVE_VALUE', 'value');
            }
            return wei;
        }
        catch (error) {
            if (error instanceof WalletError)
                throw error;
            throw new WalletError('Invalid Wei amount', 'INVALID_VALUE', 'value');
        }
    }
    // Convert ETH string to Wei
    static ethToWei(ethValue) {
        // Check for negative sign first
        if (ethValue.startsWith('-')) {
            throw new Error('Negative value');
        }
        const parts = ethValue.split('.');
        if (parts.length > 2) {
            throw new Error('Invalid decimal format');
        }
        const wholePart = parts[0] || '0';
        const decimalPart = parts[1] || '';
        // If no decimal part, it's a whole number of ETH
        if (!parts[1]) {
            return BigInt(wholePart) * 10n ** 18n;
        }
        // Pad decimal part to 18 digits (Wei has 18 decimals)
        const paddedDecimal = decimalPart.padEnd(18, '0').slice(0, 18);
        // Combine whole and decimal parts
        const weiString = wholePart + paddedDecimal;
        return BigInt(weiString);
    }
    // Validate gas limit
    static validateGasLimit(gasLimit) {
        try {
            const gas = Number(gasLimit);
            if (!Number.isInteger(gas) || gas < 0) {
                throw new Error('Invalid gas limit');
            }
            if (gas < 21000) {
                throw new WalletError('Gas limit too low (minimum 21000)', 'GAS_LIMIT_TOO_LOW', 'gasLimit');
            }
            if (gas > 30000000) {
                throw new WalletError('Gas limit too high (maximum 30000000)', 'GAS_LIMIT_TOO_HIGH', 'gasLimit');
            }
            return gas;
        }
        catch (error) {
            if (error instanceof WalletError)
                throw error;
            throw new WalletError('Invalid gas limit', 'INVALID_GAS_LIMIT', 'gasLimit');
        }
    }
    // Validate gas price in Wei
    static validateGasPrice(gasPrice) {
        try {
            const price = BigInt(gasPrice);
            if (price < 0n) {
                throw new WalletError('Gas price cannot be negative', 'NEGATIVE_GAS_PRICE', 'gasPrice');
            }
            // Warn if gas price seems too high (>1000 Gwei)
            if (price > BigInt(1000) * BigInt(10) ** BigInt(9)) {
                console.warn('Warning: Gas price exceeds 1000 Gwei');
            }
            return price;
        }
        catch (error) {
            if (error instanceof WalletError)
                throw error;
            throw new WalletError('Invalid gas price', 'INVALID_GAS_PRICE', 'gasPrice');
        }
    }
    // Validate nonce
    static validateNonce(nonce) {
        try {
            const n = BigInt(nonce);
            if (n < 0n) {
                throw new WalletError('Nonce cannot be negative', 'NEGATIVE_NONCE', 'nonce');
            }
            return n;
        }
        catch (error) {
            if (error instanceof WalletError)
                throw error;
            throw new WalletError('Invalid nonce', 'INVALID_NONCE', 'nonce');
        }
    }
    // Validate chain ID
    static validateChainId(chainId) {
        try {
            const id = Number(chainId);
            if (!Number.isInteger(id) || id <= 0) {
                throw new Error('Invalid chain ID');
            }
            return id;
        }
        catch (error) {
            throw new WalletError('Invalid chain ID', 'INVALID_CHAIN_ID', 'chainId');
        }
    }
}
