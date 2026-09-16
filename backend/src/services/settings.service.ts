import type { HydratedDocument } from 'mongoose';

import { SiteSettings, type SiteSettingsDoc } from '../models/SiteSettings.model.js';

export async function getSettings(): Promise<HydratedDocument<SiteSettingsDoc>> {
  const existing = await SiteSettings.findOne();
  if (existing) {
    return existing;
  }

  return SiteSettings.create({ commissionRate: 10 });
}

export async function updateSettings(input: { commissionRate: number }) {
  const settings = await getSettings();
  settings.commissionRate = input.commissionRate;
  await settings.save();
  return settings;
}