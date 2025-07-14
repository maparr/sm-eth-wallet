import React from 'react';
import { Shield, Wallet } from 'lucide-react';
import { NETWORKS } from 'minimal-evm-wallet-core';

interface WelcomeHeaderProps {
  selectedNetwork: string;
  isWalletConnected: boolean;
  onNetworkChange: (network: string) => void;
}

export function WelcomeHeader({ selectedNetwork, isWalletConnected, onNetworkChange }: WelcomeHeaderProps) {

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
      
      {/* Network Selection */}
      <div className="flex justify-center items-center gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Network:</label>
          <select
            className="px-3 py-1 border rounded-md bg-background text-sm"
            value={selectedNetwork}
            onChange={(e) => onNetworkChange(e.target.value)}
          >
            {Object.entries(NETWORKS).map(([key, net]) => (
              <option key={key} value={key}>
                {net.name}
              </option>
            ))}
          </select>
        </div>
        
        {isWalletConnected && (
          <StatusIndicator
            icon={<Wallet className="w-3 h-3" />}
            label="Wallet Connected"
            className="bg-blue-100 text-blue-800"
          />
        )}
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