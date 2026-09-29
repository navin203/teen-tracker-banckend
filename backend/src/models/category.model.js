import { isLiveSupabaseConfigured, inMemoryStore } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const CategoryModel = {
  async findAll(userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    return inMemoryStore.categories.filter((c) => c.user_id === null || c.user_id === userId);
  },

  async findById(id, userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    return inMemoryStore.categories.find((c) => c.id === id && (c.user_id === null || c.user_id === userId)) || null;
  },

  async create(categoryData, supabase = null) {
    const newCategory = {
      id: uuidv4(),
      ...categoryData,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    inMemoryStore.categories.push(newCategory);
    return newCategory;
  },

  async update(id, userId, updates, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .eq('is_default', false) // Protect system defaults
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = inMemoryStore.categories.findIndex(
      (c) => c.id === id && c.user_id === userId && !c.is_default
    );
    if (index === -1) return null;

    const updated = {
      ...inMemoryStore.categories[index],
      ...updates,
    };
    inMemoryStore.categories[index] = updated;
    return updated;
  },

  async delete(id, userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .eq('is_default', false) // Protect system defaults
        .select()
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return Boolean(data);
    }

    const index = inMemoryStore.categories.findIndex(
      (c) => c.id === id && c.user_id === userId && !c.is_default
    );
    if (index === -1) return false;
    inMemoryStore.categories.splice(index, 1);
    return true;
  },
};
