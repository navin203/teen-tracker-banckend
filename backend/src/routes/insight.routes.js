import { Router } from 'express';
import { InsightController } from '../controllers/insight.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', InsightController.getInsights);

export default router;
