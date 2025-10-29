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
  
  // Remove existing frontend directory to ensure clean copy
  console.log('🗑️ Removing existing frontend directory...');
  const { rmSync } = await import('fs');
  if (existsSync(frontendTargetPath)) {
    rmSync(frontendTargetPath, { recursive: true, force: true });
  }
  
  // Copy frontend files
  console.log('📋 Copying frontend files...');
  console.log(`   From: ${path.resolve(frontendDistPath)}`);
  console.log(`   To: ${path.resolve(frontendTargetPath)}`);
  
  cpSync(frontendDistPath, frontendTargetPath, { recursive: true, force: true });
  
  // Verify files were copied
  const indexFile = path.join(frontendTargetPath, 'index.html');
  if (!existsSync(indexFile)) {
    throw new Error('index.html not found after copy');
  }
  
  console.log('✅ Frontend files copied successfully');
  console.log('📁 Frontend files location:', path.resolve(frontendTargetPath));
  
  // List copied files and verify assets folder
  const { readdirSync, statSync } = await import('fs');
  const files = readdirSync(frontendTargetPath);
  console.log('📋 Copied files:', files);
  
  // Check if assets folder exists
  const assetsPath = path.join(frontendTargetPath, 'assets');
  if (existsSync(assetsPath)) {
    const assetsStat = statSync(assetsPath);
    if (assetsStat.isDirectory()) {
      const assetFiles = readdirSync(assetsPath);
      console.log(`✅ Assets folder found with ${assetFiles.length} files`);
      console.log('📦 Asset files:', assetFiles);
    } else {
      console.log('⚠️ Assets path exists but is not a directory');
    }
  } else {
    console.log('❌ Assets folder NOT found!');
    // Try to copy assets folder explicitly
    const sourceAssetsPath = path.join(frontendDistPath, 'assets');
    if (existsSync(sourceAssetsPath)) {
      console.log('🔄 Attempting to copy assets folder explicitly...');
      cpSync(sourceAssetsPath, assetsPath, { recursive: true, force: true });
      if (existsSync(assetsPath)) {
        const assetFiles = readdirSync(assetsPath);
        console.log(`✅ Assets folder copied successfully with ${assetFiles.length} files`);
      }
    } else {
      console.log('❌ Source assets folder not found:', sourceAssetsPath);
    }
  }
  
  // Build backend
  console.log('🔨 Building backend...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('🎉 Railway build completed successfully!');
  
} catch (error) {
  console.error('❌ Railway build failed:', error);
  process.exit(1);
}
