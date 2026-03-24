/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { DEMO_GAMES } from '@/lib/gameData';
import { useLang } from '@/hooks/useLang';
import { useAuth } from '@/context/AuthContext';

// ===== Data =====
// PROVIDER_COLORS — kept for potential future use in game cards
// const PROVIDER_COLORS: Record<string, { from: string; to: string; pattern: string }> = { ... };

// 인기 게임 = Nolimit City HOT 게임 우선
const NLC_HOT = DEMO_GAMES.filter(g => g.provider === 'Nolimit City' && g.isHot && g.thumbnail).slice(0, 8);
const TOP_GAMES = NLC_HOT.map(g => ({
  id: g.id, name: g.name, provider: g.provider, maxWin: g.maxWin, thumbnail: g.thumbnail, rtp: g.rtp,
}));

// 신규 게임 = Nolimit City 신규 우선 + PG Soft 신규 보충
const NLC_NEW = DEMO_GAMES.filter(g => g.provider === 'Nolimit City' && g.isNew && g.thumbnail);
const PG_NEW = DEMO_GAMES.filter(g => g.provider === 'PG Soft' && g.isNew && g.thumbnail);
const NEW_GAMES = [...NLC_NEW, ...PG_NEW].slice(0, 8).map(g => ({
  id: g.id, name: g.name, provider: g.provider, maxWin: g.maxWin, thumbnail: g.thumbnail, rtp: g.rtp,
}));

const CAROUSEL_BANNERS = [
  {
    title: 'First Deposit 100% Bonus',
    desc: 'Double your first deposit instantly with crypto',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accent: '#4FC3F7',
    ctaHref: '/register',
  },
  {
    title: 'Slot Loan Bonus',
    desc: 'Get generous seeds! Borrow 70%, Pay Back Only 30%',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 50%, #1a1a2e 100%)',
    accent: '#CE93D8',
    ctaHref: '/register',
  },
  {
    title: 'Every Deposit Bonus',
    desc: '13% → 16% → 19% UP / After withdrawal, re-deposit starts at 10%',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #1b3a2d 50%, #1a2e1a 100%)',
    accent: '#81C784',
    ctaHref: '/wallet',
  },
];

const BETTING_FEED_DATA = [
  { nick: 'lu**y', game: 'Gates of Olympus', amount: 245 },
  { nick: 'ki**g', game: 'Sweet Bonanza', amount: 89 },
  { nick: 'pr**o', game: 'Mega Moolah', amount: 520 },
  { nick: 'wi**n', game: 'Fortune Tiger', amount: 34 },
  { nick: 'go**d', game: 'Crazy Time', amount: 175 },
  { nick: 'st**r', game: 'Dead or Alive 2', amount: 410 },
  { nick: 'ac**e', game: 'Book of Dead', amount: 67 },
  { nick: 'di**a', game: 'Lightning Roulette', amount: 120 },
  { nick: 'ro**k', game: 'Sugar Rush', amount: 890 },
  { nick: 'bl**e', game: 'Starlight Princess', amount: 56 },
];

const BIG_WIN_DATA = [
  { nick: 'ro**k', game: 'Mega Moolah', amount: 1850, time: '2시간 전' },
  { nick: 'pr**o', game: 'Gates of Olympus', amount: 920, time: '5시간 전' },
  { nick: 'st**r', game: 'Dead or Alive 2', amount: 460, time: '8시간 전' },
];

const PROVIDER_LIST = [
  { name: 'Pragmatic Play' },
  { name: 'PG Soft' },
  { name: 'Evolution' },
  { name: 'NetEnt' },
  { name: 'Microgaming' },
  { name: 'Nolimit City' },
  { name: 'Red Tiger' },
  { name: 'Big Time Gaming' },
  { name: 'Hacksaw' },
  { name: 'Habanero' },
  { name: 'BGaming' },
  { name: 'JILI' },
  { name: 'Spadegaming' },
  { name: 'BetSoft' },
  { name: 'Endorphina' },
  { name: 'Quickspin' },
  { name: 'Relax Gaming' },
  { name: 'Spinomenal' },
];

// 1등 $1,850 → 2등 50% → 3등 50% → 이후 ~10%씩 감소
const LEADERBOARD_DATA = [
  { rank: 1, nick: 'ro**k', amount: 1850, game: 'Mega Moolah' },
  { rank: 2, nick: 'pr**o', amount: 920, game: 'Gates of Olympus' },
  { rank: 3, nick: 'st**r', amount: 460, game: 'Dead or Alive 2' },
  { rank: 4, nick: 'go**d', amount: 415, game: 'Sweet Bonanza' },
  { rank: 5, nick: 'ki**g', amount: 370, game: 'Crazy Time' },
  { rank: 6, nick: 'lu**y', amount: 335, game: 'Fortune Tiger' },
  { rank: 7, nick: 'ac**e', amount: 300, game: 'Book of Dead' },
  { rank: 8, nick: 'di**a', amount: 270, game: 'Lightning Roulette' },
  { rank: 9, nick: 'bl**e', amount: 245, game: 'Starlight Princess' },
  { rank: 10, nick: 'wi**n', amount: 220, game: 'Sugar Rush' },
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
  const { user } = useAuth();
  const balance = user ? Number(user.balance) || 0 : 14287.50; // demo fallback
  // 3D Carousel
  const [carouselAngle, setCarouselAngle] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const carouselTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [carouselTz, setCarouselTz] = useState(320);

  useEffect(() => {
    const updateTz = () => setCarouselTz(window.innerWidth < 768 ? 200 : 320);
    updateTz();
    window.addEventListener('resize', updateTz);
    return () => window.removeEventListener('resize', updateTz);
  }, []);

  useEffect(() => {
    if (carouselPaused) return;
    carouselTimerRef.current = setInterval(() => {
      setCarouselAngle(prev => prev - 120);
    }, 4000);
    return () => { if (carouselTimerRef.current) clearInterval(carouselTimerRef.current); };
  }, [carouselPaused]);

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

  // Section observers
  const feedSection = useInView();
  const liveCasinoSection = useInView();
  const popularSection = useInView();
  const newSection = useInView();
  const bigWinSection = useInView();
  const providerSection = useInView();
  const featureSection = useInView();
  const leaderboardSection = useInView();
  const ctaSection = useInView();

  const feedItem = BETTING_FEED_DATA[feedIdx];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ===== Hero 3D Carousel Banner ===== */}
      <section className="relative overflow-hidden hero-particles" style={{ height: 'clamp(220px, 50vw, 480px)' }}>
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse hidden md:block" style={{ background: 'rgba(255,255,255,0.04)' }} />

        <div className="relative max-w-7xl mx-auto px-3 md:px-4 h-full flex items-center justify-center">
          {/* 3D Carousel */}
          <div
            className="carousel-3d-wrapper"
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
            style={{ perspective: '1200px', width: '100%', maxWidth: '900px', height: 'clamp(180px, 40vw, 360px)' }}
          >
            <div
              className="carousel-3d-track"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${carouselAngle}deg)`,
                transition: 'transform 1s cubic-bezier(0.45, 0.05, 0.55, 0.95)',
              }}
            >
              {CAROUSEL_BANNERS.map((banner, i) => {
                const angle = i * 120;
                const tz = carouselTz;
                return (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: `rotateY(${angle}deg) translateZ(${tz}px)`,
                      background: banner.gradient,
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-10 text-center">
                      <h2 className="text-lg md:text-4xl lg:text-5xl font-extralight text-white leading-tight tracking-tight">
                        {banner.title}
                      </h2>
                      <p className="mt-2 md:mt-4 text-xs md:text-base font-light max-w-md" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {banner.desc}
                      </p>
                      <Link
                        href={banner.ctaHref}
                        className="mt-3 md:mt-6 inline-flex items-center gap-2 px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm font-light btn-cta"
                      >
                        Get Started
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                    {/* Decorative accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: banner.accent }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {CAROUSEL_BANNERS.map((_, i) => {
              const currentIdx = Math.round((-carouselAngle % 360 + 360) % 360 / 120) % 3;
              return (
                <button
                  key={i}
                  onClick={() => setCarouselAngle(-i * 120)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentIdx ? 'w-6' : 'hover:bg-white/40'}`}
                  style={{ background: i === currentIdx ? '#FFFFFF' : 'rgba(255,255,255,0.2)' }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Mobile Balance Card ===== */}
      <div className="md:hidden px-3 -mt-2 mb-4 overflow-hidden">
        <div className="rounded-2xl p-3" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-text-muted text-xs font-light uppercase tracking-wider">{t('total_balance')}</p>
          <p className="text-white text-3xl font-light mt-1">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium text-white" style={{ background: '#B8860B' }}>{t('vip_gold')}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
              <div className="h-full rounded-full" style={{ width: '35%', background: 'linear-gradient(90deg, #B8860B, #DAA520)' }} />
            </div>
            <span className="text-[10px] text-text-muted font-light">35% {t('to_platinum')}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Link href="/wallet" className="flex-1 py-2.5 rounded-xl text-center text-xs font-light text-black" style={{ background: '#FFFFFF' }}>
              {t('deposit')}
            </Link>
            <Link href="/wallet" className="flex-1 py-2.5 rounded-xl text-center text-xs font-light text-white border border-white/20">
              {t('withdraw')}
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Coin Support Strip Banner ===== */}
      <section className="hidden md:block w-full" style={{ background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 50%, #111111 100%)' }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center justify-between gap-2 md:gap-4 overflow-hidden">
          {/* Left: Tether logo + Text */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0 min-w-0">
            <div className="w-7 md:w-10 h-7 md:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#26A17B' }}>
              <span className="text-white text-xs md:text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>T</span>
            </div>
            <div className="min-w-0">
              {/* Desktop: single line */}
              <p className="hidden md:block text-white font-light text-base tracking-wide truncate">
                {t('coin_support_title')}
              </p>
              {/* Mobile: two lines */}
              <p className="md:hidden text-white font-light text-[10px] leading-tight tracking-wide">
                <span className="block">{t('coin_mobile_line1')}</span>
                <span className="block text-white/60">{t('coin_mobile_line2')}</span>
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

          {/* Mobile: 4 coins + "+12" */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-medium text-white" style={{ background: '#F7931A' }}>B</div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-medium text-white" style={{ background: '#627EEA' }}>E</div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold text-white" style={{ background: '#26A17B', border: '1.5px solid rgba(38,161,123,0.5)', boxShadow: '0 0 4px rgba(38,161,123,0.4)' }}>T</div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-medium text-white" style={{ background: '#F3BA2F' }}>B</div>
            <span className="text-white/40 text-[9px] font-thin">+12</span>
          </div>

          {/* Right: CTA */}
          <Link href="/wallet" className="flex-shrink-0 px-2.5 md:px-4 py-1.5 md:py-2 text-[9px] md:text-xs font-light tracking-widest uppercase transition-all border border-white/30 text-white hover:bg-white hover:text-black rounded-none min-h-[36px] md:min-h-[44px] flex items-center">
            {t('deposit')}
          </Link>
        </div>
      </section>

      {/* ===== Live Casino (배너 바로 다음) ===== */}
      <div ref={liveCasinoSection.ref} className={liveCasinoSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #26A17B, rgba(38,161,123,0.3))' }} />
              <div>
                <h2 className="text-base md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                  <span className="text-base md:text-2xl">{'\uD83C\uDCCF'}</span> Live Casino
                </h2>
                <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-light">Real dealers, real-time games</p>
              </div>
            </div>
            <Link href="/lobby?cat=live" className="hidden md:flex items-center gap-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-text-secondary hover:text-white text-sm font-light transition-all">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-4">
            {[
              { name: 'Mega Roulette', dealer: 'Victoria M.', range: '$1 – $10K', img: 'MegaRoulette' },
              { name: 'Mega Baccarat', dealer: 'Yuki S.', range: '$5 – $50K', img: 'MegaBaccarat' },
              { name: 'Speed Roulette', dealer: 'James L.', range: '$1 – $5K', img: 'SpeedRoulette' },
              { name: 'Mega Sic Bo', dealer: 'Luna K.', range: '$2 – $20K', img: 'MegaSicBo' },
              { name: 'Dragon Tiger', dealer: 'Sarah K.', range: '$1 – $10K', img: 'DragonTigerLive' },
              { name: 'Baccarat', dealer: 'Emma W.', range: '$10 – $100K', img: 'Baccarat' },
            ].map((game) => (
              <Link key={game.name} href="/lobby?cat=live" className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/20 transition-all card-hover" style={{ background: '#111111' }}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://cdn.softswiss.net/i/s3/pragmaticexternal/${game.img}.png`} alt={game.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </div>
                </div>
                <div className="p-2 md:p-3">
                  <p className="text-white text-xs md:text-sm font-light truncate">{game.name}</p>
                  <p className="text-text-muted text-[10px] md:text-xs font-light mt-0.5">Dealer: {game.dealer}</p>
                  <p className="text-text-muted text-[10px] md:text-xs font-light">{game.range}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 md:mt-6 text-center md:hidden">
            <Link href="/lobby?cat=live" className="inline-flex items-center gap-1 text-white font-light hover:underline">
              View All Live Games {'\u2192'}
            </Link>
          </div>
        </section>
      </div>

      {/* ===== Live Betting Feed ===== */}
      <div ref={feedSection.ref} className={feedSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-6">
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

      {/* ===== Mobile Category Buttons ===== */}
      <div className="md:hidden px-3 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: '/lobby?cat=slots', label: t('slots'), icon: '/cat-icons/slot.png' },
            { href: '/lobby?cat=live', label: t('live'), icon: '/cat-icons/casino.png' },
            { href: '/lobby?cat=slots&hot=true', label: t('hot_slots'), icon: '/cat-icons/게임.png' },
          ].map(cat => (
            <Link key={cat.href} href={cat.href} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-white/5 touch-active" style={{ background: '#111111' }}>
              <img src={cat.icon} alt="" style={{width:24,height:24,objectFit:'contain'}} />
              <span className="text-white text-[11px] font-light">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== Mobile Continue Playing ===== */}
      <div className="md:hidden px-3 mb-6">
        <h3 className="text-white font-light text-base mb-3">{t('continue_playing')}</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {TOP_GAMES.slice(0, 5).map((game, i) => (
            <Link key={game.id} href={`/game/${game.id}`} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-20 touch-active">
              <div className="w-16 h-16 rounded-2xl overflow-hidden" style={{ background: '#222' }}>
                {game.thumbnail && <img src={game.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />}
              </div>
              <span className="text-white text-[10px] font-light text-center truncate w-full">{game.name}</span>
              <span className="text-text-muted text-[9px] font-light">{[2, 15, 60, 180, 240][i]}{t('min_ago')}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== Popular Games ===== */}
      <div ref={popularSection.ref} className={popularSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24">
          {/* 보라 악센트 그라디언트 라인 */}
          <div className="h-[2px] mb-4 md:mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #9945FF, transparent)' }} />
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #9945FF, rgba(153,69,255,0.3))' }} />
              <div>
                <h2 className="text-base md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                  <span className="text-base md:text-2xl">{'\uD83D\uDD25'}</span> {t('popular_games_icon')}
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

          <div className="grid grid-cols-3 xl:grid-cols-6 gap-2 md:gap-4">
            {TOP_GAMES.slice(0, 6).map((game, i) => (
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
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24">
          {/* 귤/오렌지 악센트 그라디언트 라인 */}
          <div className="h-[2px] mb-4 md:mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #F7931A, transparent)' }} />
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #F7931A, rgba(247,147,26,0.3))' }} />
            <div>
              <h2 className="text-base md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                <span className="text-base md:text-2xl">{'\u2B50'}</span> {t('new_games_icon')}
              </h2>
              <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-light">{t('new_hot_games')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 xl:grid-cols-6 gap-2 md:gap-4">
            {NEW_GAMES.slice(0, 6).map((game, i) => (
              <PGStyleCard key={game.id} game={game} gradient={newGradients[i % newGradients.length]} />
            ))}
          </div>
        </section>
      </div>

      {/* ===== Promotions ===== */}
      <div className={popularSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24">
          <div className="h-[2px] mb-4 md:mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #DAA520, transparent)' }} />
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #DAA520, rgba(218,165,32,0.3))' }} />
              <div>
                <h2 className="text-base md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                  <span className="text-base md:text-2xl">{'\uD83C\uDF81'}</span> Promotions
                </h2>
                <p className="text-text-secondary text-xs md:text-sm mt-0.5 font-light">Exclusive bonuses & special offers</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {CAROUSEL_BANNERS.map((banner, i) => (
              <Link key={i} href={banner.ctaHref} className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/20 transition-all card-hover" style={{ background: banner.gradient }}>
                <div className="p-4 md:p-6">
                  <h3 className="text-white font-light text-sm md:text-lg mb-1 md:mb-2">{banner.title}</h3>
                  <p className="text-xs md:text-sm font-light" style={{ color: 'rgba(255,255,255,0.6)' }}>{banner.desc}</p>
                  <span className="inline-block mt-3 text-xs font-light text-white/80 group-hover:text-white transition-colors">
                    Learn More &rarr;
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: banner.accent }} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ===== BIG WIN ===== */}
      <div ref={bigWinSection.ref} className={`hidden md:block ${bigWinSection.inView ? 'section-visible' : 'section-hidden'}`}>
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFFFFF, rgba(255,255,255,0.3))' }} />
            <div>
              <h2 className="text-base md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
                <span className="text-base md:text-2xl">{'\uD83C\uDFC6'}</span> {t('big_win_title')}
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
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24">
          <h3 className="text-center text-text-muted text-xs md:text-sm font-light uppercase tracking-wider mb-4 md:mb-6">{t('official_providers')}</h3>
          <div className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-dark-bg to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-bg to-transparent z-10" />
            <div className="flex provider-scroll items-center">
              {[...PROVIDER_LIST, ...PROVIDER_LIST].map((p, i) => (
                  <Link key={`${p.name}-${i}`} href={`/lobby?provider=${encodeURIComponent(p.name)}`} className="flex-shrink-0 mx-4 md:mx-6 py-3 hover:opacity-80 transition-opacity">
                    <span className="text-xs md:text-sm font-light text-white/50 hover:text-white/90 transition-colors whitespace-nowrap tracking-wide">
                      {p.name}
                    </span>
                  </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ===== Features ===== */}
      <div ref={featureSection.ref} className={`hidden md:block ${featureSection.inView ? 'section-visible' : 'section-hidden'}`}>
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24">
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
      <div ref={leaderboardSection.ref} className={`hidden md:block ${leaderboardSection.inView ? 'section-visible' : 'section-hidden'}`}>
        <section className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <div className="w-1 md:w-1.5 h-8 md:h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFFFFF, rgba(255,255,255,0.3))' }} />
            <div>
              <h2 className="text-base md:text-3xl font-extralight text-white flex items-center gap-2 tracking-wide">
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
      <div ref={ctaSection.ref} className={`hidden md:block ${ctaSection.inView ? 'section-visible' : 'section-hidden'}`}>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }} />
          <div className="relative max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-24 text-center">
            <h2 className="text-lg md:text-5xl font-extralight text-white leading-tight tracking-wide">
              {t('join_now_and')}
              <br />
              <span className="font-thin text-white">{t('get_special_bonus')}</span>
            </h2>
            <p className="mt-2 md:mt-4 text-text-secondary text-xs md:text-lg font-light">
              {t('new_member_bonus')} <span className="font-light text-white">{t('up_to_200_bonus')}</span> {t('bonus_given')}
            </p>
            <Link
              href="/register"
              className="mt-4 md:mt-10 inline-flex items-center justify-center px-6 md:px-10 py-2.5 md:py-4 text-xs md:text-lg font-light btn-cta"
            >
              {t('join_now')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ===== PGStyleCard Component — 심플 버전 =====
function PGStyleCard({ game, gradient }: { game: { id: number | string; name: string; provider: string; thumbnail?: string; rtp?: string; maxWin?: string }; gradient: { border: string; glow: string; overlay: string; bg: string } }) {
  const [imgError, setImgError] = useState(false);
  const { t } = useLang();

  if (imgError || !game.thumbnail) return null;

  const handleCardClick = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1100);
    el.classList.remove('card-neon-pulse');
    void el.offsetWidth;
    el.classList.add('card-neon-pulse');
    const cleanup = () => { el.classList.remove('card-neon-pulse'); el.removeEventListener('animationend', cleanup); };
    el.addEventListener('animationend', cleanup);
  };

  const handleTilt = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const rx = ((e.clientY - cy) / r.height) * -6;
    const ry = ((e.clientX - cx) / r.width) * 6;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  };

  const handleTiltReset = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.transform = '';
  };

  return (
    <Link href={`/game/${game.id}`} className="group block game-card-tilt">
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 game-card-shine"
        style={{ border: `1px solid ${gradient.border}30` }}
        onClick={handleCardClick}
        onMouseMove={handleTilt}
        onMouseLeave={handleTiltReset}>
        {/* 이미지 — aspect-ratio로 비율 유지 */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={game.thumbnail}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          {/* 하단 그라데이션 — 이미지 하단에만 */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
          {/* maxWin 뱃지 */}
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 text-[9px] md:text-[10px] font-light text-white/80 bg-black/50 rounded backdrop-blur-sm">
              {game.maxWin}
            </span>
          </div>
          {/* 호버 오버레이 — 데스크톱만 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 hidden md:flex">
            <span className="text-white font-light text-sm tracking-wider">{t('play_btn')}</span>
          </div>
        </div>
        {/* 게임 정보 — 이미지 아래 */}
        <div className="p-2 md:p-3 bg-[#111]">
          <p className="text-white font-light text-[11px] md:text-sm truncate">{game.name}</p>
          <div className="flex items-center justify-between mt-0.5 md:mt-1">
            <span className="text-white/40 text-[9px] md:text-[11px] font-light">{game.provider}</span>
            <span className="text-white/40 text-[9px] md:text-[11px] font-light">{game.rtp}</span>
          </div>
        </div>
      </div>
    </Link>
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
