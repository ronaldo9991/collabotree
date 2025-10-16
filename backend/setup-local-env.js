#!/usr/bin/env node

/**
 * Setup Local Environment
 * Creates a .env file for local development
 */

import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

console.log('🔧 Setting up local environment...');

try {
  // Create .env file for local development
  const envContent = `# ============================================
# COLLABOTREE BACKEND ENVIRONMENT VARIABLES
# ============================================

# Environment (development, production, test)
NODE_ENV=development

# Port
PORT=4000

# Client Origin
CLIENT_ORIGIN=http://localhost:3000

# Database URL - Using Railway database for local development
DATABASE_URL=postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway

# JWT Secrets (Using the same secrets as production for consistency)
JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Password Hashing
BCRYPT_ROUNDS=12
`;

  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
  
  console.log('\n📋 Environment Variables Set:');
  console.log('   ✅ NODE_ENV=development');
  console.log('   ✅ PORT=4000');
  console.log('   ✅ CLIENT_ORIGIN=http://localhost:3000');
  console.log('   ✅ DATABASE_URL=postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway');
  console.log('   ✅ JWT_ACCESS_SECRET=Set');
  console.log('   ✅ JWT_REFRESH_SECRET=Set');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Stop the current backend server (Ctrl+C)');
  console.log('   2. Restart the backend server');
  console.log('   3. The backend should now connect to the Railway database');
  
  console.log('\n💡 Note:');
  console.log('   - You are using the Railway database for local development');
  console.log('   - This allows you to test with the same data as production');
  console.log('   - Make sure your Railway database is running');
  
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  process.exit(1);
}
