import type { NextApiRequest, NextApiResponse } from 'next';
import { createDemoWallet } from 'minimal-evm-wallet-core';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create wallet on the backend where Node.js crypto works
    const wallet = createDemoWallet();
    const account = wallet.deriveAccount(0);
    
    // Return only the necessary data (never send private keys to frontend!)
    res.status(200).json({
      success: true,
      account: {
        address: account.address,
        derivationPath: account.derivationPath,
        index: account.index
      },
      mnemonic: 'test test test test test test test test test test test junk'
    });
    
    // Clean up wallet
    wallet.dispose();
  } catch (error) {
    console.error('Wallet generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate wallet' 
    });
  }
}