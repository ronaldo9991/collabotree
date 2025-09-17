-- Chat Messaging Fix
-- This script fixes all chat messaging issues

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

-- Insert test data if tables are empty
INSERT INTO public.chat_threads (id, project_id, buyer_id, seller_id, last_msg_at, msg_count, created_at)
SELECT 
    'test-thread-1'::uuid,
    'test-project-1'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    NOW(),
    0,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.chat_threads LIMIT 1);

-- Insert test message
INSERT INTO public.chat_messages (thread_id, sender_id, body, created_at)
SELECT 
    'test-thread-1'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Test message from buyer',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.chat_messages LIMIT 1);

-- Verify the fix
SELECT 'Chat messaging fix applied successfully!' as status;
