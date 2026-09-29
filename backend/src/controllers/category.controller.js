import { CategoryService } from '../services/category.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const CategoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories(req.user.id, req.supabase);
      return successResponse(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.user.id, req.body, req.supabase);
      return successResponse(res, category, 'Custom category created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const updated = await CategoryService.updateCategory(req.params.id, req.user.id, req.body, req.supabase);
      return successResponse(res, updated, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      await CategoryService.deleteCategory(req.params.id, req.user.id, req.supabase);
      return successResponse(res, { id: req.params.id }, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
