import { ExpenseModel } from '../models/expense.model.js';
import { CategoryModel } from '../models/category.model.js';

export const ExpenseService = {
  async getExpenses(userId, queryParams, supabase = null) {
    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '20', 10);
    const sort = queryParams.sort || 'newest';

    const filters = {
      category: queryParams.category,
      payment_method: queryParams.payment_method,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      minAmount: queryParams.minAmount,
      maxAmount: queryParams.maxAmount,
      search: queryParams.search?.trim(),
      sort,
      page,
      limit,
    };

    const { expenses, total } = await ExpenseModel.findMany(userId, filters, supabase);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  },

  async getExpenseById(id, userId, supabase = null) {
    const expense = await ExpenseModel.findById(id, userId, supabase);
    if (!expense) {
      const error = new Error('Expense not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }
    return expense;
  },

  async createExpense(userId, expenseData, supabase = null) {
    // If category_id is missing, look up or map category
    const categories = await CategoryModel.findAll(userId, supabase);
    const matchingCategory = categories.find(
      (c) => c.name.toLowerCase() === expenseData.category.toLowerCase()
    );

    const record = {
      user_id: userId,
      title: expenseData.title.trim(),
      amount: Number(expenseData.amount),
      category: expenseData.category.trim(),
      category_id: matchingCategory ? matchingCategory.id : null,
      description: expenseData.description ? expenseData.description.trim() : '',
      expense_date: expenseData.expense_date,
      payment_method: expenseData.payment_method || 'Cash',
    };

    return await ExpenseModel.create(record, supabase);
  },

  async updateExpense(id, userId, updateData, supabase = null) {
    // Check if expense exists and belongs to user
    await this.getExpenseById(id, userId, supabase);

    const updates = {};
    if (updateData.title !== undefined) updates.title = updateData.title.trim();
    if (updateData.amount !== undefined) updates.amount = Number(updateData.amount);
    if (updateData.category !== undefined) updates.category = updateData.category.trim();
    if (updateData.description !== undefined) updates.description = updateData.description.trim();
    if (updateData.expense_date !== undefined) updates.expense_date = updateData.expense_date;
    if (updateData.payment_method !== undefined) updates.payment_method = updateData.payment_method;

    return await ExpenseModel.update(id, userId, updates, supabase);
  },

  async deleteExpense(id, userId, supabase = null) {
    await this.getExpenseById(id, userId, supabase);
    return await ExpenseModel.delete(id, userId, supabase);
  },
};
