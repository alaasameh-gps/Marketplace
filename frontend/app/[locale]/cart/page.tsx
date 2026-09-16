'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Price } from '@/components/shared/price';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Spinner,
} from '@/components/ui';
import { MinusIcon, PlusIcon, StoreIcon, TrashIcon } from '@/components/ui/icons';

export default function CartPage() {
  const { locale, dict } = useLocale();
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateItem, removeItem, clear, subtotal, itemCount } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div>
        <PageHeader title={dict.cart.title} />
        <EmptyState
          title={dict.errors.unauthorized}
          action={
            <Button onClick={() => router.push(`/${locale}/login`)}>{dict.nav.login}</Button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.groups.length === 0) {
    return (
      <div>
        <PageHeader title={dict.cart.title} />
        <EmptyState
          title={dict.cart.empty}
          action={
            <Button onClick={() => router.push(`/${locale}/products`)}>
              {dict.cart.browseProducts}
            </Button>
          }
        />
      </div>
    );
  }

  const changeQuantity = async (itemId: string, next: number) => {
    if (next < 1) return;
    setBusy(itemId);
    setError(null);
    try {
      await updateItem(itemId, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.errors.generic);
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setBusy(itemId);
    setError(null);
    try {
      await removeItem(itemId);
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.errors.generic);
    } finally {
      setBusy(null);
    }
  };

  const handleClear = async () => {
    setBusy('clear');
    setError(null);
    try {
      await clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.errors.generic);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={`${dict.cart.title} (${itemCount})`}
        action={
          <Button variant="ghost" onClick={() => void handleClear()} disabled={busy !== null}>
            {dict.cart.clear}
          </Button>
        }
      />

      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.groups.map((group) => (
            <Card key={group.vendor.id} className="overflow-hidden" padded={false}>
              <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-5 py-3">
                <StoreIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-neutral-900">Marketplace store</span>
              </div>
              <ul className="divide-y divide-neutral-100">
                {group.items.map((item) => {
                  const name = item.product ? localizedText(item.product.name, locale) : '—';
                  const image = item.product?.images?.[0];
                  return (
                    <li key={item._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-2xl">
                          🛍️
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-900">{name}</p>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          <Price halalas={item.unitPrice} />
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-stretch lg:flex-row lg:items-center lg:justify-end">
                        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1">
                          <button
                            type="button"
                            aria-label="-"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-40"
                            onClick={() => void changeQuantity(item._id ?? '', item.quantity - 1)}
                            disabled={busy === item._id}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="+"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-40"
                            onClick={() => void changeQuantity(item._id ?? '', item.quantity + 1)}
                            disabled={busy === item._id}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-4 lg:w-40 lg:justify-end">
                          <Price halalas={item.lineTotal} className="font-semibold" />
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={dict.cart.remove}
                            onClick={() => void handleRemove(item._id ?? '')}
                            disabled={busy === item._id}
                          >
                            {dict.cart.remove} <TrashIcon className="ms-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>

        <div className="h-fit">
          <Card title={dict.cart.subtotal}>
            <div className="flex items-center justify-between py-2 text-base">
              <span>{dict.cart.subtotal}</span>
              <Price halalas={subtotal} className="text-xl font-bold" />
            </div>
            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={() => router.push(`/${locale}/checkout`)}
            >
              {dict.cart.checkout}
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => router.push(`/${locale}/products`)}
            >
              {dict.cart.keepShopping}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}