'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const DUMMY_LOGS = [
  { id: 1, action: '회원 잔액 조정', admin: 'admin', target: 'test7', detail: '+50,000', created_at: '2026-03-19 01:00' },
  { id: 2, action: '쿠폰 생성', admin: 'admin', target: 'WELCOME2026', detail: 'deposit_bonus 15%', created_at: '2026-03-18 22:00' },
  { id: 3, action: '출금 승인', admin: 'admin', target: 'user_42', detail: '\u20A9100,000', created_at: '2026-03-18 18:00' },
  { id: 4, action: '회원 차단', admin: 'admin', target: 'spammer_01', detail: 'status: BLOCKED', created_at: '2026-03-18 15:30' },
  { id: 5, action: '게임 추가', admin: 'admin', target: 'Dragon Hatch 2', detail: 'PG Soft', created_at: '2026-03-18 12:00' },
  { id: 6, action: '입금 확인', admin: 'admin', target: 'user_15', detail: '\u20A9200,000', created_at: '2026-03-17 20:00' },
  { id: 7, action: '설정 변경', admin: 'admin', target: 'min_deposit', detail: '10000 -> 5000', created_at: '2026-03-17 14:30' },
  { id: 8, action: '출금 거절', admin: 'admin', target: 'user_88', detail: '\u20A950,000 (본인확인 미완)', created_at: '2026-03-17 11:00' },
];

const ACTION_COLORS: Record<string, string> = {
  '회원 잔액 조정': 'bg-blue-500/20 text-blue-400',
  '쿠폰 생성': 'bg-purple-500/20 text-purple-400',
  '출금 승인': 'bg-green-500/20 text-green-400',
  '출금 거절': 'bg-red-500/20 text-red-400',
  '회원 차단': 'bg-red-500/20 text-red-400',
  '게임 추가': 'bg-yellow-500/20 text-yellow-400',
  '입금 확인': 'bg-green-500/20 text-green-400',
  '설정 변경': 'bg-gray-500/20 text-gray-400',
};

export default function AdminLogsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    api.get('/admin/logs').then(res => {
      if (res.success && res.data && Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs(DUMMY_LOGS);
      }
      setLoading(false);
    }).catch(() => {
      setLogs(DUMMY_LOGS);
      setLoading(false);
    });
  }, []);

  const actions = Array.from(new Set(logs.map(l => l.action)));

  const filtered = filterAction === 'all' ? logs : logs.filter(l => l.action === filterAction);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-medium text-white">관리자 로그</h1>
        <span className="px-3 py-2 text-xs text-white/40 bg-white/5 rounded-lg">
          총 {logs.length}건
        </span>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="all">전체 액션</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-white/50">로딩 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/50">로그 없음</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs text-white/50">시간</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">액션</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">관리자</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">대상</th>
                  <th className="text-left px-4 py-3 text-xs text-white/50">상세</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filtered.map((log: any) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{log.created_at}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-white/10 text-white/60'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">{log.admin}</td>
                    <td className="px-4 py-3 text-white font-medium">{log.target}</td>
                    <td className="px-4 py-3 text-white/50">{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {filtered.map((log: any) => (
              <div key={log.id} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-white/10 text-white/60'}`}>
                    {log.action}
                  </span>
                  <span className="text-[10px] text-white/30">{log.created_at}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">{log.target}</span>
                    <span className="text-xs text-white/40 ml-2">by {log.admin}</span>
                  </div>
                  <span className="text-xs text-white/50">{log.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
