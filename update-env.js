// Script to help update environment variables
import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), 'client', '.env')

function updateEnvFile(supabaseUrl, supabaseKey) {
  try {
    // Read current .env file
    let envContent = ''
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }
    
    // Update or add the variables
    const lines = envContent.split('\n')
    let updated = false
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('VITE_NEXT_PUBLIC_SUPABASE_URL=')) {
        lines[i] = `VITE_NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`
        updated = true
      } else if (lines[i].startsWith('VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        lines[i] = `VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`
        updated = true
      }
    }
    
    // If variables weren't found, add them
    if (!updated) {
      lines.push('')
      lines.push('# Supabase Configuration')
      lines.push(`VITE_NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`)
      lines.push(`VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`)
    }
    
    // Write back to file
    fs.writeFileSync(envPath, lines.join('\n'))
    console.log('✅ Environment variables updated successfully!')
    console.log(`📁 Updated file: ${envPath}`)
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message)
  }
}

// Example usage (you can modify this)
const exampleUrl = 'https://your-project-id.supabase.co'
const exampleKey = 'your-anon-key-here'

console.log('🔧 Environment Variable Updater')
console.log('===============================')
console.log('')
console.log('To use this script, modify the exampleUrl and exampleKey variables')
console.log('with your actual Supabase credentials, then run:')
console.log('')
console.log('node update-env.js')
console.log('')
console.log('Or manually update your client/.env file with:')
console.log(`VITE_NEXT_PUBLIC_SUPABASE_URL=${exampleUrl}`)
console.log(`VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=${exampleKey}`)

// Uncomment the line below when you have your actual credentials
// updateEnvFile(exampleUrl, exampleKey)
