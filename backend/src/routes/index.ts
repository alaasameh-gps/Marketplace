import { Router } from 'express';

import healthRoutes from './health.routes.js';
import v1Routes from './v1/index.js';

const router = Router();

router.use('/v1', v1Routes);
router.use('/health', healthRoutes);

export default router;