import React from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';

interface BroadcastConfirmationProps {
  signedTransaction: any;
  onBroadcast: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export function BroadcastConfirmation({ signedTransaction, onBroadcast, onSkip, onReset }: BroadcastConfirmationProps) {
  const options = [
    {
      label: '🚀 Broadcast to Network',
      value: 'broadcast'
    },
    {
      label: '💾 Save Signed TX Only',
      value: 'skip'
    },
    {
      label: '🔄 Start Over',
      value: 'reset'
    }
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'broadcast') {
      onBroadcast();
    } else if (item.value === 'skip') {
      onSkip();
    } else {
      onReset();
    }
  };

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="green">✅ Transaction Signed Successfully!</Text>
      <Box flexDirection="column" marginY={1}>
        <Text>📋 Signed Hash: <Text color="cyan">{signedTransaction?.signed?.hash || 'Not available'}</Text></Text>
        <Text color="yellow">Choose what to do next:</Text>
      </Box>
      <SelectInput
        items={options}
        onSelect={handleSelect}
      />
    </Box>
  );
}