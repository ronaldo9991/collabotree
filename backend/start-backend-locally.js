#!/usr/bin/env node

/**
 * Start Backend Locally
 * Start the backend server with proper environment setup
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

console.log('🚀 Starting Backend Locally...');

try {
  // Step 1: Check if .env file exists
  console.log('\n1️⃣ Checking Environment Setup...');
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found, creating...');
    
    const envContent = `# ============================================
# COLLABOTREE BACKEND ENVIRONMENT VARIABLES
# ============================================

# Environment (development, production, test)
NODE_ENV=development

# Port
PORT=4000

# Client Origin
CLIENT_ORIGIN=http://localhost:3000

# Database URL - Using Railway database for local development
DATABASE_URL=postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway

# JWT Secrets (Using the same secrets as production for consistency)
JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Password Hashing
BCRYPT_ROUNDS=12
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created');
  } else {
    console.log('✅ .env file exists');
  }
  
  // Step 2: Set environment variables for this process
  console.log('\n2️⃣ Setting Environment Variables...');
  process.env.NODE_ENV = 'development';
  process.env.PORT = '4000';
  process.env.CLIENT_ORIGIN = 'http://localhost:3000';
  process.env.DATABASE_URL = 'postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway';
  process.env.JWT_ACCESS_SECRET = '2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d';
  process.env.JWT_REFRESH_SECRET = '4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.BCRYPT_ROUNDS = '12';
  
  console.log('✅ Environment variables set');
  
  // Step 3: Check if server is already running
  console.log('\n3️⃣ Checking if Server is Already Running...');
  try {
    const response = await fetch('http://localhost:4000/api/health');
    if (response.ok) {
      console.log('✅ Backend server is already running on port 4000');
      console.log('🌐 Server URL: http://localhost:4000');
      console.log('🔗 Health Check: http://localhost:4000/api/health');
      console.log('🔗 API Base: http://localhost:4000/api');
      return;
    }
  } catch (error) {
    console.log('ℹ️ Server is not running, will start it now');
  }
  
  // Step 4: Start the backend server
  console.log('\n4️⃣ Starting Backend Server...');
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '4000',
      CLIENT_ORIGIN: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway',
      JWT_ACCESS_SECRET: '2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d',
      JWT_REFRESH_SECRET: '4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      BCRYPT_ROUNDS: '12'
    }
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
  
  // Step 5: Wait a moment and test the server
  console.log('\n5️⃣ Testing Server Startup...');
  setTimeout(async () => {
    try {
      const response = await fetch('http://localhost:4000/api/health');
      if (response.ok) {
        console.log('✅ Backend server started successfully!');
        console.log('🌐 Server URL: http://localhost:4000');
        console.log('🔗 Health Check: http://localhost:4000/api/health');
        console.log('🔗 API Base: http://localhost:4000/api');
        console.log('🔗 Public Services: http://localhost:4000/api/public/services');
      } else {
        console.log('❌ Server responded with error:', response.status);
      }
    } catch (error) {
      console.log('⚠️ Server may still be starting up...');
      console.log('💡 Wait a few seconds and check: http://localhost:4000/api/health');
    }
  }, 3000);
  
  console.log('\n🎉 Backend Server Starting!');
  console.log('\n📋 Server Information:');
  console.log('   🌐 URL: http://localhost:4000');
  console.log('   🔗 Health: http://localhost:4000/api/health');
  console.log('   🔗 API: http://localhost:4000/api');
  console.log('   🔗 Services: http://localhost:4000/api/public/services');
  
  console.log('\n💡 Tips:');
  console.log('   - Press Ctrl+C to stop the server');
  console.log('   - Check the terminal for any error messages');
  console.log('   - Test the API endpoints in your browser');
  
} catch (error) {
  console.error('❌ Failed to start backend:', error.message);
  process.exit(1);
}
