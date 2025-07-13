import { 
  Settings, Shield, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Alert, AlertDescription } from '@/components/alert';
import { NETWORKS, type NetworkConfig } from '@minimal-wallet/core';

interface WalletSettingsProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

export function WalletSettings({
  selectedNetwork,
  onNetworkChange
}: WalletSettingsProps) {
  const network = NETWORKS[selectedNetwork];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Wallet Settings
        </CardTitle>
        <CardDescription>
          Advanced wallet configuration and security options
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Network Configuration */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Network Configuration</h3>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Current Network</label>
              <select
                className="w-full p-2 mt-1 border rounded-md bg-background"
                value={selectedNetwork}
                onChange={(e) => onNetworkChange(e.target.value)}
              >
                {Object.entries(NETWORKS).map(([key, net]) => (
                  <option key={key} value={key}>
                    {net.name} (Chain ID: {net.chainId})
                  </option>
                ))}
              </select>
            </div>
            
            <NetworkDetails network={network} />
          </div>
        </div>

        {/* Security Information */}
        <SecurityInfo />
      </CardContent>
    </Card>
  );
}

interface NetworkDetailsProps {
  network: NetworkConfig;
}

function NetworkDetails({ network }: NetworkDetailsProps) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <h4 className="font-medium mb-2">Network Details</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Name:</span>
          <span>{network.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Chain ID:</span>
          <span>{network.chainId}</span>
        </div>
        <div className="flex justify-between">
          <span>Symbol:</span>
          <span>{network.symbol}</span>
        </div>
        <div className="flex justify-between">
          <span>Decimals:</span>
          <span>{network.decimals}</span>
        </div>
        <div className="flex justify-between">
          <span>Explorer:</span>
          <a 
            href={network.explorer} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs"
          >
            {new URL(network.explorer).hostname}
          </a>
        </div>
      </div>
    </div>
  );
}

function SecurityInfo() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Security Information</h3>
      <div className="p-3 bg-muted rounded-lg">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>BIP44 HD wallet derivation enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>EIP-155 transaction signing active</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Private keys stored in memory only</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Minimal dependency footprint</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Cryptographic libraries audited</span>
          </div>
        </div>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          This wallet prioritizes security with minimal dependencies and proven cryptographic libraries.
          Always verify transactions before signing and keep your recovery phrase secure.
        </AlertDescription>
      </Alert>
    </div>
  );
}