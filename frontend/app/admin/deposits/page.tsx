'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

type DepositStatus = 'all' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
type DepositMethod = 'all' | 'bipays' | 'manual';

interface DepositItem {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  method: string;
  status: string;
  tx_hash?: string;
  created_at: string;
}

interface DepositStats {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  todayAmount: number;
}

const DUMMY_DEPOSITS: DepositItem[] = [
  { id: 101, user_id: 3, username: 'test7', amount: 100000, method: 'bipays', status: 'COMPLETED', tx_hash: 'tx_abc123', created_at: '2026-03-22T10:30:00Z' },
  { id: 102, user_id: 5, username: 'vip_kim', amount: 500000, method: 'bipays', status: 'PENDING', created_at: '2026-03-22T11:15:00Z' },
  { id: 103, user_id: 8, username: 'player1', amount: 50000, method: 'manual', status: 'COMPLETED', created_at: '2026-03-22T09:00:00Z' },
  { id: 104, user_id: 12, username: 'lucky7', amount: 200000, method: 'bipays', status: 'FAILED', created_at: '2026-03-21T22:30:00Z' },
  { id: 105, user_id: 15, username: 'newuser', amount: 30000, method: 'bipays', status: 'EXPIRED', created_at: '2026-03-21T18:00:00Z' },
  { id: 106, user_id: 2, username: 'admin_test', amount: 1000000, method: 'manual', status: 'COMPLETED', created_at: '2026-03-21T14:00:00Z' },
  { id: 107, user_id: 20, username: 'whale99', amount: 3000000, method: 'bipays', status: 'PENDING', created_at: '2026-03-22T12:00:00Z' },
];

const DUMMY_STATS: DepositStats = {
  totalCount: 1847,
  totalAmount: 72500000,
  pendingCount: 2,
  todayAmount: 3650000,
};

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: '대기중', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  COMPLETED: { label: '완료', bg: 'bg-green-500/20', text: 'text-green-400' },
  EXPIRED: { label: '만료', bg: 'bg-white/10', text: 'text-white/50' },
  FAILED: { label: '실패', bg: 'bg-red-500/20', text: 'text-red-400' },
};

const STATUS_TABS: { key: DepositStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'PENDING', label: '대기중' },
  { key: 'COMPLETED', label: '완료' },
  { key: 'EXPIRED', label: '만료' },
  { key: 'FAILED', label: '실패' },
];

export default function AdminDepositsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wallets, setWallets] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>(DUMMY_DEPOSITS);
  const [depositStats, setDepositStats] = useState<DepositStats>(DUMMY_STATS);
  const [loading, setLoading] = useState(true);
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [confirmData, setConfirmData] = useState({ user_id: '', amount: '', tx_hash: '' });
  const [tab, setTab] = useState<'deposits' | 'wallets' | 'confirm'>('deposits');
  const [statusFilter, setStatusFilter] = useState<DepositStatus>('all');
  const [methodFilter, setMethodFilter] = useState<DepositMethod>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchWallets = () => {
    setLoading(true);
    adminApi.getWallets().then(res => {
      if (res.success && res.data) {
        setWallets(Array.isArray(res.data) ? res.data : res.data.wallets || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    // 입금 내역은 API에서 가져오기 시도, 실패하면 DUMMY 유지
    adminApi.getTransactions('type=DEPOSIT').then(res => {
      if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setDeposits(res.data);
        // 실제 통계도 업데이트
        const today = new Date().toISOString().slice(0, 10);
        const todayItems = res.data.filter((d: DepositItem) => d.created_at?.startsWith(today));
        setDepositStats({
          totalCount: res.data.length,
          totalAmount: res.data.reduce((s: number, d: DepositItem) => s + Number(d.amount), 0),
          pendingCount: res.data.filter((d: DepositItem) => d.status === 'PENDING').length,
          todayAmount: todayItems.reduce((s: number, d: DepositItem) => s + Number(d.amount), 0),
        });
      }
    }).catch(() => {});
    fetchWallets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBulkAdd = async () => {
    if (!bulkAddresses.trim()) return;
    const addresses = bulkAddresses.split('\n').filter((a: string) => a.trim());
    const res = await adminApi.bulkAddWallets({ addresses });
    if (res.success) {
      alert(`${addresses.length}\uAC1C \uC8FC\uC18C \uCD94\uAC00 \uC644\uB8CC`);
      setBulkAddresses('');
      fetchWallets();
    } else {
      alert(res.error || '\uCD94\uAC00 \uC2E4\uD328');
    }
  };

  const handleConfirm = async () => {
    if (!confirmData.user_id || !confirmData.amount) { alert('\uC720\uC800ID\uC640 \uAE08\uC561\uC744 \uC785\uB825\uD558\uC138\uC694'); return; }
    const res = await adminApi.confirmDeposit({
      user_id: Number(confirmData.user_id),
      amount: Number(confirmData.amount),
      tx_hash: confirmData.tx_hash,
    });
    if (res.success) {
      alert('\uC785\uAE08 \uD655\uC778 \uC644\uB8CC');
      setConfirmData({ user_id: '', amount: '', tx_hash: '' });
    } else {
      alert(res.error || '\uD655\uC778 \uC2E4\uD328');
    }
  };

  const handleUserClick = (userId: number, username: string) => {
    alert(`\uC720\uC800 \uC0C1\uC138: ID=${userId}, username=${username}`);
  };

  // 필터 적용
  const filteredDeposits = deposits.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (methodFilter !== 'all' && d.method !== methodFilter) return false;
    if (dateFrom) {
      const dDate = d.created_at.slice(0, 10);
      if (dDate < dateFrom) return false;
    }
    if (dateTo) {
      const dDate = d.created_at.slice(0, 10);
      if (dDate > dateTo) return false;
    }
    return true;
  });

  const statCards = [
    { label: '\uCD1D \uC785\uAE08\uAC74\uC218', value: depositStats.totalCount.toLocaleString(), suffix: '\uAC74', color: '#42A5F5' },
    { label: '\uCD1D \uC785\uAE08\uC561', value: `${(depositStats.totalAmount / 10000).toLocaleString()}`, suffix: '\uB9CC\uC6D0', color: '#4CAF50' },
    { label: '\uB300\uAE30\uC911', value: depositStats.pendingCount.toLocaleString(), suffix: '\uAC74', color: '#FFB300' },
    { label: '\uC624\uB298 \uC785\uAE08\uC561', value: `${(depositStats.todayAmount / 10000).toLocaleString()}`, suffix: '\uB9CC\uC6D0', color: '#26A69A' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-medium text-white mb-6">\uC785\uAE08 \uAD00\uB9AC</h1>

      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((c, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>{c.label}</p>
            <p className="text-xl font-light mt-1.5" style={{ color: c.color }}>
              {c.value}<span className="text-xs font-light ml-1" style={{ color: '#555' }}>{c.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'deposits' as const, label: '\uC785\uAE08 \uB0B4\uC5ED' },
          { key: 'wallets' as const, label: '\uC9C0\uAC11 \uAD00\uB9AC' },
          { key: 'confirm' as const, label: '\uC218\uB3D9 \uC785\uAE08 \uD655\uC778' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === t.key ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'deposits' && (
        <>
          {/* 상태별 필터 탭 */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {STATUS_TABS.map(st => {
              const count = st.key === 'all' ? deposits.length : deposits.filter(d => d.status === st.key).length;
              return (
                <button
                  key={st.key}
                  onClick={() => setStatusFilter(st.key)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    statusFilter === st.key
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {st.label} <span style={{ color: '#555' }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* 입금 방식 필터 + 기간 필터 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value as DepositMethod)}
              className="px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="all">\uC804\uCCB4 \uBC29\uC2DD</option>
              <option value="bipays">BiPays</option>
              <option value="manual">\uC218\uB3D9</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
              />
              <span className="text-xs" style={{ color: '#555' }}>~</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-[10px] px-2 py-1 rounded text-white/40 hover:text-white/70"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                초기화
              </button>
            )}
          </div>

          {/* 입금 테이블 */}
          <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs text-white/50">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">\uC720\uC800</th>
                  <th className="text-right px-4 py-3 text-xs text-white/50">\uAE08\uC561</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">\uBC29\uC2DD</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">\uC0C1\uD0DC</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">TX Hash</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">\uC77C\uC2DC</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30 text-sm">\uD574\uB2F9\uD558\uB294 \uC785\uAE08 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</td></tr>
                ) : filteredDeposits.map(d => {
                  const st = STATUS_LABELS[d.status] || { label: d.status, bg: 'bg-white/10', text: 'text-white/60' };
                  return (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/60">{d.id}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUserClick(d.user_id, d.username)}
                          className="text-white hover:text-blue-400 transition-colors underline decoration-white/20 hover:decoration-blue-400"
                        >
                          {d.username}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-white text-right">{'\u20A9'}{Number(d.amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${d.method === 'bipays' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/60'}`}>
                          {d.method === 'bipays' ? 'BiPays' : '\uC218\uB3D9'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 font-mono text-xs">{d.tx_hash ? `${d.tx_hash.slice(0, 10)}...` : '-'}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{new Date(d.created_at).toLocaleString('ko-KR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'wallets' && (
        <>
          {/* Bulk Add */}
          <div className="rounded-xl p-5 mb-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-medium text-white mb-3">\uC9C0\uAC11 \uC8FC\uC18C \uC77C\uAD04 \uCD94\uAC00</h2>
            <textarea
              value={bulkAddresses}
              onChange={e => setBulkAddresses(e.target.value)}
              placeholder={'\uC8FC\uC18C\uB97C \uD55C \uC904\uC5D0 \uD558\uB098\uC529 \uC785\uB825\uD558\uC138\uC694\nTRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nTRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              rows={5}
              className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/40">
                {bulkAddresses.split('\n').filter((a: string) => a.trim()).length}\uAC1C \uC8FC\uC18C
              </span>
              <button
                onClick={handleBulkAdd}
                className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors"
              >
                \uC77C\uAD04 \uCD94\uAC00
              </button>
            </div>
          </div>

          {/* Wallet Table */}
          {loading ? (
            <p className="text-white/50">\uB85C\uB529 \uC911...</p>
          ) : wallets.length === 0 ? (
            <p className="text-white/50">\uB4F1\uB85D\uB41C \uC9C0\uAC11 \uC5C6\uC74C</p>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs text-white/50">ID</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">\uC8FC\uC18C</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">\uC0C1\uD0DC</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">\uD560\uB2F9 \uC720\uC800</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">\uC0DD\uC131\uC77C</th>
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {wallets.map((w: any) => (
                    <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/60">{w.id}</td>
                      <td className="px-4 py-3 text-white font-mono text-xs">{w.address}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {w.status === 'available' ? '\uC0AC\uC6A9\uAC00\uB2A5' : '\uC0AC\uC6A9\uC911'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60">{w.user_id || '-'}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{w.created_at ? new Date(w.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'confirm' && (
        <div className="rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-medium text-white mb-4">\uC218\uB3D9 \uC785\uAE08 \uD655\uC778</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs text-white/50 mb-1">\uC720\uC800 ID</label>
              <input
                type="number"
                value={confirmData.user_id}
                onChange={e => setConfirmData(d => ({ ...d, user_id: e.target.value }))}
                placeholder="\uC720\uC800 ID \uC785\uB825"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">\uC785\uAE08 \uAE08\uC561</label>
              <input
                type="number"
                value={confirmData.amount}
                onChange={e => setConfirmData(d => ({ ...d, amount: e.target.value }))}
                placeholder="\uAE08\uC561 \uC785\uB825"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">TX Hash (\uC120\uD0DD)</label>
              <input
                type="text"
                value={confirmData.tx_hash}
                onChange={e => setConfirmData(d => ({ ...d, tx_hash: e.target.value }))}
                placeholder="\uD2B8\uB79C\uC7AD\uC158 \uD574\uC2DC"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors"
            >
              \uC785\uAE08 \uD655\uC778 \uCC98\uB9AC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
