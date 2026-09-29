import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryIcon } from './CategorySelector';
import { Pencil, Trash2 } from 'lucide-react';

export const ExpenseItem = ({
  expense,
  currency = 'INR',
  onEdit = null,
  onDelete = null,
}) => {
  const Icon = getCategoryIcon(expense.category);

  // Payment method styling
  const paymentBadgeClasses = {
    Cash: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    UPI: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Debit Card': 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'Credit Card': 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'Pocket Money': 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Other: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const badgeClass = paymentBadgeClasses[expense.payment_method] || paymentBadgeClasses.Other;

  return (
    <div className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-850/80 transition-all duration-200 shadow-sm">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/10 group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {expense.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>{formatDate(expense.expense_date)}</span>
            <span>•</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{expense.category}</span>
            <span>•</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass}`}>
              {expense.payment_method || 'Cash'}
            </span>
            {expense.description && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline italic truncate max-w-xs">{expense.description}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 pl-3">
        <span className="text-base font-bold text-slate-900 dark:text-white">
          -{formatCurrency(expense.amount, currency)}
        </span>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
                title="Edit expense"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(expense)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                title="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
