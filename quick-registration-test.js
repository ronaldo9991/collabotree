#!/usr/bin/env node

/**
 * Quick Registration Test
 * Tests the registration endpoint directly
 */

// Replace with your actual Railway URL
const RAILWAY_URL = 'https://your-app.up.railway.app';

async function testRegistration() {
  console.log(`
🧪 QUICK REGISTRATION TEST
==========================

Testing registration endpoint directly...
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

Example: https://something-production.up.railway.app
`);
    return;
  }

  const testData = {
    email: 'quicktest@example.com',
    password: 'QuickTest123',
    name: 'Quick Test User',
    username: 'quicktest',
    role: 'BUYER',
    bio: 'Quick test user'
  };

  console.log('📡 Testing URL:', `${RAILWAY_URL}/api/auth/register`);
  console.log('📦 Test Data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(`${RAILWAY_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const responseData = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log(`
✅ REGISTRATION TEST SUCCESSFUL!
================================

The registration endpoint is working correctly.
User created: ${responseData.data?.user?.name}
Email: ${responseData.data?.user?.email}
Role: ${responseData.data?.user?.role}

The issue might be in the frontend code or browser-specific problems.
`);
    } else {
      console.log(`
❌ REGISTRATION TEST FAILED
===========================

Status: ${response.status}
Error: ${responseData.error || 'Unknown error'}

${responseData.details ? `Details: ${JSON.stringify(responseData.details, null, 2)}` : ''}

This indicates a backend issue. Check:
1. Database connection
2. Environment variables
3. Database schema
4. Validation rules
`);
    }
  } catch (error) {
    console.log(`
❌ NETWORK ERROR
================

Error: ${error.message}

This indicates:
1. Backend is not running
2. Network connectivity issue
3. Wrong URL
4. CORS issue

Check your Railway deployment status.
`);
  }
}

// Run the test
testRegistration().catch(console.error);
