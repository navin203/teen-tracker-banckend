import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  validateCreateBudget,
  validateUpdateBudget,
} from '../validators/budget.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/', BudgetController.getBudgets);
router.post('/', validateCreateBudget, BudgetController.createBudget);
router.put('/:id', validateUpdateBudget, BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;
