/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

function ImgIcon({ src, active }: { src: string; active: boolean }) {
  return <img src={src} alt="" style={{ width: 20, height: 20, objectFit: 'contain', opacity: active ? 1 : 0.4, filter: active ? 'brightness(1.2)' : 'none' }} />;
}

const navItemDefs = [
  { href: '/menu', labelKey: 'menu_tab', icon: ({ active }: { active: boolean }) => <ImgIcon src="/cat-icons/하단메뉴.png" active={active} /> },
  { href: '/', labelKey: 'home', icon: ({ active }: { active: boolean }) => <ImgIcon src="/cat-icons/home.png" active={active} /> },
  { href: '/mypage/coupons', labelKey: 'bonus', icon: ({ active }: { active: boolean }) => <ImgIcon src="/cat-icons/하단보너스.png" active={active} /> },
  { href: '/mypage', labelKey: 'profile', icon: ({ active }: { active: boolean }) => <ImgIcon src="/cat-icons/하단프로필.png" active={active} /> },
];

const SLOT_PROVIDERS = [
  { id: 'evolution', label: 'Evolution Gaming', href: '/lobby?provider=evolution' },
  { id: 'boongo', label: 'Booongo', href: '/lobby?provider=boongo' },
  { id: 'microgaming', label: 'Microgaming', href: '/lobby?provider=microgaming' },
  { id: 'sexygaming', label: 'Sexy Gaming', href: '/lobby?provider=sexygaming' },
  { id: 'pgsoft', label: 'PG Soft', href: '/lobby?provider=pgsoft' },
  { id: 'hacksaw', label: 'Hacksaw', href: '/lobby?provider=hacksaw' },
  { id: 'nolimit', label: 'NoLimitCity', href: '/lobby?provider=nolimit' },
  { id: 'advantplay', label: 'AdvantPlay', href: '/lobby?provider=advantplay' },
  { id: 'redtiger', label: 'Red Tiger', href: '/lobby?provider=redtiger' },
  { id: 'fatpanda', label: 'Fat Panda', href: '/lobby?provider=fatpanda' },
  { id: 'habanero', label: 'Habanero', href: '/lobby?provider=habanero' },
  { id: 'jdb', label: 'JDB', href: '/lobby?provider=jdb' },
  { id: 'netent', label: 'NetEnt', href: '/lobby?provider=netent' },
  { id: 'jili', label: 'JILI', href: '/lobby?provider=jili' },
  { id: 'spadegaming', label: 'Spadegaming', href: '/lobby?provider=spadegaming' },
  { id: 'skywind', label: 'Skywind', href: '/lobby?provider=skywind' },
  { id: 'btg', label: 'Big Time Gaming', href: '/lobby?provider=btg' },
  { id: 'fachai', label: 'FA CHAI', href: '/lobby?provider=fachai' },
  { id: 'pragmatic', label: 'Pragmatic Play', href: '/lobby?provider=pragmatic' },
  { id: '1spin4win', label: '1Spin4Win', href: '/lobby?provider=1spin4win' },
  { id: 'endorphina', label: 'Endorphina', href: '/lobby?provider=endorphina' },
  { id: 'bgaming', label: 'BGaming', href: '/lobby?provider=bgaming' },
  { id: 'fazi', label: 'Fazi', href: '/lobby?provider=fazi' },
  { id: 'penguinking', label: 'Penguin King', href: '/lobby?provider=penguinking' },
  { id: 'inout', label: 'InOut', href: '/lobby?provider=inout' },
  { id: 'booming', label: 'Booming', href: '/lobby?provider=booming' },
  { id: 'rubyplay', label: 'Ruby Play', href: '/lobby?provider=rubyplay' },
  { id: 'onlyplay', label: 'OnlyPlay', href: '/lobby?provider=onlyplay' },
  { id: 'relaxgaming', label: 'Relax Gaming', href: '/lobby?provider=relaxgaming' },
  { id: 'backseat', label: 'Backseat', href: '/lobby?provider=backseat' },
  { id: 'funtagaming', label: 'FunTa Gaming', href: '/lobby?provider=funtagaming' },
  { id: 'amigogaming', label: 'Amigo Gaming', href: '/lobby?provider=amigogaming' },
  { id: 'novomatic', label: 'Novomatic', href: '/lobby?provider=novomatic' },
  { id: 'platipus', label: 'Platipus', href: '/lobby?provider=platipus' },
  { id: 'betsoft', label: 'BetSoft', href: '/lobby?provider=betsoft' },
  { id: 'thunderkick', label: 'Thunderkick', href: '/lobby?provider=thunderkick' },
  { id: 'belatra', label: 'Belatra', href: '/lobby?provider=belatra' },
  { id: 'avatarux', label: 'AvatarUX', href: '/lobby?provider=avatarux' },
  { id: 'popokgaming', label: 'PopOk Gaming', href: '/lobby?provider=popokgaming' },
  { id: 'smartsoft', label: 'SmartSoft Gaming', href: '/lobby?provider=smartsoft' },
  { id: 'bullshark', label: 'Bullshark', href: '/lobby?provider=bullshark' },
  { id: 'pegasus', label: 'Pegasus', href: '/lobby?provider=pegasus' },
  { id: 'spinomenal', label: 'Spinomenal', href: '/lobby?provider=spinomenal' },
  { id: 'quickspin', label: 'Quickspin', href: '/lobby?provider=quickspin' },
  { id: '1x2gaming', label: '1x2 Gaming', href: '/lobby?provider=1x2gaming' },
  { id: 'slotmill', label: 'Slotmill', href: '/lobby?provider=slotmill' },
  { id: 'popiplay', label: 'Popiplay', href: '/lobby?provider=popiplay' },
  { id: 'gameart', label: 'GameArt', href: '/lobby?provider=gameart' },
  { id: 'tomhorn', label: 'Tom Horn Gaming', href: '/lobby?provider=tomhorn' },
  { id: 'nownow', label: 'NowNow Gaming', href: '/lobby?provider=nownow' },
  { id: 'tvbet', label: 'TVBET', href: '/lobby?provider=tvbet' },
  { id: 'redrake', label: 'RedRake', href: '/lobby?provider=redrake' },
  { id: 'thehood', label: 'The Hood', href: '/lobby?provider=thehood' },
  { id: 'spribe', label: 'Spribe', href: '/lobby?provider=spribe' },
  { id: 'jaderabbit', label: 'Jade Rabbit Studio', href: '/lobby?provider=jaderabbit' },
  { id: 'bfgames', label: 'BF Games', href: '/lobby?provider=bfgames' },
  { id: 'taparoo', label: 'Tap-A-Roo', href: '/lobby?provider=taparoo' },
  { id: 'galaxsys', label: 'Galaxsys', href: '/lobby?provider=galaxsys' },
  { id: 'wazdan', label: 'Wazdan', href: '/lobby?provider=wazdan' },
  { id: 'trustygaming', label: 'Trusty Gaming', href: '/lobby?provider=trustygaming' },
  { id: 'shadylady', label: 'Shady Lady', href: '/lobby?provider=shadylady' },
  { id: 'atsupachi', label: 'Atsupachi Gaming', href: '/lobby?provider=atsupachi' },
  { id: 'blueprint', label: 'Blueprint', href: '/lobby?provider=blueprint' },
  { id: 'jdbgaming', label: 'JDB Gaming', href: '/lobby?provider=jdbgaming' },
  { id: 'ezugi', label: 'Ezugi', href: '/lobby?provider=ezugi' },
  { id: 'spinmatic', label: 'Spinmatic', href: '/lobby?provider=spinmatic' },
  { id: 'rtg', label: 'Real Time Gaming', href: '/lobby?provider=rtg' },
  { id: 'caleta', label: 'Caleta Gaming', href: '/lobby?provider=caleta' },
  { id: 'nekogames', label: 'Neko Games', href: '/lobby?provider=nekogames' },
  { id: 'waligames', label: 'WALI GAMES', href: '/lobby?provider=waligames' },
  { id: 'winfinity', label: 'Winfinity', href: '/lobby?provider=winfinity' },
  { id: 'vivogaming', label: 'Vivo Gaming', href: '/lobby?provider=vivogaming' },
  { id: 'voltent', label: 'VoltEnt', href: '/lobby?provider=voltent' },
  { id: 'sneakyslots', label: 'Sneaky Slots', href: '/lobby?provider=sneakyslots' },
];

// PC 사이드바와 동일한 그라데이션 컬러 함수
function getGradientColor(index: number, total: number) {
  const ratio = index / Math.max(total - 1, 1);
  if (ratio < 0.33) {
    const t = ratio / 0.33;
    const r = Math.round(168 + (56 - 168) * t);
    const g = Math.round(255 + (249 - 255) * t);
    const b = Math.round(120 + (215 - 120) * t);
    return { color: `rgb(${r},${g},${b})`, glow: `rgba(${Math.min(255,r+40)},${Math.min(255,g+20)},${Math.min(255,b+40)},0.5)` };
  } else if (ratio < 0.66) {
    const t = (ratio - 0.33) / 0.33;
    const r = Math.round(56 + (21 - 56) * t);
    const g = Math.round(249 + (101 - 249) * t);
    const b = Math.round(215 + (192 - 215) * t);
    return { color: `rgb(${r},${g},${b})`, glow: `rgba(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+30)},0.5)` };
  } else {
    const t = (ratio - 0.66) / 0.34;
    const r = Math.round(79 + (255 - 79) * t);
    const g = Math.round(172 + (107 - 172) * t);
    const b = Math.round(254 + (107 - 254) * t);
    return { color: `rgb(${r},${g},${b})`, glow: `rgba(${Math.min(255,r+30)},${Math.min(255,g+30)},${Math.min(255,b+30)},0.5)` };
  }
}

// 알파벳순 정렬
const SORTED_PROVIDERS = [...SLOT_PROVIDERS].sort((a, b) => a.label.localeCompare(b.label));

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isAdmin = pathname?.startsWith('/admin');
  const { t } = useLang();

  const navItems = navItemDefs.map(n => ({ ...n, label: t(n.labelKey) }));

  // 메뉴 열림 시 body 푸시
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('mobile-menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

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
        'mobile-nav-fixed md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t safe-area-bottom transition-transform duration-300',
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

      {/* 푸시 사이드바 — 하단 네비바 침범 방지 (bottom-14) */}
      <div
        className="fixed left-0 top-0 w-72 z-[70] md:hidden overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          background: '#0e0e0e',
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          bottom: '56px',
        }}
      >
        {/* 로고 */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="font-light tracking-wider text-lg"><span style={{ color: '#DAA520' }}>DR.</span><span className="text-white">SLOT</span></span>
          <button onClick={() => setMenuOpen(false)} className="p-1 text-white/40 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="py-2 pb-20">
          {/* 슬롯 — 아코디언 (하위 게임사) */}
          <button
            onClick={() => setSlotsOpen(!slotsOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-white/70 hover:text-white hover:bg-white/5 transition-all cat-btn-shine"
          >
            <div className="flex items-center gap-3">
              <img src="/cat-icons/slot.png" alt="" style={{width:20,height:20,objectFit:'contain'}} />
              <span className="text-sm font-light">{t('slots')}</span>
            </div>
            <svg
              className="w-4 h-4 transition-transform duration-300"
              style={{ transform: slotsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 슬롯 하위 게임사 — PC와 동일한 그라데이션 + 로고 */}
          <div className={`subcategory-grid ${slotsOpen ? 'expanded' : ''}`}>
            <div className="subcategory-inner">
              <Link
                href="/lobby?cat=slots"
                onClick={() => setMenuOpen(false)}
                className="sub-item cat-btn-shine flex items-center rounded-md transition-all duration-300"
                style={{
                  '--item-color': 'rgba(255,255,255,0.8)',
                  '--item-glow': 'rgba(255,255,255,0.3)',
                  height: '36px',
                  paddingLeft: '16px',
                  paddingRight: '8px',
                } as React.CSSProperties}
              >
                <span className="text-xs font-light truncate flex-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('all')} {t('slots')}
                </span>
              </Link>
              {SORTED_PROVIDERS.map((p, i) => {
                const colors = getGradientColor(i, SORTED_PROVIDERS.length);
                return (
                  <Link
                    key={p.id}
                    href={p.href}
                    onClick={() => setMenuOpen(false)}
                    className="sub-item cat-btn-shine flex items-center rounded-md transition-all duration-300"
                    style={{
                      '--item-color': colors.color,
                      '--item-glow': colors.glow,
                      height: '36px',
                      paddingLeft: '16px',
                      paddingRight: '8px',
                    } as React.CSSProperties}
                  >
                    <span className="text-xs font-light truncate flex-1" style={{ color: `${colors.color}80` }}>
                      {p.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 나머지 메뉴 */}
          {[
            { href: '/lobby?cat=live', label: t('casino'), icon: '/cat-icons/casino.png' },
            { href: '/lobby?cat=sports', label: t('sports'), icon: '/cat-icons/sports.png' },
            { href: '/mypage/coupons', label: t('promotion'), icon: '/cat-icons/프로모션.png' },
            { href: '/mypage/coupons', label: t('bonus'), icon: '/cat-icons/보너스쿠폰.png' },
            { href: '/support', label: t('partner'), icon: '/cat-icons/파트너스프로그램.png' },
            { href: '/support', label: t('support_247'), icon: '/cat-icons/247.png' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-white/70 hover:text-white hover:bg-white/5 transition-all cat-btn-shine"
            >
              <img src={item.icon} alt="" style={{width:20,height:20,objectFit:'contain'}} />
              <span className="text-sm font-light">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

// Old SVG icons removed - now using cat-icons PNG images via ImgIcon
