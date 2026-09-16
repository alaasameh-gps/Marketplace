import { InferSchemaType, Schema, model } from 'mongoose';

import { CONTENT_STATUSES, localizedTextSchema } from './shared.js';

export const categorySchema = new Schema(
  {
    name: { type: localizedTextSchema, required: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    icon: { type: String, trim: true, maxlength: 500, default: undefined },
    status: { type: String, enum: CONTENT_STATUSES, default: 'active' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ parent: 1 });
categorySchema.index({ status: 1, sortOrder: 1 });

export type CategoryDoc = InferSchemaType<typeof categorySchema>;

export const Category = model('Category', categorySchema);