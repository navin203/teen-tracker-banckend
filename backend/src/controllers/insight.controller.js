import { InsightService } from '../services/insight.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const InsightController = {
  async getInsights(req, res, next) {
    try {
      const insights = await InsightService.generateInsights(req.user.id, req.supabase);
      return successResponse(res, insights, 'Smart spending insights generated successfully');
    } catch (error) {
      next(error);
    }
  },
};
