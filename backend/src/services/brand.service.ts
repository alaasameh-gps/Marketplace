import type { HydratedDocument } from 'mongoose';

import { Brand, type BrandDoc } from '../models/Brand.model.js';
import { Product } from '../models/Product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPageResult, getPaginationDefaults } from '../utils/pagination.js';
import { slugify } from '../utils/slug.js';

export interface BrandUpsertInput {
  name?: { en: string; ar?: string };
  slug?: string;
  logo?: string;
  status?: 'active' | 'inactive';
}

export async function getBrandById(id: string): Promise<HydratedDocument<BrandDoc>> {
  const brand = await Brand.findById(id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found.');
  }
  return brand;
}

export async function resolveBrandSlug(
  inputSlug: string | undefined,
  nameEn: string,
  excludeId?: string,
): Promise<string> {
  const base = inputSlug || slugify(nameEn) || 'brand';
  const filter: Record<string, unknown> = { slug: base };
  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await Brand.findOne(filter);
  return existing ? `${base}-${existing._id.toString().slice(-4)}` : base;
}

export async function createBrand(input: Pick<BrandUpsertInput, 'name'> & BrandUpsertInput) {
  const brand = await Brand.create({
    name: input.name,
    slug: await resolveBrandSlug(input.slug, input.name!.en),
    logo: input.logo,
    status: input.status ?? 'active',
  });

  return brand;
}

export async function updateBrand(id: string, input: BrandUpsertInput) {
  const brand = await getBrandById(id);

  if (input.name) brand.name = input.name;
  if (input.slug) brand.slug = await resolveBrandSlug(input.slug, brand.name.en, id);
  if (input.logo !== undefined) brand.logo = input.logo;
  if (input.status) brand.status = input.status;

  await brand.save();
  return brand;
}

export async function deleteBrand(id: string): Promise<void> {
  const products = await Product.countDocuments({ brand: id });
  if (products > 0) {
    throw new ApiError(409, 'Cannot delete a brand that has products attached.');
  }
  await Brand.deleteOne({ _id: id });
}

export async function setBrandStatus(id: string, status: 'active' | 'inactive') {
  const brand = await getBrandById(id);
  if (brand.status === status) {
    throw new ApiError(409, `Brand is already ${status}.`);
  }
  brand.status = status;
  await brand.save();
  return brand;
}

export interface ListBrandsParams {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListPublicBrandsParams {
  q?: string;
  page?: number;
  limit?: number;
}

export async function listPublicBrands(params: ListPublicBrandsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 50), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'active' };

  const q = params.q?.trim();
  if (q) filter['name.en'] = { $regex: escapeRegExp(q), $options: 'i' };

  const [docs, total] = await Promise.all([
    Brand.find(filter).sort({ 'name.en': 1 }).skip(skip).limit(limit),
    Brand.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function listBrands(params: ListBrandsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 100), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;

  const q = params.q?.trim();
  if (q) filter['name.en'] = { $regex: escapeRegExp(q), $options: 'i' };

  const [docs, total] = await Promise.all([
    Brand.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    Brand.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}