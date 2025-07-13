import React from 'react';
import { Text, Box } from 'ink';

interface TransactionResultProps {
  result: any;
}

export function TransactionResult({ result }: TransactionResultProps) {
  const ethValue = (Number(result.signed.value) / 1e18).toFixed(6);
  const gasPriceGwei = (Number(result.signed.gasPrice) / 1e9).toFixed(2);

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="green" bold>🎉 TRANSACTION READY! 🎉</Text>
      <Text>💰 Value: <Text color="green">{ethValue} ETH</Text></Text>
      <Text>📍 To: <Text color="yellow">{result.signed.to}</Text></Text>
      <Text>⛽ Gas: <Text color="magenta">{gasPriceGwei} Gwei</Text></Text>
      <Text>🔐 Hash: <Text color="green">{result.signed.hash}</Text></Text>
    </Box>
  );
}