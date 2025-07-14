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

// Helper function to get Etherscan URL based on chain ID
const getEtherscanUrl = (chainId: string | undefined, txHash: string): string => {
  if (chainId === '1') {
    return `https://etherscan.io/tx/${txHash}`;
  } else if (chainId === '11155111') {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  } else {
    // Default to Sepolia for unknown chains
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
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
    const initializeDirectMode = async () => {
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
          await processTransaction(directParams);
        } catch (error) {
          setError(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setStep(APP_STATUS.ERROR);
        }
      } else {
        // Interactive mode - start with mnemonic selection
        setStep(APP_STATUS.MNEMONIC);
      }
    };
    
    initializeDirectMode();
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
    
    // Don't allow empty values for required fields
    if (!currentInput.trim() && currentField !== 'data') {
      return; // Don't submit empty values
    }
    
    setParams(prev => ({
      ...prev,
      [currentField]: currentInput.trim() || (currentField === 'data' ? '0x' : '')
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
      
      // Map to the correct wallet API parameters
      const walletParams = {
        to: finalParams.to,
        value: finalParams.value,
        nonce: finalParams.nonce,
        gasPrice: finalParams.gasPrice,
        gasLimit: finalParams.gasLimit,
        chainId: finalParams.chainId,
        data: finalParams.data,
        accountIndex: mode === 'direct' ? (argv?.account || 0) : selectedAccount,
        broadcast: false
      };
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction signing timeout (15s)')), 15000);
      });
      
      const txResult = await Promise.race([
        wallet.createSignedTransaction(walletParams),
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
      
      // Map to the correct wallet API parameters
      const walletParams = {
        to: finalParams.to,
        value: finalParams.value,
        nonce: finalParams.nonce,
        gasPrice: finalParams.gasPrice,
        gasLimit: finalParams.gasLimit,
        chainId: finalParams.chainId,
        data: finalParams.data,
        accountIndex: mode === 'direct' ? (argv?.account || 0) : selectedAccount,
        broadcast: true
      };
      
      const txResult = await wallet.createSignedTransaction(walletParams);
      
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
      
      // Map to the correct wallet API parameters
      const walletParams = {
        to: finalParams.to,
        value: finalParams.value,
        nonce: finalParams.nonce,
        gasPrice: finalParams.gasPrice,
        gasLimit: finalParams.gasLimit,
        chainId: finalParams.chainId,
        data: finalParams.data,
        accountIndex: mode === 'direct' ? (argv?.account || 0) : selectedAccount,
        broadcast: finalParams.broadcast || false
      };
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout (15s) - possible network issue')), 15000);
      });
      
      console.log('📡 Broadcasting transaction to network...');
      const txResult = await Promise.race([
        wallet.createSignedTransaction(walletParams),
        timeoutPromise
      ]);
      
      const result = txResult as any;
      console.log('✅ Transaction completed:', result.txHash ? 'BROADCAST SUCCESS' : 'SIGNED ONLY');
      
      // For direct mode, immediately show result in console and exit
      if (mode === 'direct') {
        if (result.txHash) {
          console.log('\n🎉 TRANSACTION BROADCASTED SUCCESSFULLY! 🎉');
          console.log('========================================');
          console.log('📡 TX Hash:', result.txHash);
          console.log('🔗 Sepolia Etherscan:', `https://sepolia.etherscan.io/tx/${result.txHash}`);
          console.log('💰 Value:', finalParams.value, 'ETH');
          console.log('📍 To:', finalParams.to);
          console.log('🌐 Network: Sepolia Testnet');
          console.log('========================================\n');
        } else {
          console.log('\n✅ TRANSACTION SIGNED SUCCESSFULLY!');
          console.log('📋 Signed Hash:', result.signed?.hash || 'Not available');
          console.log('(Transaction was not broadcasted)\n');
        }
        
        // Exit cleanly in direct mode
        setTimeout(() => {
          process.exit(0);
        }, 100);
        return;
      }
      
      setResult(txResult);
      setStep(APP_STATUS.RESULT);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // For direct mode, show error and exit
      if (mode === 'direct') {
        console.log('\n❌ TRANSACTION FAILED!');
        console.log('========================================');
        console.log('Error:', errorMessage);
        console.log('========================================\n');
        
        setTimeout(() => {
          process.exit(1);
        }, 100);
        return;
      }
      
      setError(`Transaction processing failed: ${errorMessage}`);
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
            <Text>🔑 Account {argv.account || 0}: <Text color="cyan">{accountAddress || 'Loading...'}</Text></Text>
            <Text>🔐 Mnemonic: <Text color="yellow">{argv.mnemonic ? 'Custom' : 'Default'}</Text></Text>
          </Box>
        ) : null}
        
        {step === APP_STATUS.PROCESSING && (
          <Box borderStyle={'single'} padding={2}>
            <Text color="cyan">🔄 Processing transaction...</Text>
            <Text>📍 To: {params.to || 'Not set'}</Text>
            <Text>💰 Value: {params.value || '0'} ETH</Text>
            <Text>🔢 Nonce: {params.nonce || 'Not set'}</Text>
            <Text>⛽ Gas Price: {params.gasPrice ? `${(parseInt(params.gasPrice) / 1e9).toFixed(2)} Gwei` : 'Default'}</Text>
            <Text>🚗 Gas Limit: {params.gasLimit || 'Default'}</Text>
            <Text>🌐 Chain: {params.chainId === '1' ? 'Mainnet' : params.chainId === '11155111' ? 'Sepolia' : 'Unknown'}</Text>
            <Text>📡 Broadcast: {params.broadcast ? 'YES' : 'NO'}</Text>
          </Box>
        )}
        
        {step === APP_STATUS.RESULT && result && (
          <Box borderStyle={'double'} padding={2}>
            <Text color="green">🎉 TRANSACTION SUCCESS! 🎉</Text>
            <Text>========================================</Text>
            {result.txHash ? (
              <>
                <Text>🚀 BROADCASTED TO SEPOLIA! 🌟</Text>
                <Text>📡 TX Hash: <Text color="green">{result.txHash}</Text></Text>
                <Text>🔗 Sepolia Etherscan: <Text color="blue">{getEtherscanUrl(params.chainId, result.txHash)}</Text></Text>
                <Text>💰 Value: <Text color="cyan">{params.value} ETH</Text></Text>
                <Text>📍 To: <Text color="cyan">{params.to}</Text></Text>
                <Text>🌐 Network: <Text color="yellow">Sepolia Testnet</Text></Text>
              </>
            ) : (
              <>
                <Text>✅ Transaction Signed (Not Broadcasted)</Text>
                <Text>📋 Signed Hash: <Text color="cyan">{result.signed?.hash || 'Not available'}</Text></Text>
              </>
            )}
            <Text>========================================</Text>
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
          <Text>🔑 Account {selectedAccount}: <Text color="cyan">{accountAddress || 'Loading...'}</Text></Text>
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
          <TransactionResult result={result} chainId={params.chainId} />
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