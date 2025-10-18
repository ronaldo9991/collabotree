import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  CLIENT_ORIGIN: z.string().optional().default(''),
  DATABASE_URL: z.string().optional().default(''),
  JWT_ACCESS_SECRET: z.string().optional().default(''),
  JWT_REFRESH_SECRET: z.string().optional().default(''),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
});

// Validate environment variables
let env: any;
try {
  env = envSchema.parse(process.env);
  console.log('✅ Environment variables validated successfully');
  console.log(`📡 NODE_ENV: ${env.NODE_ENV}`);
  console.log(`🔗 CLIENT_ORIGIN: ${env.CLIENT_ORIGIN || 'Same domain'}`);
  console.log(`💾 DATABASE_URL: ${env.DATABASE_URL ? 'Set' : 'Missing'}`);
  console.log(`🔐 JWT_ACCESS_SECRET: ${env.JWT_ACCESS_SECRET ? 'Set' : 'Missing'}`);
  console.log(`🔐 JWT_REFRESH_SECRET: ${env.JWT_REFRESH_SECRET ? 'Set' : 'Missing'}`);
  
  // Check for required variables in production
  if (env.NODE_ENV === 'production') {
    const missingVars = [];
    if (!env.DATABASE_URL) missingVars.push('DATABASE_URL');
    if (!env.JWT_ACCESS_SECRET) missingVars.push('JWT_ACCESS_SECRET');
    if (!env.JWT_REFRESH_SECRET) missingVars.push('JWT_REFRESH_SECRET');
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables for production:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('❌ Backend cannot start without proper environment variables');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
  }
  console.error('❌ Backend cannot start without proper environment variables');
  process.exit(1);
}

export { env };
