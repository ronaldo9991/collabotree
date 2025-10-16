import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testDatabaseServices() {
  console.log('🔍 Testing Database and Services...');
  
  try {
    // Test database connection
    console.log('\n1️⃣ Testing Database Connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test basic query
    console.log('\n2️⃣ Testing Basic Query...');
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic query successful:', testQuery);
    
    // Check if services table exists
    console.log('\n3️⃣ Checking Services Table...');
    try {
      const serviceCount = await prisma.service.count();
      console.log(`✅ Services table exists with ${serviceCount} services`);
      
      if (serviceCount > 0) {
        // Get sample services
        const sampleServices = await prisma.service.findMany({
          take: 3,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                isVerified: true,
              }
            }
          }
        });
        
        console.log('\n📋 Sample Services:');
        sampleServices.forEach((service, index) => {
          console.log(`   ${index + 1}. ${service.title} - $${service.priceCents / 100} - Owner: ${service.owner?.name || 'Unknown'}`);
        });
      } else {
        console.log('⚠️ No services found in database');
      }
    } catch (error) {
      console.log('❌ Services table error:', error.message);
    }
    
    // Check users table
    console.log('\n4️⃣ Checking Users Table...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table exists with ${userCount} users`);
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

testDatabaseServices();
