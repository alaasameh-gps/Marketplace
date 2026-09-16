import { Schema } from 'mongoose';

export const USER_ROLES = ['customer', 'vendor', 'admin'] as const;
export type Role = (typeof USER_ROLES)[number];
export const USER_STATUSES = ['active', 'suspended'] as const;
export const VENDOR_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;
export const CONTENT_STATUSES = ['active', 'inactive'] as const;
export const PRODUCT_STATUSES = ['draft', 'active', 'inactive'] as const;
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded'] as const;
export const COMMISSION_STATUSES = ['pending', 'settled'] as const;

export const localizedTextSchema = new Schema(
  {
    en: { type: String, required: true, trim: true, maxlength: 512 },
    ar: { type: String, trim: true, maxlength: 512 },
  },
  { _id: false },
);

export const isNonNegativeInteger = (value: number): boolean =>
  Number.isInteger(value) && value >= 0;

export const moneyField = {
  type: Number,
  required: true,
  min: 0,
  validate: {
    validator: isNonNegativeInteger,
    message: '{PATH} must be a non-negative integer in minor currency units',
  },
} as const;