import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id format');

export const idParamsSchema = z.object({
  id: objectIdSchema,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const qQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
  })
  .merge(paginationQuerySchema);

export type IdParams = z.infer<typeof idParamsSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;