import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function quickSeed() {
  console.log('🌱 Quick seeding database...');

  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test Student',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Test student for development',
        university: 'Test University',
        skills: JSON.stringify(['Web Development', 'React', 'Node.js']),
        isVerified: true,
      },
    });

    console.log('✅ User created:', user.name);

    // Create sample services
    const services = [
      {
        title: 'Modern React Website',
        description: 'I will create a modern, responsive React website with TypeScript and Tailwind CSS.',
        priceCents: 50000,
        ownerId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'UI/UX Design',
        description: 'Professional UI/UX design for your mobile application with wireframes and mockups.',
        priceCents: 75000,
        ownerId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'Full-Stack App',
        description: 'Complete full-stack web application with React frontend and Node.js backend.',
        priceCents: 100000,
        ownerId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'Brand Identity',
        description: 'Complete brand identity package including logo design and brand guidelines.',
        priceCents: 30000,
        ownerId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'E-commerce Site',
        description: 'Modern e-commerce website with payment integration and admin dashboard.',
        priceCents: 150000,
        ownerId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        title: 'Mobile App Design',
        description: 'Interactive mobile app prototype using Figma with user flows and animations.',
        priceCents: 40000,
        ownerId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
    ];

    for (const serviceData of services) {
      await prisma.service.create({
        data: serviceData,
      });
    }

    console.log('✅ Created 6 sample services');
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed();
