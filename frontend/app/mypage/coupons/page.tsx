'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/hooks/useLang';

/* ──────────────────────────────────────────────
   TYPES & DATA
   ────────────────────────────────────────────── */

interface Coupon {
  id: number;
  type: 'wager' | 'conversion' | 'deposit' | 'welcome' | 'derived' | 'spins';
  name: string;
  desc: string;
  amount: string;
  label: string;
  btnText: string;
  btnDisabled?: boolean;
  accentGradient: string;
  accentColor: string;
  typeBadge: string;
  conditions: string[];
  progress?: { label: string; current: number; max: number };
  chainBadge?: string;
}

interface ExpiredCoupon {
  id: number;
  icon: string;
  name: string;
  amount: string;
  date: string;
  tag: string;
  tagType: 'used' | 'expired' | 'converted';
}

const TIERS = [
  { icon: '\u{1F949}', name: 'Bronze', perk: '3%\nDaily', color: '#9ca3af', barColor: '#6b7280' },
  { icon: '\u{1F948}', name: 'Silver', perk: '5%\nDaily', color: '#a78bfa', barColor: '#a78bfa' },
  { icon: '\u{1F947}', name: 'Gold', perk: '8%\nDaily', color: '#fbbf24', barColor: 'linear-gradient(135deg,#0284c7,#38bdf8)' },
  { icon: '\u{1F48E}', name: 'Platinum', perk: '12%\n+Weekly', color: '#4ade80', barColor: 'linear-gradient(135deg,#16a34a,#4ade80)' },
  { icon: '\u{1F451}', name: 'Diamond', perk: '15%\n+Cashback', color: '#fbbf24', barColor: 'linear-gradient(135deg,#d97706,#fbbf24)' },
  { icon: '\u{1F525}', name: 'Master', perk: '18%\n+VIP Host', color: '#f472b6', barColor: 'linear-gradient(135deg,#db2777,#f472b6)' },
  { icon: '\u{1F31F}', name: 'Legend', perk: '25%\n+All Perks', color: '#ffffff', barColor: 'linear-gradient(135deg,#ff4757,#fbbf24,#22c55e,#0ea5e9,#8b5cf6)' },
];
const CURRENT_TIER = 2; // Gold

const BONUS_TYPES = [
  { img: '/0box.png', name: 'Emergency Bonus', desc: 'Emergency support', badge: 'Available', badgeClass: 'bg-[rgba(34,197,94,0.25)] text-[#4ade80]' },
  { img: '/1box.png', name: 'Grade Benefits', desc: 'Auto bonus by level', badge: 'VIP Only', badgeClass: 'bg-[rgba(245,158,11,0.25)] text-[#fbbf24]' },
  { img: '/2box.webp', name: 'Bonus Loan', desc: 'Advance payment', badge: 'Apply', badgeClass: 'bg-[rgba(34,197,94,0.25)] text-[#4ade80]' },
  { img: '/3box.png', name: 'Derived Bonus', desc: 'Chain from rewards', badge: 'Chain', badgeClass: 'bg-[rgba(236,72,153,0.25)] text-[#f472b6] animate-pulse' },
  { img: '/4box.png', name: 'Free Spins', desc: 'Slot spin rewards', badge: 'New', badgeClass: 'bg-[rgba(139,92,246,0.25)] text-[#a78bfa] animate-pulse' },
];

const COUPONS: Coupon[] = [
  {
    id: 1, type: 'wager',
    name: '\u20a950,000 Wager Coupon', desc: 'Convert to cash upon 500% rolling achievement',
    amount: '\u20a950K', label: 'Wager', btnText: '46.8%', btnDisabled: true,
    accentGradient: 'linear-gradient(135deg,#d97706,#fbbf24)', accentColor: '#f59e0b',
    typeBadge: 'Wager',
    conditions: ['Rolling 500%', 'Cash convertible'],
    progress: { label: 'Rolling', current: 234, max: 500 },
  },
  {
    id: 2, type: 'conversion',
    name: '\u20a970,000 Conversion Coupon', desc: 'Convert upon 777% rolling \u00b7 Max \u20a9770,000',
    amount: '\u20a970K', label: 'Convert', btnText: '74.6%',
    accentGradient: 'linear-gradient(135deg,#db2777,#f472b6)', accentColor: '#ec4899',
    typeBadge: 'Conversion',
    conditions: ['Rolling 777%', 'Max \u20a9770K'],
    progress: { label: 'Rolling', current: 580, max: 777 },
  },
  {
    id: 3, type: 'deposit',
    name: 'Deposit Match \u20a950,000', desc: 'Deposit \u20a9100,000 and get \u20a950,000 bonus to use together',
    amount: '\u20a950K', label: 'Bonus', btnText: 'USE',
    accentGradient: 'linear-gradient(135deg,#0284c7,#38bdf8)', accentColor: '#0ea5e9',
    typeBadge: 'Deposit',
    conditions: ['Min \u20a9100K deposit', 'Rolling x3', '~04.30'],
  },
  {
    id: 4, type: 'welcome',
    name: 'Welcome Bonus 15%', desc: '15% bonus on first deposit \u00b7 #WELCOME2026',
    amount: '15%', label: 'Deposit', btnText: 'USE',
    accentGradient: 'linear-gradient(135deg,#ff4757,#ff6b81)', accentColor: '#ff4757',
    typeBadge: 'Welcome',
    conditions: ['Min \u20a910K', 'Rolling x3', '~12.31'],
  },
  {
    id: 5, type: 'derived',
    name: 'Wager Reward \u20a930K', desc: 'From Welcome Bonus \u00b7 \u20a930,000 cash after 200% rolling',
    amount: '\u20a930K', label: 'Cash', btnText: 'USE',
    accentGradient: 'linear-gradient(135deg,#16a34a,#4ade80)', accentColor: '#22c55e',
    typeBadge: 'Derived',
    conditions: ['Rolling 200%', 'From: Welcome'],
    chainBadge: '\u{1F517} CHAIN',
  },
  {
    id: 6, type: 'spins',
    name: 'March Free Spins', desc: '50 Free Spins on Gates of Olympus \u00b7 #FREESPIN03',
    amount: '50', label: 'Spins', btnText: 'USE',
    accentGradient: 'linear-gradient(135deg,#0891b2,#22d3ee)', accentColor: '#06b6d4',
    typeBadge: 'Spins',
    conditions: ['50 Spins', '~03.31'],
  },
];

const EXPIRED_COUPONS: ExpiredCoupon[] = [
  { id: 101, icon: '\u{1F4B0}', name: 'VIP Bonus', amount: '\u20a910,000', date: '2026.02.28', tag: 'Used', tagType: 'used' },
  { id: 102, icon: '\u{1F386}', name: 'New Year Event', amount: '\u20a920,000', date: '2026.01.07', tag: 'Expired', tagType: 'expired' },
  { id: 103, icon: '\u{1F3AF}', name: 'Wager Complete', amount: '\u20a930,000', date: '2026.02.15', tag: 'Converted', tagType: 'converted' },
];

/* ──────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ────────────────────────────────────────────── */

export default function MyCouponsPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const { t } = useLang();
  const [gradeFillWidth, setGradeFillWidth] = useState(0);
  const [toast, setToast] = useState<{ msg: string; bg: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  // Animate grade fill
  useEffect(() => {
    if (isAuth) {
      const timer = setTimeout(() => setGradeFillWidth(62.5), 300);
      return () => clearTimeout(timer);
    }
  }, [isAuth]);

  const showToast = (msg: string, bg: string) => {
    setToast({ msg, bg });
    setTimeout(() => setToast(null), 2000);
  };

  if (!isAuth) {
    return <div className="flex items-center justify-center min-h-[50vh]"><span className="text-white/50 font-light">Loading...</span></div>;
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 py-4 animate-fade-in relative z-[1]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Toast */}
      <div
        className="fixed top-5 left-1/2 z-[99] px-6 py-2.5 rounded-[20px] text-[11px] font-normal text-white transition-all duration-300 pointer-events-none"
        style={{
          transform: toast ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-40px)',
          opacity: toast ? 1 : 0,
          background: toast?.bg || '#fff',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        {toast?.msg}
      </div>

      {/* ===== PROFILE CARD ===== */}
      <div className="relative overflow-hidden rounded-2xl p-5 mb-5" style={{ background: '#0e0e12', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(6,182,212,0.06),rgba(236,72,153,0.05))' }} />

        {/* Profile top */}
        <div className="flex items-center gap-3.5 relative mb-4">
          <div
            className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}
          >
            P
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white flex items-center gap-2">
              player_kim
              <span className="text-[8px] font-bold tracking-wider py-0.5 px-2 rounded" style={{ background: 'linear-gradient(135deg,#d97706,#fbbf24)', color: '#000' }}>
                LV.3 GOLD
              </span>
            </div>
            <div className="text-[10px] font-light" style={{ color: '#5e5e70' }}>Joined 2025.01.15</div>
          </div>
          <div className="text-right relative">
            <div className="text-[9px] font-light tracking-wider" style={{ color: '#5e5e70' }}>Balance</div>
            <div className="text-[22px] font-bold text-white tracking-tight">
              12,450.5<span className="text-[11px] font-light ml-1" style={{ color: '#5e5e70' }}>USDT</span>
            </div>
          </div>
        </div>

        {/* Grade Gauge */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-lg">{'\u2B50'}</span>
            <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>Lv.3 Gold</span>
            <span className="text-[10px] font-light ml-auto" style={{ color: '#5e5e70' }}>1,250 / 2,000 XP</span>
          </div>
          <div className="h-2 rounded overflow-hidden mb-1.5" style={{ background: '#08080b' }}>
            <div
              className="h-full rounded relative"
              style={{
                width: `${gradeFillWidth}%`,
                background: 'linear-gradient(135deg,#d97706,#fbbf24)',
                transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation: 'shimmer 2.5s infinite' }} />
            </div>
          </div>
          <div className="flex justify-between px-0.5">
            {['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4', 'Lv.5', 'Lv.6', 'Lv.7'].map((lv, i) => {
              const passed = i < CURRENT_TIER;
              const active = i === CURRENT_TIER;
              return (
                <div key={lv} className="flex flex-col items-center gap-0.5 cursor-default group">
                  <div
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      border: `2px solid ${passed || active ? '#f59e0b' : '#3a3a48'}`,
                      background: passed || active ? '#f59e0b' : '#08080b',
                      boxShadow: active ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
                    }}
                  />
                  <span
                    className="text-[7px] tracking-wider transition-colors group-hover:text-white/70"
                    style={{ color: active ? '#f59e0b' : '#3a3a48', fontWeight: active ? 600 : 400 }}
                  >
                    {lv}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Deposit', value: '35,000', color: '#0ea5e9' },
            { label: 'Total Bet', value: '28,500', color: '#f97316' },
            { label: 'Total Wins', value: '31,200', color: '#22c55e' },
          ].map((s) => (
            <div key={s.label} className="rounded-[10px] py-2.5 px-3 text-center" style={{ background: '#08080b', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[8px] font-light tracking-widest uppercase mb-0.5" style={{ color: '#3a3a48' }}>{s.label}</div>
              <div className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== GRADE BENEFITS (7 tiers) ===== */}
      <SectionTitle title={t('grade_benefits')} />
      <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
        {TIERS.map((tier, i) => (
          <div
            key={tier.name}
            className="relative overflow-hidden rounded-[10px] py-3 px-2 text-center transition-all duration-300 cursor-default hover:-translate-y-0.5"
            style={{
              background: '#151519',
              border: i === CURRENT_TIER ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.05)',
              boxShadow: i === CURRENT_TIER ? '0 0 20px rgba(245,158,11,0.08)' : 'none',
            }}
          >
            {/* Top color bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: i === 6
                  ? 'linear-gradient(135deg,#ff4757,#fbbf24,#22c55e,#0ea5e9,#8b5cf6)'
                  : tier.barColor,
                backgroundSize: i === 6 ? '200% 200%' : undefined,
                animation: i === 6 ? 'rainbow 3s ease infinite' : undefined,
              }}
            />
            <div className="text-[22px] mb-1">{tier.icon}</div>
            <div className="text-[9px] font-medium tracking-wider mb-0.5" style={{ color: tier.color, textShadow: i === 6 ? '0 0 10px rgba(255,255,255,0.3)' : undefined }}>
              {tier.name}
            </div>
            <div className="text-[8px] font-extralight leading-snug whitespace-pre-line" style={{ color: '#5e5e70' }}>{tier.perk}</div>
            {i === CURRENT_TIER && (
              <div className="text-[6px] font-bold tracking-widest uppercase mt-1" style={{ color: '#f59e0b' }}>{'\u2605'} YOU</div>
            )}
          </div>
        ))}
      </div>

      {/* ===== MY COUPONS (unified) ===== */}
      <SectionTitle title={t('my_bonuses')} count={COUPONS.length} />
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-2.5 mb-2">
        {COUPONS.map((cpn, i) => (
          <CouponCard key={cpn.id} cpn={cpn} index={i} onUse={(msg, bg) => showToast(msg, bg)} />
        ))}
      </div>

      {/* ===== EXPIRED ===== */}
      <div className="opacity-40">
        <SectionTitle title="Used / Expired" />
      </div>
      <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {EXPIRED_COUPONS.map((exp) => (
          <div
            key={exp.id}
            className="relative overflow-hidden rounded-xl p-3 opacity-40"
            style={{ background: '#151519', border: '1px solid rgba(255,255,255,0.03)' }}
          >
            {/* Diagonal stripe overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'repeating-linear-gradient(135deg,transparent,transparent 10px,rgba(255,255,255,0.01) 10px,rgba(255,255,255,0.01) 20px)' }}
            />
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {exp.icon}
              </div>
              <span className="text-[10px] font-normal" style={{ color: '#9898a8' }}>{exp.name}</span>
            </div>
            <div className="text-sm font-semibold mb-0.5" style={{ color: '#5e5e70' }}>{exp.amount}</div>
            <div className="text-[8px]" style={{ color: '#3a3a48' }}>{exp.date}</div>
            <span
              className="inline-block text-[7px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded mt-1"
              style={{
                background: exp.tagType === 'expired' ? 'rgba(255,71,87,0.1)' : 'rgba(255,255,255,0.04)',
                color: exp.tagType === 'expired' ? '#ff6b81' : '#3a3a48',
              }}
            >
              {exp.tag}
            </span>
          </div>
        ))}
      </div>

      {/* Keyframes injected inline */}
      <style jsx global>{`
        @keyframes cardUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rainbow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes cpnShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @media (max-width: 500px) {
          .cpn-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SUB COMPONENTS
   ────────────────────────────────────────────── */

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-7">
      <h2 className="text-sm font-medium tracking-wider">{title}</h2>
      {count !== undefined && (
        <span className="text-[9px] font-semibold py-0.5 px-2 rounded-[10px]" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
          {count}
        </span>
      )}
      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.06),transparent)' }} />
    </div>
  );
}

function CouponCard({ cpn, index, onUse }: { cpn: Coupon; index: number; onUse: (msg: string, bg: string) => void }) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [progWidth, setProgWidth] = useState(0);

  useEffect(() => {
    if (!cpn.progress) return;
    const pct = (cpn.progress.current / cpn.progress.max) * 100;
    const timer = setTimeout(() => setProgWidth(pct), 200 + index * 100);
    return () => clearTimeout(timer);
  }, [cpn.progress, index]);

  return (
    <div
      className="flex overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] cpn-grid-responsive"
      style={{
        background: '#151519',
        border: '1px solid rgba(255,255,255,0.06)',
        animation: `cardUp 0.5s ease both`,
        animationDelay: index % 2 === 0 ? '0.05s' : '0.12s',
      }}
    >
      {/* Left accent bar */}
      <div className="w-1 flex-shrink-0" style={{ background: cpn.accentGradient }} />

      {/* Main content */}
      <div className="flex-1 py-3.5 px-4 min-w-0">
        <span
          className="inline-block text-[7px] font-semibold tracking-widest uppercase py-0.5 px-1.5 rounded mb-1.5"
          style={{ background: `${cpn.accentColor}1f`, color: cpn.accentColor }}
        >
          {cpn.typeBadge}
        </span>
        <div className="text-xs font-medium text-white mb-0.5 flex items-center gap-1.5 flex-wrap">
          {cpn.name}
          {cpn.chainBadge && (
            <span className="text-[7px] font-semibold tracking-wider py-0.5 px-1.5 rounded" style={{ background: `${cpn.accentColor}26`, color: cpn.accentColor }}>
              {cpn.chainBadge}
            </span>
          )}
        </div>
        <div className="text-[9px] font-extralight leading-relaxed mb-2" style={{ color: '#5e5e70' }}>{cpn.desc}</div>

        {/* Progress bar */}
        {cpn.progress && (
          <div className="mb-2">
            <div className="flex justify-between text-[8px] font-light mb-1" style={{ color: '#3a3a48' }}>
              <span>{cpn.progress.label}</span>
              <span style={{ color: cpn.accentColor }}>{cpn.progress.current}% / {cpn.progress.max}%</span>
            </div>
            <div className="h-[5px] rounded-sm overflow-hidden" style={{ background: '#08080b' }}>
              <div
                ref={progressRef}
                className="h-full rounded-sm relative"
                style={{
                  width: `${progWidth}%`,
                  background: cpn.accentGradient,
                  transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation: 'cpnShimmer 2.5s infinite' }} />
              </div>
            </div>
          </div>
        )}

        {/* Conditions */}
        <div className="flex flex-wrap gap-1">
          {cpn.conditions.map((c) => (
            <span key={c} className="text-[8px] font-light py-0.5 px-1.5 rounded" style={{ color: '#3a3a48', background: 'rgba(255,255,255,0.03)' }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Right section with cutouts */}
      <div
        className="w-[90px] flex flex-col items-center justify-center relative py-2.5 px-2.5"
        style={{ borderLeft: '1px dashed rgba(255,255,255,0.06)' }}
      >
        {/* Circular cutouts */}
        <div className="absolute -left-[7px] -top-[7px] w-3.5 h-3.5 rounded-full" style={{ background: '#08080b' }} />
        <div className="absolute -left-[7px] -bottom-[7px] w-3.5 h-3.5 rounded-full" style={{ background: '#08080b' }} />

        <div className="text-xl font-bold tracking-tight" style={{ color: cpn.accentColor }}>{cpn.amount}</div>
        <div className="text-[7px] font-light tracking-widest uppercase mb-1.5" style={{ color: '#5e5e70' }}>{cpn.label}</div>
        <button
          className="py-1.5 px-3.5 border-none rounded-md text-[9px] font-medium cursor-pointer transition-transform hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: `${cpn.accentColor}1a`, color: cpn.accentColor, fontFamily: "'Poppins', sans-serif" }}
          disabled={cpn.btnDisabled}
          onClick={() => {
            if (!cpn.btnDisabled) onUse(`${cpn.name} applied!`, cpn.accentGradient);
          }}
        >
          {cpn.btnText}
        </button>
      </div>
    </div>
  );
}
