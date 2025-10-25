#!/usr/bin/env node

/**
 * Railway Database Migration Script
 * 
 * This script runs database migrations on Railway PostgreSQL database.
 * Run this after setting up environment variables in Railway.
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

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

async function runRailwayMigrations() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('🚀 RAILWAY DATABASE MIGRATIONS', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      log('❌ DATABASE_URL environment variable is not set', colors.red);
      log('Please set the environment variables in Railway dashboard first', colors.yellow);
      process.exit(1);
    }

    log('Step 1: Generating Prisma client...', colors.blue);
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    log('Step 2: Running database migrations...', colors.blue);
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    log('Step 3: Testing database connection...', colors.blue);
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    log(`✅ Database connection successful!`, colors.green);
    log(`📊 Found ${tableCount[0].count} tables in the database`, colors.green);
    
    await prisma.$disconnect();
    
    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ MIGRATIONS COMPLETE!', colors.green);
    log('='.repeat(60), colors.cyan);
    
    log('\n🎯 Your CollaboTree app should now work properly!', colors.blue);
    log('Try registering a new account on the website.', colors.yellow);
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, colors.red);
    log('\nTroubleshooting:', colors.yellow);
    log('1. Make sure DATABASE_URL is set in Railway environment variables', colors.blue);
    log('2. Check that the PostgreSQL database is accessible', colors.blue);
    log('3. Verify the database credentials are correct', colors.blue);
    process.exit(1);
  }
}

// Run the migrations
runRailwayMigrations().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});





