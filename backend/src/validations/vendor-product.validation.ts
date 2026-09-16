import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema, qQuerySchema } from './admin/common.js';

const localizedInput = z.object({
  en: z.string().trim().min(1).max(512),
  ar: z.string().trim().max(512).optional(),
});

export const createVendorProductSchema = z.object({
  category: objectIdSchema,
  brand: objectIdSchema.nullable().optional(),
  name: localizedInput,
  description: localizedInput.optional(),
  images: z.array(z.string().trim().min(1).max(500)).max(10).optional(),
  sku: z.string().trim().max(100).optional(),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
  availableStock: z.number().int().min(0).optional(),
});

export const updateVendorProductSchema = createVendorProductSchema
  .partial()
  .refine((v) => Object.values(v).some((value) => value !== undefined), {
    message: 'Provide at least one field to update',
  });

export const vendorProductIdParamsSchema = z.object({
  productId: objectIdSchema,
});

export const listVendorProductsQuerySchema = qQuerySchema.extend({
  status: z.enum(['draft', 'active', 'inactive']).optional(),
});

export type CreateVendorProductInput = z.infer<typeof createVendorProductSchema>;
export type UpdateVendorProductInput = z.infer<typeof updateVendorProductSchema>;
export type VendorProductIdParams = z.infer<typeof vendorProductIdParamsSchema>;
export type ListVendorProductsQuery = z.infer<typeof listVendorProductsQuerySchema>;

export { paginationQuerySchema };