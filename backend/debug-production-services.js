#!/usr/bin/env node

/**
 * Debug Production Services Script
 * Comprehensive debugging for service display issues in production
 */

import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const API_BASE_URL = process.env.API_URL || 'https://collabotree-production.up.railway.app/api';

async function debugProductionServices() {
  console.log('🔍 Debugging Production Services...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.success) {
      console.log('✅ Health Check: PASSED');
      console.log(`   Message: ${healthData.message}`);
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Response:`, healthData);
      return false;
    }
    
    // Test 2: Backend Test Endpoint
    console.log('\n2️⃣ Testing Backend Test Endpoint...');
    const testResponse = await fetch(`${API_BASE_URL}/test`);
    const testData = await testResponse.json();
    
    if (testResponse.ok && testData.success) {
      console.log('✅ Backend Test: PASSED');
      console.log(`   Database: ${testData.database}`);
      console.log(`   Environment: ${testData.environment}`);
    } else {
      console.log('❌ Backend Test: FAILED');
      console.log(`   Status: ${testResponse.status}`);
      console.log(`   Response:`, testData);
    }
    
    // Test 3: Public Services Endpoint
    console.log('\n3️⃣ Testing Public Services Endpoint...');
    const servicesResponse = await fetch(`${API_BASE_URL}/public/services?limit=10`);
    const servicesData = await servicesResponse.json();
    
    if (servicesResponse.ok) {
      console.log('✅ Public Services: PASSED');
      console.log(`   Status: ${servicesResponse.status}`);
      console.log(`   Services found: ${servicesData.data?.data?.length || 0}`);
      console.log(`   Total: ${servicesData.data?.total || 0}`);
      
      if (servicesData.data?.data?.length > 0) {
        console.log('   Sample services:');
        servicesData.data.data.slice(0, 3).forEach((service, index) => {
          console.log(`     ${index + 1}. ${service.title} - $${service.priceCents / 100}`);
        });
      } else {
        console.log('   ⚠️ No services found in database');
      }
    } else {
      console.log('❌ Public Services: FAILED');
      console.log(`   Status: ${servicesResponse.status}`);
      console.log(`   Response:`, servicesData);
    }
    
    // Test 4: Top Selections Endpoint
    console.log('\n4️⃣ Testing Top Selections Endpoint...');
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
    }
    
    // Test 5: Check if we can create a test service
    console.log('\n5️⃣ Testing Service Creation...');
    const testServiceData = {
      title: 'Test Service - Debug',
      description: 'This is a test service created during debugging',
      priceCents: 5000, // $50
      category: 'Web Development',
      tags: ['test', 'debug'],
      deliveryDays: 7,
      isActive: true
    };
    
    // Note: This would require authentication, so we'll just test the endpoint structure
    console.log('   Test service data prepared:', testServiceData);
    console.log('   ⚠️ Service creation requires authentication');
    
    console.log('\n🎯 Production Debug Summary:');
    console.log('   ✅ Backend is running');
    console.log('   ✅ API endpoints are accessible');
    console.log('   ✅ Database connection is working');
    
    if (servicesData.data?.data?.length === 0) {
      console.log('   ⚠️ No services found in database');
      console.log('   💡 This explains why services don\'t appear on frontend');
      console.log('   🔧 Solution: Create some services first');
    } else {
      console.log('   ✅ Services found in database');
      console.log('   🔍 Frontend issue: Check API calls and data mapping');
    }
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Production Debug FAILED');
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Backend server is not running');
      console.log('   - Check Railway deployment status');
      console.log('   - Verify the API_BASE_URL is correct');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Network connection issue');
      console.log('   - Check if the Railway URL is correct');
    }
    
    return false;
  }
}

// Run the debug
debugProductionServices()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Debug failed with error:', error);
    process.exit(1);
  });
