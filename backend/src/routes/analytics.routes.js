import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', AnalyticsController.getSummary);
router.get('/categories', AnalyticsController.getCategories);
router.get('/monthly', AnalyticsController.getMonthly);
router.get('/daily', AnalyticsController.getDaily);
router.get('/budget-vs-actual', AnalyticsController.getBudgetVsActual);

export default router;
