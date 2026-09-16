'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Order, OrderStatus } from '@/types';
import { formatDateTime, localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as adminService from '@/services/admin';
import { Alert, Badge, Button, EmptyState, PageHeader, Select, Spinner, TableShell, Th, Td } from '@/components/ui';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrdersPage() {
  const { locale, dict } = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.listOrdersAdmin(statusFilter ? { status: statusFilter as OrderStatus } : {});
      setOrders(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: OrderStatus) => {
    setError(null);
    try {
      await adminService.setOrderStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !orders) {
    return (
      <div>
        <PageHeader
          title={dict.admin.orders}
          action={
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="">{dict.common.all}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
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
        title={dict.admin.orders}
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">{dict.common.all}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        }
      />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {orders.length === 0 ? (
        <EmptyState title={dict.common.noData} />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>Order</Th>
              <Th>Groups</Th>
              <Th>Payment</Th>
              <Th>{dict.common.status}</Th>
              <Th>{dict.common.date}</Th>
              <Th>{dict.common.actions}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-neutral-50">
                <Td label="Order" className="font-medium">{o.orderNumber}</Td>
                <Td label="Groups">
                  <span className="text-sm">{o.groups.length} group(s)</span>
                </Td>
                <Td label="Payment"><Badge tone={o.paymentStatus === 'paid' ? 'green' : o.paymentStatus === 'refunded' || o.paymentStatus === 'failed' ? 'red' : 'amber'}>{o.paymentStatus}</Badge></Td>
                <Td label={dict.common.status}><Badge tone={o.status === 'delivered' ? 'green' : o.status === 'cancelled' || o.status === 'refunded' ? 'red' : 'blue'}>{o.status}</Badge></Td>
                <Td label={dict.common.date} className="text-xs text-neutral-500">{formatDateTime(o.createdAt, locale)}</Td>
                <Td label={dict.common.actions}>
                  <Select
                    className="w-40 px-2 py-1.5 text-sm"
                    value={o.status}
                    onChange={(e) => void setStatus(o._id, e.target.value as OrderStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}