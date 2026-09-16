import type { HydratedDocument } from 'mongoose';

import { Vendor, type VendorDoc } from '../models/Vendor.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPageResult, getPaginationDefaults } from '../utils/pagination.js';
import { slugify } from '../utils/slug.js';

export const VENDOR_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['approved', 'rejected'],
  approved: ['suspended'],
  suspended: ['approved'],
  rejected: [],
};

export function assertValidVendorTransition(
  from: string,
  to: string,
): void {
  const allowed = VENDOR_STATUS_TRANSITIONS[from];

  if (!allowed?.includes(to)) {
    throw new ApiError(
      400,
      `Invalid vendor status transition: ${from} -> ${to}.`,
    );
  }
}

export async function createVendorForOwner(
  ownerId: string,
  storeName: string,
): Promise<HydratedDocument<VendorDoc>> {
  const baseSlug = slugify(storeName) || 'store';

  let vendor: HydratedDocument<VendorDoc> | undefined;
  let attempts = 0;

  while (!vendor && attempts < 5) {
    const slug = attempts === 0 ? baseSlug : `${baseSlug}-${attempts}`;
    try {
      vendor = await Vendor.create({
        owner: ownerId,
        storeName,
        slug,
        status: 'pending',
      });
    } catch {
      attempts += 1;
    }
  }

  if (!vendor) {
    throw new ApiError(409, 'Unable to create vendor store. Please try again.');
  }

  return vendor;
}

export async function getVendorById(id: string): Promise<HydratedDocument<VendorDoc>> {
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found.');
  }
  return vendor;
}

export async function getVendorByOwner(ownerId: string): Promise<HydratedDocument<VendorDoc> | null> {
  return Vendor.findOne({ owner: ownerId });
}

export async function getApprovedVendorByOwner(ownerId: string): Promise<HydratedDocument<VendorDoc>> {
  const vendor = await getVendorByOwner(ownerId);
  if (!vendor) {
    throw new ApiError(403, 'No vendor store found for this account.');
  }
  if (vendor.status !== 'approved') {
    throw new ApiError(403, 'Vendor store must be approved to manage products.');
  }
  return vendor;
}

export async function getPublicVendorBySlug(slug: string): Promise<HydratedDocument<VendorDoc>> {
  const vendor = await Vendor.findOne({ slug, status: 'approved' }).select('storeName slug description logo status');
  if (!vendor) {
    throw new ApiError(404, 'Vendor store not found.');
  }
  return vendor;
}

export interface ListPublicVendorsParams {
  q?: string;
  page?: number;
  limit?: number;
}

export async function listPublicVendors(params: ListPublicVendorsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'approved' };

  const q = params.q?.trim();
  if (q) {
    filter.$or = [
      { storeName: { $regex: escapeRegExp(q), $options: 'i' } },
      { slug: { $regex: escapeRegExp(q), $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    Vendor.find(filter)
      .select('storeName slug description logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vendor.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export interface ListVendorsParams {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function listVendors(params: ListVendorsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;

  const q = params.q?.trim();
  if (q) {
    filter.storeName = { $regex: escapeRegExp(q), $options: 'i' };
  }

  const [docs, total] = await Promise.all([
    Vendor.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vendor.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function setVendorStatus(vendorId: string, status: 'approved' | 'rejected' | 'suspended') {
  const vendor = await getVendorById(vendorId);
  assertValidVendorTransition(vendor.status, status);

  vendor.status = status;
  await vendor.save();
  return vendor;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}