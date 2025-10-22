import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  CLIENT_ORIGIN: z.string().optional().default(''),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_PUBLIC_URL: z.string().optional(), // Railway provides this for public connections
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
}).transform((env) => {
  // For Railway deployments, prefer DATABASE_PUBLIC_URL if available and DATABASE_URL is not a Railway URL
  if (env.DATABASE_PUBLIC_URL && !env.DATABASE_URL.includes('rlwy.net') && !env.DATABASE_URL.includes('railway.app')) {
    console.log('🔄 Using DATABASE_PUBLIC_URL for Railway PostgreSQL connection');
    return {
      ...env,
      DATABASE_URL: env.DATABASE_PUBLIC_URL
    };
  }
  return env;
});

// Validate environment variables
try {
  const env = envSchema.parse(process.env);
  const originalDatabasePublicUrl = process.env.DATABASE_PUBLIC_URL;
  
  console.log('✅ Environment variables validated successfully');
  console.log(`📡 NODE_ENV: ${env.NODE_ENV}`);
  console.log(`🔗 CLIENT_ORIGIN: ${env.CLIENT_ORIGIN || 'Same domain'}`);
  console.log(`💾 DATABASE_URL: ${env.DATABASE_URL ? 'Set' : 'Missing'}`);
  if (env.DATABASE_URL) {
    const dbHost = new URL(env.DATABASE_URL).hostname;
    console.log(`🗄️  Database Host: ${dbHost}`);
    if (originalDatabasePublicUrl && originalDatabasePublicUrl !== env.DATABASE_URL) {
      console.log(`🌐 DATABASE_PUBLIC_URL: Available (${originalDatabasePublicUrl.includes('rlwy.net') ? 'Railway' : 'Other'})`);
    }
  }
  console.log(`🔐 JWT_ACCESS_SECRET: ${env.JWT_ACCESS_SECRET ? 'Set' : 'Missing'}`);
  console.log(`🔐 JWT_REFRESH_SECRET: ${env.JWT_REFRESH_SECRET ? 'Set' : 'Missing'}`);
  
  export { env };
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
