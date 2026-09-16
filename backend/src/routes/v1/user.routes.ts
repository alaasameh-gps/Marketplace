import { Router } from 'express';

import { getUserById, updateMe } from '../../controllers/user.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { idParamsSchema } from '../../validations/admin/common.js';
import { updateProfileSchema } from '../../validations/user.validation.js';

const router = Router();

router.patch('/me', requireAuth, validateBody(updateProfileSchema), updateMe);
router.get('/:id', requireAuth, validateParams(idParamsSchema), getUserById);

export default router;