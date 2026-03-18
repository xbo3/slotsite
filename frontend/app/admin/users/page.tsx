'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    adminApi.getUsers().then(res => {
      if (res.success && res.data) setUsers(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleAdjust = async (direction: 'add' | 'sub') => {
    if (!selectedUser || !adjustAmount) return;
    const raw = Number(adjustAmount.replace(/[^\d]/g, ''));
    if (!raw || raw <= 0) return;
    setAdjusting(true);
    try {
      const newBalance = direction === 'add'
        ? Number(selectedUser.balance || 0) + raw
        : Math.max(0, Number(selectedUser.balance || 0) - raw);
      const res = await adminApi.updateUser(selectedUser.id, { balance: newBalance });
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: newBalance } : u));
        setSelectedUser({ ...selectedUser, balance: newBalance });
        setAdjustAmount('');
        toast(`잔액 ${direction === 'add' ? '추가' : '차감'} 완료`);
      } else {
        toast(res.error || '잔액 조정 실패');
      }
    } catch {
      toast('잔액 조정 실패');
    }
    setAdjusting(false);
  };

  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await adminApi.updateUser(selectedUser.id, { status: newStatus });
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
        setSelectedUser({ ...selectedUser, status: newStatus });
        toast(newStatus === 'BLOCKED' ? '차단 완료' : '차단 해제 완료');
      } else {
        toast(res.error || '상태 변경 실패');
      }
    } catch {
      toast('상태 변경 실패');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-medium text-white mb-4">회원관리</h1>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 z-[100] px-5 py-2 rounded-full text-[11px] font-normal pointer-events-none"
          style={{ background: '#fff', color: '#0a0a0a', transform: 'translateX(-50%)', boxShadow: '0 4px 20px rgba(255,255,255,0.15)' }}>
          {toastMsg}
        </div>
      )}

      <input
        type="text"
        placeholder="아이디/닉네임 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-80 px-4 py-2.5 mb-4 text-sm text-white rounded-lg focus:outline-none"
        style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
      />
      {loading ? (
        <p className="text-white/50 text-sm">로딩 중...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-white/50 text-sm">회원이 없습니다</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">아이디</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">닉네임</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">잔액</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">가입일</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => { setSelectedUser(u); setAdjustAmount(''); }}
                  >
                    <td className="px-4 py-3 text-white/60">{u.id}</td>
                    <td className="px-4 py-3 text-white">{u.username}</td>
                    <td className="px-4 py-3 text-white/80">{u.nickname}</td>
                    <td className="px-4 py-3 text-white">{Number(u.balance || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">{u.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-light" style={{ color: '#555' }}>
              {filteredUsers.length}명 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, filteredUsers.length)}
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

      {/* 유저 상세 모달 */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80]" onClick={() => setSelectedUser(null)} />
          <div className="fixed inset-0 z-[81] flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
            <div
              className="w-full max-w-md rounded-2xl p-6 relative"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* 닫기 */}
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#999' }}
              >
                ✕
              </button>

              <h2 className="text-lg font-light text-white mb-4">회원 상세</h2>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: '아이디', value: selectedUser.username },
                  { label: '닉네임', value: selectedUser.nickname || '-' },
                  { label: '잔액', value: `₩${Number(selectedUser.balance || 0).toLocaleString()}` },
                  { label: '보너스잔액', value: `₩${Number(selectedUser.bonus_balance || 0).toLocaleString()}` },
                  { label: '가입일', value: selectedUser.created_at?.slice(0, 10) || '-' },
                  { label: '상태', value: selectedUser.status || 'ACTIVE' },
                  { label: '마지막 로그인', value: selectedUser.last_login?.slice(0, 16)?.replace('T', ' ') || '-' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: '#0a0a0a' }}>
                    <p className="text-[10px] font-light uppercase tracking-wider mb-1" style={{ color: '#555' }}>{item.label}</p>
                    <p className="text-sm font-light text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* 잔액 조정 */}
              <div className="mb-4">
                <p className="text-[10px] font-light uppercase tracking-wider mb-2" style={{ color: '#555' }}>잔액 조정</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="금액 입력"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value.replace(/[^\d]/g, ''))}
                    className="flex-1 px-3 py-2 text-sm text-white rounded-lg focus:outline-none"
                    style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <button
                    onClick={() => handleAdjust('add')}
                    disabled={adjusting || !adjustAmount}
                    className="px-4 py-2 text-xs rounded-lg disabled:opacity-30"
                    style={{ background: 'rgba(76,175,80,0.2)', color: '#4CAF50' }}
                  >
                    +추가
                  </button>
                  <button
                    onClick={() => handleAdjust('sub')}
                    disabled={adjusting || !adjustAmount}
                    className="px-4 py-2 text-xs rounded-lg disabled:opacity-30"
                    style={{ background: 'rgba(229,57,53,0.2)', color: '#E53935' }}
                  >
                    -차감
                  </button>
                </div>
              </div>

              {/* 차단/해제 */}
              <button
                onClick={handleToggleBlock}
                className="w-full py-2.5 text-xs font-light rounded-lg transition-colors"
                style={{
                  background: selectedUser.status === 'BLOCKED' ? 'rgba(76,175,80,0.15)' : 'rgba(229,57,53,0.15)',
                  color: selectedUser.status === 'BLOCKED' ? '#4CAF50' : '#E53935',
                  border: `1px solid ${selectedUser.status === 'BLOCKED' ? 'rgba(76,175,80,0.3)' : 'rgba(229,57,53,0.3)'}`,
                }}
              >
                {selectedUser.status === 'BLOCKED' ? '차단 해제' : '회원 차단'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
