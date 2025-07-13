/**
 * Network Configuration Constants
 * Standard Ethereum network configurations for wallet operations
 */
export const NETWORKS = {
    mainnet: {
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpcUrl: 'https://eth.llamarpc.com',
        explorer: 'https://etherscan.io',
        symbol: 'ETH',
        decimals: 18
    },
    sepolia: {
        name: 'Sepolia Testnet',
        chainId: 11155111,
        rpcUrl: 'https://sepolia.gateway.tenderly.co',
        explorer: 'https://sepolia.etherscan.io',
        symbol: 'SepoliaETH',
        decimals: 18
    },
    polygon: {
        name: 'Polygon Mainnet',
        chainId: 137,
        rpcUrl: 'https://polygon.llamarpc.com',
        explorer: 'https://polygonscan.com',
        symbol: 'MATIC',
        decimals: 18
    },
    mumbai: {
        name: 'Polygon Mumbai',
        chainId: 80001,
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        explorer: 'https://mumbai.polygonscan.com',
        symbol: 'MATIC',
        decimals: 18
    },
    arbitrum: {
        name: 'Arbitrum One',
        chainId: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        symbol: 'ETH',
        decimals: 18
    },
    optimism: {
        name: 'Optimism',
        chainId: 10,
        rpcUrl: 'https://mainnet.optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        symbol: 'ETH',
        decimals: 18
    },
    base: {
        name: 'Base',
        chainId: 8453,
        rpcUrl: 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        symbol: 'ETH',
        decimals: 18
    }
};
// Helper functions
export const getNetworkByChainId = (chainId) => {
    return Object.values(NETWORKS).find(network => network.chainId === chainId);
};
export const isValidChainId = (chainId) => {
    return Object.values(NETWORKS).some(network => network.chainId === chainId);
};
export const getSupportedChainIds = () => {
    return Object.values(NETWORKS).map(network => network.chainId);
};
export const getNetworkNames = () => {
    return Object.keys(NETWORKS);
};
