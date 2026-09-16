import { z } from 'zod';

import { objectIdSchema } from './admin/common.js';

export const cartItemIdParamsSchema = z.object({
  itemId: objectIdSchema,
});

export const addCartItemSchema = z.object({
  product: objectIdSchema,
  quantity: z.number().int().min(1).max(999).default(1),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(999),
});

export type CartItemIdParams = z.infer<typeof cartItemIdParamsSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemQuantityInput = z.infer<typeof updateCartItemQuantitySchema>;