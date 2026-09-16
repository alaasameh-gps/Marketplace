'use client';

import Link from 'next/link';

import { useLocale } from '@/lib/use-locale';

export function Footer() {
  const { locale, dict } = useLocale();

  const storeLinks = [
    { href: `/${locale}/products`, label: dict.nav.products },
    { href: `/${locale}/categories`, label: dict.nav.categories },
    { href: `/${locale}/brands`, label: dict.nav.brands },
    { href: `/${locale}/vendors`, label: dict.nav.vendors },
  ];

  const accountLinks = [
    { href: `/${locale}/cart`, label: dict.nav.cart },
    { href: `/${locale}/account`, label: dict.nav.account },
    { href: `/${locale}/login`, label: dict.nav.login },
    { href: `/${locale}/register`, label: dict.nav.register },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href={`/${locale}/`} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white">
                M
              </span>
              <span className="text-lg font-extrabold tracking-tight text-neutral-900">Marketplace</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
              Online marketplace for verified local vendors — shop, sell, and grow in one place.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900">{dict.nav.shop}</h4>
            <ul className="mt-4 space-y-2.5">
              {storeLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-500 transition-colors hover:text-blue-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900">{dict.nav.account}</h4>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-500 transition-colors hover:text-blue-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900">Marketplace</h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href={`/${locale}/vendors`} className="text-sm text-neutral-500 transition-colors hover:text-blue-700">
                  {dict.home.browseCategories}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/admin`} className="text-sm text-neutral-500 transition-colors hover:text-blue-700">
                  {dict.admin.overview}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-neutral-100 pt-6 sm:flex-row">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Marketplace · {locale}
          </p>
        </div>
      </div>
    </footer>
  );
}