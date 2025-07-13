# Minimal EVM Wallet CLI - GridPlus Edition

Ethereum wallet CLI tool with cryptographic functions supporting Ethereum Mainnet and Sepolia Testnet for secure transaction creation and broadcasting.

## 🚀 Quick Start

```bash
# Setup (install deps + build CLI)
npm run setup

# Interactive CLI
npm run wallet

# Command-line mode
npm run cli:run -- --to 0x742d... --value 0.05 --nonce 0 --broadcast

# Custom mnemonic & account
npm run cli:run -- --mnemonic "your words here" --account 5 --address-only
```

## 📦 CLI Commands

- `npm run setup` - Install deps + build CLI packages
- `npm run wallet` - Interactive CLI interface  
- `npm run cli:run` - Command-line with auto-build
- `npm run cli:quick` - Command-line without build

## 🔧 CLI Usage

Generate addresses, create transactions, and broadcast to Ethereum networks. Supports custom mnemonics and account derivation paths for wallet management.