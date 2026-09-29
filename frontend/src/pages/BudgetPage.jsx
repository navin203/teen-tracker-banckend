import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BudgetService, CategoryService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { BudgetCard } from '../components/BudgetCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  PiggyBank,
  PlusCircle,
  Sliders,
  Calendar,
  AlertCircle,
  Sparkles,
  X,
  Check,
} from 'lucide-react';

export const BudgetPage = () => {
  const { currency } = useAuth();
  const { addToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [budgetData, setBudgetData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for setting/updating a budget
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('Overall');
  const [modalLimit, setModalLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        BudgetService.getBudgets(currentMonth),
        CategoryService.getCategories(),
      ]);

      if (bRes?.data) setBudgetData(bRes.data);
      if (cRes?.data) setCategories(cRes.data);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error fetching budgets', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, addToast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(modalLimit);
    if (!modalLimit || isNaN(limitNum) || limitNum <= 0) {
      addToast('Please enter a valid positive budget amount', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await BudgetService.createBudget({
        category: modalCategory,
        monthly_limit: limitNum,
        month: currentMonth,
      });

      addToast(`Budget for ${modalCategory} updated!`, 'success');
      setModalOpen(false);
      setModalLimit('');
      fetchBudgets();
    } catch (err) {
      addToast(err.message || 'Failed to update budget', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBudgetModal = (categoryName = 'Overall', currentLimit = '') => {
    setModalCategory(categoryName);
    setModalLimit(currentLimit ? String(currentLimit) : '');
    setModalOpen(true);
  };

  if (loading && !budgetData) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="Loading budget goals..." size="lg" />
      </div>
    );
  }

  const overall = budgetData?.overall;
  const categoryBudgets = budgetData?.category_budgets || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set spending limits to keep your expenses balanced and healthy
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-brand-500" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <button
            onClick={() => openBudgetModal('Overall', overall?.monthly_limit)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-glow-brand transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Main Overall Monthly Budget Card */}
      {overall && (
        <div className="p-6 sm:p-8 rounded-3xl border border-brand-200/80 dark:border-brand-900/50 bg-gradient-to-br from-brand-50/60 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-brand-950/40 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Primary Monthly Budget Target
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(overall.spent, currency)}{' '}
                <span className="text-base sm:text-lg font-normal text-slate-400">
                  / {formatCurrency(overall.monthly_limit, currency)}
                </span>
              </h2>
            </div>

            <button
              onClick={() => openBudgetModal('Overall', overall.monthly_limit)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-slate-900 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 transition-colors self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5" /> Adjust Target
            </button>
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overall.percentage_used >= 100
                    ? 'bg-rose-500'
                    : overall.percentage_used >= 90
                    ? 'bg-rose-400'
                    : overall.percentage_used >= 75
                    ? 'bg-amber-500'
                    : overall.percentage_used >= 50
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(overall.percentage_used, 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              <span>{overall.percentage_used}% Utilized</span>
              <span className={overall.remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                {formatCurrency(overall.remaining, currency)} Remaining
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Specific Budgets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Category Budgets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep specific spending categories like Food, Gaming, or Shopping under control
            </p>
          </div>

          <button
            onClick={() => openBudgetModal('Food', '')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Category Limit
          </button>
        </div>

        {categoryBudgets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => (
              <BudgetCard
                key={b.id || b.category}
                category={b.category}
                monthlyLimit={b.monthly_limit}
                spent={b.spent}
                remaining={b.remaining}
                percentage={b.percentage_used}
                status={b.status}
                currency={currency}
                onEdit={() => openBudgetModal(b.category, b.monthly_limit)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
            <PiggyBank className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No category limits set for this month
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Setting limits for categories like Food, Entertainment, or Shopping helps you avoid end-of-month surprises.
            </p>
            <button
              onClick={() => openBudgetModal('Food', '')}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold"
            >
              Add First Category Limit
            </button>
          </div>
        )}
      </div>

      {/* Set/Edit Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Set Monthly Budget Limit
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="Overall">Overall Total Budget</option>
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Monthly Limit ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={modalLimit}
                  onChange={(e) => setModalLimit(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
