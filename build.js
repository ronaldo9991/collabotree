#!/usr/bin/env node

/**
 * Cross-platform build script for Railway deployment
 * Works on both Windows and Linux environments
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    log(`Running: ${command}`, colors.blue);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true
    });
    return true;
  } catch (error) {
    log(`Command failed: ${command}`, colors.red);
    log(`Error: ${error.message}`, colors.red);
    return false;
  }
}

function buildProject() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('🚀 COLLABOTREE BUILD SCRIPT', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  try {
    // Step 1: Install backend dependencies
    log('Step 1: Installing backend dependencies...', colors.blue);
    if (!runCommand('npm install --legacy-peer-deps', join(process.cwd(), 'backend'))) {
      throw new Error('Backend dependency installation failed');
    }

    // Step 2: Install client dependencies
    log('\nStep 2: Installing client dependencies...', colors.blue);
    if (!runCommand('npm install --legacy-peer-deps', join(process.cwd(), 'client'))) {
      throw new Error('Client dependency installation failed');
    }

    // Step 3: Build client
    log('\nStep 3: Building client...', colors.blue);
    if (!runCommand('npm run build', join(process.cwd(), 'client'))) {
      throw new Error('Client build failed');
    }

    // Step 4: Prepare backend dist directory
    log('\nStep 4: Preparing backend dist directory...', colors.blue);
    const backendDistPath = join(process.cwd(), 'backend', 'dist');
    const clientDistPath = join(process.cwd(), 'client', 'dist');
    
    // Remove existing dist directory if it exists
    if (existsSync(backendDistPath)) {
      log('Removing existing backend dist directory...', colors.yellow);
      rmSync(backendDistPath, { recursive: true, force: true });
    }
    
    // Create new dist directory
    log('Creating backend dist directory...', colors.yellow);
    mkdirSync(backendDistPath, { recursive: true });
    
    // Copy client build to backend dist
    log('Copying client build to backend dist...', colors.yellow);
    cpSync(clientDistPath, backendDistPath, { recursive: true });

    // Step 5: Generate Prisma client
    log('\nStep 5: Generating Prisma client...', colors.blue);
    if (!runCommand('npx prisma generate', join(process.cwd(), 'backend'))) {
      throw new Error('Prisma client generation failed');
    }

    // Step 6: Build backend
    log('\nStep 6: Building backend...', colors.blue);
    if (!runCommand('npm run build', join(process.cwd(), 'backend'))) {
      throw new Error('Backend build failed');
    }

    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ BUILD COMPLETED SUCCESSFULLY!', colors.green);
    log('='.repeat(60), colors.cyan);
    
    log('\n📁 Build output:', colors.blue);
    log(`   Backend: ${backendDistPath}`, colors.green);
    log(`   Client:  ${clientDistPath}`, colors.green);
    
    log('\n🚀 Ready for Railway deployment!', colors.green);

  } catch (error) {
    log(`\n❌ Build failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the build
buildProject();












