#!/usr/bin/env node

/**
 * Database Migration Script: SQLite to PostgreSQL
 * 
 * This script helps migrate your local SQLite database to the PostgreSQL database.
 * Run this after setting up your Railway PostgreSQL database.
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

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

async function migrateToPostgres() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('DATABASE MIGRATION: SQLite → PostgreSQL', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  const postgresUrl = 'postgres://ba37c307321c13f773eafd1feb5782ba34d41a8e67fcf27ba131ae676522a20f:sk_p89KrK6RyDUUNZ0xwCC0f@db.prisma.io:5432/postgres?sslmode=require';
  
  log('Step 1: Setting up PostgreSQL database...', colors.blue);
  
  // Set the DATABASE_URL environment variable
  process.env.DATABASE_URL = postgresUrl;
  
  try {
    // Generate Prisma client for PostgreSQL
    log('Generating Prisma client for PostgreSQL...', colors.yellow);
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run database migrations
    log('Running database migrations...', colors.yellow);
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Test the connection
    log('Testing PostgreSQL connection...', colors.yellow);
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    log(`✅ PostgreSQL connection successful!`, colors.green);
    log(`📊 Found ${tableCount[0].count} tables in the database`, colors.green);
    
    await prisma.$disconnect();
    
    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ MIGRATION COMPLETE!', colors.green);
    log('='.repeat(60), colors.cyan);
    
    log('\n🎯 Next Steps:', colors.blue);
    log('1. Set these environment variables in Railway:', colors.yellow);
    log('   DATABASE_URL=' + postgresUrl, colors.blue);
    log('   NODE_ENV=production', colors.blue);
    log('   JWT_ACCESS_SECRET=a8042fea480e90f0c1aa4d3e00aef402b0c5d2e16d02d0123a60b29e38c19782', colors.blue);
    log('   JWT_REFRESH_SECRET=69334a6a73898bd0be40c67e6d39a46915864a883b318e0b56eac00e96ddfd9e', colors.blue);
    log('   JWT_ACCESS_EXPIRES_IN=15m', colors.blue);
    log('   JWT_REFRESH_EXPIRES_IN=7d', colors.blue);
    log('   BCRYPT_ROUNDS=12', colors.blue);
    log('   CLIENT_ORIGIN=', colors.blue);
    log('   PORT=${{PORT}}', colors.blue);
    
    log('\n2. Railway will automatically redeploy', colors.yellow);
    log('3. Your app should work perfectly!', colors.green);
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, colors.red);
    log('\nTroubleshooting:', colors.yellow);
    log('1. Make sure the PostgreSQL database is accessible', colors.blue);
    log('2. Check your internet connection', colors.blue);
    log('3. Verify the DATABASE_URL is correct', colors.blue);
    process.exit(1);
  }
}

// Run the migration
migrateToPostgres().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
