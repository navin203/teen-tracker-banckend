import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { InsightService } from '../services/api';
import { SpendingInsight } from '../components/SpendingInsight';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Sparkles, Lightbulb, Compass, Filter, RefreshCw } from 'lucide-react';

export const InsightsPage = () => {
  const { addToast } = useToast();
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await InsightService.getInsights();
      if (res?.data) {
        setInsights(res.data.insights || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error fetching spending insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const filterOptions = ['All', 'Budget', 'Habits', 'Smart Habits', 'Food', 'Entertainment', 'Shopping'];

  const filteredInsights =
    activeFilter === 'All'
      ? insights
      : insights.filter((i) => (i.category || '').toLowerCase() === activeFilter.toLowerCase());

  if (loading && insights.length === 0) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="Analyzing your spending patterns..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-teen-purple text-white shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-100">
            Rule-Based Smart Insights
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Smart Teen Spending Guide
        </h1>
        <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
          TeenTrack analyzes your expenses to discover healthy money habits, point out unexpected increases, and share age-appropriate financial guidance.
        </p>

        {summary && (
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-white/90">
            <span>Overall Budget Health: <strong>{summary.budgetHealth}</strong></span>
            <span>•</span>
            <span>Insights Found: <strong>{summary.totalInsights}</strong></span>
          </div>
        )}
      </div>

      {/* Filter Chips & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === opt
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
          onClick={fetchInsights}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline self-end sm:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
        </button>
      </div>

      {/* Insights List */}
      {filteredInsights.length > 0 ? (
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <SpendingInsight key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="No insights for this filter"
          description="Try selecting 'All' to view all spending advice and financial tips."
        />
      )}
    </div>
  );
};
