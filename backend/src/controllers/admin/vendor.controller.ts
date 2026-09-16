import type { Request, RequestHandler, Response } from 'express';

import { getVendorById, listVendors, setVendorStatus } from '../../services/vendor.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { IdParams } from '../../validations/admin/common.js';

export const listVendorsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listVendors({
      q: (req.query.q as string | undefined) ?? undefined,
      status: (req.query.status as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getVendorByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const vendor = await getVendorById(id);
    res.json({ success: true, data: { vendor } });
  },
);

export const setVendorStatusHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const vendor = await setVendorStatus(id, req.body.status);
    res.json({ success: true, data: { vendor } });
  },
);