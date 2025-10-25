import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Local Development Environment...');

try {
  // Set environment to use local database
  process.env.NODE_ENV = 'development';
  process.env.DATABASE_URL = 'file:./dev.db';
  
  console.log('📋 Environment Variables:');
  console.log('   NODE_ENV: development');
  console.log('   DATABASE_URL: file:./dev.db (SQLite)');
  console.log('   PORT: 4000');
  
  // Generate Prisma client for local schema
  console.log('\n🔧 Generating Prisma client for local database...');
  execSync('npx prisma generate --schema=./prisma/schema.local.sqlite', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  // Push local schema to database
  console.log('\n💾 Setting up local database...');
  execSync('npx prisma db push --schema=./prisma/schema.local.sqlite', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  // Seed the database
  console.log('\n🌱 Seeding local database...');
  execSync('node seed-local.js', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  console.log('\n🎉 Local development environment ready!');
  console.log('\n📋 Server Information:');
  console.log('   🌐 URL: http://localhost:4000');
  console.log('   🔗 Health: http://localhost:4000/api/health');
  console.log('   🔗 Services: http://localhost:4000/api/public/services');
  console.log('   💾 Database: SQLite (local)');
  console.log('\n💡 Press Ctrl+C to stop the server');
  
  // Start the server
  execSync('npm run dev', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
} catch (error) {
  console.error('❌ Failed to start local development:', error.message);
  process.exit(1);
}
