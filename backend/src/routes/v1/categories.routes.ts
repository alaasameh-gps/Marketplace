import { Router } from 'express';

import { listPublicCategoriesHandler } from '../../controllers/catalog.controller.js';

const router = Router();

router.get('/', listPublicCategoriesHandler);

export default router;