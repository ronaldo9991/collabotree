#!/usr/bin/env node

/**
 * Troubleshoot Backend Issues
 * Comprehensive troubleshooting for persistent backend problems
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

console.log('🔍 Troubleshooting Backend Issues...');

try {
  // Step 1: Check current status
  console.log('\n1️⃣ Current Backend Status...');
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:4000/api/health');
    if (response.ok) {
      console.log('✅ Backend server is running on localhost:4000');
      const data = await response.json();
      console.log('📊 Health check response:', data);
    } else {
      console.log('❌ Backend server responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend server is not running on localhost:4000');
    console.log('💡 Error:', error.message);
  }
  
  // Step 2: Check Railway deployment
  console.log('\n2️⃣ Railway Deployment Status...');
  console.log('🔗 Check your Railway dashboard for:');
  console.log('   - Build logs');
  console.log('   - Deployment status');
  console.log('   - Environment variables');
  console.log('   - Service logs');
  
  // Step 3: Check environment variables
  console.log('\n3️⃣ Environment Variables Check...');
  const envVars = [
    'NODE_ENV',
    'PORT', 
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'BCRYPT_ROUNDS'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('SECRET')) {
        console.log(`✅ ${varName}: Set (${value.length} characters)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  });
  
  // Step 4: Check build status
  console.log('\n4️⃣ Build Status...');
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist directory exists');
    
    const serverPath = path.join(distPath, 'server.js');
    if (fs.existsSync(serverPath)) {
      console.log('✅ Server.js exists');
      
      // Check file size
      const stats = fs.statSync(serverPath);
      console.log(`📊 Server.js size: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log('❌ Server.js not found in dist');
    }
  } else {
    console.log('❌ Dist directory not found');
  }
  
  // Step 5: Test database connection
  console.log('\n5️⃣ Database Connection Test...');
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test tables
    try {
      const serviceCount = await prisma.service.count();
      console.log(`✅ Services table: ${serviceCount} records`);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
        console.log('❌ Services table does not exist');
        console.log('🔧 Need to push database schema');
      } else {
        console.log('❌ Database table error:', error.message);
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
  
  // Step 6: Check package.json scripts
  console.log('\n6️⃣ Package.json Scripts...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    console.log('📋 Available scripts:');
    Object.keys(scripts).forEach(scriptName => {
      console.log(`   - ${scriptName}: ${scripts[scriptName]}`);
    });
  }
  
  // Step 7: Check Railway configuration
  console.log('\n7️⃣ Railway Configuration...');
  const railwayFiles = [
    { name: 'Procfile', path: path.join(__dirname, '..', 'Procfile') },
    { name: 'nixpacks.toml', path: path.join(__dirname, '..', 'nixpacks.toml') },
    { name: 'railway.json', path: path.join(__dirname, '..', 'railway.json') }
  ];
  
  railwayFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`✅ ${file.name} exists`);
      const content = fs.readFileSync(file.path, 'utf8');
      console.log(`📄 Content: ${content.trim()}`);
    } else {
      console.log(`❌ ${file.name} not found`);
    }
  });
  
  // Step 8: Provide specific solutions
  console.log('\n8️⃣ Specific Solutions...');
  console.log('\n🔧 For Local Development:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Check if server starts on port 4000');
  console.log('   3. Test: http://localhost:4000/api/health');
  
  console.log('\n🔧 For Railway Deployment:');
  console.log('   1. Go to Railway dashboard');
  console.log('   2. Check deployment logs');
  console.log('   3. Verify environment variables are set');
  console.log('   4. Check if PostgreSQL service is running');
  
  console.log('\n🔧 For Database Issues:');
  console.log('   1. Run: npx prisma db push --accept-data-loss');
  console.log('   2. Run: npx prisma generate');
  console.log('   3. Restart the server');
  
  console.log('\n🔧 For Build Issues:');
  console.log('   1. Run: npm run build');
  console.log('   2. Check for TypeScript errors');
  console.log('   3. Verify all dependencies are installed');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Tell me what specific error you\'re seeing');
  console.log('   2. Check Railway logs for deployment errors');
  console.log('   3. Verify environment variables in Railway dashboard');
  console.log('   4. Test the backend endpoints');
  
} catch (error) {
  console.error('❌ Troubleshooting failed:', error.message);
  process.exit(1);
}
