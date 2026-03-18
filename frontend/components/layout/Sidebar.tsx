'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

const CATEGORIES = [
  {
    id: 'slots',
    labelKey: 'slots',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M8 4v16M16 4v16M2 12h20" />
      </svg>
    ),
    href: '/lobby?cat=slots',
    subs: [
      { id: 'all', labelKey: 'all', href: '/lobby?cat=slots' },
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
    ],
  },
  {
    id: 'live',
    labelKey: 'live',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    href: '/lobby?cat=live',
    subs: [
      { id: 'all', labelKey: 'all', href: '/lobby?cat=live' },
      { id: 'baccarat', label: 'Baccarat', href: '/lobby?cat=live&sub=baccarat' },
      { id: 'blackjack', label: 'Blackjack', href: '/lobby?cat=live&sub=blackjack' },
      { id: 'roulette', label: 'Roulette', href: '/lobby?cat=live&sub=roulette' },
      { id: 'gameshow', label: 'Game Show', href: '/lobby?cat=live&sub=gameshow' },
    ],
  },
  {
    id: 'table',
    labelKey: 'table',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M16 2v20M2 12h20" />
        <path d="M6 6h.01M12 6h.01M6 18h.01M18 18h.01" />
      </svg>
    ),
    href: '/lobby?cat=table',
    subs: [
      { id: 'all', labelKey: 'all', href: '/lobby?cat=table' },
      { id: 'poker', label: 'Poker', href: '/lobby?cat=table&sub=poker' },
      { id: 'baccarat', label: 'Baccarat', href: '/lobby?cat=table&sub=baccarat' },
      { id: 'blackjack', label: 'Blackjack', href: '/lobby?cat=table&sub=blackjack' },
    ],
  },
  {
    id: 'mini',
    labelKey: 'mini_games',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    ),
    href: '/lobby?cat=mini',
    subs: [
      { id: 'all', labelKey: 'all', href: '/lobby?cat=mini' },
      { id: 'crash', label: 'Crash', href: '/lobby?cat=mini&sub=crash' },
      { id: 'dice', label: 'Dice', href: '/lobby?cat=mini&sub=dice' },
      { id: 'hilo', label: 'Hi-Lo', href: '/lobby?cat=mini&sub=hilo' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const { t, lang, setLang } = useLang();

  const switchLang = (newLang: 'ko' | 'en') => {
    if (lang === newLang) return;
    setLang(newLang);
    window.location.reload();
  };

  const handleCatClick = (catId: string) => {
    setExpandedCat(prev => prev === catId ? null : catId);
  };

  // Hide sidebar on admin pages and mobile
  if (pathname?.startsWith('/admin')) return null;

  return (
    <aside className={cn(
      'hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] z-40 border-r transition-all duration-200 flex-shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )} style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 bg-dark-elevated border border-white/10 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-dark-card transition-colors z-10"
      >
        <svg className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex-1 overflow-y-auto py-4 px-2">
        {/* Categories with subcategory accordion */}
        <div className="space-y-1">
          {CATEGORIES.map(cat => {
            const isExpanded = expandedCat === cat.id;
            return (
              <div key={cat.id}>
                {/* Category button */}
                <button
                  onClick={() => handleCatClick(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isExpanded ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0 w-6 flex justify-center">{cat.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-light">{t(cat.labelKey)}</span>
                      <svg
                        className="w-4 h-4 transition-transform duration-300"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="sidebar-tooltip absolute left-full ml-2 px-2 py-1 bg-dark-elevated text-white text-sm rounded-md whitespace-nowrap z-50 shadow-lg">
                      {t(cat.labelKey)}
                    </div>
                  )}
                </button>

                {/* Subcategories — only when sidebar is expanded */}
                {!collapsed && (
                  <SubCategoryList cat={cat} isExpanded={isExpanded} t={t} activeSub={activeSub} setActiveSub={setActiveSub} />
                )}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 mx-3 border-t border-white/5" />
      </div>

      {/* Language Toggle */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => switchLang('ko')}
              className={`flex-1 py-2 text-xs font-light transition-all ${
                lang === 'ko'
                  ? 'bg-white text-dark-bg'
                  : 'text-text-muted hover:text-white'
              }`}
              style={lang !== 'ko' ? { background: 'rgba(255,255,255,0.03)' } : undefined}
            >
              한국어
            </button>
            <button
              onClick={() => switchLang('en')}
              className={`flex-1 py-2 text-xs font-light transition-all ${
                lang === 'en'
                  ? 'bg-white text-dark-bg'
                  : 'text-text-muted hover:text-white'
              }`}
              style={lang !== 'en' ? { background: 'rgba(255,255,255,0.03)' } : undefined}
            >
              English
            </button>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="px-2 pb-2 flex justify-center">
          <button
            onClick={() => switchLang(lang === 'ko' ? 'en' : 'ko')}
            className="group relative px-2 py-1.5 text-[10px] font-light text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            {lang === 'ko' ? 'KO' : 'EN'}
            <div className="sidebar-tooltip absolute left-full ml-2 px-2 py-1 bg-dark-elevated text-white text-sm rounded-md whitespace-nowrap z-50 shadow-lg">
              {lang === 'ko' ? 'English' : '한국어'}
            </div>
          </button>
        </div>
      )}

      {/* Bottom: 24/7 Support */}
      {!collapsed && (
        <div className="p-3">
          <Link
            href="/support"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-light">{t('customer_support_247')}</p>
              <p className="text-text-muted text-[10px] font-light">{t('live_chat')}</p>
            </div>
          </Link>
        </div>
      )}
      {collapsed && (
        <div className="p-2 flex justify-center">
          <Link href="/support" className="group relative p-2 hover:text-white transition-colors" style={{ color: '#888888' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div className="sidebar-tooltip absolute left-full ml-2 px-2 py-1 bg-dark-elevated text-white text-sm rounded-md whitespace-nowrap z-50 shadow-lg">
              {t('customer_support_247')}
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}

// 서브카테고리 리스트 — 텍스트 좌측, 로고 우측 (30% 숨김 → 선택시 100% 보임)
function SubCategoryList({ cat, isExpanded, t, activeSub, setActiveSub }: {
  cat: { subs: { id: string; labelKey?: string; label?: string; href: string; img?: string }[] };
  isExpanded: boolean;
  t: (key: string) => string;
  activeSub: string | null;
  setActiveSub: (id: string | null) => void;
}) {
  return (
    <div className={`subcategory-grid ${isExpanded ? 'expanded' : ''}`}>
      <div className="subcategory-inner">
        {cat.subs.map((sub) => {
          const isActive = activeSub === sub.id;
          return (
            <Link
              key={sub.id}
              href={sub.href}
              onClick={() => setActiveSub(isActive ? null : sub.id)}
              className={`sub-item relative flex items-center overflow-hidden rounded-md transition-all duration-300 ${
                isActive
                  ? 'bg-white/[0.08] text-white pl-5 pr-2'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.03] pl-7 pr-3'
              }`}
              style={{ height: '32px' }}
            >
              {/* 텍스트 — 좌측 정렬 */}
              <span className="text-xs font-light truncate flex-1 relative z-10">
                {sub.labelKey ? t(sub.labelKey) : sub.label}
              </span>

              {/* 로고 이미지 — 우측 정렬, 비선택시 30% 숨김 */}
              {sub.img && (
                <div
                  className="absolute top-0 bottom-0 flex items-center transition-all duration-300"
                  style={{
                    right: isActive ? '8px' : '-6px',  // 비선택: 우측으로 밀려서 30% 숨김
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sub.img}
                    alt={sub.label || ''}
                    className="h-5 w-auto object-contain transition-all duration-300"
                    style={{
                      opacity: isActive ? 1 : 0.3,
                      border: isActive ? '1px solid rgba(255,255,255,0.3)' : 'none',
                      borderRadius: '4px',
                      padding: isActive ? '1px' : '0',
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              {/* 선택시 좌측 인디케이터 */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
