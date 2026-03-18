'use client';
import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '@/lib/api';
import { DEMO_GAMES } from '@/lib/gameData';
import Modal from '@/components/ui/Modal';

export default function AdminGamesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [games, setGames] = useState<any[]>(DEMO_GAMES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editGame, setEditGame] = useState<any>(null);
  const [addForm, setAddForm] = useState({ name: '', provider: '', category: 'slots', rtp: '', thumbnail: '', isNew: false, isHot: false });

  useEffect(() => {
    adminApi.getGameStats().then(res => {
      if (res.success && res.data && Array.isArray(res.data)) {
        setGames(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const providers = useMemo(() => {
    const set = new Set(games.map(g => g.provider));
    return Array.from(set).sort();
  }, [games]);

  const filtered = useMemo(() => {
    let list = [...games];
    if (filterProvider !== 'all') list = list.filter(g => g.provider === filterProvider);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g => g.name.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q));
    }
    return list;
  }, [games, filterProvider, search]);

  const handleAdd = async () => {
    if (!addForm.name || !addForm.provider) { alert('이름과 프로바이더를 입력하세요'); return; }
    const payload = { ...addForm };
    const res = await adminApi.addGame(payload).catch(() => null);
    const newGame = {
      id: res?.data?.id || games.length + 1,
      ...payload,
      maxWin: '-',
    };
    setGames(prev => [newGame, ...prev]);
    setShowAdd(false);
    setAddForm({ name: '', provider: '', category: 'slots', rtp: '', thumbnail: '', isNew: false, isHot: false });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await adminApi.deleteGame(id).catch(() => null);
    setGames(prev => prev.filter(g => g.id !== id));
  };

  const handleEditSave = async () => {
    if (!editGame) return;
    await adminApi.updateGame(editGame.id, editGame).catch(() => null);
    setGames(prev => prev.map(g => g.id === editGame.id ? editGame : g));
    setEditGame(null);
  };

  const handleToggleActive = (id: number) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, isHot: !g.isHot } : g));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-medium text-white">게임 관리</h1>
        <div className="flex gap-2">
          <span className="px-3 py-2 text-xs text-white/40 bg-white/5 rounded-lg">
            총 {games.length}개
          </span>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors"
          >
            게임 추가
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="게임 이름 또는 프로바이더 검색..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <select
          value={filterProvider}
          onChange={e => setFilterProvider(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="all">전체 프로바이더</option>
          {providers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-white/50">로딩 중...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs text-white/50">ID</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">게임</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">프로바이더</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">RTP</th>
                <th className="text-left px-4 py-3 text-xs text-white/50">상태</th>
                <th className="text-right px-4 py-3 text-xs text-white/50">관리</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filtered.map((g: any) => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/40">{g.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {g.thumbnail && (
                        <img src={g.thumbnail} alt={g.name} className="w-8 h-8 rounded object-cover" />
                      )}
                      <div>
                        <span className="text-white text-sm">{g.name}</span>
                        <div className="flex gap-1 mt-0.5">
                          {g.isNew && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">NEW</span>}
                          {g.isHot && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">HOT</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{g.provider}</td>
                  <td className="px-4 py-3 text-white/60">{g.rtp || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(g.id)}
                      className={`text-xs px-2 py-0.5 rounded-full ${g.isHot ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}
                    >
                      {g.isHot ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setEditGame({ ...g })}
                        className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="게임 추가" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">게임 이름</label>
            <input
              type="text"
              value={addForm.name}
              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder="게임 이름"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">프로바이더</label>
            <input
              type="text"
              value={addForm.provider}
              onChange={e => setAddForm(f => ({ ...f, provider: e.target.value }))}
              placeholder="PG Soft, Pragmatic Play 등"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">RTP</label>
            <input
              type="text"
              value={addForm.rtp}
              onChange={e => setAddForm(f => ({ ...f, rtp: e.target.value }))}
              placeholder="96.50%"
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">썸네일 URL</label>
            <input
              type="text"
              value={addForm.thumbnail}
              onChange={e => setAddForm(f => ({ ...f, thumbnail: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={addForm.isNew} onChange={e => setAddForm(f => ({ ...f, isNew: e.target.checked }))} className="rounded" />
              NEW 태그
            </label>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={addForm.isHot} onChange={e => setAddForm(f => ({ ...f, isHot: e.target.checked }))} className="rounded" />
              HOT 태그
            </label>
          </div>
          <button onClick={handleAdd} className="w-full py-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors">
            게임 추가
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editGame} onClose={() => setEditGame(null)} title={`게임 수정 - ${editGame?.name || ''}`} size="md">
        {editGame && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">게임 이름</label>
              <input
                type="text"
                value={editGame.name}
                onChange={e => setEditGame((g: typeof editGame) => ({ ...g, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">프로바이더</label>
              <input
                type="text"
                value={editGame.provider}
                onChange={e => setEditGame((g: typeof editGame) => ({ ...g, provider: e.target.value }))}
                className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">RTP</label>
              <input
                type="text"
                value={editGame.rtp || ''}
                onChange={e => setEditGame((g: typeof editGame) => ({ ...g, rtp: e.target.value }))}
                className="w-full px-3 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" checked={editGame.isNew} onChange={e => setEditGame((g: typeof editGame) => ({ ...g, isNew: e.target.checked }))} className="rounded" />
                NEW 태그
              </label>
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" checked={editGame.isHot} onChange={e => setEditGame((g: typeof editGame) => ({ ...g, isHot: e.target.checked }))} className="rounded" />
                HOT 태그
              </label>
            </div>
            <button onClick={handleEditSave} className="w-full py-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors">
              저장
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
