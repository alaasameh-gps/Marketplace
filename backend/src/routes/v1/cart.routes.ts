import { Router } from 'express';

import {
  addCartItemHandler,
  clearCartHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemQuantityHandler,
} from '../../controllers/cart.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import {
  addCartItemSchema,
  cartItemIdParamsSchema,
  updateCartItemQuantitySchema,
} from '../../validations/cart.validation.js';

const router = Router();

router.get('/', requireAuth, requireRole('customer'), getCartHandler);
router.post(
  '/items',
  requireAuth,
  requireRole('customer'),
  validateBody(addCartItemSchema),
  addCartItemHandler,
);
router.patch(
  '/items/:itemId',
  requireAuth,
  requireRole('customer'),
  validateParams(cartItemIdParamsSchema),
  validateBody(updateCartItemQuantitySchema),
  updateCartItemQuantityHandler,
);
router.delete(
  '/items/:itemId',
  requireAuth,
  requireRole('customer'),
  validateParams(cartItemIdParamsSchema),
  removeCartItemHandler,
);
router.delete('/', requireAuth, requireRole('customer'), clearCartHandler);

export default router;