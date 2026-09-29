import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnalyticsService } from '../services/api';
import { ChartCard } from '../components/ChartCard';
import { CategoryBarChart } from '../charts/CategoryBarChart';
import { MonthlyLineChart } from '../charts/MonthlyLineChart';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { DailyTrendChart } from '../charts/DailyTrendChart';
import { BudgetVsActualChart } from '../charts/BudgetVsActualChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar, BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export const AnalyticsPage = () => {
  const { currency } = useAuth();
  const { addToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [budgetVsActualData, setBudgetVsActualData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, monRes, dayRes, bvaRes] = await Promise.all([
        AnalyticsService.getCategoriesBreakdown(currentMonth),
        AnalyticsService.getMonthlyTrend(currentYear),
        AnalyticsService.getDailyTrend(currentMonth),
        AnalyticsService.getBudgetVsActual(currentMonth),
      ]);

      if (catRes?.data?.categories) setCategoryData(catRes.data.categories);
      if (monRes?.data?.monthlyData) setMonthlyData(monRes.data.monthlyData);
      if (dayRes?.data?.dailyData) setDailyData(dayRes.data.dailyData);
      if (bvaRes?.data?.comparison) setBudgetVsActualData(bvaRes.data.comparison);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error loading analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, addToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && categoryData.length === 0 && monthlyData.length === 0) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="Generating charts and financial analytics..." size="lg" />
      </div>
    );
  }

  const hasDailyData = dailyData.some((d) => d.amount > 0);
  const hasCategoryData = categoryData.some((c) => c.amount > 0);
  const hasMonthlyData = monthlyData.some((m) => m.amount > 0);
  const hasBudgetVsActualData = budgetVsActualData.some((b) => b.budget > 0 || b.actual > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Charts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive visual charts to understand your spending patterns
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-brand-500" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of 5 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Category Spending Bar Chart */}
        <ChartCard
          title="Category Spending Breakdown"
          subtitle="Total money spent across each expense category"
          hasData={hasCategoryData}
          emptyMessage="No category spending recorded for this month."
        >
          <CategoryBarChart data={categoryData} currency={currency} />
        </ChartCard>

        {/* Chart C: Expense Category Pie / Donut Chart */}
        <ChartCard
          title="Category Distribution (%)"
          subtitle="Relative percentage share of monthly expenses"
          hasData={hasCategoryData}
          emptyMessage="No category expenses found to build donut chart."
        >
          <CategoryPieChart data={categoryData} currency={currency} />
        </ChartCard>

        {/* Chart B: Monthly Spending Line Chart */}
        <ChartCard
          title={`Annual Spending Trend (${currentYear})`}
          subtitle="Month-by-month spending progression across the calendar year"
          hasData={hasMonthlyData}
          emptyMessage="No spending history recorded for this year yet."
          headerAction={
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setCurrentYear(currentYear - 1)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {currentYear - 1}
              </button>
              <span className="font-bold px-1">{currentYear}</span>
              <button
                onClick={() => setCurrentYear(currentYear + 1)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {currentYear + 1}
              </button>
            </div>
          }
        >
          <MonthlyLineChart data={monthlyData} currency={currency} />
        </ChartCard>

        {/* Chart D: Daily Spending Trend */}
        <ChartCard
          title="Daily Spending Curve"
          subtitle="Expenses tracked day-by-day in the selected month"
          hasData={hasDailyData}
          emptyMessage="No daily expenses logged in this month."
        >
          <DailyTrendChart data={dailyData} currency={currency} />
        </ChartCard>

        {/* Chart E: Budget vs Actual Spending Comparison */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Budget Limit vs Actual Spending"
            subtitle="Comparing planned category limits against your real expenses"
            hasData={hasBudgetVsActualData}
            emptyMessage="Set category budgets or record expenses to view comparison."
          >
            <BudgetVsActualChart data={budgetVsActualData} currency={currency} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};
