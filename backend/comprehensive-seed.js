import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function comprehensiveSeed() {
  console.log('🌱 Seeding database with comprehensive data...');

  // Create test users
  const passwordHash = await hash('password123', 10);
  
  const testUsers = [
    {
      email: 'student@example.com',
      passwordHash,
      name: 'Alice Johnson',
      username: 'alice_dev',
      role: 'STUDENT',
      bio: 'Computer Science student at MIT. Passionate about web development and AI.',
      university: 'MIT',
      skills: '["React", "Node.js", "Python", "Machine Learning"]',
    },
    {
      email: 'buyer@example.com',
      passwordHash,
      name: 'Bob Smith',
      username: 'bob_manager',
      role: 'BUYER',
      bio: 'Product Manager at TechCorp. Looking for talented students to help with projects.',
      university: null,
      skills: null,
    },
    {
      email: 'designer@example.com',
      passwordHash,
      name: 'Carol Davis',
      username: 'carol_design',
      role: 'STUDENT',
      bio: 'UI/UX Design student at Stanford. Creating beautiful and functional designs.',
      university: 'Stanford',
      skills: '["Figma", "Adobe Creative Suite", "UI/UX Design", "Prototyping"]',
    },
    {
      email: 'developer@example.com',
      passwordHash,
      name: 'David Wilson',
      username: 'david_coder',
      role: 'STUDENT',
      bio: 'Full-stack developer student at Berkeley. Building amazing web applications.',
      university: 'UC Berkeley',
      skills: '["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"]',
    }
  ];

  const createdUsers = [];
  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: userData,
    });
    createdUsers.push(user);
    console.log('Created user:', user.email);
  }

  // Create comprehensive services
  const servicesData = [
    {
      title: 'Modern React Website Development',
      description: 'I will create a modern, responsive React website with TypeScript and Tailwind CSS. Perfect for startups and small businesses looking to establish their online presence.',
      priceCents: 50000,
      ownerId: createdUsers[0].id,
    },
    {
      title: 'UI/UX Design for Mobile App',
      description: 'Professional UI/UX design for your mobile application. I will create wireframes, mockups, and a complete design system that users will love.',
      priceCents: 75000,
      ownerId: createdUsers[2].id,
    },
    {
      title: 'Full-Stack Web Application',
      description: 'Complete full-stack web application with React frontend and Node.js backend. Includes database design, API development, and deployment.',
      priceCents: 100000,
      ownerId: createdUsers[3].id,
    },
    {
      title: 'Brand Identity Design',
      description: 'Complete brand identity package including logo design, color palette, typography, and brand guidelines. Perfect for new businesses.',
      priceCents: 30000,
      ownerId: createdUsers[2].id,
    },
    {
      title: 'E-commerce Website Development',
      description: 'Modern e-commerce website with payment integration, inventory management, and admin dashboard. Built with the latest technologies.',
      priceCents: 150000,
      ownerId: createdUsers[3].id,
    },
    {
      title: 'Mobile App Prototype',
      description: 'Interactive mobile app prototype using Figma. Includes user flows, animations, and design specifications for development.',
      priceCents: 40000,
      ownerId: createdUsers[2].id,
    },
    {
      title: 'Data Analysis Dashboard',
      description: 'Create a comprehensive data analysis dashboard with interactive charts and real-time data visualization using modern tools.',
      priceCents: 80000,
      ownerId: createdUsers[0].id,
    },
    {
      title: 'Machine Learning Model Development',
      description: 'Develop and train machine learning models for your specific use case. Includes data preprocessing, model training, and deployment.',
      priceCents: 120000,
      ownerId: createdUsers[0].id,
    },
    {
      title: 'API Development and Integration',
      description: 'Build robust REST APIs and integrate with third-party services. Includes documentation and testing.',
      priceCents: 60000,
      ownerId: createdUsers[3].id,
    },
    {
      title: 'WordPress Website Development',
      description: 'Custom WordPress website with theme development, plugin integration, and SEO optimization.',
      priceCents: 35000,
      ownerId: createdUsers[3].id,
    }
  ];

  for (const service of servicesData) {
    await prisma.service.upsert({
      where: { id: service.title.replace(/\s+/g, '-').toLowerCase() },
      update: service,
      create: service,
    });
    console.log('Created service:', service.title);
  }

  console.log('✅ Database seeded successfully with comprehensive data!');
  console.log('📊 Created:');
  console.log('   - 4 test users (2 students, 1 buyer, 1 designer)');
  console.log('   - 10 sample services');
  console.log('   - Ready for testing sign up and explore talent features');
}

comprehensiveSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
