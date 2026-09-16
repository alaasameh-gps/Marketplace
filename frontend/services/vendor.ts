import { apiFetch, buildQuery } from '@/lib/api-client';
import type { Paginated, Product, ProductStatus, PublicVendor } from '@/types';

export interface VendorProductInput {
  category: string;
  brand?: string | null;
  name: { en: string; ar?: string };
  description?: { en: string; ar?: string };
  images?: string[];
  sku?: string;
  price: number;
  compareAtPrice?: number;
  status?: ProductStatus;
  availableStock?: number;
}

export async function getMyVendor() {
  const data = await apiFetch<{ vendor: PublicVendor }>('/vendors/me');
  return data.vendor;
}

export async function listMyProducts(
  params: { q?: string; status?: ProductStatus; page?: number; limit?: number } = {},
) {
  return apiFetch<Paginated<Product>>(`/vendors/me/products${buildQuery(params as Record<string, unknown>)}`);
}

export async function createMyProduct(input: VendorProductInput) {
  const data = await apiFetch<{ product: Product }>('/vendors/me/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.product;
}

export async function getMyProduct(productId: string) {
  const data = await apiFetch<{ product: Product }>(`/vendors/me/products/${productId}`);
  return data.product;
}

export async function updateMyProduct(productId: string, input: Partial<VendorProductInput>) {
  const data = await apiFetch<{ product: Product }>(`/vendors/me/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.product;
}

export async function deleteMyProduct(productId: string) {
  await apiFetch<null>(`/vendors/me/products/${productId}`, { method: 'DELETE' });
}

export async function listMyOrders(
  params: {
    status?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  return apiFetch<Paginated<Order>>(`/vendors/me/orders${buildQuery(params as Record<string, unknown>)}`);
}

export async function getMyOrder(orderId: string) {
  const data = await apiFetch<{ order: Order }>(`/vendors/me/orders/${orderId}`);
  return data.order;
}

export async function setGroupStatus(orderId: string, groupId: string, status: OrderStatus) {
  const data = await apiFetch<{ order: Order }>(`/vendors/me/orders/${orderId}/status/${groupId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.order;
}

export async function listMyCommissions(
  params: { status?: string; page?: number; limit?: number } = {},
) {
  return apiFetch<Paginated<Commission>>(`/vendors/me/commissions${buildQuery(params as Record<string, unknown>)}`);
}

export async function getMyCommissionSummary() {
  const data = await apiFetch<{ summary: CommissionSummary }>('/vendors/me/commissions/summary');
  return data.summary;
}

import type { Commission, CommissionSummary, Order, OrderStatus } from '@/types';