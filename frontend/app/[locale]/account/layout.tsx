'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { ReactNode } from 'react';
import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { locale, dict } = useLocale();
  const { isAuthenticated, status, user } = useAuth();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-10 text-center">
        <p className="text-neutral-600">{dict.errors.unauthorized}</p>
        <Link href={`/${locale}/login`} className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          {dict.nav.login}
        </Link>
      </div>
    );
  }

  const links = [
    { href: `/${locale}/account`, label: dict.account.profile },
    { href: `/${locale}/account/orders`, label: dict.account.myOrders },
  ];
  if (user.role === 'vendor') links.push({ href: `/${locale}/vendor`, label: dict.nav.vendor });
  if (user.role === 'admin') links.push({ href: `/${locale}/admin`, label: dict.nav.admin });

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <nav className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                pathname === link.href ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}