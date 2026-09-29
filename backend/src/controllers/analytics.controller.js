import { AnalyticsService } from '../services/analytics.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const AnalyticsController = {
  async getSummary(req, res, next) {
    try {
      const summary = await AnalyticsService.getDashboardSummary(req.user.id, req.supabase);
      return successResponse(res, summary, 'Dashboard summary calculated successfully');
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req, res, next) {
    try {
      const month = req.query.month;
      const breakdown = await AnalyticsService.getCategoryBreakdown(req.user.id, month, req.supabase);
      return successResponse(res, breakdown, 'Category spending breakdown retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getMonthly(req, res, next) {
    try {
      const year = req.query.year;
      const monthly = await AnalyticsService.getMonthlyTrend(req.user.id, year, req.supabase);
      return successResponse(res, monthly, 'Monthly spending trend retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getDaily(req, res, next) {
    try {
      const month = req.query.month;
      const daily = await AnalyticsService.getDailyTrend(req.user.id, month, req.supabase);
      return successResponse(res, daily, 'Daily spending trend retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getBudgetVsActual(req, res, next) {
    try {
      const month = req.query.month;
      const comparison = await AnalyticsService.getBudgetVsActual(req.user.id, month, req.supabase);
      return successResponse(res, comparison, 'Budget vs actual spending retrieved');
    } catch (error) {
      next(error);
    }
  },
};
