#!/usr/bin/env node

/**
 * Complete Supabase Setup Script for CollaboTree
 * This script helps you set up your Supabase project with all necessary configurations
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSupabase() {
  console.log('🌳 CollaboTree Supabase Setup');
  console.log('================================\n');

  console.log('This script will help you set up your Supabase project for CollaboTree.\n');

  // Get Supabase project details
  const supabaseUrl = await question('Enter your Supabase project URL (e.g., https://your-project.supabase.co): ');
  const supabaseAnonKey = await question('Enter your Supabase anon key: ');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Both URL and anon key are required!');
    process.exit(1);
  }

  // Create .env file
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# API Configuration
VITE_API_URL=http://localhost:5000/api

# Development
VITE_APP_ENV=development
`;

  const envPath = path.join(__dirname, 'client', '.env');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with Supabase configuration');

  // Create setup instructions
  const setupInstructions = `
# CollaboTree Supabase Setup Instructions

## 1. Database Setup

Run the following SQL script in your Supabase SQL Editor:

\`\`\`sql
-- Copy and paste the contents of fix-supabase-complete.sql
\`\`\`

## 2. Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email authentication
3. Set Site URL to: http://localhost:5173 (for development)
4. Add redirect URLs:
   - http://localhost:5173/dashboard/student
   - http://localhost:5173/dashboard/buyer
   - http://localhost:5173/admin

## 3. Row Level Security (RLS)

The SQL script will set up proper RLS policies for:
- User registration and authentication
- Role-based access control
- Data isolation between users

## 4. Test the Setup

1. Start your development server: \`npm run dev\`
2. Go to http://localhost:5173/signin
3. Try registering a new user
4. Verify you're redirected to the correct dashboard based on role

## 5. Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify your .env file has the correct Supabase URL and key
3. Ensure the SQL script ran successfully in Supabase
4. Check that RLS policies are enabled on all tables

## 6. Production Setup

For production:
1. Update Site URL in Supabase Auth settings
2. Add production redirect URLs
3. Update .env with production values
4. Consider enabling additional security features

## Files Created/Modified:
- client/.env - Environment variables
- fix-supabase-complete.sql - Database setup script
- Updated authentication flow for proper role-based routing
`;

  const instructionsPath = path.join(__dirname, 'SUPABASE_SETUP_INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, setupInstructions);
  console.log('✅ Created SUPABASE_SETUP_INSTRUCTIONS.md');

  console.log('\n🎉 Setup Complete!');
  console.log('\nNext steps:');
  console.log('1. Run the SQL script in your Supabase SQL Editor');
  console.log('2. Configure authentication settings in Supabase dashboard');
  console.log('3. Start your development server: npm run dev');
  console.log('4. Test the authentication flow at http://localhost:5173/signin');
  console.log('\nFor detailed instructions, see SUPABASE_SETUP_INSTRUCTIONS.md');

  rl.close();
}

setupSupabase().catch(console.error);
