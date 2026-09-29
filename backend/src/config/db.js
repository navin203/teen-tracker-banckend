import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const isLiveSupabaseConfigured = () => {
  return (
    Boolean(config.supabase.url) &&
    !config.supabase.url.includes('your-project-id') &&
    !config.supabase.url.includes('mock-teentrack') &&
    Boolean(config.supabase.anonKey) &&
    !config.supabase.anonKey.includes('mock')
  );
};

let adminClient = null;

if (isLiveSupabaseConfigured()) {
  try {
    adminClient = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey || config.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    logger.info('Connected to live Supabase project at ' + config.supabase.url);
  } catch (err) {
    logger.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  logger.info('Using in-memory Supabase Mock Engine for local development and testing.');
}

/**
 * Returns a user-scoped Supabase client enforcing Row Level Security (RLS)
 */
export const getUserSupabaseClient = (accessToken) => {
  if (isLiveSupabaseConfigured()) {
    return createClient(config.supabase.url, config.supabase.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return inMemoryStore;
};

/**
 * Returns the admin Supabase client (service role)
 */
export const getAdminSupabaseClient = () => {
  if (isLiveSupabaseConfigured()) {
    return adminClient;
  }
  return inMemoryStore;
};

/**
 * High-fidelity in-memory database store for local dev & testing
 * Emulates tables, foreign keys, constraints, and strict user isolation
 */
const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

const initialCategories = [
  { id: 'cat-1', user_id: null, name: 'Food', icon: 'Utensils', color: '#EF4444', is_default: true, created_at: now },
  { id: 'cat-2', user_id: null, name: 'Transport', icon: 'Bus', color: '#3B82F6', is_default: true, created_at: now },
  { id: 'cat-3', user_id: null, name: 'Education', icon: 'GraduationCap', color: '#10B981', is_default: true, created_at: now },
  { id: 'cat-4', user_id: null, name: 'Shopping', icon: 'ShoppingBag', color: '#F59E0B', is_default: true, created_at: now },
  { id: 'cat-5', user_id: null, name: 'Entertainment', icon: 'Gamepad2', color: '#8B5CF6', is_default: true, created_at: now },
  { id: 'cat-6', user_id: null, name: 'Mobile/Internet', icon: 'Smartphone', color: '#06B6D4', is_default: true, created_at: now },
  { id: 'cat-7', user_id: null, name: 'Health', icon: 'HeartPulse', color: '#EC4899', is_default: true, created_at: now },
  { id: 'cat-8', user_id: null, name: 'Bills', icon: 'Receipt', color: '#64748B', is_default: true, created_at: now },
  { id: 'cat-9', user_id: null, name: 'Other', icon: 'MoreHorizontal', color: '#94A3B8', is_default: true, created_at: now },
];

export const DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';
export const DEMO_USER_ID_B = '00000000-0000-4000-a000-000000000002';

export const inMemoryStore = {
  profiles: [
    {
      id: DEMO_USER_ID,
      full_name: 'Alex Rivera',
      username: 'alex_teen',
      age_group: '16-17',
      currency: 'INR',
      monthly_budget_target: 6000,
      preferred_payment_method: 'UPI',
      created_at: now,
      updated_at: now,
    },
    {
      id: DEMO_USER_ID_B,
      full_name: 'Sam Jordan',
      username: 'sam_j',
      age_group: '18-19',
      currency: 'INR',
      monthly_budget_target: 4000,
      preferred_payment_method: 'Cash',
      created_at: now,
      updated_at: now,
    }
  ],
  categories: [...initialCategories],
  expenses: [
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      title: 'School Canteen Lunch & Juice',
      amount: 120,
      category: 'Food',
      description: 'Lunch with school friends',
      expense_date: today,
      payment_method: 'Cash',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      title: 'Bus Pass Monthly Pass',
      amount: 450,
      category: 'Transport',
      description: 'City bus pass for school commute',
      expense_date: today,
      payment_method: 'UPI',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      title: 'Science Project Stationery',
      amount: 280,
      category: 'Education',
      description: 'Charts, pens, and scale',
      expense_date: today,
      payment_method: 'UPI',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      title: 'Cinema Weekend Movie Ticket',
      amount: 350,
      category: 'Entertainment',
      description: 'Watched latest Marvel animation',
      expense_date: today,
      payment_method: 'UPI',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      title: 'Mobile 5G Data Pack Recharge',
      amount: 299,
      category: 'Mobile/Internet',
      description: 'Monthly unlimited study data',
      expense_date: today,
      payment_method: 'UPI',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      title: 'Graphic Hoodie on Sale',
      amount: 850,
      category: 'Shopping',
      description: 'Winter thrift jacket',
      expense_date: today,
      payment_method: 'Debit Card',
      created_at: now,
      updated_at: now,
    },
    // User B expense (for isolation verification)
    {
      id: 'secret-expense-user-b',
      user_id: DEMO_USER_ID_B,
      title: "User B Secret Expense",
      amount: 999,
      category: 'Shopping',
      description: 'Belongs strictly to User B',
      expense_date: today,
      payment_method: 'Cash',
      created_at: now,
      updated_at: now,
    }
  ],
  budgets: [
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      category: 'Overall',
      monthly_limit: 6000,
      month: today.slice(0, 7) + '-01',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      category: 'Food',
      monthly_limit: 1500,
      month: today.slice(0, 7) + '-01',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      category: 'Entertainment',
      monthly_limit: 1000,
      month: today.slice(0, 7) + '-01',
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      category: 'Shopping',
      monthly_limit: 1200,
      month: today.slice(0, 7) + '-01',
      created_at: now,
      updated_at: now,
    }
  ],
  financial_goals: [
    {
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      title: 'Noise Cancelling Headphones',
      target_amount: 3500,
      current_amount: 1800,
      target_date: '2026-12-31',
      category: 'Gadgets',
      created_at: now,
      updated_at: now,
    }
  ]
};
