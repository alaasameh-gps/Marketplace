import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema } from './common.js';

export const listOrdersQuerySchema = paginationQuerySchema.extend({
  customer: objectIdSchema.optional(),
  vendor: objectIdSchema.optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
});

export const orderIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export { paginationQuerySchema };