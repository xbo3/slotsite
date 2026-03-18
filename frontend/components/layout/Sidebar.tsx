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
      { id: 'pragmatic', label: 'Pragmatic Play', href: '/lobby?cat=slots&provider=pragmatic' },
      { id: 'pgsoft', label: 'PG Soft', href: '/lobby?cat=slots&provider=pgsoft' },
      { id: 'boongo', label: 'Boongo', href: '/lobby?cat=slots&provider=boongo' },
      { id: 'giri', label: 'GIRI', href: '/lobby?cat=slots&provider=giri' },
      { id: 'nolimit', label: 'Nolimit City', href: '/lobby?cat=slots&provider=nolimit' },
      { id: 'playngo', label: "Play'n GO", href: '/lobby?cat=slots&provider=playngo' },
      { id: 'netent', label: 'NetEnt', href: '/lobby?cat=slots&provider=netent' },
      { id: 'redtiger', label: 'Red Tiger', href: '/lobby?cat=slots&provider=redtiger' },
      { id: 'btg', label: 'Big Time Gaming', href: '/lobby?cat=slots&provider=btg' },
      { id: 'habanero', label: 'Habanero', href: '/lobby?cat=slots&provider=habanero' },
      { id: 'spadegaming', label: 'Spade Gaming', href: '/lobby?cat=slots&provider=spadegaming' },
      { id: 'cq9', label: 'CQ9', href: '/lobby?cat=slots&provider=cq9' },
      { id: 'evoplay', label: 'Evoplay', href: '/lobby?cat=slots&provider=evoplay' },
      { id: 'wazdan', label: 'Wazdan', href: '/lobby?cat=slots&provider=wazdan' },
      { id: 'yggdrasil', label: 'Yggdrasil', href: '/lobby?cat=slots&provider=yggdrasil' },
      { id: 'thunderkick', label: 'Thunderkick', href: '/lobby?cat=slots&provider=thunderkick' },
      { id: 'hacksaw', label: 'Hacksaw Gaming', href: '/lobby?cat=slots&provider=hacksaw' },
      { id: 'relax', label: 'Relax Gaming', href: '/lobby?cat=slots&provider=relax' },
      { id: 'pushgaming', label: 'Push Gaming', href: '/lobby?cat=slots&provider=pushgaming' },
      { id: 'blueprint', label: 'Blueprint', href: '/lobby?cat=slots&provider=blueprint' },
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
                  <div className={`subcategory-grid ${isExpanded ? 'expanded' : ''}`}>
                    <div className="subcategory-inner">
                      {cat.subs.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className="sub-item block pl-9 pr-3 py-1.5 text-xs font-light text-white/40 hover:text-white hover:bg-white/[0.05] rounded-md transition-colors"
                        >
                          {sub.labelKey ? t(sub.labelKey) : sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
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
