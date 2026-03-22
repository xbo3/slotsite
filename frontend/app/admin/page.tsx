'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

interface DashboardStats {
  userCount: number;
  todayDeposit: number;
  todayWithdraw: number;
  totalDeposit: number;
  totalWithdraw: number;
  activeSessions: number;
  todayNewUsers: number;
  pendingWithdrawals: number;
}

interface PeriodStats extends DashboardStats {
  prevUserCount: number;
  prevTodayDeposit: number;
  prevTodayWithdraw: number;
  prevTodayNewUsers: number;
  prevActiveSessions: number;
  prevPendingWithdrawals: number;
  prevTotalDeposit: number;
  prevTotalWithdraw: number;
}

interface DailyDataItem {
  day: string;
  deposit: number;
  withdraw: number;
}

interface RecentActivityItem {
  type: string;
  user: string;
  amount?: number;
  game?: string;
  time: string;
}

interface GameRevenueItem {
  rank: number;
  name: string;
  provider: string;
  revenue: number;
  plays: number;
}

type PeriodTab = 'today' | 'yesterday' | 'week' | 'month';

const DUMMY_STATS: Record<PeriodTab, PeriodStats> = {
  today: {
    userCount: 1247, todayDeposit: 3500000, todayWithdraw: 2100000,
    totalDeposit: 35000000, totalWithdraw: 28000000, activeSessions: 84,
    todayNewUsers: 12, pendingWithdrawals: 5,
    prevUserCount: 1235, prevTodayDeposit: 2800000, prevTodayWithdraw: 1900000,
    prevTodayNewUsers: 9, prevActiveSessions: 72, prevPendingWithdrawals: 3,
    prevTotalDeposit: 31500000, prevTotalWithdraw: 25900000,
  },
  yesterday: {
    userCount: 1235, todayDeposit: 2800000, todayWithdraw: 1900000,
    totalDeposit: 31500000, totalWithdraw: 25900000, activeSessions: 72,
    todayNewUsers: 9, pendingWithdrawals: 3,
    prevUserCount: 1220, prevTodayDeposit: 3100000, prevTodayWithdraw: 2200000,
    prevTodayNewUsers: 14, prevActiveSessions: 65, prevPendingWithdrawals: 7,
    prevTotalDeposit: 28700000, prevTotalWithdraw: 23700000,
  },
  week: {
    userCount: 1247, todayDeposit: 18500000, todayWithdraw: 12300000,
    totalDeposit: 35000000, totalWithdraw: 28000000, activeSessions: 84,
    todayNewUsers: 67, pendingWithdrawals: 5,
    prevUserCount: 1180, prevTodayDeposit: 15200000, prevTodayWithdraw: 10800000,
    prevTodayNewUsers: 52, prevActiveSessions: 68, prevPendingWithdrawals: 8,
    prevTotalDeposit: 16500000, prevTotalWithdraw: 15700000,
  },
  month: {
    userCount: 1247, todayDeposit: 72000000, todayWithdraw: 48000000,
    totalDeposit: 35000000, totalWithdraw: 28000000, activeSessions: 84,
    todayNewUsers: 247, pendingWithdrawals: 5,
    prevUserCount: 1000, prevTodayDeposit: 58000000, prevTodayWithdraw: 42000000,
    prevTodayNewUsers: 198, prevActiveSessions: 55, prevPendingWithdrawals: 12,
    prevTotalDeposit: 35000000, prevTotalWithdraw: 28000000,
  },
};

const DUMMY_DAILY_DATA: DailyDataItem[] = [
  { day: '03/13', deposit: 850000, withdraw: 620000 },
  { day: '03/14', deposit: 1200000, withdraw: 900000 },
  { day: '03/15', deposit: 780000, withdraw: 450000 },
  { day: '03/16', deposit: 1500000, withdraw: 1100000 },
  { day: '03/17', deposit: 920000, withdraw: 680000 },
  { day: '03/18', deposit: 1800000, withdraw: 1300000 },
  { day: '03/19', deposit: 650000, withdraw: 400000 },
];

const DUMMY_RECENT_ACTIVITY: RecentActivityItem[] = [
  { type: 'deposit', user: 'test7', amount: 100000, time: '2분 전' },
  { type: 'withdraw', user: 'player1', amount: 50000, time: '15분 전' },
  { type: 'signup', user: 'newuser', time: '30분 전' },
  { type: 'deposit', user: 'vip_kim', amount: 500000, time: '1시간 전' },
  { type: 'bigwin', user: 'lucky7', amount: 2500000, game: 'Fire In The Hole 3', time: '2시간 전' },
];

const DUMMY_GAME_REVENUE: GameRevenueItem[] = [
  { rank: 1, name: 'Gates of Olympus', provider: 'Pragmatic Play', revenue: 8500000, plays: 12450 },
  { rank: 2, name: 'Sweet Bonanza', provider: 'Pragmatic Play', revenue: 6200000, plays: 9870 },
  { rank: 3, name: 'Fire In The Hole 3', provider: 'Nolimit City', revenue: 4800000, plays: 7230 },
  { rank: 4, name: 'Starlight Princess', provider: 'Pragmatic Play', revenue: 3900000, plays: 6540 },
  { rank: 5, name: 'Mental', provider: 'Nolimit City', revenue: 3100000, plays: 5120 },
];

const PERIOD_LABELS: Record<PeriodTab, string> = {
  today: '오늘',
  yesterday: '어제',
  week: '이번 주',
  month: '이번 달',
};

function getActivityIcon(type: string) {
  switch (type) {
    case 'deposit': return { label: '입금', color: '#4CAF50', icon: '\u2193' };
    case 'withdraw': return { label: '출금', color: '#E53935', icon: '\u2191' };
    case 'signup': return { label: '가입', color: '#42A5F5', icon: '+' };
    case 'bigwin': return { label: 'BIG WIN', color: '#FFB300', icon: '\u2605' };
    default: return { label: type, color: '#888', icon: '\u00B7' };
  }
}

function calcChange(current: number, prev: number): { pct: string; up: boolean; zero: boolean } {
  if (prev === 0) return { pct: '0', up: true, zero: true };
  const diff = ((current - prev) / prev) * 100;
  return { pct: Math.abs(diff).toFixed(1), up: diff >= 0, zero: diff === 0 };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p: { dataKey: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 12 }}>
          {p.dataKey === 'deposit' ? '입금' : '출금'}: \u20A9{p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-5 rounded-xl animate-pulse" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-3 w-16 rounded bg-white/5 mb-3" />
      <div className="h-7 w-24 rounded bg-white/5" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="mt-6 p-5 rounded-xl animate-pulse" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-3 w-32 rounded bg-white/5 mb-4" />
      <div className="h-[260px] rounded bg-white/[0.03]" />
    </div>
  );
}

function SkeletonActivity() {
  return (
    <div className="mt-6 rounded-xl overflow-hidden animate-pulse" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-3 w-16 rounded bg-white/5" />
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-40 rounded bg-white/5" />
          </div>
          <div className="h-3 w-12 rounded bg-white/5 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [periodTab, setPeriodTab] = useState<PeriodTab>('today');
  const [stats, setStats] = useState<PeriodStats>(DUMMY_STATS.today);
  const [dailyData, setDailyData] = useState<DailyDataItem[]>(DUMMY_DAILY_DATA);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(DUMMY_RECENT_ACTIVITY);
  const [gameRevenue] = useState<GameRevenueItem[]>(DUMMY_GAME_REVENUE);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(() => {
    adminApi.getDashboard().then(res => {
      try {
        if (res.success && res.data) {
          if (res.data.stats) setStats(prev => ({ ...prev, ...res.data.stats }));
          else setStats(prev => ({ ...prev, ...res.data }));
          if (res.data.dailyData && Array.isArray(res.data.dailyData) && res.data.dailyData.length > 0) {
            setDailyData(res.data.dailyData);
          }
          if (res.data.recentActivity && Array.isArray(res.data.recentActivity) && res.data.recentActivity.length > 0) {
            setRecentActivity(res.data.recentActivity);
          }
        }
      } catch (err) {
        console.error('Dashboard API parse error:', err);
      }
    }).catch(err => {
      console.error('Dashboard API error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchDashboard();
    // 실시간 활동 피드 자동 갱신 (30초)
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // 기간 탭 변경 시 DUMMY fallback
  useEffect(() => {
    setStats(DUMMY_STATS[periodTab]);
  }, [periodTab]);

  const cards = [
    { label: '총 회원수', value: stats.userCount.toLocaleString(), suffix: '명', color: '#42A5F5', prev: stats.prevUserCount },
    { label: periodTab === 'today' || periodTab === 'yesterday' ? '신규 가입' : '기간 가입', value: stats.todayNewUsers.toLocaleString(), suffix: '명', color: '#AB47BC', prev: stats.prevTodayNewUsers },
    { label: '접속 중', value: stats.activeSessions.toLocaleString(), suffix: '명', color: '#66BB6A', prev: stats.prevActiveSessions },
    { label: '출금 대기', value: stats.pendingWithdrawals.toLocaleString(), suffix: '건', color: '#FFA726', prev: stats.prevPendingWithdrawals },
    { label: periodTab === 'today' || periodTab === 'yesterday' ? '당일 입금' : '기간 입금', value: `${(stats.todayDeposit / 10000).toLocaleString()}`, suffix: '만원', color: '#4CAF50', prev: stats.prevTodayDeposit },
    { label: periodTab === 'today' || periodTab === 'yesterday' ? '당일 출금' : '기간 출금', value: `${(stats.todayWithdraw / 10000).toLocaleString()}`, suffix: '만원', color: '#E53935', prev: stats.prevTodayWithdraw },
    { label: '총 입금', value: `${(stats.totalDeposit / 10000).toLocaleString()}`, suffix: '만원', color: '#26A69A', prev: stats.prevTotalDeposit },
    { label: '총 출금', value: `${(stats.totalWithdraw / 10000).toLocaleString()}`, suffix: '만원', color: '#EF5350', prev: stats.prevTotalWithdraw },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-white">관리자 대시보드</h1>
        {/* 기간 전환 탭 */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(Object.keys(PERIOD_LABELS) as PeriodTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setPeriodTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                periodTab === tab
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {PERIOD_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* 대기출금 알림 배너 */}
      {stats.pendingWithdrawals > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl"
          style={{ background: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.25)' }}
        >
          <span className="text-lg">&#9888;</span>
          <span className="text-sm font-light text-white">
            대기 출금 <span style={{ color: '#FFA726', fontWeight: 500 }}>{stats.pendingWithdrawals}건</span>이 처리를 기다리고 있습니다
          </span>
          <a href="/admin/finance" className="ml-auto text-xs font-light px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,152,0,0.2)', color: '#FFA726' }}>
            확인하기
          </a>
        </div>
      )}

      {/* 통계 카드 8개 — 2x4 그리드 + 전일 대비 증감 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c, i) => {
              const raw = c.label.includes('입금') || c.label.includes('출금') || c.label.includes('총')
                ? (c.label.includes('총 입금') ? stats.totalDeposit : c.label.includes('총 출금') ? stats.totalWithdraw : c.label.includes('입금') ? stats.todayDeposit : stats.todayWithdraw)
                : (c.label.includes('회원') ? stats.userCount : c.label.includes('가입') ? stats.todayNewUsers : c.label.includes('접속') ? stats.activeSessions : stats.pendingWithdrawals);
              const change = calcChange(raw, c.prev);
              return (
                <div key={i} className="p-5 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>{c.label}</p>
                  <p className="text-2xl font-light mt-2" style={{ color: c.color }}>
                    {c.value}<span className="text-xs font-light ml-1" style={{ color: '#555' }}>{c.suffix}</span>
                  </p>
                  {!change.zero && (
                    <p className="text-[10px] mt-1.5" style={{ color: change.up ? '#4CAF50' : '#E53935' }}>
                      {change.up ? '\u2191' : '\u2193'}{change.pct}%
                      <span className="ml-1" style={{ color: '#555' }}>vs 이전</span>
                    </p>
                  )}
                </div>
              );
            })
        }
      </div>

      {/* 차트 영역 — 일별 입출금 추이 */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <div className="mt-6 p-5 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] font-light uppercase tracking-wider mb-4" style={{ color: '#555' }}>7일간 입출금 추이</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDeposit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gWithdraw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E53935" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#E53935" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="deposit" stroke="#4CAF50" strokeWidth={2} fill="url(#gDeposit)" name="입금" />
                <Area type="monotone" dataKey="withdraw" stroke="#E53935" strokeWidth={2} fill="url(#gWithdraw)" name="출금" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-[2px] rounded-full" style={{ background: '#4CAF50' }} />
              <span className="text-[10px] font-light" style={{ color: '#888' }}>입금</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-[2px] rounded-full" style={{ background: '#E53935' }} />
              <span className="text-[10px] font-light" style={{ color: '#888' }}>출금</span>
            </div>
          </div>
        </div>
      )}

      {/* 게임별 매출 TOP 5 */}
      {!loading && (
        <div className="mt-6 rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>게임별 매출 TOP 5</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left px-5 py-2.5 text-[10px] font-light uppercase" style={{ color: '#555' }}>#</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-light uppercase" style={{ color: '#555' }}>게임명</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-light uppercase" style={{ color: '#555' }}>제공사</th>
                <th className="text-right px-5 py-2.5 text-[10px] font-light uppercase" style={{ color: '#555' }}>매출</th>
                <th className="text-right px-5 py-2.5 text-[10px] font-light uppercase" style={{ color: '#555' }}>플레이수</th>
              </tr>
            </thead>
            <tbody>
              {gameRevenue.map((g, i) => (
                <tr key={g.rank} style={{ borderBottom: i < gameRevenue.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium" style={{ color: g.rank <= 3 ? '#FFB300' : '#555' }}>{g.rank}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-white font-light">{g.name}</td>
                  <td className="px-5 py-3 text-xs font-light" style={{ color: '#888' }}>{g.provider}</td>
                  <td className="px-5 py-3 text-xs text-white font-light text-right">{'\u20A9'}{g.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs font-light text-right" style={{ color: '#888' }}>{g.plays.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 실시간 활동 피드 (최근 5건, 30초마다 자동 갱신) */}
      {loading ? (
        <SkeletonActivity />
      ) : (
        <div className="mt-6 rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>실시간 활동</p>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-light" style={{ color: '#555' }}>30초 갱신</span>
            </span>
          </div>
          <div>
            {recentActivity.map((item, i) => {
              const info = getActivityIcon(item.type);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${info.color}15`, color: info.color }}
                  >
                    {info.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-light text-white">
                      <span style={{ color: info.color }}>{info.label}</span>
                      {' \u00B7 '}
                      <span className="text-white/80">{item.user}</span>
                      {item.amount && <span className="text-white ml-1">{'\u20A9'}{item.amount.toLocaleString()}</span>}
                      {item.game && <span className="text-white/50 ml-1 text-[10px]">{item.game}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] font-light flex-shrink-0" style={{ color: '#555' }}>{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
