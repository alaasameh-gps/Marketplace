import { apiFetch } from '@/lib/api-client';
import type { Order } from '@/types';

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  line2?: string;
  postalCode?: string;
  country?: string;
}

export async function createOrder(idempotencyKey: string, shippingAddress: ShippingAddressInput) {
  const data = await apiFetch<{ order: Order; recovered?: boolean }>('/checkout', {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey, shippingAddress }),
  });
  return data;
}