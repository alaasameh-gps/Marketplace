import mongoose, { type ClientSession } from 'mongoose';

import { Commission } from '../models/Commission.model.js';
import { Order, type OrderDoc } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { getCartEnriched, getCartForUser } from '../services/cart.service.js';
import { getSettings } from '../services/settings.service.js';
import { ApiError } from '../utils/ApiError.js';
import type { CheckoutInput } from '../validations/checkout.validation.js';

interface ProductStockRow {
  _id: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  inventory?: { availableStock?: number };
  price?: number;
}

function toSubtotal(value: number): number {
  return Number.isInteger(value) ? value : Math.round(value);
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MKD-${ts}-${rand}`;
}

export async function checkout(userId: string, input: CheckoutInput) {
  const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey });
  if (existing) {
    return { order: existing, recovered: true };
  }

  const { cart } = await getCartEnriched(userId);
  if (cart.groups.length === 0) {
    throw new ApiError(400, 'Cart is empty.');
  }

  const settings = await getSettings();
  const defaultCommissionRate = settings.commissionRate;

  const rows: Promise<Array<ProductStockRow | null>> = Promise.all(
    cart.groups.flatMap((group) =>
      group.items.map((item) =>
        Product.findById(item.productId)
          .select('vendor price inventory.availableStock')
          .lean()
          .exec() as Promise<ProductStockRow | null>,
      ),
    ),
  );

  const stockRows = await rows;

  for (const group of cart.groups) {
    for (const item of group.items) {
      const row = stockRows.find((r) => r && r._id.toString() === item.productId);
      if (!row) {
        throw new ApiError(400, 'One or more products are no longer available.');
      }
      const available = row.inventory?.availableStock ?? 0;
      if (available < item.quantity) {
        throw new ApiError(409, `Insufficient stock for ${item.productId}.`);
      }
    }
  }

  const session: ClientSession = await mongoose.startSession();
  let orderCreated!: mongoose.HydratedDocument<OrderDoc>;

  try {
    await session.withTransaction(async () => {
      const reservations = await Promise.all(
        cart.groups.flatMap((group) =>
          group.items.map((item) =>
            Product.findOneAndUpdate(
              { _id: item.productId, 'inventory.availableStock': { $gte: item.quantity } },
              { $inc: { 'inventory.availableStock': -item.quantity, 'inventory.reservedStock': item.quantity } },
              { session },
            ).select('_id'),
          ),
        ),
      );

      if (reservations.some((r) => !r)) {
        throw new ApiError(409, 'Insufficient stock — please review your cart.');
      }

      const groups: Array<{
        vendor: mongoose.Types.ObjectId;
        items: Array<{
          product: mongoose.Types.ObjectId;
          productSnapshot: { name: { en: string; ar?: string }; image?: string };
          quantity: number;
          unitPrice: number;
          subtotal: number;
        }>;
        groupSubtotal: number;
        commissionRate: number;
        commissionAmount: number;
        vendorEarnings: number;
      }> = [];

      let subtotal = 0;

      for (const group of cart.groups) {
        const groupItems = await Promise.all(
          group.items.map(async (item) => {
            const product = await Product.findById(item.productId)
              .select('name images price status')
              .lean();
            if (!product || product.status !== 'active') {
              throw new ApiError(400, 'One or more products are no longer available.');
            }
            const unitPrice = product.price ?? item.unitPrice;
            return {
              product: new mongoose.Types.ObjectId(item.productId),
              productSnapshot: {
                name: product.name as { en: string; ar?: string },
                image: (product.images as string[] | undefined)?.[0],
              },
              quantity: item.quantity,
              unitPrice,
              subtotal: toSubtotal(unitPrice * item.quantity),
            };
          }),
        );

        const groupSubtotal = toSubtotal(groupItems.reduce((sum, i) => sum + i.subtotal, 0));
        const commissionAmount = toSubtotal((groupSubtotal * defaultCommissionRate) / 100);

        groups.push({
          vendor: new mongoose.Types.ObjectId(group.vendor.id),
          items: groupItems,
          groupSubtotal,
          commissionRate: defaultCommissionRate,
          commissionAmount,
          vendorEarnings: groupSubtotal - commissionAmount,
        });

        subtotal += groupSubtotal;
      }

      subtotal = toSubtotal(subtotal);

      const [created] = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            idempotencyKey: input.idempotencyKey,
            customer: new mongoose.Types.ObjectId(userId),
            status: 'pending',
            paymentStatus: 'unpaid',
            currency: 'SAR',
            shippingAddress: input.shippingAddress,
            groups,
            totals: { subtotal, shippingFee: 0, tax: 0, total: subtotal },
          },
        ],
        { session },
      );

      orderCreated = created;

      const commissionRows = groups.map((g) => {
        const groupId = created.groups.find((og) => og.vendor.toString() === g.vendor.toString())?._id;
        return {
          order: created._id,
          orderGroupId: groupId,
          vendor: g.vendor,
          rate: g.commissionRate,
          amount: g.commissionAmount,
          commissionAmount: g.commissionAmount,
          vendorEarnings: g.vendorEarnings,
          status: 'pending',
        };
      });

      await Commission.insertMany(commissionRows, { session });

      const cartDoc = await getCartForUser(userId);
      cartDoc.items.splice(0, cartDoc.items.length);
      cartDoc.markModified('items');
      await cartDoc.save({ session });
    });

    return { order: orderCreated, recovered: false };
  } catch (error) {
    await session.abortTransaction().catch(() => undefined);
    throw error;
  } finally {
    await session.endSession().catch(() => undefined);
  }
}