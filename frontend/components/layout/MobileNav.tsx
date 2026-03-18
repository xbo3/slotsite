'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '홈', icon: HomeIcon },
  { href: '/lobby', label: '게임', icon: GameIcon },
  { href: '/mypage/coupons', label: '보너스', icon: BonusIcon },
  { href: '/wallet', label: '지갑', icon: WalletIcon },
  { href: '/mypage', label: '프로필', icon: ProfileIcon },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [bottomSheet, setBottomSheet] = useState(false);
  const lastScrollY = useRef(0);
  const isAdmin = pathname?.startsWith('/admin');

  // Scroll hide/show
  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide on admin pages
  if (isAdmin) return null;

  return (
    <>
      <nav className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-card/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}>
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href);

            // Game tab opens bottom sheet
            if (item.href === '/lobby') {
              return (
                <button
                  key={item.href}
                  onClick={() => setBottomSheet(true)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[48px] justify-center touch-active',
                    isActive ? 'text-accent' : 'text-text-muted'
                  )}
                >
                  {isActive && <span className="w-1 h-1 bg-accent rounded-full absolute -top-0 mt-1" />}
                  <item.icon active={!!isActive} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            }

            // Wallet tab shows balance
            if (item.href === '/wallet') {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[48px] justify-center relative touch-active',
                    isActive ? 'text-accent' : 'text-text-muted'
                  )}
                >
                  {isActive && <span className="w-1 h-1 bg-accent rounded-full absolute top-1" />}
                  <item.icon active={!!isActive} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[48px] justify-center relative touch-active',
                  isActive ? 'text-accent' : 'text-text-muted'
                )}
              >
                {isActive && <span className="w-1 h-1 bg-accent rounded-full absolute top-1" />}
                <item.icon active={!!isActive} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Category Bottom Sheet */}
      {bottomSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60] animate-overlay"
            onClick={() => setBottomSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[61] bg-dark-card rounded-t-2xl bottomsheet-enter safe-area-bottom">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="px-4 pb-6">
              <h3 className="text-white font-bold text-lg mb-4">카테고리 선택</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: '/lobby?cat=slot', label: '슬롯', count: 142, icon: '\uD83C\uDFB0' },
                  { href: '/lobby?cat=live', label: '라이브', count: 38, icon: '\uD83C\uDFB2' },
                  { href: '/lobby?cat=table', label: '테이블', count: 25, icon: '\uD83C\uDCCF' },
                  { href: '/lobby?cat=mini', label: '미니게임', count: 15, icon: '\uD83C\uDFAF' },
                ].map(cat => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setBottomSheet(false)}
                    className="flex items-center gap-3 p-4 bg-dark-bg rounded-xl border border-white/5 hover:border-accent/20 transition-all touch-active"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{cat.label}</p>
                      <p className="text-text-muted text-xs">{cat.count}개 게임</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/lobby"
                onClick={() => setBottomSheet(false)}
                className="block w-full mt-4 py-3 text-center bg-accent text-dark-bg font-bold rounded-xl text-sm touch-active"
              >
                전체 게임 보기
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ===== Icon Components =====

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00E701' : '#557086'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GameIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00E701' : '#557086'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  );
}

function BonusIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00E701' : '#557086'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
      <rect x="2" y="7" width="20" height="5" rx="1" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00E701' : '#557086'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00E701' : '#557086'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
