'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Payment } from '@/types';
import { formatDateTime } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as paymentsService from '@/services/payments';
import { Price } from '@/components/shared/price';
import { Alert, Badge, EmptyState, PageHeader, Spinner, TableShell, Th, Td } from '@/components/ui';

export default function AdminPaymentsPage() {
  const { locale, dict } = useLocale();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentsService.listAdminPayments({ limit: 50 });
      setPayments(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !payments) {
    return (
      <div>
        <PageHeader title={dict.admin.payments} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={dict.admin.payments} />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {payments.length === 0 ? (
        <EmptyState title={dict.common.noData} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Provider</Th>
              <Th>Ref</Th>
              <Th>Amount</Th>
              <Th>{dict.common.status}</Th>
              <Th>{dict.common.date}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-neutral-50">
                <Td label="Provider" className="font-medium">{p.provider}</Td>
                <Td label="Ref" className="text-neutral-500">{p.providerRef}</Td>
                <Td label="Amount"><Price halalas={p.amount} /></Td>
                <Td label={dict.common.status}>
                  <Badge tone={p.status === 'paid' ? 'green' : p.status === 'failed' || p.status === 'cancelled' || p.status === 'refunded' ? 'red' : 'amber'}>
                    {p.status}
                  </Badge>
                </Td>
                <Td label={dict.common.date} className="text-xs text-neutral-500">{formatDateTime(p.createdAt, locale)}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}