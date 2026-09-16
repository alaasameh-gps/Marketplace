import type { Request, RequestHandler, Response } from 'express';

import {
  getVendorCommissionSummary,
  listVendorCommissions,
} from '../services/commission.service.js';
import { getVendorByOwner } from '../services/vendor.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function resolveVendorId(userId: string) {
  const vendor = await getVendorByOwner(userId);
  if (!vendor) {
    throw new ApiError(403, 'No vendor store found for this account.');
  }
  return vendor._id.toString();
}

export const listMyCommissionsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendorId = await resolveVendorId(authUser.id);
    const result = await listVendorCommissions(vendorId, {
      status: req.query.status as string | undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getMyCommissionSummaryHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendorId = await resolveVendorId(authUser.id);
    const summary = await getVendorCommissionSummary(vendorId);
    res.json({ success: true, data: { summary } });
  },
);