'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { CartIcon, CloseIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, SearchIcon, StoreIcon, UserIcon } from '@/components/ui/icons';

export function Navbar() {
  const { locale, dict } = useLocale();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const links: Array<{ href: string; label: string }> = [
    { href: `/${locale}/products`, label: dict.nav.products },
    { href: `/${locale}/categories`, label: dict.nav.categories },
    { href: `/${locale}/brands`, label: dict.nav.brands },
    { href: `/${locale}/vendors`, label: dict.nav.vendors },
  ];

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/`);
    router.refresh();
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const dashboardHref = hasRole(['admin'])
    ? `/${locale}/admin`
    : hasRole(['vendor'])
      ? `/${locale}/vendor`
      : null;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href={`/${locale}/`} className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-sm">
            M
          </span>
          <span className="text-lg font-extrabold tracking-tight text-neutral-900">
            Marketplace
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={`/${locale}/products`}
            aria-label="Search products"
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 sm:flex"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>

          <Link
            href={`/${locale}/cart`}
            aria-label={dict.nav.cart}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -top-0.5 -end-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white shadow-sm">
                {itemCount}
              </span>
            ) : null}
          </Link>

          <LocaleSwitcher />

          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden items-center gap-2 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 sm:inline-flex"
            >
              {hasRole(['admin']) ? <LayoutDashboardIcon className="h-4 w-4" /> : <StoreIcon className="h-4 w-4" />}
              {hasRole(['admin']) ? dict.nav.admin : dict.nav.vendor}
            </Link>
          ) : null}

          {isAuthenticated && user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href={`/${locale}/account`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => void handleLogout()}
                aria-label={dict.nav.logout}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <LogOutIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href={`/${locale}/login`}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {dict.nav.login}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                {dict.nav.register}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex w-[84%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <Link href={`/${locale}/`} className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white">
                  M
                </span>
                <span className="text-lg font-extrabold tracking-tight text-neutral-900">Marketplace</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {dict.nav.shop}
              </p>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium ${
                    isActive(link.href) ? 'bg-blue-50 text-blue-700' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-4 h-px bg-neutral-100" />

              {isAuthenticated && user ? (
                <>
                  <Link
                    href={`/${locale}/account`}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    {user.name}
                  </Link>
                  {dashboardHref ? (
                    <Link href={dashboardHref} className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-100">
                      <StoreIcon className="h-5 w-5 text-blue-600" />
                      {hasRole(['admin']) ? dict.nav.admin : dict.nav.vendor}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOutIcon className="h-5 w-5" />
                    {dict.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login`}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    <UserIcon className="h-5 w-5 text-neutral-400" />
                    {dict.nav.login}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="mt-1 flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm"
                  >
                    {dict.nav.register}
                  </Link>
                </>
              )}
            </nav>

            <div className="border-t border-neutral-100 px-5 py-4">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}