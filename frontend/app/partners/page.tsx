'use client';

import { useRouter } from 'next/navigation';
import { useLang } from '@/hooks/useLang';

const BENEFITS = [
  {
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Commission Rate',
    subtitle: 'Up to 50%',
    desc: 'Earn industry-leading commissions on every player you refer. Revenue share calculated daily with transparent reporting.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Sub-Partner Bonus',
    subtitle: '10% Extra',
    desc: 'Build your own network. Earn additional 10% commission from players referred by your sub-partners.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real-time Dashboard',
    subtitle: '24/7 Access',
    desc: 'Monitor clicks, registrations, deposits, and earnings in real-time. Detailed analytics to optimize your performance.',
  },
];

const STATS = [
  { value: '50%', label: 'Max Commission' },
  { value: '24h', label: 'Payout Speed' },
  { value: '$0', label: 'Startup Cost' },
  { value: 'Crypto', label: 'Payout Method' },
];

export default function PartnersPage() {
  const router = useRouter();
  useLang();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-medium text-white mb-4">Partner Program</h1>
        <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
          Join our affiliate program and earn passive income by referring players. No limits, no hidden fees.
        </p>
      </div>

      {/* Stats Bar */}
      <div
        className="rounded-xl p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {STATS.map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-xl md:text-2xl font-medium text-white mb-1">{stat.value}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {BENEFITS.map((benefit, i) => (
          <div
            key={i}
            className="rounded-xl p-5 card-hover"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {benefit.icon}
            </div>
            <h3 className="text-base font-medium text-white mb-1">{benefit.title}</h3>
            <p className="text-sm text-white/70 font-medium mb-2">{benefit.subtitle}</p>
            <p className="text-sm text-white/40 leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </div>

      {/* How it Works */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-lg font-medium text-white mb-5">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: '01', text: 'Sign up for the partner program through our support team.' },
            { step: '02', text: 'Get your unique referral link and promotional materials.' },
            { step: '03', text: 'Share your link and start earning from every active player.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <span
                className="text-sm font-medium text-white/30 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {item.step}
              </span>
              <p className="text-sm text-white/60 leading-relaxed pt-1.5">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => router.push('/support')}
          className="px-8 py-3.5 rounded-xl text-base font-medium text-black transition-all btn-hover"
          style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)' }}
        >
          Contact Us to Join
        </button>
        <p className="text-xs text-white/30 mt-3">Our team will get back to you within 24 hours.</p>
      </div>
    </div>
  );
}
