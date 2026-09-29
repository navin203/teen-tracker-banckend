import { Router } from 'express';
import authRoutes from './auth.routes.js';
import expenseRoutes from './expense.routes.js';
import budgetRoutes from './budget.routes.js';
import categoryRoutes from './category.routes.js';
import analyticsRoutes from './analytics.routes.js';
import insightRoutes from './insight.routes.js';
import { apiLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TeenTrack API',
    version: '1.0.0',
  });
});

// Apply rate limiting across general API endpoints
router.use(apiLimiter);

// Module routes
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/categories', categoryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/insights', insightRoutes);

export default router;
