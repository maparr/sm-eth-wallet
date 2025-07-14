/**
 * Network Configuration Tests
 * Tests for network constants and helper functions
 */

import { 
  NETWORKS, 
  getNetworkByChainId, 
  isValidChainId, 
  getSupportedChainIds, 
  getNetworkNames,
  NetworkConfig 
} from './networks';

describe('Networks Configuration', () => {
  test('NETWORKS constant contains expected networks', () => {
    expect(NETWORKS).toBeDefined();
    expect(typeof NETWORKS).toBe('object');
    
    // Test specific networks exist - only Ethereum and Sepolia
    expect(NETWORKS.mainnet).toBeDefined();
    expect(NETWORKS.sepolia).toBeDefined();
    
  });

  test('mainnet network configuration', () => {
    const mainnet = NETWORKS.mainnet;
    expect(mainnet.name).toBe('Ethereum Mainnet');
    expect(mainnet.chainId).toBe(1);
    expect(mainnet.rpcUrl).toBe('https://eth.llamarpc.com');
    expect(mainnet.explorer).toBe('https://etherscan.io');
    expect(mainnet.symbol).toBe('ETH');
    expect(mainnet.decimals).toBe(18);
  });

  test('sepolia network configuration', () => {
    const sepolia = NETWORKS.sepolia;
    expect(sepolia.name).toBe('Sepolia Testnet');
    expect(sepolia.chainId).toBe(11155111);
    expect(sepolia.rpcUrl).toBe('https://sepolia.gateway.tenderly.co');
    expect(sepolia.explorer).toBe('https://sepolia.etherscan.io');
    expect(sepolia.symbol).toBe('ETH');
    expect(sepolia.decimals).toBe(18);
  });

});

describe('getNetworkByChainId', () => {
  test('returns correct network for valid chain IDs', () => {
    // Test mainnet
    const mainnet = getNetworkByChainId(1);
    expect(mainnet).toBeDefined();
    expect(mainnet?.name).toBe('Ethereum Mainnet');
    expect(mainnet?.chainId).toBe(1);

    // Test Sepolia
    const sepolia = getNetworkByChainId(11155111);
    expect(sepolia).toBeDefined();
    expect(sepolia?.name).toBe('Sepolia Testnet');
    expect(sepolia?.chainId).toBe(11155111);
  });

  test('returns undefined for invalid chain IDs', () => {
    expect(getNetworkByChainId(999999)).toBeUndefined();
    expect(getNetworkByChainId(0)).toBeUndefined();
    expect(getNetworkByChainId(-1)).toBeUndefined();
    expect(getNetworkByChainId(2)).toBeUndefined(); // Not a supported network
  });
});

describe('isValidChainId', () => {
  test('returns true for valid chain IDs', () => {
    expect(isValidChainId(1)).toBe(true); // Mainnet
    expect(isValidChainId(11155111)).toBe(true); // Sepolia
  });

  test('returns false for invalid chain IDs', () => {
    expect(isValidChainId(999999)).toBe(false);
    expect(isValidChainId(0)).toBe(false);
    expect(isValidChainId(-1)).toBe(false);
    expect(isValidChainId(2)).toBe(false);
    expect(isValidChainId(3)).toBe(false);
    expect(isValidChainId(4)).toBe(false);
  });
});

describe('getSupportedChainIds', () => {
  test('returns array of all supported chain IDs', () => {
    const chainIds = getSupportedChainIds();
    
    expect(Array.isArray(chainIds)).toBe(true);
    expect(chainIds).toHaveLength(2); // 2 networks configured
    
    // Check all expected chain IDs are present
    expect(chainIds).toContain(1); // Mainnet
    expect(chainIds).toContain(11155111); // Sepolia
  });

  test('returned chain IDs are numbers', () => {
    const chainIds = getSupportedChainIds();
    chainIds.forEach(chainId => {
      expect(typeof chainId).toBe('number');
      expect(chainId).toBeGreaterThan(0);
    });
  });
});

describe('getNetworkNames', () => {
  test('returns array of all network names', () => {
    const networkNames = getNetworkNames();
    
    expect(Array.isArray(networkNames)).toBe(true);
    expect(networkNames).toHaveLength(2); // 2 networks configured
    
    // Check all expected network names are present
    expect(networkNames).toContain('mainnet');
    expect(networkNames).toContain('sepolia');
  });

  test('returned network names are strings', () => {
    const networkNames = getNetworkNames();
    networkNames.forEach(name => {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });
});

describe('Network interface compliance', () => {
  test('all networks implement NetworkConfig interface correctly', () => {
    Object.values(NETWORKS).forEach((network: NetworkConfig) => {
      // Check required properties exist
      expect(network.name).toBeDefined();
      expect(network.chainId).toBeDefined();
      expect(network.rpcUrl).toBeDefined();
      expect(network.explorer).toBeDefined();
      expect(network.symbol).toBeDefined();
      expect(network.decimals).toBeDefined();

      // Check property types
      expect(typeof network.name).toBe('string');
      expect(typeof network.chainId).toBe('number');
      expect(typeof network.rpcUrl).toBe('string');
      expect(typeof network.explorer).toBe('string');
      expect(typeof network.symbol).toBe('string');
      expect(typeof network.decimals).toBe('number');

      // Check reasonable values
      expect(network.name.length).toBeGreaterThan(0);
      expect(network.chainId).toBeGreaterThan(0);
      expect(network.rpcUrl).toMatch(/^https?:\/\//);
      expect(network.explorer).toMatch(/^https?:\/\//);
      expect(network.symbol.length).toBeGreaterThan(0);
      expect(network.decimals).toBe(18); // All current networks use 18 decimals
    });
  });
});