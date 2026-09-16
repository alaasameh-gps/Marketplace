import type { ApiError } from '../../utils/ApiError.js';

export interface InitiatePaymentInput {
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
}

export interface InitiatePaymentResult {
  providerRef: string;
  approvalUrl?: string;
}

export interface WebhookPayload {
  event: string;
  providerRef: string;
  amount: number;
  transactionId?: string;
}

export interface VerifyWebhookResult {
  verified: boolean;
  event?: 'payment.succeeded' | 'payment.failed';
  providerRef?: string;
  amount?: number;
  transactionId?: string;
}

export interface RefundResult {
  refundRef: string;
}

export interface PaymentProvider {
  readonly name: string;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verifyWebhook(headers: Record<string, unknown>, rawBody: Buffer): Promise<VerifyWebhookResult>;
  refund(providerRef: string, amount: number): Promise<RefundResult>;
}

export type ProviderError = ApiError;