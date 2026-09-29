import { ExpenseService } from '../services/expense.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const ExpenseController = {
  async getExpenses(req, res, next) {
    try {
      const result = await ExpenseService.getExpenses(req.user.id, req.query, req.supabase);
      return successResponse(res, result, 'Expenses retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getExpenseById(req, res, next) {
    try {
      const expense = await ExpenseService.getExpenseById(req.params.id, req.user.id, req.supabase);
      return successResponse(res, expense, 'Expense retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createExpense(req, res, next) {
    try {
      const expense = await ExpenseService.createExpense(req.user.id, req.body, req.supabase);
      return successResponse(res, expense, 'Expense created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateExpense(req, res, next) {
    try {
      const updated = await ExpenseService.updateExpense(req.params.id, req.user.id, req.body, req.supabase);
      return successResponse(res, updated, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteExpense(req, res, next) {
    try {
      await ExpenseService.deleteExpense(req.params.id, req.user.id, req.supabase);
      return successResponse(res, { id: req.params.id }, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
