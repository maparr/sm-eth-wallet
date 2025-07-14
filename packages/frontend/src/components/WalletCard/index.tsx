import { useState } from 'react';
import { 
  Copy, AlertCircle, Loader2, Wallet, Download, Upload, 
  Trash2, Info
} from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Alert, AlertDescription } from '@components/UI';
import { NETWORKS } from 'minimal-evm-wallet-core';
import { formatAddress } from '@utils';
import { WalletState } from '@types';

interface WalletCardProps {
  walletState: WalletState;
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
  onGenerateWallet: () => Promise<void>;
  onImportWallet: (mnemonic: string) => Promise<void>;
  onClearWallet: () => void;
  onExportWallet: () => void;
  onCopyToClipboard: (text: string, label?: string) => void;
}

export function WalletCard({
  walletState,
  selectedNetwork,
  onNetworkChange,
  onGenerateWallet,
  onImportWallet,
  onClearWallet,
  onExportWallet,
  onCopyToClipboard
}: WalletCardProps) {
  const [showImportMnemonic, setShowImportMnemonic] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');

  const { account, isLoading } = walletState;

  const handleImport = async () => {
    await onImportWallet(importMnemonic);
    setImportMnemonic('');
    setShowImportMnemonic(false);
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </div>
        </CardTitle>
        <CardDescription>
          Manage your wallet and view account details
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!account ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No wallet loaded. Load test wallet or import a wallet to continue.
              </AlertDescription>
            </Alert>
            
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Test Mode:</strong> Load test wallet uses default mnemonic: 
                <code className="block text-xs mt-1 p-1 bg-background border rounded font-mono">
                  test test test test test test test test test test test junk
                </code>
              </AlertDescription>
            </Alert>
            
            {/* Import Wallet Section */}
            {showImportMnemonic && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <label className="text-sm font-medium">Recovery Phrase</label>
                <textarea
                  className="w-full p-3 border rounded-md resize-none"
                  rows={3}
                  placeholder="Enter your 12 or 24 word recovery phrase..."
                  value={importMnemonic}
                  onChange={(e) => setImportMnemonic(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleImport} 
                    disabled={!importMnemonic.trim() || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Import
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowImportMnemonic(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Account Info */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {formatAddress(account.address)}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onCopyToClipboard(account.address, 'Address')}
                    title="Copy full address"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Network</label>
                <select
                  className="w-full p-2 mt-1 border rounded-md bg-background"
                  value={selectedNetwork}
                  onChange={(e) => onNetworkChange(e.target.value)}
                >
                  {Object.entries(NETWORKS).map(([key, net]) => (
                    <option key={key} value={key}>
                      {net.name} (ID: {net.chainId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        {!account ? (
          <>
            <Button 
              onClick={onGenerateWallet} 
              className="w-full relative"
              disabled={isLoading}
              title="Loads test wallet with predefined mnemonic for development"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wallet className="h-4 w-4 mr-2" />}
              Load Test Wallet
              <Info className="h-3 w-3 ml-auto opacity-60" />
            </Button>
            <Button 
              onClick={() => setShowImportMnemonic(true)} 
              variant="secondary" 
              className="w-full"
              disabled={showImportMnemonic}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Wallet
            </Button>
          </>
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={onExportWallet}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClearWallet}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}