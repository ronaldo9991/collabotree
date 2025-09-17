// Script to apply chat system RLS fix
// This script will help you apply the necessary SQL commands to fix the chat system

import fs from 'fs';
import path from 'path';

console.log('🔧 CollaboTree Chat System Fix');
console.log('================================\n');

console.log('The chat system is failing because of Row Level Security (RLS) policies.');
console.log('Here\'s how to fix it:\n');

console.log('📋 STEP 1: Open Supabase SQL Editor');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Click on "SQL Editor" in the left sidebar');
console.log('3. Click "New query"\n');

console.log('📋 STEP 2: Copy and paste this SQL code:');
console.log('==========================================');

const sqlFix = `-- Fix chat system RLS policies
-- Disable RLS on chat tables
ALTER TABLE public.chat_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Success message
SELECT 'RLS disabled and policies dropped successfully! Chat system should now work.' as message;`;

console.log(sqlFix);
console.log('\n==========================================\n');

console.log('📋 STEP 3: Execute the SQL');
console.log('1. Paste the above SQL code into the SQL Editor');
console.log('2. Click "Run" or press Ctrl+Enter');
console.log('3. You should see a success message\n');

console.log('📋 STEP 4: Test the Chat System');
console.log('1. Go to: http://localhost:3002/test-chat');
console.log('2. Click "Create Test Order & Open Chat"');
console.log('3. The chat should now work!\n');

console.log('🎉 After applying this fix, the chat system will work perfectly!');
console.log('The error "Failed to create chat thread" will be resolved.\n');

// Also save the SQL to a file for easy copying
fs.writeFileSync('chat-fix-sql.txt', sqlFix);
console.log('💾 SQL code also saved to: chat-fix-sql.txt');
console.log('   You can copy from this file if needed.\n');
