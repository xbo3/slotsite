/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://slotsite-backend-production.up.railway.app/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    // 401 -> auto logout
    if (res.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return { success: false, error: 'Unauthorized' };
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path),
  post: <T = any>(path: string, body?: any) => apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(path: string, body?: any) => apiFetch<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  register: (data: { username: string; password: string; nickname: string; phone?: string }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// User
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put('/users/me/password', data),
  setSecurityPassword: (data: { password: string }) => api.put('/users/me/security-password', data),
  getTransactions: (params?: string) => api.get(`/users/me/transactions${params ? `?${params}` : ''}`),
  getBets: (params?: string) => api.get(`/users/me/bets${params ? `?${params}` : ''}`),
  getLoginHistory: () => api.get('/users/me/login-history'),
};

// Wallet
export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  requestDeposit: (data: any) => api.post('/deposit/request', data),
  getDepositHistory: () => api.get('/deposit/history'),
  getDepositStatus: (id: number) => api.get(`/deposit/status/${id}`),
  requestWithdraw: (data: any) => api.post('/withdraw/request', data),
  getWithdrawHistory: () => api.get('/withdraw/history'),
};

// Games
export const gameApi = {
  getGames: (params?: string) => api.get(`/games${params ? `?${params}` : ''}`),
  getGame: (id: string) => api.get(`/games/${id}`),
  getProviders: () => api.get('/games/providers'),
  getCategories: () => api.get('/games/categories'),
  launchGame: (id: string) => api.post(`/games/${id}/launch`),
};

// Coupons
export const couponApi = {
  apply: (code: string) => api.post('/coupons/apply', { code }),
  getMy: () => api.get('/coupons/my'),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: string) => api.get(`/admin/users${params ? `?${params}` : ''}`),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  getTransactions: (params?: string) => api.get(`/admin/transactions${params ? `?${params}` : ''}`),
  getGameLogs: (params?: string) => api.get(`/admin/game-logs${params ? `?${params}` : ''}`),
  // Coupons
  getCoupons: (params?: string) => api.get(`/coupons/admin/coupons${params ? `?${params}` : ''}`),
  createCoupon: (data: any) => api.post('/coupons/admin/coupons', data),
  bulkCreateCoupons: (data: any) => api.post('/coupons/admin/coupons/bulk', data),
  // Withdrawals
  getWithdrawals: (params?: string) => api.get(`/withdraw/admin/list${params ? `?${params}` : ''}`),
  approveWithdraw: (id: number) => api.put(`/withdraw/admin/${id}/approve`),
  rejectWithdraw: (id: number) => api.put(`/withdraw/admin/${id}/reject`),
  completeWithdraw: (id: number) => api.put(`/withdraw/admin/${id}/complete`),
  // Deposits
  getWallets: () => api.get('/deposit/admin/wallets'),
  bulkAddWallets: (data: any) => api.post('/deposit/admin/wallets/bulk-add', data),
  confirmDeposit: (data: any) => api.post('/deposit/admin/confirm', data),
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
  // Games admin
  getGameStats: () => api.get('/games/admin/games/stats'),
  addGame: (data: any) => api.post('/games/admin/games', data),
  bulkAddGames: (data: any) => api.post('/games/admin/games/bulk', data),
  updateGame: (id: number, data: any) => api.put(`/games/admin/games/${id}`, data),
  deleteGame: (id: number) => api.delete(`/games/admin/games/${id}`),
  // Logs
  getLogs: async (params?: { page?: number; action?: string; admin?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.action) query.set('action', params.action);
    if (params?.admin) query.set('admin', params.admin);
    const qs = query.toString();
    return api.get(`/admin/logs${qs ? `?${qs}` : ''}`);
  },
};

// Backward compatibility
export { getToken, removeToken };
export function setToken(token: string) { if (typeof window !== 'undefined') localStorage.setItem('token', token); }
