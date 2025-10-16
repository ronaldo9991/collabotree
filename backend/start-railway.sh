#!/bin/bash

echo "🚀 Starting CollaboTree Backend on Railway..."

# Set production environment
export NODE_ENV=production

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

if [ -z "$JWT_ACCESS_SECRET" ]; then
  echo "❌ JWT_ACCESS_SECRET is not set"
  exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
  echo "❌ JWT_REFRESH_SECRET is not set"
  exit 1
fi

echo "✅ Environment variables validated"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Start the server (database initialization will happen at runtime)
echo "🌟 Starting server..."
npm start
