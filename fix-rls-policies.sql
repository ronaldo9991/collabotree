-- Fix RLS policies to allow user registration
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;

-- Create new policies that allow registration
-- Allow users to insert their own data (for registration)
CREATE POLICY "users_can_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Allow users to select their own data
CREATE POLICY "users_can_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "users_can_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Also allow users to insert into students table during registration
DROP POLICY IF EXISTS "students_self_select" ON public.students;
DROP POLICY IF EXISTS "students_self_upd" ON public.students;

CREATE POLICY "students_can_insert_own" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id));

CREATE POLICY "students_can_select_own" ON public.students
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id));

CREATE POLICY "students_can_update_own" ON public.students
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id));

-- Also allow users to insert into buyers table during registration
DROP POLICY IF EXISTS "buyers_self_select" ON public.buyers;
DROP POLICY IF EXISTS "buyers_self_upd" ON public.buyers;

CREATE POLICY "buyers_can_insert_own" ON public.buyers
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id));

CREATE POLICY "buyers_can_select_own" ON public.buyers
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id));

CREATE POLICY "buyers_can_update_own" ON public.buyers
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id));

-- Success message
SELECT 'RLS policies updated successfully! User registration should now work.' as message;
