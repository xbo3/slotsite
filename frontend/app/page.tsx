'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

// ===== Data =====
const PROVIDER_COLORS: Record<string, { from: string; to: string; pattern: string }> = {
  'Pragmatic Play': { from: '#1475E1', to: '#5CA8FF', pattern: 'svg-pattern-dots' },
  'PG Soft': { from: '#8B5CF6', to: '#A78BFA', pattern: 'svg-pattern-grid' },
  'Evolution': { from: '#00E701', to: '#34D399', pattern: 'svg-pattern-diagonal' },
  'NetEnt': { from: '#F0443C', to: '#FB7185', pattern: 'svg-pattern-circles' },
  'Microgaming': { from: '#FFD700', to: '#FDE68A', pattern: 'svg-pattern-waves' },
  "Play'n GO": { from: '#1475E1', to: '#60A5FA', pattern: 'svg-pattern-hexagon' },
};

const TOP_GAMES = [
  { id: 'gates-of-olympus', name: 'Gates of Olympus', provider: 'Pragmatic Play', maxWin: 'x5000' },
  { id: 'sweet-bonanza', name: 'Sweet Bonanza', provider: 'Pragmatic Play', maxWin: 'x21100' },
  { id: 'fortune-tiger', name: 'Fortune Tiger', provider: 'PG Soft', maxWin: 'x2500' },
  { id: 'crazy-time', name: 'Crazy Time', provider: 'Evolution', maxWin: 'x25000' },
  { id: 'dead-or-alive-2', name: 'Dead or Alive 2', provider: 'NetEnt', maxWin: 'x111111' },
  { id: 'mega-moolah', name: 'Mega Moolah', provider: 'Microgaming', maxWin: 'Progressive' },
  { id: 'book-of-dead', name: 'Book of Dead', provider: "Play'n GO", maxWin: 'x5000' },
  { id: 'lightning-roulette', name: 'Lightning Roulette', provider: 'Evolution', maxWin: 'x500' },
];

const NEW_GAMES = [
  { id: 'sugar-rush', name: 'Sugar Rush', provider: 'Pragmatic Play', maxWin: 'x5000' },
  { id: 'fortune-rabbit', name: 'Fortune Rabbit', provider: 'PG Soft', maxWin: 'x1000' },
  { id: 'dream-catcher', name: 'Dream Catcher', provider: 'Evolution', maxWin: 'x7000' },
  { id: 'twin-spin', name: 'Twin Spin', provider: 'NetEnt', maxWin: 'x1080' },
  { id: 'fire-joker', name: 'Fire Joker', provider: "Play'n GO", maxWin: 'x800' },
  { id: 'starlight-princess', name: 'Starlight Princess', provider: 'Pragmatic Play', maxWin: 'x5000' },
];

const BANNER_SLIDES = [
  {
    title: '첫 충전 보너스',
    highlight: '최대 200%',
    desc: '지금 가입하고 첫 충전 시 최대 200% 보너스를 받으세요!',
    cta: '보너스 받기',
    ctaHref: '/register',
    gradient: 'from-accent/20 via-emerald-500/10 to-transparent',
    cards: ['Gates of Olympus', 'Sweet Bonanza', 'Fortune Tiger'],
  },
  {
    title: '매일 캐시백',
    highlight: '최대 15%',
    desc: '매일 플레이할수록 돌아오는 캐시백! 놓치지 마세요.',
    cta: '자세히 보기',
    ctaHref: '/mypage/coupons',
    gradient: 'from-accent-gold/20 via-amber-500/10 to-transparent',
    cards: ['Mega Moolah', 'Dead or Alive 2', 'Crazy Time'],
  },
  {
    title: 'VIP 전용 혜택',
    highlight: '무제한',
    desc: 'VIP 등급이 올라갈수록 더 큰 혜택과 독점 게임이 열립니다.',
    cta: 'VIP 혜택 보기',
    ctaHref: '/mypage',
    gradient: 'from-accent-purple/20 via-violet-500/10 to-transparent',
    cards: ['Book of Dead', 'Lightning Roulette', 'Starlight Princess'],
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

const PROVIDER_LIST = ['Pragmatic Play', 'PG Soft', 'Evolution', 'NetEnt', 'Microgaming', "Play'n GO"];

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
  // Banner slider
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerAnim, setBannerAnim] = useState<'enter' | 'exit'>('enter');
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextBanner = useCallback(() => {
    setBannerAnim('exit');
    setTimeout(() => {
      setBannerIdx(prev => (prev + 1) % BANNER_SLIDES.length);
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

  // Section observers
  const feedSection = useInView();
  const popularSection = useInView();
  const newSection = useInView();
  const bigWinSection = useInView();
  const providerSection = useInView();
  const featureSection = useInView();
  const leaderboardSection = useInView();
  const ctaSection = useInView();

  const banner = BANNER_SLIDES[bannerIdx];
  const feedItem = BETTING_FEED_DATA[feedIdx];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ===== Hero Banner ===== */}
      <section className="relative overflow-hidden h-80 md:h-[480px] hero-particles">
        {/* Background effects */}
        <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`} />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-gold/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-10 right-10 w-32 h-32 border border-accent/10 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 left-20 w-20 h-20 border border-accent-blue/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Left: Text */}
            <div className={`flex-1 text-center md:text-left ${bannerAnim === 'enter' ? 'banner-enter' : 'banner-exit'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-4">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-sm font-medium">지금 2,847명이 플레이 중</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
                <span className="text-white">{banner.title}</span>
                <br />
                <span className="bg-gradient-to-r from-accent via-emerald-400 to-accent bg-clip-text text-transparent">
                  {banner.highlight}
                </span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-text-secondary max-w-lg leading-relaxed">
                {banner.desc}
              </p>

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href={banner.ctaHref}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-lg font-bold btn-cta rounded-2xl"
                >
                  <span>{banner.cta}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/lobby"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-bold border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-dark-bg rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  게임 둘러보기
                </Link>
              </div>

              {/* Banner dots */}
              <div className="flex gap-2 mt-6 justify-center md:justify-start">
                {BANNER_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setBannerAnim('exit'); setTimeout(() => { setBannerIdx(i); setBannerAnim('enter'); }, 500); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-accent w-6' : 'bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Tilted game cards (desktop only) */}
            <div className="hidden md:flex items-center justify-center flex-1 card-tilt">
              <div className="relative w-72 h-72 card-tilt-inner">
                {banner.cards.map((cardName, i) => {
                  const game = TOP_GAMES.find(g => g.name === cardName) || TOP_GAMES[i];
                  const colors = PROVIDER_COLORS[game.provider] || PROVIDER_COLORS['Pragmatic Play'];
                  const offsets = [
                    { x: -30, y: 20, rotate: -12 },
                    { x: 0, y: 0, rotate: 0 },
                    { x: 30, y: -20, rotate: 12 },
                  ];
                  const o = offsets[i];
                  return (
                    <div
                      key={cardName}
                      className="absolute top-1/2 left-1/2 w-40 h-52 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                      style={{
                        transform: `translate(-50%, -50%) translateX(${o.x}px) translateY(${o.y}px) rotate(${o.rotate}deg)`,
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                        zIndex: i === 1 ? 3 : i === 2 ? 2 : 1,
                      }}
                    >
                      <div className={`absolute inset-0 ${colors.pattern}`} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                        <span className="text-white font-black text-lg text-center drop-shadow-lg leading-tight">{game.name}</span>
                        <span className="text-white/70 text-xs mt-2">{game.provider}</span>
                        <span className="mt-3 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold">{game.maxWin}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Live Betting Feed ===== */}
      <div ref={feedSection.ref} className={feedSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-dark-card/50 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-4 overflow-hidden">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">LIVE</span>
            </div>
            <div className={`flex-1 flex items-center gap-3 ${feedAnim === 'enter' ? 'feed-enter' : 'feed-exit'}`}>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-dark-elevated flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                {feedItem.nick.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm">
                  <span className="font-bold">{feedItem.nick}</span>
                  <span className="text-text-muted">님이 </span>
                  <span className="text-accent-blue font-medium">{feedItem.game}</span>
                  <span className="text-text-muted">에서 </span>
                  <span className={`font-bold ${feedItem.amount >= 1000000 ? 'text-accent-gold' : 'text-accent'}`}>
                    {feedItem.amount >= 1000000 ? '\uD83D\uDD25 ' : ''}
                    {'\u20AE'}{feedItem.amount.toLocaleString()}
                  </span>
                  <span className="text-text-muted"> 당첨!</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== Popular Games ===== */}
      <div ref={popularSection.ref} className={popularSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-gradient-to-b from-accent to-accent/30 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                  <span className="text-2xl">{'\uD83D\uDD25'}</span> 인기 게임
                </h2>
                <p className="text-text-secondary text-sm mt-0.5">실시간 플레이어가 가장 많은 TOP 8</p>
              </div>
            </div>
            <Link
              href="/lobby"
              className="hidden md:flex items-center gap-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-text-secondary hover:text-white text-sm font-medium transition-all"
            >
              전체보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {TOP_GAMES.map((game, i) => (
              <GameCard key={game.id} game={game} rank={i + 1} />
            ))}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link href="/lobby" className="inline-flex items-center gap-1 text-accent font-medium hover:underline">
              전체 게임 보기 {'\u2192'}
            </Link>
          </div>
        </section>
      </div>

      {/* ===== New Games ===== */}
      <div ref={newSection.ref} className={newSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-accent-blue to-accent-blue/30 rounded-full" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <span className="text-2xl">{'\u2B50'}</span> 신규 게임
              </h2>
              <p className="text-text-secondary text-sm mt-0.5">새로 출시된 핫한 게임들</p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {NEW_GAMES.map(game => (
              <Link key={game.id} href={`/game/${game.id}`} className="snap-start flex-shrink-0 w-44 md:w-52 group">
                <div className="relative rounded-2xl overflow-hidden border border-white/5 group-hover:border-accent-blue/30 transition-all shadow-lg card-hover">
                  <GameThumb name={game.name} provider={game.provider} className="group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-success text-dark-bg text-[10px] font-bold rounded-md">NEW</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 bg-dark-bg/70 text-accent-gold text-[9px] font-bold rounded-md backdrop-blur-sm">
                      {game.maxWin}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm truncate">{game.name}</p>
                    <p className="text-text-secondary text-[11px]">{game.provider}</p>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-accent-blue/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-6 py-2.5 bg-white text-dark-bg font-bold rounded-xl text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      지금 플레이 {'\u25B6'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ===== BIG WIN ===== */}
      <div ref={bigWinSection.ref} className={bigWinSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-accent-gold to-accent-gold/30 rounded-full" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <span className="text-2xl">{'\uD83C\uDFC6'}</span> BIG WIN
              </h2>
              <p className="text-text-secondary text-sm mt-0.5">최근 대박 당첨자</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BIG_WIN_DATA.map((win, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-gold/10 via-dark-card to-dark-card border border-accent-gold/20 p-6 hover:border-accent-gold/40 transition-all card-hover">
                <div className="absolute top-3 right-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black text-white ${i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : 'rank-bronze'}`}>
                    #{i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold text-lg">
                    {win.nick.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold">{win.nick}</p>
                    <p className="text-text-muted text-xs">{win.time}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm mb-2">{win.game}</p>
                <p className="text-2xl md:text-3xl font-black shimmer-gold">
                  {'\u20AE'}{win.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Provider Logos ===== */}
      <div ref={providerSection.ref} className={providerSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <h3 className="text-center text-text-muted text-sm font-medium uppercase tracking-wider mb-6">공식 게임 프로바이더</h3>
          <div className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-dark-bg to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-bg to-transparent z-10" />
            <div className="flex provider-scroll">
              {[...PROVIDER_LIST, ...PROVIDER_LIST].map((p, i) => {
                const colors = PROVIDER_COLORS[p];
                return (
                  <div key={`${p}-${i}`} className="flex-shrink-0 mx-6 flex items-center gap-2 py-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
                      <span className="text-white font-black text-xs">{p.charAt(0)}</span>
                    </div>
                    <span className="text-text-secondary text-sm font-medium whitespace-nowrap">{p}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ===== Features ===== */}
      <div ref={featureSection.ref} className={featureSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard
              title="300+ 프리미엄 게임"
              description="Pragmatic Play, PG Soft, Evolution 등 세계 최고 프로바이더의 인기 슬롯과 라이브 게임."
              icon={<SlotIcon />}
              gradient="from-accent-blue/10 to-transparent"
            />
            <FeatureCard
              title="즉시 입출금"
              description="USDT 크립토, 은행 송금으로 빠르고 안전하게. 최소 10분 내 환전 처리."
              icon={<BoltIcon />}
              gradient="from-accent/10 to-transparent"
            />
            <FeatureCard
              title="VIP 보너스"
              description="첫 충전 15% 보너스, 매주 캐시백, 레벨업 리워드까지. 플레이할수록 혜택이."
              icon={<CrownIcon />}
              gradient="from-accent-gold/10 to-transparent"
            />
          </div>
        </section>
      </div>

      {/* ===== Leaderboard ===== */}
      <div ref={leaderboardSection.ref} className={leaderboardSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-accent-gold to-accent-gold/30 rounded-full" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                {'\uD83C\uDFC6'} 이번 주 TOP 10
              </h2>
              <p className="text-text-secondary text-sm mt-0.5">가장 많이 당첨된 플레이어</p>
            </div>
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-card/80">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">순위</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">닉네임</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">게임</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">당첨 금액</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD_DATA.map((row) => (
                  <tr
                    key={row.rank}
                    className={`border-t border-white/5 transition-colors hover:bg-white/[0.02] ${
                      row.rank === 1 ? 'bg-accent-gold/5' : row.rank === 2 ? 'bg-gray-300/5' : row.rank === 3 ? 'bg-amber-700/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black text-white ${
                        row.rank === 1 ? 'rank-gold' : row.rank === 2 ? 'rank-silver' : row.rank === 3 ? 'rank-bronze' : 'bg-dark-elevated'
                      }`}>
                        #{row.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dark-elevated flex items-center justify-center text-xs font-bold text-text-secondary">
                          {row.nick.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-sm">{row.nick}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">{row.game}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-sm ${row.rank <= 3 ? 'text-accent-gold' : 'text-accent'}`}>
                        {'\u20AE'}{row.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card List */}
          <div className="md:hidden space-y-2">
            {LEADERBOARD_DATA.map((row) => (
              <div
                key={row.rank}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  row.rank === 1 ? 'bg-accent-gold/5 border-accent-gold/20' :
                  row.rank === 2 ? 'bg-gray-300/5 border-gray-300/10' :
                  row.rank === 3 ? 'bg-amber-700/5 border-amber-700/10' :
                  'bg-dark-card border-white/5'
                }`}
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black text-white flex-shrink-0 ${
                  row.rank === 1 ? 'rank-gold' : row.rank === 2 ? 'rank-silver' : row.rank === 3 ? 'rank-bronze' : 'bg-dark-elevated'
                }`}>
                  #{row.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">{row.nick}</span>
                    <span className={`font-bold text-sm ${row.rank <= 3 ? 'text-accent-gold' : 'text-accent'}`}>
                      {'\u20AE'}{row.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">{row.game}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== CTA Section ===== */}
      <div ref={ctaSection.ref} className={ctaSection.inView ? 'section-visible' : 'section-hidden'}>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent-gold/5 to-accent/5" />
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              지금 가입하고
              <br />
              <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">특별 보너스</span>를 받으세요
            </h2>
            <p className="mt-4 text-text-secondary text-lg">
              신규 회원 첫 충전 시 <span className="text-accent font-bold">최대 200%</span> 보너스 지급
            </p>
            <Link
              href="/register"
              className="mt-10 inline-flex items-center justify-center px-10 py-4 text-lg font-bold btn-cta rounded-2xl"
            >
              지금 가입하기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ===== GameCard Component =====
function GameCard({ game, rank }: { game: typeof TOP_GAMES[0]; rank: number }) {
  return (
    <Link href={`/game/${game.id}`} className="group">
      <div className="relative rounded-2xl overflow-hidden bg-dark-card border border-white/5 hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 card-hover">
        <div className="relative overflow-hidden">
          <GameThumb name={game.name} provider={game.provider} className="group-hover:scale-[1.08] group-hover:brightness-110 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />

          {/* Rank badge */}
          <div className="absolute top-2 left-2">
            <span className={`flex items-center justify-center w-7 h-7 text-[11px] font-black text-white rounded-lg ${rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'bg-accent/90 text-dark-bg'}`}>
              #{rank}
            </span>
          </div>

          {/* Max win */}
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 bg-dark-bg/70 text-accent-gold text-[9px] font-bold rounded-md backdrop-blur-sm">
              {game.maxWin}
            </span>
          </div>

          {/* Hover overlay with 2 buttons */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-dark-bg via-dark-bg/90 to-transparent game-card-overlay">
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-accent text-dark-bg text-xs font-bold rounded-lg hover:brightness-110 transition-all touch-active">
                실전 플레이
              </button>
              <button className="flex-1 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-all touch-active">
                무료 체험
              </button>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm truncate group-hover:text-accent transition-colors">{game.name}</h3>
          <p className="text-text-muted text-[11px] mt-0.5">{game.provider}</p>
        </div>
      </div>
    </Link>
  );
}

// ===== GameThumb Component =====
function GameThumb({ name, provider, className = '' }: { name: string; provider: string; className?: string }) {
  const colors = PROVIDER_COLORS[provider] || { from: '#1475E1', to: '#5CA8FF', pattern: 'svg-pattern-dots' };
  return (
    <div
      className={`w-full aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
    >
      <div className={`absolute inset-0 ${colors.pattern}`} />
      <ProviderSVG provider={provider} />
      <span className="relative text-2xl md:text-3xl font-black text-white text-center px-3 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        {name}
      </span>
      <span className="relative mt-1 text-white/60 text-[10px] font-medium tracking-wider uppercase">{provider}</span>
    </div>
  );
}

// ===== Provider SVG Icons (decorative) =====
function ProviderSVG({ provider }: { provider: string }) {
  const svgs: Record<string, JSX.Element> = {
    'Pragmatic Play': (
      <svg className="absolute top-2 right-2 w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    'PG Soft': (
      <svg className="absolute top-2 right-2 w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="9" r="1.5" /><circle cx="15" cy="9" r="1.5" />
      </svg>
    ),
    'Evolution': (
      <svg className="absolute top-2 right-2 w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    'NetEnt': (
      <svg className="absolute top-2 right-2 w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    'Microgaming': (
      <svg className="absolute top-2 right-2 w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    ),
    "Play'n GO": (
      <svg className="absolute top-2 right-2 w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  };
  return svgs[provider] || null;
}

// ===== Feature Card =====
function FeatureCard({ title, description, icon, gradient }: { title: string; description: string; icon: JSX.Element; gradient: string }) {
  return (
    <div className={`relative rounded-2xl p-6 md:p-8 border border-white/5 hover:border-accent/20 transition-all duration-300 bg-gradient-to-br ${gradient} bg-dark-card overflow-hidden group card-hover`}>
      <div className="absolute -right-4 -top-4 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-accent">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
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

