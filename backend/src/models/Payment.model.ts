import { InferSchemaType, Schema, model } from 'mongoose';

import { moneyField } from './shared.js';

export const PAYMENT_STATUSES = [
  'initiated',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
] as const;

export const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    provider: { type: String, required: true, trim: true },
    providerRef: { type: String, required: true, unique: true, trim: true },
    amount: { ...moneyField },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'SAR',
      minlength: 3,
      maxlength: 3,
    },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'initiated' },
    refundRef: { type: String, trim: true, default: undefined },
    webhookEventId: { type: String, trim: true, default: undefined },
    paidAt: { type: Date, default: undefined },
  },
  { timestamps: true },
);

paymentSchema.index({ order: 1, status: 1 });
paymentSchema.index({ status: 1 });

export type PaymentDoc = InferSchemaType<typeof paymentSchema>;

export const Payment = model('Payment', paymentSchema);