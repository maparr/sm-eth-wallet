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
  onGenerateWallet: (accountIndex: number) => Promise<void>;
  onImportWallet: (mnemonic: string, accountIndex: number) => Promise<void>;
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
  const [showAccountIndex, setShowAccountIndex] = useState(false);
  const [walletType, setWalletType] = useState<'test' | 'import' | null>(null);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [accountIndex, setAccountIndex] = useState<number>(0);

  const { account, isLoading } = walletState;

  const handleStartTestWallet = () => {
    setWalletType('test');
    setShowAccountIndex(true);
  };

  const handleStartImportWallet = () => {
    setWalletType('import');
    setShowAccountIndex(true);
  };

  const handleConfirmWallet = async () => {
    if (walletType === 'test') {
      await onGenerateWallet(accountIndex);
    } else if (walletType === 'import') {
      await onImportWallet(importMnemonic, accountIndex);
    }
    
    // Reset state
    setShowAccountIndex(false);
    setWalletType(null);
    setImportMnemonic('');
    setAccountIndex(0);
  };

  const handleCancel = () => {
    setShowAccountIndex(false);
    setWalletType(null);
    setImportMnemonic('');
    setAccountIndex(0);
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
            
            {/* Step 2: Account Index Selection */}
            {showAccountIndex && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Step 2: Choose Account Index
                    {walletType === 'test' && ' (Test Wallet)'}
                    {walletType === 'import' && ' (Import Wallet)'}
                  </h3>
                </div>
                
                {walletType === 'test' && (
                  <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      <strong>Test Mnemonic:</strong> test test test test test test test test test test test junk
                    </AlertDescription>
                  </Alert>
                )}
                
                {walletType === 'import' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recovery Phrase</label>
                    <textarea
                      className="w-full p-3 border rounded-md resize-none bg-background text-foreground"
                      rows={3}
                      placeholder="Enter your 12 or 24 word recovery phrase..."
                      value={importMnemonic}
                      onChange={(e) => setImportMnemonic(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Index</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    placeholder="Enter any account index number"
                    value={accountIndex}
                    min={0}
                    onChange={(e) => setAccountIndex(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter any number from 0 to millions/billions - different indices generate different wallet addresses
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleConfirmWallet} 
                    disabled={(walletType === 'import' && !importMnemonic.trim()) || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wallet className="h-4 w-4 mr-2" />}
                    Load Wallet
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
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
            {!showAccountIndex && (
              <>
                <Button 
                  onClick={handleStartTestWallet} 
                  className="w-full relative"
                  disabled={isLoading}
                  title="Load test wallet with predefined mnemonic"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Load Test Wallet
                  <Info className="h-3 w-3 ml-auto opacity-60" />
                </Button>
                <Button 
                  onClick={handleStartImportWallet} 
                  variant="secondary" 
                  className="w-full"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Wallet
                </Button>
              </>
            )}
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