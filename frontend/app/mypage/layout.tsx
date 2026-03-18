'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';
import { useLang } from '@/hooks/useLang';

// Dummy user data
const DUMMY_USER = {
  nickname: 'player_kim',
  email: 'test***@gmail.com',
  joinDate: '2026-01-15',
  balance: 12450.50,
  totalDeposit: 35000,
  totalWithdraw: 28500,
  totalBet: 28500,
  totalWin: 31200,
  level: 3,
  xp: 1250,
  nextLevelXp: 2000,
};

const LEVEL_ICONS = ['\u2B50', '\u2B50', '\uD83C\uDF1F', '\uD83C\uDF1F', '\uD83D\uDCAB', '\uD83D\uDCAB', '\uD83D\uDD25', '\uD83D\uDD25', '\uD83D\uDC51', '\uD83D\uDC51'];

const TABS = [
  { href: '/mypage', labelKey: 'tab_profile', icon: ProfileIcon },
  { href: '/mypage/transactions', labelKey: 'tab_transactions', icon: TransactionIcon },
  { href: '/mypage/bets', labelKey: 'tab_bets', icon: BetIcon },
  { href: '/mypage/coupons', labelKey: 'tab_coupons', icon: CouponIcon },
  { href: '/mypage/vip', labelKey: 'tab_vip', icon: VipIcon },
];

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // CountUp for hero card
  const animatedBalance = useCountUp(DUMMY_USER.balance);
  const animatedDeposit = useCountUp(DUMMY_USER.totalDeposit);
  const animatedWithdraw = useCountUp(DUMMY_USER.totalWithdraw);
  const animatedBet = useCountUp(DUMMY_USER.totalBet);

  // Scroll listener for mini header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tab indicator position
  const updateIndicator = useCallback(() => {
    const activeIndex = TABS.findIndex(tab =>
      tab.href === '/mypage'
        ? pathname === '/mypage'
        : pathname?.startsWith(tab.href)
    );
    if (activeIndex >= 0 && tabRefs.current[activeIndex] && tabContainerRef.current) {
      const tabEl = tabRefs.current[activeIndex]!;
      const containerRect = tabContainerRef.current.getBoundingClientRect();
      const tabRect = tabEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left + tabContainerRef.current.scrollLeft,
        width: tabRect.width,
      });
    }
  }, [pathname]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 safe-bottom">
      {/* === Mobile Mini Header (sticky, shows on scroll) === */}
      <div
        className={cn(
          'md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-dark-bg/90 backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-3 transition-all duration-300',
          scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
            {DUMMY_USER.nickname.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-light text-white truncate">{DUMMY_USER.nickname}</span>
        <span className="text-sm font-medium ml-auto whitespace-nowrap" style={{ color: '#FFFFFF' }}>
          {animatedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT
        </span>
      </div>

      {/* === Mobile Hero Card === */}
      <div className="md:hidden bg-gradient-to-br from-dark-bg to-dark-card rounded-2xl border border-white/5 p-5 mb-6">
        {/* Avatar + Name + Balance */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 0 20px rgba(255,255,255,0.06)' }}>
            <span className="text-3xl font-medium" style={{ color: '#FFFFFF' }}>
              {DUMMY_USER.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-light text-white mb-1">{DUMMY_USER.nickname}</h1>
          <p className="text-3xl font-medium" style={{ color: '#FFFFFF' }}>
            {animatedBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm font-light">USDT</span>
          </p>
        </div>

        {/* Mini Stats 3-col */}
        <div className="flex justify-between gap-2 mb-4">
          <div className="flex-1 bg-black/20 rounded-lg p-3 text-center">
            <p className="text-[10px] text-text-muted mb-0.5">{t('total_deposit')}</p>
            <p className="text-sm font-light text-white">{animatedDeposit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="flex-1 bg-black/20 rounded-lg p-3 text-center">
            <p className="text-[10px] text-text-muted mb-0.5">{t('total_withdraw_label')}</p>
            <p className="text-sm font-light text-white">{animatedWithdraw.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="flex-1 bg-black/20 rounded-lg p-3 text-center">
            <p className="text-[10px] text-text-muted mb-0.5">{t('total_bet')}</p>
            <p className="text-sm font-light text-white">{animatedBet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-dark-input/50 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{LEVEL_ICONS[DUMMY_USER.level - 1] || '\u2B50'}</span>
              <span className="text-sm font-light text-white">{t('level')} {DUMMY_USER.level}</span>
            </div>
            <span className="text-[11px] text-text-muted">
              {DUMMY_USER.xp.toLocaleString()} / {DUMMY_USER.nextLevelXp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full h-2 bg-dark-input rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(DUMMY_USER.xp / DUMMY_USER.nextLevelXp) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-1.5">
            {t('next_level_xp')} {(DUMMY_USER.nextLevelXp - DUMMY_USER.xp).toLocaleString()} XP
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Link href="/wallet" className="btn-cta rounded-full flex-1 py-3 text-center text-sm font-medium">
            {t('deposit_action')}
          </Link>
          <Link href="/wallet" className="rounded-full flex-1 py-3 text-center text-sm font-medium transition-colors" style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}>
            {t('withdraw_action')}
          </Link>
        </div>
      </div>

      {/* === Desktop User Summary Card (unchanged) === */}
      <div className="hidden md:block bg-dark-card rounded-2xl border border-white/5 p-5 md:p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <span className="text-2xl md:text-3xl font-medium" style={{ color: '#FFFFFF' }}>
              {DUMMY_USER.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-light text-white truncate">{DUMMY_USER.nickname}</h1>
            <p className="text-xs text-text-muted">{DUMMY_USER.joinDate} {t('joined')}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-text-muted mb-0.5">{t('held_amount')}</p>
            <p className="text-xl md:text-2xl font-medium" style={{ color: '#FFFFFF' }}>{DUMMY_USER.balance.toLocaleString()} <span className="text-sm">USDT</span></p>
          </div>
        </div>

        {/* Level Progress (Desktop) */}
        <div className="flex items-center gap-4 mb-4 bg-dark-bg rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{LEVEL_ICONS[DUMMY_USER.level - 1] || '\u2B50'}</span>
            <span className="text-sm font-light text-white">Lv.{DUMMY_USER.level}</span>
          </div>
          <div className="flex-1">
            <div className="w-full h-2 bg-dark-input rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(DUMMY_USER.xp / DUMMY_USER.nextLevelXp) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {DUMMY_USER.xp.toLocaleString()} / {DUMMY_USER.nextLevelXp.toLocaleString()} XP
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-xs text-text-muted mb-1">{t('total_deposit')}</p>
            <p className="text-sm md:text-base font-light text-white">{DUMMY_USER.totalDeposit.toLocaleString()} <span className="text-xs text-text-muted">USDT</span></p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-xs text-text-muted mb-1">{t('total_bet')}</p>
            <p className="text-sm md:text-base font-light text-white">{DUMMY_USER.totalBet.toLocaleString()} <span className="text-xs text-text-muted">USDT</span></p>
          </div>
          <div className="bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-xs text-text-muted mb-1">{t('total_wins')}</p>
            <p className="text-sm md:text-base font-medium" style={{ color: '#FFFFFF' }}>{DUMMY_USER.totalWin.toLocaleString()} <span className="text-xs" style={{ color: '#555555' }}>USDT</span></p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop: Vertical Tabs */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <nav className="bg-dark-card rounded-xl border border-white/5 overflow-hidden">
            {TABS.map(tab => {
              const isActive = tab.href === '/mypage'
                ? pathname === '/mypage'
                : pathname?.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all border-l-[3px]',
                    isActive
                      ? 'border-l-white bg-white/5 text-white'
                      : 'border-l-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <tab.icon active={!!isActive} />
                  <span>{t(tab.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile: Horizontal Scroll Tabs with Slide Indicator */}
        <div className="md:hidden -mx-4 px-4">
          <div className="relative" ref={tabContainerRef}>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {TABS.map((tab, index) => {
                const isActive = tab.href === '/mypage'
                  ? pathname === '/mypage'
                  : pathname?.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    ref={(el) => { tabRefs.current[index] = el; }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 border border-white/5 hover:text-white'
                    )}
                    style={isActive ? { background: '#FFFFFF', color: '#0A0A0A' } : { background: '#111111' }}
                  >
                    <tab.icon active={!!isActive} />
                    <span>{t(tab.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
            {/* Slide Indicator */}
            <div
              className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width, background: '#FFFFFF' }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

// Tab Icons
function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : '#55555F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TransactionIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : '#55555F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BetIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : '#55555F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CouponIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : '#55555F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
      <rect x="2" y="7" width="20" height="5" rx="1" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function VipIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : '#55555F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}
