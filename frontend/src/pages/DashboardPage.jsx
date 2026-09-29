import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnalyticsService, ExpenseService, CategoryService, InsightService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { DashboardCard } from '../components/DashboardCard';
import { ExpenseItem } from '../components/ExpenseItem';
import { ExpenseForm } from '../components/ExpenseForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SpendingInsight } from '../components/SpendingInsight';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import {
  Wallet,
  Calendar,
  Clock,
  PiggyBank,
  TrendingUp,
  Receipt,
  PlusCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  X,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, profile, currency } = useAuth();
  const { addToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [categoriesBreakdown, setCategoriesBreakdown] = useState([]);
  const [topInsight, setTopInsight] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, catRes, insRes, allCatsRes] = await Promise.all([
        AnalyticsService.getSummary(),
        AnalyticsService.getCategoriesBreakdown(),
        InsightService.getInsights(),
        CategoryService.getCategories(),
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (catRes?.data?.categories) setCategoriesBreakdown(catRes.data.categories);
      if (insRes?.data?.insights?.length) setTopInsight(insRes.data.insights[0]);
      if (allCatsRes?.data) setCategories(allCatsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      addToast(err.message || 'Error loading dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Create or Update Expense
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingExpense) {
        await ExpenseService.updateExpense(editingExpense.id, formData);
        addToast('Expense updated successfully!', 'success');
      } else {
        await ExpenseService.createExpense(formData);
        addToast('Expense recorded successfully!', 'success');
      }
      setModalOpen(false);
      setEditingExpense(null);
      // Auto-refresh dashboard metrics
      await fetchDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to save expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Expense
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await ExpenseService.deleteExpense(deleteTarget.id);
      addToast('Expense deleted successfully', 'success');
      setDeleteTarget(null);
      await fetchDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  if (loading && !summary) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="Crunching your pocket money numbers..." size="lg" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Teen Explorer';
  const budgetProgress = summary?.budgetProgressPercentage || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-teen-purple text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <span className="text-9xl font-black">₹</span>
        </div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              {profile?.age_group || 'Teen Tracker'}
            </span>
            <span className="text-white/80 text-xs font-medium">Daily Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hey, {displayName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-lg leading-relaxed">
            Here is your spending snapshot for this month. Stay on top of your pocket money and build great habits!
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setModalOpen(true);
          }}
          className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-brand-600 hover:bg-brand-50 font-bold text-sm shadow-md transition-all transform active:scale-95 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* 8 Primary Dashboard Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total spending this month */}
        <DashboardCard
          title="Total Spent This Month"
          value={formatCurrency(summary?.totalSpentThisMonth || 0, currency)}
          subtitle="All transactions"
          icon={Wallet}
          colorScheme="brand"
        />

        {/* 2. Today's spending */}
        <DashboardCard
          title="Today's Spending"
          value={formatCurrency(summary?.todaySpending || 0, currency)}
          subtitle="Daily spending total"
          icon={Clock}
          colorScheme="emerald"
        />

        {/* 3. Weekly spending */}
        <DashboardCard
          title="Weekly Spending"
          value={formatCurrency(summary?.weeklySpending || 0, currency)}
          subtitle="Current calendar week"
          icon={Calendar}
          colorScheme="cyan"
        />

        {/* 4. Remaining monthly budget */}
        <DashboardCard
          title="Remaining Budget"
          value={formatCurrency(summary?.remainingMonthlyBudget || 0, currency)}
          subtitle={`Limit: ${formatCurrency(summary?.overallBudget || 0, currency)}`}
          icon={PiggyBank}
          colorScheme={summary?.remainingMonthlyBudget > 0 ? 'emerald' : 'rose'}
        />

        {/* 5. Highest spending category */}
        <DashboardCard
          title="Top Category"
          value={summary?.highestCategory?.category || 'None'}
          subtitle={
            summary?.highestCategory?.amount > 0
              ? `${formatCurrency(summary.highestCategory.amount, currency)} (${summary.highestCategory.percentage}%)`
              : 'No spend yet'
          }
          icon={TrendingUp}
          colorScheme="purple"
        />

        {/* 6. Number of transactions */}
        <DashboardCard
          title="Total Transactions"
          value={summary?.transactionCount || 0}
          subtitle="Recorded this month"
          icon={Receipt}
          colorScheme="amber"
        />

        {/* 8. Budget progress percentage */}
        <div className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Budget Progress
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                budgetProgress >= 100
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  : budgetProgress >= 75
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {budgetProgress}% used
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetProgress >= 100
                  ? 'bg-rose-500'
                  : budgetProgress >= 75
                  ? 'bg-amber-500'
                  : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Spent: {formatCurrency(summary?.totalSpentThisMonth || 0, currency)}</span>
            <Link
              to="/budget"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              Manage Budgets <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Smart Insight Teaser */}
      {topInsight && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teen-purple" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Smart Spending Insight
              </h2>
            </div>
            <Link
              to="/insights"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              View All Insights <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <SpendingInsight insight={topInsight} />
        </div>
      )}

      {/* Analytics Preview & 7. Recent Expenses Split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category Share Preview */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Split
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where your money went this month
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Full Charts
            </Link>
          </div>

          {categoriesBreakdown.length > 0 ? (
            <CategoryPieChart data={categoriesBreakdown} currency={currency} />
          ) : (
            <EmptyState
              title="No spending data yet"
              description="Add your first few expenses to see a visual breakdown."
            />
          )}
        </div>

        {/* 7. Recent Expenses List */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest 5 logged purchases
              </p>
            </div>
            <Link
              to="/expenses"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {summary?.recentExpenses?.length > 0 ? (
            <div className="space-y-2">
              {summary.recentExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  currency={currency}
                  onEdit={(exp) => {
                    setEditingExpense(exp);
                    setModalOpen(true);
                  }}
                  onDelete={(exp) => setDeleteTarget(exp)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent expenses"
              description="Tap 'Record Expense' to log your first transaction!"
              actionText="Record Expense"
              onAction={() => {
                setEditingExpense(null);
                setModalOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Quick Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingExpense ? 'Edit Expense' : 'Record New Expense'}
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingExpense(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ExpenseForm
              initialData={editingExpense}
              categories={categories}
              currency={currency}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setModalOpen(false);
                setEditingExpense(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteTarget?.title}" (-${formatCurrency(
          deleteTarget?.amount,
          currency
        )})?`}
        confirmText="Yes, Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
