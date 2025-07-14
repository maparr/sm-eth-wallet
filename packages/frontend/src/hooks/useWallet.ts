import { useState, useCallback, useEffect } from 'react';
import { MinimalEVMWallet, WalletError, formatErrorForDisplay } from 'minimal-evm-wallet-core';
import { WalletState } from '../types';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    wallet: null,
    account: null,
    balance: '0',
    isLoading: false,
    error: '',
    success: ''
  });

  const setLoading = useCallback((loading: boolean) => {
    setWalletState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string) => {
    setWalletState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setSuccess = useCallback((success: string) => {
    setWalletState(prev => ({ ...prev, success, isLoading: false }));
  }, []);

  const clearMessages = useCallback(() => {
    setWalletState(prev => ({ ...prev, error: '', success: '' }));
  }, []);

  const generateWallet = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: '', success: '' }));
      
      // This function should prompt user to import their mnemonic
      throw new Error('Please use Import Wallet to provide your mnemonic phrase');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate wallet';
      setWalletState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw err;
    }
  }, []);

  const importWallet = useCallback(async (mnemonic: string) => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: '', success: '' }));
      
      if (!mnemonic.trim()) {
        throw new WalletError('Please enter a valid mnemonic phrase', 'INVALID_MNEMONIC');
      }
      
      const words = mnemonic.trim().split(' ');
      if (words.length !== 12 && words.length !== 24) {
        throw new WalletError('Mnemonic must be 12 or 24 words', 'INVALID_MNEMONIC');
      }
      
      const wallet = new MinimalEVMWallet();
      wallet.createFromMnemonic(mnemonic.trim());
      const account = wallet.deriveAccount(0);
      
      setWalletState(prev => ({
        ...prev,
        wallet,
        account,
        isLoading: false,
        success: 'Wallet imported successfully! 🎉'
      }));
      
      return { wallet, account };
    } catch (err) {
      const errorMessage = formatErrorForDisplay(err as WalletError);
      setWalletState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw err;
    }
  }, []);

  const clearWallet = useCallback(() => {
    if (walletState.wallet) {
      walletState.wallet.dispose();
    }
    setWalletState({
      wallet: null,
      account: null,
      balance: '0',
      isLoading: false,
      error: '',
      success: 'Wallet cleared successfully 🧹'
    });
  }, [walletState.wallet]);

  const updateBalance = useCallback(async (address?: string) => {
    if (!address && !walletState.account) return;
    
    // Only update balance when wallet is loaded - implement real RPC call when needed
    setWalletState(prev => ({ ...prev, balance: '0' }));
    return '0';
  }, [walletState.account]);

  // Auto-clear messages after delay
  useEffect(() => {
    if (walletState.success) {
      const timer = setTimeout(() => {
        setWalletState(prev => ({ ...prev, success: '' }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [walletState.success]);
  
  useEffect(() => {
    if (walletState.error) {
      const timer = setTimeout(() => {
        setWalletState(prev => ({ ...prev, error: '' }));
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [walletState.error]);

  return {
    walletState,
    setLoading,
    setError,
    setSuccess,
    clearMessages,
    generateWallet,
    importWallet,
    clearWallet,
    updateBalance
  };
};