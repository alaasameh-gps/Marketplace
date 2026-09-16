import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { serverListVendorProducts, serverGetVendorBySlug } from '@/services/catalog';
import { ProductCard } from '@/components/shared/product-card';
import { Pagination } from '@/components/ui';
import { ShieldCheckIcon, StoreIcon } from '@/components/ui/icons';

export const dynamic = 'force-dynamic';

export default async function VendorDetailPage(
  props: PageProps<'/[locale]/vendors/[slug]'>,
) {
  const { locale: l } = await props.params;
  const { slug } = await props.params;
  const { page } = await props.searchParams;
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const pageNumber = typeof page === 'string' && page !== '' ? Number(page) : 1;
  const vendor = await serverGetVendorBySlug(slug).catch(() => null);
  if (!vendor) notFound();

  const result = await serverListVendorProducts(slug, { page: pageNumber, limit: 12 }).catch(
    () => null,
  );
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
        <Link href={`/${resolved}/`} className="transition-colors hover:text-blue-700">{dict.nav.home}</Link>
        <span aria-hidden>·</span>
        <Link href={`/${resolved}/vendors`} className="transition-colors hover:text-blue-700">{dict.nav.vendors}</Link>
        <span aria-hidden>·</span>
        <span className="max-w-48 truncate font-medium text-neutral-800">{vendor.storeName}</span>
      </nav>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/80 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          {vendor.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.logo} alt={vendor.storeName} className="h-20 w-20 rounded-2xl object-cover shadow-sm" />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-4xl">
              <StoreIcon className="h-9 w-9 text-blue-600" />
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{vendor.storeName}</h1>
              <ShieldCheckIcon className="h-5 w-5 shrink-0 text-emerald-600" />
            </div>
            {vendor.description ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-600">{vendor.description}</p>
            ) : null}
          </div>
        </div>
      </div>

      {result && result.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <Pagination
            page={pageNumber}
            totalPages={totalPages}
            buildHref={(p) => `/${resolved}/vendors/${slug}?page=${p}`}
          />
        </>
      ) : (
        <p className="text-neutral-500">{dict.products.noResults}</p>
      )}
    </div>
  );
}