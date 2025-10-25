import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startEverything() {
  console.log('🚀 Starting Everything - Backend, Database, and Services...');

  // Ensure .env is loaded
  import('dotenv/config');

  console.log('📋 Environment Variables Set:');
  console.log(`   ✅ NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   ✅ PORT: ${process.env.PORT}`);
  console.log(`   ✅ DATABASE_URL: ${process.env.DATABASE_URL}`);

  try {
    console.log('\n1️⃣ Generating Prisma Client for SQLite...');
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: __dirname,
    });
    console.log('✅ Prisma Client generated.');

    console.log('\n2️⃣ Pushing SQLite Schema...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: __dirname,
    });
    console.log('✅ SQLite Schema pushed.');

    console.log('\n3️⃣ Seeding Database with Comprehensive Data...');
    execSync('node comprehensive-seed.js', {
      stdio: 'inherit',
      cwd: __dirname,
    });
    console.log('✅ Database seeded.');

    console.log('\n4️⃣ Starting Backend Server...');
    console.log('\n🎉 Backend Server Starting!');
    console.log('\n📋 Server Information:');
    console.log('   🌐 URL: http://localhost:4000');
    console.log('   🔗 Health: http://localhost:4000/api/health');
    console.log('   🔗 API: http://localhost:4000/api');
    console.log('   💾 Database: Local SQLite with sample data');
    console.log('\n💡 Next Steps:');
    console.log('   1. Start frontend: cd ../client && npm run dev');
    console.log('   2. Go to http://localhost:3000');
    console.log('   3. Sign up for an account');
    console.log('   4. Go to Explore Talent page');
    console.log('   5. Everything should work perfectly!');
    console.log('\n💡 Press Ctrl+C to stop the server');

    execSync('npm run dev', {
      stdio: 'inherit',
      cwd: __dirname,
    });
  } catch (error) {
    console.error('❌ Failed to start everything:', error.message);
    process.exit(1);
  }
}

startEverything();
