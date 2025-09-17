#!/usr/bin/env node

/**
 * CollaboTree Setup Verification Script
 * This script verifies that your local setup is working correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 CollaboTree Setup Verification');
console.log('==================================\n');

let allChecksPassed = true;

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: Found`);
    return true;
  } else {
    console.log(`❌ ${description}: Missing`);
    allChecksPassed = false;
    return false;
  }
}

function checkEnvFile() {
  const envPath = path.join(__dirname, 'client', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Environment file: Missing (client/.env)');
    allChecksPassed = false;
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your_supabase_project_url')) {
    console.log('❌ Environment file: Contains placeholder values');
    console.log('   Please update client/.env with your actual Supabase credentials');
    allChecksPassed = false;
    return false;
  }

  if (!envContent.includes('VITE_SUPABASE_URL=') || !envContent.includes('VITE_SUPABASE_ANON_KEY=')) {
    console.log('❌ Environment file: Missing required variables');
    allChecksPassed = false;
    return false;
  }

  console.log('✅ Environment file: Configured correctly');
  return true;
}

function checkDependencies() {
  const rootPackageJson = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(rootPackageJson)) {
    console.log('❌ Package file: Missing (package.json)');
    allChecksPassed = false;
    return false;
  }

  const rootNodeModules = path.join(__dirname, 'node_modules');

  if (!fs.existsSync(rootNodeModules)) {
    console.log('❌ Dependencies: Not installed');
    console.log('   Run: npm install');
    allChecksPassed = false;
    return false;
  }

  console.log('✅ Dependencies: Installed');
  return true;
}

function checkDatabaseScripts() {
  const dbScript = path.join(__dirname, 'fix-supabase-complete.sql');
  const seedScript = path.join(__dirname, 'scripts', 'seed.ts');
  
  if (!fs.existsSync(dbScript)) {
    console.log('❌ Database setup script: Missing (fix-supabase-complete.sql)');
    allChecksPassed = false;
    return false;
  }

  if (!fs.existsSync(seedScript)) {
    console.log('❌ Database seed script: Missing (scripts/seed.ts)');
    allChecksPassed = false;
    return false;
  }

  console.log('✅ Database scripts: Found');
  return true;
}

function checkSetupScripts() {
  const setupScript = path.join(__dirname, 'setup-supabase-complete.js');
  const runScript = path.join(__dirname, 'run-locally.sh');
  const runScriptWin = path.join(__dirname, 'run-locally.bat');
  
  if (!fs.existsSync(setupScript)) {
    console.log('❌ Setup script: Missing (setup-supabase-complete.js)');
    allChecksPassed = false;
    return false;
  }

  if (!fs.existsSync(runScript) && !fs.existsSync(runScriptWin)) {
    console.log('❌ Run scripts: Missing (run-locally.sh or run-locally.bat)');
    allChecksPassed = false;
    return false;
  }

  console.log('✅ Setup scripts: Found');
  return true;
}

function checkDocumentation() {
  const docs = [
    'README.md',
    'LOCAL_DEVELOPMENT_GUIDE.md',
    'SUPABASE_SETUP_COMPLETE.md'
  ];

  let docsFound = 0;
  docs.forEach(doc => {
    if (fs.existsSync(path.join(__dirname, doc))) {
      docsFound++;
    }
  });

  if (docsFound === docs.length) {
    console.log('✅ Documentation: Complete');
    return true;
  } else {
    console.log(`⚠️  Documentation: ${docsFound}/${docs.length} files found`);
    return true; // Not critical
  }
}

// Run all checks
console.log('Checking setup components...\n');

checkFile('client/src/App.tsx', 'Main application file');
checkFile('client/src/lib/supabase.ts', 'Supabase client');
checkFile('client/src/lib/auth.ts', 'Authentication module');
checkFile('client/src/lib/api.ts', 'API module');
checkFile('client/src/contexts/AuthContext.tsx', 'Auth context');
checkFile('client/src/pages/SignIn.tsx', 'Sign-in page');
checkFile('vite.config.ts', 'Vite configuration');
checkFile('tailwind.config.ts', 'Tailwind configuration');

console.log('\nChecking configuration...\n');
checkEnvFile();
checkDependencies();

console.log('\nChecking database setup...\n');
checkDatabaseScripts();

console.log('\nChecking setup scripts...\n');
checkSetupScripts();

console.log('\nChecking documentation...\n');
checkDocumentation();

// Final result
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('🎉 All checks passed! Your setup is ready.');
  console.log('\nNext steps:');
  console.log('1. Run the database setup script in Supabase SQL Editor');
  console.log('2. Start the development server: cd client && npm run dev');
  console.log('3. Visit http://localhost:5173 to see your application');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  console.log('\nFor help, see:');
  console.log('- LOCAL_DEVELOPMENT_GUIDE.md');
  console.log('- SUPABASE_SETUP_COMPLETE.md');
  console.log('- README.md');
}
console.log('='.repeat(50));
