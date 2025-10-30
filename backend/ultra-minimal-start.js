#!/usr/bin/env node

/**
 * Ultra-minimal Railway startup script
 * Bypasses all complex shell scripts and potential hanging points
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Ultra-minimal Railway startup...');

// Quick environment check
if (!process.env.DATABASE_URL || !process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Set production environment
process.env.NODE_ENV = 'production';

// Use the correct database URL
const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

try {
  // Run migrations with timeout
  console.log('🗄️ Running migrations...');
  execSync(`npx prisma migrate deploy`, {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit',
    timeout: 60000 // 1 minute timeout
  });
} catch (migrationError) {
  console.log('⚠️ Migration failed, attempting to reset migration state...');
  try {
    execSync('node reset-migration-state.js', {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'inherit',
      timeout: 30000
    });
    console.log('✅ Migration state reset');
  } catch (fixError) {
    console.log('❌ Migration reset failed, continuing with existing schema...');
  }
}

// Ensure assets are available
console.log('🔧 Ensuring assets are available...');
try {
  execSync('node ensure-assets.js', {
    stdio: 'inherit',
    timeout: 30000
  });
  console.log('✅ Assets ensured');
} catch (assetError) {
  console.log('⚠️ Asset setup failed, trying asset generation...', assetError.message);
  try {
    execSync('node generate-assets.js', {
      stdio: 'inherit',
      timeout: 30000
    });
    console.log('✅ Assets generated');
  } catch (genError) {
    console.log('⚠️ Asset generation failed, continuing...', genError.message);
  }
}
  
  // Create admin user quickly
  console.log('👤 Creating admin...');
  execSync('node force-create-admin.js', {
    stdio: 'pipe', // Don't inherit to avoid hanging
    timeout: 30000 // 30 second timeout
  });
  
} catch (error) {
  console.log('⚠️ Setup completed with warnings:', error.message);
}

// Start server directly
console.log('🌟 Starting server...');
import('./dist/server.js').catch(error => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});

