import { ExpenseModel } from '../models/expense.model.js';
import { BudgetService } from './budget.service.js';
import {
  getTodayDateString,
  getStartOfMonth,
  getEndOfMonth,
  getLastMonthRange,
  getStartOfWeek,
  getEndOfWeek,
} from '../utils/dateUtils.js';

export const InsightService = {
  /**
   * Generates rule-based smart insights and age-appropriate educational guidance
   */
  async generateInsights(userId, supabase = null) {
    const today = getTodayDateString();
    const currentMonth = today.slice(0, 7);
    const startOfCurrentMonth = getStartOfMonth(new Date(`${currentMonth}-01`));
    const endOfCurrentMonth = getEndOfMonth(new Date(`${currentMonth}-01`));
    const lastMonthRange = getLastMonthRange();

    // 1. Fetch current month and last month expenses
    const [currentExpenses, lastMonthExpenses] = await Promise.all([
      ExpenseModel.getByDateRange(userId, startOfCurrentMonth, endOfCurrentMonth, supabase),
      ExpenseModel.getByDateRange(userId, lastMonthRange.start, lastMonthRange.end, supabase),
    ]);

    // 2. Fetch budget info
    const budgetData = await BudgetService.getMonthlyBudgets(userId, currentMonth, supabase);
    const overallBudget = budgetData.overall.monthly_limit;
    const totalSpent = budgetData.overall.spent;
    const remainingBudget = budgetData.overall.remaining;
    const budgetPct = budgetData.overall.percentage_used;

    const insights = [];

    // --- RULE 1: Budget Utilization & Safety ---
    if (budgetPct >= 100) {
      insights.push({
        id: 'budget-exceeded',
        type: 'warning',
        category: 'Budget',
        title: 'Monthly Budget Milestone Reached',
        message: `You've reached 100% of your planned monthly budget (₹${totalSpent.toLocaleString()} of ₹${overallBudget.toLocaleString()}). For the rest of the month, focus on essential daily needs.`,
        tip: 'Review your upcoming planned purchases and see if non-essential items can wait until next month.',
        icon: 'AlertCircle',
      });
    } else if (budgetPct >= 90) {
      insights.push({
        id: 'budget-90',
        type: 'warning',
        category: 'Budget',
        title: 'Approaching Monthly Budget Limit',
        message: `You have utilized ${budgetPct}% of your budget with ₹${remainingBudget.toLocaleString()} remaining.`,
        tip: 'Keeping a small reserve helps avoid running out of pocket money before month-end.',
        icon: 'AlertTriangle',
      });
    } else if (budgetPct >= 75) {
      insights.push({
        id: 'budget-75',
        type: 'caution',
        category: 'Budget',
        title: 'Budget Check-In: 75% Utilized',
        message: `You've used ${budgetPct}% of your budget so far. You still have ₹${remainingBudget.toLocaleString()} left.`,
        tip: 'A quick review of your weekly subscriptions or snack runs can keep you in the green.',
        icon: 'PieChart',
      });
    } else if (budgetPct <= 30 && currentExpenses.length > 0) {
      insights.push({
        id: 'budget-healthy',
        type: 'positive',
        category: 'Budget',
        title: 'Great Budget Pacing!',
        message: `You still have most of your monthly budget available (${100 - budgetPct}% remaining).`,
        tip: 'Consider putting a small portion of leftover funds into your wishlist or savings goal!',
        icon: 'Sparkles',
      });
    }

    // --- RULE 2: Dominant Category Spending ---
    const categoryTotals = {};
    currentExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    let topCategory = null;
    let topAmount = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > topAmount) {
        topAmount = amt;
        topCategory = cat;
      }
    }

    if (topCategory && totalSpent > 0) {
      const catPct = Math.round((topAmount / totalSpent) * 100);
      if (catPct >= 35) {
        insights.push({
          id: 'category-dominant',
          type: 'info',
          category: topCategory,
          title: `Largest Spending Area: ${topCategory}`,
          message: `Your ${topCategory.toLowerCase()} expenses represent ${catPct}% of your total spending this month (₹${topAmount.toLocaleString()}).`,
          tip: `Notice whether these purchases are daily essentials (like bus commute or books) or discretionary fun. Both are valid, but knowing the split gives you control.`,
          icon: 'TrendingUp',
        });
      }
    }

    // --- RULE 3: Month-over-Month Category Trend ---
    const lastMonthCategoryTotals = {};
    lastMonthExpenses.forEach((e) => {
      lastMonthCategoryTotals[e.category] = (lastMonthCategoryTotals[e.category] || 0) + Number(e.amount);
    });

    if (topCategory && lastMonthCategoryTotals[topCategory]) {
      const prevAmount = lastMonthCategoryTotals[topCategory];
      const diff = topAmount - prevAmount;
      if (diff > 200 && prevAmount > 0) {
        const increasePct = Math.round((diff / prevAmount) * 100);
        insights.push({
          id: 'category-increase',
          type: 'info',
          category: topCategory,
          title: `${topCategory} Spending Higher Than Last Month`,
          message: `You've spent ₹${diff.toLocaleString()} (${increasePct}%) more on ${topCategory.toLowerCase()} compared to this time last month.`,
          tip: 'Has something special happened recently (e.g. exams, outings, seasonal clothes)? Understanding why prevents unexpected stress.',
          icon: 'ArrowUpRight',
        });
      }
    }

    // --- RULE 4: Frequent Small Micro-transactions (The Snack/Canteen Factor) ---
    const smallPurchases = currentExpenses.filter((e) => Number(e.amount) <= 150);
    if (smallPurchases.length >= 4) {
      const smallTotal = smallPurchases.reduce((sum, e) => sum + Number(e.amount), 0);
      insights.push({
        id: 'micro-purchases',
        type: 'education',
        category: 'Habits',
        title: 'The "Small Purchases" Effect',
        message: `You have ${smallPurchases.length} small expenses (under ₹150) totaling ₹${smallTotal.toLocaleString()}.`,
        tip: 'Small daily canteen treats or quick UPI payments are easy to forget, but tracking them gives you clarity over where your money goes.',
        icon: 'Coffee',
      });
    }

    // --- RULE 5: Consistency & Habit Builder ---
    if (currentExpenses.length >= 5) {
      insights.push({
        id: 'tracking-habit',
        type: 'positive',
        category: 'Milestone',
        title: 'Consistent Money Tracking!',
        message: `You have recorded ${currentExpenses.length} transactions this month. Building financial awareness early is a superpower!`,
        tip: 'Logging expenses on the same day they happen takes only 10 seconds and keeps your dashboard accurate.',
        icon: 'Award',
      });
    } else {
      insights.push({
        id: 'start-tracking',
        type: 'info',
        category: 'Tip',
        title: 'Keep Up The Momentum',
        message: 'Add each expense as soon as it happens—even small bus tickets or stationery items.',
        tip: 'Regular tracking helps TeenTrack generate more personalized insights for you!',
        icon: 'CheckCircle',
      });
    }

    // --- RULE 6: Age-Appropriate Teen Financial Wisdom ---
    insights.push({
      id: 'teen-wisdom-503020',
      type: 'education',
      category: 'Smart Habits',
      title: 'The 50/30/20 Teen Rule',
      message: 'A simple way to divide your pocket money: 50% for Needs (commute, lunch, books), 30% for Wants (games, outings), and 20% for Savings (goals, future gifts).',
      tip: 'You do not have to be rigid! Even saving 10% each month builds lifelong confidence with money.',
      icon: 'BookOpen',
    });

    return {
      generatedAt: new Date().toISOString(),
      month: currentMonth,
      summary: {
        totalInsights: insights.length,
        budgetHealth: budgetPct > 90 ? 'Attention Needed' : budgetPct > 70 ? 'Moderate' : 'Healthy',
      },
      insights,
    };
  },
};
