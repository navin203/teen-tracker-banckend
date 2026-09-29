import React from 'react';
import { EmptyState } from './EmptyState';
import { BarChart3 } from 'lucide-react';

export const ChartCard = ({
  title,
  subtitle = null,
  headerAction = null,
  hasData = true,
  emptyMessage = 'Not enough data recorded to generate this visualization yet.',
  children,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      <div className="min-h-[280px] w-full flex items-center justify-center">
        {hasData ? (
          children
        ) : (
          <EmptyState
            icon={BarChart3}
            title="Awaiting Transactions"
            description={emptyMessage}
          />
        )}
      </div>
    </div>
  );
};
