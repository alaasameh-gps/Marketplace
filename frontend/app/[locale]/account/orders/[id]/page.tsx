'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import type { Order } from '@/types';
import { formatDateTime, localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as ordersService from '@/services/orders';
import * as paymentsService from '@/services/payments';
import { Price } from '@/components/shared/price';
import { Alert, Badge, Button, Card, PageHeader, Spinner } from '@/components/ui';

export default function OrderDetailPage(props: PageProps<'/[locale]/account/orders/[id]'>) {
  const { locale, dict } = useLocale();
  const id = useOrderId(props);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersService.getMyOrder(id);
      setOrder(result);
      if (result.paymentStatus === 'paid') setPaid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [id, dict.errors.generic]);

  useEffect(() => {
    if (id) void load();
  }, [id, load]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    setError(null);
    try {
      const result = await paymentsService.initiatePayment(order._id);
      await paymentsService.simulateSandbox(result.payment._id);
      setPaid(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setPaying(true);
    setError(null);
    try {
      await ordersService.cancelOrder(order._id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setPaying(false);
    }
  };

  if (loading || !order) {
    return (
      <div>
        <PageHeader title={dict.account.order} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  const cancelable = order.status === 'pending' || order.status === 'confirmed';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dict.account.order} ${order.orderNumber}`}
        action={cancelable ? (
          <Button variant="danger" loading={paying} onClick={() => void handleCancel()}>
            {dict.account.cancelOrder}
          </Button>
        ) : null}
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="flex gap-2">
        <Badge tone={order.status === 'delivered' ? 'green' : order.status === 'cancelled' || order.status === 'refunded' ? 'red' : 'blue'}>
          {dict.account.orderStatus}: {order.status}
        </Badge>
        <Badge tone={order.paymentStatus === 'paid' ? 'green' : order.paymentStatus === 'refunded' || order.paymentStatus === 'failed' ? 'red' : 'amber'}>
          {dict.account.paymentStatus}: {order.paymentStatus}
        </Badge>
      </div>

      {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && order.status !== 'refunded' ? (
        <Card title={dict.checkout.paymentMethod}>
          <p className="mb-3 text-sm text-neutral-500">sandbox • {dict.checkout.simulatingNote}</p>
          <Button onClick={() => void handlePay()} loading={paying}>
            {dict.checkout.payNow}
          </Button>
        </Card>
      ) : paid ? (
        <Alert tone="success">{dict.checkout.paid}</Alert>
      ) : null}

      <Card title={dict.checkout.orderSummary}>
        {order.groups.map((group) => (
          <div key={group._id} className="mb-4 last:mb-0">
            <p className="mb-2 text-sm font-semibold text-neutral-500">Marketplace store · {group.status}</p>
            <ul className="divide-y divide-neutral-100">
              {group.items.map((item) => (
                <li key={item._id} className="flex justify-between py-2 text-sm">
                  <span>
                    {localizedText(item.productSnapshot.name, locale)} × {item.quantity}
                  </span>
                  <Price halalas={item.subtotal} />
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between text-sm text-neutral-600">
              <span>group subtotal</span>
              <Price halalas={group.groupSubtotal} />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
          <span className="font-semibold">{dict.common.total}</span>
          <Price halalas={order.totals.total} className="text-xl font-bold" />
        </div>
      </Card>

      <Card title={dict.checkout.shippingAddress}>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-neutral-500">{dict.checkout.fullName}</dt><dd>{order.shippingAddress.fullName}</dd></div>
          <div><dt className="text-neutral-500">{dict.checkout.phone}</dt><dd>{order.shippingAddress.phone}</dd></div>
          <div className="sm:col-span-2"><dt className="text-neutral-500">Address</dt><dd>{order.shippingAddress.line1} {order.shippingAddress.line2 ?? ''}</dd></div>
          <div><dt className="text-neutral-500">{dict.checkout.city}</dt><dd>{order.shippingAddress.city}</dd></div>
          <div><dt className="text-neutral-500">{dict.checkout.region}</dt><dd>{order.shippingAddress.region}</dd></div>
          {order.shippingAddress.postalCode ? (
            <div><dt className="text-neutral-500">{dict.checkout.postalCode}</dt><dd>{order.shippingAddress.postalCode}</dd></div>
          ) : null}
        </dl>
        <p className="mt-3 text-xs text-neutral-500">Created {formatDateTime(order.createdAt, locale)}</p>
        <Link href={`/${locale}/account/orders`} className="mt-2 inline-block text-sm font-medium text-blue-700 hover:underline">
          ← {dict.account.myOrders}
        </Link>
      </Card>
    </div>
  );
}

// Read id param: Next 16 params is a Promise.
function useOrderId(props: PageProps<'/[locale]/account/orders/[id]'>): string {
  const [id, setId] = useState<string>('');
  useEffect(() => {
    void props.params.then((p) => setId(p.id));
  }, [props]);
  return id;
}