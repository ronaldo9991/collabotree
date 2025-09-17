-- Simple fix for foreign key constraint
-- Run this in your Supabase SQL Editor

-- Drop the problematic foreign key constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey;

-- Make auth_id nullable temporarily
ALTER TABLE public.users ALTER COLUMN auth_id DROP NOT NULL;

-- Success message
SELECT 'Foreign key constraint removed! User registration should now work.' as message;
