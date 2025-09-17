// Simple script to update environment variables
import fs from 'fs'
import path from 'path'

// Replace these with your actual Supabase credentials
const NEW_SUPABASE_URL = 'https://cgvgcdbbftiuhsliqgym.supabase.co'
const NEW_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmdjZGJiZnRpdWhzbGlxZ3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MjQ5ODAsImV4cCI6MjA3MzUwMDk4MH0.AdsxgJQxdCRefwQ5zD1SaYB0K3fSH1R33h5_LJYHX0g'

const envPath = path.join(process.cwd(), 'client', '.env')

console.log('🔧 Environment Variable Updater')
console.log('===============================')

if (NEW_SUPABASE_URL === 'https://your-project-id.supabase.co' || NEW_SUPABASE_KEY === 'your-anon-key-here') {
  console.log('❌ Please update the NEW_SUPABASE_URL and NEW_SUPABASE_KEY variables in this file first!')
  console.log('')
  console.log('📋 To get your credentials:')
  console.log('1. Go to https://supabase.com')
  console.log('2. Create a new project')
  console.log('3. Go to Settings → API')
  console.log('4. Copy the Project URL and anon public key')
  console.log('5. Update this file with your credentials')
  console.log('6. Run: node update-env-simple.js')
  process.exit(1)
}

try {
  // Read current .env file
  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }
  
  // Update the variables
  const lines = envContent.split('\n')
  let updated = false
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('VITE_NEXT_PUBLIC_SUPABASE_URL=')) {
      lines[i] = `VITE_NEXT_PUBLIC_SUPABASE_URL=${NEW_SUPABASE_URL}`
      updated = true
    } else if (lines[i].startsWith('VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      lines[i] = `VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEW_SUPABASE_KEY}`
      updated = true
    }
  }
  
  // If variables weren't found, add them
  if (!updated) {
    lines.push('')
    lines.push('# Supabase Configuration')
    lines.push(`VITE_NEXT_PUBLIC_SUPABASE_URL=${NEW_SUPABASE_URL}`)
    lines.push(`VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEW_SUPABASE_KEY}`)
  }
  
  // Write back to file
  fs.writeFileSync(envPath, lines.join('\n'))
  console.log('✅ Environment variables updated successfully!')
  console.log(`📁 Updated file: ${envPath}`)
  console.log('')
  console.log('📝 Next steps:')
  console.log('1. Restart your development server: npm run dev')
  console.log('2. Test sign-up and login in your application')
  
} catch (error) {
  console.error('❌ Error updating .env file:', error.message)
}
