'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* ===== TYPES ===== */
type Tier = 'silver' | 'gold' | 'diamond';

interface CardData {
  tier: Tier;
  name: string;
  price: string;
  points: string;
  bonusRate: string;
  cardNumber: string;
  holder: string;
  badge?: string;
  features: string[];
  btnText: string;
  isDiamond?: boolean;
}

interface SpinData {
  tier: Tier;
  tierLabel: string;
  name: string;
  price: string;
  guaranteeIcon: string;
  guaranteeText: string;
  guaranteeHighlight: string;
  value: string;
  conditions: string[];
}

interface BenefitRow {
  label: string;
  silver: string | 'check' | 'na';
  gold: string | 'check' | 'na';
  diamond: string | 'check' | 'na';
}

/* ===== DATA ===== */
const CARDS: CardData[] = [
  {
    tier: 'silver',
    name: 'Silver Play Card',
    price: '500,000',
    points: '650,000',
    bonusRate: '30%',
    cardNumber: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 7821',
    holder: 'Member Since 2026',
    features: [
      'Split into any amount \u00b7 use like cash',
      'Stackable with other bonuses',
      'Rolling 600% clear = +30 Points reward',
    ],
    btnText: 'Purchase Silver Card',
  },
  {
    tier: 'gold',
    name: 'Gold Play Card',
    price: '1,000,000',
    points: '1,300,000',
    bonusRate: '30%',
    cardNumber: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 5542',
    holder: 'Member Since 2026',
    badge: 'POPULAR',
    features: [
      'Split into any amount \u00b7 use like cash',
      'Stackable with other bonuses',
      'Rolling 600% clear = +30 Points reward',
      'Priority VIP support channel',
    ],
    btnText: 'Purchase Gold Card',
  },
  {
    tier: 'diamond',
    name: 'Diamond Play Card',
    price: '3,000,000',
    points: '4,500,000',
    bonusRate: '50%',
    cardNumber: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 0001',
    holder: 'Elite Member',
    badge: 'INVITE ONLY',
    isDiamond: true,
    features: [
      'All Gold benefits included',
      'Exclusive cashback + weekly rewards',
      'Rolling 600% clear = +30 Points reward',
      'Personal VIP host \u00b7 luxury perks',
    ],
    btnText: 'Request Invitation',
  },
];

const SPINS: SpinData[] = [
  {
    tier: 'silver',
    tierLabel: 'Silver',
    name: '100K Free Spin Coupon',
    price: '100,000 KRW',
    guaranteeIcon: 'S',
    guaranteeText: 'Win below ',
    guaranteeHighlight: '10% (10,000 KRW)',
    value: '100K',
    conditions: ['Free Spin Only', '1 Use', 'Rolling x1'],
  },
  {
    tier: 'gold',
    tierLabel: 'Gold',
    name: '200K Free Spin Coupon',
    price: '200,000 KRW',
    guaranteeIcon: 'G',
    guaranteeText: 'Win below ',
    guaranteeHighlight: '18% (36,000 KRW)',
    value: '200K',
    conditions: ['Free Spin Only', '1 Use', 'Rolling x1'],
  },
  {
    tier: 'diamond',
    tierLabel: 'Diamond',
    name: '300K Free Spin Coupon',
    price: '300,000 KRW',
    guaranteeIcon: 'D',
    guaranteeText: 'Win below ',
    guaranteeHighlight: '25% (75,000 KRW)',
    value: '300K',
    conditions: ['Free Spin Only', '1 Use', 'Rolling x1'],
  },
];

const BENEFITS: BenefitRow[] = [
  { label: 'Purchase Price', silver: '500,000', gold: '1,000,000', diamond: '3,000,000' },
  { label: 'Points Received', silver: '650,000', gold: '1,300,000', diamond: '4,500,000' },
  { label: 'Bonus Rate', silver: '30%', gold: '30%', diamond: '50%' },
  { label: 'Split & Use as Cash', silver: 'check', gold: 'check', diamond: 'check' },
  { label: 'Stackable with Bonuses', silver: 'check', gold: 'check', diamond: 'check' },
  { label: 'Rolling Reward (600%)', silver: '+30 Pts', gold: '+30 Pts', diamond: '+30 Pts' },
  { label: 'Daily Deposit Bonus', silver: 'Up to 10%', gold: 'Up to 15%', diamond: 'Up to 25%' },
  { label: 'Weekly Cashback', silver: 'na', gold: '5%', diamond: '10%' },
  { label: 'Free Spin Coupon Access', silver: 'Silver', gold: 'Silver + Gold', diamond: 'All Tiers' },
  { label: 'Priority Support', silver: 'na', gold: 'check', diamond: 'check' },
  { label: 'Personal VIP Host', silver: 'na', gold: 'na', diamond: 'check' },
  { label: 'Exclusive Event Access', silver: 'na', gold: 'na', diamond: 'check' },
];

const ROLLING_STEPS = [
  { num: 1, title: 'Purchase Card', desc: 'Buy Silver or Gold play card' },
  { num: 2, title: 'Split & Play', desc: 'Use points in any amount' },
  { num: 3, title: 'Reach 600%', desc: 'Total bets = coupon x 600%' },
  { num: 4, title: 'Get Reward', desc: '+30 Points auto-credited' },
];

const NOTES = [
  'Play Card points can be split into any denomination and used like cash across all games',
  'Play Card bonuses are stackable with daily deposit bonuses and other promotions',
  'Rolling is calculated based on the coupon purchase amount, not the bonus points',
  'Diamond membership is by invitation only based on cumulative activity',
  'Free Spin Guarantee Coupons are single-use and valid for 30 days from purchase',
  'All rewards and points are subject to terms and conditions',
];

/* ===== TIER STYLES ===== */
const tierColors = {
  silver: {
    primary: '#c0c0c0',
    secondary: '#e8e8e8',
    gradient: 'linear-gradient(135deg, #8a8a9a, #c0c0c0, #e8e8e8, #c0c0c0)',
    chipBg: 'linear-gradient(145deg, #2a2a30, #3a3a42, #2a2a30)',
    chipBorder: 'rgba(192,192,192,0.2)',
    btnBg: 'linear-gradient(135deg, #6a6a78, #9a9aaa)',
    btnShadow: 'rgba(192,192,192,0.15)',
    dotBg: 'rgba(192,192,192,0.1)',
    accentGradient: 'linear-gradient(135deg, #8a8a9a, #c0c0c0, #e8e8e8, #c0c0c0)',
  },
  gold: {
    primary: '#c9a84c',
    secondary: '#f0d878',
    gradient: 'linear-gradient(135deg, #8a6d2b, #c9a84c, #f0d878, #c9a84c)',
    chipBg: 'linear-gradient(145deg, #2a2518, #3a3220, #2a2518)',
    chipBorder: 'rgba(201,168,76,0.25)',
    btnBg: 'linear-gradient(135deg, #a07830, #d0a848)',
    btnShadow: 'rgba(201,168,76,0.2)',
    dotBg: 'rgba(201,168,76,0.1)',
    accentGradient: 'linear-gradient(135deg, #8a6d2b, #c9a84c, #f0d878, #c9a84c)',
  },
  diamond: {
    primary: '#b8cce0',
    secondary: '#e8f0ff',
    gradient: 'linear-gradient(135deg, #6080a0, #a0b8d0, #e0ecff, #a0b8d0)',
    chipBg: 'linear-gradient(145deg, #1a2030, #253040, #1a2030)',
    chipBorder: 'rgba(184,204,224,0.2)',
    btnBg: 'linear-gradient(135deg, #5070a0, #90b0d0)',
    btnShadow: 'rgba(160,184,210,0.2)',
    dotBg: 'rgba(184,204,224,0.1)',
    accentGradient: 'linear-gradient(135deg, #6080a0, #a0b8d0, #e0ecff, #a0b8d0)',
  },
};

/* ===== COMPONENT ===== */
export default function VipPlayCardPage() {
  const router = useRouter();

  // Login guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [router]);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    name: string;
    price: string;
    points: string;
    rate: string;
    tier: Tier;
  } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2200);
  };

  const openModal = (card: CardData) => {
    setModal({
      open: true,
      name: card.name,
      price: card.price,
      points: card.points,
      rate: card.bonusRate,
      tier: card.tier,
    });
  };

  const closeModal = () => setModal(null);

  const confirmPurchase = () => {
    if (!modal) return;
    const tierName = modal.tier.charAt(0).toUpperCase() + modal.tier.slice(1);
    closeModal();
    showToast(`${tierName} Play Card purchased successfully`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* ===== Keyframes injected via style tag ===== */}
      <style jsx global>{`
        @keyframes cardShine {
          to { transform: rotate(360deg); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ===== TOAST ===== */}
      <div
        className="fixed top-5 left-1/2 z-[99] pointer-events-none transition-all duration-300"
        style={{
          transform: toast.visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-40px)',
          opacity: toast.visible ? 1 : 0,
          padding: '12px 28px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 400,
          color: '#fff',
          background: '#1a1a1f',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        }}
      >
        {toast.message}
      </div>

      {/* ===== PURCHASE MODAL ===== */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              background: '#0c0c0f',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 28,
              maxWidth: 400,
              width: '100%',
              animation: 'modalIn 0.3s ease',
            }}
          >
            <button
              onClick={closeModal}
              className="float-right w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#606070', border: 'none', cursor: 'pointer' }}
            >
              &#x2715;
            </button>
            <h3 className="text-[15px] font-medium text-white mb-4 pr-8">
              {modal.name} Purchase
            </h3>
            <div className="space-y-0">
              {[
                ['Card Tier', modal.name],
                ['Purchase Price', `${modal.price} KRW`],
                ['Points Received', `${modal.points} Points (${modal.rate} bonus)`],
                ['Usage', 'Split freely, use as cash'],
                ['Rolling Target', '600% of coupon amount'],
                ['Rolling Reward', '+30 Points'],
                ['Stacking', 'Compatible with other bonuses'],
              ].map(([label, value], i) => (
                <div
                  key={i}
                  className="flex justify-between py-1.5"
                  style={{ borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                >
                  <span className="text-[10px] font-extralight" style={{ color: '#606070' }}>{label}</span>
                  <span
                    className="text-[10px] font-normal"
                    style={{
                      color: (label === 'Points Received' || label === 'Rolling Reward')
                        ? tierColors[modal.tier].primary
                        : '#fff',
                      fontWeight: (label === 'Points Received' || label === 'Rolling Reward') ? 500 : 400,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={confirmPurchase}
              className="w-full py-3.5 border-none rounded-[10px] mt-4 text-xs font-medium cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{
                background: tierColors[modal.tier].btnBg,
                color: '#000',
                letterSpacing: 0.5,
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Purchase
            </button>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="text-center mb-10 pt-5">
        <div className="text-[10px] font-normal tracking-[4px] uppercase mb-2" style={{ color: '#606070' }}>
          Exclusive Membership
        </div>
        <h1 className="text-[28px] font-extralight tracking-[6px] uppercase text-white mb-1.5">
          <b className="font-bold">VIP</b> Play Card
        </h1>
        <div
          className="mx-auto my-3"
          style={{
            width: 60,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #606070, transparent)',
          }}
        />
        <div className="text-[11px] font-extralight tracking-wider" style={{ color: '#606070' }}>
          Purchase &middot; Split &middot; Play &middot; Earn Rolling Rewards
        </div>
      </div>

      {/* ===== MEMBERSHIP CARDS ===== */}
      <div className="mb-12">
        <div className="text-[11px] font-normal tracking-[3px] uppercase mb-4 pl-1" style={{ color: '#606070' }}>
          Membership Cards
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide max-sm:flex-col">
          {CARDS.map((card) => {
            const colors = tierColors[card.tier];
            return (
              <div
                key={card.tier}
                className="min-w-[280px] flex-1 rounded-[14px] overflow-hidden relative cursor-pointer group transition-all duration-[400ms]"
                style={{
                  background: '#0c0c0f',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(255,255,255,0.15)';
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(255,255,255,0.06)';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                {/* Badge */}
                {card.badge && (
                  <span
                    className="absolute top-3.5 right-3.5 z-[2] text-[7px] font-semibold tracking-[1.5px] uppercase px-2.5 py-1 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#a0a0b0',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {card.badge}
                  </span>
                )}

                {/* Card Visual */}
                <div
                  className="h-[170px] relative overflow-hidden flex items-center justify-center"
                >
                  {/* Background gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{ background: colors.gradient }}
                  />

                  {/* Chip card */}
                  <div
                    className="w-[220px] h-[138px] rounded-[10px] relative overflow-hidden transition-transform duration-[400ms] group-hover:scale-[1.03]"
                    style={{
                      background: colors.chipBg,
                      border: `1px solid ${colors.chipBorder}`,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Shine animation */}
                    <div
                      className="absolute"
                      style={{
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.03), transparent, rgba(255,255,255,0.06), transparent)',
                        animation: 'cardShine 6s linear infinite',
                      }}
                    />
                    {/* Light reflection */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)',
                      }}
                    />

                    {/* Chip content */}
                    <div className="relative z-[1] p-4 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span
                          className="text-[10px] font-light tracking-[3px] uppercase"
                          style={{ color: colors.primary }}
                        >
                          DR.SLOT
                        </span>
                        <span
                          className="text-[8px] font-semibold tracking-[1.5px] uppercase px-2 py-0.5 rounded-[3px]"
                          style={{
                            background: `${colors.primary}18`,
                            color: colors.primary,
                          }}
                        >
                          {card.tier.charAt(0).toUpperCase() + card.tier.slice(1)}
                        </span>
                      </div>

                      {/* EMV chip */}
                      <div
                        className="w-8 h-6 rounded my-2"
                        style={{
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                        }}
                      />

                      {/* Card number */}
                      <div className="text-[13px] font-light tracking-[3px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {card.cardNumber}
                      </div>

                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-light tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {card.holder}
                        </span>
                        <span className="text-[10px] font-semibold tracking-[2px]" style={{ color: colors.primary }}>
                          PLAY CARD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-[26px] font-bold tracking-tight" style={{ color: colors.secondary }}>
                      {card.price}
                    </span>
                    <span className="text-[11px] font-light" style={{ color: '#606070' }}>KRW</span>
                  </div>
                  <div className="text-[11px] font-light mb-3.5" style={{ color: colors.primary }}>
                    Receive <b className="font-semibold">{card.points} Points</b> ({card.bonusRate} Bonus)
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4">
                    {card.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-extralight" style={{ color: '#a0a0b0' }}>
                        <div
                          className="w-1 h-1 rounded-full flex-shrink-0"
                          style={{ background: colors.primary }}
                        />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full py-3 border-none rounded-lg text-[11px] font-medium tracking-wider cursor-pointer relative overflow-hidden transition-all hover:-translate-y-0.5"
                    style={{
                      background: colors.btnBg,
                      color: '#000',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    onClick={() => {
                      if (card.isDiamond) {
                        showToast('Diamond cards are by invitation only');
                      } else {
                        openModal(card);
                      }
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${colors.btnShadow}`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* Button light overlay */}
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent 60%)' }}
                    />
                    <span className="relative">{card.btnText}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== FREE SPIN GUARANTEE COUPONS ===== */}
      <div className="mb-12">
        <div className="text-[11px] font-normal tracking-[3px] uppercase mb-4 pl-1" style={{ color: '#606070' }}>
          Free Spin Guarantee Coupons
        </div>
        <div className="flex flex-col gap-3">
          {SPINS.map((spin) => {
            const colors = tierColors[spin.tier];
            return (
              <div
                key={spin.tier}
                className="flex overflow-hidden rounded-[14px] transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: '#0c0c0f',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                {/* Accent bar */}
                <div className="w-[3px] flex-shrink-0" style={{ background: colors.accentGradient }} />

                {/* Left content */}
                <div className="flex-1 p-4 sm:p-[18px_20px]">
                  <span
                    className="inline-block text-[8px] font-medium tracking-[2px] uppercase px-2 py-0.5 rounded-[3px] mb-2"
                    style={{ background: `${colors.primary}14`, color: colors.primary }}
                  >
                    {spin.tierLabel}
                  </span>
                  <div className="text-sm font-medium text-white mb-1 tracking-tight">{spin.name}</div>
                  <div className="text-[10px] font-extralight leading-relaxed mb-2.5" style={{ color: '#606070' }}>
                    Purchase <b className="font-normal" style={{ color: '#a0a0b0' }}>{spin.price}</b> free spins with this coupon. Minimum return guaranteed.
                  </div>

                  {/* Guarantee box */}
                  <div
                    className="flex items-center gap-2 p-2 sm:p-[8px_12px] rounded-md mb-2.5"
                    style={{
                      background: `${colors.primary}0a`,
                      border: `1px solid ${colors.primary}14`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                      style={{ background: `${colors.primary}1a`, color: colors.primary }}
                    >
                      {spin.guaranteeIcon}
                    </div>
                    <div className="text-[10px] font-light" style={{ color: '#a0a0b0' }}>
                      {spin.guaranteeText}<b className="font-medium text-white">{spin.guaranteeHighlight}</b> = Full <b className="font-medium text-white">{spin.price}</b> refund
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="flex gap-1 flex-wrap">
                    {spin.conditions.map((c, i) => (
                      <span
                        key={i}
                        className="text-[8px] font-light px-[7px] py-[3px] rounded-[3px]"
                        style={{
                          color: '#404050',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right ticket section */}
                <div
                  className="w-[100px] sm:w-[120px] flex flex-col items-center justify-center relative p-3.5"
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {/* Circular cutouts */}
                  <div
                    className="absolute -left-[7px] -top-[7px] w-3.5 h-3.5 rounded-full"
                    style={{ background: '#060608' }}
                  />
                  <div
                    className="absolute -left-[7px] -bottom-[7px] w-3.5 h-3.5 rounded-full"
                    style={{ background: '#060608' }}
                  />

                  <div className="text-[22px] font-bold tracking-tight mb-0.5" style={{ color: colors.secondary }}>
                    {spin.value}
                  </div>
                  <div className="text-[7px] font-light tracking-[1.5px] uppercase mb-2" style={{ color: '#404050' }}>
                    Guarantee
                  </div>
                  <button
                    className="px-5 py-2 border-none rounded-md text-[9px] font-medium tracking-wider cursor-pointer transition-transform hover:scale-[1.03]"
                    style={{
                      background: `${colors.primary}1a`,
                      color: colors.primary,
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    onClick={() => showToast(`${spin.tierLabel} coupon purchased`)}
                  >
                    BUY
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== BENEFITS TABLE ===== */}
      <div className="mb-12">
        <div className="text-[11px] font-normal tracking-[3px] uppercase mb-4 pl-1" style={{ color: '#606070' }}>
          Membership Benefits
        </div>
        <div className="overflow-x-auto rounded-[14px]" style={{ background: '#0c0c0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full border-collapse" style={{ minWidth: 500 }}>
            <thead>
              <tr>
                <th
                  className="text-left text-[9px] font-medium tracking-wider uppercase py-4 px-3 sm:px-5"
                  style={{
                    background: '#131316',
                    color: '#606070',
                    width: '40%',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  Benefits
                </th>
                {(['silver', 'gold', 'diamond'] as Tier[]).map((tier) => (
                  <th
                    key={tier}
                    className="text-center text-[9px] font-medium tracking-wider uppercase py-4 px-2 sm:px-3.5"
                    style={{
                      background: '#131316',
                      color: tierColors[tier].primary,
                      borderBottom: `2px solid ${tierColors[tier].primary}33`,
                    }}
                  >
                    <div
                      className="inline-block w-9 h-[22px] rounded-[3px] mb-1 relative overflow-hidden"
                      style={{
                        border: `1px solid ${tierColors[tier].primary}4D`,
                        background: `${tierColors[tier].primary}0D`,
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }}
                      />
                    </div>
                    <br />
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BENEFITS.map((row, ri) => (
                <tr
                  key={ri}
                  className="transition-colors hover:bg-white/[0.015]"
                >
                  <td
                    className="text-left text-[10px] font-light py-3 px-3 sm:px-5"
                    style={{
                      color: '#a0a0b0',
                      borderBottom: ri < BENEFITS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    {row.label}
                  </td>
                  {(['silver', 'gold', 'diamond'] as Tier[]).map((tier) => {
                    const val = row[tier];
                    const colors = tierColors[tier];
                    return (
                      <td
                        key={tier}
                        className="text-center text-[10px] py-3 px-2 sm:px-3.5"
                        style={{
                          color: '#606070',
                          fontWeight: 200,
                          borderBottom: ri < BENEFITS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}
                      >
                        {val === 'check' ? (
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold"
                            style={{ background: `${colors.primary}1a`, color: colors.primary }}
                          >
                            &#10003;
                          </span>
                        ) : val === 'na' ? (
                          <span className="text-sm" style={{ color: '#2a2a35' }}>&mdash;</span>
                        ) : (
                          <span style={{ color: colors.primary, fontWeight: 400 }}>{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ROLLING REWARD SYSTEM ===== */}
      <div className="mb-12">
        <div className="text-[11px] font-normal tracking-[3px] uppercase mb-4 pl-1" style={{ color: '#606070' }}>
          Rolling Reward System
        </div>
        <div
          className="rounded-[14px] p-5 sm:p-7 relative overflow-hidden"
          style={{
            background: '#0c0c0f',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Subtle light overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02), transparent 60%)' }}
          />

          <div className="relative z-[1]">
            <div className="text-base font-medium text-white mb-1 tracking-tight">
              600% Rolling Clear Reward
            </div>
            <div className="text-[10px] font-extralight mb-5" style={{ color: '#606070' }}>
              Achieve 600% rolling on your coupon amount to earn +30 Points automatically
            </div>

            {/* Flow steps */}
            <div className="flex gap-2 items-stretch mb-5 flex-wrap">
              {ROLLING_STEPS.map((step, i) => (
                <div key={step.num} className="contents">
                  <div
                    className="flex-1 min-w-[130px] rounded-[10px] p-4 text-center"
                    style={{
                      background: '#060608',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[10px] font-medium mb-2"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#606070' }}
                    >
                      {step.num}
                    </div>
                    <div className="text-[11px] font-normal text-white mb-0.5">{step.title}</div>
                    <div className="text-[9px] font-extralight leading-relaxed" style={{ color: '#606070' }}>
                      {step.desc}
                    </div>
                  </div>
                  {i < ROLLING_STEPS.length - 1 && (
                    <div className="flex items-center text-sm flex-shrink-0 max-sm:hidden" style={{ color: '#2a2a35' }}>
                      &rarr;
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Example table */}
            <div
              className="rounded-[10px] p-4 sm:p-[16px_20px]"
              style={{
                background: '#060608',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="text-[9px] font-normal tracking-[1.5px] uppercase mb-2.5" style={{ color: '#404050' }}>
                Example &mdash; Gold Card
              </div>
              {[
                ['Card Purchase', '1,000,000 KRW', false],
                ['Points Received', '1,300,000 Points', false],
                ['Rolling Target (600%)', '7,800,000 KRW in total bets', false],
                ['Reward on Completion', '+30 Points', true],
              ].map(([label, value, highlight], i) => (
                <div
                  key={i}
                  className="flex justify-between py-[5px]"
                  style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                >
                  <span className="text-[10px] font-extralight" style={{ color: '#606070' }}>{label as string}</span>
                  <span
                    className="text-[10px]"
                    style={{
                      color: highlight ? '#c9a84c' : '#fff',
                      fontWeight: highlight ? 500 : 400,
                    }}
                  >
                    {value as string}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== NOTES ===== */}
      <div
        className="pt-5 mt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {NOTES.map((note, i) => (
          <p
            key={i}
            className="text-[9px] font-extralight leading-[1.8] pl-2.5 relative mb-[1px]"
            style={{ color: '#404050' }}
          >
            <span className="absolute left-0" style={{ color: '#2a2a35' }}>*</span>
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}
