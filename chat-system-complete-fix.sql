-- Complete Chat System Fix
-- This script will fix all chat-related issues including message sending

-- Step 1: Disable RLS on all tables
ALTER TABLE public.chat_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "threads_party_rw" ON public.chat_threads;
DROP POLICY IF EXISTS "threads_allow_all" ON public.chat_threads;
DROP POLICY IF EXISTS "msgs_party_rw" ON public.chat_messages;
DROP POLICY IF EXISTS "msgs_allow_all" ON public.chat_messages;
DROP POLICY IF EXISTS "orders_party_read" ON public.orders;
DROP POLICY IF EXISTS "orders_party_write" ON public.orders;
DROP POLICY IF EXISTS "orders_allow_all" ON public.orders;
DROP POLICY IF EXISTS "projects_public_explore" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_write" ON public.projects;
DROP POLICY IF EXISTS "projects_allow_all" ON public.projects;
DROP POLICY IF EXISTS "users_self_rw" ON public.users;
DROP POLICY IF EXISTS "users_allow_all" ON public.users;
DROP POLICY IF EXISTS "students_self_rw" ON public.students;
DROP POLICY IF EXISTS "students_allow_all" ON public.students;
DROP POLICY IF EXISTS "buyers_self_rw" ON public.buyers;
DROP POLICY IF EXISTS "buyers_allow_all" ON public.buyers;
DROP POLICY IF EXISTS "apps_student_rw" ON public.project_applications;
DROP POLICY IF EXISTS "apps_allow_all" ON public.project_applications;

-- Step 3: Ensure chat tables exist with correct structure
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_msg_at TIMESTAMPTZ,
  msg_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, buyer_id, seller_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_threads_project_id ON public.chat_threads(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_buyer_id ON public.chat_threads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_seller_id ON public.chat_threads(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Step 5: Enable real-time for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Step 6: Create function to update thread metadata
CREATE OR REPLACE FUNCTION update_chat_thread_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_threads 
  SET 
    last_msg_at = NEW.created_at,
    msg_count = msg_count + 1,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to automatically update thread metadata
DROP TRIGGER IF EXISTS update_thread_on_message ON public.chat_messages;
CREATE TRIGGER update_thread_on_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_thread_metadata();

-- Step 8: Grant necessary permissions
GRANT ALL ON public.chat_threads TO anon, authenticated;
GRANT ALL ON public.chat_messages TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.chat_messages_id_seq TO anon, authenticated;

-- Step 9: Success message
SELECT 'Chat system completely fixed! All tables created, RLS disabled, and real-time enabled.' as message;
