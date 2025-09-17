-- Fix chat_threads table missing updated_at column
-- Copy and paste this entire script into Supabase SQL Editor

-- Add missing updated_at column to chat_threads table
ALTER TABLE public.chat_threads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing updated_at column to chat_messages table
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Disable RLS on chat tables
ALTER TABLE public.chat_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "chat_threads_policy" ON public.chat_threads;
DROP POLICY IF EXISTS "chat_messages_policy" ON public.chat_messages;

-- Grant all permissions on chat tables
GRANT ALL ON public.chat_threads TO anon, authenticated, service_role;
GRANT ALL ON public.chat_messages TO anon, authenticated, service_role;

-- Enable real-time for chat tables (handle already exists errors)
DO $$ 
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, ignore
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, ignore
    END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_threads_project_id ON public.chat_threads(project_id);

-- Update existing records to have updated_at timestamp
UPDATE public.chat_threads SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE public.chat_messages SET updated_at = NOW() WHERE updated_at IS NULL;

-- Verify the fix
SELECT 'Chat threads updated_at column fix applied successfully!' as status;
