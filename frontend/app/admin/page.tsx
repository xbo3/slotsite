'use client';

import { useState, useEffect } from 'react';
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

const DUMMY_STATS: DashboardStats = {
  userCount: 1247,
  todayDeposit: 3500000,
  todayWithdraw: 2100000,
  totalDeposit: 35000000,
  totalWithdraw: 28000000,
  activeSessions: 84,
  todayNewUsers: 12,
  pendingWithdrawals: 5,
};

const DAILY_DATA = [
  { day: '03/13', deposit: 850000, withdraw: 620000 },
  { day: '03/14', deposit: 1200000, withdraw: 900000 },
  { day: '03/15', deposit: 780000, withdraw: 450000 },
  { day: '03/16', deposit: 1500000, withdraw: 1100000 },
  { day: '03/17', deposit: 920000, withdraw: 680000 },
  { day: '03/18', deposit: 1800000, withdraw: 1300000 },
  { day: '03/19', deposit: 650000, withdraw: 400000 },
];

const RECENT_ACTIVITY = [
  { type: 'deposit', user: 'test7', amount: 100000, time: '2분 전' },
  { type: 'withdraw', user: 'player1', amount: 50000, time: '15분 전' },
  { type: 'signup', user: 'newuser', time: '30분 전' },
  { type: 'deposit', user: 'vip_kim', amount: 500000, time: '1시간 전' },
  { type: 'bigwin', user: 'lucky7', amount: 2500000, game: 'Fire In The Hole 3', time: '2시간 전' },
];

function getActivityIcon(type: string) {
  switch (type) {
    case 'deposit': return { label: '입금', color: '#4CAF50', icon: '↓' };
    case 'withdraw': return { label: '출금', color: '#E53935', icon: '↑' };
    case 'signup': return { label: '가입', color: '#42A5F5', icon: '+' };
    case 'bigwin': return { label: 'BIG WIN', color: '#FFB300', icon: '★' };
    default: return { label: type, color: '#888', icon: '·' };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p: { dataKey: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 12 }}>
          {p.dataKey === 'deposit' ? '입금' : '출금'}: ₩{p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>(DUMMY_STATS);

  useEffect(() => {
    adminApi.getDashboard().then(res => {
      try {
        if (res.success && res.data) {
          setStats(prev => ({ ...prev, ...res.data }));
        }
      } catch { /* keep dummy */ }
    }).catch(() => {});
  }, []);

  const cards = [
    { label: '총 회원수', value: stats.userCount.toLocaleString(), suffix: '명', color: '#42A5F5' },
    { label: '오늘 가입', value: stats.todayNewUsers.toLocaleString(), suffix: '명', color: '#AB47BC' },
    { label: '접속 중', value: stats.activeSessions.toLocaleString(), suffix: '명', color: '#66BB6A' },
    { label: '출금 대기', value: stats.pendingWithdrawals.toLocaleString(), suffix: '건', color: '#FFA726' },
    { label: '오늘 입금', value: `${(stats.todayDeposit / 10000).toLocaleString()}`, suffix: '만원', color: '#4CAF50' },
    { label: '오늘 출금', value: `${(stats.todayWithdraw / 10000).toLocaleString()}`, suffix: '만원', color: '#E53935' },
    { label: '총 입금', value: `${(stats.totalDeposit / 10000).toLocaleString()}`, suffix: '만원', color: '#26A69A' },
    { label: '총 출금', value: `${(stats.totalWithdraw / 10000).toLocaleString()}`, suffix: '만원', color: '#EF5350' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-medium text-white mb-6">관리자 대시보드</h1>

      {/* 대기출금 알림 배너 */}
      {stats.pendingWithdrawals > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl"
          style={{ background: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.25)' }}
        >
          <span className="text-lg">⚠</span>
          <span className="text-sm font-light text-white">
            대기 출금 <span style={{ color: '#FFA726', fontWeight: 500 }}>{stats.pendingWithdrawals}건</span>이 처리를 기다리고 있습니다
          </span>
          <a href="/admin/finance" className="ml-auto text-xs font-light px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,152,0,0.2)', color: '#FFA726' }}>
            확인하기
          </a>
        </div>
      )}

      {/* 통계 카드 8개 — 2x4 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="p-5 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>{c.label}</p>
            <p className="text-2xl font-light mt-2" style={{ color: c.color }}>
              {c.value}<span className="text-xs font-light ml-1" style={{ color: '#555' }}>{c.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 차트 영역 — 일별 입출금 추이 */}
      <div className="mt-6 p-5 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-light uppercase tracking-wider mb-4" style={{ color: '#555' }}>7일간 입출금 추이</p>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DAILY_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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

      {/* 최근 활동 리스트 */}
      <div className="mt-6 rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>최근 활동</p>
        </div>
        <div>
          {RECENT_ACTIVITY.map((item, i) => {
            const info = getActivityIcon(item.type);
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
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
                    {' · '}
                    <span className="text-white/80">{item.user}</span>
                    {item.amount && <span className="text-white ml-1">₩{item.amount.toLocaleString()}</span>}
                    {item.game && <span className="text-white/50 ml-1 text-[10px]">{item.game}</span>}
                  </p>
                </div>
                <span className="text-[10px] font-light flex-shrink-0" style={{ color: '#555' }}>{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
