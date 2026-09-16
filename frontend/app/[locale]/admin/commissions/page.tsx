'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Commission } from '@/types';
import { formatDate } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Price } from '@/components/shared/price';
import { Alert, Badge, EmptyState, PageHeader, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function AdminCommissionsPage() {
  const { locale, dict } = useLocale();
  const [commissions, setCommissions] = useState<Commission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.listCommissions({ limit: 50 });
      setCommissions(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !commissions) {
    return (
      <div>
        <PageHeader title={dict.admin.commissions} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={dict.admin.commissions} />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {commissions.length === 0 ? (
        <EmptyState title={dict.common.noData} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Order</Th>
              <Th>Vendor</Th>
              <Th>Rate</Th>
              <Th>Amount</Th>
              <Th>Commission</Th>
              <Th>Earnings</Th>
              <Th>Status</Th>
              <Th>{dict.common.date}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {commissions.map((c) => {
              const orderNumber =
                typeof c.order === 'object' && c.order ? c.order.orderNumber ?? c.order._id : String(c.order);
              const vendorName =
                typeof c.vendor === 'object' && c.vendor ? c.vendor.storeName : String(c.vendor);
              return (
                <tr key={c._id} className="hover:bg-neutral-50">
                  <Td label="Order" className="font-medium">{orderNumber}</Td>
                  <Td label="Vendor">{vendorName}</Td>
                  <Td label="Rate">{c.rate}%</Td>
                  <Td label="Amount"><Price halalas={c.amount} /></Td>
                  <Td label="Commission"><Price halalas={c.commissionAmount ?? 0} /></Td>
                  <Td label="Earnings"><Price halalas={c.vendorEarnings} /></Td>
                  <Td label="Status"><Badge tone={c.status === 'settled' ? 'green' : 'amber'}>{c.status}</Badge></Td>
                  <Td label={dict.common.date} className="text-xs text-neutral-500">{formatDate(c.createdAt, locale)}</Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}