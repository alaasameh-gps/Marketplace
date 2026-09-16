'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import type { Product, ProductStatus } from '@/types';
import { localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as vendorService from '@/services/vendor';
import { Price } from '@/components/shared/price';
import { Alert, Badge, Button, EmptyState, PageHeader, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function VendorProductsPage() {
  const { locale, dict } = useLocale();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('created') === '1') {
      setCreated(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const load = useCallback(async (status?: ProductStatus) => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorService.listMyProducts(status ? { status } : {});
      setProducts(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (productId: string) => {
    if (!confirm(dict.common.confirm)) return;
    setError(null);
    try {
      await vendorService.deleteMyProduct(productId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !products) {
    return (
      <div>
        <PageHeader
          title={dict.vendor.products}
          action={<Button><Link href={`/${locale}/vendor/products/new`}>{dict.vendor.addProduct}</Link></Button>}
        />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={dict.vendor.products}
        action={<Button><Link href={`/${locale}/vendor/products/new`}>{dict.vendor.addProduct}</Link></Button>}
      />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {created ? <Alert tone="success" className="mb-4">{dict.vendor.productCreated}</Alert> : null}
      {products.length === 0 ? (
        <EmptyState title="No products" action={<Button><Link href={`/${locale}/vendor/products/new`}>{dict.vendor.addProduct}</Link></Button>} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Product</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>{dict.common.actions}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-neutral-50">
                <Td label="Product">
                  <p className="font-medium">{localizedText(product.name, locale)}</p>
                  {product.sku ? <p className="text-xs text-neutral-400">SKU: {product.sku}</p> : null}
                </Td>
                <Td label="Price"><Price halalas={product.price} /></Td>
                <Td label="Stock">{product.inventory?.availableStock ?? 0}</Td>
                <Td label="Status"><Badge tone={product.status === 'active' ? 'green' : product.status === 'inactive' ? 'amber' : 'neutral'}>{product.status}</Badge></Td>
                <Td label={dict.common.actions}>
                  <div className="flex gap-2">
                    <Link href={`/${locale}/vendor/products/${product._id}`} className="text-sm font-medium text-blue-700 hover:underline">
                      {dict.common.edit}
                    </Link>
                    <button onClick={() => void handleDelete(product._id)} className="text-sm font-medium text-red-600 hover:underline">
                      {dict.common.delete}
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}