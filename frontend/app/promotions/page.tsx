'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLang } from '@/hooks/useLang';
import { promotionApi } from '@/lib/api';

interface Promotion {
  id: number;
  title: string;
  desc: string;
  image: string | null;
  likes: number;
  endsAt: string;
}

const PROMOTIONS: Promotion[] = [
  { id: 1, title: 'First Deposit 100% Bonus', desc: 'Double your first deposit instantly with crypto. Up to $1,000 bonus.', image: '/banners/보라배너.png', likes: 8447, endsAt: '2027-01-01' },
  { id: 2, title: 'Slot Loan Bonus 70%', desc: 'Get generous seeds! Borrow 70%, Pay Back Only 30%. Available for all slot games.', image: null, likes: 4601, endsAt: '2027-06-01' },
  { id: 3, title: 'Every Deposit Bonus 13>19%', desc: '13% > 16% > 19% increasing bonus on every deposit. Re-deposit starts at 10%.', image: null, likes: 3200, endsAt: '2027-03-01' },
  { id: 4, title: 'Weekend Cashback 15%', desc: 'Get 15% cashback on weekend losses. Automatically credited every Monday.', image: null, likes: 2100, endsAt: '2027-12-31' },
  { id: 5, title: 'VIP Exclusive Reload', desc: 'VIP members get exclusive reload bonuses up to 25% on every deposit.', image: null, likes: 1500, endsAt: '2027-12-31' },
];

function getTimeRemaining(endsAt: string) {
  const total = new Date(endsAt).getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(getTimeRemaining(endsAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeRemaining(endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1 text-xs text-white/40">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {time.days}d {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function PromotionsPage() {
  const router = useRouter();
  useLang();
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS);

  useEffect(() => {
    promotionApi.getPromotions().then(res => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPromotions(res.data);
      }
    }).catch(() => { /* keep dummy */ });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white mb-2">Promotions</h1>
        <p className="text-sm text-white/40">Check out our latest bonuses and special offers.</p>
      </div>

      {/* Promotion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            onClick={() => router.push(`/promotions/${promo.id}`)}
            className="rounded-xl overflow-hidden cursor-pointer card-hover"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Image */}
            {promo.image && (
              <div className="relative w-full h-40 md:h-48 overflow-hidden">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <h3 className="text-base font-medium text-white mb-1.5 leading-snug">{promo.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">{promo.desc}</p>

              {/* Footer: Likes + Countdown */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{promo.likes.toLocaleString()}</span>
                </div>
                <CountdownTimer endsAt={promo.endsAt} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
