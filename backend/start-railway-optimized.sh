#!/bin/bash

echo "🚀 Starting CollaboTree Backend on Railway (Optimized)..."

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

# Determine the correct database URL to use
FINAL_DATABASE_URL=""

if [ ! -z "$DATABASE_PUBLIC_URL" ]; then
  echo "🔄 Using DATABASE_PUBLIC_URL for Prisma operations..."
  FINAL_DATABASE_URL="$DATABASE_PUBLIC_URL"
else
  echo "⚠️ DATABASE_PUBLIC_URL not set, using original DATABASE_URL"
  FINAL_DATABASE_URL="$DATABASE_URL"
fi

# Validate the final database URL format
if [[ ! "$FINAL_DATABASE_URL" =~ ^postgresql:// ]]; then
  echo "❌ DATABASE_URL must start with 'postgresql://'"
  echo "🔧 Please fix the DATABASE_URL in Railway dashboard"
  exit 1
fi

echo "✅ DATABASE_URL format validated"

# Run database migrations with explicit DATABASE_URL
echo "🗄️ Running database migrations..."
DATABASE_URL="$FINAL_DATABASE_URL" npx prisma migrate deploy || {
  echo "⚠️ Migration failed, attempting to reset migration state..."
  DATABASE_URL="$FINAL_DATABASE_URL" node reset-migration-state.js || {
    echo "❌ Migration reset failed, continuing with existing schema..."
  }
}

# Create admin user if needed
echo "👤 Ensuring admin user exists..."
node force-create-admin.js

# Start the server
echo "🌟 Starting server..."
node dist/server.js


