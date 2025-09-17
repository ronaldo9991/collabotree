-- Fix foreign key constraint issue
-- Run this in your Supabase SQL Editor

-- First, let's check the current foreign key constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='users';

-- Drop the problematic foreign key constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey;

-- Recreate the foreign key constraint with proper settings
ALTER TABLE public.users 
ADD CONSTRAINT users_auth_id_fkey 
FOREIGN KEY (auth_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Also make sure the auth_id column allows NULL values temporarily
ALTER TABLE public.users ALTER COLUMN auth_id DROP NOT NULL;

-- Success message
SELECT 'Foreign key constraint fixed! User registration should now work.' as message;
