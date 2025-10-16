import { prisma } from './prisma.js';
import { env } from '../config/env.js';

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing database...');
    
    // Test connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    // Run migrations
    console.log('📦 Running database migrations...');
    // Note: Prisma migrations are handled by the build process
    
    // Check if we need to seed the database
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);
    
    if (userCount === 0 && env.NODE_ENV === 'production') {
      console.log('🌱 Database is empty, seeding...');
      // You can add seeding logic here if needed
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}
