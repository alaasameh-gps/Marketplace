import { Router } from 'express';

import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware.js';

import {
  getUserByIdHandler,
  listUsersHandler,
  setUserStatusHandler,
} from '../../controllers/admin/user.controller.js';
import {
  getVendorByIdHandler,
  listVendorsHandler,
  setVendorStatusHandler,
} from '../../controllers/admin/vendor.controller.js';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoryByIdHandler,
  listCategoriesHandler,
  setCategoryStatusHandler,
  updateCategoryHandler,
} from '../../controllers/admin/category.controller.js';
import {
  createBrandHandler,
  deleteBrandHandler,
  getBrandByIdHandler,
  listBrandsHandler,
  setBrandStatusHandler,
  updateBrandHandler,
} from '../../controllers/admin/brand.controller.js';
import {
  getProductByIdHandler,
  listProductsHandler,
  setProductStatusHandler,
} from '../../controllers/admin/product.controller.js';
import {
  getOrderByIdHandler,
  listOrdersHandler,
  setOrderStatusHandler,
} from '../../controllers/admin/order.controller.js';
import {
  getCommissionSummaryHandler,
  listCommissionsHandler,
} from '../../controllers/admin/commission.controller.js';
import {
  getSettingsHandler,
  patchSettingsHandler,
} from '../../controllers/admin/settings.controller.js';
import { listAdminPaymentsHandler } from '../../controllers/payment.controller.js';

import { idParamsSchema } from '../../validations/admin/common.js';
import { categoryStatusSchema, createCategorySchema, listCategoriesQuerySchema, updateCategorySchema } from '../../validations/admin/category.validation.js';
import { brandStatusSchema, brandIdParamsSchema, createBrandSchema, listBrandsQuerySchema, updateBrandSchema } from '../../validations/admin/brand.validation.js';
import { listCommissionsQuerySchema } from '../../validations/admin/commission.validation.js';
import { listOrdersQuerySchema, orderIdParamsSchema, updateOrderStatusSchema } from '../../validations/admin/order.validation.js';
import { listAdminPaymentsQuerySchema } from '../../validations/payment.validation.js';
import { listProductsQuerySchema, productIdParamsSchema, updateProductStatusSchema } from '../../validations/admin/product.validation.js';
import { updateSettingsSchema } from '../../validations/admin/settings.validation.js';
import { listUsersQuerySchema, updateUserStatusSchema, userStatusParamsSchema } from '../../validations/admin/user.validation.js';
import { listVendorsQuerySchema, updateVendorStatusSchema, vendorStatusParamsSchema } from '../../validations/admin/vendor.validation.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', validateQuery(listUsersQuerySchema), listUsersHandler);
router.get('/users/:id', validateParams(idParamsSchema), getUserByIdHandler);
router.patch(
  '/users/:id/status',
  validateParams(userStatusParamsSchema),
  validateBody(updateUserStatusSchema),
  setUserStatusHandler,
);

router.get('/vendors', validateQuery(listVendorsQuerySchema), listVendorsHandler);
router.get('/vendors/:id', validateParams(idParamsSchema), getVendorByIdHandler);
router.patch(
  '/vendors/:id/status',
  validateParams(vendorStatusParamsSchema),
  validateBody(updateVendorStatusSchema),
  setVendorStatusHandler,
);

router.get('/categories', validateQuery(listCategoriesQuerySchema), listCategoriesHandler);
router.get('/categories/:id', validateParams(idParamsSchema), getCategoryByIdHandler);
router.post('/categories', validateBody(createCategorySchema), createCategoryHandler);
router.patch('/categories/:id', validateParams(idParamsSchema), validateBody(updateCategorySchema), updateCategoryHandler);
router.delete('/categories/:id', validateParams(idParamsSchema), deleteCategoryHandler);
router.patch('/categories/:id/status', validateParams(idParamsSchema), validateBody(categoryStatusSchema), setCategoryStatusHandler);

router.get('/brands', validateQuery(listBrandsQuerySchema), listBrandsHandler);
router.get('/brands/:id', validateParams(brandIdParamsSchema), getBrandByIdHandler);
router.post('/brands', validateBody(createBrandSchema), createBrandHandler);
router.patch('/brands/:id', validateParams(brandIdParamsSchema), validateBody(updateBrandSchema), updateBrandHandler);
router.delete('/brands/:id', validateParams(brandIdParamsSchema), deleteBrandHandler);
router.patch('/brands/:id/status', validateParams(brandIdParamsSchema), validateBody(brandStatusSchema), setBrandStatusHandler);

router.get('/products', validateQuery(listProductsQuerySchema), listProductsHandler);
router.get('/products/:id', validateParams(productIdParamsSchema), getProductByIdHandler);
router.patch('/products/:id/status', validateParams(productIdParamsSchema), validateBody(updateProductStatusSchema), setProductStatusHandler);

router.get('/orders', validateQuery(listOrdersQuerySchema), listOrdersHandler);
router.get('/orders/:id', validateParams(orderIdParamsSchema), getOrderByIdHandler);
router.patch('/orders/:id/status', validateParams(orderIdParamsSchema), validateBody(updateOrderStatusSchema), setOrderStatusHandler);

router.get('/commissions', validateQuery(listCommissionsQuerySchema), listCommissionsHandler);
router.get('/commissions/summary', getCommissionSummaryHandler);

router.get('/payments', validateQuery(listAdminPaymentsQuerySchema), listAdminPaymentsHandler);

router.get('/settings', getSettingsHandler);
router.patch('/settings', validateBody(updateSettingsSchema), patchSettingsHandler);

export default router;