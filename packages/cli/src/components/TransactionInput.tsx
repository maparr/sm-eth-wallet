import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import { NetworkInfoService } from '../services/networkInfo.js';

interface TransactionInputProps {
  step: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  chainId?: string;
  accountAddress?: string;
}

export function TransactionInput({ step, value, onChange, onSubmit, chainId = '11155111', accountAddress }: TransactionInputProps) {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch network info when we reach gas price or gas limit steps
  useEffect(() => {
    if (step === 3 || step === 4) { // Gas price or gas limit steps
      setLoading(true);
      NetworkInfoService.getCurrentNetworkStatus(chainId)
        .then(info => {
          setNetworkInfo(info);
          setLoading(false);
        })
        .catch((error) => {
          // Set fallback values on error
          setNetworkInfo({
            chainId,
            networkName: 'Sepolia Testnet',
            rpcUrl: '',
            gasInfo: {
              gasPrice: '2000000000', // 2 Gwei fallback
              suggestedGasLimit: '21000',
              blockNumber: '0'
            },
            isConnected: false,
            error: 'Network request failed'
          });
          setLoading(false);
        });
    }
  }, [step, chainId]);

  // Fetch account info when we reach nonce step
  useEffect(() => {
    if (step === 2 && accountAddress) { // Nonce step
      setLoading(true);
      NetworkInfoService.getCurrentNetworkStatus(chainId)
        .then(networkStatus => {
          if (networkStatus.rpcUrl && networkStatus.isConnected) {
            return NetworkInfoService.getAccountInfo(networkStatus.rpcUrl, accountAddress);
          }
          throw new Error('Network not connected');
        })
        .then(info => {
          setAccountInfo(info);
          setLoading(false);
        })
        .catch((error) => {
          // Set fallback values on error
          setAccountInfo({ nonce: '0', balance: '0.000000' });
          setLoading(false);
        });
    }
  }, [step, chainId, accountAddress]);

  const getInputConfig = () => {
    const baseInputs = [
      { label: '💰 Recipient Address', placeholder: '0x742d35Cc6634C0532925a3b844Bc9e7595f8f832' },
      { label: '💎 Amount (ETH)', placeholder: '0.05' },
      { 
        label: '🔢 Nonce', 
        placeholder: accountInfo?.nonce || '0'
      },
      { 
        label: '⛽ Gas Price (Wei)', 
        placeholder: networkInfo?.gasInfo?.gasPrice || '2000000000'
      },
      { 
        label: '🚀 Gas Limit', 
        placeholder: networkInfo?.gasInfo?.suggestedGasLimit || '21000'
      },
      { label: '📦 Data (optional)', placeholder: '0x' }
    ];
    return baseInputs[step];
  };

  const currentInput = getInputConfig();
  if (!currentInput) return null;

  const showNetworkInfo = (step === 2 || step === 3 || step === 4) && (networkInfo || accountInfo);
  const showGasRecommendations = step === 3 && networkInfo?.gasInfo;
  const showNonceInfo = step === 2 && accountInfo;

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="yellow">{currentInput.label}</Text>
      
      {/* Network status */}
      {showNetworkInfo && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="cyan">🌐 {networkInfo?.networkName || 'Sepolia Testnet'} {networkInfo?.isConnected ? '✅' : '❌'}</Text>
          {loading && <Text color="white">⏳ Fetching current network info...</Text>}
          {networkInfo?.error && <Text color="red">⚠️  {networkInfo.error}</Text>}
        </Box>
      )}
      
      {/* Nonce information */}
      {showNonceInfo && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="white">💡 Current account nonce: {accountInfo.nonce}</Text>
          <Text color="white">💰 Account balance: {accountInfo.balance} ETH</Text>
        </Box>
      )}
      
      {/* Gas price recommendations */}
      {showGasRecommendations && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="white">💡 Current network gas price: {networkInfo.gasInfo.gasPrice} Wei</Text>
          {(() => {
            const currentGasPriceWei = parseInt(networkInfo.gasInfo.gasPrice);
            const slowWei = Math.ceil(currentGasPriceWei * 0.8);
            const standardWei = currentGasPriceWei;
            const fastWei = Math.ceil(currentGasPriceWei * 1.2);
            return (
              <Box flexDirection="column">
                <Text color="white">   🐌 Slow: {slowWei} Wei</Text>
                <Text color="white">   ⚡ Standard: {standardWei} Wei</Text>
                <Text color="white">   🚀 Fast: {fastWei} Wei</Text>
              </Box>
            );
          })()}
        </Box>
      )}
      
      {/* Gas limit info */}
      {step === 4 && networkInfo?.gasInfo && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="white">💡 Standard transfer: 21,000 gas</Text>
          <Text color="white">   📝 Contract interaction: 50,000-200,000 gas</Text>
          <Text color="white">   🔄 Complex contracts: 200,000+ gas</Text>
        </Box>
      )}
      
      <Text color="white">Suggested: {currentInput.placeholder}</Text>
      <Box marginTop={1}>
        <Text color="green">▶ </Text>
        <TextInput
          value={value || ''}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={currentInput.placeholder}
        />
      </Box>
    </Box>
  );
}