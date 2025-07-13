import { createDemoWallet } from '../../lib/index.js';

export default function handler(req, res) {
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
    console.log('Generating wallet on Vercel serverless function...');
    
    // Create wallet on the backend where Node.js crypto works
    const wallet = createDemoWallet();
    const account = wallet.deriveAccount(0);
    
    console.log('Wallet generated successfully:', account.address);
    
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