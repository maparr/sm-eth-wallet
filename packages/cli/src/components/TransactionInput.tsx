import React from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';

interface TransactionInputProps {
  step: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function TransactionInput({ step, value, onChange, onSubmit }: TransactionInputProps) {
  const inputs = [
    { label: '💰 Recipient Address', placeholder: '0x742d35Cc6634C0532925a3b844Bc9e7595f8f832' },
    { label: '💎 Amount (ETH)', placeholder: '0.05' },
    { label: '🔢 Nonce', placeholder: '0' },
    { label: '⛽ Gas Price (Gwei)', placeholder: '20' },
    { label: '🚀 Gas Limit', placeholder: '21000' },
    { label: '📦 Data (optional)', placeholder: '0x' }
  ];

  const currentInput = inputs[step];
  if (!currentInput) return null;

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="yellow">{currentInput.label}</Text>
      <Text color="gray">Example: {currentInput.placeholder}</Text>
      <Box marginTop={1}>
        <Text color="green">▶ </Text>
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={currentInput.placeholder}
        />
      </Box>
    </Box>
  );
}