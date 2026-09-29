import { isLiveSupabaseConfigured, inMemoryStore } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const BudgetModel = {
  async findByMonth(userId, monthString, supabase = null) {
    // Normalizes month to YYYY-MM-01 format
    const formattedMonth = monthString.length === 7 ? `${monthString}-01` : monthString;

    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', formattedMonth);
      if (error) throw error;
      return data || [];
    }

    return inMemoryStore.budgets.filter(
      (b) => b.user_id === userId && (b.month.startsWith(monthString.slice(0, 7)))
    );
  },

  async findById(id, userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    return inMemoryStore.budgets.find((b) => b.id === id && b.user_id === userId) || null;
  },

  async create(budgetData, supabase = null) {
    const formattedMonth = budgetData.month.length === 7 ? `${budgetData.month}-01` : budgetData.month;
    const newRecord = {
      id: uuidv4(),
      ...budgetData,
      month: formattedMonth,
      monthly_limit: Number(budgetData.monthly_limit),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .upsert([newRecord], { onConflict: 'user_id, category, month' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const existingIndex = inMemoryStore.budgets.findIndex(
      (b) => b.user_id === budgetData.user_id && b.category === budgetData.category && b.month.startsWith(formattedMonth.slice(0, 7))
    );

    if (existingIndex !== -1) {
      inMemoryStore.budgets[existingIndex] = {
        ...inMemoryStore.budgets[existingIndex],
        monthly_limit: Number(budgetData.monthly_limit),
        updated_at: new Date().toISOString(),
      };
      return inMemoryStore.budgets[existingIndex];
    }

    inMemoryStore.budgets.push(newRecord);
    return newRecord;
  },

  async update(id, userId, updates, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
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

    const index = inMemoryStore.budgets.findIndex((b) => b.id === id && b.user_id === userId);
    if (index === -1) return null;

    const updated = {
      ...inMemoryStore.budgets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (updates.monthly_limit !== undefined) updated.monthly_limit = Number(updates.monthly_limit);
    inMemoryStore.budgets[index] = updated;
    return updated;
  },

  async delete(id, userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return Boolean(data);
    }

    const index = inMemoryStore.budgets.findIndex((b) => b.id === id && b.user_id === userId);
    if (index === -1) return false;
    inMemoryStore.budgets.splice(index, 1);
    return true;
  },
};
