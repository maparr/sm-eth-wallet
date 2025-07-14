import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  NETWORKS,
  type SignedTransaction
} from 'minimal-evm-wallet-core';
import { useWallet, useTransactionHistory, useValidation } from '@hooks';
import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE, TAB_TYPES, NETWORKS as NETWORK_KEYS, TRANSACTION_STATUSES } from '@utils';
import { TransactionForm, TabType, TransactionHistory } from '@types';

// Component imports
import { 
  Alert,
  AlertDescription,
  AlertTitle,
  WelcomeHeader,
  WalletCard,
  TabNavigation,
  SendTransactionForm,
  TransactionHistory as TransactionHistoryComponent,
  WalletSettings
} from '@components';

export function WalletInterface() {
  // Hooks
  const { walletState, generateWallet, importWallet, clearWallet } = useWallet();
  const { transactions, addTransaction } = useTransactionHistory();
  
  // UI state
  const [mnemonic, setMnemonic] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>(NETWORK_KEYS.SEPOLIA);
  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.SEND);
  // Account index is managed by WalletCard component
  
  // Transaction state
  const [signedTx, setSignedTx] = useState<SignedTransaction | null>(null);
  const [broadcastResult, setBroadcastResult] = useState<string>('');
  const [broadcastError, setBroadcastError] = useState<string>('');
  
  // Form state
  const [txForm, setTxForm] = useState<TransactionForm>({
    to: '',
    value: '',
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: DEFAULT_GAS_LIMIT,
    nonce: '0'
  });

  // Clear signed transaction when form changes
  const updateTxForm = (newForm: TransactionForm) => {
    if (signedTx) {
      setSignedTx(null);
      setBroadcastResult('');
      setBroadcastError('');
    }
    setTxForm(newForm);
  };
  
  // Form validation
  const { errors: validationErrors, isValid } = useValidation(txForm);

  const { wallet, account, accountIndex, error, success } = walletState;


  // Wallet management handlers
  const handleGenerateWallet = useCallback(async (index: number) => {
    console.log('Generate wallet button clicked!', { accountIndex: index });
    try {
      const result = await generateWallet(index);
      setMnemonic(result.mnemonic);
    } catch (err) {
      console.error('Generate wallet error in container:', err);
    }
  }, [generateWallet]);

  const handleImportWallet = useCallback(async (importMnemonic: string, accountIndex: number) => {
    try {
      await importWallet(importMnemonic, accountIndex);
      setMnemonic(importMnemonic.trim());
    } catch (err) {
      // Error handled by hook
    }
  }, [importWallet]);

  const handleClearWallet = useCallback(() => {
    clearWallet();
    setMnemonic('');
    setSignedTx(null);
    setBroadcastResult('');
    setBroadcastError('');
    setActiveTab(TAB_TYPES.SEND);
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
          broadcast: false,
          mnemonic: mnemonic,
          accountIndex: accountIndex
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process transaction');
      }
      
      setSignedTx(data.signedTransaction);
      console.log('Transaction signed successfully!');
    } catch (err) {
      console.error('Transaction signing failed:', err);
    }
  }, [account, txForm, selectedNetwork, mnemonic]);

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
        status: TRANSACTION_STATUSES.PENDING,
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
      
      // Transaction broadcast completed
    } catch (err) {
      console.error('Transaction broadcast failed:', err);
      let errorMessage = 'Transaction broadcast failed';
      
      if (err instanceof Error) {
        try {
          // Try to parse JSON error response and show the complete error
          const errorData = JSON.parse(err.message);
          errorMessage = JSON.stringify(errorData, null, 2);
        } catch {
          // If not JSON, use the original error message
          errorMessage = err.message;
        }
      }
      
      setBroadcastError(errorMessage);
      // Clear signed transaction when broadcast fails
      setSignedTx(null);
    }
  }, [signedTx, wallet, txForm, selectedNetwork, addTransaction]);

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Welcome Header */}
      <WelcomeHeader 
        selectedNetwork={selectedNetwork}
        isWalletConnected={!!account}
        onNetworkChange={(network: string) => setSelectedNetwork(network)}
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
          onNetworkChange={(network: string) => setSelectedNetwork(network)}
          onGenerateWallet={handleGenerateWallet}
          onImportWallet={handleImportWallet}
          onClearWallet={handleClearWallet}
          onExportWallet={handleExportWallet}
          onCopyToClipboard={copyToClipboard}
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
          {activeTab === TAB_TYPES.SEND && (
            <SendTransactionForm
              walletState={walletState}
              selectedNetwork={selectedNetwork}
              txForm={txForm}
              validationErrors={validationErrors}
              signedTx={signedTx}
              broadcastResult={broadcastResult}
              broadcastError={broadcastError}
              isValid={isValid}
              onFormChange={updateTxForm}
              onSignTransaction={handleSignTransaction}
              onBroadcast={handleBroadcast}
            />
          )}

          {activeTab === TAB_TYPES.HISTORY && (
            <TransactionHistoryComponent
              transactions={transactions}
              selectedNetwork={selectedNetwork}
              onCopyToClipboard={copyToClipboard}
            />
          )}

          {activeTab === TAB_TYPES.SETTINGS && (
            <WalletSettings
              selectedNetwork={selectedNetwork}
              onNetworkChange={(network: string) => setSelectedNetwork(network)}
            />
          )}
        </div>
      </div>
    </div>
  );
}