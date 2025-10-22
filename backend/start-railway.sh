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

# Debug: Show current DATABASE_URL (without password)
echo "🔍 Current DATABASE_URL: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"

# Use public database URL for Prisma operations if available
if [ ! -z "$DATABASE_PUBLIC_URL" ]; then
  echo "🔄 Using DATABASE_PUBLIC_URL for Prisma operations..."
  echo "🔍 DATABASE_PUBLIC_URL: $(echo $DATABASE_PUBLIC_URL | sed 's/:[^:]*@/:***@/')"
  export DATABASE_URL="$DATABASE_PUBLIC_URL"
else
  echo "⚠️ DATABASE_PUBLIC_URL not set, using original DATABASE_URL"
fi

# Validate DATABASE_URL format
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
  echo "❌ DATABASE_URL must start with 'postgresql://'"
  echo "🔍 Current DATABASE_URL: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"
  exit 1
fi

echo "✅ DATABASE_URL format validated"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Pushing database schema..."
npx prisma db push --accept-data-loss

# Build the application
echo "🔨 Building application..."
npm run build

# Start the server
echo "🌟 Starting server..."
npm start
