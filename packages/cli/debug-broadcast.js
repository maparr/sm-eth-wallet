#!/usr/bin/env node

// Simple debug script to test broadcasting without Ink UI
const { SimpleWalletAPI } = require('../core/dist-cjs/index.js');

async function testBroadcast() {
  try {
    console.log('🔄 Starting debug broadcast test...');
    
    const mnemonic = "test test test test test test test test test test test junk";
    const wallet = new SimpleWalletAPI(mnemonic);
    
    console.log('✅ Wallet created');
    console.log('📍 Address:', wallet.getAddress(10000001));
    
    const params = {
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      value: '0.00001',  // Even smaller amount
      nonce: '4',        // Next nonce after failed transaction
      gasPrice: '1000000000',  // Lower gas price (1 Gwei)
      gasLimit: '21000',
      chainId: '11155111',
      data: '0x',
      accountIndex: 10000001,
      broadcast: true
    };
    
    console.log('🔄 Calling createSignedTransaction...');
    const result = await wallet.createSignedTransaction(params);
    
    console.log('✅ Result:', result);
    if (result.txHash) {
      console.log('🎉 SUCCESS! Transaction Hash:', result.txHash);
      console.log('🔗 View on Etherscan: https://sepolia.etherscan.io/tx/' + result.txHash);
    } else {
      console.log('⚠️ No tx hash returned');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBroadcast();