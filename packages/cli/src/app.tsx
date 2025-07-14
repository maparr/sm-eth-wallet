import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { SimpleWalletAPI } from 'minimal-evm-wallet-core';
import {
  WalletBanner,
  NetworkSelector,
  TransactionInput,
  TransactionResult,
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
  NETWORK: 'network', 
  INPUT: 'input',
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

  useEffect(() => {
    try {
      // Create wallet with mnemonic and account support
      const walletInstance = new SimpleWalletAPI(argv.mnemonic);
      setWallet(walletInstance);
      
      // Get address for the specified account
      const address = walletInstance.getAddress(argv.account || 0);
      setAccountAddress(address);
      
      if (mode === 'direct') {
        // Direct CLI mode with args - enhanced with wallet support
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
      } else {
        // Interactive mode
        setStep(APP_STATUS.NETWORK);
      }
    } catch (error) {
      setError(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep(APP_STATUS.ERROR);
    }
  }, [mode, argv.mnemonic, argv.account]);

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
      processTransaction();
    } else {
      setInputStep(prev => prev + 1);
    }
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
            <Text>📍 To: {params.to}</Text>
            <Text>💰 Value: {params.value} ETH</Text>
            <Text>🌐 Chain: {params.chainId === '1' ? 'Mainnet' : 'Sepolia'}</Text>
            <Text>📡 Broadcast: {params.broadcast ? 'YES' : 'NO'}</Text>
          </Box>
        )}
        
        {step === APP_STATUS.RESULT && result && (
          <Box borderStyle={'single'} padding={2}>
            <Text color="green">✅ Transaction Created Successfully!</Text>
            <Text>📋 Signed Hash: <Text color="cyan">{result.signed?.hash}</Text></Text>
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
          <Text>🔑 Account {argv.account || 0}: <Text color="cyan">{accountAddress}</Text></Text>
          <Text>🔐 Mnemonic: <Text color="yellow">{argv.mnemonic ? 'Custom' : 'Default'}</Text></Text>
        </Box>
      ) : null}
      
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
      
      {step === APP_STATUS.PROCESSING && (
        <Box borderStyle={'single'} padding={2}>
          <Text color="cyan">🔄 Creating and signing transaction...</Text>
        </Box>
      )}
      
      {step === APP_STATUS.RESULT && result && (
        <TransactionResult result={result} />
      )}
      
      {step === APP_STATUS.ERROR && error && (
        <ErrorDisplay error={error} />
      )}
    </MainLayout>
  );
}