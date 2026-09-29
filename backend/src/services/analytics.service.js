import { ExpenseModel } from '../models/expense.model.js';
import { BudgetService } from './budget.service.js';
import {
  getTodayDateString,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  formatDateToISO,
} from '../utils/dateUtils.js';

export const AnalyticsService = {
  /**
   * Complete dashboard summary metrics
   */
  async getDashboardSummary(userId, supabase = null) {
    const today = getTodayDateString();
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    // Fetch this month's expenses
    const monthExpenses = await ExpenseModel.getByDateRange(userId, startOfMonth, endOfMonth, supabase);

    // 1. Total spending this month
    const totalSpentThisMonth = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 2. Today's spending
    const todayExpenses = monthExpenses.filter((e) => e.expense_date === today);
    const todaySpending = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 3. Weekly spending
    const weekExpenses = monthExpenses.filter(
      (e) => e.expense_date >= startOfWeek && e.expense_date <= endOfWeek
    );
    const weeklySpending = weekExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 4. Monthly budget and remaining
    const budgetData = await BudgetService.getMonthlyBudgets(userId, today.slice(0, 7), supabase);
    const overallBudget = budgetData.overall.monthly_limit;
    const remainingMonthlyBudget = budgetData.overall.remaining;
    const budgetProgressPercentage = budgetData.overall.percentage_used;

    // 5. Highest spending category this month
    const categoryTotals = {};
    monthExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    let highestCategory = { category: 'None', amount: 0, percentage: 0 };
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > highestCategory.amount) {
        highestCategory = {
          category: cat,
          amount: amt,
          percentage: totalSpentThisMonth > 0 ? Math.round((amt / totalSpentThisMonth) * 100) : 0,
        };
      }
    }

    // 6. Number of transactions this month
    const transactionCount = monthExpenses.length;

    // 7. Recent expenses (latest 5)
    const { expenses: recentExpenses } = await ExpenseModel.findMany(
      userId,
      { sort: 'newest', page: 1, limit: 5 },
      supabase
    );

    return {
      todaySpending,
      weeklySpending,
      totalSpentThisMonth,
      overallBudget,
      remainingMonthlyBudget,
      budgetProgressPercentage,
      highestCategory,
      transactionCount,
      recentExpenses,
    };
  },

  /**
   * Category spending breakdown for Bar and Pie charts
   */
  async getCategoryBreakdown(userId, monthString = null, supabase = null) {
    const targetMonth = monthString || getTodayDateString().slice(0, 7);
    const startOfMonth = getStartOfMonth(new Date(`${targetMonth}-01`));
    const endOfMonth = getEndOfMonth(new Date(`${targetMonth}-01`));

    const expenses = await ExpenseModel.getByDateRange(userId, startOfMonth, endOfMonth, supabase);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categoriesMap = {};
    expenses.forEach((e) => {
      if (!categoriesMap[e.category]) {
        categoriesMap[e.category] = { category: e.category, amount: 0, count: 0 };
      }
      categoriesMap[e.category].amount += Number(e.amount);
      categoriesMap[e.category].count += 1;
    });

    const categoryList = Object.values(categoriesMap).map((item) => ({
      category: item.category,
      amount: item.amount,
      count: item.count,
      percentage: totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0,
    }));

    categoryList.sort((a, b) => b.amount - a.amount);

    return {
      month: targetMonth,
      totalSpent,
      categories: categoryList,
    };
  },

  /**
   * Monthly trend for Line Chart (Current calendar year, 12 months)
   */
  async getMonthlyTrend(userId, yearParam = null, supabase = null) {
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const expenses = await ExpenseModel.getByDateRange(userId, startDate, endDate, supabase);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map((name, index) => {
      const monthPrefix = `${year}-${String(index + 1).padStart(2, '0')}`;
      const monthExpenses = expenses.filter((e) => e.expense_date.startsWith(monthPrefix));
      const totalAmount = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        month: name,
        monthKey: monthPrefix,
        amount: totalAmount,
        transactions: monthExpenses.length,
      };
    });

    return {
      year,
      monthlyData,
    };
  },

  /**
   * Daily spending trend for current month
   */
  async getDailyTrend(userId, monthString = null, supabase = null) {
    const targetMonth = monthString || getTodayDateString().slice(0, 7);
    const dateObj = new Date(`${targetMonth}-01`);
    const daysInMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();

    const startOfMonth = getStartOfMonth(dateObj);
    const endOfMonth = getEndOfMonth(dateObj);

    const expenses = await ExpenseModel.getByDateRange(userId, startOfMonth, endOfMonth, supabase);

    const dailyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayFormatted = `${targetMonth}-${String(day).padStart(2, '0')}`;
      const dayExpenses = expenses.filter((e) => e.expense_date === dayFormatted);
      const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      dailyData.push({
        date: dayFormatted,
        day: `Day ${day}`,
        amount: total,
        count: dayExpenses.length,
      });
    }

    return {
      month: targetMonth,
      dailyData,
    };
  },

  /**
   * Budget vs Actual Spending Comparison
   */
  async getBudgetVsActual(userId, monthString = null, supabase = null) {
    const targetMonth = monthString || getTodayDateString().slice(0, 7);
    const budgetInfo = await BudgetService.getMonthlyBudgets(userId, targetMonth, supabase);
    const categoryBreakdown = await this.getCategoryBreakdown(userId, targetMonth, supabase);

    // Map categories with their budget and actual
    const comparison = [];

    // Overall
    comparison.push({
      category: 'Overall Total',
      budget: budgetInfo.overall.monthly_limit,
      actual: budgetInfo.overall.spent,
      difference: budgetInfo.overall.monthly_limit - budgetInfo.overall.spent,
      percentage: budgetInfo.overall.percentage_used,
    });

    // Category budgets
    budgetInfo.category_budgets.forEach((b) => {
      comparison.push({
        category: b.category,
        budget: b.monthly_limit,
        actual: b.spent,
        difference: b.remaining,
        percentage: b.percentage_used,
      });
    });

    // Categories with spending that have no explicit budget
    categoryBreakdown.categories.forEach((c) => {
      const hasBudget = budgetInfo.category_budgets.some((b) => b.category === c.category);
      if (!hasBudget) {
        comparison.push({
          category: c.category,
          budget: 0,
          actual: c.amount,
          difference: -c.amount,
          percentage: 100,
        });
      }
    });

    return {
      month: targetMonth,
      comparison,
    };
  },
};
