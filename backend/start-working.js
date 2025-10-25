import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Server with Working Database...');

try {
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  // Push schema to database
  console.log('💾 Setting up database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  // Seed the database
  console.log('🌱 Seeding database...');
  execSync('node quick-seed.js', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  console.log('\n🎉 Everything is ready!');
  console.log('\n📋 Server Information:');
  console.log('   🌐 URL: http://localhost:4000');
  console.log('   🔗 Health: http://localhost:4000/api/health');
  console.log('   🔗 Services: http://localhost:4000/api/public/services');
  console.log('   💾 Database: SQLite (working!)');
  console.log('\n💡 Press Ctrl+C to stop the server');
  
  // Start the server
  execSync('npm run dev', {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
} catch (error) {
  console.error('❌ Failed to start:', error.message);
  process.exit(1);
}
