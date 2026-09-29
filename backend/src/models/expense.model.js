import { isLiveSupabaseConfigured, inMemoryStore } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const ExpenseModel = {
  /**
   * Find expenses for an authenticated user with filtering, sorting, and pagination
   */
  async findMany(userId, filters = {}, supabase = null) {
    const {
      category,
      payment_method,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = filters;

    if (isLiveSupabaseConfigured() && supabase) {
      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (category && category !== 'All') query = query.eq('category', category);
      if (payment_method && payment_method !== 'All') query = query.eq('payment_method', payment_method);
      if (startDate) query = query.gte('expense_date', startDate);
      if (endDate) query = query.lte('expense_date', endDate);
      if (minAmount !== undefined) query = query.gte('amount', minAmount);
      if (maxAmount !== undefined) query = query.lte('amount', maxAmount);
      if (search) query = query.ilike('title', `%${search}%`);

      if (sort === 'oldest') query = query.order('expense_date', { ascending: true });
      else if (sort === 'highest') query = query.order('amount', { ascending: false });
      else if (sort === 'lowest') query = query.order('amount', { ascending: true });
      else query = query.order('expense_date', { ascending: false }).order('created_at', { ascending: false });

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      return { expenses: data || [], total: count || 0, page, limit };
    }

    // In-memory store fallback with strict user isolation
    let results = inMemoryStore.expenses.filter((e) => e.user_id === userId);

    if (category && category !== 'All') {
      results = results.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }
    if (payment_method && payment_method !== 'All') {
      results = results.filter((e) => e.payment_method === payment_method);
    }
    if (startDate) {
      results = results.filter((e) => e.expense_date >= startDate);
    }
    if (endDate) {
      results = results.filter((e) => e.expense_date <= endDate);
    }
    if (minAmount !== undefined) {
      results = results.filter((e) => Number(e.amount) >= Number(minAmount));
    }
    if (maxAmount !== undefined) {
      results = results.filter((e) => Number(e.amount) <= Number(maxAmount));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((e) => e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q)));
    }

    // Sort
    if (sort === 'oldest') {
      results.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date));
    } else if (sort === 'highest') {
      results.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else if (sort === 'lowest') {
      results.sort((a, b) => Number(a.amount) - Number(b.amount));
    } else {
      // Default: newest
      results.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date) || new Date(b.created_at) - new Date(a.created_at));
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return { expenses: paginated, total, page, limit };
  },

  /**
   * Find single expense ensuring user ownership
   */
  async findById(id, userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    // Strict user isolation check in mock store
    return inMemoryStore.expenses.find((e) => e.id === id && e.user_id === userId) || null;
  },

  /**
   * Insert expense for user
   */
  async create(expenseData, supabase = null) {
    const newRecord = {
      id: uuidv4(),
      ...expenseData,
      amount: Number(expenseData.amount),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newRecord])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    inMemoryStore.expenses.unshift(newRecord);
    return newRecord;
  },

  /**
   * Update expense ensuring user ownership
   */
  async update(id, userId, updates, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = inMemoryStore.expenses.findIndex((e) => e.id === id && e.user_id === userId);
    if (index === -1) return null;

    const updated = {
      ...inMemoryStore.expenses[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (updates.amount !== undefined) updated.amount = Number(updates.amount);
    inMemoryStore.expenses[index] = updated;
    return updated;
  },

  /**
   * Delete expense ensuring user ownership
   */
  async delete(id, userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return Boolean(data);
    }

    const index = inMemoryStore.expenses.findIndex((e) => e.id === id && e.user_id === userId);
    if (index === -1) return false;
    inMemoryStore.expenses.splice(index, 1);
    return true;
  },

  /**
   * Retrieve all expenses of a user within a date range (for analytics / insights)
   */
  async getByDateRange(userId, startDate, endDate, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      if (startDate) query = query.gte('expense_date', startDate);
      if (endDate) query = query.lte('expense_date', endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    return inMemoryStore.expenses.filter((e) => {
      if (e.user_id !== userId) return false;
      if (startDate && e.expense_date < startDate) return false;
      if (endDate && e.expense_date > endDate) return false;
      return true;
    });
  },
};
