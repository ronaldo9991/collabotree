-- Create missing role-specific profiles for existing users
-- Run this in your Supabase SQL Editor

-- Create buyer profiles for users with buyer role who don't have profiles
INSERT INTO public.buyers (id, company_name, industry, budget_range)
SELECT u.id, 'My Company', 'Technology', 'Small'
FROM public.users u
LEFT JOIN public.buyers b ON u.id = b.id
WHERE u.role = 'buyer' AND b.id IS NULL;

-- Create student profiles for users with student role who don't have profiles
INSERT INTO public.students (id, university, skills, verified)
SELECT u.id, 'University', ARRAY['General'], false
FROM public.users u
LEFT JOIN public.students s ON u.id = s.id
WHERE u.role = 'student' AND s.id IS NULL;

-- Check the results
SELECT 
  u.id, 
  u.full_name, 
  u.email, 
  u.role,
  CASE 
    WHEN u.role = 'buyer' THEN 'Buyer profile exists'
    WHEN u.role = 'student' THEN 'Student profile exists'
    ELSE 'No profile needed'
  END as profile_status
FROM public.users u
ORDER BY u.created_at DESC;

-- Success message
SELECT 'Missing profiles created! Try logging in again.' as message;
