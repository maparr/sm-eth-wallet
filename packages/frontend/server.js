import express from 'express';
import cors from 'cors';
import { createDemoWallet } from '@minimal-wallet/core';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Generate wallet endpoint
app.post('/api/wallet/generate', (req, res) => {
  try {
    console.log('Generating wallet on backend...');
    
    // Create wallet on the backend where Node.js crypto works
    const wallet = createDemoWallet();
    const account = wallet.deriveAccount(0);
    
    console.log('Wallet generated successfully:', account.address);
    
    // Return only the necessary data (never send private keys to frontend!)
    res.json({
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
});

app.listen(PORT, () => {
  console.log(`Wallet backend running on http://localhost:${PORT}`);
});