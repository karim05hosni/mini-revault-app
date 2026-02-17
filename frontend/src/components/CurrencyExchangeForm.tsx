import React, { useState } from 'react';
import { transactionApi } from '../services/api';
import type { Wallet } from '../types';

interface CurrencyExchangeFormProps {
  wallets: Wallet[];
  onSuccess: () => void;
}

export const CurrencyExchangeForm: React.FC<CurrencyExchangeFormProps> = ({ wallets, onSuccess }) => {
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets.length > 1 ? wallets[1]?.id || '' : '');

  // Ensure fromWalletId and toWalletId are always different
  const handleFromWalletChange = (id: string) => {
    setFromWalletId(id);
    if (id === toWalletId) {
      // Pick the first wallet that is not the selected fromWalletId
      const other = wallets.find((w) => w.id !== id);
      setToWalletId(other ? other.id : '');
    }
  };

  const handleToWalletChange = (id: string) => {
    setToWalletId(id);
    if (id === fromWalletId) {
      // Pick the first wallet that is not the selected toWalletId
      const other = wallets.find((w) => w.id !== id);
      setFromWalletId(other ? other.id : '');
    }
  };
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fromWallet = wallets.find((w) => w.id === fromWalletId);
  const toWallet = wallets.find((w) => w.id === toWalletId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!fromWalletId || !toWalletId) {
        throw new Error('Both wallets must be selected');
      }
      if (fromWalletId === toWalletId) {
        throw new Error('Source and destination wallets must be different');
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      await transactionApi.exchange({
        fromWalletId,
        toWalletId,
        amount,
        currency: fromWallet?.currency || '',
      });
      setSuccess(`Successfully exchanged ${amount} ${fromWallet?.currency} to ${toWallet?.currency}`);
      setAmount('');
      onSuccess();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Exchange failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Currency Conversion</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">From Wallet</label>
          <select
            value={fromWalletId}
            onChange={(e) => handleFromWalletChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.currency} (Balance: {(wallet.balanceCents / 100).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">To Wallet</label>
          <select
            value={toWalletId}
            onChange={(e) => handleToWalletChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.currency} (Balance: {(wallet.balanceCents / 100).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            placeholder="0.00"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Convert Currency'}
        </button>
      </div>
    </form>
  );
};
