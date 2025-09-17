-- Complete Supabase Fix for CollaboTree
-- This script fixes all RLS policies and ensures proper user registration flow

-- 1. First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 2. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "users_allow_insert" ON public.users;
DROP POLICY IF EXISTS "users_allow_select_own" ON public.users;
DROP POLICY IF EXISTS "users_allow_update_own" ON public.users;
DROP POLICY IF EXISTS "users_can_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_can_select_own" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own" ON public.users;

DROP POLICY IF EXISTS "students_self_select" ON public.students;
DROP POLICY IF EXISTS "students_self_upd" ON public.students;
DROP POLICY IF EXISTS "students_allow_insert" ON public.students;
DROP POLICY IF EXISTS "students_allow_select_own" ON public.students;
DROP POLICY IF EXISTS "students_allow_update_own" ON public.students;
DROP POLICY IF EXISTS "students_can_insert_own" ON public.students;
DROP POLICY IF EXISTS "students_can_select_own" ON public.students;
DROP POLICY IF EXISTS "students_can_update_own" ON public.students;

DROP POLICY IF EXISTS "buyers_self_select" ON public.buyers;
DROP POLICY IF EXISTS "buyers_self_upd" ON public.buyers;
DROP POLICY IF EXISTS "buyers_allow_insert" ON public.buyers;
DROP POLICY IF EXISTS "buyers_allow_select_own" ON public.buyers;
DROP POLICY IF EXISTS "buyers_allow_update_own" ON public.buyers;
DROP POLICY IF EXISTS "buyers_can_insert_own" ON public.buyers;
DROP POLICY IF EXISTS "buyers_can_select_own" ON public.buyers;
DROP POLICY IF EXISTS "buyers_can_update_own" ON public.buyers;

-- 3. Create proper RLS policies for users table
-- Allow anyone to insert (for registration)
CREATE POLICY "users_insert_anyone" ON public.users
  FOR INSERT WITH CHECK (true);

-- Allow users to select their own data
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Allow admins to see all users
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 4. Create proper RLS policies for students table
-- Allow anyone to insert (for registration)
CREATE POLICY "students_insert_anyone" ON public.students
  FOR INSERT WITH CHECK (true);

-- Allow users to select their own student data
CREATE POLICY "students_select_own" ON public.students
  FOR SELECT USING (
    auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id)
  );

-- Allow users to update their own student data
CREATE POLICY "students_update_own" ON public.students
  FOR UPDATE USING (
    auth.uid() = (SELECT auth_id FROM public.users WHERE id = students.id)
  );

-- Allow admins to see all students
CREATE POLICY "students_admin_all" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 5. Create proper RLS policies for buyers table
-- Allow anyone to insert (for registration)
CREATE POLICY "buyers_insert_anyone" ON public.buyers
  FOR INSERT WITH CHECK (true);

-- Allow users to select their own buyer data
CREATE POLICY "buyers_select_own" ON public.buyers
  FOR SELECT USING (
    auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id)
  );

-- Allow users to update their own buyer data
CREATE POLICY "buyers_update_own" ON public.buyers
  FOR UPDATE USING (
    auth.uid() = (SELECT auth_id FROM public.users WHERE id = buyers.id)
  );

-- Allow admins to see all buyers
CREATE POLICY "buyers_admin_all" ON public.buyers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 6. Fix projects policies
DROP POLICY IF EXISTS "projects_public_explore" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_write" ON public.projects;

-- Allow everyone to see open projects
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (status = 'open');

-- Allow project owners to manage their projects
CREATE POLICY "projects_owner_manage" ON public.projects
  FOR ALL USING (
    created_by = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Allow admins to see all projects
CREATE POLICY "projects_admin_all" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 7. Fix other table policies
DROP POLICY IF EXISTS "apps_student_rw" ON public.project_applications;
DROP POLICY IF EXISTS "apps_project_owner_read" ON public.project_applications;

-- Applications: student can manage own, project owner can read, admin can see all
CREATE POLICY "applications_student_manage" ON public.project_applications
  FOR ALL USING (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "applications_project_owner_read" ON public.project_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id 
      AND p.created_by = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "applications_admin_all" ON public.project_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 8. Fix assignments policies
DROP POLICY IF EXISTS "assign_view" ON public.project_assignments;

CREATE POLICY "assignments_party_view" ON public.project_assignments
  FOR SELECT USING (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 9. Fix orders policies
DROP POLICY IF EXISTS "orders_party_read" ON public.orders;

CREATE POLICY "orders_party_manage" ON public.orders
  FOR ALL USING (
    buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 10. Fix chat policies
DROP POLICY IF EXISTS "threads_party_rw" ON public.chat_threads;
DROP POLICY IF EXISTS "msgs_party_rw" ON public.chat_messages;
DROP POLICY IF EXISTS "receipts_self_rw" ON public.chat_read_receipts;

CREATE POLICY "threads_party_manage" ON public.chat_threads
  FOR ALL USING (
    buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "messages_party_manage" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t 
      WHERE t.id = thread_id 
      AND (
        t.buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        OR t.seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
      )
    )
  );

CREATE POLICY "receipts_self_manage" ON public.chat_read_receipts
  FOR ALL USING (
    user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- 11. Fix admin actions policy
DROP POLICY IF EXISTS "admin_rw" ON public.admin_actions;

CREATE POLICY "admin_actions_admin_only" ON public.admin_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
  );

-- 12. Create a function to get current user ID safely
CREATE OR REPLACE FUNCTION public.get_current_user_id() 
RETURNS uuid
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid();
$$;

-- 13. Success message
SELECT 'Supabase RLS policies have been completely fixed! User registration and authentication should now work properly.' as message;
