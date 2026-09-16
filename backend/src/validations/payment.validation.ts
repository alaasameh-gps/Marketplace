import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema } from './admin/common.js';

export const initiatePaymentSchema = z.object({
  orderId: objectIdSchema,
  provider: z.string().trim().min(1).max(50).default('sandbox'),
});

export const providerParamsSchema = z.object({
  provider: z.string().trim().min(1).max(50),
});

export const listAdminPaymentsQuerySchema = paginationQuerySchema;

export const simulateSandboxBodySchema = z.object({
  paymentId: objectIdSchema,
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type ProviderParams = z.infer<typeof providerParamsSchema>;
export type ListAdminPaymentsQuery = z.infer<typeof listAdminPaymentsQuerySchema>;
export type SimulateSandboxBody = z.infer<typeof simulateSandboxBodySchema>;