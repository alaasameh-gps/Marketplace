import Link from 'next/link';

import { getDictionary, isLocale } from '@/lib/i18n';
import { localizedText } from '@/lib/format';
import { serverListBrands, serverListCategories, serverListProducts } from '@/services/catalog';
import { ProductCard } from '@/components/shared/product-card';
import { ArrowRightIcon, ShieldCheckIcon, StoreIcon, TagIcon, TruckIcon } from '@/components/ui/icons';

export const dynamic = 'force-dynamic';

export default async function HomePage(props: PageProps<'/[locale]'>) {
  const { locale: l } = await props.params;
  const resolved = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const [products, categories, brands] = await Promise.all([
    serverListProducts({ sort: 'newest', limit: 8 }).catch(() => null),
    serverListCategories().catch(() => []),
    serverListBrands({ limit: 8 }).catch(() => null),
  ]);

  const sectionHeader = (title: string, href: string) => (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">{title}</h2>
      <Link
        href={href}
        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
      >
        {dict.home.viewAll}
        <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 -start-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative px-6 py-14 sm:px-12 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            <ShieldCheckIcon className="h-4 w-4" />
            {dict.home.heroTag}
          </span>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {dict.home.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-50 sm:text-lg">
            {dict.home.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/${resolved}/products`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              {dict.home.shopNow}
              <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
            <Link
              href={`/${resolved}/vendors`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {dict.nav.vendors}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: <TruckIcon className="h-6 w-6" />, label: dict.home.heroTag, sub: dict.nav.products },
          { icon: <StoreIcon className="h-6 w-6" />, label: dict.nav.vendors, sub: dict.home.heroSubtitle },
          { icon: <TagIcon className="h-6 w-6" />, label: dict.products.addToCart, sub: dict.nav.categories },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{item.label}</p>
              <p className="truncate text-xs text-neutral-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured products */}
      <section>
        {sectionHeader(dict.home.featuredProducts, `/${resolved}/products`)}
        {products && products.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-500">{dict.common.noData}</p>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 ? (
        <section>
          {sectionHeader(dict.home.browseCategories, `/${resolved}/categories`)}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category._id}
                href={`/${resolved}/categories/${category.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white px-4 py-7 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 text-3xl transition-colors group-hover:bg-blue-50">
                  {category.icon ?? '🗂️'}
                </span>
                <span className="text-sm font-medium text-neutral-800 group-hover:text-blue-700">
                  {localizedText(category.name, resolved)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Brands */}
      {brands && brands.items.length > 0 ? (
        <section>
          {sectionHeader(dict.home.browseBrands, `/${resolved}/brands`)}
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {brands.items.map((brand) => (
              <Link
                key={brand._id}
                href={`/${resolved}/brands/${brand.slug}`}
                className="shrink-0 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700 sm:shrink"
              >
                {localizedText(brand.name, resolved)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}