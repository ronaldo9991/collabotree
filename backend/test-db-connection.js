#!/usr/bin/env node

/**
 * Test Database Connection Script
 * 
 * This script tests the database connection and checks if tables exist.
 */

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

async function testDatabaseConnection() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('🔍 TESTING DATABASE CONNECTION', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  const prisma = new PrismaClient();

  try {
    // Test basic connection
    log('Step 1: Testing database connection...', colors.blue);
    await prisma.$connect();
    log('✅ Database connection successful!', colors.green);

    // Check if tables exist
    log('Step 2: Checking database tables...', colors.blue);
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    log(`📊 Found ${tables.length} tables:`, colors.green);
    tables.forEach(table => {
      log(`   - ${table.table_name}`, colors.blue);
    });

    // Test User table
    log('Step 3: Testing User table...', colors.blue);
    const userCount = await prisma.user.count();
    log(`👥 Found ${userCount} users in database`, colors.green);

    // Test Service table
    log('Step 4: Testing Service table...', colors.blue);
    const serviceCount = await prisma.service.count();
    log(`🛠️  Found ${serviceCount} services in database`, colors.green);

    // Test creating a simple service (if user exists)
    if (userCount > 0) {
      log('Step 5: Testing service creation...', colors.blue);
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        try {
          const testService = await prisma.service.create({
            data: {
              title: 'Test Service',
              description: 'This is a test service',
              priceCents: 1000, // $10.00
              ownerId: firstUser.id,
            },
          });
          log(`✅ Test service created successfully with ID: ${testService.id}`, colors.green);
          
          // Clean up test service
          await prisma.service.delete({
            where: { id: testService.id }
          });
          log('🧹 Test service cleaned up', colors.yellow);
        } catch (error) {
          log(`❌ Service creation failed: ${error.message}`, colors.red);
        }
      }
    }

    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ DATABASE TEST COMPLETE!', colors.green);
    log('='.repeat(60), colors.cyan);

  } catch (error) {
    log(`❌ Database test failed: ${error.message}`, colors.red);
    log('\nTroubleshooting:', colors.yellow);
    log('1. Check if DATABASE_URL is set correctly', colors.blue);
    log('2. Verify the database server is running', colors.blue);
    log('3. Check if database migrations have been run', colors.blue);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});













