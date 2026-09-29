import { CategoryModel } from '../models/category.model.js';

export const CategoryService = {
  async getAllCategories(userId, supabase = null) {
    return await CategoryModel.findAll(userId, supabase);
  },

  async createCategory(userId, categoryData, supabase = null) {
    const existing = await CategoryModel.findAll(userId, supabase);
    const duplicate = existing.find(
      (c) => c.name.toLowerCase() === categoryData.name.trim().toLowerCase()
    );

    if (duplicate) {
      const error = new Error(`Category "${categoryData.name}" already exists`);
      error.statusCode = 409;
      throw error;
    }

    const newCategory = {
      user_id: userId,
      name: categoryData.name.trim(),
      icon: categoryData.icon || 'Tag',
      color: categoryData.color || '#6366F1',
    };

    return await CategoryModel.create(newCategory, supabase);
  },

  async updateCategory(id, userId, updates, supabase = null) {
    const category = await CategoryModel.findById(id, userId, supabase);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    if (category.is_default) {
      const error = new Error('Default system categories cannot be modified');
      error.statusCode = 403;
      throw error;
    }

    return await CategoryModel.update(id, userId, updates, supabase);
  },

  async deleteCategory(id, userId, supabase = null) {
    const category = await CategoryModel.findById(id, userId, supabase);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    if (category.is_default) {
      const error = new Error('Default system categories cannot be deleted');
      error.statusCode = 403;
      throw error;
    }

    return await CategoryModel.delete(id, userId, supabase);
  },
};
