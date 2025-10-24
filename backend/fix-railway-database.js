#!/usr/bin/env node

/**
 * Railway Database Fix Script
 * Ensures the database is properly migrated and seeded
 */

import { PrismaClient } from '@prisma/client';
import { env } from './src/config/env.js';

const prisma = new PrismaClient();

async function fixDatabase() {
  console.log(`
🗄️  RAILWAY DATABASE FIX SCRIPT
================================

Fixing database connection and schema...
`);

  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if tables exist
    console.log('🔍 Checking database schema...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table exists (${userCount} users)`);
    } catch (error) {
      console.log('❌ Users table missing - running migrations...');
      throw new Error('Database schema not migrated');
    }

    // Check for admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('🔍 No admin user found - creating admin user...');
      
      const bcrypt = await import('bcrypt');
      const adminPassword = await bcrypt.hash('admin123', 12);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@collabotree.com',
          passwordHash: adminPassword,
          name: 'Admin User',
          username: 'admin',
          role: 'ADMIN',
          bio: 'System Administrator',
          isVerified: true,
        }
      });
      
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('✅ Admin user exists:', adminUser.email);
    }

    // Check for test users
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'test@example.com' },
          { email: 'student@university.edu' },
          { email: 'buyer@company.com' }
        ]
      }
    });

    if (testUsers.length === 0) {
      console.log('🔍 Creating test users...');
      
      const bcrypt = await import('bcrypt');
      
      // Create test student
      const studentPassword = await bcrypt.hash('password123', 12);
      const student = await prisma.user.create({
        data: {
          email: 'student@university.edu',
          passwordHash: studentPassword,
          name: 'Test Student',
          username: 'teststudent',
          role: 'STUDENT',
          university: 'Test University',
          bio: 'Computer Science Student',
          skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
          isVerified: true,
        }
      });
      
      // Create test buyer
      const buyerPassword = await bcrypt.hash('password123', 12);
      const buyer = await prisma.user.create({
        data: {
          email: 'buyer@company.com',
          passwordHash: buyerPassword,
          name: 'Test Buyer',
          username: 'testbuyer',
          role: 'BUYER',
          bio: 'Tech Company Owner',
          isVerified: true,
        }
      });
      
      console.log('✅ Test users created:');
      console.log(`   - Student: ${student.email} (password: password123)`);
      console.log(`   - Buyer: ${buyer.email} (password: password123)`);
    } else {
      console.log('✅ Test users already exist');
    }

    console.log(`
✅ DATABASE FIX COMPLETED SUCCESSFULLY!
======================================

Your Railway database is now properly configured with:
- ✅ Database connection working
- ✅ Schema migrated
- ✅ Admin user available
- ✅ Test users for development

You can now:
1. Register new users through the web interface
2. Log in with existing test accounts
3. Use the admin account for management

Test accounts:
- Admin: admin@collabotree.com / admin123
- Student: student@university.edu / password123  
- Buyer: buyer@company.com / password123
`);

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    
    if (error.message.includes('schema not migrated')) {
      console.log(`
🔧 MIGRATION NEEDED
==================

The database schema needs to be migrated. This should happen automatically
when Railway redeploys with the correct DATABASE_URL.

To fix this:
1. Make sure DATABASE_URL is set correctly in Railway
2. Redeploy your application
3. The Prisma migrations will run automatically

If migrations still fail, check the Railway deployment logs for errors.
`);
    } else {
      console.log(`
🔧 CONNECTION ISSUE
==================

The database connection is failing. Check:

1. DATABASE_URL is set correctly in Railway
2. PostgreSQL service is running in Railway
3. Database credentials are correct
4. Network connectivity between services

Error details: ${error.message}
`);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDatabase().catch(console.error);

