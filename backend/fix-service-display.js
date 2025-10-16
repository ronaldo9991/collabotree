#!/usr/bin/env node

/**
 * Fix Service Display Issues
 * This script helps diagnose and fix issues with services not appearing in listings
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🔧 Fixing Service Display Issues');
console.log('================================\n');

async function checkServices() {
  try {
    console.log('🔍 Checking all services in database...');
    
    const allServices = await prisma.service.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`📊 Total services found: ${allServices.length}`);
    
    if (allServices.length > 0) {
      console.log('\n📋 Services in database:');
      allServices.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title}`);
        console.log(`     ID: ${service.id}`);
        console.log(`     Price: $${service.priceCents / 100}`);
        console.log(`     Active: ${service.isActive ? '✅' : '❌'}`);
        console.log(`     Created: ${service.createdAt}`);
        console.log(`     Owner: ${service.owner?.name || 'Unknown'} (${service.owner?.isVerified ? 'Verified' : 'Not Verified'})`);
        console.log('');
      });
      
      // Check active services
      const activeServices = allServices.filter(s => s.isActive);
      console.log(`✅ Active services: ${activeServices.length}`);
      
      // Check recent services (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentServices = allServices.filter(s => s.createdAt > oneDayAgo);
      console.log(`🆕 Recent services (last 24h): ${recentServices.length}`);
      
    } else {
      console.log('⚠️  No services found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking services:', error);
  }
}

async function checkUsers() {
  try {
    console.log('\n👥 Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`📊 Total users found: ${users.length}`);
    
    const students = users.filter(u => u.role === 'STUDENT');
    const buyers = users.filter(u => u.role === 'BUYER');
    const admins = users.filter(u => u.role === 'ADMIN');
    
    console.log(`🎓 Students: ${students.length}`);
    console.log(`🛒 Buyers: ${buyers.length}`);
    console.log(`👑 Admins: ${admins.length}`);
    
    if (students.length > 0) {
      console.log('\n📋 Students:');
      students.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.name} (${student.email})`);
        console.log(`     Verified: ${student.isVerified ? '✅' : '❌'}`);
        console.log(`     Created: ${student.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

async function testPublicServicesQuery() {
  try {
    console.log('\n🌐 Testing public services query...');
    
    // Simulate the exact query used by the public services endpoint
    const where = {
      isActive: true,
    };
    
    const orderBy = {
      createdAt: 'desc',
    };
    
    const services = await prisma.service.findMany({
      where,
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
      orderBy,
      take: 20,
    });
    
    console.log(`📊 Public services query returned: ${services.length} services`);
    
    if (services.length > 0) {
      console.log('\n📋 Public services:');
      services.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title} - $${service.priceCents / 100}`);
        console.log(`     Owner: ${service.owner?.name || 'Unknown'}`);
        console.log(`     Created: ${service.createdAt}`);
        console.log(`     Hire Requests: ${service._count.hireRequests}`);
        console.log(`     Orders: ${service._count.orders}`);
      });
    } else {
      console.log('⚠️  No active services found for public query');
    }
    
  } catch (error) {
    console.error('❌ Error testing public services query:', error);
  }
}

async function fixInactiveServices() {
  try {
    console.log('\n🔧 Checking for inactive services...');
    
    const inactiveServices = await prisma.service.findMany({
      where: {
        isActive: false,
      },
    });
    
    if (inactiveServices.length > 0) {
      console.log(`⚠️  Found ${inactiveServices.length} inactive services`);
      
      console.log('\n📋 Inactive services:');
      inactiveServices.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title} (ID: ${service.id})`);
      });
      
      console.log('\n💡 To activate these services, run:');
      console.log('   UPDATE services SET "isActive" = true WHERE "isActive" = false;');
    } else {
      console.log('✅ All services are active');
    }
    
  } catch (error) {
    console.error('❌ Error checking inactive services:', error);
  }
}

async function runDiagnostics() {
  console.log('🚀 Running service display diagnostics...\n');
  
  await checkUsers();
  await checkServices();
  await testPublicServicesQuery();
  await fixInactiveServices();
  
  console.log('\n📊 Summary:');
  console.log('===========');
  console.log('1. Check if users exist and are verified');
  console.log('2. Check if services are created and active');
  console.log('3. Test the public services query');
  console.log('4. Check for any inactive services');
  
  console.log('\n💡 Common issues and solutions:');
  console.log('- Services not showing: Check if isActive = true');
  console.log('- Empty listings: Verify users have created services');
  console.log('- API errors: Check database connection and queries');
  console.log('- Frontend issues: Check API endpoint responses');
  
  console.log('\n🎉 Diagnostics completed!');
}

runDiagnostics()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
