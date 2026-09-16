import { formatPrice } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';

export function Price({ halalas, className = '' }: { halalas: number; className?: string }) {
  const { locale } = useLocale();
  return <span className={className}>{formatPrice(halalas, locale)}</span>;
}