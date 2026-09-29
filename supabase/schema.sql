-- ==============================================================================
-- TeenTrack – Smart Teen Expense Tracker
-- Production-Ready Supabase PostgreSQL Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE
-- Stores teen user profile details linked directly to auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    age_group TEXT DEFAULT '16-17' CHECK (age_group IN ('13-15', '16-17', '18-19', 'Young Adult')),
    currency TEXT DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY')),
    monthly_budget_target NUMERIC DEFAULT 5000 CHECK (monthly_budget_target >= 0),
    preferred_payment_method TEXT DEFAULT 'UPI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- Supports both global default categories (user_id IS NULL) and custom teen categories
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Tag',
    color TEXT NOT NULL DEFAULT '#6366F1',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_category_name UNIQUE NULLS NOT DISTINCT (user_id, name)
);

-- ==============================================================================
-- 3. EXPENSES TABLE
-- Stores daily teen transactions with amount validation and category relation
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 100),
    amount NUMERIC NOT NULL CHECK (amount > 0 AND amount <= 1000000),
    category TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT CHECK (char_length(description) <= 500),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'UPI', 'Debit Card', 'Credit Card', 'Pocket Money', 'Other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. BUDGETS TABLE
-- Stores monthly limits for overall spending and specific categories
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'Overall' or specific category name
    monthly_limit NUMERIC NOT NULL CHECK (monthly_limit > 0 AND monthly_limit <= 10000000),
    month DATE NOT NULL, -- First day of month (e.g. 2026-09-01)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_category_month UNIQUE (user_id, category, month)
);

-- ==============================================================================
-- 5. FINANCIAL GOALS TABLE (SAVINGS & WISHLIST)
-- Helps teens set goal targets (e.g., saving for new sneakers or a tech gadget)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 100),
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    category TEXT DEFAULT 'Savings',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 6. PERFORMANCE INDEXES
-- Optimizes queries for dashboard, filtering, analytics, and date ranges
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.financial_goals(user_id);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: No user can ever read, insert, update, or delete another's data
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- --- CATEGORIES POLICIES ---
-- Users can see system default categories (user_id IS NULL) OR their own custom categories
DROP POLICY IF EXISTS "Users can view default and their own categories" ON public.categories;
CREATE POLICY "Users can view default and their own categories" 
ON public.categories FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
CREATE POLICY "Users can insert their own categories" 
ON public.categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own custom categories" ON public.categories;
CREATE POLICY "Users can update their own custom categories" 
ON public.categories FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own custom categories" ON public.categories;
CREATE POLICY "Users can delete their own custom categories" 
ON public.categories FOR DELETE 
USING (auth.uid() = user_id AND is_default = FALSE);

-- --- EXPENSES POLICIES ---
DROP POLICY IF EXISTS "Users can view only their own expenses" ON public.expenses;
CREATE POLICY "Users can view only their own expenses" 
ON public.expenses FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert only their own expenses" ON public.expenses;
CREATE POLICY "Users can insert only their own expenses" 
ON public.expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update only their own expenses" ON public.expenses;
CREATE POLICY "Users can update only their own expenses" 
ON public.expenses FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete only their own expenses" ON public.expenses;
CREATE POLICY "Users can delete only their own expenses" 
ON public.expenses FOR DELETE 
USING (auth.uid() = user_id);

-- --- BUDGETS POLICIES ---
DROP POLICY IF EXISTS "Users can view only their own budgets" ON public.budgets;
CREATE POLICY "Users can view only their own budgets" 
ON public.budgets FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert only their own budgets" ON public.budgets;
CREATE POLICY "Users can insert only their own budgets" 
ON public.budgets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update only their own budgets" ON public.budgets;
CREATE POLICY "Users can update only their own budgets" 
ON public.budgets FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete only their own budgets" ON public.budgets;
CREATE POLICY "Users can delete only their own budgets" 
ON public.budgets FOR DELETE 
USING (auth.uid() = user_id);

-- --- FINANCIAL GOALS POLICIES ---
DROP POLICY IF EXISTS "Users can view only their own goals" ON public.financial_goals;
CREATE POLICY "Users can view only their own goals" 
ON public.financial_goals FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert only their own goals" ON public.financial_goals;
CREATE POLICY "Users can insert only their own goals" 
ON public.financial_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update only their own goals" ON public.financial_goals;
CREATE POLICY "Users can update only their own goals" 
ON public.financial_goals FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete only their own goals" ON public.financial_goals;
CREATE POLICY "Users can delete only their own goals" 
ON public.financial_goals FOR DELETE 
USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- Automatically creates a profile record when a user signs up via Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, age_group, currency, monthly_budget_target)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Teen Explorer'),
    COALESCE(NEW.raw_user_meta_data->>'username', LOWER(SPLIT_PART(NEW.email, '@', 1))),
    COALESCE(NEW.raw_user_meta_data->>'age_group', '16-17'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'INR'),
    COALESCE((NEW.raw_user_meta_data->>'monthly_budget_target')::NUMERIC, 5000)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. DEFAULT SEED CATEGORIES
-- Inserts system default categories accessible by all teens
-- ==============================================================================
INSERT INTO public.categories (user_id, name, icon, color, is_default)
VALUES 
    (NULL, 'Food', 'Utensils', '#EF4444', TRUE),
    (NULL, 'Transport', 'Bus', '#3B82F6', TRUE),
    (NULL, 'Education', 'GraduationCap', '#10B981', TRUE),
    (NULL, 'Shopping', 'ShoppingBag', '#F59E0B', TRUE),
    (NULL, 'Entertainment', 'Gamepad2', '#8B5CF6', TRUE),
    (NULL, 'Mobile/Internet', 'Smartphone', '#06B6D4', TRUE),
    (NULL, 'Health', 'HeartPulse', '#EC4899', TRUE),
    (NULL, 'Bills', 'Receipt', '#64748B', TRUE),
    (NULL, 'Other', 'MoreHorizontal', '#94A3B8', TRUE)
ON CONFLICT DO NOTHING;
