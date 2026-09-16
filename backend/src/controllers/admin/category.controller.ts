import type { Request, RequestHandler, Response } from 'express';

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  setCategoryStatus,
  updateCategory,
} from '../../services/category.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { IdParams } from '../../validations/admin/common.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '../../validations/admin/category.validation.js';

export const listCategoriesHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listCategories({
      q: (req.query.q as string | undefined) ?? undefined,
      parent: (req.query.parent as string | undefined) ?? undefined,
      status: (req.query.status as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 100),
    });
    res.json({ success: true, data: result });
  },
);

export const getCategoryByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const category = await getCategoryById(id);
    res.json({ success: true, data: { category } });
  },
);

export const createCategoryHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateCategoryInput;
    const category = await createCategory({
      name: body.name,
      slug: body.slug,
      parent: body.parent,
      icon: body.icon,
      status: body.status,
      sortOrder: body.sortOrder,
    });
    res.status(201).json({ success: true, data: { category } });
  },
);

export const updateCategoryHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const body = req.body as UpdateCategoryInput;
    const category = await updateCategory(id, body);
    res.json({ success: true, data: { category } });
  },
);

export const deleteCategoryHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    await deleteCategory(id);
    res.json({ success: true, data: null });
  },
);

export const setCategoryStatusHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const category = await setCategoryStatus(id, req.body.status);
    res.json({ success: true, data: { category } });
  },
);