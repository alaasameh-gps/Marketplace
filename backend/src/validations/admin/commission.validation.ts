import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema } from './common.js';

export const listCommissionsQuerySchema = paginationQuerySchema.extend({
  vendor: objectIdSchema.optional(),
  status: z.enum(['pending', 'settled']).optional(),
});

export type ListCommissionsQuery = z.infer<typeof listCommissionsQuerySchema>;

export { paginationQuerySchema };