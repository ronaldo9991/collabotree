#!/usr/bin/env node

/**
 * Initialize Railway Database
 * This script runs during Railway deployment to set up the database
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function initializeRailwayDatabase() {
  try {
    console.log('🚀 Initializing Railway Database...');
    
    // Step 1: Test connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Step 2: Push schema
    console.log('📋 Pushing database schema...');
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit' 
    });
    console.log('✅ Database schema pushed');
    
    // Step 3: Generate client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit' 
    });
    console.log('✅ Prisma client generated');
    
    // Step 4: Test tables
    console.log('🔍 Testing database tables...');
    const serviceCount = await prisma.service.count();
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const categoryCount = await prisma.category.count();
    
    console.log(`✅ Services table: ${serviceCount} records`);
    console.log(`✅ Users table: ${userCount} records`);
    console.log(`✅ Projects table: ${projectCount} records`);
    console.log(`✅ Categories table: ${categoryCount} records`);
    
    // Step 5: Seed initial data if tables are empty
    if (serviceCount === 0 || userCount === 0) {
      console.log('🌱 Seeding initial data...');
      try {
        execSync('npx prisma db seed', { 
          stdio: 'inherit' 
        });
        console.log('✅ Initial data seeded');
      } catch (error) {
        console.log('⚠️ Seeding failed, but database is ready');
      }
    }
    
    console.log('🎉 Railway Database Initialization Complete!');
    console.log('✅ Database is ready for production use');
    
  } catch (error) {
    console.error('❌ Railway database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeRailwayDatabase()
    .then(() => {
      console.log('✅ Railway database initialization completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Railway database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeRailwayDatabase };



















