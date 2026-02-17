export interface Wallet {
  id: string;
  currency: string;
  balanceCents: number;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  wallets?: Wallet[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  wallets: Wallet[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'conversion';
  senderWalletId?: string;
  receiverWalletId?: string;
  amountCents: number;
  currency: string;
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface AnalyticsData {
  month: string;
  amount: number;
}

export type TransactionType = 'all' | 'sent' | 'received' | 'deposit' | 'withdrawal' | 'conversion';

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
