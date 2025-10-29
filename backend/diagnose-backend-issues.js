#!/usr/bin/env node

/**
 * Diagnose Backend Issues
 * Comprehensive diagnostic script to identify backend problems
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

console.log('🔍 Diagnosing Backend Issues...');

try {
  // Step 1: Check environment variables
  console.log('\n1️⃣ Checking Environment Variables...');
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'BCRYPT_ROUNDS'
  ];
  
  const missingVars = [];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  // Step 2: Check database connection
  console.log('\n2️⃣ Testing Database Connection...');
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if tables exist
    try {
      const serviceCount = await prisma.service.count();
      console.log(`✅ Services table exists: ${serviceCount} records`);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
        console.log('❌ Services table does not exist');
        console.log('🔧 Need to push database schema');
      } else {
        console.log('❌ Database table test failed:', error.message);
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
  
  // Step 3: Check Prisma schema
  console.log('\n3️⃣ Checking Prisma Schema...');
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    console.log('✅ Prisma schema file exists');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    if (schemaContent.includes('model Service')) {
      console.log('✅ Service model defined in schema');
    } else {
      console.log('❌ Service model not found in schema');
    }
  } else {
    console.log('❌ Prisma schema file not found');
  }
  
  // Step 4: Check build files
  console.log('\n4️⃣ Checking Build Files...');
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist directory exists');
    
    const serverPath = path.join(distPath, 'server.js');
    if (fs.existsSync(serverPath)) {
      console.log('✅ Server.js exists in dist');
    } else {
      console.log('❌ Server.js not found in dist');
    }
  } else {
    console.log('❌ Dist directory not found - need to build');
  }
  
  // Step 5: Check package.json scripts
  console.log('\n5️⃣ Checking Package.json Scripts...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    if (scripts.start) {
      console.log(`✅ Start script: ${scripts.start}`);
    } else {
      console.log('❌ No start script found');
    }
    
    if (scripts.build) {
      console.log(`✅ Build script: ${scripts.build}`);
    } else {
      console.log('❌ No build script found');
    }
  }
  
  // Step 6: Test TypeScript compilation
  console.log('\n6️⃣ Testing TypeScript Compilation...');
  try {
    execSync('npx tsc --noEmit', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.log('❌ TypeScript compilation failed');
  }
  
  // Step 7: Check Railway-specific files
  console.log('\n7️⃣ Checking Railway Configuration...');
  const railwayFiles = [
    'Procfile',
    'nixpacks.toml',
    'railway.json'
  ];
  
  railwayFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} not found`);
    }
  });
  
  console.log('\n🎯 Diagnosis Complete!');
  console.log('\n📋 Common Issues and Solutions:');
  console.log('   1. Missing environment variables → Set in Railway dashboard');
  console.log('   2. Database tables missing → Run: npx prisma db push --accept-data-loss');
  console.log('   3. Build files missing → Run: npm run build');
  console.log('   4. TypeScript errors → Fix compilation errors');
  console.log('   5. Railway config missing → Check Procfile and nixpacks.toml');
  
} catch (error) {
  console.error('❌ Diagnosis failed:', error.message);
  process.exit(1);
}


















