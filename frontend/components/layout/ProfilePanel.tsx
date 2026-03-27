'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatKRW } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, logout } = useAuth();
  const { t } = useLang();

  const nickname = user?.nickname || '';
  const username = user?.username || '';
  const balance = user ? Number(user.balance) || 0 : 0;

  // ESC 키로 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const menuItems = [
    { emoji: '\uD83D\uDCB0', label: t('held_balance'), value: formatKRW(balance), href: '' },
    { emoji: '\uD83C\uDF81', label: t('bonus') || '보너스함', href: '/mypage/coupons' },
    { emoji: '\uD83D\uDCCA', label: t('vip_club') || '등급 혜택', href: '/mypage/vip' },
    { emoji: '\uD83D\uDCB3', label: t('deposit_menu') || '입금', href: '/wallet?tab=deposit' },
    { emoji: '\uD83D\uDCB8', label: t('withdraw_menu') || '출금', href: '/wallet?tab=withdraw' },
    { emoji: '\uD83D\uDD12', label: '금고', href: '', badge: '준비중' },
    { emoji: '\uD83D\uDCE9', label: '쪽지', href: '', badge: '준비중' },
    { emoji: '\uD83D\uDCDC', label: t('bet_history') || '베팅 기록', href: '/mypage/bets' },
    { emoji: '\u2699\uFE0F', label: t('global_setting') || '설정', href: '/mypage' },
  ];

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-[60] transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* 패널 */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[61] w-[320px] max-w-[85vw] flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-default)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* 상단: 프로필 정보 */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 아바타 */}
          <div className="flex items-center gap-3 mt-1">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-light flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
            >
              {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-base font-light text-white truncate">{nickname}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{username}</p>
            </div>
          </div>

          {/* VIP 배지 */}
          <div className="mt-3">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
              VIP BRONZE
            </span>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="flex-1 p-3">
          {menuItems.map((item, idx) => {
            // 잔액 항목 (링크 아님)
            if (idx === 0) {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-3 rounded-lg mb-1"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="flex items-center gap-2.5 text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-base">{item.emoji}</span>
                    {item.label}
                  </span>
                  <span className="text-sm font-light text-white">{item.value}</span>
                </div>
              );
            }

            // 준비중 뱃지 항목
            if (item.badge) {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-3 rounded-lg mb-0.5 cursor-not-allowed"
                  style={{ opacity: 0.5 }}
                >
                  <span className="flex items-center gap-2.5 text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-base">{item.emoji}</span>
                    {item.label}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}
                  >
                    {item.badge}
                  </span>
                </div>
              );
            }

            // 일반 메뉴 링크
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 px-3 py-3 rounded-lg mb-0.5 text-sm font-light hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* 하단: 로그아웃 */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-light transition-colors hover:bg-white/5"
            style={{ color: 'var(--danger)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('logout') || '로그아웃'}
          </button>
        </div>
      </div>
    </>
  );
}
