import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

export async function initializeDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Test a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}
