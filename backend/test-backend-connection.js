#!/usr/bin/env node

/**
 * Test Backend Connection Script
 * Tests if the backend API is accessible and working
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.success) {
      console.log('✅ Health Check: PASSED');
      console.log(`   Message: ${healthData.message}`);
      console.log(`   Timestamp: ${healthData.timestamp}`);
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Response:`, healthData);
      return false;
    }
    
    // Test 2: Public Services Endpoint
    console.log('\n2️⃣ Testing Public Services Endpoint...');
    const servicesResponse = await fetch(`${API_BASE_URL}/public/services?limit=5`);
    const servicesData = await servicesResponse.json();
    
    if (servicesResponse.ok) {
      console.log('✅ Public Services: PASSED');
      console.log(`   Status: ${servicesResponse.status}`);
      console.log(`   Services found: ${servicesData.data?.data?.length || 0}`);
      console.log(`   Total: ${servicesData.data?.total || 0}`);
      
      if (servicesData.data?.data?.length > 0) {
        console.log('   Sample service:', {
          id: servicesData.data.data[0].id,
          title: servicesData.data.data[0].title,
          price: servicesData.data.data[0].priceCents / 100
        });
      }
    } else {
      console.log('❌ Public Services: FAILED');
      console.log(`   Status: ${servicesResponse.status}`);
      console.log(`   Response:`, servicesData);
      return false;
    }
    
    // Test 3: Top Selections Endpoint
    console.log('\n3️⃣ Testing Top Selections Endpoint...');
    const topSelectionsResponse = await fetch(`${API_BASE_URL}/public/top-selections`);
    const topSelectionsData = await topSelectionsResponse.json();
    
    if (topSelectionsResponse.ok) {
      console.log('✅ Top Selections: PASSED');
      console.log(`   Status: ${topSelectionsResponse.status}`);
      console.log(`   Top selections found: ${topSelectionsData.data?.length || 0}`);
    } else {
      console.log('❌ Top Selections: FAILED');
      console.log(`   Status: ${topSelectionsResponse.status}`);
      console.log(`   Response:`, topSelectionsData);
      return false;
    }
    
    console.log('\n🎉 All Backend Tests PASSED!');
    console.log('✅ Backend is running and accessible');
    console.log('✅ Database connection is working');
    console.log('✅ API endpoints are responding correctly');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Backend Connection Test FAILED');
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Backend server is not running');
      console.log('   - Check if the server is started on the correct port');
      console.log('   - Verify the API_BASE_URL is correct');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Network connection issue');
      console.log('   - Check if the domain/URL is correct');
    }
    
    return false;
  }
}

// Run the test
testBackendConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
