import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema, qQuerySchema } from './admin/common.js';

export const listPublicVendorsQuerySchema = qQuerySchema;

export const vendorSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(120),
});

export const publicVendorProductsQuerySchema = paginationQuerySchema;

export const listPublicProductsQuerySchema = paginationQuerySchema
  .extend({
    q: z.string().trim().max(100).optional(),
    category: objectIdSchema.optional(),
    brand: objectIdSchema.optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).optional(),
  })
  .refine((v) => v.maxPrice === undefined || v.minPrice === undefined || v.maxPrice >= v.minPrice, {
    message: 'maxPrice must be greater than or equal to minPrice',
  });

export const productSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export type ListPublicProductsQuery = z.infer<typeof listPublicProductsQuerySchema>;
export type VendorSlugParams = z.infer<typeof vendorSlugParamsSchema>;
export type ProductSlugParams = z.infer<typeof productSlugParamsSchema>;

export { paginationQuerySchema };