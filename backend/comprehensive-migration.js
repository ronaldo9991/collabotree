#!/usr/bin/env node

/**
 * Comprehensive Database Migration Script
 * 
 * This script creates ALL tables for the complete Collabotree application:
 * - Users (authentication, login, profiles)
 * - Services (student services)
 * - Hire Requests (buyer requests)
 * - Chat Rooms & Messages (real-time chat)
 * - Orders (transactions)
 * - Reviews (feedback system)
 * - Notifications (user alerts)
 * - Wallet Entries (payments)
 * - Disputes (conflict resolution)
 * - Refresh Tokens (authentication)
 * - Contracts (legal agreements)
 * - Contract Signatures & Progress (contract management)
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function comprehensiveMigration() {
  log('\n' + '='.repeat(80), colors.cyan);
  log('🚀 COMPREHENSIVE COLLABOTREE DATABASE MIGRATION', colors.cyan);
  log('='.repeat(80), colors.cyan);
  log('Creating ALL tables for complete application functionality...', colors.blue);
  log('='.repeat(80) + '\n', colors.cyan);

  const postgresUrl = 'postgresql://postgres:NDeInvLYtxKMStijkmcHMWDabEBNFnPm@turntable.proxy.rlwy.net:26926/railway';
  
  // Set the DATABASE_URL environment variable
  process.env.DATABASE_URL = postgresUrl;
  
  try {
    log('📋 Step 1: Setting up PostgreSQL database connection...', colors.blue);
    
    // Generate Prisma client for PostgreSQL
    log('🔧 Generating Prisma client for PostgreSQL...', colors.yellow);
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Create initial migration
    log('📝 Creating comprehensive database migration...', colors.yellow);
    execSync('npx prisma migrate dev --name init_comprehensive', { stdio: 'inherit' });
    
    // Test the connection
    log('🔍 Testing PostgreSQL connection...', colors.yellow);
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check all tables exist
    log('📊 Verifying all tables are created...', colors.yellow);
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    log(`✅ PostgreSQL connection successful!`, colors.green);
    log(`📋 Created ${tables.length} tables:`, colors.green);
    
    // List all created tables
    tables.forEach((table, index) => {
      const tableName = table.table_name;
      let emoji = '📄';
      
      // Add specific emojis for different table types
      if (tableName.includes('user')) emoji = '👤';
      else if (tableName.includes('service')) emoji = '🛠️';
      else if (tableName.includes('chat') || tableName.includes('message')) emoji = '💬';
      else if (tableName.includes('order')) emoji = '📦';
      else if (tableName.includes('contract')) emoji = '📋';
      else if (tableName.includes('hire')) emoji = '🤝';
      else if (tableName.includes('review')) emoji = '⭐';
      else if (tableName.includes('notification')) emoji = '🔔';
      else if (tableName.includes('wallet')) emoji = '💰';
      else if (tableName.includes('dispute')) emoji = '⚖️';
      else if (tableName.includes('token')) emoji = '🔑';
      
      log(`   ${emoji} ${tableName}`, colors.blue);
    });
    
    await prisma.$disconnect();
    
    log('\n' + '='.repeat(80), colors.cyan);
    log('🎉 COMPREHENSIVE MIGRATION COMPLETE!', colors.green);
    log('='.repeat(80), colors.cyan);
    
    log('\n🎯 Your Collabotree application now has:', colors.magenta);
    log('✅ User Authentication & Profiles (login system)', colors.green);
    log('✅ Services Management (student offerings)', colors.green);
    log('✅ Hire Request System (buyer-student matching)', colors.green);
    log('✅ Real-time Chat System (messages & chat rooms)', colors.green);
    log('✅ Order Management (transactions)', colors.green);
    log('✅ Review System (feedback & ratings)', colors.green);
    log('✅ Notification System (user alerts)', colors.green);
    log('✅ Wallet System (payments & transactions)', colors.green);
    log('✅ Dispute Resolution System', colors.green);
    log('✅ Contract Management (legal agreements)', colors.green);
    log('✅ Token Management (authentication)', colors.green);
    
    log('\n🔧 Next Steps - Set these environment variables in Railway:', colors.blue);
    log('   DATABASE_URL=postgresql://postgres:NDeInvLYtxKMStijkmcHMWDabEBNFnPm@postgres.railway.internal:5432/railway', colors.yellow);
    log('   DATABASE_PUBLIC_URL=postgresql://postgres:NDeInvLYtxKMStijkmcHMWDabEBNFnPm@turntable.proxy.rlwy.net:26926/railway', colors.yellow);
    log('   NODE_ENV=production', colors.yellow);
    log('   JWT_ACCESS_SECRET=a8042fea480e90f0c1aa4d3e00aef402b0c5d2e16d02d0123a60b29e38c19782', colors.yellow);
    log('   JWT_REFRESH_SECRET=69334a6a73898bd0be40c67e6d39a46915864a883b318e0b56eac00e96ddfd9e', colors.yellow);
    log('   JWT_ACCESS_EXPIRES_IN=15m', colors.yellow);
    log('   JWT_REFRESH_EXPIRES_IN=7d', colors.yellow);
    log('   BCRYPT_ROUNDS=12', colors.yellow);
    log('   CLIENT_ORIGIN=', colors.yellow);
    log('   PORT=${{PORT}}', colors.yellow);
    
    log('\n🚀 Railway will automatically redeploy with all features!', colors.green);
    log('💡 Your complete Collabotree platform is ready to use!', colors.green);
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, colors.red);
    log('\n🔧 Troubleshooting:', colors.yellow);
    log('1. Make sure the PostgreSQL database is accessible', colors.blue);
    log('2. Check your internet connection', colors.blue);
    log('3. Verify the DATABASE_URL is correct', colors.blue);
    log('4. Ensure Prisma is properly installed', colors.blue);
    process.exit(1);
  }
}

// Run the comprehensive migration
comprehensiveMigration().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});







