import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema } from './admin/common.js';

export const listCustomerOrdersQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .optional(),
  paymentStatus: z.enum(['unpaid', 'paid', 'failed', 'refunded']).optional(),
});

export const customerOrderIdParamsSchema = z.object({
  id: objectIdSchema,
});

export type ListCustomerOrdersQuery = z.infer<typeof listCustomerOrdersQuerySchema>;
export type CustomerOrderIdParams = z.infer<typeof customerOrderIdParamsSchema>;