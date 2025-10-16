#!/usr/bin/env node

/**
 * Start Local Development Server
 * Starts the backend with local SQLite database
 */

import { spawn } from 'child_process';
import path from 'path';

const __dirname = path.resolve();

console.log('🚀 Starting Local Development Server...');

// Set environment variables for local development
process.env.NODE_ENV = 'development';
process.env.PORT = '4000';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.DATABASE_URL = 'file:./dev.db';
process.env.JWT_ACCESS_SECRET = '2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d';
process.env.JWT_REFRESH_SECRET = '4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '12';

console.log('📋 Environment Variables Set:');
console.log('   ✅ NODE_ENV: development');
console.log('   ✅ PORT: 4000');
console.log('   ✅ DATABASE_URL: file:./dev.db (SQLite)');
console.log('   ✅ JWT secrets: Set');

// Start the development server
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
});

serverProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Server stopped gracefully');
  } else {
    console.log(`❌ Server exited with code ${code}`);
  }
});

console.log('\n🎉 Local Development Server Starting!');
console.log('\n📋 Server Information:');
console.log('   🌐 URL: http://localhost:4000');
console.log('   🔗 Health: http://localhost:4000/api/health');
console.log('   🔗 API: http://localhost:4000/api');
console.log('   💾 Database: SQLite (local file)');
console.log('\n💡 Press Ctrl+C to stop the server');
