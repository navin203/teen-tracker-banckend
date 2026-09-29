import React from 'react';
import { ExpenseItem } from './ExpenseItem';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import { Receipt } from 'lucide-react';

export const ExpenseList = ({
  expenses = [],
  currency = 'INR',
  loading = false,
  onEdit = null,
  onDelete = null,
  onAddExpense = null,
}) => {
  if (loading) {
    return <LoadingSpinner text="Fetching your expenses..." />;
  }

  if (!expenses || expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses recorded"
        description="You have no expenses recorded for this filter. Tap the button below to add your first expense!"
        actionText={onAddExpense ? "Add Expense" : null}
        onAction={onAddExpense}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          currency={currency}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
