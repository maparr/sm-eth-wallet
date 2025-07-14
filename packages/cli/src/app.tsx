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
  11155111: { name: 'Sepolia Testnet', emoji: '🧪' },
  137: { name: 'Polygon', emoji: '🔷' },
  42161: { name: 'Arbitrum One', emoji: '🔵' }
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
}

export default function App({ argv }: AppProps) {
  const [mode] = useState<AppMode>(argv.to ? 'direct' : 'interactive');
  const [step, setStep] = useState<Step>(APP_STATUS.WELCOME);
  const [params, setParams] = useState<Partial<TransactionParams>>({});
  const [wallet, setWallet] = useState<SimpleWalletAPI>();
  const [result, setResult] = useState<any>();
  const [error, setError] = useState<string>();
  const [currentInput, setCurrentInput] = useState('');
  const [inputStep, setInputStep] = useState(0);

  useEffect(() => {
    const walletInstance = new SimpleWalletAPI();
    setWallet(walletInstance);
    
    if (mode === 'direct') {
      // Direct CLI mode with args
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
  }, [mode]);

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
      const txResult = await wallet.createSignedTransaction(finalParams);
      setResult(txResult);
      setStep(APP_STATUS.RESULT);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setStep(APP_STATUS.ERROR);
    }
  };

  return (
    <MainLayout>
      <WalletBanner />
      
      {wallet && (
        <Box borderStyle={'single'} padding={1} marginY={1}>
          <Text>🔑 Wallet: <Text color="cyan">{wallet.getAddress()}</Text></Text>
        </Box>
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