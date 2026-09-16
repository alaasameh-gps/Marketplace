import { apiFetch, buildQuery } from '@/lib/api-client';
import type { Order, Paginated } from '@/types';

export async function listMyOrders(params: { page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Order>>(`/orders${buildQuery(params as Record<string, unknown>)}`);
}

export async function getMyOrder(orderId: string) {
  const data = await apiFetch<{ order: Order }>(`/orders/${orderId}`);
  return data.order;
}

export async function cancelOrder(orderId: string) {
  const data = await apiFetch<{ order: Order }>(`/orders/${orderId}/cancel`, { method: 'PATCH' });
  return data.order;
}