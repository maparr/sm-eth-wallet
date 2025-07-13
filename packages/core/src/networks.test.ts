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
    
    // Test specific networks exist
    expect(NETWORKS.mainnet).toBeDefined();
    expect(NETWORKS.sepolia).toBeDefined();
    expect(NETWORKS.polygon).toBeDefined();
    expect(NETWORKS.mumbai).toBeDefined();
    expect(NETWORKS.arbitrum).toBeDefined();
    expect(NETWORKS.optimism).toBeDefined();
    expect(NETWORKS.base).toBeDefined();
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
    expect(sepolia.symbol).toBe('SepoliaETH');
    expect(sepolia.decimals).toBe(18);
  });

  test('polygon network configuration', () => {
    const polygon = NETWORKS.polygon;
    expect(polygon.name).toBe('Polygon Mainnet');
    expect(polygon.chainId).toBe(137);
    expect(polygon.rpcUrl).toBe('https://polygon.llamarpc.com');
    expect(polygon.explorer).toBe('https://polygonscan.com');
    expect(polygon.symbol).toBe('MATIC');
    expect(polygon.decimals).toBe(18);
  });

  test('mumbai network configuration', () => {
    const mumbai = NETWORKS.mumbai;
    expect(mumbai.name).toBe('Polygon Mumbai');
    expect(mumbai.chainId).toBe(80001);
    expect(mumbai.rpcUrl).toBe('https://rpc-mumbai.maticvigil.com');
    expect(mumbai.explorer).toBe('https://mumbai.polygonscan.com');
    expect(mumbai.symbol).toBe('MATIC');
    expect(mumbai.decimals).toBe(18);
  });

  test('arbitrum network configuration', () => {
    const arbitrum = NETWORKS.arbitrum;
    expect(arbitrum.name).toBe('Arbitrum One');
    expect(arbitrum.chainId).toBe(42161);
    expect(arbitrum.rpcUrl).toBe('https://arb1.arbitrum.io/rpc');
    expect(arbitrum.explorer).toBe('https://arbiscan.io');
    expect(arbitrum.symbol).toBe('ETH');
    expect(arbitrum.decimals).toBe(18);
  });

  test('optimism network configuration', () => {
    const optimism = NETWORKS.optimism;
    expect(optimism.name).toBe('Optimism');
    expect(optimism.chainId).toBe(10);
    expect(optimism.rpcUrl).toBe('https://mainnet.optimism.io');
    expect(optimism.explorer).toBe('https://optimistic.etherscan.io');
    expect(optimism.symbol).toBe('ETH');
    expect(optimism.decimals).toBe(18);
  });

  test('base network configuration', () => {
    const base = NETWORKS.base;
    expect(base.name).toBe('Base');
    expect(base.chainId).toBe(8453);
    expect(base.rpcUrl).toBe('https://mainnet.base.org');
    expect(base.explorer).toBe('https://basescan.org');
    expect(base.symbol).toBe('ETH');
    expect(base.decimals).toBe(18);
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

    // Test Polygon
    const polygon = getNetworkByChainId(137);
    expect(polygon).toBeDefined();
    expect(polygon?.name).toBe('Polygon Mainnet');
    expect(polygon?.chainId).toBe(137);

    // Test Mumbai
    const mumbai = getNetworkByChainId(80001);
    expect(mumbai).toBeDefined();
    expect(mumbai?.name).toBe('Polygon Mumbai');

    // Test Arbitrum
    const arbitrum = getNetworkByChainId(42161);
    expect(arbitrum).toBeDefined();
    expect(arbitrum?.name).toBe('Arbitrum One');

    // Test Optimism
    const optimism = getNetworkByChainId(10);
    expect(optimism).toBeDefined();
    expect(optimism?.name).toBe('Optimism');

    // Test Base
    const base = getNetworkByChainId(8453);
    expect(base).toBeDefined();
    expect(base?.name).toBe('Base');
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
    expect(isValidChainId(137)).toBe(true); // Polygon
    expect(isValidChainId(80001)).toBe(true); // Mumbai
    expect(isValidChainId(42161)).toBe(true); // Arbitrum
    expect(isValidChainId(10)).toBe(true); // Optimism
    expect(isValidChainId(8453)).toBe(true); // Base
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
    expect(chainIds).toHaveLength(7); // 7 networks configured
    
    // Check all expected chain IDs are present
    expect(chainIds).toContain(1); // Mainnet
    expect(chainIds).toContain(11155111); // Sepolia
    expect(chainIds).toContain(137); // Polygon
    expect(chainIds).toContain(80001); // Mumbai
    expect(chainIds).toContain(42161); // Arbitrum
    expect(chainIds).toContain(10); // Optimism
    expect(chainIds).toContain(8453); // Base
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
    expect(networkNames).toHaveLength(7); // 7 networks configured
    
    // Check all expected network names are present
    expect(networkNames).toContain('mainnet');
    expect(networkNames).toContain('sepolia');
    expect(networkNames).toContain('polygon');
    expect(networkNames).toContain('mumbai');
    expect(networkNames).toContain('arbitrum');
    expect(networkNames).toContain('optimism');
    expect(networkNames).toContain('base');
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