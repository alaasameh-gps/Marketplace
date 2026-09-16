import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { localizedText } from '@/lib/format';
import { serverListBrands, serverListProducts } from '@/services/catalog';
import { ProductCard } from '@/components/shared/product-card';
import { Pagination } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function BrandDetailPage(
  props: PageProps<'/[locale]/brands/[slug]'>,
) {
  const { locale: l } = await props.params;
  const { slug } = await props.params;
  const { page } = await props.searchParams;
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const brandsResult = await serverListBrands({ limit: 100 }).catch(() => null);
  const brand = brandsResult?.items.find((b) => b.slug === slug);
  if (!brand) notFound();

  const pageNumber = typeof page === 'string' && page !== '' ? Number(page) : 1;
  const result = await serverListProducts({ brand: brand._id, page: pageNumber, limit: 12 }).catch(
    () => null,
  );
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
        <Link href={`/${resolved}/`} className="transition-colors hover:text-blue-700">{dict.nav.home}</Link>
        <span aria-hidden>·</span>
        <Link href={`/${resolved}/brands`} className="transition-colors hover:text-blue-700">{dict.nav.brands}</Link>
        <span aria-hidden>·</span>
        <span className="max-w-48 truncate font-medium text-neutral-800">{localizedText(brand.name, resolved)}</span>
      </nav>

      <div className="flex items-center gap-4">
        {brand.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logo} alt={localizedText(brand.name, resolved)} className="h-16 w-16 rounded-2xl object-cover ring-4 ring-neutral-100" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">🏷️</span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {localizedText(brand.name, resolved)}
          </h1>
          <p className="text-sm text-neutral-500">{dict.products.subtitle}</p>
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
            buildHref={(p) => `/${resolved}/brands/${slug}?page=${p}`}
          />
        </>
      ) : (
        <p className="text-neutral-500">{dict.products.noResults}</p>
      )}
    </div>
  );
}