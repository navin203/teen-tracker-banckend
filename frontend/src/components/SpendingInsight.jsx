import React from 'react';
import {
  Lightbulb,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Coffee,
  Award,
  CheckCircle,
  BookOpen,
} from 'lucide-react';

const ICON_MAP = {
  Lightbulb,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Coffee,
  Award,
  CheckCircle,
  BookOpen,
};

export const SpendingInsight = ({ insight }) => {
  const Icon = ICON_MAP[insight.icon] || Lightbulb;

  const typeStyles = {
    positive: {
      border: 'border-emerald-200 dark:border-emerald-800/60',
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    },
    warning: {
      border: 'border-rose-200 dark:border-rose-800/60',
      bg: 'bg-rose-500/5 dark:bg-rose-500/10',
      iconBg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
    },
    caution: {
      border: 'border-amber-200 dark:border-amber-800/60',
      bg: 'bg-amber-500/5 dark:bg-amber-500/10',
      iconBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
    },
    education: {
      border: 'border-indigo-200 dark:border-indigo-800/60',
      bg: 'bg-indigo-500/5 dark:bg-indigo-500/10',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
    },
    info: {
      border: 'border-blue-200 dark:border-blue-800/60',
      bg: 'bg-blue-500/5 dark:bg-blue-500/10',
      iconBg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    },
  };

  const style = typeStyles[insight.type] || typeStyles.info;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 hover:shadow-sm ${style.border} ${style.bg}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {insight.title}
            </h4>
            {insight.category && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}>
                {insight.category}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {insight.message}
          </p>

          {insight.tip && (
            <div className="mt-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">Teen Smart Tip: </span>
                {insight.tip}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
