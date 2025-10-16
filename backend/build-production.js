#!/usr/bin/env node

/**
 * Production Build Script for Railway
 * Handles Prisma migrations and database setup
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting production build...');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated');

  // Step 2: Handle database schema
  console.log('🗄️ Setting up database schema...');
  
  // For Railway deployment, always use db push to avoid migration conflicts
  console.log('📋 Using db push for schema synchronization...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema synchronized successfully');
  } catch (error) {
    console.log('⚠️ Db push failed, trying without data loss flag...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Database schema synchronized successfully');
    } catch (secondError) {
      console.error('❌ Database schema sync failed:', secondError.message);
      throw secondError;
    }
  }

  // Step 3: Build TypeScript
  console.log('🔨 Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ TypeScript build completed');

  console.log('🎉 Production build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
