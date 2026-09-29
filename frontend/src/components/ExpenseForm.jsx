import React, { useState, useEffect } from 'react';
import { CategorySelector } from './CategorySelector';
import { getCurrencySymbol } from '../utils/formatters';
import { PlusCircle, Check, X, AlertCircle } from 'lucide-react';

export const ExpenseForm = ({
  initialData = null,
  categories = [],
  currency = 'INR',
  onSubmit,
  onCancel = null,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCategory(initialData.category || 'Food');
      setExpenseDate(initialData.expense_date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(initialData.payment_method || 'UPI');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length > 100) {
      errs.title = 'Title cannot exceed 100 characters';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      errs.amount = 'Valid amount is required';
    } else if (numAmount <= 0) {
      errs.amount = 'Amount must be greater than 0';
    } else if (numAmount > 1000000) {
      errs.amount = 'Amount must be within 1,000,000';
    }

    if (!category) {
      errs.category = 'Please select a category';
    }

    if (!expenseDate) {
      errs.expenseDate = 'Expense date is required';
    }

    if (description && description.length > 500) {
      errs.description = 'Description cannot exceed 500 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      expense_date: expenseDate,
      payment_method: paymentMethod,
      description: description.trim(),
    });
  };

  const quickAmounts = currency === 'INR' ? [50, 100, 200, 500, 1000] : [5, 10, 20, 50, 100];
  const paymentMethods = ['UPI', 'Cash', 'Debit Card', 'Pocket Money', 'Credit Card', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Field */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          What did you spend on? *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
          placeholder="e.g. Science Notebook, Bus ticket, Canteen snack..."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors ${
            errors.title ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-700'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Amount Field with Currency Prefix & Quick Chips */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Amount ({currency}) *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 dark:text-slate-500 pointer-events-none text-base">
            {getCurrencySymbol(currency)}
          </span>
          <input
            type="number"
            step="any"
            min="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
            }}
            placeholder="0.00"
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors ${
              errors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
        </div>

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">Quick:</span>
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              +{getCurrencySymbol(currency)}{q}
            </button>
          ))}
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.amount}
          </p>
        )}
      </div>

      {/* Category Selector */}
      <CategorySelector
        categories={categories}
        selectedCategory={category}
        onSelect={(catName) => {
          setCategory(catName);
          if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
        }}
      />
      {errors.category && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {errors.category}
        </p>
      )}

      {/* Date & Payment Method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Expense Date *
          </label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Notes (Optional)
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any context, friend names, or details..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md hover:shadow-glow-brand transition-all transform active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            'Saving...'
          ) : initialData ? (
            <>
              <Check className="w-4 h-4" /> Save Changes
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" /> Record Expense
            </>
          )}
        </button>
      </div>
    </form>
  );
};
