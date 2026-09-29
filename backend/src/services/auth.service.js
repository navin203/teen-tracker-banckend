import { ProfileModel } from '../models/profile.model.js';

export const AuthService = {
  async getCurrentUserProfile(userId, email, userMetadata = {}, supabase = null) {
    let profile = await ProfileModel.findById(userId, supabase);

    if (!profile) {
      profile = await ProfileModel.update(
        userId,
        {
          full_name: userMetadata.full_name || 'Teen Explorer',
          username: userMetadata.username || email?.split('@')[0] || 'teen_user',
          age_group: userMetadata.age_group || '16-17',
          currency: userMetadata.currency || 'INR',
          monthly_budget_target: 5000,
          preferred_payment_method: 'UPI',
        },
        supabase
      );
    }

    return {
      ...profile,
      email,
    };
  },

  async updateProfile(userId, updateData, supabase = null) {
    const allowedFields = ['full_name', 'username', 'age_group', 'currency', 'monthly_budget_target', 'preferred_payment_method'];
    const filteredUpdates = {};

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key];
      }
    }

    return await ProfileModel.update(userId, filteredUpdates, supabase);
  },
};
