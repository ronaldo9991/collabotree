import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/passwords.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.refreshToken.deleteMany();
  await prisma.walletEntry.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.hireRequest.deleteMany();
  await prisma.service.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@collabotree.com',
      passwordHash: await hashPassword('admin123'),
      name: 'Admin User',
      role: 'ADMIN',
      bio: 'System administrator for CollaboTree',
      skills: JSON.stringify(['Administration', 'System Management']),
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'alice@student.com',
      passwordHash: await hashPassword('student123'),
      name: 'Alice Johnson',
      role: 'STUDENT',
      bio: 'Computer Science student specializing in web development and mobile apps',
      skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'React Native', 'UI/UX Design']),
      isVerified: true,
      university: 'Stanford University',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'bob@student.com',
      passwordHash: await hashPassword('student123'),
      name: 'Bob Smith',
      role: 'STUDENT',
      bio: 'Data Science student with expertise in machine learning and analytics',
      skills: JSON.stringify(['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'TensorFlow']),
      isVerified: true,
      university: 'MIT',
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: 'charlie@buyer.com',
      passwordHash: await hashPassword('buyer123'),
      name: 'Charlie Brown',
      role: 'BUYER',
      bio: 'Small business owner looking for tech solutions',
      skills: JSON.stringify(['Business Management', 'Marketing']),
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'diana@buyer.com',
      passwordHash: await hashPassword('buyer123'),
      name: 'Diana Prince',
      role: 'BUYER',
      bio: 'Startup founder seeking development talent',
      skills: JSON.stringify(['Product Management', 'Strategy']),
    },
  });

  console.log('👥 Created users');

  // Create services
  const service1 = await prisma.service.create({
    data: {
      ownerId: student1.id,
      title: 'React Web Application Development',
      description: 'I will create a modern, responsive React web application with TypeScript, Tailwind CSS, and best practices. Includes component architecture, state management, and API integration.',
      priceCents: 50000, // $500
      isActive: true,
      isTopSelection: true, // Mark as top selection for homepage
    },
  });

  const service2 = await prisma.service.create({
    data: {
      ownerId: student1.id,
      title: 'Mobile App Development (React Native)',
      description: 'Cross-platform mobile app development using React Native. Includes UI/UX design, state management, and app store deployment.',
      priceCents: 75000, // $750
      isActive: true,
      isTopSelection: true, // Mark as top selection for homepage
    },
  });

  const service3 = await prisma.service.create({
    data: {
      ownerId: student2.id,
      title: 'Data Analysis & Visualization',
      description: 'Comprehensive data analysis using Python, pandas, and matplotlib. Includes data cleaning, statistical analysis, and interactive visualizations.',
      priceCents: 30000, // $300
      isActive: true,
      isTopSelection: true, // Mark as top selection for homepage
    },
  });

  const service4 = await prisma.service.create({
    data: {
      ownerId: student2.id,
      title: 'Machine Learning Model Development',
      description: 'Custom machine learning model development using scikit-learn and TensorFlow. Includes data preprocessing, model training, and evaluation.',
      priceCents: 100000, // $1000
      isActive: true,
    },
  });

  console.log('🛠️ Created services');

  // Create hire requests
  const hireRequest1 = await prisma.hireRequest.create({
    data: {
      buyerId: buyer1.id,
      studentId: student1.id,
      serviceId: service1.id,
      message: 'I need a web application for my small business. Can you help me create an e-commerce platform?',
      priceCents: 50000,
      status: 'ACCEPTED',
    },
  });

  const hireRequest2 = await prisma.hireRequest.create({
    data: {
      buyerId: buyer2.id,
      studentId: student2.id,
      serviceId: service3.id,
      message: 'I have customer data that needs analysis. Looking for insights and visualizations.',
      priceCents: 30000,
      status: 'PENDING',
    },
  });

  const hireRequest3 = await prisma.hireRequest.create({
    data: {
      buyerId: buyer1.id,
      studentId: student2.id,
      serviceId: service4.id,
      message: 'Need a recommendation system for my business. Is this something you can help with?',
      priceCents: 100000,
      status: 'ACCEPTED',
    },
  });

  console.log('🤝 Created hire requests');

  // Create chat room for accepted hire request
  const chatRoom1 = await prisma.chatRoom.create({
    data: {
      hireRequestId: hireRequest1.id,
    },
  });

  const chatRoom2 = await prisma.chatRoom.create({
    data: {
      hireRequestId: hireRequest3.id,
    },
  });

  // Create some sample messages
  const message1 = await prisma.message.create({
    data: {
      roomId: chatRoom1.id,
      senderId: buyer1.id,
      body: 'Hi Alice! Thanks for accepting my hire request. I\'m excited to work with you on this project.',
    },
  });

  const message2 = await prisma.message.create({
    data: {
      roomId: chatRoom1.id,
      senderId: student1.id,
      body: 'Hi Charlie! Great to meet you. I\'d love to help you build your e-commerce platform. Let\'s discuss the requirements in detail.',
    },
  });

  const message3 = await prisma.message.create({
    data: {
      roomId: chatRoom1.id,
      senderId: buyer1.id,
      body: 'Perfect! I need a simple online store with product catalog, shopping cart, and payment integration.',
    },
  });

  // Create read receipts
  await prisma.messageRead.createMany({
    data: [
      { messageId: message1.id, userId: buyer1.id },
      { messageId: message2.id, userId: student1.id },
      { messageId: message2.id, userId: buyer1.id },
      { messageId: message3.id, userId: buyer1.id },
    ],
  });

  console.log('💬 Created chat messages');

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      studentId: student1.id,
      serviceId: service1.id,
      hireRequestId: hireRequest1.id,
      priceCents: 50000,
      status: 'COMPLETED',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      studentId: student2.id,
      serviceId: service4.id,
      hireRequestId: hireRequest3.id,
      priceCents: 100000,
      status: 'IN_PROGRESS',
    },
  });

  console.log('📦 Created orders');

  // Create wallet entries (student1 gets paid for completed order)
  await prisma.walletEntry.create({
    data: {
      userId: student1.id,
      amountCents: 50000,
      reason: `Payment for order: ${service1.title}`,
    },
  });

  console.log('💰 Created wallet entries');

  // Create reviews
  await prisma.review.create({
    data: {
      orderId: order1.id,
      reviewerId: buyer1.id,
      revieweeId: student1.id,
      rating: 5,
      comment: 'Excellent work! Alice delivered exactly what I needed and was very professional throughout the project.',
    },
  });

  await prisma.review.create({
    data: {
      orderId: order1.id,
      reviewerId: student1.id,
      revieweeId: buyer1.id,
      rating: 5,
      comment: 'Great client to work with! Clear requirements and prompt communication.',
    },
  });

  console.log('⭐ Created reviews');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: 'HIRE_ACCEPTED',
        title: 'Hire Request Accepted',
        body: 'Your hire request for "React Web Application Development" has been accepted by Charlie Brown',
        read: false,
      },
      {
        userId: buyer1.id,
        type: 'ORDER_STATUS_CHANGED',
        title: 'Order Completed',
        body: 'Your order for "React Web Application Development" has been completed',
        read: true,
      },
      {
        userId: student2.id,
        type: 'HIRE_ACCEPTED',
        title: 'New Hire Request',
        body: 'You have received a new hire request for "Data Analysis & Visualization" from Diana Prince',
        read: false,
      },
    ],
  });

  console.log('🔔 Created notifications');

  // Test the "one purchase per service" rule by attempting to create a duplicate order
  try {
    await prisma.order.create({
      data: {
        buyerId: buyer1.id,
        studentId: student1.id,
        serviceId: service1.id, // Same service as order1
        priceCents: 50000,
        status: 'PENDING',
      },
    });
    console.log('❌ ERROR: Duplicate order was created - this should not happen!');
  } catch (error) {
    console.log('✅ SUCCESS: Duplicate order prevented by unique constraint');
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@collabotree.com / admin123');
  console.log('Student 1: alice@student.com / student123');
  console.log('Student 2: bob@student.com / student123');
  console.log('Buyer 1: charlie@buyer.com / buyer123');
  console.log('Buyer 2: diana@buyer.com / buyer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
