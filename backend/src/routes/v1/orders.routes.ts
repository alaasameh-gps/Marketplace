import { Router } from 'express';

import {
  cancelMyOrderHandler,
  getMyOrderByIdHandler,
  listMyOrdersHandler,
} from '../../controllers/order.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateParams, validateQuery } from '../../middleware/validate.middleware.js';
import { customerOrderIdParamsSchema, listCustomerOrdersQuerySchema } from '../../validations/order.validation.js';

const router = Router();

router.get('/', requireAuth, requireRole('customer'), validateQuery(listCustomerOrdersQuerySchema), listMyOrdersHandler);
router.get('/:id', requireAuth, requireRole('customer'), validateParams(customerOrderIdParamsSchema), getMyOrderByIdHandler);
router.patch('/:id/cancel', requireAuth, requireRole('customer'), validateParams(customerOrderIdParamsSchema), cancelMyOrderHandler);

export default router;