import { BudgetService } from '../services/budget.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const BudgetController = {
  async getBudgets(req, res, next) {
    try {
      const month = req.query.month;
      const budgetData = await BudgetService.getMonthlyBudgets(req.user.id, month, req.supabase);
      return successResponse(res, budgetData, 'Budgets retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createBudget(req, res, next) {
    try {
      const budget = await BudgetService.createOrUpdateBudget(req.user.id, req.body, req.supabase);
      return successResponse(res, budget, 'Budget set successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateBudget(req, res, next) {
    try {
      const updated = await BudgetService.updateBudget(req.params.id, req.user.id, req.body, req.supabase);
      return successResponse(res, updated, 'Budget updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteBudget(req, res, next) {
    try {
      await BudgetService.deleteBudget(req.params.id, req.user.id, req.supabase);
      return successResponse(res, { id: req.params.id }, 'Budget deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
