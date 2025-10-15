#!/usr/bin/env node

/**
 * Railway Setup Verification Script
 * 
 * This script helps verify that your Railway environment variables are set correctly.
 * Run this after setting up your Railway environment variables.
 */

import { execSync } from 'child_process';

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

function checkEnvironmentVariable(name, expectedValue = null) {
  const value = process.env[name];
  
  if (!value) {
    log(`❌ ${name}: NOT SET`, colors.red);
    return false;
  }
  
  if (expectedValue && value !== expectedValue) {
    log(`⚠️  ${name}: ${value} (expected: ${expectedValue})`, colors.yellow);
    return false;
  }
  
  log(`✅ ${name}: ${value}`, colors.green);
  return true;
}

function checkDatabaseURL() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    log(`❌ DATABASE_URL: NOT SET`, colors.red);
    return false;
  }
  
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    log(`✅ DATABASE_URL: Valid PostgreSQL connection string`, colors.green);
    return true;
  } else {
    log(`❌ DATABASE_URL: Invalid format (${dbUrl})`, colors.red);
    log(`   Should start with 'postgresql://' or 'postgres://'`, colors.yellow);
    return false;
  }
}

function checkJWTSecret(name) {
  const secret = process.env[name];
  
  if (!secret) {
    log(`❌ ${name}: NOT SET`, colors.red);
    return false;
  }
  
  if (secret.length < 32) {
    log(`❌ ${name}: Too short (${secret.length} chars, need 32+)`, colors.red);
    return false;
  }
  
  log(`✅ ${name}: Strong secret (${secret.length} chars)`, colors.green);
  return true;
}

async function verifyRailwaySetup() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('RAILWAY ENVIRONMENT VERIFICATION', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);
  
  let allGood = true;
  
  // Check required environment variables
  log('🔧 Environment Variables:', colors.blue);
  log('-'.repeat(40), colors.blue);
  
  allGood &= checkEnvironmentVariable('NODE_ENV', 'production');
  allGood &= checkDatabaseURL();
  allGood &= checkJWTSecret('JWT_ACCESS_SECRET');
  allGood &= checkJWTSecret('JWT_REFRESH_SECRET');
  allGood &= checkEnvironmentVariable('JWT_ACCESS_EXPIRES_IN', '15m');
  allGood &= checkEnvironmentVariable('JWT_REFRESH_EXPIRES_IN', '7d');
  allGood &= checkEnvironmentVariable('BCRYPT_ROUNDS', '12');
  
  const clientOrigin = process.env.CLIENT_ORIGIN;
  if (clientOrigin === '' || clientOrigin === undefined) {
    log(`✅ CLIENT_ORIGIN: Empty (correct for single deployment)`, colors.green);
  } else {
    log(`⚠️  CLIENT_ORIGIN: ${clientOrigin}`, colors.yellow);
  }
  
  const port = process.env.PORT;
  if (port) {
    log(`✅ PORT: ${port} (Railway managed)`, colors.green);
  } else {
    log(`⚠️  PORT: Not set (Railway should set this)`, colors.yellow);
  }
  
  // Summary
  log('\n' + '='.repeat(60), colors.cyan);
  if (allGood) {
    log('🎉 ALL CHECKS PASSED! Your Railway setup looks good!', colors.green);
    log('='.repeat(60), colors.cyan);
    log('\nYour app should be working perfectly now!', colors.green);
    log('Visit: https://collabotree-production.up.railway.app/', colors.blue);
  } else {
    log('❌ SOME ISSUES FOUND - Please fix the problems above', colors.red);
    log('='.repeat(60), colors.cyan);
    log('\nCheck your Railway environment variables:', colors.yellow);
    log('Railway Dashboard → Your Service → Variables', colors.blue);
  }
  
  log('\n📚 Reference:', colors.cyan);
  log('See RAILWAY_ENVIRONMENT_SETUP.md for detailed setup instructions', colors.blue);
}

// Run the verification
verifyRailwaySetup().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});




