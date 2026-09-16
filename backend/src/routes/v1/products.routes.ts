import { Router } from 'express';

import {
  getPublicProductBySlugHandler,
  listPublicProductsHandler,
} from '../../controllers/catalog.controller.js';
import { validateParams, validateQuery } from '../../middleware/validate.middleware.js';
import {
  listPublicProductsQuerySchema,
  productSlugParamsSchema,
} from '../../validations/catalog.validation.js';

const router = Router();

router.get('/', validateQuery(listPublicProductsQuerySchema), listPublicProductsHandler);
router.get('/:slug', validateParams(productSlugParamsSchema), getPublicProductBySlugHandler);

export default router;