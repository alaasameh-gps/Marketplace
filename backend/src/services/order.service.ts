import type { HydratedDocument } from 'mongoose';

import { Order, type OrderDoc } from '../models/Order.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPageResult, getPaginationDefaults } from '../utils/pagination.js';
import { releaseReservedStock } from './product.service.js';

export const ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export const GROUP_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export function assertValidOrderTransition(from: string, to: string): void {
  const allowed = ORDER_TRANSITIONS[from];

  if (!allowed?.includes(to)) {
    throw new ApiError(
      400,
      `Invalid order status transition: ${from} -> ${to}.`,
    );
  }
}

export async function getOrderById(id: string): Promise<HydratedDocument<OrderDoc>> {
  const order = await Order.findById(id).populate('customer', 'name email').populate('groups.vendor', 'storeName slug');
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  return order;
}

export interface ListOrdersParams {
  customer?: string;
  vendor?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function listOrders(params: ListOrdersParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.customer) filter.customer = params.customer;
  if (params.vendor) filter['groups.vendor'] = params.vendor;
  if (params.status) filter.status = params.status;

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email')
      .populate('groups.vendor', 'storeName slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function setOrderStatus(id: string, status: string) {
  const order = await getOrderById(id);
  assertValidOrderTransition(order.status, status);

  if (order.status === status) {
    throw new ApiError(409, `Order is already ${status}.`);
  }

  order.status = status as OrderDoc['status'];
  await order.save();
  return order;
}

export interface ListCustomerOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}

export async function listCustomerOrders(userId: string, params: ListCustomerOrdersParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { customer: userId };
  if (params.status) filter.status = params.status;
  if (params.paymentStatus) filter.paymentStatus = params.paymentStatus;

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .select('orderNumber status paymentStatus currency totals createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

export async function getCustomerOrderById(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, customer: userId })
    .populate('customer', 'name email')
    .populate('groups.vendor', 'storeName slug');
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  return order;
}

export async function cancelCustomerOrder(userId: string, orderId: string) {
  const order = await getCustomerOrderById(userId, orderId);

  assertValidOrderTransition(order.status, 'cancelled');

  if (order.status === 'cancelled') {
    throw new ApiError(409, 'Order is already cancelled.');
  }

  if (order.paymentStatus === 'paid') {
    throw new ApiError(400, 'Paid orders cannot be cancelled from the storefront. Contact support.');
  }

  order.status = 'cancelled' as OrderDoc['status'];
  await order.save();

  for (const group of order.groups) {
    for (const item of group.items) {
      await releaseReservedStock(item.product.toString(), item.quantity);
    }
  }

  return order;
}

export async function getVendorOrders(vendorId: string, params: ListCustomerOrdersParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { 'groups.vendor': vendorId };
  if (params.status) filter['groups.status'] = params.status;

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .select('orderNumber customer status paymentStatus currency totals groups createdAt')
      .populate('groups.vendor', 'storeName slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  const scoped = docs.map((order) => ({
    ...order.toObject(),
    groups: order.groups.filter((g) => g.vendor.toString() === vendorId),
  }));

  return buildPageResult(scoped, page, limit, total);
}

export async function getVendorOrderById(vendorId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, 'groups.vendor': vendorId }).populate(
    'groups.vendor',
    'storeName slug',
  );
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  return {
    ...order.toObject(),
    groups: order.groups.filter((g) => g.vendor.toString() === vendorId),
  };
}

export async function setVendorGroupStatus(
  vendorId: string,
  orderId: string,
  groupId: string,
  status: string,
) {
  const order = await Order.findOne({ _id: orderId, 'groups.vendor': vendorId });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const group = order.groups.find((g) => g._id?.toString() === groupId);
  if (!group) {
    throw new ApiError(404, 'Order group not found.');
  }

  const legalTargets = GROUP_TRANSITIONS[group.status];
  if (!legalTargets?.includes(status)) {
    throw new ApiError(400, `Invalid group status transition: ${group.status} -> ${status}.`);
  }

  if (group.status === status) {
    throw new ApiError(409, `Group is already ${status}.`);
  }

  group.status = status as typeof group.status;
  await order.save();
  return order;
}