import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { transactionApi } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AnalyticsProps {
  refreshTrigger?: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ refreshTrigger }) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await transactionApi.getHistory();
        const transactions = response.data;

        const monthlySpending: { [key: string]: number } = {};

        transactions.forEach((transaction) => {
          if (transaction.type === 'withdrawal' || transaction.type === 'transfer') {
            const date = new Date(transaction.createdAt);
            const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

            if (!monthlySpending[monthKey]) {
              monthlySpending[monthKey] = 0;
            }
            monthlySpending[monthKey] += transaction.amountCents / 100;
          }
        });

        const sortedData = Object.entries(monthlySpending)
          .sort((a, b) => {
            const dateA = new Date(a[0]);
            const dateB = new Date(b[0]);
            return dateA.getTime() - dateB.getTime();
          })
          .map(([month, amount]) => ({ month, amount }))
          .slice(-6);

        setMonthlyData(sortedData);
      } catch (err: any) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading && monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-5">Monthly Spending</h3>
        <p className="text-slate-500 text-center py-8">No spending data available</p>
      </div>
    );
  }

  const chartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Spending',
        data: monthlyData.map((d) => d.amount),
        backgroundColor: '#1e293b',
        borderRadius: 6,
        hoverBackgroundColor: '#0f172a',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => `${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}`,
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Monthly Spending</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
