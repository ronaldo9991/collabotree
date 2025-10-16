#!/usr/bin/env node

/**
 * Railway Deployment Helper Script
 * This script helps verify the deployment environment and provides helpful information
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Railway Deployment Helper');
console.log('============================\n');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Production Mode: ${isProduction}\n`);

// Check required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

console.log('🔍 Checking Environment Variables:');
let missingVars = [];
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    missingVars.push(varName);
  } else {
    console.log(`✅ ${varName}: Set (${value.length} characters)`);
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️  Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('Please set these in your Railway dashboard.\n');
}

// Check database connection
console.log('🗄️  Database Connection:');
try {
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is set');
    console.log(`   Format: ${process.env.DATABASE_URL.includes('postgresql') ? 'PostgreSQL' : 'Unknown'}`);
  } else {
    console.log('❌ DATABASE_URL not set');
  }
} catch (error) {
  console.log('❌ Database connection check failed:', error.message);
}

// Check build artifacts
console.log('\n📦 Build Artifacts:');
const distPath = join(process.cwd(), 'dist');
const frontendPath = join(distPath, 'dist');

if (existsSync(distPath)) {
  console.log('✅ Backend dist folder exists');
} else {
  console.log('❌ Backend dist folder missing');
}

if (existsSync(frontendPath)) {
  console.log('✅ Frontend build exists');
} else {
  console.log('❌ Frontend build missing');
}

// Check package.json scripts
console.log('\n📋 Available Scripts:');
try {
  const packageJson = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const importantScripts = ['build', 'start', 'railway:build'];
  importantScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ ${script}: ${scripts[script]}`);
    } else {
      console.log(`❌ ${script}: Not found`);
    }
  });
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Railway-specific checks
console.log('\n🚂 Railway Environment:');
console.log(`Port: ${process.env.PORT || 'Not set'}`);
console.log(`Railway Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'Not set'}`);
console.log(`Railway Static URL: ${process.env.RAILWAY_STATIC_URL || 'Not set'}`);

// Final recommendations
console.log('\n💡 Recommendations:');
if (missingVars.length > 0) {
  console.log('1. Set missing environment variables in Railway dashboard');
}
console.log('2. Ensure PostgreSQL service is added to your Railway project');
console.log('3. Check Railway logs for any deployment errors');
console.log('4. Verify the build process completed successfully');

console.log('\n🔗 Useful URLs:');
console.log('- Health Check: https://your-app.railway.app/health');
console.log('- API Health: https://your-app.railway.app/api/health');
console.log('- Marketplace: https://your-app.railway.app/marketplace');

console.log('\n✨ Deployment helper complete!');

