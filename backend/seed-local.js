import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedLocalDatabase() {
  console.log('🌱 Seeding local database...');

  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const student1 = await prisma.user.upsert({
      where: { email: 'student1@example.com' },
      update: {},
      create: {
        email: 'student1@example.com',
        name: 'Alice Johnson',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Computer Science student at MIT',
        university: 'MIT',
        skills: JSON.stringify(['Web Development', 'React', 'Node.js']),
        isVerified: true,
      },
    });

    const student2 = await prisma.user.upsert({
      where: { email: 'student2@example.com' },
      update: {},
      create: {
        email: 'student2@example.com',
        name: 'Bob Smith',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Design student at Stanford',
        university: 'Stanford',
        skills: JSON.stringify(['UI/UX Design', 'Figma', 'Adobe Creative Suite']),
        isVerified: true,
      },
    });

    const buyer1 = await prisma.user.upsert({
      where: { email: 'buyer1@example.com' },
      update: {},
      create: {
        email: 'buyer1@example.com',
        name: 'Charlie Brown',
        password: hashedPassword,
        role: 'BUYER',
        bio: 'Startup founder looking for talented students',
      },
    });

    console.log('✅ Users created');

    // Create sample services
    const services = [
      {
        title: 'Modern React Website Development',
        description: 'I will create a modern, responsive React website with TypeScript and Tailwind CSS. Perfect for startups and small businesses.',
        priceCents: 50000, // $500
        ownerId: student1.id,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'UI/UX Design for Mobile App',
        description: 'Professional UI/UX design for your mobile application. I will create wireframes, mockups, and a complete design system.',
        priceCents: 75000, // $750
        ownerId: student2.id,
        coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'Full-Stack Web Application',
        description: 'Complete full-stack web application with React frontend and Node.js backend. Includes database design and deployment.',
        priceCents: 100000, // $1000
        ownerId: student1.id,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'Brand Identity Design',
        description: 'Complete brand identity package including logo design, color palette, typography, and brand guidelines.',
        priceCents: 30000, // $300
        ownerId: student2.id,
        coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'E-commerce Website Development',
        description: 'Modern e-commerce website with payment integration, inventory management, and admin dashboard.',
        priceCents: 150000, // $1500
        ownerId: student1.id,
        coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'Mobile App Prototype',
        description: 'Interactive mobile app prototype using Figma. Includes user flows, animations, and design specifications.',
        priceCents: 40000, // $400
        ownerId: student2.id,
        coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
    ];

    for (const serviceData of services) {
      await prisma.service.upsert({
        where: { 
          title_ownerId: {
            title: serviceData.title,
            ownerId: serviceData.ownerId,
          }
        },
        update: {},
        create: serviceData,
      });
    }

    console.log('✅ Services created');
    console.log('🎉 Local database seeded successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('   👥 Users: 3 (2 students, 1 buyer)');
    console.log('   🛠️ Services: 6');
    console.log('\n🔑 Login Credentials:');
    console.log('   Student: student1@example.com / password123');
    console.log('   Student: student2@example.com / password123');
    console.log('   Buyer: buyer1@example.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLocalDatabase();
