'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

const categoryDefs = [
  {
    href: '/lobby?cat=slot',
    labelKey: 'slots',
    count: 142,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M8 4v16M16 4v16M2 12h20" />
      </svg>
    ),
  },
  {
    href: '/lobby?cat=live',
    labelKey: 'live',
    count: 38,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    href: '/lobby?cat=table',
    labelKey: 'table',
    count: 25,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M16 2v20M2 12h20" />
        <path d="M6 6h.01M12 6h.01M6 18h.01M18 18h.01" />
      </svg>
    ),
  },
  {
    href: '/lobby?cat=mini',
    labelKey: 'mini_games',
    count: 15,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    ),
  },
];

const providers = [
  'Pragmatic Play',
  'PG Soft',
  'Evolution',
  'NetEnt',
  'Microgaming',
  "Play'n GO",
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [providersOpen, setProvidersOpen] = useState(false);
  const { t } = useLang();

  const categories = categoryDefs.map(c => ({ ...c, label: t(c.labelKey) }));

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
        {/* Categories */}
        <div className="space-y-1">
          {categories.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href.split('?')[0]));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-light',
                  isActive
                    ? ''
                    : 'hover:text-white hover:bg-white/5'
                )}
                style={isActive ? { background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' } : { color: '#888888' }}
              >
                <span className="flex-shrink-0 w-6 flex justify-center">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <span className="px-1.5 py-0.5 bg-white/5 text-text-muted text-[10px] font-light rounded-md">
                      {item.count}
                    </span>
                  </>
                )}
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="sidebar-tooltip absolute left-full ml-2 px-2 py-1 bg-dark-elevated text-white text-sm rounded-md whitespace-nowrap z-50 shadow-lg">
                    {item.label} ({item.count})
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 mx-3 border-t border-white/5" />

        {/* Providers */}
        {!collapsed ? (
          <div>
            <button
              onClick={() => setProvidersOpen(!providersOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-light text-text-muted uppercase tracking-wider hover:text-white transition-colors"
            >
              <span>{t('providers')}</span>
              <svg
                className={`w-3 h-3 transition-transform ${providersOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {providersOpen && (
              <div className="space-y-0.5 mt-1 animate-fade-in">
                {providers.map(p => (
                  <Link
                    key={p}
                    href={`/lobby?provider=${encodeURIComponent(p)}`}
                    className="block px-3 py-2 text-xs font-light text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="group relative">
              <button className="p-2 text-text-muted hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <div className="sidebar-tooltip absolute left-full ml-2 px-2 py-1 bg-dark-elevated text-white text-sm rounded-md whitespace-nowrap z-50 shadow-lg">
                {t('providers')}
              </div>
            </div>
          </div>
        )}
      </div>

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
