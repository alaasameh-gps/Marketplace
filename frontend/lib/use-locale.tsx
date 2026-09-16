'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { Locale } from '@/lib/i18n';
import { getDictionary, type Dict } from '@/lib/i18n';

const LocaleContext = createContext<{ locale: Locale; dict: Dict } | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dict = getDictionary(locale);
  return <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): { locale: Locale; dict: Dict } {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}