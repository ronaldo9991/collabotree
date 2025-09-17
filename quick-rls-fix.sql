-- Quick RLS fix - disable RLS temporarily
-- Run this in your Supabase SQL Editor

-- Disable RLS on all user-related tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS disabled successfully! User registration should now work.' as message;
