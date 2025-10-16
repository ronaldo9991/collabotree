#!/usr/bin/env node

/**
 * Database Reset and Migration Script
 * 
 * This script resets the PostgreSQL database and applies migrations.
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

async function resetAndMigrate() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('POSTGRESQL DATABASE SETUP', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  const postgresUrl = 'postgres://ba37c307321c13f773eafd1feb5782ba34d41a8e67fcf27ba131ae676522a20f:sk_p89KrK6RyDUUNZ0xwCC0f@db.prisma.io:5432/postgres?sslmode=require';
  
  // Set the DATABASE_URL environment variable
  process.env.DATABASE_URL = postgresUrl;
  
  try {
    log('Step 1: Generating Prisma client...', colors.blue);
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    log('Step 2: Resetting database schema...', colors.blue);
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    log('Step 3: Testing connection...', colors.blue);
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    log(`✅ Database setup successful!`, colors.green);
    log(`📊 Created ${tableCount[0].count} tables`, colors.green);
    
    await prisma.$disconnect();
    
    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ POSTGRESQL DATABASE READY!', colors.green);
    log('='.repeat(60), colors.cyan);
    
    log('\n🎯 Railway Environment Variables:', colors.blue);
    log('Copy these to your Railway service Variables tab:', colors.yellow);
    log('', colors.reset);
    log('DATABASE_URL=' + postgresUrl, colors.green);
    log('NODE_ENV=production', colors.green);
    log('JWT_ACCESS_SECRET=a8042fea480e90f0c1aa4d3e00aef402b0c5d2e16d02d0123a60b29e38c19782', colors.green);
    log('JWT_REFRESH_SECRET=69334a6a73898bd0be40c67e6d39a46915864a883b318e0b56eac00e96ddfd9e', colors.green);
    log('JWT_ACCESS_EXPIRES_IN=15m', colors.green);
    log('JWT_REFRESH_EXPIRES_IN=7d', colors.green);
    log('BCRYPT_ROUNDS=12', colors.green);
    log('CLIENT_ORIGIN=', colors.green);
    log('PORT=${{PORT}}', colors.green);
    
    log('\n🚀 After setting these variables:', colors.blue);
    log('1. Railway will automatically redeploy', colors.yellow);
    log('2. Your app will connect to PostgreSQL', colors.yellow);
    log('3. Everything should work perfectly!', colors.yellow);
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the setup
resetAndMigrate().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});





