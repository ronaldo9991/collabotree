import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  // CLIENT_ORIGIN is optional for single deployment (Railway serves both frontend + backend)
  CLIENT_ORIGIN: z.string().optional().default(''),
  // DATABASE_URL validation relaxed for Railway (PostgreSQL connection strings)
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
