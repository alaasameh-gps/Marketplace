'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Commission, CommissionSummary } from '@/types';
import { formatDate } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as vendorService from '@/services/vendor';
import { Price } from '@/components/shared/price';
import { Alert, Badge, Card, EmptyState, PageHeader, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function VendorCommissionsPage() {
  const { locale, dict } = useLocale();
  const [commissions, setCommissions] = useState<Commission[] | null>(null);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, s] = await Promise.all([
        vendorService.listMyCommissions(),
        vendorService.getMyCommissionSummary(),
      ]);
      setCommissions(rows.items);
      setSummary(s);
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
        <PageHeader title={dict.vendor.commissions} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={dict.vendor.commissions} />
      {error ? <Alert tone="error">{error}</Alert> : null}

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card title={dict.vendor.totalCommissions}>
            <Price halalas={summary.totalCommissionAmount} className="text-xl font-bold" />
          </Card>
          <Card title={dict.vendor.totalEarnings}>
            <Price halalas={summary.totalVendorEarnings} className="text-xl font-bold" />
          </Card>
          <Card title={dict.common.total}>
            <span className="text-xl font-bold">{summary.totalRecords}</span>
            <span className="ml-1 text-sm text-neutral-500">records</span>
          </Card>
        </div>
      ) : null}

      {commissions.length === 0 ? (
        <EmptyState title={dict.common.noData} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Order</Th>
              <Th>Rate</Th>
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
              return (
                <tr key={c._id} className="hover:bg-neutral-50">
                  <Td label="Order" className="font-medium">{orderNumber}</Td>
                  <Td label="Rate">{c.rate}%</Td>
                  <Td label="Commission"><Price halalas={c.commissionAmount ?? 0} /></Td>
                  <Td label="Earnings"><Price halalas={c.vendorEarnings} /></Td>
                  <Td label="Status">
                    <Badge tone={c.status === 'settled' ? 'green' : 'amber'}>{c.status}</Badge>
                  </Td>
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