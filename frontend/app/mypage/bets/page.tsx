'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import BottomSheet from '@/components/ui/BottomSheet';

type GameType = 'slot' | 'live_casino' | 'table';
type BetResult = 'win' | 'lose';

interface Bet {
  id: number;
  date: string;
  gameName: string;
  provider: string;
  gameType: GameType;
  betAmount: number;
  winAmount: number;
  result: BetResult;
  roundId?: string;
}

const DUMMY_BETS: Bet[] = [
  { id: 1, date: '2026-03-18 14:25', gameName: 'Gates of Olympus', provider: 'Pragmatic Play', gameType: 'slot', betAmount: 50, winAmount: 520, result: 'win', roundId: 'RND-0001' },
  { id: 2, date: '2026-03-18 14:10', gameName: 'Sweet Bonanza', provider: 'Pragmatic Play', gameType: 'slot', betAmount: 100, winAmount: 0, result: 'lose', roundId: 'RND-0002' },
  { id: 3, date: '2026-03-18 13:40', gameName: 'Crazy Time', provider: 'Evolution', gameType: 'live_casino', betAmount: 200, winAmount: 2800, result: 'win', roundId: 'RND-0003' },
  { id: 4, date: '2026-03-17 22:30', gameName: 'Fortune Tiger', provider: 'PG Soft', gameType: 'slot', betAmount: 30, winAmount: 0, result: 'lose', roundId: 'RND-0004' },
  { id: 5, date: '2026-03-17 21:15', gameName: 'Lightning Roulette', provider: 'Evolution', gameType: 'live_casino', betAmount: 150, winAmount: 450, result: 'win', roundId: 'RND-0005' },
  { id: 6, date: '2026-03-17 20:00', gameName: 'Book of Dead', provider: "Play'n GO", gameType: 'slot', betAmount: 80, winAmount: 1200, result: 'win', roundId: 'RND-0006' },
  { id: 7, date: '2026-03-16 18:30', gameName: 'Mega Moolah', provider: 'Microgaming', gameType: 'slot', betAmount: 25, winAmount: 0, result: 'lose', roundId: 'RND-0007' },
  { id: 8, date: '2026-03-16 16:45', gameName: 'Starburst', provider: 'NetEnt', gameType: 'slot', betAmount: 40, winAmount: 85, result: 'win', roundId: 'RND-0008' },
  { id: 9, date: '2026-03-15 23:10', gameName: 'Dead or Alive 2', provider: 'NetEnt', gameType: 'slot', betAmount: 20, winAmount: 3500, result: 'win', roundId: 'RND-0009' },
  { id: 10, date: '2026-03-15 20:50', gameName: 'Monopoly Live', provider: 'Evolution', gameType: 'live_casino', betAmount: 300, winAmount: 0, result: 'lose', roundId: 'RND-0010' },
  { id: 11, date: '2026-03-14 14:30', gameName: 'Sugar Rush', provider: 'Pragmatic Play', gameType: 'slot', betAmount: 60, winAmount: 180, result: 'win', roundId: 'RND-0011' },
  { id: 12, date: '2026-03-14 10:00', gameName: 'Blackjack VIP', provider: 'Evolution', gameType: 'table', betAmount: 500, winAmount: 1000, result: 'win', roundId: 'RND-0012' },
];

type FilterGameType = 'all' | GameType;
type FilterResult = 'all' | BetResult;
type FilterPeriod = 'today' | '7d' | '30d' | 'custom';

const GAME_TYPE_TABS: { value: FilterGameType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'slot', label: '슬롯' },
  { value: 'live_casino', label: '라이브카지노' },
  { value: 'table', label: '테이블게임' },
];

const PERIOD_OPTIONS: { value: FilterPeriod; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: 'custom', label: '직접입력' },
];

// Arrow icon for bet -> win display
function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted mx-1 flex-shrink-0">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function BetsPage() {
  const [filterGameType, setFilterGameType] = useState<FilterGameType>('all');
  const [filterResult, setFilterResult] = useState<FilterResult>('all');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const perPage = 10;

  // Pull-to-refresh
  const touchStartY = useRef(0);
  const pullDistance = useRef(0);
  const [pullIndicator, setPullIndicator] = useState(0);

  const handlePullStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
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
    let list = [...DUMMY_BETS];
    if (filterGameType !== 'all') list = list.filter(b => b.gameType === filterGameType);
    if (filterResult !== 'all') list = list.filter(b => b.result === filterResult);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGameType, filterResult]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Stats
  const totalBetCount = DUMMY_BETS.length;
  const totalBetAmount = DUMMY_BETS.reduce((s, b) => s + b.betAmount, 0);
  const totalWinAmount = DUMMY_BETS.reduce((s, b) => s + b.winAmount, 0);
  const netProfit = totalWinAmount - totalBetAmount;

  // Check if big win (10x+)
  const isBigWin = (bet: Bet) => bet.result === 'win' && bet.winAmount >= bet.betAmount * 10;

  return (
    <div
      className="space-y-6 animate-fade-in"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">총 베팅횟수</p>
          <p className="text-lg md:text-xl font-bold text-white">{totalBetCount}<span className="text-xs text-text-muted ml-1">회</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">총 베팅금액</p>
          <p className="text-lg md:text-xl font-bold text-white">{totalBetAmount.toLocaleString()} <span className="text-xs text-text-muted">USDT</span></p>
        </div>
        <div className="bg-dark-card rounded-xl border border-white/5 p-4">
          <p className="text-xs text-text-muted mb-1">총 당첨금액</p>
          <p className="text-lg md:text-xl font-bold text-accent">{totalWinAmount.toLocaleString()} <span className="text-xs text-text-muted">USDT</span></p>
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
          {GAME_TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterGameType(tab.value); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all touch-feedback ${
                filterGameType === tab.value
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
          <select
            value={filterResult}
            onChange={e => { setFilterResult(e.target.value as FilterResult); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-full text-sm bg-dark-input text-text-secondary border-0 focus:outline-none"
          >
            <option value="all">전체결과</option>
            <option value="win">승리</option>
            <option value="lose">패배</option>
          </select>
        </div>
      </div>

      {/* === Desktop Filters === */}
      <div className="hidden md:block bg-dark-card rounded-xl border border-white/5 p-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {GAME_TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterGameType(tab.value); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterGameType === tab.value
                  ? 'bg-accent text-dark-bg'
                  : 'bg-dark-bg text-text-secondary hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

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
            value={filterResult}
            onChange={e => { setFilterResult(e.target.value as FilterResult); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-dark-bg border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-accent/50 ml-auto"
          >
            <option value="all">전체 결과</option>
            <option value="win">승리</option>
            <option value="lose">패배</option>
          </select>
        </div>
      </div>

      {/* Bets List */}
      {paginated.length === 0 ? (
        <EmptyState
          icon="🎲"
          title="아직 플레이한 게임이 없습니다"
          description="게임 로비에서 게임을 선택해보세요"
          actionLabel="게임 둘러보기"
          actionHref="/lobby"
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-dark-card rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">날짜</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">게임명</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">프로바이더</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">베팅액</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">당첨액</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">수익</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase">결과</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(bet => {
                  const profit = bet.winAmount - bet.betAmount;
                  const bigWin = isBigWin(bet);
                  return (
                    <tr
                      key={bet.id}
                      className={`border-b border-white/5 last:border-b-0 transition-colors ${
                        bigWin
                          ? 'bg-accent-gold/5 hover:bg-accent-gold/10'
                          : bet.result === 'win'
                          ? 'hover:bg-success/[0.03]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-text-secondary">{bet.date}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white font-medium">
                          {bigWin && <span className="mr-1">🔥</span>}
                          {bet.gameName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{bet.provider}</td>
                      <td className="px-4 py-3 text-sm text-white text-right">{bet.betAmount.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-sm font-medium text-right ${bigWin ? 'text-accent-gold' : bet.winAmount > 0 ? 'text-success' : 'text-text-muted'}`}>
                        {bet.winAmount.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold text-right ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {bigWin ? (
                          <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-accent-gold/20 text-accent-gold">
                            BIG WIN
                          </span>
                        ) : bet.result === 'win' ? (
                          <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-success/20 text-success">
                            승리
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-danger/20 text-danger">
                            패배
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* === Mobile Card View (Enhanced) === */}
          <div className="md:hidden space-y-2">
            {paginated.map(bet => {
              const profit = bet.winAmount - bet.betAmount;
              const bigWin = isBigWin(bet);
              return (
                <div
                  key={bet.id}
                  onClick={() => setSelectedBet(bet)}
                  className={`bg-dark-card rounded-xl p-4 touch-feedback cursor-pointer ${
                    bigWin
                      ? 'border border-yellow-500/50 bg-gradient-to-r from-yellow-500/5 to-transparent'
                      : 'border border-white/5'
                  }`}
                >
                  {/* Top: Game name + provider pill */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white truncate flex-1 mr-2">
                      {bigWin && <span className="mr-1">🔥</span>}
                      {bet.gameName}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-input text-text-muted whitespace-nowrap flex-shrink-0">
                      {bet.provider}
                    </span>
                  </div>

                  {/* Mid: Bet -> Win */}
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-text-secondary">
                      ₮ {bet.betAmount.toLocaleString()}
                    </span>
                    <ArrowRightIcon />
                    <span className={`text-sm ${bet.winAmount > 0 ? 'text-accent' : 'text-text-muted'}`}>
                      ₮ {bet.winAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Bottom: Profit + Time */}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}{profit.toLocaleString()} USDT
                    </span>
                    <span className="text-[11px] text-text-muted">{bet.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      {/* === BottomSheet: Bet Detail === */}
      <BottomSheet
        isOpen={!!selectedBet}
        onClose={() => setSelectedBet(null)}
        title="베팅 상세"
      >
        {selectedBet && (() => {
          const profit = selectedBet.winAmount - selectedBet.betAmount;
          const bigWin = isBigWin(selectedBet);
          return (
            <div className="space-y-4">
              <div className="text-center mb-4">
                {bigWin && <p className="text-3xl mb-1">🔥</p>}
                <p className="text-lg font-bold text-white">{selectedBet.gameName}</p>
                <p className="text-sm text-text-muted">{selectedBet.provider}</p>
                {bigWin && (
                  <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-bold bg-accent-gold/20 text-accent-gold">
                    BIG WIN x{Math.floor(selectedBet.winAmount / selectedBet.betAmount)}
                  </span>
                )}
              </div>

              <div className="bg-dark-bg rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">베팅액</span>
                  <span className="text-sm text-white font-semibold">₮ {selectedBet.betAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">당첨액</span>
                  <span className={`text-sm font-semibold ${selectedBet.winAmount > 0 ? 'text-accent' : 'text-text-muted'}`}>
                    ₮ {selectedBet.winAmount.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-sm text-text-muted">수익</span>
                  <span className={`text-base font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toLocaleString()} USDT
                  </span>
                </div>
              </div>

              <div className="bg-dark-bg rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">날짜</span>
                  <span className="text-sm text-white">{selectedBet.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">결과</span>
                  {bigWin ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-accent-gold/20 text-accent-gold">BIG WIN</span>
                  ) : selectedBet.result === 'win' ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-success/20 text-success">승리</span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-danger/20 text-danger">패배</span>
                  )}
                </div>
                {selectedBet.roundId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">라운드 ID</span>
                    <span className="text-sm text-accent-blue font-mono">{selectedBet.roundId}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
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
