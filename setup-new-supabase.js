// Script to help set up and test new Supabase project
import { createClient } from '@supabase/supabase-js'

// Replace these with your new Supabase project credentials
const SUPABASE_URL = 'YOUR_NEW_SUPABASE_URL_HERE'
const SUPABASE_ANON_KEY = 'YOUR_NEW_SUPABASE_ANON_KEY_HERE'

console.log('🔧 Supabase Setup Helper')
console.log('========================')

if (SUPABASE_URL === 'YOUR_NEW_SUPABASE_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_NEW_SUPABASE_ANON_KEY_HERE') {
  console.log('❌ Please update the SUPABASE_URL and SUPABASE_ANON_KEY variables in this file first!')
  console.log('')
  console.log('📋 Steps to get your credentials:')
  console.log('1. Go to https://supabase.com')
  console.log('2. Create a new project')
  console.log('3. Go to Settings → API')
  console.log('4. Copy the Project URL and anon public key')
  console.log('5. Update this file with your credentials')
  console.log('6. Run this script again')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Connection error:', error.message)
      return false
    }
    console.log('✅ Supabase connection successful!')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

async function testDatabaseTables() {
  console.log('🔍 Testing database tables...')
  try {
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.error('❌ Users table error:', usersError.message)
      return false
    }
    console.log('✅ Users table accessible')

    // Test projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)

    if (projectsError) {
      console.error('❌ Projects table error:', projectsError.message)
      return false
    }
    console.log('✅ Projects table accessible')

    return true
  } catch (err) {
    console.error('❌ Database test failed:', err.message)
    return false
  }
}

async function testSignUp() {
  console.log('🔍 Testing sign-up functionality...')
  try {
    const testEmail = `test-${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
    })

    if (error) {
      console.error('❌ Sign-up error:', error.message)
      return false
    }

    if (data.user) {
      console.log('✅ Sign-up successful!')
      console.log('   User ID:', data.user.id)
      console.log('   Email:', data.user.email)
      return true
    } else {
      console.error('❌ No user returned from sign-up')
      return false
    }
  } catch (err) {
    console.error('❌ Sign-up test failed:', err.message)
    return false
  }
}

async function runTests() {
  console.log('')
  const connectionTest = await testConnection()
  if (!connectionTest) {
    console.log('\n❌ Connection test failed. Please check your credentials.')
    return
  }

  console.log('')
  const dbTest = await testDatabaseTables()
  if (!dbTest) {
    console.log('\n❌ Database test failed. Please run the migration script first.')
    console.log('   Go to your Supabase dashboard → SQL Editor')
    console.log('   Copy and paste the content from supabase/migrations/0001_init.sql')
    console.log('   Click "Run" to create the database schema')
    return
  }

  console.log('')
  const signUpTest = await testSignUp()

  console.log('\n📊 Test Results:')
  console.log('================')
  console.log(`Connection: ${connectionTest ? '✅' : '❌'}`)
  console.log(`Database: ${dbTest ? '✅' : '❌'}`)
  console.log(`Sign-up: ${signUpTest ? '✅' : '❌'}`)

  if (connectionTest && dbTest && signUpTest) {
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Update your .env file with these credentials:')
    console.log(`   VITE_NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`)
    console.log(`   VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`)
    console.log('2. Restart your development server: npm run dev')
    console.log('3. Test sign-up and login in your application')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
  }
}

runTests()
