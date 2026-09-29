import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const BudgetCard = ({
  category = 'Overall',
  monthlyLimit = 0,
  spent = 0,
  remaining = 0,
  percentage = 0,
  status = 'safe',
  currency = 'INR',
  onEdit = null,
}) => {
  // Determine styles by status
  let barColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
  let statusText = 'On Track';
  let StatusIcon = CheckCircle;

  if (percentage >= 100) {
    barColor = 'bg-rose-500';
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
    statusText = 'Budget Reached (100%+)';
    StatusIcon = AlertCircle;
  } else if (percentage >= 90) {
    barColor = 'bg-rose-500';
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
    statusText = '90% Used (Watch Out)';
    StatusIcon = AlertCircle;
  } else if (percentage >= 75) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    statusText = '75% Used (Keep Track)';
    StatusIcon = Info;
  } else if (percentage >= 50) {
    barColor = 'bg-blue-500';
    badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
    statusText = '50% Used (Halfway)';
    StatusIcon = Info;
  }

  const clampedPercentage = Math.min(percentage, 100);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {category} Budget
          </span>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(spent, currency)}
            <span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">
              / {formatCurrency(monthlyLimit, currency)}
            </span>
          </h4>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusText}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{percentage}% used</span>
          <span>{formatCurrency(remaining, currency)} remaining</span>
        </div>
      </div>

      {onEdit && (
        <div className="pt-1 flex justify-end">
          <button
            onClick={onEdit}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Adjust Target
          </button>
        </div>
      )}
    </div>
  );
};
