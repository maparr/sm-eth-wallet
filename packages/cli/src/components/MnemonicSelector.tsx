import React, { useState } from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';

interface MnemonicSelectorProps {
  onSelect: (mnemonic: string) => void;
}

export function MnemonicSelector({ onSelect }: MnemonicSelectorProps) {
  const [mode, setMode] = useState<'choose' | 'input'>('choose');
  const [customMnemonic, setCustomMnemonic] = useState('');

  const options = [
    {
      label: '🧪 Use Test Mnemonic (Default)',
      value: 'test'
    },
    {
      label: '✏️ Enter Custom Mnemonic',
      value: 'custom'
    }
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'test') {
      onSelect('test test test test test test test test test test test junk');
    } else {
      setMode('input');
    }
  };

  const handleCustomSubmit = () => {
    const trimmed = customMnemonic.trim();
    if (trimmed && trimmed.length > 0) {
      onSelect(trimmed);
    } else {
      // Don't submit empty mnemonic, just ignore
      console.log('Empty mnemonic not allowed');
    }
  };

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="cyan">🔐 Select Mnemonic:</Text>
      
      {mode === 'choose' && (
        <SelectInput
          items={options}
          onSelect={handleSelect}
        />
      )}
      
      {mode === 'input' && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="yellow">Enter your 12 or 24 word mnemonic phrase:</Text>
          <TextInput
            value={customMnemonic}
            onChange={setCustomMnemonic}
            onSubmit={handleCustomSubmit}
            placeholder="word1 word2 word3 ..."
          />
          <Box marginTop={1}>
            <Text color="gray">Press Enter to confirm</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}