import React from 'react';
import { Shield, Wallet, Zap } from 'lucide-react';
import { NETWORKS } from 'minimal-evm-wallet-core';

interface WelcomeHeaderProps {
  selectedNetwork: string;
  isWalletConnected: boolean;
}

export function WelcomeHeader({ selectedNetwork, isWalletConnected }: WelcomeHeaderProps) {
  const network = NETWORKS[selectedNetwork];

  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
        <Shield className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Minimal EVM Wallet
      </h1>
      
      <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
        Professional-grade Ethereum wallet with BIP44 HD derivation, EIP-155 transaction signing, 
        and enterprise security features. Built with minimal dependencies for maximum auditability.
      </p>
      
      {/* Status Indicators */}
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <StatusIndicator
          icon={<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          label={`Network: ${network.name}`}
          className="bg-green-100 text-green-800"
        />
        
        {isWalletConnected && (
          <StatusIndicator
            icon={<Wallet className="w-3 h-3" />}
            label="Wallet Connected"
            className="bg-blue-100 text-blue-800"
          />
        )}
        
        <StatusIndicator
          icon={<Zap className="w-3 h-3" />}
          label="Production Ready"
          className="bg-purple-100 text-purple-800"
        />
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  icon: React.ReactNode;
  label: string;
  className: string;
}

function StatusIndicator({ icon, label, className }: StatusIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${className}`}>
      {icon}
      {label}
    </div>
  );
}