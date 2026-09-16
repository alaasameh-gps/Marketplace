import { Router } from 'express';

import { listPublicBrandsHandler } from '../../controllers/catalog.controller.js';
import { validateQuery } from '../../middleware/validate.middleware.js';
import { listPublicVendorsQuerySchema } from '../../validations/catalog.validation.js';

const router = Router();

router.get('/', validateQuery(listPublicVendorsQuerySchema), listPublicBrandsHandler);

export default router;