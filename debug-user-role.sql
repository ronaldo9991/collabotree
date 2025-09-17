-- Debug user role and data
-- Run this in your Supabase SQL Editor

-- Check all users and their roles
SELECT id, auth_id, full_name, email, role, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- Check if there are any users without proper roles
SELECT COUNT(*) as users_without_role 
FROM public.users 
WHERE role IS NULL OR role = '';

-- Success message
SELECT 'User data checked. Check the results above.' as message;
