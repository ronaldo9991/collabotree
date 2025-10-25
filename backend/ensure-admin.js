#!/usr/bin/env node

/**
 * Ensure Admin User Exists in Railway Database
 * This script checks if the admin user exists and creates it if not
 * Safe to run multiple times - won't duplicate or clear data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function ensureAdmin() {
  try {
    console.log('🔍 Checking for admin user in database...');
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        email: 'admin@collabotree.com'
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin.id}`);
      
      // Verify password is correct
      const passwordMatch = await bcrypt.compare('admin123', existingAdmin.passwordHash);
      if (passwordMatch) {
        console.log('✅ Password is correct!');
      } else {
        console.log('⚠️  Password might need updating. Updating now...');
        const newPasswordHash = await bcrypt.hash('admin123', 12);
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { passwordHash: newPasswordHash }
        });
        console.log('✅ Password updated successfully!');
      }
    } else {
      console.log('❌ Admin user not found. Creating now...');
      
      // Create admin user
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@collabotree.com',
          passwordHash,
          name: 'Admin User',
          role: 'ADMIN',
          bio: 'System administrator for CollaboTree',
          skills: JSON.stringify(['Administration', 'System Management']),
          isVerified: true,
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin.id}`);
    }
    
    console.log('\n🎉 Admin credentials:');
    console.log('   Email: admin@collabotree.com');
    console.log('   Password: admin123');
    console.log('\n📱 Login URLs:');
    console.log('   Admin: /admin/signin');
    console.log('   Regular: /signin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ensureAdmin();

