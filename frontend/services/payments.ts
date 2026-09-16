import { apiFetch, buildQuery } from '@/lib/api-client';
import type { Order } from '@/types';

export interface InitiatePaymentResult {
  payment: {
    _id: string;
    provider: string;
    status: string;
    amount: number;
    currency: string;
    order: string;
  };
  redirectUrl?: string;
  clientToken?: string;
  order?: Order;
}

export async function initiatePayment(orderId: string) {
  return apiFetch<InitiatePaymentResult>('/payments', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

export async function simulateSandbox(paymentId: string) {
  return apiFetch<{ payment: unknown }>('/payments/simulate-sandbox', {
    method: 'POST',
    body: JSON.stringify({ paymentId }),
  });
}

export async function listAdminPayments(params: { page?: number; limit?: number; status?: string } = {}) {
  return apiFetch<Paginated<Payment>>(`/admin/payments${buildQuery(params as Record<string, unknown>)}`);
}

import type { Paginated, Payment } from '@/types';