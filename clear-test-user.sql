-- Clear test user data
-- Run this in your Supabase SQL Editor

-- Delete the test user from users table
DELETE FROM public.users WHERE email = 'ronaldodavid1600@gmail.com';

-- Also delete from auth.users if it exists
DELETE FROM auth.users WHERE email = 'ronaldodavid1600@gmail.com';

-- Success message
SELECT 'Test user cleared! You can now register with the same email.' as message;
