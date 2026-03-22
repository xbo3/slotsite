'use client';

import { useState, useEffect, useCallback } from 'react';
import { pointsApi } from '@/lib/api';

interface PointUser {
  id: number;
  username: string;
  nickname: string;
  points: number;
  created_at: string;
  totalEarned: number;
  totalUsed: number;
  _count: { point_transactions: number };
}

interface PointTx {
  id: number;
  user_id: number;
  amount: number;
  balance: number;
  type: string;
  description: string | null;
  created_at: string;
  user: { id: number; username: string; nickname: string };
}

interface PointStats {
  totalIssued: number;
  totalUsed: number;
  totalConverted: number;
  usersWithPoints: number;
}

// DUMMY 데이터
const DUMMY_USERS: PointUser[] = [
  { id: 1, username: 'user1', nickname: '닉네임1', points: 1500, created_at: '2026-01-15T00:00:00Z', totalEarned: 3000, totalUsed: 1500, _count: { point_transactions: 12 } },
  { id: 2, username: 'user2', nickname: '닉네임2', points: 800, created_at: '2026-02-01T00:00:00Z', totalEarned: 1200, totalUsed: 400, _count: { point_transactions: 5 } },
  { id: 3, username: 'user3', nickname: '닉네임3', points: 0, created_at: '2026-02-20T00:00:00Z', totalEarned: 500, totalUsed: 500, _count: { point_transactions: 8 } },
];

const DUMMY_STATS: PointStats = { totalIssued: 4700, totalUsed: 2400, totalConverted: 300, usersWithPoints: 2 };

const DUMMY_HISTORY: PointTx[] = [
  { id: 1, user_id: 1, amount: 500, balance: 1500, type: 'ADMIN', description: '관리자 지급', created_at: '2026-03-20T10:00:00Z', user: { id: 1, username: 'user1', nickname: '닉네임1' } },
  { id: 2, user_id: 2, amount: -200, balance: 800, type: 'USE', description: '포인트 사용', created_at: '2026-03-19T15:00:00Z', user: { id: 2, username: 'user2', nickname: '닉네임2' } },
];

const TYPE_LABELS: Record<string, string> = {
  EARN: '적립',
  USE: '사용',
  CONVERT: '전환',
  ADMIN: '관리자',
};

const TYPE_COLORS: Record<string, string> = {
  EARN: 'text-green-400',
  USE: 'text-red-400',
  CONVERT: 'text-blue-400',
  ADMIN: 'text-purple-400',
};

export default function PointsPage() {
  const [tab, setTab] = useState<'users' | 'history'>('users');
  const [stats, setStats] = useState<PointStats>(DUMMY_STATS);
  const [loading, setLoading] = useState(true);

  // 유저 탭
  const [users, setUsers] = useState<PointUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');

  // 내역 탭
  const [history, setHistory] = useState<PointTx[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyType, setHistoryType] = useState('');
  const [historyUserId, setHistoryUserId] = useState('');

  // 지급/차감 모달
  const [showGive, setShowGive] = useState(false);
  const [showDeduct, setShowDeduct] = useState(false);
  const [actionForm, setActionForm] = useState({ userId: '', amount: '', description: '' });

  // 통계 로드
  useEffect(() => {
    (async () => {
      try {
        const res = await pointsApi.getStats();
        if (res.success && res.data) setStats(res.data);
      } catch { /* DUMMY */ }
    })();
  }, []);

  // 유저 목록
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(userPage));
      if (userSearch) params.set('search', userSearch);
      const res = await pointsApi.getUsers(params.toString());
      if (res.success && res.data) {
        setUsers(res.data.users);
        setUserTotal(res.data.total);
        setUserTotalPages(res.data.totalPages);
      } else {
        setUsers(DUMMY_USERS);
        setUserTotal(DUMMY_USERS.length);
        setUserTotalPages(1);
      }
    } catch {
      setUsers(DUMMY_USERS);
      setUserTotal(DUMMY_USERS.length);
      setUserTotalPages(1);
    }
    setLoading(false);
  }, [userPage, userSearch]);

  // 내역
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(historyPage));
      if (historyType) params.set('type', historyType);
      if (historyUserId) params.set('userId', historyUserId);
      const res = await pointsApi.getHistory(params.toString());
      if (res.success && res.data) {
        setHistory(res.data.transactions);
        setHistoryTotal(res.data.total);
        setHistoryTotalPages(res.data.totalPages);
      } else {
        setHistory(DUMMY_HISTORY);
        setHistoryTotal(DUMMY_HISTORY.length);
        setHistoryTotalPages(1);
      }
    } catch {
      setHistory(DUMMY_HISTORY);
      setHistoryTotal(DUMMY_HISTORY.length);
      setHistoryTotalPages(1);
    }
    setLoading(false);
  }, [historyPage, historyType, historyUserId]);

  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, fetchUsers]);
  useEffect(() => { if (tab === 'history') fetchHistory(); }, [tab, fetchHistory]);

  const handleGive = async () => {
    const res = await pointsApi.give({
      userId: Number(actionForm.userId),
      amount: Number(actionForm.amount),
      description: actionForm.description || undefined,
    });
    if (res.success) {
      setShowGive(false);
      setActionForm({ userId: '', amount: '', description: '' });
      fetchUsers();
    } else {
      alert(res.error || '지급 실패');
    }
  };

  const handleDeduct = async () => {
    const res = await pointsApi.deduct({
      userId: Number(actionForm.userId),
      amount: Number(actionForm.amount),
      description: actionForm.description || undefined,
    });
    if (res.success) {
      setShowDeduct(false);
      setActionForm({ userId: '', amount: '', description: '' });
      fetchUsers();
    } else {
      alert(res.error || '차감 실패');
    }
  };

  const openGiveForUser = (userId: number) => {
    setActionForm({ userId: String(userId), amount: '', description: '' });
    setShowGive(true);
  };

  const openDeductForUser = (userId: number) => {
    setActionForm({ userId: String(userId), amount: '', description: '' });
    setShowDeduct(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">포인트 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => { setActionForm({ userId: '', amount: '', description: '' }); setShowGive(true); }} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
            + 지급
          </button>
          <button onClick={() => { setActionForm({ userId: '', amount: '', description: '' }); setShowDeduct(true); }} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
            - 차감
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="총 발행" value={`${stats.totalIssued.toLocaleString()}P`} color="text-green-400" />
        <StatCard label="총 사용" value={`${stats.totalUsed.toLocaleString()}P`} color="text-red-400" />
        <StatCard label="총 전환" value={`${stats.totalConverted.toLocaleString()}P`} color="text-blue-400" />
        <StatCard label="보유 유저" value={`${stats.usersWithPoints}명`} />
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-[#1A1A2E] rounded-lg p-1 w-fit border border-white/5">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          유저별
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === 'history' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          내역
        </button>
      </div>

      {/* 유저별 탭 */}
      {tab === 'users' && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="아이디, 닉네임 검색..."
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
              className="flex-1 px-4 py-2 bg-[#1A1A2E] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="bg-[#1A1A2E] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-gray-400">
                    <th className="px-4 py-3">아이디</th>
                    <th className="px-4 py-3">닉네임</th>
                    <th className="px-4 py-3">보유 포인트</th>
                    <th className="px-4 py-3">누적 적립</th>
                    <th className="px-4 py-3">누적 사용</th>
                    <th className="px-4 py-3">거래수</th>
                    <th className="px-4 py-3">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">로딩 중...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">유저가 없습니다</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white">{u.username}</td>
                      <td className="px-4 py-3 text-gray-300">{u.nickname}</td>
                      <td className="px-4 py-3 text-white font-medium">{u.points.toLocaleString()}P</td>
                      <td className="px-4 py-3 text-green-400">{u.totalEarned.toLocaleString()}P</td>
                      <td className="px-4 py-3 text-red-400">{u.totalUsed.toLocaleString()}P</td>
                      <td className="px-4 py-3 text-gray-400">{u._count.point_transactions}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openGiveForUser(u.id)} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30">지급</button>
                          <button onClick={() => openDeductForUser(u.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">차감</button>
                          <button onClick={() => { setHistoryUserId(String(u.id)); setTab('history'); }} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30">내역</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userTotalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-white/5">
                <button disabled={userPage <= 1} onClick={() => setUserPage(userPage - 1)} className="px-3 py-1 bg-white/10 text-white text-sm rounded disabled:opacity-30">이전</button>
                <span className="px-3 py-1 text-gray-400 text-sm">{userPage} / {userTotalPages}</span>
                <button disabled={userPage >= userTotalPages} onClick={() => setUserPage(userPage + 1)} className="px-3 py-1 bg-white/10 text-white text-sm rounded disabled:opacity-30">다음</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 내역 탭 */}
      {tab === 'history' && (
        <>
          <div className="flex gap-2 flex-wrap">
            <select
              value={historyType}
              onChange={e => { setHistoryType(e.target.value); setHistoryPage(1); }}
              className="px-4 py-2 bg-[#1A1A2E] border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="">전체 타입</option>
              <option value="EARN">적립</option>
              <option value="USE">사용</option>
              <option value="CONVERT">전환</option>
              <option value="ADMIN">관리자</option>
            </select>
            <input
              type="text"
              placeholder="유저 ID"
              value={historyUserId}
              onChange={e => { setHistoryUserId(e.target.value); setHistoryPage(1); }}
              className="w-24 px-4 py-2 bg-[#1A1A2E] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {historyUserId && (
              <button onClick={() => { setHistoryUserId(''); setHistoryPage(1); }} className="px-3 py-2 bg-white/10 text-gray-300 text-sm rounded-lg hover:bg-white/20">
                필터 해제
              </button>
            )}
          </div>

          <div className="bg-[#1A1A2E] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-gray-400">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">유저</th>
                    <th className="px-4 py-3">타입</th>
                    <th className="px-4 py-3">금액</th>
                    <th className="px-4 py-3">잔액</th>
                    <th className="px-4 py-3">설명</th>
                    <th className="px-4 py-3">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">로딩 중...</td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">내역이 없습니다</td></tr>
                  ) : history.map(tx => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{tx.id}</td>
                      <td className="px-4 py-3 text-white">{tx.user.username}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${TYPE_COLORS[tx.type] || 'text-gray-400'}`}>
                          {TYPE_LABELS[tx.type] || tx.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}P
                      </td>
                      <td className="px-4 py-3 text-white">{tx.balance.toLocaleString()}P</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{tx.description || '-'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(tx.created_at).toLocaleString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {historyTotalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-white/5">
                <button disabled={historyPage <= 1} onClick={() => setHistoryPage(historyPage - 1)} className="px-3 py-1 bg-white/10 text-white text-sm rounded disabled:opacity-30">이전</button>
                <span className="px-3 py-1 text-gray-400 text-sm">{historyPage} / {historyTotalPages}</span>
                <button disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage(historyPage + 1)} className="px-3 py-1 bg-white/10 text-white text-sm rounded disabled:opacity-30">다음</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 지급 모달 */}
      {showGive && (
        <Modal title="포인트 지급" onClose={() => setShowGive(false)}>
          <div className="space-y-3">
            <Input label="유저 ID *" value={actionForm.userId} onChange={v => setActionForm({ ...actionForm, userId: v })} type="number" />
            <Input label="금액 (P) *" value={actionForm.amount} onChange={v => setActionForm({ ...actionForm, amount: v })} type="number" />
            <Input label="설명" value={actionForm.description} onChange={v => setActionForm({ ...actionForm, description: v })} placeholder="사유 입력" />
            <button onClick={handleGive} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">지급</button>
          </div>
        </Modal>
      )}

      {/* 차감 모달 */}
      {showDeduct && (
        <Modal title="포인트 차감" onClose={() => setShowDeduct(false)}>
          <div className="space-y-3">
            <Input label="유저 ID *" value={actionForm.userId} onChange={v => setActionForm({ ...actionForm, userId: v })} type="number" />
            <Input label="금액 (P) *" value={actionForm.amount} onChange={v => setActionForm({ ...actionForm, amount: v })} type="number" />
            <Input label="설명" value={actionForm.description} onChange={v => setActionForm({ ...actionForm, description: v })} placeholder="사유 입력" />
            <button onClick={handleDeduct} className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">차감</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== 하위 컴포넌트 =====

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#1A1A2E] rounded-xl p-4 border border-white/5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0F0F1A] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
      />
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#1A1A2E] rounded-2xl border border-white/10 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
