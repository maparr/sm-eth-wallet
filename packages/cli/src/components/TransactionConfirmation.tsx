import React from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';

interface TransactionConfirmationProps {
  params: {
    to: string;
    value: string;
    gasPrice: string;
    gasLimit: string;
    nonce: string;
    data?: string;
    chainId: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export function TransactionConfirmation({ params, onConfirm, onCancel }: TransactionConfirmationProps) {
  const options = [
    {
      label: '✅ Sign Transaction',
      value: 'confirm'
    },
    {
      label: '❌ Cancel',
      value: 'cancel'
    }
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'confirm') {
      onConfirm();
    } else {
      onCancel();
    }
  };

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="cyan">📋 Transaction Summary:</Text>
      <Box flexDirection="column" marginY={1}>
        <Text>📍 To: <Text color="yellow">{params.to || 'Not set'}</Text></Text>
        <Text>💰 Amount: <Text color="green">{params.value || '0'} ETH</Text></Text>
        <Text>⛽ Gas Price: <Text color="blue">{params.gasPrice || '0'} Gwei</Text></Text>
        <Text>🔥 Gas Limit: <Text color="blue">{params.gasLimit || '0'}</Text></Text>
        <Text>🔢 Nonce: <Text color="gray">{params.nonce || '0'}</Text></Text>
        <Text>🌐 Chain ID: <Text color="cyan">{params.chainId || 'Not set'}</Text></Text>
        {params.data && params.data !== '0x' && (
          <Text>📄 Data: <Text color="gray">{params.data}</Text></Text>
        )}
      </Box>
      <SelectInput
        items={options}
        onSelect={handleSelect}
      />
    </Box>
  );
}