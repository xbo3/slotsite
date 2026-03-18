'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export default function AdminDepositsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [confirmData, setConfirmData] = useState({ user_id: '', amount: '', tx_hash: '' });
  const [tab, setTab] = useState<'wallets' | 'confirm'>('wallets');

  const fetchWallets = () => {
    setLoading(true);
    adminApi.getWallets().then(res => {
      if (res.success && res.data) {
        setWallets(Array.isArray(res.data) ? res.data : res.data.wallets || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchWallets(); }, []);

  const handleBulkAdd = async () => {
    if (!bulkAddresses.trim()) return;
    const addresses = bulkAddresses.split('\n').filter((a: string) => a.trim());
    const res = await adminApi.bulkAddWallets({ addresses });
    if (res.success) {
      alert(`${addresses.length}개 주소 추가 완료`);
      setBulkAddresses('');
      fetchWallets();
    } else {
      alert(res.error || '추가 실패');
    }
  };

  const handleConfirm = async () => {
    if (!confirmData.user_id || !confirmData.amount) { alert('유저ID와 금액을 입력하세요'); return; }
    const res = await adminApi.confirmDeposit({
      user_id: Number(confirmData.user_id),
      amount: Number(confirmData.amount),
      tx_hash: confirmData.tx_hash,
    });
    if (res.success) {
      alert('입금 확인 완료');
      setConfirmData({ user_id: '', amount: '', tx_hash: '' });
    } else {
      alert(res.error || '확인 실패');
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-medium text-white mb-6">입금 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('wallets')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'wallets' ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          지갑 관리
        </button>
        <button
          onClick={() => setTab('confirm')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'confirm' ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          수동 입금 확인
        </button>
      </div>

      {tab === 'wallets' && (
        <>
          {/* Bulk Add */}
          <div className="rounded-xl p-5 mb-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-medium text-white mb-3">지갑 주소 일괄 추가</h2>
            <textarea
              value={bulkAddresses}
              onChange={e => setBulkAddresses(e.target.value)}
              placeholder={'주소를 한 줄에 하나씩 입력하세요\nTRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nTRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              rows={5}
              className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/40">
                {bulkAddresses.split('\n').filter((a: string) => a.trim()).length}개 주소
              </span>
              <button
                onClick={handleBulkAdd}
                className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors"
              >
                일괄 추가
              </button>
            </div>
          </div>

          {/* Wallet Table */}
          {loading ? (
            <p className="text-white/50">로딩 중...</p>
          ) : wallets.length === 0 ? (
            <p className="text-white/50">등록된 지갑 없음</p>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs text-white/50">ID</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">주소</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">상태</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">할당 유저</th>
                    <th className="text-left px-4 py-3 text-xs text-white/50">생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {wallets.map((w: any) => (
                    <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/60">{w.id}</td>
                      <td className="px-4 py-3 text-white font-mono text-xs">{w.address}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {w.status === 'available' ? '사용가능' : '사용중'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60">{w.user_id || '-'}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{w.created_at ? new Date(w.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'confirm' && (
        <div className="rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-medium text-white mb-4">수동 입금 확인</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs text-white/50 mb-1">유저 ID</label>
              <input
                type="number"
                value={confirmData.user_id}
                onChange={e => setConfirmData(d => ({ ...d, user_id: e.target.value }))}
                placeholder="유저 ID 입력"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">입금 금액</label>
              <input
                type="number"
                value={confirmData.amount}
                onChange={e => setConfirmData(d => ({ ...d, amount: e.target.value }))}
                placeholder="금액 입력"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">TX Hash (선택)</label>
              <input
                type="text"
                value={confirmData.tx_hash}
                onChange={e => setConfirmData(d => ({ ...d, tx_hash: e.target.value }))}
                placeholder="트랜잭션 해시"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors"
            >
              입금 확인 처리
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
