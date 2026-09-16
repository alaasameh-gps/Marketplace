import { InferSchemaType, Schema, model } from 'mongoose';

export const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [
        {
          product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
          quantity: { type: Number, required: true, min: 1, max: 999, default: 1 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

cartSchema.index({ 'items.product': 1 });

export type CartDoc = InferSchemaType<typeof cartSchema>;

export const Cart = model('Cart', cartSchema);