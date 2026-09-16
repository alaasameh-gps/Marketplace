import Link from 'next/link';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { localizedText } from '@/lib/format';
import {
  serverListBrands,
  serverListCategories,
  serverListProducts,
  type ListProductsParams,
} from '@/services/catalog';
import { ProductCard } from '@/components/shared/product-card';
import { Pagination } from '@/components/ui';

export const dynamic = 'force-dynamic';

const SORTS: Array<{ value: ListProductsParams['sort']; label: 'newest' | 'price_asc' | 'price_desc'; }> = [
  { value: 'newest', label: 'newest' },
  { value: 'price_asc', label: 'price_asc' },
  { value: 'price_desc', label: 'price_desc' },
];

export default async function ProductsPage(props: PageProps<'/[locale]/products'>) {
  const { locale: l } = await props.params;
  const { q, category, brand, minPrice, maxPrice, sort, page } = await props.searchParams;
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const params: ListProductsParams = {
    q: typeof q === 'string' ? q : undefined,
    category: typeof category === 'string' ? category : undefined,
    brand: typeof brand === 'string' ? brand : undefined,
    minPrice: typeof minPrice === 'string' && minPrice !== '' ? Number(minPrice) : undefined,
    maxPrice: typeof maxPrice === 'string' && maxPrice !== '' ? Number(maxPrice) : undefined,
    sort:
      typeof sort === 'string' &&
      (['newest', 'oldest', 'price_asc', 'price_desc'] as const).includes(sort as never)
        ? (sort as ListProductsParams['sort'])
        : undefined,
    page: typeof page === 'string' && page !== '' ? Number(page) : 1,
    limit: 12,
  };

  const [result, categories, brands] = await Promise.all([
    serverListProducts(params).catch(() => null),
    serverListCategories().catch(() => []),
    serverListBrands({ limit: 30 }).catch(() => null),
  ]);

  const pageNumber = params.page ?? 1;
  const totalPages = result?.totalPages ?? 0;

  const buildHref = (patch: Partial<Record<string, string | number | undefined>>) => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', String(q));
    if (category) sp.set('category', String(category));
    if (brand) sp.set('brand', String(brand));
    if (minPrice !== undefined && minPrice !== '') sp.set('minPrice', String(minPrice));
    if (maxPrice !== undefined && maxPrice !== '') sp.set('maxPrice', String(maxPrice));
    if (sort) sp.set('sort', String(sort));
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') sp.delete(key);
      else sp.set(key, String(value));
    });
    const qs = sp.toString();
    return `/${resolved}/products${qs ? `?${qs}` : ''}`;
  };

  const sortLabel = (key: 'newest' | 'price_asc' | 'price_desc') =>
    key === 'newest' ? dict.products.sortNewest : key === 'price_asc' ? dict.products.sortPriceAsc : dict.products.sortPriceDesc;

  const selectCls = 'rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-800 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{dict.products.title}</h1>
        <p className="text-sm text-neutral-500">{dict.products.subtitle}</p>
      </div>

      <form
        method="get"
        action={`/${resolved}/products`}
        className="grid grid-cols-2 gap-2.5 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm sm:flex sm:flex-wrap sm:items-center"
      >
        <label className="relative col-span-2 flex items-center sm:min-w-56 sm:flex-1">
          <span className="pointer-events-none absolute start-3 text-neutral-400">
            🔍
          </span>
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder={dict.common.search}
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pe-3 ps-9 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none"
          />
        </label>
        <select name="category" defaultValue={category ?? ''} className={selectCls}>
          <option value="">{dict.products.category}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {localizedText(c.name, resolved)}
            </option>
          ))}
        </select>
        <select name="brand" defaultValue={brand ?? ''} className={selectCls}>
          <option value="">{dict.products.brand}</option>
          {brands?.items.map((b) => (
            <option key={b._id} value={b._id}>
              {localizedText(b.name, resolved)}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort ?? ''} className={selectCls}>
          <option value="">{dict.products.sortNewest}</option>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {sortLabel(s.label)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="col-span-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:col-span-1"
        >
          {dict.common.search}
        </button>
      </form>

      {result && result.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <Pagination page={pageNumber} totalPages={totalPages} buildHref={(p) => buildHref({ page: p })} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-sm font-medium text-neutral-600">{dict.products.noResults}</p>
          <Link
            href={`/${resolved}/products`}
            className="mt-4 inline-block rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            {dict.home.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}