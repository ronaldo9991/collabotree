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

# Determine the correct database URL to use
FINAL_DATABASE_URL=""

if [ ! -z "$DATABASE_PUBLIC_URL" ]; then
  echo "🔄 Using DATABASE_PUBLIC_URL for Prisma operations..."
  echo "🔍 DATABASE_PUBLIC_URL: $(echo $DATABASE_PUBLIC_URL | sed 's/:[^:]*@/:***@/')"
  FINAL_DATABASE_URL="$DATABASE_PUBLIC_URL"
else
  echo "⚠️ DATABASE_PUBLIC_URL not set, using original DATABASE_URL"
  FINAL_DATABASE_URL="$DATABASE_URL"
fi

# Validate the final database URL format
if [[ ! "$FINAL_DATABASE_URL" =~ ^postgresql:// ]]; then
  echo "❌ DATABASE_URL must start with 'postgresql://'"
  echo "🔍 Current DATABASE_URL: $(echo $FINAL_DATABASE_URL | sed 's/:[^:]*@/:***@/')"
  echo "🔧 Please fix the DATABASE_URL in Railway dashboard"
  echo "📋 Expected format: postgresql://postgres:PASSWORD@trolley.proxy.rlwy.net:50892/railway"
  exit 1
fi

echo "✅ DATABASE_URL format validated"

# Generate Prisma client with explicit DATABASE_URL
echo "📦 Generating Prisma client..."
DATABASE_URL="$FINAL_DATABASE_URL" npx prisma generate

# Push database schema with explicit DATABASE_URL
echo "🗄️ Pushing database schema..."
DATABASE_URL="$FINAL_DATABASE_URL" npx prisma db push --accept-data-loss

# Build frontend first
echo "🎨 Building frontend..."
npm run build:frontend

# Build the backend application
echo "🔨 Building backend application..."
npm run build

# Start the server
echo "🌟 Starting server..."
npm start
