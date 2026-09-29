import { body, query, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

export const validateCreateExpense = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be a positive number up to 1,000,000')
    .toFloat(),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category name must not exceed 50 characters'),

  body('expense_date')
    .notEmpty()
    .withMessage('Expense date is required')
    .isISO8601()
    .withMessage('Expense date must be a valid ISO 8601 date (YYYY-MM-DD)'),

  body('payment_method')
    .optional()
    .isIn(['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Pocket Money', 'Other'])
    .withMessage('Invalid payment method selected'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  handleValidationErrors,
];

export const validateUpdateExpense = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID is required'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Expense title cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('amount')
    .optional()
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be a positive number up to 1,000,000')
    .toFloat(),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Category name must not exceed 50 characters'),

  body('expense_date')
    .optional()
    .isISO8601()
    .withMessage('Expense date must be a valid date format (YYYY-MM-DD)'),

  body('payment_method')
    .optional()
    .isIn(['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Pocket Money', 'Other'])
    .withMessage('Invalid payment method'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  handleValidationErrors,
];

export const validateExpenseQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'highest', 'lowest'])
    .withMessage('Sort must be one of: newest, oldest, highest, lowest'),

  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minAmount must be non-negative')
    .toFloat(),

  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxAmount must be non-negative')
    .toFloat(),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid date (YYYY-MM-DD)'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid date (YYYY-MM-DD)'),

  handleValidationErrors,
];
