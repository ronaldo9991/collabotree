-- Fix RLS policies to work with custom authentication system
-- This script updates the RLS policies to work with our localStorage-based auth

-- First, let's create a function to get the current user ID from our custom auth
-- We'll use a session variable to store the user ID
CREATE OR REPLACE FUNCTION public.get_current_user_id() RETURNS uuid AS $$
BEGIN
  -- Try to get user ID from session variable first
  IF current_setting('app.current_user_id', true) IS NOT NULL THEN
    RETURN current_setting('app.current_user_id', true)::uuid;
  END IF;
  
  -- Fallback to public.uid() for Supabase Auth users
  RETURN public.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to set current user ID
CREATE OR REPLACE FUNCTION public.set_current_user_id(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update projects policies to use our custom function
DROP POLICY IF EXISTS "projects_owner_write" ON public.projects;
CREATE POLICY "projects_owner_write" ON public.projects
FOR ALL USING (created_by = public.get_current_user_id()) 
WITH CHECK (created_by = public.get_current_user_id());

-- Update applications policies
DROP POLICY IF EXISTS "apps_student_rw" ON public.project_applications;
CREATE POLICY "apps_student_rw" ON public.project_applications
FOR ALL USING (student_id = public.get_current_user_id()) 
WITH CHECK (student_id = public.get_current_user_id());

-- Update orders policies
DROP POLICY IF EXISTS "orders_party_read" ON public.orders;
CREATE POLICY "orders_party_read" ON public.orders
FOR SELECT USING (
  buyer_id = public.get_current_user_id() OR 
  seller_id = public.get_current_user_id() OR
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.get_current_user_id() AND u.role='admin')
);

DROP POLICY IF EXISTS "orders_party_write" ON public.orders;
CREATE POLICY "orders_party_write" ON public.orders
FOR ALL USING (
  buyer_id = public.get_current_user_id() OR 
  seller_id = public.get_current_user_id() OR
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.get_current_user_id() AND u.role='admin')
) WITH CHECK (
  buyer_id = public.get_current_user_id() OR 
  seller_id = public.get_current_user_id() OR
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.get_current_user_id() AND u.role='admin')
);

-- Update chat policies
DROP POLICY IF EXISTS "threads_party_rw" ON public.chat_threads;
CREATE POLICY "threads_party_rw" ON public.chat_threads
FOR ALL USING (
  buyer_id = public.get_current_user_id() OR 
  seller_id = public.get_current_user_id() OR
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.get_current_user_id() AND u.role='admin')
) WITH CHECK (
  buyer_id = public.get_current_user_id() OR 
  seller_id = public.get_current_user_id() OR
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.get_current_user_id() AND u.role='admin')
);

-- Update user policies
DROP POLICY IF EXISTS "users_self_rw" ON public.users;
CREATE POLICY "users_self_rw" ON public.users
FOR ALL USING (id = public.get_current_user_id()) 
WITH CHECK (id = public.get_current_user_id());

-- Update student policies
DROP POLICY IF EXISTS "students_self_rw" ON public.students;
CREATE POLICY "students_self_rw" ON public.students
FOR ALL USING (id = public.get_current_user_id()) 
WITH CHECK (id = public.get_current_user_id());

-- Update buyer policies
DROP POLICY IF EXISTS "buyers_self_rw" ON public.buyers;
CREATE POLICY "buyers_self_rw" ON public.buyers
FOR ALL USING (id = public.get_current_user_id()) 
WITH CHECK (id = public.get_current_user_id());

-- Update admin policies
DROP POLICY IF EXISTS "admin_rw" ON public.admin_actions;
CREATE POLICY "admin_rw" ON public.admin_actions
FOR ALL USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.get_current_user_id() AND u.role='admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.get_current_user_id() AND u.role='admin'));
