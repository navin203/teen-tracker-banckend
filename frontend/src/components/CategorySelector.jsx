import React from 'react';
import {
  Utensils,
  Bus,
  GraduationCap,
  ShoppingBag,
  Gamepad2,
  Smartphone,
  HeartPulse,
  Receipt,
  MoreHorizontal,
  Tag,
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Bus,
  GraduationCap,
  ShoppingBag,
  Gamepad2,
  Smartphone,
  HeartPulse,
  Receipt,
  MoreHorizontal,
  Tag,
};

export const getCategoryIcon = (iconName) => {
  const IconComponent = ICON_MAP[iconName] || Tag;
  return IconComponent;
};

export const CategorySelector = ({
  categories = [],
  selectedCategory,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Select Category
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const Icon = getCategoryIcon(cat.icon);

          return (
            <button
              key={cat.id || cat.name}
              type="button"
              onClick={() => onSelect(cat.name)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all transform active:scale-95 ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm ring-2 ring-brand-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform"
                style={{
                  backgroundColor: isSelected ? cat.color || '#6366F1' : `${cat.color || '#6366F1'}20`,
                  color: isSelected ? '#FFFFFF' : cat.color || '#6366F1',
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-full text-[11px]">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
