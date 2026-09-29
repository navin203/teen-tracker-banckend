import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { getCurrencySymbol } from '../utils/formatters';

export const BudgetVsActualChart = ({ data = [], currency = 'INR' }) => {
  const symbol = getCurrencySymbol(currency);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <p className="font-bold text-slate-100">{item.category}</p>
          <p className="text-slate-400">
            Budget: <span className="text-white font-medium">{symbol}{Number(item.budget).toLocaleString()}</span>
          </p>
          <p className="text-slate-400">
            Spent: <span className="text-brand-300 font-medium">{symbol}{Number(item.actual).toLocaleString()}</span>
          </p>
          <p className={`font-semibold ${item.actual > item.budget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {item.actual > item.budget
              ? `Exceeded by ${symbol}${(item.actual - item.budget).toLocaleString()}`
              : `Remaining: ${symbol}${(item.budget - item.actual).toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
          <XAxis
            dataKey="category"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `${symbol}${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="budget" name="Budget Limit" fill="#94A3B8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="actual" name="Actual Spent" fill="#6366F1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
