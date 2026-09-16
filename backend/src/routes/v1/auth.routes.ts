import { Router } from 'express';

import {
  changePassword,
  getMe,
  login,
  logout,
  refresh,
  register,
} from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rate-limit.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from '../../validations/auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.post('/change-password', requireAuth, validateBody(changePasswordSchema), changePassword);
router.get('/me', requireAuth, getMe);

export default router;