/**
 * Network Configuration Constants
 * Standard Ethereum network configurations for wallet operations
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorer: string;
  symbol: string;
  decimals: number;
}

export const NETWORKS: Record<string, NetworkConfig> = {
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
    symbol: 'ETH',
    decimals: 18
  }
};

// Helper functions
export const getNetworkByChainId = (chainId: number): NetworkConfig | undefined => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};

export const isValidChainId = (chainId: number): boolean => {
  return Object.values(NETWORKS).some(network => network.chainId === chainId);
};

export const getSupportedChainIds = (): number[] => {
  return Object.values(NETWORKS).map(network => network.chainId);
};

export const getNetworkNames = (): string[] => {
  return Object.keys(NETWORKS);
};