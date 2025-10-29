#!/usr/bin/env node

/**
 * Railway build script
 * Ensures frontend is built and copied correctly
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync } from 'fs';
import path from 'path';

console.log('🚀 Railway Build Script Starting...');

try {
  // Check if we're in the right directory
  console.log('📁 Current directory:', process.cwd());
  
  // Build frontend
  console.log('🔨 Building frontend...');
  execSync('cd ../client && npm ci --legacy-peer-deps --no-audit --no-fund', { stdio: 'inherit' });
  execSync('cd ../client && npm run build', { stdio: 'inherit' });
  
  // Check if frontend build succeeded
  const frontendDistPath = '../client/dist';
  if (!existsSync(frontendDistPath)) {
    throw new Error('Frontend build failed - dist directory not found');
  }
  
  console.log('✅ Frontend built successfully');
  
  // Create backend dist directory
  console.log('📁 Creating backend dist directory...');
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // Create frontend directory in backend dist
  const frontendTargetPath = 'dist/frontend';
  if (!existsSync(frontendTargetPath)) {
    mkdirSync(frontendTargetPath, { recursive: true });
  }
  
  // Copy frontend files
  console.log('📋 Copying frontend files...');
  cpSync(frontendDistPath, frontendTargetPath, { recursive: true });
  
  // Verify files were copied
  const indexFile = path.join(frontendTargetPath, 'index.html');
  if (!existsSync(indexFile)) {
    throw new Error('index.html not found after copy');
  }
  
  console.log('✅ Frontend files copied successfully');
  console.log('📁 Frontend files location:', path.resolve(frontendTargetPath));
  
  // List copied files
  const { readdirSync } = await import('fs');
  const files = readdirSync(frontendTargetPath);
  console.log('📋 Copied files:', files);
  
  // Build backend
  console.log('🔨 Building backend...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('🎉 Railway build completed successfully!');
  
} catch (error) {
  console.error('❌ Railway build failed:', error);
  process.exit(1);
}
