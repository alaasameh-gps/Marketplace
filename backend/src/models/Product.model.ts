import { InferSchemaType, Schema, model } from 'mongoose';

import { localizedTextSchema, moneyField, PRODUCT_STATUSES } from './shared.js';

export const productSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', index: true, default: undefined },
    name: { type: localizedTextSchema, required: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: localizedTextSchema },
    images: { type: [String], default: [] },
    sku: { type: String, trim: true, default: undefined },
    price: { ...moneyField },
    compareAtPrice: { ...moneyField, required: false },
    currency: { type: String, trim: true, uppercase: true, default: 'SAR', minlength: 3, maxlength: 3 },
    status: { type: String, enum: PRODUCT_STATUSES, default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    inventory: {
      type: new Schema(
        {
          availableStock: { type: Number, min: 0, default: 0 },
          reservedStock: { type: Number, min: 0, default: 0 },
          purchasedStock: { type: Number, min: 0, default: 0 },
        },
        { _id: false },
      ),
      required: true,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

productSchema.index({ status: 1, price: 1 });
productSchema.index({ status: 1, isFeatured: 1 });

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product = model('Product', productSchema);