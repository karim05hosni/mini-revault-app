import React from 'react';
import type { Wallet } from '../types';

interface WalletCardProps {
  wallet: Wallet;
}

const formatBalance = (balanceCents: number): string => {
  const balance = balanceCents / 100;
  return balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getCurrencySymbol = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    default:
      return currency;
  }
};

export const WalletCard: React.FC<WalletCardProps> = ({ wallet }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-600 text-sm font-medium">{wallet.currency}</span>
        <span className="text-2xl text-slate-900">{getCurrencySymbol(wallet.currency)}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900">
        {getCurrencySymbol(wallet.currency)} {formatBalance(wallet.balanceCents)}
      </div>
      <p className="text-slate-500 text-xs mt-4">Available balance</p>
    </div>
  );
};
