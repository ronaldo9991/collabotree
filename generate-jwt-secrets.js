#!/usr/bin/env node

/**
 * Generate JWT Secrets for Railway Production
 * Run this script to generate secure JWT secrets for your Railway deployment
 */

import crypto from 'crypto';

console.log('🔐 Generating JWT Secrets for Railway Production...\n');

// Generate JWT Access Secret (32+ characters)
const accessSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_ACCESS_SECRET=' + accessSecret);

// Generate JWT Refresh Secret (32+ characters)
const refreshSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_REFRESH_SECRET=' + refreshSecret);

console.log('\n📋 Copy these environment variables to your Railway dashboard:');
console.log('1. Go to your Railway project dashboard');
console.log('2. Click on your service');
console.log('3. Go to the "Variables" tab');
console.log('4. Add each variable above');
console.log('5. Click "Deploy" to apply changes');

console.log('\n✅ After setting these variables, your Railway deployment should work!');
