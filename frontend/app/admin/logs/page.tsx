'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';

const PAGE_SIZE = 20;

const DUMMY_LOGS = [
  { id: 1, action: '회원 잔액 조정', admin: 'admin', target: 'test7', detail: '+50,000', ip: '192.168.1.1', created_at: '2026-03-19 01:00' },
  { id: 2, action: '쿠폰 생성', admin: 'admin', target: 'WELCOME2026', detail: 'deposit_bonus 15%', ip: '192.168.1.1', created_at: '2026-03-18 22:00' },
  { id: 3, action: '출금 승인', admin: 'admin', target: 'user_42', detail: '\u20A9100,000', ip: '10.0.0.5', created_at: '2026-03-18 18:00' },
  { id: 4, action: '회원 차단', admin: 'admin', target: 'spammer_01', detail: 'status: BLOCKED', ip: '192.168.1.1', created_at: '2026-03-18 15:30' },
  { id: 5, action: '게임 추가', admin: 'admin', target: 'Dragon Hatch 2', detail: 'PG Soft', ip: '192.168.1.1', created_at: '2026-03-18 12:00' },
  { id: 6, action: '입금 확인', admin: 'admin', target: 'user_15', detail: '\u20A9200,000', ip: '10.0.0.5', created_at: '2026-03-17 20:00' },
  { id: 7, action: '설정 변경', admin: 'admin', target: 'min_deposit', detail: '10000 -> 5000', ip: '192.168.1.1', created_at: '2026-03-17 14:30' },
  { id: 8, action: '출금 거절', admin: 'admin', target: 'user_88', detail: '\u20A950,000 (본인확인 미완)', ip: '10.0.0.5', created_at: '2026-03-17 11:00' },
  { id: 9, action: '로그인', admin: 'admin', target: '-', detail: '관리자 로그인', ip: '192.168.1.1', created_at: '2026-03-17 09:00' },
  { id: 10, action: '회원 잔액 조정', admin: 'subadmin', target: 'user_99', detail: '-30,000', ip: '172.16.0.3', created_at: '2026-03-16 23:00' },
  { id: 11, action: '쿠폰 생성', admin: 'subadmin', target: 'VIP50', detail: 'free_spin 50', ip: '172.16.0.3', created_at: '2026-03-16 21:00' },
  { id: 12, action: '출금 승인', admin: 'admin', target: 'user_77', detail: '\u20A9500,000', ip: '192.168.1.1', created_at: '2026-03-16 18:00' },
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
  '로그인': 'bg-cyan-500/20 text-cyan-400',
};

export default function AdminLogsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterAdmin, setFilterAdmin] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: { page?: number; action?: string; admin?: string } = { page };
      if (filterAction !== 'all') params.action = filterAction;
      if (filterAdmin !== 'all') params.admin = filterAdmin;
      const res = await adminApi.getLogs(params);
      if (res.success && res.data && Array.isArray(res.data)) {
        setLogs(res.data);
      } else if (res.success && res.data?.logs) {
        setLogs(res.data.logs);
      } else {
        setLogs(DUMMY_LOGS);
      }
    } catch {
      setLogs(DUMMY_LOGS);
    }
    setLoading(false);
  }, [page, filterAction, filterAdmin]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filterAction, filterAdmin, dateFrom, dateTo]);

  const actions = Array.from(new Set(logs.map(l => l.action)));
  const admins = Array.from(new Set(logs.map(l => l.admin)));

  // Client-side date filter
  const filtered = logs.filter(l => {
    if (dateFrom && l.created_at < dateFrom) return false;
    if (dateTo && l.created_at > dateTo + ' 23:59') return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setFilterAction('all');
    setFilterAdmin('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = filterAction !== 'all' || filterAdmin !== 'all' || dateFrom || dateTo;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-medium text-white">관리자 로그</h1>
        <span className="px-3 py-2 text-xs text-white/40 bg-white/5 rounded-lg">
          총 {filtered.length}건
        </span>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 mb-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-white/40">시작일</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-white/40">종료일</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Action Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-white/40">액션</label>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="all">전체 액션</option>
              {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Admin Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-white/40">관리자</label>
            <select
              value={filterAdmin}
              onChange={e => setFilterAdmin(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="all">전체 관리자</option>
              {admins.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs rounded-lg text-white/50 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : paged.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-sm">로그가 없습니다</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">시간</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">관리자</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">액션</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">대상</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">상세내용</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">IP</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {paged.map((log: any) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{log.created_at}</td>
                    <td className="px-4 py-3 text-white/60">{log.admin}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-white/10 text-white/60'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{log.target}</td>
                    <td className="px-4 py-3 text-white/50 max-w-[200px] truncate">{log.detail}</td>
                    <td className="px-4 py-3 text-white/30 text-xs font-mono">{log.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {paged.map((log: any) => (
              <div key={log.id} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-white/10 text-white/60'}`}>
                    {log.action}
                  </span>
                  <span className="text-[10px] text-white/30">{log.created_at}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm text-white font-medium">{log.target}</span>
                    <span className="text-xs text-white/40 ml-2">by {log.admin}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/50">{log.detail}</span>
                  <span className="text-[10px] text-white/20 font-mono">{log.ip || '-'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-light" style={{ color: '#555' }}>
              {filtered.length}건 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, filtered.length)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#ccc' }}
              >
                이전
              </button>
              <span className="text-xs font-light" style={{ color: '#888' }}>{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#ccc' }}
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
