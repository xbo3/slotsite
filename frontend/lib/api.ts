const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: {
    username: string;
    password: string;
    nickname: string;
    phone?: string;
  }) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => fetchAPI('/auth/me'),

  // Wallet
  getBalance: () => fetchAPI('/wallet/balance'),

  getHistory: (page = 1, limit = 20) =>
    fetchAPI(`/wallet/history?page=${page}&limit=${limit}`),

  deposit: (amount: number, method: string) =>
    fetchAPI('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    }),

  withdraw: (amount: number, method: string, address: string) =>
    fetchAPI('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, address }),
    }),

  // Games
  getGames: (category?: string) =>
    fetchAPI(`/games${category ? `?category=${category}` : ''}`),

  launchGame: (gameId: string) =>
    fetchAPI('/game/launch', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId }),
    }),

  // User / MyPage
  getProfile: () => fetchAPI('/users/me'),

  updateProfile: (data: { nickname?: string }) =>
    fetchAPI('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    fetchAPI('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  setSecurityPassword: (data: { security_password: string }) =>
    fetchAPI('/users/me/security-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getLoginHistory: () => fetchAPI('/users/me/login-history'),

  getTransactions: (params?: Record<string, string>) =>
    fetchAPI(`/users/me/transactions${params ? '?' + new URLSearchParams(params).toString() : ''}`),

  getBets: (params?: Record<string, string>) =>
    fetchAPI(`/users/me/bets${params ? '?' + new URLSearchParams(params).toString() : ''}`),

  // Fingerprint (관리자)
  getFingerprints: (params?: Record<string, string>) =>
    fetchAPI(`/fingerprint/admin/list${params ? '?' + new URLSearchParams(params).toString() : ''}`),

  getFingerprintDuplicates: () =>
    fetchAPI('/fingerprint/admin/duplicates'),

  getUserFingerprints: (userId: number) =>
    fetchAPI(`/fingerprint/admin/users/${userId}`),
};

export default api;
