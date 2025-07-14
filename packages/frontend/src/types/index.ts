/**
 * Frontend type definitions
 */

import { TAB_TYPES, TRANSACTION_STATUSES } from '@utils/constants';

export interface TransactionHistory {
  hash: string;
  to: string;
  value: string;
  status: typeof TRANSACTION_STATUSES[keyof typeof TRANSACTION_STATUSES];
  timestamp: number;
  gasUsed?: string;
  blockNumber?: number;
  gasPrice?: string;
  network: string;
}

export interface WalletState {
  wallet: any | null; // MinimalEVMWallet
  account: any | null; // WalletAccount
  isLoading: boolean;
  error: string;
  success: string;
}

export interface ValidationErrors {
  mnemonic?: string;
  address?: string;
  amount?: string;
  gasPrice?: string;
  gasLimit?: string;
  nonce?: string;
}

export interface TransactionForm {
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: string;
}

export type TabType = typeof TAB_TYPES[keyof typeof TAB_TYPES];

export interface WalletUIProps {
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}