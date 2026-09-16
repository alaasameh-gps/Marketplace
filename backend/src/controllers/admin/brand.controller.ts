import type { Request, RequestHandler, Response } from 'express';

import {
  createBrand,
  deleteBrand,
  getBrandById,
  listBrands,
  setBrandStatus,
  updateBrand,
} from '../../services/brand.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { IdParams } from '../../validations/admin/common.js';
import type { CreateBrandInput, UpdateBrandInput } from '../../validations/admin/brand.validation.js';

export const listBrandsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listBrands({
      q: (req.query.q as string | undefined) ?? undefined,
      status: (req.query.status as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 100),
    });
    res.json({ success: true, data: result });
  },
);

export const getBrandByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const brand = await getBrandById(id);
    res.json({ success: true, data: { brand } });
  },
);

export const createBrandHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateBrandInput;
    const brand = await createBrand({
      name: body.name!,
      slug: body.slug,
      logo: body.logo,
      status: body.status,
    });
    res.status(201).json({ success: true, data: { brand } });
  },
);

export const updateBrandHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const body = req.body as UpdateBrandInput;
    const brand = await updateBrand(id, {
      name: body.name,
      slug: body.slug,
      logo: body.logo,
      status: body.status,
    });
    res.json({ success: true, data: { brand } });
  },
);

export const deleteBrandHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    await deleteBrand(id);
    res.json({ success: true, data: null });
  },
);

export const setBrandStatusHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const brand = await setBrandStatus(id, req.body.status);
    res.json({ success: true, data: { brand } });
  },
);