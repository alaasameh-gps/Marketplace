import { Router } from 'express';

import {
  getPublicVendorBySlugHandler,
  listPublicVendorProductsHandler,
  listPublicVendorsHandler,
} from '../../controllers/catalog.controller.js';
import { getMyVendor } from '../../controllers/vendor.controller.js';
import {
  createMyProduct,
  deleteMyProduct,
  getMyProduct,
  listMyProducts,
  updateMyProduct,
} from '../../controllers/vendor-product.controller.js';
import {
  getMyCommissionSummaryHandler,
  listMyCommissionsHandler,
} from '../../controllers/vendor-commission.controller.js';
import {
  getMyOrderByIdHandler,
  listMyOrdersHandler,
  setGroupStatusHandler,
} from '../../controllers/vendor-order.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware.js';
import {
  listPublicVendorsQuerySchema,
  publicVendorProductsQuerySchema,
  vendorSlugParamsSchema,
} from '../../validations/catalog.validation.js';
import {
  createVendorProductSchema,
  listVendorProductsQuerySchema,
  updateVendorProductSchema,
  vendorProductIdParamsSchema,
} from '../../validations/vendor-product.validation.js';
import {
  listVendorOrdersQuerySchema,
  setVendorGroupStatusSchema,
  vendorOrderGroupIdParamsSchema,
  vendorOrderIdParamsSchema,
} from '../../validations/vendor-order.validation.js';
import { listVendorCommissionsQuerySchema } from '../../validations/vendor-commission.validation.js';

const router = Router();

router.get('/me', requireAuth, requireRole('vendor'), getMyVendor);

router.get('/me/products', requireAuth, requireRole('vendor'), validateQuery(listVendorProductsQuerySchema), listMyProducts);
router.post('/me/products', requireAuth, requireRole('vendor'), validateBody(createVendorProductSchema), createMyProduct);
router.get('/me/products/:productId', requireAuth, requireRole('vendor'), validateParams(vendorProductIdParamsSchema), getMyProduct);
router.patch('/me/products/:productId', requireAuth, requireRole('vendor'), validateParams(vendorProductIdParamsSchema), validateBody(updateVendorProductSchema), updateMyProduct);
router.delete('/me/products/:productId', requireAuth, requireRole('vendor'), validateParams(vendorProductIdParamsSchema), deleteMyProduct);

router.get('/me/orders', requireAuth, requireRole('vendor'), validateQuery(listVendorOrdersQuerySchema), listMyOrdersHandler);
router.get('/me/orders/:orderId', requireAuth, requireRole('vendor'), validateParams(vendorOrderIdParamsSchema), getMyOrderByIdHandler);
router.patch(
  '/me/orders/:orderId/status/:groupId',
  requireAuth,
  requireRole('vendor'),
  validateParams(vendorOrderGroupIdParamsSchema),
  validateBody(setVendorGroupStatusSchema),
  setGroupStatusHandler,
);

router.get('/me/commissions', requireAuth, requireRole('vendor'), validateQuery(listVendorCommissionsQuerySchema), listMyCommissionsHandler);
router.get('/me/commissions/summary', requireAuth, requireRole('vendor'), getMyCommissionSummaryHandler);

router.get('/', validateQuery(listPublicVendorsQuerySchema), listPublicVendorsHandler);
router.get('/:slug/products', validateParams(vendorSlugParamsSchema), validateQuery(publicVendorProductsQuerySchema), listPublicVendorProductsHandler);
router.get('/:slug', validateParams(vendorSlugParamsSchema), getPublicVendorBySlugHandler);

export default router;