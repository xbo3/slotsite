'use client';
import { useState, useEffect, useMemo } from 'react';
import Pagination from '@/components/ui/Pagination';
import { adminApi } from '@/lib/api';

// ===== Types =====
type TxType = 'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'BONUS' | 'COUPON';

interface MoneyRecord {
  id: number;
  username: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  created_at: string;
}

interface MoneyStats {
  total_deposit: number;
  total_withdraw: number;
  total_bet: number;
  total_win: number;
  net_profit: number;
}

// ===== Dummy Data =====
const DUMMY_RECORDS: MoneyRecord[] = [
  { id: 1, username: 'player1', type: 'DEPOSIT', amount: 500000, balance_before: 0, balance_after: 500000, reference: 'DEP-20260322-001', created_at: '2026-03-22T14:30:00' },
  { id: 2, username: 'player1', type: 'BET', amount: -10000, balance_before: 500000, balance_after: 490000, reference: 'ROUND-5678', created_at: '2026-03-22T14:35:00' },
  { id: 3, username: 'player1', type: 'WIN', amount: 25000, balance_before: 490000, balance_after: 515000, reference: 'ROUND-5678', created_at: '2026-03-22T14:35:05' },
  { id: 4, username: 'vip_kim', type: 'DEPOSIT', amount: 1000000, balance_before: 250000, balance_after: 1250000, reference: 'DEP-20260322-002', created_at: '2026-03-22T13:00:00' },
  { id: 5, username: 'vip_kim', type: 'BONUS', amount: 150000, balance_before: 1250000, balance_after: 1400000, reference: 'WELCOME2026', created_at: '2026-03-22T13:00:05' },
  { id: 6, username: 'lucky7', type: 'WIN', amount: 2500000, balance_before: 100000, balance_after: 2600000, reference: 'ROUND-9999', created_at: '2026-03-22T12:15:00' },
  { id: 7, username: 'lucky7', type: 'WITHDRAW', amount: -2000000, balance_before: 2600000, balance_after: 600000, reference: 'WD-20260322-001', created_at: '2026-03-22T12:30:00' },
  { id: 8, username: 'test7', type: 'DEPOSIT', amount: 100000, balance_before: 0, balance_after: 100000, reference: 'DEP-20260322-003', created_at: '2026-03-22T11:00:00' },
  { id: 9, username: 'test7', type: 'BET', amount: -5000, balance_before: 100000, balance_after: 95000, reference: 'ROUND-1111', created_at: '2026-03-22T11:05:00' },
  { id: 10, username: 'test7', type: 'BET', amount: -5000, balance_before: 95000, balance_after: 90000, reference: 'ROUND-1112', created_at: '2026-03-22T11:06:00' },
  { id: 11, username: 'test7', type: 'WIN', amount: 8000, balance_before: 90000, balance_after: 98000, reference: 'ROUND-1112', created_at: '2026-03-22T11:06:05' },
  { id: 12, username: 'newuser', type: 'COUPON', amount: 5000, balance_before: 0, balance_after: 5000, reference: 'FREESPIN50', created_at: '2026-03-22T10:30:00' },
  { id: 13, username: 'highroller', type: 'DEPOSIT', amount: 5000000, balance_before: 2000000, balance_after: 7000000, reference: 'DEP-20260321-010', created_at: '2026-03-21T20:00:00' },
  { id: 14, username: 'highroller', type: 'BET', amount: -500000, balance_before: 7000000, balance_after: 6500000, reference: 'ROUND-8888', created_at: '2026-03-21T20:30:00' },
  { id: 15, username: 'highroller', type: 'WIN', amount: 1200000, balance_before: 6500000, balance_after: 7700000, reference: 'ROUND-8888', created_at: '2026-03-21T20:30:05' },
];

const DUMMY_STATS: MoneyStats = {
  total_deposit: 6600000,
  total_withdraw: 2000000,
  total_bet: 520000,
  total_win: 3733000,
  net_profit: 6600000 - 2000000 - 3733000 + 520000,
};

const TYPE_OPTIONS: { value: TxType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'DEPOSIT', label: '입금' },
  { value: 'WITHDRAW', label: '출금' },
  { value: 'BET', label: '배팅' },
  { value: 'WIN', label: '당첨' },
  { value: 'BONUS', label: '보너스' },
  { value: 'COUPON', label: '쿠폰' },
];

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  DEPOSIT: { label: '입금', cls: 'bg-green-500/20 text-green-400' },
  WITHDRAW: { label: '출금', cls: 'bg-red-500/20 text-red-400' },
  BET: { label: '배팅', cls: 'bg-blue-500/20 text-blue-400' },
  WIN: { label: '당첨', cls: 'bg-yellow-500/20 text-yellow-400' },
  BONUS: { label: '보너스', cls: 'bg-purple-500/20 text-purple-400' },
  COUPON: { label: '쿠폰', cls: 'bg-pink-500/20 text-pink-400' },
};

const PER_PAGE = 20;

export default function AdminMoneyHistoryPage() {
  const [records, setRecords] = useState<MoneyRecord[]>(DUMMY_RECORDS);
  const [stats, setStats] = useState<MoneyStats>(DUMMY_STATS);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterType, setFilterType] = useState<TxType>('ALL');
  const [searchUser, setSearchUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch from API
  useEffect(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    if (filterType !== 'ALL') params.set('type', filterType);
    if (searchUser.trim()) params.set('username', searchUser.trim());
    params.set('page', String(currentPage));
    params.set('limit', String(PER_PAGE));

    const qs = params.toString();

    adminApi.getMoneyHistory(qs).then(res => {
      try {
        if (res.success && res.data) {
          if (Array.isArray(res.data.records)) setRecords(res.data.records);
          if (res.data.stats) setStats(res.data.stats);
        }
      } catch { /* keep dummy */ }
    }).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filter (for dummy data fallback)
  const filtered = useMemo(() => {
    let list = [...records];
    if (filterType !== 'ALL') list = list.filter(r => r.type === filterType);
    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      list = list.filter(r => r.username.toLowerCase().includes(q));
    }
    if (dateFrom) list = list.filter(r => r.created_at >= dateFrom);
    if (dateTo) list = list.filter(r => r.created_at.slice(0, 10) <= dateTo);
    return list;
  }, [records, filterType, searchUser, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [filterType, searchUser, dateFrom, dateTo]);

  // Computed stats from filtered
  const computedStats = useMemo(() => {
    const s = { total_deposit: 0, total_withdraw: 0, total_bet: 0, total_win: 0, net_profit: 0 };
    filtered.forEach(r => {
      if (r.type === 'DEPOSIT') s.total_deposit += r.amount;
      if (r.type === 'WITHDRAW') s.total_withdraw += Math.abs(r.amount);
      if (r.type === 'BET') s.total_bet += Math.abs(r.amount);
      if (r.type === 'WIN') s.total_win += r.amount;
    });
    s.net_profit = s.total_deposit - s.total_withdraw - s.total_win + s.total_bet;
    // If API returned stats, use those instead for the initial unfiltered view
    if (!dateFrom && !dateTo && filterType === 'ALL' && !searchUser.trim()) {
      return stats;
    }
    return s;
  }, [filtered, stats, dateFrom, dateTo, filterType, searchUser]);

  const fmtMoney = (n: number) => `${Number(n || 0).toLocaleString()}`;
  const fmtDateTime = (d: string) => d ? d.slice(0, 16).replace('T', ' ') : '-';

  const statCards = [
    { label: '총 입금', value: computedStats.total_deposit, color: '#4CAF50' },
    { label: '총 출금', value: computedStats.total_withdraw, color: '#E53935' },
    { label: '총 배팅', value: computedStats.total_bet, color: '#42A5F5' },
    { label: '총 당첨', value: computedStats.total_win, color: '#FFB300' },
    { label: '순이익', value: computedStats.net_profit, color: computedStats.net_profit >= 0 ? '#4CAF50' : '#E53935' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-medium text-white mb-6">머니 히스토리</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-1">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2.5 text-sm text-white rounded-lg focus:outline-none"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <span className="text-white/30 flex items-center text-sm">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2.5 text-sm text-white rounded-lg focus:outline-none"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as TxType)}
          className="px-4 py-2.5 text-sm text-white rounded-lg focus:outline-none"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="유저명 검색"
          value={searchUser}
          onChange={e => setSearchUser(e.target.value)}
          className="px-4 py-2.5 text-sm text-white rounded-lg focus:outline-none md:w-48"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>{card.label}</p>
            <p className="text-lg font-light mt-1" style={{ color: card.color }}>
              {fmtMoney(card.value)}<span className="text-xs ml-1" style={{ color: '#555' }}>원</span>
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-white/50 text-sm text-center py-8">로딩 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/50 text-sm text-center py-8">해당 기간에 내역이 없습니다</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">번호</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">유저명</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">타입</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">금액</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">이전잔액</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">이후잔액</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">참조</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">시간</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, idx) => {
                  const badge = TYPE_BADGE[r.type] || { label: r.type, cls: 'bg-white/10 text-white/60' };
                  return (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/40">{(currentPage - 1) * PER_PAGE + idx + 1}</td>
                      <td className="px-4 py-3 text-white">{r.username}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-light ${r.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {r.amount >= 0 ? '+' : ''}{fmtMoney(r.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-white/40">{fmtMoney(r.balance_before)}</td>
                      <td className="px-4 py-3 text-right text-white/60">{fmtMoney(r.balance_after)}</td>
                      <td className="px-4 py-3 text-white/40 text-xs font-mono">{r.reference || '-'}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{fmtDateTime(r.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-2">
            {paginated.map(r => {
              const badge = TYPE_BADGE[r.type] || { label: r.type, cls: 'bg-white/10 text-white/60' };
              return (
                <div key={r.id} className="p-3 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                      <span className="text-sm text-white">{r.username}</span>
                    </div>
                    <span className={`text-sm font-light ${r.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {r.amount >= 0 ? '+' : ''}{fmtMoney(r.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/30">
                    <span>{fmtMoney(r.balance_before)} &rarr; {fmtMoney(r.balance_after)}</span>
                    <span>{fmtDateTime(r.created_at)}</span>
                  </div>
                  {r.reference && (
                    <p className="text-[10px] text-white/20 mt-1 font-mono">{r.reference}</p>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
