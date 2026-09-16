import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(3).max(30),
  line1: z.string().trim().min(1).max(255),
  line2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().length(2).default('SA'),
});

export const checkoutSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(128),
  shippingAddress: shippingAddressSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;