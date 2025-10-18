#!/usr/bin/env node

/**
 * Create Baseline Migration for Railway Deployment
 * This script creates an initial migration for existing database schema
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Creating baseline migration for Railway...');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Step 2: Create baseline migration
  console.log('📋 Creating baseline migration...');
  execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql', { stdio: 'inherit' });

  // Step 3: Mark migration as applied
  console.log('✅ Marking migration as applied...');
  execSync('npx prisma migrate resolve --applied 0_init', { stdio: 'inherit' });

  console.log('🎉 Baseline migration created successfully!');

} catch (error) {
  console.error('❌ Failed to create baseline migration:', error.message);
  
  // Fallback: Use db push approach
  console.log('🔄 Falling back to db push approach...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema pushed successfully');
  } catch (pushError) {
    console.error('❌ Db push also failed:', pushError.message);
    process.exit(1);
  }
}



