#!/usr/bin/env node

/**
 * Fix Railway Backend
 * Comprehensive fix for Railway backend deployment issues
 */

import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

console.log('🔧 Fixing Railway Backend Issues...');

try {
  // Step 1: Create Railway environment setup guide
  console.log('\n1️⃣ Creating Railway Environment Setup Guide...');
  
  const railwayGuide = `# Railway Backend Fix Guide

## 🚨 CRITICAL: Set These Environment Variables in Railway Dashboard

Go to your Railway project dashboard and set these environment variables in your main service:

### Required Environment Variables:
\`\`\`bash
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=
DATABASE_URL=postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway
JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
\`\`\`

## 🔧 Step-by-Step Fix:

### 1. Go to Railway Dashboard
- Open your Railway project
- Click on your main service (not the PostgreSQL service)

### 2. Set Environment Variables
- Click on "Variables" tab
- Add each environment variable listed above
- Make sure to copy the exact values

### 3. Redeploy
- After setting all variables, Railway will automatically redeploy
- Check the deployment logs for any errors

### 4. Test the Deployment
- Once deployed, test these endpoints:
  - \`https://your-app.railway.app/api/health\`
  - \`https://your-app.railway.app/api/public/services\`

## 🎯 Expected Results:

After setting environment variables and redeploying:
- ✅ Build will complete successfully
- ✅ Server will start on Railway port
- ✅ Database tables will be created automatically
- ✅ API endpoints will respond correctly
- ✅ Services will appear in "Explore Talent" and "New Projects"

## 🚨 Common Issues:

### Issue 1: Build Fails
**Solution:** Check that all environment variables are set correctly

### Issue 2: Server Won't Start
**Solution:** Verify JWT secrets are set and are at least 32 characters

### Issue 3: Database Connection Fails
**Solution:** Ensure DATABASE_URL is correct and PostgreSQL service is running

### Issue 4: Services Don't Appear
**Solution:** Check that database tables are created (they should be automatic)

## 📞 Need Help?

If you're still having issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Ensure PostgreSQL service is running
4. Test the API endpoints manually
`;

  const guidePath = path.join(__dirname, 'RAILWAY_BACKEND_FIX_GUIDE.md');
  fs.writeFileSync(guidePath, railwayGuide);
  console.log('✅ Railway backend fix guide created');
  
  // Step 2: Create environment variables template
  console.log('\n2️⃣ Creating Environment Variables Template...');
  
  const envTemplate = `# Copy these environment variables to your Railway dashboard
# Go to your Railway project → Main service → Variables tab

NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=
DATABASE_URL=postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway
JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
`;

  const envTemplatePath = path.join(__dirname, 'railway-env-vars.txt');
  fs.writeFileSync(envTemplatePath, envTemplate);
  console.log('✅ Environment variables template created');
  
  // Step 3: Create Railway deployment test script
  console.log('\n3️⃣ Creating Railway Deployment Test Script...');
  
  const testScript = `#!/usr/bin/env node

/**
 * Test Railway Deployment
 * Test if Railway deployment is working correctly
 */

import fetch from 'node-fetch';

console.log('🧪 Testing Railway Deployment...');

// Replace with your actual Railway URL
const RAILWAY_URL = 'https://your-app.railway.app';

async function testRailwayDeployment() {
  try {
    console.log('\\n1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(\`\${RAILWAY_URL}/api/health\`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint working:', healthData);
    } else {
      console.log('❌ Health endpoint failed:', healthResponse.status);
    }
    
    console.log('\\n2️⃣ Testing Public Services Endpoint...');
    const servicesResponse = await fetch(\`\${RAILWAY_URL}/api/public/services\`);
    
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log('✅ Services endpoint working:', servicesData);
    } else {
      console.log('❌ Services endpoint failed:', servicesResponse.status);
    }
    
    console.log('\\n3️⃣ Testing Frontend...');
    const frontendResponse = await fetch(RAILWAY_URL);
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend is serving correctly');
    } else {
      console.log('❌ Frontend failed:', frontendResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Railway deployment test failed:', error.message);
    console.log('💡 Make sure to replace RAILWAY_URL with your actual Railway URL');
  }
}

testRailwayDeployment();
`;

  const testScriptPath = path.join(__dirname, 'test-railway-deployment.js');
  fs.writeFileSync(testScriptPath, testScript);
  console.log('✅ Railway deployment test script created');
  
  console.log('\\n🎉 Railway Backend Fix Complete!');
  console.log('\\n📋 Files Created:');
  console.log('   ✅ RAILWAY_BACKEND_FIX_GUIDE.md - Complete fix guide');
  console.log('   ✅ railway-env-vars.txt - Environment variables template');
  console.log('   ✅ test-railway-deployment.js - Deployment test script');
  
  console.log('\\n🔧 Next Steps:');
  console.log('   1. Read RAILWAY_BACKEND_FIX_GUIDE.md');
  console.log('   2. Set environment variables in Railway dashboard');
  console.log('   3. Redeploy your Railway service');
  console.log('   4. Test the deployment');
  
  console.log('\\n💡 Key Points:');
  console.log('   - Environment variables MUST be set in Railway dashboard');
  console.log('   - JWT secrets are critical for server startup');
  console.log('   - Database URL must be correct');
  console.log('   - Railway will automatically redeploy after setting variables');
  
} catch (error) {
  console.error('❌ Railway backend fix failed:', error.message);
  process.exit(1);
}
