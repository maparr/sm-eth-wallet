# CLI Usage Examples

## Interactive Mode
```bash
npm run wallet:cli
```
- Select mnemonic (test/custom)
- Choose account index
- Enter transaction details step by step
- Review and broadcast

## Direct Mode Commands

### Basic Transfer
```bash
npm run wallet:cli -- --to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --gasPrice 1000000000 --gasLimit 21000--value 0.001 --nonce 4 --broadcast
```

### Custom Gas Settings
```bash
npm run wallet:cli -- --to 0x... --value 0.001 --nonce 4  --gasPrice 1000000000 --gasLimit 21000 --gas-price 3000000000 --gas-limit 21000 --broadcast
```

### Specific Account
```bash
npm run wallet:cli -- --account 1 --to 0x... --value 0.001  --gasPrice 1000000000 --gasLimit 21000 --nonce 4 --broadcast
```

### Custom Mnemonic
```bash
npm run wallet:cli -- --mnemonic "test test test test test test test test test test test junk" --account 10000001  --gasPrice 1000000000 --gasLimit 21000 --to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value 0.001 --nonce 4 --broadcast
```

### Sign Only (No Broadcast)
```bash
npm run wallet:cli -- --to 0x... --value 0.001 --nonce 4  --gasPrice 1000000000 --gasLimit 21000
```

## Recent Transactions
- **0x353d1378...**: Failed transfer to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (0.00001 ETH, nonce 3)
  - Status: Failed (recipient issue)
  - Gas: 1 Gwei, 21,000 limit
  - From: 0x68A5F7ce76E56f389748a2B11e59706E463225ef

## Previous Successful Transactions
- **0x6f070e25...**: 0.000001 ETH transfer (nonce 0)
- **0x2022a1c4...**: Previous transaction


