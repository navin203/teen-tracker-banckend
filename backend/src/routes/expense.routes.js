import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  validateCreateExpense,
  validateUpdateExpense,
  validateExpenseQuery,
} from '../validators/expense.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/', validateExpenseQuery, ExpenseController.getExpenses);
router.get('/:id', ExpenseController.getExpenseById);
router.post('/', validateCreateExpense, ExpenseController.createExpense);
router.put('/:id', validateUpdateExpense, ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

export default router;
