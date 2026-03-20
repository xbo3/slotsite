'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

const navItemDefs = [
  { href: '/menu', labelKey: 'menu_tab', icon: MenuIcon },
  { href: '/', labelKey: 'home', icon: HomeIcon },
  { href: '/mypage/coupons', labelKey: 'bonus', icon: BonusIcon },
  { href: '/mypage', labelKey: 'profile', icon: ProfileIcon },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isAdmin = pathname?.startsWith('/admin');
  const { t } = useLang();

  const navItems = navItemDefs.map(n => ({ ...n, label: t(n.labelKey) }));

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 100) setVisible(false);
      else setVisible(true);
      lastScrollY.current = currentY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdmin) return null;

  return (
    <>
      <nav className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t safe-area-bottom transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full'
      )} style={{ background: 'rgba(22,22,22,0.95)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-around h-14" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

            // 메뉴 탭 → 사이드바 슬라이드
            if (item.href === '/menu') {
              return (
                <button
                  key={item.href}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[48px] justify-center touch-active"
                  style={{ color: menuOpen ? '#FFFFFF' : '#555555' }}
                >
                  <item.icon active={menuOpen} />
                  <span className="text-[10px] font-light">{item.label}</span>
                </button>
              );
            }

            // 보너스 탭 → 로그인 체크
            if (item.href === '/mypage/coupons') {
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    setMenuOpen(false);
                    const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');
                    router.push(isLoggedIn ? '/mypage/coupons' : '/register');
                  }}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[48px] justify-center relative touch-active"
                  style={{ color: isActive ? '#FFFFFF' : '#555555' }}
                >
                  {isActive && <span className="w-1 h-1 rounded-full absolute top-1" style={{ background: '#FFFFFF' }} />}
                  <item.icon active={!!isActive} />
                  <span className="text-[10px] font-light">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[48px] justify-center relative touch-active"
                style={{ color: isActive ? '#FFFFFF' : '#555555' }}
              >
                {isActive && <span className="w-1 h-1 rounded-full absolute top-1" style={{ background: '#FFFFFF' }} />}
                <item.icon active={!!isActive} />
                <span className="text-[10px] font-light">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 메뉴 슬라이드 패널 */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60] md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-[61] md:hidden bottomsheet-enter" style={{ background: '#111111' }}>
            <div className="p-4 border-b border-white/5">
              <span className="text-white font-light tracking-wider">DR.SLOT</span>
            </div>
            <div className="py-2">
              {[
                { href: '/lobby?cat=slots', label: t('slots'), icon: '🎰' },
                { href: '/lobby?cat=live', label: t('casino'), icon: '🎲' },
                { href: '/lobby?cat=sports', label: t('sports'), icon: '⚽' },
                { href: '/mypage/coupons', label: t('promotion'), icon: '🎁' },
                { href: '/mypage/coupons', label: t('bonus'), icon: '💎' },
                { href: '/support', label: t('partner'), icon: '🤝' },
                { href: '/support', label: t('support_247'), icon: '💬' },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-all touch-active"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-light">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ===== Icons =====

function MenuIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#555555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#555555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BonusIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#555555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
      <rect x="2" y="7" width="20" height="5" rx="1" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#555555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
