import { z } from 'zod';

import { paginationQuerySchema, qQuerySchema } from './common.js';

export const listVendorsQuerySchema = qQuerySchema.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
});

export const vendorStatusParamsSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id format'),
});

export const updateVendorStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended']),
});

export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>;
export type UpdateVendorStatusInput = z.infer<typeof updateVendorStatusSchema>;

export { paginationQuerySchema };