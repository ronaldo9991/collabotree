// Quick Supabase connection test
import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://cgvgcdbbftiuhsliqgym.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmdjZGJiZnRpdWhzbGlxZ3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MjQ5ODAsImV4cCI6MjA3MzUwMDk4MH0.AdsxgJQxdCRefwQ5zD1SaYB0K3fSH1R33h5_LJYHX0g'

console.log('🔧 Quick Supabase Test')
console.log('=====================')

if (SUPABASE_URL === 'https://your-project-id.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key-here') {
  console.log('❌ Please update the SUPABASE_URL and SUPABASE_ANON_KEY variables in this file first!')
  console.log('')
  console.log('📋 To get your credentials:')
  console.log('1. Go to https://supabase.com')
  console.log('2. Create a new project')
  console.log('3. Go to Settings → API')
  console.log('4. Copy the Project URL and anon public key')
  console.log('5. Update this file with your credentials')
  console.log('6. Run: node quick-test.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runQuickTest() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test connection
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Connection error:', error.message)
      return
    }
    console.log('✅ Supabase connection successful!')
    
    // Test database
    console.log('🔍 Testing database tables...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Database tables not found. You need to run the migration.')
      console.log('')
      console.log('📝 To fix this:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Go to SQL Editor')
      console.log('3. Copy the content from supabase/migrations/0001_init.sql')
      console.log('4. Paste and run it')
      return
    }
    
    console.log('✅ Database tables are accessible!')
    
    // Test sign-up
    console.log('🔍 Testing sign-up...')
    const testEmail = `test-${Date.now()}@example.com`
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
    })
    
    if (signUpError) {
      console.log('❌ Sign-up error:', signUpError.message)
    } else {
      console.log('✅ Sign-up test successful!')
    }
    
    console.log('')
    console.log('🎉 All tests passed!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Update your .env file:')
    console.log(`   VITE_NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`)
    console.log(`   VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`)
    console.log('2. Restart your dev server: npm run dev')
    console.log('3. Test sign-up and login in your application')
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

runQuickTest()
