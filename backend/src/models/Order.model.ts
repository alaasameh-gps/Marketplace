import { InferSchemaType, Schema, model } from 'mongoose';

import { orderItemSchema } from './OrderItem.model.js';
import {
  localizedTextSchema,
  moneyField,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from './shared.js';

export const orderGroupSchema = new Schema(
  {
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: 'An order group must contain at least one item',
      },
    },
    groupSubtotal: { ...moneyField },
    commissionRate: { type: Number, min: 0, max: 100, default: 0 },
    commissionAmount: { ...moneyField, default: 0 },
    vendorEarnings: { ...moneyField, default: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  },
  { _id: true },
);

export const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    line1: { type: String, required: true, trim: true, maxlength: 255 },
    line2: { type: String, trim: true, maxlength: 255, default: undefined },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    region: { type: String, required: true, trim: true, maxlength: 120 },
    postalCode: { type: String, trim: true, maxlength: 20, default: undefined },
    country: { type: String, required: true, trim: true, minlength: 2, maxlength: 2, default: 'SA' },
  },
  { _id: false },
);

export const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 128,
      default: undefined,
      index: { unique: true, sparse: true },
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid' },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'SAR',
      minlength: 3,
      maxlength: 3,
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    groups: {
      type: [orderGroupSchema],
      required: true,
      validate: {
        validator: (groups: unknown[]) => groups.length > 0,
        message: 'An order must contain at least one vendor group',
      },
    },
    totals: {
      type: new Schema(
        {
          subtotal: { ...moneyField },
          shippingFee: { ...moneyField, default: 0 },
          tax: { ...moneyField, default: 0 },
          total: { ...moneyField },
        },
        { _id: false },
      ),
      required: true,
    },
  },
  { timestamps: true },
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'groups.vendor': 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export type OrderGroupDoc = InferSchemaType<typeof orderGroupSchema>;

export const Order = model('Order', orderSchema);