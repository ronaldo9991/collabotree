-- Complete RLS fix for user registration
-- Run this in your Supabase SQL Editor

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "users_can_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_can_select_own" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own" ON public.users;

-- Drop ALL existing policies on students table
DROP POLICY IF EXISTS "students_self_select" ON public.students;
DROP POLICY IF EXISTS "students_self_upd" ON public.students;
DROP POLICY IF EXISTS "students_can_insert_own" ON public.students;
DROP POLICY IF EXISTS "students_can_select_own" ON public.students;
DROP POLICY IF EXISTS "students_can_update_own" ON public.students;

-- Drop ALL existing policies on buyers table
DROP POLICY IF EXISTS "buyers_self_select" ON public.buyers;
DROP POLICY IF EXISTS "buyers_self_upd" ON public.buyers;
DROP POLICY IF EXISTS "buyers_can_insert_own" ON public.buyers;
DROP POLICY IF EXISTS "buyers_can_select_own" ON public.buyers;
DROP POLICY IF EXISTS "buyers_can_update_own" ON public.buyers;

-- Create new, permissive policies for users table
-- Allow anyone to insert (for registration)
CREATE POLICY "users_allow_insert" ON public.users
  FOR INSERT WITH CHECK (true);

-- Allow users to select their own data
CREATE POLICY "users_allow_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "users_allow_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Create new, permissive policies for students table
-- Allow anyone to insert (for registration)
CREATE POLICY "students_allow_insert" ON public.students
  FOR INSERT WITH CHECK (true);

-- Allow users to select their own data
CREATE POLICY "students_allow_select_own" ON public.students
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id));

-- Allow users to update their own data
CREATE POLICY "students_allow_update_own" ON public.students
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id));

-- Create new, permissive policies for buyers table
-- Allow anyone to insert (for registration)
CREATE POLICY "buyers_allow_insert" ON public.buyers
  FOR INSERT WITH CHECK (true);

-- Allow users to select their own data
CREATE POLICY "buyers_allow_select_own" ON public.buyers
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id));

-- Allow users to update their own data
CREATE POLICY "buyers_allow_update_own" ON public.buyers
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id));

-- Success message
SELECT 'RLS policies completely updated! User registration should now work.' as message;
