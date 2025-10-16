#!/usr/bin/env node

/**
 * Test Services API - Verify services are accessible
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testServicesAPI() {
  console.log('🧪 Testing Services API...\n');

  try {
    // Test 1: Check if services exist in database
    console.log('1. Checking services in database...');
    const services = await prisma.service.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            isVerified: true,
          },
        },
      },
    });

    console.log(`✅ Found ${services.length} services in database:`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} - $${service.priceCents / 100} (${service.owner.name}) - Active: ${service.isActive}`);
    });

    // Test 2: Check active services
    console.log('\n2. Checking active services...');
    const activeServices = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Found ${activeServices.length} active services:`);
    activeServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} - $${service.priceCents / 100} (${service.owner.name})`);
    });

    // Test 3: Check top selection services
    console.log('\n3. Checking top selection services...');
    const topServices = await prisma.service.findMany({
      where: { 
        isActive: true,
        isTopSelection: true 
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Found ${topServices.length} top selection services:`);
    topServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} - $${service.priceCents / 100} (${service.owner.name})`);
    });

    // Test 4: Check users
    console.log('\n4. Checking users...');
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - Verified: ${user.isVerified}`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total services: ${services.length}`);
    console.log(`- Active services: ${activeServices.length}`);
    console.log(`- Top selection services: ${topServices.length}`);
    console.log(`- Total users: ${users.length}`);

    if (activeServices.length === 0) {
      console.log('\n❌ NO ACTIVE SERVICES FOUND!');
      console.log('This is why services are not visible. Run the fix script.');
    } else {
      console.log('\n✅ Services are in database and should be visible!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServicesAPI();

