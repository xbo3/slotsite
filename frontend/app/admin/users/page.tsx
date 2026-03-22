'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';

const PAGE_SIZE = 20;

// ===== Types =====
interface User {
  id: number;
  username: string;
  nickname: string;
  balance: number;
  bonus_balance: number;
  total_deposit: number;
  total_withdraw: number;
  status: string;
  memo: string;
  last_login: string;
  created_at: string;
}

interface UserDetail {
  id: number;
  username: string;
  nickname: string;
  balance: number;
  bonus_balance: number;
  total_deposit: number;
  total_withdraw: number;
  status: string;
  memo: string;
  last_login: string;
  last_ip: string;
  created_at: string;
  // Deposits/Withdrawals
  transactions: { id: number; type: string; amount: number; balance_after: number; reference: string; status: string; created_at: string }[];
  // Active bonuses
  bonuses: { id: number; name: string; amount: number; wagered: number; wager_required: number; status: string; expires_at: string }[];
  // Login logs
  login_logs: { id: number; ip: string; device: string; created_at: string }[];
}

// ===== Dummy fallback =====
const DUMMY_DETAIL: Omit<UserDetail, 'id' | 'username' | 'nickname' | 'balance' | 'bonus_balance' | 'total_deposit' | 'total_withdraw' | 'status' | 'memo' | 'last_login' | 'created_at'> = {
  last_ip: '123.456.78.90',
  transactions: [
    { id: 1, type: 'DEPOSIT', amount: 100000, balance_after: 100000, reference: 'DEP-001', status: 'COMPLETED', created_at: '2026-03-20T14:30:00' },
    { id: 2, type: 'BET', amount: -5000, balance_after: 95000, reference: 'ROUND-1234', status: 'COMPLETED', created_at: '2026-03-20T15:00:00' },
    { id: 3, type: 'WIN', amount: 12000, balance_after: 107000, reference: 'ROUND-1234', status: 'COMPLETED', created_at: '2026-03-20T15:00:05' },
    { id: 4, type: 'WITHDRAW', amount: -50000, balance_after: 57000, reference: 'WD-001', status: 'COMPLETED', created_at: '2026-03-21T10:00:00' },
  ],
  bonuses: [
    { id: 1, name: '첫 충전 보너스 15%', amount: 15000, wagered: 75000, wager_required: 300000, status: 'active', expires_at: '2026-04-20' },
    { id: 2, name: '주간 캐시백', amount: 5000, wagered: 5000, wager_required: 5000, status: 'completed', expires_at: '2026-03-25' },
  ],
  login_logs: [
    { id: 1, ip: '123.456.78.90', device: 'Chrome / Windows 11', created_at: '2026-03-22T09:30:00' },
    { id: 2, ip: '123.456.78.90', device: 'Safari / iPhone 15', created_at: '2026-03-21T22:15:00' },
    { id: 3, ip: '111.222.33.44', device: 'Chrome / Android', created_at: '2026-03-20T18:00:00' },
    { id: 4, ip: '123.456.78.90', device: 'Chrome / Windows 11', created_at: '2026-03-19T10:00:00' },
  ],
};

// ===== Tab types =====
type DetailTab = 'info' | 'balance' | 'transactions' | 'bonuses' | 'logs';

const TAB_LIST: { key: DetailTab; label: string }[] = [
  { key: 'info', label: '기본정보' },
  { key: 'balance', label: '잔액' },
  { key: 'transactions', label: '입출금' },
  { key: 'bonuses', label: '보너스' },
  { key: 'logs', label: '접속로그' },
];

export default function AdminUsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');

  // Balance adjust
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustTarget, setAdjustTarget] = useState<'balance' | 'bonus'>('balance');
  const [adjusting, setAdjusting] = useState(false);

  // Memo modal
  const [memoModal, setMemoModal] = useState<{ userId: number; username: string; memo: string } | null>(null);
  const [memoText, setMemoText] = useState('');
  const [savingMemo, setSavingMemo] = useState(false);

  // Toast
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

  useEffect(() => { setPage(1); }, [search]);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  // Open user detail modal
  const openDetail = useCallback(async (user: User) => {
    setDetailLoading(true);
    setActiveTab('info');
    setAdjustAmount('');

    // Build base from list data
    const base: UserDetail = {
      id: user.id,
      username: user.username,
      nickname: user.nickname || '-',
      balance: Number(user.balance || 0),
      bonus_balance: Number(user.bonus_balance || 0),
      total_deposit: Number(user.total_deposit || 0),
      total_withdraw: Number(user.total_withdraw || 0),
      status: user.status || 'ACTIVE',
      memo: user.memo || '',
      last_login: user.last_login || '',
      created_at: user.created_at || '',
      ...DUMMY_DETAIL,
    };

    setSelectedUser(base);
    setDetailLoading(false);

    // Try fetching real detail
    try {
      const res = await adminApi.getUserDetail(user.id);
      if (res.success && res.data) {
        setSelectedUser(prev => prev ? { ...prev, ...res.data } : prev);
      }
    } catch {
      // Keep dummy fallback
    }
  }, []);

  // Adjust balance
  const handleAdjust = async (direction: 'add' | 'sub') => {
    if (!selectedUser || !adjustAmount) return;
    const raw = Number(adjustAmount.replace(/[^\d]/g, ''));
    if (!raw || raw <= 0) return;
    setAdjusting(true);
    try {
      const field = adjustTarget === 'balance' ? 'balance' : 'bonus_balance';
      const current = Number(selectedUser[field] || 0);
      const newVal = direction === 'add' ? current + raw : Math.max(0, current - raw);

      const res = await adminApi.updateUser(selectedUser.id, { [field]: newVal });
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, [field]: newVal } : u));
        setSelectedUser(prev => prev ? { ...prev, [field]: newVal } : prev);
        setAdjustAmount('');
        toast(`${adjustTarget === 'balance' ? '잔액' : '보너스 잔액'} ${direction === 'add' ? '추가' : '차감'} 완료`);
      } else {
        toast(res.error || '잔액 조정 실패');
      }
    } catch {
      toast('잔액 조정 실패');
    }
    setAdjusting(false);
  };

  // Toggle block
  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await adminApi.updateUser(selectedUser.id, { status: newStatus });
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
        setSelectedUser(prev => prev ? { ...prev, status: newStatus } : prev);
        toast(newStatus === 'BLOCKED' ? '차단 완료' : '차단 해제 완료');
      } else {
        toast(res.error || '상태 변경 실패');
      }
    } catch {
      toast('상태 변경 실패');
    }
  };

  // Save memo
  const handleSaveMemo = async () => {
    if (!memoModal) return;
    setSavingMemo(true);
    try {
      const res = await adminApi.updateUserMemo(memoModal.userId, memoText);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === memoModal.userId ? { ...u, memo: memoText } : u));
        if (selectedUser && selectedUser.id === memoModal.userId) {
          setSelectedUser(prev => prev ? { ...prev, memo: memoText } : prev);
        }
        toast('메모 저장 완료');
        setMemoModal(null);
      } else {
        toast(res.error || '메모 저장 실패');
      }
    } catch {
      toast('메모 저장 실패');
    }
    setSavingMemo(false);
  };

  // Format helpers
  const fmtDate = (d: string) => d ? d.slice(0, 10) : '-';
  const fmtDateTime = (d: string) => d ? d.slice(0, 16).replace('T', ' ') : '-';
  const fmtMoney = (n: number) => `${Number(n || 0).toLocaleString()}`;

  // TX type badges
  const txBadge = (type: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      DEPOSIT: { label: '입금', cls: 'bg-green-500/20 text-green-400' },
      WITHDRAW: { label: '출금', cls: 'bg-red-500/20 text-red-400' },
      BET: { label: '배팅', cls: 'bg-blue-500/20 text-blue-400' },
      WIN: { label: '당첨', cls: 'bg-yellow-500/20 text-yellow-400' },
      BONUS: { label: '보너스', cls: 'bg-purple-500/20 text-purple-400' },
      COUPON: { label: '쿠폰', cls: 'bg-pink-500/20 text-pink-400' },
    };
    const info = map[type] || { label: type, cls: 'bg-white/10 text-white/60' };
    return <span className={`text-[10px] px-2 py-0.5 rounded-full ${info.cls}`}>{info.label}</span>;
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
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
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">잔액</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">보너스</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">총입금</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">총출금</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">최근접속</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-white/50">메모</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">가입일</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => openDetail(u)}
                  >
                    <td className="px-4 py-3 text-white/60">{u.id}</td>
                    <td className="px-4 py-3 text-white">{u.username}</td>
                    <td className="px-4 py-3 text-white/80">{u.nickname || '-'}</td>
                    <td className="px-4 py-3 text-white text-right">{fmtMoney(u.balance)}</td>
                    <td className="px-4 py-3 text-purple-400 text-right">{fmtMoney(u.bonus_balance)}</td>
                    <td className="px-4 py-3 text-green-400 text-right">{fmtMoney(u.total_deposit)}</td>
                    <td className="px-4 py-3 text-red-400 text-right">{fmtMoney(u.total_withdraw)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : u.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">{fmtDateTime(u.last_login)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setMemoModal({ userId: u.id, username: u.username, memo: u.memo || '' });
                          setMemoText(u.memo || '');
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                        title={u.memo || '메모 없음'}
                      >
                        {u.memo ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFA726" stroke="#FFA726" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* ===== Memo Modal ===== */}
      {memoModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80]" onClick={() => setMemoModal(null)} />
          <div className="fixed inset-0 z-[81] flex items-center justify-center p-4" onClick={() => setMemoModal(null)}>
            <div
              className="w-full max-w-sm rounded-2xl p-6 relative"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setMemoModal(null)} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(255,255,255,0.07)', color: '#999' }}>
                &#x2715;
              </button>
              <h2 className="text-lg font-light text-white mb-1">메모</h2>
              <p className="text-xs text-white/40 mb-4">{memoModal.username}</p>
              <textarea
                value={memoText}
                onChange={e => setMemoText(e.target.value)}
                placeholder="관리자 메모 입력..."
                rows={4}
                className="w-full px-3 py-2 text-sm text-white rounded-lg focus:outline-none resize-none"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button
                onClick={handleSaveMemo}
                disabled={savingMemo}
                className="w-full mt-3 py-2.5 text-xs font-light rounded-lg transition-colors disabled:opacity-50"
                style={{ background: 'rgba(76,175,80,0.2)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' }}
              >
                {savingMemo ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== User Detail Modal (Tabs) ===== */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80]" onClick={() => setSelectedUser(null)} />
          <div className="fixed inset-0 z-[81] flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
            <div
              className="w-full max-w-2xl rounded-2xl relative flex flex-col"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-light text-white">{selectedUser.username}</h2>
                  <p className="text-xs text-white/40">{selectedUser.nickname} | ID: {selectedUser.id}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'rgba(255,255,255,0.07)', color: '#999' }}
                >
                  &#x2715;
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 px-6 flex-shrink-0 overflow-x-auto">
                {TAB_LIST.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-xs font-medium transition-colors relative whitespace-nowrap ${
                      activeTab === tab.key ? 'text-white' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto flex-1 px-6 py-4">
                {detailLoading ? (
                  <p className="text-white/50 text-sm py-8 text-center">로딩 중...</p>
                ) : (
                  <>
                    {/* ===== Info Tab ===== */}
                    {activeTab === 'info' && (
                      <div>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          {[
                            { label: '아이디', value: selectedUser.username },
                            { label: '닉네임', value: selectedUser.nickname || '-' },
                            { label: '가입일', value: fmtDate(selectedUser.created_at) },
                            { label: '최근접속', value: fmtDateTime(selectedUser.last_login) },
                            { label: '마지막 IP', value: selectedUser.last_ip || '-' },
                            { label: '상태', value: selectedUser.status || 'ACTIVE' },
                          ].map((item, i) => (
                            <div key={i} className="p-3 rounded-lg" style={{ background: '#0a0a0a' }}>
                              <p className="text-[10px] font-light uppercase tracking-wider mb-1" style={{ color: '#555' }}>{item.label}</p>
                              <p className="text-sm font-light text-white">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Memo */}
                        <div className="mb-4">
                          <p className="text-[10px] font-light uppercase tracking-wider mb-2" style={{ color: '#555' }}>메모</p>
                          <div className="p-3 rounded-lg text-sm text-white/70" style={{ background: '#0a0a0a', minHeight: 40 }}>
                            {selectedUser.memo || <span className="text-white/30">메모 없음</span>}
                          </div>
                          <button
                            onClick={() => {
                              setMemoModal({ userId: selectedUser.id, username: selectedUser.username, memo: selectedUser.memo || '' });
                              setMemoText(selectedUser.memo || '');
                            }}
                            className="mt-2 px-3 py-1.5 text-xs rounded-lg transition-colors"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa' }}
                          >
                            메모 수정
                          </button>
                        </div>

                        {/* Block/Unblock */}
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
                    )}

                    {/* ===== Balance Tab ===== */}
                    {activeTab === 'balance' && (
                      <div>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="p-4 rounded-lg" style={{ background: '#0a0a0a' }}>
                            <p className="text-[10px] font-light uppercase tracking-wider mb-1" style={{ color: '#555' }}>현재 잔액</p>
                            <p className="text-xl font-light text-white">{fmtMoney(selectedUser.balance)}<span className="text-xs text-white/30 ml-1">원</span></p>
                          </div>
                          <div className="p-4 rounded-lg" style={{ background: '#0a0a0a' }}>
                            <p className="text-[10px] font-light uppercase tracking-wider mb-1" style={{ color: '#555' }}>보너스 잔액</p>
                            <p className="text-xl font-light text-purple-400">{fmtMoney(selectedUser.bonus_balance)}<span className="text-xs text-purple-400/50 ml-1">원</span></p>
                          </div>
                        </div>

                        {/* Adjust target */}
                        <div className="mb-3">
                          <p className="text-[10px] font-light uppercase tracking-wider mb-2" style={{ color: '#555' }}>조정 대상</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setAdjustTarget('balance')}
                              className={`px-4 py-2 text-xs rounded-lg transition-colors ${adjustTarget === 'balance' ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/40'}`}
                            >
                              잔액
                            </button>
                            <button
                              onClick={() => setAdjustTarget('bonus')}
                              className={`px-4 py-2 text-xs rounded-lg transition-colors ${adjustTarget === 'bonus' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/[0.03] text-white/40'}`}
                            >
                              보너스 잔액
                            </button>
                          </div>
                        </div>

                        {/* Adjust amount */}
                        <div className="mb-4">
                          <p className="text-[10px] font-light uppercase tracking-wider mb-2" style={{ color: '#555' }}>금액 입력</p>
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

                        {/* Quick amounts */}
                        <div className="flex flex-wrap gap-2">
                          {[10000, 50000, 100000, 500000, 1000000].map(v => (
                            <button
                              key={v}
                              onClick={() => setAdjustAmount(String(v))}
                              className="px-3 py-1.5 text-[10px] rounded-lg transition-colors"
                              style={{ background: 'rgba(255,255,255,0.04)', color: '#888' }}
                            >
                              {(v / 10000).toLocaleString()}만
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ===== Transactions Tab ===== */}
                    {activeTab === 'transactions' && (
                      <div>
                        {selectedUser.transactions.length === 0 ? (
                          <p className="text-white/40 text-sm text-center py-8">입출금 내역이 없습니다</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedUser.transactions.map(tx => (
                              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0a0a0a' }}>
                                <div className="flex items-center gap-3">
                                  {txBadge(tx.type)}
                                  <div>
                                    <p className={`text-sm font-light ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {tx.amount >= 0 ? '+' : ''}{fmtMoney(tx.amount)}
                                    </p>
                                    <p className="text-[10px] text-white/30">{tx.reference || '-'}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-white/50">{fmtMoney(tx.balance_after)}</p>
                                  <p className="text-[10px] text-white/30">{fmtDateTime(tx.created_at)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== Bonuses Tab ===== */}
                    {activeTab === 'bonuses' && (
                      <div>
                        {selectedUser.bonuses.length === 0 ? (
                          <p className="text-white/40 text-sm text-center py-8">활성 보너스가 없습니다</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedUser.bonuses.map(bonus => {
                              const pct = bonus.wager_required > 0 ? Math.min(100, (bonus.wagered / bonus.wager_required) * 100) : 100;
                              return (
                                <div key={bonus.id} className="p-4 rounded-lg" style={{ background: '#0a0a0a' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-white font-light">{bonus.name}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                      bonus.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                      bonus.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                      {bonus.status === 'active' ? '진행중' : bonus.status === 'completed' ? '완료' : '만료'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-white/40 mb-2">
                                    <span>보너스: {fmtMoney(bonus.amount)}원</span>
                                    <span>만료: {fmtDate(bonus.expires_at)}</span>
                                  </div>
                                  {/* Wager progress bar */}
                                  <div className="mb-1">
                                    <div className="flex items-center justify-between text-[10px] mb-1">
                                      <span style={{ color: '#555' }}>웨이저 진행률</span>
                                      <span className="text-white/60">{fmtMoney(bonus.wagered)} / {fmtMoney(bonus.wager_required)}</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                          width: `${pct}%`,
                                          background: pct >= 100 ? '#4CAF50' : 'linear-gradient(90deg, #6C5CE7, #AB47BC)',
                                        }}
                                      />
                                    </div>
                                    <p className="text-right text-[10px] mt-1" style={{ color: pct >= 100 ? '#4CAF50' : '#888' }}>
                                      {pct.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== Login Logs Tab ===== */}
                    {activeTab === 'logs' && (
                      <div>
                        {selectedUser.login_logs.length === 0 ? (
                          <p className="text-white/40 text-sm text-center py-8">접속 기록이 없습니다</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedUser.login_logs.map(log => (
                              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0a0a0a' }}>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                                      <rect x="2" y="3" width="20" height="14" rx="2" />
                                      <line x1="8" y1="21" x2="16" y2="21" />
                                      <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/80">{log.device || '-'}</p>
                                    <p className="text-[10px] text-white/30">IP: {log.ip}</p>
                                  </div>
                                </div>
                                <p className="text-[10px] text-white/40">{fmtDateTime(log.created_at)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
