#!/usr/bin/env node

/**
 * Test Services API - Check if services are being created and fetched properly
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

console.log('🔍 Testing Services API');
console.log('=====================\n');

async function testPublicServices() {
  try {
    console.log('📡 Testing /api/public/services endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/public/services?limit=10&sortBy=createdAt&sortOrder=desc`);
    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      const services = data.data.data || data.data;
      console.log(`✅ Found ${services.length} services`);
      
      if (services.length > 0) {
        console.log('\n📋 Services found:');
        services.forEach((service, index) => {
          console.log(`  ${index + 1}. ${service.title} - $${service.priceCents / 100} (${service.isActive ? 'Active' : 'Inactive'})`);
          console.log(`     Created: ${service.createdAt}`);
          console.log(`     Owner: ${service.owner?.name || 'Unknown'}`);
        });
      } else {
        console.log('⚠️  No services found in database');
      }
    } else {
      console.log('❌ API response indicates failure');
    }
    
  } catch (error) {
    console.error('❌ Error testing public services:', error.message);
  }
}

async function testRegularServices() {
  try {
    console.log('\n📡 Testing /api/services endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/services?limit=10&sortBy=createdAt&sortOrder=desc`);
    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      const services = data.data.data || data.data;
      console.log(`✅ Found ${services.length} services`);
    } else {
      console.log('❌ API response indicates failure');
    }
    
  } catch (error) {
    console.error('❌ Error testing regular services:', error.message);
  }
}

async function testHealthEndpoint() {
  try {
    console.log('\n📡 Testing /api/health endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Health check:', data);
    
    if (data.success) {
      console.log('✅ API is healthy');
    } else {
      console.log('❌ API health check failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing health endpoint:', error.message);
  }
}

async function runTests() {
  console.log(`🌐 Testing API at: ${API_BASE_URL}\n`);
  
  await testHealthEndpoint();
  await testPublicServices();
  await testRegularServices();
  
  console.log('\n🎉 API tests completed!');
}

runTests().catch(console.error);
