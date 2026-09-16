'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Product } from '@/types';
import { useLocale } from '@/lib/use-locale';
import * as vendorService from '@/services/vendor';
import { ProductForm } from '@/components/shared/product-form';
import { Alert, Spinner } from '@/components/ui';

export default function EditProductPage(
  props: PageProps<'/[locale]/vendor/products/[productId]'>,
) {
  const { locale } = useLocale();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string>('');

  const load = useCallback(async () => {
    void props.params.then(async (p) => {
      setProductId(p.productId);
      try {
        setProduct(await vendorService.getMyProduct(p.productId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'load failed');
        setProduct(null);
      }
    });
  }, [props]);

  useEffect(() => {
    void load();
  }, [load]);

  if (productId && product === undefined) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error || product === null) {
    return <Alert tone="error">{error ?? 'Product not found'}</Alert>;
  }

  return <ProductForm existing={product} productId={productId} localePrefix={locale} />;
}