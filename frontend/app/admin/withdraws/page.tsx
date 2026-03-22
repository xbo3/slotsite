'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

type WithdrawStatus = 'all' | 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

interface WithdrawItem {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  status: string;
  bank_name?: string;
  account_number?: string;
  reason?: string;
  security_hold?: boolean;
  fingerprint_mismatch?: boolean;
  created_at: string;
}

interface WithdrawStats {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  todayAmount: number;
}

const DUMMY_WITHDRAWALS: WithdrawItem[] = [
  { id: 201, user_id: 3, username: 'test7', amount: 50000, status: 'PENDING', bank_name: '국민은행', account_number: '123-456-789', created_at: '2026-03-22T10:00:00Z' },
  { id: 202, user_id: 5, username: 'vip_kim', amount: 1000000, status: 'APPROVED', bank_name: '신한은행', account_number: '987-654-321', created_at: '2026-03-22T09:30:00Z' },
  { id: 203, user_id: 8, username: 'player1', amount: 200000, status: 'COMPLETED', bank_name: '하나은행', account_number: '555-123-000', created_at: '2026-03-21T18:00:00Z' },
  { id: 204, user_id: 12, username: 'lucky7', amount: 300000, status: 'REJECTED', reason: '본인확인 실패', bank_name: '우리은행', account_number: '111-222-333', created_at: '2026-03-21T15:00:00Z' },
  { id: 205, user_id: 15, username: 'newuser', amount: 30000, status: 'PENDING', bank_name: '카카오뱅크', account_number: '3333-01-123456', security_hold: true, fingerprint_mismatch: true, created_at: '2026-03-22T11:30:00Z' },
  { id: 206, user_id: 20, username: 'whale99', amount: 5000000, status: 'PROCESSING', bank_name: 'NH농협', account_number: '888-999-000', created_at: '2026-03-22T08:00:00Z' },
  { id: 207, user_id: 25, username: 'highroller', amount: 2000000, status: 'PENDING', bank_name: '기업은행', account_number: '777-111-222', created_at: '2026-03-22T12:15:00Z' },
];

const DUMMY_STATS: WithdrawStats = {
  totalCount: 924,
  totalAmount: 48200000,
  pendingCount: 3,
  todayAmount: 6280000,
};

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: '대기중', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  APPROVED: { label: '승인', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  PROCESSING: { label: '처리중', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  COMPLETED: { label: '완료', bg: 'bg-green-500/20', text: 'text-green-400' },
  REJECTED: { label: '거절', bg: 'bg-red-500/20', text: 'text-red-400' },
};

const STATUS_TABS: { key: WithdrawStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'PENDING', label: '대기중' },
  { key: 'APPROVED', label: '승인' },
  { key: 'PROCESSING', label: '처리중' },
  { key: 'COMPLETED', label: '완료' },
  { key: 'REJECTED', label: '거절' },
];

export default function AdminWithdrawsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawItem[]>(DUMMY_WITHDRAWALS);
  const [withdrawStats, setWithdrawStats] = useState<WithdrawStats>(DUMMY_STATS);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<WithdrawStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // 사유 모달
  const [reasonModal, setReasonModal] = useState<{ open: boolean; id: number; action: 'approve' | 'reject'; reason: string }>({ open: false, id: 0, action: 'approve', reason: '' });

  const fetchList = () => {
    setLoading(true);
    adminApi.getWithdrawals().then(res => {
      if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setWithdrawals(res.data);
        const today = new Date().toISOString().slice(0, 10);
        const todayItems = res.data.filter((w: WithdrawItem) => w.created_at?.startsWith(today));
        setWithdrawStats({
          totalCount: res.data.length,
          totalAmount: res.data.reduce((s: number, w: WithdrawItem) => s + Number(w.amount), 0),
          pendingCount: res.data.filter((w: WithdrawItem) => w.status === 'PENDING').length,
          todayAmount: todayItems.reduce((s: number, w: WithdrawItem) => s + Number(w.amount), 0),
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'complete') => {
    if (action === 'approve' || action === 'reject') {
      setReasonModal({ open: true, id, action, reason: '' });
      return;
    }
    // complete 는 바로 실행
    const res = await adminApi.completeWithdraw(id);
    if (res.success) fetchList();
    else alert(res.error || 'Failed');
  };

  const handleReasonSubmit = async () => {
    const { id, action, reason } = reasonModal;
    if (action === 'reject' && !reason.trim()) {
      alert('거절 사유를 입력하세요');
      return;
    }
    const fn = action === 'approve' ? adminApi.approveWithdraw : adminApi.rejectWithdraw;
    const res = await fn(id);
    if (res.success) {
      setReasonModal({ open: false, id: 0, action: 'approve', reason: '' });
      fetchList();
    } else {
      alert(res.error || 'Failed');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      alert('선택된 항목이 없습니다');
      return;
    }
    const ids = Array.from(selectedIds);
    const pendingIds = ids.filter(id => {
      const w = withdrawals.find(w => w.id === id);
      return w && w.status === 'PENDING';
    });
    if (pendingIds.length === 0) {
      alert('대기중인 항목만 일괄 승인 가능합니다');
      return;
    }
    if (!confirm(`${pendingIds.length}건을 일괄 승인하시겠습니까?`)) return;

    let successCount = 0;
    for (const id of pendingIds) {
      const res = await adminApi.approveWithdraw(id);
      if (res.success) successCount++;
    }
    alert(`${successCount}/${pendingIds.length}건 승인 완료`);
    setSelectedIds(new Set());
    fetchList();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWithdrawals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredWithdrawals.map(w => w.id)));
    }
  };

  // 필터 적용
  const filteredWithdrawals = withdrawals.filter(w => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    if (dateFrom) {
      const wDate = w.created_at.slice(0, 10);
      if (wDate < dateFrom) return false;
    }
    if (dateTo) {
      const wDate = w.created_at.slice(0, 10);
      if (wDate > dateTo) return false;
    }
    return true;
  });

  const statCards = [
    { label: '총 출금건수', value: withdrawStats.totalCount.toLocaleString(), suffix: '건', color: '#42A5F5' },
    { label: '총 출금액', value: `${(withdrawStats.totalAmount / 10000).toLocaleString()}`, suffix: '만원', color: '#E53935' },
    { label: '대기중', value: withdrawStats.pendingCount.toLocaleString(), suffix: '건', color: '#FFB300' },
    { label: '오늘 출금액', value: `${(withdrawStats.todayAmount / 10000).toLocaleString()}`, suffix: '만원', color: '#26A69A' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-white">출금 관리</h1>
        {/* 일괄 승인 버튼 */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{ background: 'rgba(76,175,80,0.2)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' }}
          >
            선택 {selectedIds.size}건 일괄 승인
          </button>
        )}
      </div>

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

      {/* 상태별 필터 탭 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_TABS.map(st => {
          const count = st.key === 'all' ? withdrawals.length : withdrawals.filter(w => w.status === st.key).length;
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

      {/* 기간 필터 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
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

      {/* 출금 테이블 */}
      {loading ? <p className="text-white/50">로딩 중...</p> : (
        <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredWithdrawals.length && filteredWithdrawals.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/50">ID</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">유저</th>
                <th className="text-right px-4 py-3 text-xs text-white/50">금액</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">은행/계좌</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">상태</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">일시</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30 text-sm">해당하는 출금 내역이 없습니다</td></tr>
              ) : filteredWithdrawals.map(w => {
                const st = STATUS_LABELS[w.status] || { label: w.status, bg: 'bg-white/10', text: 'text-white/60' };
                return (
                  <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(w.id)}
                        onChange={() => toggleSelect(w.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-white/60">{w.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white">{w.username || w.user_id}</span>
                        {/* 핑거프린트 불일치 경고 */}
                        {(w.security_hold || w.fingerprint_mismatch) && (
                          <span
                            title="핑거프린트 불일치 - security_hold"
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] cursor-help"
                            style={{ background: 'rgba(255,152,0,0.2)', color: '#FFB300', border: '1px solid rgba(255,152,0,0.3)' }}
                          >
                            !
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white text-right">{'\u20A9'}{Number(w.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {w.bank_name && <span>{w.bank_name}</span>}
                      {w.account_number && <span className="ml-1 font-mono">{w.account_number}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                      {w.reason && <p className="text-[10px] mt-0.5" style={{ color: '#E53935' }}>{w.reason}</p>}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">{new Date(w.created_at).toLocaleString('ko-KR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {w.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleAction(w.id, 'approve')} className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">승인</button>
                            <button onClick={() => handleAction(w.id, 'reject')} className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">거절</button>
                          </>
                        )}
                        {w.status === 'APPROVED' && (
                          <button onClick={() => handleAction(w.id, 'complete')} className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">완료</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 승인/거절 사유 입력 모달 */}
      {reasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md mx-4 p-6 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-medium text-white mb-4">
              {reasonModal.action === 'approve' ? '출금 승인' : '출금 거절'} - #{reasonModal.id}
            </h3>
            <div className="mb-4">
              <label className="block text-xs text-white/50 mb-1">
                {reasonModal.action === 'approve' ? '승인 메모 (선택)' : '거절 사유 (필수)'}
              </label>
              <textarea
                value={reasonModal.reason}
                onChange={e => setReasonModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={reasonModal.action === 'approve' ? '승인 메모를 입력하세요' : '거절 사유를 입력하세요'}
                rows={3}
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setReasonModal({ open: false, id: 0, action: 'approve', reason: '' })}
                className="px-4 py-2 text-sm rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReasonSubmit}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  reasonModal.action === 'approve'
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {reasonModal.action === 'approve' ? '승인 확인' : '거절 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
