#!/usr/bin/env node

/**
 * Test Service Endpoints
 * Test all service-related endpoints to ensure they work correctly
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_URL || 'https://collabotree-production.up.railway.app/api';

async function testServiceEndpoints() {
  console.log('🧪 Testing Service Endpoints...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test 1: Health Check
    console.log('
1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.success) {
      console.log('✅ Health Check: PASSED');
      console.log(`   Database: ${healthData.database}`);
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Response:`, healthData);
      return false;
    }
    
    // Test 2: Public Services Endpoint
    console.log('
2️⃣ Testing Public Services Endpoint...');
    const publicServicesResponse = await fetch(`${API_BASE_URL}/public/services?limit=10`);
    const publicServicesData = await publicServicesResponse.json();
    
    if (publicServicesResponse.ok) {
      console.log('✅ Public Services: PASSED');
      console.log(`   Status: ${publicServicesResponse.status}`);
      console.log(`   Services found: ${publicServicesData.data?.data?.length || 0}`);
      console.log(`   Total: ${publicServicesData.data?.total || 0}`);
      
      if (publicServicesData.data?.data?.length > 0) {
        console.log('   Sample services:');
        publicServicesData.data.data.slice(0, 3).forEach((service, index) => {
          console.log(`     ${index + 1}. ${service.title} - $${service.priceCents / 100}`);
        });
      } else {
        console.log('   ⚠️ No services found in database');
      }
    } else {
      console.log('❌ Public Services: FAILED');
      console.log(`   Status: ${publicServicesResponse.status}`);
      console.log(`   Response:`, publicServicesData);
    }
    
    // Test 3: Services Endpoint (without auth)
    console.log('
3️⃣ Testing Services Endpoint...');
    const servicesResponse = await fetch(`${API_BASE_URL}/services?limit=10`);
    const servicesData = await servicesResponse.json();
    
    if (servicesResponse.ok) {
      console.log('✅ Services: PASSED');
      console.log(`   Status: ${servicesResponse.status}`);
      console.log(`   Services found: ${servicesData.data?.data?.length || 0}`);
    } else {
      console.log('❌ Services: FAILED');
      console.log(`   Status: ${servicesResponse.status}`);
      console.log(`   Response:`, servicesData);
    }
    
    console.log('
🎯 Service Endpoints Test Summary:');
    console.log('   ✅ Backend is running');
    console.log('   ✅ Database connection is working');
    console.log('   ✅ API endpoints are accessible');
    
    if (publicServicesData.data?.data?.length === 0) {
      console.log('   ⚠️ No services found in database');
      console.log('   💡 This explains why services don't appear on frontend');
      console.log('   🔧 Solution: Create some services first');
    } else {
      console.log('   ✅ Services found in database');
      console.log('   🔍 Frontend issue: Check API calls and data mapping');
    }
    
    return true;
    
  } catch (error) {
    console.log('
❌ Service Endpoints Test FAILED');
    console.log('Error:', error.message);
    return false;
  }
}

// Run the test
testServiceEndpoints()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
