#!/usr/bin/env node

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
    console.log('\n1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(`${RAILWAY_URL}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint working:', healthData);
    } else {
      console.log('❌ Health endpoint failed:', healthResponse.status);
    }
    
    console.log('\n2️⃣ Testing Public Services Endpoint...');
    const servicesResponse = await fetch(`${RAILWAY_URL}/api/public/services`);
    
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log('✅ Services endpoint working:', servicesData);
    } else {
      console.log('❌ Services endpoint failed:', servicesResponse.status);
    }
    
    console.log('\n3️⃣ Testing Frontend...');
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
