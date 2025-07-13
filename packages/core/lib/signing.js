import * as secp from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { RLP } from '@ethereumjs/rlp';
import { WalletError } from './types.js';
export class EIP155Signer {
    async signTransaction(txData, privateKey) {
        try {
            // Validate private key
            if (!secp.utils.isValidPrivateKey(privateKey)) {
                throw new WalletError('Invalid private key format', 'INVALID_PRIVATE_KEY');
            }
            // Validate transaction data
            this.validateTransaction(txData);
            // Create signing array with chainId, 0, 0 for EIP-155
            const signingArray = [
                this.toRLPValue(txData.nonce),
                this.toRLPValue(txData.gasPrice),
                this.toRLPValue(txData.gasLimit),
                txData.to,
                this.toRLPValue(txData.value),
                txData.data || '0x',
                txData.chainId,
                0,
                0
            ];
            // RLP encode and hash for signing
            const signingRLP = RLP.encode(signingArray);
            const signingHash = keccak_256(signingRLP);
            // Sign with @noble/secp256k1 using extraEntropy for additional security
            const signature = await secp.signAsync(signingHash, privateKey, {
                extraEntropy: true // Hedged signatures to prevent nonce reuse vulnerabilities
            });
            // Calculate EIP-155 v-value: v = chainId * 2 + 35 + recovery
            const recovery = signature.recovery || 0;
            const v = txData.chainId * 2 + 35 + recovery;
            // Create final transaction array with signature
            const finalTxArray = [
                this.toRLPValue(txData.nonce),
                this.toRLPValue(txData.gasPrice),
                this.toRLPValue(txData.gasLimit),
                txData.to,
                this.toRLPValue(txData.value),
                txData.data || '0x',
                v,
                this.toRLPValue(signature.r),
                this.toRLPValue(signature.s)
            ];
            // Encode final transaction
            const finalRLP = RLP.encode(finalTxArray);
            const rawTransaction = '0x' + Buffer.from(finalRLP).toString('hex');
            // Calculate transaction hash
            const hash = '0x' + Buffer.from(keccak_256(finalRLP)).toString('hex');
            return {
                ...txData,
                v,
                r: signature.r,
                s: signature.s,
                hash,
                rawTransaction
            };
        }
        catch (error) {
            if (error instanceof WalletError)
                throw error;
            throw new WalletError('Failed to sign transaction', 'SIGNING_FAILED');
        }
    }
    validateTransaction(tx) {
        // Validate address format (empty 'to' allowed for contract deployment)
        if (tx.to !== '' && !/^0x[0-9a-fA-F]{40}$/.test(tx.to)) {
            throw new WalletError('Invalid recipient address format', 'INVALID_ADDRESS', 'to');
        }
        // Validate gas limit bounds
        if (tx.gasLimit < 21000n) {
            throw new WalletError('Gas limit too low (minimum 21000)', 'INVALID_GAS_LIMIT', 'gasLimit');
        }
        if (tx.gasLimit > 30000000n) {
            throw new WalletError('Gas limit too high (maximum 30000000)', 'INVALID_GAS_LIMIT', 'gasLimit');
        }
        // Validate non-negative values
        if (tx.value < 0n) {
            throw new WalletError('Value cannot be negative', 'INVALID_VALUE', 'value');
        }
        if (tx.gasPrice < 0n) {
            throw new WalletError('Gas price cannot be negative', 'INVALID_GAS_PRICE', 'gasPrice');
        }
        if (tx.nonce < 0n) {
            throw new WalletError('Nonce cannot be negative', 'INVALID_NONCE', 'nonce');
        }
        // Validate chain ID
        if (tx.chainId <= 0) {
            throw new WalletError('Invalid chain ID', 'INVALID_CHAIN_ID', 'chainId');
        }
    }
    toRLPValue(value) {
        if (value === 0n) {
            return '0x';
        }
        // Convert to hex without leading zeros
        let hex = value.toString(16);
        if (hex.length % 2 !== 0) {
            hex = '0' + hex;
        }
        return '0x' + hex;
    }
}
