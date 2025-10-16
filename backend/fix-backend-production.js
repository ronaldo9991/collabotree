#!/usr/bin/env node

/**
 * Fix Backend Production Issues
 * Comprehensive fix for backend not working in production
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

console.log('🔧 Fixing Backend Production Issues...');

try {
  // Step 1: Check and fix package.json scripts
  console.log('\n1️⃣ Checking Package.json Scripts...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update scripts for production
  const updatedScripts = {
    ...packageJson.scripts,
    "start": "node dist/server.js",
    "build": "npx prisma generate && npx prisma db push --accept-data-loss && tsc",
    "build:production": "npx prisma generate && npx prisma db push --accept-data-loss && tsc",
    "railway:build": "npm run build:production",
    "railway:start": "npm start",
    "postinstall": "npx prisma generate",
    "fix:backend": "node fix-backend-production.js"
  };
  
  packageJson.scripts = updatedScripts;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json scripts updated for production');
  
  // Step 2: Fix server.ts for production
  console.log('\n2️⃣ Fixing Server Configuration...');
  const serverPath = path.join(__dirname, 'src', 'server.ts');
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Add production-specific error handling
  const productionServerContent = `import { createServer } from 'http';
import { env } from './config/env.js';
import app from './app.js';
import { initializeSocketIO } from './sockets/index.js';
import { setupChatGateway } from './sockets/chat.gateway.js';
import { initializeDatabase, closeDatabaseConnection } from './db/connection.js';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);
setupChatGateway(io);

// Railway provides PORT environment variable
const PORT = process.env.PORT || env.PORT || 4000;

// Production error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
httpServer.listen(PORT, async () => {
  console.log(\`🚀 CollaboTree Backend Server running on port \${PORT}\`);
  console.log(\`📡 Environment: \${env.NODE_ENV}\`);
  console.log(\`🔗 Client Origin: \${env.CLIENT_ORIGIN || 'Same domain'}\`);
  console.log(\`🔌 Socket.IO: Enabled\`);
  
  // Initialize database connection
  try {
    await initializeDatabase();
    console.log(\`💾 Database: Connected and initialized\`);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    console.error('❌ Backend will not start without database connection');
    process.exit(1);
  }
  
  if (env.NODE_ENV === 'production') {
    console.log(\`🌍 Production mode: Serving frontend + backend\`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDatabaseConnection();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDatabaseConnection();
    process.exit(0);
  });
});
`;

  fs.writeFileSync(serverPath, productionServerContent);
  console.log('✅ Server configuration updated for production');
  
  // Step 3: Fix database connection for production
  console.log('\n3️⃣ Fixing Database Connection...');
  const dbConnectionPath = path.join(__dirname, 'src', 'db', 'connection.ts');
  const dbConnectionContent = `import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

export async function initializeDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Test a simple query
    await prisma.$queryRaw\`SELECT 1 as test\`;
    console.log('✅ Database query test successful');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}
`;

  fs.writeFileSync(dbConnectionPath, dbConnectionContent);
  console.log('✅ Database connection updated for production');
  
  // Step 4: Create production environment validation
  console.log('\n4️⃣ Creating Environment Validation...');
  const envValidationPath = path.join(__dirname, 'src', 'config', 'env.ts');
  const envValidationContent = `import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  CLIENT_ORIGIN: z.string().optional().default(''),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
});

// Validate environment variables
try {
  const env = envSchema.parse(process.env);
  console.log('✅ Environment variables validated successfully');
  console.log(\`📡 NODE_ENV: \${env.NODE_ENV}\`);
  console.log(\`🔗 CLIENT_ORIGIN: \${env.CLIENT_ORIGIN || 'Same domain'}\`);
  console.log(\`💾 DATABASE_URL: \${env.DATABASE_URL ? 'Set' : 'Missing'}\`);
  console.log(\`🔐 JWT_ACCESS_SECRET: \${env.JWT_ACCESS_SECRET ? 'Set' : 'Missing'}\`);
  console.log(\`🔐 JWT_REFRESH_SECRET: \${env.JWT_REFRESH_SECRET ? 'Set' : 'Missing'}\`);
  
  export { env };
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(\`   - \${err.path.join('.')}: \${err.message}\`);
    });
  }
  console.error('❌ Backend cannot start without proper environment variables');
  process.exit(1);
}
`;

  fs.writeFileSync(envValidationPath, envValidationContent);
  console.log('✅ Environment validation updated for production');
  
  // Step 5: Create Railway-specific startup script
  console.log('\n5️⃣ Creating Railway Startup Script...');
  const railwayStartupScript = `#!/bin/bash

echo "🚀 Starting CollaboTree Backend on Railway..."

# Set production environment
export NODE_ENV=production

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

if [ -z "$JWT_ACCESS_SECRET" ]; then
  echo "❌ JWT_ACCESS_SECRET is not set"
  exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
  echo "❌ JWT_REFRESH_SECRET is not set"
  exit 1
fi

echo "✅ Environment variables validated"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Pushing database schema..."
npx prisma db push --accept-data-loss

# Build the application
echo "🔨 Building application..."
npm run build

# Start the server
echo "🌟 Starting server..."
npm start
`;

  const railwayStartupPath = path.join(__dirname, 'start-railway.sh');
  fs.writeFileSync(railwayStartupPath, railwayStartupScript);
  
  try {
    execSync(`chmod +x ${railwayStartupPath}`);
    console.log('✅ Railway startup script created');
  } catch (error) {
    console.log('⚠️ Could not make script executable (Windows?)');
  }
  
  // Step 6: Update Procfile for Railway
  console.log('\n6️⃣ Updating Procfile...');
  const procfilePath = path.join(__dirname, '..', 'Procfile');
  const procfileContent = `web: cd backend && chmod +x start-railway.sh && ./start-railway.sh
`;
  
  fs.writeFileSync(procfilePath, procfileContent);
  console.log('✅ Procfile updated for Railway');
  
  // Step 7: Create backend health check endpoint
  console.log('\n7️⃣ Creating Backend Health Check...');
  const healthCheckPath = path.join(__dirname, 'src', 'routes', 'health.routes.ts');
  const healthCheckContent = `import { Router } from 'express';
import { prisma } from '../db/connection.js';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw\`SELECT 1 as test\`;
    
    res.json({
      success: true,
      message: 'CollaboTree Backend is running',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backend health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
`;

  fs.writeFileSync(healthCheckPath, healthCheckContent);
  console.log('✅ Health check endpoint created');
  
  // Step 8: Update main routes to include health check
  console.log('\n8️⃣ Updating Routes...');
  const routesPath = path.join(__dirname, 'src', 'routes', 'index.ts');
  let routesContent = fs.readFileSync(routesPath, 'utf8');
  
  if (!routesContent.includes('health.routes')) {
    routesContent = routesContent.replace(
      "import testRoutes from './test.routes.js';",
      "import testRoutes from './test.routes.js';\nimport healthRoutes from './health.routes.js';"
    );
    
    routesContent = routesContent.replace(
      "router.use('/test', testRoutes);",
      "router.use('/test', testRoutes);\nrouter.use('/health', healthRoutes);"
    );
    
    fs.writeFileSync(routesPath, routesContent);
    console.log('✅ Routes updated with health check');
  } else {
    console.log('✅ Health check routes already configured');
  }
  
  console.log('\n🎉 Backend Production Fix Complete!');
  console.log('\n📋 Summary:');
  console.log('   ✅ Package.json scripts updated');
  console.log('   ✅ Server configuration fixed');
  console.log('   ✅ Database connection optimized');
  console.log('   ✅ Environment validation added');
  console.log('   ✅ Railway startup script created');
  console.log('   ✅ Procfile updated');
  console.log('   ✅ Health check endpoint created');
  console.log('   ✅ Routes updated');
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Deploy to Railway');
  console.log('   2. Check Railway logs for any errors');
  console.log('   3. Test the /api/health endpoint');
  console.log('   4. Verify backend is working');
  
  console.log('\n💡 If backend still not working:');
  console.log('   1. Check Railway logs for specific errors');
  console.log('   2. Verify environment variables are set');
  console.log('   3. Test database connection');
  console.log('   4. Check if JWT secrets are properly set');
  
} catch (error) {
  console.error('❌ Backend fix failed:', error.message);
  process.exit(1);
}
