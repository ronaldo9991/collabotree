#!/usr/bin/env node

/**
 * Seed Test Services
 * Creates test services for debugging service display issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestServices() {
  console.log('🌱 Seeding test services...');
  
  try {
    // Check if we have any users
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in database`);
    
    if (userCount === 0) {
      console.log('⚠️ No users found. Creating a test user...');
      
      // Create a test user
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedpassword', // In real app, this would be properly hashed
          role: 'STUDENT',
          bio: 'Test user for debugging',
          university: 'Test University',
          skills: ['JavaScript', 'React', 'Node.js'],
          isVerified: true,
          verifiedAt: new Date()
        }
      });
      
      console.log('✅ Test user created:', testUser.id);
    }
    
    // Get the first student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' }
    });
    
    if (!student) {
      console.log('❌ No student users found');
      return;
    }
    
    console.log('👤 Using student:', student.name);
    
    // Check if services already exist
    const existingServices = await prisma.service.count();
    console.log(`Found ${existingServices} existing services`);
    
    // Create test services
    const testServices = [
      {
        title: 'Test Service 1 - Web Development',
        description: 'This is a test service for debugging. I will create a modern website using React and Node.js.',
        priceCents: 10000, // $100
        category: 'Web Development',
        tags: ['React', 'Node.js', 'MongoDB'],
        deliveryDays: 7,
        ownerId: student.id,
        isActive: true
      },
      {
        title: 'Test Service 2 - Mobile App',
        description: 'This is another test service for debugging. I will develop a mobile app using React Native.',
        priceCents: 15000, // $150
        category: 'Mobile Development',
        tags: ['React Native', 'JavaScript'],
        deliveryDays: 14,
        ownerId: student.id,
        isActive: true
      },
      {
        title: 'Test Service 3 - Data Analysis',
        description: 'This is a third test service for debugging. I will analyze your data and create visualizations.',
        priceCents: 8000, // $80
        category: 'Data Science',
        tags: ['Python', 'Pandas', 'Tableau'],
        deliveryDays: 10,
        ownerId: student.id,
        isActive: true
      }
    ];
    
    console.log('📝 Creating test services...');
    
    for (const serviceData of testServices) {
      const service = await prisma.service.create({
        data: serviceData
      });
      console.log(`✅ Created test service: ${service.title}`);
    }
    
    console.log('🎉 Test service seeding completed successfully!');
    console.log(`Created ${testServices.length} test services`);
    
    // Verify services were created
    const totalServices = await prisma.service.count();
    console.log(`Total services in database: ${totalServices}`);
    
  } catch (error) {
    console.error('❌ Test service seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedTestServices()
  .then(() => {
    console.log('✅ Test service seeding completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test service seeding failed:', error);
    process.exit(1);
  });
