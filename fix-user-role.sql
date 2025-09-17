-- Fix user role issue
-- Run this in your Supabase SQL Editor

-- Update any users without proper roles
UPDATE public.users 
SET role = 'buyer' 
WHERE role IS NULL OR role = '';

-- Check the results
SELECT id, full_name, email, role 
FROM public.users 
ORDER BY created_at DESC;

-- Success message
SELECT 'User roles updated! Try logging in again.' as message;
