import { createHmac, timingSafeEqual } from 'node:crypto';

import { ApiError } from '../../utils/ApiError.js';
import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  RefundResult,
  VerifyWebhookResult,
  WebhookPayload,
} from './payment-provider.js';

export interface SandboxProviderConfig {
  secret: string;
}

function parseJsonBody(rawBody: Buffer): WebhookPayload | null {
  try {
    const parsed = JSON.parse(rawBody.toString('utf8'));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.event === 'string' &&
      typeof parsed.providerRef === 'string'
    ) {
      return parsed as WebhookPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sandbox payment provider — for local development and end-to-end testing only.
 * It never moves real money. Webhooks are verified with an HMAC signature over the
 * raw body using the configured shared secret.
 */
export class SandboxPaymentProvider implements PaymentProvider {
  readonly name = 'sandbox';

  constructor(private readonly config: SandboxProviderConfig) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const providerRef = `sandbox_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    return { providerRef };
  }

  private signature(rawBody: Buffer): string {
    return createHmac('sha256', this.config.secret).update(rawBody).digest('hex');
  }

  private safeEqual(left: string, right: string): boolean {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  async verifyWebhook(headers: Record<string, unknown>, rawBody: Buffer): Promise<VerifyWebhookResult> {
    const expected = this.signature(rawBody);
    const provided = (headers['x-sandbox-signature'] as string | undefined) ?? '';

    if (!provided || !this.safeEqual(expected, provided)) {
      throw new ApiError(401, 'Invalid webhook signature.');
    }

    const payload = parseJsonBody(rawBody);
    if (!payload) {
      throw new ApiError(400, 'Invalid webhook payload.');
    }

    const event = payload.event === 'payment.failed' ? 'payment.failed' : 'payment.succeeded';

    return {
      verified: true,
      event,
      providerRef: payload.providerRef,
      amount: payload.amount,
      transactionId: payload.transactionId,
    };
  }

  async refund(providerRef: string): Promise<RefundResult> {
    return { refundRef: `sandbox_refund_${providerRef}` };
  }
}

export class ProviderUnavailableError extends Error {
  readonly statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'ProviderUnavailableError';
    this.statusCode = 502;
  }
}

export function toProviderError(error: unknown): ApiError {
  if (error instanceof ProviderUnavailableError) {
    return new ApiError(error.statusCode, error.message);
  }
  if (error instanceof ApiError) {
    return error;
  }
  return new ApiError(502, 'Payment provider error.');
}