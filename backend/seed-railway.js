#!/usr/bin/env node

/**
 * Railway Seed Script
 * This script runs the database seed to populate the database with sample data
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🌱 Railway Database Seeding');
console.log('============================\n');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Production Mode: ${isProduction}\n`);

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL is not set. Cannot seed database.');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');

// Check if Prisma is available
const prismaPath = join(process.cwd(), 'node_modules', '.bin', 'prisma');
if (!existsSync(prismaPath)) {
  console.log('❌ Prisma CLI not found. Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

console.log('✅ Prisma CLI found');

// Run Prisma generate
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Run database migrations
console.log('\n🗄️  Running database migrations...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.log('❌ Failed to run migrations:', error.message);
  process.exit(1);
}

// Run seed script
console.log('\n🌱 Seeding database...');
try {
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully');
} catch (error) {
  console.log('❌ Failed to seed database:', error.message);
  process.exit(1);
}

console.log('\n🎉 Railway database setup completed successfully!');
console.log('\n📋 Test Accounts Created:');
console.log('Admin: admin@collabotree.com / admin123');
console.log('Student 1: alice@student.com / student123');
console.log('Student 2: bob@student.com / student123');
console.log('Buyer 1: charlie@buyer.com / buyer123');
console.log('Buyer 2: diana@buyer.com / buyer123');
console.log('\n✨ Your homepage and marketplace should now show sample projects!');








