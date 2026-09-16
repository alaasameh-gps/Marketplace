import { Types, type HydratedDocument, type PipelineStage } from 'mongoose';

import { Brand } from '../models/Brand.model.js';
import { Category } from '../models/Category.model.js';
import { Product, type ProductDoc } from '../models/Product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPageResult, getPaginationDefaults } from '../utils/pagination.js';
import { slugify } from '../utils/slug.js';

export interface VendorProductInput {
  category: string;
  brand: string | null;
  name: { en: string; ar?: string };
  description?: { en: string; ar?: string };
  images?: string[];
  sku?: string;
  price: number;
  compareAtPrice?: number;
  status?: 'draft' | 'active' | 'inactive';
  availableStock?: number;
}

export interface ListVendorProductsParams {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListProductsParams {
  q?: string;
  vendor?: string;
  category?: string;
  brand?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getProductById(id: string): Promise<HydratedDocument<ProductDoc>> {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  return product;
}

export async function listProducts(params: ListProductsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.vendor) filter.vendor = params.vendor;
  if (params.category) filter.category = params.category;
  if (params.brand) filter.brand = params.brand;
  if (params.status) filter.status = params.status;

  const q = params.q?.trim();
  if (q) filter['name.en'] = { $regex: escapeRegExp(q), $options: 'i' };

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .populate('vendor', 'storeName slug')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function setProductStatus(id: string, status: 'draft' | 'active' | 'inactive') {
  const product = await getProductById(id);
  if (product.status === status) {
    throw new ApiError(409, `Product is already ${status}.`);
  }
  product.status = status;
  await product.save();
  return product;
}

const SLUG_SUFFIX_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomSlugSuffix(): string {
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += SLUG_SUFFIX_CHARS[Math.floor(Math.random() * SLUG_SUFFIX_CHARS.length)];
  }
  return suffix;
}

export async function resolveProductSlug(nameEn: string, excludeId?: string): Promise<string> {
  const base = slugify(nameEn) || 'product';
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${randomSlugSuffix()}`;
    const filter: Record<string, unknown> = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };

    const existing = await Product.exists(filter);
    if (!existing) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function assertCategoryActive(categoryId: string): Promise<void> {
  const category = await Category.findById(categoryId);
  if (!category || category.status !== 'active') {
    throw new ApiError(400, 'Category must exist and be active.');
  }
}

async function assertBrandActive(brandId: string): Promise<void> {
  const brand = await Brand.findById(brandId);
  if (!brand || brand.status !== 'active') {
    throw new ApiError(400, 'Brand must exist and be active.');
  }
}

export async function getVendorProductById(vendorId: string, productId: string): Promise<HydratedDocument<ProductDoc>> {
  const product = await Product.findOne({ _id: productId, vendor: vendorId })
    .populate('category', 'name')
    .populate('brand', 'name');
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  return product;
}

export async function createVendorProduct(vendorId: string, input: VendorProductInput) {
  await assertCategoryActive(input.category);
  if (input.brand) {
    await assertBrandActive(input.brand);
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await Product.create({
        vendor: vendorId,
        category: input.category,
        brand: input.brand ?? undefined,
        name: input.name,
        slug: await resolveProductSlug(input.name.en),
        description: input.description,
        images: input.images ?? [],
        sku: input.sku,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        currency: 'SAR',
        status: input.status ?? 'draft',
        inventory: {
          availableStock: input.availableStock ?? 0,
          reservedStock: 0,
          purchasedStock: 0,
        },
      });
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }

  throw new ApiError(409, 'A product with this name already exists. Please choose a different name.');
}

export async function listVendorProducts(vendorId: string, params: ListVendorProductsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { vendor: vendorId };
  if (params.status) filter.status = params.status;

  const q = params.q?.trim();
  if (q) filter['name.en'] = { $regex: escapeRegExp(q), $options: 'i' };

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function updateVendorProduct(
  vendorId: string,
  productId: string,
  input: Partial<VendorProductInput>,
) {
  const product = await getVendorProductById(vendorId, productId);

  if (input.category) {
    await assertCategoryActive(input.category);
    product.category = input.category as never;
  }
  if (input.brand !== undefined) {
    if (input.brand) {
      await assertBrandActive(input.brand);
    }
    product.brand = (input.brand ?? undefined) as never;
  }
  if (input.name) product.name = input.name;
  if (input.description !== undefined) product.description = input.description;
  if (input.images !== undefined) product.images = input.images;
  if (input.sku !== undefined) product.sku = input.sku;
  if (input.price !== undefined) product.price = input.price;
  if (input.compareAtPrice !== undefined) product.compareAtPrice = input.compareAtPrice;
  if (input.status) product.status = input.status;
  if (input.availableStock !== undefined) product.inventory.availableStock = input.availableStock;

  await product.save();
  return product;
}

export async function deleteVendorProduct(vendorId: string, productId: string): Promise<void> {
  const result = await Product.deleteOne({ _id: productId, vendor: vendorId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Product not found.');
  }
}

export interface ListPublicProductsParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

const PUBLIC_PRODUCT_SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
};

export async function listPublicProducts(params: ListPublicProductsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 48);
  const skip = (page - 1) * limit;

  const filters: Record<string, unknown> = {};
  if (params.category) filters.category = new Types.ObjectId(params.category);
  if (params.brand) filters.brand = new Types.ObjectId(params.brand);
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filters.price = {};
    if (params.minPrice !== undefined) (filters.price as Record<string, number>).$gte = params.minPrice;
    if (params.maxPrice !== undefined) (filters.price as Record<string, number>).$lte = params.maxPrice;
  }

  const q = params.q?.trim();
  if (q) {
    const regex = { $regex: escapeRegExp(q), $options: 'i' };
    filters.$or = [{ 'name.en': regex }, { 'name.ar': regex }];
  }

  const approvedVendorsQuery = () => {
    const matchStage: PipelineStage.Match = {
      $match: {
        status: 'active',
        ...filters,
      },
    };
    const lookupStage: PipelineStage.Lookup = {
      $lookup: {
        from: 'vendors',
        localField: 'vendor',
        foreignField: '_id',
        as: 'vendorRef',
      },
    };
    const unwindStage: PipelineStage.Unwind = {
      $unwind: { path: '$vendorRef', preserveNullAndEmptyArrays: false },
    };
    const approvedStage: PipelineStage.Match = {
      $match: { 'vendorRef.status': 'approved' },
    };
    return [matchStage, lookupStage, unwindStage, approvedStage];
  };

  const [docsAgg, countAgg] = await Promise.all([
    Product.aggregate([
      ...approvedVendorsQuery(),
      { $sort: PUBLIC_PRODUCT_SORTS[params.sort ?? 'newest'] ?? PUBLIC_PRODUCT_SORTS.newest },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          price: 1,
          compareAtPrice: 1,
          currency: 1,
          images: 1,
          status: 1,
          isFeatured: 1,
          'inventory.availableStock': 1,
          createdAt: 1,
          vendor: { _id: '$vendorRef._id', storeName: '$vendorRef.storeName', slug: '$vendorRef.slug' },
          category: 1,
          brand: 1,
        },
      },
    ]),
    Product.aggregate([...approvedVendorsQuery(), { $count: 'total' }]),
  ]);

  return buildPageResult(docsAgg, page, limit, countAgg[0]?.total ?? 0);
}

export interface ListPublicVendorProductsParams {
  page?: number;
  limit?: number;
}

export async function listPublicVendorProducts(vendorId: string, params: ListPublicVendorProductsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 48);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { vendor: vendorId, status: 'active' };

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function getPublicProductBySlug(slug: string) {
  const [product] = await Product.aggregate([
    {
      $match: { slug, status: 'active' },
    },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendor',
        foreignField: '_id',
        as: 'vendorRef',
      },
    },
    { $unwind: { path: '$vendorRef', preserveNullAndEmptyArrays: false } },
    { $match: { 'vendorRef.status': 'approved' } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryRef',
      },
    },
    { $unwind: { path: '$categoryRef', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brandRef',
      },
    },
    { $unwind: { path: '$brandRef', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        price: 1,
        compareAtPrice: 1,
        currency: 1,
        images: 1,
        status: 1,
        isFeatured: 1,
        inventory: 1,
        createdAt: 1,
        vendor: { _id: '$vendorRef._id', storeName: '$vendorRef.storeName', slug: '$vendorRef.slug' },
        category: { _id: '$categoryRef._id', name: '$categoryRef.name' },
        brand: { _id: '$brandRef._id', name: '$brandRef.name' },
      },
    },
  ]);

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  return product;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface StockReservationResult {
  success: boolean;
  availableStock?: number;
  reservedStock?: number;
}

export async function reserveStock(
  productId: string,
  quantity: number,
): Promise<StockReservationResult> {
  const product = await Product.findOneAndUpdate(
    { _id: productId, 'inventory.availableStock': { $gte: quantity } },
    { $inc: { 'inventory.availableStock': -quantity, 'inventory.reservedStock': quantity } },
    { returnDocument: 'after' },
  ).select('inventory');

  if (!product) {
    return { success: false };
  }

  return { success: true, availableStock: product.inventory.availableStock };
}

export async function releaseReservedStock(productId: string, quantity: number): Promise<void> {
  await Product.findOneAndUpdate(
    { _id: productId, 'inventory.reservedStock': { $gte: quantity } },
    { $inc: { 'inventory.reservedStock': -quantity, 'inventory.availableStock': quantity } },
  );
}

export async function finalizePurchasedStock(productId: string, quantity: number): Promise<void> {
  const product = await Product.findOneAndUpdate(
    { _id: productId, 'inventory.reservedStock': { $gte: quantity } },
    { $inc: { 'inventory.reservedStock': -quantity, 'inventory.purchasedStock': quantity } },
    { returnDocument: 'after' },
  ).select('inventory');

  if (!product) {
    throw new ApiError(409, 'Insufficient reserved stock to finalize purchase.');
  }
}