import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { 
  NETWORKS,
  type SignedTransaction
} from '@minimal-wallet/core';
import { useWallet, useTransactionHistory, useValidation } from '@/hooks';
import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } from '@/constants';
import { TransactionForm, TabType, TransactionHistory } from '@/types';

// Component imports
import { WelcomeHeader } from '@/components/WelcomeHeader';
import { WalletCard } from '@/components/WalletCard';
import { TabNavigation } from '@/components/TabNavigation';
import { SendTransactionForm } from '@/components/SendTransactionForm';
import { TransactionHistory as TransactionHistoryComponent } from '@/components/TransactionHistory';
import { WalletSettings } from '@/components/WalletSettings';

export function WalletInterface() {
  // Hooks
  const { walletState, generateWallet, importWallet, clearWallet, updateBalance } = useWallet();
  const { transactions, addTransaction } = useTransactionHistory();
  
  // UI state
  const [mnemonic, setMnemonic] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState('sepolia');
  const [activeTab, setActiveTab] = useState<TabType>('send');
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  
  // Transaction state
  const [signedTx, setSignedTx] = useState<SignedTransaction | null>(null);
  const [broadcastResult, setBroadcastResult] = useState<string>('');
  
  // Form state
  const [txForm, setTxForm] = useState<TransactionForm>({
    to: '',
    value: '',
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: DEFAULT_GAS_LIMIT,
    nonce: '0'
  });
  
  // Form validation
  const { errors: validationErrors, isValid } = useValidation(txForm, walletState.balance);

  const { wallet, account, error, success } = walletState;

  // Auto-refresh balance when account or network changes
  useEffect(() => {
    if (account) {
      updateBalance();
    }
  }, [account, selectedNetwork, updateBalance]);

  // Wallet management handlers
  const handleGenerateWallet = useCallback(async () => {
    console.log('Generate wallet button clicked!');
    try {
      const result = await generateWallet();
      setMnemonic(result.mnemonic);
      await updateBalance(result.account.address);
    } catch (err) {
      console.error('Generate wallet error in container:', err);
    }
  }, [generateWallet, updateBalance]);

  const handleImportWallet = useCallback(async (importMnemonic: string) => {
    try {
      const result = await importWallet(importMnemonic);
      setMnemonic(importMnemonic.trim());
      await updateBalance(result.account.address);
    } catch (err) {
      // Error handled by hook
    }
  }, [importWallet, updateBalance]);

  const handleClearWallet = useCallback(() => {
    clearWallet();
    setMnemonic('');
    setSignedTx(null);
    setBroadcastResult('');
    setActiveTab('send');
  }, [clearWallet]);

  const handleExportWallet = useCallback(() => {
    if (!mnemonic || !account) return;
    
    const walletData = {
      mnemonic,
      address: account.address,
      network: selectedNetwork,
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-${account.address.slice(0, 8)}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mnemonic, account, selectedNetwork]);

  const handleRefreshBalance = useCallback(async () => {
    setIsRefreshingBalance(true);
    await updateBalance();
    setIsRefreshingBalance(false);
  }, [updateBalance]);

  const copyToClipboard = useCallback((text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    console.log(`${label || 'Text'} copied to clipboard!`);
  }, []);

  // Transaction handlers
  const handleSignTransaction = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign transaction clicked!', { account: !!account });
    if (!account) {
      console.log('Missing account');
      return;
    }

    try {
      const network = NETWORKS[selectedNetwork];
      
      // Call serverless function to sign (and optionally broadcast) transaction
      const response = await fetch('/api/transaction/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: txForm.to,
          value: (parseFloat(txForm.value) * 1e18).toString(), // Convert to wei as string
          nonce: txForm.nonce,
          gasPrice: (parseFloat(txForm.gasPrice) * 1e9).toString(), // Convert to wei as string
          gasLimit: txForm.gasLimit,
          chainId: network.chainId.toString(),
          broadcast: txForm.broadcast || false
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process transaction');
      }
      
      setSignedTx(data.signedTransaction);
      
      // If broadcast was requested and successful
      if (data.broadcast && data.txHash) {
        setBroadcastResult(data.txHash);
        
        // Add to transaction history
        addTransaction({
          hash: data.txHash,
          to: txForm.to,
          value: txForm.value,
          status: 'pending',
          timestamp: Date.now(),
          gasPrice: txForm.gasPrice,
          network: selectedNetwork
        });
        
        // Reset form for next transaction
        setTxForm({
          ...txForm,
          nonce: (parseInt(txForm.nonce) + 1).toString(),
          broadcast: false
        });
        setSignedTx(null);
        
        // Refresh balance
        updateBalance();
        console.log('Transaction signed and broadcast successfully!');
      } else {
        console.log('Transaction signed successfully!');
      }
    } catch (err) {
      console.error('Transaction signing failed:', err);
    }
  }, [account, txForm, selectedNetwork]);

  const handleBroadcast = useCallback(async () => {
    if (!signedTx || !wallet) return;

    try {
      const txHash = await wallet.broadcastTransaction(signedTx);
      setBroadcastResult(txHash);
      
      // Add to transaction history
      const newTx: TransactionHistory = {
        hash: txHash,
        to: txForm.to,
        value: txForm.value,
        status: 'pending',
        timestamp: Date.now(),
        gasPrice: txForm.gasPrice,
        network: selectedNetwork
      };
      addTransaction(newTx);
      
      // Reset form
      setTxForm({
        to: '',
        value: '',
        gasPrice: DEFAULT_GAS_PRICE,
        gasLimit: DEFAULT_GAS_LIMIT,
        nonce: (parseInt(txForm.nonce) + 1).toString()
      });
      setSignedTx(null);
      
      // Refresh balance immediately after broadcast
      updateBalance();
    } catch (err) {
      console.error('Transaction broadcast failed:', err);
    }
  }, [signedTx, wallet, txForm, selectedNetwork, addTransaction, updateBalance]);

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Welcome Header */}
      <WelcomeHeader 
        selectedNetwork={selectedNetwork}
        isWalletConnected={!!account}
      />

      {/* Global Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wallet Management Card */}
        <WalletCard
          walletState={walletState}
          selectedNetwork={selectedNetwork}
          onNetworkChange={setSelectedNetwork}
          onGenerateWallet={handleGenerateWallet}
          onImportWallet={handleImportWallet}
          onClearWallet={handleClearWallet}
          onExportWallet={handleExportWallet}
          onRefreshBalance={handleRefreshBalance}
          onCopyToClipboard={copyToClipboard}
          isRefreshingBalance={isRefreshingBalance}
        />

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isWalletConnected={!!account}
            transactionCount={transactions.length}
          />

          {/* Tab Content */}
          {activeTab === 'send' && (
            <SendTransactionForm
              walletState={walletState}
              selectedNetwork={selectedNetwork}
              txForm={txForm}
              validationErrors={validationErrors}
              signedTx={signedTx}
              broadcastResult={broadcastResult}
              isValid={isValid}
              onFormChange={setTxForm}
              onSignTransaction={handleSignTransaction}
              onBroadcast={handleBroadcast}
            />
          )}

          {activeTab === 'history' && (
            <TransactionHistoryComponent
              transactions={transactions}
              selectedNetwork={selectedNetwork}
              onCopyToClipboard={copyToClipboard}
            />
          )}

          {activeTab === 'settings' && (
            <WalletSettings
              selectedNetwork={selectedNetwork}
              onNetworkChange={setSelectedNetwork}
            />
          )}
        </div>
      </div>
    </div>
  );
}