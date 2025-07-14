# CLI Usage Examples

## Interactive Mode (Recommended for Broadcasting)
```bash
npm run wallet:cli
```
- Select mnemonic (test/custom)
- Choose account index
- Enter transaction details step by step
- Review and broadcast
- **✅ Broadcasting works reliably in interactive mode**

## Direct Mode Commands (Currently Limited - Broadcasting Issues)

### Basic Transfer (with npm run)
```bash
npm run wallet:cli -- --to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value 0.001 --nonce 5 --broadcast
```

### With Custom Gas (with npm run)
```bash
npm run wallet:cli -- --to 0x9fcda56b5a20574ee31A7cF27620E16f4382B439 --value 0.001 --nonce 5 --gasPrice 50000000000 --broadcast
```

### With Custom Account (with npm run)
```bash
npm run wallet:cli -- --account 1 --to 0x9fcda56b5a20574ee31A7cF27620E16f4382B439 --value 0.001 --nonce 5 --broadcast
```

### Working Example - Send to Your Address
```bash
node packages/cli/dist/cli.js --mnemonic "test test test test test test test test test test test junk" --account 10000001 --to 0x9fcda56b5a20574ee31A7cF27620E16f4382B439 --value 0.001 --nonce 5 --broadcast
```

**Notes:** 
- Now uses **30 Gwei default gas price** (increased from 2 Gwei for better transaction success)
- **Broadcasting via CLI parameters is currently not working** - CLI shows processing but doesn't complete the broadcast
- Use interactive mode (`npm run wallet:cli`) for reliable broadcasting

### Sign Only (No Broadcast)
```bash
npm run wallet:cli -- --to 0x9fcda56b5a20574ee31A7cF27620E16f4382B439 --value 0.001 --nonce 5
```

## Recent Transactions
- **0x353d1378...**: Failed transfer to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (0.00001 ETH, nonce 3)
  - Status: Failed (recipient issue)
  - Gas: 1 Gwei, 21,000 limit
  - From: 0x68A5F7ce76E56f389748a2B11e59706E463225ef

## Previous Successful Transactions
- **0x6f070e25...**: 0.000001 ETH transfer (nonce 0)
- **0x2022a1c4...**: Previous transaction


