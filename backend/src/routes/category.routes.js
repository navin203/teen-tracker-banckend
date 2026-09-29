import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
} from '../validators/category.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/', CategoryController.getCategories);
router.post('/', validateCreateCategory, CategoryController.createCategory);
router.put('/:id', validateUpdateCategory, CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
