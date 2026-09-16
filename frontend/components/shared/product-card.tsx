'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { PublicProduct } from '@/types';
import { localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Price } from '@/components/shared/price';
import { CartIcon } from '@/components/ui/icons';

export function ProductCard({ product }: { product: PublicProduct }) {
  const { locale, dict } = useLocale();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const name = localizedText(product.name, locale);
  const available = product.inventory?.availableStock ?? 0;
  const image = product.images?.[0];
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (available === 0 || adding) return;
    setAdding(true);
    try {
      await addItem(product._id, 1);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } catch {
      /* ignore inline; full error surfaced on cart page */
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">
            🛍️
          </div>
        )}
        {discount > 0 ? (
          <span className="absolute top-2.5 start-2.5 rounded-md bg-red-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        ) : null}
        {available === 0 ? (
          <div className="absolute inset-x-0 bottom-0 bg-neutral-900/70 px-3 py-1.5 text-center text-xs font-semibold text-white backdrop-blur-sm">
            {dict.products.outOfStock}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-neutral-900 group-hover:text-blue-700">
          {name}
        </h3>
        {product.vendor?.storeName ? (
          <p className="truncate text-xs text-neutral-500">{product.vendor.storeName}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <div className="flex min-w-0 flex-col">
            <Price halalas={product.price} className="text-base font-bold text-neutral-900" />
            {product.compareAtPrice ? (
              <Price halalas={product.compareAtPrice} className="text-xs text-neutral-400 line-through" />
            ) : null}
          </div>
          {available > 0 ? (
            <button
              type="button"
              tabIndex={0}
              onClick={(e) => void handleAdd(e)}
              aria-label={dict.products.addToCart}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-all ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white hover:scale-105 hover:bg-blue-700 active:scale-95'
              }`}
            >
              <CartIcon className={`h-4 w-4 ${adding ? 'animate-pulse' : ''}`} />
            </button>
          ) : (
            <span className="text-xs font-semibold text-neutral-400">{dict.products.outOfStock}</span>
          )}
        </div>
      </div>
    </Link>
  );
}