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

const SLOT_PROVIDERS = [
  { id: 'evolution', label: 'Evolution Gaming', href: '/lobby?provider=evolution', img: 'https://imgxcut.com/game/image/9c40f44618.png' },
  { id: 'boongo', label: 'Booongo', href: '/lobby?provider=boongo', img: 'https://imgxcut.com/game/image/c9c8ea471b.png' },
  { id: 'microgaming', label: 'Microgaming', href: '/lobby?provider=microgaming', img: 'https://imgxcut.com/game/image/5030317209.png' },
  { id: 'sexygaming', label: 'Sexy Gaming', href: '/lobby?provider=sexygaming', img: 'https://imgxcut.com/game/image/2e8e44ae59.png' },
  { id: 'pgsoft', label: 'PG Soft', href: '/lobby?provider=pgsoft', img: 'https://imgxcut.com/game/image/128992a35d.png' },
  { id: 'hacksaw', label: 'Hacksaw', href: '/lobby?provider=hacksaw', img: 'https://imgxcut.com/game/image/ccf8045f30.png' },
  { id: 'nolimit', label: 'NoLimitCity', href: '/lobby?provider=nolimit', img: 'https://imgxcut.com/game/image/1f7914af40.png' },
  { id: 'advantplay', label: 'AdvantPlay', href: '/lobby?provider=advantplay', img: 'https://imgxcut.com/game/image/7a8603b60e.png' },
  { id: 'redtiger', label: 'Red Tiger', href: '/lobby?provider=redtiger', img: 'https://imgxcut.com/game/image/651ed6cb08.png' },
  { id: 'fatpanda', label: 'Fat Panda', href: '/lobby?provider=fatpanda', img: 'https://imgxcut.com/game/image/bf9711c9c6.png' },
  { id: 'habanero', label: 'Habanero', href: '/lobby?provider=habanero', img: 'https://imgxcut.com/game/image/1600322b49.png' },
  { id: 'jdb', label: 'JDB', href: '/lobby?provider=jdb', img: 'https://imgxcut.com/game/image/b7afeab59d.png' },
  { id: 'netent', label: 'NetEnt', href: '/lobby?provider=netent', img: 'https://imgxcut.com/game/image/50e7c80e3a.png' },
  { id: 'jili', label: 'JILI', href: '/lobby?provider=jili', img: 'https://imgxcut.com/game/image/11dec4b4c5.png' },
  { id: 'spadegaming', label: 'Spadegaming', href: '/lobby?provider=spadegaming', img: 'https://imgxcut.com/game/image/408156443a.png' },
  { id: 'skywind', label: 'Skywind', href: '/lobby?provider=skywind', img: 'https://imgxcut.com/game/image/ffcc4827a8.png' },
  { id: 'btg', label: 'Big Time Gaming', href: '/lobby?provider=btg', img: 'https://imgxcut.com/game/image/dd8ef215f6.png' },
  { id: 'fachai', label: 'FA CHAI', href: '/lobby?provider=fachai', img: 'https://imgxcut.com/game/image/b6fa55fc56.png' },
  { id: 'pragmatic', label: 'Pragmatic Play', href: '/lobby?provider=pragmatic', img: 'https://imgxcut.com/game/image/0ed1c4fe40.png' },
  { id: '1spin4win', label: '1Spin4Win', href: '/lobby?provider=1spin4win', img: 'https://imgxcut.com/game/image/46e85c6609.png' },
  { id: 'endorphina', label: 'Endorphina', href: '/lobby?provider=endorphina', img: 'https://imgxcut.com/game/image/311c691438.png' },
  { id: 'bgaming', label: 'BGaming', href: '/lobby?provider=bgaming', img: 'https://imgxcut.com/game/image/75b5d81876.png' },
  { id: 'fazi', label: 'Fazi', href: '/lobby?provider=fazi', img: 'https://imgxcut.com/game/image/63fd72ebf2.png' },
  { id: 'penguinking', label: 'Penguin King', href: '/lobby?provider=penguinking', img: 'https://imgxcut.com/game/image/d491d907d7.png' },
  { id: 'inout', label: 'InOut', href: '/lobby?provider=inout', img: 'https://imgxcut.com/game/image/18139477b2.png' },
  { id: 'booming', label: 'Booming', href: '/lobby?provider=booming', img: 'https://imgxcut.com/game/image/1deccce607.png' },
  { id: 'rubyplay', label: 'Ruby Play', href: '/lobby?provider=rubyplay', img: 'https://imgxcut.com/game/image/9aaca2713b.png' },
  { id: 'onlyplay', label: 'OnlyPlay', href: '/lobby?provider=onlyplay', img: 'https://imgxcut.com/game/image/ec35f0cabe.png' },
  { id: 'relaxgaming', label: 'Relax Gaming', href: '/lobby?provider=relaxgaming', img: 'https://imgxcut.com/game/image/bf6887c12b.png' },
  { id: 'backseat', label: 'Backseat', href: '/lobby?provider=backseat', img: 'https://imgxcut.com/game/image/86443046ce.png' },
  { id: 'funtagaming', label: 'FunTa Gaming', href: '/lobby?provider=funtagaming', img: 'https://imgxcut.com/game/image/1a8699e3a1.png' },
  { id: 'amigogaming', label: 'Amigo Gaming', href: '/lobby?provider=amigogaming', img: 'https://imgxcut.com/game/image/d6d95c1dde.png' },
  { id: 'novomatic', label: 'Novomatic', href: '/lobby?provider=novomatic', img: 'https://imgxcut.com/game/image/4047f2dada.png' },
  { id: 'platipus', label: 'Platipus', href: '/lobby?provider=platipus', img: 'https://imgxcut.com/game/image/9aec8f2b38.png' },
  { id: 'betsoft', label: 'BetSoft', href: '/lobby?provider=betsoft', img: 'https://imgxcut.com/game/image/e1162a0386.png' },
  { id: 'thunderkick', label: 'Thunderkick', href: '/lobby?provider=thunderkick', img: 'https://imgxcut.com/game/image/f6d618de9c.png' },
  { id: 'belatra', label: 'Belatra', href: '/lobby?provider=belatra', img: 'https://imgxcut.com/game/image/6bf141b73a.png' },
  { id: 'avatarux', label: 'AvatarUX', href: '/lobby?provider=avatarux', img: 'https://imgxcut.com/game/image/fa86aec911.png' },
  { id: 'popokgaming', label: 'PopOk Gaming', href: '/lobby?provider=popokgaming', img: 'https://imgxcut.com/game/image/a3d3a3b1ac.png' },
  { id: 'smartsoft', label: 'SmartSoft Gaming', href: '/lobby?provider=smartsoft', img: 'https://imgxcut.com/game/image/40542a64f2.png' },
  { id: 'bullshark', label: 'Bullshark', href: '/lobby?provider=bullshark', img: 'https://imgxcut.com/game/image/4020d8470e.png' },
  { id: 'pegasus', label: 'Pegasus', href: '/lobby?provider=pegasus', img: 'https://imgxcut.com/game/image/bb96fcdaf2.png' },
  { id: 'spinomenal', label: 'Spinomenal', href: '/lobby?provider=spinomenal', img: 'https://imgxcut.com/game/image/96e8551016.png' },
  { id: 'quickspin', label: 'Quickspin', href: '/lobby?provider=quickspin', img: 'https://imgxcut.com/game/image/3861400bec.png' },
  { id: '1x2gaming', label: '1x2 Gaming', href: '/lobby?provider=1x2gaming', img: 'https://imgxcut.com/game/image/ef623e6158.png' },
  { id: 'slotmill', label: 'Slotmill', href: '/lobby?provider=slotmill', img: 'https://imgxcut.com/game/image/b14c4907d7.png' },
  { id: 'popiplay', label: 'Popiplay', href: '/lobby?provider=popiplay', img: 'https://imgxcut.com/game/image/7d95aaa8bc.png' },
  { id: 'gameart', label: 'GameArt', href: '/lobby?provider=gameart', img: 'https://imgxcut.com/game/image/65c347aca8.png' },
  { id: 'tomhorn', label: 'Tom Horn Gaming', href: '/lobby?provider=tomhorn', img: 'https://imgxcut.com/game/image/591a3fa8a2.png' },
  { id: 'nownow', label: 'NowNow Gaming', href: '/lobby?provider=nownow', img: 'https://imgxcut.com/game/image/dd4ab6808d.png' },
  { id: 'tvbet', label: 'TVBET', href: '/lobby?provider=tvbet', img: 'https://imgxcut.com/game/image/34568ae274.png' },
  { id: 'redrake', label: 'RedRake', href: '/lobby?provider=redrake', img: 'https://imgxcut.com/game/image/5f408a87a5.png' },
  { id: 'thehood', label: 'The Hood', href: '/lobby?provider=thehood', img: 'https://imgxcut.com/game/image/17eb7575e2.png' },
  { id: 'spribe', label: 'Spribe', href: '/lobby?provider=spribe', img: 'https://imgxcut.com/game/image/e03d7b925f.png' },
  { id: 'jaderabbit', label: 'Jade Rabbit Studio', href: '/lobby?provider=jaderabbit', img: 'https://imgxcut.com/game/image/e2b7761aac.png' },
  { id: 'bfgames', label: 'BF Games', href: '/lobby?provider=bfgames', img: 'https://imgxcut.com/game/image/e4c0234846.png' },
  { id: 'taparoo', label: 'Tap-A-Roo', href: '/lobby?provider=taparoo', img: 'https://imgxcut.com/game/image/db38919d0c.png' },
  { id: 'galaxsys', label: 'Galaxsys', href: '/lobby?provider=galaxsys', img: 'https://imgxcut.com/game/image/a98ed75f1e.png' },
  { id: 'wazdan', label: 'Wazdan', href: '/lobby?provider=wazdan', img: 'https://imgxcut.com/game/image/826ecb0385.png' },
  { id: 'trustygaming', label: 'Trusty Gaming', href: '/lobby?provider=trustygaming', img: 'https://imgxcut.com/game/image/e05b242a5e.png' },
  { id: 'shadylady', label: 'Shady Lady', href: '/lobby?provider=shadylady', img: 'https://imgxcut.com/game/image/a36340728d.png' },
  { id: 'atsupachi', label: 'Atsupachi Gaming', href: '/lobby?provider=atsupachi', img: 'https://imgxcut.com/game/image/126d2fd39e.png' },
  { id: 'blueprint', label: 'Blueprint', href: '/lobby?provider=blueprint', img: 'https://imgxcut.com/game/image/b12f8fcf83.png' },
  { id: 'jdbgaming', label: 'JDB Gaming', href: '/lobby?provider=jdbgaming', img: 'https://imgxcut.com/game/image/19e415fe43.png' },
  { id: 'ezugi', label: 'Ezugi', href: '/lobby?provider=ezugi', img: 'https://imgxcut.com/game/image/5e9d393fde.png' },
  { id: 'spinmatic', label: 'Spinmatic', href: '/lobby?provider=spinmatic', img: 'https://imgxcut.com/game/image/041e91d42e.png' },
  { id: 'rtg', label: 'Real Time Gaming', href: '/lobby?provider=rtg', img: 'https://imgxcut.com/game/image/d9f0c93a08.png' },
  { id: 'caleta', label: 'Caleta Gaming', href: '/lobby?provider=caleta', img: 'https://imgxcut.com/game/image/b88c82bdd7.png' },
  { id: 'nekogames', label: 'Neko Games', href: '/lobby?provider=nekogames', img: 'https://imgxcut.com/game/image/32f0dc4f00.png' },
  { id: 'waligames', label: 'WALI GAMES', href: '/lobby?provider=waligames', img: 'https://imgxcut.com/game/image/3edda86a11.png' },
  { id: 'winfinity', label: 'Winfinity', href: '/lobby?provider=winfinity', img: 'https://imgxcut.com/game/image/ca2c0677f4.png' },
  { id: 'vivogaming', label: 'Vivo Gaming', href: '/lobby?provider=vivogaming', img: 'https://imgxcut.com/game/image/e263acc7ab.png' },
  { id: 'voltent', label: 'VoltEnt', href: '/lobby?provider=voltent', img: 'https://imgxcut.com/game/image/ce79f0a41b.png' },
  { id: 'sneakyslots', label: 'Sneaky Slots', href: '/lobby?provider=sneakyslots', img: 'https://imgxcut.com/game/image/43f46874d3.png' },
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
              <span className="text-lg">🎰</span>
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
                    {p.img && (
                      <img
                        src={p.img}
                        alt=""
                        className="provider-logo object-contain"
                        style={{
                          height: '18px',
                          width: 'auto',
                          opacity: 0.5,
                          transition: 'all 0.3s ease',
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 나머지 메뉴 */}
          {[
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
              className="flex items-center gap-3 px-4 py-3.5 text-white/70 hover:text-white hover:bg-white/5 transition-all cat-btn-shine"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-light">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
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
