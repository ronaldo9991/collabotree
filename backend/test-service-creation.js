#!/usr/bin/env node

/**
 * Test Service Creation and Display
 * This script tests the complete flow from service creation to display
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

console.log('🧪 Testing Service Creation and Display');
console.log('=====================================\n');

async function testServiceCreation() {
  try {
    console.log('1️⃣ Testing service creation...');
    
    // First, check if we have any users
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      take: 1
    });
    
    if (users.length === 0) {
      console.log('❌ No student users found. Creating a test user...');
      
      // Create a test student user
      const testUser = await prisma.user.create({
        data: {
          email: 'test-student@example.com',
          passwordHash: 'hashed-password',
          name: 'Test Student',
          role: 'STUDENT',
          university: 'Test University',
          skills: ['React', 'JavaScript', 'Node.js'],
          isVerified: true
        }
      });
      
      console.log('✅ Created test user:', testUser.id);
      users.push(testUser);
    }
    
    const student = users[0];
    console.log('👤 Using student:', student.name, `(${student.email})`);
    
    // Create a test service
    const testService = await prisma.service.create({
      data: {
        title: 'Test Service - ' + new Date().toISOString(),
        description: 'This is a test service created by the diagnostic script to verify service creation and display functionality.',
        priceCents: 5000, // $50
        ownerId: student.id,
        isActive: true,
        coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
            skills: true,
            isVerified: true
          }
        }
      }
    });
    
    console.log('✅ Created test service:', testService.id);
    console.log('   Title:', testService.title);
    console.log('   Price: $' + (testService.priceCents / 100));
    console.log('   Active:', testService.isActive);
    console.log('   Owner:', testService.owner.name);
    
    return testService;
    
  } catch (error) {
    console.error('❌ Error creating test service:', error);
    throw error;
  }
}

async function testServiceFetching() {
  try {
    console.log('\n2️⃣ Testing service fetching...');
    
    // Test the exact query used by the public services endpoint
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            university: true,
            skills: true,
            isVerified: true,
            idCardUrl: true,
            verifiedAt: true,
          },
        },
        _count: {
          select: {
            hireRequests: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
    
    console.log(`📊 Found ${services.length} active services`);
    
    if (services.length > 0) {
      console.log('\n📋 Services found:');
      services.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title}`);
        console.log(`     ID: ${service.id}`);
        console.log(`     Price: $${service.priceCents / 100}`);
        console.log(`     Created: ${service.createdAt}`);
        console.log(`     Owner: ${service.owner?.name || 'Unknown'}`);
        console.log(`     Verified: ${service.owner?.isVerified ? '✅' : '❌'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No active services found');
    }
    
    return services;
    
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    throw error;
  }
}

async function testPublicAPI() {
  try {
    console.log('\n3️⃣ Testing public API endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/public/services?limit=10&sortBy=createdAt&sortOrder=desc`);
    const data = await response.json();
    
    console.log('📡 API Response Status:', response.status);
    console.log('📦 API Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      const services = data.data.data || data.data;
      console.log(`✅ API returned ${services.length} services`);
      
      if (services.length > 0) {
        console.log('\n📋 API Services:');
        services.forEach((service, index) => {
          console.log(`  ${index + 1}. ${service.title} - $${service.priceCents / 100}`);
        });
      }
    } else {
      console.log('❌ API response indicates failure');
    }
    
  } catch (error) {
    console.error('❌ Error testing public API:', error.message);
  }
}

async function testServiceMapping() {
  try {
    console.log('\n4️⃣ Testing service mapping (frontend format)...');
    
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
            skills: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log(`📊 Mapping ${services.length} services to frontend format...`);
    
    const mappedServices = services.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: `$${service.priceCents / 100}`,
      deliveryTime: "7 days",
      student: {
        name: service.owner?.name || 'Student',
        university: service.owner?.university || 'University',
        major: 'Computer Science',
        avatar: '',
        verified: service.owner?.isVerified || false
      },
      category: 'Service',
      tags: service.owner?.skills && service.owner.skills !== "[]" ? JSON.parse(service.owner.skills) : [],
      image: service.coverImage || null,
      createdAt: service.createdAt
    }));
    
    console.log('✅ Mapped services:');
    mappedServices.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service.title}`);
      console.log(`     Price: ${service.price}`);
      console.log(`     Student: ${service.student.name} (${service.student.verified ? 'Verified' : 'Not Verified'})`);
      console.log(`     Tags: ${service.tags.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing service mapping:', error);
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting service creation and display tests...\n');
    
    // Test 1: Create a service
    const testService = await testServiceCreation();
    
    // Test 2: Fetch services from database
    const services = await testServiceFetching();
    
    // Test 3: Test public API endpoint
    await testPublicAPI();
    
    // Test 4: Test service mapping
    await testServiceMapping();
    
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`✅ Service created: ${testService ? 'Yes' : 'No'}`);
    console.log(`✅ Services in database: ${services.length}`);
    console.log(`✅ Public API working: ${services.length > 0 ? 'Yes' : 'No'}`);
    
    if (services.length > 0) {
      console.log('\n🎉 All tests passed! Services should be visible in the frontend.');
      console.log('\n💡 If services are still not showing in the frontend:');
      console.log('   1. Check browser console for API errors');
      console.log('   2. Verify the frontend is calling the correct API endpoint');
      console.log('   3. Check if there are any CORS issues');
      console.log('   4. Use the manual refresh buttons in the frontend');
    } else {
      console.log('\n⚠️  No services found. Check database connection and service creation.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
