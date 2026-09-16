import Link from 'next/link';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { localizedText } from '@/lib/format';
import { serverListBrands } from '@/services/catalog';
import { Pagination } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function BrandsPage(props: PageProps<'/[locale]/brands'>) {
  const { locale: l } = await props.params;
  const { page } = await props.searchParams;
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const pageNumber = typeof page === 'string' && page !== '' ? Number(page) : 1;
  const result = await serverListBrands({ page: pageNumber, limit: 24 }).catch(() => null);
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{dict.home.browseBrands}</h1>
        <p className="text-sm text-neutral-500">{dict.products.subtitle}</p>
      </div>
      {result && result.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {result.items.map((brand) => (
              <Link
                key={brand._id}
                href={`/${resolved}/brands/${brand.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-7 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={localizedText(brand.name, resolved)}
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-neutral-100 transition-colors group-hover:ring-blue-100"
                  />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl transition-colors group-hover:bg-blue-100">
                    🏷️
                  </span>
                )}
                <span className="font-semibold text-neutral-800 group-hover:text-blue-700">
                  {localizedText(brand.name, resolved)}
                </span>
              </Link>
            ))}
          </div>
          <Pagination page={pageNumber} totalPages={totalPages} buildHref={(p) => `/${resolved}/brands?page=${p}`} />
        </>
      ) : (
        <p className="text-neutral-500">{dict.common.noData}</p>
      )}
    </div>
  );
}