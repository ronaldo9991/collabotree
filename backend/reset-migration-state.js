#!/usr/bin/env node

/**
 * Reset Railway migration state
 * Removes failed migration records and allows fresh migration
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

console.log('🔄 Resetting Railway migration state...');

const prisma = new PrismaClient();

try {
  // Remove the failed migration record
  console.log('🗑️ Removing failed migration record...');
  
  const result = await prisma.$executeRawUnsafe(`
    DELETE FROM "_prisma_migrations" 
    WHERE "migration_name" = $1 AND "finished_at" IS NULL
  `, '20251028061801_add_contract_fields');
  
  console.log(`✅ Removed ${result} failed migration record(s)`);
  
  // Check if the columns already exist
  console.log('🔍 Checking if contract fields already exist...');
  
  const columnsExist = await prisma.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'contracts' 
    AND column_name IN ('priceCents', 'timeline', 'deliverables')
  `;
  
  console.log('📋 Existing contract columns:', columnsExist);
  
  if (columnsExist.length === 0) {
    console.log('🔧 Adding missing contract fields...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "priceCents" INTEGER;
      ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "timeline" INTEGER;
      ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "deliverables" TEXT;
    `);
    
    console.log('✅ Contract fields added successfully');
  } else {
    console.log('✅ Contract fields already exist');
  }
  
  // Mark the migration as completed since columns already exist
  if (columnsExist.length === 3) {
    console.log('📝 Marking migration as completed (columns already exist)...');
    try {
      // Use Prisma's migrate resolve command to properly mark the migration as applied
      execSync('npx prisma migrate resolve --applied 20251028061801_add_contract_fields', { 
        stdio: 'inherit',
        env: process.env 
      });
      console.log('✅ Migration marked as completed');
    } catch (resolveError) {
      console.error('⚠️ Could not mark migration as resolved, but columns exist so continuing...');
      console.error(resolveError.message);
    }
  }
  
  console.log('🎉 Migration state reset successfully!');
  
} catch (error) {
  console.error('❌ Error resetting migration state:', error);
  throw error;
} finally {
  await prisma.$disconnect();
}
