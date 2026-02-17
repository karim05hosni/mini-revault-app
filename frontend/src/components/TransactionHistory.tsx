import React, { useState, useEffect } from 'react';
import { transactionApi } from '../services/api';
import type { Transaction, TransactionType } from '../types';

interface TransactionHistoryProps {
  refreshTrigger?: number;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAmount = (amountCents: number): string => {
  const amount = amountCents / 100;
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getTransactionIcon = (type: string): string => {
  switch (type) {
    case 'deposit':
      return '↓';
    case 'withdrawal':
      return '↑';
    case 'transfer':
      return '→';
    case 'conversion':
      return '⇄';
    default:
      return '•';
  }
};

const getTransactionColor = (type: string): string => {
  switch (type) {
    case 'deposit':
      return 'text-green-600 bg-green-50';
    case 'withdrawal':
      return 'text-red-600 bg-red-50';
    case 'transfer':
      return 'text-blue-600 bg-blue-50';
    case 'conversion':
      return 'text-slate-600 bg-slate-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ refreshTrigger }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<TransactionType>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await transactionApi.getHistory();
      setTransactions(response.data);
      filterTransactions(response.data, 'all');
    } catch (err: any) {
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const filterTransactions = (data: Transaction[], selectedFilter: TransactionType) => {
    if (selectedFilter === 'all') {
      setFilteredTransactions(data);
    } else {
      setFilteredTransactions(data.filter((t) => t.type === selectedFilter));
    }
  };

  const handleFilterChange = (newFilter: TransactionType) => {
    setFilter(newFilter);
    filterTransactions(transactions, newFilter);
  };

  const filterOptions: { value: TransactionType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'conversion', label: 'Conversions' },
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <p className="text-slate-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Transaction History</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === option.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No transactions found</p>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-slate-900 capitalize">{transaction.type}</p>
                  <p className="text-xs text-slate-500">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  {transaction.currency} {formatAmount(transaction.amountCents)}
                </p>
                <p className={`text-xs ${transaction.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.status === 'completed' ? 'Completed' : 'Failed'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
