'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/hooks/useLang';

type CouponType = 'bonus_money' | 'free_spin' | 'deposit_bonus';
type CouponStatus = 'available' | 'used' | 'expired';

interface UserCoupon {
  id: number;
  code: string;
  name: string;
  type: CouponType;
  amount: number;
  min_deposit: number;
  status: CouponStatus;
  end_date: string;
  description: string;
}

const DUMMY_MY_COUPONS: UserCoupon[] = [
  { id: 1, code: 'WELCOME2026', name: '신규 가입 보너스', type: 'deposit_bonus', amount: 15, min_deposit: 50000, status: 'available', end_date: '2026-12-31', description: '첫 충전 시 15% 보너스 지급' },
  { id: 2, code: 'FREESPIN50', name: '3월 프리스핀', type: 'free_spin', amount: 50, min_deposit: 0, status: 'available', end_date: '2026-03-31', description: 'Gates of Olympus 50회 프리스핀' },
  { id: 3, code: 'VIP10K', name: 'VIP 보너스', type: 'bonus_money', amount: 10000, min_deposit: 100000, status: 'used', end_date: '2026-02-28', description: 'VIP 전용 보너스 머니 10,000원' },
  { id: 4, code: 'NEWYEAR2026', name: '새해 이벤트', type: 'bonus_money', amount: 20000, min_deposit: 200000, status: 'expired', end_date: '2026-01-07', description: '새해 특별 보너스 20,000원' },
];

const TYPE_ICONS: Record<CouponType, string> = {
  free_spin: '\uD83C\uDFB0',
  bonus_money: '\uD83D\uDCB0',
  deposit_bonus: '\uD83D\uDCC8',
};

const TYPE_LABELS: Record<CouponType, string> = {
  bonus_money: '보너스머니',
  free_spin: '프리스핀',
  deposit_bonus: '입금보너스',
};

const TYPE_ACCENT_COLORS: Record<CouponType, string> = {
  bonus_money: 'border-l-white/40',
  free_spin: 'border-l-white/30',
  deposit_bonus: 'border-l-blue-400',
};

export default function MyCouponsPage() {
  const { t } = useLang();
  const [coupons, setCoupons] = useState<UserCoupon[]>(DUMMY_MY_COUPONS);
  const [couponCode, setCouponCode] = useState('');
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [glowId, setGlowId] = useState<number | null>(null);
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [unfoldKey, setUnfoldKey] = useState(0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyLoading(true);
    setApplyResult(null);

    // Simulate API call
    await new Promise(r => setTimeout(r, 800));

    // Demo: always succeed with a new coupon
    const newCoupon: UserCoupon = {
      id: Date.now(),
      code: couponCode.toUpperCase(),
      name: '프로모션 보너스',
      type: 'bonus_money',
      amount: 5000,
      min_deposit: 0,
      status: 'available',
      end_date: '2026-12-31',
      description: '프로모션 보너스 머니 5,000원',
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setGlowId(newCoupon.id);
    setApplyResult({ success: true, message: t('bonus_applied') });
    setCouponCode('');
    setApplyLoading(false);

    setTimeout(() => {
      setGlowId(null);
      setApplyResult(null);
    }, 3000);
  };

  const availableCoupons = coupons.filter(c => c.status === 'available');
  const pastCoupons = coupons.filter(c => c.status !== 'available');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-light text-white mb-6">{t('my_bonuses')}</h1>

      {/* Coupon Code Input */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5 mb-8">
        <h2 className="text-sm font-light text-text-secondary mb-3">{t('bonus_code_input')}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
            placeholder={t('enter_bonus_code')}
            className="flex-1 px-4 py-3 bg-dark-input border border-white/5 rounded-lg text-white text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={applyLoading || !couponCode.trim()}
            className="px-6 py-3 btn-cta text-sm rounded-lg whitespace-nowrap"
          >
            {applyLoading ? t('checking') : t('apply')}
          </button>
        </div>
        {applyResult && (
          <div className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
            applyResult.success
              ? 'bg-success/10 text-success border border-success/20 glow-green'
              : 'bg-danger/10 text-danger border border-danger/20'
          }`}>
            {applyResult.message}
          </div>
        )}
      </div>

      {/* ===== Bonus Categories ===== */}
      <div className="mb-10">
        <div
          onClick={() => {
            if (!isUnfolded) {
              setUnfoldKey(prev => prev + 1);
            }
            setIsUnfolded(!isUnfolded);
          }}
          className="cursor-pointer select-none"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">{t('bonus_types')}</h2>
            <div className="flex items-center gap-2">
              <span className="text-white font-light text-sm">Bonus Cards</span>
              <svg
                className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isUnfolded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className={`space-y-3 transition-all duration-300 ${isUnfolded ? '' : 'max-h-16 overflow-hidden'}`}>
          {[
            { icon: '🚨', nameKey: 'emergency_bonus', descKey: 'emergency_bonus_desc', borderColor: 'border-danger/40', available: true },
            { icon: '🔮', nameKey: 'derived_bonus', descKey: 'derived_bonus_desc', borderColor: 'border-white/20', available: false },
            { icon: '🔗', nameKey: 'linked_bonus', descKey: 'linked_bonus_desc', borderColor: 'border-blue-400/40', available: true },
            { icon: '🏃', nameKey: 'relay_bonus', descKey: 'relay_bonus_desc', borderColor: 'border-white/20', available: false },
            { icon: '✋', nameKey: 'request_bonus', descKey: 'request_bonus_desc', borderColor: 'border-green-500/40', available: true },
          ].map((card, i) => (
            <div
              key={`${i}-${unfoldKey}`}
              className={`${isUnfolded && i < 4 ? `card-unfold-${i + 1}` : isUnfolded ? 'animate-fade-in' : ''}`}
            >
              <BonusCategoryCard
                icon={card.icon}
                name={t(card.nameKey)}
                desc={t(card.descKey)}
                borderColor={card.borderColor}
                available={card.available}
              />
            </div>
          ))}
        </div>
        <div className="mb-6" />

        {/* Grade Benefit - card-pearl large */}
        <div className="card-pearl rounded-2xl p-6 mb-4" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)' }}>
              👑
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-base">{t('grade_benefits_title')}</h3>
              <p className="text-text-secondary text-sm font-light">{t('grade_auto_bonus')}</p>
            </div>
            <span className="px-4 py-1.5 text-xs font-medium rounded-full" style={{ background: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)', color: '#0A0A0A' }}>
              {t('vip_only')}
            </span>
          </div>
        </div>

        {/* Bonus Loan - card-pearl dark premium */}
        <div className="card-pearl rounded-2xl p-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-dark-elevated flex items-center justify-center text-2xl">
              💳
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-base">{t('bonus_loan_title')}</h3>
              <p className="text-text-secondary text-sm font-light">{t('advance_rolling')}</p>
            </div>
            <span className="px-4 py-1.5 btn-outline text-xs rounded-full">
              {t('apply_loan')}
            </span>
          </div>
        </div>
      </div>

      {/* ===== 7만원 전환 쿠폰 ===== */}
      <div className="card-pearl rounded-2xl p-6 mb-10" style={{ borderWidth: '1px', borderColor: 'rgba(255,255,255,0.20)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)' }}>
            🎫
          </div>
          <div>
            <h3 className="text-white font-medium text-base">{t('conversion_coupon_70k')}</h3>
            <p className="text-text-secondary text-sm font-light">{t('rolling_777_desc')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary font-light">{t('current_rolling_label')}</span>
          <span className="text-white font-medium">234% / 777%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-dark-elevated rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(234 / 777) * 100}%`,
              background: 'linear-gradient(90deg, #FFFFFF, #E0E0E0)',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-xs font-light">{t('coupon_amount')}</p>
            <p className="text-white text-xl font-medium">₩70,000</p>
            <p className="text-text-muted text-xs font-light mt-0.5">최대 전환 ₩770,000</p>
          </div>
          <button
            disabled
            className="px-6 py-3 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)', color: '#0A0A0A' }}
          >
            {t('convert_btn')}
          </button>
        </div>
      </div>

      {/* Available Coupons */}
      {availableCoupons.length > 0 ? (
        <>
          <h2 className="text-lg font-light text-white mb-4">
            {t('available_bonuses')} <span className="text-white ml-1">{availableCoupons.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
            {availableCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} isGlowing={glowId === coupon.id} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center mb-10">
          <span className="text-5xl mb-4">{'\uD83C\uDF9F\uFE0F'}</span>
          <h3 className="text-lg font-light text-white mb-1">{t('no_bonuses')}</h3>
          <p className="text-text-secondary text-sm mb-4">{t('no_bonuses_desc')}</p>
          <Link href="/lobby" className="px-6 py-2.5 btn-cta text-sm rounded-lg">
            {t('view_promotions')}
          </Link>
        </div>
      )}

      {/* Past Coupons */}
      {pastCoupons.length > 0 && (
        <>
          <h2 className="text-lg font-light text-text-muted mb-4">{t('past_bonuses')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pastCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} disabled />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BonusCategoryCard({ icon, name, desc, borderColor, available }: { icon: string; name: string; desc: string; borderColor: string; available: boolean }) {
  const { t } = useLang();
  return (
    <div className={`card-glossy rounded-xl p-4 transition-all duration-300 ${borderColor} ${available ? 'card-hover' : 'opacity-50'}`} style={{ borderLeftWidth: '3px' }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-dark-elevated flex items-center justify-center text-xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-normal text-sm">{name}</h3>
          <p className="text-text-secondary text-xs font-light">{desc}</p>
        </div>
        {available && (
          <span className="px-2.5 py-1 text-[10px] font-medium rounded-full glow-gold" style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}>
            {t('available')}
          </span>
        )}
      </div>
    </div>
  );
}

function CouponCard({ coupon, isGlowing = false, disabled = false }: { coupon: UserCoupon; isGlowing?: boolean; disabled?: boolean }) {
  const { t } = useLang();
  return (
    <div className={`relative bg-dark-card rounded-xl border-l-4 ${TYPE_ACCENT_COLORS[coupon.type]} border border-white/5 overflow-hidden transition-all duration-300 ${
      isGlowing ? 'glow-gold border-white/20' : ''
    } ${disabled ? 'opacity-60' : 'card-hover'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_ICONS[coupon.type]}</span>
            <div>
              <h3 className="text-sm font-light text-white">{coupon.name}</h3>
              <span className="text-[10px] text-text-muted font-mono">{coupon.code}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-light text-white">
              {coupon.type === 'deposit_bonus' ? `${coupon.amount}%` : coupon.type === 'free_spin' ? `${coupon.amount}회` : `${coupon.amount.toLocaleString()}원`}
            </p>
            <span className="text-[10px] text-text-muted">{TYPE_LABELS[coupon.type]}</span>
          </div>
        </div>

        <p className="text-xs text-text-secondary mb-3">{coupon.description}</p>

        <div className="flex items-center justify-between">
          <div className="text-[11px] text-text-muted">
            {coupon.min_deposit > 0 && <span>최소 {coupon.min_deposit.toLocaleString()}원 | </span>}
            <span>~{coupon.end_date}</span>
          </div>

          {coupon.status === 'available' ? (
            <button className="px-4 py-1.5 btn-cta text-xs rounded-lg">
              {t('use_coupon')}
            </button>
          ) : coupon.status === 'used' ? (
            <span className="px-3 py-1 bg-dark-elevated text-text-muted text-xs rounded-lg">{t('used_complete')}</span>
          ) : (
            <span className="px-3 py-1 bg-danger/10 text-danger text-xs rounded-lg">{t('expired')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
