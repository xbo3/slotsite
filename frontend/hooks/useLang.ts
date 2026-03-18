'use client';
import { useState, useEffect, useCallback } from 'react';
import { getLang, setLang as saveLang, t as translate, Lang } from '@/lib/i18n';

export function useLang() {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    setLangState(getLang());
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    saveLang(newLang);
  }, []);

  const toggleLang = useCallback(() => {
    const newLang = lang === 'ko' ? 'en' : 'ko';
    setLang(newLang);
  }, [lang, setLang]);

  const t = useCallback((key: string) => {
    return translate(key, lang);
  }, [lang]);

  return { lang, setLang, toggleLang, t };
}
