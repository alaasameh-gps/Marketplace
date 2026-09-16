import type { Request, RequestHandler, Response } from 'express';

import { getVendorByOwner } from '../services/vendor.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyVendor: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendor = await getVendorByOwner(authUser.id);
    if (!vendor) {
      throw new ApiError(404, 'No vendor store found for this account.');
    }
    res.json({ success: true, data: { vendor } });
  },
);