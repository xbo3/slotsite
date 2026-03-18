'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { DEMO_GAMES } from '@/lib/gameData';
import { useLang } from '@/hooks/useLang';

// ===== Dummy Game Data =====
const PROVIDER_LIST = ['Pragmatic Play', 'PG Soft', 'Evolution', 'NetEnt', 'Microgaming', "Play'n GO", 'Nolimit City', 'Red Tiger', 'Big Time Gaming'] as const;

interface Game {
  id: string;
  name: string;
  provider: string;
  category: string;
  rtp: number;
  isHot: boolean;
  isNew: boolean;
  maxWin: string;
  thumbnail?: string;
}

const GAMES: Game[] = [
  { id: 'gates-of-olympus', name: 'Gates of Olympus', provider: 'Pragmatic Play', category: 'SLOT', rtp: 96.5, isHot: true, isNew: false, maxWin: 'x5000' },
  { id: 'sweet-bonanza', name: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'SLOT', rtp: 96.48, isHot: true, isNew: false, maxWin: 'x21100' },
  { id: 'starlight-princess', name: 'Starlight Princess', provider: 'Pragmatic Play', category: 'SLOT', rtp: 96.5, isHot: true, isNew: false, maxWin: 'x5000' },
  { id: 'sugar-rush', name: 'Sugar Rush', provider: 'Pragmatic Play', category: 'SLOT', rtp: 96.5, isHot: false, isNew: true, maxWin: 'x5000' },
  { id: 'big-bass-bonanza', name: 'Big Bass Bonanza', provider: 'Pragmatic Play', category: 'SLOT', rtp: 96.71, isHot: false, isNew: false, maxWin: 'x2100' },
  { id: 'wild-west-gold', name: 'Wild West Gold', provider: 'Pragmatic Play', category: 'SLOT', rtp: 96.51, isHot: false, isNew: false, maxWin: 'x10000' },
  { id: 'fortune-tiger', name: 'Fortune Tiger', provider: 'PG Soft', category: 'SLOT', rtp: 96.81, isHot: true, isNew: false, maxWin: 'x2500' },
  { id: 'fortune-ox', name: 'Fortune Ox', provider: 'PG Soft', category: 'SLOT', rtp: 96.75, isHot: true, isNew: false, maxWin: 'x1000' },
  { id: 'fortune-rabbit', name: 'Fortune Rabbit', provider: 'PG Soft', category: 'SLOT', rtp: 96.75, isHot: false, isNew: true, maxWin: 'x1000' },
  { id: 'mahjong-ways', name: 'Mahjong Ways', provider: 'PG Soft', category: 'SLOT', rtp: 96.95, isHot: false, isNew: false, maxWin: 'x5000' },
  { id: 'lucky-neko', name: 'Lucky Neko', provider: 'PG Soft', category: 'SLOT', rtp: 96.72, isHot: false, isNew: false, maxWin: 'x6500' },
  { id: 'ganesha-gold', name: 'Ganesha Gold', provider: 'PG Soft', category: 'SLOT', rtp: 96.74, isHot: false, isNew: false, maxWin: 'x3000' },
  { id: 'crazy-time', name: 'Crazy Time', provider: 'Evolution', category: 'LIVE_CASINO', rtp: 95.5, isHot: true, isNew: false, maxWin: 'x25000' },
  { id: 'lightning-roulette', name: 'Lightning Roulette', provider: 'Evolution', category: 'LIVE_CASINO', rtp: 97.3, isHot: true, isNew: false, maxWin: 'x500' },
  { id: 'monopoly-live', name: 'Monopoly Live', provider: 'Evolution', category: 'LIVE_CASINO', rtp: 96.23, isHot: false, isNew: false, maxWin: 'x10000' },
  { id: 'dream-catcher', name: 'Dream Catcher', provider: 'Evolution', category: 'LIVE_CASINO', rtp: 96.58, isHot: false, isNew: true, maxWin: 'x7000' },
  { id: 'mega-ball', name: 'Mega Ball', provider: 'Evolution', category: 'LIVE_CASINO', rtp: 95.4, isHot: false, isNew: false, maxWin: 'x1000000' },
  { id: 'starburst', name: 'Starburst', provider: 'NetEnt', category: 'SLOT', rtp: 96.09, isHot: false, isNew: false, maxWin: 'x500' },
  { id: 'gonzo-quest', name: "Gonzo's Quest", provider: 'NetEnt', category: 'SLOT', rtp: 95.97, isHot: false, isNew: false, maxWin: 'x2500' },
  { id: 'dead-or-alive-2', name: 'Dead or Alive 2', provider: 'NetEnt', category: 'SLOT', rtp: 96.82, isHot: true, isNew: false, maxWin: 'x111111' },
  { id: 'divine-fortune', name: 'Divine Fortune', provider: 'NetEnt', category: 'SLOT', rtp: 96.59, isHot: false, isNew: false, maxWin: 'Jackpot' },
  { id: 'twin-spin', name: 'Twin Spin', provider: 'NetEnt', category: 'SLOT', rtp: 96.56, isHot: false, isNew: true, maxWin: 'x1080' },
  { id: 'immortal-romance', name: 'Immortal Romance', provider: 'Microgaming', category: 'SLOT', rtp: 96.86, isHot: false, isNew: false, maxWin: 'x12150' },
  { id: 'mega-moolah', name: 'Mega Moolah', provider: 'Microgaming', category: 'SLOT', rtp: 88.12, isHot: true, isNew: false, maxWin: 'Progressive' },
  { id: 'thunderstruck-2', name: 'Thunderstruck II', provider: 'Microgaming', category: 'SLOT', rtp: 96.65, isHot: false, isNew: false, maxWin: 'x8000' },
  { id: 'break-da-bank', name: 'Break da Bank Again', provider: 'Microgaming', category: 'SLOT', rtp: 95.43, isHot: false, isNew: false, maxWin: 'x1000' },
  { id: 'book-of-dead', name: 'Book of Dead', provider: "Play'n GO", category: 'SLOT', rtp: 96.21, isHot: true, isNew: false, maxWin: 'x5000' },
  { id: 'reactoonz', name: 'Reactoonz', provider: "Play'n GO", category: 'SLOT', rtp: 96.51, isHot: false, isNew: false, maxWin: 'x4570' },
  { id: 'fire-joker', name: 'Fire Joker', provider: "Play'n GO", category: 'SLOT', rtp: 96.15, isHot: false, isNew: true, maxWin: 'x800' },
  { id: 'moon-princess', name: 'Moon Princess', provider: "Play'n GO", category: 'SLOT', rtp: 96.5, isHot: false, isNew: false, maxWin: 'x5000' },
  // DEMO_GAMES (CDN 이미지 포함)
  ...DEMO_GAMES.map(dg => ({
    id: String(dg.id),
    name: dg.name,
    provider: dg.provider,
    category: dg.category === 'slots' ? 'SLOT' : dg.category.toUpperCase(),
    rtp: parseFloat(dg.rtp),
    isHot: dg.isHot,
    isNew: dg.isNew,
    maxWin: dg.maxWin,
    thumbnail: dg.thumbnail,
  })),
];

// Dummy recent plays (shown when "logged in" — always show for demo)
const RECENT_PLAYS: Game[] = [
  GAMES[0], // Gates of Olympus
  GAMES[6], // Fortune Tiger
  GAMES[12], // Crazy Time
  GAMES[19], // Dead or Alive 2
];

const PROVIDER_COLORS: Record<string, { from: string; to: string; emoji: string }> = {
  'Pragmatic Play': { from: '#42A5F5', to: '#64B5F6', emoji: '\uD83C\uDFB0' },
  'PG Soft': { from: '#888888', to: '#AAAAAA', emoji: '\uD83D\uDC2F' },
  'Evolution': { from: '#4CAF50', to: '#66BB6A', emoji: '\uD83C\uDFB2' },
  'NetEnt': { from: '#E53935', to: '#EF5350', emoji: '\uD83D\uDC8E' },
  'Microgaming': { from: '#AAAAAA', to: '#CCCCCC', emoji: '\uD83E\uDD81' },
  "Play'n GO": { from: '#42A5F5', to: '#64B5F6', emoji: '\uD83D\uDCD6' },
  'Nolimit City': { from: '#E53935', to: '#EF5350', emoji: '\uD83D\uDD25' },
  'Red Tiger': { from: '#FFB300', to: '#FFCA28', emoji: '\uD83D\uDC2F' },
  'Big Time Gaming': { from: '#AAAAAA', to: '#CCCCCC', emoji: '\uD83D\uDCA3' },
};

const ITEMS_PER_PAGE = 12;
const ITEMS_PER_LOAD = 6;

function getCardGradient(index: number, total: number): string {
  const hue = (index / total) * 360;
  const saturation = 60 + (index % 3) * 10;
  const lightness = 15 + (index % 3) * 3;
  const hue2 = hue + 30;
  return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%) 0%, hsl(${hue2}, ${saturation - 10}%, ${lightness + 5}%) 100%)`;
}

function GameThumbnail({ game, onImgError, className = '' }: { game: Game; onImgError?: () => void; className?: string }) {
  const colors = PROVIDER_COLORS[game.provider] || { from: '#42A5F5', to: '#64B5F6', emoji: '\uD83C\uDFB0' };

  if (game.thumbnail) {
    return (
      <div className={`w-full aspect-square relative overflow-hidden ${className}`}>
        <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover" loading="lazy" onError={onImgError} />
      </div>
    );
  }

  return (
    <div
      className={`w-full aspect-square flex flex-col items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
    >
      <span className="text-white font-medium text-xs md:text-sm text-center px-3 leading-tight max-w-[90%] truncate">{game.name}</span>
      <span className="text-white/50 text-[10px] mt-1">{game.provider}</span>
    </div>
  );
}

export default function LobbyPage() {
  const { t } = useLang();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-text-muted">{t('loading')}</div></div>}>
      <LobbyContent />
    </Suspense>
  );
}

function LobbyContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const providerParam = searchParams.get('provider');

  // Multi-select providers
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(() => {
    if (providerParam) {
      const match = PROVIDER_LIST.find(p => p.toLowerCase().replace(/['\s]/g, '') === providerParam.toLowerCase().replace(/['\s]/g, ''));
      if (match) return new Set([match]);
    }
    return new Set<string>();
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'rtp' | 'name'>('default');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // URL query sync
  useEffect(() => {
    if (providerParam) {
      const match = PROVIDER_LIST.find(p => p.toLowerCase().replace(/['\s]/g, '') === providerParam.toLowerCase().replace(/['\s]/g, ''));
      if (match) setSelectedProviders(new Set([match]));
    }
  }, [providerParam]);

  const toggleProvider = (p: string) => {
    setSelectedProviders(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const clearProviders = () => {
    setSelectedProviders(new Set());
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const filtered = useMemo(() => {
    let list = GAMES.filter(g => g.thumbnail && g.thumbnail.length > 0);
    if (selectedProviders.size > 0) {
      list = list.filter(g => selectedProviders.has(g.provider));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g => g.name.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q));
    }
    if (sortBy === 'rtp') list = [...list].sort((a, b) => b.rtp - a.rtp);
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [selectedProviders, search, sortBy]);

  const visibleGames = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_LOAD, filtered.length));
      setLoadingMore(false);
    }, 600);
  }, [hasMore, loadingMore, filtered.length]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [search, sortBy]);

  const hotGames = GAMES.filter(g => g.isHot);

  // Active filter chips
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  selectedProviders.forEach(p => {
    activeFilters.push({
      label: p,
      onRemove: () => toggleProvider(p),
    });
  });
  if (sortBy !== 'default') {
    activeFilters.push({
      label: sortBy === 'rtp' ? t('rtp_sort_label') : t('name_sort_label'),
      onRemove: () => setSortBy('default'),
    });
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-accent/5 via-dark-bg to-info/5">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-white rounded-full" />
            <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">{'\uD83C\uDFAE'} {t('game_lobby_title')}</h1>
          </div>
          <p className="text-text-secondary ml-5">
            <span className="text-white font-light">{GAMES.length}</span>{t('premium_games_waiting')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Recent Plays (Your Games) */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{'\u23F1\uFE0F'}</span>
            <h2 className="text-xl font-light text-white">{t('recent_play')}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-info/50 to-transparent ml-3" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {RECENT_PLAYS.map(game => (
              <RecentGameCard key={`recent-${game.id}`} game={game} />
            ))}
          </div>
        </div>

        {/* Hot Games */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{'\uD83D\uDD25'}</span>
            <h2 className="text-xl font-light text-white">{t('hot_games')}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-danger/50 to-transparent ml-3" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {hotGames.map(game => (
              <HotGameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-30 bg-dark-bg/95 backdrop-blur-xl pb-4 pt-2 -mx-4 px-4 border-b border-white/5">
          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('search_game_provider')}
              className="w-full pl-12 pr-4 py-3.5 bg-dark-card border border-white/5 rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                {'\u2715'}
              </button>
            )}
          </div>

          {/* Provider multi-select (checkbox style) */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {PROVIDER_LIST.map(p => {
              const isSelected = selectedProviders.has(p);
              return (
                <button
                  key={p}
                  onClick={() => toggleProvider(p)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-transparent text-white/50 hover:text-white border border-white/5'
                  }`}
                >
                  {/* Checkbox indicator */}
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] transition-all ${
                    isSelected ? 'border-black bg-black/20' : 'border-text-muted'
                  }`}>
                    {isSelected && '\u2713'}
                  </span>
                  {p}
                </button>
              );
            })}
            <div className="flex-shrink-0 border-l border-white/10 ml-2 pl-2 flex gap-2">
              {/* Sort select */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'default' | 'rtp' | 'name')}
                className="px-3 py-2 rounded-full text-xs font-medium bg-dark-card text-text-secondary border border-white/30 hover:border-white/60 focus:outline-none focus:border-white/30 cursor-pointer appearance-none pr-7 transition-all"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23557086' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                <option value="default">{t('default_sort')}</option>
                <option value="rtp">{t('rtp_sort')}</option>
                <option value="name">{t('name_sort')}</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map(f => (
                <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-full">
                  {f.label}
                  <button onClick={f.onRemove} className="hover:text-white transition-colors">{'\u2715'}</button>
                </span>
              ))}
              {activeFilters.length > 1 && (
                <button
                  onClick={() => { clearProviders(); setSortBy('default'); }}
                  className="px-3 py-1 text-xs text-text-muted hover:text-white transition-colors"
                >
                  {t('reset_all')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Game Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-text-secondary text-sm">
              {selectedProviders.size > 0 && (
                <span className="text-white font-medium">{Array.from(selectedProviders).join(', ')}</span>
              )}
              {selectedProviders.size > 0 && ' \u00B7 '}
              {filtered.length}{t('games_count_suffix')}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">{'\uD83C\uDFB0'}</div>
              <p className="text-text-secondary text-lg">{t('no_search_results')}</p>
              <button onClick={() => { setSearch(''); clearProviders(); }} className="mt-4 text-white hover:underline">
                {t('reset_filters')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {visibleGames.map((game, index) => (
                  <GameCard key={game.id} game={game} index={index} total={filtered.length} />
                ))}
              </div>

              {/* Infinite scroll loader */}
              {hasMore && (
                <div ref={loaderRef} className="mt-6">
                  {loadingMore && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                      {Array.from({ length: Math.min(ITEMS_PER_LOAD, filtered.length - visibleCount) }).map((_, i) => (
                        <SkeletonCard key={`skel-${i}`} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!hasMore && visibleGames.length > ITEMS_PER_PAGE && (
                <p className="text-center text-text-muted text-sm mt-8">
                  {t('all_games_loaded')} ({filtered.length})
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentGameCard({ game }: { game: Game }) {
  const { t } = useLang();
  const [imgError, setImgError] = useState(false);
  if (imgError) return null;
  return (
    <Link
      href={`/game/${game.id}`}
      className="snap-start flex-shrink-0 w-40 md:w-48 group"
    >
      <div className="relative rounded-2xl overflow-hidden border-2 border-info/30 group-hover:border-info transition-all shadow-lg shadow-info/10 group-hover:shadow-info/25">
        <GameThumbnail game={game} onImgError={() => setImgError(true)} className="group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-info text-white text-[10px] font-light rounded-full">
            {'\uD83D\uDD04'} {t('recent_label')}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-light text-sm truncate">{game.name}</p>
          <p className="text-text-secondary text-[11px]">{game.provider}</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <span className="text-white font-light text-lg tracking-wider">{'\u25B6'} PLAY</span>
        </div>
      </div>
    </Link>
  );
}

function HotGameCard({ game }: { game: Game }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) return null;
  return (
    <Link
      href={`/game/${game.id}`}
      className="snap-start flex-shrink-0 w-48 md:w-56 group"
    >
      <div className="relative rounded-2xl overflow-hidden border-2 border-danger/30 group-hover:border-danger transition-all shadow-lg shadow-danger/10 group-hover:shadow-danger/25">
        <GameThumbnail game={game} onImgError={() => setImgError(true)} className="group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-danger text-white text-[10px] font-light rounded-full uppercase tracking-wider animate-pulse">
            HOT
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 bg-dark-bg/60 text-white/70 text-[10px] font-light rounded-full">
            {game.maxWin}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-light text-sm truncate">{game.name}</p>
          <p className="text-text-secondary text-[11px]">{game.provider}</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <span className="text-white font-light text-lg tracking-wider">{'\u25B6'} PLAY</span>
        </div>
      </div>
    </Link>
  );
}

function GameCard({ game, index, total }: { game: Game; index: number; total: number }) {
  const { t } = useLang();
  const [imgError, setImgError] = useState(false);
  if (imgError) return null;
  return (
    <div className="group relative">
      <Link href={`/game/${game.id}`} className="block">
        <div className="relative overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-white/5 card-hover card-glow" style={{ borderRadius: '14px', background: getCardGradient(index, total) }}>
          {/* Thumbnail */}
          <div className="relative overflow-hidden">
            <GameThumbnail game={game} onImgError={() => setImgError(true)} className="group-hover:scale-[1.08] transition-transform duration-700" />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1 z-10">
              {game.isHot && (
                <span className="px-1.5 py-0.5 bg-danger text-white text-[9px] font-light rounded-md">{'\uD83D\uDD25'} HOT</span>
              )}
              {game.isNew && (
                <span className="px-1.5 py-0.5 bg-success text-dark-bg text-[9px] font-light rounded-md">NEW</span>
              )}
            </div>

            {/* Max Win */}
            <div className="absolute top-2 right-2 z-10">
              <span className="px-1.5 py-0.5 bg-dark-bg/70 text-white/70 text-[9px] font-light rounded-md backdrop-blur-sm">
                {game.maxWin}
              </span>
            </div>

            {/* Hover Overlay — play text + buttons */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <span className="text-white font-light text-lg tracking-wider mb-4">{'\u25B6'} PLAY</span>
              <div className="flex flex-col gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Link
                  href={`/game/${game.id}`}
                  onClick={e => e.stopPropagation()}
                  className="px-6 py-2 border border-white text-white font-light rounded-xl text-xs hover:bg-white hover:text-black transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>{'\u25B6'}</span> {t('real_play')}
                </Link>
                <Link
                  href={`/game/${game.id}?mode=demo`}
                  onClick={e => e.stopPropagation()}
                  className="px-6 py-2 border border-white/30 text-white/70 font-light rounded-xl text-xs hover:bg-white hover:text-black transition-all text-center"
                >
                  {t('free_trial')}
                </Link>
              </div>
            </div>

            {/* Game Info - overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
              <h3 className="text-white font-light text-sm truncate group-hover:text-white/80 transition-colors">{game.name}</h3>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-white/50 text-[11px]">{game.provider}</span>
                <span className="text-[11px] font-medium text-success/80">RTP {game.rtp}%</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
