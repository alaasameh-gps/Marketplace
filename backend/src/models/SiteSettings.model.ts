import { InferSchemaType, Schema, model } from 'mongoose';

export const siteSettingsSchema = new Schema(
  {
    commissionRate: { type: Number, min: 0, max: 100, default: 10 },
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;

export const SiteSettings = model('SiteSettings', siteSettingsSchema);