import axios, { AxiosInstance, AxiosError } from 'axios';
import type { AuthResponse, RegisterResponse, Wallet, Transaction, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL + '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post<RegisterResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

export const walletApi = {
  listWallets: () =>
    api.get<Wallet[]>('/wallets/user'),

  getBalance: (walletId: string) =>
    api.get<Wallet>(`/wallets/${walletId}/balance`),
};

export const transactionApi = {
  deposit: (data: { walletId: string; amount: string; currency: string }) =>
    api.post<{ success: boolean; transactionId: string }>('/transactions/deposit', data),

  withdraw: (data: { walletId: string; amount: string; currency: string }) =>
    api.post<{ success: boolean; transactionId: string }>('/transactions/withdraw', data),

  transfer: (data: { senderWalletId: string; receiverEmail: string; amount: string; currency: string }) =>
    api.post<{ success: boolean; transactionId: string }>('/transactions/transfer', data),

  exchange: (data: { fromWalletId: string; toWalletId: string; amount: string; currency: string }) =>
    api.post<{ success: boolean; transactionId: string }>('/transactions/exchange', data),

  getHistory: (type?: string) => {
    const params = type ? { type } : {};
    return api.get<Transaction[]>('/transactions/history', { params });
  },
};

export default api;
