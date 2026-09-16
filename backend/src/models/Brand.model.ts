import { InferSchemaType, Schema, model } from 'mongoose';

import { CONTENT_STATUSES, localizedTextSchema } from './shared.js';

export const brandSchema = new Schema(
  {
    name: { type: localizedTextSchema, required: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    logo: { type: String, trim: true, maxlength: 500, default: undefined },
    status: { type: String, enum: CONTENT_STATUSES, default: 'active' },
  },
  { timestamps: true },
);

brandSchema.index({ status: 1 });

export type BrandDoc = InferSchemaType<typeof brandSchema>;

export const Brand = model('Brand', brandSchema);