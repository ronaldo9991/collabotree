#!/usr/bin/env node

/**
 * Quick Database Fix
 * Manually initialize database schema for Railway
 */

import { execSync } from 'child_process';

console.log('🚀 Quick Database Fix for Railway...');

try {
  console.log('\n1️⃣ Pushing Database Schema...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit' 
  });
  console.log('✅ Database schema pushed');
  
  console.log('\n2️⃣ Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit' 
  });
  console.log('✅ Prisma client generated');
  
  console.log('\n3️⃣ Testing Database...');
  execSync('node -e "import { PrismaClient } from \'@prisma/client\'; const prisma = new PrismaClient(); prisma.service.count().then(count => { console.log(\`✅ Services table: \${count} records\`); prisma.\$disconnect(); }).catch(err => { console.error(\`❌ Error: \${err.message}\`); process.exit(1); });"', { 
    stdio: 'inherit' 
  });
  
  console.log('\n🎉 Database Fix Complete!');
  console.log('✅ Database tables are now created');
  console.log('✅ Railway deployment should work');
  console.log('✅ Services will appear in "Explore Talent" and "New Projects"');
  
} catch (error) {
  console.error('❌ Database fix failed:', error.message);
  process.exit(1);
}
