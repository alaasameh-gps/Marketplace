import type { Request, RequestHandler, Response } from 'express';

import {
  createVendorProduct,
  deleteVendorProduct,
  getVendorProductById,
  listVendorProducts,
  updateVendorProduct,
} from '../services/product.service.js';
import { getApprovedVendorByOwner, getVendorByOwner } from '../services/vendor.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { ListVendorProductsQuery, VendorProductIdParams } from '../validations/vendor-product.validation.js';

export const listMyProducts: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendor = await getVendorByOwner(authUser.id);
    if (!vendor) {
      throw new ApiError(403, 'No vendor store found for this account.');
    }

    const query = req.query as unknown as ListVendorProductsQuery;
    const result = await listVendorProducts(vendor._id.toString(), {
      q: query.q,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
    res.json({ success: true, data: result });
  },
);

export const createMyProduct: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendor = await getApprovedVendorByOwner(authUser.id);

    const product = await createVendorProduct(vendor._id.toString(), req.body);
    res.status(201).json({ success: true, data: { product } });
  },
);

export const getMyProduct: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendor = await getVendorByOwner(authUser.id);
    if (!vendor) {
      throw new ApiError(403, 'No vendor store found for this account.');
    }

    const { productId } = req.params as unknown as VendorProductIdParams;
    const product = await getVendorProductById(vendor._id.toString(), productId);
    res.json({ success: true, data: { product } });
  },
);

export const updateMyProduct: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendor = await getApprovedVendorByOwner(authUser.id);

    const { productId } = req.params as unknown as VendorProductIdParams;
    const product = await updateVendorProduct(vendor._id.toString(), productId, req.body);
    res.json({ success: true, data: { product } });
  },
);

export const deleteMyProduct: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const vendor = await getApprovedVendorByOwner(authUser.id);

    const { productId } = req.params as unknown as VendorProductIdParams;
    await deleteVendorProduct(vendor._id.toString(), productId);
    res.json({ success: true, data: null });
  },
);