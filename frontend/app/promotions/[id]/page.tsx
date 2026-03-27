'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLang } from '@/hooks/useLang';

interface Promotion {
  id: number;
  title: string;
  desc: string;
  image: string | null;
  likes: number;
  endsAt: string;
  details: string;
}

const PROMOTIONS: Promotion[] = [
  {
    id: 1,
    title: 'First Deposit 100% Bonus',
    desc: 'Double your first deposit instantly with crypto. Up to $1,000 bonus.',
    image: '/banners/보라배너.png',
    likes: 8447,
    endsAt: '2027-01-01',
    details: 'Make your first deposit using any supported cryptocurrency and receive a 100% match bonus up to $1,000. The bonus is credited instantly to your account balance. Rolling requirement: 15x the bonus amount. Minimum deposit: $20. This offer is available once per account and cannot be combined with other first deposit promotions. Wagering must be completed within 30 days of activation.',
  },
  {
    id: 2,
    title: 'Slot Loan Bonus 70%',
    desc: 'Get generous seeds! Borrow 70%, Pay Back Only 30%. Available for all slot games.',
    image: null,
    likes: 4601,
    endsAt: '2027-06-01',
    details: 'Our unique Slot Loan system lets you borrow up to 70% of your deposit as bonus credit. When you win, you only pay back 30% of the borrowed amount. Available for all slot games in our lobby. Minimum deposit: $50. Maximum loan: $5,000. The loan is automatically settled when you withdraw. If your balance reaches zero, the loan is forgiven with no additional charges.',
  },
  {
    id: 3,
    title: 'Every Deposit Bonus 13>19%',
    desc: '13% > 16% > 19% increasing bonus on every deposit. Re-deposit starts at 10%.',
    image: null,
    likes: 3200,
    endsAt: '2027-03-01',
    details: 'Enjoy increasing bonuses on consecutive deposits! First deposit: 13%, Second: 16%, Third and beyond: 19%. If you skip a day, the bonus resets to 10% and gradually increases again. No maximum limit on the number of deposits. Rolling requirement: 5x per bonus. Minimum deposit: $10 per transaction. Bonus is applied automatically on each deposit.',
  },
  {
    id: 4,
    title: 'Weekend Cashback 15%',
    desc: 'Get 15% cashback on weekend losses. Automatically credited every Monday.',
    image: null,
    likes: 2100,
    endsAt: '2027-12-31',
    details: 'Play your favorite games over the weekend (Saturday 00:00 - Sunday 23:59 UTC) and receive 15% cashback on net losses. The cashback is automatically calculated and credited to your account every Monday by 12:00 UTC. Maximum cashback: $500 per week. Rolling requirement: 3x the cashback amount. Only real money bets are counted toward this promotion.',
  },
  {
    id: 5,
    title: 'VIP Exclusive Reload',
    desc: 'VIP members get exclusive reload bonuses up to 25% on every deposit.',
    image: null,
    likes: 1500,
    endsAt: '2027-12-31',
    details: 'VIP members enjoy exclusive reload bonuses on every deposit. Silver: 15%, Gold: 18%, Platinum: 22%, Diamond: 25%. No limit on the number of reloads per day. Rolling requirement: 8x the bonus amount. VIP status is determined by your cumulative wagering volume. Contact your VIP manager for personalized offers and higher limits.',
  },
];

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  useLang();
  const id = Number(params.id);
  const promo = PROMOTIONS.find(p => p.id === id);

  if (!promo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-fade-in">
        <div className="text-center py-20">
          <p className="text-white/50 text-lg mb-6">Promotion not found.</p>
          <button
            onClick={() => router.push('/promotions')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-colors btn-hover"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Back to Promotions
          </button>
        </div>
      </div>
    );
  }

  const endDate = new Date(promo.endsAt);
  const formattedEnd = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => router.push('/promotions')}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Promotions
      </button>

      {/* Banner Image */}
      {promo.image && (
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
          <Image
            src={promo.image}
            alt={promo.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </div>
      )}

      {/* Title + Meta */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-medium text-white mb-3">{promo.title}</h1>
        <p className="text-base text-white/60 leading-relaxed">{promo.desc}</p>
      </div>

      {/* Info Bar */}
      <div
        className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-6"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 text-sm text-white/50">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>{promo.likes.toLocaleString()} likes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Ends {formattedEnd}</span>
        </div>
      </div>

      {/* Details */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-3">Details</h2>
        <p className="text-sm text-white/50 leading-relaxed">{promo.details}</p>
      </div>

      {/* CTA Button */}
      <button
        className="w-full py-3.5 rounded-xl text-base font-medium text-black transition-all btn-hover"
        style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)' }}
      >
        Claim Bonus
      </button>
    </div>
  );
}
