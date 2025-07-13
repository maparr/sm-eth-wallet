#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import App from './app.js';

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: minimal-wallet [options]')
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
    describe: 'Gas price in Gwei'
  })
  .option('gasLimit', {
    alias: 'l',
    type: 'string',
    describe: 'Gas limit'
  })
  .option('chainId', {
    alias: 'c',
    type: 'string',
    describe: 'Chain ID (1=mainnet, 11155111=Sepolia)'
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
  .help()
  .parseSync();

// Render the Ink app
render(<App argv={argv} />);