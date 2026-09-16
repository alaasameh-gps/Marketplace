import { env } from '../config/env.js';
import { Order } from '../models/Order.model.js';
import { Payment } from '../models/Payment.model.js';
import { settleCommissionsForOrder } from './commission.service.js';
import { finalizePurchasedStock } from './product.service.js';
import type { PaymentProvider, VerifyWebhookResult } from './payment/payment-provider.js';
import { SandboxPaymentProvider } from './payment/sandbox-provider.js';
import { ApiError } from '../utils/ApiError.js';

function buildProviderRegistry(): Record<string, PaymentProvider> {
  const sandbox: PaymentProvider = new SandboxPaymentProvider({
    secret: env.sandboxWebhookSecret,
  });
  return { sandbox };
}

const providers = buildProviderRegistry();

export function getProvider(name: string): PaymentProvider {
  const provider = providers[name];
  if (!provider) {
    throw new ApiError(400, `Unsupported payment provider: ${name}.`);
  }
  return provider;
}

export interface InitiateOrderPaymentInput {
  userId: string;
  orderId: string;
  providerName: string;
}

export async function initiateOrderPayment(input: InitiateOrderPaymentInput) {
  const order = await Order.findOne({ _id: input.orderId, customer: input.userId });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  if (order.paymentStatus === 'paid') {
    throw new ApiError(409, 'Order is already paid.');
  }
  if (order.paymentStatus === 'refunded') {
    throw new ApiError(409, 'Order was refunded.');
  }
  if (order.status === 'cancelled' || order.status === 'refunded') {
    throw new ApiError(400, 'Cancelled orders cannot be paid.');
  }

  const provider = getProvider(input.providerName);

  const existing = await Payment.findOne({
    order: order._id,
    status: { $in: ['initiated', 'pending'] },
  });
  if (existing) {
    return { payment: existing, approvalUrl: existing.providerRef };
  }

  const { providerRef } = await provider.initiate({
    orderNumber: order.orderNumber,
    amount: order.totals.total,
    currency: order.currency,
    description: `Marketplace order ${order.orderNumber}`,
  });

  const payment = await Payment.create({
    order: order._id,
    provider: provider.name,
    providerRef,
    amount: order.totals.total,
    currency: order.currency,
    status: 'pending',
  });

  return { payment, approvalUrl: providerRef };
}

export interface HandlePaymentWebhookInput {
  providerName: string;
  headers: Record<string, unknown>;
  rawBody: Buffer;
}

export async function handlePaymentWebhook(input: HandlePaymentWebhookInput) {
  const provider = getProvider(input.providerName);
  let verification: VerifyWebhookResult;
  try {
    verification = await provider.verifyWebhook(input.headers, input.rawBody);
  } catch (error) {
    return { accepted: false, statusCode: error instanceof ApiError ? error.statusCode : 500 };
  }

  if (!verification.verified || !verification.providerRef) {
    return { accepted: false, statusCode: 400 };
  }

  const payment = await Payment.findOne({ providerRef: verification.providerRef });
  if (!payment) {
    return { accepted: false, statusCode: 404 };
  }

  if (payment.webhookEventId && payment.webhookEventId === verification.transactionId) {
    return { accepted: true, data: { payment } };
  }

  if (verification.event === 'payment.succeeded') {
    if (payment.status === 'paid') {
      return { accepted: true, data: { payment } };
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      return { accepted: false, statusCode: 404 };
    }

    payment.status = 'paid';
    payment.paidAt = new Date();
    if (verification.transactionId) payment.webhookEventId = verification.transactionId;
    await payment.save();

    order.paymentStatus = 'paid' as never;
    await order.save();

    for (const group of order.groups) {
      for (const item of group.items) {
        await finalizePurchasedStock(item.product.toString(), item.quantity);
      }
    }

    await settleCommissionsForOrder(order._id.toString());

    return { accepted: true, data: { payment, order } };
  }

  if (verification.event === 'payment.failed') {
    payment.status = 'failed';
    if (verification.transactionId) payment.webhookEventId = verification.transactionId;
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order && order.paymentStatus === 'unpaid') {
      order.paymentStatus = 'failed' as never;
      await order.save();
    }

    return { accepted: true, data: { payment, order } };
  }

  return { accepted: false, statusCode: 400 };
}

export interface RefundOrderPaymentInput {
  userId?: string;
  isAdmin?: boolean;
  orderId: string;
  providerName: string;
}

export async function refundOrderPayment(input: RefundOrderPaymentInput) {
  const order = await Order.findOne({ _id: input.orderId });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (!input.isAdmin && order.customer.toString() !== input.userId) {
    throw new ApiError(403, 'You do not have permission to refund this order.');
  }

  if (order.paymentStatus !== 'paid') {
    throw new ApiError(409, 'Only paid orders can be refunded.');
  }

  const provider = getProvider(input.providerName);
  const payment = await Payment.findOne({ order: order._id, status: 'paid' });
  if (!payment) {
    throw new ApiError(404, 'Payment not found for this order.');
  }

  const { refundRef } = await provider.refund(payment.providerRef, payment.amount);

  payment.status = 'refunded';
  payment.refundRef = refundRef;
  await payment.save();

  order.paymentStatus = 'refunded' as never;
  await order.save();

  return { payment, order };
}

export async function listAdminPayments(params: { page?: number; limit?: number }) {
  const page = Math.max(Number(params.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(params.limit ?? 20), 1), 100);
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Payment.find()
      .populate('order', 'orderNumber customer totals')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(),
  ]);

  return {
    items: docs,
    total,
    page,
    limit,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}