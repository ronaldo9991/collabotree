#!/usr/bin/env node

// Debug script to test hire requests and service creation
// Run with: node debug-test.js

const API_BASE = 'http://localhost:4000/api';

async function testSystem() {
  console.log('🧪 Starting debug tests...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthResponse = await fetch(`${API_BASE}/me`);
    console.log('✅ Backend is running (status:', healthResponse.status, ')\n');

    // Test 2: Create test users
    console.log('2. Creating test users...');

    const studentResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `teststudent${Date.now()}@example.com`,
        password: 'Test123456',
        name: 'Test Student',
        role: 'STUDENT'
      })
    });

    const buyerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `testbuyer${Date.now()}@example.com`,
        password: 'Test123456',
        name: 'Test Buyer',
        role: 'BUYER'
      })
    });

    if (studentResponse.ok && buyerResponse.ok) {
      const studentData = await studentResponse.json();
      const buyerData = await buyerResponse.json();

      console.log('✅ Student created:', studentData.data.user.role);
      console.log('✅ Buyer created:', buyerData.data.user.role);

      const studentToken = studentData.data.accessToken;
      const buyerToken = buyerData.data.accessToken;

      // Test 3: Create service as student
      console.log('\n3. Creating service as student...');

      const serviceResponse = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          title: 'Test Service',
          description: 'This is a test service for debugging',
          priceCents: 5000,
          isActive: true
        })
      });

      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json();
        const serviceId = serviceData.data.id;
        console.log('✅ Service created:', serviceId);

        // Test 4: Create hire request as buyer
        console.log('\n4. Creating hire request as buyer...');

        const hireResponse = await fetch(`${API_BASE}/hires`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${buyerToken}`
          },
          body: JSON.stringify({
            serviceId: serviceId,
            message: 'I would like to hire you for this test service',
            priceCents: 5000
          })
        });

        if (hireResponse.ok) {
          const hireData = await hireResponse.json();
          console.log('✅ Hire request created:', hireData.data.id);
          console.log('✅ All tests passed! 🎉');
        } else {
          const error = await hireResponse.json();
          console.error('❌ Hire request failed:', error);
        }
      } else {
        const error = await serviceResponse.json();
        console.error('❌ Service creation failed:', error);
      }
    } else {
      console.error('❌ User creation failed');
      console.log('Student response:', await studentResponse.text());
      console.log('Buyer response:', await buyerResponse.text());
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testSystem();
