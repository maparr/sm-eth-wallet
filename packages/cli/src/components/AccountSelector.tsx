import React, { useState } from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';

interface AccountSelectorProps {
  onSelect: (account: number) => void;
}

export function AccountSelector({ onSelect }: AccountSelectorProps) {
  const [mode, setMode] = useState<'choose' | 'input'>('choose');
  const [customAccount, setCustomAccount] = useState('');

  const options = [
    {
      label: '👤 Account 0 (Default)',
      value: '0'
    },
    {
      label: '👤 Account 1',
      value: '1'
    },
    {
      label: '👤 Account 2',
      value: '2'
    },
    {
      label: '🔢 Enter Custom Account Index',
      value: 'custom'
    }
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'custom') {
      setMode('input');
    } else {
      onSelect(parseInt(item.value));
    }
  };

  const handleCustomSubmit = () => {
    const accountIndex = parseInt(customAccount);
    if (!isNaN(accountIndex) && accountIndex >= 0) {
      onSelect(accountIndex);
    }
  };

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="cyan">👤 Select Account Index:</Text>
      
      {mode === 'choose' && (
        <SelectInput
          items={options}
          onSelect={handleSelect}
        />
      )}
      
      {mode === 'input' && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="yellow">Enter account index (0 to millions/billions):</Text>
          <TextInput
            value={customAccount}
            onChange={setCustomAccount}
            onSubmit={handleCustomSubmit}
            placeholder="0"
          />
          <Box marginTop={1}>
            <Text color="gray">Press Enter to confirm</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}