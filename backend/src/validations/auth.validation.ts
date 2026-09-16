import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(120, 'Name must be at most 120 characters'),
    email: z.email('Please provide a valid email address').trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    phone: z.string().trim().max(30).optional(),
    role: z.enum(['customer', 'vendor']),
    storeName: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .optional(),
  })
  .refine(
    (value) => value.role !== 'vendor' || Boolean(value.storeName),
    { message: 'storeName is required when registering as a vendor', path: ['storeName'] },
  );

export const loginSchema = z.object({
  email: z.email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').max(72),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(72),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72, 'New password must be at most 72 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;