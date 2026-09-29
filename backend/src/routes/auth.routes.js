import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/me', authLimiter, AuthController.getMe);
router.put('/me', authLimiter, AuthController.updateMe);

export default router;
