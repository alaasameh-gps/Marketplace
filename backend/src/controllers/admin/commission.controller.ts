import type { Request, RequestHandler, Response } from 'express';

import { getCommissionSummary, listCommissions } from '../../services/commission.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const listCommissionsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listCommissions({
      vendor: (req.query.vendor as string | undefined) ?? undefined,
      status: (req.query.status as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getCommissionSummaryHandler: RequestHandler = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const summary = await getCommissionSummary();
    res.json({ success: true, data: { summary } });
  },
);