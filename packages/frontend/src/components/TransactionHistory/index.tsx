import { 
  History, AlertCircle, Copy, ExternalLink
} from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription } from '@components/UI';
import { NETWORKS } from 'minimal-evm-wallet-core';
import { formatAddress, formatDate, TRANSACTION_STATUSES } from '@utils';
import { TransactionHistory as TransactionHistoryType } from '@types';

interface TransactionHistoryProps {
  transactions: TransactionHistoryType[];
  selectedNetwork: string;
  onCopyToClipboard: (text: string, label?: string) => void;
}

export function TransactionHistory({
  transactions,
  selectedNetwork,
  onCopyToClipboard
}: TransactionHistoryProps) {
  const network = NETWORKS[selectedNetwork];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          View your recent transactions and their status
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {transactions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No transactions found. Send your first transaction to see it here.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <TransactionItem
                key={index}
                transaction={tx}
                network={NETWORKS[tx.network] || network}
                onCopyToClipboard={onCopyToClipboard}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TransactionItemProps {
  transaction: TransactionHistoryType;
  network: any; // NetworkConfig
  onCopyToClipboard: (text: string, label?: string) => void;
}

function TransactionItem({ transaction, network, onCopyToClipboard }: TransactionItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case TRANSACTION_STATUSES.CONFIRMED:
        return 'bg-green-500';
      case TRANSACTION_STATUSES.PENDING:
        return 'bg-yellow-500 animate-pulse';
      case TRANSACTION_STATUSES.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`} />
          <span className="font-medium capitalize">{transaction.status}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDate(transaction.timestamp)}
        </span>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>To:</span>
          <code className="text-xs">{formatAddress(transaction.to)}</code>
        </div>
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-medium">{transaction.value} {network.symbol}</span>
        </div>
        {transaction.gasPrice && (
          <div className="flex justify-between">
            <span>Gas Price:</span>
            <span>{transaction.gasPrice} Gwei</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Hash:</span>
          <code className="text-xs">{formatAddress(transaction.hash, 8)}</code>
        </div>
        {transaction.blockNumber && (
          <div className="flex justify-between">
            <span>Block:</span>
            <span>{transaction.blockNumber}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopyToClipboard(transaction.hash, 'Transaction hash')}
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy Hash
        </Button>
        <a
          href={`${network.explorer}/tx/${transaction.hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline">
            View Details
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </a>
      </div>
    </div>
  );
}