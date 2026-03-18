'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { isLoggedIn, decodeToken, getToken, logout } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatKRW } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

const RECENT_SEARCHES = ['Gates of Olympus', 'Sweet Bonanza', 'Fortune Tiger'];

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [nickname, setNickname] = useState('');
  const [balance, setBalance] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount] = useState(3);
  const [onlineCount, setOnlineCount] = useState(2847);
  const { t, lang, toggleLang } = useLang();

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * (3200 - 2500 + 1)) + 2500);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const walletRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoggedIn()) {
        setLoggedIn(true);
        const token = getToken();
        if (token) {
          const payload = decodeToken(token);
          if (payload?.nickname) {
            setNickname(String(payload.nickname));
          }
        }
        try {
          const res = await api.getBalance();
          if (res.data?.balance !== undefined) {
            setBalance(res.data.balance);
          }
        } catch {
          // ignore
        }
      }
    };
    checkAuth();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(22,22,22,0.95)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo + Online count */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFFFFF' }}>
            <span className="font-black text-sm" style={{ color: '#0A0A0A' }}>S</span>
          </div>
          <span className="text-xl font-light hidden sm:block tracking-wider">
            <span className="text-white">Slot</span>
            <span style={{ color: '#888888' }}>Site</span>
          </span>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4CAF50' }} />
            <span className="text-xs" style={{ color: '#555555' }}>{onlineCount.toLocaleString()} online</span>
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4" ref={searchRef}>
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#555555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder={t('search_games')}
              className={`pl-10 pr-4 py-2 border rounded-lg text-sm text-white focus:outline-none transition-all ${searchFocused ? 'w-full' : 'w-64'}`}
              style={{ background: '#0A0A0A', borderColor: 'rgba(255,255,255,0.06)', }}
            />
            {/* Recent searches dropdown */}
            {searchFocused && !searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-xl z-50 overflow-hidden dropdown-enter" style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="p-2">
                  <p className="text-[10px] uppercase tracking-wider px-2 py-1" style={{ color: '#555555' }}>{t('recent_searches')}</p>
                  {RECENT_SEARCHES.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSearchQuery(s); setSearchFocused(false); }}
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                      style={{ color: '#888888' }}
                    >
                      <svg className="w-3.5 h-3.5" style={{ color: '#555555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/lobby" className="px-3 py-2 text-sm font-light rounded-lg hover:bg-white/5 transition-all" style={{ color: '#888888' }}>
            {t('games')}
          </Link>
          <Link href="/mypage/coupons" className="px-3 py-2 text-sm font-light rounded-lg hover:bg-white/5 transition-all" style={{ color: '#888888' }}>
            {t('bonus')}
          </Link>
          <Link href="/support" className="px-3 py-2 text-sm font-light rounded-lg hover:bg-white/5 transition-all" style={{ color: '#888888' }}>
            {t('support')}
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all hover:bg-white/10"
            style={{ color: '#888888', borderColor: 'rgba(255,255,255,0.15)' }}
            title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
          >
            {lang === 'ko' ? 'EN' : 'KO'}
          </button>
          {loggedIn ? (
            <>
              {/* Notification Bell */}
              <button className="relative p-2 hover:text-white transition-colors rounded-lg hover:bg-white/5" style={{ color: '#888888' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-medium text-white" style={{ background: '#E53935' }}>
                    {notifCount}
                  </span>
                )}
              </button>

              {/* Wallet with dropdown */}
              <div className="relative" ref={walletRef}>
                <button
                  onClick={() => setWalletOpen(!walletOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors border"
                  style={{ background: '#0A0A0A', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <svg className="w-4 h-4" style={{ color: '#FFFFFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-light text-sm text-white">{formatKRW(balance)}</span>
                  <svg className={`w-3 h-3 transition-transform ${walletOpen ? 'rotate-180' : ''}`} style={{ color: '#555555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {walletOpen && (
                  <div className="absolute top-full right-0 mt-2 w-60 border rounded-xl shadow-xl z-50 dropdown-enter" style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="p-4">
                      <p className="text-xs mb-1" style={{ color: '#555555' }}>{t('held_balance')}</p>
                      <p className="text-2xl font-light text-white">{formatKRW(balance)}</p>
                    </div>
                    <div className="border-t p-3 flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <Link
                        href="/wallet?tab=deposit"
                        onClick={() => setWalletOpen(false)}
                        className="flex-1 text-center py-2.5 font-light text-sm rounded-lg hover:brightness-110 transition-all touch-active"
                        style={{ background: '#FFFFFF', color: '#0A0A0A' }}
                      >
                        {t('deposit')}
                      </Link>
                      <Link
                        href="/wallet?tab=withdraw"
                        onClick={() => setWalletOpen(false)}
                        className="flex-1 text-center py-2.5 bg-white/10 text-white font-light text-sm rounded-lg hover:bg-white/20 transition-all touch-active"
                      >
                        {t('withdrawal')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: '#888888' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-light" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}>
                    {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:inline font-light">{nickname}</span>
                  <svg className={`w-3 h-3 transition-transform ${profileOpen ? 'rotate-180' : ''}`} style={{ color: '#555555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 border rounded-xl shadow-xl z-50 overflow-hidden dropdown-enter" style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="p-1">
                      <Link
                        href="/mypage"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        style={{ color: '#888888' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('mypage')}
                      </Link>
                      <Link
                        href="/mypage/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        style={{ color: '#888888' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('settings')}
                      </Link>
                      <div className="my-1 mx-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-light rounded-lg transition-colors text-left"
                        style={{ color: '#E53935' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-light hover:text-white transition-colors rounded-lg hover:bg-white/5"
                style={{ color: '#888888' }}
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm btn-cta"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile: search + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleLang}
            className="px-2 py-1 text-[10px] font-medium rounded border transition-all"
            style={{ color: '#888888', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            {lang === 'ko' ? 'EN' : 'KO'}
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:text-white"
            style={{ color: '#888888' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('menu')}
          >
            <span className={`w-5 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('search_games')}
            autoFocus
            className="w-full px-4 py-2.5 border rounded-lg text-sm text-white focus:outline-none"
            style={{ background: '#0A0A0A', borderColor: 'rgba(255,255,255,0.06)', color: '#FFFFFF' }}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-1 animate-fade-in" style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}>
          {loggedIn ? (
            <>
              <div className="flex items-center justify-between py-3 px-2 rounded-lg mb-2" style={{ background: '#0A0A0A' }}>
                <span className="text-sm font-light" style={{ color: '#888888' }}>{nickname}</span>
                <span className="font-light text-sm text-white">{formatKRW(balance)}</span>
              </div>
              {[
                { href: '/lobby', label: t('games') },
                { href: '/wallet', label: t('wallet') },
                { href: '/mypage', label: t('mypage') },
                { href: '/mypage/coupons', label: t('bonus') },
                { href: '/support', label: t('support') },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2.5 px-2 text-sm font-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  style={{ color: '#888888' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={logout}
                className="block w-full text-left py-2.5 px-2 text-sm font-light rounded-lg"
                style={{ color: '#E53935' }}
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              {[
                { href: '/lobby', label: t('games') },
                { href: '/support', label: t('support') },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2.5 px-2 text-sm font-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  style={{ color: '#888888' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2.5 border rounded-lg text-white text-sm font-light hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center py-2.5 btn-cta text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
