#!/usr/bin/env node

/**
 * Railway Deployment Fix Script
 * 
 * This script fixes all common Railway deployment issues:
 * 1. Environment variables setup
 * 2. Database connection
 * 3. Build configuration
 * 4. Static file serving
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function fixRailwayDeployment() {
  log('\n' + '='.repeat(70), colors.cyan);
  log('🚀 RAILWAY DEPLOYMENT FIX SCRIPT', colors.cyan);
  log('='.repeat(70) + '\n', colors.cyan);

  try {
    // Step 1: Verify current setup
    log('Step 1: Verifying current setup...', colors.blue);
    
    if (!existsSync('package.json')) {
      throw new Error('package.json not found in root directory');
    }
    
    if (!existsSync('backend/package.json')) {
      throw new Error('backend/package.json not found');
    }
    
    log('✅ Project structure verified', colors.green);

    // Step 2: Test database connection
    log('\nStep 2: Testing database connection...', colors.blue);
    
    const postgresUrl = 'postgres://ba37c307321c13f773eafd1feb5782ba34d41a8e67fcf27ba131ae676522a20f:sk_p89KrK6RyDUUNZ0xwCC0f@db.prisma.io:5432/postgres?sslmode=require';
    process.env.DATABASE_URL = postgresUrl;
    
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      log('✅ Database connection successful', colors.green);
      
      await prisma.$disconnect();
    } catch (dbError) {
      log('❌ Database connection failed', colors.red);
      log(`Error: ${dbError.message}`, colors.red);
      
      // Try to reset the database
      log('Attempting to reset database...', colors.yellow);
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      log('✅ Database reset successful', colors.green);
    }

    // Step 3: Generate Prisma client
    log('\nStep 3: Generating Prisma client...', colors.blue);
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('✅ Prisma client generated', colors.green);

    // Step 4: Build the application
    log('\nStep 4: Building application...', colors.blue);
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Application built successfully', colors.green);

    // Step 5: Create Railway environment file
    log('\nStep 5: Creating Railway environment configuration...', colors.blue);
    
    const envConfig = `# Railway Environment Variables
# Copy these to your Railway service Variables tab

DATABASE_URL=${postgresUrl}
NODE_ENV=production
JWT_ACCESS_SECRET=a8042fea480e90f0c1aa4d3e00aef402b0c5d2e16d02d0123a60b29e38c19782
JWT_REFRESH_SECRET=69334a6a73898bd0be40c67e6d39a46915864a883b318e0b56eac00e96ddfd9e
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=
PORT=${{PORT}}

# Optional: If you want to specify a custom frontend path
# FRONTEND_PATH=/app/backend/dist
`;

    writeFileSync('RAILWAY_ENV_VARS.txt', envConfig);
    log('✅ Environment configuration created', colors.green);

    // Step 6: Verify build output
    log('\nStep 6: Verifying build output...', colors.blue);
    
    if (existsSync('backend/dist/server.js')) {
      log('✅ Backend build found', colors.green);
    } else {
      throw new Error('Backend build not found');
    }
    
    if (existsSync('backend/dist/index.html')) {
      log('✅ Frontend build found', colors.green);
    } else {
      throw new Error('Frontend build not found');
    }

    // Final summary
    log('\n' + '='.repeat(70), colors.cyan);
    log('✅ RAILWAY DEPLOYMENT FIX COMPLETE!', colors.green);
    log('='.repeat(70), colors.cyan);
    
    log('\n🎯 Next Steps:', colors.blue);
    log('1. Go to your Railway dashboard', colors.yellow);
    log('2. Click on your main service (not database)', colors.yellow);
    log('3. Go to "Variables" tab', colors.yellow);
    log('4. Copy the variables from RAILWAY_ENV_VARS.txt', colors.yellow);
    log('5. Save and wait for automatic redeployment', colors.yellow);
    
    log('\n📋 Expected Results:', colors.blue);
    log('✅ Frontend loads correctly', colors.green);
    log('✅ Backend API works', colors.green);
    log('✅ Database operations work', colors.green);
    log('✅ No more errors in logs', colors.green);
    
    log('\n🚀 Your app should be fully functional!', colors.green);
    
  } catch (error) {
    log(`\n❌ Fix failed: ${error.message}`, colors.red);
    log('\nTroubleshooting:', colors.yellow);
    log('1. Make sure you have internet connection', colors.blue);
    log('2. Check if the PostgreSQL database is accessible', colors.blue);
    log('3. Verify all required files exist', colors.blue);
    process.exit(1);
  }
}

// Run the fix
fixRailwayDeployment().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});




