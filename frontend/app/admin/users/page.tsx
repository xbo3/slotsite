'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export default function AdminUsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-medium text-white mb-4">회원관리</h1>
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
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
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
      )}
    </div>
  );
}
