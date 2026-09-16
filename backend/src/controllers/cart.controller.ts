import type { Request, RequestHandler, Response } from 'express';

import {
  addCartItem,
  clearCart,
  getCartEnriched,
  removeCartItem,
  updateCartItemQuantity,
} from '../services/cart.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AddCartItemInput, CartItemIdParams, UpdateCartItemQuantityInput } from '../validations/cart.validation.js';

export const getCartHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const result = await getCartEnriched(authUser.id);
    res.json({ success: true, data: result });
  },
);

export const addCartItemHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const body = req.body as AddCartItemInput;
    const result = await addCartItem(authUser.id, body.product, body.quantity);
    res.status(201).json({ success: true, data: result });
  },
);

export const updateCartItemQuantityHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const { itemId } = req.params as unknown as CartItemIdParams;
    const body = req.body as UpdateCartItemQuantityInput;
    const result = await updateCartItemQuantity(authUser.id, itemId, body.quantity);
    res.json({ success: true, data: result });
  },
);

export const removeCartItemHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const { itemId } = req.params as unknown as CartItemIdParams;
    const result = await removeCartItem(authUser.id, itemId);
    res.json({ success: true, data: result });
  },
);

export const clearCartHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const result = await clearCart(authUser.id);
    res.json({ success: true, data: result });
  },
);