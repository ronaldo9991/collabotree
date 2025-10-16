import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixLocalDevelopment() {
  console.log('🔧 Fixing Local Development Environment...');

  // Step 1: Create a local .env file with SQLite database
  console.log('\n1️⃣ Creating Local Development Environment...');
  const localEnvContent = `NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL=file:./dev.db
JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
`;
  fs.writeFileSync(path.join(__dirname, '.env.local'), localEnvContent);
  console.log('✅ Local .env file created with SQLite database');

  // Step 2: Create a local Prisma schema
  console.log('\n2️⃣ Creating Local Prisma Schema...');
  const localSchemaContent = `// This is a local development schema using SQLite
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(STUDENT)
  bio       String?
  university String?
  skills    String?  // JSON string of skills array
  isVerified Boolean @default(false)
  idCardUrl String?
  verifiedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  services      Service[]
  hireRequests  HireRequest[] @relation("HireRequestBuyer")
  hireRequestsReceived HireRequest[] @relation("HireRequestStudent")
  orders        Order[]
  reviews       Review[]
  notifications Notification[]

  @@map("users")
}

model Service {
  id          String   @id @default(cuid())
  title       String
  description String
  priceCents  Int
  coverImage  String?
  isActive    Boolean  @default(true)
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner       User           @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  hireRequests HireRequest[]
  orders      Order[]
  reviews     Review[]

  @@map("services")
}

model HireRequest {
  id        String   @id @default(cuid())
  serviceId String
  buyerId   String
  studentId String
  message   String
  priceCents Int
  status    HireRequestStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  buyer   User    @relation("HireRequestBuyer", fields: [buyerId], references: [id], onDelete: Cascade)
  student User    @relation("HireRequestStudent", fields: [studentId], references: [id], onDelete: Cascade)
  orders  Order[]
  reviews Review[]

  @@map("hire_requests")
}

model Order {
  id           String      @id @default(cuid())
  hireRequestId String
  serviceId    String
  buyerId      String
  studentId    String
  priceCents   Int
  status       OrderStatus @default(PENDING)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  hireRequest HireRequest @relation(fields: [hireRequestId], references: [id], onDelete: Cascade)
  service     Service     @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  buyer       User        @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  student     User        @relation(fields: [studentId], references: [id], onDelete: Cascade)
  reviews     Review[]

  @@map("orders")
}

model Review {
  id        String   @id @default(cuid())
  orderId   String
  serviceId String
  buyerId   String
  studentId String
  rating    Int      // 1-5 stars
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  buyer   User    @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  student User    @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@map("reviews")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

enum Role {
  STUDENT
  BUYER
  ADMIN
}

enum HireRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum NotificationType {
  HIRE_REQUEST
  ORDER_UPDATE
  REVIEW
  SYSTEM
}
`;
  fs.writeFileSync(path.join(__dirname, 'prisma', 'schema.local.sqlite'), localSchemaContent);
  console.log('✅ Local Prisma schema created');

  // Step 3: Create a seed script for local development
  console.log('\n3️⃣ Creating Local Seed Script...');
  const seedScript = `import { PrismaClient } from '@prisma/client';
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
    console.log('\\n📋 Sample Data Created:');
    console.log('   👥 Users: 3 (2 students, 1 buyer)');
    console.log('   🛠️ Services: 6');
    console.log('\\n🔑 Login Credentials:');
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
`;
  fs.writeFileSync(path.join(__dirname, 'seed-local.js'), seedScript);
  console.log('✅ Local seed script created');

  // Step 4: Create a local development startup script
  console.log('\n4️⃣ Creating Local Development Startup Script...');
  const startupScript = `import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Local Development Environment...');

try {
  // Set environment to use local database
  process.env.NODE_ENV = 'development';
  process.env.DATABASE_URL = 'file:./dev.db';
  
  console.log('📋 Environment Variables:');
  console.log('   NODE_ENV: development');
  console.log('   DATABASE_URL: file:./dev.db (SQLite)');
  console.log('   PORT: 4000');
  
  // Generate Prisma client for local schema
  console.log('\\n🔧 Generating Prisma client for local database...');
  execSync('npx prisma generate --schema=./prisma/schema.local.sqlite', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  // Push local schema to database
  console.log('\\n💾 Setting up local database...');
  execSync('npx prisma db push --schema=./prisma/schema.local.sqlite', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  // Seed the database
  console.log('\\n🌱 Seeding local database...');
  execSync('node seed-local.js', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  console.log('\\n🎉 Local development environment ready!');
  console.log('\\n📋 Server Information:');
  console.log('   🌐 URL: http://localhost:4000');
  console.log('   🔗 Health: http://localhost:4000/api/health');
  console.log('   🔗 Services: http://localhost:4000/api/public/services');
  console.log('   💾 Database: SQLite (local)');
  console.log('\\n💡 Press Ctrl+C to stop the server');
  
  // Start the server
  execSync('npm run dev', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
} catch (error) {
  console.error('❌ Failed to start local development:', error.message);
  process.exit(1);
}
`;
  fs.writeFileSync(path.join(__dirname, 'start-local-dev.js'), startupScript);
  console.log('✅ Local development startup script created');

  // Step 5: Update package.json with local development scripts
  console.log('\n5️⃣ Updating Package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'dev:local': 'node start-local-dev.js',
    'db:local': 'npx prisma db push --schema=./prisma/schema.local.sqlite',
    'seed:local': 'node seed-local.js',
    'studio:local': 'npx prisma studio --schema=./prisma/schema.local.sqlite',
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json updated with local development scripts');

  console.log('\n🎉 Local Development Fix Complete!');
  console.log('\n📋 What was created:');
  console.log('   ✅ .env.local - Local environment variables');
  console.log('   ✅ schema.local.sqlite - Local Prisma schema');
  console.log('   ✅ seed-local.js - Sample data seeding');
  console.log('   ✅ start-local-dev.js - Local development startup');
  console.log('   ✅ Updated package.json with local scripts');
  console.log('\n🚀 How to start local development:');
  console.log('   1. Run: npm run dev:local');
  console.log('   2. This will:');
  console.log('      - Set up SQLite database');
  console.log('      - Generate Prisma client');
  console.log('      - Seed with sample data');
  console.log('      - Start the server');
  console.log('\n💡 Benefits:');
  console.log('   - No Railway database dependency');
  console.log('   - Fast local development');
  console.log('   - Sample data for testing');
  console.log('   - Explore Talent page will work');
  console.log('   - All services will be visible');
}

fixLocalDevelopment();
