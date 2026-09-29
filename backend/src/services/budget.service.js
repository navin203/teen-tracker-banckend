import { BudgetModel } from '../models/budget.model.js';
import { ExpenseModel } from '../models/expense.model.js';
import { ProfileModel } from '../models/profile.model.js';
import { getStartOfMonth, getEndOfMonth } from '../utils/dateUtils.js';

export const BudgetService = {
  /**
   * Determine warning state status based on percentage
   */
  getBudgetStatus(percentage) {
    if (percentage >= 100) return 'exceeded_100';
    if (percentage >= 90) return 'danger_90';
    if (percentage >= 75) return 'warning_75';
    if (percentage >= 50) return 'caution_50';
    return 'safe';
  },

  async getMonthlyBudgets(userId, monthString, supabase = null) {
    const targetMonth = monthString || new Date().toISOString().slice(0, 7);
    const startOfMonth = getStartOfMonth(new Date(`${targetMonth}-01`));
    const endOfMonth = getEndOfMonth(new Date(`${targetMonth}-01`));

    // Get user defined budgets for the month
    const userBudgets = await BudgetModel.findByMonth(userId, targetMonth, supabase);

    // Get user profile for default monthly target
    const profile = await ProfileModel.findById(userId, supabase);
    const profileTarget = Number(profile?.monthly_budget_target || 5000);

    // Fetch all user expenses for this month to compute actual spend
    const expenses = await ExpenseModel.getByDateRange(userId, startOfMonth, endOfMonth, supabase);

    // Calculate total spend this month
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Compute category spends
    const categorySpends = {};
    expenses.forEach((e) => {
      categorySpends[e.category] = (categorySpends[e.category] || 0) + Number(e.amount);
    });

    // Check if an overall budget exists, otherwise fallback to profileTarget
    const overallBudgetRecord = userBudgets.find((b) => b.category.toLowerCase() === 'overall');
    const overallLimit = overallBudgetRecord ? Number(overallBudgetRecord.monthly_limit) : profileTarget;
    const overallPercentage = overallLimit > 0 ? Math.round((totalSpent / overallLimit) * 100) : 0;
    const overallRemaining = Math.max(0, overallLimit - totalSpent);

    const overall = {
      id: overallBudgetRecord?.id || null,
      category: 'Overall',
      monthly_limit: overallLimit,
      spent: totalSpent,
      remaining: overallRemaining,
      percentage_used: overallPercentage,
      status: this.getBudgetStatus(overallPercentage),
      month: targetMonth,
    };

    // Build category budgets
    const categoryBudgets = userBudgets
      .filter((b) => b.category.toLowerCase() !== 'overall')
      .map((b) => {
        const spent = categorySpends[b.category] || 0;
        const limit = Number(b.monthly_limit);
        const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        const remaining = Math.max(0, limit - spent);

        return {
          id: b.id,
          category: b.category,
          monthly_limit: limit,
          spent,
          remaining,
          percentage_used: percentage,
          status: this.getBudgetStatus(percentage),
          month: targetMonth,
        };
      });

    return {
      month: targetMonth,
      overall,
      category_budgets: categoryBudgets,
    };
  },

  async createOrUpdateBudget(userId, budgetData, supabase = null) {
    const data = {
      user_id: userId,
      category: budgetData.category.trim(),
      monthly_limit: Number(budgetData.monthly_limit),
      month: budgetData.month,
    };

    return await BudgetModel.create(data, supabase);
  },

  async updateBudget(id, userId, updates, supabase = null) {
    const existing = await BudgetModel.findById(id, userId, supabase);
    if (!existing) {
      const error = new Error('Budget not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    return await BudgetModel.update(id, userId, updates, supabase);
  },

  async deleteBudget(id, userId, supabase = null) {
    const existing = await BudgetModel.findById(id, userId, supabase);
    if (!existing) {
      const error = new Error('Budget not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    return await BudgetModel.delete(id, userId, supabase);
  },
};
