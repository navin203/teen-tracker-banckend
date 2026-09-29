import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

export const validateCreateBudget = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Budget category is required (use "Overall" or category name)')
    .isLength({ max: 50 })
    .withMessage('Category name must not exceed 50 characters'),

  body('monthly_limit')
    .notEmpty()
    .withMessage('Monthly limit is required')
    .isFloat({ min: 1, max: 10000000 })
    .withMessage('Monthly limit must be a positive number up to 10,000,000')
    .toFloat(),

  body('month')
    .notEmpty()
    .withMessage('Month is required (YYYY-MM-DD or YYYY-MM)')
    .custom((val) => {
      // Allow YYYY-MM or YYYY-MM-DD
      const regex = /^\d{4}-\d{2}(-\d{2})?$/;
      if (!regex.test(val)) {
        throw new Error('Month must be in format YYYY-MM or YYYY-MM-DD');
      }
      return true;
    }),

  handleValidationErrors,
];

export const validateUpdateBudget = [
  param('id')
    .notEmpty()
    .withMessage('Budget ID is required'),

  body('monthly_limit')
    .optional()
    .isFloat({ min: 1, max: 10000000 })
    .withMessage('Monthly limit must be a positive number')
    .toFloat(),

  handleValidationErrors,
];
