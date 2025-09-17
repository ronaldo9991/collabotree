-- Corrected fix for RLS policies to work with custom authentication
-- This script properly handles existing policies

-- Drop ALL existing policies on projects table first
DROP POLICY IF EXISTS "projects_public_explore" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_write" ON public.projects;
DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
DROP POLICY IF EXISTS "projects_allow_create" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_update" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_delete" ON public.projects;

-- Create new permissive policies for development
CREATE POLICY "projects_allow_all" ON public.projects
FOR ALL USING (true) WITH CHECK (true);

-- Also fix other tables that might have similar issues
DROP POLICY IF EXISTS "apps_student_rw" ON public.project_applications;
DROP POLICY IF EXISTS "apps_project_owner_read" ON public.project_applications;
DROP POLICY IF EXISTS "apps_allow_all" ON public.project_applications;
CREATE POLICY "apps_allow_all" ON public.project_applications
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_party_read" ON public.orders;
DROP POLICY IF EXISTS "orders_party_write" ON public.orders;
DROP POLICY IF EXISTS "orders_allow_all" ON public.orders;
CREATE POLICY "orders_allow_all" ON public.orders
FOR ALL USING (true) WITH CHECK (true);

-- Fix user policies
DROP POLICY IF EXISTS "users_self_rw" ON public.users;
DROP POLICY IF EXISTS "users_allow_all" ON public.users;
CREATE POLICY "users_allow_all" ON public.users
FOR ALL USING (true) WITH CHECK (true);

-- Fix student policies
DROP POLICY IF EXISTS "students_self_rw" ON public.students;
DROP POLICY IF EXISTS "students_self_upd" ON public.students;
DROP POLICY IF EXISTS "students_allow_all" ON public.students;
CREATE POLICY "students_allow_all" ON public.students
FOR ALL USING (true) WITH CHECK (true);

-- Fix buyer policies
DROP POLICY IF EXISTS "buyers_self_rw" ON public.buyers;
DROP POLICY IF EXISTS "buyers_self_upd" ON public.buyers;
DROP POLICY IF EXISTS "buyers_allow_all" ON public.buyers;
CREATE POLICY "buyers_allow_all" ON public.buyers
FOR ALL USING (true) WITH CHECK (true);

-- Fix chat policies
DROP POLICY IF EXISTS "threads_party_rw" ON public.chat_threads;
DROP POLICY IF EXISTS "threads_allow_all" ON public.chat_threads;
CREATE POLICY "threads_allow_all" ON public.chat_threads
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "msgs_party_rw" ON public.chat_messages;
DROP POLICY IF EXISTS "msgs_allow_all" ON public.chat_messages;
CREATE POLICY "msgs_allow_all" ON public.chat_messages
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "receipts_self_rw" ON public.chat_read_receipts;
DROP POLICY IF EXISTS "receipts_allow_all" ON public.chat_read_receipts;
CREATE POLICY "receipts_allow_all" ON public.chat_read_receipts
FOR ALL USING (true) WITH CHECK (true);

-- Fix admin policies
DROP POLICY IF EXISTS "admin_rw" ON public.admin_actions;
DROP POLICY IF EXISTS "admin_allow_all" ON public.admin_actions;
CREATE POLICY "admin_allow_all" ON public.admin_actions
FOR ALL USING (true) WITH CHECK (true);
