import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema } from './admin/common.js';

export const listVendorOrdersQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .optional(),
  paymentStatus: z.enum(['unpaid', 'paid', 'failed', 'refunded']).optional(),
});

export const vendorOrderIdParamsSchema = z.object({
  orderId: objectIdSchema,
});

export const vendorOrderGroupIdParamsSchema = z.object({
  orderId: objectIdSchema,
  groupId: objectIdSchema,
});

export const setVendorGroupStatusSchema = z.object({
  status: z.enum([
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
});

export type ListVendorOrdersQuery = z.infer<typeof listVendorOrdersQuerySchema>;
export type VendorOrderIdParams = z.infer<typeof vendorOrderIdParamsSchema>;
export type VendorOrderGroupIdParams = z.infer<typeof vendorOrderGroupIdParamsSchema>;
export type SetVendorGroupStatusInput = z.infer<typeof setVendorGroupStatusSchema>;