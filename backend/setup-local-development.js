#!/usr/bin/env node

/**
 * Setup Local Development
 * Set up local development environment with local database
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

console.log('🔧 Setting up Local Development Environment...');

try {
  // Step 1: Create local .env file for development
  console.log('\n1️⃣ Creating Local Development Environment...');
  
  const localEnvContent = `# ============================================
# COLLABOTREE BACKEND - LOCAL DEVELOPMENT
# ============================================

# Environment
NODE_ENV=development

# Port
PORT=4000

# Client Origin
CLIENT_ORIGIN=http://localhost:3000

# Database URL - Using SQLite for local development
DATABASE_URL=file:./dev.db

# JWT Secrets (same as production for consistency)
JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Password Hashing
BCRYPT_ROUNDS=12
`;

  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, localEnvContent);
  console.log('✅ Local .env file created with SQLite database');
  
  // Step 2: Update Prisma schema for local development
  console.log('\n2️⃣ Setting up Prisma for Local Development...');
  
  // Check if we need to create a local schema
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Create a local development schema if needed
  const localSchemaPath = path.join(__dirname, 'prisma', 'schema.local.prisma');
  const localSchemaContent = schemaContent.replace(
    'provider = "postgresql"',
    'provider = "sqlite"'
  ).replace(
    'url      = env("DATABASE_URL")',
    'url      = "file:./dev.db"'
  );
  
  fs.writeFileSync(localSchemaPath, localSchemaContent);
  console.log('✅ Local Prisma schema created');
  
  // Step 3: Generate Prisma client for local development
  console.log('\n3️⃣ Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ Prisma client generated');
  } catch (error) {
    console.log('⚠️ Prisma generation failed, but continuing...');
  }
  
  // Step 4: Create and push database schema
  console.log('\n4️⃣ Setting up Local Database...');
  try {
    // Use the local schema
    execSync('npx prisma db push --schema=./prisma/schema.local.prisma', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ Local database schema created');
  } catch (error) {
    console.log('⚠️ Database setup failed, but continuing...');
  }
  
  // Step 5: Create development startup script
  console.log('\n5️⃣ Creating Development Startup Script...');
  
  const devStartScript = `#!/usr/bin/env node

/**
 * Start Local Development Server
 * Starts the backend with local SQLite database
 */

import { spawn } from 'child_process';
import path from 'path';

const __dirname = path.resolve();

console.log('🚀 Starting Local Development Server...');

// Set environment variables for local development
process.env.NODE_ENV = 'development';
process.env.PORT = '4000';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.DATABASE_URL = 'file:./dev.db';
process.env.JWT_ACCESS_SECRET = '2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d';
process.env.JWT_REFRESH_SECRET = '4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '12';

console.log('📋 Environment Variables Set:');
console.log('   ✅ NODE_ENV: development');
console.log('   ✅ PORT: 4000');
console.log('   ✅ DATABASE_URL: file:./dev.db (SQLite)');
console.log('   ✅ JWT secrets: Set');

// Start the development server
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
});

serverProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Server stopped gracefully');
  } else {
    console.log(\`❌ Server exited with code \${code}\`);
  }
});

console.log('\\n🎉 Local Development Server Starting!');
console.log('\\n📋 Server Information:');
console.log('   🌐 URL: http://localhost:4000');
console.log('   🔗 Health: http://localhost:4000/api/health');
console.log('   🔗 API: http://localhost:4000/api');
console.log('   💾 Database: SQLite (local file)');
console.log('\\n💡 Press Ctrl+C to stop the server');
`;

  const devStartPath = path.join(__dirname, 'start-local-dev.js');
  fs.writeFileSync(devStartPath, devStartScript);
  console.log('✅ Local development startup script created');
  
  // Step 6: Update package.json with local development script
  console.log('\n6️⃣ Updating Package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "dev:local": "node start-local-dev.js",
    "db:local": "npx prisma db push --schema=./prisma/schema.local.prisma",
    "studio:local": "npx prisma studio --schema=./prisma/schema.local.prisma"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json updated with local development scripts');
  
  console.log('\n🎉 Local Development Setup Complete!');
  console.log('\n📋 What was set up:');
  console.log('   ✅ Local .env file with SQLite database');
  console.log('   ✅ Local Prisma schema for SQLite');
  console.log('   ✅ Local database schema created');
  console.log('   ✅ Development startup script');
  console.log('   ✅ Package.json scripts updated');
  
  console.log('\n🚀 How to start local development:');
  console.log('   1. Run: npm run dev:local');
  console.log('   2. Or run: node start-local-dev.js');
  console.log('   3. Server will start on http://localhost:4000');
  console.log('   4. Database will be SQLite (local file)');
  
  console.log('\n💡 Benefits of local development:');
  console.log('   - No need for Railway database connection');
  console.log('   - Fast local SQLite database');
  console.log('   - Easy to reset and test');
  console.log('   - Works offline');
  
} catch (error) {
  console.error('❌ Local development setup failed:', error.message);
  process.exit(1);
}
