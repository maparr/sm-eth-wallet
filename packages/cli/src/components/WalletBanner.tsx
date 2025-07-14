import React from 'react';
import { Text, Box } from 'ink';

export function WalletBanner() {
  return (
    <Box flexDirection="column" alignItems="center" marginY={1}>
      <Text color="cyan" bold>{'███████╗██╗   ██╗███╗   ███╗    ██╗    ██╗ █████╗ ██╗     ██╗     ███████╗████████╗'}</Text>
      <Text color="cyan" bold>{'██╔════╝██║   ██║████╗ ████║    ██║    ██║██╔══██╗██║     ██║     ██╔════╝╚══██╔══╝'}</Text>
      <Text color="cyan" bold>{'█████╗  ██║   ██║██╔████╔██║    ██║ █╗ ██║███████║██║     ██║     █████╗     ██║   '}</Text>
      <Text color="cyan" bold>{'██╔══╝  ╚██╗ ██╔╝██║╚██╔╝██║    ██║███╗██║██╔══██║██║     ██║     ██╔══╝     ██║   '}</Text>
      <Text color="cyan" bold>{'███████╗ ╚████╔╝ ██║ ╚═╝ ██║    ╚███╔███╔╝██║  ██║███████╗███████╗███████╗   ██║   '}</Text>
      <Text color="cyan" bold>{'╚══════╝  ╚═══╝  ╚═╝     ╚═╝     ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   '}</Text>
      <Text color="green">🚀 Minimal EVM Wallet CLI 🚀</Text>
    </Box>
  );
}