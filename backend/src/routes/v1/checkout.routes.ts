import { Router } from 'express';

import { checkoutHandler } from '../../controllers/checkout.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { checkoutSchema } from '../../validations/checkout.validation.js';

const router = Router();

router.post('/', requireAuth, requireRole('customer'), validateBody(checkoutSchema), checkoutHandler);

export default router;