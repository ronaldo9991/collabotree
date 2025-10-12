#!/usr/bin/env node

/**
 * Railway Build Test Script
 * 
 * This script simulates the Railway build process locally to verify
 * that the nixpacks.toml configuration will work correctly.
 * 
 * Run with: node test-railway-build.js
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function runCommand(command, description, options = {}) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`${description}`, colors.cyan);
  log('='.repeat(60), colors.cyan);
  log(`Command: ${command}`, colors.blue);
  
  try {
    execSync(command, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    log(`✓ ${description} - SUCCESS`, colors.green);
    return true;
  } catch (error) {
    log(`✗ ${description} - FAILED`, colors.red);
    log(`Error: ${error.message}`, colors.red);
    return false;
  }
}

function checkPath(path, description) {
  const exists = existsSync(path);
  if (exists) {
    log(`✓ ${description} exists: ${path}`, colors.green);
  } else {
    log(`✗ ${description} not found: ${path}`, colors.red);
  }
  return exists;
}

async function testRailwayBuild() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('RAILWAY BUILD TEST - STARTING', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  const backendDir = __dirname;
  const clientDir = join(__dirname, '../client');
  const distDir = join(backendDir, 'dist');

  // Phase 0: Pre-checks
  log('\nPhase 0: Pre-flight Checks', colors.yellow);
  log('-'.repeat(60), colors.yellow);
  
  if (!checkPath(clientDir, 'Client directory')) {
    log('ERROR: Client directory not found!', colors.red);
    process.exit(1);
  }

  if (!checkPath(join(backendDir, 'package.json'), 'Backend package.json')) {
    log('ERROR: Backend package.json not found!', colors.red);
    process.exit(1);
  }

  if (!checkPath(join(clientDir, 'package.json'), 'Client package.json')) {
    log('ERROR: Client package.json not found!', colors.red);
    process.exit(1);
  }

  // Phase 1: Install Backend Dependencies
  log('\nPhase 1: Installing Backend Dependencies', colors.yellow);
  log('-'.repeat(60), colors.yellow);
  
  const installSuccess = runCommand(
    'npm ci --legacy-peer-deps',
    'Install backend dependencies',
    { cwd: backendDir }
  );

  if (!installSuccess) {
    log('\nTrying with npm install...', colors.yellow);
    runCommand(
      'npm install --legacy-peer-deps',
      'Install backend dependencies (fallback)',
      { cwd: backendDir }
    );
  }

  // Phase 2: Build Frontend
  log('\nPhase 2: Building Frontend', colors.yellow);
  log('-'.repeat(60), colors.yellow);

  const frontendInstallSuccess = runCommand(
    'npm ci --legacy-peer-deps',
    'Install frontend dependencies',
    { cwd: clientDir }
  );

  if (!frontendInstallSuccess) {
    log('\nTrying with npm install...', colors.yellow);
    runCommand(
      'npm install --legacy-peer-deps',
      'Install frontend dependencies (fallback)',
      { cwd: clientDir }
    );
  }

  const frontendBuildSuccess = runCommand(
    'npm run build',
    'Build frontend',
    { cwd: clientDir }
  );

  if (!frontendBuildSuccess) {
    log('\nERROR: Frontend build failed!', colors.red);
    process.exit(1);
  }

  // Verify frontend build output
  const frontendDistDir = join(clientDir, 'dist');
  if (!checkPath(frontendDistDir, 'Frontend dist directory')) {
    log('ERROR: Frontend build did not create dist directory!', colors.red);
    process.exit(1);
  }

  if (!checkPath(join(frontendDistDir, 'index.html'), 'Frontend index.html')) {
    log('ERROR: Frontend build did not create index.html!', colors.red);
    process.exit(1);
  }

  // Phase 3: Copy Frontend to Backend
  log('\nPhase 3: Copying Frontend to Backend', colors.yellow);
  log('-'.repeat(60), colors.yellow);

  // Ensure backend dist directory exists
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
    log('Created backend dist directory', colors.green);
  }

  // Copy frontend build
  const copyCommand = process.platform === 'win32'
    ? `xcopy /E /I /Y "${frontendDistDir}\\*" "${distDir}\\"`
    : `cp -r ${frontendDistDir}/* ${distDir}/`;

  const copySuccess = runCommand(
    copyCommand,
    'Copy frontend to backend/dist'
  );

  if (!copySuccess) {
    log('\nERROR: Failed to copy frontend to backend!', colors.red);
    process.exit(1);
  }

  // Verify copy
  if (!checkPath(join(distDir, 'index.html'), 'Backend dist/index.html')) {
    log('ERROR: Frontend files not copied correctly!', colors.red);
    process.exit(1);
  }

  // Phase 4: Generate Prisma Client
  log('\nPhase 4: Generating Prisma Client', colors.yellow);
  log('-'.repeat(60), colors.yellow);

  runCommand(
    'npx prisma generate',
    'Generate Prisma client',
    { cwd: backendDir }
  );

  // Phase 5: Build Backend
  log('\nPhase 5: Building Backend TypeScript', colors.yellow);
  log('-'.repeat(60), colors.yellow);

  const backendBuildSuccess = runCommand(
    'npm run build',
    'Build backend',
    { cwd: backendDir }
  );

  if (!backendBuildSuccess) {
    log('\nERROR: Backend build failed!', colors.red);
    process.exit(1);
  }

  // Phase 6: Verify Build Output
  log('\nPhase 6: Verifying Build Output', colors.yellow);
  log('-'.repeat(60), colors.yellow);

  const checks = [
    { path: join(distDir, 'server.js'), description: 'Backend server.js' },
    { path: join(distDir, 'app.js'), description: 'Backend app.js' },
    { path: join(distDir, 'index.html'), description: 'Frontend index.html' },
    { path: join(distDir, 'assets'), description: 'Frontend assets directory' }
  ];

  let allChecksPass = true;
  for (const check of checks) {
    if (!checkPath(check.path, check.description)) {
      allChecksPass = false;
    }
  }

  // Final Result
  log('\n' + '='.repeat(60), colors.cyan);
  if (allChecksPass) {
    log('✓ RAILWAY BUILD TEST - SUCCESS!', colors.green);
    log('='.repeat(60), colors.cyan);
    log('\nYour build is ready for Railway deployment!', colors.green);
    log('\nNext steps:', colors.cyan);
    log('1. Commit these changes to Git', colors.blue);
    log('2. Push to your Railway-connected repository', colors.blue);
    log('3. Railway will automatically use nixpacks.toml', colors.blue);
    log('4. Monitor the build logs in Railway dashboard', colors.blue);
    process.exit(0);
  } else {
    log('✗ RAILWAY BUILD TEST - FAILED!', colors.red);
    log('='.repeat(60), colors.cyan);
    log('\nPlease fix the errors above before deploying to Railway.', colors.red);
    process.exit(1);
  }
}

// Run the test
testRailwayBuild().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});

