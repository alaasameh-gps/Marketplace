import { Types } from 'mongoose';

import { Commission } from '../models/Commission.model.js';
import { buildPageResult, getPaginationDefaults } from '../utils/pagination.js';

export interface ListCommissionsParams {
  vendor?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function listCommissions(params: ListCommissionsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.vendor) filter.vendor = params.vendor;
  if (params.status) filter.status = params.status;

  const [docs, total] = await Promise.all([
    Commission.find(filter)
      .populate('order', 'orderNumber')
      .populate('vendor', 'storeName slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Commission.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function listVendorCommissions(vendorId: string, params: ListCommissionsParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { vendor: vendorId };
  if (params.status) filter.status = params.status;

  const [docs, total] = await Promise.all([
    Commission.find(filter)
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Commission.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function getVendorCommissionSummary(vendorId: string) {
  const vendorObjectId = Types.ObjectId.createFromHexString(vendorId);
  const [totals] = await Commission.aggregate<{
    totalRecords: number;
    totalCommissionAmount: number;
    totalVendorEarnings: number;
  }>([
    { $match: { vendor: vendorObjectId } },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalCommissionAmount: { $sum: '$commissionAmount' },
        totalVendorEarnings: { $sum: '$vendorEarnings' },
      },
    },
  ]);

  const statusBreakdown = await Commission.aggregate([
    { $match: { vendor: vendorObjectId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        commissionAmount: { $sum: '$commissionAmount' },
        vendorEarnings: { $sum: '$vendorEarnings' },
      },
    },
    { $project: { _id: 0, status: '$_id', count: 1, commissionAmount: 1, vendorEarnings: 1 } },
    { $sort: { status: 1 } },
  ]);

  return {
    totalRecords: totals?.totalRecords ?? 0,
    totalCommissionAmount: totals?.totalCommissionAmount ?? 0,
    totalVendorEarnings: totals?.totalVendorEarnings ?? 0,
    statusBreakdown,
  };
}

export interface SettleCommissionsParams {
  vendor?: string;
  settlementRef?: string;
}

export async function settleCommissions(params: SettleCommissionsParams = {}) {
  const filter: Record<string, unknown> = { status: 'pending' };
  if (params.vendor) filter.vendor = params.vendor;

  const result = await Commission.updateMany(filter, {
    $set: {
      status: 'settled',
      settledAt: new Date(),
      settlementRef: params.settlementRef ?? `STL-${Date.now().toString(36).toUpperCase()}`,
    },
  });

  return { modifiedCount: result.modifiedCount };
}

export async function settleCommissionsForOrder(orderId: string): Promise<void> {
  await Commission.updateMany(
    { order: orderId, status: 'pending' },
    {
      $set: {
        status: 'settled',
        settledAt: new Date(),
        settlementRef: `ORD-${orderId}`,
      },
    },
  );
}

export async function getCommissionSummary() {
  const [totals] = await Commission.aggregate<{
    totalRecords: number;
    totalCommissionAmount: number;
    totalVendorEarnings: number;
  }>([
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalCommissionAmount: { $sum: '$commissionAmount' },
        totalVendorEarnings: { $sum: '$vendorEarnings' },
      },
    },
  ]);

  const statusBreakdown = await Commission.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        commissionAmount: { $sum: '$commissionAmount' },
        vendorEarnings: { $sum: '$vendorEarnings' },
      },
    },
    { $project: { _id: 0, status: '$_id', count: 1, commissionAmount: 1, vendorEarnings: 1 } },
    { $sort: { status: 1 } },
  ]);

  return {
    totalRecords: totals?.totalRecords ?? 0,
    totalCommissionAmount: totals?.totalCommissionAmount ?? 0,
    totalVendorEarnings: totals?.totalVendorEarnings ?? 0,
    statusBreakdown,
  };
}