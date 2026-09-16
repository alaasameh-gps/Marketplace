import type { Request, RequestHandler, Response } from 'express';

import { checkout } from '../services/checkout.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { CheckoutInput } from '../validations/checkout.validation.js';

export const checkoutHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const body = req.body as CheckoutInput;
    const result = await checkout(authUser.id, body);
    res.status(201).json({ success: true, data: result });
  },
);