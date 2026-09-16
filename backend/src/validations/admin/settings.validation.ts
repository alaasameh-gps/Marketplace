import { z } from 'zod';

export const updateSettingsSchema = z.object({
  commissionRate: z.number().min(0).max(100),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;