import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema, qQuerySchema } from './common.js';

const localizedString = z.object({
  en: z.string().trim().min(1).max(512),
  ar: z.string().trim().max(512).optional(),
});

export const createBrandSchema = z.object({
  name: localizedString,
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
    .optional(),
  logo: z.string().trim().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateBrandSchema = createBrandSchema.partial();

export const brandIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const listBrandsQuerySchema = qQuerySchema.extend({
  status: z.enum(['active', 'inactive']).optional(),
});

export const brandStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export { paginationQuerySchema };