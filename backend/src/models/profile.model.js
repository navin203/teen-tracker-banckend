import { isLiveSupabaseConfigured, inMemoryStore } from '../config/db.js';

export const ProfileModel = {
  async findById(userId, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    return inMemoryStore.profiles.find((p) => p.id === userId) || null;
  },

  async update(userId, updates, supabase = null) {
    if (isLiveSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = inMemoryStore.profiles.findIndex((p) => p.id === userId);
    if (index === -1) {
      const newProfile = {
        id: userId,
        full_name: updates.full_name || 'Teen User',
        username: updates.username || 'teen_user',
        age_group: updates.age_group || '16-17',
        currency: updates.currency || 'INR',
        monthly_budget_target: updates.monthly_budget_target || 5000,
        preferred_payment_method: updates.preferred_payment_method || 'UPI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.profiles.push(newProfile);
      return newProfile;
    }

    const updated = {
      ...inMemoryStore.profiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    inMemoryStore.profiles[index] = updated;
    return updated;
  },
};
