'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export default function AdminWithdrawsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = () => {
    adminApi.getWithdrawals().then(res => {
      if (res.success && res.data) setWithdrawals(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'complete') => {
    const fn = action === 'approve' ? adminApi.approveWithdraw : action === 'reject' ? adminApi.rejectWithdraw : adminApi.completeWithdraw;
    const res = await fn(id);
    if (res.success) fetchList();
    else alert(res.error || 'Failed');
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-medium text-white mb-4">출금 관리</h1>
      {loading ? <p className="text-white/50">로딩 중...</p> : withdrawals.length === 0 ? <p className="text-white/50">출금 요청 없음</p> : (
        <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-white/50">ID</th>
              <th className="text-left px-4 py-3 text-xs text-white/50">유저</th>
              <th className="text-left px-4 py-3 text-xs text-white/50">금액</th>
              <th className="text-left px-4 py-3 text-xs text-white/50">상태</th>
              <th className="text-left px-4 py-3 text-xs text-white/50">액션</th>
            </tr></thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white/60">{w.id}</td>
                  <td className="px-4 py-3 text-white">{w.username || w.user_id}</td>
                  <td className="px-4 py-3 text-white">{'\u20A9'}{Number(w.amount).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{w.status}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    {w.status === 'PENDING' && (<>
                      <button onClick={() => handleAction(w.id, 'approve')} className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30">승인</button>
                      <button onClick={() => handleAction(w.id, 'reject')} className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">거절</button>
                    </>)}
                    {w.status === 'APPROVED' && (
                      <button onClick={() => handleAction(w.id, 'complete')} className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">완료</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
