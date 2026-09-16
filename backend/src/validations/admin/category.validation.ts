import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema, qQuerySchema } from './common.js';

const localizedString = z.object({
  en: z.string().trim().min(1).max(512),
  ar: z.string().trim().max(512).optional(),
});

export const createCategorySchema = z.object({
  name: localizedString,
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
    .optional(),
  parent: objectIdSchema
    .nullable()
    .optional()
    .default(null),
  icon: z.string().trim().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const idParamsSchema = z.object({
  id: objectIdSchema,
});

export const listCategoriesQuerySchema = qQuerySchema.extend({
  parent: objectIdSchema.optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const categoryStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export { paginationQuerySchema };