-- Simple CollaboTree Database Schema
-- Run this in your Supabase SQL Editor

-- 1) USERS table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student','buyer','admin')),
  created_at timestamptz DEFAULT now()
);

-- 2) STUDENTS table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  university text,
  skills text[],
  verified boolean DEFAULT false,
  id_card_url text
);

-- 3) BUYERS table
CREATE TABLE IF NOT EXISTS public.buyers (
  id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  industry text,
  budget_range text
);

-- 4) PROJECTS table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  owner_role text NOT NULL CHECK (owner_role IN ('student','buyer')),
  budget numeric,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','archived')),
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- 5) Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 6) Basic RLS policies
-- Users can see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Students can see their own data
CREATE POLICY "Students can view own data" ON public.students
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id));

CREATE POLICY "Students can update own data" ON public.students
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id));

-- Buyers can see their own data
CREATE POLICY "Buyers can view own data" ON public.buyers
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id));

CREATE POLICY "Buyers can update own data" ON public.buyers
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id));

-- Projects are public for viewing
CREATE POLICY "Projects are public for viewing" ON public.projects
  FOR SELECT USING (true);

-- Projects can be created by authenticated users
CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Projects can be updated by their creators
CREATE POLICY "Project creators can update" ON public.projects
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = created_by));

-- 7) Helper function
CREATE OR REPLACE FUNCTION public.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT auth.uid()
$$;

-- 8) Insert test data (optional)
INSERT INTO public.users (auth_id, full_name, email, role) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Test User', 'test@example.com', 'buyer')
ON CONFLICT (email) DO NOTHING;

-- 9) Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users (auth_id);

-- Success message
SELECT 'Database schema created successfully!' as message;
