import { Router } from 'express';

import { env } from '../../config/env.js';
import {
  initiatePaymentHandler,
  listAdminPaymentsHandler,
  paymentWebhookHandler,
  simulateSandboxWebhookHandler,
} from '../../controllers/payment.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { webhookLimiter } from '../../middleware/rate-limit.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validate.middleware.js';
import {
  initiatePaymentSchema,
  listAdminPaymentsQuerySchema,
  providerParamsSchema,
  simulateSandboxBodySchema,
} from '../../validations/payment.validation.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  requireRole('customer'),
  validateBody(initiatePaymentSchema),
  initiatePaymentHandler,
);

if (env.nodeEnv !== 'production') {
  router.post(
    '/simulate-sandbox',
    requireAuth,
    requireRole('customer'),
    validateBody(simulateSandboxBodySchema),
    simulateSandboxWebhookHandler,
  );
}

router.post(
  '/webhooks/:provider',
  webhookLimiter,
  validateParams(providerParamsSchema),
  paymentWebhookHandler,
);

router.get(
  '/admin',
  requireAuth,
  requireRole('admin'),
  validateQuery(listAdminPaymentsQuerySchema),
  listAdminPaymentsHandler,
);

export default router;