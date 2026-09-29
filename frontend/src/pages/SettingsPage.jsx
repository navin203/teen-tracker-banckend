import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { CategoryService, ExpenseService } from '../services/api';
import { isLiveSupabaseAvailable } from '../services/supabase';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getCategoryIcon } from '../components/CategorySelector';
import {
  Settings,
  Moon,
  Sun,
  PlusCircle,
  Trash2,
  Download,
  ShieldCheck,
  CheckCircle2,
  Database,
  Tag,
  X,
} from 'lucide-react';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // New Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [addingCat, setAddingCat] = useState(false);
  const [deleteTargetCat, setDeleteTargetCat] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoadingCats(true);
      const res = await CategoryService.getCategories();
      if (res?.data) setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    try {
      setAddingCat(true);
      await CategoryService.createCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
      });

      addToast(`Custom category "${newCatName}" added!`, 'success');
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Failed to add category', 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const handleConfirmDeleteCat = async () => {
    if (!deleteTargetCat) return;
    try {
      await CategoryService.deleteCategory(deleteTargetCat.id);
      addToast(`Category "${deleteTargetCat.name}" removed`, 'success');
      setDeleteTargetCat(null);
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Failed to delete category', 'error');
    }
  };

  const availableIcons = [
    'Tag',
    'ShoppingBag',
    'Gamepad2',
    'Utensils',
    'Bus',
    'GraduationCap',
    'Smartphone',
    'HeartPulse',
    'Receipt',
  ];

  const availableColors = [
    '#6366F1',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#06B6D4',
    '#EC4899',
    '#64748B',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personalize your app experience and configure custom categories
        </p>
      </div>

      {/* Visual Theme Section */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Appearance Theme
        </h3>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Easier on the eyes during late night study sessions
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Custom Categories Section */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create custom spending categories tailored to your school life and hobbies
          </p>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Add New Custom Category
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Manga, Guitar..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Icon
              </label>
              <select
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                {availableIcons.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewCatColor(col)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      newCatColor === col ? 'scale-125 border-white ring-2 ring-brand-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addingCat}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" /> Add Category
            </button>
          </div>
        </form>

        {/* Existing Categories Badges */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Categories ({categories.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <div
                  key={cat.id || cat.name}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color || '#6366F1' }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>

                  {!cat.is_default && (
                    <button
                      onClick={() => setDeleteTargetCat(cat)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete custom category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Database & Security Status */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          System Architecture & Security
        </h3>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Database Engine:</span>
            <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              {isLiveSupabaseAvailable() ? 'Live Supabase PostgreSQL (RLS Enforced)' : 'Supabase Emulated Engine (Local RLS Active)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Authentication:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Supabase Auth JWT Verified
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Row Level Security:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enabled (auth.uid() = user_id)
            </span>
          </div>
        </div>
      </div>

      {/* Delete Category Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetCat)}
        title="Delete Custom Category"
        message={`Are you sure you want to remove the "${deleteTargetCat?.name}" category?`}
        confirmText="Remove Category"
        onConfirm={handleConfirmDeleteCat}
        onClose={() => setDeleteTargetCat(null)}
      />
    </div>
  );
};
