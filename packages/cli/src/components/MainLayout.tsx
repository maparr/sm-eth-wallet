import React, { PropsWithChildren } from 'react';
import { Box } from 'ink';

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <Box 
      height={'100%'} 
      width={'100%'} 
      flexDirection={'column'} 
      padding={1}
    >
      {children}
    </Box>
  );
}