import React from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';

interface Network {
  name: string;
  emoji: string;
}

interface NetworkSelectorProps {
  networks: Record<string, Network>;
  onSelect: (chainId: string) => void;
}

export function NetworkSelector({ networks, onSelect }: NetworkSelectorProps) {
  const networkItems = Object.entries(networks).map(([chainId, network]) => ({
    label: `${network.emoji} ${network.name} (${chainId})`,
    value: chainId
  }));

  return (
    <Box flexDirection="column" borderStyle={'single'} padding={2}>
      <Text color="cyan">📡 Select Network:</Text>
      <SelectInput
        items={networkItems}
        onSelect={(item) => onSelect(item.value)}
      />
    </Box>
  );
}