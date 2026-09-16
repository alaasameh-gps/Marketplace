'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import type { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatDateTime, localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as ordersService from '@/services/orders';
import { Price } from '@/components/shared/price';
import { Badge, Button, Card, EmptyState, PageHeader, Spinner, TableShell, Th, Td } from '@/components/ui';

function statusTone(status: OrderStatus | PaymentStatus): 'green' | 'red' | 'amber' | 'blue' | 'neutral' {
  if (status === 'paid' || status === 'delivered') return 'green';
  if (status === 'cancelled' || status === 'failed' || status === 'refunded') return 'red';
  if (status === 'pending' || status === 'unpaid') return 'amber';
  return 'blue';
}

export default function OrdersPage() {
  const { locale, dict } = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersService.listMyOrders({ page: 1, limit: 20 });
      setOrders(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.generic]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !orders) {
    return (
      <div>
        <PageHeader title={dict.account.myOrders} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={dict.account.myOrders} />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {orders.length === 0 ? (
        <EmptyState
          title={dict.account.noOrders}
          action={
            <Button>
              <Link href={`/${locale}/products`}>{dict.cart.browseProducts}</Link>
            </Button>
          }
        />
      ) : (
        <TableShell>
          <thead className="bg-neutral-50">
            <tr>
              <Th>{dict.checkout.orderNumber}</Th>
              <Th>{dict.account.total}</Th>
              <Th>{dict.account.orderStatus}</Th>
              <Th>{dict.account.paymentStatus}</Th>
              <Th>{dict.common.date}</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-neutral-50">
                <Td label={dict.checkout.orderNumber}>
                  <span className="font-semibold">{order.orderNumber}</span>
                  <span className="ms-2 text-xs text-neutral-400">{order.groups.length} group(s)</span>
                </Td>
                <Td label={dict.account.total}>
                  <Price halalas={order.totals.total} className="font-medium" />
                </Td>
                <Td label={dict.account.orderStatus}>
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </Td>
                <Td label={dict.account.paymentStatus}>
                  <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                </Td>
                <Td label={dict.common.date} className="text-xs text-neutral-500">{formatDateTime(order.createdAt, locale)}</Td>
                <Td>
                  <Link
                    href={`/${locale}/account/orders/${order._id}`}
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    {dict.account.viewOrder}
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}