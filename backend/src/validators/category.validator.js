import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

export const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),

  body('icon')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Icon identifier too long'),

  body('color')
    .optional()
    .trim()
    .matches(/^#([0-9a-fA-F]{3}){1,2}$/)
    .withMessage('Color must be a valid hex code (e.g. #EF4444)'),

  handleValidationErrors,
];

export const validateUpdateCategory = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),

  body('icon')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Icon identifier too long'),

  body('color')
    .optional()
    .trim()
    .matches(/^#([0-9a-fA-F]{3}){1,2}$/)
    .withMessage('Color must be a valid hex code (e.g. #EF4444)'),

  handleValidationErrors,
];
