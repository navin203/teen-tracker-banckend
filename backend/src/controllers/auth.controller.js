import { AuthService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const AuthController = {
  async getMe(req, res, next) {
    try {
      const user = req.user;
      const profile = await AuthService.getCurrentUserProfile(
        user.id,
        user.email,
        user.user_metadata,
        req.supabase
      );
      return successResponse(res, profile, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req, res, next) {
    try {
      const user = req.user;
      const updatedProfile = await AuthService.updateProfile(user.id, req.body, req.supabase);
      return successResponse(res, updatedProfile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  },
};
