import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  PiggyBank,
  BarChart3,
  Lightbulb,
  User,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Add Expense', path: '/add-expense', icon: PlusCircle },
  { name: 'Budget & Goals', path: '/budget', icon: PiggyBank },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Smart Insights', path: '/insights', icon: Lightbulb, highlight: true },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 h-full md:h-[calc(100vh-4rem)] w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-extrabold text-brand-600 dark:text-brand-400">Navigation</span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teen-purple opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teen-purple"></span>
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Banner */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-slate-900 dark:to-brand-950/40 border border-brand-200/50 dark:border-brand-900/40">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Teen Money Tip</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Record every snack and bus ride! Small expenses add up without you noticing.
          </p>
        </div>
      </aside>
    </>
  );
};
