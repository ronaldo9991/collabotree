#!/usr/bin/env node

/**
 * Railway Deployment Test Script
 * Tests all aspects of the Railway deployment
 */

const https = require('https');
const http = require('http');

// Replace with your actual Railway URL
const RAILWAY_URL = 'https://your-app.up.railway.app'; // You need to replace this

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    console.log(`🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`   ✅ ${description} - SUCCESS`);
          try {
            const json = JSON.parse(data);
            console.log(`   Response:`, JSON.stringify(json, null, 2));
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 200)}...`);
          }
        } else {
          console.log(`   ❌ ${description} - FAILED`);
          console.log(`   Response: ${data.substring(0, 200)}...`);
        }
        resolve({ success: res.statusCode === 200, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ ${description} - ERROR: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ❌ ${description} - TIMEOUT`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testRegistration(url) {
  const testData = {
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User',
    username: 'testuser123',
    role: 'BUYER',
    bio: 'Test bio'
  };

  return new Promise((resolve) => {
    console.log(`🔍 Testing: Registration Endpoint`);
    console.log(`   URL: ${url}/api/auth/register`);
    console.log(`   Data:`, JSON.stringify(testData, null, 2));
    
    const postData = JSON.stringify(testData);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url + '/api/auth/register', options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 201) {
            console.log(`   ✅ Registration - SUCCESS`);
            console.log(`   User created: ${json.data?.user?.name}`);
          } else {
            console.log(`   ❌ Registration - FAILED`);
            console.log(`   Error: ${json.error || 'Unknown error'}`);
            if (json.details) {
              console.log(`   Details:`, JSON.stringify(json.details, null, 2));
            }
          }
        } catch (e) {
          console.log(`   ❌ Registration - INVALID JSON RESPONSE`);
          console.log(`   Response: ${data.substring(0, 200)}...`);
        }
        resolve({ success: res.statusCode === 201, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Registration - ERROR: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log(`
🧪 RAILWAY DEPLOYMENT TEST SCRIPT
==================================

Testing your Railway deployment to identify issues...

IMPORTANT: You need to replace 'your-app.up.railway.app' with your actual Railway URL
in the RAILWAY_URL variable at the top of this script.

Your Railway URL should look like: https://something-production.up.railway.app
`);

  if (RAILWAY_URL.includes('your-app')) {
    console.log(`
❌ CONFIGURATION NEEDED
======================

Please edit this script and replace 'your-app.up.railway.app' with your actual Railway URL.

To find your Railway URL:
1. Go to Railway dashboard
2. Click on your project
3. Click on your main service
4. Copy the URL from the "Domains" section

Then run this script again.
`);
    return;
  }

  console.log(`Testing Railway URL: ${RAILWAY_URL}`);
  console.log('');

  // Test 1: Health endpoint
  const healthResult = await testEndpoint(`${RAILWAY_URL}/api/health`, 'Health Check');
  console.log('');

  // Test 2: Frontend
  const frontendResult = await testEndpoint(RAILWAY_URL, 'Frontend');
  console.log('');

  // Test 3: Registration endpoint
  const registrationResult = await testRegistration(RAILWAY_URL);
  console.log('');

  // Summary
  console.log(`
📊 TEST RESULTS SUMMARY
=======================

Health Check: ${healthResult.success ? '✅ PASS' : '❌ FAIL'}
Frontend: ${frontendResult.success ? '✅ PASS' : '❌ FAIL'}
Registration: ${registrationResult.success ? '✅ PASS' : '❌ FAIL'}

${healthResult.success && frontendResult.success && registrationResult.success ? 
  '🎉 ALL TESTS PASSED! Your Railway deployment is working correctly!' :
  '⚠️  Some tests failed. Check the error messages above for details.'}
`);

  if (!healthResult.success) {
    console.log(`
🔧 HEALTH CHECK FAILED
======================

The health endpoint is not responding. This means:
1. The backend is not running properly
2. There's a routing issue
3. The server crashed after startup

Check your Railway deployment logs for errors.
`);
  }

  if (!registrationResult.success) {
    console.log(`
🔧 REGISTRATION FAILED
======================

The registration endpoint is not working. Common causes:
1. Database connection issues
2. Missing environment variables
3. Database schema not migrated
4. Validation errors

Check the error message above for specific details.
`);
  }
}

// Run the tests
runTests().catch(console.error);
