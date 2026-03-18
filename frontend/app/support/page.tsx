'use client';

import { useLang } from '@/hooks/useLang';

export default function SupportPage() {
  const { t } = useLang();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t('customer_center')}</h1>
      <p className="text-text-secondary">{t('support_desc')}</p>
    </div>
  );
}
