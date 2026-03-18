'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/hooks/useLang';

function getPasswordStrength(pw: string): { level: number; labelKey: string; color: string } {
  if (pw.length === 0) return { level: 0, labelKey: '', color: '' };
  if (pw.length < 8) return { level: 1, labelKey: 'pw_weak', color: 'bg-danger' };
  let score = 0;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, labelKey: 'pw_weak', color: 'bg-danger' };
  if (score === 2) return { level: 2, labelKey: 'pw_medium', color: 'bg-warning' };
  return { level: 3, labelKey: 'pw_strong', color: 'bg-success' };
}

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const { register, isLoggedIn, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    phone: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in -> redirect
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/');
    }
  }, [authLoading, isLoggedIn, router]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validation
  const usernameValid = form.username.length >= 4;
  const pwStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const pwMatch = form.password.length > 0 && form.password === form.passwordConfirm;
  const pwMismatch = form.passwordConfirm.length > 0 && form.password !== form.passwordConfirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.password) {
      setError(t('required_fields'));
      return;
    }

    if (form.username.length < 4) {
      setError(t('username_min'));
      return;
    }

    if (form.password.length < 8) {
      setError(t('pw_min'));
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setError(t('pw_mismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        username: form.username,
        password: form.password,
        nickname: form.nickname || form.username,
        phone: form.phone || undefined,
      });

      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || t('register_failed'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('register_error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch animate-fade-in">
      {/* Left side — decorative (md+) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-dark-bg to-info/10" />
        <div className="absolute inset-0" style={{ filter: 'blur(60px)' }}>
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-accent/20 rounded-full" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-white/15 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-info/15 rounded-full" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="text-7xl mb-6">{'\uD83C\uDFB0'}</div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            {t('signup_bonus_title')}
            <br />
            <span className="bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
              {t('signup_bonus_amount')}
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            {t('signup_bonus_desc1')}
            <br />{t('signup_bonus_desc2')}
          </p>
          <div className="mt-8 flex justify-center gap-6 text-text-muted text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              {t('games_count')}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full" />
              {t('instant_withdraw')}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-info rounded-full" />
              {t('247_support')}
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-dark-card rounded-2xl p-8 shadow-2xl border border-white/5">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">{t('register_title')}</h1>
              <p className="mt-2 text-text-secondary text-sm">
                {t('register_subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm text-text-secondary mb-1.5">
                  {t('username')} <span className="text-danger">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => updateForm('username', e.target.value)}
                  placeholder={t('username_placeholder')}
                  className={`w-full px-4 py-3 bg-dark-input border rounded-lg text-white placeholder-text-muted focus:outline-none transition-colors ${
                    form.username.length > 0
                      ? usernameValid
                        ? 'border-success/50 focus:border-success focus:ring-1 focus:ring-success/30'
                        : 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/30'
                      : 'border-white/5 focus:border-accent/50 focus:ring-1 focus:ring-accent/30'
                  }`}
                  autoComplete="username"
                />
                {form.username.length > 0 && !usernameValid && (
                  <p className="mt-1 text-xs text-danger">{t('username_min_msg')}</p>
                )}
                {usernameValid && (
                  <p className="mt-1 text-xs text-success">{t('username_valid')}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
                  {t('password')} <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    placeholder={t('pw_placeholder')}
                    className="w-full px-4 py-3 pr-12 bg-dark-input border border-white/5 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPw ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= pwStrength.level ? pwStrength.color : 'bg-dark-elevated'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${pwStrength.level === 1 ? 'text-danger' : pwStrength.level === 2 ? 'text-warning' : 'text-success'}`}>
                      {t('pw_strength')}: {t(pwStrength.labelKey)}
                    </p>
                  </div>
                )}
              </div>

              {/* Password Confirm */}
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm text-text-secondary mb-1.5">
                  {t('confirm_password')} <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    type={showPwConfirm ? 'text' : 'password'}
                    value={form.passwordConfirm}
                    onChange={(e) => updateForm('passwordConfirm', e.target.value)}
                    placeholder={t('pw_confirm_placeholder')}
                    className={`w-full px-4 py-3 pr-12 bg-dark-input border rounded-lg text-white placeholder-text-muted focus:outline-none transition-colors ${
                      form.passwordConfirm.length > 0
                        ? pwMatch
                          ? 'border-success/50 focus:border-success focus:ring-1 focus:ring-success/30'
                          : 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/30'
                        : 'border-white/5 focus:border-accent/50 focus:ring-1 focus:ring-accent/30'
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwConfirm(!showPwConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPwConfirm ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {pwMatch && <p className="mt-1 text-xs text-success">{t('pw_match')}</p>}
                {pwMismatch && <p className="mt-1 text-xs text-danger">{t('pw_mismatch')}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 btn-cta text-sm rounded-lg mt-2 ${loading ? 'btn-loading' : ''}`}
              >
                {loading ? t('registering') : t('register_btn')}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-dark-card text-text-muted">{t('or')}</span>
              </div>
            </div>

            {/* Social Login Buttons (UI only) */}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-white text-sm font-medium transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.93.46 3.74 1.18 5.35l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 rounded-lg text-[#0088cc] text-sm font-medium transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-text-secondary">
              {t('already_have_account')}{' '}
              <Link href="/login" className="text-white hover:text-white/80 transition-colors">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
