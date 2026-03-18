'use client';

import { useState } from 'react';

// Dummy login history
const DUMMY_LOGIN_HISTORY = [
  { id: 1, date: '2026-03-18 14:32', ip: '203.248.***.*52', device: 'PC', browser: 'Chrome 132' },
  { id: 2, date: '2026-03-17 22:15', ip: '203.248.***.*52', device: 'Mobile', browser: 'Safari 19' },
  { id: 3, date: '2026-03-16 09:40', ip: '211.36.***.*78', device: 'PC', browser: 'Chrome 132' },
  { id: 4, date: '2026-03-15 18:22', ip: '203.248.***.*52', device: 'Mobile', browser: 'Chrome Mobile' },
  { id: 5, date: '2026-03-14 11:05', ip: '203.248.***.*52', device: 'PC', browser: 'Chrome 132' },
];

export default function ProfilePage() {
  const [nickname, setNickname] = useState('player_kim');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [securityPw, setSecurityPw] = useState('');
  const [nicknameMsg, setNicknameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [secMsg, setSecMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNicknameChange = () => {
    if (!nickname.trim() || nickname.length < 2) {
      setNicknameMsg({ type: 'error', text: '닉네임은 2자 이상 입력해주세요.' });
      return;
    }
    setNicknameMsg({ type: 'success', text: '닉네임이 변경되었습니다.' });
    setTimeout(() => setNicknameMsg(null), 3000);
  };

  const handlePasswordChange = () => {
    if (!currentPw) {
      setPwMsg({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: 'error', text: '새 비밀번호는 6자 이상이어야 합니다.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    setPwMsg({ type: 'success', text: '비밀번호가 변경되었습니다.' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setTimeout(() => setPwMsg(null), 3000);
  };

  const handleSecurityPw = () => {
    if (!/^\d{4,6}$/.test(securityPw)) {
      setSecMsg({ type: 'error', text: '4~6자리 숫자를 입력해주세요.' });
      return;
    }
    setSecMsg({ type: 'success', text: '2차 비밀번호가 설정되었습니다.' });
    setSecurityPw('');
    setTimeout(() => setSecMsg(null), 3000);
  };

  // Dummy daily missions
  const missions = [
    { id: 1, title: '오늘 3게임 플레이', progress: 2, total: 3, reward: 5, completed: false },
    { id: 2, title: '첫 충전하기', progress: 1, total: 1, reward: 10, completed: true },
    { id: 3, title: '프로필 완성하기', progress: 0, total: 1, reward: 3, completed: false },
  ];
  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Daily Missions */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{'\uD83C\uDFAF'}</span>
            <h2 className="text-base font-semibold text-white">일일 미션</h2>
          </div>
          <span className="text-xs text-text-muted bg-dark-bg px-3 py-1 rounded-full">
            {completedCount}/{missions.length} 완료
          </span>
        </div>

        {/* Overall progress */}
        <div className="w-full h-1.5 bg-dark-input rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-gold rounded-full transition-all"
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
                  <span className="text-accent-gold text-sm font-bold">{'\u20AE'}{m.reward}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-4">기본 정보 수정</h2>

        <div className="space-y-4">
          {/* Nickname */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">닉네임</label>
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
                변경
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
            <label className="block text-sm text-text-secondary mb-1.5">이메일</label>
            <input
              type="text"
              value="te***@gmail.com"
              disabled
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-text-muted text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-text-muted">보안을 위해 이메일은 변경할 수 없습니다.</p>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-4">비밀번호 변경</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">현재 비밀번호</label>
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="현재 비밀번호 입력"
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">새 비밀번호</label>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="6자 이상"
              className="w-full px-4 py-2.5 bg-dark-input border border-white/5 rounded-lg text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="새 비밀번호 다시 입력"
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
            변경하기
          </button>
        </div>
      </div>

      {/* Security Password */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-1">보안 설정</h2>
        <p className="text-xs text-text-muted mb-4">출금 시 사용되는 2차 비밀번호입니다.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">2차 비밀번호 (4~6자리 숫자)</label>
            <input
              type="password"
              value={securityPw}
              onChange={e => setSecurityPw(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="숫자 4~6자리"
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
            설정하기
          </button>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5">
        <h2 className="text-base font-semibold text-white mb-4">최근 로그인 기록</h2>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-white/5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-dark-bg/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">날짜</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">IP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">기기</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">브라우저</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_LOGIN_HISTORY.map(log => (
                <tr key={log.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{log.date}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono">{log.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      log.device === 'PC'
                        ? 'bg-info/20 text-info'
                        : 'bg-amber-500/20 text-amber-500'
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
          {DUMMY_LOGIN_HISTORY.map(log => (
            <div key={log.id} className="bg-dark-bg rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-white">{log.date}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  log.device === 'PC'
                    ? 'bg-info/20 text-info'
                    : 'bg-amber-500/20 text-amber-500'
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
