'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Product, ProductStatus } from '@/types';
import { localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Alert, Badge, Button, EmptyState, PageHeader, Select, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function AdminProductsPage() {
  const { locale, dict } = useLocale();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.listProductsAdmin(statusFilter ? { status: statusFilter as ProductStatus } : {});
      setProducts(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: ProductStatus) => {
    setError(null);
    try {
      await adminService.setProductStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !products) {
    return (
      <div>
        <PageHeader
          title={dict.admin.products}
          action={
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
              <option value="">{dict.common.all}</option>
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </Select>
          }
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
        title={dict.admin.products}
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="">{dict.common.all}</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </Select>
        }
      />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {products.length === 0 ? (
        <EmptyState title={dict.common.noData} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Product</Th>
              <Th>Vendor</Th>
              <Th>Stock</Th>
              <Th>{dict.common.status}</Th>
              <Th>{dict.common.actions}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-neutral-50">
                <Td label="Product" className="font-medium">{localizedText(p.name, locale)}</Td>
                <Td label="Vendor">{p.vendor?.storeName ?? '—'}</Td>
                <Td label="Stock">{p.inventory?.availableStock ?? 0}</Td>
                <Td label={dict.common.status}><Badge tone={p.status === 'active' ? 'green' : p.status === 'inactive' ? 'amber' : 'neutral'}>{p.status}</Badge></Td>
                <Td label={dict.common.actions}>
                  <div className="flex gap-2">
                    {p.status !== 'active' ? (
                      <Button size="sm" onClick={() => void setStatus(p._id, 'active')}>active</Button>
                    ) : null}
                    {p.status !== 'inactive' ? (
                      <Button size="sm" variant="outline" onClick={() => void setStatus(p._id, 'inactive')}>inactive</Button>
                    ) : null}
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    {p.status !== 'draft' ? (
                      <Button size="sm" variant="ghost" onClick={() => void setStatus(p._id, 'draft')}>draft</Button>
                    ) : null}
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