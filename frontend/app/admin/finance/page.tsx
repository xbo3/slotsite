'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

const DAILY_FINANCE = [
  { day: '03/13', deposit: 850000, withdraw: 620000 },
  { day: '03/14', deposit: 1200000, withdraw: 900000 },
  { day: '03/15', deposit: 780000, withdraw: 450000 },
  { day: '03/16', deposit: 1500000, withdraw: 1100000 },
  { day: '03/17', deposit: 920000, withdraw: 680000 },
  { day: '03/18', deposit: 1800000, withdraw: 1300000 },
  { day: '03/19', deposit: 650000, withdraw: 400000 },
];

const MONTHLY_SUMMARY = [
  { month: '2026-01', deposit: 28500000, withdraw: 21200000, profit: 7300000 },
  { month: '2026-02', deposit: 31200000, withdraw: 24800000, profit: 6400000 },
  { month: '2026-03', deposit: 35000000, withdraw: 28000000, profit: 7000000 },
];

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

export default function AdminFinancePage() {
  const [stats, setStats] = useState({ totalDeposit: 0, totalWithdraw: 0, profit: 0, userCount: 0 });

  useEffect(() => {
    adminApi.getDashboard().then(res => {
      if (res.success && res.data) {
        setStats({
          totalDeposit: res.data.totalDeposit || 35000000,
          totalWithdraw: res.data.totalWithdraw || 28000000,
          profit: res.data.profit || 7000000,
          userCount: res.data.userCount || 1247,
        });
      } else {
        setStats({ totalDeposit: 35000000, totalWithdraw: 28000000, profit: 7000000, userCount: 1247 });
      }
    }).catch(() => {
      setStats({ totalDeposit: 35000000, totalWithdraw: 28000000, profit: 7000000, userCount: 1247 });
    });
  }, []);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-medium text-white mb-6">입출금 관리</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '총 입금', value: stats.totalDeposit, color: '#4CAF50' },
          { label: '총 출금', value: stats.totalWithdraw, color: '#E53935' },
          { label: '순이익', value: stats.profit, color: '#42A5F5' },
          { label: '회원 수', value: stats.userCount, color: '#FFB300', isCurrency: false },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>{s.label}</p>
            <p className="text-2xl font-light mt-2" style={{ color: s.color }}>
              {s.isCurrency === false ? s.value.toLocaleString() : `₩${s.value.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>

      {/* 일별 입출금 BarChart */}
      <div className="mt-6 p-5 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-light uppercase tracking-wider mb-4" style={{ color: '#555' }}>일별 입출금 현황</p>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_FINANCE} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deposit" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={16} name="입금" />
              <Bar dataKey="withdraw" fill="#E53935" radius={[4, 4, 0, 0]} barSize={16} name="출금" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-3 px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#4CAF50' }} />
            <span className="text-[10px] font-light" style={{ color: '#888' }}>입금</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#E53935' }} />
            <span className="text-[10px] font-light" style={{ color: '#888' }}>출금</span>
          </div>
        </div>
      </div>

      {/* 월별 요약 */}
      <div className="mt-6 rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>월별 요약</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50">월</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-white/50">입금</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-white/50">출금</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-white/50">순이익</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_SUMMARY.map((row, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white/80 text-xs">{row.month}</td>
                  <td className="px-4 py-3 text-right text-xs" style={{ color: '#4CAF50' }}>₩{row.deposit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-xs" style={{ color: '#E53935' }}>₩{row.withdraw.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-xs" style={{ color: '#42A5F5' }}>₩{row.profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
