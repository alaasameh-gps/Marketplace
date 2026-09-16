import type { Request, RequestHandler, Response } from 'express';

import {
  getProductById,
  listProducts,
  setProductStatus,
} from '../../services/product.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { IdParams } from '../../validations/admin/common.js';

export const listProductsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listProducts({
      q: (req.query.q as string | undefined) ?? undefined,
      vendor: (req.query.vendor as string | undefined) ?? undefined,
      category: (req.query.category as string | undefined) ?? undefined,
      brand: (req.query.brand as string | undefined) ?? undefined,
      status: (req.query.status as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getProductByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const product = await getProductById(id);
    res.json({ success: true, data: { product } });
  },
);

export const setProductStatusHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const product = await setProductStatus(id, req.body.status);
    res.json({ success: true, data: { product } });
  },
);