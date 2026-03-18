'use client';

import Link from 'next/link';
import { useLang } from '@/hooks/useLang';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t mt-auto" style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-8">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Logo & Copyright */}
          <div>
            <span className="text-xl tracking-[0.15em]">
              <span className="text-white font-light">DR.</span>
              <span className="text-white font-thin tracking-[0.2em]">SLOT</span>
            </span>
            <p className="mt-2 text-sm font-light" style={{ color: '#888888' }}>
              {t('best_slot_experience')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-light text-white mb-3">{t('quick_links')}</h3>
            <ul className="space-y-2 text-sm font-light" style={{ color: '#888888' }}>
              <li>
                <Link href="/lobby" className="hover:text-white transition-colors">
                  {t('game_lobby')}
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-white transition-colors">
                  {t('deposit_withdraw')}
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  {t('support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-light text-white mb-3">{t('info')}</h3>
            <ul className="space-y-2 text-sm font-light" style={{ color: '#888888' }}>
              <li>{t('age_restriction')}</li>
              <li>{t('responsible_gaming_msg')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-xs font-light" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#555555' }}>
          &copy; {new Date().getFullYear()} DR.SLOT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
