#!/usr/bin/env node
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { SimpleWalletAPI, NETWORKS, getNetworkByChainId } from 'minimal-evm-wallet-core';

// Network display configurations with emojis
const NETWORK_DISPLAY = {
  1: { emoji: '🌐' },
  11155111: { emoji: '🧪' }
};

interface TransactionParams {
  to: string;
  value: string;
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  chainId: string;
  data: string;
  broadcast: boolean;
  accountIndex?: number;
}

async function displayBanner() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Minimal EVM Wallet CLI 🚀');
  console.log('='.repeat(60) + '\n');
}

async function selectNetwork(): Promise<string> {
  const allowedChainIds = [1, 11155111];
  const networkChoices = Object.values(NETWORKS)
    .filter(network => allowedChainIds.includes(network.chainId))
    .map(network => {
      const display = NETWORK_DISPLAY[network.chainId as keyof typeof NETWORK_DISPLAY];
      const emoji = display?.emoji || '🌐';
      return {
        name: `${emoji} ${network.name} (Chain ${network.chainId})`,
        value: network.chainId.toString()
      };
    });

  const { chainId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'chainId',
      message: '📡 Select Network:',
      choices: networkChoices
    }
  ]);

  return chainId;
}

async function getTransactionDetails(): Promise<Omit<TransactionParams, 'chainId'>> {
  const questions = [
    {
      type: 'input',
      name: 'to',
      message: '💰 Enter recipient address:',
      validate: (input: string) => {
        if (!input.startsWith('0x') || input.length !== 42) {
          return 'Please enter a valid Ethereum address (0x...)';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'value',
      message: '💎 Enter amount in ETH:',
      validate: (input: string) => {
        const num = parseFloat(input);
        if (isNaN(num) || num < 0) {
          return 'Please enter a valid positive number';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'nonce',
      message: '🔢 Enter nonce:',
      default: '0',
      validate: (input: string) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 0) {
          return 'Please enter a valid non-negative integer';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'gasPrice',
      message: '⛽ Enter gas price (in Gwei):',
      default: '20',
      validate: (input: string) => {
        const num = parseFloat(input);
        if (isNaN(num) || num <= 0) {
          return 'Please enter a valid positive number';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'gasLimit',
      message: '🚀 Enter gas limit:',
      default: '21000',
      validate: (input: string) => {
        const num = parseInt(input);
        if (isNaN(num) || num <= 0) {
          return 'Please enter a valid positive integer';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'data',
      message: '📦 Enter transaction data (optional):',
      default: '0x'
    },
    {
      type: 'confirm',
      name: 'broadcast',
      message: '📡 Broadcast transaction to network?',
      default: false
    }
  ];

  return await inquirer.prompt(questions);
}

async function displayTransactionResult(result: any, network: any) {
  const ethValue = (Number(result.signed.value) / 1e18).toFixed(6);
  const gasPriceGwei = (Number(result.signed.gasPrice) / 1e9).toFixed(2);

  console.log('\n🎉 TRANSACTION READY! 🎉');
  console.log('='.repeat(40));
  console.log(`💰 Value: ${ethValue} ETH`);
  console.log(`📍 To: ${result.signed.to}`);
  console.log(`⛽ Gas: ${gasPriceGwei} Gwei`);
  console.log(`🌐 Network: ${network.emoji} ${network.name}`);
  console.log(`🔐 Hash: ${result.signed.hash}`);
  
  if (result.txHash) {
    console.log('\n🚀 BROADCAST SUCCESSFUL! 🌟');
    console.log(`📡 TX Hash: ${result.txHash}`);
  }
  console.log('='.repeat(40) + '\n');
}

async function getWalletOptions() {
  const questions = [
    {
      type: 'confirm',
      name: 'useCustomMnemonic',
      message: '🔐 Use custom mnemonic phrase?',
      default: false
    }
  ];

  const { useCustomMnemonic } = await inquirer.prompt(questions);
  
  let mnemonic = undefined;
  let accountIndex = 0;

  if (useCustomMnemonic) {
    const mnemonicQuestion = {
      type: 'input',
      name: 'mnemonic',
      message: '📝 Enter your mnemonic phrase (12 or 24 words):',
      validate: (input: string) => {
        const words = input.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
          return 'Please enter exactly 12 or 24 words';
        }
        return true;
      }
    };
    
    const mnemonicResult = await inquirer.prompt([mnemonicQuestion]);
    mnemonic = mnemonicResult.mnemonic;
  }

  const accountQuestion = {
    type: 'input',
    name: 'accountIndex',
    message: '🔢 Enter account index (0, 1, 2, etc.):',
    default: '0',
    validate: (input: string) => {
      const num = parseInt(input);
      if (isNaN(num) || num < 0) {
        return 'Please enter a valid non-negative integer';
      }
      return true;
    }
  };

  const { accountIndex: indexStr } = await inquirer.prompt([accountQuestion]);
  accountIndex = parseInt(indexStr);

  return { mnemonic, accountIndex };
}

async function runInteractive() {
  await displayBanner();
  
  // Get wallet configuration
  const { mnemonic, accountIndex } = await getWalletOptions();
  
  // Initialize wallet
  const wallet = new SimpleWalletAPI(mnemonic);
  const address = wallet.getAddress(accountIndex);
  console.log(`🔑 Wallet Address: ${address}`);
  if (accountIndex > 0) {
    console.log(`📍 Account Index: ${accountIndex}`);
  }
  if (mnemonic) {
    console.log(`🔐 Using custom mnemonic`);
  } else {
    console.log(`🔐 Using demo mnemonic`);
  }
  console.log();

  // Interactive prompts
  const chainId = await selectNetwork();
  const txDetails = await getTransactionDetails();
  
  const params: TransactionParams = {
    ...txDetails,
    chainId,
    accountIndex
  };

  // Process transaction
  console.log('\n🔄 Creating and signing transaction...');
  const result = await wallet.createSignedTransaction(params);
  
  const network = getNetworkByChainId(parseInt(chainId));
  const display = NETWORK_DISPLAY[parseInt(chainId) as keyof typeof NETWORK_DISPLAY];
  const networkWithEmoji = { ...network, emoji: display?.emoji || '🌐' };
  await displayTransactionResult(result, networkWithEmoji);
}

async function runCommandLine(argv: any) {
  console.log('🚀 Minimal EVM Wallet CLI\n');
  
  const wallet = new SimpleWalletAPI(argv.mnemonic);
  const address = wallet.getAddress(argv.account || 0);
  console.log(`🔑 Wallet Address: ${address}`);
  if (argv.account) {
    console.log(`📍 Account Index: ${argv.account}`);
  }
  console.log();

  const params: TransactionParams = {
    to: argv.to,
    value: argv.value.toString(),
    nonce: argv.nonce.toString(),
    gasPrice: (BigInt(argv.gasPrice) * BigInt(10) ** BigInt(9)).toString(), // Convert Gwei to Wei
    gasLimit: argv.gasLimit.toString(),
    chainId: argv.chainId.toString(),
    data: argv.data || '0x',
    broadcast: argv.broadcast,
    accountIndex: argv.account || 0
  };

  console.log('🔄 Creating and signing transaction...');
  const result = await wallet.createSignedTransaction(params);
  
  const network = getNetworkByChainId(parseInt(params.chainId));
  const display = NETWORK_DISPLAY[parseInt(params.chainId) as keyof typeof NETWORK_DISPLAY];
  const networkWithEmoji = { ...network, emoji: display?.emoji || '🌐' };
  await displayTransactionResult(result, networkWithEmoji);
}

async function main() {
  try {
    const argv = await yargs(hideBin(process.argv))
      .usage('Usage: $0 [options]')
      .option('to', {
        alias: 't',
        type: 'string',
        description: 'Recipient address'
      })
      .option('value', {
        alias: 'v',
        type: 'number',
        description: 'Amount in ETH'
      })
      .option('nonce', {
        alias: 'n',
        type: 'number',
        description: 'Transaction nonce'
      })
      .option('gasPrice', {
        alias: 'g',
        type: 'number',
        description: 'Gas price in Gwei',
        default: 20
      })
      .option('gasLimit', {
        alias: 'l',
        type: 'number',
        description: 'Gas limit',
        default: 21000
      })
      .option('chainId', {
        alias: 'c',
        type: 'number',
        description: 'Chain ID (1 for mainnet, 11155111 for Sepolia)',
        default: 11155111
      })
      .option('data', {
        alias: 'd',
        type: 'string',
        description: 'Transaction data',
        default: '0x'
      })
      .option('broadcast', {
        alias: 'b',
        type: 'boolean',
        description: 'Broadcast transaction to network',
        default: false
      })
      .option('mnemonic', {
        alias: 'm',
        type: 'string',
        description: 'Custom mnemonic phrase (12 or 24 words)'
      })
      .option('account', {
        alias: 'a',
        type: 'number',
        description: 'Account derivation index (0, 1, 2, etc.)',
        default: 0
      })
      .option('address-only', {
        type: 'boolean',
        description: 'Only show wallet address (no transaction)',
        default: false
      })
      .example('$0 --to 0x742d... --value 0.05 --nonce 1 --broadcast', 'Send 0.05 ETH to address')
      .example('$0 --mnemonic "word1 word2..." --account 1 --to 0x742d... --value 0.05 --nonce 0', 'Use custom wallet and account index 1')
      .example('$0 --address-only --account 5', 'Generate address for account index 5')
      .example('$0 --mnemonic "your words here" --address-only --account 2', 'Generate address from custom mnemonic, account 2')
      .help('h')
      .alias('h', 'help')
      .argv;

    // Check for address-only mode
    if (argv['address-only']) {
      const wallet = new SimpleWalletAPI(argv.mnemonic);
      const address = wallet.getAddress(argv.account || 0);
      console.log('🚀 Minimal EVM Wallet CLI\n');
      console.log(`🔑 Wallet Address: ${address}`);
      if (argv.account) {
        console.log(`📍 Account Index: ${argv.account}`);
      }
      if (argv.mnemonic) {
        console.log(`🔐 Using custom mnemonic`);
      } else {
        console.log(`🔐 Using demo mnemonic`);
      }
      return;
    }

    // If all required arguments provided, run in command-line mode
    if (argv.to && argv.value !== undefined && argv.nonce !== undefined) {
      await runCommandLine(argv);
    } else {
      // Run in interactive mode
      await runInteractive();
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    console.log('💡 Please check your parameters and try again\n');
    process.exit(1);
  }
}

// Run the CLI
main();