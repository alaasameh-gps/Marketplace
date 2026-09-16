'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Button, Alert } from '@/components/ui';
import { isLocale } from '@/lib/i18n';

export function AddToCart({ productId, available }: { productId: string; available: number }) {
  const { locale, dict } = useLocale();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addItem(productId, quantity);
      setAdded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addItem(productId, quantity);
      router.push(`/${locale}/checkout`);
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.errors.generic);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error ? <Alert tone="error">{error}</Alert> : null}
      {added ? <Alert tone="success">{dict.products.addedToCart}</Alert> : null}

      {available > 0 ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-neutral-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-lg"
              aria-label="decrease"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(available, q + 1))}
              className="px-3 py-2 text-lg"
              aria-label="increase"
            >
              +
            </button>
          </div>
          <span className="text-xs text-neutral-500">
            {available} {dict.products.quantity}
          </span>
        </div>
      ) : (
        <span className="text-sm font-medium text-red-600">{dict.products.outOfStock}</span>
      )}

      <div className="flex gap-3">
        <Button onClick={() => void handleAdd()} disabled={available === 0} loading={loading}>
          {dict.products.addToCart}
        </Button>
        <Button variant="outline" onClick={() => void handleBuyNow()} disabled={available === 0} loading={loading}>
          {dict.products.buyNow}
        </Button>
      </div>
    </div>
  );
}