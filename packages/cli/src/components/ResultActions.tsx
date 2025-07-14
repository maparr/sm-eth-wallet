import React from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';

interface ResultActionsProps {
  onReset: () => void;
  onExit: () => void;
}

export function ResultActions({ onReset, onExit }: ResultActionsProps) {
  const options = [
    {
      label: '🔄 Start New Transaction',
      value: 'reset'
    },
    {
      label: '🚪 Exit',
      value: 'exit'
    }
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'reset') {
      onReset();
    } else {
      onExit();
    }
  };

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2} marginTop={1}>
      <Text color="cyan">What would you like to do next?</Text>
      <SelectInput
        items={options}
        onSelect={handleSelect}
      />
    </Box>
  );
}