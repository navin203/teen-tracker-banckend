import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ExpenseService, CategoryService } from '../services/api';
import { ExpenseForm } from '../components/ExpenseForm';
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

export const AddExpensePage = () => {
  const { currency } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    CategoryService.getCategories()
      .then((res) => {
        if (res?.data) setCategories(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await ExpenseService.createExpense(formData);
      addToast('Expense recorded successfully! Keep up the habit!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Failed to record expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
          Fast Expense Logger
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Record Daily Expense
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Log your purchase immediately so your budget and insights stay 100% accurate.
          </p>
        </div>

        <ExpenseForm
          categories={categories}
          currency={currency}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Helpful Teen Tip */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 dark:text-indigo-300 space-y-1 leading-relaxed">
          <p className="font-bold">Did you know?</p>
          <p>
            Logging expenses takes less than 15 seconds. Students who log expenses daily save an average of 20% more pocket money by the end of each month!
          </p>
        </div>
      </div>
    </div>
  );
};
