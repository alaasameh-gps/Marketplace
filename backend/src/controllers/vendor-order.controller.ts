import type { Request, RequestHandler, Response } from 'express';

import {
  getVendorOrderById,
  getVendorOrders,
  setVendorGroupStatus,
} from '../services/order.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  SetVendorGroupStatusInput,
  VendorOrderGroupIdParams,
  VendorOrderIdParams,
} from '../validations/vendor-order.validation.js';
import { getVendorByOwner } from '../services/vendor.service.js';
import { ApiError } from '../utils/ApiError.js';

async function resolveVendorId(userId: string) {
  const vendor = await getVendorByOwner(userId);
  if (!vendor) {
    throw new ApiError(403, 'No vendor store found for this account.');
  }
  return vendor._id.toString();
}

export const listMyOrdersHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendorId = await resolveVendorId(authUser.id);
    const result = await getVendorOrders(vendorId, {
      status: req.query.status as string | undefined,
      paymentStatus: req.query.paymentStatus as string | undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getMyOrderByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendorId = await resolveVendorId(authUser.id);
    const { orderId } = req.params as unknown as VendorOrderIdParams;
    const order = await getVendorOrderById(vendorId, orderId);
    res.json({ success: true, data: { order } });
  },
);

export const setGroupStatusHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendorId = await resolveVendorId(authUser.id);
    const { orderId, groupId } = req.params as unknown as VendorOrderGroupIdParams;
    const body = req.body as SetVendorGroupStatusInput;
    const order = await setVendorGroupStatus(vendorId, orderId, groupId, body.status);
    res.json({ success: true, data: { order } });
  },
);