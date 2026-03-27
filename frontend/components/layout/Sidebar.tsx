/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';
import { gameApi } from '@/lib/api';

// 정적 카테고리 (게임 외 네비게이션)
const STATIC_CATEGORIES = [
  {
    id: 'sports',
    labelKey: 'sports',
    icon: (<img src="/cat-icons/sports.png" alt="" style={{width:28,height:28,objectFit:'contain'}} />),
    href: '/lobby?cat=sports',
    subs: [
      { id: 'all', labelKey: 'all', href: '/lobby?cat=sports' },
      { id: 'football', label: 'Football', href: '/lobby?cat=sports&sub=football' },
      { id: 'basketball', label: 'Basketball', href: '/lobby?cat=sports&sub=basketball' },
      { id: 'tennis', label: 'Tennis', href: '/lobby?cat=sports&sub=tennis' },
      { id: 'baseball', label: 'Baseball', href: '/lobby?cat=sports&sub=baseball' },
      { id: 'esports', label: 'E-Sports', href: '/lobby?cat=sports&sub=esports' },
      { id: 'mma', label: 'MMA', href: '/lobby?cat=sports&sub=mma' },
      { id: 'volleyball', label: 'Volleyball', href: '/lobby?cat=sports&sub=volleyball' },
      { id: 'hockey', label: 'Hockey', href: '/lobby?cat=sports&sub=hockey' },
    ] as { id: string; labelKey?: string; label?: string; href: string }[],
  },
  {
    id: 'promotion',
    labelKey: 'promotion',
    icon: (<img src="/cat-icons/프로모션.png" alt="" style={{width:28,height:28,objectFit:'contain'}} />),
    href: '/promotions',
    subs: [
      { id: 'all', labelKey: 'all', href: '/promotions' },
      { id: 'welcome', label: 'Welcome Bonus', href: '/promotions?type=welcome' },
      { id: 'deposit', label: 'Deposit Bonus', href: '/promotions?type=deposit' },
      { id: 'cashback', label: 'Cashback', href: '/promotions?type=cashback' },
      { id: 'freespin', label: 'Free Spins', href: '/promotions?type=freespin' },
      { id: 'vip', label: 'VIP Exclusive', href: '/promotions?type=vip' },
    ] as { id: string; labelKey?: string; label?: string; href: string }[],
  },
  {
    id: 'bonus',
    labelKey: 'bonus',
    icon: (<img src="/cat-icons/보너스쿠폰.png" alt="" style={{width:28,height:28,objectFit:'contain'}} />),
    href: '/mypage/coupons',
    subs: [
      { id: 'all', labelKey: 'all', href: '/mypage/coupons' },
      { id: 'active', label: 'Active Bonus', href: '/mypage/coupons?tab=active' },
      { id: 'history', label: 'Bonus History', href: '/mypage/coupons?tab=history' },
      { id: 'coupon', label: 'Coupon Code', href: '/mypage/coupons?tab=coupon' },
    ] as { id: string; labelKey?: string; label?: string; href: string }[],
  },
  {
    id: 'partner',
    labelKey: 'partner',
    icon: (<img src="/cat-icons/파트너스프로그램.png" alt="" style={{width:28,height:28,objectFit:'contain'}} />),
    href: '/partners',
    subs: [
      { id: 'all', labelKey: 'all', href: '/partners' },
      { id: 'commission', label: 'Commission', href: '/partners#commission' },
      { id: 'sub-partner', label: 'Sub-Partner', href: '/partners#sub-partner' },
      { id: 'dashboard', label: 'Dashboard', href: '/partners#dashboard' },
    ] as { id: string; labelKey?: string; label?: string; href: string }[],
  },
  {
    id: 'support247',
    labelKey: 'support_247',
    icon: (<img src="/cat-icons/247.png" alt="" style={{width:28,height:28,objectFit:'contain'}} />),
    href: '/support',
    subs: [
      { id: 'all', labelKey: 'all', href: '/support' },
      { id: 'livechat', label: 'Live Chat', href: '/support?tab=chat' },
      { id: 'faq', label: 'FAQ', href: '/support?tab=faq' },
      { id: 'telegram', label: 'Telegram', href: '/support?tab=telegram' },
    ] as { id: string; labelKey?: string; label?: string; href: string }[],
  },
];

// 카지노(라이브) 고정 하위분류
const CASINO_SUBS = [
  { id: 'all', labelKey: 'all', href: '/lobby?cat=live' },
  { id: 'baccarat', label: 'Baccarat', href: '/lobby?cat=live&sub=baccarat' },
  { id: 'blackjack', label: 'Blackjack', href: '/lobby?cat=live&sub=blackjack' },
  { id: 'roulette', label: 'Roulette', href: '/lobby?cat=live&sub=roulette' },
  { id: 'gameshow', label: 'Game Show', href: '/lobby?cat=live&sub=gameshow' },
  { id: 'poker', label: 'Poker', href: '/lobby?cat=table&sub=poker' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const { t, lang, setLang } = useLang();
  const [categories, setCategories] = useState<typeof STATIC_CATEGORIES>([]);

  // API에서 프로바이더 로딩 → 슬롯 하위분류 동적 생성
  useEffect(() => {
    let mounted = true;
    (async () => {
      let slotSubs: { id: string; labelKey?: string; label?: string; href: string }[] = [
        { id: 'all', labelKey: 'all', href: '/lobby?cat=slots' },
      ];

      try {
        const res = await gameApi.getProviders();
        if (res.success && Array.isArray(res.data)) {
          const providerSubs = res.data.map((p: { name: string; game_count: number }) => ({
            id: p.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            label: `${p.name} (${p.game_count})`,
            href: `/lobby?provider=${encodeURIComponent(p.name)}`,
          }));
          slotSubs = [...slotSubs, ...providerSubs];
        }
      } catch {
        // API 실패 시 빈 하위분류
      }

      if (!mounted) return;

      const dynamicCats = [
        {
          id: 'slots',
          labelKey: 'slots',
          icon: (<img src="/cat-icons/slot.png" alt="" style={{width:28,height:28,objectFit:'contain'}} />),
          href: '/lobby?cat=slots',
          subs: slotSubs,
        },
        {
          id: 'casino',
          labelKey: 'casino',
          icon: (<img src="/cat-icons/casino.png" alt="" style={{width:28,height:28,objectFit:'contain'}} />),
          href: '/lobby?cat=live',
          subs: CASINO_SUBS,
        },
        ...STATIC_CATEGORIES,
      ];

      setCategories(dynamicCats);
    })();
    return () => { mounted = false; };
  }, []);

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
          {categories.map(cat => {
            const isExpanded = expandedCat === cat.id;
            return (
              <div key={cat.id}>
                {/* Category button — 호버 0.5s 딜레이 복귀 */}
                <button
                  onClick={() => handleCatClick(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl group/cat cat-btn-shine ${
                    isExpanded ? 'bg-white/[0.08] text-white' : 'text-white/60'
                  }`}
                  style={{
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    if (!isExpanded) {
                      el.style.background = 'transparent';
                      el.style.color = 'rgba(255,255,255,0.6)';
                      el.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center">{cat.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-base font-light">{t(cat.labelKey)}</span>
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// 그라데이션 컬러 함수 — 인덱스별 초록→청록→보라 그라데이션
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

// 서브카테고리 리스트 — 그라데이션 컬러 + 로고 클릭 애니메이션
function SubCategoryList({ cat, isExpanded, t, activeSub, setActiveSub }: {
  cat: { subs: { id: string; labelKey?: string; label?: string; href: string }[] };
  isExpanded: boolean;
  t: (key: string) => string;
  activeSub: string | null;
  setActiveSub: (id: string | null) => void;
}) {
  // all 항목 분리 + 나머지 알파벳순 정렬
  const allItem = cat.subs.find(s => s.id === 'all');
  const restSorted = cat.subs
    .filter(s => s.id !== 'all')
    .sort((a, b) => (a.label || '').localeCompare(b.label || ''));
  const sortedSubs = allItem ? [allItem, ...restSorted] : restSorted;

  return (
    <div className={`subcategory-grid ${isExpanded ? 'expanded' : ''}`}>
      <div className="subcategory-inner">
        {sortedSubs.map((sub, idx) => {
          const isActive = activeSub === sub.id;
          // all 항목은 컬러 없이 기본 흰색
          const colors = sub.id === 'all'
            ? { color: 'rgba(255,255,255,0.8)', glow: 'rgba(255,255,255,0.3)' }
            : getGradientColor(idx - (allItem ? 1 : 0), restSorted.length);

          const handleClick = (e: React.MouseEvent) => {
            setActiveSub(isActive ? null : sub.id);
            const el = e.currentTarget as HTMLElement;

            // 테두리 플래시
            el.classList.remove('border-click');
            void el.offsetWidth;
            el.classList.add('border-click');
            setTimeout(() => el.classList.remove('border-click'), 2000);
          };

          return (
            <Link
              key={sub.id}
              href={sub.href}
              onClick={handleClick}
              className="sub-item cat-btn-shine flex items-center rounded-md transition-all duration-300"
              style={{
                '--item-color': colors.color,
                '--item-glow': colors.glow,
                height: '32px',
                paddingLeft: isActive ? '12px' : '28px',
                paddingRight: '8px',
              } as React.CSSProperties}
            >
              {/* 좌측 인디케이터 */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full" style={{ background: colors.color }} />
              )}

              {/* 게임사 이름 — 그라데이션 컬러 */}
              <span className="text-xs font-light truncate flex-1" style={{ color: isActive ? colors.color : `${colors.color}80` }}>
                {sub.labelKey ? t(sub.labelKey) : sub.label}
              </span>

              {/* imgxcut.com 로고 제거됨 — 텍스트만 표시 */}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
