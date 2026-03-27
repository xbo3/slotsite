'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/hooks/useLang';
import { safeApi, walletApi } from '@/lib/api';

interface SafeHistory {
  id: number;
  type: 'deposit' | 'withdraw';
  amount: number;
  balance_after: number;
  created_at: string;
}

export default function SafePage() {
  const router = useRouter();
  useLang();
  const [isAuth, setIsAuth] = useState(false);
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [safeBalance, setSafeBalance] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [history, setHistory] = useState<SafeHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [serviceReady, setServiceReady] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  // Fetch balances
  useEffect(() => {
    if (!isAuth) return;

    safeApi.getBalance().then(res => {
      if (res.success && res.data !== undefined) {
        setSafeBalance(Number(res.data.balance ?? res.data ?? 0));
      }
    }).catch(() => setServiceReady(false));

    walletApi.getBalance().then(res => {
      if (res.success && res.data !== undefined) {
        setWalletBalance(Number(res.data.balance ?? res.data ?? 0));
      }
    }).catch(() => {});

    safeApi.getHistory().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setHistory(res.data);
      }
    }).catch(() => {});
  }, [isAuth]);

  const quickAmounts = [10000, 50000, 100000, 500000, 1000000];

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setMsg({ type: 'error', text: 'Please enter a valid amount.' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = tab === 'deposit'
        ? await safeApi.deposit(num)
        : await safeApi.withdraw(num);

      if (res.success) {
        setMsg({ type: 'success', text: tab === 'deposit' ? 'Deposited to safe.' : 'Withdrawn from safe.' });
        setAmount('');
        // Refresh balances
        safeApi.getBalance().then(r => {
          if (r.success && r.data !== undefined) setSafeBalance(Number(r.data.balance ?? r.data ?? 0));
        });
        walletApi.getBalance().then(r => {
          if (r.success && r.data !== undefined) setWalletBalance(Number(r.data.balance ?? r.data ?? 0));
        });
        safeApi.getHistory().then(r => {
          if (r.success && Array.isArray(r.data)) setHistory(r.data);
        });
      } else {
        setMsg({ type: 'error', text: res.error || 'Operation failed.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Service is currently unavailable.' });
      setServiceReady(false);
    }
    setLoading(false);
    setTimeout(() => setMsg(null), 3000);
  };

  if (!isAuth) {
    return <div className="flex items-center justify-center min-h-[50vh]"><span className="text-white/50 font-light">Loading...</span></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Safe Balance */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-base font-semibold text-white">Safe</h2>
        </div>

        {!serviceReady ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">Service is being prepared.</p>
          </div>
        ) : (
          <>
            {/* Balance Display */}
            <div className="bg-dark-bg rounded-lg p-4 mb-4 text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Safe Balance</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                {safeBalance.toLocaleString()}
                <span className="text-sm font-light text-text-muted ml-1.5">KRW</span>
              </p>
            </div>

            {/* Wallet Balance (small) */}
            <div className="flex items-center justify-between bg-dark-bg/50 rounded-lg px-4 py-2.5 mb-5">
              <span className="text-xs text-text-muted">Wallet Balance</span>
              <span className="text-sm font-medium text-white">{walletBalance.toLocaleString()} KRW</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(['deposit', 'withdraw'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setAmount(''); setMsg(null); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    tab === t
                      ? 'bg-white text-dark-bg'
                      : 'bg-dark-bg text-text-muted hover:bg-white/5'
                  }`}
                >
                  {t === 'deposit' ? 'Deposit to Safe' : 'Withdraw from Safe'}
                </button>
              ))}
            </div>

            {/* Direction hint */}
            <div className="flex items-center justify-center gap-2 mb-3 text-xs text-text-muted">
              <span className="px-2 py-1 bg-dark-bg rounded">{tab === 'deposit' ? 'Wallet' : 'Safe'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="px-2 py-1 bg-dark-bg rounded">{tab === 'deposit' ? 'Safe' : 'Wallet'}</span>
            </div>

            {/* Amount Input */}
            <div className="mb-3">
              <label className="block text-sm text-text-secondary mb-1.5">Amount</label>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter amount"
                className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {quickAmounts.map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className="px-3 py-1.5 text-xs bg-dark-bg border border-white/5 rounded-lg text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                >
                  {q >= 10000 ? `${(q / 10000).toLocaleString()}M` : q.toLocaleString()}
                </button>
              ))}
              <button
                onClick={() => {
                  const max = tab === 'deposit' ? walletBalance : safeBalance;
                  setAmount(String(max));
                }}
                className="px-3 py-1.5 text-xs bg-dark-bg border border-white/5 rounded-lg text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
              >
                MAX
              </button>
            </div>

            {/* Message */}
            {msg && (
              <p className={`text-xs mb-3 ${msg.type === 'success' ? 'text-success' : 'text-danger'}`}>
                {msg.text}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !amount}
              className="w-full py-3 btn-cta text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : tab === 'deposit' ? 'Deposit to Safe' : 'Withdraw from Safe'}
            </button>
          </>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-4">Transaction History</h2>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">No transactions yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-white/5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-dark-bg/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Type</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">Amount</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(h.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          h.type === 'deposit'
                            ? 'bg-info/20 text-info'
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {h.type === 'deposit' ? 'IN' : 'OUT'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${h.type === 'deposit' ? 'text-info' : 'text-warning'}`}>
                        {h.type === 'deposit' ? '+' : '-'}{Number(h.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-text-secondary">
                        {Number(h.balance_after).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
              {history.map(h => (
                <div key={h.id} className="bg-dark-bg rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      h.type === 'deposit'
                        ? 'bg-info/20 text-info'
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {h.type === 'deposit' ? 'IN' : 'OUT'}
                    </span>
                    <span className="text-xs text-text-muted">
                      {new Date(h.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${h.type === 'deposit' ? 'text-info' : 'text-warning'}`}>
                      {h.type === 'deposit' ? '+' : '-'}{Number(h.amount).toLocaleString()}
                    </span>
                    <span className="text-xs text-text-muted">Bal: {Number(h.balance_after).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
