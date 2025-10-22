#!/usr/bin/env node

console.log('🔍 Environment Variables Debug Script');
console.log('=====================================');

// Check all relevant environment variables
const envVars = [
  'NODE_ENV',
  'PORT',
  'CLIENT_ORIGIN',
  'DATABASE_URL',
  'DATABASE_PUBLIC_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'BCRYPT_ROUNDS'
];

console.log('\n📋 Environment Variables Status:');
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('SECRET') || varName.includes('URL')) {
      // Mask sensitive values
      const masked = value.replace(/:([^:]+)@/, ':***@');
      console.log(`✅ ${varName}: ${masked}`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

// Validate DATABASE_URL format
console.log('\n🔍 DATABASE_URL Validation:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log(`Current DATABASE_URL: ${dbUrl.replace(/:([^:]+)@/, ':***@')}`);
  
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    console.log('✅ DATABASE_URL format is correct');
  } else {
    console.log('❌ DATABASE_URL must start with "postgresql://" or "postgres://"');
    console.log('🔧 Fix: Update DATABASE_URL in Railway dashboard');
  }
} else {
  console.log('❌ DATABASE_URL is not set');
}

// Check DATABASE_PUBLIC_URL
console.log('\n🔍 DATABASE_PUBLIC_URL Status:');
const dbPublicUrl = process.env.DATABASE_PUBLIC_URL;
if (dbPublicUrl) {
  console.log(`DATABASE_PUBLIC_URL: ${dbPublicUrl.replace(/:([^:]+)@/, ':***@')}`);
  if (dbPublicUrl.startsWith('postgresql://') || dbPublicUrl.startsWith('postgres://')) {
    console.log('✅ DATABASE_PUBLIC_URL format is correct');
  } else {
    console.log('❌ DATABASE_PUBLIC_URL format is incorrect');
  }
} else {
  console.log('⚠️ DATABASE_PUBLIC_URL is not set');
}

console.log('\n🎯 Next Steps:');
console.log('1. Go to Railway Dashboard → Your Service → Variables');
console.log('2. Set DATABASE_URL to: postgresql://postgres:PASSWORD@trolley.proxy.rlwy.net:50892/railway');
console.log('3. Set DATABASE_PUBLIC_URL to the same value');
console.log('4. Replace PASSWORD with your actual database password');
console.log('5. Redeploy your service');
