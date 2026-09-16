import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters')
    .optional(),
  phone: z.string().trim().max(30).optional(),
});

export const objectIdParamSchema = z.string().regex(
  /^[a-fA-F0-9]{24}$/,
  'Invalid id format',
);

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;