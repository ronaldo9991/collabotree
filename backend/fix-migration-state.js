#!/usr/bin/env node

/**
 * Fix Railway migration state issue
 * Resolves P3009 error by marking failed migration as resolved
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

console.log('🔧 Fixing Railway migration state...');

const prisma = new PrismaClient();

try {
  // Check current migration state
  console.log('📊 Checking current migration state...');
  
  // Get the failed migration
  const failedMigration = '20251028061801_add_contract_fields';
  
  console.log(`🔍 Checking if migration ${failedMigration} is marked as failed...`);
  
  // Try to manually apply the migration SQL
  console.log('🔧 Manually applying migration SQL...');
  
  const migrationSQL = `
    -- Add missing fields to Contract table
    ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "priceCents" INTEGER;
    ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "timeline" INTEGER;
    ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "deliverables" TEXT;
  `;
  
  await prisma.$executeRawUnsafe(migrationSQL);
  console.log('✅ Migration SQL applied successfully');
  
  // Mark the migration as applied in the _prisma_migrations table
  console.log('📝 Marking migration as resolved...');
  
  await prisma.$executeRawUnsafe(`
    UPDATE "_prisma_migrations" 
    SET "finished_at" = NOW(), 
        "logs" = 'Manually resolved migration state'
    WHERE "migration_name" = $1 AND "finished_at" IS NULL
  `, failedMigration);
  
  console.log('✅ Migration state resolved');
  
  // Verify the fix
  console.log('🔍 Verifying migration state...');
  const migrations = await prisma.$queryRaw`
    SELECT migration_name, finished_at, logs 
    FROM "_prisma_migrations" 
    WHERE migration_name = ${failedMigration}
  `;
  
  console.log('📋 Migration status:', migrations);
  
  console.log('🎉 Migration state fixed successfully!');
  
} catch (error) {
  console.error('❌ Error fixing migration state:', error);
  
  // Try alternative approach - reset migration state
  console.log('🔄 Trying alternative approach...');
  
  try {
    // Delete the failed migration record
    await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations" 
      WHERE "migration_name" = $1 AND "finished_at" IS NULL
    `, failedMigration);
    
    console.log('✅ Failed migration record removed');
    
    // Try to run migrations again
    console.log('🔄 Running migrations again...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Migrations completed successfully');
    
  } catch (retryError) {
    console.error('❌ Retry failed:', retryError);
    throw retryError;
  }
  
} finally {
  await prisma.$disconnect();
}



