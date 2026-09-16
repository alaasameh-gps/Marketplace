import { InferSchemaType, Schema } from 'mongoose';

import { localizedTextSchema, moneyField } from './shared.js';

export const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productSnapshot: {
      type: new Schema(
        {
          name: { type: localizedTextSchema, required: true },
          image: { type: String, trim: true, maxlength: 500, default: undefined },
        },
        { _id: false },
      ),
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, max: 999 },
    unitPrice: { ...moneyField },
    subtotal: { ...moneyField },
  },
  { _id: true },
);

export type OrderItemDoc = InferSchemaType<typeof orderItemSchema>;