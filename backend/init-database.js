#!/usr/bin/env node

/**
 * Initialize Database at Runtime
 * This script runs when the server starts to set up the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🔍 Initializing database at runtime...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Push schema (this will create tables if they don't exist)
    console.log('📋 Pushing database schema...');
    const { execSync } = await import('child_process');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema synchronized');
    
    // Test a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database is ready');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
