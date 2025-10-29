#!/usr/bin/env node

/**
 * Quick Admin Creator - Run this directly on Railway
 * Usage: node quick-create-admin.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🚀 Quick Admin Creator Starting...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Check if admin exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@collabotree.com' }
    });

    if (existing) {
      console.log('⚠️  Admin already exists, updating password...');
      const hash = await bcrypt.hash('admin123', 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: { 
          passwordHash: hash,
          role: 'ADMIN',
          isVerified: true
        }
      });
      console.log('✅ Admin password updated!');
    } else {
      console.log('📝 Creating new admin user...');
      const hash = await bcrypt.hash('admin123', 12);
      await prisma.user.create({
        data: {
          email: 'admin@collabotree.com',
          passwordHash: hash,
          name: 'Admin User',
          role: 'ADMIN',
          bio: 'System Administrator',
          skills: JSON.stringify(['Administration']),
          isVerified: true
        }
      });
      console.log('✅ Admin user created!');
    }

    console.log('\n🎉 SUCCESS!');
    console.log('📧 Email: admin@collabotree.com');
    console.log('🔑 Password: admin123');
    console.log('🔗 Login at: /admin/signin or /signin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();







