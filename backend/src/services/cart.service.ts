import type { HydratedDocument } from 'mongoose';

import { Cart, type CartDoc } from '../models/Cart.model.js';
import { Product } from '../models/Product.model.js';
import { Vendor } from '../models/Vendor.model.js';
import { ApiError } from '../utils/ApiError.js';

export type HydratedCart = HydratedDocument<CartDoc>;

const CART_PRODUCT_SELECT = 'vendor name slug price currency images status inventory.availableStock';

async function assertProductPurchasable(productId: string, quantity: number): Promise<void> {
  const product = await Product.findById(productId).select(CART_PRODUCT_SELECT).lean();
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  if (product.status !== 'active') {
    throw new ApiError(400, 'Product is not available for purchase.');
  }

  const vendor = await Vendor.findById(product.vendor).select('status').lean();
  if (!vendor || vendor.status !== 'approved') {
    throw new ApiError(400, 'Product is not available for purchase.');
  }

  const available = product.inventory?.availableStock ?? 0;
  if (available < quantity) {
    throw new ApiError(409, `Only ${available} units of this product are available.`);
  }
}

export async function getCartForUser(userId: string): Promise<HydratedCart> {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export interface CartItemEnriched {
  _id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Record<string, unknown> | null;
}

export interface CartGroups {
  groups: Array<{
    vendor: { id: string };
    items: CartItemEnriched[];
    subtotal: number;
  }>;
  subtotal: number;
  itemCount: number;
}

export async function getCartEnriched(userId: string): Promise<{ cart: CartGroups }> {
  const cart = await getCartForUser(userId);

  const items: CartItemEnriched[] = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.product)
        .select(CART_PRODUCT_SELECT)
        .populate('vendor', 'storeName slug')
        .lean();
      const price = typeof product?.price === 'number' ? product.price : 0;
      return {
        _id: item._id?.toString(),
        productId: item.product.toString(),
        quantity: item.quantity,
        unitPrice: price,
        lineTotal: price * item.quantity,
        product,
      };
    }),
  );

  const groupMap = new Map<string, CartItemEnriched[]>();
  for (const item of items) {
    const vendorId =
      (item.product?.vendor as { _id?: { toString(): string } } | undefined)?._id?.toString() ??
      'unknown';
    const bucket = groupMap.get(vendorId) ?? [];
    bucket.push(item);
    groupMap.set(vendorId, bucket);
  }

  const groups = [...groupMap.entries()].map(([vendorId, vendorItems]) => ({
    vendor: { id: vendorId },
    items: vendorItems,
    subtotal: vendorItems.reduce((sum, i) => sum + i.lineTotal, 0),
  }));

  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return { cart: { groups, subtotal, itemCount } };
}

export async function addCartItem(userId: string, productId: string, quantity: number) {
  await assertProductPurchasable(productId, quantity);

  const cart = await getCartForUser(userId);

  const existing = cart.items.find((item) => item.product.toString() === productId);

  if (existing) {
    const nextQuantity = existing.quantity + quantity;
    if (nextQuantity > 999) {
      throw new ApiError(400, 'Cart quantity can be at most 999.');
    }
    const product = await Product.findById(productId).select('inventory.availableStock').lean();
    const available = product?.inventory?.availableStock ?? 0;
    if (available < nextQuantity) {
      throw new ApiError(409, `Only ${available} units of this product are available.`);
    }
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({ product: productId as never, quantity });
  }

  await cart.save();
  return getCartEnriched(userId);
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
  const cart = await getCartForUser(userId);
  const item = cart.items.find((i) => i._id?.toString() === itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found.');
  }

  await assertProductPurchasable(item.product.toString(), quantity);

  item.quantity = quantity;
  await cart.save();
  return getCartEnriched(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getCartForUser(userId);
  const index = cart.items.findIndex((i) => i._id?.toString() === itemId);
  if (index === -1) {
    throw new ApiError(404, 'Cart item not found.');
  }

  cart.items.splice(index, 1);
  await cart.save();
  return getCartEnriched(userId);
}

export async function clearCart(userId: string) {
  const cart = await getCartForUser(userId);
  cart.items.splice(0, cart.items.length);
  await cart.save();
  return getCartEnriched(userId);
}