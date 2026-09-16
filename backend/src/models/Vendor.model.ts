import { InferSchemaType, Schema, model } from 'mongoose';

import { VENDOR_STATUSES } from './shared.js';

export const vendorSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    storeName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 2000, default: undefined },
    logo: { type: String, trim: true, maxlength: 500, default: undefined },
    status: { type: String, enum: VENDOR_STATUSES, default: 'pending' },
    commissionRate: { type: Number, min: 0, max: 100, default: undefined },
  },
  { timestamps: true },
);

vendorSchema.index({ status: 1 });

export type VendorDoc = InferSchemaType<typeof vendorSchema>;

export const Vendor = model('Vendor', vendorSchema);