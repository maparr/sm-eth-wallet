import React from 'react';
import { Text, Box } from 'ink';

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <Box flexDirection="column" borderStyle={'single'} borderColor="red" padding={2}>
      <Text color="red">❌ Error:</Text>
      <Text color="redBright">{error}</Text>
      <Text color="yellow">💡 Please check your parameters and try again</Text>
    </Box>
  );
}