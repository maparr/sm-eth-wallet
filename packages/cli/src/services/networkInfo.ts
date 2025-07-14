interface NetworkGasInfo {
  gasPrice: string;
  suggestedGasLimit: string;
  blockNumber: string;
  baseFee?: string;
  priorityFee?: string;
}

interface AccountInfo {
  nonce: string;
  balance: string;
}

interface NetworkStatus {
  chainId: string;
  networkName: string;
  rpcUrl: string;
  gasInfo: NetworkGasInfo;
  isConnected: boolean;
  error?: string;
}

export class NetworkInfoService {
  private static async makeRPCCall(rpcUrl: string, method: string, params: any[] = []): Promise<any> {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params
        })
      });
      
      const data: any = await response.json();
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
      }
      return data.result;
    } catch (error) {
      throw new Error(`Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCurrentNetworkStatus(chainId: string): Promise<NetworkStatus> {
    // Network configurations
    const networks: Record<string, { name: string; rpcUrl: string }> = {
      '1': { 
        name: 'Ethereum Mainnet', 
        rpcUrl: 'https://ethereum.gateway.tenderly.co' 
      },
      '11155111': { 
        name: 'Sepolia Testnet', 
        rpcUrl: 'https://sepolia.gateway.tenderly.co' 
      }
    };

    const network = networks[chainId];
    if (!network) {
      return {
        chainId,
        networkName: 'Unknown Network',
        rpcUrl: '',
        gasInfo: {
          gasPrice: '20000000000', // 20 Gwei default
          suggestedGasLimit: '21000',
          blockNumber: '0'
        },
        isConnected: false,
        error: 'Unsupported network'
      };
    }

    try {
      // Fetch current network information
      const [gasPrice, blockNumber, chainIdResult] = await Promise.all([
        this.makeRPCCall(network.rpcUrl, 'eth_gasPrice'),
        this.makeRPCCall(network.rpcUrl, 'eth_blockNumber'),
        this.makeRPCCall(network.rpcUrl, 'eth_chainId')
      ]);

      // Keep gas price in Wei (no conversion)
      const gasPriceWei = parseInt(gasPrice, 16);
      
      // Suggest gas limit based on network
      const suggestedGasLimit = chainId === '1' ? '21000' : '21000'; // Same for now
      
      return {
        chainId,
        networkName: network.name,
        rpcUrl: network.rpcUrl,
        gasInfo: {
          gasPrice: gasPriceWei.toString(), // Raw Wei value
          suggestedGasLimit,
          blockNumber: parseInt(blockNumber, 16).toString(),
          baseFee: gasPriceWei.toString() // Also in Wei
        },
        isConnected: true
      };
    } catch (error) {
      // Return defaults if network request fails
      return {
        chainId,
        networkName: network.name,
        rpcUrl: network.rpcUrl,
        gasInfo: {
          gasPrice: chainId === '1' ? '30000000000' : '2000000000', // 30 Gwei mainnet, 2 Gwei testnet
          suggestedGasLimit: '21000',
          blockNumber: '0'
        },
        isConnected: false,
        error: error instanceof Error ? error.message : 'Network unavailable'
      };
    }
  }

  static formatGasPrice(gasPriceWei: string): string {
    const gwei = parseInt(gasPriceWei) / 1e9;
    return gwei.toFixed(0);
  }

  static getGasPriceRecommendations(currentGasPrice: string): {
    slow: string;
    standard: string;
    fast: string;
  } {
    const baseGwei = parseInt(currentGasPrice) / 1e9;
    
    return {
      slow: Math.ceil(baseGwei * 0.8).toString(),
      standard: Math.ceil(baseGwei).toString(),
      fast: Math.ceil(baseGwei * 1.2).toString()
    };
  }

  static async getAccountInfo(rpcUrl: string, address: string): Promise<AccountInfo> {
    try {
      // Fetch both nonce and balance in parallel
      const [nonceHex, balanceHex] = await Promise.all([
        this.makeRPCCall(rpcUrl, 'eth_getTransactionCount', [address, 'latest']),
        this.makeRPCCall(rpcUrl, 'eth_getBalance', [address, 'latest'])
      ]);

      const nonce = parseInt(nonceHex, 16);
      const balance = parseInt(balanceHex, 16);
      const balanceEth = (balance / 1e18).toFixed(6);

      return {
        nonce: nonce.toString(),
        balance: balanceEth
      };
    } catch (error) {
      return {
        nonce: '0',
        balance: '0.000000'
      };
    }
  }
}