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
export declare const NETWORKS: Record<string, NetworkConfig>;
export declare const getNetworkByChainId: (chainId: number) => NetworkConfig | undefined;
export declare const isValidChainId: (chainId: number) => boolean;
export declare const getSupportedChainIds: () => number[];
export declare const getNetworkNames: () => string[];
//# sourceMappingURL=networks.d.ts.map