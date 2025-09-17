-- Temporarily disable RLS for testing
-- Run this in your Supabase SQL Editor

-- Disable RLS on users table temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on students table temporarily
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-- Disable RLS on buyers table temporarily
ALTER TABLE public.buyers DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS temporarily disabled for testing. User registration should now work.' as message;
