# CLI Usage Example

## Transaction Broadcasting

```bash
npm run cli:run -- --mnemonic "test test test test test test test test test test test junk" --account 10000001 --to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value 0.000001 --nonce 0 --broadcast
```

### Output:

```
> minimal-evm-wallet@1.0.0 cli:run
> node packages/cli/dist/inquirer-cli.js --mnemonic test test test test test test test test test test test junk --account 10000001 --to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value 0.000001 --nonce 0 --broadcast

🚀 Minimal EVM Wallet CLI - GridPlus Edition

🔑 Wallet Address: 0x68A5F7ce76E56f389748a2B11e59706E463225ef
📍 Account Index: 10000001

🔄 Creating and signing transaction...

🎉 TRANSACTION READY! 🎉
========================================
💰 Value: 0.000001 ETH
📍 To: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
⛽ Gas: 20.00 Gwei
🌐 Network: 🧪 Sepolia Testnet
🔐 Hash: 0x6f070e25e3b11710ba1a41b4c5b0143695d6e394762886b1002dc16154f67423

🚀 BROADCAST SUCCESSFUL! 🌟
📡 TX Hash: 0x6f070e25e3b11710ba1a41b4c5b0143695d6e394762886b1002dc16154f67423
========================================
```

## Proof of Transaction

View the wallet and transaction on Sepolia Etherscan:
**[0x68A5F7ce76E56f389748a2B11e59706E463225ef](https://sepolia.etherscan.io/address/0x68A5F7ce76E56f389748a2B11e59706E463225ef)**


### Proof of Transaction from npm run wallet 
📡 TX Hash: 0x2022a1c4f4c84cd34eda37b49259524caae496bae325581eb9a34e3c28f3996c

