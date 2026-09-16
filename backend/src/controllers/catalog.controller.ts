import type { Request, RequestHandler, Response } from 'express';

import { listPublicBrands } from '../services/brand.service.js';
import { getPublicCategoryTree } from '../services/category.service.js';
import {
  getPublicProductBySlug,
  listPublicProducts,
  listPublicVendorProducts,
  type ListPublicProductsParams,
} from '../services/product.service.js';
import { getPublicVendorBySlug, listPublicVendors } from '../services/vendor.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { ListPublicProductsQuery, ProductSlugParams, VendorSlugParams } from '../validations/catalog.validation.js';

export const listPublicVendorsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listPublicVendors({
      q: (req.query.q as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getPublicVendorBySlugHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params as unknown as VendorSlugParams;
    const vendor = await getPublicVendorBySlug(slug);
    res.json({ success: true, data: { vendor } });
  },
);

export const listPublicVendorProductsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params as unknown as VendorSlugParams;
    const vendor = await getPublicVendorBySlug(slug);

    const result = await listPublicVendorProducts(vendor._id.toString(), {
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });

    res.json({ success: true, data: { vendor, ...result } });
  },
);

export const listPublicCategoriesHandler: RequestHandler = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const items = await getPublicCategoryTree();
    res.json({ success: true, data: { items } });
  },
);

export const listPublicBrandsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listPublicBrands({
      q: (req.query.q as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 50),
    });
    res.json({ success: true, data: result });
  },
);

export const listPublicProductsHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListPublicProductsQuery;
    const params: ListPublicProductsParams = {
      q: query.q,
      category: query.category,
      brand: query.brand,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    };
    const result = await listPublicProducts(params);
    res.json({ success: true, data: result });
  },
);

export const getPublicProductBySlugHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params as unknown as ProductSlugParams;
    const product = await getPublicProductBySlug(slug);
    res.json({ success: true, data: { product } });
  },
);