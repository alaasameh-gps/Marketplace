'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { Order } from '@/types';
import { localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import * as checkoutService from '@/services/checkout';
import * as paymentService from '@/services/payments';
import { Price } from '@/components/shared/price';
import { Alert, Badge, Button, Card, Field, Input, PageHeader, Spinner } from '@/components/ui';

export default function CheckoutPage() {
  const { locale, dict } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const { cart, loading, refreshCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderRecovered, setOrderRecovered] = useState(false);
  const [payment, setPayment] = useState<{ _id: string; status: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [idempotencyKey] = useState(() => {
    const rnd = Math.random().toString(36).slice(2, 12);
    return `frontend-${Date.now().toString(36)}-${rnd}`.padEnd(16, 'x').slice(0, 128);
  });

  useEffect(() => {
    if (user && !form.fullName) {
      setForm((f) => ({ ...f, fullName: user.name, phone: user.phone ?? '' }));
    }
  }, [user, form.fullName]);

  useEffect(() => {
    if (order && order.paymentStatus === 'paid') setPaid(true);
  }, [order]);

  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <div>
        <PageHeader title={dict.checkout.title} />
        <Alert tone="info">{dict.errors.unauthorized}</Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.groups.length === 0) {
    return (
      <div>
        <PageHeader title={dict.checkout.title} />
        <Alert tone="info">
          {dict.cart.empty}{' '}
          <Link href={`/${locale}/products`} className="font-medium text-blue-700 underline">
            {dict.cart.browseProducts}
          </Link>
        </Alert>
      </div>
    );
  }

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const result = await checkoutService.createOrder(idempotencyKey, {
        fullName: form.fullName,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        region: form.region,
        postalCode: form.postalCode || undefined,
        country: 'SA',
      });
      setOrder(result.order);
      setOrderRecovered(Boolean(result.recovered));
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    setError(null);
    try {
      const result = await paymentService.initiatePayment(order._id);
      if (!result.payment) throw new Error(dict.errors.generic);
      setPayment({ _id: result.payment._id, status: result.payment.status });

      const simulated = await paymentService.simulateSandbox(result.payment._id);
      if (simulated.payment) {
        setPaid(true);
      }
      await refreshCart();
      router.push(`/${locale}/account/orders/${order._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setPaying(false);
    }
  };

  const shippingField = (
    key: keyof typeof form,
    label: string,
    optional = false,
  ) => (
    <Field label={optional ? `${label} (${dict.productForm.optional})` : label}>
      <Input
        required={!optional}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </Field>
  );

  return (
    <div>
      <PageHeader title={dict.checkout.title} />

      {order ? (
        <div className="mx-auto max-w-2xl space-y-4">
          {orderRecovered ? (
            <Alert tone="info">
              {dict.checkout.orderCreated} — {dict.checkout.orderNumber} {order.orderNumber} (idempotent)
            </Alert>
          ) : (
            <Alert tone="success">
              {dict.checkout.orderCreated} — {dict.checkout.orderNumber}:{' '}
              <span className="font-semibold">{order.orderNumber}</span>
            </Alert>
          )}

          <Card title={dict.checkout.orderSummary}>
            <ul className="divide-y divide-neutral-100">
              {order.groups.flatMap((g) =>
                g.items.map((item) => (
                  <li key={item._id} className="flex justify-between py-2 text-sm">
                    <span>
                      {localizedText(item.productSnapshot.name, locale)} × {item.quantity}
                    </span>
                    <Price halalas={item.subtotal} />
                  </li>
                )),
              )}
            </ul>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
              <span>{dict.common.total}</span>
              <Price halalas={order.totals.total} />
            </div>
          </Card>

          <Card title={`${dict.checkout.paymentMethod} · ${order.paymentStatus}`}>
            {paid ? (
              <Alert tone="success">{dict.checkout.paid}</Alert>
            ) : (
              <>
                <p className="mb-4 text-sm text-neutral-500">{dict.checkout.simulatingNote}</p>
                <Button onClick={() => void handlePay()} loading={paying} className="w-full" size="lg">
                  {dict.checkout.payNow}
                </Button>
              </>
            )}
            <div className="mt-4">
              <Link href={`/${locale}/account/orders/${order._id}`} className="text-sm font-medium text-blue-700 underline">
                {dict.account.viewOrder}
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card title={dict.checkout.shippingAddress}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>{shippingField('fullName', dict.checkout.fullName)}</div>
                <div>{shippingField('phone', dict.checkout.phone)}</div>
                <div className="sm:col-span-2">{shippingField('line1', dict.checkout.line1)}</div>
                <div className="sm:col-span-2">{shippingField('line2', dict.checkout.line2, true)}</div>
                <div>{shippingField('city', dict.checkout.city)}</div>
                <div>{shippingField('region', dict.checkout.region)}</div>
                <div>{shippingField('postalCode', dict.checkout.postalCode, true)}</div>
              </div>
            </Card>
          </div>

          <div className="h-fit">
            <Card title={dict.checkout.orderSummary}>
              <ul className="divide-y divide-neutral-100">
                {cart.groups.flatMap((g) =>
                  g.items.map((item) => (
                    <li key={item._id} className="flex justify-between py-2 text-sm">
                      <span>
                        {item.product ? localizedText(item.product.name, locale) : '—'} × {item.quantity}
                      </span>
                      <Price halalas={item.lineTotal} />
                    </li>
                  )),
                )}
              </ul>
              <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                <span>{dict.cart.subtotal}</span>
                <Price halalas={cart.subtotal} className="font-bold" />
              </div>
              <Badge tone="amber" className="mt-2">
                {dict.checkout.paymentMethod}: sandbox
              </Badge>
            </Card>

            {error ? <Alert tone="error" className="mt-4">{error}</Alert> : null}

            <Button type="submit" loading={creating} className="mt-4 w-full" size="lg">
              {dict.checkout.placeOrder}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}