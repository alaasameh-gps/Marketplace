import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Locale } from '@/lib/i18n';
import { getDictionary, isLocale } from '@/lib/i18n';
import { formatPrice, localizedText } from '@/lib/format';
import { serverGetProductBySlug } from '@/services/catalog';
import { AddToCart } from '@/components/shared/add-to-cart';
import { Badge, Card } from '@/components/ui';
import { ShieldCheckIcon, TagIcon, TruckIcon } from '@/components/ui/icons';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage(props: PageProps<'/[locale]/products/[slug]'>) {
  const { locale: l } = await props.params;
  const { slug } = await props.params;
  const resolved: Locale = isLocale(l) ? l : 'en';
  const dict = getDictionary(resolved);

  const product = await serverGetProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const available = product.inventory?.availableStock ?? 0;
  const image = product.images?.[0];
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
        <Link href={`/${resolved}/`} className="transition-colors hover:text-blue-700">
          {dict.nav.home}
        </Link>
        <span aria-hidden>·</span>
        <Link href={`/${resolved}/products`} className="transition-colors hover:text-blue-700">
          {dict.nav.products}
        </Link>
        <span aria-hidden>·</span>
        <span className="max-w-48 truncate font-medium text-neutral-800">{localizedText(product.name, resolved)}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={localizedText(product.name, resolved)}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-6xl text-neutral-300">
                🛍️
              </div>
            )}
            {discount > 0 ? (
              <span className="absolute top-3 start-3 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                -{discount}%
              </span>
            ) : null}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {available === 0 ? (
                <Badge tone="red" dot>{dict.products.outOfStock}</Badge>
              ) : (
                <Badge tone="green" dot>
                  {dict.products.quantity}: {available}
                </Badge>
              )}
              {product.category ? (
                <Badge tone="indigo">{localizedText(product.category.name, resolved)}</Badge>
              ) : null}
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {localizedText(product.name, resolved)}
            </h1>

            {product.vendor ? (
              <Link
                href={`/${resolved}/vendors/${product.vendor.slug}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                {product.vendor.storeName}
              </Link>
            ) : null}
          </div>

          {/* Price */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-neutral-900">{formatPrice(product.price, resolved)}</span>
              {product.compareAtPrice ? (
                <div className="flex flex-col">
                  <span className="text-lg font-medium text-neutral-400 line-through">{formatPrice(product.compareAtPrice, resolved)}</span>
                  <span className="text-xs font-semibold text-emerald-600">Save {discount}%</span>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <AddToCart productId={product._id} available={available} />
            </div>
          </div>

          {/* Highlights */}
          {product.description ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: <TagIcon className="h-5 w-5" />, title: dict.products.category, value: product.brand ? localizedText(product.brand.name, resolved) : '-' },
                { icon: <TruckIcon className="h-5 w-5" />, title: dict.nav.products, value: dict.products.shipping },
                { icon: <ShieldCheckIcon className="h-5 w-5" />, title: dict.nav.vendors, value: dict.products.verified },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-200/80 bg-white px-4 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-600">{item.icon}</div>
                  <p className="mt-2 text-2xs text-neutral-500">{item.title}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-neutral-800">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {product.description ? (
            <Card title={dict.products.description}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {localizedText(product.description, resolved)}
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}