#!/usr/bin/env node

/**
 * Railway Deployment Fix Script
 * This script helps fix common deployment issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 CollaboTree Railway Deployment Fix Script');
console.log('==========================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Run this script from the backend directory.');
  process.exit(1);
}

console.log('✅ Found package.json');

// Check environment variables
console.log('\n🔍 Checking environment variables...');

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'NODE_ENV'
];

const missingVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📋 Please set these in your Railway dashboard:');
  console.log('   1. Go to your Railway project');
  console.log('   2. Click on your service');
  console.log('   3. Go to "Variables" tab');
  console.log('   4. Add the missing variables');
  console.log('\n💡 See RAILWAY_ENVIRONMENT_SETUP.md for details');
}

// Check JWT secret strength
console.log('\n🔐 Checking JWT secrets...');
if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length < 32) {
  console.log('❌ JWT_ACCESS_SECRET is too short (minimum 32 characters)');
  console.log('💡 Generate a new secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
  console.log('❌ JWT_REFRESH_SECRET is too short (minimum 32 characters)');
  console.log('💡 Generate a new secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

// Check database connection
console.log('\n💾 Testing database connection...');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
  console.log('✅ Database connection successful');
} catch (error) {
  console.log('❌ Database connection failed');
  console.log('💡 Check your DATABASE_URL environment variable');
  console.log('💡 Ensure PostgreSQL service is running in Railway');
}

// Check Prisma schema
console.log('\n📋 Checking Prisma schema...');
if (fs.existsSync('prisma/schema.prisma')) {
  console.log('✅ Prisma schema found');
} else {
  console.log('❌ Prisma schema not found');
}

// Check build files
console.log('\n🏗️ Checking build configuration...');
if (fs.existsSync('dist')) {
  console.log('✅ Build directory exists');
} else {
  console.log('⚠️  Build directory not found (will be created during build)');
}

// Check frontend build
console.log('\n🎨 Checking frontend build...');
if (fs.existsSync('dist/frontend')) {
  console.log('✅ Frontend build found');
} else {
  console.log('⚠️  Frontend build not found (will be created during build)');
}

// Generate JWT secrets if needed
if (missingVars.includes('JWT_ACCESS_SECRET') || missingVars.includes('JWT_REFRESH_SECRET')) {
  console.log('\n🔑 Generating JWT secrets...');
  try {
    const accessSecret = execSync('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"', { encoding: 'utf8' }).trim();
    const refreshSecret = execSync('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"', { encoding: 'utf8' }).trim();
    
    console.log('\n📋 Add these to your Railway environment variables:');
    console.log(`JWT_ACCESS_SECRET=${accessSecret}`);
    console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
  } catch (error) {
    console.log('❌ Failed to generate JWT secrets');
  }
}

// Summary
console.log('\n📊 Summary:');
console.log('===========');

if (missingVars.length === 0) {
  console.log('✅ All required environment variables are set');
} else {
  console.log(`❌ ${missingVars.length} environment variables missing`);
}

console.log('\n🚀 Next steps:');
console.log('1. Set missing environment variables in Railway dashboard');
console.log('2. Deploy your application');
console.log('3. Check Railway logs for any errors');
console.log('4. Test your application endpoints');

console.log('\n📚 For more help, see:');
console.log('- RAILWAY_DEPLOYMENT_COMPLETE_GUIDE.md');
console.log('- RAILWAY_ENVIRONMENT_SETUP.md');

console.log('\n🎉 Fix script completed!');
