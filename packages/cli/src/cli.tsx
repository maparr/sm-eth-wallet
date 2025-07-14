#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import App from './app.js';

// Parse command line arguments with wallet support
const argv = yargs(hideBin(process.argv))
  .usage('🚀 Minimal EVM Wallet CLI\nUsage: minimal-wallet [options]')
  .option('mnemonic', {
    alias: 'm',
    type: 'string',
    describe: 'Mnemonic phrase (12 or 24 words)',
    default: 'test test test test test test test test test test test junk'
  })
  .option('account', {
    alias: 'a',
    type: 'number',
    describe: 'Account derivation index',
    default: 0
  })
  .option('to', {
    alias: 't',
    type: 'string',
    describe: 'Recipient address (hex)'
  })
  .option('value', {
    alias: 'v', 
    type: 'string',
    describe: 'Amount to send in ETH'
  })
  .option('nonce', {
    alias: 'n',
    type: 'string', 
    describe: 'Transaction nonce'
  })
  .option('gasPrice', {
    alias: 'g',
    type: 'string',
    describe: 'Gas price in Gwei',
    default: '30'
  })
  .option('gasLimit', {
    alias: 'l',
    type: 'string',
    describe: 'Gas limit',
    default: '21000'
  })
  .option('chainId', {
    alias: 'c',
    type: 'string',
    describe: 'Chain ID (1=mainnet, 11155111=Sepolia)',
    default: '11155111'
  })
  .option('broadcast', {
    alias: 'b',
    type: 'boolean',
    describe: 'Broadcast transaction to network',
    default: false
  })
  .option('data', {
    alias: 'd',
    type: 'string',
    describe: 'Transaction data (optional)',
    default: '0x'
  })
  .example('$0', 'Run interactive mode with beautiful Ink UI')
  .example('$0 --account 10000001 --to 0x742d... --value 0.000001 --nonce 0 --broadcast', 'Send 0.000001 ETH on Sepolia')
  .example('$0 --mnemonic "your words..." --account 5 --to 0x123... --value 0.01', 'Use custom mnemonic and account')
  .help()
  .parseSync();

// Validate required parameters for direct mode
function validateDirectMode(argv: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!argv.to) {
    errors.push('❌ Missing --to (recipient address)');
  }
  if (argv.value === undefined) {
    errors.push('❌ Missing --value (amount in ETH)');
  }
  if (argv.nonce === undefined) {
    errors.push('❌ Missing --nonce (transaction nonce)');
  }
  
  // Validate address format
  if (argv.to && !argv.to.match(/^0x[a-fA-F0-9]{40}$/)) {
    errors.push('❌ Invalid --to address format (must be 0x followed by 40 hex characters)');
  }
  
  // Validate chain ID
  const validChainIds = ['1', '11155111'];
  if (argv.chainId && !validChainIds.includes(argv.chainId)) {
    errors.push('❌ Invalid --chainId (use 1 for mainnet or 11155111 for Sepolia)');
  }
  
  // Validate account index
  if (argv.account < 0) {
    errors.push('❌ Invalid --account index (must be 0 or positive)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Check if running in direct mode (all required params provided)
const isDirectMode = argv.to && argv.value !== undefined && argv.nonce !== undefined;

if (isDirectMode) {
  // Direct mode: validate params and execute without Ink UI
  const validation = validateDirectMode(argv);
  
  if (!validation.isValid) {
    console.error('🚨 Parameter validation failed:');
    validation.errors.forEach(error => console.error(`  ${error}`));
    console.error('\n💡 Use --help to see usage examples');
    process.exit(1);
  }
  
  // Show initial summary in table format too
  console.log('🚀 MINIMAL EVM WALLET CLI - DIRECT MODE');
  console.log('');
  console.log('┌─────────────────────┬────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ Parameter           │ Value                                                                          │');
  console.log('├─────────────────────┼────────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│ Account Index       │ ${argv.account.toString().padEnd(78)} │`);
  console.log(`│ Recipient Address   │ ${argv.to!.padEnd(78)} │`);
  console.log(`│ Amount              │ ${(argv.value! + ' ETH').padEnd(78)} │`);
  console.log(`│ Network             │ ${(argv.chainId === '1' ? 'Ethereum Mainnet' : 'Sepolia Testnet').padEnd(78)} │`);
  console.log(`│ Nonce               │ ${argv.nonce!.toString().padEnd(78)} │`);
  console.log(`│ Gas Price           │ ${(argv.gasPrice + ' Wei').padEnd(78)} │`);
  console.log(`│ Gas Limit           │ ${argv.gasLimit.toString().padEnd(78)} │`);
  console.log(`│ Broadcast           │ ${(argv.broadcast ? 'YES' : 'NO').padEnd(78)} │`);
  console.log('└─────────────────────┴────────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
}

// Check if raw mode is supported for interactive mode
if (!isDirectMode && !process.stdin.isTTY) {
  console.error('🚨 Interactive mode requires a TTY environment');
  console.error('💡 Try running in direct mode with all required parameters:');
  console.error('   minimal-wallet --to 0x... --value 0.01 --nonce 0');
  console.error('   Use --help for more information');
  process.exit(1);
}

async function main() {
  if (isDirectMode) {
    // Direct mode: handle transaction without React UI
    const { SimpleWalletAPI } = await import('minimal-evm-wallet-core');
    
    try {
      const walletInstance = new SimpleWalletAPI(argv.mnemonic);
      
      const directParams = {
        to: argv.to!,
        value: argv.value!,
        nonce: argv.nonce!,
        gasPrice: argv.gasPrice,
        gasLimit: argv.gasLimit,
        chainId: argv.chainId,
        data: argv.data || '0x',
        broadcast: argv.broadcast || false
      };
      
      // Map to the correct wallet API parameters
      const walletParams = {
        to: directParams.to,
        value: directParams.value,
        nonce: directParams.nonce,
        gasPrice: directParams.gasPrice,
        gasLimit: directParams.gasLimit,
        chainId: directParams.chainId,
        data: directParams.data,
        accountIndex: argv?.account || 0,
        broadcast: directParams.broadcast
      };
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout (15s) - possible network issue')), 15000);
      });
      
      const txResult = await Promise.race([
        walletInstance.createSignedTransaction(walletParams),
        timeoutPromise
      ]);
      
      const result = txResult as any;
      
      // Clear output and show clean summary
      console.clear();
      
      if (result.txHash) {
        console.log('🎉 TRANSACTION BROADCASTED SUCCESSFULLY! 🎉');
        console.log('');
        
        // Table format for transaction success
        console.log('┌─────────────────────┬────────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ Field               │ Value                                                                          │');
        console.log('├─────────────────────┼────────────────────────────────────────────────────────────────────────────────┤');
        console.log(`│ Status              │ ✅ BROADCASTED                                                                 │`);
        console.log(`│ TX Hash             │ ${result.txHash.padEnd(78)} │`);
        console.log(`│ Explorer Link       │ https://sepolia.etherscan.io/tx/${result.txHash}                    │`);
        console.log(`│ Value               │ ${(directParams.value + ' ETH').padEnd(78)} │`);
        console.log(`│ To Address          │ ${directParams.to.padEnd(78)} │`);
        console.log(`│ Network             │ Sepolia Testnet                                                               │`);
        console.log(`│ Nonce               │ ${(directParams.nonce || 'N/A').padEnd(78)} │`);
        console.log(`│ Gas Price           │ ${(directParams.gasPrice || 'N/A').padEnd(78)} │`);
        console.log('└─────────────────────┴────────────────────────────────────────────────────────────────────────────────┘');
      } else {
        console.log('✅ TRANSACTION SIGNED SUCCESSFULLY!');
        console.log('');
        
        // Table format for transaction signing
        console.log('┌─────────────────────┬────────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ Field               │ Value                                                                          │');
        console.log('├─────────────────────┼────────────────────────────────────────────────────────────────────────────────┤');
        console.log(`│ Status              │ ✅ SIGNED (Not Broadcasted)                                                    │`);
        console.log(`│ Signed Hash         │ ${(result.signed?.hash || 'Not available').padEnd(78)} │`);
        console.log(`│ Value               │ ${(directParams.value + ' ETH').padEnd(78)} │`);
        console.log(`│ To Address          │ ${directParams.to.padEnd(78)} │`);
        console.log(`│ Network             │ Sepolia Testnet                                                               │`);
        console.log(`│ Nonce               │ ${(directParams.nonce || 'N/A').padEnd(78)} │`);
        console.log(`│ Gas Price           │ ${(directParams.gasPrice || 'N/A').padEnd(78)} │`);
        console.log('└─────────────────────┴────────────────────────────────────────────────────────────────────────────────┘');
      }
      
      process.exit(0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Clear output and show clean error summary
      console.clear();
      
      console.log('❌ TRANSACTION FAILED!');
      console.log('');
      
      // Table format for transaction error
      console.log('┌─────────────────────┬────────────────────────────────────────────────────────────────────────────────┐');
      console.log('│ Field               │ Value                                                                          │');
      console.log('├─────────────────────┼────────────────────────────────────────────────────────────────────────────────┤');
      console.log(`│ Status              │ ❌ FAILED                                                                      │`);
      console.log(`│ Error               │ ${errorMessage.substring(0, 78).padEnd(78)} │`);
      console.log(`│ Value               │ ${(argv.value! + ' ETH').padEnd(78)} │`);
      console.log(`│ To Address          │ ${argv.to!.padEnd(78)} │`);
      console.log(`│ Network             │ Sepolia Testnet                                                               │`);
      console.log('└─────────────────────┴────────────────────────────────────────────────────────────────────────────────┘');
      
      process.exit(1);
    }
  }
  
  // Only render React for interactive mode
  if (!isDirectMode) {
    try {
      render(<App argv={argv} isDirectMode={false} />);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Raw mode is not supported')) {
        console.error('🚨 Interactive mode not supported in this environment');
        console.error('💡 Try running in direct mode with all required parameters:');
        console.error('   minimal-wallet --to 0x... --value 0.01 --nonce 0');
        console.error('   Use --help for more information');
        process.exit(1);
      }
      throw error;
    }
  }
}

main().catch(console.error);