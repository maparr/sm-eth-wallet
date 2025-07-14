import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { SimpleWalletAPI } from 'minimal-evm-wallet-core';
import {
  WalletBanner,
  MnemonicSelector,
  AccountSelector,
  NetworkSelector,
  TransactionInput,
  TransactionConfirmation,
  BroadcastConfirmation,
  TransactionResult,
  ResultActions,
  ErrorDisplay,
  MainLayout
} from './components/index.js';

// Network configurations
const NETWORKS = {
  1: { name: 'Ethereum Mainnet', emoji: '🌐' },
  11155111: { name: 'Sepolia Testnet', emoji: '🧪' }
};

// App status constants
const APP_STATUS = {
  WELCOME: 'welcome',
  MNEMONIC: 'mnemonic',
  ACCOUNT: 'account',
  NETWORK: 'network', 
  INPUT: 'input',
  CONFIRM: 'confirm',
  BROADCAST: 'broadcast',
  PROCESSING: 'processing',
  RESULT: 'result',
  ERROR: 'error'
} as const;

type AppMode = 'interactive' | 'direct';
type Step = typeof APP_STATUS[keyof typeof APP_STATUS];

interface TransactionParams {
  to: string;
  value: string;
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  chainId: string;
  data: string;
  broadcast?: boolean;
}


interface AppProps {
  argv: any;
  isDirectMode: boolean;
}

export default function App({ argv, isDirectMode }: AppProps) {
  const [mode] = useState<AppMode>(isDirectMode ? 'direct' : 'interactive');
  const [step, setStep] = useState<Step>(APP_STATUS.WELCOME);
  const [params, setParams] = useState<Partial<TransactionParams>>({});
  const [wallet, setWallet] = useState<SimpleWalletAPI>();
  const [result, setResult] = useState<any>();
  const [error, setError] = useState<string>();
  const [currentInput, setCurrentInput] = useState('');
  const [inputStep, setInputStep] = useState(0);
  const [accountAddress, setAccountAddress] = useState<string>('');
  const [selectedMnemonic, setSelectedMnemonic] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<number>(0);
  const [signedTransaction, setSignedTransaction] = useState<any>(null);

  useEffect(() => {
    if (mode === 'direct') {
      // Direct CLI mode with args - enhanced with wallet support
      try {
        const walletInstance = new SimpleWalletAPI(argv.mnemonic);
        setWallet(walletInstance);
        
        // Get address for the specified account
        const address = walletInstance.getAddress(argv.account || 0);
        setAccountAddress(address);
        setSelectedMnemonic(argv.mnemonic || 'test test test test test test test test test test test junk');
        setSelectedAccount(argv.account || 0);
        
        const directParams: TransactionParams = {
          to: argv.to,
          value: argv.value,
          nonce: argv.nonce,
          gasPrice: argv.gasPrice,
          gasLimit: argv.gasLimit,
          chainId: argv.chainId,
          data: argv.data || '0x',
          broadcast: argv.broadcast || false
        };
        setParams(directParams);
        setStep(APP_STATUS.PROCESSING);
        processTransaction(directParams);
      } catch (error) {
        setError(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setStep(APP_STATUS.ERROR);
      }
    } else {
      // Interactive mode - start with mnemonic selection
      setStep(APP_STATUS.MNEMONIC);
    }
  }, [mode]);

  const handleMnemonicSelect = (mnemonic: string) => {
    setSelectedMnemonic(mnemonic);
    setStep(APP_STATUS.ACCOUNT);
  };

  const handleAccountSelect = (account: number) => {
    setSelectedAccount(account);
    
    try {
      // Create wallet with selected mnemonic and account
      const walletInstance = new SimpleWalletAPI(selectedMnemonic);
      setWallet(walletInstance);
      
      // Get address for the selected account
      const address = walletInstance.getAddress(account);
      setAccountAddress(address);
      
      setStep(APP_STATUS.NETWORK);
    } catch (error) {
      setError(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep(APP_STATUS.ERROR);
    }
  };

  const handleNetworkSelect = (chainId: string) => {
    setParams(prev => ({ ...prev, chainId }));
    setStep(APP_STATUS.INPUT);
  };

  const handleInputSubmit = () => {
    const inputs = ['to', 'value', 'nonce', 'gasPrice', 'gasLimit', 'data'];
    const currentField = inputs[inputStep];
    
    setParams(prev => ({
      ...prev,
      [currentField]: currentInput
    }));
    setCurrentInput('');
    
    if (inputStep === inputs.length - 1) {
      setStep(APP_STATUS.CONFIRM);
    } else {
      setInputStep(prev => prev + 1);
    }
  };

  const handleConfirmTransaction = async () => {
    if (!wallet) return;
    
    setStep(APP_STATUS.PROCESSING);
    try {
      const finalParams = { ...params, data: params.data || '0x' } as TransactionParams;
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction signing timeout (30s)')), 30000);
      });
      
      const txResult = await Promise.race([
        wallet.createSignedTransaction({ ...finalParams, broadcast: false }),
        timeoutPromise
      ]);
      
      setSignedTransaction(txResult);
      setStep(APP_STATUS.BROADCAST);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Transaction signing failed: ${errorMessage}`);
      setStep(APP_STATUS.ERROR);
    }
  };

  const handleBroadcast = async () => {
    if (!wallet || !signedTransaction) return;
    
    setStep(APP_STATUS.PROCESSING);
    try {
      const finalParams = { ...params, data: params.data || '0x' } as TransactionParams;
      
      const txResult = await wallet.createSignedTransaction({ ...finalParams, broadcast: true });
      
      setResult(txResult);
      setStep(APP_STATUS.RESULT);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Broadcasting failed: ${errorMessage}`);
      setStep(APP_STATUS.ERROR);
    }
  };

  const handleReset = () => {
    setStep(APP_STATUS.MNEMONIC);
    setParams({});
    setCurrentInput('');
    setInputStep(0);
    setResult(null);
    setError(undefined);
    setSignedTransaction(null);
    setWallet(undefined);
    setAccountAddress('');
    setSelectedMnemonic('');
    setSelectedAccount(0);
  };

  const handleExit = () => {
    process.exit(0);
  };

  const handleSkipBroadcast = () => {
    setResult(signedTransaction);
    setStep(APP_STATUS.RESULT);
  };

  const processTransaction = async (txParams?: TransactionParams) => {
    if (!wallet) return;
    
    setStep(APP_STATUS.PROCESSING);
    try {
      const finalParams = txParams || { ...params, data: params.data || '0x' } as TransactionParams;
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction processing timeout (30s)')), 30000);
      });
      
      const txResult = await Promise.race([
        wallet.createSignedTransaction(finalParams),
        timeoutPromise
      ]);
      
      setResult(txResult);
      setStep(APP_STATUS.RESULT);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Broadcasting failed: ${errorMessage}`);
      setStep(APP_STATUS.ERROR);
    }
  };

  // Direct mode: streamlined display
  if (mode === 'direct') {
    return (
      <MainLayout>
        <WalletBanner />
        
{accountAddress ? (
          <Box borderStyle={'single'} padding={1} marginY={1}>
            <Text>🔑 Account {argv.account || 0}: <Text color="cyan">{accountAddress}</Text></Text>
            <Text>🔐 Mnemonic: <Text color="yellow">{argv.mnemonic ? 'Custom' : 'Default'}</Text></Text>
          </Box>
        ) : null}
        
        {step === APP_STATUS.PROCESSING && (
          <Box borderStyle={'single'} padding={2}>
            <Text color="cyan">🔄 Processing transaction...</Text>
            <Text>📍 To: {params.to || 'Not set'}</Text>
            <Text>💰 Value: {params.value || '0'} ETH</Text>
            <Text>🌐 Chain: {params.chainId === '1' ? 'Mainnet' : params.chainId === '11155111' ? 'Sepolia' : 'Unknown'}</Text>
            <Text>📡 Broadcast: {params.broadcast ? 'YES' : 'NO'}</Text>
          </Box>
        )}
        
        {step === APP_STATUS.RESULT && result && (
          <Box borderStyle={'single'} padding={2}>
            <Text color="green">✅ Transaction Created Successfully!</Text>
            <Text>📋 Signed Hash: <Text color="cyan">{result.signed?.hash || 'Not available'}</Text></Text>
            {result.txHash && (
              <>
                <Text>🚀 Broadcast Hash: <Text color="green">{result.txHash}</Text></Text>
                <Text>🔗 View on Explorer: <Text color="blue">https://sepolia.etherscan.io/tx/{result.txHash}</Text></Text>
              </>
            )}
            {params.broadcast && !result.txHash && (
              <Text color="yellow">⚠️ Broadcast was requested but no tx hash returned</Text>
            )}
          </Box>
        )}
        
        {step === APP_STATUS.ERROR && error && (
          <Box borderStyle={'single'} padding={2}>
            <Text color="red">❌ Error: {error}</Text>
          </Box>
        )}
      </MainLayout>
    );
  }

  // Interactive mode: full UI experience
  return (
    <MainLayout>
      <WalletBanner />
      
{accountAddress ? (
        <Box borderStyle={'single'} padding={1} marginY={1}>
          <Text>🔑 Account {selectedAccount}: <Text color="cyan">{accountAddress}</Text></Text>
          <Text>🔐 Mnemonic: <Text color="yellow">{selectedMnemonic === 'test test test test test test test test test test test junk' ? 'Test' : 'Custom'}</Text></Text>
        </Box>
      ) : null}
      
      {step === APP_STATUS.MNEMONIC && (
        <MnemonicSelector onSelect={handleMnemonicSelect} />
      )}
      
      {step === APP_STATUS.ACCOUNT && (
        <AccountSelector onSelect={handleAccountSelect} />
      )}
      
      {step === APP_STATUS.NETWORK && (
        <NetworkSelector networks={NETWORKS} onSelect={handleNetworkSelect} />
      )}
      
      {step === APP_STATUS.INPUT && (
        <TransactionInput
          step={inputStep}
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={handleInputSubmit}
        />
      )}
      
      {step === APP_STATUS.CONFIRM && (
        <TransactionConfirmation
          params={params as any}
          onConfirm={handleConfirmTransaction}
          onCancel={handleReset}
        />
      )}
      
      {step === APP_STATUS.BROADCAST && signedTransaction && (
        <BroadcastConfirmation
          signedTransaction={signedTransaction}
          onBroadcast={handleBroadcast}
          onSkip={handleSkipBroadcast}
          onReset={handleReset}
        />
      )}
      
      {step === APP_STATUS.PROCESSING && (
        <Box borderStyle={'single'} padding={2}>
          <Text color="cyan">🔄 Processing transaction...</Text>
        </Box>
      )}
      
      {step === APP_STATUS.RESULT && result && (
        <>
          <TransactionResult result={result} />
          <ResultActions onReset={handleReset} onExit={handleExit} />
        </>
      )}
      
      {step === APP_STATUS.ERROR && error && (
        <>
          <ErrorDisplay error={error} />
          <ResultActions onReset={handleReset} onExit={handleExit} />
        </>
      )}
    </MainLayout>
  );
}