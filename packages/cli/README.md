# CLI Package - Minimal EVM Wallet

Interactive command-line interface for Ethereum wallet operations with beautiful UI and input validation.

## 🎨 Features

- **🎯 Two Interface Modes:**
  - **Inquirer Mode**: Traditional CLI prompts with arrow key navigation
  - **Ink Mode**: React-based terminal UI components

- **🔍 Interactive Experience:**
  - Network selection with emoji indicators
  - Step-by-step transaction building
  - Real-time input validation
  - Confirmation prompts

- **🌐 Multi-Network Support:**
  - Ethereum Mainnet
  - Sepolia Testnet  
  - Polygon
  - Arbitrum One

- **✅ Input Validation:**
  - Ethereum address validation
  - Amount and gas validation
  - Nonce validation
  - Data format checking

## 🚀 Quick Start

### Prerequisites

Make sure the core package is built first:

```bash
# From project root
npm run build --workspace=@minimal-wallet/core
```

### Installation & Build

```bash
cd packages/cli
npm install --legacy-peer-deps
npm run build
```

### Usage

```bash
# Run the interactive CLI
npm run start

# Or from project root
npm run start --workspace=@minimal-wallet/cli
```

## 🎯 CLI Flow

### 1. Welcome Screen
```
============================================================
🚀 Minimal EVM Wallet CLI - GridPlus Edition 🚀
============================================================

🔑 Wallet Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 2. Network Selection
```bash
? 📡 Select Network: (Use arrow keys)
❯ 🌐 Ethereum Mainnet (Chain 1)
  🔷 Polygon (Chain 137) 
  🔵 Arbitrum One (Chain 42161) 
  🧪 Sepolia Testnet (Chain 11155111)
```

### 3. Transaction Details
```bash
? 💰 Enter recipient address: › 0x742d35Cc6634C0532925a3b844Bc9e7595f8f832
? 💎 Enter amount in ETH: › 0.1
? 🔢 Enter nonce: › 0
? ⛽ Enter gas price (in Gwei): › 20
? 🚀 Enter gas limit: › 21000
? 📦 Enter transaction data (optional): › 0x
? 📡 Broadcast transaction to network? › No
```

### 4. Transaction Result
```bash
🎉 TRANSACTION READY! 🎉
========================================
💰 Value: 0.100000 ETH
📍 To: 0x742d35Cc6634C0532925a3b844Bc9e7595f8f832
⛽ Gas: 20.00 Gwei
🌐 Network: 🌐 Ethereum Mainnet
🔐 Hash: 0xabc123...
========================================
```

## 🏗️ Architecture

### File Structure
```
packages/cli/src/
├── components/              # React components for Ink mode
│   ├── WalletBanner.tsx     # ASCII art banner
│   ├── NetworkSelector.tsx  # Network selection UI
│   ├── TransactionInput.tsx # Transaction form
│   ├── TransactionResult.tsx# Results display
│   ├── ErrorDisplay.tsx     # Error handling
│   ├── MainLayout.tsx       # Layout wrapper
│   └── index.ts             # Component exports
├── app.tsx                  # Ink/React main app
├── cli.tsx                  # Ink entry point
└── inquirer-cli.ts          # Inquirer main CLI (current)
```

### Two Interface Modes

#### 1. Inquirer Mode (Current)
- Traditional CLI prompts
- Better for CI/CD environments
- Cleaner console output
- Built with `inquirer` package

#### 2. Ink Mode (Alternative)
- React-based terminal UI
- Rich components and layouts
- More complex but visually appealing
- Built with `ink` package

## 🔧 Configuration

### Network Configuration
Networks are defined in the CLI files:

```typescript
const NETWORKS = {
  1: { name: 'Ethereum Mainnet', emoji: '🌐' },
  11155111: { name: 'Sepolia Testnet', emoji: '🧪' },
  137: { name: 'Polygon', emoji: '🔷' },
  42161: { name: 'Arbitrum One', emoji: '🔵' }
};
```

### Input Validation Rules

- **Address**: Must start with `0x` and be 42 characters
- **Amount**: Must be positive number
- **Nonce**: Must be non-negative integer
- **Gas Price**: Must be positive number
- **Gas Limit**: Must be positive integer
- **Data**: Optional, defaults to `0x`

## 🛠️ Development

### Scripts

```bash
# Build TypeScript
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm run test

# Clean build artifacts
npm run clean
```

### Switch Interface Modes

To switch between Inquirer and Ink modes:

```bash
# Current: Inquirer mode
"start": "node dist/inquirer-cli.js"

# Switch to Ink mode
"start": "node dist/cli.js"
```

Then rebuild and run:
```bash
npm run build
npm run start
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Manual testing
npm run start
```

### Test Scenarios

1. **Valid Transaction**: Complete a transaction with valid inputs
2. **Invalid Address**: Try invalid Ethereum addresses
3. **Invalid Amounts**: Test negative/zero amounts
4. **Network Selection**: Test all network options
5. **Broadcasting**: Test both broadcast and non-broadcast options

## 🐛 Troubleshooting

### Common Issues

1. **Module Resolution Errors**
   ```bash
   # Rebuild core package
   cd ../core && npm run build
   cd ../cli && npm run build
   ```

2. **Dependency Conflicts**
   ```bash
   # Use legacy peer deps
   npm install --legacy-peer-deps
   ```

3. **TypeScript Errors**
   ```bash
   # Check imports and build core first
   npm run build --workspace=@minimal-wallet/core
   ```

4. **Ink/React JSX Issues**
   ```bash
   # Check tsconfig.json jsx setting
   "jsx": "react"
   ```

### Debug Mode

Add debug logging to troubleshoot:

```typescript
// In inquirer-cli.ts
console.log('Debug:', { chainId, txDetails });
```

## 📚 Dependencies

### Main Dependencies
- `inquirer` - Interactive CLI prompts
- `@minimal-wallet/core` - Core wallet functions
- `ink` - React for terminal (Ink mode)
- `react` - React library

### Dev Dependencies
- `typescript` - TypeScript compiler
- `@types/inquirer` - Type definitions
- `@types/react` - React types

## 🔄 Migration Guide

### From Yargs to Inquirer

The CLI was migrated from `yargs` to `inquirer` for better UX:

**Before (yargs):**
```bash
minimal-wallet --to=0x123 --value=0.1 --chainId=1
```

**After (inquirer):**
```bash
minimal-wallet
# Interactive prompts guide you through
```

### From Ink to Inquirer

Benefits of the migration:
- ✅ Better compatibility
- ✅ Simpler dependencies
- ✅ Cleaner output
- ✅ Better CI/CD support

## 🤝 Contributing

1. Test both interface modes
2. Validate input edge cases
3. Ensure network compatibility
4. Update documentation
5. Run integration tests

## 📄 API Reference

### Main Functions

- `displayBanner()` - Show welcome screen
- `selectNetwork()` - Network selection prompt
- `getTransactionDetails()` - Transaction input form
- `displayTransactionResult()` - Show results
- `main()` - Main CLI flow

### Validation Functions

- Address validation with regex
- Amount validation for positive numbers
- Gas validation for realistic values
- Network ID validation

---

## 🎉 Quick Commands

```bash
# New user setup
cd packages/cli
npm install --legacy-peer-deps
npm run build
npm run start

# Development
npm run dev    # Watch mode
npm run build  # Production build
npm run test   # Run tests
```

Ready to create transactions! 🚀