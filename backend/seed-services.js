#!/usr/bin/env node

/**
 * Seed Services for Production
 * Creates sample services for testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedServices() {
  console.log('🌱 Seeding services for production...');
  
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
          bio: 'Test user for production',
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
    
    if (existingServices > 0) {
      console.log('✅ Services already exist, skipping seed');
      return;
    }
    
    // Create sample services
    const sampleServices = [
      {
        title: 'Professional Website Development',
        description: 'I will create a modern, responsive website using React and Node.js. Perfect for businesses looking to establish their online presence.',
        priceCents: 15000, // $150
        category: 'Web Development',
        tags: ['React', 'Node.js', 'MongoDB', 'Responsive Design'],
        deliveryDays: 14,
        ownerId: student.id,
        isActive: true
      },
      {
        title: 'Mobile App Development',
        description: 'I will develop a cross-platform mobile application using React Native. Great for startups and businesses.',
        priceCents: 25000, // $250
        category: 'Mobile Development',
        tags: ['React Native', 'JavaScript', 'iOS', 'Android'],
        deliveryDays: 21,
        ownerId: student.id,
        isActive: true
      },
      {
        title: 'Data Analysis & Visualization',
        description: 'I will analyze your data and create beautiful visualizations using Python, Pandas, and Tableau.',
        priceCents: 8000, // $80
        category: 'Data Science',
        tags: ['Python', 'Pandas', 'Tableau', 'Statistics'],
        deliveryDays: 10,
        ownerId: student.id,
        isActive: true
      },
      {
        title: 'UI/UX Design',
        description: 'I will design beautiful and user-friendly interfaces for your web or mobile application.',
        priceCents: 12000, // $120
        category: 'Design',
        tags: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
        deliveryDays: 7,
        ownerId: student.id,
        isActive: true
      },
      {
        title: 'Backend API Development',
        description: 'I will create a robust REST API using Node.js, Express, and PostgreSQL with proper authentication.',
        priceCents: 18000, // $180
        category: 'Backend Development',
        tags: ['Node.js', 'Express', 'PostgreSQL', 'JWT'],
        deliveryDays: 12,
        ownerId: student.id,
        isActive: true
      }
    ];
    
    console.log('📝 Creating sample services...');
    
    for (const serviceData of sampleServices) {
      const service = await prisma.service.create({
        data: serviceData
      });
      console.log(`✅ Created service: ${service.title}`);
    }
    
    console.log('🎉 Service seeding completed successfully!');
    console.log(`Created ${sampleServices.length} sample services`);
    
  } catch (error) {
    console.error('❌ Service seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedServices()
  .then(() => {
    console.log('✅ Service seeding completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Service seeding failed:', error);
    process.exit(1);
  });
