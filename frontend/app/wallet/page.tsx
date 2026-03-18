'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/hooks/useLang';
import { useAuth } from '@/context/AuthContext';
import { walletApi } from '@/lib/api';

type MainTab = 'deposit' | 'withdraw';
type SubTab = 'bank' | 'coin';
type CoinType = 'eth' | 'btc' | 'usdt' | 'usdc' | 'd3';

const COIN_COLORS: Record<CoinType, { bg: string; border: string; text: string; dot: string }> = {
  eth:  { bg: 'rgba(99,132,234,0.15)',  border: 'rgba(99,132,234,0.4)',  text: '#8ca6f0', dot: '#627eea' },
  btc:  { bg: 'rgba(247,147,26,0.12)',  border: 'rgba(247,147,26,0.4)',  text: '#f7a84a', dot: '#f7931a' },
  usdt: { bg: 'rgba(38,161,123,0.15)',  border: 'rgba(38,161,123,0.4)',  text: '#4dd9a8', dot: '#26a17b' },
  usdc: { bg: 'rgba(39,117,202,0.15)',  border: 'rgba(39,117,202,0.4)',  text: '#5fa8e8', dot: '#2775ca' },
  d3:   { bg: 'rgba(204,93,232,0.12)',  border: 'rgba(204,93,232,0.4)',  text: '#d88cee', dot: '#cc5de8' },
};

const QUICK_AMOUNTS = [
  { label: '₩1만', value: 10000 },
  { label: '₩3만', value: 30000 },
  { label: '₩5만', value: 50000 },
  { label: '₩10만', value: 100000 },
  { label: '₩50만', value: 500000 },
];

const WITHDRAW_QUICK_AMOUNTS = [
  { label: '₩1만', value: 10000 },
  { label: '₩3만', value: 30000 },
  { label: '₩5만', value: 50000 },
  { label: '₩10만', value: 100000 },
];

const BANKS = [
  'NH농협', 'KB국민', '신한', '우리', '하나', 'IBK기업', 'SC제일',
  '대구', '부산', '경남', '광주', '전북', '제주',
  '카카오뱅크', '토스뱅크', '케이뱅크',
];

const DEMO_ADDRESS = 'TWYeb6SX7YRCzD3RDEkUTTxWc5u1gwqfrF';

export default function WalletPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Main tab
  const [mainTab, setMainTab] = useState<MainTab>('deposit');

  // Deposit states
  const [tab, setTab] = useState<SubTab>('bank');
  const [selectedBonus, setSelectedBonus] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('usdt');
  const [network, setNetwork] = useState('trc20');

  // Withdraw states
  const [withdrawSubTab, setWithdrawSubTab] = useState<SubTab>('bank');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawHolder, setWithdrawHolder] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCoin, setWithdrawCoin] = useState<CoinType>('usdt');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCoinAmount, setWithdrawCoinAmount] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('trc20');

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // API data
  const [depositAddress, setDepositAddress] = useState(DEMO_ADDRESS);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [depositHistory, setDepositHistory] = useState<any[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [withdrawHistory, setWithdrawHistory] = useState<any[] | null>(null);

  // Login guard via useAuth
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  // Load deposit/withdraw history from API
  useEffect(() => {
    if (!isLoggedIn) return;
    walletApi.getDepositHistory().then(res => {
      if (res.success && Array.isArray(res.data)) setDepositHistory(res.data);
    }).catch(() => {});
    walletApi.getWithdrawHistory().then(res => {
      if (res.success && Array.isArray(res.data)) setWithdrawHistory(res.data);
    }).catch(() => {});
  }, [isLoggedIn]);

  // Draw QR pattern
  useEffect(() => {
    const c = qrCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const s = 112, m = 4, g = Math.floor(s / m);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#000';
    let seed = 0;
    for (let i = 0; i < DEMO_ADDRESS.length; i++) seed = (seed * 31 + DEMO_ADDRESS.charCodeAt(i)) & 0xffffffff;
    function rng() { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }
    for (let y = 0; y < g; y++) for (let x = 0; x < g; x++) { if (rng() > 0.5) ctx.fillRect(x * m, y * m, m, m); }
    function corner(ox: number, oy: number) {
      ctx!.fillStyle = '#000'; ctx!.fillRect(ox, oy, 28, 28);
      ctx!.fillStyle = '#fff'; ctx!.fillRect(ox + 4, oy + 4, 20, 20);
      ctx!.fillStyle = '#000'; ctx!.fillRect(ox + 8, oy + 8, 12, 12);
    }
    corner(0, 0); corner(s - 28, 0); corner(0, s - 28);
  }, [tab]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  }, []);

  const handleAmountInput = (val: string) => {
    const num = val.replace(/\D/g, '');
    setAmount(num ? Number(num).toLocaleString() + '원' : '');
  };

  const setQuickAmount = (val: number) => {
    setAmount(val.toLocaleString() + '원');
  };

  const handleWithdrawAmountInput = (val: string) => {
    const num = val.replace(/\D/g, '');
    setWithdrawAmount(num ? Number(num).toLocaleString() + '원' : '');
  };

  const setWithdrawQuickAmount = (val: number) => {
    setWithdrawAmount(val.toLocaleString() + '원');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    toast(t('address_copied'));
  };

  const handleDeposit = async () => {
    try {
      const rawAmount = amount.replace(/[^\d]/g, '');
      const res = await walletApi.requestDeposit({
        amount: Number(rawAmount),
        method: tab === 'bank' ? 'bank' : selectedCoin,
        network: tab === 'coin' ? network : undefined,
        bonus: selectedBonus,
      });
      if (res.success) {
        if (res.data?.address) setDepositAddress(res.data.address);
        toast(lang === 'ko' ? '입금 신청 완료' : 'Deposit requested');
      } else {
        toast(res.error || (lang === 'ko' ? '입금 신청 완료' : 'Deposit requested'));
      }
    } catch {
      toast(lang === 'ko' ? '입금 신청 완료' : 'Deposit requested');
    }
  };

  const handleWithdraw = async () => {
    try {
      const rawAmount = withdrawAmount.replace(/[^\d]/g, '');
      const res = await walletApi.requestWithdraw({
        amount: Number(rawAmount),
        method: withdrawSubTab === 'bank' ? 'bank' : withdrawCoin,
        bank: withdrawSubTab === 'bank' ? withdrawBank : undefined,
        account: withdrawSubTab === 'bank' ? withdrawAccount : undefined,
        holder: withdrawSubTab === 'bank' ? withdrawHolder : undefined,
        address: withdrawSubTab === 'coin' ? withdrawAddress : undefined,
        network: withdrawSubTab === 'coin' ? withdrawNetwork : undefined,
      });
      if (res.success) {
        toast(t('withdraw_requested'));
      } else {
        toast(res.error || t('withdraw_requested'));
      }
    } catch {
      toast(t('withdraw_requested'));
    }
  };

  // Shine gradient overlay style
  const shineStyle = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
  };

  const inputStyle = {
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    fontFamily: "'Poppins', sans-serif",
  };

  const selectArrowBg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")";

  return (
    <div className="flex justify-center px-3 py-6 min-h-screen" style={{ fontFamily: "'Poppins', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      {/* Toast */}
      <div
        className="fixed top-5 left-1/2 z-50 px-5 py-2 rounded-full text-[11px] font-normal pointer-events-none"
        style={{
          background: '#fff',
          color: '#0a0a0a',
          transform: showToast ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-40px)',
          opacity: showToast ? 1 : 0,
          transition: 'all 0.3s',
          boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
        }}
      >
        {toastMsg}
      </div>

      {/* Main Widget */}
      <div
        className="w-full max-w-[420px] overflow-hidden"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-normal tracking-[2px] uppercase text-white">
            {mainTab === 'deposit' ? t('deposit_tab') : t('withdraw_tab')}
          </h2>
          <button
            onClick={() => router.back()}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#999', border: 'none' }}
          >
            ✕
          </button>
        </div>

        {/* Main Tabs: Deposit / Withdraw */}
        <div className="flex px-5 pt-3 gap-[3px]">
          {(['deposit', 'withdraw'] as MainTab[]).map((mt) => (
            <button
              key={mt}
              onClick={() => setMainTab(mt)}
              className="flex-1 py-[11px] text-xs font-light tracking-[1px] relative overflow-hidden transition-all duration-[250ms]"
              style={{
                background: mainTab === mt ? '#181818' : 'rgba(255,255,255,0.04)',
                color: mainTab === mt ? '#fff' : '#555',
                borderRadius: '10px 10px 0 0',
                border: mainTab === mt ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                borderBottom: mainTab === mt ? 'none' : '1px solid transparent',
              }}
            >
              {mainTab === mt && <span className="absolute inset-0" style={shineStyle} />}
              <span className="relative">{mt === 'deposit' ? t('deposit_tab') : t('withdraw_tab')}</span>
            </button>
          ))}
        </div>

        {/* ==================== DEPOSIT TAB ==================== */}
        {mainTab === 'deposit' && (
          <div className="animate-fadeIn">
            {/* Sub Tabs: Bank / Crypto */}
            <div className="flex px-5 pt-2 gap-[3px]">
              {(['bank', 'coin'] as SubTab[]).map((t2) => (
                <button
                  key={t2}
                  onClick={() => setTab(t2)}
                  className="flex-1 py-[9px] text-[11px] font-light tracking-[0.5px] relative overflow-hidden transition-all duration-[250ms]"
                  style={{
                    background: tab === t2 ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: tab === t2 ? '#ccc' : '#444',
                    borderRadius: '8px',
                    border: tab === t2 ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  }}
                >
                  <span className="relative">{t2 === 'bank' ? t('bank_tab') : t('crypto_tab')}</span>
                </button>
              ))}
            </div>

            {/* ===== BANK DEPOSIT ===== */}
            {tab === 'bank' && (
              <div className="p-5 animate-fadeIn">
                {/* Bonus Title */}
                <div className="text-[10px] font-light tracking-[1.5px] uppercase mb-2" style={{ color: '#555' }}>
                  {t('select_bonus')}
                </div>

                {/* Bonus List */}
                <div className="flex flex-col gap-1.5 mb-3.5">
                  {[
                    { name: t('first_deposit_100'), pct: '100%', desc: t('first_deposit_100_desc'), pctBg: 'rgba(255,107,107,0.15)', pctColor: '#ff6b6b', accentColor: '#ff6b6b' },
                    { name: t('daily_bonus_10'), pct: '10%', desc: t('daily_bonus_10_desc'), pctBg: 'rgba(255,212,59,0.15)', pctColor: '#ffd43b', accentColor: '#ffd43b' },
                    { name: t('no_bonus'), pct: null, desc: t('no_bonus_desc'), pctBg: '', pctColor: '', accentColor: '#555' },
                  ].map((bonus, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedBonus(idx)}
                      className="flex items-center gap-3 relative overflow-hidden text-left transition-all duration-200"
                      style={{
                        background: selectedBonus === idx ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedBonus === idx ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '10px',
                        padding: '12px 14px',
                      }}
                    >
                      <span className="absolute inset-0 pointer-events-none" style={shineStyle} />
                      {/* 좌측 컬러 라인 */}
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l" style={{ background: bonus.accentColor }} />
                      {/* Radio */}
                      <span
                        className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{ border: `2px solid ${selectedBonus === idx ? bonus.accentColor || '#fff' : '#555'}` }}
                      >
                        {selectedBonus === idx && (
                          <span className="w-2 h-2 rounded-full" style={{ background: bonus.accentColor || '#fff' }} />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-xs font-normal text-white flex items-center gap-1.5">
                          {bonus.name}
                          {bonus.pct && (
                            <span className="text-[9px] font-medium tracking-[1px] px-1.5 py-0.5 rounded-[3px]"
                              style={{ background: bonus.pctBg, color: bonus.pctColor }}>
                              {bonus.pct}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-extralight mt-0.5 block" style={{ color: '#555' }}>{bonus.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* Bonus Warning */}
                <div
                  className="text-[10px] font-extralight leading-[1.7] mb-4"
                  style={{
                    color: '#555',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '9px 12px',
                  }}
                  dangerouslySetInnerHTML={{ __html: t('bonus_warning') }}
                />

                {/* Amount Input */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('deposit_amount')}
                  </label>
                  <input
                    type="text"
                    placeholder="₩ 10,000"
                    value={amount}
                    onChange={(e) => handleAmountInput(e.target.value)}
                    className="w-full py-[11px] px-3.5 text-xs font-light text-white transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-1 mb-4 flex-wrap">
                  {QUICK_AMOUNTS.map((q) => (
                    <button
                      key={q.value}
                      onClick={() => setQuickAmount(q.value)}
                      className="py-[7px] px-3 text-[10px] font-light transition-all duration-200"
                      style={{
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'transparent',
                        color: '#999',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#999'; }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleDeposit}
                  className="w-full py-[13px] text-xs font-normal tracking-[1px] relative overflow-hidden transition-all duration-[250ms]"
                  style={{
                    background: '#fff',
                    color: '#0a0a0a',
                    borderRadius: '10px',
                    border: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
                  <span className="relative">{t('request_deposit')}</span>
                </button>

                {/* App Download Box */}
                <div
                  className="flex items-center gap-3.5 relative overflow-hidden cursor-pointer mt-4 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  onClick={() => window.open('#', '_blank')}
                >
                  <span className="absolute inset-0 pointer-events-none" style={shineStyle} />
                  <div className="flex-1">
                    <div className="text-[11px] font-normal text-white mb-[3px]">{t('app_download_title')}</div>
                    <div className="text-[10px] font-extralight" style={{ color: '#555' }}>{t('app_download_desc')}</div>
                  </div>
                  {/* Google Play Badge */}
                  <div
                    className="flex items-center justify-center gap-[5px] flex-shrink-0"
                    style={{
                      width: '110px',
                      height: '34px',
                      borderRadius: '5px',
                      background: '#000',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '0 8px',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734c0-.382.218-.72.61-.92z" fill="#4285F4"/>
                      <path d="M17.091 8.703L5.045.87C4.542.576 3.97.51 3.61 1.814L13.793 12l3.298-3.297z" fill="#EA4335"/>
                      <path d="M3.61 22.186c.36 1.304.932 1.238 1.435.944l12.046-7.833L13.793 12 3.61 22.186z" fill="#34A853"/>
                      <path d="M20.807 10.545l-3.716-1.842L13.793 12l3.298 3.297 3.716-1.842c.942-.524.942-2.386 0-2.91z" fill="#FBBC05"/>
                    </svg>
                    <div className="flex flex-col items-start">
                      <span className="text-[5.5px] font-light leading-none" style={{ color: '#999', letterSpacing: '0.3px' }}>GET IT ON</span>
                      <span className="text-[9px] font-normal text-white leading-[1.3]" style={{ letterSpacing: '0.2px' }}>Google Play</span>
                    </div>
                  </div>
                </div>

                {/* Recent Deposits */}
                <div className="mt-3.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[9px] font-light tracking-[1.5px] uppercase mb-2" style={{ color: '#555' }}>
                    {t('recent_deposits')}
                  </div>
                  {(depositHistory || [
                    { amount: 100000, created_at: '2026.03.18  14:15' },
                    { amount: 50000, created_at: '2026.03.17  11:30' },
                  ]).slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-[7px]"
                      style={{ borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <div>
                        <div className="text-xs font-light text-white">+₩{Number(item.amount).toLocaleString()}</div>
                        <div className="text-[9px] font-extralight" style={{ color: '#555' }}>{typeof item.created_at === 'string' ? item.created_at.slice(0, 16).replace('T', '  ') : item.created_at}</div>
                      </div>
                      <span className="text-[10px] font-light" style={{ color: '#999' }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== COIN DEPOSIT ===== */}
            {tab === 'coin' && (
              <div className="p-5 animate-fadeIn">
                {/* Crypto Benefits */}
                <div className="mb-3.5">
                  {[
                    {
                      title: t('crypto_bonus_150'),
                      tag: '150%',
                      tagClass: 'bg-[rgba(255,107,107,0.15)] text-[#ff6b6b]',
                      desc: t('crypto_bonus_150_desc'),
                      line: 'linear-gradient(180deg, #ff6b6b, #ff922b)',
                    },
                    {
                      title: t('zero_fee'),
                      tag: 'Free',
                      tagClass: 'bg-[rgba(255,212,59,0.15)] text-[#ffd43b]',
                      desc: t('zero_fee_desc'),
                      line: 'linear-gradient(180deg, #ffd43b, #51cf66)',
                    },
                    {
                      title: t('anonymous_secure'),
                      tag: 'P2P',
                      tagClass: 'bg-[rgba(51,154,240,0.15)] text-[#339af0]',
                      desc: t('anonymous_secure_desc'),
                      line: 'linear-gradient(180deg, #339af0, #cc5de8)',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden mb-2 transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    >
                      {/* Left color line */}
                      <span className="absolute top-0 left-0 w-[3px] h-full" style={{ background: item.line }} />
                      <div className="text-xs font-normal text-white flex items-center gap-2 mb-[3px]">
                        {item.title}
                        <span className={`text-[8px] font-semibold tracking-[1.2px] uppercase px-[7px] py-[2px] rounded-[3px] ${item.tagClass}`}>
                          {item.tag}
                        </span>
                      </div>
                      <div
                        className="text-[10px] font-extralight leading-[1.6]"
                        style={{ color: '#999' }}
                        dangerouslySetInnerHTML={{ __html: item.desc }}
                      />
                    </div>
                  ))}
                </div>

                {/* Coin Selection */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {(Object.keys(COIN_COLORS) as CoinType[]).map((coin) => {
                    const isOn = selectedCoin === coin;
                    const c = COIN_COLORS[coin];
                    return (
                      <button
                        key={coin}
                        onClick={() => setSelectedCoin(coin)}
                        className="flex items-center gap-[5px] py-[7px] px-3.5 transition-all duration-200"
                        style={{
                          borderRadius: '20px',
                          border: `1px solid ${isOn ? c.border : 'rgba(255,255,255,0.08)'}`,
                          background: isOn ? c.bg : 'transparent',
                          color: isOn ? c.text : '#555',
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '11px',
                          fontWeight: isOn ? 400 : 300,
                          letterSpacing: '0.5px',
                        }}
                      >
                        <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: c.dot }} />
                        {coin.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                {/* Network Selection */}
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[10px] font-light" style={{ color: '#555' }}>Network</span>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="flex-1 py-2 px-3 text-[11px] font-light cursor-pointer"
                    style={{
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      fontFamily: "'Poppins', sans-serif",
                      appearance: 'none',
                      backgroundImage: selectArrowBg,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                    }}
                  >
                    <option value="trc20">Tron (TRC20)</option>
                    <option value="erc20">Ethereum (ERC20)</option>
                    <option value="bep20">BNB Chain (BEP20)</option>
                  </select>
                </div>

                {/* QR Code Box */}
                <div
                  className="text-center relative overflow-hidden mb-3.5"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '20px',
                  }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={shineStyle} />
                  <div
                    className="flex items-center justify-center mx-auto mb-3.5"
                    style={{
                      width: '130px',
                      height: '130px',
                      background: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    <canvas ref={qrCanvasRef} width={112} height={112} style={{ borderRadius: '4px' }} />
                  </div>

                  <div className="text-[9px] font-light tracking-[1.5px] uppercase mb-2" style={{ color: '#555' }}>
                    {t('deposit_address')}
                  </div>

                  <div
                    onClick={copyAddress}
                    className="relative text-left cursor-pointer text-[11px] font-light text-white break-all leading-[1.6] transition-all duration-200 group"
                    style={{
                      background: '#0a0a0a',
                      padding: '10px 36px 10px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  >
                    {depositAddress}
                    <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-sm opacity-40 group-hover:opacity-80 transition-opacity duration-200">
                      ⧉
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div
                  className="text-[10px] font-extralight leading-[1.7] mb-3.5"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#555',
                  }}
                  dangerouslySetInnerHTML={{ __html: t('crypto_warning') }}
                />

                {/* Recent Deposits */}
                <div className="mt-3.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[9px] font-light tracking-[1.5px] uppercase mb-2" style={{ color: '#555' }}>
                    {t('recent_deposits')}
                  </div>
                  {[
                    { amount: '+33 USDT', date: '2026.03.18  17:48', color: '#4dd9a8' },
                    { amount: '+70.846 USDT', date: '2026.03.17  18:45', color: '#4dd9a8' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-[7px]"
                      style={{ borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <div>
                        <div className="text-xs font-light" style={{ color: item.color }}>{item.amount}</div>
                        <div className="text-[9px] font-extralight" style={{ color: '#555' }}>{item.date}</div>
                      </div>
                      <span className="text-[10px] font-light" style={{ color: '#999' }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== WITHDRAW TAB ==================== */}
        {mainTab === 'withdraw' && (
          <div className="animate-fadeIn">
            {/* Sub Tabs: Bank / Crypto */}
            <div className="flex px-5 pt-2 gap-[3px]">
              {(['bank', 'coin'] as SubTab[]).map((t2) => (
                <button
                  key={t2}
                  onClick={() => setWithdrawSubTab(t2)}
                  className="flex-1 py-[9px] text-[11px] font-light tracking-[0.5px] relative overflow-hidden transition-all duration-[250ms]"
                  style={{
                    background: withdrawSubTab === t2 ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: withdrawSubTab === t2 ? '#ccc' : '#444',
                    borderRadius: '8px',
                    border: withdrawSubTab === t2 ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  }}
                >
                  <span className="relative">{t2 === 'bank' ? t('bank_tab') : t('crypto_tab')}</span>
                </button>
              ))}
            </div>

            {/* ===== BANK WITHDRAW ===== */}
            {withdrawSubTab === 'bank' && (
              <div className="p-5 animate-fadeIn">
                {/* Bank Select */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('select_bank')}
                  </label>
                  <select
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    className="w-full py-[11px] px-3.5 text-xs font-light cursor-pointer text-white"
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      backgroundImage: selectArrowBg,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      color: withdrawBank ? '#fff' : '#555',
                    }}
                  >
                    <option value="" style={{ color: '#555' }}>{lang === 'ko' ? '선택하세요' : 'Select'}</option>
                    {BANKS.map((bank) => (
                      <option key={bank} value={bank} style={{ color: '#fff', background: '#0a0a0a' }}>{bank}</option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('account_number')}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ko' ? '계좌번호 입력' : 'Enter account number'}
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    className="w-full py-[11px] px-3.5 text-xs font-light text-white transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>

                {/* Account Holder */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('account_holder')}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ko' ? '예금주 입력' : 'Enter account holder'}
                    value={withdrawHolder}
                    onChange={(e) => setWithdrawHolder(e.target.value)}
                    className="w-full py-[11px] px-3.5 text-xs font-light text-white transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>

                {/* Withdraw Amount */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('withdraw_amount')}
                  </label>
                  <input
                    type="text"
                    placeholder="₩ 10,000"
                    value={withdrawAmount}
                    onChange={(e) => handleWithdrawAmountInput(e.target.value)}
                    className="w-full py-[11px] px-3.5 text-xs font-light text-white transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-1 mb-4 flex-wrap">
                  {WITHDRAW_QUICK_AMOUNTS.map((q) => (
                    <button
                      key={q.value}
                      onClick={() => setWithdrawQuickAmount(q.value)}
                      className="py-[7px] px-3 text-[10px] font-light transition-all duration-200"
                      style={{
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'transparent',
                        color: '#999',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#999'; }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* Info Box */}
                <div
                  className="mb-4 text-[10px] font-extralight leading-[1.8]"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#555',
                  }}
                >
                  <div className="flex justify-between"><span>{t('available_balance')}</span><span style={{ color: '#fff' }}>₩12,450</span></div>
                  <div className="flex justify-between"><span>{t('min_withdraw')}</span><span style={{ color: '#999' }}>₩10,000</span></div>
                  <div className="flex justify-between"><span>{t('estimated_processing')}</span><span style={{ color: '#999' }}>{t('10min_to_1hour')}</span></div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleWithdraw}
                  className="w-full py-[13px] text-xs font-normal tracking-[1px] relative overflow-hidden transition-all duration-[250ms]"
                  style={{
                    background: '#fff',
                    color: '#0a0a0a',
                    borderRadius: '10px',
                    border: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
                  <span className="relative">{t('request_withdraw')}</span>
                </button>

                {/* Recent Withdrawals */}
                <div className="mt-3.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[9px] font-light tracking-[1.5px] uppercase mb-2" style={{ color: '#555' }}>
                    {t('recent_withdrawals')}
                  </div>
                  {(withdrawHistory || [
                    { amount: 100000, created_at: '2026.03.18  09:20' },
                    { amount: 50000, created_at: '2026.03.17  15:45' },
                  ]).slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-[7px]"
                      style={{ borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <div>
                        <div className="text-xs font-light" style={{ color: '#ff6b6b' }}>-₩{Number(item.amount).toLocaleString()}</div>
                        <div className="text-[9px] font-extralight" style={{ color: '#555' }}>{typeof item.created_at === 'string' ? item.created_at.slice(0, 16).replace('T', '  ') : item.created_at}</div>
                      </div>
                      <span className="text-[10px] font-light" style={{ color: '#999' }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== CRYPTO WITHDRAW ===== */}
            {withdrawSubTab === 'coin' && (
              <div className="p-5 animate-fadeIn">
                {/* Coin Selection */}
                <div className="mb-3">
                  <div className="text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('withdraw_coin_select')}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {(Object.keys(COIN_COLORS) as CoinType[]).map((coin) => {
                      const isOn = withdrawCoin === coin;
                      const c = COIN_COLORS[coin];
                      return (
                        <button
                          key={coin}
                          onClick={() => setWithdrawCoin(coin)}
                          className="flex items-center gap-[5px] py-[7px] px-3.5 transition-all duration-200"
                          style={{
                            borderRadius: '20px',
                            border: `1px solid ${isOn ? c.border : 'rgba(255,255,255,0.08)'}`,
                            background: isOn ? c.bg : 'transparent',
                            color: isOn ? c.text : '#555',
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '11px',
                            fontWeight: isOn ? 400 : 300,
                            letterSpacing: '0.5px',
                          }}
                        >
                          <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: c.dot }} />
                          {coin.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Network Selection */}
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[10px] font-light" style={{ color: '#555' }}>{t('withdraw_network')}</span>
                  <select
                    value={withdrawNetwork}
                    onChange={(e) => setWithdrawNetwork(e.target.value)}
                    className="flex-1 py-2 px-3 text-[11px] font-light cursor-pointer"
                    style={{
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      fontFamily: "'Poppins', sans-serif",
                      appearance: 'none',
                      backgroundImage: selectArrowBg,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                    }}
                  >
                    <option value="trc20">Tron (TRC20)</option>
                    <option value="erc20">Ethereum (ERC20)</option>
                    <option value="bep20">BNB Chain (BEP20)</option>
                  </select>
                </div>

                {/* Wallet Address */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('wallet_address')}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ko' ? '지갑 주소 입력' : 'Enter wallet address'}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full py-[11px] px-3.5 text-xs font-light text-white transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>

                {/* Withdraw Amount */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-light tracking-[0.5px] mb-1.5" style={{ color: '#555' }}>
                    {t('withdraw_qty')}
                  </label>
                  <input
                    type="text"
                    placeholder={`0.00 ${withdrawCoin.toUpperCase()}`}
                    value={withdrawCoinAmount}
                    onChange={(e) => setWithdrawCoinAmount(e.target.value)}
                    className="w-full py-[11px] px-3.5 text-xs font-light text-white transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>

                {/* Info Box */}
                <div
                  className="mb-4 text-[10px] font-extralight leading-[1.8]"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#555',
                  }}
                >
                  <div className="flex justify-between"><span>{t('available_balance')}</span><span style={{ color: '#fff' }}>12,450.5 {withdrawCoin.toUpperCase()}</span></div>
                  <div className="flex justify-between"><span>{t('min_withdraw')}</span><span style={{ color: '#999' }}>10 {withdrawCoin.toUpperCase()}</span></div>
                  <div className="flex justify-between"><span>{t('fee')}</span><span style={{ color: '#999' }}>1 {withdrawCoin.toUpperCase()}</span></div>
                  <div className="flex justify-between"><span>{t('estimated_processing')}</span><span style={{ color: '#999' }}>{t('about_5min')}</span></div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleWithdraw}
                  className="w-full py-[13px] text-xs font-normal tracking-[1px] relative overflow-hidden transition-all duration-[250ms]"
                  style={{
                    background: '#fff',
                    color: '#0a0a0a',
                    borderRadius: '10px',
                    border: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
                  <span className="relative">{t('request_withdraw')}</span>
                </button>

                {/* Recent Withdrawals */}
                <div className="mt-3.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[9px] font-light tracking-[1.5px] uppercase mb-2" style={{ color: '#555' }}>
                    {t('recent_withdrawals')}
                  </div>
                  {[
                    { amount: '-33 USDT', date: '2026.03.18  12:30', color: '#ff6b6b' },
                    { amount: '-100 USDT', date: '2026.03.17  08:15', color: '#ff6b6b' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-[7px]"
                      style={{ borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <div>
                        <div className="text-xs font-light" style={{ color: item.color }}>{item.amount}</div>
                        <div className="text-[9px] font-extralight" style={{ color: '#555' }}>{item.date}</div>
                      </div>
                      <span className="text-[10px] font-light" style={{ color: '#999' }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        input::placeholder {
          color: #555;
          font-weight: 200;
        }
        select:focus {
          outline: none;
        }
        select option {
          background: #0a0a0a;
          color: #e0e0e0;
        }
      `}</style>
    </div>
  );
}
