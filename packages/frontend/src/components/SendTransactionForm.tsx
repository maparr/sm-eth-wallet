import React from 'react';
import { 
  Send, Key, Loader2, CheckCircle2, AlertCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { NETWORKS, type SignedTransaction } from 'minimal-evm-wallet-core';
import { TransactionForm, ValidationErrors, WalletState } from '@/types';

interface SendTransactionFormProps {
  walletState: WalletState;
  selectedNetwork: string;
  txForm: TransactionForm;
  validationErrors: ValidationErrors;
  signedTx: SignedTransaction | null;
  broadcastResult: string;
  isValid: boolean;
  onFormChange: (form: TransactionForm) => void;
  onSignTransaction: (e: React.FormEvent) => Promise<void>;
  onBroadcast: () => Promise<void>;
}

export function SendTransactionForm({
  walletState,
  selectedNetwork,
  txForm,
  validationErrors,
  signedTx,
  broadcastResult,
  onFormChange,
  onSignTransaction,
  onBroadcast
}: SendTransactionFormProps) {
  const { account, isLoading } = walletState;
  const network = NETWORKS[selectedNetwork];

  const updateForm = (field: keyof TransactionForm, value: string) => {
    onFormChange({ ...txForm, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Transaction
        </CardTitle>
        <CardDescription>
          Create, sign, and broadcast Ethereum transactions securely
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={onSignTransaction} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recipient Address *</label>
            <Input
              placeholder="0x..."
              value={txForm.to}
              onChange={(e) => updateForm('to', e.target.value)}
              className={validationErrors.address ? 'border-red-500' : ''}
              required
            />
            {validationErrors.address && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.address}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Amount ({network.symbol}) *</label>
            <Input
              placeholder="0.001"
              value={txForm.value}
              onChange={(e) => updateForm('value', e.target.value)}
              className={validationErrors.amount ? 'border-red-500' : ''}
              required
            />
            {validationErrors.amount && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.amount}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Gas Price (Gwei) *</label>
              <Input
                value={txForm.gasPrice}
                onChange={(e) => updateForm('gasPrice', e.target.value)}
                className={validationErrors.gasPrice ? 'border-red-500' : ''}
                required
              />
              {validationErrors.gasPrice && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.gasPrice}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Gas Limit *</label>
              <Input
                value={txForm.gasLimit}
                onChange={(e) => updateForm('gasLimit', e.target.value)}
                className={validationErrors.gasLimit ? 'border-red-500' : ''}
                required
              />
              {validationErrors.gasLimit && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.gasLimit}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nonce *</label>
            <Input
              value={txForm.nonce}
              onChange={(e) => updateForm('nonce', e.target.value)}
              className={validationErrors.nonce ? 'border-red-500' : ''}
              required
            />
            {validationErrors.nonce && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.nonce}</p>
            )}
          </div>

          {/* Transaction Preview */}
          {txForm.to && txForm.value && txForm.gasPrice && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">Transaction Preview</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300 space-y-1">
                <div>Send {txForm.value} {network.symbol} to {txForm.to.slice(0, 6)}...{txForm.to.slice(-4)}</div>
                <div>Max fee: {(parseFloat(txForm.gasPrice) * parseInt(txForm.gasLimit) / 1e9).toFixed(6)} {network.symbol}</div>
                <div>Network: {network.name}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Broadcast Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="broadcast"
              checked={txForm.broadcast || false}
              onChange={(e) => updateForm('broadcast', e.target.checked as any)}
              className="rounded border-gray-300"
            />
            <label htmlFor="broadcast" className="text-sm font-medium">
              Automatically broadcast transaction after signing
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!account || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing Transaction...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Sign Transaction
              </>
            )}
          </Button>
        </form>

        {/* Signed Transaction Display */}
        {signedTx && (
          <Alert className="mt-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-700 dark:from-green-950 dark:to-emerald-950">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200 text-lg font-semibold">
              🎉 Transaction Signed Successfully!
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-sm">Transaction Hash</span>
                </div>
                <code className="block text-xs break-all p-3 bg-gray-50 dark:bg-gray-900 rounded border font-mono text-green-600 dark:text-green-400">
                  {signedTx.hash}
                </code>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Ready for broadcast</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={onBroadcast}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Broadcasting to Network...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Broadcast to Network
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Broadcast Result */}
        {broadcastResult && (
          <Alert className="mt-4 border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">Transaction Broadcast Successfully!</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Transaction Hash:</span>
                  <code className="block text-xs break-all mt-1 p-2 bg-muted rounded font-mono">
                    {broadcastResult}
                  </code>
                </div>
                <a
                  href={`${network.explorer}/tx/${broadcastResult}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View on {network.name} Explorer
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}