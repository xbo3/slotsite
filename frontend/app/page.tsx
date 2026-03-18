'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { DEMO_GAMES } from '@/lib/gameData';
import { useLang } from '@/hooks/useLang';

// ===== Data =====
const PROVIDER_COLORS: Record<string, { from: string; to: string; pattern: string }> = {
  'Pragmatic Play': { from: '#42A5F5', to: '#64B5F6', pattern: 'svg-pattern-dots' },
  'PG Soft': { from: '#888888', to: '#AAAAAA', pattern: 'svg-pattern-grid' },
  'Evolution': { from: '#4CAF50', to: '#66BB6A', pattern: 'svg-pattern-diagonal' },
  'NetEnt': { from: '#E53935', to: '#EF5350', pattern: 'svg-pattern-circles' },
  'Microgaming': { from: '#555555', to: '#888888', pattern: 'svg-pattern-waves' },
  "Play'n GO": { from: '#42A5F5', to: '#64B5F6', pattern: 'svg-pattern-hexagon' },
  'Nolimit City': { from: '#E53935', to: '#EF5350', pattern: 'svg-pattern-dots' },
  'Red Tiger': { from: '#FFB300', to: '#FFCA28', pattern: 'svg-pattern-grid' },
  'Big Time Gaming': { from: '#555555', to: '#888888', pattern: 'svg-pattern-diagonal' },
};

const TOP_GAMES = DEMO_GAMES.slice(0, 8).filter(g => g.thumbnail && g.thumbnail.length > 0).map(g => ({
  id: g.id,
  name: g.name,
  provider: g.provider,
  maxWin: g.maxWin,
  thumbnail: g.thumbnail,
  rtp: g.rtp,
}));

const NEW_GAMES = DEMO_GAMES.filter(g => g.isNew && g.thumbnail && g.thumbnail.length > 0).map(g => ({
  id: g.id,
  name: g.name,
  provider: g.provider,
  maxWin: g.maxWin,
  thumbnail: g.thumbnail,
  rtp: g.rtp,
}));

const BANNER_SLIDES_KEYS = [
  {
    titleKey: 'first_deposit_bonus',
    highlightKey: 'up_to_200',
    descKey: 'first_deposit_desc',
    ctaKey: 'get_bonus',
    ctaHref: '/register',
  },
  {
    titleKey: 'daily_cashback',
    highlightKey: 'up_to_15',
    descKey: 'daily_cashback_desc',
    ctaKey: 'see_details',
    ctaHref: '/register',
  },
  {
    titleKey: 'vip_benefits',
    highlightKey: 'unlimited',
    descKey: 'vip_benefits_desc',
    ctaKey: 'view_vip_benefits',
    ctaHref: '/mypage',
  },
];

const BETTING_FEED_DATA = [
  { nick: 'lu**y', game: 'Gates of Olympus', amount: 2450000 },
  { nick: 'ki**g', game: 'Sweet Bonanza', amount: 890000 },
  { nick: 'pr**o', game: 'Mega Moolah', amount: 5200000 },
  { nick: 'wi**n', game: 'Fortune Tiger', amount: 340000 },
  { nick: 'go**d', game: 'Crazy Time', amount: 1750000 },
  { nick: 'st**r', game: 'Dead or Alive 2', amount: 4100000 },
  { nick: 'ac**e', game: 'Book of Dead', amount: 670000 },
  { nick: 'di**a', game: 'Lightning Roulette', amount: 1200000 },
  { nick: 'ro**k', game: 'Sugar Rush', amount: 8900000 },
  { nick: 'bl**e', game: 'Starlight Princess', amount: 560000 },
];

const BIG_WIN_DATA = [
  { nick: 'ro**k', game: 'Mega Moolah', amount: 89000000, time: '2시간 전' },
  { nick: 'pr**o', game: 'Gates of Olympus', amount: 52000000, time: '5시간 전' },
  { nick: 'st**r', game: 'Dead or Alive 2', amount: 41000000, time: '8시간 전' },
];

const PROVIDER_LIST = ['Pragmatic Play', 'PG Soft', 'Evolution', 'NetEnt', 'Microgaming', "Play'n GO", 'Nolimit City', 'Red Tiger', 'Big Time Gaming'];

const LEADERBOARD_DATA = [
  { rank: 1, nick: 'ro**k', amount: 89000000, game: 'Mega Moolah' },
  { rank: 2, nick: 'pr**o', amount: 52000000, game: 'Gates of Olympus' },
  { rank: 3, nick: 'st**r', amount: 41000000, game: 'Dead or Alive 2' },
  { rank: 4, nick: 'go**d', amount: 28500000, game: 'Sweet Bonanza' },
  { rank: 5, nick: 'ki**g', amount: 21200000, game: 'Crazy Time' },
  { rank: 6, nick: 'lu**y', amount: 18900000, game: 'Fortune Tiger' },
  { rank: 7, nick: 'ac**e', amount: 15400000, game: 'Book of Dead' },
  { rank: 8, nick: 'di**a', amount: 12300000, game: 'Lightning Roulette' },
  { rank: 9, nick: 'bl**e', amount: 9800000, game: 'Starlight Princess' },
  { rank: 10, nick: 'wi**n', amount: 7600000, game: 'Sugar Rush' },
];

const popularGradients = [
  { border: '#FF6B35', glow: 'rgba(255,107,53,0.4)', overlay: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,71,87,0.2))', bg: 'linear-gradient(135deg, #c0392b, #e74c3c)' },
  { border: '#FF4757', glow: 'rgba(255,71,87,0.4)', overlay: 'linear-gradient(135deg, rgba(255,71,87,0.2), rgba(255,107,157,0.2))', bg: 'linear-gradient(135deg, #8e44ad, #9b59b6)' },
  { border: '#FF7F00', glow: 'rgba(255,127,0,0.4)', overlay: 'linear-gradient(135deg, rgba(255,127,0,0.2), rgba(255,69,0,0.2))', bg: 'linear-gradient(135deg, #e67e22, #f39c12)' },
  { border: '#FF2D55', glow: 'rgba(255,45,85,0.4)', overlay: 'linear-gradient(135deg, rgba(255,45,85,0.2), rgba(255,107,53,0.2))', bg: 'linear-gradient(135deg, #c0392b, #e74c3c)' },
  { border: '#FF416C', glow: 'rgba(255,65,108,0.4)', overlay: 'linear-gradient(135deg, rgba(255,65,108,0.2), rgba(255,75,43,0.2))', bg: 'linear-gradient(135deg, #d35400, #e74c3c)' },
  { border: '#F7971E', glow: 'rgba(247,151,30,0.4)', overlay: 'linear-gradient(135deg, rgba(247,151,30,0.2), rgba(255,210,0,0.2))', bg: 'linear-gradient(135deg, #f39c12, #f1c40f)' },
  { border: '#FF6B6B', glow: 'rgba(255,107,107,0.4)', overlay: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,230,109,0.2))', bg: 'linear-gradient(135deg, #e74c3c, #c0392b)' },
  { border: '#FC5C7D', glow: 'rgba(252,92,125,0.4)', overlay: 'linear-gradient(135deg, rgba(252,92,125,0.2), rgba(106,48,147,0.2))', bg: 'linear-gradient(135deg, #8e44ad, #6a3093)' },
];

const newGradients = [
  { border: '#00B4DB', glow: 'rgba(0,180,219,0.4)', overlay: 'linear-gradient(135deg, rgba(0,180,219,0.2), rgba(0,131,176,0.2))', bg: 'linear-gradient(135deg, #0083B0, #00B4DB)' },
  { border: '#667EEA', glow: 'rgba(102,126,234,0.4)', overlay: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', bg: 'linear-gradient(135deg, #667EEA, #764BA2)' },
  { border: '#4ECDC4', glow: 'rgba(78,205,196,0.4)', overlay: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(68,160,141,0.2))', bg: 'linear-gradient(135deg, #4ECDC4, #44A08D)' },
  { border: '#6A11CB', glow: 'rgba(106,17,203,0.4)', overlay: 'linear-gradient(135deg, rgba(106,17,203,0.2), rgba(37,117,252,0.2))', bg: 'linear-gradient(135deg, #6A11CB, #2575FC)' },
  { border: '#48C6EF', glow: 'rgba(72,198,239,0.4)', overlay: 'linear-gradient(135deg, rgba(72,198,239,0.2), rgba(111,134,214,0.2))', bg: 'linear-gradient(135deg, #48C6EF, #6F86D6)' },
  { border: '#89F7FE', glow: 'rgba(137,247,254,0.3)', overlay: 'linear-gradient(135deg, rgba(137,247,254,0.15), rgba(102,166,255,0.15))', bg: 'linear-gradient(135deg, #89F7FE, #66A6FF)' },
  { border: '#A8EDEA', glow: 'rgba(168,237,234,0.3)', overlay: 'linear-gradient(135deg, rgba(168,237,234,0.15), rgba(254,214,227,0.15))', bg: 'linear-gradient(135deg, #A8EDEA, #FED6E3)' },
  { border: '#5EE7DF', glow: 'rgba(94,231,223,0.4)', overlay: 'linear-gradient(135deg, rgba(94,231,223,0.2), rgba(180,144,202,0.2))', bg: 'linear-gradient(135deg, #5EE7DF, #B490CA)' },
];

// ===== Hook: Intersection Observer =====
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ===== Main Page =====
export default function Home() {
  const { t } = useLang();
  // Banner slider
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerAnim, setBannerAnim] = useState<'enter' | 'exit'>('enter');
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextBanner = useCallback(() => {
    setBannerAnim('exit');
    setTimeout(() => {
      setBannerIdx(prev => (prev + 1) % BANNER_SLIDES_KEYS.length);
      setBannerAnim('enter');
    }, 500);
  }, []);

  useEffect(() => {
    bannerTimerRef.current = setInterval(nextBanner, 5000);
    return () => { if (bannerTimerRef.current) clearInterval(bannerTimerRef.current); };
  }, [nextBanner]);

  // Betting feed
  const [feedIdx, setFeedIdx] = useState(0);
  const [feedAnim, setFeedAnim] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    const timer = setInterval(() => {
      setFeedAnim('exit');
      setTimeout(() => {
        setFeedIdx(prev => (prev + 1) % BETTING_FEED_DATA.length);
        setFeedAnim('enter');
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Online count
  const [onlineCount, setOnlineCount] = useState(2847);
  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * (3200 - 2500 + 1)) + 2500);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Section observers
  const feedSection = useInView();
  const popularSection = useInView();
  const newSection = useInView();
  const bigWinSection = useInView();
  const providerSection = useInView();
  const featureSection = useInView();
  const leaderboardSection = useInView();
  const ctaSection = useInView();

  const bannerKeys = BANNER_SLIDES_KEYS[bannerIdx];
  const feedItem = BETTING_FEED_DATA[feedIdx];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ===== Hero Banner ===== */}
      <section className="relative overflow-hidden h-64 md:h-[480px] hero-particles">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', animationDelay: '2s' }} />
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full animate-spin" style={{ border: '1px solid rgba(255,255,255,0.06)', animationDuration: '20s' }} />
        <div className="absolute bottom-20 left-20 w-20 h-20 rounded-full animate-spin" style={{ border: '1px solid rgba(255,255,255,0.05)', animationDuration: '15s', animationDirection: 'reverse' }} />

        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Left: Text */}
            <div className={`flex-1 text-center md:text-left ${bannerAnim === 'enter' ? 'banner-enter' : 'banner-exit'}`}>
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-2 md:mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FFFFFF' }} />
                <span className="text-sm font-light text-white/80">{t('now_playing_count').replace('{count}', onlineCount.toLocaleString())}</span>
              </div>

              <h1 className="text-2xl md:text-6xl lg:text-7xl font-extralight leading-[0.95] tracking-tight">
                <span className="text-white">{t(bannerKeys.titleKey)}</span>
                <br />
                <span className="text-white font-thin">
                  {t(bannerKeys.highlightKey)}
                </span>
              </h1>
              <p className="mt-2 md:mt-4 text-sm md:text-lg text-text-secondary max-w-lg leading-relaxed font-light">
                {t(bannerKeys.descKey)}
              </p>

              <div className="mt-4 md:mt-8 flex flex-col sm:flex-row gap-2 md:gap-3 justify-center md:justify-start">
                <Link
                  href={bannerKeys.ctaHref}
                  className="group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-2.5 md:py-3.5 text-sm md:text-lg font-light btn-cta"
                >
                  <span>{t(bannerKeys.ctaKey)}</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/lobby"
                  className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3.5 text-sm md:text-lg font-light transition-all hover:scale-105 active:scale-95"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}
                >
                  {t('browse_games')}
                </Link>
              </div>

              {/* Banner dots */}
              <div className="flex gap-2 mt-6 justify-center md:justify-start">
                {BANNER_SLIDES_KEYS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setBannerAnim('exit'); setTimeout(() => { setBannerIdx(i); setBannerAnim('enter'); }, 500); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'w-6' : 'hover:bg-white/40'}`}
                    style={{ background: i === bannerIdx ? '#FFFFFF' : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
            </div>

            {/* Right: Tilted game cards (desktop only) */}
            <div className="hidden md:flex items-center justify-center flex-1 card-tilt">
              <div className="relative w-72 h-72 card-tilt-inner">
                {(TOP_GAMES.slice(0, 3)).map((game, i) => {
                  const colors = PROVIDER_COLORS[game.provider] || PROVIDER_COLORS['Pragmatic Play'];
                  const offsets = [
                    { x: -30, y: 20, rotate: -12 },
                    { x: 0, y: 0, rotate: 0 },
                    { x: 30, y: -20, rotate: 12 },
                  ];
                  const o = offsets[i];
                  return (
                    <div
                      key={game.name}
                      className="absolute top-1/2 left-1/2 w-40 h-52 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                      style={{
                        transform: `translate(-50%, -50%) translateX(${o.x}px) translateY(${o.y}px) rotate(${o.rotate}deg)`,
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                        zIndex: i === 1 ? 3 : i === 2 ? 2 : 1,
                      }}
                    >
                      <div className={`absolute inset-0 ${colors.pattern}`} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                        <span className="text-white font-light text-lg text-center drop-shadow-lg leading-tight">{game.name}</span>
                        <span className="text-white/70 text-xs mt-2 font-light">{game.provider}</span>
                        <span className="mt-3 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-light">{game.maxWin}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Coin Support Strip Banner ===== */}
      <section className="w-full" style={{ background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 50%, #111111 100%)' }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between gap-2 md:gap-4 overflow-hidden">
          {/* Left: Tether logo + Text */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-0">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#26A17B' }}>
              <span className="text-white text-sm md:text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>T</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-light text-xs md:text-base tracking-wide truncate">
                {t('coin_support_title')}
              </p>
            </div>
          </div>

          {/* Center: Coin icons — Desktop (8 + "+8") */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* BTC */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: '#F7931A' }}>B</div>
            {/* ETH */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: '#627EEA' }}>E</div>
            {/* USDT — emphasized */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white" style={{ background: '#26A17B', border: '2px solid rgba(38,161,123,0.5)', boxShadow: '0 0 8px rgba(38,161,123,0.4)' }}>T</div>
            {/* BNB */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: '#F3BA2F' }}>B</div>
            {/* SOL */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: '#9945FF' }}>S</div>
            {/* XRP */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: '#23292F' }}>X</div>
            {/* ADA */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: '#0033AD' }}>A</div>
            {/* DOGE */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: '#C2A633' }}>D</div>
            <span className="text-white/40 text-xs font-thin">+8</span>
          </div>

          {/* Mobile: 5 coins + "+11" */}
          <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium text-white" style={{ background: '#F7931A' }}>B</div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium text-white" style={{ background: '#627EEA' }}>E</div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: '#26A17B', border: '2px solid rgba(38,161,123,0.5)', boxShadow: '0 0 6px rgba(38,161,123,0.4)' }}>T</div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium text-white" style={{ background: '#F3BA2F' }}>B</div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium text-white" style={{ background: '#9945FF' }}>S</div>
            <span className="text-white/40 text-[10px] font-thin">+11</span>
          </div>

          {/* Right: CTA */}
          <Link href="/wallet" className="flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-light tracking-widest uppercase transition-all border border-white/30 text-white hover:bg-white hover:text-black rounded-none min-h-[44px] flex items-center">
            {t('deposit')}
          </Link>
        </div>
      </section>

      {/* ===== Live Betting Feed ===== */}
      <div ref={feedSection.ref} className={feedSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="bg-dark-card/50 border border-white/5 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-4 overflow-hidden">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
              <span className="text-xs font-light text-text-muted uppercase tracking-wider">LIVE</span>
            </div>
            <div className={`flex-1 flex items-center gap-3 ${feedAnim === 'enter' ? 'feed-enter' : 'feed-exit'}`}>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-dark-elevated flex items-center justify-center text-xs font-light text-text-secondary flex-shrink-0">
                {feedItem.nick.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm font-light">
                  <span className="font-medium">{feedItem.nick}</span>
                  <span className="text-text-muted">{t('nim')} </span>
                  <span className="font-light" style={{ color: '#42A5F5' }}>{feedItem.game}</span>
                  <span className="text-text-muted"> {t('at_game')} </span>
                  <span className={`font-medium text-white`}>
                    {feedItem.amount >= 1000000 ? '\uD83D\uDD25 ' : ''}
                    ${feedItem.amount.toLocaleString()}
                  </span>
                  <span className="text-text-muted"> {t('won')}</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== Popular Games ===== */}
      <div ref={popularSection.ref} className={popularSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          {/* 보라 악센트 그라디언트 라인 */}
          <div className="h-[2px] mb-4 md:mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #9945FF, transparent)' }} />
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #9945FF, rgba(153,69,255,0.3))' }} />
              <div>
                <h2 className="text-lg md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                  <span className="text-lg md:text-2xl">{'\uD83D\uDD25'}</span> {t('popular_games_icon')}
                </h2>
                <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-light">{t('top8_realtime')}</p>
              </div>
            </div>
            <Link
              href="/lobby"
              className="hidden md:flex items-center gap-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-text-secondary hover:text-white text-sm font-light transition-all"
            >
              {t('view_all')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {TOP_GAMES.map((game, i) => (
              <PGStyleCard key={game.id} game={game} gradient={popularGradients[i % popularGradients.length]} />
            ))}
          </div>

          <div className="mt-4 md:mt-6 text-center md:hidden">
            <Link href="/lobby" className="inline-flex items-center gap-1 text-white font-light hover:underline">
              {t('view_all_games_arrow')} {'\u2192'}
            </Link>
          </div>
        </section>
      </div>

      {/* ===== New Games ===== */}
      <div ref={newSection.ref} className={newSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          {/* 귤/오렌지 악센트 그라디언트 라인 */}
          <div className="h-[2px] mb-4 md:mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #F7931A, transparent)' }} />
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #F7931A, rgba(247,147,26,0.3))' }} />
            <div>
              <h2 className="text-lg md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                <span className="text-lg md:text-2xl">{'\u2B50'}</span> {t('new_games_icon')}
              </h2>
              <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-light">{t('new_hot_games')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {NEW_GAMES.slice(0, 8).map((game, i) => (
              <PGStyleCard key={game.id} game={game} gradient={newGradients[i % newGradients.length]} />
            ))}
          </div>
        </section>
      </div>

      {/* ===== BIG WIN ===== */}
      <div ref={bigWinSection.ref} className={bigWinSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFFFFF, rgba(255,255,255,0.3))' }} />
            <div>
              <h2 className="text-lg md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                <span className="text-lg md:text-2xl">{'\uD83C\uDFC6'}</span> {t('big_win_title')}
              </h2>
              <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-light">{t('recent_big_winners')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {BIG_WIN_DATA.map((win, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.03] via-dark-card to-dark-card border border-white/10 p-4 md:p-6 hover:border-white/20 transition-all card-hover">
                <div className="absolute top-3 right-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-light ${i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : 'rank-bronze'}`}>
                    #{i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-light text-base md:text-lg">
                    {win.nick.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-light text-sm md:text-base">{win.nick}</p>
                    <p className="text-text-muted text-xs font-light">{win.time}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-xs md:text-sm font-light mb-1 md:mb-2">{win.game}</p>
                <p className="text-xl md:text-3xl font-extralight shimmer-white">
                  ${win.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Provider Logos ===== */}
      <div ref={providerSection.ref} className={providerSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          <h3 className="text-center text-text-muted text-xs md:text-sm font-light uppercase tracking-wider mb-4 md:mb-6">{t('official_providers')}</h3>
          <div className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-dark-bg to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-bg to-transparent z-10" />
            <div className="flex provider-scroll">
              {[...PROVIDER_LIST, ...PROVIDER_LIST].map((p, i) => {
                const colors = PROVIDER_COLORS[p];
                return (
                  <Link key={`${p}-${i}`} href={`/lobby?provider=${encodeURIComponent(p)}`} className="flex-shrink-0 mx-6 flex items-center gap-2 py-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
                      <span className="text-white font-light text-xs">{p.charAt(0)}</span>
                    </div>
                    <span className="text-text-secondary text-sm font-light whitespace-nowrap">{p}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ===== Features ===== */}
      <div ref={featureSection.ref} className={featureSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            <FeatureCard
              title={t('300_premium_games')}
              description={t('300_premium_games_desc')}
              icon={<SlotIcon />}
              gradient="from-white/[0.03] to-transparent"
            />
            <FeatureCard
              title={t('instant_deposit_withdraw')}
              description={t('instant_deposit_desc')}
              icon={<BoltIcon />}
              gradient="from-white/[0.03] to-transparent"
            />
            <FeatureCard
              title={t('vip_bonus')}
              description={t('vip_bonus_desc')}
              icon={<CrownIcon />}
              gradient="from-white/[0.03] to-transparent"
            />
          </div>
        </section>
      </div>

      {/* ===== Leaderboard ===== */}
      <div ref={leaderboardSection.ref} className={leaderboardSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFFFFF, rgba(255,255,255,0.3))' }} />
            <div>
              <h2 className="text-lg md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                {'\uD83C\uDFC6'} {t('weekly_top10')}
              </h2>
              <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-light">{t('most_winners')}</p>
            </div>
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-card/80">
                  <th className="text-left px-6 py-4 text-xs font-light text-text-muted uppercase tracking-wider">{t('rank')}</th>
                  <th className="text-left px-6 py-4 text-xs font-light text-text-muted uppercase tracking-wider">{t('nickname_col')}</th>
                  <th className="text-left px-6 py-4 text-xs font-light text-text-muted uppercase tracking-wider">{t('game_col')}</th>
                  <th className="text-right px-6 py-4 text-xs font-light text-text-muted uppercase tracking-wider">{t('win_amount')}</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD_DATA.map((row) => (
                  <tr
                    key={row.rank}
                    className={`border-t border-white/5 transition-colors hover:bg-white/[0.02] ${
                      row.rank === 1 ? 'bg-white/[0.03]' : row.rank === 2 ? 'bg-white/[0.02]' : row.rank === 3 ? 'bg-white/[0.01]' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light ${
                        row.rank === 1 ? 'rank-gold' : row.rank === 2 ? 'rank-silver' : row.rank === 3 ? 'rank-bronze' : 'bg-dark-elevated text-white'
                      }`}>
                        #{row.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dark-elevated flex items-center justify-center text-xs font-light text-text-secondary">
                          {row.nick.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-light text-sm">{row.nick}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm font-light">{row.game}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-light text-sm text-white">
                        ${row.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card List */}
          <div className="md:hidden space-y-1.5">
            {LEADERBOARD_DATA.map((row) => (
              <div
                key={row.rank}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                  row.rank === 1 ? 'bg-white/[0.03] border-white/15' :
                  row.rank === 2 ? 'bg-white/[0.02] border-white/10' :
                  row.rank === 3 ? 'bg-white/[0.01] border-white/8' :
                  'bg-dark-card border-white/5'
                }`}
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-light flex-shrink-0 ${
                  row.rank === 1 ? 'rank-gold' : row.rank === 2 ? 'rank-silver' : row.rank === 3 ? 'rank-bronze' : 'bg-dark-elevated text-white'
                }`}>
                  #{row.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-light text-sm">{row.nick}</span>
                    <span className="font-light text-sm text-white">
                      ${row.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5 font-light">{row.game}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== CTA Section ===== */}
      <div ref={ctaSection.ref} className={ctaSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }} />
          <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-24 text-center">
            <h2 className="text-xl md:text-5xl font-extralight text-white leading-tight tracking-wide">
              {t('join_now_and')}
              <br />
              <span className="font-thin text-white">{t('get_special_bonus')}</span>
            </h2>
            <p className="mt-2 md:mt-4 text-text-secondary text-sm md:text-lg font-light">
              {t('new_member_bonus')} <span className="font-light text-white">{t('up_to_200_bonus')}</span> {t('bonus_given')}
            </p>
            <Link
              href="/register"
              className="mt-6 md:mt-10 inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-4 text-sm md:text-lg font-light btn-cta"
            >
              {t('join_now')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ===== PGStyleCard Component =====
function PGStyleCard({ game, gradient }: { game: { id: number | string; name: string; provider: string; thumbnail?: string; rtp?: string; maxWin?: string }; gradient: { border: string; glow: string; overlay: string; bg: string } }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const cardH = isMobile ? 220 : 360;
  const imgH = isMobile ? 220 : 250; // 모바일: 이미지가 카드 전체 채움
  const btnH = isMobile ? 32 : 44;
  const showButtons = isMobile || isHovered;

  if (imgError || !game.thumbnail) return null;

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/game/${game.id}`}>
        <div className="relative overflow-hidden transition-all duration-300" style={{
          height: `${cardH}px`, borderRadius: isMobile ? '10px' : '14px',
          border: `2px solid ${gradient.border}`,
          boxShadow: isHovered && !isMobile ? `0 30px 20px -20px rgba(14,6,23,0.3), 0 0 20px ${gradient.glow}` : '0 4px 15px rgba(0,0,0,0.3)',
          transform: isHovered && !isMobile ? 'translateY(-15px)' : 'translateY(0)',
        }}>
          {/* Top: Game cover image */}
          <div className="relative w-full" style={{ height: `${imgH}px` }}>
            <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          </div>
          {/* Reflection — 작게 */}
          <div className="absolute w-full pointer-events-none" style={{
            height: '60px', top: `${imgH}px`, left: 0,
            backgroundImage: `url(${game.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center bottom',
            transform: 'rotate(180deg) scaleX(-1)',
            maskImage: 'linear-gradient(to bottom, transparent 30%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 30%, black 100%)',
            opacity: 0.15, zIndex: 1,
          }} />
          {/* Bottom gradient */}
          <div className="absolute w-full bottom-0 left-0" style={{ height: `calc(100% - ${imgH}px)`, background: gradient.bg, zIndex: 2 }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: gradient.overlay, zIndex: 3 }} />
          {/* Game info — 컴팩트 + 반투명 배경 */}
          <div className="absolute w-full left-0 bottom-0" style={{ zIndex: 5 }}>
            <div style={{ padding: isMobile ? '8px 10px' : '12px 16px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
              <p className={`text-white font-medium leading-tight truncate ${isMobile ? 'text-[11px]' : 'text-sm'}`}>{game.name}</p>
              <p className={`text-white/60 font-light ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>{game.provider}</p>
              <div className={`flex justify-between ${isMobile ? 'mt-1' : 'mt-2'}`}>
                <span className={`text-white/80 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>{game.rtp} RTP</span>
                <span className={`text-white/80 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>{game.maxWin}</span>
              </div>
            </div>
          </div>
          {/* Buttons - always visible on mobile, hover on desktop */}
          <div className="absolute w-full flex transition-all duration-300" style={{
            height: `${btnH}px`, bottom: showButtons ? '0px' : `-${btnH}px`, left: 0,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 10,
          }}>
            <span className="flex-1 flex items-center justify-center text-white text-[10px] md:text-sm font-light hover:bg-white/10 min-h-[44px]">TRY FREE</span>
            <span className="flex-1 flex items-center justify-center text-white text-[10px] md:text-sm font-light hover:bg-white/10 border-l border-white/10 min-h-[44px]">PLAY NOW</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ===== Feature Card =====
function FeatureCard({ title, description, icon, gradient }: { title: string; description: string; icon: JSX.Element; gradient: string }) {
  return (
    <div className={`relative rounded-2xl p-4 md:p-8 border border-white/5 hover:border-white/15 transition-all duration-300 bg-gradient-to-br ${gradient} bg-dark-card overflow-hidden group card-hover`}>
      <div className="absolute -right-4 -top-4 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 md:mb-4 text-white">
        {icon}
      </div>
      <h3 className="text-base md:text-xl font-light text-white mb-1.5 md:mb-2">{title}</h3>
      <p className="text-text-secondary text-xs md:text-sm leading-relaxed font-light">{description}</p>
    </div>
  );
}

// ===== SVG Icons for Features =====
function SlotIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M8 4v16M16 4v16M2 12h20" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-5 4-5-4-5 4-5-4z" />
      <path d="M5 16h14v2H5z" />
    </svg>
  );
}
