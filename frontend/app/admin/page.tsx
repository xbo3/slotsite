'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

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
    </div>
  );
}
