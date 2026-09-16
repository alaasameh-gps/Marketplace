import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema, qQuerySchema } from './common.js';

export const listProductsQuerySchema = qQuerySchema.extend({
  vendor: objectIdSchema.optional(),
  category: objectIdSchema.optional(),
  brand: objectIdSchema.optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
});

export const productIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const updateProductStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'inactive']),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;

export { paginationQuerySchema };