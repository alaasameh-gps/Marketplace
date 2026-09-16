import { isRtl, type Locale } from './i18n';

export function formatPrice(halalas: number, locale: Locale = 'en'): string {
  const sar = halalas / 100;
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 2,
  }).format(sar);
}

export function formatDateTime(value: string | Date | undefined, locale: Locale = 'en'): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatDate(value: string | Date | undefined, locale: Locale = 'en'): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    dateStyle: 'medium',
  });
}

export function localizedText(
  value: { en: string; ar?: string } | null | undefined,
  locale: Locale,
): string {
  if (!value) return '';
  if (locale === 'ar' && value.ar) return value.ar;
  return value.en;
}

export function isRtlLocale(locale: Locale): boolean {
  return isRtl(locale);
}