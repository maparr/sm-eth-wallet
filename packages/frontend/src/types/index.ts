/**
 * Frontend type definitions
 */

export interface TransactionHistory {
  hash: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  gasUsed?: string;
  blockNumber?: number;
  gasPrice?: string;
  network: string;
}

export interface WalletState {
  wallet: any | null; // MinimalEVMWallet
  account: any | null; // WalletAccount
  balance: string;
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
  broadcast?: boolean;
}

export type TabType = 'send' | 'history' | 'settings';

export interface WalletUIProps {
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}