import { useState, useCallback, useEffect } from 'react';
import { MinimalEVMWallet, WalletError, formatErrorForDisplay } from 'minimal-evm-wallet-core';
import { WalletState } from '@types';
import { walletApi } from '@services';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    wallet: null,
    account: null,
    accountIndex: 0,
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

  const generateWallet = useCallback(async (accountIndex: number = 0) => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: '', success: '' }));
      
      // Use default test mnemonic like CLI does
      const defaultMnemonic = 'test test test test test test test test test test test junk';
      
      // Call backend API to generate wallet with default mnemonic
      const data = await walletApi.generateWallet({
        mnemonic: defaultMnemonic,
        accountIndex: accountIndex
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate wallet');
      }
      
      // Create wallet object with default mnemonic for frontend use
      const wallet = new MinimalEVMWallet();
      wallet.createFromMnemonic(defaultMnemonic);
      
      setWalletState(prev => ({
        ...prev,
        wallet, // Keep wallet object for transaction signing
        account: data.account,
        accountIndex: accountIndex,
        isLoading: false,
        success: `Demo wallet loaded successfully! 🎉\nAccount ${accountIndex}: ${data.account?.address}`
      }));
      
      return { account: data.account, mnemonic: defaultMnemonic };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate wallet';
      setWalletState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw err;
    }
  }, []);

  const importWallet = useCallback(async (mnemonic: string, accountIndex: number = 0) => {
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
      const account = wallet.deriveAccount(accountIndex);
      
      setWalletState(prev => ({
        ...prev,
        wallet,
        account,
        accountIndex: accountIndex,
        isLoading: false,
        success: `Wallet imported successfully! 🎉\nAccount ${accountIndex}: ${account?.address}`
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
      accountIndex: 0,
      isLoading: false,
      error: '',
      success: 'Wallet cleared successfully 🧹'
    });
  }, [walletState.wallet]);


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
    clearWallet
  };
};