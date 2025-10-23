#!/usr/bin/env node

/**
 * Database Operations Test Script
 * Tests if database operations are working on Railway
 */

import { PrismaClient } from '@prisma/client';
import { env } from './src/config/env.js';

const prisma = new PrismaClient();

async function testDatabaseOperations() {
  console.log(`
🗄️  DATABASE OPERATIONS TEST
============================

Testing database operations on Railway...
`);

  try {
    // Test 1: Database connection
    console.log('🔍 Test 1: Database Connection');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    console.log('');

    // Test 2: Check if tables exist
    console.log('🔍 Test 2: Check Database Schema');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table exists (${userCount} users)`);
    } catch (error) {
      console.log('❌ Users table missing or inaccessible');
      console.log('Error:', error.message);
      throw error;
    }

    // Test 3: Create a test user
    console.log('🔍 Test 3: Create Test User');
    try {
      const bcrypt = await import('bcrypt');
      const testPassword = await bcrypt.hash('test123', 12);
      
      const testUser = await prisma.user.create({
        data: {
          email: 'dbtest@example.com',
          passwordHash: testPassword,
          name: 'Database Test User',
          username: 'dbtest',
          role: 'BUYER',
          bio: 'Database test user',
        }
      });
      
      console.log('✅ Test user created successfully');
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Role: ${testUser.role}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️  Test user already exists (this is OK)');
      } else {
        console.log('❌ Failed to create test user');
        console.log('Error:', error.message);
        throw error;
      }
    }

    // Test 4: Query users
    console.log('🔍 Test 4: Query Users');
    try {
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      
      console.log(`✅ Successfully queried ${users.length} users`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    } catch (error) {
      console.log('❌ Failed to query users');
      console.log('Error:', error.message);
      throw error;
    }

    // Test 5: Test registration flow
    console.log('🔍 Test 5: Test Registration Flow');
    try {
      const bcrypt = await import('bcrypt');
      const registrationData = {
        email: 'registration-test@example.com',
        password: 'RegistrationTest123',
        name: 'Registration Test User',
        username: 'registrationtest',
        role: 'STUDENT',
        university: 'Test University',
        bio: 'Registration test user',
        skills: ['JavaScript', 'React']
      };

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { email: registrationData.email },
            { username: registrationData.username }
          ]
        }
      });

      if (existingUser) {
        console.log('⚠️  Registration test user already exists (this is OK)');
      } else {
        // Hash password
        const passwordHash = await bcrypt.hash(registrationData.password, 12);

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: registrationData.email,
            passwordHash,
            name: registrationData.name,
            username: registrationData.username,
            role: registrationData.role,
            university: registrationData.university,
            bio: registrationData.bio,
            skills: JSON.stringify(registrationData.skills),
          },
        });

        console.log('✅ Registration flow test successful');
        console.log(`   Created user: ${newUser.name} (${newUser.email})`);
      }
    } catch (error) {
      console.log('❌ Registration flow test failed');
      console.log('Error:', error.message);
      throw error;
    }

    console.log(`
✅ ALL DATABASE TESTS PASSED!
=============================

Your Railway database is working correctly:
- ✅ Database connection successful
- ✅ Schema exists and accessible
- ✅ User creation works
- ✅ User queries work
- ✅ Registration flow works

The database is ready for your application!
`);

  } catch (error) {
    console.log(`
❌ DATABASE TESTS FAILED
========================

Error: ${error.message}

This indicates a problem with:
1. Database connection
2. Database schema
3. Database permissions
4. Environment configuration

Check your Railway deployment logs for more details.
`);

    if (error.message.includes('connect')) {
      console.log(`
🔧 CONNECTION ISSUE
==================

The database connection is failing. Check:
1. DATABASE_URL is set correctly in Railway
2. PostgreSQL service is running
3. Database credentials are correct
`);
    } else if (error.message.includes('relation') || error.message.includes('table')) {
      console.log(`
🔧 SCHEMA ISSUE
===============

The database schema is missing or incorrect. Check:
1. Database migrations have run
2. Prisma schema is correct
3. Database permissions allow table creation
`);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testDatabaseOperations().catch(console.error);
