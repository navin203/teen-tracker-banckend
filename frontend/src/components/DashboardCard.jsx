import React from 'react';

export const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge = null,
  colorScheme = 'brand', // 'brand', 'emerald', 'amber', 'rose', 'purple', 'cyan'
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-brand-500/10 dark:bg-brand-500/15',
      text: 'text-brand-600 dark:text-brand-400',
      border: 'border-brand-500/20',
      glow: 'hover:border-brand-500/40 hover:shadow-glow-brand',
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'hover:border-emerald-500/40 hover:shadow-glow-neon',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      glow: 'hover:border-amber-500/40',
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
      glow: 'hover:border-rose-500/40',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20',
      glow: 'hover:border-purple-500/40',
    },
    cyan: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/20',
      glow: 'hover:border-cyan-500/40',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.brand;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 ${scheme.glow}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          {subtitle && <span>{subtitle}</span>}
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
