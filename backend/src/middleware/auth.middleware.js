import { getAdminSupabaseClient, getUserSupabaseClient, isLiveSupabaseConfigured, DEMO_USER_ID, inMemoryStore } from '../config/db.js';
import { errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware verifying Supabase Auth JWT
 * Extracts authenticated user context and binds user-scoped Supabase client
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization token missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Access token is required', 401);
    }

    // Check for test/demo mode bypass or development token
    const testUserId = req.headers['x-test-user-id'];

    if (isLiveSupabaseConfigured()) {
      const admin = getAdminSupabaseClient();
      const { data: { user }, error } = await admin.auth.getUser(token);

      if (error || !user) {
        logger.warn(`Invalid Supabase JWT token: ${error?.message || 'User not found'}`);
        return errorResponse(res, 'Invalid or expired session. Please log in again.', 401);
      }

      req.user = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {},
      };
      req.supabase = getUserSupabaseClient(token);
      return next();
    }

    // Mock/Demo Mode Fallback for instantaneous local run & evaluation
    if (token === 'demo-token' || token.startsWith('demo-') || process.env.NODE_ENV === 'test' || !isLiveSupabaseConfigured()) {
      const userId = testUserId || (token.includes('user-b') ? '00000000-0000-4000-a000-000000000002' : DEMO_USER_ID);
      const profile = inMemoryStore.profiles.find((p) => p.id === userId) || {
        id: userId,
        full_name: 'Teen Explorer',
        username: 'teen_user',
        currency: 'INR',
      };

      req.user = {
        id: userId,
        email: `${profile.username || 'teen'}@teentrack.dev`,
        user_metadata: {
          full_name: profile.full_name,
          username: profile.username,
        },
      };
      req.supabase = getUserSupabaseClient(token);
      return next();
    }

    return errorResponse(res, 'Invalid session', 401);
  } catch (error) {
    logger.error('Authentication middleware unexpected error:', error.message);
    return errorResponse(res, 'Internal authentication verification error', 500);
  }
};
