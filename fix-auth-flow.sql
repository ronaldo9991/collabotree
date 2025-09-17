-- Fix authentication flow issues
-- Run this in your Supabase SQL Editor

-- 1. Check current user data
SELECT 
  u.id, 
  u.full_name, 
  u.email, 
  u.role,
  u.auth_id,
  CASE 
    WHEN u.role = 'buyer' AND b.id IS NOT NULL THEN 'Buyer profile exists'
    WHEN u.role = 'student' AND s.id IS NOT NULL THEN 'Student profile exists'
    WHEN u.role = 'buyer' AND b.id IS NULL THEN 'Missing buyer profile'
    WHEN u.role = 'student' AND s.id IS NULL THEN 'Missing student profile'
    ELSE 'Unknown role'
  END as profile_status
FROM public.users u
LEFT JOIN public.buyers b ON u.id = b.id
LEFT JOIN public.students s ON u.id = s.id
ORDER BY u.created_at DESC;

-- 2. Create missing buyer profiles
INSERT INTO public.buyers (id, company_name, industry, budget_range)
SELECT u.id, 'My Company', 'Technology', 'Small'
FROM public.users u
LEFT JOIN public.buyers b ON u.id = b.id
WHERE u.role = 'buyer' AND b.id IS NULL;

-- 3. Create missing student profiles
INSERT INTO public.students (id, university, skills, verified)
SELECT u.id, 'University', ARRAY['General'], false
FROM public.users u
LEFT JOIN public.students s ON u.id = s.id
WHERE u.role = 'student' AND s.id IS NULL;

-- 4. Verify all users have proper profiles
SELECT 
  u.id, 
  u.full_name, 
  u.email, 
  u.role,
  CASE 
    WHEN u.role = 'buyer' AND b.id IS NOT NULL THEN '✅ Buyer profile exists'
    WHEN u.role = 'student' AND s.id IS NOT NULL THEN '✅ Student profile exists'
    ELSE '❌ Missing profile'
  END as profile_status
FROM public.users u
LEFT JOIN public.buyers b ON u.id = b.id
LEFT JOIN public.students s ON u.id = s.id
ORDER BY u.created_at DESC;

-- Success message
SELECT 'Authentication flow fixed! All users now have proper profiles.' as message;
