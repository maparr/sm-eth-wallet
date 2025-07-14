import React from 'react';
import { Text, Box } from 'ink';

interface TransactionResultProps {
  result: any;
  chainId?: string;
}

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

export function TransactionResult({ result, chainId }: TransactionResultProps) {
  const ethValue = (Number(result.signed.value) / 1e18).toFixed(6);
  const gasPriceGwei = (Number(result.signed.gasPrice) / 1e9).toString();

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="green" bold>🎉 TRANSACTION READY! 🎉</Text>
      <Text>💰 Value: <Text color="green">{ethValue} ETH</Text></Text>
      <Text>📍 To: <Text color="yellow">{result.signed.to}</Text></Text>
      <Text>⛽ Gas: <Text color="magenta">{gasPriceGwei} Gwei</Text></Text>
      <Text>🔐 Signed Hash: <Text color="green">{result.signed.hash}</Text></Text>
      {result.txHash && (
        <>
          <Text>🚀 Broadcast Hash: <Text color="cyan">{result.txHash}</Text></Text>
          <Text>🔗 View on Explorer: <Text color="blue">{getEtherscanUrl(chainId, result.txHash)}</Text></Text>
        </>
      )}
    </Box>
  );
}