// Final test with proper email format
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cgvgcdbbftiuhsliqgym.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmdjZGJiZnRpdWhzbGlxZ3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MjQ5ODAsImV4cCI6MjA3MzUwMDk4MH0.AdsxgJQxdCRefwQ5zD1SaYB0K3fSH1R33h5_LJYHX0g'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function finalTest() {
  console.log('🎉 Final Database Test')
  console.log('======================')
  
  try {
    // Test connection
    console.log('1. Testing connection...')
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Connection error:', error.message)
      return
    }
    console.log('✅ Connection successful')
    
    // Test users table
    console.log('2. Testing users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
      return
    }
    console.log('✅ Users table accessible')
    console.log('📊 Found', users?.length || 0, 'users')
    
    // Test sign-up with proper email format
    console.log('3. Testing sign-up...')
    const testEmail = `testuser${Date.now()}@example.com`
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
    })
    
    if (signUpError) {
      console.log('❌ Sign-up error:', signUpError.message)
    } else {
      console.log('✅ Sign-up successful!')
      console.log('👤 User ID:', signUpData.user?.id)
      console.log('📧 Email:', signUpData.user?.email)
      
      // Test sign-in
      console.log('4. Testing sign-in...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'testpassword123',
      })
      
      if (signInError) {
        console.log('❌ Sign-in error:', signInError.message)
      } else {
        console.log('✅ Sign-in successful!')
        console.log('👤 Signed in user:', signInData.user?.email)
      }
    }
    
    console.log('')
    console.log('🎉 All tests completed!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Update your .env file with these credentials:')
    console.log(`   VITE_NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`)
    console.log(`   VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`)
    console.log('2. Restart your dev server: npm run dev')
    console.log('3. Test sign-up and login in your application')
    console.log('4. The "failed to fetch" error should be gone!')
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

finalTest()
