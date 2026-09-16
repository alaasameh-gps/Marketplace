import Link from 'next/link';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { serverListVendors } from '@/services/catalog';
import { Pagination } from '@/components/ui';
import { StoreIcon } from '@/components/ui/icons';

export const dynamic = 'force-dynamic';

export default async function VendorsPage(props: PageProps<'/[locale]/vendors'>) {
  const { locale: l } = await props.params;
  const { page, q } = await props.searchParams;
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const pageNumber = typeof page === 'string' && page !== '' ? Number(page) : 1;
  const searchQ = typeof q === 'string' ? q : undefined;
  const result = await serverListVendors({ q: searchQ, page: pageNumber, limit: 12 }).catch(() => null);
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{dict.nav.vendors}</h1>
        <p className="text-sm text-neutral-500">{dict.products.subtitle}</p>
      </div>

      <form
        method="get"
        action={`/${resolved}/vendors`}
        className="flex max-w-xl gap-2.5 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm"
      >
        <input
          name="q"
          defaultValue={searchQ ?? ''}
          placeholder={dict.common.search}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          {dict.common.search}
        </button>
      </form>

      {result && result.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((vendor) => (
              <Link
                key={vendor._id}
                href={`/${resolved}/vendors/${vendor.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                {vendor.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vendor.logo} alt={vendor.storeName} className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-neutral-100" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600 transition-colors group-hover:bg-blue-100">
                    <StoreIcon className="h-6 w-6" />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-neutral-900 group-hover:text-blue-700">{vendor.storeName}</h3>
                  {vendor.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{vendor.description}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            page={pageNumber}
            totalPages={totalPages}
            buildHref={(p) => `/${resolved}/vendors?page=${p}${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <p className="text-4xl">🏪</p>
          <p className="mt-3 text-sm font-medium text-neutral-600">{dict.common.noData}</p>
        </div>
      )}
    </div>
  );
}