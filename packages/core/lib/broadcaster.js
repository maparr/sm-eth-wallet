import { WalletError } from './types.js';
import { getNetworkByChainId } from './networks.js';
export class TransactionBroadcaster {
    constructor() {
        this.providers = [
            {
                url: 'https://eth-mainnet.public.blastapi.io',
                name: 'BlastAPI',
                priority: 1,
                isHealthy: true
            },
            {
                url: 'https://cloudflare-eth.com',
                name: 'Cloudflare',
                priority: 2,
                isHealthy: true
            },
            {
                url: 'https://rpc.ankr.com/eth',
                name: 'Ankr',
                priority: 3,
                isHealthy: true
            }
        ];
        this.timeout = 30000; // 30 seconds for transactions
    }
    async broadcastTransaction(signedTx) {
        const rawTx = typeof signedTx === 'string' ? signedTx : signedTx.rawTransaction;
        const transaction = typeof signedTx === 'string' ? null : signedTx;
        // Get network-specific providers
        let providersToUse = this.providers;
        if (transaction && transaction.chainId) {
            const network = getNetworkByChainId(transaction.chainId);
            if (network) {
                // Use network-specific RPC URL
                providersToUse = [{
                        url: network.rpcUrl,
                        name: network.name,
                        priority: 1,
                        isHealthy: true
                    }];
            }
        }
        // Sort providers by priority and health
        const sortedProviders = providersToUse
            .filter(p => p.isHealthy)
            .sort((a, b) => a.priority - b.priority);
        if (sortedProviders.length === 0) {
            throw new WalletError('No healthy providers available', 'NO_PROVIDERS');
        }
        let lastError = null;
        for (const provider of sortedProviders) {
            try {
                const txHash = await this.sendRawTransaction(provider, rawTx);
                // Reset provider health on success
                provider.isHealthy = true;
                delete provider.lastError;
                return txHash;
            }
            catch (error) {
                lastError = this.handleProviderError(provider, error);
                if (!this.shouldRetryError(lastError)) {
                    throw lastError;
                }
                continue;
            }
        }
        throw new WalletError('All providers failed to broadcast transaction', 'ALL_PROVIDERS_FAILED');
    }
    async sendRawTransaction(provider, rawTx) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(provider.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_sendRawTransaction',
                    params: [rawTx],
                    id: Date.now()
                }),
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.error) {
                throw data.error;
            }
            if (!data.result) {
                throw new Error('No result in response');
            }
            return data.result;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new WalletError('Request timeout after 30 seconds', 'NETWORK_TIMEOUT');
            }
            throw error;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    handleProviderError(provider, error) {
        provider.isHealthy = false;
        provider.lastError = new Date();
        // Map to WalletError
        const walletError = error instanceof WalletError ?
            error : this.mapProviderError(error, provider.name);
        return walletError;
    }
    mapProviderError(error, provider) {
        const code = error?.code || error?.error?.code;
        const message = error?.message || error?.error?.message || 'Unknown error';
        // Check for insufficient funds
        if (message.toLowerCase().includes('insufficient funds')) {
            return new WalletError('Insufficient funds for gas * price + value', 'INSUFFICIENT_FUNDS');
        }
        // Check for nonce issues
        if (message.toLowerCase().includes('nonce too low')) {
            return new WalletError('Nonce too low', 'NONCE_TOO_LOW');
        }
        switch (code) {
            case -32000:
                return new WalletError('Invalid transaction: ' + message, 'INVALID_TRANSACTION');
            case -32001:
                return new WalletError('Resource not found', 'RESOURCE_NOT_FOUND');
            case -32002:
                return new WalletError('Resource unavailable', 'RESOURCE_UNAVAILABLE');
            case -32003:
                return new WalletError('Transaction rejected', 'TRANSACTION_REJECTED');
            case -32005:
                return new WalletError('Request limit exceeded for ' + provider, 'RATE_LIMITED');
            default:
                return new WalletError(message, 'PROVIDER_ERROR');
        }
    }
    shouldRetryError(error) {
        const retriableCodes = [
            'RATE_LIMITED',
            'RESOURCE_UNAVAILABLE',
            'NETWORK_TIMEOUT',
            'PROVIDER_ERROR'
        ];
        return retriableCodes.includes(error.code);
    }
    // Get transaction status
    async getTransactionReceipt(txHash) {
        for (const provider of this.providers.filter(p => p.isHealthy)) {
            try {
                const response = await this.makeRPCCall(provider, 'eth_getTransactionReceipt', [txHash]);
                if (response) {
                    return response;
                }
            }
            catch (error) {
                continue;
            }
        }
        return null;
    }
    async makeRPCCall(provider, method, params) {
        const response = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id: Date.now()
            })
        });
        const data = await response.json();
        if (data.error) {
            throw data.error;
        }
        return data.result;
    }
}
