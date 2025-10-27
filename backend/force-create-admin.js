#!/usr/bin/env node

/**
 * Force Create Admin User
 * This script WILL create or update the admin user no matter what
 * Run this directly: node force-create-admin.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function forceCreateAdmin() {
  console.log('\n🚀 Force Creating Admin User...\n');
  
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');

    const adminEmail = 'admin@collabotree.com';
    const adminPassword = 'admin123';

    // First, try to find existing admin
    console.log(`\n🔍 Checking for existing user: ${adminEmail}`);
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    if (existingUser) {
      console.log('⚠️  User exists! Updating to ensure ADMIN role and correct password...');
      
      const updated = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          passwordHash: passwordHash,
          role: 'ADMIN',
          name: 'Admin User',
          isVerified: true,
          bio: 'System Administrator',
          skills: JSON.stringify(['Administration', 'System Management'])
        }
      });
      
      console.log('✅ Admin user UPDATED successfully!');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Name: ${updated.name}`);
      console.log(`   Role: ${updated.role}`);
      console.log(`   Verified: ${updated.isVerified}`);
    } else {
      console.log('📝 No existing user. Creating new admin...');
      
      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: passwordHash,
          name: 'Admin User',
          role: 'ADMIN',
          bio: 'System Administrator',
          skills: JSON.stringify(['Administration', 'System Management']),
          isVerified: true
        }
      });
      
      console.log('✅ Admin user CREATED successfully!');
      console.log(`   ID: ${newAdmin.id}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Name: ${newAdmin.name}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   Verified: ${newAdmin.isVerified}`);
    }

    // Verify the admin user exists and can be found
    console.log('\n🔍 Verifying admin user in database...');
    const verifyAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (verifyAdmin) {
      console.log('✅ VERIFICATION SUCCESSFUL!');
      console.log('   Admin user exists in database');
      console.log(`   Email: ${verifyAdmin.email}`);
      console.log(`   Role: ${verifyAdmin.role}`);
      
      // Test password
      const passwordMatch = await bcrypt.compare(adminPassword, verifyAdmin.passwordHash);
      if (passwordMatch) {
        console.log('✅ Password verification SUCCESSFUL!');
      } else {
        console.log('❌ Password verification FAILED!');
      }
    } else {
      console.log('❌ VERIFICATION FAILED - Admin user not found after creation!');
    }

    // Count total users
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

    // List all admin users
    const allAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    console.log(`👥 Total admin users: ${allAdmins.length}`);
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name})`);
    });

    console.log('\n🎉 SUCCESS! Admin user is ready!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('   Email: admin@collabotree.com');
    console.log('   Password: admin123');
    console.log('\n🔗 Login at: /admin/signin');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database disconnected');
  }
}

// Run it
forceCreateAdmin()
  .then(() => {
    console.log('\n✨ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });




