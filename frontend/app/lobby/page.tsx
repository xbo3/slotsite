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

// Dummy recent plays (kept for future use)
// const RECENT_PLAYS: Game[] = [
//   GAMES[0], GAMES[6], GAMES[12], GAMES[19],
// ];

const ITEMS_PER_PAGE = 12;
const ITEMS_PER_LOAD = 8;

// ===== Gradient Palettes =====
const hotGradients = [
  { border: '#FF6B35', glow: 'rgba(255,107,53,0.4)', overlay: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,71,87,0.2))', bg: 'linear-gradient(135deg, #c0392b, #e74c3c)' },
  { border: '#FF4757', glow: 'rgba(255,71,87,0.4)', overlay: 'linear-gradient(135deg, rgba(255,71,87,0.2), rgba(255,107,157,0.2))', bg: 'linear-gradient(135deg, #8e44ad, #9b59b6)' },
  { border: '#FF7F00', glow: 'rgba(255,127,0,0.4)', overlay: 'linear-gradient(135deg, rgba(255,127,0,0.2), rgba(255,69,0,0.2))', bg: 'linear-gradient(135deg, #e67e22, #f39c12)' },
  { border: '#FF2D55', glow: 'rgba(255,45,85,0.4)', overlay: 'linear-gradient(135deg, rgba(255,45,85,0.2), rgba(255,107,53,0.2))', bg: 'linear-gradient(135deg, #c0392b, #e74c3c)' },
  { border: '#FF416C', glow: 'rgba(255,65,108,0.4)', overlay: 'linear-gradient(135deg, rgba(255,65,108,0.2), rgba(255,75,43,0.2))', bg: 'linear-gradient(135deg, #d35400, #e74c3c)' },
  { border: '#F7971E', glow: 'rgba(247,151,30,0.4)', overlay: 'linear-gradient(135deg, rgba(247,151,30,0.2), rgba(255,210,0,0.2))', bg: 'linear-gradient(135deg, #f39c12, #f1c40f)' },
  { border: '#FF6B6B', glow: 'rgba(255,107,107,0.4)', overlay: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,230,109,0.2))', bg: 'linear-gradient(135deg, #e74c3c, #c0392b)' },
  { border: '#FC5C7D', glow: 'rgba(252,92,125,0.4)', overlay: 'linear-gradient(135deg, rgba(252,92,125,0.2), rgba(106,48,147,0.2))', bg: 'linear-gradient(135deg, #8e44ad, #6a3093)' },
];

const coldGradients = [
  { border: '#00B4DB', glow: 'rgba(0,180,219,0.4)', overlay: 'linear-gradient(135deg, rgba(0,180,219,0.2), rgba(0,131,176,0.2))', bg: 'linear-gradient(135deg, #0083B0, #00B4DB)' },
  { border: '#667EEA', glow: 'rgba(102,126,234,0.4)', overlay: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', bg: 'linear-gradient(135deg, #667EEA, #764BA2)' },
  { border: '#4ECDC4', glow: 'rgba(78,205,196,0.4)', overlay: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(68,160,141,0.2))', bg: 'linear-gradient(135deg, #4ECDC4, #44A08D)' },
  { border: '#6A11CB', glow: 'rgba(106,17,203,0.4)', overlay: 'linear-gradient(135deg, rgba(106,17,203,0.2), rgba(37,117,252,0.2))', bg: 'linear-gradient(135deg, #6A11CB, #2575FC)' },
  { border: '#48C6EF', glow: 'rgba(72,198,239,0.4)', overlay: 'linear-gradient(135deg, rgba(72,198,239,0.2), rgba(111,134,214,0.2))', bg: 'linear-gradient(135deg, #48C6EF, #6F86D6)' },
  { border: '#89F7FE', glow: 'rgba(137,247,254,0.3)', overlay: 'linear-gradient(135deg, rgba(137,247,254,0.15), rgba(102,166,255,0.15))', bg: 'linear-gradient(135deg, #89F7FE, #66A6FF)' },
  { border: '#A8EDEA', glow: 'rgba(168,237,234,0.3)', overlay: 'linear-gradient(135deg, rgba(168,237,234,0.15), rgba(254,214,227,0.15))', bg: 'linear-gradient(135deg, #A8EDEA, #FED6E3)' },
  { border: '#5EE7DF', glow: 'rgba(94,231,223,0.4)', overlay: 'linear-gradient(135deg, rgba(94,231,223,0.2), rgba(180,144,202,0.2))', bg: 'linear-gradient(135deg, #5EE7DF, #B490CA)' },
];

interface GradientStyle {
  border: string;
  glow: string;
  overlay: string;
  bg: string;
}

function getAllGameGradient(index: number, total: number): GradientStyle {
  const hue = (index / total) * 360;
  const sat = 60 + (index % 3) * 10;
  const light = 20 + (index % 3) * 3;
  const hue2 = hue + 30;
  return {
    border: `hsl(${hue}, ${sat}%, ${light + 20}%)`,
    glow: `hsla(${hue}, ${sat}%, ${light + 20}%, 0.3)`,
    overlay: `linear-gradient(135deg, hsla(${hue}, ${sat}%, ${light}%, 0.2), hsla(${hue2}, ${sat - 10}%, ${light + 5}%, 0.2))`,
    bg: `linear-gradient(135deg, hsl(${hue}, ${sat}%, ${light}%), hsl(${hue2}, ${sat - 10}%, ${light + 5}%))`,
  };
}

// ===== PGSoft Style Card =====
function PGStyleCard({ game, gradient, isMobile }: { game: Game; index?: number; gradient: GradientStyle; isMobile?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (imgError || !game.thumbnail) return null;

  const cardHeight = isMobile ? '220px' : '360px';
  const imgHeight = isMobile ? '220px' : '250px';  // 모바일: 이미지 전체 채움
  const infoHeight = isMobile ? '60px' : '110px';   // 모바일: 오버레이로
  const btnHeight = isMobile ? '32px' : '44px';
  const showButtons = isMobile || isHovered;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/game/${game.id}`}>
        <div
          className="relative overflow-hidden transition-all duration-300"
          style={{
            height: cardHeight,
            borderRadius: isMobile ? '10px' : '14px',
            border: `2px solid ${gradient.border}`,
            boxShadow: isHovered && !isMobile
              ? `0 30px 20px -20px rgba(14,6,23,0.3), 0 0 20px ${gradient.glow}`
              : '0 4px 15px rgba(0,0,0,0.3)',
            transform: isHovered && !isMobile ? 'translateY(-15px)' : 'translateY(0)',
          }}
        >
          {/* Top cover image */}
          <div className="relative w-full" style={{ height: imgHeight }}>
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>

          {/* 이미지 위 오버레이 없음 — 원본 이미지 그대로 */}

          {/* Game info panel — 컴팩트 + 반투명 배경으로 가독성 */}
          <div
            className="absolute w-full left-0 bottom-0 transition-all duration-300"
            style={{
              height: `calc(${infoHeight} + ${showButtons ? btnHeight : '0px'})`,
              zIndex: 5,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                padding: isMobile ? '8px 10px' : '12px 16px',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Game name + provider */}
              <p className={`text-white font-medium leading-tight truncate ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                {game.name}
              </p>
              <p className={`text-white/60 font-light ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>
                {game.provider}
              </p>

              {/* Stats — 한 줄로 컴팩트 */}
              <div className={`flex justify-between ${isMobile ? 'mt-1' : 'mt-2'}`}>
                <span className={`text-white/80 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>{game.rtp}% RTP</span>
                <span className={`text-white/80 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>{game.maxWin}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div
            className="absolute w-full flex transition-all duration-300"
            style={{
              height: btnHeight,
              bottom: showButtons ? '0px' : `-${btnHeight}`,
              left: 0,
              background: 'rgba(255,255,255,0.08)',
              zIndex: 10,
            }}
          >
            <Link
              href={`/game/${game.id}?mode=demo`}
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center text-white text-[10px] md:text-sm font-light hover:bg-white/10 transition-colors min-h-[44px]"
            >
              TRY FREE
            </Link>
            <Link
              href={`/game/${game.id}`}
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center text-white text-[10px] md:text-sm font-light hover:bg-white/10 transition-colors border-l border-white/10 min-h-[44px]"
            >
              PLAY NOW
            </Link>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ===== Mobile detection hook =====
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
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
  const isMobile = useIsMobile();

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

  // HOT games = isHot true + has thumbnail
  const hotGames = GAMES.filter(g => g.isHot && g.thumbnail && g.thumbnail.length > 0);
  // COLD games = isHot false + has thumbnail
  // COLD: isHot false 먼저, 부족하면 나머지에서 채워서 8개 맞춤
  const coldCandidates = GAMES.filter(g => !g.isHot && g.thumbnail && g.thumbnail.length > 0);
  const coldExtra = GAMES.filter(g => g.isHot && g.thumbnail && g.thumbnail.length > 0).slice(8); // HOT 8개 이후 나머지
  const coldGames = [...coldCandidates, ...coldExtra].slice(0, 8);

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
        <div className="relative max-w-7xl mx-auto px-4 py-5 md:py-12">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <div className="w-1.5 md:w-2 h-6 md:h-8 bg-white rounded-full" />
            <h1 className="text-xl md:text-4xl font-light text-white tracking-tight">{'\uD83C\uDFAE'} {t('game_lobby_title')}</h1>
          </div>
          <p className="text-text-secondary ml-4 md:ml-5 text-sm md:text-base">
            <span className="text-white font-light">{GAMES.length}</span>{t('premium_games_waiting')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* HOT Games - 2x4 Grid */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <span className="text-lg md:text-2xl">{'\uD83D\uDD25'}</span>
            <h2 className="text-base md:text-xl font-light text-white">HOT Games</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 to-transparent ml-2 md:ml-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {hotGames.slice(0, 8).map((game, index) => (
              <PGStyleCard key={game.id} game={game} index={index} gradient={hotGradients[index % 8]} isMobile={isMobile} />
            ))}
          </div>
        </div>

        {/* COLD Games - 2x4 Grid */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <span className="text-lg md:text-2xl">{'\u2744\uFE0F'}</span>
            <h2 className="text-base md:text-xl font-light text-white">COLD Games</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-blue-400/50 to-transparent ml-2 md:ml-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {coldGames.map((game, index) => (
              <PGStyleCard key={game.id} game={game} index={index} gradient={coldGradients[index % 8]} isMobile={isMobile} />
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

          {/* Provider multi-select */}
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {PROVIDER_LIST.map(p => {
              const isSelected = selectedProviders.has(p);
              return (
                <button
                  key={p}
                  onClick={() => toggleProvider(p)}
                  className={`flex-shrink-0 flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all min-h-[44px] ${
                    isSelected
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-transparent text-white/50 hover:text-white border border-white/5'
                  }`}
                >
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

        {/* All Games Grid (PGStyleCard) */}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                {visibleGames.map((game, index) => (
                  <PGStyleCard
                    key={game.id}
                    game={game}
                    index={index}
                    gradient={getAllGameGradient(index, filtered.length)}
                    isMobile={isMobile}
                  />
                ))}
              </div>

              {/* Infinite scroll loader */}
              {hasMore && (
                <div ref={loaderRef} className="mt-6">
                  {loadingMore && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
