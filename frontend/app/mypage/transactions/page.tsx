'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import BottomSheet from '@/components/ui/BottomSheet';

type TxType = 'deposit' | 'withdraw' | 'bonus' | 'coupon';
type TxStatus = 'completed' | 'pending' | 'cancelled';

interface Transaction {
  id: number;
  date: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  memo: string;
  tx_hash?: string;
}

const TYPE_LABELS: Record<TxType, string> = {
  deposit: '입금',
  withdraw: '출금',
  bonus: '보너스',
  coupon: '쿠폰',
};

const TYPE_COLORS: Record<TxType, string> = {
  deposit: 'text-success',
  withdraw: 'text-danger',
  bonus: 'text-accent-gold',
  coupon: 'text-accent-purple',
};

const TYPE_BG: Record<TxType, string> = {
  deposit: 'bg-success/10',
  withdraw: 'bg-danger/10',
  bonus: 'bg-accent-gold/10',
  coupon: 'bg-accent-purple/10',
};

const TYPE_ICON_BG: Record<TxType, string> = {
  deposit: 'bg-green-500/20',
  withdraw: 'bg-red-500/20',
  bonus: 'bg-purple-500/20',
  coupon: 'bg-blue-500/20',
};

const TYPE_ICON_TEXT: Record<TxType, string> = {
  deposit: 'text-green-400',
  withdraw: 'text-red-400',
  bonus: 'text-purple-400',
  coupon: 'text-blue-400',
};

const STATUS_LABELS: Record<TxStatus, string> = {
  completed: '완료',
  pending: '대기',
  cancelled: '취소',
};

const STATUS_COLORS: Record<TxStatus, string> = {
  completed: 'bg-success/20 text-success',
  pending: 'bg-warning/20 text-warning',
  cancelled: 'bg-danger/20 text-danger',
};

const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: 1, date: '2026-03-18 14:30', type: 'deposit', amount: 5000, status: 'completed', memo: 'USDT TRC20 입금', tx_hash: 'TxH4sh...abc123' },
  { id: 2, date: '2026-03-18 10:15', type: 'withdraw', amount: 2000, status: 'completed', memo: 'USDT 출금', tx_hash: 'TxH4sh...def456' },
  { id: 3, date: '2026-03-17 22:40', type: 'bonus', amount: 500, status: 'completed', memo: '일일 보너스' },
  { id: 4, date: '2026-03-17 18:00', type: 'deposit', amount: 10000, status: 'completed', memo: '은행 입금' },
  { id: 5, date: '2026-03-16 14:20', type: 'coupon', amount: 1000, status: 'completed', memo: 'WELCOME2026 쿠폰' },
  { id: 6, date: '2026-03-16 09:10', type: 'withdraw', amount: 3000, status: 'pending', memo: 'USDT 출금 처리중', tx_hash: 'TxH4sh...ghi789' },
  { id: 7, date: '2026-03-15 20:30', type: 'deposit', amount: 8000, status: 'completed', memo: 'USDT TRC20 입금', tx_hash: 'TxH4sh...jkl012' },
  { id: 8, date: '2026-03-15 16:45', type: 'bonus', amount: 250, status: 'completed', memo: '주간 캐시백' },
  { id: 9, date: '2026-03-14 12:00', type: 'withdraw', amount: 1500, status: 'cancelled', memo: '출금 취소됨' },
  { id: 10, date: '2026-03-14 08:30', type: 'coupon', amount: 2000, status: 'completed', memo: 'VIP10K 쿠폰' },
  { id: 11, date: '2026-03-13 19:20', type: 'deposit', amount: 3000, status: 'completed', memo: 'USDT TRC20 입금', tx_hash: 'TxH4sh...mno345' },
  { id: 12, date: '2026-03-12 15:40', type: 'bonus', amount: 300, status: 'completed', memo: '첫 충전 보너스' },
  { id: 13, date: '2026-03-11 10:05', type: 'withdraw', amount: 5000, status: 'completed', memo: 'USDT 출금', tx_hash: 'TxH4sh...pqr678' },
  { id: 14, date: '2026-03-10 22:15', type: 'deposit', amount: 6000, status: 'completed', memo: '은행 입금' },
  { id: 15, date: '2026-03-09 14:50', type: 'coupon', amount: 500, status: 'completed', memo: 'FREESPIN50 쿠폰' },
];

type FilterType = 'all' | TxType;
type FilterStatus = 'all' | TxStatus;
type FilterPeriod = 'today' | '7d' | '30d' | 'custom';

const TYPE_TABS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'deposit', label: '입금' },
  { value: 'withdraw', label: '출금' },
  { value: 'bonus', label: '보너스' },
  { value: 'coupon', label: '쿠폰' },
];

const PERIOD_OPTIONS: { value: FilterPeriod; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: 'custom', label: '직접입력' },
];

// Deposit icon SVG
function DepositIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

// Withdraw icon SVG
function WithdrawIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const perPage = 10;

  // Pull-to-refresh
  const pullRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const pullDistance = useRef(0);
  const [pullIndicator, setPullIndicator] = useState(0);

  const handlePullStart = useCallback((e: React.TouchEvent) => {
    if (pullRef.current && pullRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handlePullMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === 0) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      pullDistance.current = Math.min(diff, 120);
      setPullIndicator(pullDistance.current);
    }
  }, []);

  const handlePullEnd = useCallback(() => {
    if (pullDistance.current >= 60) {
      setIsRefreshing(true);
      setPullIndicator(40);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullIndicator(0);
        pullDistance.current = 0;
        touchStartY.current = 0;
      }, 800);
    } else {
      setPullIndicator(0);
      pullDistance.current = 0;
      touchStartY.current = 0;
    }
  }, []);

  const filtered = useMemo(() => {
    let list = [...DUMMY_TRANSACTIONS];
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Summary calculations
  const totalDeposit = DUMMY_TRANSACTIONS.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalWithdraw = DUMMY_TRANSACTIONS.filter(t => t.type === 'withdraw' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalDeposit - totalWithdraw;

  const renderMobileIcon = (type: TxType) => {
    if (type === 'deposit') return <DepositIcon />;
    if (type === 'withdraw') return <WithdrawIcon />;
    if (type === 'bonus') return <span className="text-lg">🎁</span>;
    return <span className="text-lg">🎫</span>;
  };

  return (
    <div
      className="space-y-6 animate-fade-in"
      ref={pullRef}
      onTouchStart={handlePullStart}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      {/* Pull-to-refresh indicator (mobile only) */}
      {pullIndicator > 0 && (
        <div
          className="md:hidden flex justify-center items-center transition-all"
          style={{ height: pullIndicator }}
        >
          <div className={`w-6 h-6 border-2 border-accent border-t-transparent rounded-full ${isRefreshing ? 'animate-spin-smooth' : ''}`} />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">총 입금</p>
          <p className="text-lg md:text-xl font-bold text-success">{totalDeposit.toLocaleString()} <span className="text-xs text-text-muted">USDT</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">총 출금</p>
          <p className="text-lg md:text-xl font-bold text-danger">{totalWithdraw.toLocaleString()} <span className="text-xs text-text-muted">USDT</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">순수익</p>
          <p className={`text-lg md:text-xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} <span className="text-xs text-text-muted">USDT</span>
          </p>
        </div>
      </div>

      {/* === Mobile Filter Chips === */}
      <div className="md:hidden space-y-3">
        <div className="overflow-x-auto scrollbar-hide flex gap-2">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterType(tab.value); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all touch-feedback ${
                filterType === tab.value
                  ? 'bg-accent text-dark-bg font-semibold'
                  : 'bg-dark-input text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => setShowDateSheet(true)}
            className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap bg-dark-input text-text-secondary transition-all touch-feedback"
          >
            📅 기간
          </button>
        </div>
      </div>

      {/* === Desktop Filters === */}
      <div className="hidden md:block bg-dark-card rounded-xl border border-white/5 p-4 space-y-3">
        {/* Type Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterType(tab.value); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterType === tab.value
                  ? 'bg-accent text-dark-bg'
                  : 'bg-dark-bg text-text-secondary hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period + Status */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterPeriod === opt.value
                    ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                    : 'bg-dark-bg text-text-muted hover:text-white border border-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {filterPeriod === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-2 py-1.5 bg-dark-input border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-accent/50"
              />
              <span className="text-text-muted text-xs">~</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-2 py-1.5 bg-dark-input border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-accent/50"
              />
            </div>
          )}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value as FilterStatus); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-dark-bg border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-accent/50 ml-auto"
          >
            <option value="all">전체 상태</option>
            <option value="completed">완료</option>
            <option value="pending">대기</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {paginated.length === 0 ? (
        <EmptyState
          icon="💳"
          title="아직 거래내역이 없습니다"
          description="입금하여 게임을 시작해보세요"
          actionLabel="지금 충전하기"
          actionHref="/wallet"
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-dark-card rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">날짜</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">유형</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">금액</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">메모</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(tx => (
                  <tr key={tx.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm text-text-secondary">{tx.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_BG[tx.type]} ${TYPE_COLORS[tx.type]}`}>
                        {TYPE_LABELS[tx.type]}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${tx.type === 'withdraw' ? 'text-danger' : 'text-success'}`}>
                      {tx.type === 'withdraw' ? '-' : '+'}{tx.amount.toLocaleString()} USDT
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[tx.status]}`}>
                        {STATUS_LABELS[tx.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{tx.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* === Mobile Card View (Enhanced) === */}
          <div className="md:hidden space-y-2">
            {paginated.map(tx => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-dark-card rounded-xl border border-white/5 p-4 touch-feedback cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Left icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_ICON_BG[tx.type]} ${TYPE_ICON_TEXT[tx.type]}`}>
                    {renderMobileIcon(tx.type)}
                  </div>

                  {/* Center */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{TYPE_LABELS[tx.type]}</span>
                      <span className={`text-sm font-bold ${tx.type === 'withdraw' ? 'text-red-400' : 'text-green-400'}`}>
                        {tx.type === 'withdraw' ? '-' : '+'}{tx.amount.toLocaleString()} USDT
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-text-muted">{tx.date}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[tx.status]}`}>
                        {STATUS_LABELS[tx.status]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      {/* === BottomSheet: Transaction Detail === */}
      <BottomSheet
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="거래 상세"
      >
        {selectedTx && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${TYPE_ICON_BG[selectedTx.type]} ${TYPE_ICON_TEXT[selectedTx.type]}`}>
                {renderMobileIcon(selectedTx.type)}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{TYPE_LABELS[selectedTx.type]}</p>
                <p className={`text-xl font-black ${selectedTx.type === 'withdraw' ? 'text-red-400' : 'text-green-400'}`}>
                  {selectedTx.type === 'withdraw' ? '-' : '+'}{selectedTx.amount.toLocaleString()} USDT
                </p>
              </div>
            </div>

            <div className="bg-dark-bg rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">상태</span>
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[selectedTx.status]}`}>
                  {STATUS_LABELS[selectedTx.status]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">날짜</span>
                <span className="text-sm text-white">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">메모</span>
                <span className="text-sm text-white">{selectedTx.memo}</span>
              </div>
              {selectedTx.tx_hash && (
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">TX Hash</span>
                  <span className="text-sm text-accent-blue font-mono">{selectedTx.tx_hash}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* === BottomSheet: Date Period Picker === */}
      <BottomSheet
        isOpen={showDateSheet}
        onClose={() => setShowDateSheet(false)}
        title="기간 선택"
      >
        <div className="space-y-3">
          {PERIOD_OPTIONS.filter(o => o.value !== 'custom').map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                setFilterPeriod(opt.value);
                setShowDateSheet(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all touch-feedback ${
                filterPeriod === opt.value
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'bg-dark-bg text-text-secondary hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="border-t border-white/5 pt-3">
            <p className="text-xs text-text-muted mb-2">직접 입력</p>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
              <span className="text-text-muted text-sm">~</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            <button
              onClick={() => { setFilterPeriod('custom'); setShowDateSheet(false); }}
              className="w-full mt-3 py-3 btn-cta text-sm rounded-xl"
            >
              적용
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
