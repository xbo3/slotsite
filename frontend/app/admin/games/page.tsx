'use client';

import { useState, useEffect, useMemo } from 'react';
import { adminApi, gameApi } from '@/lib/api';
import { DEMO_GAMES } from '@/lib/gameData';
import Modal from '@/components/ui/Modal';

const PAGE_SIZE = 20;

interface GameItem {
  id: number;
  name: string;
  provider: string;
  category: string;
  rtp: string;
  max_win?: string;
  maxWin?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  external_id?: string;
  status?: string;
  isNew?: boolean;
  isHot?: boolean;
  play_count?: number;
  total_bet?: number;
  total_profit?: number;
}

interface GameStats {
  game_id: number;
  play_count: number;
  total_bet: number;
  total_profit: number;
}

const EMPTY_ADD_FORM = {
  name: '',
  provider: '',
  category: 'slots',
  rtp: '',
  max_win: '',
  thumbnail_url: '',
  external_id: '',
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [gameStats, setGameStats] = useState<Record<number, GameStats>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editGame, setEditGame] = useState<GameItem | null>(null);
  const [addForm, setAddForm] = useState({ ...EMPTY_ADD_FORM });
  const [bulkJson, setBulkJson] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Fetch games
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gamesRes, statsRes] = await Promise.all([
          gameApi.getGames().catch(() => null),
          adminApi.getGameStats().catch(() => null),
        ]);

        if (gamesRes?.success && Array.isArray(gamesRes.data)) {
          setGames(gamesRes.data.map((g: GameItem) => ({
            ...g,
            status: g.status || 'active',
          })));
        } else {
          // Fallback to demo data
          setGames(DEMO_GAMES.map(g => ({ ...g, status: 'active' })));
        }

        if (statsRes?.success && Array.isArray(statsRes.data)) {
          const map: Record<number, GameStats> = {};
          statsRes.data.forEach((s: GameStats) => { map[s.game_id] = s; });
          setGameStats(map);
        }
      } catch {
        setGames(DEMO_GAMES.map(g => ({ ...g, status: 'active' })));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Derived: providers & categories
  const providers = useMemo(() => {
    const set = new Set(games.map(g => g.provider));
    return Array.from(set).sort();
  }, [games]);

  const categories = useMemo(() => {
    const set = new Set(games.map(g => g.category));
    return Array.from(set).sort();
  }, [games]);

  // Filtered + paginated
  const filtered = useMemo(() => {
    let list = [...games];
    if (filterProvider !== 'all') list = list.filter(g => g.provider === filterProvider);
    if (filterCategory !== 'all') list = list.filter(g => g.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.provider.toLowerCase().includes(q) ||
        (g.external_id && g.external_id.toLowerCase().includes(q))
      );
    }
    return list;
  }, [games, filterProvider, filterCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedGames = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filterProvider, filterCategory]);

  // Summary stats
  const activeCount = games.filter(g => g.status === 'active').length;
  const inactiveCount = games.filter(g => g.status !== 'active').length;

  // === Handlers ===
  const handleAdd = async () => {
    if (!addForm.name || !addForm.provider) { toast('이름과 프로바이더를 입력하세요'); return; }
    setSubmitting(true);
    try {
      const res = await adminApi.addGame(addForm);
      const newGame: GameItem = {
        id: res?.data?.id || Date.now(),
        ...addForm,
        status: 'active',
      };
      setGames(prev => [newGame, ...prev]);
      setShowAdd(false);
      setAddForm({ ...EMPTY_ADD_FORM });
      toast('게임 추가 완료');
    } catch {
      toast('게임 추가 실패');
    }
    setSubmitting(false);
  };

  const handleBulkAdd = async () => {
    setBulkError('');
    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('배열 형태여야 합니다');
      if (parsed.length === 0) throw new Error('최소 1개 이상의 게임을 입력하세요');
    } catch (err: unknown) {
      setBulkError(err instanceof Error ? err.message : 'JSON 파싱 오류');
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminApi.bulkAddGames({ games: parsed });
      if (res.success) {
        const newGames = parsed.map((g: Partial<GameItem>, i: number) => ({
          id: (res.data?.ids?.[i]) || Date.now() + i,
          name: g.name || '',
          provider: g.provider || '',
          category: g.category || 'slots',
          rtp: g.rtp || '',
          max_win: g.max_win || '',
          thumbnail_url: g.thumbnail_url || '',
          external_id: g.external_id || '',
          status: 'active',
        }));
        setGames(prev => [...newGames, ...prev]);
        setShowBulk(false);
        setBulkJson('');
        toast(`${parsed.length}개 게임 일괄 등록 완료`);
      } else {
        setBulkError(res.error || '일괄 등록 실패');
      }
    } catch {
      setBulkError('일괄 등록 요청 실패');
    }
    setSubmitting(false);
  };

  const handleEditSave = async () => {
    if (!editGame) return;
    setSubmitting(true);
    try {
      await adminApi.updateGame(editGame.id, {
        name: editGame.name,
        provider: editGame.provider,
        category: editGame.category,
        rtp: editGame.rtp,
        max_win: editGame.max_win || editGame.maxWin,
        thumbnail_url: editGame.thumbnail_url || editGame.thumbnail,
        external_id: editGame.external_id,
      });
      setGames(prev => prev.map(g => g.id === editGame.id ? { ...editGame } : g));
      setEditGame(null);
      toast('게임 수정 완료');
    } catch {
      toast('게임 수정 실패');
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (game: GameItem) => {
    const newStatus = game.status === 'active' ? 'inactive' : 'active';
    if (newStatus === 'inactive' && !confirm(`"${game.name}" 게임을 비활성화 하시겠습니까?`)) return;
    try {
      if (newStatus === 'inactive') {
        await adminApi.deleteGame(game.id);
      } else {
        await adminApi.updateGame(game.id, { status: 'active' });
      }
      setGames(prev => prev.map(g => g.id === game.id ? { ...g, status: newStatus } : g));
      toast(newStatus === 'active' ? '게임 활성화 완료' : '게임 비활성화 완료');
    } catch {
      toast('상태 변경 실패');
    }
  };

  // Format numbers
  const fmtNum = (n?: number) => n != null ? n.toLocaleString() : '-';
  const fmtWon = (n?: number) => n != null ? `${(n / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}만` : '-';

  // Input field style (inline, matching other admin pages)
  const inputStyle = { background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' };
  const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors";

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 z-[100] px-5 py-2 rounded-full text-[11px] font-normal pointer-events-none"
          style={{ background: '#fff', color: '#0a0a0a', transform: 'translateX(-50%)', boxShadow: '0 4px 20px rgba(255,255,255,0.15)' }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-medium text-white">게임 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulk(true)}
            className="px-4 py-2 text-sm rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            일괄 등록
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors"
          >
            게임 추가
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '전체 게임', value: games.length.toLocaleString(), suffix: '개', color: '#42A5F5' },
          { label: '활성', value: activeCount.toLocaleString(), suffix: '개', color: '#4CAF50' },
          { label: '비활성', value: inactiveCount.toLocaleString(), suffix: '개', color: '#E53935' },
          { label: '프로바이더', value: providers.length.toLocaleString(), suffix: '개', color: '#AB47BC' },
        ].map((c, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-light uppercase tracking-wider" style={{ color: '#555' }}>{c.label}</p>
            <p className="text-2xl font-light mt-1" style={{ color: c.color }}>
              {c.value}<span className="text-xs font-light ml-1" style={{ color: '#555' }}>{c.suffix}</span>
            </p>
          </div>
        ))}
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
            placeholder="게임 이름, 프로바이더, External ID 검색..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
            style={inputStyle}
          />
        </div>
        <select
          value={filterProvider}
          onChange={e => setFilterProvider(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
          style={inputStyle}
        >
          <option value="all">전체 프로바이더</option>
          {providers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
          style={inputStyle}
        >
          <option value="all">전체 카테고리</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-white/50 text-sm">로딩 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/50 text-sm">검색 결과가 없습니다</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">게임</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">프로바이더</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">카테고리</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">RTP</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50">상태</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">플레이수</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">총 베팅</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">이윤</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/50">관리</th>
                </tr>
              </thead>
              <tbody>
                {pagedGames.map((g) => {
                  const stats = gameStats[g.id];
                  return (
                    <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/40">{g.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {(g.thumbnail || g.thumbnail_url) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={g.thumbnail_url || g.thumbnail} alt={g.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-white text-sm block truncate">{g.name}</span>
                            {g.external_id && (
                              <span className="text-[10px] text-white/30 block">{g.external_id}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{g.provider}</td>
                      <td className="px-4 py-3 text-white/60">{g.category}</td>
                      <td className="px-4 py-3 text-white/60">{g.rtp || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(g)}
                          className={`text-xs px-2 py-0.5 rounded-full ${g.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                          {g.status === 'active' ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-white/60">{fmtNum(stats?.play_count ?? g.play_count)}</td>
                      <td className="px-4 py-3 text-right text-white/60">{fmtWon(stats?.total_bet ?? g.total_bet)}</td>
                      <td className="px-4 py-3 text-right">
                        {(() => {
                          const profit = stats?.total_profit ?? g.total_profit;
                          if (profit == null) return <span className="text-white/40">-</span>;
                          return (
                            <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {profit >= 0 ? '+' : ''}{fmtWon(profit)}
                            </span>
                          );
                        })()}
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
                            onClick={() => handleToggleStatus(g)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${g.status === 'active' ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                          >
                            {g.status === 'active' ? '비활성화' : '활성화'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-light" style={{ color: '#555' }}>
              {filtered.length}개 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, filtered.length)}
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

      {/* === Add Game Modal === */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="게임 추가" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">게임 이름 *</label>
            <input
              type="text"
              value={addForm.name}
              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder="게임 이름"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">프로바이더 *</label>
              <input
                type="text"
                value={addForm.provider}
                onChange={e => setAddForm(f => ({ ...f, provider: e.target.value }))}
                placeholder="PG Soft, Pragmatic Play 등"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">카테고리</label>
              <select
                value={addForm.category}
                onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                className={inputClass}
                style={inputStyle}
              >
                <option value="slots">Slots</option>
                <option value="live">Live Casino</option>
                <option value="table">Table Games</option>
                <option value="crash">Crash</option>
                <option value="fishing">Fishing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">RTP</label>
              <input
                type="text"
                value={addForm.rtp}
                onChange={e => setAddForm(f => ({ ...f, rtp: e.target.value }))}
                placeholder="96.50%"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Max Win</label>
              <input
                type="text"
                value={addForm.max_win}
                onChange={e => setAddForm(f => ({ ...f, max_win: e.target.value }))}
                placeholder="x5000"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">썸네일 URL</label>
            <input
              type="text"
              value={addForm.thumbnail_url}
              onChange={e => setAddForm(f => ({ ...f, thumbnail_url: e.target.value }))}
              placeholder="https://..."
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">External ID</label>
            <input
              type="text"
              value={addForm.external_id}
              onChange={e => setAddForm(f => ({ ...f, external_id: e.target.value }))}
              placeholder="어그리게이터 게임 ID"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="w-full py-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            {submitting ? '추가 중...' : '게임 추가'}
          </button>
        </div>
      </Modal>

      {/* === Bulk Add Modal === */}
      <Modal isOpen={showBulk} onClose={() => { setShowBulk(false); setBulkError(''); }} title="게임 일괄 등록" size="lg">
        <div className="space-y-4">
          <p className="text-xs text-white/50">
            JSON 배열 형태로 게임 데이터를 입력하세요. 필수: name, provider
          </p>
          <div className="rounded-lg p-3" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-white/30 mb-2">예시:</p>
            <pre className="text-[11px] text-white/50 whitespace-pre-wrap">{`[
  { "name": "Sweet Bonanza", "provider": "Pragmatic Play", "category": "slots", "rtp": "96.48%", "max_win": "x21175", "external_id": "vs20fruitsw" },
  { "name": "Gates of Olympus", "provider": "Pragmatic Play", "category": "slots", "rtp": "96.50%", "max_win": "x5000", "external_id": "vs20olympgate" }
]`}</pre>
          </div>
          <textarea
            value={bulkJson}
            onChange={e => { setBulkJson(e.target.value); setBulkError(''); }}
            placeholder="JSON 배열을 붙여넣으세요..."
            rows={10}
            className="w-full px-4 py-3 rounded-lg text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
            style={inputStyle}
          />
          {bulkError && (
            <div className="text-xs text-red-400 px-1">{bulkError}</div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">
              {(() => {
                try {
                  const arr = JSON.parse(bulkJson);
                  return Array.isArray(arr) ? `${arr.length}개 게임` : '';
                } catch { return ''; }
              })()}
            </span>
            <button
              onClick={handleBulkAdd}
              disabled={submitting || !bulkJson.trim()}
              className="px-6 py-2.5 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              {submitting ? '등록 중...' : '일괄 등록'}
            </button>
          </div>
        </div>
      </Modal>

      {/* === Edit Game Modal === */}
      <Modal isOpen={!!editGame} onClose={() => setEditGame(null)} title={`게임 수정 - ${editGame?.name || ''}`} size="md">
        {editGame && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">게임 이름</label>
              <input
                type="text"
                value={editGame.name}
                onChange={e => setEditGame(g => g ? { ...g, name: e.target.value } : null)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">프로바이더</label>
                <input
                  type="text"
                  value={editGame.provider}
                  onChange={e => setEditGame(g => g ? { ...g, provider: e.target.value } : null)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">카테고리</label>
                <select
                  value={editGame.category}
                  onChange={e => setEditGame(g => g ? { ...g, category: e.target.value } : null)}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="slots">Slots</option>
                  <option value="live">Live Casino</option>
                  <option value="table">Table Games</option>
                  <option value="crash">Crash</option>
                  <option value="fishing">Fishing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">RTP</label>
                <input
                  type="text"
                  value={editGame.rtp || ''}
                  onChange={e => setEditGame(g => g ? { ...g, rtp: e.target.value } : null)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Max Win</label>
                <input
                  type="text"
                  value={editGame.max_win || editGame.maxWin || ''}
                  onChange={e => setEditGame(g => g ? { ...g, max_win: e.target.value } : null)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">썸네일 URL</label>
              <input
                type="text"
                value={editGame.thumbnail_url || editGame.thumbnail || ''}
                onChange={e => setEditGame(g => g ? { ...g, thumbnail_url: e.target.value } : null)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">External ID</label>
              <input
                type="text"
                value={editGame.external_id || ''}
                onChange={e => setEditGame(g => g ? { ...g, external_id: e.target.value } : null)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            {/* Game stats in edit modal */}
            {gameStats[editGame.id] && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                <div className="p-3 rounded-lg" style={{ background: '#0a0a0a' }}>
                  <p className="text-[10px] font-light uppercase tracking-wider mb-1" style={{ color: '#555' }}>플레이수</p>
                  <p className="text-sm font-light text-white">{fmtNum(gameStats[editGame.id].play_count)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: '#0a0a0a' }}>
                  <p className="text-[10px] font-light uppercase tracking-wider mb-1" style={{ color: '#555' }}>총 베팅</p>
                  <p className="text-sm font-light text-white">{fmtWon(gameStats[editGame.id].total_bet)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: '#0a0a0a' }}>
                  <p className="text-[10px] font-light uppercase tracking-wider mb-1" style={{ color: '#555' }}>이윤</p>
                  <p className={`text-sm font-light ${gameStats[editGame.id].total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {gameStats[editGame.id].total_profit >= 0 ? '+' : ''}{fmtWon(gameStats[editGame.id].total_profit)}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleEditSave}
              disabled={submitting}
              className="w-full py-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
