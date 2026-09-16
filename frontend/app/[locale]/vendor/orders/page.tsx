'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Order, OrderStatus } from '@/types';
import { formatDateTime, localizedText } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import * as vendorService from '@/services/vendor';
import { Price } from '@/components/shared/price';
import { Alert, Badge, Button, Card, EmptyState, PageHeader, Select, Spinner, TableShell, Th, Td } from '@/components/ui';

const GROUP_TRANSITIONS: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function VendorOrdersPage() {
  const { locale, dict } = useLocale();
  const [orders, setOrders] = useState<Array<Order & { grouping?: string }> | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorService.listMyOrders(status ? { status } : {});
      setOrders(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.generic]);

  useEffect(() => {
    void load(statusFilter || undefined);
  }, [load, statusFilter]);

  const updateGroup = async (orderId: string, groupId: string, status: OrderStatus) => {
    setError(null);
    try {
      await vendorService.setGroupStatus(orderId, groupId, status);
      await load(statusFilter || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    }
  };

  if (loading || !orders) {
    return (
      <div>
        <PageHeader
          title={dict.vendor.orders}
          action={
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="">{dict.common.all}</option>
              {GROUP_TRANSITIONS.map((s) => (
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
        title={dict.vendor.orders}
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">{dict.common.all}</option>
            {GROUP_TRANSITIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        }
      />
      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}
      {orders.length === 0 ? (
        <EmptyState title={dict.account.noOrders} />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} title={`${order.orderNumber} · ${formatDateTime(order.createdAt, locale)}`}>
              {order.groups.map((group) => {
                const vendorId = typeof group.vendor === 'string' ? group.vendor : group.vendor?._id;
                return (
                  <div key={group._id} className="mb-3 rounded-md border border-neutral-100 p-3 last:mb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge tone={group.status === 'delivered' ? 'green' : group.status === 'cancelled' || group.status === 'refunded' ? 'red' : 'blue'}>
                        {group.status}
                      </Badge>
                      <span className="text-sm text-neutral-500">group: {group._id.slice(-6)}</span>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                      {group.items.map((item) => (
                        <li key={item._id} className="flex justify-between text-sm">
                          <span>{localizedText(item.productSnapshot.name, locale)} × {item.quantity}</span>
                          <Price halalas={item.subtotal} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        {GROUP_TRANSITIONS.map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={group.status === s ? 'primary' : 'outline'}
                            disabled={group.status === s}
                            onClick={() => void updateGroup(order._id, group._id, s)}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                      <div className="text-sm text-neutral-600">
                        <Price halalas={group.groupSubtotal} className="font-medium" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}