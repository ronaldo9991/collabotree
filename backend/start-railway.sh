#!/bin/bash

echo "🚀 Starting CollaboTree Backend on Railway..."

# Set production environment
export NODE_ENV=production

# Check environment variables
echo "🔍 Checking environment variables..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:+SET}"
echo "JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:+SET}"
echo "JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:+SET}"

# Check if required environment variables are set for production
if [ "$NODE_ENV" = "production" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL is not set - continuing without database"
  fi
  
  if [ -z "$JWT_ACCESS_SECRET" ]; then
    echo "⚠️ JWT_ACCESS_SECRET is not set - using default (not recommended for production)"
    export JWT_ACCESS_SECRET="default-access-secret-for-railway-deployment-only"
  fi
  
  if [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "⚠️ JWT_REFRESH_SECRET is not set - using default (not recommended for production)"
    export JWT_REFRESH_SECRET="default-refresh-secret-for-railway-deployment-only"
  fi
fi

echo "✅ Environment variables checked"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations only if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Running database migrations..."
  npx prisma migrate deploy
else
  echo "⚠️ Skipping database migrations - DATABASE_URL not set"
fi

# Start the server
echo "🌟 Starting server..."
echo "Server will start on port: ${PORT:-4000}"
npm start
