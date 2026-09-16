import { z } from 'zod';

import { paginationQuerySchema, qQuerySchema } from './common.js';

export const listUsersQuerySchema = qQuerySchema.extend({
  role: z.enum(['customer', 'vendor', 'admin']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

export const userStatusParamsSchema = z
  .object({ id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id format') });

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export { paginationQuerySchema };