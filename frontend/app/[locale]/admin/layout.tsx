'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui';
import {
  UsersIcon,
  StoreIcon,
  PackageIcon,
  TagIcon,
  TruckIcon,
  WalletIcon,
  BanknoteIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  UserIcon,
} from '@/components/ui/icons';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { locale, dict } = useLocale();
  const { isAuthenticated, status, hasRole } = useAuth();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !hasRole(['admin'])) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-10 text-center shadow-sm">
        <p className="text-neutral-600">{dict.errors.unauthorized}</p>
      </div>
    );
  }

  const links = [
    { href: `/${locale}/admin`, label: dict.admin.overview, icon: LayoutDashboardIcon },
    { href: `/${locale}/admin/users`, label: dict.admin.users, icon: UsersIcon },
    { href: `/${locale}/admin/vendors`, label: dict.admin.vendors, icon: StoreIcon },
    { href: `/${locale}/admin/products`, label: dict.admin.products, icon: PackageIcon },
    { href: `/${locale}/admin/categories`, label: dict.admin.categories, icon: TagIcon },
    { href: `/${locale}/admin/brands`, label: dict.admin.brands, icon: TagIcon },
    { href: `/${locale}/admin/orders`, label: dict.admin.orders, icon: TruckIcon },
    { href: `/${locale}/admin/commissions`, label: dict.admin.commissions, icon: WalletIcon },
    { href: `/${locale}/admin/payments`, label: dict.admin.payments, icon: BanknoteIcon },
    { href: `/${locale}/admin/settings`, label: dict.admin.settings, icon: SettingsIcon },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white p-2 no-scrollbar lg:flex-col">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <Link
            href={`/${locale}/account`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            <UserIcon className="h-4 w-4" />
            {dict.account.profile}
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 lg:col-span-3">{children}</div>
    </div>
  );
}