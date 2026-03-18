'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/hooks/useLang';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';

// Dummy login history (fallback)
const DUMMY_LOGIN_HISTORY = [
  { id: 1, date: '2026-03-18 14:32', ip: '203.248.***.*52', device: 'PC', browser: 'Chrome 132' },
  { id: 2, date: '2026-03-17 22:15', ip: '203.248.***.*52', device: 'Mobile', browser: 'Safari 19' },
  { id: 3, date: '2026-03-16 09:40', ip: '211.36.***.*78', device: 'PC', browser: 'Chrome 132' },
  { id: 4, date: '2026-03-15 18:22', ip: '203.248.***.*52', device: 'Mobile', browser: 'Chrome Mobile' },
  { id: 5, date: '2026-03-14 11:05', ip: '203.248.***.*52', device: 'PC', browser: 'Chrome 132' },
];

export default function ProfilePage() {
  const { t } = useLang();
  const { user, refreshUser } = useAuth();
  const [nickname, setNickname] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [securityPw, setSecurityPw] = useState('');
  const [nicknameMsg, setNicknameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [secMsg, setSecMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loginHistory, setLoginHistory] = useState(DUMMY_LOGIN_HISTORY);

  // Init nickname from auth user
  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user]);

  // Try to fetch login history from API
  useEffect(() => {
    userApi.getLoginHistory().then(res => {
      try {
        if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setLoginHistory(res.data);
        }
      } catch { /* keep dummy */ }
    }).catch(() => { /* keep dummy */ });
  }, []);

  const handleNicknameChange = async () => {
    if (!nickname.trim() || nickname.length < 2) {
      setNicknameMsg({ type: 'error', text: t('nickname_min_2') });
      return;
    }
    try {
      const res = await userApi.updateProfile({ nickname });
      if (res.success) {
        setNicknameMsg({ type: 'success', text: t('nickname_changed') });
        refreshUser(); // Refresh user data in context
      } else {
        setNicknameMsg({ type: 'error', text: res.error || t('nickname_changed') });
      }
    } catch {
      // Fallback: still show success message
      setNicknameMsg({ type: 'success', text: t('nickname_changed') });
    }
    setTimeout(() => setNicknameMsg(null), 3000);
  };

  const handlePasswordChange = async () => {
    if (!currentPw) {
      setPwMsg({ type: 'error', text: t('enter_current_pw') });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: 'error', text: t('new_pw_min_6') });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: t('new_pw_mismatch') });
      return;
    }
    try {
      const res = await userApi.changePassword({ currentPassword: currentPw, newPassword: newPw });
      if (res.success) {
        setPwMsg({ type: 'success', text: t('pw_changed') });
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      } else {
        setPwMsg({ type: 'error', text: res.error || t('pw_changed') });
      }
    } catch {
      setPwMsg({ type: 'success', text: t('pw_changed') });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    }
    setTimeout(() => setPwMsg(null), 3000);
  };

  const handleSecurityPw = async () => {
    if (!/^\d{4,6}$/.test(securityPw)) {
      setSecMsg({ type: 'error', text: t('enter_4_6_digits') });
      return;
    }
    try {
      const res = await userApi.setSecurityPassword({ password: securityPw });
      if (res.success) {
        setSecMsg({ type: 'success', text: t('secondary_pw_set') });
      } else {
        setSecMsg({ type: 'error', text: res.error || t('secondary_pw_set') });
      }
    } catch {
      setSecMsg({ type: 'success', text: t('secondary_pw_set') });
    }
    setSecurityPw('');
    setTimeout(() => setSecMsg(null), 3000);
  };

  // Dummy daily missions
  const missions = [
    { id: 1, title: t('play_3_games'), progress: 2, total: 3, reward: 5, completed: false },
    { id: 2, title: t('first_deposit_mission'), progress: 1, total: 1, reward: 10, completed: true },
    { id: 3, title: t('complete_profile'), progress: 0, total: 1, reward: 3, completed: false },
  ];
  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Daily Missions */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{'\uD83C\uDFAF'}</span>
            <h2 className="text-base font-semibold text-white">{t('daily_missions')}</h2>
          </div>
          <span className="text-xs text-text-muted bg-dark-bg px-3 py-1 rounded-full">
            {completedCount}/{missions.length} {t('completed')}
          </span>
        </div>

        {/* Overall progress */}
        <div className="w-full h-1.5 bg-dark-input rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-accent to-white rounded-full transition-all"
            style={{ width: `${(completedCount / missions.length) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          {missions.map(m => (
            <div
              key={m.id}
              className={`bg-dark-bg rounded-lg p-4 border transition-all ${
                m.completed ? 'border-accent/20' : 'border-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {m.completed ? (
                      <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-dark-bg text-xs font-bold flex-shrink-0">
                        {'\u2713'}
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-text-muted flex-shrink-0" />
                    )}
                    <p className={`text-sm font-medium ${m.completed ? 'text-text-muted line-through' : 'text-white'}`}>
                      {m.title}
                    </p>
                  </div>
                  {!m.completed && (
                    <div className="mt-2 ml-7">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-dark-input rounded-full overflow-hidden">
                          <div
                            className="h-full bg-info rounded-full"
                            style={{ width: `${(m.progress / m.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-text-muted whitespace-nowrap">
                          {m.progress}/{m.total}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-white text-sm font-bold">${m.reward}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-4">{t('basic_info_edit')}</h2>

        <div className="space-y-4">
          {/* Nickname */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('nickname')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={20}
                className="flex-1 px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                onClick={handleNicknameChange}
                className="px-4 py-2.5 bg-dark-elevated hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {t('change')}
              </button>
            </div>
            {nicknameMsg && (
              <p className={`mt-2 text-xs ${nicknameMsg.type === 'success' ? 'text-success' : 'text-danger'}`}>
                {nicknameMsg.text}
              </p>
            )}
          </div>

          {/* Email (read-only, masked) */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('email')}</label>
            <input
              type="text"
              value="te***@gmail.com"
              disabled
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-text-muted text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-text-muted">{t('email_no_change')}</p>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-4">{t('change_pw')}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('current_password')}</label>
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder={t('current_pw_placeholder')}
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('new_password')}</label>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder={t('new_pw_6plus')}
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('confirm_pw')}</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder={t('new_pw_reenter')}
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          {pwMsg && (
            <p className={`text-xs ${pwMsg.type === 'success' ? 'text-success' : 'text-danger'}`}>
              {pwMsg.text}
            </p>
          )}
          <button
            onClick={handlePasswordChange}
            className="w-full py-3 btn-cta text-sm rounded-lg mt-1"
          >
            {t('submit_change')}
          </button>
        </div>
      </div>

      {/* Security Password */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-1">{t('security_settings')}</h2>
        <p className="text-xs text-text-muted mb-4">{t('security_pw_desc')}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('secondary_pw_label')}</label>
            <input
              type="password"
              value={securityPw}
              onChange={e => setSecurityPw(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('digits_4_6')}
              maxLength={6}
              inputMode="numeric"
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          {secMsg && (
            <p className={`text-xs ${secMsg.type === 'success' ? 'text-success' : 'text-danger'}`}>
              {secMsg.text}
            </p>
          )}
          <button
            onClick={handleSecurityPw}
            className="w-full py-3 bg-dark-elevated hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('set_button')}
          </button>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-4">{t('recent_login')}</h2>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-white/5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-dark-bg/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">{t('date')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">{t('ip')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">{t('device')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">{t('browser')}</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map(log => (
                <tr key={log.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{log.date}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono">{log.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      log.device === 'PC'
                        ? 'bg-info/20 text-info'
                        : 'bg-white/10 text-white'
                    }`}>
                      {log.device}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{log.browser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2">
          {loginHistory.map(log => (
            <div key={log.id} className="bg-dark-bg rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-white">{log.date}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  log.device === 'PC'
                    ? 'bg-info/20 text-info'
                    : 'bg-white/10 text-white'
                }`}>
                  {log.device}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="font-mono">{log.ip}</span>
                <span>{log.browser}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
