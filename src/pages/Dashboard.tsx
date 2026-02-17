import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { walletApi } from '../services/api';
import { WalletCard } from '../components/WalletCard';
import { DepositForm } from '../components/DepositForm';
import { WithdrawForm } from '../components/WithdrawForm';
import { TransferForm } from '../components/TransferForm';
import { TransactionHistory } from '../components/TransactionHistory';
import { Analytics } from '../components/Analytics';
import type { Wallet } from '../types';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchWallets = async () => {
    try {
      const response = await walletApi.listWallets();
      setWallets(response.data);
    } catch (err: any) {
      setError('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTransactionSuccess = () => {
    fetchWallets();
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Revolut</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-sm">{user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Wallets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <DepositForm wallets={wallets} onSuccess={handleTransactionSuccess} />
          <WithdrawForm wallets={wallets} onSuccess={handleTransactionSuccess} />
          <TransferForm wallets={wallets} onSuccess={handleTransactionSuccess} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <Analytics refreshTrigger={refreshTrigger} />
          </div>
          <div className="lg:col-span-2">
            <TransactionHistory refreshTrigger={refreshTrigger} />
          </div>
        </section>
      </main>
    </div>
  );
};
