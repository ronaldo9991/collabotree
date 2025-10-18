#!/usr/bin/env node

// Simple startup test script
console.log('🧪 Testing application startup...');

// Set minimal environment variables for testing
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '4000';

// Set default JWT secrets if not provided
if (!process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-startup-testing-only';
  console.log('⚠️ Using default JWT_ACCESS_SECRET for testing');
}

if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-startup-testing-only';
  console.log('⚠️ Using default JWT_REFRESH_SECRET for testing');
}

console.log('Environment variables set:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('- JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? 'SET' : 'NOT SET');
console.log('- JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'SET' : 'NOT SET');

try {
  console.log('📦 Loading application modules...');
  
  // Test if we can load the main modules
  const { env } = await import('./dist/config/env.js');
  console.log('✅ Environment config loaded');
  
  const { initializeDatabase } = await import('./dist/db/connection.js');
  console.log('✅ Database connection module loaded');
  
  // Test database connection
  console.log('🔍 Testing database connection...');
  const dbConnected = await initializeDatabase();
  console.log('Database connection result:', dbConnected);
  
  console.log('✅ All modules loaded successfully');
  console.log('🎉 Application startup test passed!');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Application startup test failed:');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
