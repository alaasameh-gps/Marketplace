import type { Request, RequestHandler, Response } from 'express';

import { getSettings, updateSettings } from '../../services/settings.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { UpdateSettingsInput } from '../../validations/admin/settings.validation.js';

export const getSettingsHandler: RequestHandler = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const settings = await getSettings();
    res.json({ success: true, data: { settings } });
  },
);

export const patchSettingsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as UpdateSettingsInput;
    const settings = await updateSettings({ commissionRate: body.commissionRate });
    res.json({ success: true, data: { settings } });
  },
);