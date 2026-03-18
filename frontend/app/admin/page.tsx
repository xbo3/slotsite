'use client';

import { useLang } from '@/hooks/useLang';

export default function AdminPage() {
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t('admin_dashboard_title')}</h1>
      <p className="text-text-secondary">{t('admin_desc')}</p>
    </div>
  );
}
