# Minimal EVM Wallet - Frontend

A production-ready React frontend for the Minimal EVM Wallet with clean architecture and full integration with the core wallet functionality.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck
```

## 🏗️ Project Architecture

### Clean Architecture Structure
```
src/
├── containers/           # Container components (business logic)
│   └── WalletInterface.tsx
├── components/          # Reusable UI components
│   ├── WalletCard.tsx
│   ├── SendTransactionForm.tsx
│   ├── TransactionHistory.tsx
│   ├── WalletSettings.tsx
│   ├── TabNavigation.tsx
│   ├── WelcomeHeader.tsx
│   └── ui/             # Base UI components
│       ├── alert.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── hooks/              # Custom React hooks
│   ├── useWallet.ts
│   ├── useTransactionHistory.ts
│   └── useValidation.ts
├── types/              # TypeScript type definitions
├── utils/              # Helper functions and utilities
├── constants/          # Application constants
└── lib/               # Third-party configurations
```

## 🎯 Features

### Core Wallet Functions
- **Generate Wallet**: BIP44 HD wallet generation with mnemonic phrases
- **Import Wallet**: Restore wallet from existing mnemonic
- **Send Transactions**: Create, sign, and broadcast EIP-155 transactions
- **Transaction History**: View past transactions with status tracking
- **Network Support**: Ethereum Mainnet, Sepolia, Polygon, BSC, Avalanche

### UI/UX Features
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live balance updates and transaction status
- **Network Switching**: Easy network selection with automatic RPC switching
- **Security Display**: Clear security indicators and warnings
- **Export/Import**: Wallet backup and restoration functionality

## 🔧 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI primitives
- **State Management**: Custom React hooks with local state
- **Core Integration**: `@minimal-wallet/core` package
- **Build Tool**: Vite with TypeScript compilation
- **Icons**: Lucide React icons

## 📦 Dependencies

### Core Dependencies
- `@minimal-wallet/core` - Wallet core functionality
- `react` & `react-dom` - React framework
- `lucide-react` - Icon components
- `@radix-ui/react-slot` - Headless UI primitives
- `class-variance-authority` - CSS class utilities
- `clsx` - Conditional class names

### Development Dependencies
- `typescript` - Type checking
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React plugin for Vite
- `tailwindcss` - CSS framework
- `eslint` - Code linting

## 🏛️ Component Architecture

### Container Pattern
- **WalletInterface**: Main container orchestrating all wallet operations
- **Separation of Concerns**: UI components receive props, containers handle logic

### Hook-Based State Management
- **useWallet**: Wallet state and operations (generate, import, clear)
- **useTransactionHistory**: Transaction storage and retrieval
- **useValidation**: Form validation and error handling

### Reusable Components
- **WalletCard**: Wallet management interface
- **SendTransactionForm**: Transaction creation and signing
- **TransactionHistory**: Historical transaction display
- **WalletSettings**: Network and security configuration

## 🔒 Security Features

- **BIP44 HD Derivation**: Standard hierarchical deterministic wallets
- **EIP-155 Signing**: Replay attack protection
- **Memory-Only Storage**: Private keys never persist to disk
- **Minimal Dependencies**: Reduced attack surface
- **Input Validation**: Comprehensive form and transaction validation

## 🌐 Network Configuration

Supports multiple EVM networks with automatic configuration:
- Ethereum Mainnet & Sepolia Testnet
- Polygon (Matic) & Mumbai Testnet
- BSC (Binance Smart Chain) & Testnet
- Avalanche C-Chain & Fuji Testnet

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel deploy
```

### Manual Deployment
```bash
# Build static files
npm run build

# Serve from dist/ directory
# Files are ready for any static hosting service
```

## 🔧 Development

### Local Development
```bash
npm run dev
# Opens http://localhost:3000
```

### Type Checking
```bash
npm run typecheck
# Runs TypeScript compiler without emitting files
```

### Production Build
```bash
npm run build
# Outputs to dist/ directory
```

## 📁 Integration with Core

The frontend integrates with `@minimal-wallet/core` for:
- Wallet generation and key management
- Transaction building and signing
- Network configuration and validation
- Error handling and formatting

## 🎨 UI Design Principles

- **Mobile-First**: Responsive design starting from mobile
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Lazy loading and optimized bundle size
- **User Experience**: Clear feedback and intuitive workflows
- **Security Focused**: Prominent security warnings and indicators

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run clean` | Clean build artifacts |

## 🤝 Contributing

1. Follow the established architecture patterns
2. Use TypeScript for all new components
3. Add proper error handling and validation
4. Follow the container/component separation
5. Update types when adding new features