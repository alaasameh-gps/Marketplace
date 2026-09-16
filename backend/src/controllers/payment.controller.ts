import { createHmac } from 'node:crypto';

import type { Request, RequestHandler, Response } from 'express';

import { env } from '../config/env.js';
import { Order } from '../models/Order.model.js';
import { Payment } from '../models/Payment.model.js';
import {
  handlePaymentWebhook,
  initiateOrderPayment,
  listAdminPayments,
} from '../services/payment.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  InitiatePaymentInput,
  ProviderParams,
  SimulateSandboxBody,
} from '../validations/payment.validation.js';

export const initiatePaymentHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const body = req.body as InitiatePaymentInput;
    const result = await initiateOrderPayment({
      userId: authUser.id,
      orderId: body.orderId,
      providerName: body.provider,
    });
    res.status(201).json({ success: true, data: result });
  },
);

export const paymentWebhookHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { provider } = req.params as unknown as ProviderParams;
    const rawBody = (req as Request & { rawBody: Buffer }).rawBody;

    const result = await handlePaymentWebhook({
      providerName: provider,
      headers: req.headers ?? {},
      rawBody,
    });

    if (!result.accepted) {
      res.status(result.statusCode ?? 400).json({ success: false, message: 'Webhook rejected.' });
      return;
    }

    res.json({ success: true, data: result.data ?? null });
  },
);

export const listAdminPaymentsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listAdminPayments({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

/**
 * Dev-only helper: simulates the sandbox provider sending a "payment.succeeded"
 * webhook. Enabled only outside production so the UI can complete the sandbox
 * flow without exposing the webhook secret to the browser. It constructs and
 * signs the exact raw payload a provider would send, so the real verification
 * and settlement path is exercised.
 */
export const simulateSandboxWebhookHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const { paymentId } = req.body as SimulateSandboxBody;

    const payment = await Payment.findOne({ _id: paymentId, status: 'pending' });
    if (!payment) {
      throw new ApiError(404, 'Pending payment not found.');
    }
    if (payment.provider !== 'sandbox') {
      throw new ApiError(400, 'Simulation is only supported for the sandbox provider.');
    }

    const order = await Order.findOne({ _id: payment.order, customer: authUser.id });
    if (!order) {
      throw new ApiError(403, 'You do not have permission to simulate this payment.');
    }

    const rawBody = Buffer.from(
      JSON.stringify({
        event: 'payment.succeeded',
        providerRef: payment.providerRef,
        amount: payment.amount,
        currency: payment.currency,
        transactionId: `sandbox_txn_${Date.now().toString(36)}`,
      }),
    );

    const signature = createHmac('sha256', env.sandboxWebhookSecret)
      .update(rawBody)
      .digest('hex');

    const result = await handlePaymentWebhook({
      providerName: 'sandbox',
      headers: {
        'x-sandbox-signature': signature,
        'content-type': 'application/json',
      },
      rawBody,
    });

    if (!result.accepted) {
      res.status(result.statusCode ?? 400).json({ success: false, message: 'Webhook rejected.' });
      return;
    }

    res.json({ success: true, data: result.data ?? null });
  },
);