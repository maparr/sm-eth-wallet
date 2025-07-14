import { MinimalEVMWallet } from 'minimal-evm-wallet-core';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, value, gasPrice, gasLimit, nonce, chainId, broadcast, mnemonic, accountIndex = 0 } = req.body;
    
    console.log('Signing transaction on serverless function...');
    
    if (!mnemonic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mnemonic is required for signing' 
      });
    }
    
    // Create wallet from provided mnemonic
    const wallet = new MinimalEVMWallet(mnemonic);
    
    // Build transaction
    const transaction = wallet.buildTransaction({
      to,
      value,
      nonce,
      gasPrice,
      gasLimit,
      chainId
    });
    
    // Sign transaction
    const signedTransaction = await wallet.signTransaction(transaction, accountIndex);
    console.log('Transaction signed successfully');
    
    let txHash = null;
    
    // Broadcast if flag is set
    if (broadcast) {
      console.log('Broadcasting transaction...');
      txHash = await wallet.broadcastTransaction(signedTransaction);
      console.log('Transaction broadcast successfully:', txHash);
    }
    
    // Convert BigInt values to strings for JSON serialization
    const serializableSignedTx = {
      ...signedTransaction,
      // Convert any BigInt values to strings
      r: signedTransaction.r?.toString(),
      s: signedTransaction.s?.toString(),
      v: signedTransaction.v?.toString(),
      gasPrice: signedTransaction.gasPrice?.toString(),
      gasLimit: signedTransaction.gasLimit?.toString(),
      value: signedTransaction.value?.toString(),
      nonce: signedTransaction.nonce?.toString()
    };
    
    res.status(200).json({
      success: true,
      signedTransaction: serializableSignedTx,
      txHash,
      broadcast: !!broadcast
    });
    
    // Clean up wallet
    wallet.dispose();
  } catch (error) {
    console.error('Transaction signing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign transaction' 
    });
  }
}