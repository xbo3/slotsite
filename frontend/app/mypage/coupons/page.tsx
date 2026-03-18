'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [coupons, setCoupons] = useState<UserCoupon[]>(DUMMY_MY_COUPONS);
  const [couponCode, setCouponCode] = useState('');
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [glowId, setGlowId] = useState<number | null>(null);

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
    setApplyResult({ success: true, message: '보너스가 적용되었습니다!' });
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
      <h1 className="text-2xl font-light text-white mb-6">내 보너스</h1>

      {/* Coupon Code Input */}
      <div className="bg-dark-card rounded-xl border border-white/5 p-5 mb-8">
        <h2 className="text-sm font-light text-text-secondary mb-3">보너스 코드 입력</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
            placeholder="보너스 코드를 입력하세요"
            className="flex-1 px-4 py-3 bg-dark-input border border-white/5 rounded-lg text-white text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={applyLoading || !couponCode.trim()}
            className="px-6 py-3 btn-cta text-sm rounded-lg whitespace-nowrap"
          >
            {applyLoading ? '확인 중...' : '적용'}
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
        <h2 className="text-lg font-medium text-white mb-4">보너스 종류</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <BonusCategoryCard
            icon="🚨"
            name="이멀전시 보너스"
            desc="긴급 지원 보너스"
            borderColor="border-danger/40"
            available={true}
          />
          <BonusCategoryCard
            icon="🔮"
            name="파생 보너스"
            desc="기존 보너스에서 파생"
            borderColor="border-white/20"
            available={false}
          />
          <BonusCategoryCard
            icon="🔗"
            name="연계 보너스"
            desc="조건 달성 시 연계 지급"
            borderColor="border-blue-400/40"
            available={true}
          />
          <BonusCategoryCard
            icon="🏃"
            name="릴레이 보너스"
            desc="단계별 달성 보너스"
            borderColor="border-white/20"
            available={false}
          />
          <BonusCategoryCard
            icon="✋"
            name="요청 보너스"
            desc="직접 요청하여 받는 보너스"
            borderColor="border-green-500/40"
            available={true}
          />
        </div>

        {/* Grade Benefit - card-pearl large */}
        <div className="card-pearl rounded-2xl p-6 mb-4" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)' }}>
              👑
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-base">그레이드 혜택</h3>
              <p className="text-text-secondary text-sm font-light">등급별 자동 지급 보너스</p>
            </div>
            <span className="px-4 py-1.5 text-xs font-medium rounded-full" style={{ background: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)', color: '#0A0A0A' }}>
              VIP 전용
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
              <h3 className="text-white font-medium text-base">보너스 대출</h3>
              <p className="text-text-secondary text-sm font-light">선지급 후 롤링 차감</p>
            </div>
            <span className="px-4 py-1.5 btn-outline text-xs rounded-full">
              신청하기
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
            <h3 className="text-white font-medium text-base">7만원 전환 쿠폰</h3>
            <p className="text-text-secondary text-sm font-light">777% 롤링 달성 시 전환 가능</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary font-light">현재 롤링</span>
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
            <p className="text-text-muted text-xs font-light">쿠폰 금액</p>
            <p className="text-white text-xl font-medium">₩70,000</p>
            <p className="text-text-muted text-xs font-light mt-0.5">최대 전환 ₩770,000</p>
          </div>
          <button
            disabled
            className="px-6 py-3 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)', color: '#0A0A0A' }}
          >
            전환하기
          </button>
        </div>
      </div>

      {/* Available Coupons */}
      {availableCoupons.length > 0 ? (
        <>
          <h2 className="text-lg font-light text-white mb-4">
            사용 가능한 보너스 <span className="text-white ml-1">{availableCoupons.length}</span>
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
          <h3 className="text-lg font-light text-white mb-1">보유 중인 보너스가 없습니다</h3>
          <p className="text-text-secondary text-sm mb-4">프로모션 페이지에서 보너스를 받아보세요</p>
          <Link href="/lobby" className="px-6 py-2.5 btn-cta text-sm rounded-lg">
            프로모션 보기
          </Link>
        </div>
      )}

      {/* Past Coupons */}
      {pastCoupons.length > 0 && (
        <>
          <h2 className="text-lg font-light text-text-muted mb-4">사용/만료된 보너스</h2>
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
            받기 가능
          </span>
        )}
      </div>
    </div>
  );
}

function CouponCard({ coupon, isGlowing = false, disabled = false }: { coupon: UserCoupon; isGlowing?: boolean; disabled?: boolean }) {
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
              사용하기
            </button>
          ) : coupon.status === 'used' ? (
            <span className="px-3 py-1 bg-dark-elevated text-text-muted text-xs rounded-lg">사용완료</span>
          ) : (
            <span className="px-3 py-1 bg-danger/10 text-danger text-xs rounded-lg">만료</span>
          )}
        </div>
      </div>
    </div>
  );
}
