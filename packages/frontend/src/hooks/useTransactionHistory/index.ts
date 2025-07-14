import { useState, useCallback, useEffect } from 'react';
import { TransactionHistory } from '@types';
import { saveTransactionHistory, loadTransactionHistory, TRANSACTION_STATUSES } from '@utils';

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);

  // Load transaction history on mount
  useEffect(() => {
    const stored = loadTransactionHistory();
    setTransactions(stored);
  }, []);

  const addTransaction = useCallback((transaction: TransactionHistory) => {
    setTransactions(prev => {
      const updated = [transaction, ...prev];
      saveTransactionHistory(updated);
      return updated;
    });
  }, []);

  const updateTransactionStatus = useCallback((hash: string, status: TransactionHistory['status']) => {
    setTransactions(prev => {
      const updated = prev.map(tx => 
        tx.hash === hash ? { ...tx, status } : tx
      );
      saveTransactionHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setTransactions([]);
    saveTransactionHistory([]);
  }, []);

  const getTransactionByHash = useCallback((hash: string) => {
    return transactions.find(tx => tx.hash === hash);
  }, [transactions]);

  const getPendingTransactions = useCallback(() => {
    return transactions.filter(tx => tx.status === TRANSACTION_STATUSES.PENDING);
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    updateTransactionStatus,
    clearHistory,
    getTransactionByHash,
    getPendingTransactions
  };
};