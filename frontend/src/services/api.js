import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teentrack_token') || 'demo-token';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors?.length ? error.response.data.errors[0].message : null) ||
      error.message ||
      'Network or server error';

    const customError = new Error(message);
    customError.status = error.response?.status || 500;
    customError.data = error.response?.data || null;
    return Promise.reject(customError);
  }
);

// --- API Service Methods ---

export const AuthService = {
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/me', data),
};

export const ExpenseService = {
  getExpenses: (params) => apiClient.get('/expenses', { params }),
  getExpenseById: (id) => apiClient.get(`/expenses/${id}`),
  createExpense: (data) => apiClient.post('/expenses', data),
  updateExpense: (id, data) => apiClient.put(`/expenses/${id}`, data),
  deleteExpense: (id) => apiClient.delete(`/expenses/${id}`),
};

export const BudgetService = {
  getBudgets: (month) => apiClient.get('/budgets', { params: { month } }),
  createBudget: (data) => apiClient.post('/budgets', data),
  updateBudget: (id, data) => apiClient.put(`/budgets/${id}`, data),
  deleteBudget: (id) => apiClient.delete(`/budgets/${id}`),
};

export const CategoryService = {
  getCategories: () => apiClient.get('/categories'),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),
};

export const AnalyticsService = {
  getSummary: () => apiClient.get('/analytics/summary'),
  getCategoriesBreakdown: (month) => apiClient.get('/analytics/categories', { params: { month } }),
  getMonthlyTrend: (year) => apiClient.get('/analytics/monthly', { params: { year } }),
  getDailyTrend: (month) => apiClient.get('/analytics/daily', { params: { month } }),
  getBudgetVsActual: (month) => apiClient.get('/analytics/budget-vs-actual', { params: { month } }),
};

export const InsightService = {
  getInsights: () => apiClient.get('/insights'),
};
