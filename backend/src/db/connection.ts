import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { execSync } from 'child_process';

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
    
    // Check if tables exist, if not, push schema
    try {
      await prisma.service.count();
      console.log('✅ Database tables exist');
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('🔧 Database tables missing, pushing schema...');
        try {
          execSync('npx prisma db push --accept-data-loss', { 
            stdio: 'inherit' 
          });
          console.log('✅ Database schema pushed successfully');
          
          // Regenerate Prisma client
          execSync('npx prisma generate', { 
            stdio: 'inherit' 
          });
          console.log('✅ Prisma client regenerated');
          
        } catch (pushError) {
          console.error('❌ Failed to push database schema:', pushError);
          throw pushError;
        }
      } else {
        throw error;
      }
    }
    
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
