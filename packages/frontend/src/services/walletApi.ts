/**
 * Wallet API service - handles all wallet-related API calls
 */

interface GenerateWalletRequest {
  mnemonic: string;
  accountIndex?: number;
}

interface GenerateWalletResponse {
  success: boolean;
  account?: {
    address: string;
    derivationPath: string;
    index: number;
  };
  error?: string;
}

interface SignTransactionRequest {
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: string;
  chainId: string;
  broadcast?: boolean;
  mnemonic: string;
  accountIndex?: number;
}

interface SignTransactionResponse {
  success: boolean;
  signedTransaction?: any;
  txHash?: string;
  broadcast?: boolean;
  error?: string;
}

export const walletApi = {
  /**
   * Generate/Load wallet with provided mnemonic
   */
  generateWallet: async (data: GenerateWalletRequest): Promise<GenerateWalletResponse> => {
    const response = await fetch('/api/wallet/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  },

  /**
   * Sign and optionally broadcast transaction
   */
  signTransaction: async (data: SignTransactionRequest): Promise<SignTransactionResponse> => {
    const response = await fetch('/api/transaction/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  }
};