import { z } from 'zod';

import { paginationQuerySchema } from './admin/common.js';

export const listVendorCommissionsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'settled']).optional(),
});

export type ListVendorCommissionsQuery = z.infer<typeof listVendorCommissionsQuerySchema>;