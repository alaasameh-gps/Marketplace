'use client';

import { usePathname, useRouter } from 'next/navigation';

import type { Locale } from '@/lib/i18n';
import { isLocale } from '@/lib/i18n';
import { useLocale } from '@/lib/use-locale';
import { Select } from '@/components/ui';

export function LocaleSwitcher() {
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const change = (next: string) => {
    if (!isLocale(next) || next === locale) return;
    if (!pathname) {
      router.push(`/${next}`);
      return;
    }
    const segments = pathname.split('/');
    if (isLocale(segments[1])) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    router.push(segments.join('/') || `/${next}`);
    router.refresh();
  };

  return (
    <Select
      value={locale}
      onChange={(e) => change(e.target.value)}
      className="w-20 bg-transparent px-2 py-1.5 text-sm"
      aria-label="Language"
    >
      <option value="en">EN</option>
      <option value="ar">عربي</option>
    </Select>
  );
}