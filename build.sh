#!/bin/bash

echo "🚀 Building Minimal EVM Wallet Monorepo"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build packages in order
echo ""
echo "🔨 Building packages..."

# Build core first (no dependencies)
echo "  Building @minimal-wallet/core..."
cd packages/core && npm run build && cd ../..

# Build CLI (depends on core)
echo "  Building @minimal-wallet/cli..."
cd packages/cli && npm run build && cd ../..

# Build frontend (depends on core)
echo "  Building @minimal-wallet/frontend..."
cd packages/frontend && npm run build && cd ../..

echo ""
echo "✅ Build complete!"
echo ""
echo "Run 'npm run dev' to start development"
echo "Run 'npm run cli' to use the CLI"
echo "Run 'npm run frontend' to start the web interface"